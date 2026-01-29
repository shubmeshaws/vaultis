import { getCurrentUser } from '@/lib/auth/middleware'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { UserManagementClient } from '@/components/admin/UserManagementClient'
import { getGroups, getDatabases } from '@/lib/actions/userActions'

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
    const { databases } = await getDatabases()

    // Map the users to include a default 'access' field for the client component
    const mappedUsers = users.map(user => ({
        ...user,
        access: ['Production DB'], // Default mock access
    }))

    return (
        <div className="min-h-screen space-y-8">
            <div className="max-w-6xl mx-auto space-y-7">
                {/* Header Section */}
                <div className="flex items-center gap-3">
                    <a
                        href="/admin"
                        className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </a>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                Admin Panel
                            </div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">User Management</p>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground">Identity Registry</h1>
                        <p className="text-sm text-muted-foreground font-medium mt-1">
                            Manage user permissions, security roles, and organizational groups
                        </p>
                    </div>
                </div>



                <UserManagementClient
                    initialUsers={mappedUsers as any}
                    initialGroups={initialGroups || []}
                    initialDatabases={databases || []}
                />
            </div>
        </div>
    )
}
