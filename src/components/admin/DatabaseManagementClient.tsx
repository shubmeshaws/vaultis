'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus,
    Database as DatabaseIcon,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Activity,
    Zap,
    Shield,
    Check,
    X,
    ChevronRight,
    ArrowLeft,
    Server,
    Globe,
    Cpu,
    Lock,
    Unlock,
    CheckCircle2,
    XCircle,
    RefreshCw,
    ChevronLeft,
    TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Portal } from '@/components/ui/Portal'
import { createDatabase, updateDatabase, deleteDatabase, testConnection, testConnectionById, toggleDatabaseLock } from '@/lib/actions/databaseActions'
import { useScrollLock } from '@/hooks/use-scroll-lock'
import { useToast } from '@/contexts/ToastContext'
import Image from 'next/image'

interface Database {
    id: string
    name: string
    description: string | null
    host: string | null
    port: number | null
    type: string | null
    environment: string | null
    username: string | null
    password: string | null
    databaseName: string | null
    connectionString: string | null
    version: string | null
    isLocked: boolean
    createdAt: Date
    updatedAt: Date
    _count?: {
        groups: number
    }
}

interface DatabaseManagementClientProps {
    initialDatabases: Database[]
}

const DB_TYPES = [
    { id: 'postgresql', name: 'PostgreSQL', logoPath: '/database-logos/postgresql.svg', color: 'bg-blue-500' },
    { id: 'mongodb', name: 'MongoDB', logoPath: '/database-logos/mongodb.svg', color: 'bg-green-500' },
    { id: 'mysql', name: 'MySQL', logoPath: '/database-logos/mysql.svg', color: 'bg-orange-500' },
    { id: 'redis', name: 'Redis', logoPath: '/database-logos/redis.svg', color: 'bg-red-500' },
]

interface ConnectionStatus {
    [key: string]: {
        connected: boolean
        latency: number | null
        lastChecked: Date
    }
}

