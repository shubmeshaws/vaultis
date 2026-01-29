'use server'

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function getDatabases() {
    try {
        const databases = await prisma.database.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { groups: true }
                }
            }
        })
        return { success: true, databases }
    } catch (error: any) {
        console.error('Error fetching databases:', error)
        return { success: false, error: 'Failed to fetch databases' }
    }
}

export async function getUserDatabases() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) return { success: false, error: 'Unauthorized' }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { groups: { include: { databases: true } } }
        })

        if (!user) return { success: false, error: 'User not found' }

        let databases

        if (user.role === 'ADMIN') {
            databases = await prisma.database.findMany({
                orderBy: { name: 'asc' }
            })
        } else {
            // Flatten databases from all groups
            const groupDbs = user.groups.flatMap(g => g.databases)
            // Remove duplicates
            databases = Array.from(new Map(groupDbs.map(db => [db.id, db])).values())
        }

        return { success: true, databases }
    } catch (error: any) {
        console.error('Error fetching user databases:', error)
        return { success: false, error: 'Failed to fetch user databases' }
    }
}

export async function createDatabase(data: {
    name: string
    description?: string
    host?: string
    port?: number
    type: string
    environment?: string
    username?: string
    password?: string
    databaseName?: string
}) {
    try {
        const database = await prisma.database.create({
            data: {
                name: data.name,
                description: data.description,
                host: data.host,
                port: data.port,
                type: data.type,
                environment: data.environment,
                username: data.username,
                password: data.password,
                databaseName: data.databaseName,
            },
        })

        revalidatePath('/admin/databases')
        return { success: true, database }
    } catch (error: any) {
        console.error('Error creating database:', error)
        return { success: false, error: error.message || 'Failed to create database' }
    }
}

export async function updateDatabase(id: string, data: {
    name: string
    description?: string
    host?: string
    port?: number
    type: string
    environment?: string
    username?: string
    password?: string
    isLocked?: boolean
    databaseName?: string
}) {
    try {
        const database = await prisma.database.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                host: data.host,
                port: data.port,
                type: data.type,
                environment: data.environment,
                username: data.username,
                password: data.password,
                isLocked: data.isLocked,
                databaseName: data.databaseName,
            },
        })

        revalidatePath('/admin/databases')
        revalidatePath('/dashboard') // Revalidate sidebar
        return { success: true, database }
    } catch (error: any) {
        console.error('Error updating database:', error)
        return { success: false, error: error.message || 'Failed to update database' }
    }
}

import { Client as PGClient } from 'pg'
import mysql from 'mysql2/promise'
import { MongoClient } from 'mongodb'
import { createClient as createRedisClient } from 'redis'

export async function testConnection(data: {
    host?: string
    port?: number
    type: string
    username?: string
    password?: string
    databaseName?: string
}) {
    if (!data.host) return { success: false, error: 'Hostname is required' }

    try {
        switch (data.type) {
            case 'PostgreSQL': {
                const client = new PGClient({
                    host: data.host,
                    port: data.port || 5432,
                    user: data.username,
                    password: data.password,
                    database: data.databaseName || 'postgres',
                    connectionTimeoutMillis: 5000,
                })
                await client.connect()
                await client.end()
                break
            }
            case 'MySQL': {
                const connection = await mysql.createConnection({
                    host: data.host,
                    port: data.port || 3306,
                    user: data.username,
                    password: data.password,
                    connectTimeout: 5000,
                })
                await connection.ping()
                await connection.end()
                break
            }
            case 'MongoDB': {
                const credentials = data.username && data.password ? `${encodeURIComponent(data.username)}:${encodeURIComponent(data.password)}@` : ''
                const url = `mongodb://${credentials}${data.host}:${data.port || 27017}`
                const client = new MongoClient(url, { serverSelectionTimeoutMS: 5000 })
                await client.connect()
                await client.db('admin').command({ ping: 1 })
                await client.close()
                break
            }
            case 'Redis': {
                const credentials = data.password ? `:${encodeURIComponent(data.password)}@` : ''
                const url = `redis://${credentials}${data.host}:${data.port || 6379}`
                const client = createRedisClient({
                    url,
                    socket: { connectTimeout: 5000 }
                })
                await client.connect()
                await client.ping()
                await client.quit()
                break
            }
            default:
                return { success: false, error: `Unsupported database type: ${data.type}` }
        }

        return { success: true, message: 'Connection established successfully!' }
    } catch (error: any) {
        console.error(`Connection test failed for ${data.type}:`, error)
        return { success: false, error: error.message || 'Failed to connect to database' }
    }
}

export async function deleteDatabase(id: string) {
    try {
        await prisma.database.delete({
            where: { id },
        })

        revalidatePath('/admin/databases')
        return { success: true }
    } catch (error: any) {
        console.error('Error deleting database:', error)
        return { success: false, error: 'Failed to delete database' }
    }
}

export async function toggleDatabaseLock(id: string, isLocked: boolean) {
    try {
        const database = await prisma.database.update({
            where: { id },
            data: { isLocked },
        })

        revalidatePath('/admin/databases')
        revalidatePath('/dashboard') // Revalidate sidebar
        return { success: true, database }
    } catch (error: any) {
        console.error('Error toggling database lock:', error)
        return { success: false, error: 'Failed to update lock status' }
    }
}
