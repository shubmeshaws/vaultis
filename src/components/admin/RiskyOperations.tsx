'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface RiskyOp {
    id: string
    type: 'DROP' | 'TRUNCATE' | 'LARGE_DELETE' | 'SCHEMA_CHANGE'
    user: string
    target: string
    timestamp: string
    severity: 'high' | 'critical'
}

interface RiskyOperationsProps {
    ops: RiskyOp[]
}

const Icons = {
    Alert: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    User: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    Shield: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
}

export function RiskyOperations({ ops }: RiskyOperationsProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                        <Icons.Shield className="w-4 h-4 text-red-500" />
                    </div>
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Access & Safety Audit</h3>
                </div>
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Critical Alerts
                </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <AnimatePresence mode="popLayout">
                    {ops.map((op, idx) => (
                        <motion.div
                            key={op.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group relative"
                        >
                            <div className={`p-5 rounded-2xl bg-black/20 border backdrop-blur-md transition-all duration-300 hover:bg-white/5 flex items-center gap-6 ${op.severity === 'critical' ? 'border-red-500/30' : 'border-amber-500/30'
                                }`}>
                                {/* Severity Indicator */}
                                <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${op.severity === 'critical' ? 'bg-red-500/20 border-red-500/30 text-red-500' : 'bg-amber-500/20 border-amber-500/30 text-amber-500'
                                    }`}>
                                    <Icons.Alert className="w-6 h-6" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase ${op.severity === 'critical' ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'
                                            }`}>
                                            {op.type}
                                        </span>
                                        <span className="text-xs font-bold text-foreground truncate">at {op.target}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <Icons.User className="w-3.5 h-3.5 opacity-50" />
                                            {op.user}
                                        </span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/5" />
                                        <span>{op.timestamp}</span>
                                    </div>
                                </div>

                                {/* Action */}
                                <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
                                    View Source
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {ops.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                        <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <Icons.Shield className="w-8 h-8 opacity-50" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-emerald-500 uppercase tracking-widest">System Clear</p>
                            <p className="text-[11px] text-muted-foreground/50 font-bold uppercase tracking-widest mt-1">No critical risky operations detected in last 24h</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
