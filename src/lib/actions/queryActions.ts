'use server'

import { prisma } from '@/lib/db/prisma'
import { Client as PGClient } from 'pg'
import mysql from 'mysql2/promise'
import { MongoClient } from 'mongodb'
import { createClient as createRedisClient } from 'redis'
import { getCurrentUser } from '@/lib/auth/middleware'
import { getClientIP, getUserAgent } from '@/lib/utils/clientInfo'
import { revalidatePath } from 'next/cache'

export async function executeQuery(databaseId: string, sql: string) {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    let result: any = { success: false }
    const startTime = performance.now()

    try {
        const db = await prisma.database.findUnique({
            where: { id: databaseId }
        })

        if (!db) return { success: false, error: 'Database not found' }
        if (db.isLocked) return { success: false, error: 'Access to this database is currently locked' }

        switch (db.type) {
            case 'PostgreSQL': {
                const client = new PGClient({
                    host: db.host || 'localhost',
                    port: db.port || 5432,
                    user: db.username || undefined,
                    password: db.password || undefined,
                    database: db.databaseName || 'postgres',
                    connectionTimeoutMillis: 10000,
                })
                await client.connect()
                const pgResult = await client.query(sql)
                await client.end()
                result = {
                    success: true,
                    data: pgResult.rows,
                    columns: pgResult.fields.map(f => ({ key: f.name, label: f.name.toUpperCase() })),
                    totalRows: pgResult.rowCount
                }
                break
            }
            case 'MySQL': {
                const connection = await mysql.createConnection({
                    host: db.host || 'localhost',
                    port: db.port || 3306,
                    user: db.username || undefined,
                    password: db.password || undefined,
                    database: db.databaseName || undefined,
                })
                const [rows, fields] = await connection.execute(sql)
                await connection.end()
                result = {
                    success: true,
                    data: rows as any[],
                    columns: fields.map(f => ({ key: f.name, label: f.name.toUpperCase() })),
                    totalRows: (rows as any[]).length
                }
                break
            }
            default:
                result = { success: false, error: `Direct execution not yet implemented for ${db.type}` }
        }
    } catch (error: any) {
        console.error('Execution failed:', error)
        result = { success: false, error: error.message || 'Failed to execute query' }
    }

    const endTime = performance.now()
    const executionTime = `${Math.round(endTime - startTime)}ms`

    // Record History
    try {
        await (prisma.queryHistory as any).create({
            data: {
                sql,
                userId: user.id,
                databaseId,
                executionTime,
                status: result.success ? 'success' : 'error',
                rowsAffected: result.totalRows || 0,
                errorMessage: result.error,
                ipAddress: getClientIP(),
                userAgent: getUserAgent()
            }
        })
    } catch (historyError) {
        console.error('Failed to record query history:', historyError)
    }

    return { ...result, executionTime }
}

export async function saveQuery(databaseId: string, name: string, sql: string) {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        const savedQuery = await prisma.savedQuery.create({
            data: {
                name,
                sql,
                userId: user.id,
                databaseId
            }
        })
        revalidatePath('/queries')
        return { success: true, savedQuery }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function getSavedQueries() {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        const queries = await prisma.savedQuery.findMany({
            where: { userId: user.id },
            include: { database: true },
            orderBy: { updatedAt: 'desc' }
        })
        return { success: true, queries }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function deleteSavedQuery(id: string) {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        await prisma.savedQuery.deleteMany({
            where: { id, userId: user.id }
        })
        revalidatePath('/queries')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function toggleFavoriteQuery(id: string, isFavorite: boolean) {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        await prisma.savedQuery.updateMany({
            where: { id, userId: user.id },
            data: { isFavorite }
        })
        revalidatePath('/queries')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function getQueryHistory() {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        const history = await prisma.queryHistory.findMany({
            where: { userId: user.id },
            include: { database: true },
            orderBy: { createdAt: 'desc' },
            take: 50
        })
        return { success: true, history }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
