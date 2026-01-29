'use client'

import React, { useState } from 'react'
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
    Cpu
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Portal } from '@/components/ui/Portal'
import { createDatabase, updateDatabase, deleteDatabase, testConnection } from '@/lib/actions/databaseActions'
import { useScrollLock } from '@/hooks/use-scroll-lock'
import { useToast } from '@/contexts/ToastContext'

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
    { id: 'postgresql', name: 'PostgreSQL', logoPath: '/logos/postgresql.svg', color: 'bg-blue-500' },
    { id: 'mongodb', name: 'MongoDB', logoPath: '/logos/mongodb.svg', color: 'bg-green-500' },
    { id: 'mysql', name: 'MySQL', logoPath: '/logos/mysql.svg', color: 'bg-orange-500' },
    { id: 'redis', name: 'Redis', logoPath: '/logos/redis.svg', color: 'bg-red-500' },
]

export function DatabaseManagementClient({ initialDatabases }: DatabaseManagementClientProps) {
    const { toast } = useToast()
    const [databases, setDatabases] = useState(initialDatabases)
    const [searchQuery, setSearchQuery] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Filter databases
    const filteredDatabases = databases.filter(db =>
        db.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        db.type?.toLowerCase().includes(searchQuery.toLowerCase())
    )

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

    return (
        <div className="space-y-8">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search registry..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all"
                    />
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full md:w-auto h-11 px-6 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Provision Database
                </button>
            </div>

            {/* Database Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDatabases.map((db) => (
                    <Card
                        key={db.id}
                        className="bg-card/50 backdrop-blur-xl border-foreground/10 hover:border-foreground/20 transition-all shadow-sm group relative overflow-hidden"
                    >
                        <div className="absolute top-4 right-4 flex items-center gap-1">
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
                                <div className={`p-3 rounded-2xl ${db.type?.toLowerCase() === 'postgresql' ? 'bg-blue-500/10 text-blue-500' :
                                    db.type?.toLowerCase() === 'mongodb' ? 'bg-green-500/10 text-green-500' :
                                        db.type?.toLowerCase() === 'mysql' ? 'bg-orange-500/10 text-orange-500' :
                                            'bg-red-500/10 text-red-500'
                                    }`}>
                                    <DatabaseIcon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0 pr-12">
                                    <CardTitle className="text-xl font-black truncate">{db.name}</CardTitle>
                                    <CardDescription className="text-xs font-bold uppercase tracking-widest mt-0.5">
                                        {db.type} • v15.2
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <Server className="w-4 h-4" />
                                    <span className="font-mono">{db.host || 'localhost'}:{db.port || 5432}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <Globe className="w-4 h-4" />
                                    <span className="font-medium">Direct Connection</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <Shield className="w-4 h-4" />
                                    <span className="font-medium">{db._count?.groups || 0} Groups assigned</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-foreground/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Operational</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Zap className="w-3.5 h-3.5" />
                                    <span>45ms latency</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredDatabases.length === 0 && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4 bg-foreground/[0.02] border border-dashed border-foreground/10 rounded-3xl">
                        <div className="p-4 rounded-full bg-foreground/5">
                            <DatabaseIcon className="w-12 h-12 text-muted-foreground/20" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground">No databases found</h3>
                            <p className="text-sm text-muted-foreground">Try adjusting your search or add a new connection</p>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                        >
                            Provision New Database
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddDatabaseModal
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
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        environment: '',
        host: '',
        port: '',
        username: '',
        password: '',
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
            password: formData.password
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
            type: selectedType
        })

        if (result.success && result.database) {
            onSuccess(result.database as any)
            setFormData({ name: '', description: '', environment: '', host: '', port: '', username: '', password: '' })
            setSelectedType(null)
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
                                        <div className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[8px] font-black uppercase tracking-widest text-primary">
                                            Step {step} of 3
                                        </div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">New Connection</p>
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight text-foreground">
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
                                                    <div className={`p-4 rounded-2xl ${type.color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                                                        <DatabaseIcon className={`w-8 h-8 ${type.color.replace('bg-', 'text-')}`} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-sm">{type.name}</h3>
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
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Name of Database</label>
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
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Environment Name</label>
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
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Description</label>
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
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2 col-span-2 md:col-span-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Hostname</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={formData.host}
                                                        onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                                        placeholder={selectedType === 'MongoDB' ? 'cluster0.mongodb.net' : 'db.example.com'}
                                                        className="w-full h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                                    />
                                                </div>
                                                <div className="space-y-2 col-span-2 md:col-span-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Port</label>
                                                    <input
                                                        required
                                                        type="number"
                                                        value={formData.port}
                                                        onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                                                        placeholder={selectedType === 'PostgreSQL' ? '5432' : selectedType === 'MySQL' ? '3306' : selectedType === 'MongoDB' ? '27017' : '6379'}
                                                        className="w-full h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                                    />
                                                </div>
                                                <div className="space-y-2 col-span-2 md:col-span-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Username</label>
                                                    <input
                                                        required={selectedType !== 'Redis'}
                                                        type="text"
                                                        value={formData.username}
                                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                        placeholder={selectedType === 'PostgreSQL' ? 'postgres' : selectedType === 'MySQL' ? 'root' : 'admin'}
                                                        className="w-full h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                                    />
                                                </div>
                                                <div className="space-y-2 col-span-2 md:col-span-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Password</label>
                                                    <input
                                                        required
                                                        type="password"
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                        placeholder="••••••••"
                                                        className="w-full h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                                    />
                                                </div>
                                                <div className="col-span-2 pt-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleTestConnection}
                                                        disabled={isTesting}
                                                        className="w-full h-10 border border-primary/20 bg-primary/5 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
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
                                            className="flex-1 h-14 bg-foreground/5 text-foreground rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-foreground/10 transition-all flex items-center justify-center gap-2"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Prev
                                        </button>
                                    )}
                                    <button
                                        type={step === 3 ? 'submit' : 'button'}
                                        onClick={step < 3 ? handleNext : undefined}
                                        disabled={isLoading || (step === 1 && !selectedType)}
                                        className="flex-[2] h-14 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
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
    const [formData, setFormData] = useState({
        name: database.name,
        description: database.description || '',
        environment: database.environment || '',
        host: database.host || '',
        port: database.port?.toString() || '',
        username: database.username || '',
        password: database.password || '',
        type: database.type || 'PostgreSQL'
    })
    const [isLoading, setIsLoading] = useState(false)

    useScrollLock(isOpen)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const result = await updateDatabase(database.id, {
            ...formData,
            port: formData.port ? parseInt(formData.port) : undefined,
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
                            className="relative w-full max-w-xl bg-background border border-foreground/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                            style={{ zoom: 0.9 }}
                        >
                            <div className="p-8 border-b border-foreground/5 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Configure Engine</p>
                                    <h2 className="text-2xl font-black tracking-tight text-foreground">Edit Settings</h2>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-xl transition-colors">
                                    <X className="w-6 h-6 text-muted-foreground" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col">
                                <div className="p-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Display Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Environment</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.environment}
                                                onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                                                className="w-full h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Hostname</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.host}
                                                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                                className="w-full h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Port</label>
                                            <input
                                                required
                                                type="number"
                                                value={formData.port}
                                                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                                                className="w-full h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Username</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                className="w-full h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Password</label>
                                            <input
                                                required
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Database Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 appearance-none"
                                            >
                                                <option value="PostgreSQL">PostgreSQL</option>
                                                <option value="MySQL">MySQL</option>
                                                <option value="MongoDB">MongoDB</option>
                                                <option value="Redis">Redis</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full h-24 p-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 border-t border-foreground/5">
                                    <button
                                        disabled={isLoading}
                                        className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? 'Saving Changes...' : 'Apply Modifications'}
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
                                    <h2 className="text-xl font-black tracking-tight">Decommission Database</h2>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-xl transition-colors">
                                    <X className="w-6 h-6 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    You are about to permanently disconnect <span className="font-black text-foreground">{database.name}</span>.
                                    This will revoke access for all associated groups and users. This action is <span className="text-red-500 font-bold">irreversible</span>.
                                </p>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">
                                        Type <span className="text-foreground">"{database.name}"</span> to confirm termination
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
                                    className="flex-1 h-12 bg-foreground/5 text-foreground rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-foreground/10 transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    disabled={confirmName !== database.name || isLoading}
                                    onClick={handleDelete}
                                    className="flex-[2] h-12 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
