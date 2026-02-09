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
import { getAIConfigs, saveAIConfig, toggleProviderActive, deleteAIConfig } from '@/lib/actions/aiConfigActions'
import { OpenAILogo, AnthropicLogo, GoogleLogo, GroqLogo, PuterLogo } from '@/components/icons/AIProviderLogos'
// ... existing imports ...
// ... existing imports ...
import { Switch } from '@/components/ui/switch'

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
    const [activeProviderName, setActiveProviderName] = useState<string | null>(null)
    const [aiFormData, setAiFormData] = useState<{ [key: string]: { apiKey: string, model: string, endpoint: string } }>({})
    const [testingProvider, setTestingProvider] = useState<string | null>(null)
    const [savingProvider, setSavingProvider] = useState<string | null>(null)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        // Determine effective provider based on priority: Anthropic > OpenAI > Google > Groq
        const priority = ['anthropic', 'openai', 'google', 'groq']
        const activeConfigs = aiConfigs.filter(c => c.isActive)

        if (activeConfigs.length > 0) {
            const winner = activeConfigs.sort((a, b) => {
                const indexA = priority.indexOf(a.provider)
                const indexB = priority.indexOf(b.provider)
                return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
            })[0]
            setActiveProviderName(winner.provider)
        } else {
            setActiveProviderName(null)
        }
    }, [aiConfigs])

    const fetchHealth = async (isManual = false) => {
        if (isManual) setIsLoadingHealth(true)
        try {
            const res = await checkDatabaseHealth()

            if (!res) {
                console.error('Database health check returned undefined')
                setHealth({
                    status: 'error',
                    latency: 0,
                    message: 'Failed to communicate with server'
                })
                return
            }

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
        } catch (err: any) {
            console.error('Health check failed:', err)
            setHealth({
                status: 'error',
                latency: 0,
                message: err.message || 'Health check encountered an error'
            })
        } finally {
            if (isManual) setIsLoadingHealth(false)
        }
    }

    const fetchData = async () => {
        try {
            const info = await getSystemInfo()
            if (info) setSystemInfo(info)

            // Fetch retention config
            const config = await getSystemConfig('AUDIT_LOG_RETENTION_DAYS')
            if (config && config.success && config.value) {
                setRetentionDays(config.value)
            }
        } catch (err) {
            console.error('Failed to fetch initial settings data:', err)
        }

        // Auto-check health on load
        fetchHealth()
    }

    const handleSaveRetention = async () => {
        setIsSavingRetention(true)
        try {
            const res = await updateSystemConfig('AUDIT_LOG_RETENTION_DAYS', retentionDays)
            if (res && res.success) {
                toast({ title: 'Settings Saved', description: 'Audit log retention policy updated.', type: 'success' })
            } else {
                toast({ title: 'Error', description: res?.error || 'Failed to save settings.', type: 'error' })
            }
        } catch (err: any) {
            toast({ title: 'System Error', description: err.message || 'Failed to communicate with server', type: 'error' })
        }
        setIsSavingRetention(false)
    }

    const handleManualCleanup = async () => {
        setIsCleanupModalOpen(false)
        setIsCleaningLogs(true)
        try {
            const res = await performAuditLogCleanup()
            if (res && res.success) {
                toast({ title: 'Cleanup Successful', description: res.message, type: 'success' })
            } else {
                toast({ title: 'Cleanup Failed', description: res?.error || 'Failed to clean logs.', type: 'error' })
            }
        } catch (err: any) {
            toast({ title: 'System Error', description: err.message || 'Failed to communicate with server', type: 'error' })
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
        try {
            let formData = aiFormData[provider]

            // Special handling for Puter: inject dummy key if missing
            if (provider === 'puter' && !formData?.apiKey) {
                formData = {
                    ...formData,
                    apiKey: 'puter-client-v2',
                    model: formData?.model || 'gpt-4o',
                    endpoint: formData?.endpoint || ''
                }
            }

            if (!formData?.apiKey) {
                toast({ title: 'Error', description: 'Please enter an API key', type: 'error' })
                setSavingProvider(null)
                return
            }

            const res = await saveAIConfig(provider, formData.apiKey, formData.model, formData.endpoint)
            if (res && res.success) {
                toast({ title: 'Saved', description: 'AI configuration saved successfully', type: 'success' })
                fetchAIConfigs()
            } else {
                toast({ title: 'Error', description: res?.error || 'Failed to save', type: 'error' })
            }
        } catch (err: any) {
            toast({ title: 'System Error', description: err.message || 'Failed to communicate with server', type: 'error' })
        }
        setSavingProvider(null)
    }


    const handleToggleActive = async (provider: string, checked: boolean) => {
        try {
            const res = await toggleProviderActive(provider, checked)
            if (res && res.success) {
                fetchAIConfigs()
            } else {
                toast({ title: 'Error', description: res?.error || 'Failed to update provider status', type: 'error' })
            }
        } catch (err: any) {
            toast({ title: 'System Error', description: err.message || 'Failed to communicate with server', type: 'error' })
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

        try {
            const res = await deleteAIConfig(providerToDisconnect)
            if (res && res.success) {
                toast({ title: 'Disconnected', description: `${providerToDisconnect} configuration removed`, type: 'success' })
                fetchAIConfigs()
                // Reset form data for this provider
                setAiFormData(prev => ({
                    ...prev,
                    [providerToDisconnect]: { apiKey: '', model: prev[providerToDisconnect]?.model || '', endpoint: '' }
                }))
            } else {
                toast({ title: 'Error', description: res?.error || 'Failed to disconnect', type: 'error' })
            }
        } catch (err: any) {
            toast({ title: 'System Error', description: err.message || 'Failed to communicate with server', type: 'error' })
        }
        setDisconnectModalOpen(false)
        setProviderToDisconnect(null)
    }

    const fetchAIConfigs = async () => {
        try {
            const res = await getAIConfigs()
            if (res && res.success && res.configs) {
                setAiConfigs(res.configs)
            }
        } catch (err) {
            console.error('Failed to fetch AI configurations:', err)
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
        const isConfigured = !!config
        const isActive = config?.isActive
        const isEffective = provider === activeProviderName

        // Provider logo mapping
        const logos: { [key: string]: JSX.Element } = {
            openai: <OpenAILogo />,
            anthropic: <AnthropicLogo />,
            google: <GoogleLogo />,
            groq: <GroqLogo />,
            puter: <PuterLogo />
        }

        const getStatusBadge = () => {
            if (!isConfigured) return <Badge variant="outline" className="text-[9px] bg-muted/50 text-muted-foreground border-transparent">NOT CONFIGURED</Badge>
            if (!isActive) return <Badge variant="outline" className="text-[9px] border-muted-foreground/20 text-muted-foreground">DISABLED</Badge>
            if (isEffective) return <Badge className="text-[9px] bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-sm shadow-emerald-500/20">PRIMARY</Badge>
            return <Badge variant="secondary" className="text-[9px] bg-blue-500/10 text-blue-600 border border-blue-500/10">FALLBACK</Badge>
        }

        const isPuter = provider === 'puter'

        return (
            <div key={provider} className={cn(
                "p-4 rounded-xl border transition-all duration-300",
                isEffective ? "bg-emerald-500/[0.03] border-emerald-500/30 ring-1 ring-emerald-500/10" :
                    isActive ? "bg-blue-500/[0.01] border-blue-500/10" :
                        "bg-foreground/[0.01] border-foreground/5"
            )}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-xl transition-colors",
                            isEffective ? "bg-emerald-500/10 text-emerald-600" : "bg-foreground/5 text-muted-foreground"
                        )}>
                            {logos[provider]}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                {name}
                                {getStatusBadge()}
                            </h3>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{description}</p>
                        </div>
                    </div>
                    {isConfigured && (
                        <Switch
                            checked={isActive}
                            onCheckedChange={(checked) => handleToggleActive(provider, checked)}
                            className="data-[state=checked]:bg-emerald-500"
                        />
                    )}
                </div>

                <div className="space-y-2">
                    {!isPuter && (
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
                    )}

                    {isPuter && (
                        <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                            <p className="text-[11px] text-blue-600 font-medium flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                No API Key required. Authentication is handled by Puter.js in your browser.
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Model</label>
                        <select
                            onChange={(e) => setAiFormData(prev => ({
                                ...prev,
                                [provider]: { ...prev[provider], model: e.target.value, apiKey: prev[provider]?.apiKey || (isPuter ? 'puter-client-v2' : ''), endpoint: prev[provider]?.endpoint || '' }
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
                        {!isPuter && (
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
                                    <><CheckCircle2 className="w-3 h-3 mr-1" /> Test Connection</>
                                )}
                            </Button>
                        )}
                        <Button
                            onClick={() => {
                                if (isPuter && !aiFormData[provider]?.apiKey) {
                                    // Inject dummy key for Puter if missing
                                    setAiFormData(prev => ({
                                        ...prev,
                                        [provider]: { ...prev[provider], apiKey: 'puter-client-v2', model: prev[provider]?.model || models[0] }
                                    }))
                                    setTimeout(() => handleSaveAIConfig(provider), 0)
                                } else {
                                    handleSaveAIConfig(provider)
                                }
                            }}
                            disabled={savingProvider === provider || (!isPuter && !aiFormData[provider]?.apiKey)}
                            size="sm"
                            className="flex-1 h-8 text-xs bg-purple-500 hover:bg-purple-600 text-white"
                        >
                            <Save className="w-3 h-3 mr-1.5" />
                            {savingProvider === provider ? 'Saving...' : 'Save Changes'}
                        </Button>
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
        <div className="space-y-6">
            {/* System Health Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 bg-card/50 backdrop-blur-sm border-foreground/10 overflow-hidden">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-500" />
                                <CardTitle className="text-lg">Internal Database Health</CardTitle>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fetchHealth(true)}
                                disabled={isLoadingHealth}
                                className="h-8 w-8 p-0 rounded-full hover:bg-foreground/5"
                            >
                                <RefreshCw className={cn("w-4 h-4", isLoadingHealth && "animate-spin text-indigo-500")} />
                            </Button>
                        </div>
                        <CardDescription>Primary storage and query engine connectivity</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-500",
                                    health?.status === 'online' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                                        health?.status === 'offline' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                            "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                )}>
                                    <Server className="w-8 h-8" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-2xl font-black tracking-tight uppercase">
                                            {health?.status || 'UNKNOWN'}
                                        </p>
                                        {health?.status === 'online' && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Operational</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium">{health?.message || 'Connecting to database...'}</p>
                                </div>
                            </div>

                            <div className="h-12 w-px bg-foreground/5 hidden sm:block" />

                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">Response Latency</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black tabular-nums tracking-tight">{health?.latency || 0}</span>
                                    <span className="text-xs font-bold text-muted-foreground">ms</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-sm border-foreground/10 overflow-hidden">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <ArrowUpCircle className="w-5 h-5 text-indigo-500" />
                            <CardTitle className="text-lg">System Uptime</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-1">Active Duration</p>
                                <p className="text-3xl font-black tabular-nums tracking-tighter text-indigo-500">
                                    {Math.floor((systemInfo?.uptime || 0) / 3600)}h {Math.floor(((systemInfo?.uptime || 0) % 3600) / 60)}m
                                </p>
                            </div>
                            <div className="pt-4 border-t border-indigo-500/10">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-muted-foreground">Process State</span>
                                    <Badge variant="outline" className="text-[10px] font-black border-indigo-500/20 text-indigo-500 bg-indigo-500/10">
                                        RUNNING
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* AI Configuration Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-foreground/10 overflow-hidden">
                <CardHeader className="bg-foreground/[0.02]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="w-5 h-5 text-purple-500" />
                                Multi-Provider AI Configuration
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                Automatic failover priority system enabled
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-foreground/5 shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-1">Priority:</span>
                            {['Anthropic', 'OpenAI', 'Google', 'Groq'].map((p, i) => (
                                <React.Fragment key={p}>
                                    <span className={cn(
                                        "text-[10px] font-bold",
                                        activeProviderName?.toLowerCase() === p.toLowerCase() ? "text-emerald-600" : "text-foreground/70"
                                    )}>{p}</span>
                                    {i < 3 && <span className="text-[10px] text-muted-foreground/40">›</span>}
                                </React.Fragment>
                            ))}
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
                        {renderProviderCard('google', 'Google AI', 'Gemini 1.5 Pro, Flash', ['gemini-1.5-flash-001', 'gemini-1.5-pro-001', 'gemini-1.0-pro'])}

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

                        {/* Puter Card */}
                        {renderProviderCard(
                            'puter',
                            'Puter.js',
                            'Free client-side AI via Puter.com',
                            ['gpt-4o', 'gpt-4o-mini', 'claude-sonnet-4.5', 'claude-haiku-4.5', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3-flash']
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
