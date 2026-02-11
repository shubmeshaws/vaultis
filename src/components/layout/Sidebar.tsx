'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Shield,
    Database,
    Activity,
    Settings,
    LogOut,
    User,
    Users,
    Command,
    Sun,
    Moon,
    ChevronDown,
    Server,
    FileText,
    BarChart3,
    Bot
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { DatabaseSelector, DatabaseOption } from '@/components/dashboard/DatabaseSelector'
import { getUserDatabases } from '@/lib/actions/databaseActions'
import { useDatabase } from '@/contexts/DatabaseContext'

export function Sidebar() {
    const pathname = usePathname()
    const { user, isAdmin } = useAuth()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const { selectedDbId, setSelectedDbId, databases, setDatabases } = useDatabase()

    useEffect(() => {
        setMounted(true)
        const fetchDbs = async () => {
            const result = await getUserDatabases()
            if (result.success && result.databases) {
                const formattedDbs: DatabaseOption[] = result.databases.map((db: any) => ({
                    id: db.id,
                    name: db.name,
                    type: (db.type?.toLowerCase() as any) || 'postgres',
                    region: db.environment || 'us-east-1',
                    status: db.isLocked ? 'locked' : 'online',
                    permission: db.isLocked ? 'no_access' : (isAdmin ? 'admin' : 'read_write')
                }))
                setDatabases(formattedDbs)
            }
        }
        if (user?.id) {
            fetchDbs()
        }
    }, [isAdmin, user?.id, setDatabases])

    const links = [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    ]

    if (isAdmin) {
        links.push(
            { href: '/admin', label: 'Command Center', icon: Shield },
            { href: '/admin/analyzer', label: 'Analyzer', icon: BarChart3 },
            { href: '/admin/users', label: 'User Management', icon: Users },
            { href: '/admin/databases', label: 'Database Management', icon: Server },
            { href: '/admin/audit-logs', label: 'Audit Logs', icon: FileText }
        )
    }

    links.push(
        { href: '/queries', label: 'Query Explorer', icon: Database },
        { href: '/meshy', label: 'Meshy AI', icon: Bot },
    )

    if (isAdmin) {
        links.push({ href: '/settings', label: 'Settings', icon: Settings })
    }

    // Mock databases removed

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    if (!mounted) return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 hidden lg:flex flex-col bg-background/5 border-r border-foreground/10 backdrop-blur-xl">
            <div className="h-20 flex items-center px-8 border-b border-foreground/5" />
        </aside>
    )

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 hidden lg:flex flex-col bg-background dark:bg-[#05050A] border-r border-foreground/5 dark:border-white/5 shadow-2xl z-[100] text-foreground dark:text-accent-foreground">
            {/* 1. Logo Area */}
            <div className="h-14 flex items-center px-4 border-b border-foreground/5 dark:border-white/5">
                <Link href="/" className="flex items-center group relative">
                    <div className="flex flex-col justify-center ml-8">
                        <span className="text-4xl font-black tracking-[0.05em] text-foreground dark:text-white leading-none transition-all group-hover:text-indigo-500 font-[family-name:var(--font-flexing)]">
                            VAULTIS
                        </span>
                        <span className="text-[7px] font-bold tracking-[0.5px] text-muted-foreground/60 uppercase mt-[-6px] ml-[2px] group-hover:text-indigo-500 transition-colors">
                            BY SHUBHAM MESHRAM
                        </span>
                    </div>
                </Link>
            </div>

            {/* 2. Database Dropdown */}
            <div className="px-4 mt-6">
                <DatabaseSelector
                    databases={databases}
                    selectedId={selectedDbId}
                    onSelect={(db) => setSelectedDbId(db.id)}
                />
            </div>

            {/* 3. Navigation Links */}
            <div className="flex-1 py-5 px-2.5 space-y-0.5 overflow-y-auto">
                <p className="px-2.5 text-[8.5px] font-bold text-foreground/20 dark:text-white/20 uppercase tracking-widest mb-1.5">Menu</p>
                {links.map((link) => {
                    const isActive = pathname === link.href
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "relative flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-200 group overflow-hidden",
                                isActive
                                    ? "bg-indigo-600 shadow-[0_0_12px_-4px_rgba(79,70,229,0.5)] border border-indigo-500/50"
                                    : "hover:bg-foreground/5 dark:hover:bg-white/5 hover:border-foreground/5 dark:hover:border-white/5 border border-transparent"
                            )}
                        >
                            <link.icon className={cn("w-3 h-3 relative z-10 transition-colors", isActive ? "text-white" : "text-foreground/40 dark:text-white/40 group-hover:text-foreground dark:group-hover:text-white")} />
                            <span className={cn("text-[12px] font-bold relative z-10 tracking-tight transition-colors", isActive ? "text-white" : "text-foreground/60 dark:text-white/60 group-hover:text-foreground dark:group-hover:text-white")}>
                                {link.label}
                            </span>
                        </Link>
                    )
                })}
            </div>

            {/* 4. Footer & Profile */}
            <div className="p-2.5 mx-2.5 mb-2.5 border-t border-foreground/5 dark:border-white/5 space-y-1.5">
                <div className="flex items-center p-1 bg-foreground/5 dark:bg-white/5 rounded-xl border border-foreground/5">
                    {['light', 'dark'].map((t) => {
                        const isActive = theme === t
                        return (
                            <button
                                key={t}
                                onClick={() => setTheme(t)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider relative transition-colors",
                                    isActive ? "text-foreground dark:text-white" : "text-muted-foreground hover:text-foreground/70"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="theme-pill"
                                        className="absolute inset-0 bg-background dark:bg-white/10 shadow-sm rounded-lg border border-foreground/5"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-1.5">
                                    {t === 'light' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                                    {t}
                                </span>
                            </button>
                        )
                    })}
                </div>

                <div className="bg-background dark:bg-[#05050A] rounded-lg p-2 border border-indigo-500/20 backdrop-blur-md flex items-center gap-2 shadow-lg relative group overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-6 h-6 rounded-md bg-indigo-500 text-white flex items-center justify-center font-bold text-[10px] shadow-inner">
                        {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0 z-10">
                        <p className="text-[10px] font-bold text-foreground dark:text-white truncate">{user?.name || 'User'}</p>
                        <button onClick={() => signOut()} className="text-[8px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    )
}
