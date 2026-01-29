'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Database,
    Play,
    Users,
    Shield,
    Activity,
    FileText,
    Settings,
    LayoutDashboard,
    ChevronRight,
    Command,
    Terminal,
    Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandAction {
    id: string
    label: string
    description?: string
    icon: React.ComponentType<{ className?: string }>
    category: 'navigation' | 'database' | 'query' | 'admin'
    action: () => void
    keywords?: string[]
}

interface CommandPaletteProps {
    isOpen: boolean
    onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    // Reset state when opening/closing
    useEffect(() => {
        if (isOpen) {
            setSearchQuery('')
            setSelectedIndex(0)
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [isOpen])

    // Define all available commands
    const commands: CommandAction[] = [
        // Navigation
        {
            id: 'nav-dashboard',
            label: 'Go to Dashboard',
            description: 'View system overview and metrics',
            icon: LayoutDashboard,
            category: 'navigation',
            action: () => router.push('/dashboard'),
            keywords: ['home', 'overview']
        },
        {
            id: 'nav-queries',
            label: 'Go to Query Explorer',
            description: 'Write and execute SQL queries',
            icon: Terminal,
            category: 'navigation',
            action: () => router.push('/queries'),
            keywords: ['sql', 'editor', 'write', 'terminal']
        },
        {
            id: 'nav-admin',
            label: 'Go to Command Center',
            description: 'Full system administration',
            icon: Shield,
            category: 'navigation',
            action: () => router.push('/admin'),
            keywords: ['settings', 'control', 'admin']
        },
        {
            id: 'nav-users',
            label: 'Manage Users',
            description: 'User accounts, roles and permissions',
            icon: Users,
            category: 'admin',
            action: () => router.push('/admin/users'),
            keywords: ['accounts', 'permissions', 'roles']
        },
        {
            id: 'nav-databases',
            label: 'Manage Databases',
            description: 'Database connections and health status',
            icon: Database,
            category: 'admin',
            action: () => router.push('/admin/databases'),
            keywords: ['connections', 'instances']
        },
        {
            id: 'nav-audit',
            label: 'View Audit Logs',
            description: 'Forensic query history and access logs',
            icon: Activity,
            category: 'admin',
            action: () => router.push('/admin/audit-logs'),
            keywords: ['logs', 'history', 'forensic']
        },
        // Database Actions
        {
            id: 'db-production',
            label: 'Switch to Production DB',
            description: 'PostgreSQL 15.2 • Region: us-east-1',
            icon: Database,
            category: 'database',
            action: () => {
                console.log('Switched to Production DB')
            },
            keywords: ['prod', 'postgres']
        },
        {
            id: 'db-staging',
            label: 'Switch to Staging DB',
            description: 'PostgreSQL 15.2 • Region: eu-west-1',
            icon: Database,
            category: 'database',
            action: () => {
                console.log('Switched to Staging DB')
            },
            keywords: ['stage', 'postgres']
        },
        {
            id: 'db-analytics',
            label: 'Switch to Analytics DB',
            description: 'MongoDB 6.0 • Region: ap-south-1',
            icon: Database,
            category: 'database',
            action: () => {
                console.log('Switched to Analytics DB')
            },
            keywords: ['mongo', 'analytics']
        },
        // Query Actions
        {
            id: 'query-run',
            label: 'Run Current Query',
            description: 'Execute the active SQL in editor',
            icon: Play,
            category: 'query',
            action: () => {
                console.log('Running query')
            },
            keywords: ['execute', 'run', 'play']
        },
        {
            id: 'query-new',
            label: 'New Query Template',
            description: 'Start a fresh workspace',
            icon: Sparkles,
            category: 'query',
            action: () => router.push('/queries'),
            keywords: ['create', 'fresh', 'template']
        }
    ]

    // Filter commands based on search query
    const filteredCommands = commands.filter(cmd => {
        const query = searchQuery.toLowerCase()
        return (
            cmd.label.toLowerCase().includes(query) ||
            cmd.description?.toLowerCase().includes(query) ||
            cmd.keywords?.some(k => k.includes(query))
        )
    })

    // Group commands by category
    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) acc[cmd.category] = []
        acc[cmd.category].push(cmd)
        return acc
    }, {} as Record<string, CommandAction[]>)

    const categoryLabels = {
        navigation: 'Navigation',
        database: 'Databases',
        query: 'Query Actions',
        admin: 'Administration'
    }

    // Handle internal keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return

            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex(prev => Math.max(prev - 1, 0))
            } else if (e.key === 'Enter') {
                e.preventDefault()
                if (filteredCommands[selectedIndex]) {
                    executeCommand(filteredCommands[selectedIndex])
                }
            } else if (e.key === 'Escape') {
                e.preventDefault()
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, filteredCommands, selectedIndex, onClose])

    const executeCommand = (command: CommandAction) => {
        command.action()
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#05050A]/80 backdrop-blur-md pointer-events-auto"
                        onClick={onClose}
                    />

                    {/* Command Palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-2xl bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto ring-1 ring-white/5"
                    >
                        {/* Inner Gradient Glow */}
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

                        {/* Search Input */}
                        <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5 relative z-10">
                            <Search className="w-5 h-5 text-white/40" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="What do you want to do? (e.g. 'run query')"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setSelectedIndex(0)
                                }}
                                className="flex-1 bg-transparent text-lg font-medium text-white focus:outline-none placeholder:text-white/20"
                            />
                            <div className="flex items-center gap-1.5">
                                <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-black text-white/40 tracking-wider">
                                    ESC
                                </kbd>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="max-h-[50vh] overflow-y-auto custom-scrollbar relative z-10">
                            {filteredCommands.length === 0 ? (
                                <div className="px-6 py-16 text-center">
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                        <Search className="w-5 h-5 text-white/20" />
                                    </div>
                                    <p className="text-white/40 font-medium">No commands found for &quot;{searchQuery}&quot;</p>
                                    <p className="text-xs text-white/20 mt-1">Try searching for &quot;admin&quot; or &quot;database&quot;</p>
                                </div>
                            ) : (
                                <div className="py-3">
                                    {Object.entries(groupedCommands).map(([category, cmds]) => (
                                        <div key={category} className="mb-4 last:mb-0">
                                            <div className="px-6 py-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60">
                                                    {categoryLabels[category as keyof typeof categoryLabels]}
                                                </p>
                                            </div>
                                            <div className="space-y-0.5 px-3">
                                                {cmds.map((cmd) => {
                                                    const globalIndex = filteredCommands.indexOf(cmd)
                                                    const isSelected = globalIndex === selectedIndex
                                                    const Icon = cmd.icon

                                                    return (
                                                        <button
                                                            key={cmd.id}
                                                            onClick={() => executeCommand(cmd)}
                                                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                            className={cn(
                                                                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative group",
                                                                isSelected
                                                                    ? "bg-indigo-500/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)] border border-indigo-500/30"
                                                                    : "hover:bg-white/[0.03] border border-transparent"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                                                                isSelected
                                                                    ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                                                    : "bg-white/5 text-white/40"
                                                            )}>
                                                                <Icon className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1 text-left min-w-0">
                                                                <p className={cn(
                                                                    "text-sm font-bold transition-colors",
                                                                    isSelected ? "text-white" : "text-white/70"
                                                                )}>
                                                                    {cmd.label}
                                                                </p>
                                                                {cmd.description && (
                                                                    <p className="text-xs text-white/30 truncate mt-0.5">
                                                                        {cmd.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {isSelected && (
                                                                <motion.div
                                                                    layoutId="arrow"
                                                                    className="text-indigo-400"
                                                                >
                                                                    <ChevronRight className="w-4 h-4" />
                                                                </motion.div>
                                                            )}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-5 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <kbd className="px-1.5 py-1 rounded bg-white/5 border border-white/10 font-mono text-white/40 font-black">↑↓</kbd>
                                    <span>Navigate</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-1.5 py-1 rounded bg-white/5 border border-white/10 font-mono text-white/40 font-black">↵</kbd>
                                    <span>Select</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400/40 uppercase tracking-widest">
                                <Command className="w-3 h-3" />
                                <span>+ K to toggle</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
