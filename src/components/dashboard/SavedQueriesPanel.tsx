'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    Play,
    Edit,
    Copy,
    Trash2,
    Database,
    Clock,
    Star,
    MoreVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/contexts/ToastContext'

interface SavedQuery {
    id: string
    name: string
    query: string
    database: string
    lastExecuted?: string
    isFavorite?: boolean
}

interface SavedQueriesPanelProps {
    queries: SavedQuery[]
    onDelete?: (id: string) => void
    onToggleFavorite?: (id: string, current: boolean) => void
    onExecute?: (query: string) => void
}

export function SavedQueriesPanel({ queries, onDelete, onToggleFavorite, onExecute }: SavedQueriesPanelProps) {
    const { toast } = useToast()

    const handleQuickRun = (query: SavedQuery) => {
        onExecute?.(query.query)
    }

    const handleEdit = (query: SavedQuery) => {
        // Edit functionality could be implemented by setting the editor code and switching tabs
        onExecute?.(query.query)
    }

    const handleCopy = (query: SavedQuery) => {
        navigator.clipboard.writeText(query.query).then(() => {
            toast({ title: 'Query copied', type: 'success' })
        })
    }

    const handleDelete = (query: SavedQuery) => {
        if (confirm(`Are you sure you want to delete "${query.name}"?`)) {
            onDelete?.(query.id)
        }
    }

    const handleToggleFavorite = (query: SavedQuery) => {
        onToggleFavorite?.(query.id, !!query.isFavorite)
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-foreground">Saved Queries</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {queries.length} snippet{queries.length !== 1 ? 's' : ''} ready to use
                    </p>
                </div>
            </div>

            {/* Query Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {queries.length === 0 ? (
                    <div className="col-span-full text-center py-16 px-4 rounded-2xl bg-foreground/[0.02] border border-foreground/5">
                        <Database className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">No saved queries yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            Save your frequently used queries for quick access
                        </p>
                    </div>
                ) : (
                    queries.map((query, index) => (
                        <motion.div
                            key={query.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative p-5 rounded-xl bg-card/50 backdrop-blur-xl border border-foreground/10 hover:border-indigo-500/30 transition-all hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-1"
                        >
                            {/* Favorite Button */}
                            <button
                                onClick={() => handleToggleFavorite(query)}
                                className="absolute top-3 right-3 p-1 rounded-full hover:bg-foreground/5 transition-colors z-10"
                            >
                                <Star className={cn(
                                    "w-4 h-4 transition-all",
                                    query.isFavorite ? "text-yellow-500 fill-yellow-500 scale-110" : "text-muted-foreground/30 hover:text-muted-foreground"
                                )} />
                            </button>

                            {/* Query Info */}
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-bold text-foreground text-sm mb-1 pr-6">
                                        {query.name}
                                    </h4>
                                    <p className="text-xs font-mono text-muted-foreground line-clamp-2 bg-foreground/5 p-2 rounded border border-foreground/5">
                                        {query.query}
                                    </p>
                                </div>

                                {/* Metadata */}
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Database className="w-3 h-3" />
                                        <span className="font-medium">{query.database}</span>
                                    </div>
                                    {query.lastExecuted && (
                                        <>
                                            <div className="w-1 h-1 rounded-full bg-foreground/20" />
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" />
                                                <span>{query.lastExecuted}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-4 pt-4 border-t border-foreground/5 flex items-center gap-2">
                                <button
                                    onClick={() => handleQuickRun(query)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md"
                                >
                                    <Play className="w-3 h-3 fill-current" />
                                    <span>Run</span>
                                </button>
                                <button
                                    onClick={() => handleEdit(query)}
                                    className="p-2 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => handleCopy(query)}
                                    className="p-2 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                                    title="Copy"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(query)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}
