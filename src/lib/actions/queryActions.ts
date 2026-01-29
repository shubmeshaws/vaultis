'use server'

import { prisma } from '@/lib/db/prisma'
import { Client as PGClient } from 'pg'
import mysql from 'mysql2/promise'
import { MongoClient } from 'mongodb'
import { createClient as createRedisClient } from 'redis'

export async function executeQuery(databaseId: string, sql: string) {
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
                const result = await client.query(sql)
                await client.end()
                return {
                    success: true,
                    data: result.rows,
                    columns: result.fields.map(f => ({ key: f.name, label: f.name.toUpperCase() })),
                    executionTime: 'N/A', // Potentially calculate this
                    totalRows: result.rowCount
                }
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
                return {
                    success: true,
                    data: rows as any[],
                    columns: fields.map(f => ({ key: f.name, label: f.name.toUpperCase() })),
                    executionTime: 'N/A',
                    totalRows: (rows as any[]).length
                }
            }
            // MongoDB and Redis might need more complex parsing for "SQL" or specific command handling
            // For now, let's focus on SQL-based ones as requested by "SQL editor"
            default:
                return { success: false, error: `Direct execution not yet implemented for ${db.type}` }
        }
    } catch (error: any) {
        console.error('Execution failed:', error)
        return { success: false, error: error.message || 'Failed to execute query' }
    }
}
