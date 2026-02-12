'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Portal } from './Portal'

interface DangerousActionModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmKeyword: string
    actionLabel: string
}

const Icons = {
    Alert: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    Shield: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
}

export function DangerousActionModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmKeyword,
    actionLabel
}: DangerousActionModalProps) {
    const [inputValue, setInputValue] = useState('')
    const [isLocked, setIsLocked] = useState(true)

    useEffect(() => {
        setIsLocked(inputValue.toLowerCase() !== confirmKeyword.toLowerCase())
    }, [inputValue, confirmKeyword])

    useEffect(() => {
        if (!isOpen) {
            setInputValue('')
        }
    }, [isOpen])

    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pb-24">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-[#0F1115] border border-[#2D313A] rounded-2xl overflow-hidden shadow-2xl"
                        >
                            {/* Header / Banner */}
                            <div className="bg-red-500/[0.03] px-8 py-6 flex items-center justify-between border-b border-[#1C1F26]">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                                        <Icons.Alert className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic">Safety <span className="text-red-500 not-italic">Checkpoint</span></h3>
                                        <p className="text-[10px] font-mono text-red-500/60 uppercase tracking-widest mt-0.5">High-Risk Operation Detected</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">IRREVERSIBLE</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 space-y-8">
                                <div className="space-y-3 text-center">
                                    <h4 className="text-2xl font-black text-foreground leading-tight">{title}</h4>
                                    <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                                        {description}
                                    </p>
                                </div>

                                {/* Keyword Input */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex flex-col items-center gap-1.5 text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Verification Protocol</p>
                                        <p className="text-sm font-medium text-foreground italic">Type <span className="text-red-500 font-black not-italic px-1.5 py-0.5 rounded-lg bg-red-500/10 ring-1 ring-red-500/20">&quot;{confirmKeyword.toUpperCase()}&quot;</span> to authorize execution</p>
                                    </div>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Awaiting verification..."
                                        className="w-full px-6 py-4 rounded-3xl bg-black/40 border border-white/10 text-center font-mono text-sm tracking-widest text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-red-500/40 transition-all shadow-inner"
                                    />
                                </div>

                                {/* Responsibility Disclaimer */}
                                <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 flex gap-4 items-start">
                                    <div className="p-2.5 rounded-xl bg-white/5 text-muted-foreground shrink-0">
                                        <Icons.Shield className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black text-foreground uppercase tracking-widest">Responsibility Statement</p>
                                        <p className="text-[11px] text-muted-foreground/70 leading-relaxed font-medium">
                                            By proceeding, you acknowledge that you are executing a production-level command. This operation will be permanently logged to the forensic audit record.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-8 pt-0 flex gap-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 rounded-3xl bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-white/10 transition-all"
                                >
                                    Retreat
                                </button>
                                <button
                                    disabled={isLocked}
                                    onClick={() => {
                                        onConfirm()
                                        onClose()
                                    }}
                                    className={`flex-[1.5] py-4 rounded-3xl flex items-center justify-center gap-2 group transition-all ${isLocked
                                        ? 'bg-white/5 border border-white/5 text-white/10 cursor-not-allowed opacity-50 grayscale'
                                        : 'bg-red-500 border border-red-400/50 text-white shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-[0.98]'
                                        }`}
                                >
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{actionLabel}</span>
                                    {!isLocked && <motion.div animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1 }}>→</motion.div>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Portal>
    )
}
