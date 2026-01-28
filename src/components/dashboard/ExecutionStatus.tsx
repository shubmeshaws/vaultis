'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type ExecutionState = 'idle' | 'running' | 'success' | 'warning' | 'error'

interface ExecutionStatusProps {
    status: ExecutionState
    executionTime?: number
    affectedRows?: number
    error?: string
}

const Icons = {
    Check: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
    ),
    Alert: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    Clock: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
}

export function ExecutionStatus({ status, executionTime, affectedRows, error }: ExecutionStatusProps) {
    const getStatusConfig = () => {
        switch (status) {
            case 'running':
                return {
                    label: 'Executing',
                    color: 'text-primary',
                    bg: 'bg-primary/10',
                    border: 'border-primary/20',
                    glow: 'shadow-[0_0_10px_rgba(var(--primary),0.3)]',
                    icon: <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                }
            case 'success':
                return {
                    label: 'Success',
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
                    icon: <Icons.Check className="w-3 h-3" />
                }
            case 'warning':
                return {
                    label: 'Slow Query',
                    color: 'text-amber-400',
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                    glow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]',
                    icon: <Icons.Alert className="w-3 h-3" />
                }
            case 'error':
                return {
                    label: 'Error',
                    color: 'text-red-400',
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                    glow: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]',
                    icon: <Icons.Alert className="w-3 h-3" />
                }
            default:
                return {
                    label: 'Ready',
                    color: 'text-muted-foreground',
                    bg: 'bg-white/5',
                    border: 'border-white/10',
                    glow: '',
                    icon: <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                }
        }
    }

    const config = getStatusConfig()

    return (
        <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
                <motion.div
                    key={status}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full
            ${config.bg} ${config.border} border backdrop-blur-md
            ${config.glow} transition-all duration-300
          `}
                >
                    {config.icon}
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${config.color}`}>
                        {config.label}
                    </span>
                </motion.div>
            </AnimatePresence>

            {(status === 'success' || status === 'warning') && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5"
                >
                    {executionTime !== undefined && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <Icons.Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] font-mono text-muted-foreground">{executionTime}ms</span>
                        </div>
                    )}
                    {affectedRows !== undefined && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                {affectedRows} {affectedRows === 1 ? 'Row' : 'Rows'}
                            </span>
                        </div>
                    )}
                </motion.div>
            )}

            {status === 'error' && error && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-medium text-red-400/80 italic max-w-xs truncate"
                >
                    {error}
                </motion.div>
            )}
        </div>
    )
}
