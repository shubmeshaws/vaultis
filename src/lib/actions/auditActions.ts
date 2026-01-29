'use server'

import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/middleware'

interface AuditLogFilters {
    searchQuery?: string
    userId?: string
    databaseId?: string
    queryType?: string
    timeRange?: string
    startDate?: string
    endDate?: string
}

export async function getAuditLogs(filters: AuditLogFilters = {}) {
    try {
        const currentUser = await getCurrentUser()

        if (!currentUser || currentUser.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized access', logs: [] }
        }

        const { searchQuery, userId, databaseId, queryType, startDate, endDate } = filters

        // Build where clause
        const where: any = {}

        // Custom date range filter
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        } else if (startDate) {
            where.createdAt = { gte: new Date(startDate) }
        } else if (endDate) {
            where.createdAt = { lte: new Date(endDate) }
        }

        // User filter
        if (userId && userId !== 'all') {
            where.userId = userId
        }

        // Database filter
        if (databaseId && databaseId !== 'all') {
            where.databaseId = databaseId
        }

        // Search query (searches in SQL)
        if (searchQuery && searchQuery.trim() !== '') {
            where.sql = {
                contains: searchQuery,
                mode: 'insensitive'
            }
        }

        const logs = await (prisma.queryHistory as any).findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                database: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100 // Limit to recent 100 logs
        })

        // Determine query type and risk level from SQL
        const enrichedLogs = logs.map((log: any) => {
            const sql = log.sql.toUpperCase().trim()
            let queryType = 'SELECT'
            let riskLevel = 'low'

            if (sql.startsWith('DELETE')) {
                queryType = 'DELETE'
                riskLevel = (log.rowsAffected || 0) > 1000 ? 'high' : 'medium'
            } else if (sql.startsWith('DROP')) {
                queryType = 'DROP'
                riskLevel = 'critical'
            } else if (sql.startsWith('TRUNCATE')) {
                queryType = 'TRUNCATE'
                riskLevel = 'high'
            } else if (sql.startsWith('UPDATE')) {
                queryType = 'UPDATE'
                riskLevel = (log.rowsAffected || 0) > 1000 ? 'medium' : 'low'
            } else if (sql.startsWith('INSERT')) {
                queryType = 'INSERT'
                riskLevel = 'low'
            } else if (sql.startsWith('ALTER')) {
                queryType = 'ALTER'
                riskLevel = 'high'
            }

            // Filter by query type if specified
            if (filters.queryType && filters.queryType !== 'all' && queryType !== filters.queryType) {
                return null
            }

            return {
                id: log.id,
                timestamp: log.createdAt.toISOString(),
                user: log.user.email,
                userName: log.user.name || 'Unknown User',
                database: log.database.name,
                queryType,
                query: log.sql,
                riskLevel,
                affectedRows: log.rowsAffected || 0,
                executionTime: log.executionTime || 'N/A',
                status: log.status,
                ipAddress: '192.168.1.x', // Not stored in current schema
                userAgent: 'Web Client' // Not stored in current schema
            }
        }).filter(Boolean) // Remove nulls from query type filter

        return { success: true, logs: enrichedLogs }
    } catch (error) {
        console.error('Failed to fetch audit logs:', error)
        return { success: false, error: 'Failed to fetch audit logs', logs: [] }
    }
}

export async function getAuditLogUsers() {
    try {
        const currentUser = await getCurrentUser()

        if (!currentUser || currentUser.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized access', users: [] }
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true
            },
            orderBy: {
                name: 'asc'
            }
        })

        return { success: true, users }
    } catch (error) {
        console.error('Failed to fetch users:', error)
        return { success: false, error: 'Failed to fetch users', users: [] }
    }
}

export async function getAuditLogDatabases() {
    try {
        const currentUser = await getCurrentUser()

        if (!currentUser || currentUser.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized access', databases: [] }
        }

        const databases = await prisma.database.findMany({
            select: {
                id: true,
                name: true
            },
            orderBy: {
                name: 'asc'
            }
        })

        return { success: true, databases }
    } catch (error) {
        console.error('Failed to fetch databases:', error)
        return { success: false, error: 'Failed to fetch databases', databases: [] }
    }
}
