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
                    "w-full flex items-center justify-between p-1 pl-3 pr-3 py-2.5 rounded-xl border transition-all duration-300 group",
                    isOpen
                        ? "bg-foreground/[0.08] dark:bg-white/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                        : "bg-foreground/[0.04] dark:bg-white/5 border-foreground/10 dark:border-white/5 hover:bg-foreground/[0.08] dark:hover:bg-white/[0.08] hover:border-foreground/20 dark:hover:border-white/10"
                )}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {/* Status Dot */}
                    <div className={cn("w-2 h-2 rounded-full shrink-0 transition-all duration-500", getStatusColor(selectedDb.status))} />

                    <div className="flex flex-col items-start min-w-0">
                        <span className="text-xs font-bold text-foreground dark:text-white/90 truncate">{selectedDb.name}</span>
                        <div className="flex items-center gap-1.5 opacity-50 text-foreground dark:text-white">
                            <span className="text-[10px] font-mono uppercase tracking-wider">{selectedDb.type}</span>
                            <span className="w-0.5 h-0.5 rounded-full bg-foreground dark:bg-white/50" />
                            <span className="text-[10px] uppercase font-bold">{selectedDb.region}</span>
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
                        <div className="px-2 py-1.5 mb-1 flex items-center justify-between text-[10px] font-bold text-foreground/30 dark:text-white/20 uppercase tracking-widest border-b border-foreground/5 dark:border-white/5">
                            <span>Select Database</span>
                            {databases.length} Available
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
                                            "w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 group relative overflow-hidden text-left",
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

                                        {/* Icon Box */}
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                                            isSelected ? "bg-indigo-500 text-white border-indigo-400" : "bg-foreground/[0.05] dark:bg-white/5 text-foreground/40 dark:text-white/40 border-foreground/5 dark:border-white/5 group-hover:border-foreground/20 dark:group-hover:border-white/10",
                                            isLocked && "bg-foreground/[0.1] dark:bg-black/40 border-foreground/5 dark:border-white/5"
                                        )}>
                                            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <HardDrive className="w-4 h-4" />}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 z-10">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className={cn(
                                                    "text-xs font-bold truncate",
                                                    isSelected ? "text-foreground dark:text-white" : "text-foreground/70 dark:text-white/70 group-hover:text-foreground dark:group-hover:text-white"
                                                )}>
                                                    {db.name}
                                                </span>
                                                {isLocked && <span className="text-[9px] font-black uppercase text-red-600 dark:text-red-500/70 border border-red-500/20 px-1 py-0.5 rounded">Locked</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", getStatusColor(db.status))} />
                                                <span className="text-[10px] text-foreground/40 dark:text-white/30 font-medium uppercase truncate">{db.permission.replace('_', ' ')}</span>
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

                        {/* Footer */}
                        <div className="mt-2 pt-2 border-t border-foreground/5 dark:border-white/5 px-1">
                            <button className="w-full py-2 flex items-center justify-center gap-2 rounded-lg border border-dashed border-foreground/10 dark:border-white/10 text-[10px] font-bold text-foreground/40 dark:text-white/30 hover:text-foreground dark:hover:text-white hover:border-foreground/30 dark:hover:border-white/30 hover:bg-foreground/[0.05] dark:hover:bg-white/5 transition-all uppercase tracking-wide">
                                + Add Connection
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
