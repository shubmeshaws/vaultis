'use client'

import React from 'react'
import { motion } from 'framer-motion'

export type DbType = 'postgres' | 'mysql' | 'mongodb' | 'redis' | 'sqlite'
export type DbStatus = 'healthy' | 'warning' | 'offline' | 'syncing'
export type DbEnvironment = 'production' | 'staging' | 'development'

export interface Database {
    id: string
    name: string
    type: DbType
    status: DbStatus
    environment: DbEnvironment
    host: string
    latency: number
    users: { id: string; name: string; avatar?: string }[]
    lastBackup: string
}

interface DatabaseCardProps {
    database: Database
    onTestConnection?: (id: string) => void
    onEditPermissions?: (id: string) => void
    onDisconnect?: (id: string) => void
}

const Icons = {
    Database: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
    ),
    Zap: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    Shield: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    Globe: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
    ),
    Trash: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    ),
}

import { useToast } from '@/contexts/ToastContext'

export function DatabaseCard({ database, onTestConnection, onEditPermissions, onDisconnect }: DatabaseCardProps) {
    const { toast } = useToast()

    const handleTestConnection = (id: string) => {
        onTestConnection?.(id)
        toast({
            title: 'Signal Verified',
            description: `Successfully established connection with ${database.name} at ${database.latency}ms latency.`,
            type: 'success'
        })
    }

    const getStatusColor = (status: DbStatus) => {
        switch (status) {
            case 'healthy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
            case 'warning': return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
            case 'offline': return 'text-red-400 bg-red-400/10 border-red-400/20'
            case 'syncing': return 'text-primary bg-primary/10 border-primary/20'
        }
    }

    const getEnvStyles = (env: DbEnvironment) => {
        switch (env) {
            case 'production': return 'bg-red-500/10 text-red-500 border-red-500/20'
            case 'staging': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            case 'development': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="group relative bg-white/[0.03] border border-white/10 rounded-3xl p-6 backdrop-blur-2xl hover:bg-white/[0.05] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.2)] overflow-hidden"
        >
            {/* Background Accent */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-10 transition-opacity group-hover:opacity-20 ${database.status === 'healthy' ? 'bg-emerald-500' : 'bg-primary'
                }`} />

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <Icons.Database className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">{database.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{database.type}</span>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                <Icons.Globe className="w-3 h-3" />
                                {database.host}
                            </span>
                        </div>
                    </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] border ${getEnvStyles(database.environment)}`}>
                    {database.environment}
                </span>
            </div>

            {/* Health Pulse Section */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${database.status === 'healthy' ? 'bg-emerald-400' : 'bg-primary'
                                }`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${database.status === 'healthy' ? 'bg-emerald-500' : 'bg-primary'
                                }`}></span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Connectivity</span>
                    </div>
                    <span className="text-[10px] font-bold text-foreground">{database.latency}ms</span>
                </div>
                <div className="flex items-center gap-1.5 h-6">
                    {Array.from({ length: 24 }).map((_, i) => (
                        <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-500 ${i > 18 ? 'h-6 bg-primary/20' : i > 12 ? 'h-4 bg-emerald-500/20' : 'h-3 bg-emerald-500/50'
                                }`}
                            style={{ opacity: 0.3 + (i / 24) * 0.7 }}
                        />
                    ))}
                </div>
            </div>

            {/* Users & Info */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex -space-x-2">
                    {database.users.slice(0, 3).map((user) => (
                        <div
                            key={user.id}
                            className="w-8 h-8 rounded-full border-2 border-[#0B0118] bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary group-hover:scale-110 transition-transform cursor-pointer"
                            title={user.name}
                        >
                            {user.name.charAt(0)}
                        </div>
                    ))}
                    {database.users.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-[#0B0118] bg-white/5 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                            +{database.users.length - 3}
                        </div>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Last Backup</p>
                    <p className="text-xs font-bold text-foreground">{database.lastBackup}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => handleTestConnection(database.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-400/20 transition-all font-sans"
                >
                    <Icons.Zap className="w-3.5 h-3.5" />
                    Test Signal
                </button>
                <button
                    onClick={() => onEditPermissions?.(database.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all font-sans"
                >
                    <Icons.Shield className="w-3.5 h-3.5" />
                    Access Mgmt
                </button>
                <button
                    onClick={() => onDisconnect?.(database.id)}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
                    title="Disconnect Node"
                >
                    <Icons.Trash className="w-3.5 h-3.5" />
                </button>
            </div>
        </motion.div>
    )
}
