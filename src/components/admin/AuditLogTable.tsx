'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type AuditOperation = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'DROP' | 'TRUNCATE' | 'ALTER' | 'GRANT'
export type AuditRisk = 'Low' | 'Medium' | 'High' | 'Critical'

export interface AuditEntry {
    id: string
    timestamp: string
    user: { name: string; email: string }
    database: string
    operation: AuditOperation
    query: string
    risk: AuditRisk
    duration: number
    status: 'Success' | 'Failure'
}

interface AuditLogTableProps {
    entries: AuditEntry[]
    onSelectEntry: (entry: AuditEntry) => void
}

const Icons = {
    Alert: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    Term: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
}

export function AuditLogTable({ entries, onSelectEntry }: AuditLogTableProps) {
    const getRiskStyles = (risk: AuditRisk) => {
        switch (risk) {
            case 'Critical': return 'text-red-400 border-red-500/50 bg-red-500/10'
            case 'High': return 'text-orange-400 border-orange-500/50 bg-orange-500/10'
            case 'Medium': return 'text-amber-400 border-amber-500/50 bg-amber-500/10'
            case 'Low': return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10'
        }
    }

    const isDangerous = (op: AuditOperation) => ['DROP', 'TRUNCATE', 'DELETE', 'ALTER'].includes(op)

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-3xl">
            <table className="w-full text-left border-collapse table-fixed">
                <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="w-[200px] px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground font-mono">Timestamp (UTC)</th>
                        <th className="w-[180px] px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Identity</th>
                        <th className="w-[140px] px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground font-mono">Operation</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Resource Path</th>
                        <th className="w-[120px] px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Risk Audit</th>
                        <th className="w-[100px] px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right font-mono">Duration</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    <AnimatePresence mode="popLayout">
                        {entries.map((entry, idx) => (
                            <motion.tr
                                key={entry.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                onClick={() => onSelectEntry(entry)}
                                className={`group cursor-pointer hover:bg-white/[0.04] transition-all relative ${isDangerous(entry.operation) ? 'after:content-[""] after:absolute after:left-0 after:top-0 after:bottom-0 after:w-0.5 after:bg-red-500/50' : ''
                                    }`}
                            >
                                <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                                    {entry.timestamp}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center font-bold text-[10px] text-muted-foreground">
                                            {entry.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-foreground leading-none">{entry.user.name}</p>
                                            <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{entry.user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`font-mono text-[10px] font-black ${isDangerous(entry.operation) ? 'text-red-400' : 'text-primary'
                                        }`}>
                                        {entry.operation}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className="text-[10px] font-bold text-muted-foreground/60 whitespace-nowrap">{entry.database}</span>
                                        <span className="text-[10px] text-muted-foreground font-mono truncate opacity-40">:: {entry.query.slice(0, 50)}...</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getRiskStyles(entry.risk)}`}>
                                        {entry.risk}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-[10px] text-muted-foreground">
                                    {entry.duration}ms
                                </td>
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </tbody>
            </table>

            {entries.length === 0 && (
                <div className="py-24 text-center">
                    <div className="inline-flex p-4 rounded-3xl bg-white/5 border border-white/10 text-muted-foreground mb-4">
                        <Icons.Term className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">No forensic logs found</p>
                </div>
            )}
        </div>
    )
}
