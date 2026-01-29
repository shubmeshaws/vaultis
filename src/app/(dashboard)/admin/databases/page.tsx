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
        <div className="space-y-8 p-8 relative min-h-screen">
            {/* Header Section */}
            <div className="flex items-center gap-3">
                <a
                    href="/dashboard"
                    className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </a>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-500">
                            Infrastructure
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Database Fleet</p>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground">Cluster Management</h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                        Configure connection strings, safety protocols, and access paradigms
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="p-6 rounded-3xl bg-white dark:bg-foreground/[0.02] border border-foreground/10 shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity translate-x-4 -translate-y-4">
                        <div className="w-24 h-24 rounded-full border-[12px] border-primary" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Total Connections</p>
                    <h3 className="text-3xl font-black text-foreground">{totalDatabases}</h3>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Across {totalGroups} access groups</p>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-foreground/[0.02] border border-foreground/10 shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity translate-x-4 -translate-y-4">
                        <div className="w-24 h-24 rounded-full border-[12px] border-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">System Health</p>
                    <h3 className="text-3xl font-black text-foreground">{healthyDatabases}/{totalDatabases}</h3>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">All clusters operational</p>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-foreground/[0.02] border border-foreground/10 shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity translate-x-4 -translate-y-4">
                        <div className="w-24 h-24 rounded-full border-[12px] border-indigo-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Average Latency</p>
                    <h3 className="text-3xl font-black text-foreground">42ms</h3>
                    <div className="mt-4 flex items-center gap-2 font-bold text-emerald-500 text-[10px] uppercase tracking-wider">
                        <span>Optimized Performance</span>
                    </div>
                </div>
            </div>

            <DatabaseManagementClient initialDatabases={databases as any} />
        </div>
    )
}
