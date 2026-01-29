'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type DbType = 'postgres' | 'mongo' | 'mysql' | 'redis'
export type DbStatus = 'online' | 'maintenance' | 'offline' | 'locked'
export type Permission = 'admin' | 'read_write' | 'read_only' | 'no_access'

export interface DatabaseOption {
    id: string
    name: string
    type: DbType
    region: string
    status: DbStatus
    permission: Permission
}

interface DatabaseContextType {
    selectedDbId: string
    setSelectedDbId: (id: string) => void
    selectedDb: DatabaseOption | null
    databases: DatabaseOption[]
    setDatabases: (dbs: DatabaseOption[]) => void
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined)

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
    const [selectedDbId, setSelectedDbId] = useState<string>('')
    const [databases, setDatabases] = useState<DatabaseOption[]>([])

    const selectedDb = databases.find(db => db.id === selectedDbId) || null

    // Auto-select first database if none selected
    useEffect(() => {
        if (databases.length > 0 && !selectedDbId) {
            setSelectedDbId(databases[0].id)
        }
    }, [databases, selectedDbId])

    return (
        <DatabaseContext.Provider value={{
            selectedDbId,
            setSelectedDbId,
            selectedDb,
            databases,
            setDatabases
        }}>
            {children}
        </DatabaseContext.Provider>
    )
}

export function useDatabase() {
    const context = useContext(DatabaseContext)
    if (context === undefined) {
        throw new Error('useDatabase must be used within a DatabaseProvider')
    }
    return context
}
