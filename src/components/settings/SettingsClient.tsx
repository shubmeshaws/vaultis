'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle, Server, Activity, ArrowUpCircle, ShieldCheck, Wifi } from 'lucide-react'
import { checkDatabaseHealth, getSystemInfo } from '@/lib/actions/systemActions'
import { useToast } from '@/contexts/ToastContext'
import { cn } from '@/lib/utils'

export default function SettingsClient() {
    const { toast } = useToast()
    const [health, setHealth] = useState<{ status: string, latency: number, message: string } | null>(null)
    const [systemInfo, setSystemInfo] = useState<{ version: string, nodeVersion: string, environment: string, uptime: number } | null>(null)
    const [isLoadingHealth, setIsLoadingHealth] = useState(false)

    const fetchHealth = async (isManual = false) => {
        if (isManual) setIsLoadingHealth(true)
        const res = await checkDatabaseHealth()

        // Only toast if manual OR if status changed (e.g. went offline)
        const statusChanged = health && health.status !== res.status
        if (isManual || statusChanged) {
            if (res.success) {
                toast({ title: 'Application Health Check', description: 'Internal database connection is stable.', type: 'success' })
            } else {
                toast({ title: 'System Warning', description: 'Internal database connection failed.', type: 'error' })
            }
        }

        setHealth({
            status: res.status,
            latency: res.latency,
            message: res.message
        })

        if (isManual) setIsLoadingHealth(false)
    }

    const fetchData = async () => {
        const info = await getSystemInfo()
        setSystemInfo(info)

        // Auto-check health on load
        fetchHealth()
    }

    useEffect(() => {
        fetchData()

        // Real-time metadata health check every 10 seconds
        const healthInterval = setInterval(fetchHealth, 10000)

        // Local uptime increment every second for real-time feel
        const uptimeInterval = setInterval(() => {
            setSystemInfo(prev => {
                if (!prev) return null;
                return { ...prev, uptime: prev.uptime + 1 }
            })
        }, 1000)

        return () => {
            clearInterval(healthInterval)
            clearInterval(uptimeInterval)
        }
    }, [])

    return (
        <div className="max-w-5xl space-y-6">
            {/* System Health Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-foreground/10 overflow-hidden">
                <CardHeader className="bg-foreground/[0.02]">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-500" />
                                System Infrastructure
                            </CardTitle>
                            <CardDescription>Core application services health monitoring</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchHealth(true)}
                            disabled={isLoadingHealth}
                            className="gap-2 border-indigo-500/20 hover:bg-indigo-500/10"
                        >
                            <Wifi className={`w-4 h-4 ${isLoadingHealth ? 'animate-pulse' : ''}`} />
                            Run Diagnostic
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Internal DB Status */}
                        <div className="p-4 rounded-xl border border-foreground/5 bg-foreground/[0.01] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-xl ring-1",
                                    health?.status === 'online' ? "bg-emerald-500/10 ring-emerald-500/20" : "bg-red-500/10 ring-red-500/20"
                                )}>
                                    <Server className={cn("w-5 h-5", health?.status === 'online' ? "text-emerald-500" : "text-red-500")} />
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold">Metadata Database <span className="text-[10px] text-indigo-500 font-medium ml-1 opacity-70">(Real-time)</span></p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Prisma Client</p>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                                {health ? (
                                    <>
                                        <Badge variant={health.status === 'online' ? 'default' : 'destructive'} className={cn(
                                            "text-[10px] font-black uppercase tracking-tighter px-2 h-5",
                                            health.status === 'online' ? "bg-emerald-500 text-white" : ""
                                        )}>
                                            {health.status === 'online' ? 'OPERATIONAL' : 'OFFLINE'}
                                        </Badge>
                                        <span className="text-[10px] font-mono font-bold opacity-40">{health.latency}ms</span>
                                    </>
                                ) : (
                                    <span className="text-[10px] font-black animate-pulse uppercase">Syncing...</span>
                                )}
                            </div>
                        </div>

                        {/* Uptime Status */}
                        <div className="p-4 rounded-xl border border-foreground/5 bg-foreground/[0.01] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
                                    <ArrowUpCircle className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold">System Uptime</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Runtime</p>
                                </div>
                            </div>
                            <div className="text-right">
                                {systemInfo ? (
                                    <p className="text-sm font-black font-mono">
                                        {(systemInfo.uptime / 60).toFixed(0)}m {(systemInfo.uptime % 60).toFixed(0)}s
                                    </p>
                                ) : (
                                    <span className="text-[10px] font-black animate-pulse uppercase">Calculating...</span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Application Information */}
            <Card className="bg-card/50 backdrop-blur-sm border-foreground/10">
                <CardHeader>
                    <CardTitle>System Environment</CardTitle>
                    <CardDescription>Internal runtime and release metadata</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-black">Release</p>
                            <p className="text-xs font-bold font-mono">v{systemInfo?.version || '0.1.0'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-black">Env</p>
                            <Badge variant="outline" className="text-[9px] font-black border-indigo-500/20 text-indigo-500 bg-indigo-500/5">
                                {systemInfo?.environment?.toUpperCase() || 'DEVELOPMENT'}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-black">Engine</p>
                            <p className="text-xs font-bold font-mono opacity-60">Node {systemInfo?.nodeVersion?.replace('v', '') || '...'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-black">Stability</p>
                            <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-emerald-500" />
                                <span className="text-xs font-bold">Stable Build</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-foreground/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Created by</p>
                                <p className="text-xs font-bold">Shubham Meshram <span className="text-primary/60 font-medium">(DevOps)</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Wifi className="w-3.5 h-3.5" />
                            <a href="mailto:shubmeshaws@gmail.com" className="text-xs font-mono font-medium">shubmeshaws@gmail.com</a>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
