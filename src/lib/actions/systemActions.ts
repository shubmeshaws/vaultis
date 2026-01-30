'use server'

import { prisma } from '@/lib/db/prisma'
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
    return {
        version: packageJson.version,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV,
        uptime: process.uptime()
    }
}
