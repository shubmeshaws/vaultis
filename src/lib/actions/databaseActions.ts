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
            include: {
                groups: { include: { databases: true } },
                directDatabases: true
            }
        })

        if (!user) return { success: false, error: 'User not found' }

        let databases: any[] = []

        if (user.role === 'ADMIN') {
            databases = await prisma.database.findMany({
                orderBy: { name: 'asc' }
            })
        } else {
            // Get databases from groups
            const groupDbs = user.groups.flatMap(g => g.databases)

            // Get databases from direct access (using the directDatabases relation)
            const directDbs = user.directDatabases || []

            // Merge and remove duplicates
            const allDbs = [...groupDbs, ...directDbs]
            databases = Array.from(new Map(allDbs.map(db => [db.id, db])).values())
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
    connectionString?: string
}) {
    try {
        const database = await (prisma.database as any).create({
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
                connectionString: data.connectionString,
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
    connectionString?: string
}) {
    try {
        const database = await (prisma.database as any).update({
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
                connectionString: data.connectionString,
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
    connectionString?: string
}) {
    if (!data.host && !data.connectionString) return { success: false, error: 'Hostname or Connection String is required' }

    const startTime = performance.now()

    try {
        const type = data.type?.toLowerCase()
        switch (type) {
            case 'postgresql':
            case 'postgres': {
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
            case 'mysql': {
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
            case 'mongodb':
            case 'mongo': {
                const url = data.connectionString || (() => {
                    const credentials = data.username && data.password ? `${encodeURIComponent(data.username)}:${encodeURIComponent(data.password)}@` : ''
                    return `mongodb://${credentials}${data.host}:${data.port || 27017}`
                })()
                const client = new MongoClient(url, { serverSelectionTimeoutMS: 5000 })
                await client.connect()
                await client.db('admin').command({ ping: 1 })
                await client.close()
                break
            }
            case 'redis': {
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

        const endTime = performance.now()
        const latency = Math.round(endTime - startTime)

        return { success: true, message: 'Connection established successfully!', latency }
    } catch (error: any) {
        console.error(`Connection test failed for ${data.type}:`, error)
        return { success: false, error: error.message || 'Failed to connect to database' }
    }
}

// Test connection by database ID
export async function testConnectionById(databaseId: string) {
    try {
        const db = await prisma.database.findUnique({
            where: { id: databaseId }
        })

        if (!db) {
            return { success: false, error: 'Database not found' }
        }

        return await testConnection({
            host: db.host || undefined,
            port: db.port || undefined,
            type: db.type || 'PostgreSQL',
            username: db.username || undefined,
            password: db.password || undefined,
            databaseName: (db as any).databaseName || undefined // Let testConnection handle the default ('postgres')
        })
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to test connection' }
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

export async function getDatabaseSchema(databaseId: string) {
    try {
        const db = await prisma.database.findUnique({
            where: { id: databaseId }
        })

        if (!db) {
            return { success: false, error: 'Database not found' }
        }

        if (db.isLocked) {
            return { success: false, error: 'Database is locked' }
        }

        let schema: any = { tables: [] }

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

                // Get all tables with their columns
                const tablesQuery = `
                    SELECT 
                        t.table_name,
                        c.column_name,
                        c.data_type,
                        c.is_nullable,
                        c.column_default,
                        tc.constraint_type
                    FROM information_schema.tables t
                    LEFT JOIN information_schema.columns c 
                        ON t.table_name = c.table_name 
                        AND t.table_schema = c.table_schema
                    LEFT JOIN information_schema.key_column_usage kcu
                        ON c.table_name = kcu.table_name
                        AND c.column_name = kcu.column_name
                        AND c.table_schema = kcu.table_schema
                    LEFT JOIN information_schema.table_constraints tc
                        ON kcu.constraint_name = tc.constraint_name
                        AND kcu.table_schema = tc.table_schema
                    WHERE t.table_schema = 'public'
                        AND t.table_type = 'BASE TABLE'
                    ORDER BY t.table_name, c.ordinal_position
                `

                const result = await client.query(tablesQuery)
                await client.end()

                // Group columns by table
                const tablesMap = new Map()
                result.rows.forEach((row: any) => {
                    if (!tablesMap.has(row.table_name)) {
                        tablesMap.set(row.table_name, {
                            name: row.table_name,
                            columns: []
                        })
                    }

                    const table = tablesMap.get(row.table_name)
                    if (row.column_name && !table.columns.find((c: any) => c.name === row.column_name)) {
                        table.columns.push({
                            name: row.column_name,
                            type: row.data_type,
                            nullable: row.is_nullable === 'YES',
                            defaultValue: row.column_default,
                            isPrimaryKey: row.constraint_type === 'PRIMARY KEY',
                            isForeignKey: row.constraint_type === 'FOREIGN KEY',
                            isUnique: row.constraint_type === 'UNIQUE'
                        })
                    }
                })

                schema.tables = Array.from(tablesMap.values())
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

                const dbName = db.databaseName || 'mysql'

                // Get all tables with their columns
                const [rows] = await connection.execute(`
                    SELECT 
                        t.TABLE_NAME as table_name,
                        c.COLUMN_NAME as column_name,
                        c.DATA_TYPE as data_type,
                        c.IS_NULLABLE as is_nullable,
                        c.COLUMN_DEFAULT as column_default,
                        c.COLUMN_KEY as column_key
                    FROM information_schema.TABLES t
                    LEFT JOIN information_schema.COLUMNS c 
                        ON t.TABLE_NAME = c.TABLE_NAME 
                        AND t.TABLE_SCHEMA = c.TABLE_SCHEMA
                    WHERE t.TABLE_SCHEMA = ?
                        AND t.TABLE_TYPE = 'BASE TABLE'
                    ORDER BY t.TABLE_NAME, c.ORDINAL_POSITION
                `, [dbName])

                await connection.end()

                // Group columns by table
                const tablesMap = new Map()
                    ; (rows as any[]).forEach((row: any) => {
                        if (!tablesMap.has(row.table_name)) {
                            tablesMap.set(row.table_name, {
                                name: row.table_name,
                                columns: []
                            })
                        }

                        const table = tablesMap.get(row.table_name)
                        if (row.column_name) {
                            table.columns.push({
                                name: row.column_name,
                                type: row.data_type,
                                nullable: row.is_nullable === 'YES',
                                defaultValue: row.column_default,
                                isPrimaryKey: row.column_key === 'PRI',
                                isForeignKey: row.column_key === 'MUL',
                                isUnique: row.column_key === 'UNI'
                            })
                        }
                    })

                schema.tables = Array.from(tablesMap.values())
                break
            }

            case 'MongoDB': {
                const url = (db as any).connectionString || (() => {
                    const credentials = db.username && db.password ? `${encodeURIComponent(db.username)}:${encodeURIComponent(db.password)}@` : ''
                    return `mongodb://${credentials}${db.host}:${db.port || 27017}`
                })()
                const client = new MongoClient(url, { serverSelectionTimeoutMS: 10000 })

                await client.connect()
                const database = client.db(db.databaseName || 'test')

                // Get all collections
                const collections = await database.listCollections().toArray()

                // For each collection, sample a document to infer schema
                const tables = await Promise.all(collections.map(async (col) => {
                    const sampleDoc = await database.collection(col.name).findOne()
                    const columns = sampleDoc
                        ? Object.keys(sampleDoc).map(key => ({
                            name: key,
                            type: typeof sampleDoc[key],
                            nullable: true,
                            isPrimaryKey: key === '_id'
                        }))
                        : []

                    return {
                        name: col.name,
                        columns
                    }
                }))

                await client.close()
                schema.tables = tables
                break
            }

            case 'Redis': {
                // Redis doesn't have a traditional schema, but we can get key patterns
                const credentials = db.password ? `:${encodeURIComponent(db.password)}@` : ''
                const url = `redis://${credentials}${db.host}:${db.port || 6379}`
                const client = createRedisClient({
                    url,
                    socket: { connectTimeout: 10000 }
                })

                await client.connect()

                // Get sample keys (limited to 100)
                const keys = await client.keys('*')
                const sampleKeys = keys.slice(0, 100)

                await client.quit()

                schema.tables = [{
                    name: 'keys',
                    columns: [
                        { name: 'key', type: 'string', nullable: false },
                        { name: 'value', type: 'string', nullable: true }
                    ],
                    meta: {
                        totalKeys: keys.length,
                        sampleKeys: sampleKeys
                    }
                }]
                break
            }

            default:
                return { success: false, error: `Schema introspection not supported for ${db.type}` }
        }

        return { success: true, schema, database: { name: db.name, type: db.type } }
    } catch (error: any) {
        console.error('Schema introspection failed:', error)
        return { success: false, error: error.message || 'Failed to fetch database schema' }
    }
}


export async function listDatabases(databaseId: string) {
    try {
        const db = await prisma.database.findUnique({
            where: { id: databaseId }
        })

        if (!db) return { success: false, error: 'Database not found' }

        const type = db.type?.toLowerCase()
        if (type === 'mongodb' || type === 'mongo') {
            const url = (db as any).connectionString || (() => {
                const credentials = db.username && db.password ? `${encodeURIComponent(db.username)}:${encodeURIComponent(db.password)}@` : ''
                return `mongodb://${credentials}${db.host}:${db.port || 27017}`
            })()
            const client = new MongoClient(url, { serverSelectionTimeoutMS: 5000 })
            await client.connect()
            const admin = client.db('admin').admin()
            const dbs = await admin.listDatabases()
            await client.close()
            return { success: true, databases: dbs.databases.map((d: any) => d.name) }
        } else if (type === 'postgresql' || type === 'postgres') {
            const client = new PGClient({
                host: db.host || undefined,
                port: db.port || undefined,
                user: db.username || undefined,
                password: db.password || undefined,
                database: 'postgres',
            })
            await client.connect()
            const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;')
            await client.end()
            return { success: true, databases: res.rows.map(r => r.datname) }
        } else if (type === 'mysql') {
            const mysql = require('mysql2/promise')
            const connection = await mysql.createConnection({
                host: db.host || undefined,
                port: db.port || undefined,
                user: db.username || undefined,
                password: db.password || undefined,
            })
            const [rows]: any = await connection.query('SHOW DATABASES;')
            await connection.end()
            return { success: true, databases: rows.map((r: any) => r.Database) }
        }

        return { success: false, error: 'Database type not supported for listing' }
    } catch (error: any) {
        console.error('List databases failed:', error)
        return { success: false, error: error.message || 'Failed to list databases' }
    }
}
