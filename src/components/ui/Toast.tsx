'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
    id: string
    type: ToastType
    title: string
    description?: string
    onDismiss: (id: string) => void
}

const Icons = {
    Success: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Error: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Warning: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    Info: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    X: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
}

export function Toast({ id, type, title, description, onDismiss }: ToastProps) {
    const getStyles = (type: ToastType) => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    iconBg: 'bg-emerald-500/20',
                    iconColor: 'text-emerald-500',
                    shadow: 'shadow-[0_8px_30px_rgba(16,185,129,0.1)]'
                }
            case 'error':
                return {
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                    iconBg: 'bg-red-500/20',
                    iconColor: 'text-red-500',
                    shadow: 'shadow-[0_8px_30px_rgba(239,68,68,0.1)]'
                }
            case 'warning':
                return {
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                    iconBg: 'bg-amber-500/20',
                    iconColor: 'text-amber-500',
                    shadow: 'shadow-[0_8px_30px_rgba(245,158,11,0.1)]'
                }
            case 'info':
                return {
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/20',
                    iconBg: 'bg-blue-500/20',
                    iconColor: 'text-blue-500',
                    shadow: 'shadow-[0_8px_30px_rgba(59,130,246,0.1)]'
                }
        }
    }

    const styles = getStyles(type)
    const Icon = Icons[type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info']

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            className={`relative w-96 p-4 rounded-xl border bg-[#0F1115]/95 backdrop-blur-xl flex items-start gap-4 shadow-2xl ${styles.border}`}
        >
            <div className={`p-2 rounded-lg shrink-0 ${styles.iconBg} ${styles.iconColor}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 pt-1">
                <h4 className={`text-sm font-black tracking-tight ${styles.iconColor} uppercase`}>{title}</h4>
                {description && (
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed font-medium">
                        {description}
                    </p>
                )}
            </div>
            <button
                onClick={() => onDismiss(id)}
                className="p-1 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-white/10 transition-colors"
            >
                <Icons.X className="w-4 h-4" />
            </button>
        </motion.div>
    )
}
