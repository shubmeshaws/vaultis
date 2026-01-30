'use server'

import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/middleware'
import packageJson from '../../../package.json'

export async function checkDatabaseHealth() {
    try {
        const start = performance.now()
        // Simple query to check connectivity
        await prisma.$queryRaw`SELECT 1`
        const end = performance.now()
        const latency = Math.round(end - start)

        return {
            success: true,
            status: 'online',
            latency,
            message: 'Database is operational'
        }
    } catch (error: any) {
        console.error('Database health check failed:', error)
        return {
            success: false,
            status: 'offline',
            latency: 0,
            message: error.message || 'Database connection failed'
        }
    }
}

export async function getSystemInfo() {
    try {
        return {
            version: packageJson.version,
            nodeVersion: process.version,
            environment: process.env.NODE_ENV,
            uptime: process.uptime()
        }
    } catch (error) {
        return {
            version: '0.1.0',
            nodeVersion: 'unknown',
            environment: 'development',
            uptime: 0
        }
    }
}

export async function getManagedDatabases() {
    try {
        const databases = await prisma.database.findMany({
            select: {
                id: true,
                name: true,
                type: true,
                host: true,
                isLocked: true
            },
            orderBy: { name: 'asc' }
        })
        return { success: true, databases }
    } catch (error: any) {
        return { success: false, error: 'Failed to fetch databases' }
    }
}

export async function getSystemConfig(key: string) {
    try {
        // Use raw SQL to bypass Prisma Client generation issues
        const result = await prisma.$queryRaw<any[]>`
            SELECT "value" FROM "SystemConfig" WHERE "key" = ${key} LIMIT 1
        `
        return { success: true, value: result[0]?.value || null }
    } catch (error) {
        console.error(`Failed to get system config for ${key}:`, error)
        return { success: false, error: 'Failed to fetch configuration' }
    }
}

export async function updateSystemConfig(key: string, value: string) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized access' }
        }

        const id = crypto.randomUUID()
        // PostgreSQL specific upsert
        await prisma.$executeRaw`
            INSERT INTO "SystemConfig" ("id", "key", "value", "updatedAt")
            VALUES (${id}, ${key}, ${value}, NOW())
            ON CONFLICT ("key") DO UPDATE 
            SET "value" = ${value}, "updatedAt" = NOW()
        `
        return { success: true, message: 'Configuration updated' }
    } catch (error: any) {
        console.error(`Failed to update system config for ${key}:`, error)
        return { success: false, error: `Update failed: ${error.message || 'Unknown error'}` }
    }
}

export async function performAuditLogCleanup() {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized access' }
        }

        const retentionResult = await prisma.$queryRaw<any[]>`
            SELECT "value" FROM "SystemConfig" WHERE "key" = 'AUDIT_LOG_RETENTION_DAYS' LIMIT 1
        `
        const days = parseInt(retentionResult[0]?.value || '30')
        if (isNaN(days) || days < 0) {
            return { success: false, error: 'Invalid retention period' }
        }

        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)

        const resultCount = await prisma.$executeRaw`
            DELETE FROM "QueryHistory" WHERE "createdAt" < ${cutoffDate}
        `

        return {
            success: true,
            message: `Cleanup completed. Removed ${resultCount} logs older than ${days} days.`
        }
    } catch (error: any) {
        console.error('Audit log cleanup failed:', error)
        return { success: false, error: `Cleanup failed: ${error.message || 'Unknown error'}` }
    }
}