export function DatabaseManagementClient({ initialDatabases }: DatabaseManagementClientProps) {
    const { toast } = useToast()
    const [databases, setDatabases] = useState(initialDatabases)
    const [searchQuery, setSearchQuery] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(null)
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({})
    const [testingConnection, setTestingConnection] = useState<{ [key: string]: boolean }>({})
    const [isLoading, setIsLoading] = useState(false)

    // Filter databases
    const filteredDatabases = databases.filter(db =>
        db.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        db.type?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Connection monitoring - check all databases every 10 seconds
    useEffect(() => {
        const checkConnections = async () => {
            for (const db of databases) {
                const result = await testConnectionById(db.id)
                setConnectionStatus(prev => ({
                    ...prev,
                    [db.id]: {
                        connected: result.success || false,
                        latency: result.latency || null,
                        lastChecked: new Date()
                    }
                }))
            }
        }

        // Initial check
        checkConnections()

        // Set up interval for periodic checks
        const interval = setInterval(checkConnections, 10000) // 10 seconds

        return () => clearInterval(interval)
    }, [databases])

    // Manual test connection
    const handleTestConnection = async (db: Database) => {
        setTestingConnection(prev => ({ ...prev, [db.id]: true }))
        const result = await testConnectionById(db.id)

        setConnectionStatus(prev => ({
            ...prev,
            [db.id]: {
                connected: result.success || false,
                latency: result.latency || null,
                lastChecked: new Date()
            }
        }))

        // Update local database state with newly fetched version
        if (result.success && result.version) {
            setDatabases(prevDatabases => 
                prevDatabases.map(d => 
                    d.id === db.id ? { ...d, version: result.version } : d
                )
            )
        }

        if (result.success) {
            toast({
                title: 'Connection successful',
                description: `Connected to ${db.name} in ${result.latency}ms`,
                type: 'success'
            })
        } else {
            toast({
                title: 'Connection failed',
                description: result.error || 'Unable to connect to database',
                type: 'error'
            })
        }

        setTestingConnection(prev => ({ ...prev, [db.id]: false }))
    }

    const handleAddSuccess = (newDb: Database) => {
        setDatabases([newDb, ...databases])
        setIsAddModalOpen(false)
        toast({ title: 'Database added successfully', type: 'success' })
    }

    const handleUpdateSuccess = (updatedDb: Database) => {
        setDatabases(databases.map(db => db.id === updatedDb.id ? updatedDb : db))
        setIsEditModalOpen(false)
        toast({ title: 'Database updated successfully', type: 'success' })
    }

    const handleDeleteSuccess = (id: string) => {
        setDatabases(databases.filter(db => db.id !== id))
        setIsDeleteModalOpen(false)
        toast({ title: 'Database deleted successfully', type: 'success' })
    }

    const handleToggleLock = async (db: Database) => {
        const newLockState = !db.isLocked
        const result = await toggleDatabaseLock(db.id, newLockState)
        if (result.success) {
            setDatabases(databases.map(d => d.id === db.id ? { ...d, isLocked: newLockState } : d))
            toast({ title: `Database ${newLockState ? 'locked' : 'unlocked'} successfully`, type: 'success' })
        } else {
            toast({ title: 'Failed to update lock status', description: result.error, type: 'error' })
        }
    }

    // Standardize stats for the overview
    const totalDatabases = databases.length
    const healthyDatabases = databases.length
    const totalGroups = databases.reduce((acc, db) => acc + (db._count?.groups || 0), 0)

    const statsEntries = [
        { label: 'Total Connections', value: totalDatabases.toString(), change: `ACROSS ${totalGroups} GROUPS`, icon: DatabaseIcon, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20' },
        { label: 'System Health', value: `${healthyDatabases}/${totalDatabases}`, change: 'ALL OPERATIONAL', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', pulse: true },
        { label: 'Avg Latency', value: '42ms', change: 'OPTIMIZED', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
        { label: 'Security Policy', value: 'Strict', change: 'ENFORCED', icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-500/5', border: 'border-indigo-500/20' },
    ]

    return (
        <div className="space-y-8 p-6 relative max-w-[1600px] mx-auto min-h-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-foreground/5 pb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin"
                        className="p-3 rounded-2xl bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-all border border-foreground/5"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 flex items-center gap-1.5 shadow-sm">
                                <Server className="w-3.5 h-3.5" />
                                Infrastructure
                            </div>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-50">/ Administration</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tighter text-foreground leading-tight">
                            Cluster <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500">Management</span>
                        </h1>
                        <p className="text-sm text-muted-foreground font-normal mt-2 max-w-xl">Configure connection strings, safety protocols, and access paradigms for the data fleet</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-14 md:self-end">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-primary/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Provision Database
                    </button>
                </div>
            </div>

            {/* Core Vitals */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statsEntries.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative p-6 rounded-[2rem] border backdrop-blur-3xl transition-all duration-500 bg-card border-foreground/10 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden flex flex-col justify-between"
                    >
                        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl", stat.bg)} />

                        <div className="relative z-10 flex justify-between items-start">
                            <div className={cn("p-4 rounded-2xl bg-background border transition-all duration-500 shadow-inner group-hover:scale-110", stat.border)}>
                                <stat.icon className={cn("w-6 h-6", stat.color, stat.pulse && "animate-pulse")} />
                            </div>
                            <div className={cn(
                                "px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-[0.15em] bg-background/50 backdrop-blur-md shadow-sm",
                                stat.color
                            )}>
                                {stat.change}
                            </div>
                        </div>

                        <div className="relative z-10 mt-6">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.25em] mb-1 opacity-70">{stat.label}</p>
                            <h3 className="text-3xl font-bold text-foreground tracking-tighter tabular-nums leading-none">
                                {stat.value}
                            </h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Database Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDatabases.map((db) => (
                    <Card
                        key={db.id}
                        className="bg-card/50 backdrop-blur-xl border-foreground/10 hover:border-foreground/20 transition-all shadow-sm group relative overflow-hidden"
                    >
                        <div className="absolute top-4 right-4 flex items-center gap-1 z-20">
                            <button
                                onClick={() => handleToggleLock(db)}
                                className={`p-2 rounded-lg transition-colors ${db.isLocked ? 'text-red-500 hover:bg-red-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'}`}
                                title={db.isLocked ? "Unlock Database" : "Lock Database"}
                            >
                                {db.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedDatabase(db)
                                    setIsEditModalOpen(true)
                                }}
                                className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedDatabase(db)
                                    setIsDeleteModalOpen(true)
                                }}
                                className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <CardHeader className="pb-3">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-2xl bg-white dark:bg-foreground/5 flex items-center justify-center">
                                    {DB_TYPES.find(type => type.id === db.type?.toLowerCase())?.logoPath ? (
                                        <Image
                                            src={DB_TYPES.find(type => type.id === db.type?.toLowerCase())!.logoPath}
                                            alt={db.type || 'Database'}
                                            width={48}
                                            height={48}
                                            className="object-contain"
                                        />
                                    ) : (
                                        <DatabaseIcon className="w-12 h-12 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 pr-12">
                                    <CardTitle className="text-xl font-bold truncate">{db.name}</CardTitle>
                                    <CardDescription className="text-xs font-bold uppercase tracking-widest mt-0.5">
                                        {db.type} • {db.version || 'v1.0'}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        {db.isLocked && (
                            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-red-500" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-red-500">Access Locked</span>
                                </div>
                            </div>
                        )}

                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <Server className="w-4 h-4" />
                                    <span className="font-mono">{db.host || 'localhost'}:{db.port || 5432}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <Globe className="w-4 h-4" />
                                    <span className="font-normal">Direct Connection</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <Shield className="w-4 h-4" />
                                    <span className="font-normal">{db._count?.groups || 0} Groups assigned</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-foreground/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {connectionStatus[db.id]?.connected ? (
                                        <>
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Connected</span>
                                        </>
                                    ) : connectionStatus[db.id]?.connected === false ? (
                                        <>
                                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Disconnected</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Checking...</span>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    {connectionStatus[db.id]?.latency && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Zap className="w-3.5 h-3.5" />
                                            <span>{connectionStatus[db.id].latency}ms</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleTestConnection(db)
                                        }}
                                        disabled={testingConnection[db.id]}
                                        className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                        title="Test Connection"
                                    >
                                        <RefreshCw className={`w-3 h-3 ${testingConnection[db.id] ? 'animate-spin' : ''}`} />
                                        Test
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {
                    filteredDatabases.length === 0 && (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4 bg-foreground/[0.02] border border-dashed border-foreground/10 rounded-3xl">
                            <div className="p-4 rounded-full bg-foreground/5">
                                <DatabaseIcon className="w-12 h-12 text-muted-foreground/20" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">No databases found</h3>
                                <p className="text-sm text-muted-foreground">Try adjusting your search or add a new connection</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
                            >
                                Provision New Database
                            </button>
                        </div>
                    )
                }
            </div >

            {/* Modals */}
            < AddDatabaseModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddSuccess}
            />

            {selectedDatabase && (
                <>
                    <EditDatabaseModal
                        isOpen={isEditModalOpen}
                        database={selectedDatabase}
                        onClose={() => setIsEditModalOpen(false)}
                        onSuccess={handleUpdateSuccess}
                    />
                    <DeleteDatabaseModal
                        isOpen={isDeleteModalOpen}
                        database={selectedDatabase}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onSuccess={() => handleDeleteSuccess(selectedDatabase.id)}
                    />
                </>
            )}
        </div>
    )
}

function AddDatabaseModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: (db: Database) => void }) {
    const { toast } = useToast()
    const [step, setStep] = useState(1)
    const [selectedType, setSelectedType] = useState<string | null>(null)
    const [connectionMode, setConnectionMode] = useState<'fields' | 'string'>('fields')
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        environment: '',
        host: '',
        port: '',
        username: '',
        password: '',
        databaseName: '',
        connectionString: '',
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isTesting, setIsTesting] = useState(false)

    useScrollLock(isOpen)

    const handleNext = () => {
        if (step === 1 && selectedType) {
            // Set default port based on engine
            const defaultPorts: Record<string, string> = {
                'PostgreSQL': '5432',
                'MySQL': '3306',
                'MongoDB': '27017',
                'Redis': '6379'
            }
            if (!formData.port) {
                setFormData(prev => ({ ...prev, port: defaultPorts[selectedType] || '' }))
            }
            setStep(2)
        }
        else if (step === 2) setStep(3)
    }

    const handleBack = () => {
        if (step === 2) setStep(1)
        else if (step === 3) setStep(2)
    }

    const handleTestConnection = async () => {
        setIsTesting(true)
        const result = await testConnection({
            host: formData.host,
            port: formData.port ? parseInt(formData.port) : undefined,
            type: selectedType!,
            username: formData.username,
            password: formData.password,
            connectionString: connectionMode === 'string' ? formData.connectionString : undefined,
        })

        if (result.success) {
            toast({ title: 'Success', description: result.message, type: 'success' })
        } else {
            toast({ title: 'Connection Failed', description: result.error, type: 'error' })
        }
        setIsTesting(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedType) return

        setIsLoading(true)
        const result = await createDatabase({
            ...formData,
            port: formData.port ? parseInt(formData.port) : undefined,
            type: selectedType,
            connectionString: connectionMode === 'string' ? formData.connectionString : undefined,
        })

        if (result.success && result.database) {
            onSuccess(result.database as any)
            setFormData({ name: '', description: '', environment: '', host: '', port: '', username: '', password: '', databaseName: '', connectionString: '' })
            setSelectedType(null)
            setConnectionMode('fields')
            setStep(1)
        } else {
            toast({ title: 'Operation failed', description: result.error || 'Failed to create database', type: 'error' })
        }
        setIsLoading(false)
    }

    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-xl bg-background border border-foreground/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                            style={{ zoom: 0.9 }}
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-foreground/5 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[8px] font-bold uppercase tracking-widest text-primary">
                                            Step {step} of 3
                                        </div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">New Connection</p>
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                        {step === 1 ? 'Select Engine' : step === 2 ? 'General Info' : 'Connection Details'}
                                    </h2>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-xl transition-colors">
                                    <X className="w-6 h-6 text-muted-foreground" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col">
                                <div className="p-8 space-y-6">
                                    {step === 1 ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            {DB_TYPES.map((type) => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setSelectedType(type.name)}
                                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 text-center group ${selectedType === type.name
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-foreground/5 bg-foreground/[0.02] hover:border-foreground/20'
                                                        }`}
                                                >
                                                    <div className="p-4 rounded-2xl bg-white dark:bg-foreground/5 group-hover:scale-110 transition-transform flex items-center justify-center">
                                                        <Image
                                                            src={type.logoPath}
                                                            alt={type.name}
                                                            width={40}
                                                            height={40}
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-sm">{type.name}</h3>
                                                        <p className="text-[10px] text-muted-foreground mt-1">Managed instance</p>
                                                    </div>
                                                    {selectedType === type.name && (
                                                        <div className="absolute top-3 right-3 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                                                            <Check className="w-3 h-3" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ) : step === 2 ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2 col-span-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Name of Database</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        placeholder="e.g. Production PostgreSQL"
                                                        className="w-full h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                                    />
                                                </div>
                                                <div className="space-y-2 col-span-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Environment Name</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={formData.environment}
                                                        onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                                                        placeholder="e.g. Production, Staging, Development"
                                                        className="w-full h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                                    />
                                                </div>
                                                <div className="space-y-2 col-span-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Description</label>
                                                    <textarea
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        placeholder="Primary analytics database for marketing team"
                                                        className="w-full h-24 p-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 resize-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {selectedType === 'MongoDB' && (
                                                <div className="flex p-1 bg-foreground/5 rounded-xl border border-foreground/10 mb-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setConnectionMode('fields')}
                                                        className={cn(
                                                            "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                                            connectionMode === 'fields' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        Standard Fields
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setConnectionMode('string')}
                                                        className={cn(
                                                            "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                                            connectionMode === 'string' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        Connection String
                                                    </button>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-4">
                                                {connectionMode === 'string' && selectedType === 'MongoDB' ? (
                                                    <div className="space-y-2 col-span-2 text-left">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">MongoDB Connection String</label>
                                                        <textarea
                                                            required
                                                            value={formData.connectionString}
                                                            onChange={(e) => setFormData({ ...formData, connectionString: e.target.value })}
                                                            placeholder="mongodb+srv://user:pass@cluster.mongodb.net/dbname"
                                                            className="w-full h-32 p-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 resize-none font-mono"
                                                        />
                                                        <p className="text-[10px] text-muted-foreground pl-1 italic">
                                                            Note: Using a connection string will override individual field values.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="space-y-2 col-span-2 md:col-span-1 text-left">
                                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Hostname</label>
                                                            <input
                                                                required={connectionMode === 'fields'}
                                                                type="text"
                                                                value={formData.host}
                                                                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                                                placeholder={selectedType === 'MongoDB' ? 'cluster0.mongodb.net' : 'db.example.com'}
                                                                className="w-full h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                                            />
                                                        </div>
                                                        <div className="space-y-2 col-span-2 md:col-span-1 text-left">
                                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Port</label>
                                                            <input
                                                                required={connectionMode === 'fields'}
                                                                type="number"
                                                                value={formData.port}
                                                                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                                                                placeholder={selectedType === 'PostgreSQL' ? '5432' : selectedType === 'MySQL' ? '3306' : selectedType === 'MongoDB' ? '27017' : '6379'}
                                                                className="w-full h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                                            />
                                                        </div>
                                                        <div className="space-y-2 col-span-2 md:col-span-1 text-left">
                                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Username</label>
                                                            <input
                                                                required={connectionMode === 'fields' && selectedType !== 'Redis'}
                                                                type="text"
                                                                value={formData.username}
                                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                                placeholder={selectedType === 'PostgreSQL' ? 'postgres' : selectedType === 'MySQL' ? 'root' : 'admin'}
                                                                className="w-full h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                                            />
                                                        </div>
                                                        <div className="space-y-2 col-span-2 md:col-span-1 text-left">
                                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Password</label>
                                                            <input
                                                                required={connectionMode === 'fields'}
                                                                type="password"
                                                                value={formData.password}
                                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                                placeholder="••••••••"
                                                                className="w-full h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                                            />
                                                        </div>
                                                        <div className="space-y-2 col-span-2 text-left">
                                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Database Name</label>
                                                            <input
                                                                type="text"
                                                                value={formData.databaseName}
                                                                onChange={(e) => setFormData({ ...formData, databaseName: e.target.value })}
                                                                placeholder={selectedType === 'PostgreSQL' ? 'postgres' : 'main_db'}
                                                                className="w-full h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                                <div className="col-span-2 pt-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleTestConnection}
                                                        disabled={isTesting}
                                                        className="w-full h-10 border border-primary/20 bg-primary/5 text-primary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        {isTesting ? (
                                                            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Zap className="w-3 h-3" />
                                                        )}
                                                        {isTesting ? 'Attempting Connection...' : 'Test Connection'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 border-t border-foreground/5 flex items-center gap-4">
                                    {step > 1 && (
                                        <button
                                            type="button"
                                            onClick={handleBack}
                                            className="flex-1 h-14 bg-foreground/5 text-foreground rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-foreground/10 transition-all flex items-center justify-center gap-2"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Prev
                                        </button>
                                    )}
                                    <button
                                        type={step === 3 ? 'submit' : 'button'}
                                        onClick={step < 3 ? handleNext : undefined}
                                        disabled={isLoading || (step === 1 && !selectedType)}
                                        className="flex-[2] h-14 bg-primary text-primary-foreground rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? 'Processing...' : step === 3 ? 'Register Database' : 'Continue'}
                                        {step < 3 && !isLoading && <ChevronRight className="w-4 h-4" />}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Portal>
    )
}

function EditDatabaseModal({ isOpen, database, onClose, onSuccess }: { isOpen: boolean, database: Database, onClose: () => void, onSuccess: (db: Database) => void }) {
    const { toast } = useToast()
    const [connectionMode, setConnectionMode] = useState<'fields' | 'string'>((database as any).connectionString ? 'string' : 'fields')
    const [formData, setFormData] = useState({
        name: database.name,
        description: database.description || '',
        environment: database.environment || '',
        host: database.host || '',
        port: database.port?.toString() || '',
        username: database.username || '',
        password: database.password || '',
        databaseName: database.databaseName || '',
        connectionString: (database as any).connectionString || '',
        type: database.type || 'PostgreSQL'
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isTesting, setIsTesting] = useState(false)

    // Manual test connection
    const handleTestConnection = async () => {
        setIsTesting(true)
        const result = await testConnection({
            host: formData.host,
            port: formData.port ? parseInt(formData.port) : undefined,
            type: formData.type || 'PostgreSQL',
            username: formData.username,
            password: formData.password || undefined,
            databaseName: formData.databaseName || undefined,
            connectionString: connectionMode === 'string' ? formData.connectionString : undefined,
        })

        if (result.success) {
            toast({
                title: 'Connection successful',
                description: `Connected in ${result.latency}ms`,
                type: 'success'
            })
        } else {
            toast({
                title: 'Connection failed',
                description: result.error || 'Unable to connect',
                type: 'error'
            })
        }
        setIsTesting(false)
    }

    useScrollLock(isOpen)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const result = await updateDatabase(database.id, {
            ...formData,
            port: formData.port ? parseInt(formData.port) : undefined,
            connectionString: connectionMode === 'string' ? formData.connectionString : undefined,
        })

        if (result.success && result.database) {
            onSuccess(result.database as any)
        } else {
            toast({ title: 'Operation failed', description: result.error || 'Failed to update database', type: 'error' })
        }
        setIsLoading(false)
    }

    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl bg-background border border-foreground/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                            style={{ zoom: 0.9 }}
                        >
                            <div className="p-8 border-b border-foreground/5 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Configure Engine</p>
                                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Edit Settings</h2>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-xl transition-colors">
                                    <X className="w-6 h-6 text-muted-foreground" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col">
                                <div className="p-8 grid grid-cols-2 gap-8">
                                    {/* Left Column: Basic Info */}
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50">Details</h3>
                                            <div className="grid gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Display Name</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full h-11 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Database Name</label>
                                                    <input
                                                        type="text"
                                                        value={formData.databaseName}
                                                        onChange={(e) => setFormData({ ...formData, databaseName: e.target.value })}
                                                        placeholder="Defaults to postgres"
                                                        className="w-full h-11 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Environment</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={formData.environment}
                                                        onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                                                        className="w-full h-11 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Description</label>
                                                    <textarea
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        className="w-full h-24 p-3 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 resize-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Connection Info */}
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50">Connection</h3>
                                                {formData.type === 'MongoDB' && (
                                                    <div className="flex p-0.5 bg-foreground/5 rounded-lg border border-foreground/10">
                                                        <button
                                                            type="button"
                                                            onClick={() => setConnectionMode('fields')}
                                                            className={cn(
                                                                "px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all",
                                                                connectionMode === 'fields' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                                            )}
                                                        >
                                                            Fields
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setConnectionMode('string')}
                                                            className={cn(
                                                                "px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all",
                                                                connectionMode === 'string' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                                            )}
                                                        >
                                                            String
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid gap-4">
                                                {connectionMode === 'string' && formData.type === 'MongoDB' ? (
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">MongoDB Connection String</label>
                                                        <textarea
                                                            required
                                                            value={formData.connectionString}
                                                            onChange={(e) => setFormData({ ...formData, connectionString: e.target.value })}
                                                            placeholder="mongodb+srv://user:pass@cluster.mongodb.net/dbname"
                                                            className="w-full h-40 p-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 resize-none font-mono"
                                                        />
                                                        <p className="text-[10px] text-muted-foreground pl-1 italic">
                                                            Using a connection string overrides individual fields.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="grid grid-cols-3 gap-4 text-left">
                                                            <div className="space-y-2 col-span-2">
                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Hostname</label>
                                                                <input
                                                                    required={connectionMode === 'fields'}
                                                                    type="text"
                                                                    value={formData.host}
                                                                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                                                    className="w-full h-11 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                                                />
                                                            </div>
                                                            <div className="space-y-2 text-left">
                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Port</label>
                                                                <input
                                                                    required={connectionMode === 'fields'}
                                                                    type="number"
                                                                    value={formData.port}
                                                                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                                                                    className="w-full h-11 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2 text-left">
                                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Username</label>
                                                            <input
                                                                required={connectionMode === 'fields' && formData.type !== 'Redis'}
                                                                type="text"
                                                                value={formData.username}
                                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                                className="w-full h-11 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                                            />
                                                        </div>
                                                        <div className="space-y-2 text-left">
                                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Password</label>
                                                            <input
                                                                type="password"
                                                                value={formData.password}
                                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                                placeholder="Leave empty to keep current"
                                                                className="w-full h-11 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 border-t border-foreground/5 bg-foreground/[0.02] flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={handleTestConnection}
                                        disabled={isTesting || isLoading}
                                        className="px-6 py-2.5 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                                        {isTesting ? 'Testing...' : 'Test Connection'}
                                    </button>

                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-6 py-2.5 rounded-xl font-bold text-sm text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-8 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Portal>
    )
}

function DeleteDatabaseModal({ isOpen, database, onClose, onSuccess }: { isOpen: boolean, database: Database, onClose: () => void, onSuccess: () => void }) {
    const { toast } = useToast()
    const [confirmName, setConfirmName] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useScrollLock(isOpen)

    React.useEffect(() => {
        if (isOpen) {
            setConfirmName('')
        }
    }, [isOpen, database])

    const handleDelete = async () => {
        if (confirmName !== database.name) return

        setIsLoading(true)
        const result = await deleteDatabase(database.id)
        if (result.success) {
            onSuccess()
        } else {
            toast({ title: 'Operation failed', description: result.error || 'Failed to delete database', type: 'error' })
        }
        setIsLoading(false)
    }

    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-background border border-red-500/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                            style={{ zoom: 0.9 }}
                        >
                            <div className="p-8 border-b border-red-500/5 bg-red-500/5 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-red-500">
                                    <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <Trash2 className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-bold tracking-tight">Decommission Database</h2>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-xl transition-colors">
                                    <X className="w-6 h-6 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    You are about to permanently disconnect <span className="font-bold text-foreground">{database.name}</span>.
                                    This will revoke access for all associated groups and users. This action is <span className="text-red-500 font-bold">irreversible</span>.
                                </p>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">
                                        Type <span className="text-foreground">&quot;{database.name}&quot;</span> to confirm termination
                                    </label>
                                    <input
                                        type="text"
                                        value={confirmName}
                                        onChange={(e) => setConfirmName(e.target.value)}
                                        placeholder="Confirm database name"
                                        className="w-full h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-red-500/50"
                                    />
                                </div>
                            </div>

                            <div className="p-8 border-t border-foreground/5 flex gap-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 h-12 bg-foreground/5 text-foreground rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-foreground/10 transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    disabled={confirmName !== database.name || isLoading}
                                    onClick={handleDelete}
                                    className="flex-[2] h-12 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-500 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Processing...' : 'Delete Connection'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Portal>
    )
}
