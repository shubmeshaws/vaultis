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
    BarChart3
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
        fetchDbs()
    }, [isAdmin, user, setDatabases])

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
        { href: '/settings', label: 'Settings', icon: Settings },
    )

    // Mock databases removed

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    if (!mounted) return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-56 hidden lg:flex flex-col bg-background/5 border-r border-foreground/10 backdrop-blur-xl">
            <div className="h-20 flex items-center px-8 border-b border-foreground/5" />
        </aside>
    )

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-56 hidden lg:flex flex-col bg-background dark:bg-[#05050A] border-r border-foreground/5 dark:border-white/5 shadow-2xl z-[100] text-foreground dark:text-accent-foreground">
            {/* 1. Logo Area */}
            <div className="h-14 flex items-center px-4 border-b border-foreground/5 dark:border-white/5">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all">
                        <Command className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-base font-black tracking-tight text-foreground dark:text-white leading-none font-[family-name:var(--font-flexing)]">
                            VAULTIS
                        </span>
                        <span className="text-[7.5px] font-bold text-foreground/30 dark:text-white/30 uppercase tracking-[0.2em] mt-0.5">
                            Query Platform
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
                <button
                    onClick={toggleTheme}
                    className="w-full h-7.5 flex items-center justify-between px-2 rounded-lg hover:bg-foreground/5 dark:hover:bg-white/5 text-foreground/40 dark:text-white/40 hover:text-foreground dark:hover:text-white transition-all"
                >
                    <span className="text-[10px] font-medium flex items-center gap-1.5">
                        {theme === 'dark' ? <Moon className="w-2 h-2" /> : <Sun className="w-2 h-2" />}
                        Mode
                    </span>
                    <span className="text-[8px] font-mono opacity-50 uppercase">{theme === 'dark' ? 'DARK' : 'LIGHT'}</span>
                </button>

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
