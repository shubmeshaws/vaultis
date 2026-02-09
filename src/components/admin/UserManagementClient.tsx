'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
    Search,
    Filter,
    Plus,
    Users,
    UserPlus,
    Shield,
    Database,
    CheckCircle,
    AlertCircle,
    Edit,
    Trash2,
    Lock,
    Unlock,
    MoreVertical,
    ChevronLeft,
    X,
    UserCircle,
    Check,
    ChevronDown,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SimpleConfirmationModal } from '@/components/ui/SimpleConfirmationModal'
import { Portal } from '@/components/ui/Portal'
import {
    updateUserRole,
    deleteUser,
    toggleUserStatus,
    createUser,
    createGroup,
    updateUserActiveStatus,
    getGroups,
    deleteGroup,
    renameGroup,
    updateUserPermissions,
    updateGroupDatabases,
    updateGroupUsers
} from '@/lib/actions/userActions'
import { Role } from '@prisma/client'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/contexts/ToastContext'
import { PermissionEditor } from './PermissionEditor'
import { cn } from '@/lib/utils'


interface User {
    id: string
    name: string | null
    email: string
    role: Role
    emailVerified: Date | null
    isActive: boolean
    createdAt: Date
    access: string[]
    groups: Array<{ id: string, name: string }>
}


// Hook to lock body scroll
function useScrollLock(isOpen: boolean) {
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])
}

interface UserManagementClientProps {

    initialUsers: User[]
    initialGroups: any[]
    initialDatabases: any[]
}

