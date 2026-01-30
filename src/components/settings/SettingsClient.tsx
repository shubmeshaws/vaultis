'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle, XCircle, Server, Activity, ArrowUpCircle, Database, ShieldCheck, Wifi } from 'lucide-react'
import { checkDatabaseHealth, getSystemInfo, getManagedDatabases } from '@/lib/actions/systemActions'
import { testConnectionById } from '@/lib/actions/databaseActions'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export default function SettingsClient() {
    const { toast } = useToast()
    const { isAdmin } = useAuth()
    const [health, setHealth] = useState<{ status: string, latency: number, message: string } | null>(null)
    const [systemInfo, setSystemInfo] = useState<{ version: string, nodeVersion: string, environment: string, uptime: number } | null>(null)
    const [managedDbs, setManagedDbs] = useState<any[]>([])
    const [isLoadingHealth, setIsLoadingHealth] = useState(false)
    const [isTestingDb, setIsTestingDb] = useState<string | null>(null)
    const [dbResults, setDbResults] = useState<Record<string, { success: boolean, latency?: number, error?: string }>>({})

    const fetchHealth = async () => {
        setIsLoadingHealth(true)
        const res = await checkDatabaseHealth()
        setHealth({
            status: res.status,
            latency: res.latency,
            message: res.message
        })
        setIsLoadingHealth(false)
        if (res.success) {
            toast({ title: 'Application Health Check', description: 'Internal database connection is stable.', type: 'success' })
        } else {
            toast({ title: 'System Warning', description: 'Internal database connection failed.', type: 'error' })
        }
    }

    const testExternalDb = async (dbId: string, dbName: string) => {
        setIsTestingDb(dbId)
        try {
            const res = await testConnectionById(dbId)
            setDbResults(prev => ({
                ...prev,
                [dbId]: {
                    success: res.success,
                    latency: res.latency,
                    error: res.error
                }
            }))

            if (res.success) {
                toast({ title: `Connection to ${dbName} OK`, description: `Latency: ${res.latency}ms`, type: 'success' })
            } else {
                toast({ title: `Connection to ${dbName} Failed`, description: res.error, type: 'error' })
            }
        } catch (error) {
            setDbResults(prev => ({ ...prev, [dbId]: { success: false, error: 'Request timeout' } }))
        } finally {
            setIsTestingDb(null)
        }
    }

    const fetchData = async () => {
        const info = await getSystemInfo()
        setSystemInfo(info)

        // Auto-check health on load
        fetchHealth()

        if (isAdmin) {
            const dbs = await getManagedDatabases()
            if (dbs.success) setManagedDbs(dbs.databases || [])
        }
    }

    useEffect(() => {
        fetchData()
    }, [isAdmin])

    return (
        <div className="space-y-6">
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
                            onClick={fetchHealth}
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
                                    <p className="text-[13px] font-bold">Metadata Database</p>
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

            {/* External Database Connectivity (Admin Only) */}
            {isAdmin && managedDbs.length > 0 && (
                <Card className="bg-card/50 backdrop-blur-sm border-foreground/10 overflow-hidden">
                    <CardHeader className="bg-foreground/[0.02]">
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-indigo-500" />
                            Managed Connectivity
                        </CardTitle>
                        <CardDescription>Test connections to registered external databases</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid gap-3">
                            {managedDbs.map((db) => (
                                <div key={db.id} className="p-3 rounded-xl border border-foreground/5 hover:border-indigo-500/20 transition-all bg-foreground/[0.01] flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center font-black text-[10px] text-muted-foreground uppercase group-hover:border-indigo-500/30 transition-all">
                                            {db.type?.substring(0, 2) || 'DB'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold flex items-center gap-2">
                                                {db.name}
                                                {db.isLocked && <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-medium">{db.host || 'Direct Connection'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {dbResults[db.id] && (
                                            <div className="text-right">
                                                <Badge variant={dbResults[db.id].success ? 'default' : 'destructive'} className={cn(
                                                    "text-[9px] font-black uppercase px-2 h-4",
                                                    dbResults[db.id].success ? "bg-emerald-500 text-white" : ""
                                                )}>
                                                    {dbResults[db.id].success ? 'Working' : 'Failed'}
                                                </Badge>
                                                {dbResults[db.id].success && (
                                                    <p className="text-[9px] font-mono font-bold opacity-40 mt-0.5">{dbResults[db.id].latency}ms</p>
                                                )}
                                            </div>
                                        )}
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => testExternalDb(db.id, db.name)}
                                            disabled={isTestingDb === db.id}
                                            className="h-8 text-[10px] font-bold px-4 gap-2 hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                        >
                                            {isTestingDb === db.id ? (
                                                <RefreshCw className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <RefreshCw className="w-3 h-3" />
                                            )}
                                            {dbResults[db.id] ? 'Re-test' : 'Test Connection'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

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
                </CardContent>
            </Card>
        </div>
    )
}
