'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface DownloadItem {
    id: string
    filename: string
    type: 'csv' | 'json' | 'excel'
    size: string
    timestamp: string
    status: 'ready' | 'downloading' | 'completed'
}

interface DownloadPanelProps {
    items: DownloadItem[]
    onDownload?: (id: string) => void
    onArchive?: (id: string) => void
}

const Icons = {
    File: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
    ),
    Download: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
    ),
    Archive: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
    ),
    Clock: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
}

export function DownloadPanel({ items, onDownload, onArchive }: DownloadPanelProps) {
    const getTypeConfig = (type: DownloadItem['type']) => {
        switch (type) {
            case 'csv': return { label: 'CSV', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' }
            case 'json': return { label: 'JSON', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' }
            case 'excel': return { label: 'XLSX', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' }
        }
    }

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Generated Exports</h3>
                <span className="text-[10px] font-mono text-muted-foreground/50">{items.length} Files</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <AnimatePresence mode="popLayout">
                    {items.map((item, idx) => {
                        const config = getTypeConfig(item.type)
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative"
                            >
                                <div className="relative p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-xl overflow-hidden">
                                    <div className="flex items-center gap-4">
                                        {/* File Icon with Type Badge */}
                                        <div className="relative">
                                            <div className={`p-2.5 rounded-xl ${config.bg} border ${config.border} shadow-inner`}>
                                                <Icons.File className={`w-5 h-5 ${config.color}`} />
                                            </div>
                                        </div>

                                        {/* Metadata */}
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                    {item.filename}
                                                </h4>
                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${config.bg} ${config.color} border ${config.border}`}>
                                                    {config.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                                                <span className="flex items-center gap-1">
                                                    <Icons.Clock className="w-3 h-3 opacity-50" />
                                                    {item.timestamp}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                                <span>{item.size}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                                            <button
                                                onClick={() => onArchive?.(item.id)}
                                                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all text-muted-foreground"
                                                title="Archive"
                                            >
                                                <Icons.Archive className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDownload?.(item.id)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:shadow-[0_0_15px_rgba(var(--primary),0.4)] hover:scale-105 active:scale-95 transition-all shadow-lg"
                                            >
                                                <Icons.Download className="w-3.5 h-3.5" />
                                                Download
                                            </button>
                                        </div>
                                    </div>

                                    {/* Glass Glow effect */}
                                    <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-[40px] opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none ${config.bg}`} />
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {items.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                        <div className="p-3 rounded-full bg-white/5 text-muted-foreground/30">
                            <Icons.File className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">No generated exports yet</p>
                    </div>
                )}
            </div>
        </div>
    )
}
