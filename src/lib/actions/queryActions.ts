'use server'

import { prisma } from '@/lib/db/prisma'
import { Client as PGClient } from 'pg'
import mysql from 'mysql2/promise'
import { MongoClient } from 'mongodb'
import { createClient as createRedisClient } from 'redis'
import { getCurrentUser } from '@/lib/auth/middleware'
import { getClientIP, getUserAgent } from '@/lib/utils/clientInfo'
import { revalidatePath } from 'next/cache'

export async function executeQuery(databaseId: string, sql: string, overrideDbName?: string) {
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
            case 'MongoDB': {
                const url = (db as any).connectionString || (() => {
                    const credentials = db.username && db.password ? `${encodeURIComponent(db.username)}:${encodeURIComponent(db.password)}@` : ''
                    return `mongodb://${credentials}${db.host}:${db.port || 27017}`
                })()
                const client = new MongoClient(url, { serverSelectionTimeoutMS: 10000 })
                await client.connect()
                let data: any[] = []
                let columns: any[] = []

                let trimmedSql = sql.trim()
                let targetDbName = overrideDbName || (db as any).databaseName || 'test'

                // Check for "use databaseName" command
                const useCommandMatch = trimmedSql.match(/^use\s+([a-zA-Z0-9_-]+)(?:\s*;?\s*)(?:\n|(?=\s*db\.)|(?=\s*\{)|$)/i)
                if (useCommandMatch) {
                    targetDbName = useCommandMatch[1]
                    trimmedSql = trimmedSql.slice(useCommandMatch[0].length).trim()
                }

                const mongoDb = client.db(targetDbName)
                
                // Helper to try and parse "relaxed" JSON
                const flexibleParse = (str: string) => {
                    if (!str || str.trim() === '') return {}
                    try {
                        return JSON.parse(str)
                    } catch (e) {
                        try {
                            const fixed = str
                                .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                                .replace(/'/g, '"')
                            return JSON.parse(fixed)
                        } catch (e2) {
                            throw new Error(`Invalid JSON format: ${str}. Hint: use double quotes for keys.`)
                        }
                    }
                }

                if (trimmedSql.toLowerCase() === 'show collections' || trimmedSql.toLowerCase() === 'show tables') {
                    const collections = await mongoDb.listCollections().toArray()
                    data = collections.map((c: any) => ({ 
                        name: c.name, 
                        type: c.type,
                        info: c.options || {}
                    }))
                } else if (trimmedSql.startsWith('{')) {
                    const command = flexibleParse(trimmedSql)
                    const commandResult = await mongoDb.command(command)
                    data = [commandResult]
                } else if (trimmedSql.startsWith('db.')) {
                    const match = trimmedSql.match(/db\.([^.]+)\.([a-zA-Z]+)\s*\(([\s\S]*)\)/)
                    if (match) {
                        const [, collectionName, method, queryStr] = match
                        const query = flexibleParse(queryStr.trim())
                        const collection = mongoDb.collection(collectionName)

                        switch (method) {
                            case 'find':
                                data = await collection.find(query).limit(100).toArray()
                                break
                            case 'findOne':
                                const one = await collection.findOne(query)
                                data = one ? [one] : []
                                break
                            case 'count':
                            case 'countDocuments':
                                const count = await collection.countDocuments(query)
                                data = [{ count }]
                                break
                            case 'stats':
                                const stats = await mongoDb.command({ collStats: collectionName })
                                data = [stats]
                                break
                            case 'listCollections':
                                const colls = await mongoDb.listCollections().toArray()
                                data = colls
                                break
                            default:
                                throw new Error(`Unsupported MongoDB method: ${method}. Use find, findOne, count, or stats.`)
                        }
                    } else {
                        throw new Error('Invalid db.collection.method syntax. Example: db.users.find({ age: 10 })')
                    }
                } else {
                    throw new Error('Invalid MongoDB query format. Use "show collections", a JSON command, or db.collection.find({})')
                }

                await client.close()

                if (data.length > 0) {
                    const firstItem = data[0]
                    columns = Object.keys(firstItem).map(key => ({ key, label: key.toUpperCase() }))
                }

                result = {
                    success: true,
                    data,
                    columns,
                    totalRows: data.length
                }
                break
            }
            case 'Redis': {
                const credentials = db.password ? `:${encodeURIComponent(db.password)}@` : ''
                const url = `redis://${credentials}${db.host}:${db.port || 6379}`
                const client = createRedisClient({
                    url,
                    socket: { connectTimeout: 10000 }
                })
                await client.connect()

                // Parse Redis command: GET key -> ['GET', 'key']
                const parts = sql.trim().split(/\s+/)
                const redisResult = await client.sendCommand(parts)
                await client.quit()

                // Helper to try to beautify a value if it's JSON
                const beautifyValue = (val: any): string => {
                    if (val === null || val === undefined) return 'null'
                    const str = String(val)
                    try {
                        const parsed = JSON.parse(str)
                        if (typeof parsed === 'object') {
                            return JSON.stringify(parsed, null, 2)
                        }
                    } catch {}
                    return str
                }

                let data: any[] = []
                let columns: any[] = []

                if (Array.isArray(redisResult)) {
                    data = redisResult.map((val, i) => ({
                        index: i,
                        value: typeof val === 'object' && val !== null
                            ? JSON.stringify(val, null, 2)
                            : beautifyValue(val)
                    }))
                    columns = [{ key: 'index', label: '#' }, { key: 'value', label: 'VALUE' }]
                } else if (typeof redisResult === 'object' && redisResult !== null) {
                    data = [redisResult]
                    columns = Object.keys(redisResult).map(key => ({ key, label: key.toUpperCase() }))
                } else {
                    data = [{ value: beautifyValue(redisResult) }]
                    columns = [{ key: 'value', label: 'VALUE' }]
                }

                result = {
                    success: true,
                    data,
                    columns,
                    totalRows: data.length
                }
                break
            }
        }
    } catch (error: any) {
        console.error('Execution failed:', error)
        result = { success: false, error: error.message || 'Failed to execute query' }
    }

    const endTime = performance.now()
    const executionTime = `${Math.round(endTime - startTime)}ms`

    // Record History
    try {
        const executionTimeMsNum = Math.round(endTime - startTime)
        await (prisma.queryHistory as any).create({
            data: {
                sql,
                userId: user.id,
                databaseId,
                executionTime,
                executionTimeMs: executionTimeMsNum,
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