export function UserManagementClient({ initialUsers, initialGroups, initialDatabases }: UserManagementClientProps) {
    console.log('UserManagementClient - initialDatabases:', initialDatabases)
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState<'users' | 'groups'>('users')
    const [users, setUsers] = useState(initialUsers)
    const [groups, setGroups] = useState(initialGroups)
    const [databases] = useState(initialDatabases)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL')

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 5

    // Modals state
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
    const [roleChangeModal, setRoleChangeModal] = useState<{ isOpen: boolean, user: User | null, targetRole: Role | null }>({
        isOpen: false,
        user: null,
        targetRole: null
    })
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, user: User | null }>({
        isOpen: false,
        user: null
    })
    const [permissionModal, setPermissionModal] = useState<{ isOpen: boolean, user: User | null }>({
        isOpen: false,
        user: null
    })
    const [manageGroupModal, setManageGroupModal] = useState<{ isOpen: boolean, group: any | null }>({
        isOpen: false,
        group: null
    })
    const [deleteGroupModal, setDeleteGroupModal] = useState<{ isOpen: boolean, groupId: string | null }>({
        isOpen: false,
        groupId: null
    })
    const [editGroupModal, setEditGroupModal] = useState<{ isOpen: boolean, group: any | null }>({
        isOpen: false,
        group: null
    })

    const stats = useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.isActive).length,
        admins: users.filter(u => u.role === 'ADMIN').length
    }), [users])



    // Scroll locks
    useScrollLock(isCreateUserOpen)
    useScrollLock(isCreateGroupOpen)
    useScrollLock(roleChangeModal.isOpen)
    useScrollLock(deleteModal.isOpen)
    useScrollLock(permissionModal.isOpen)
    useScrollLock(manageGroupModal.isOpen)
    useScrollLock(editGroupModal.isOpen)
    useScrollLock(deleteGroupModal.isOpen)

    // Filtered users
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
            return matchesSearch && matchesRole
        })
    }, [users, searchQuery, roleFilter])

    // Debug DB count (Remove later)
    console.log('Client Render - databases count:', databases?.length)

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
    const startRow = (currentPage - 1) * ITEMS_PER_PAGE + 1
    const endRow = Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)
    const displayUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, roleFilter])

    // Handlers
    const handleRoleChange = async () => {
        if (!roleChangeModal.user || !roleChangeModal.targetRole) return

        const res = await updateUserRole(roleChangeModal.user.id, roleChangeModal.targetRole)
        if (res.success) {
            setUsers(prev => prev.map(u =>
                u.id === roleChangeModal.user?.id ? { ...u, role: roleChangeModal.targetRole! } : u
            ))
            toast({
                title: 'Role Updated',
                description: `Successfully changed role for ${roleChangeModal.user.name || roleChangeModal.user.email} to ${roleChangeModal.targetRole}.`,
                type: 'success'
            })
            setRoleChangeModal({ isOpen: false, user: null, targetRole: null })
        } else {
            toast({
                title: 'Update Failed',
                description: res.error || 'Failed to update user role.',
                type: 'error'
            })
        }
    }

    const handleDeleteUser = async () => {
        if (!deleteModal.user) return

        const res = await deleteUser(deleteModal.user.id)
        if (res.success) {
            setUsers(prev => prev.filter(u => u.id !== deleteModal.user?.id))
            toast({
                title: 'User Deleted',
                description: 'The user account has been permanently removed.',
                type: 'success'
            })
            setDeleteModal({ isOpen: false, user: null })
        } else {
            toast({
                title: 'Deletion Failed',
                description: res.error || 'Failed to delete user account.',
                type: 'error'
            })
        }
    }

    const handleUpdateActive = async (user: User, active: boolean) => {
        const res = await updateUserActiveStatus(user.id, active)
        if (res.success) {
            setUsers(prev => prev.map(u =>
                u.id === user.id ? { ...u, isActive: active } : u
            ))
            toast({
                title: active ? 'Access Enabled' : 'Access Disabled',
                description: `Successfully ${active ? 'enabled' : 'disabled'} access for ${user.name || user.email}.`,
                type: 'success'
            })
        } else {
            toast({
                title: 'Operation Failed',
                description: res.error || 'Failed to update access status.',
                type: 'error'
            })
        }
    }

    const handleSavePermissions = async (userId: string, access: string[]) => {
        const res = await updateUserPermissions(userId, access)
        if (res.success) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, access } : u))
            toast({
                title: 'Permissions Updated',
                description: 'Database access grants have been successfully updated.',
                type: 'success'
            })
            setPermissionModal({ isOpen: false, user: null })
        } else {
            toast({
                title: 'Update Failed',
                description: res.error || 'Failed to update permissions.',
                type: 'error'
            })
        }
    }

    const handleRenameGroup = async (newName: string) => {
        if (!editGroupModal.group) return

        const res = await renameGroup(editGroupModal.group.id, newName)
        if (res.success) {
            setGroups(prev => prev.map(g => g.id === editGroupModal.group.id ? { ...g, name: newName } : g))
            toast({
                title: 'Group Renamed',
                description: 'Group name has been updated successfully.',
                type: 'success'
            })
            setEditGroupModal({ isOpen: false, group: null })
        } else {
            toast({
                title: 'Rename Failed',
                description: res.error || 'Failed to rename group.',
                type: 'error'
            })
        }
    }

    const handleDeleteGroup = async () => {
        if (!deleteGroupModal.groupId) return

        const res = await deleteGroup(deleteGroupModal.groupId)
        if (res.success) {
            setGroups(prev => prev.filter(g => g.id !== deleteGroupModal.groupId))
            toast({
                title: 'Group Deleted',
                description: 'The group has been permanently removed.',
                type: 'success'
            })
            setDeleteGroupModal({ isOpen: false, groupId: null })
        } else {
            toast({
                title: 'Deletion Failed',
                description: res.error || 'Failed to delete group.',
                type: 'error'
            })
        }
    }

    return (
        <div className="space-y-8 p-6 relative max-w-[1600px] mx-auto min-h-full">
            {/* Premium Background Ambience */}
            <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-foreground/5 pb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin"
                        className="p-3 rounded-2xl bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-all border border-foreground/5"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1.5 shadow-sm">
                                <Users className="w-3.5 h-3.5" />
                                Personnel Registry
                            </div>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-50">/ Administration</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground leading-none italic flex flex-wrap items-center gap-x-4">
                            IAM <span className="text-primary not-italic">Manager</span>
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium mt-2 max-w-xl">Identity, Access & Permission orchestration platform for QueryX nodes</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 md:mt-2">
                    <button
                        onClick={() => setIsCreateGroupOpen(true)}
                        className="h-10 px-6 bg-foreground/5 hover:bg-foreground/10 text-foreground border border-foreground/5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all"
                    >
                        <Users className="w-4 h-4" />
                        Create Group
                    </button>
                    <button
                        onClick={() => setIsCreateUserOpen(true)}
                        className="h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-primary/20 active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" />
                        Provision User
                    </button>
                </div>
            </div>

            {/* Stats Overview - Premium Glow Version */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Total Node Population', value: stats.total, icon: Users, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                    { label: 'Active Sessions', value: stats.active, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                    { label: 'Privileged Entities', value: stats.admins, icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative p-6 rounded-[2rem] border backdrop-blur-3xl transition-all duration-500 bg-card border-foreground/10 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden flex flex-col justify-between"
                    >
                        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl", stat.bg)} />
                        <div className="relative z-10 flex justify-between items-start">
                            <div className={cn("p-4 rounded-2xl bg-background border transition-all duration-500 shadow-inner group-hover:scale-110", stat.border)}>
                                <stat.icon className={cn("w-6 h-6", stat.color)} />
                            </div>
                            <div className="px-3 py-1 rounded-full border border-foreground/10 bg-background/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-sm">
                                Vitals
                            </div>
                        </div>
                        <div className="relative z-10 mt-6">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] mb-1 opacity-70">{stat.label}</p>
                            <h3 className="text-3xl font-black text-foreground tracking-tighter tabular-nums leading-none">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex-1 flex flex-col">
                {/* Tabs & Search Unified Bar */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 border-b border-foreground/5 pb-6">
                    <div className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`pb-4 px-1 text-xs font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'users' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Node Directory
                            {activeTab === 'users' && <motion.div layoutId="tab-underline" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.6)]" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('groups')}
                            className={`pb-4 px-1 text-xs font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'groups' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Security Sectors
                            {activeTab === 'groups' && <motion.div layoutId="tab-underline" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.6)]" />}
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
                        <div className="relative flex-1 xl:w-96 shadow-2xl shadow-primary/5">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                            <input
                                type="text"
                                placeholder={activeTab === 'users' ? "Search entities..." : "Search sectors..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-10 pl-14 pr-6 bg-foreground/[0.03] border border-foreground/10 rounded-2xl text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/30 focus:bg-background"
                            />
                        </div>
                        {activeTab === 'users' && (
                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 pointer-events-none" />
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value as Role | 'ALL')}
                                    className="h-10 pl-12 pr-10 bg-foreground/[0.03] border border-foreground/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 cursor-pointer hover:bg-foreground/[0.05] transition-all appearance-none shadow-sm"
                                >
                                    <option value="ALL">All Clearances</option>
                                    <option value="USER">User Clearance</option>
                                    <option value="ADMIN">Admin Overlord</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 mt-6 relative">
                    <AnimatePresence mode="wait">
                        {activeTab === 'users' ? (
                            <motion.div
                                key="users-tab"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="h-full flex flex-col"
                            >
                                <div className="bg-card/30 backdrop-blur-3xl border border-foreground/10 rounded-3xl shadow-2xl overflow-hidden h-full flex flex-col">
                                    <div className="flex-1 overflow-x-auto custom-scrollbar">
                                        <table className="w-full text-left relative border-collapse min-w-[1000px]">
                                            <thead className="bg-background/80 backdrop-blur-3xl border-b border-foreground/10 sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Identity & Signature</th>
                                                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Clearance Level</th>
                                                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Assignments</th>
                                                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Individual Access</th>
                                                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">System Status</th>
                                                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Directives</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-foreground/5">
                                                <AnimatePresence mode="popLayout">
                                                    {displayUsers.map((user, idx) => (
                                                        <motion.tr
                                                            key={user.id}
                                                            initial={{ opacity: 0, y: 15 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.05, type: 'spring', damping: 25 }}
                                                            className="group hover:bg-primary/[0.02] transition-all duration-300"
                                                        >
                                                            <td className="px-6 py-2.5 border-transparent">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="relative">
                                                                        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-black text-primary border border-primary/10 shadow-inner">
                                                                            {user.name ? (
                                                                                <span className="tracking-tighter">{user.name.substring(0, 2).toUpperCase()}</span>
                                                                            ) : (
                                                                                <UserCircle className="w-6 h-6" />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{user.name || 'Anonymous Node'}</p>
                                                                        <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase opacity-60 mt-0.5">{user.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-3.5 border-transparent">
                                                                <select
                                                                    value={user.role}
                                                                    onChange={(e) => setRoleChangeModal({
                                                                        isOpen: true,
                                                                        user,
                                                                        targetRole: e.target.value as Role
                                                                    })}
                                                                    className={cn(
                                                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer focus:ring-2 focus:ring-primary/20",
                                                                        user.role === 'ADMIN'
                                                                            ? 'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20 shadow-lg shadow-purple-500/5'
                                                                            : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 hover:bg-cyan-500/20 shadow-lg shadow-cyan-500/5'
                                                                    )}
                                                                >
                                                                    <option value="USER">User Clearance</option>
                                                                    <option value="ADMIN">Admin Overlord</option>
                                                                </select>
                                                            </td>
                                                            <td className="px-6 py-3.5 border-transparent">
                                                                <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                                                                    {user.groups?.length > 0 ? (
                                                                        <>
                                                                            {user.groups.slice(0, 2).map((group, i) => (
                                                                                <span key={i} className="px-2.5 py-1 rounded-lg bg-primary/5 border border-primary/10 text-[9px] font-black uppercase tracking-wider text-primary shadow-sm">
                                                                                    {group.name}
                                                                                </span>
                                                                            ))}
                                                                            {user.groups.length > 2 && (
                                                                                <Tooltip content={user.groups.slice(2).map(g => g.name).join(', ')}>
                                                                                    <span className="px-2.5 py-1 rounded-lg bg-foreground/5 border border-foreground/10 text-[9px] font-black uppercase tracking-wider text-muted-foreground cursor-help hover:bg-foreground/10 transition-colors">
                                                                                        +{user.groups.length - 2} More
                                                                                    </span>
                                                                                </Tooltip>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-30">Unassigned</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5 border-transparent">
                                                                <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                                                                    {user.access && user.access.length > 0 ? (
                                                                        <>
                                                                            {user.access.slice(0, 2).map((db, i) => (
                                                                                <span key={i} className="px-2.5 py-1 rounded-lg bg-foreground/5 border border-foreground/10 text-[9px] font-black uppercase tracking-wider text-muted-foreground shadow-sm">
                                                                                    {databases?.find(d => d.id === db)?.name || db}
                                                                                </span>
                                                                            ))}
                                                                            {user.access.length > 2 && (
                                                                                <Tooltip content={user.access.map(a => databases?.find(d => d.id === a)?.name || a).join(', ')}>
                                                                                    <span className="px-2.5 py-1 rounded-lg bg-foreground/5 border border-foreground/10 text-[9px] font-black uppercase tracking-wider text-muted-foreground cursor-help hover:bg-foreground/10 transition-colors">
                                                                                        +{user.access.length - 2} More
                                                                                    </span>
                                                                                </Tooltip>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-30">Universal Access</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5 border-transparent">
                                                                <button
                                                                    onClick={() => handleUpdateActive(user, !user.isActive)}
                                                                    className="flex items-center gap-3 transition-all group/status"
                                                                >
                                                                    <div className={cn(
                                                                        "w-3.5 h-3.5 rounded-full border-2 transition-all duration-500",
                                                                        user.isActive
                                                                            ? "bg-emerald-500 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse"
                                                                            : "bg-red-500 border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                                                                    )} />
                                                                    <span className={cn(
                                                                        "text-[10px] font-black uppercase tracking-[0.15em]",
                                                                        user.isActive ? "text-emerald-500" : "text-red-500"
                                                                    )}>
                                                                        {user.isActive ? 'Active Node' : 'Deactivated'}
                                                                    </span>
                                                                </button>
                                                            </td>
                                                            <td className="px-8 py-5 border-transparent text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => setPermissionModal({ isOpen: true, user })}
                                                                        className="p-2.5 rounded-xl bg-foreground/5 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-primary/20"
                                                                        title="Database Grants"
                                                                    >
                                                                        <Shield className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateActive(user, !user.isActive)}
                                                                        className={cn(
                                                                            "p-2.5 rounded-xl bg-foreground/5 transition-all border border-transparent",
                                                                            user.isActive
                                                                                ? 'hover:bg-red-500/10 text-muted-foreground hover:text-red-500 hover:border-red-500/20'
                                                                                : 'hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 hover:border-emerald-500/20'
                                                                        )}
                                                                    >
                                                                        {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setDeleteModal({ isOpen: true, user })}
                                                                        className="p-2.5 rounded-xl bg-foreground/5 hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                                </AnimatePresence>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Table Footer / Pagination */}
                                    <div className="px-8 py-6 bg-background/50 backdrop-blur-3xl border-t border-foreground/10 flex items-center justify-between">
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                            Displaying <span className="text-foreground">{startRow}-{endRow}</span> of <span className="text-primary">{filteredUsers.length}</span> Entities
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-muted-foreground disabled:opacity-30 transition-all"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <div className="flex gap-1.5">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                                    <button
                                                        key={p}
                                                        onClick={() => setCurrentPage(p)}
                                                        className={cn(
                                                            "w-9 h-9 rounded-xl text-[10px] font-black transition-all border",
                                                            currentPage === p
                                                                ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                                : "bg-foreground/5 border-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                                                        )}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-muted-foreground disabled:opacity-30 transition-all"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="groups-tab"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10"
                            >
                                <AnimatePresence mode="popLayout">
                                    {groups.map((group, idx) => (
                                        <motion.div
                                            key={group.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group relative p-8 rounded-[2.5rem] bg-card/20 backdrop-blur-3xl border border-foreground/10 hover:border-primary/30 transition-all duration-500 shadow-xl hover:shadow-primary/5"
                                        >
                                            <div className="absolute top-0 right-0 p-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                                <button
                                                    onClick={() => setEditGroupModal({ isOpen: true, group })}
                                                    className="p-2.5 rounded-xl bg-background border border-foreground/10 text-muted-foreground hover:text-primary transition-all hover:bg-primary/5 hover:border-primary/20"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteGroupModal({ isOpen: true, groupId: group.id })}
                                                    className="p-2.5 rounded-xl bg-background border border-foreground/10 text-muted-foreground hover:text-red-500 transition-all hover:bg-red-500/5 hover:border-red-500/20"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary mb-6 border border-primary/10 group-hover:scale-110 transition-transform duration-500">
                                                <Users className="w-8 h-8" />
                                            </div>

                                            <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{group.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 font-medium opacity-60 italic">"{group.description || 'No sectoral mandate documented.'}"</p>

                                            <div className="mt-8 pt-6 border-t border-foreground/5 flex items-center justify-between">
                                                <div className="flex -space-x-3">
                                                    {[...Array(Math.min(4, group._count?.users || 0))].map((_, i) => (
                                                        <div key={i} className="w-8 h-8 rounded-xl border-2 border-background bg-foreground/10 flex items-center justify-center text-[10px] font-black text-primary shadow-sm overflow-hidden">
                                                            <div className="w-full h-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                                                                {i + 1}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(group._count?.users || 0) > 4 && (
                                                        <div className="w-8 h-8 rounded-xl border-2 border-background bg-primary/20 flex items-center justify-center text-[9px] font-black text-primary backdrop-blur-md">
                                                            +{(group._count?.users || 0) - 4}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="px-3 py-1 rounded-full bg-foreground/5 border border-foreground/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                    {group._count?.users || 0} Assets
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setManageGroupModal({ isOpen: true, group })}
                                                className="w-full mt-6 h-12 bg-foreground/[0.03] hover:bg-primary hover:text-primary-foreground border border-foreground/10 hover:border-primary rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300"
                                            >
                                                Configure Permissions
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {groups.length === 0 && (
                                    <div className="col-span-full py-32 text-center rounded-[3rem] border-2 border-dashed border-foreground/10 bg-foreground/[0.01]">
                                        <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-6 opacity-20">
                                            <Users className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-lg font-black text-foreground uppercase tracking-widest mb-2">No security sectors detected</h3>
                                        <button
                                            onClick={() => setIsCreateGroupOpen(true)}
                                            className="text-primary font-black uppercase tracking-[0.2em] text-[10px] hover:underline"
                                        >
                                            Establish New Sector Registry
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Global Access Modals Container */}
            <div className="z-[100]">
                {/* User Role Change Confirmation */}
                <SimpleConfirmationModal
                    isOpen={roleChangeModal.isOpen}
                    onClose={() => setRoleChangeModal({ isOpen: false, user: null, targetRole: null })}
                    onConfirm={handleRoleChange}
                    title="Promote / Demote Entity?"
                    description={`Review the clearance modification for ${roleChangeModal.user?.name || roleChangeModal.user?.email}. New classification: ${roleChangeModal.targetRole}. This will redefine their cross-network privileges.`}
                    confirmText="Finalize Permissions"
                    type="warning"
                />

                {/* User Deletion Confirmation */}
                <SimpleConfirmationModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, user: null })}
                    onConfirm={handleDeleteUser}
                    title="Redact Node Permanently?"
                    description={`This will purge ${deleteModal.user?.name || deleteModal.user?.email} from the IAM registry. This operation is irreversible and all spectral data will be lost.`}
                    confirmText="Confirm Purge"
                    type="danger"
                />

                {/* Group Deletion Confirmation */}
                <SimpleConfirmationModal
                    isOpen={deleteGroupModal.isOpen}
                    onClose={() => setDeleteGroupModal({ isOpen: false, groupId: null })}
                    onConfirm={handleDeleteGroup}
                    title="Dissolve Sector?"
                    description="Decommissioning this security sector will orphan all associated node assignments and reset their primary database clearance to NULL."
                    confirmText="Proceed with Decommission"
                    type="danger"
                />

                {/* Edit Group Name Modal */}
                <Portal>
                    <AnimatePresence>
                        {editGroupModal.isOpen && (
                            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                                    onClick={() => setEditGroupModal({ isOpen: false, group: null })}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                    className="relative z-10 w-full max-w-md bg-background rounded-[2.5rem] shadow-2xl border border-foreground/10 p-10"
                                    style={{ zoom: 0.9 }}
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black tracking-tight text-foreground leading-tight italic">Rename <span className="text-primary not-italic">Sector</span></h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 opacity-50">IAM Management Console</p>
                                        </div>
                                    </div>
                                    <form onSubmit={(e) => {
                                        e.preventDefault()
                                        const formData = new FormData(e.currentTarget)
                                        const newName = formData.get('groupName') as string
                                        if (newName) handleRenameGroup(newName)
                                    }} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Updated Label</label>
                                            <input
                                                name="groupName"
                                                type="text"
                                                required
                                                autoFocus
                                                defaultValue={editGroupModal.group?.name}
                                                className="w-full h-12 px-5 bg-foreground/5 border border-foreground/10 rounded-2xl text-sm font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:opacity-30"
                                                placeholder="e.g. CORE ANALYTICS"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full h-12 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-[0.98]"
                                        >
                                            Authorize Change
                                        </button>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </Portal>

                {/* Provision User (Create Account) Modal */}
                <Portal>
                    <AnimatePresence>
                        {isCreateUserOpen && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                                    onClick={() => setIsCreateUserOpen(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                    className="relative z-10 w-full max-w-3xl bg-background rounded-3xl shadow-2xl border border-foreground/10"
                                    style={{ zoom: 0.9 }}
                                >
                                    <div className="absolute top-4 right-4 z-20">
                                        <button onClick={() => setIsCreateUserOpen(false)} className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
                                            <X className="w-5 h-5 text-muted-foreground" />
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                                Registry Management
                                            </div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Node Provisioning</p>
                                        </div>
                                        <div className="text-center mb-4">
                                            <h2 className="text-xl font-black tracking-tight">CREATE <span className="text-primary">ACCOUNT</span></h2>
                                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Initialize Network Clearance</p>
                                        </div>

                                        <form onSubmit={async (e) => {
                                            e.preventDefault()
                                            const formData = new FormData(e.currentTarget)
                                            const data = Object.fromEntries(formData.entries())

                                            try {
                                                const response = await fetch('/api/auth/register', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(data),
                                                })
                                                const result = await response.json()

                                                if (response.ok) {
                                                    const mappedNewUser = { ...result.user, access: [], groups: [] } as User
                                                    setUsers(prev => [mappedNewUser, ...prev])
                                                    toast({
                                                        title: 'Node Provisioned',
                                                        description: 'User account established successfully.',
                                                        type: 'success'
                                                    })
                                                    setIsCreateUserOpen(false)
                                                } else {
                                                    toast({
                                                        title: 'Provisioning Failed',
                                                        description: result.error || 'Identity verification failed.',
                                                        type: 'error'
                                                    })
                                                }
                                            } catch (err) {
                                                toast({
                                                    title: 'Fatal Error',
                                                    description: 'Connection lost during handshake.',
                                                    type: 'error'
                                                })
                                            }
                                        }} className="space-y-3">
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">First Name</label>
                                                    <input name="firstName" required className="w-full h-9 px-3 bg-foreground/5 border border-foreground/10 rounded-lg text-xs" placeholder="John" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Last Name</label>
                                                    <input name="lastName" required className="w-full h-9 px-3 bg-foreground/5 border border-foreground/10 rounded-lg text-xs" placeholder="Doe" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Username</label>
                                                    <input name="name" required className="w-full h-9 px-3 bg-foreground/5 border border-foreground/10 rounded-lg text-xs" placeholder="johndoe" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Email Address</label>
                                                    <input name="email" type="email" required className="w-full h-9 px-3 bg-foreground/5 border border-foreground/10 rounded-lg text-xs" placeholder="john@example.com" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Access Key</label>
                                                    <input name="password" type="password" required minLength={8} className="w-full h-9 px-3 bg-foreground/5 border border-foreground/10 rounded-lg text-xs" placeholder="••••••••" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Verify Key</label>
                                                    <input name="confirmPassword" type="password" required minLength={8} className="w-full h-9 px-3 bg-foreground/5 border border-foreground/10 rounded-lg text-xs" placeholder="••••••••" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Security Challenge 1</label>
                                                    <select name="securityQuestion1" required className="w-full h-9 px-3 bg-foreground/5 border border-foreground/10 rounded-lg text-xs">
                                                        <option value="">Select challenge...</option>
                                                        <option value="What was your first pet's name?">What was your first pet's name?</option>
                                                        <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                                                        <option value="What city were you born in?">What city were you born in?</option>
                                                    </select>
                                                    <input name="securityAnswer1" required className="w-full h-9 px-3 bg-foreground/5 border border-foreground/10 rounded-lg text-xs mt-1" placeholder="Challenge Response" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Security Challenge 2</label>
                                                    <select name="securityQuestion2" required className="w-full h-9 px-3 bg-foreground/5 border border-foreground/10 rounded-lg text-xs">
                                                        <option value="">Select challenge...</option>
                                                        <option value="What was the model of your first car?">What was the model of your first car?</option>
                                                        <option value="What was the name of your elementary school?">What was the name of your elementary school?</option>
                                                    </select>
                                                    <input name="securityAnswer2" required className="w-full h-9 px-3 bg-foreground/5 border border-foreground/10 rounded-lg text-xs mt-1" placeholder="Challenge Response" />
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-3">
                                                <button type="submit" className="flex-1 h-10 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                                                    Establish Identity
                                                </button>
                                                <button type="button" onClick={() => setIsCreateUserOpen(false)} className="flex-1 h-10 bg-foreground/5 border border-foreground/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-foreground/10 transition-all">
                                                    Abort
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </Portal>

                {/* Create Group Modal */}
                <CreateGroupModal
                    isOpen={isCreateGroupOpen}
                    onClose={() => setIsCreateGroupOpen(false)}
                    initialUsers={users}
                    initialDatabases={databases}
                    onSuccess={(newGroup) => {
                        setGroups(prev => [newGroup, ...prev])
                        toast({
                            title: 'Sector Registry Created',
                            description: 'A new security sector has been established.',
                            type: 'success'
                        })
                        if (newGroup.users?.length > 0) {
                            const userIds = newGroup.users.map((u: any) => u.id)
                            setUsers(prev => prev.map(u =>
                                userIds.includes(u.id)
                                    ? { ...u, groups: [...(u.groups || []), { id: newGroup.id, name: newGroup.name }] }
                                    : u
                            ))
                        }
                    }}
                />

                {/* User Individual Permissions Editor */}
                <PermissionEditor
                    isOpen={permissionModal.isOpen}
                    user={permissionModal.user}
                    availableDatabases={databases}
                    onClose={() => setPermissionModal({ isOpen: false, user: null })}
                    onSave={handleSavePermissions}
                />

                {/* Sector Access & Membership Manager */}
                {manageGroupModal.isOpen && (
                    <ManageGroupAccessModal
                        isOpen={manageGroupModal.isOpen}
                        group={manageGroupModal.group}
                        users={users}
                        databases={databases}
                        onClose={() => setManageGroupModal({ isOpen: false, group: null })}
                        onSuccess={(updatedGroup) => {
                            setGroups(prev => prev.map(g => g.id === updatedGroup.id ? { ...g, ...updatedGroup } : g))
                            const groupMemberIds = updatedGroup.users.map((u: any) => u.id)
                            setUsers(prev => prev.map(u => {
                                const isInGroup = groupMemberIds.includes(u.id)
                                const currentGroups = u.groups || []
                                const groupExists = currentGroups.some(g => g.id === updatedGroup.id)
                                if (isInGroup && !groupExists) {
                                    return { ...u, groups: [...currentGroups, { id: updatedGroup.id, name: updatedGroup.name }] }
                                } else if (!isInGroup && groupExists) {
                                    return { ...u, groups: currentGroups.filter(g => g.id !== updatedGroup.id) }
                                }
                                return u
                            }))
                            toast({
                                title: 'Registry Synchronized',
                                description: 'Sector permissions and node memberships updated.',
                                type: 'success'
                            })
                        }}
                    />
                )}
            </div>
        </div>
    )
}


function CreateGroupModal({ isOpen, onClose, onSuccess, initialUsers, initialDatabases }: { isOpen: boolean, onClose: () => void, onSuccess: (group: any) => void, initialUsers?: User[], initialDatabases?: any[] }) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({ name: '', description: '' })
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [selectedDatabases, setSelectedDatabases] = useState<string[]>([])
    const [userSearchQuery, setUserSearchQuery] = useState('')
    const [dbSearchQuery, setDbSearchQuery] = useState('')

    // Filter users and databases based on search queries
    const filteredUsers = initialUsers?.filter(user =>
        user.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
    ) || []

    const filteredDatabases = initialDatabases?.filter(db =>
        db.name.toLowerCase().includes(dbSearchQuery.toLowerCase())
    ) || []

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const res = await createGroup({
            ...formData,
            userIds: selectedUsers,
            databaseIds: selectedDatabases
        })
        if (res.success && res.group) {
            onSuccess(res.group)
            onClose()
            setFormData({ name: '', description: '' })
            setSelectedUsers([])
            setSelectedDatabases([])
        }
        setIsLoading(false)
    }

    useScrollLock(isOpen)

    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl bg-background border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-foreground/5 flex items-center justify-between shrink-0">
                                <div>
                                    <h2 className="text-xl font-black tracking-tight text-foreground">Create User Group</h2>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Access Control</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row h-full overflow-hidden">
                                {/* Left Column: Details */}
                                <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar border-r border-foreground/5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Group Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full h-11 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                                            placeholder="e.g. Analytics Team"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 min-h-[120px]"
                                            placeholder="What this group manages..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-lg shadow-primary/20 mt-8"
                                    >
                                        {isLoading ? 'Creating Group...' : 'Create Group'}
                                    </button>
                                </div>

                                {/* Right Column: Relations */}
                                <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar bg-foreground/[0.02]">
                                    {/* Database Selection */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Default Databases</label>
                                        <div className="relative mb-2">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                value={dbSearchQuery}
                                                onChange={(e) => setDbSearchQuery(e.target.value)}
                                                placeholder="Search databases..."
                                                className="w-full h-9 pl-10 pr-9 bg-foreground/5 border border-foreground/10 rounded-lg text-xs focus:outline-none focus:border-primary/50"
                                            />
                                            {dbSearchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setDbSearchQuery('')}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-foreground/10 rounded transition-colors"
                                                >
                                                    <X className="w-3 h-3 text-muted-foreground" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-48 overflow-y-auto border border-foreground/10 rounded-xl p-2 bg-foreground/5 space-y-1">
                                            {filteredDatabases.map(db => (
                                                <label key={db.id} className="flex items-center gap-2 p-2 hover:bg-foreground/5 rounded-lg cursor-pointer transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-foreground/20 text-primary focus:ring-primary"
                                                        checked={selectedDatabases.includes(db.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedDatabases([...selectedDatabases, db.id])
                                                            else setSelectedDatabases(selectedDatabases.filter(id => id !== db.id))
                                                        }}
                                                    />
                                                    <span className="text-sm font-medium">{db.name}</span>
                                                </label>
                                            ))}
                                            {filteredDatabases.length === 0 && (
                                                <p className="text-xs text-muted-foreground p-2 italic">
                                                    {dbSearchQuery ? 'No databases match your search' : 'No databases available'}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Member Selection */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Add Members</label>
                                        <div className="relative mb-2">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                value={userSearchQuery}
                                                onChange={(e) => setUserSearchQuery(e.target.value)}
                                                placeholder="Search users..."
                                                className="w-full h-9 pl-10 pr-9 bg-foreground/5 border border-foreground/10 rounded-lg text-xs focus:outline-none focus:border-primary/50"
                                            />
                                            {userSearchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setUserSearchQuery('')}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-foreground/10 rounded transition-colors"
                                                >
                                                    <X className="w-3 h-3 text-muted-foreground" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-48 overflow-y-auto border border-foreground/10 rounded-xl p-2 bg-foreground/5 space-y-1">
                                            {filteredUsers.map(user => (
                                                <label key={user.id} className="flex items-center gap-2 p-2 hover:bg-foreground/5 rounded-lg cursor-pointer transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-foreground/20 text-primary focus:ring-primary"
                                                        checked={selectedUsers.includes(user.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedUsers([...selectedUsers, user.id])
                                                            else setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                                                        }}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{user.name || user.email}</span>
                                                        <span className="text-[10px] text-muted-foreground">{user.email}</span>
                                                    </div>
                                                </label>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <p className="text-xs text-muted-foreground p-2 italic">
                                                    {userSearchQuery ? 'No users match your search' : 'No users available'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Portal>
    )
}

function ManageGroupAccessModal({ isOpen, group, onClose, onSuccess, users, databases }: {
    isOpen: boolean,
    group: any,
    onClose: () => void,
    onSuccess: (group: any) => void,
    users: User[],
    databases: any[]
}) {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedUsers, setSelectedUsers] = useState<string[]>(group.users?.map((u: any) => u.id) || [])
    const [selectedDatabases, setSelectedDatabases] = useState<string[]>(group.databases?.map((d: any) => d.id) || [])
    const [userSearchQuery, setUserSearchQuery] = useState('')
    const [dbSearchQuery, setDbSearchQuery] = useState('')

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
    )

    const filteredDatabases = databases.filter(db =>
        db.name.toLowerCase().includes(dbSearchQuery.toLowerCase())
    )

    const handleSave = async () => {
        setIsLoading(true)
        const [usersRes, dbsRes] = await Promise.all([
            updateGroupUsers(group.id, selectedUsers),
            updateGroupDatabases(group.id, selectedDatabases)
        ])

        if (usersRes.success && dbsRes.success) {
            onSuccess({
                ...group,
                userIds: selectedUsers,
                databaseIds: selectedDatabases,
                users: users.filter(u => selectedUsers.includes(u.id)),
                databases: databases.filter(d => selectedDatabases.includes(d.id)),
                _count: { users: selectedUsers.length }
            })
            onClose()
        }
        setIsLoading(false)
    }

    useScrollLock(isOpen)

    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-background border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-foreground/5 flex items-center justify-between shrink-0">
                                <div>
                                    <h2 className="text-xl font-black tracking-tight text-foreground">Manage Access</h2>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{group.name}</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                                {/* Database Access */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Database Permissions</label>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{selectedDatabases.length} Selected</span>
                                    </div>
                                    <div className="relative mb-2">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={dbSearchQuery}
                                            onChange={(e) => setDbSearchQuery(e.target.value)}
                                            placeholder="Search databases..."
                                            className="w-full h-9 pl-10 pr-9 bg-foreground/5 border border-foreground/10 rounded-lg text-xs focus:outline-none focus:border-primary/50"
                                        />
                                        {dbSearchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setDbSearchQuery('')}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-foreground/10 rounded transition-colors"
                                            >
                                                <X className="w-3 h-3 text-muted-foreground" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-48 overflow-y-auto border border-foreground/10 rounded-xl p-2 bg-foreground/5 space-y-1">
                                        {filteredDatabases.map(db => (
                                            <label key={db.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${selectedDatabases.includes(db.id) ? 'bg-primary/10 border border-primary/20' : 'hover:bg-foreground/5 border border-transparent'}`}>
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedDatabases.includes(db.id) ? 'bg-primary border-primary' : 'border-foreground/30'}`}>
                                                    {selectedDatabases.includes(db.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={selectedDatabases.includes(db.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedDatabases([...selectedDatabases, db.id])
                                                        else setSelectedDatabases(selectedDatabases.filter(id => id !== db.id))
                                                    }}
                                                />
                                                <span className="text-sm font-bold">{db.name}</span>
                                            </label>
                                        ))}
                                        {filteredDatabases.length === 0 && (
                                            <p className="text-xs text-muted-foreground p-2 italic">
                                                {dbSearchQuery ? 'No databases match your search' : 'No databases available'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Member Management */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Group Members</label>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{selectedUsers.length} Selected</span>
                                    </div>
                                    <div className="relative mb-2">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={userSearchQuery}
                                            onChange={(e) => setUserSearchQuery(e.target.value)}
                                            placeholder="Search users..."
                                            className="w-full h-9 pl-10 pr-9 bg-foreground/5 border border-foreground/10 rounded-lg text-xs focus:outline-none focus:border-primary/50"
                                        />
                                        {userSearchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setUserSearchQuery('')}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-foreground/10 rounded transition-colors"
                                            >
                                                <X className="w-3 h-3 text-muted-foreground" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-48 overflow-y-auto border border-foreground/10 rounded-xl p-2 bg-foreground/5 space-y-1">
                                        {filteredUsers.map(user => (
                                            <label key={user.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${selectedUsers.includes(user.id) ? 'bg-primary/10 border border-primary/20' : 'hover:bg-foreground/5 border border-transparent'}`}>
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedUsers.includes(user.id) ? 'bg-primary border-primary' : 'border-foreground/30'}`}>
                                                    {selectedUsers.includes(user.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={selectedUsers.includes(user.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedUsers([...selectedUsers, user.id])
                                                        else setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                                                    }}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">{user.name || user.email}</span>
                                                    <span className="text-[10px] text-muted-foreground">{user.email}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-foreground/5 shrink-0">
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                                >
                                    {isLoading ? 'Saving Changes...' : 'Save Changes'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Portal>
    )
}

function Tooltip({ children, content }: { children: React.ReactNode, content: React.ReactNode }) {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <div className="relative flex items-center" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 min-w-max"
                    >
                        <div className="bg-popover text-popover-foreground text-xs rounded-lg p-2 shadow-xl border border-border">
                            {content}
                        </div>
                        <div className="w-2 h-2 bg-popover rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-border" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
