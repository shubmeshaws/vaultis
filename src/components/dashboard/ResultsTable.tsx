'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Column {
    key: string
    label: string
    width?: number
}

interface ResultsTableProps {
    data: any[]
    columns: Column[]
    onExport?: (format: 'csv' | 'json' | 'excel') => void
}

const Icons = {
    Download: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
    ),
    FileText: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    ChevronLeft: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
    ),
    ChevronRight: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    ),
}

export function ResultsTable({ data, columns, onExport }: ResultsTableProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(10)

    const totalPages = Math.ceil(data.length / pageSize)
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return data.slice(start, start + pageSize)
    }, [data, currentPage, pageSize])

    return (
        <div className="space-y-4 animate-scale-in">
            {/* Table Header / Toolbar */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rows:</span>
                        <span className="text-[10px] font-mono text-primary font-bold">{data.length}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Page:</span>
                        <span className="text-[10px] font-mono text-primary font-bold">{currentPage} / {totalPages || 1}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onExport?.('csv')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-bold text-muted-foreground uppercase tracking-wider group"
                    >
                        <Icons.FileText className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                        CSV
                    </button>
                    <button
                        onClick={() => onExport?.('json')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-bold text-muted-foreground uppercase tracking-wider group"
                    >
                        <Icons.FileText className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                        JSON
                    </button>
                    <button
                        onClick={() => onExport?.('excel')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-bold text-muted-foreground uppercase tracking-wider group"
                    >
                        <Icons.FileText className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                        Excel
                    </button>
                </div>
            </div>

            {/* Main Table Container with Nested Glassmorphism */}
            <div className="relative rounded-2xl border border-white/10 bg-black/20 backdrop-blur-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto max-h-[500px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="sticky top-0 z-20">
                            <tr className="bg-white/5 backdrop-blur-xl border-b border-white/10">
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] relative group/th"
                                        style={{ width: col.width }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{col.label}</span>
                                            {/* Resize Handle Placeholder */}
                                            <div className="absolute right-0 top-1/4 bottom-1/4 w-[1px] bg-white/5 group-hover/th:bg-primary/30 transition-colors" />
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {paginatedData.map((row, idx) => (
                                    <motion.tr
                                        key={row.id || idx}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="hover:bg-white/[0.03] transition-colors group/tr"
                                    >
                                        {columns.map((col) => (
                                            <td key={`${idx}-${col.key}`} className="px-6 py-4">
                                                <div className="text-sm text-foreground/80 group-hover/tr:text-foreground transition-colors font-medium">
                                                    {col.key === 'id' ? (
                                                        <span className="font-mono text-xs text-primary/70">{row[col.key]}</span>
                                                    ) : (
                                                        row[col.key]?.toString() || '-'
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {data.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <Icons.FileText className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-foreground/50">No results found</h3>
                            <p className="text-sm text-muted-foreground/30 px-6 max-w-xs">Run a query to see data populated in this table studio.</p>
                        </div>
                    </div>
                )}

                {/* Navigation Footer */}
                {data.length > 0 && (
                    <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.length)} of {data.length} records
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all group"
                            >
                                <Icons.ChevronLeft className="w-4 h-4 text-primary group-hover:-translate-x-0.5 transition-transform" />
                            </button>
                            <div className="flex items-center gap-1 px-3">
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all ${currentPage === i + 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-white/5 text-muted-foreground'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all group"
                            >
                                <Icons.ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Decorative Blur */}
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        </div>
    )
}
