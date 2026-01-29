'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { QueryEditor } from '@/components/editor/QueryEditor'
import { QueryStatusPanel } from '@/components/dashboard/QueryStatusPanel'
import { QueryResultsTable } from '@/components/dashboard/QueryResultsTable'
import { SavedQueriesPanel } from '@/components/dashboard/SavedQueriesPanel'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSearchParams, useRouter } from 'next/navigation'
import { useDatabase } from '@/contexts/DatabaseContext'
import { executeQuery, saveQuery, getSavedQueries, deleteSavedQuery, toggleFavoriteQuery, getQueryHistory } from '@/lib/actions/queryActions'
import { useToast } from '@/contexts/ToastContext'

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
    const activeQueryRef = useRef<boolean>(false)

    const fetchSavedQueries = useCallback(async () => {
        const result = await getSavedQueries()
        if (result.success) setSavedQueries(result.queries)
    }, [])

    const fetchHistory = useCallback(async () => {
        const result = await getQueryHistory()
        if (result.success) setHistory(result.history)
    }, [])

    useEffect(() => {
        if (activeTab === 'saved') fetchSavedQueries()
        if (activeTab === 'history') fetchHistory()
    }, [activeTab, fetchSavedQueries, fetchHistory])

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
            const result = await executeQuery(selectedDb.id, query)

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

    const handleSaveQuery = async (query: string) => {
        if (!selectedDb) {
            toast({ title: 'No database selected', type: 'error' })
            return
        }
        setIsSaving(true)
        const name = prompt('Enter a name for this query:', 'My Query')
        if (!name) {
            setIsSaving(false)
            return
        }

        const result = await saveQuery(selectedDb.id, name, query)
        setIsSaving(false)

        if (result.success) {
            toast({ title: 'Query saved', type: 'success' })
            fetchSavedQueries()
        } else {
            toast({ title: 'Failed to save query', description: result.error, type: 'error' })
        }
    }

    const handleDeleteSaved = async (id: string) => {
        const res = await deleteSavedQuery(id)
        if (res.success) {
            toast({ title: 'Deleted successfully', type: 'success' })
            fetchSavedQueries()
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
                <div>
                    <h1 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        Query Explorer
                    </h1>
                    <p className="text-muted-foreground text-[10px] font-medium mt-0.5">
                        Write, execute, and analyze database operations
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-foreground/5 p-1 rounded-xl">
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
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Main Workspace */}
                    <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
                        <QueryEditor
                            onRun={handleRunQuery}
                            onSave={handleSaveQuery}
                            onShare={handleShareQuery}
                            onCancel={handleCancelQuery}
                        />

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

                    {/* Sidecar (Status) */}
                    <div className="lg:col-span-1 space-y-6 order-1 lg:order-2">
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
                    onDelete={handleDeleteSaved}
                    onToggleFavorite={handleToggleFavorite}
                    onExecute={(query: string) => {
                        setActiveTab('editor')
                        // We might need to pass the query to the editor somehow, 
                        // but for now let's just trigger useSearchParams to handle it or similar
                        // A better way is state lift-up or using the URL.
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
                            <p className="text-sm font-medium text-muted-foreground">No History</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                                Your executed queries will appear here.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
