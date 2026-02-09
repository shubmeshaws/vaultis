'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Shield, Server, Activity, ArrowUpRight, Settings, AlertTriangle, ChevronRight, Database, Zap, TrendingUp, TrendingDown, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AdminOverviewClientProps {
    stats: {
        userCount: number
        adminCount: number
        activeQueries: number
        riskyOperations: number
        systemHealth: number
    }
    recentUsers: any[]
}

export function AdminOverviewClient({ stats, recentUsers }: AdminOverviewClientProps) {
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
            className="space-y-8 p-6 relative max-w-[1600px] mx-auto min-h-full"
        >
            {/* Premium Background Ambience */}
            <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

            {/* Admin Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-foreground/5 pb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-3 rounded-2xl bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-all border border-foreground/5"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-1.5 shadow-sm">
                                <Shield className="w-3.5 h-3.5" />
                                Protected Sector
                            </div>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-50">/ Administration</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground leading-tight">
                            Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500">Center</span>
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium mt-2 max-w-xl">Real-time operational oversight & forensic intelligence</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-8 md:self-end">
                    <Link href="/settings">
                        <button className="h-10 px-6 bg-foreground/5 hover:bg-foreground/10 text-foreground border border-foreground/5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all">
                            <Settings className="w-4 h-4" />
                            System Config
                        </button>
                    </Link>
                    <Link href="/admin/analyzer">
                        <button className="h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-primary/20 active:scale-95">
                            <Activity className="w-4 h-4" />
                            Live Monitor
                        </button>
                    </Link>
                </div>
            </motion.div>

            {/* Core Vitals - Enhanced Aesthetic */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Total Users', value: stats.userCount.toString(), change: '+12% M/M', icon: Users, color: 'text-cyan-500', bg: 'bg-cyan-500/5', border: 'border-cyan-500/20' },
                    { label: 'Active Queries', value: stats.activeQueries.toString(), change: 'LIVE OPS', icon: Database, color: 'text-indigo-500', bg: 'bg-indigo-500/5', border: 'border-indigo-500/20', pulse: true },
                    { label: 'Risky Ops', value: stats.riskyOperations.toString(), change: '-8% vs 24h', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
                    { label: 'System Health', value: `${stats.systemHealth}%`, change: 'OPERATIONAL', icon: Server, color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        className="group relative p-6 rounded-[2rem] border backdrop-blur-3xl transition-all duration-500 bg-card border-foreground/10 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden flex flex-col justify-between"
                    >
                        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl", stat.bg)} />

                        <div className="relative z-10 flex justify-between items-start">
                            <div className={cn("p-4 rounded-2xl bg-background border transition-all duration-500 shadow-inner group-hover:scale-110", stat.border)}>
                                <stat.icon className={cn("w-6 h-6", stat.color, stat.pulse && "animate-pulse")} />
                            </div>
                            <div className={cn(
                                "px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.15em] bg-background/50 backdrop-blur-md shadow-sm",
                                (stat.change.startsWith('+') || ['OPERATIONAL', 'LIVE OPS'].includes(stat.change)) ? "text-emerald-500 border-emerald-500/20" :
                                    stat.change.startsWith('-') ? "text-red-500 border-red-500/20" : "text-muted-foreground border-foreground/10"
                            )}>
                                {stat.change}
                            </div>
                        </div>

                        <div className="relative z-10 mt-6">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] mb-1 opacity-70">{stat.label}</p>
                            <h3 className="text-3xl font-black text-foreground tracking-tighter tabular-nums leading-none">
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

            <div className="grid gap-8 md:grid-cols-3">
                {/* User Management Panel */}
                <motion.div variants={itemVariants} className="md:col-span-2">
                    <Card className="border-foreground/10 bg-white dark:bg-foreground/[0.02] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5">
                        <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-foreground/5 bg-foreground/[0.01]">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-black tracking-tight">Recent Registrations</CardTitle>
                                <CardDescription className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Identity & Permission Management</CardDescription>
                            </div>
                            <Link href="/admin/users">
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-[10px] font-black uppercase tracking-widest transition-all">
                                    Registry <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-3">
                                {recentUsers.map(u => (
                                    <div key={u.id} className="flex items-center justify-between p-5 rounded-3xl bg-foreground/[0.02] border border-foreground/5 hover:border-primary/20 hover:bg-primary/[0.02] transition-all group cursor-pointer">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-foreground/5 flex items-center justify-center text-xs font-black text-muted-foreground uppercase group-hover:scale-110 transition-transform">
                                                {u.email?.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{u.name || 'Unnamed User'}</p>
                                                <p className="text-[10px] font-mono text-muted-foreground tracking-tighter">{u.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={cn(
                                                "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                                                u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
                                            )}>
                                                {u.role}
                                            </span>
                                            <Link href="/admin/users">
                                                <button className="opacity-0 group-hover:opacity-100 p-2.5 hover:bg-foreground/5 rounded-xl transition-all text-muted-foreground hover:text-foreground">
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* System Alerts / Quick Config */}
                <div className="space-y-8">
                    {/* Privileged Access */}
                    <motion.div variants={itemVariants}>
                        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-purple-500/10 backdrop-blur-3xl rounded-[2rem] overflow-hidden shadow-xl shadow-purple-500/5 group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                            <CardHeader className="py-6 px-8 border-b border-purple-500/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-4 h-4 text-purple-500" />
                                    <span className="text-[9px] font-black text-purple-500 uppercase tracking-[0.2em]">Privileged Access</span>
                                </div>
                                <CardTitle className="text-4xl font-black tracking-tighter text-foreground">{stats.adminCount}</CardTitle>
                                <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Active Administrators</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="h-2 w-full bg-purple-500/10 rounded-full overflow-hidden mb-2">
                                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(stats.adminCount / stats.userCount) * 100}%` }} />
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-purple-500 opacity-60">
                                    <span>Node Ratio</span>
                                    <span>{((stats.adminCount / stats.userCount) * 100).toFixed(1)}%</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card className="border-foreground/10 bg-white dark:bg-foreground/[0.01] backdrop-blur-3xl rounded-[2rem] overflow-hidden shadow-sm">
                            <CardHeader className="py-6 px-8 border-b border-foreground/5">
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Global Policies</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-1">
                                {[
                                    { label: 'General Settings', href: '/settings' },
                                    { label: 'API Keys', href: '/settings' },
                                    { label: 'Forensic Logs', href: '/admin/audit-logs' },
                                    { label: 'Security Firewall', href: '/admin/users' }
                                ].map((link, i) => (
                                    <Link key={i} href={link.href} className="flex items-center justify-between p-4 rounded-2xl hover:bg-foreground/5 transition-colors group">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">{link.label}</span>
                                        <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-primary transition-colors" />
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
