'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle } from 'lucide-react'

interface SimpleConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    type?: 'danger' | 'warning' | 'info'
}

export function SimpleConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Yes, Proceed',
    cancelText = 'Cancel',
    type = 'info'
}: SimpleConfirmationModalProps) {
    const colorClass = type === 'danger' ? 'text-red-500' : type === 'warning' ? 'text-amber-500' : 'text-blue-500'
    const bgColorClass = type === 'danger' ? 'bg-red-500/10' : type === 'warning' ? 'bg-amber-500/10' : 'bg-blue-500/10'
    const btnColorClass = type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pb-24">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-sm bg-background border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 text-center space-y-4">
                            <div className={`w-16 h-16 rounded-full ${bgColorClass} flex items-center justify-center mx-auto mb-2`}>
                                <AlertCircle className={`w-8 h-8 ${colorClass}`} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-foreground uppercase italic leading-none">{title}</h2>
                                <p className="text-xs text-muted-foreground mt-2 px-4 leading-relaxed">{description}</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={onClose}
                                    className="flex-1 h-11 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className={`flex-1 h-11 rounded-xl ${btnColorClass} text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-foreground/5 rounded-lg transition-colors">
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
