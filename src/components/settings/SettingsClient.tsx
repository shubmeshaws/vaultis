'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { checkDatabaseHealth, getSystemInfo, getSystemConfig, updateSystemConfig, performAuditLogCleanup } from '@/lib/actions/systemActions'
import { useToast } from '@/contexts/ToastContext'
import { cn } from '@/lib/utils'
import { RefreshCw, CheckCircle, Server, Activity, ArrowUpCircle, ShieldCheck, Wifi, Database, Trash2, Save, Calendar, Bot, Key, CheckCircle2, XCircle, Loader } from 'lucide-react'
import { SimpleConfirmationModal } from '@/components/ui/SimpleConfirmationModal'
import { getAIConfigs, saveAIConfig, setActiveProvider, deleteAIConfig } from '@/lib/actions/aiConfigActions'
import { OpenAILogo, AnthropicLogo, GoogleLogo, GroqLogo } from '@/components/icons/AIProviderLogos'

export default function SettingsClient() {
    const { toast } = useToast()
    const [health, setHealth] = useState<{ status: string, latency: number, message: string } | null>(null)
    const [systemInfo, setSystemInfo] = useState<{ version: string, nodeVersion: string, environment: string, uptime: number } | null>(null)
    const [isLoadingHealth, setIsLoadingHealth] = useState(false)
    const [retentionDays, setRetentionDays] = useState('30')
    const [isSavingRetention, setIsSavingRetention] = useState(false)
    const [isCleaningLogs, setIsCleaningLogs] = useState(false)
    const [isCleanupModalOpen, setIsCleanupModalOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    // AI Config state
    const [aiConfigs, setAiConfigs] = useState<any[]>([])
    const [aiFormData, setAiFormData] = useState<{ [key: string]: { apiKey: string, model: string, endpoint: string } }>({})
    const [testingProvider, setTestingProvider] = useState<string | null>(null)
    const [savingProvider, setSavingProvider] = useState<string | null>(null)

    useEffect(() => {
        setIsMounted(true)
    }, [])

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

        // Fetch retention config
        const config = await getSystemConfig('AUDIT_LOG_RETENTION_DAYS')
        if (config.success && config.value) {
            setRetentionDays(config.value)
        }

        // Auto-check health on load
        fetchHealth()
    }

    const handleSaveRetention = async () => {
        setIsSavingRetention(true)
        const res = await updateSystemConfig('AUDIT_LOG_RETENTION_DAYS', retentionDays)
        if (res.success) {
            toast({ title: 'Settings Saved', description: 'Audit log retention policy updated.', type: 'success' })
        } else {
            toast({ title: 'Error', description: res.error || 'Failed to save settings.', type: 'error' })
        }
        setIsSavingRetention(false)
    }

    const handleManualCleanup = async () => {
        setIsCleanupModalOpen(false)
        setIsCleaningLogs(true)
        const res = await performAuditLogCleanup()
        if (res.success) {
            toast({ title: 'Cleanup Successful', description: res.message, type: 'success' })
        } else {
            toast({ title: 'Cleanup Failed', description: res.error || 'Failed to clean logs.', type: 'error' })
        }
        setIsCleaningLogs(false)
    }

    const getCutoffDateStr = () => {
        const days = parseInt(retentionDays)
        if (isNaN(days)) return 'Invalid'
        const date = new Date()
        date.setDate(date.getDate() - days)
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const handleTestAIConfig = async (provider: string) => {
        setTestingProvider(provider)
        const formData = aiFormData[provider]
        if (!formData?.apiKey) {
            toast({ title: 'Error', description: 'Please enter an API key', type: 'error' })
            setTestingProvider(null)
            return
        }

        const res = await fetch('/api/ai/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                provider,
                apiKey: formData.apiKey,
                endpoint: formData.endpoint
            })
        })

        const data = await res.json()
        if (data.success) {
            toast({ title: 'Connection Successful', description: data.message || 'API key is valid', type: 'success' })
        } else {
            toast({ title: 'Connection Failed', description: data.error || 'Invalid API key', type: 'error' })
        }
        setTestingProvider(null)
    }

    const handleSaveAIConfig = async (provider: string) => {
        setSavingProvider(provider)
        const formData = aiFormData[provider]
        if (!formData?.apiKey) {
            toast({ title: 'Error', description: 'Please enter an API key', type: 'error' })
            setSavingProvider(null)
            return
        }

        const res = await saveAIConfig(provider, formData.apiKey, formData.model, formData.endpoint)
        if (res.success) {
            toast({ title: 'Saved', description: 'AI configuration saved successfully', type: 'success' })
            fetchAIConfigs()
        } else {
            toast({ title: 'Error', description: res.error || 'Failed to save', type: 'error' })
        }
        setSavingProvider(null)
    }

    const handleSetActiveProvider = async (provider: string) => {
        const res = await setActiveProvider(provider)
        if (res.success) {
            toast({ title: 'Active Provider Updated', description: `${provider} is now the active AI provider`, type: 'success' })
            fetchAIConfigs()
        } else {
            toast({ title: 'Error', description: res.error || 'Failed to set active provider', type: 'error' })
        }
    }

    const [disconnectModalOpen, setDisconnectModalOpen] = useState(false)
    const [providerToDisconnect, setProviderToDisconnect] = useState<string | null>(null)

    const handleDeleteAIConfig = (provider: string) => {
        setProviderToDisconnect(provider)
        setDisconnectModalOpen(true)
    }

    const confirmDisconnect = async () => {
        if (!providerToDisconnect) return

        const res = await deleteAIConfig(providerToDisconnect)
        if (res.success) {
            toast({ title: 'Disconnected', description: `${providerToDisconnect} configuration removed`, type: 'success' })
            fetchAIConfigs()
            // Reset form data for this provider
            setAiFormData(prev => ({
                ...prev,
                [providerToDisconnect]: { apiKey: '', model: prev[providerToDisconnect]?.model || '', endpoint: '' }
            }))
        } else {
            toast({ title: 'Error', description: res.error || 'Failed to disconnect', type: 'error' })
        }
        setDisconnectModalOpen(false)
        setProviderToDisconnect(null)
    }

    const fetchAIConfigs = async () => {
        const res = await getAIConfigs()
        if (res.success && res.configs) {
            setAiConfigs(res.configs)
        }
    }

    useEffect(() => {
        fetchData()
        fetchAIConfigs()

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

    const renderProviderCard = (provider: string, name: string, description: string, models: string[], requiresEndpoint = false) => {
        const config = aiConfigs.find(c => c.provider === provider)
        const isActive = config?.isActive
        const isConfigured = !!config

        // Provider logo mapping
        const logos: { [key: string]: JSX.Element } = {
            openai: <OpenAILogo />,
            anthropic: <AnthropicLogo />,
            google: <GoogleLogo />,
            groq: <GroqLogo />
        }

        return (
            <div key={provider} className={cn(
                "p-4 rounded-xl border transition-all",
                isActive ? "bg-purple-500/5 border-purple-500/20" : "bg-foreground/[0.01] border-foreground/5"
            )}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-foreground/5">
                            {logos[provider]}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                {name}
                                {isActive && <Badge className="text-[9px] bg-purple-500 text-white">ACTIVE</Badge>}
                                {isConfigured && !isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                            </h3>
                            <p className="text-[10px] text-muted-foreground">{description}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">API Key</label>
                        <div className="relative mt-1">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input
                                type="password"
                                placeholder={config?.apiKey || "Enter API key"}
                                onChange={(e) => setAiFormData(prev => ({
                                    ...prev,
                                    [provider]: { ...prev[provider], apiKey: e.target.value, model: prev[provider]?.model || models[0], endpoint: prev[provider]?.endpoint || '' }
                                }))}
                                className="w-full h-9 pl-9 pr-3 bg-foreground/5 border border-foreground/10 rounded-lg text-xs focus:outline-none focus:border-purple-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Model</label>
                        <select
                            onChange={(e) => setAiFormData(prev => ({
                                ...prev,
                                [provider]: { ...prev[provider], model: e.target.value, apiKey: prev[provider]?.apiKey || '', endpoint: prev[provider]?.endpoint || '' }
                            }))}
                            defaultValue={config?.model || models[0]}
                            className="w-full h-9 px-3 mt-1 bg-foreground/5 border border-foreground/10 rounded-lg text-xs focus:outline-none focus:border-purple-500/50 transition-all"
                        >
                            {models.map(model => (
                                <option key={model} value={model}>{model}</option>
                            ))}
                        </select>
                    </div>

                    {requiresEndpoint && (
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Endpoint URL</label>
                            <input
                                type="text"
                                placeholder="https://your-resource.openai.azure.com"
                                onChange={(e) => setAiFormData(prev => ({
                                    ...prev,
                                    [provider]: { ...prev[provider], endpoint: e.target.value, apiKey: prev[provider]?.apiKey || '', model: prev[provider]?.model || models[0] }
                                }))}
                                className="w-full h-9 px-3 mt-1 bg-foreground/5 border border-foreground/10 rounded-lg text-xs focus:outline-none focus:border-purple-500/50 transition-all"
                            />
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <Button
                            onClick={() => handleTestAIConfig(provider)}
                            disabled={testingProvider === provider || !aiFormData[provider]?.apiKey}
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs border-foreground/10 hover:bg-foreground/5"
                        >
                            {testingProvider === provider ? (
                                <><Loader className="w-3 h-3 animate-spin mr-1" /> Testing...</>
                            ) : (
                                <><CheckCircle2 className="w-3 h-3 mr-1" /> Test</>
                            )}
                        </Button>
                        <Button
                            onClick={() => handleSaveAIConfig(provider)}
                            disabled={savingProvider === provider || !aiFormData[provider]?.apiKey}
                            size="sm"
                            className="flex-1 h-8 text-xs bg-purple-500 hover:bg-purple-600 text-white"
                        >
                            {savingProvider === provider ? 'Saving...' : 'Save'}
                        </Button>
                        {isConfigured && !isActive && (
                            <Button
                                onClick={() => handleSetActiveProvider(provider)}
                                size="sm"
                                className="h-8 px-3 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                                Activate
                            </Button>
                        )}
                        {isConfigured && (
                            <Button
                                onClick={() => handleDeleteAIConfig(provider)}
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        )}

                    </div>
                </div>
            </div>
        )
    }

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

            {/* Audit Log Governance Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-foreground/10 overflow-hidden">
                <CardHeader className="bg-foreground/[0.02]">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                                Governance & Retention
                            </CardTitle>
                            <CardDescription>Configure data lifecycle and compliance policies</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl border border-foreground/5 bg-foreground/[0.01]">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Audit Log Retention (Days)</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="number"
                                            value={retentionDays}
                                            onChange={(e) => setRetentionDays(e.target.value)}
                                            className="w-full h-10 pl-10 pr-4 bg-foreground/5 border border-foreground/10 rounded-lg text-sm font-bold focus:outline-none focus:border-indigo-500/50 transition-colors"
                                            placeholder="30"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSaveRetention}
                                        disabled={isSavingRetention}
                                        className="bg-indigo-500 hover:bg-indigo-600 text-white gap-2 font-bold px-4"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSavingRetention ? 'Saving...' : 'Save Policy'}
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-3 italic">
                                    Keeping records from **{isMounted ? getCutoffDateStr() : '...'}** onwards. Policy is enforced during manual cleanup and nightly at 00:00 UTC.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/[0.02]">
                                <label className="text-[10px] font-black uppercase tracking-widest text-red-500/60 block mb-2">Manual Data Purge</label>
                                <Button
                                    onClick={() => setIsCleanupModalOpen(true)}
                                    disabled={isCleaningLogs}
                                    variant="outline"
                                    className="w-full h-10 border-red-500/20 hover:bg-red-500/10 text-red-500 gap-2 font-bold"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {isCleaningLogs ? 'Cleaning...' : 'Run Retention Cleanup Now'}
                                </Button>
                                <p className="text-[10px] text-red-500/60 mt-3 font-medium flex flex-col">
                                    <span>Immediately remove all logs older than **{isMounted ? getCutoffDateStr() : '...'}**.</span>
                                    <span className="opacity-70 mt-0.5">Note: If you just created logs today, they won't be deleted unless you set Days to 0.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* AI Configuration Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-foreground/10 overflow-hidden">
                <CardHeader className="bg-foreground/[0.02]">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="w-5 h-5 text-purple-500" />
                                AI Configuration
                            </CardTitle>
                            <CardDescription>Configure AI providers for Meshy SQL Query Builder</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* OpenAI Card */}
                        {renderProviderCard('openai', 'OpenAI', 'GPT-4o, GPT-4 Turbo', ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'])}

                        {/* Anthropic Card */}
                        {renderProviderCard('anthropic', 'Anthropic', 'Claude 3.5 Sonnet, Claude 3', ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'])}

                        {/* Google Card */}
                        {renderProviderCard('google', 'Google AI', 'Gemini 1.5 Pro, Flash', ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.0-pro'])}

                        {/* Groq Card */}
                        {renderProviderCard(
                            'groq',
                            'Groq',
                            'Ultra-fast inference with open models',
                            [
                                'llama-3.3-70b-versatile',
                                'llama-3.2-90b-vision-preview',
                                'llama-3.2-11b-vision-preview',
                                'llama-3.2-3b-preview',
                                'llama-3.2-1b-preview',
                                'llama-3.1-70b-versatile',
                                'llama-3.1-8b-instant',
                                'mixtral-8x7b-32768',
                                'gemma2-9b-it'
                            ]
                        )}
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

            <SimpleConfirmationModal
                isOpen={isCleanupModalOpen}
                onClose={() => setIsCleanupModalOpen(false)}
                onConfirm={handleManualCleanup}
                title="Confirm Data Purge"
                description={`Are you sure you want to permanently remove all audit logs older than ${retentionDays} days? This operation cannot be reversed.`}
                confirmText="Yes, Purge Logs"
                type="danger"
            />
            {/* Disconnect Confirmation Modal */}
            <SimpleConfirmationModal
                isOpen={disconnectModalOpen}
                onClose={() => setDisconnectModalOpen(false)}
                onConfirm={confirmDisconnect}
                title="Disconnect AI Provider"
                description={`Are you sure you want to disconnect ${providerToDisconnect}? This will remove the API key and configuration. This action cannot be undone.`}
                confirmText="Disconnect"
                cancelText="Cancel"
            />
        </div>
    )
}
