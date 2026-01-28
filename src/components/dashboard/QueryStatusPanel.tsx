'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    Clock,
    Database,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Activity,
    Server,
    HardDrive
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type QueryStatus = 'idle' | 'running' | 'success' | 'error' | 'warning'

interface BasicStats {
    executionTime?: string
    rowsAffected?: number
    dataSize?: string
    status: QueryStatus
    message?: string
}

interface QueryStatusPanelProps {
    stats: BasicStats
}

export function QueryStatusPanel({ stats }: QueryStatusPanelProps) {
    const getStatusConfig = (s: QueryStatus) => {
        switch (s) {
            case 'success':
                return {
                    label: 'Success',
                    icon: CheckCircle2,
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    shadow: 'shadow-[0_0_20px_-5px_rgba(52,211,153,0.3)]'
                }
            case 'error':
                return {
                    label: 'Failed',
                    icon: XCircle,
                    color: 'text-red-400',
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                    shadow: 'shadow-[0_0_20px_-5px_rgba(248,113,113,0.3)]'
                }
            case 'warning':
                return {
                    label: 'Warning',
                    icon: AlertTriangle,
                    color: 'text-yellow-400',
                    bg: 'bg-yellow-500/10',
                    border: 'border-yellow-500/20',
                    shadow: 'shadow-[0_0_20px_-5px_rgba(250,204,21,0.3)]'
                }
            case 'running':
                return {
                    label: 'Running',
                    icon: Activity,
                    color: 'text-indigo-400',
                    bg: 'bg-indigo-500/10',
                    border: 'border-indigo-500/20',
                    shadow: 'shadow-[0_0_20px_-5px_rgba(129,140,248,0.3)]'
                }
            default:
                return {
                    label: 'Idle',
                    icon: Server,
                    color: 'text-muted-foreground',
                    bg: 'bg-foreground/5',
                    border: 'border-foreground/5',
                    shadow: ''
                }
        }
    }

    const config = getStatusConfig(stats.status)
    const StatusIcon = config.icon

    return (
        <div className="h-full flex flex-col gap-4">
            {/* Primary Status Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={stats.status}
                className={cn(
                    "relative overflow-hidden rounded-2xl p-5 border backdrop-blur-xl transition-all duration-500",
                    config.bg, config.border, config.shadow
                )}
            >
                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <p className={cn("text-xs font-bold uppercase tracking-widest mb-1", config.color)}>Status</p>
                        <h2 className="text-2xl font-black text-foreground tracking-tight">{config.label}</h2>
                    </div>
                    <div className={cn("p-2 rounded-xl bg-background/20 backdrop-blur-md", config.color)}>
                        <StatusIcon className={cn("w-6 h-6", stats.status === 'running' && "animate-spin")} />
                    </div>
                </div>

                {stats.message && (
                    <p className="mt-3 text-xs font-mono text-muted-foreground bg-background/30 p-2 rounded-lg border border-foreground/5">
                        {stats.message}
                    </p>
                )}

                {/* Decorative Blur */}
                <div className={cn("absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-[40px] opacity-30", config.color.replace('text-', 'bg-'))} />
            </motion.div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* Execution Time */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md flex flex-col gap-2 group hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Duration</span>
                    </div>
                    <p className="text-lg font-bold font-mono text-foreground">
                        {stats.status === 'running' ? (
                            <span className="animate-pulse">...</span>
                        ) : (
                            stats.executionTime || '--'
                        )}
                    </p>
                </div>

                {/* Rows Affected */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md flex flex-col gap-2 group hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Database className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Affected</span>
                    </div>
                    <p className="text-lg font-bold font-mono text-foreground">
                        {stats.status === 'running' ? (
                            <span className="animate-pulse">...</span>
                        ) : (
                            stats.rowsAffected !== undefined ? `${stats.rowsAffected} Rows` : '--'
                        )}
                    </p>
                </div>

                {/* Data Size (Optional) */}
                <div className="col-span-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Data Transferred</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-foreground/70">
                        {stats.dataSize || '0 KB'}
                    </span>
                </div>
            </div>
        </div>
    )
}
