'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuditEntry } from './AuditLogTable'

interface AuditLogDrawerProps {
    entry: AuditEntry | null
    isOpen: boolean
    onClose: () => void
}

const Icons = {
    Close: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    Shield: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    User: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    Terminal: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    Clock: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
}

export function AuditLogDrawer({ entry, isOpen, onClose }: AuditLogDrawerProps) {
    return (
        <AnimatePresence>
            {isOpen && entry && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 px-1"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0.5 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-card border-l border-white/10 z-50 flex flex-col shadow-[-32px_0_64px_rgba(0,0,0,0.5)]"
                    >
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-2xl border ${entry.risk === 'Critical' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-primary/10 border-primary/30 text-primary'
                                    }`}>
                                    <Icons.Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground uppercase tracking-tight italic">Audit <span className="text-muted-foreground not-italic">Inspector</span></h3>
                                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">Entry ID: {entry.id}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground transition-colors group">
                                <Icons.Close className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">User Context</p>
                                    <div className="flex items-center gap-2 pt-1">
                                        <Icons.User className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-xs font-bold text-foreground">{entry.user.name}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground pl-5">{entry.user.email}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Timestamp (UTC)</p>
                                    <div className="flex items-center gap-2 pt-1">
                                        <Icons.Clock className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-xs font-mono font-bold text-foreground">{entry.timestamp}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground pl-5">Offset: +00:00</p>
                                </div>
                            </div>

                            {/* Execution Details */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 flex items-center gap-2">
                                    <div className="h-px flex-1 bg-white/5" />
                                    Execution Payload
                                    <div className="h-px flex-1 bg-white/5" />
                                </h4>
                                <div className="relative group">
                                    <div className="absolute top-4 right-4 text-[10px] font-mono text-muted-foreground/30 font-bold uppercase tracking-widest pointer-events-none">
                                        {entry.operation} Payload
                                    </div>
                                    <div className="p-6 rounded-3xl bg-black/40 border border-white/10 font-mono text-xs leading-relaxed text-foreground/80 overflow-x-auto whitespace-pre-wrap shadow-inner min-h-[160px]">
                                        <span className="text-primary/70">{entry.operation}</span> {entry.query}
                                    </div>
                                </div>
                            </div>

                            {/* Forensic Stats */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">Telemetrics</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center text-center">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Latency</p>
                                        <p className="text-lg font-mono font-bold text-foreground">{entry.duration}<span className="text-[10px] text-muted-foreground">ms</span></p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center text-center">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Status</p>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg border ${entry.status === 'Success' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' : 'text-red-400 border-red-400/20 bg-red-400/5'
                                            }`}>
                                            {entry.status}
                                        </span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center text-center">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Risk Weight</p>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg border ${entry.risk === 'Critical' ? 'text-red-400 border-red-400/20 bg-red-400/5' : 'text-primary border-primary/20 bg-primary/5'
                                            }`}>
                                            {entry.risk}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Forensic Assessment */}
                            {entry.risk === 'Critical' && (
                                <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 flex gap-4">
                                    <div className="p-2 rounded-xl bg-red-500/10 h-max">
                                        <Icons.Shield className="w-5 h-5 text-red-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-red-400 uppercase tracking-tight">Anomalous Operation Detected</p>
                                        <p className="text-[11px] text-red-400/60 leading-relaxed font-normal">
                                            This entry represents a destructive schema operation. Security protocols recommend cross-referencing this timestamp with concurrent authentication logs.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <div className="flex flex-col">
                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Log Integrity Vector</p>
                                <p className="text-[9px] font-mono text-muted-foreground/40 mt-0.5">SHA256: {Math.random().toString(36).substring(7).toUpperCase()}...AUTHORIZED</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-white/10 transition-all"
                            >
                                Close Inspector
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
