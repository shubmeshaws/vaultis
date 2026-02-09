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

    // Fetch all users with their groups and direct databases
    const users = await (prisma.user as any).findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            groups: {
                select: {
                    id: true,
                    name: true
                }
            },
            directDatabases: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })

    const { groups: initialGroups } = await getGroups()

    // Fetch databases directly to ensure fresh data
    const databases = await prisma.database.findMany({
        select: { id: true, name: true, type: true }
    })
    console.log('Page Direct Fetch - Databases:', databases.length)

    // Map the users to include 'access' field (IDs of direct databases) for the client component
    const mappedUsers = users.map((user: any) => ({
        ...user,
        access: user.directDatabases?.map((db: any) => db.id) || [],
    }))

    return (
        <UserManagementClient
            initialUsers={mappedUsers as any}
            initialGroups={initialGroups || []}
            initialDatabases={databases || []}
        />
    )
}
