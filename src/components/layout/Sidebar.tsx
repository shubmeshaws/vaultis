'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useAuth } from '@/hooks/useAuth'
import { Role } from '@/lib/auth/permissions'
import { useState } from 'react'
import { DatabaseSelector, DatabaseOption } from '@/components/dashboard/DatabaseSelector'

export function Sidebar() {
    const pathname = usePathname()
    const { user, isAdmin } = useAuth()
    const [selectedDatabase, setSelectedDatabase] = useState('prod-1')

    const databases: DatabaseOption[] = [
        {
            id: 'prod-1',
            name: 'Production DB',
            type: 'postgres',
            permission: 'Owner',
            status: 'connected'
        },
        {
            id: 'staging-1',
            name: 'Staging Environment',
            type: 'mysql',
            permission: 'Editor',
            status: 'connected'
        },
        {
            id: 'dev-local',
            name: 'Local Dev',
            type: 'sqlite',
            permission: 'Viewer',
            status: 'disconnected'
        },
        {
            id: 'analytics-heavy',
            name: 'Analytics Engine',
            type: 'redis',
            permission: 'Restricted',
            status: 'connected',
            isRestricted: true
        },
    ]

    const navigation = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            name: 'Queries',
            href: '/queries',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
        },
    ]

    if (isAdmin) {
        navigation.push({
            name: 'Admin',
            href: '/admin',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        })
        navigation.push({
            name: 'Users',
            href: '/admin/users',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
        })
        navigation.push({
            name: 'Databases',
            href: '/admin/databases',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
            ),
        })
        navigation.push({
            name: 'Audit Log',
            href: '/admin/audit',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
        })
    }

    const currentDb = databases.find(db => db.id === selectedDatabase)

    return (
        <aside className="fixed left-0 top-0 h-screen w-56 bg-[#0F1115] border-r border-[#1C1F26] flex flex-col z-50">
            {/* Logo */}
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-lg bg-[#1C1F26] border border-[#2D313A] flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">QueryFlow</h1>
                        <p className="text-xs text-muted-foreground">Query Platform</p>
                    </div>
                </Link>
            </div>

            {/* Database Selector */}
            <div className="px-4 pb-4">
                <DatabaseSelector
                    databases={databases}
                    selectedId={selectedDatabase}
                    onSelect={setSelectedDatabase}
                />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                font-medium text-sm transition-all
                ${isActive
                                    ? 'bg-primary/5 text-primary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'
                                }
              `}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* User Profile */}
            {user && (
                <div className="p-4 border-t border-[#1C1F26]">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer">
                        <div className="w-9 h-9 rounded-lg bg-[#1C1F26] border border-[#2D313A] flex items-center justify-center text-primary font-semibold text-sm">
                            {(user.name || user.email || 'U')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{user.name || user.email}</div>
                            <div className="text-xs text-muted-foreground">
                                {user.role === Role.ADMIN ? 'Administrator' : 'User'}
                            </div>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                            title="Sign Out"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </aside>
    )
}
