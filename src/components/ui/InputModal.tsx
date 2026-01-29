'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Type } from 'lucide-react'
import { Portal } from './Portal'

interface InputModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (value: string) => void
    title: string
    description: string
    placeholder?: string
    defaultValue?: string
    confirmText?: string
    cancelText?: string
}

export function InputModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    placeholder = 'Enter value...',
    defaultValue = '',
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}: InputModalProps) {
    const [value, setValue] = useState(defaultValue)

    useEffect(() => {
        if (isOpen) setValue(defaultValue)
    }, [isOpen, defaultValue])

    const handleConfirm = () => {
        onConfirm(value)
        onClose()
    }

    return (
        <Portal>
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
                            <div className="p-6 space-y-4">
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
                                        <Type className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
                                    <p className="text-xs text-muted-foreground mt-1 px-2">{description}</p>
                                </div>

                                <div className="pt-2">
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        placeholder={placeholder}
                                        className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-transparent focus:border-indigo-500/50 focus:bg-background focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm transition-all text-foreground placeholder:text-muted-foreground/50 font-medium"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleConfirm()
                                            if (e.key === 'Escape') onClose()
                                        }}
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 h-10 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground font-bold text-xs transition-all"
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={!value.trim()}
                                        className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/20"
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
        </Portal>
    )
}
