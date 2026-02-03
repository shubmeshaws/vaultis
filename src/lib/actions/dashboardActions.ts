'use server'

import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/middleware'

export async function getDashboardData() {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        // Start time for stats comparison (last 24h vs previous 24h)
        const now = new Date()
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const prev24h = new Date(now.getTime() - 48 * 60 * 60 * 1000)

        // 1. Total Queries
        const totalQueries = await prisma.queryHistory.count({
            where: { userId: user.id }
        })
        const last24hQueries = await prisma.queryHistory.count({
            where: { userId: user.id, createdAt: { gte: last24h } }
        })
        const prev24hQueries = await prisma.queryHistory.count({
            where: { userId: user.id, createdAt: { gte: prev24h, lt: last24h } }
        })

        const queryChange = prev24hQueries === 0
            ? last24hQueries > 0 ? '+100%' : '0%'
            : `${last24hQueries >= prev24hQueries ? '+' : ''}${Math.round(((last24hQueries - prev24hQueries) / prev24hQueries) * 100)}%`

        // 2. Success Rate
        const successQueries = await prisma.queryHistory.count({
            where: { userId: user.id, status: 'success' }
        })
        const successRate = totalQueries > 0
            ? `${((successQueries / totalQueries) * 100).toFixed(1)}%`
            : '0%'

        // 3. Average Latency (last 100 queries)
        const recentLatencies = await prisma.queryHistory.findMany({
            where: { userId: user.id, executionTimeMs: { not: null } },
            select: { executionTimeMs: true },
            orderBy: { createdAt: 'desc' },
            take: 100
        })
        const avgLatency = recentLatencies.length > 0
            ? `${Math.round(recentLatencies.reduce((acc, q) => acc + (q.executionTimeMs || 0), 0) / recentLatencies.length)}ms`
            : '0ms'

        // 4. Active Databases
        const activeDatabases = await prisma.database.count()

        // 5. Recent History
        const recentQueries = await prisma.queryHistory.findMany({
            where: { userId: user.id },
            include: { database: true },
            orderBy: { createdAt: 'desc' },
            take: 5
        })

        return {
            success: true,
            stats: {
                totalQueries: totalQueries.toLocaleString(),
                queryChange,
                successRate,
                avgLatency,
                activeDatabases
            },
            recentQueries: recentQueries.map(q => ({
                id: q.id,
                sql: q.sql,
                timestamp: q.createdAt,
                status: q.status.toUpperCase(),
                databaseName: q.database?.name || 'Unknown'
            }))
        }
    } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error)
        return { success: false, error: error.message || 'Internal server error' }
    }
}
