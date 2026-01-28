import { getCurrentUser } from '@/lib/auth/middleware'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import {
    Users,
    Shield,
    Search,
    Filter,
    Edit,
    Trash2,
    Lock,
    Unlock,
    Database,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronLeft
} from 'lucide-react'

export default async function UsersManagementPage() {
    const user = await getCurrentUser()

    if (!user || user.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    // Fetch all users with their details
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    })

    const totalUsers = users.length
    const activeUsers = users.filter(u => u.emailVerified).length
    const adminUsers = users.filter(u => u.role === 'ADMIN').length

    return (
        <div className="space-y-8 p-8 relative min-h-full">
            {/* Background Glow */}
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

            {/* Header */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <a
                        href="/admin"
                        className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </a>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-500">
                                Admin Panel
                            </div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">User Management</p>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground">User Directory</h1>
                        <p className="text-sm text-muted-foreground font-medium mt-1">
                            Manage user accounts, roles, and database permissions
                        </p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-card/50 backdrop-blur-xl border-foreground/10 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="uppercase tracking-widest text-[10px] font-bold text-muted-foreground">Total Users</CardDescription>
                            <CardTitle className="text-3xl font-black text-foreground">{totalUsers}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-cyan-500" />
                                <p className="text-xs font-medium text-muted-foreground">Registered accounts</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-xl border-foreground/10 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="uppercase tracking-widest text-[10px] font-bold text-muted-foreground">Active Users</CardDescription>
                            <CardTitle className="text-3xl font-black text-foreground">{activeUsers}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <p className="text-xs font-medium text-muted-foreground">Verified accounts</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-xl border-foreground/10 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="uppercase tracking-widest text-[10px] font-bold text-muted-foreground">Administrators</CardDescription>
                            <CardTitle className="text-3xl font-black text-foreground">{adminUsers}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-purple-500" />
                                <p className="text-xs font-medium text-muted-foreground">Privileged access</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* User Management Table */}
            <Card className="bg-card/50 backdrop-blur-xl border-foreground/10 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-foreground/5 pb-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle className="text-lg font-bold">All Users</CardTitle>
                            <CardDescription>Manage roles, permissions, and account status</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="h-10 pl-10 pr-4 bg-foreground/5 border border-foreground/10 rounded-lg text-sm focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>
                            <button className="h-10 px-4 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                                <Filter className="w-4 h-4" />
                                Filter
                            </button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-foreground/[0.02] border-b border-foreground/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Database Access</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Joined</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-foreground/5">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-foreground/[0.02] transition-colors group">
                                        {/* User Info */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center text-xs font-black text-muted-foreground uppercase">
                                                    {u.email?.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">{u.name || 'Unnamed User'}</p>
                                                    <p className="text-xs text-muted-foreground">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role */}
                                        <td className="px-6 py-4">
                                            <select
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${u.role === 'ADMIN'
                                                        ? 'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20'
                                                        : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 hover:bg-cyan-500/20'
                                                    }`}
                                                defaultValue={u.role}
                                            >
                                                <option value="USER">User</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                        </td>

                                        {/* Database Access */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Database className="w-4 h-4 text-indigo-500" />
                                                <span className="text-sm font-medium text-foreground">
                                                    {u.role === 'ADMIN' ? 'All Databases' : 'Production'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            {u.emailVerified ? (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-xs font-bold text-emerald-500">Active</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                                    <span className="text-xs font-bold text-amber-500">Pending</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Joined Date */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(u.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="p-2 rounded-lg hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-500 transition-colors"
                                                    title="Edit permissions"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-2 rounded-lg hover:bg-amber-500/10 text-muted-foreground hover:text-amber-500 transition-colors"
                                                    title={u.emailVerified ? "Suspend account" : "Activate account"}
                                                >
                                                    {u.emailVerified ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                                                    title="Delete user"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
