'use server'

import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/middleware'

export interface AnalyzerFilters {
    startDate?: string
    endDate?: string
    minDuration?: number // in ms
    target?: 'slowest' | 'latest' | 'all'
}

export async function getAnalyzerData(filters: AnalyzerFilters = {}) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized access', slowestQueries: [], latestQueries: [] }
        }

        const { startDate, endDate, minDuration, target = 'all' } = filters
        const where: any = {}

        // Handle date strings properly for both Prisma and Raw SQL
        const start = startDate ? new Date(startDate) : null
        const end = endDate ? new Date(endDate) : null
        const minTime = minDuration || 0

        if (start && end) {
            where.createdAt = { gte: start, lte: end }
        } else if (start) {
            where.createdAt = { gte: start }
        } else if (end) {
            where.createdAt = { lte: end }
        }

        console.log(`[Analyzer] Fetching data for user: ${currentUser.email} (${currentUser.role}), Date Range: ${startDate || 'unbounded'} to ${endDate || 'unbounded'}, Min Time: ${minTime}ms`)

        // 1. Get Top 10 Slowest Queries
        let slowestQueriesRaw: any[] = []
        if (target === 'all' || target === 'slowest') {
            slowestQueriesRaw = await prisma.$queryRaw<any[]>`
                SELECT 
                    qh.id, qh.sql, qh."executionTime", qh.status, qh."createdAt",
                    u.name as "userName", u.email as "userEmail",
                    db.name as "databaseName"
                FROM "QueryHistory" qh
                JOIN "User" u ON qh."userId" = u.id
                JOIN "Database" db ON qh."databaseId" = db.id
                WHERE 
                    (qh."createdAt" >= ${start}::timestamp OR ${start}::timestamp IS NULL) AND
                    (qh."createdAt" <= ${end}::timestamp OR ${end}::timestamp IS NULL) AND
                    (qh."executionTimeMs" >= ${minTime})
                ORDER BY qh."executionTimeMs" DESC
                LIMIT 10
            `
        }

        // 2. Get Top 10 Latest Queries
        let latestQueriesRaw: any[] = []
        if (target === 'all' || target === 'latest') {
            latestQueriesRaw = await prisma.$queryRaw<any[]>`
                SELECT 
                    qh.id, qh.sql, qh."executionTime", qh.status, qh."createdAt",
                    u.name as "userName", u.email as "userEmail",
                    db.name as "databaseName"
                FROM "QueryHistory" qh
                JOIN "User" u ON qh."userId" = u.id
                JOIN "Database" db ON qh."databaseId" = db.id
                WHERE 
                    (${start}::timestamp IS NULL OR qh."createdAt" >= ${start}::timestamp) AND
                    (${end}::timestamp IS NULL OR qh."createdAt" <= ${end}::timestamp)
                ORDER BY qh."createdAt" DESC
                LIMIT 10
            `
        }

        const formatQuery = (q: any) => ({
            id: q.id,
            sql: q.sql,
            executionTime: q.executionTime,
            status: q.status,
            createdAt: q.createdAt instanceof Date ? q.createdAt.toISOString() : new Date(q.createdAt).toISOString(),
            userName: q.userName || 'Unknown User',
            userEmail: q.userEmail,
            databaseName: q.databaseName
        })

        return {
            success: true,
            slowestQueries: slowestQueriesRaw.map(formatQuery),
            latestQueries: latestQueriesRaw.map(formatQuery)
        }
    } catch (error: any) {
        console.error('Failed to fetch analyzer data:', error)
        return { success: false, error: error.message || 'Failed to fetch analyzer data' }
    }
}
