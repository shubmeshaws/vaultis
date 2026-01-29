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
        <div className="space-y-8 p-8 relative min-h-screen">
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
                        <div className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-500">
                            Forensic Analysis
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Audit Trail</p>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground">Query Audit Logs</h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                        Complete forensic record of all database operations
                    </p>
                </div>
            </div>

            <div style={{ zoom: 0.9 }}>
                <AuditLogsClient
                    initialLogs={initialLogs as any}
                    users={users as any}
                    databases={databases as any}
                />
            </div>
        </div>
    )
}
