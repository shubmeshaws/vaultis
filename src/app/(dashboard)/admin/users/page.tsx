'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { UserTable, User, UserRole, UserStatus } from '@/components/admin/UserTable'
import { PermissionEditor } from '@/components/admin/PermissionEditor'

const Icons = {
    Search: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
    UserAdd: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
    ),
    Filter: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
    ),
}

export default function UsersManagementPage() {
    const [users, setUsers] = useState<User[]>([
        { id: '1', name: 'Dexter Morgan', email: 'dexter@queryflow.io', role: 'Admin', status: 'Active', access: ['Production DB', 'Inventory DB', 'Marketing DB'], lastActive: '2m ago' },
        { id: '2', name: 'James Doakes', email: 'doakes@queryflow.io', role: 'Developer', status: 'Active', access: ['Inventory DB', 'Analytics DB'], lastActive: '15m ago' },
        { id: '3', name: 'Debra Morgan', email: 'deb@queryflow.io', role: 'Analyst', status: 'Active', access: ['Marketing DB', 'Billing DB'], lastActive: '1h ago' },
        { id: '4', name: 'Vince Masuka', email: 'masuka@queryflow.io', role: 'Viewer', status: 'Pending', access: [], lastActive: 'Never' },
        { id: '5', name: 'Angel Batista', email: 'batista@queryflow.io', role: 'Developer', status: 'Suspended', access: ['Production DB'], lastActive: '3d ago' },
    ])

    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const handleEditPermissions = (user: User) => {
        setSelectedUser(user)
        setIsEditorOpen(true)
    }

    const handleSavePermissions = (userId: string, newAccess: string[]) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, access: newAccess } : u))
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                            <Icons.UserAdd className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground uppercase italic px-1">User <span className="text-primary not-italic">Identity</span></h1>
                    </div>
                    <p className="text-muted-foreground font-medium text-lg ml-1">Manage platform access, roles and security policies.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-medium focus:outline-none focus:border-primary/50 transition-all w-80 shadow-2xl"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest shadow-[0_8px_32px_rgba(var(--primary),0.3)] hover:shadow-[0_12px_48px_rgba(var(--primary),0.5)] transition-all">
                        <Icons.UserAdd className="w-4 h-4" />
                        Create User
                    </button>
                </div>
            </header>

            {/* Control Bar */}
            <div className="flex items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all">
                        <Icons.Filter className="w-3.5 h-3.5" />
                        All Roles
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all">
                        <Icons.Filter className="w-3.5 h-3.5" />
                        Status: Any
                    </button>
                </div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">
                    Showing {filteredUsers.length} Users
                </div>
            </div>

            {/* User Table Section */}
            <div className="relative">
                <UserTable
                    users={filteredUsers}
                    onEditPermissions={handleEditPermissions}
                    onEditRole={(user) => console.log('Edit role', user.id)}
                    onToggleStatus={(user) => console.log('Toggle status', user.id)}
                />

                {/* Subtle Background Glows */}
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
            </div>

            <PermissionEditor
                user={selectedUser}
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={handleSavePermissions}
            />
        </div>
    )
}
