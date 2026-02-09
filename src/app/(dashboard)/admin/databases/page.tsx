import { getCurrentUser } from '@/lib/auth/middleware'
import { redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { DatabaseManagementClient } from '@/components/admin/DatabaseManagementClient'
import { getDatabases } from '@/lib/actions/databaseActions'

export default async function DatabasesPage() {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    const { databases = [] } = await getDatabases()

    // Map summary stats
    const totalDatabases = databases.length
    const healthyDatabases = databases.length // Simplified for now
    const totalGroups = databases.reduce((acc: number, db: any) => acc + (db._count?.groups || 0), 0)

    return (
        <DatabaseManagementClient initialDatabases={databases as any} />
    )
}
