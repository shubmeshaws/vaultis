import { getCurrentUser } from '@/lib/auth/middleware'
import { redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { AuditLogsClient } from '@/components/admin/AuditLogsClient'
import { getAuditLogs, getAuditLogUsers, getAuditLogDatabases } from '@/lib/actions/auditActions'


export default async function AuditLogsPage() {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    const { logs: initialLogs } = await getAuditLogs({})
    const { users } = await getAuditLogUsers()
    const { databases } = await getAuditLogDatabases()

    return (
        <AuditLogsClient
            initialLogs={initialLogs as any}
            users={users as any}
            databases={databases as any}
        />
    )
}
