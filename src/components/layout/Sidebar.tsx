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
    Command,
    Sun,
    Moon,
    ChevronDown,
    Server
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { DatabaseSelector, DatabaseOption } from '@/components/dashboard/DatabaseSelector'

export function Sidebar() {
    const pathname = usePathname()
    const { user, isAdmin } = useAuth()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [selectedDbId, setSelectedDbId] = useState('db-prod')

    useEffect(() => {
        setMounted(true)
    }, [])

    const links = [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/queries', label: 'Query Explorer', icon: Database },
        { href: '/queries/history', label: 'History', icon: Activity },
        { href: '/settings', label: 'Settings', icon: Settings },
    ]

    if (isAdmin) {
        links.splice(1, 0, { href: '/admin', label: 'Command Center', icon: Shield })
    }

    const databases: DatabaseOption[] = [
        { id: 'db-prod', name: 'Production DB', type: 'postgres', region: 'us-east-1', status: 'online', permission: 'admin' },
        { id: 'db-stage', name: 'Staging Cluster', type: 'mongo', region: 'eu-west-1', status: 'online', permission: 'read_write' },
        { id: 'db-archive', name: 'Cold Archive', type: 'mysql', region: 'ap-south-1', status: 'locked', permission: 'no_access' },
    ]

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    if (!mounted) return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-72 hidden lg:flex flex-col bg-background/5 border-r border-foreground/10 backdrop-blur-xl">
            <div className="h-20 flex items-center px-8 border-b border-foreground/5" />
        </aside>
    )

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-72 hidden lg:flex flex-col bg-[#05050A] border-r border-white/5 shadow-2xl z-[100] text-accent-foreground">
            {/* 1. Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-white/5">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all">
                        <Command className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-xl font-black tracking-tight text-white leading-none font-[family-name:var(--font-flexing)]">
                            VAULTIS
                        </span>
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mt-0.5">
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
            <div className="flex-1 py-8 px-4 space-y-1 overflow-y-auto">
                <p className="px-4 text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">Menu</p>
                {links.map((link) => {
                    const isActive = pathname === link.href
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden",
                                isActive
                                    ? "bg-indigo-600 shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] border border-indigo-500/50"
                                    : "hover:bg-white/5 hover:border-white/5 border border-transparent"
                            )}
                        >
                            <link.icon className={cn("w-4 h-4 relative z-10 transition-colors", isActive ? "text-white" : "text-white/40 group-hover:text-white")} />
                            <span className={cn("text-sm font-bold relative z-10 tracking-tight transition-colors", isActive ? "text-white" : "text-white/60 group-hover:text-white")}>
                                {link.label}
                            </span>
                        </Link>
                    )
                })}
            </div>

            {/* 4. Footer & Profile */}
            <div className="p-4 mx-4 mb-4 border-t border-white/5 space-y-3">
                <button
                    onClick={toggleTheme}
                    className="w-full h-9 flex items-center justify-between px-3 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
                >
                    <span className="text-xs font-medium flex items-center gap-2">
                        {theme === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                        Mode
                    </span>
                    <span className="text-[10px] font-mono opacity-50">{theme === 'dark' ? 'DARK' : 'LGHT'}</span>
                </button>

                <div className="bg-[#05050A] rounded-xl p-3 border border-indigo-500/20 backdrop-blur-md flex items-center gap-3 shadow-lg relative group overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                        {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0 z-10">
                        <p className="text-xs font-bold text-white truncate">{user?.name || 'User'}</p>
                        <button onClick={() => signOut()} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    )
}
