'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle, XCircle, Server, Activity, ArrowUpCircle } from 'lucide-react'
import { checkDatabaseHealth, getSystemInfo } from '@/lib/actions/systemActions'
import { useToast } from '@/contexts/ToastContext'

export default function SettingsClient() {
    const { toast } = useToast()
    const [health, setHealth] = useState<{ status: string, latency: number, message: string } | null>(null)
    const [systemInfo, setSystemInfo] = useState<{ version: string, nodeVersion: string, environment: string, uptime: number } | null>(null)
    const [isLoadingHealth, setIsLoadingHealth] = useState(false)

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
            toast({ title: 'System Check Complete', description: 'Internal database is reachable.', type: 'success' })
        } else {
            toast({ title: 'System Check Failed', description: res.message, type: 'error' })
        }
    }

    const fetchSystemInfo = async () => {
        const info = await getSystemInfo()
        setSystemInfo(info)
        // Auto-check health on load
        fetchHealth()
    }

    useEffect(() => {
        fetchSystemInfo()
    }, [])

    return (
        <div className="space-y-6">
            {/* Database Health Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-foreground/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                System Health
                            </CardTitle>
                            <CardDescription>Real-time status of internal services</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchHealth}
                            disabled={isLoadingHealth}
                            className="gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoadingHealth ? 'animate-spin' : ''}`} />
                            Check Status
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 rounded-xl border bg-card flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${health?.status === 'online' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                    <Server className={`w-5 h-5 ${health?.status === 'online' ? 'text-emerald-500' : 'text-red-500'}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Internal Database</p>
                                    <p className="text-xs text-muted-foreground">PostgreSQL (Prisma)</p>
                                </div>
                            </div>
                            <div className="text-right">
                                {health ? (
                                    <>
                                        <Badge variant={health.status === 'online' ? 'default' : 'destructive'} className={`${health.status === 'online' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}>
                                            {health.status === 'online' ? 'OPERATIONAL' : 'OFFLINE'}
                                        </Badge>
                                        {health.status === 'online' && (
                                            <p className="text-xs text-muted-foreground mt-1 font-mono">{health.latency}ms latency</p>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-xs text-muted-foreground">Checking...</span>
                                )}
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border bg-card flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-blue-500/10">
                                    <ArrowUpCircle className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">System Uptime</p>
                                    <p className="text-xs text-muted-foreground">App Runtime</p>
                                </div>
                            </div>
                            <div className="text-right">
                                {systemInfo ? (
                                    <p className="text-lg font-bold font-mono">{(systemInfo.uptime / 60).toFixed(0)}m {(systemInfo.uptime % 60).toFixed(0)}s</p>
                                ) : (
                                    <span className="text-xs text-muted-foreground">Loading...</span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* System Info Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-foreground/10">
                <CardHeader>
                    <CardTitle>Application Information</CardTitle>
                    <CardDescription>Build and environment details</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Version</p>
                            <p className="text-sm font-medium">{systemInfo?.version || '...'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Environment</p>
                            <Badge variant="outline" className="text-xs">{systemInfo?.environment || '...'}</Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Runtime</p>
                            <p className="text-sm font-medium text-muted-foreground">Node.js {systemInfo?.nodeVersion || '...'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Build</p>
                            <p className="text-sm font-medium text-muted-foreground">Production Release</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Appearance / Other Settings Placeholder */}
            {/* <Card className="bg-card/50 backdrop-blur-sm border-foreground/10 opacity-70">
                <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                     <CardDescription>Global application settings</CardDescription>
                </CardHeader>
                <CardContent>
                   <p className="text-sm text-muted-foreground italic">Theme settings are managed in the navigation bar.</p>
                </CardContent>
            </Card> */}
        </div>
    )
}
