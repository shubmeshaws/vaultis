'use client'

import React, { useState, useMemo } from 'react'
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

    return (
        <div className="space-y-7">
            {/* Stats Overview */}
            {(!databases || databases.length === 0) && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center justify-between">
                    <span>⚠️ Debug: No databases received from server.</span>
                    <span className="text-xs font-mono bg-red-500/10 px-2 py-1 rounded">Length: {databases?.length || 0}</span>
                </div>
            )}
            <div className="grid gap-3 md:grid-cols-3">
                <Card className="bg-card/30 backdrop-blur-xl border-foreground/10 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="pb-1 pt-4 px-4">
                        <CardDescription className="uppercase tracking-widest text-[9px] font-bold text-muted-foreground">Total Users</CardDescription>
                        <CardTitle className="text-2xl font-black text-foreground">{stats.total}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-1">
                        <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-cyan-500" />
                            <p className="text-[10px] font-medium text-muted-foreground">Registered accounts</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/30 backdrop-blur-xl border-foreground/10 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="pb-1 pt-4 px-4">
                        <CardDescription className="uppercase tracking-widest text-[9px] font-bold text-muted-foreground">Access Enabled</CardDescription>
                        <CardTitle className="text-2xl font-black text-foreground">{stats.active}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-1">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <p className="text-[10px] font-medium text-muted-foreground">Users with platform access</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/30 backdrop-blur-xl border-foreground/10 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="pb-1 pt-4 px-4">
                        <CardDescription className="uppercase tracking-widest text-[9px] font-bold text-muted-foreground">Administrators</CardDescription>
                        <CardTitle className="text-2xl font-black text-foreground">{stats.admins}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-1">
                        <div className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-purple-500" />
                            <p className="text-[10px] font-medium text-muted-foreground">Privileged access</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="h-[calc(100vh-8rem)] flex flex-col">
                <div className="flex-1 flex flex-col overflow-hidden" style={{ zoom: 0.9 }}>
                    {/* Tabs */}
                    <div className="flex gap-4 border-b border-foreground/10 pb-px shrink-0">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'users' ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                            User Directory
                            {activeTab === 'users' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('groups')}
                            className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'groups' ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                            Groups & Access
                            {activeTab === 'groups' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/30 backdrop-blur-xl p-4 rounded-2xl border border-foreground/10 mt-6 shrink-0">
                        <div className="flex items-center gap-2 flex-1 w-full md:w-auto">
                            <div className="relative flex-1 md:max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder={activeTab === 'users' ? "Search by name or email..." : "Search groups..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all"
                                />
                            </div>
                            {activeTab === 'users' && (
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value as Role | 'ALL')}
                                    className="h-10 px-3 bg-foreground/5 border border-foreground/10 rounded-xl text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-primary/50"
                                >
                                    <option value="ALL">All Roles</option>
                                    <option value="USER">Users</option>
                                    <option value="ADMIN">Admins</option>
                                </select>
                            )}
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <button
                                onClick={() => setIsCreateGroupOpen(true)}
                                className="flex-1 md:flex-none h-10 px-4 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                            >
                                <Users className="w-4 h-4" />
                                New Group
                            </button>
                            <button
                                onClick={() => setIsCreateUserOpen(true)}
                                className="flex-1 md:flex-none h-10 px-4 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                            >
                                <UserPlus className="w-4 h-4" />
                                Add User
                            </button>
                        </div>
                    </div>

                    {/* Content Content */}
                    <div className="flex-1 overflow-hidden mt-6 relative">
                        {activeTab === 'users' ? (
                            <div className="bg-card/50 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-sm h-full flex flex-col">
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left relative">
                                        <thead className="bg-card/90 backdrop-blur-md border-b border-foreground/5 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-card/90">User Information</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-card/90">System Role</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-card/90">Groups</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-card/90">DB Access</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-card/90">System Access</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right bg-card/90">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-foreground/5">
                                            <AnimatePresence mode="popLayout">
                                                {displayUsers.map((user, idx) => (
                                                    <motion.tr
                                                        key={user.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.03 }}
                                                        className="group hover:bg-foreground/[0.02] transition-colors"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-black text-primary border border-primary/10">
                                                                    {user.name?.substring(0, 2).toUpperCase() || <UserCircle className="w-5 h-5" />}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-foreground">{user.name || 'Unnamed'}</p>
                                                                    <p className="text-[10px] text-muted-foreground font-medium">{user.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <select
                                                                value={user.role}
                                                                onChange={(e) => setRoleChangeModal({
                                                                    isOpen: true,
                                                                    user,
                                                                    targetRole: e.target.value as Role
                                                                })}
                                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${user.role === 'ADMIN'
                                                                    ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                                                                    : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
                                                                    }`}
                                                            >
                                                                <option value="USER" className="text-foreground">User</option>
                                                                <option value="ADMIN" className="text-foreground">Admin</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                                {user.groups?.length > 0 ? (
                                                                    <>
                                                                        {user.groups.slice(0, 2).map((group, i) => (
                                                                            <span key={i} className="px-2 py-0.5 rounded bg-primary/5 border border-primary/10 text-[9px] font-bold text-primary whitespace-nowrap">
                                                                                {group.name}
                                                                            </span>
                                                                        ))}
                                                                        {user.groups.length > 2 && (
                                                                            <span className="px-2 py-0.5 rounded bg-primary/5 border border-primary/10 text-[9px] font-bold text-primary whitespace-nowrap cursor-help" title={user.groups.slice(2).map(g => g.name).join(', ')}>
                                                                                +{user.groups.length - 2} more
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <span className="text-[9px] text-muted-foreground font-medium italic">No groups</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                                {user.access && user.access.length > 0 ? (
                                                                    <>
                                                                        {user.access.slice(0, 2).map((db, i) => (
                                                                            <span key={i} className="px-2 py-0.5 rounded bg-foreground/5 border border-foreground/10 text-[9px] font-bold text-muted-foreground whitespace-nowrap">
                                                                                {/* Find database name if possible, or show ID/fallback */}
                                                                                {databases?.find(d => d.id === db)?.name || db}
                                                                            </span>
                                                                        ))}
                                                                        {user.access.length > 2 && (
                                                                            <span className="px-2 py-0.5 rounded bg-foreground/5 border border-foreground/10 text-[9px] font-bold text-muted-foreground whitespace-nowrap cursor-help" title={user.access.map(a => databases?.find(d => d.id === a)?.name || a).join(', ')}>
                                                                                +{user.access.length - 2} more
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <span className="text-[9px] text-muted-foreground font-medium italic">No individual access</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleUpdateActive(user, !user.isActive)}
                                                                    className={`flex items-center gap-2 transition-all group/btn`}
                                                                >
                                                                    <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${user.isActive ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                        {user.isActive ? 'Enabled' : 'Disabled'}
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    onClick={() => setPermissionModal({ isOpen: true, user })}
                                                                    className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                                                                    title="Manage Database Permissions"
                                                                >
                                                                    <Shield className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateActive(user, !user.isActive)}
                                                                    className={`p-2 rounded-lg transition-colors ${user.isActive
                                                                        ? 'hover:bg-red-500/10 text-muted-foreground hover:text-red-500'
                                                                        : 'hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500'
                                                                        }`}
                                                                    title={user.isActive ? "Disable Account Access" : "Enable Account Access"}
                                                                >
                                                                    {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                                </button>
                                                                <button
                                                                    onClick={() => setDeleteModal({ isOpen: true, user })}
                                                                    className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                                                                    title="Delete User"
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

                                {filteredUsers.length === 0 && (
                                    <div className="py-20 text-center flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mb-4 text-muted-foreground/20">
                                            <Search className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">No matching users</h3>
                                        <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
                                    </div>
                                )}


                                {/* Pagination Footer */}
                                {filteredUsers.length > 0 && (
                                    <div className="px-6 py-4 border-t border-foreground/5 flex items-center justify-between bg-card/90 backdrop-blur-md shrink-0">
                                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                            Showing <span className="text-foreground">{startRow}</span> to <span className="text-foreground">{endRow}</span> of <span className="text-foreground">{filteredUsers.length}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setCurrentPage(1)}
                                                disabled={currentPage === 1}
                                                className="p-1.5 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ChevronsLeft className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="p-1.5 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>

                                            <div className="flex items-center gap-1 mx-2">
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    let pageNum: number
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i
                                                    } else {
                                                        pageNum = currentPage - 2 + i
                                                    }

                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => setCurrentPage(pageNum)}
                                                            className={`min-w-[28px] h-7 px-2 rounded-lg text-[10px] font-bold transition-all ${currentPage === pageNum
                                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                                : "hover:bg-foreground/10 text-muted-foreground hover:text-foreground"
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    )
                                                })}
                                            </div>

                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="p-1.5 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(totalPages)}
                                                disabled={currentPage === totalPages}
                                                className="p-1.5 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ChevronsRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                                    <AnimatePresence mode="popLayout">
                                        {groups.map((group, idx) => (
                                            <motion.div
                                                key={group.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group relative bg-card/50 backdrop-blur-xl border border-foreground/10 rounded-2xl p-6 hover:border-primary/30 transition-all shadow-sm"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                        <Users className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                const newName = prompt('Enter new group name:', group.name)
                                                                if (newName) {
                                                                    renameGroup(group.id, newName).then(res => {
                                                                        if (res.success) {
                                                                            setGroups(prev => prev.map(g => g.id === group.id ? { ...g, name: newName } : g))
                                                                            toast({ title: 'Group Renamed', description: 'Group name has been updated successfully.', type: 'success' })
                                                                        }
                                                                    })
                                                                }
                                                            }}
                                                            className="p-2 hover:bg-foreground/5 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteGroupModal({ isOpen: true, groupId: group.id })}
                                                            className="p-2 hover:bg-foreground/5 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <h3 className="text-base font-black text-foreground uppercase tracking-tight">{group.name}</h3>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{group.description || 'No description provided.'}</p>

                                                <div className="mt-6 flex items-center justify-between pt-4 border-t border-foreground/5">
                                                    <div className="flex -space-x-2 overflow-hidden">
                                                        {[...Array(Math.min(3, group._count?.users || 0))].map((_, i) => (
                                                            <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-foreground/10 flex items-center justify-center text-[8px] font-bold">
                                                                U{i + 1}
                                                            </div>
                                                        ))}
                                                        {(group._count?.users || 0) > 3 && (
                                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/5 text-[8px] font-bold ring-2 ring-background">
                                                                +{(group._count?.users || 0) - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                        {group._count?.users || 0} Members
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => setManageGroupModal({ isOpen: true, group })}
                                                    className="w-full mt-4 h-9 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    Manage Access
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {groups.length === 0 && (
                                        <div className="col-span-full py-20 text-center bg-card/30 rounded-2xl border border-dashed border-foreground/10">
                                            <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                            <h3 className="text-sm font-bold text-foreground">No groups established</h3>
                                            <button
                                                onClick={() => setIsCreateGroupOpen(true)}
                                                className="mt-4 text-xs font-black text-primary uppercase tracking-widest hover:underline"
                                            >
                                                Establish Your First Group
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </div>


                {/* Modals - Outside zoomed container to prevent distortion, but scaled internally */}
                <div className="z-[100]">
                    <SimpleConfirmationModal
                        isOpen={roleChangeModal.isOpen}
                        onClose={() => setRoleChangeModal({ isOpen: false, user: null, targetRole: null })}
                        onConfirm={handleRoleChange}
                        title="Update Privileges?"
                        description={`You are about to change the system permissions for ${roleChangeModal.user?.name || roleChangeModal.user?.email} to ${roleChangeModal.targetRole}. This change takes effect immediately.`}
                        confirmText="Yes, Change Role"
                        type="warning"
                    />

                    <SimpleConfirmationModal
                        isOpen={deleteModal.isOpen}
                        onClose={() => setDeleteModal({ isOpen: false, user: null })}
                        onConfirm={handleDeleteUser}
                        title="Terminate Account?"
                        description={`This will permanently remove the account for ${deleteModal.user?.name || deleteModal.user?.email}. All associated settings and history will be lost.`}
                        confirmText="Yes, Terminate"
                        type="danger"
                    />

                    <Portal>
                        <AnimatePresence>
                            {isCreateUserOpen && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pb-24">
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
                                                    Admin Panel
                                                </div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider">User Management (DBs: {databases?.length || 0})</p>
                                            </div>
                                            <div className="text-center mb-4">
                                                <h2 className="text-xl font-black tracking-tight">CREATE <span className="text-primary">ACCOUNT</span></h2>
                                                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Join the QueryX Network</p>
                                            </div>

                                            <form onSubmit={async (e) => {
                                                e.preventDefault()
                                                const formData = new FormData(e.currentTarget)
                                                const data = {
                                                    firstName: formData.get('firstName') as string,
                                                    lastName: formData.get('lastName') as string,
                                                    name: formData.get('name') as string,
                                                    email: formData.get('email') as string,
                                                    password: formData.get('password') as string,
                                                    confirmPassword: formData.get('confirmPassword') as string,
                                                    securityQuestion1: formData.get('securityQuestion1') as string,
                                                    securityAnswer1: formData.get('securityAnswer1') as string,
                                                    securityQuestion2: formData.get('securityQuestion2') as string,
                                                    securityAnswer2: formData.get('securityAnswer2') as string,
                                                }

                                                try {
                                                    const response = await fetch('/api/auth/register', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify(data),
                                                    })
                                                    const result = await response.json()

                                                    if (response.ok) {
                                                        const mappedNewUser = { ...result.user, access: ['Production DB'], groups: [] } as User
                                                        setUsers(prev => [mappedNewUser, ...prev])
                                                        toast({
                                                            title: 'Success',
                                                            description: 'User account created successfully.',
                                                            type: 'success'
                                                        })
                                                        setIsCreateUserOpen(false)
                                                    } else {
                                                        toast({
                                                            title: 'Error',
                                                            description: result.error || 'Please try again.',
                                                            type: 'error'
                                                        })
                                                    }
                                                } catch (err) {
                                                    toast({
                                                        title: 'Error',
                                                        description: 'An error occurred. Please try again.',
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
                                                        <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Email</label>
                                                        <input name="email" type="email" required className="w-full h-9 px-3 bg-foreground/5 border border-foreground/10 rounded-lg text-xs" placeholder="john@example.com" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Password</label>
                                                        <input name="password" type="password" required minLength={8} className="w-full h-9 px-3 bg-foreground/5 border border-foreground/10 rounded-lg text-xs" placeholder="••••••••" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Confirm</label>
                                                        <input name="confirmPassword" type="password" required minLength={8} className="w-full h-9 px-3 bg-foreground/5 border border-foreground/10 rounded-lg text-xs" placeholder="••••••••" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Security Question 1</label>
                                                        <select name="securityQuestion1" required className="w-full h-9 px-3 bg-foreground/5 border border-foreground/10 rounded-lg text-xs">
                                                            <option value="">Select a question</option>
                                                            <option value="What was your first pet's name?">What was your first pet's name?</option>
                                                            <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                                                            <option value="What city were you born in?">What city were you born in?</option>
                                                        </select>
                                                        <input name="securityAnswer1" required className="w-full h-9 px-3 bg-foreground/5 border border-foreground/10 rounded-lg text-xs mt-1" placeholder="Your answer" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Security Question 2</label>
                                                        <select name="securityQuestion2" required className="w-full h-9 px-3 bg-foreground/5 border border-foreground/10 rounded-lg text-xs">
                                                            <option value="">Select a question</option>
                                                            <option value="What was the model of your first car?">What was the model of your first car?</option>
                                                            <option value="What was the name of your elementary school?">What was the name of your elementary school?</option>
                                                        </select>
                                                        <input name="securityAnswer2" required className="w-full h-9 px-3 bg-foreground/5 border border-foreground/10 rounded-lg text-xs mt-1" placeholder="Your answer" />
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 pt-3">
                                                    <button type="submit" className="flex-1 h-10 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all">
                                                        Create Account
                                                    </button>
                                                    <button type="button" onClick={() => setIsCreateUserOpen(false)} className="flex-1 h-10 bg-foreground/5 border border-foreground/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-foreground/10 transition-all">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </Portal>


                </div>
                {/* Modals - Outside zoomed container to prevent distortion, but scaled internally */}
                <div className="z-[100]">
                    <SimpleConfirmationModal
                        isOpen={roleChangeModal.isOpen}
                        onClose={() => setRoleChangeModal({ isOpen: false, user: null, targetRole: null })}
                        onConfirm={handleRoleChange}
                        title="Update Privileges?"
                        description={`You are about to change the system permissions for ${roleChangeModal.user?.name || roleChangeModal.user?.email} to ${roleChangeModal.targetRole}. This change takes effect immediately.`}
                        confirmText="Yes, Change Role"
                        type="warning"
                    />

                    <SimpleConfirmationModal
                        isOpen={deleteModal.isOpen}
                        onClose={() => setDeleteModal({ isOpen: false, user: null })}
                        onConfirm={handleDeleteUser}
                        title="Terminate Account?"
                        description={`This will permanently remove the account for ${deleteModal.user?.name || deleteModal.user?.email}. All associated settings and history will be lost.`}
                        confirmText="Yes, Terminate"
                        type="danger"
                    />

                    <CreateGroupModal
                        isOpen={isCreateGroupOpen}
                        onClose={() => setIsCreateGroupOpen(false)}
                        initialUsers={users}
                        initialDatabases={databases}
                        onSuccess={(newGroup) => {
                            setGroups(prev => [newGroup, ...prev])
                            toast({
                                title: 'Group Established',
                                description: 'The new user group has been successfully created.',
                                type: 'success'
                            })
                            // If the new group has users, update the users state
                            if (newGroup.users && newGroup.users.length > 0) {
                                const userIds = newGroup.users.map((u: any) => u.id)
                                setUsers(prev => prev.map(u =>
                                    userIds.includes(u.id)
                                        ? { ...u, groups: [...(u.groups || []), { id: newGroup.id, name: newGroup.name }] }
                                        : u
                                ))
                            }
                        }}
                    />

                    <PermissionEditor
                        isOpen={permissionModal.isOpen}
                        user={permissionModal.user}
                        availableDatabases={databases}
                        onClose={() => setPermissionModal({ isOpen: false, user: null })}
                        onSave={handleSavePermissions}
                    />

                    <ManageGroupAccessModal
                        isOpen={manageGroupModal.isOpen}
                        group={manageGroupModal.group}
                        users={users}
                        databases={databases}
                        onClose={() => setManageGroupModal({ isOpen: false, group: null })}
                        onSuccess={(updatedGroup) => {
                            setGroups(prev => prev.map(g => g.id === updatedGroup.id ? { ...g, ...updatedGroup } : g))

                            // Update user states based on group membership changes
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
                                title: 'Group Updated',
                                description: 'Group access and members have been updated.',
                                type: 'success'
                            })
                        }}
                    />
                </div>
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
                            style={{ zoom: 0.9 }}
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

function ManageGroupAccessModal({ isOpen, group, onClose, onSuccess, users, databases }: { isOpen: boolean, group: any, onClose: () => void, onSuccess: (group: any) => void, users: User[], databases: any[] }) {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [selectedDatabases, setSelectedDatabases] = useState<string[]>([])
    const [userSearchQuery, setUserSearchQuery] = useState('')
    const [dbSearchQuery, setDbSearchQuery] = useState('')

    // Filter users and databases based on search queries
    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
    )

    const filteredDatabases = databases.filter(db =>
        db.name.toLowerCase().includes(dbSearchQuery.toLowerCase())
    )

    // Load initial state when group opens
    React.useEffect(() => {
        if (group && isOpen) {
            // Need to fetch current group details if not fully present, but assuming group object has necessary connections or we reload
            // For now, let's assume valid data or empty
            // In a real app we'd fetch the group's current relations here
            setSelectedUsers(group.users?.map((u: any) => u.id) || [])
            setSelectedDatabases(group.databases?.map((d: any) => d.id) || [])
        }
    }, [group, isOpen])

    const handleSave = async () => {
        setIsLoading(true)
        // Parallel updates
        const [usersRes, dbsRes] = await Promise.all([
            updateGroupUsers(group.id, selectedUsers),
            updateGroupDatabases(group.id, selectedDatabases)
        ])

        if (usersRes.success && dbsRes.success) {
            onSuccess({
                ...group,
                users: users.filter(u => selectedUsers.includes(u.id)).map(u => ({ id: u.id, name: u.name, email: u.email })),
                _count: { users: selectedUsers.length }
                // databases: ... (if we store them on group object in client)
            })
            onClose()
        }
        setIsLoading(false)
    }

    useScrollLock(isOpen)

    return (
        <Portal>
            <AnimatePresence>
                {isOpen && group && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pb-24">
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
                            style={{ zoom: 0.9 }}
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
