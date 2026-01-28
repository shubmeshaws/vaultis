'use client'

import React from 'react'
import { motion } from 'framer-motion'

export interface AdminStat {
    label: string
    value: string
    trend: 'up' | 'down' | 'neutral'
    change: string
    color: 'primary' | 'red' | 'emerald' | 'amber'
    sparkline: number[]
}

interface AdminStatsProps {
    stats: AdminStat[]
}

const Icons = {
    Users: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
    Activity: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    Alert: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    Zap: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
}

export function AdminStats({ stats }: AdminStatsProps) {
    const getColorClasses = (color: AdminStat['color']) => {
        switch (color) {
            case 'primary': return { text: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', glow: 'shadow-primary/20' }
            case 'red': return { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', glow: 'shadow-red-500/20' }
            case 'emerald': return { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/20' }
            case 'amber': return { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'shadow-amber-500/20' }
        }
    }

    const getIcon = (label: string) => {
        if (label.toLowerCase().includes('user')) return Icons.Users
        if (label.toLowerCase().includes('query')) return Icons.Zap
        if (label.toLowerCase().includes('risky')) return Icons.Alert
        return Icons.Activity
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
                const classes = getColorClasses(stat.color)
                const Icon = getIcon(stat.label)

                return (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative"
                    >
                        <div className={`p-6 rounded-2xl bg-card border ${classes.border} backdrop-blur-xl shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 overflow-hidden`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2.5 rounded-xl ${classes.bg} ${classes.text} border ${classes.border}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${stat.trend === 'up' ? 'text-emerald-500' : stat.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>
                                    {stat.trend === 'up' ? '↗' : stat.trend === 'down' ? '↘' : '→'}
                                    {stat.change}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-3xl font-black text-foreground tracking-tight">{stat.value}</h3>
                            </div>

                            {/* Sparkline visualization */}
                            <div className="mt-6 flex items-end gap-[2px] h-10 w-full group-hover:opacity-100 opacity-60 transition-opacity">
                                {stat.sparkline.map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ delay: 0.2 + (i * 0.02), duration: 0.5 }}
                                        className={`flex-1 rounded-t-[1px] ${classes.bg.replace('/10', '/30')}`}
                                    />
                                ))}
                            </div>

                            {/* Background Accent */}
                            <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[40px] opacity-10 pointer-events-none transition-opacity group-hover:opacity-20 ${classes.bg}`} />
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}
