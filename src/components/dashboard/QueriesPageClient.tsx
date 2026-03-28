'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { QueryEditor } from '@/components/editor/QueryEditor'
import { QueryStatusPanel } from '@/components/dashboard/QueryStatusPanel'
import { QueryResultsTable } from '@/components/dashboard/QueryResultsTable'
import { SavedQueriesPanel } from '@/components/dashboard/SavedQueriesPanel'
import { Sparkles, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useDatabase } from '@/contexts/DatabaseContext'
import { executeQuery, saveQuery, getSavedQueries, deleteSavedQuery, toggleFavoriteQuery, getQueryHistory } from '@/lib/actions/queryActions'
import { listDatabases } from '@/lib/actions/databaseActions'
import { useToast } from '@/contexts/ToastContext'
import { InputModal } from '@/components/ui/InputModal'
import { SimpleConfirmationModal } from '@/components/ui/SimpleConfirmationModal'

type TabType = 'editor' | 'saved' | 'history'

export function QueriesPageClient() {
    const { toast } = useToast()
    const { selectedDb } = useDatabase()
    const searchParams = useSearchParams()
    const router = useRouter()
    const activeTab = (searchParams.get('tab') as TabType) || 'editor'

    const [queryResults, setQueryResults] = useState<{
        data: any[]
        columns: { key: string, label: string }[]
        totalRows: number
        executionTime: string
        status: 'idle' | 'loading' | 'success' | 'error'
        message: string
        sql: string
    }>({
        data: [],
        columns: [],
        totalRows: 0,
        executionTime: '0ms',
        status: 'idle',
        message: '',
        sql: ''
    })

    const [savedQueries, setSavedQueries] = useState<any[]>([])
    const [history, setHistory] = useState<any[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
    const [pendingSaveQuery, setPendingSaveQuery] = useState('')
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [queryToDelete, setQueryToDelete] = useState<string | null>(null)
    const activeQueryRef = useRef<boolean>(false)
    
    // Database selection overrides
    const [availableDatabases, setAvailableDatabases] = useState<string[]>([])
    const [selectedDbOverride, setSelectedDbOverride] = useState<string>('')

    const fetchSavedQueries = useCallback(async () => {
        const result = await getSavedQueries()
        if (result.success) setSavedQueries(result.queries || [])
    }, [])

    const fetchHistory = useCallback(async () => {
        const result = await getQueryHistory()
        if (result.success) setHistory(result.history || [])
    }, [])

    useEffect(() => {
        if (activeTab === 'saved') fetchSavedQueries()
        if (activeTab === 'history') fetchHistory()
    }, [activeTab, fetchSavedQueries, fetchHistory])

    useEffect(() => {
        if (selectedDb) {
            setSelectedDbOverride((selectedDb as any).databaseName || '')
            const dbType = selectedDb.type?.toLowerCase()
            if (['mongodb', 'mongo', 'postgresql', 'postgres', 'mysql'].includes(dbType || '')) {
                listDatabases(selectedDb.id).then(res => {
                    if (res.success) {
                        setAvailableDatabases(res.databases || [])
                    }
                })
            } else {
                setAvailableDatabases([])
            }
        } else {
            setAvailableDatabases([])
            setSelectedDbOverride('')
        }
    }, [selectedDb])

    const handleCancelQuery = () => {
        if (activeQueryRef.current) {
            activeQueryRef.current = false
            setQueryResults(prev => ({
                ...prev,
                status: 'idle',
                message: 'Query execution cancelled.'
            }))
            toast({ title: 'Query cancelled', description: 'Execution stopped by user.', type: 'info' })
        }
    }

    const handleRunQuery = async (query: string) => {
        if (!selectedDb) {
            toast({ title: 'No database selected', type: 'error' })
            return
        }

        activeQueryRef.current = true
        setQueryResults(prev => ({ ...prev, status: 'loading', sql: query }))

        try {
            const result = await executeQuery(selectedDb.id, query, selectedDbOverride)

            // Check if cancelled
            if (!activeQueryRef.current) {
                return // Ignore result
            }
            activeQueryRef.current = false

            if (result.success) {
                setQueryResults({
                    data: result.data || [],
                    columns: result.columns || [],
                    totalRows: result.totalRows || 0,
                    executionTime: result.executionTime || '0ms',
                    status: 'success',
                    message: 'Query executed successfully.',
                    sql: query
                })
            } else {
                setQueryResults(prev => ({
                    ...prev,
                    status: 'error',
                    message: result.error || 'Failed to execute query'
                }))
                toast({ title: 'Query failed', description: result.error, type: 'error' })
            }
        } catch (err: any) {
            console.error('An unexpected error occurred:', err)
            setQueryResults(prev => ({
                ...prev,
                status: 'error',
                message: 'An unexpected error occurred. Please try again.'
            }))
            toast({ title: 'Application Error', description: err.message || 'Something went wrong', type: 'error' })
        }
    }

    const handleSaveQueryRequest = (query: string) => {
        if (!selectedDb) {
            toast({ title: 'No database selected', type: 'error' })
            return
        }
        setPendingSaveQuery(query)
        setIsSaveModalOpen(true)
    }

    const handleConfirmSaveQuery = async (name: string) => {
        setIsSaving(true)
        const result = await saveQuery(selectedDb!.id, name, pendingSaveQuery)
        setIsSaving(false)
        setIsSaveModalOpen(false)

        if (result.success) {
            toast({ title: 'Query saved', type: 'success' })
            fetchSavedQueries()
        } else {
            toast({ title: 'Failed to save query', description: result.error, type: 'error' })
        }
    }

    const handleDeleteSavedRequest = (id: string) => {
        setQueryToDelete(id)
        setIsDeleteModalOpen(true)
    }

    const handleConfirmDeleteSaved = async () => {
        if (!queryToDelete) return

        const res = await deleteSavedQuery(queryToDelete)
        setIsDeleteModalOpen(false)
        setQueryToDelete(null)

        if (res.success) {
            toast({ title: 'Deleted successfully', type: 'success' })
            fetchSavedQueries()
        } else {
            toast({ title: 'Failed to delete', description: res.error, type: 'error' })
        }
    }

    const handleToggleFavorite = async (id: string, current: boolean) => {
        const res = await toggleFavoriteQuery(id, !current)
        if (res.success) {
            fetchSavedQueries()
        }
    }

    const handleShareQuery = (query: string) => {
        const url = `${window.location.origin}/queries?q=${encodeURIComponent(query)}`
        navigator.clipboard.writeText(url).then(() => {
            toast({ title: 'Share link copied!', description: 'Anyone with access can view this query.', type: 'success' })
        })
    }

    const setActiveTab = (tab: TabType) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', tab)
        router.push(`/queries?${params.toString()}`)
    }

    return (
        <div className="space-y-6 p-2 lg:p-4 min-h-full">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                {selectedDb?.type?.toUpperCase() || 'DB'} Runner
                            </div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Database Tool</p>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tighter text-foreground leading-tight">
                            {selectedDb?.type?.toUpperCase() || 'Query'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500">Explorer</span>
                        </h1>
                        <p className="text-sm text-muted-foreground font-normal mt-1">
                            Run and save your {selectedDb?.type || 'database'} queries
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-foreground/5 p-1 rounded-xl md:mt-16">
                    <button
                        onClick={() => setActiveTab('editor')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'editor'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Editor
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'saved'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Saved
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'history'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        History
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'editor' && (
                <div className="space-y-6">
                    <div className="grid lg:grid-cols-4 gap-6">
                        {/* Main Workspace */}
                        <div className="lg:col-span-3">
                            <QueryEditor
                                onRun={handleRunQuery}
                                onSave={handleSaveQueryRequest}
                                onShare={handleShareQuery}
                                onCancel={handleCancelQuery}
                                availableDatabases={availableDatabases}
                                selectedDatabase={selectedDbOverride}
                                onDatabaseChange={setSelectedDbOverride}
                            />
                        </div>

                        {/* Sidecar (Status) */}
                        <div className="lg:col-span-1">
                            {/* Status Panel */}
                            <QueryStatusPanel stats={{
                                status: queryResults.status === 'loading' ? 'running' : (queryResults.status === 'idle' ? 'idle' : queryResults.status as any),
                                executionTime: queryResults.executionTime,
                                rowsAffected: queryResults.totalRows,
                                dataSize: 'N/A',
                                message: queryResults.message || (queryResults.status === 'loading' ? 'Executing query...' : 'Ready to execute query.')
                            }} />
                        </div>
                    </div>

                    {/* Results Area */}
                    <QueryResultsTable
                        columns={queryResults.columns.length > 0 ? queryResults.columns : [
                            { key: 'empty', label: 'No Results', width: 200 }
                        ]}
                        data={queryResults.data}
                        totalRows={queryResults.totalRows}
                        executionTime={queryResults.executionTime}
                        sql={queryResults.sql}
                    />
                </div>
            )}

            {activeTab === 'saved' && (
                <SavedQueriesPanel
                    queries={savedQueries.map(q => ({
                        id: q.id,
                        name: q.name,
                        query: q.sql,
                        database: q.database.name,
                        lastExecuted: new Date(q.updatedAt).toLocaleString(),
                        isFavorite: q.isFavorite
                    }))}
                    onDelete={handleDeleteSavedRequest}
                    onToggleFavorite={handleToggleFavorite}
                    onRun={(query: string) => {
                        setActiveTab('editor')
                        handleRunQuery(query)
                    }}
                    onEdit={(query: string) => {
                        setActiveTab('editor')
                        // Just switch tab and populate editor via URL param (handled by QueryEditor potentially, or we force it here)
                        // A better way is to set URL which controls state
                        const params = new URLSearchParams(searchParams.toString())
                        params.set('q', query)
                        router.push(`?${params.toString()}`)
                    }}
                />
            )}

            {activeTab === 'history' && (
                <div className="space-y-4">
                    {history.length > 0 ? (
                        <div className="grid gap-4">
                            {history.map((h) => (
                                <div key={h.id} className="p-4 rounded-2xl bg-card border border-foreground/5 flex justify-between items-center">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                                                h.status === 'success' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                            )}>
                                                {h.status}
                                            </span>
                                            <span className="text-xs font-bold text-foreground/70">{h.database.name}</span>
                                            <span className="text-[10px] text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</span>
                                        </div>
                                        <code className="text-xs text-muted-foreground block font-mono bg-foreground/5 p-1 rounded max-w-xl truncate">
                                            {h.sql}
                                        </code>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-foreground">{h.executionTime}</p>
                                        <p className="text-[10px] text-muted-foreground">{h.rowsAffected} rows</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-4 rounded-2xl bg-foreground/[0.02] border border-foreground/5">
                            <p className="text-sm font-normal text-muted-foreground">No History</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                                Your executed queries will appear here.
                            </p>
                        </div>
                    )}
                </div>
            )}
            <InputModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onConfirm={handleConfirmSaveQuery}
                title="Save Query"
                description="Give your query a descriptive name to easily find it later."
                placeholder="e.g. Monthly Revenue Report"
                confirmText={isSaving ? "Saving..." : "Save Query"}
            />

            <SimpleConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDeleteSaved}
                title="Delete Saved Query"
                description="Are you sure you want to delete this query? This action cannot be undone."
                type="danger"
                confirmText="Delete Query"
            />
        </div>
    )
}
