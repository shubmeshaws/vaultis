'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface CommandAction {
    id: string
    title: string
    description: string
    category: 'Navigation' | 'Databases' | 'Tools' | 'Forensics'
    icon: React.ReactNode
    shortcut?: string
    onSelect: () => void
}

const Icons = {
    Search: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
    Terminal: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    Database: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
    ),
    Layout: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    ),
    Shield: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    History: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
}

interface CommandPaletteProps {
    isOpen: boolean
    onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const listRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const actions: CommandAction[] = useMemo(() => [
        {
            id: 'nav-overview',
            title: 'Overview Dashboard',
            description: 'Navigate to platform telemetry and metrics.',
            category: 'Navigation',
            icon: <Icons.Layout className="w-4 h-4" />,
            onSelect: () => router.push('/dashboard')
        },
        {
            id: 'nav-queries',
            title: 'SQL Analytics',
            description: 'Execute and manage database queries.',
            category: 'Navigation',
            icon: <Icons.Terminal className="w-4 h-4" />,
            onSelect: () => router.push('/queries')
        },
        {
            id: 'admin-users',
            title: 'Identity Management',
            description: 'Admin: Manage users and platform access.',
            category: 'Navigation',
            icon: <Icons.Shield className="w-4 h-4" />,
            onSelect: () => router.push('/admin/users')
        },
        {
            id: 'admin-db',
            title: 'Infrastructure Registry',
            description: 'Admin: Manage clusters and node health.',
            category: 'Navigation',
            icon: <Icons.Database className="w-4 h-4" />,
            onSelect: () => router.push('/admin/databases')
        },
        {
            id: 'admin-audit',
            title: 'Forensic Audit Log',
            description: 'Admin: Trace platform activity and session history.',
            category: 'Forensics',
            icon: <Icons.History className="w-4 h-4" />,
            onSelect: () => router.push('/admin/audit')
        },
        {
            id: 'tool-new-query',
            title: 'Create Forensic Workspace',
            description: 'Initialize a new investigation query.',
            category: 'Tools',
            icon: <Icons.Terminal className="w-4 h-4" />,
            shortcut: 'N',
            onSelect: () => router.push('/queries/new')
        }
    ], [router])

    const filteredActions = useMemo(() => {
        if (!query) return actions
        return actions.filter(action =>
            action.title.toLowerCase().includes(query.toLowerCase()) ||
            action.description.toLowerCase().includes(query.toLowerCase()) ||
            action.category.toLowerCase().includes(query.toLowerCase())
        )
    }, [query, actions])

    useEffect(() => {
        setSelectedIndex(0)
    }, [query])

    useEffect(() => {
        if (!isOpen) {
            setQuery('')
            setSelectedIndex(0)
        }
    }, [isOpen])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(i => Math.min(i + 1, filteredActions.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(i => Math.max(i - 1, 0))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (filteredActions[selectedIndex]) {
                filteredActions[selectedIndex].onSelect()
                onClose()
            }
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-2xl"
                    />

                    {/* Palette */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: -20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: -20 }}
                        className="relative w-full max-w-2xl bg-[#0F1115]/90 border border-[#2D313A] rounded-2xl overflow-hidden shadow-2xl"
                    >
                        {/* Search Bar */}
                        <div className="relative border-b border-[#1C1F26] bg-white/[0.02]">
                            <Icons.Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                autoFocus
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Command or fuzzy search..."
                                className="w-full pl-16 pr-6 py-6 bg-transparent text-xl font-medium text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10 text-[10px] font-black font-mono text-muted-foreground uppercase opacity-50">ESC</span>
                                <span className="text-muted-foreground/20 text-sm">/</span>
                                <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Quit</span>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="max-h-[60vh] overflow-y-auto no-scrollbar py-4" ref={listRef}>
                            {filteredActions.length > 0 ? (
                                <div className="space-y-4 px-4">
                                    {['Navigation', 'Databases', 'Tools', 'Forensics'].map(category => {
                                        const categoryActions = filteredActions.filter(a => a.category === category)
                                        if (categoryActions.length === 0) return null

                                        return (
                                            <div key={category} className="space-y-2">
                                                <h5 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{category}</h5>
                                                <div className="space-y-1">
                                                    {categoryActions.map((action) => {
                                                        const globalIndex = filteredActions.findIndex(a => a.id === action.id)
                                                        const isSelected = globalIndex === selectedIndex

                                                        return (
                                                            <div
                                                                key={action.id}
                                                                onClick={() => {
                                                                    action.onSelect()
                                                                    onClose()
                                                                }}
                                                                className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${isSelected
                                                                    ? 'bg-primary/20 border border-primary/30'
                                                                    : 'hover:bg-white/5 border border-transparent'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`p-2.5 rounded-xl transition-all ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-muted-foreground group-hover:bg-white/10'
                                                                        }`}>
                                                                        {action.icon}
                                                                    </div>
                                                                    <div>
                                                                        <div className={`text-sm font-black tracking-tight ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                                                            {action.title}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground group-hover:text-muted-foreground/80">
                                                                            {action.description}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {action.shortcut && (
                                                                    <div className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black font-mono text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity uppercase">
                                                                        {action.shortcut}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="py-20 text-center flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground/20">
                                        <Icons.Search className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-foreground uppercase tracking-widest italic">No matches found</p>
                                        <p className="text-xs text-muted-foreground mt-1 font-medium italic opacity-50">Try searching for navigational keywords or platform tools.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 grayscale opacity-50">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">System Ready</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest opacity-40">
                                <div className="flex items-center gap-1.5">
                                    <span className="px-1 py-0.5 rounded bg-white/10">↑↓</span>
                                    <span>Browse</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="px-1 py-0.5 rounded bg-white/10">ENTER</span>
                                    <span>Select</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
