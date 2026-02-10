'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Database, Shield, Zap, Clock, ChevronRight, Plus, LayoutDashboard, Search, ArrowUpRight, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface DashboardOverviewClientProps {
    user: {
        name?: string | null
        email?: string | null
        role: string
    }
    stats: {
        totalQueries: string
        queryChange: string
        successRate: string
        avgLatency: string
        activeDatabases: number
    }
    recentQueries: any[]
}

export function DashboardOverviewClient({ user, stats, recentQueries }: DashboardOverviewClientProps) {
    const isAdmin = user.role === 'ADMIN'

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100
            }
        }
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 p-8 relative min-h-full"
        >
            {/* Premium Background Ambience */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

            {/* Header Section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-foreground/5 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 flex items-center gap-1.5 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            Live System
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-50">/ Dashboard</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter text-foreground leading-tight">
                        Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500">Overview</span>
                    </h1>
                    <p className="text-muted-foreground font-normal">
                        Welcome back, <span className="text-foreground font-bold">{user.name || user.email}</span>. Here's your system status.
                    </p>
                </div>

                <Link href="/meshy">
                    <button className="group relative h-10 px-6 bg-foreground text-background rounded-2xl text-sm font-bold uppercase tracking-widest flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-foreground/10 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative z-10 flex items-center gap-3">
                            <Plus className="w-4 h-4" />
                            New Explorer Session
                        </span>
                    </button>
                </Link>
            </motion.div>

            {/* Stats Grid - Enhanced Aesthetic */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Total Queries', value: stats.totalQueries, change: stats.queryChange, icon: Database, color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/20' },
                    { label: 'Success Rate', value: stats.successRate, change: 'OPTIMAL', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
                    { label: 'Avg Latency', value: stats.avgLatency, change: 'Normal', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
                    { label: 'Clusters', value: stats.activeDatabases.toString(), change: 'ACTIVE', icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-500/5', border: 'border-indigo-500/20' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className={cn(
                            "group relative p-6 rounded-3xl border backdrop-blur-2xl transition-all duration-500 overflow-hidden shadow-sm",
                            "bg-white dark:bg-foreground/[0.03] border-foreground/10 hover:border-transparent",
                            "hover:shadow-2xl hover:shadow-primary/10"
                        )}
                    >
                        {/* Hover Gradient Overlay */}
                        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", stat.bg)} />

                        <div className="relative z-10 flex justify-between items-start mb-6">
                            <div className={cn("p-3 rounded-2xl bg-background border transition-colors duration-500", stat.border)}>
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                            <div className={cn(
                                "flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-background/50 backdrop-blur-md",
                                (stat.change.startsWith('+') || ['OPTIMAL', 'ACTIVE'].includes(stat.change)) ? "text-emerald-500 border-emerald-500/20" :
                                    stat.change.startsWith('-') ? "text-red-500 border-red-500/20" : "text-muted-foreground border-foreground/10"
                            )}>
                                {(stat.change.startsWith('+') || stat.change.startsWith('-')) ? <TrendingUp className="w-2.5 h-2.5" /> : null}
                                {stat.change}
                            </div>
                        </div>

                        <div className="relative z-10 space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.25em]">{stat.label}</p>
                            <h3 className="text-3xl font-bold text-foreground tracking-tighter tabular-nums leading-none">
                                {stat.value}
                            </h3>
                        </div>

                        {/* Decoration */}
                        <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                            <stat.icon className="w-32 h-32" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3 items-start">
                {/* Recent Activity Panel - High Aesthetic */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <Card className="border-foreground/10 bg-white dark:bg-foreground/[0.02] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5">
                        <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-foreground/5 bg-foreground/[0.01]">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-bold tracking-tight">Recent Activity</CardTitle>
                                <CardDescription className="text-xs font-normal uppercase tracking-[0.1em] text-muted-foreground">Recent Query History</CardDescription>
                            </div>
                            <Link href="/queries?tab=history">
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-[10px] font-bold uppercase tracking-widest transition-all">
                                    Archive <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-8">
                            <div className="space-y-3">
                                {recentQueries.length > 0 ? (
                                    recentQueries.map((q: any) => (
                                        <div key={q.id} className="flex items-center gap-5 p-5 rounded-3xl bg-foreground/[0.02] border border-foreground/5 hover:border-indigo-500/20 hover:bg-indigo-500/[0.02] transition-all group cursor-pointer">
                                            <div className="w-12 h-12 rounded-2xl bg-background border border-foreground/5 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                <Database className="w-5 h-5 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1.5 overflow-hidden">
                                                    <code className="text-xs font-bold text-foreground/80 font-mono bg-foreground/5 px-2.5 py-1 rounded-lg truncate group-hover:text-indigo-500 transition-colors">
                                                        {q.sql}
                                                    </code>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5">
                                                        <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(q.timestamp), { addSuffix: true })}
                                                    </span>
                                                    <div className="w-1 h-1 rounded-full bg-foreground/10" />
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{q.databaseName}</span>
                                                    <div className="w-1 h-1 rounded-full bg-foreground/10" />
                                                    <div className={cn(
                                                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter",
                                                        q.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                                    )}>
                                                        <div className={cn("w-1 h-1 rounded-full animate-pulse", q.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-red-500')} />
                                                        {q.status}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full border border-foreground/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:bg-indigo-500 text-indigo-500 group-hover:text-white">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center space-y-4">
                                        <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto">
                                            <Database className="w-8 h-8 text-muted-foreground/20" />
                                        </div>
                                        <p className="text-sm text-muted-foreground font-normal italic">No queries recorded.</p>
                                        <Link href="/meshy" className="text-xs text-indigo-500 font-bold uppercase tracking-[0.2em] pt-4 block hover:underline">Launch Explorer Session</Link>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Sidebar Cards */}
                <div className="space-y-6">
                    {/* User Entitlement Card */}
                    <motion.div variants={itemVariants}>
                        <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-3xl rounded-[2rem] overflow-hidden shadow-xl shadow-indigo-500/5 relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                            <CardHeader className="py-6 px-8 flex flex-row items-center justify-between border-b border-indigo-500/10">
                                <div>
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-indigo-500">User Session</CardTitle>
                                    <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase italic tracking-tighter">Authenticated</CardDescription>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-500/10">
                                    <Shield className="w-6 h-6 text-indigo-500-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Role</p>
                                            <p className="text-3xl font-bold text-foreground tracking-tighter">{user.role}</p>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                            VERIFIED
                                        </div>
                                    </div>

                                    {isAdmin && (
                                        <Link href="/admin">
                                            <button className="w-full py-4 bg-foreground text-background rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all hover:letter-spacing-[0.4em] active:scale-95 shadow-xl shadow-foreground/10 flex items-center justify-center gap-3">
                                                Enter Command Center <ArrowUpRight className="w-4 h-4" />
                                            </button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Navigation Matrix */}
                    <motion.div variants={itemVariants}>
                        <Card className="border-foreground/10 bg-white dark:bg-foreground/[0.01] backdrop-blur-3xl rounded-[2rem] overflow-hidden shadow-sm">
                            <CardHeader className="py-6 px-8 border-b border-foreground/5">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest">Quick Navigation</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 grid grid-cols-2 gap-3">
                                {[
                                    { label: 'History', href: '/queries?tab=history', icon: Clock, color: 'text-amber-500' },
                                    { label: 'Saved', href: '/queries?tab=saved', icon: Database, color: 'text-blue-500' },
                                    { label: 'Infrastructure', href: '/admin/databases', icon: Search, color: 'text-emerald-500' },
                                    { label: 'Configuration', href: '/settings', icon: Zap, color: 'text-purple-500' },
                                ].map((action, i) => (
                                    <Link
                                        key={i}
                                        href={action.href}
                                        className="group flex flex-col items-center justify-center gap-3 p-5 rounded-3xl bg-foreground/[0.02] border border-foreground/5 hover:border-foreground/20 hover:bg-foreground/[0.05] transition-all text-center"
                                    >
                                        <div className={cn("p-2.5 rounded-xl bg-background border border-foreground/5 transition-transform group-hover:scale-110 group-hover:rotate-6", action.color)}>
                                            <action.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}
