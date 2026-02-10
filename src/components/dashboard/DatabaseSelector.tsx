'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Database,
    Server,
    Shield,
    Lock,
    ChevronDown,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    HardDrive
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type DbStatus = 'online' | 'maintenance' | 'offline' | 'locked'
export type DbType = 'postgres' | 'mongo' | 'mysql' | 'redis'
export type Permission = 'admin' | 'read_write' | 'read_only' | 'no_access'

export interface DatabaseOption {
    id: string
    name: string
    type: DbType
    region: string
    status: DbStatus
    permission: Permission
}

interface DatabaseSelectorProps {
    databases: DatabaseOption[]
    selectedId: string
    onSelect: (db: DatabaseOption) => void
}

export function DatabaseSelector({ databases, selectedId, onSelect }: DatabaseSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)

    const selectedDb = databases.find(d => d.id === selectedId) || databases[0]

    if (!selectedDb) {
        return (
            <div className="w-full h-11 px-4 bg-foreground/[0.04] dark:bg-white/5 border border-foreground/10 dark:border-white/5 rounded-xl flex items-center gap-3 text-xs text-muted-foreground italic">
                <Database className="w-4 h-4 opacity-50" />
                <span>No databases found</span>
            </div>
        )
    }

    const getStatusColor = (status: DbStatus) => {
        switch (status) {
            case 'online': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
            case 'maintenance': return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]'
            case 'offline': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
            default: return 'bg-gray-500'
        }
    }

    const getTypeIcon = (type: DbType) => {
        // In a real app, use branding SVGs. For now, use Lucide proxies.
        return Database // Default generic
    }

    return (
        <div className="relative z-50">
            {/* Trigger Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "w-full flex items-center justify-between px-3 py-1.5 rounded-xl border transition-all duration-300 group",
                    isOpen
                        ? "bg-foreground/[0.08] dark:bg-white/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                        : "bg-foreground/[0.04] dark:bg-white/5 border-foreground/10 dark:border-white/5 hover:bg-foreground/[0.08] dark:hover:bg-white/[0.08] hover:border-foreground/20 dark:hover:border-white/10"
                )}
            >
                <div className="flex items-center gap-2.5 overflow-hidden">
                    {/* Status Dot */}
                    <div className={cn("w-2 h-2 rounded-full shrink-0 transition-all duration-500", getStatusColor(selectedDb.status))} />

                    <div className="flex flex-col items-start min-w-0">
                        <span className="text-[10px] font-bold text-foreground dark:text-white/90 truncate leading-tight">{selectedDb.name}</span>
                        <div className="flex items-center gap-1 opacity-50 text-foreground dark:text-white">
                            <span className="text-[8px] font-mono uppercase tracking-wider">{selectedDb.type}</span>
                            <span className="w-0.5 h-0.5 rounded-full bg-foreground dark:bg-white/50" />
                            <span className="text-[8px] uppercase font-bold whitespace-nowrap">{selectedDb.region}</span>
                        </div>
                    </div>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-foreground/30 dark:text-white/30 transition-transform duration-300", isOpen && "rotate-180")} />
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ duration: 0.2, ease: "circOut" }}
                        className="absolute top-[calc(100%+8px)] left-0 w-[calc(100%+20px)] -ml-[10px] bg-popover/95 dark:bg-[#0A0A0E]/90 backdrop-blur-2xl border border-foreground/10 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden ring-1 ring-black/5 dark:ring-black/50"
                    >
                        {/* Header */}
                        <div className="px-2 py-1 mb-0.5 flex items-center justify-between text-[7.5px] font-bold text-foreground/40 dark:text-white/40 uppercase tracking-[0.15em] border-b border-foreground/5 dark:border-white/5">
                            <span className="whitespace-nowrap">Select Database</span>
                            <span className="opacity-60 whitespace-nowrap">{databases.length} Available</span>
                        </div>

                        <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {databases.map((db, i) => {
                                const isLocked = db.status === 'locked' || db.permission === 'no_access'
                                const isSelected = db.id === selectedId

                                return (
                                    <motion.button
                                        key={db.id}
                                        disabled={isLocked}
                                        onClick={() => {
                                            if (!isLocked) {
                                                onSelect(db)
                                                setIsOpen(false)
                                            }
                                        }}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className={cn(
                                            "w-full flex items-center gap-2 p-1.5 rounded-xl border transition-all duration-200 group relative overflow-hidden text-left",
                                            isSelected
                                                ? "bg-indigo-600/20 border-indigo-500/30"
                                                : "bg-transparent border-transparent hover:bg-white/5",
                                            isLocked && "opacity-50 cursor-not-allowed grayscale-[0.5]"
                                        )}
                                    >
                                        {/* Hover Highlight */}
                                        {!isLocked && !isSelected && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}

                                        {/* Layout aligned with trigger button */}
                                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                            {/* Status Dot */}
                                            <div className={cn("w-2 h-2 rounded-full shrink-0 transition-all duration-500", getStatusColor(db.status))} />

                                            <div className="flex flex-col items-start min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "text-[10px] font-bold truncate leading-tight",
                                                        isSelected ? "text-foreground dark:text-white" : "text-foreground/70 dark:text-white/70 group-hover:text-foreground dark:group-hover:text-white"
                                                    )}>
                                                        {db.name}
                                                    </span>
                                                    {isLocked && <Lock className="w-2.5 h-2.5 text-red-500/50" />}
                                                </div>
                                                <div className="flex items-center gap-1 opacity-50 text-foreground dark:text-white">
                                                    <span className="text-[8px] font-mono uppercase tracking-wider">{db.type}</span>
                                                    <span className="w-0.5 h-0.5 rounded-full bg-foreground dark:bg-white/50" />
                                                    <span className="text-[8px] uppercase font-bold whitespace-nowrap">{db.permission.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Selection Check */}
                                        {isSelected && (
                                            <motion.div layoutId="check" className="absolute right-2 text-indigo-400">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </motion.div>
                                        )}

                                        {/* Locked Blur Overlay (optional, mostly handled by opacity/grayscale) */}
                                        {isLocked && <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />}
                                    </motion.button>
                                )
                            })}
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
