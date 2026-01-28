'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Raw SVG icons to avoid missing dependencies
const Icons = {
    ChevronDown: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    ),
    Lock: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    ),
    Shield: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    Postgres: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
    ),
    MySQL: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 10h16M4 14h16M4 18h16M4 6h16" />
        </svg>
    ),
    SQLite: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
    ),
    Redis: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4M4 19h4M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
}

export interface DatabaseOption {
    id: string
    name: string
    type: 'postgres' | 'mysql' | 'sqlite' | 'redis'
    permission: 'Owner' | 'Editor' | 'Viewer' | 'Restricted'
    status: 'connected' | 'disconnected' | 'syncing'
    isRestricted?: boolean
}

const dbTypeIcons = {
    postgres: <Icons.Postgres className="w-4 h-4 text-blue-400" />,
    mysql: <Icons.MySQL className="w-4 h-4 text-orange-400" />,
    sqlite: <Icons.SQLite className="w-4 h-4 text-cyan-400" />,
    redis: <Icons.Redis className="w-4 h-4 text-red-400" />,
}

interface DatabaseSelectorProps {
    databases: DatabaseOption[]
    selectedId: string
    onSelect: (id: string) => void
}

export function DatabaseSelector({ databases, selectedId, onSelect }: DatabaseSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedDb = databases.find(db => db.id === selectedId) || databases[0]

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative w-full" ref={containerRef}>
            {/* Trigger Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`
          w-full flex items-center justify-between p-3 rounded-xl
          bg-white/5 backdrop-blur-md border border-white/10
          hover:bg-white/10 hover:border-white/20 transition-all
          shadow-xl group
        `}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                        {dbTypeIcons[selectedDb.type]}
                    </div>
                    <div className="flex flex-col items-start overflow-hidden">
                        <div className="flex items-center gap-2 max-w-full">
                            <span className="text-sm font-bold truncate text-white">{selectedDb.name}</span>
                            <div className={`w-2 h-2 rounded-full ${selectedDb.status === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]'}`} />
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 opacity-60">
                            <Icons.Shield className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">{selectedDb.permission}</span>
                        </div>
                    </div>
                </div>
                <Icons.ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 4, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 w-full z-[100] mt-1 p-2 rounded-2xl bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        <div className="max-h-[300px] overflow-y-auto space-y-1 custom-scrollbar px-1 py-1">
                            <div className="px-3 py-1 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">
                                Select Database
                            </div>
                            {databases.map((db) => (
                                <motion.button
                                    key={db.id}
                                    whileHover={db.isRestricted ? {} : { scale: 1.02, x: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                    onClick={() => {
                                        if (!db.isRestricted) {
                                            onSelect(db.id)
                                            setIsOpen(false)
                                        }
                                    }}
                                    className={`
                    w-full flex items-center gap-3 p-3 rounded-xl transition-all relative group/item
                    ${db.isRestricted
                                            ? 'cursor-not-allowed'
                                            : 'border border-transparent hover:border-white/10'
                                        }
                    ${selectedId === db.id ? 'bg-white/5 border-white/10' : ''}
                  `}
                                >
                                    <div className={`p-2 rounded-lg transition-colors ${db.isRestricted ? 'bg-white/5 opacity-40' : 'bg-primary/5 text-primary group-hover/item:bg-primary/10'}`}>
                                        {dbTypeIcons[db.type]}
                                    </div>

                                    <div className={`flex flex-col items-start overflow-hidden transition-all duration-300 ${db.isRestricted ? 'blur-[3px] grayscale opacity-50' : ''}`}>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-semibold ${selectedId === db.id ? 'text-primary' : 'text-foreground'}`}>{db.name}</span>
                                            {!db.isRestricted && (
                                                <div className={`w-1 h-1 rounded-full ${db.status === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            )}
                                        </div>
                                        <span className="text-[10px] font-medium text-muted-foreground uppercase">{db.permission}</span>
                                    </div>

                                    {db.isRestricted && (
                                        <div className="ml-auto flex items-center gap-2 pr-2">
                                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">LOCKED</span>
                                            <Icons.Lock className="w-3.5 h-3.5 text-muted-foreground/40" />
                                        </div>
                                    )}

                                    {selectedId === db.id && !db.isRestricted && (
                                        <motion.div
                                            layoutId="active-highlight"
                                            className="absolute right-3 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_var(--primary)]"
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
