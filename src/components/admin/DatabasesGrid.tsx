'use client'

import React from 'react'
import { DatabaseCard, Database } from './DatabaseCard'

interface DatabasesGridProps {
    databases: Database[]
    onTestConnection?: (id: string) => void
    onEditPermissions?: (id: string) => void
    onDisconnect?: (id: string) => void
}

export function DatabasesGrid({ databases, onTestConnection, onEditPermissions, onDisconnect }: DatabasesGridProps) {
    const environments = ['production', 'staging', 'development']

    return (
        <div className="space-y-12 pb-20">
            {environments.map((env) => {
                const envDatabases = databases.filter(db => db.environment === env)
                if (envDatabases.length === 0) return null

                return (
                    <div key={env} className="space-y-6">
                        <div className="flex items-center gap-4 px-1">
                            <h2 className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-muted-foreground/50">{env} Clusters</h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                            <span className="text-[10px] font-bold text-muted-foreground/30">{envDatabases.length} Node{envDatabases.length !== 1 ? 's' : ''}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {envDatabases.map((db) => (
                                <DatabaseCard
                                    key={db.id}
                                    database={db}
                                    onTestConnection={onTestConnection}
                                    onEditPermissions={onEditPermissions}
                                    onDisconnect={onDisconnect}
                                />
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
