'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type UserRole = 'Admin' | 'Developer' | 'Analyst' | 'Viewer'
export type UserStatus = 'Active' | 'Pending' | 'Suspended'

export interface User {
    id: string
    name: string
    email: string
    role: UserRole
    status: UserStatus
    access: string[]
    lastActive: string
}

interface UserTableProps {
    users: User[]
    onEditRole?: (user: User) => void
    onEditPermissions?: (user: User) => void
    onToggleStatus?: (user: User) => void
}

const Icons = {
    More: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
    ),
    Shield: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    Database: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
    ),
    Edit: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    ),
}

export function UserTable({ users, onEditRole, onEditPermissions, onToggleStatus }: UserTableProps) {
    const getRoleColor = (role: UserRole) => {
        switch (role) {
            case 'Admin': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            case 'Developer': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            case 'Analyst': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            case 'Viewer': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
        }
    }

    const getStatusColor = (status: UserStatus) => {
        switch (status) {
            case 'Active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            case 'Pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            case 'Suspended': return 'bg-red-500/10 text-red-400 border-red-500/20'
        }
    }

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">User</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Role</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Database Access</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    <AnimatePresence mode="popLayout">
                        {users.map((user, idx) => (
                            <motion.tr
                                key={user.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group hover:bg-white/[0.02] transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{user.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getRoleColor(user.role)}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {user.access.map((db) => (
                                            <span key={db} className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                                <Icons.Database className="w-2.5 h-2.5 opacity-50" />
                                                {db}
                                            </span>
                                        ))}
                                        {user.access.length === 0 && (
                                            <span className="text-[10px] italic text-muted-foreground opacity-50">No access granted</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(user.status)}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEditPermissions?.(user)}
                                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/20 transition-all shadow-sm"
                                            title="Manage Permissions"
                                        >
                                            <Icons.Shield className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onEditRole?.(user)}
                                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/20 transition-all shadow-sm"
                                            title="Edit Role"
                                        >
                                            <Icons.Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onToggleStatus?.(user)}
                                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all shadow-sm"
                                        >
                                            <Icons.More className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </tbody>
            </table>

            {users.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
                    <div className="p-4 rounded-full bg-white/5 text-muted-foreground/20">
                        <Icons.Shield className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">No users found</p>
                </div>
            )}
        </div>
    )
}
