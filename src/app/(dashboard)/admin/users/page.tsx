import { getCurrentUser } from '@/lib/auth/middleware'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import {
    Users,
    Shield,
    CheckCircle,
} from 'lucide-react'
import { UserManagementClient } from '@/components/admin/UserManagementClient'
import { getGroups } from '@/lib/actions/userActions'

export default async function UsersManagementPage() {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    // Fetch all users with their groups
    const users = await (prisma.user as any).findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            groups: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })

    const { groups: initialGroups } = await getGroups()

    // Map the users to include a default 'access' field for the client component
    const mappedUsers = users.map(user => ({
        ...user,
        access: ['Production DB'], // Default mock access
    }))

    const totalUsers = users.length
    const activeUsers = users.filter((u: any) => u.isActive).length
    const adminUsers = users.filter((u: any) => u.role === 'ADMIN').length

    return (
        <div className="min-h-screen space-y-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground uppercase italic leading-none">
                            Identity & Access
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2 font-medium tracking-wide">
                            Manage user permissions, security roles, and organizational groups
                        </p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-card/30 backdrop-blur-xl border-foreground/10 shadow-sm rounded-2xl overflow-hidden">
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

                    <Card className="bg-card/30 backdrop-blur-xl border-foreground/10 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardDescription className="uppercase tracking-widest text-[10px] font-bold text-muted-foreground">Access Enabled</CardDescription>
                            <CardTitle className="text-3xl font-black text-foreground">{activeUsers}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <p className="text-xs font-medium text-muted-foreground">Users with platform access</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/30 backdrop-blur-xl border-foreground/10 shadow-sm rounded-2xl overflow-hidden">
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

                <UserManagementClient
                    initialUsers={mappedUsers as any}
                    initialGroups={initialGroups || []}
                />
            </div>
        </div>
    )
}
