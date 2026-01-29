'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    X
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
    id: string
    type: ToastType
    title: string
    description?: string
    onDismiss: (id: string) => void
}

const toastConfig = {
    success: {
        icon: CheckCircle2,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/5',
        border: 'border-emerald-500/20',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]',
        label: 'Success'
    },
    error: {
        icon: AlertCircle,
        color: 'text-red-500',
        bg: 'bg-red-500/20',
        border: 'border-red-500/50',
        glow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]',
        label: 'Error'
    },
    warning: {
        icon: AlertTriangle,
        color: 'text-amber-400',
        bg: 'bg-amber-500/5',
        border: 'border-amber-500/20',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]',
        label: 'Warning'
    },
    info: {
        icon: Info,
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/5',
        border: 'border-indigo-500/20',
        glow: 'shadow-[0_0_20px_rgba(99,102,241,0.1)]',
        label: 'Info'
    }
}

export function Toast({ id, type, title, description, onDismiss }: ToastProps) {
    const config = toastConfig[type]
    const Icon = config.icon

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={cn(
                "relative w-80 lg:w-96 overflow-hidden rounded-2xl border backdrop-blur-2xl px-5 py-4 flex items-start gap-4 transition-colors",
                "bg-[#05050A]/60 ring-1 ring-white/5 shadow-2xl",
                config.border,
                config.glow
            )}
        >
            {/* Subtle Gradient Background */}
            <div className={cn(
                "absolute inset-0 opacity-[0.03] pointer-events-none transition-opacity",
                config.bg
            )} />

            {/* Icon Section */}
            <div className={cn(
                "p-2 rounded-xl flex items-center justify-center transition-all",
                "bg-white/5 border border-white/5",
                config.color
            )}>
                <Icon className="w-5 h-5" />
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0 py-0.5">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", config.color)}>
                        {config.label}
                    </span>
                    <div className="h-px flex-1 bg-white/5" />
                </div>
                <h4 className="text-sm font-bold text-white tracking-tight leading-tight">
                    {title}
                </h4>
                {description && (
                    <p className="mt-1.5 text-xs text-white/40 leading-relaxed font-medium">
                        {description}
                    </p>
                )}
            </div>

            {/* Close Button */}
            <button
                onClick={() => onDismiss(id)}
                className="group relative p-1.5 rounded-lg text-white/20 hover:text-white hover:bg-white/5 transition-all"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Inner Glow Border - Highlight */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
        </motion.div>
    )
}
