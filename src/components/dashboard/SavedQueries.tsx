'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface SavedQuery {
    id: string
    name: string
    query: string
    database: string
    lastRun: string
}

interface SavedQueriesProps {
    queries: SavedQuery[]
    onRun?: (query: string) => void
    onLoad?: (query: string) => void
    onCopy?: (query: string) => void
}

const Icons = {
    Terminal: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    Play: ({ className }: { className?: string }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
        </svg>
    ),
    Copy: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
    Database: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
    ),
    Clock: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
}

export function SavedQueries({ queries, onRun, onLoad, onCopy }: SavedQueriesProps) {
    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Saved Snippets</h3>
                <span className="text-[10px] font-mono text-muted-foreground/50">{queries.length} Queries</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <AnimatePresence mode="popLayout">
                    {queries.map((query, idx) => (
                        <motion.div
                            key={query.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group"
                        >
                            <div
                                onClick={() => onLoad?.(query.query)}
                                className="relative p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/5 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 shadow-xl cursor-all-scroll overflow-hidden"
                            >
                                <div className="flex flex-col gap-3">
                                    {/* Header: Name and DB */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                {query.name}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="flex items-center gap-1 text-[10px] font-medium text-primary/70">
                                                    <Icons.Database className="w-3 h-3" />
                                                    {query.database}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Floating Quick Run Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRun?.(query.query);
                                            }}
                                            className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white hover:shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all"
                                            title="Quick Run"
                                        >
                                            <Icons.Play className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Footer: Metadata & Copy */}
                                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                        <div className="flex items-center gap-3 text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
                                            <span className="flex items-center gap-1">
                                                <Icons.Clock className="w-2.5 h-2.5 opacity-50" />
                                                {query.lastRun}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onCopy?.(query.query);
                                                }}
                                                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-foreground transition-all text-muted-foreground"
                                                title="Copy to Clipboard"
                                            >
                                                <Icons.Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Subtle Glow Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {queries.length === 0 && (
                    <div className="py-10 flex flex-col items-center justify-center text-center space-y-3 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                        <div className="p-3 rounded-full bg-white/5 text-muted-foreground/30">
                            <Icons.Terminal className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">No saved snippets found</p>
                    </div>
                )}
            </div>
        </div>
    )
}
