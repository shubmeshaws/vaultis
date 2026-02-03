'use server'

import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/middleware'

export async function getAdminOperationalStats() {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized' }
        }

        // 1. Active Queries (Queries executed in the last 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        const activeQueriesCount = await prisma.queryHistory.count({
            where: {
                createdAt: { gte: fiveMinutesAgo }
            }
        })

        // 2. Risky Operations (Queries likely to be risky - e.g., DELETE, DROP, TRUNCATE)
        // In a real system, we'd look for an 'isRisky' flag or analyze the SQL.
        // For now, let's count queries with common risky keywords in the last 24h
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const riskyKeywords = ['DELETE', 'DROP', 'TRUNCATE', 'ALTER', 'UPDATE']

        // This is a simplified check. PostgreSQL case-insensitive search.
        const riskyQueries = await prisma.queryHistory.count({
            where: {
                createdAt: { gte: twentyFourHoursAgo },
                OR: riskyKeywords.map(kw => ({
                    sql: { contains: kw, mode: 'insensitive' as any }
                }))
            }
        })

        // 3. System Health
        // We can base this on the success rate of queries in the last hour.
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const totalRecentQueries = await prisma.queryHistory.count({
            where: { createdAt: { gte: oneHourAgo } }
        })
        const successfulRecentQueries = await prisma.queryHistory.count({
            where: {
                createdAt: { gte: oneHourAgo },
                status: 'success'
            }
        })

        const systemHealth = totalRecentQueries > 0
            ? Math.round((successfulRecentQueries / totalRecentQueries) * 100)
            : 100 // Default to 100 if no recent activity

        return {
            success: true,
            activeQueries: activeQueriesCount,
            riskyOperations: riskyQueries,
            systemHealth: systemHealth
        }
    } catch (error: any) {
        console.error('Failed to fetch admin operational stats:', error)
        return { success: false, error: error.message || 'Internal server error' }
    }
}
