import { getCurrentUser } from '@/lib/auth/middleware'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import {
    Database,
    Server,
    CheckCircle,
    AlertCircle,
    XCircle,
    Users,
    Settings,
    Zap,
    ChevronLeft,
    Shield,
    Activity
} from 'lucide-react'

// Mock database data
const databases = [
    {
        id: '1',
        name: 'Production DB',
        type: 'PostgreSQL',
        version: '15.2',
        environment: 'production',
        status: 'healthy',
        assignedUsers: 12,
        host: 'prod-db.queryflow.io',
        lastChecked: '2 mins ago'
    },
    {
        id: '2',
        name: 'Analytics DB',
        type: 'MongoDB',
        version: '6.0',
        environment: 'production',
        status: 'healthy',
        assignedUsers: 8,
        host: 'analytics.queryflow.io',
        lastChecked: '5 mins ago'
    },
    {
        id: '3',
        name: 'Staging DB',
        type: 'PostgreSQL',
        version: '15.2',
        environment: 'staging',
        status: 'warning',
        assignedUsers: 5,
        host: 'staging-db.queryflow.io',
        lastChecked: '10 mins ago'
    },
    {
        id: '4',
        name: 'Development DB',
        type: 'MySQL',
        version: '8.0',
        environment: 'development',
        status: 'healthy',
        assignedUsers: 15,
        host: 'dev-db.queryflow.io',
        lastChecked: '1 min ago'
    },
    {
        id: '5',
        name: 'Cold Archive',
        type: 'PostgreSQL',
        version: '14.8',
        environment: 'archive',
        status: 'offline',
        assignedUsers: 2,
        host: 'archive.queryflow.io',
        lastChecked: '2 hours ago'
    }
]

export default async function DatabasesManagementPage() {
    const user = await getCurrentUser()

    if (!user || user.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    const totalDatabases = databases.length
    const healthyDatabases = databases.filter(db => db.status === 'healthy').length
    const totalUsers = databases.reduce((sum, db) => sum + db.assignedUsers, 0)

    return (
        <div className="space-y-8 p-8 relative min-h-full">
            {/* Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

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
                            <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                Admin Panel
                            </div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Database Management</p>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground">Database Registry</h1>
                        <p className="text-sm text-muted-foreground font-medium mt-1">
                            Monitor connections, manage access, and ensure system reliability
                        </p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-card/50 backdrop-blur-xl border-foreground/10 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="uppercase tracking-widest text-[10px] font-bold text-muted-foreground">Total Databases</CardDescription>
                            <CardTitle className="text-3xl font-black text-foreground">{totalDatabases}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Database className="w-4 h-4 text-indigo-500" />
                                <p className="text-xs font-medium text-muted-foreground">Connected instances</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-xl border-foreground/10 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="uppercase tracking-widest text-[10px] font-bold text-muted-foreground">Healthy Status</CardDescription>
                            <CardTitle className="text-3xl font-black text-foreground">{healthyDatabases}/{totalDatabases}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <p className="text-xs font-medium text-muted-foreground">Operational databases</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-xl border-foreground/10 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="uppercase tracking-widest text-[10px] font-bold text-muted-foreground">Total Access</CardDescription>
                            <CardTitle className="text-3xl font-black text-foreground">{totalUsers}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-cyan-500" />
                                <p className="text-xs font-medium text-muted-foreground">Assigned users</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Database Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {databases.map((db) => (
                    <Card
                        key={db.id}
                        className={`bg-card/50 backdrop-blur-xl border-foreground/10 hover:border-foreground/20 transition-all shadow-sm group relative overflow-hidden ${db.status === 'offline' ? 'opacity-60' : ''
                            }`}
                    >
                        {/* Environment Tag */}
                        <div className="absolute top-4 right-4">
                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${db.environment === 'production'
                                    ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                    : db.environment === 'staging'
                                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                        : db.environment === 'development'
                                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                            : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                                }`}>
                                {db.environment}
                            </span>
                        </div>

                        <CardHeader className="pb-3">
                            <div className="flex items-start gap-3">
                                <div className={`p-3 rounded-xl ${db.type === 'PostgreSQL'
                                        ? 'bg-blue-500/10 text-blue-500'
                                        : db.type === 'MongoDB'
                                            ? 'bg-green-500/10 text-green-500'
                                            : 'bg-orange-500/10 text-orange-500'
                                    }`}>
                                    <Database className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-lg font-bold truncate">{db.name}</CardTitle>
                                    <CardDescription className="text-xs mt-0.5">
                                        {db.type} {db.version}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Connection Health */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Connection Health</span>
                                    {db.status === 'healthy' ? (
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-xs font-bold text-emerald-500">Healthy</span>
                                        </div>
                                    ) : db.status === 'warning' ? (
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                            <span className="text-xs font-bold text-amber-500">Warning</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                            <span className="text-xs font-bold text-red-500">Offline</span>
                                        </div>
                                    )}
                                </div>
                                <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${db.status === 'healthy'
                                                ? 'bg-emerald-500 w-full'
                                                : db.status === 'warning'
                                                    ? 'bg-amber-500 w-[60%]'
                                                    : 'bg-red-500 w-[20%]'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Host & Users */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Server className="w-3.5 h-3.5" />
                                    <span className="font-mono truncate">{db.host}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Users className="w-3.5 h-3.5" />
                                    <span className="font-medium">{db.assignedUsers} assigned users</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Activity className="w-3.5 h-3.5" />
                                    <span>Last checked {db.lastChecked}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-2 border-t border-foreground/5">
                                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all">
                                    <Zap className="w-3 h-3" />
                                    Test Connection
                                </button>
                                <button className="p-2 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors" title="Edit permissions">
                                    <Shield className="w-4 h-4" />
                                </button>
                                <button className="p-2 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors" title="Settings">
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>
                        </CardContent>

                        {/* Subtle Glow Effect */}
                        <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${db.status === 'healthy'
                                ? 'bg-gradient-to-br from-emerald-500/5 to-transparent'
                                : db.status === 'warning'
                                    ? 'bg-gradient-to-br from-amber-500/5 to-transparent'
                                    : 'bg-gradient-to-br from-red-500/5 to-transparent'
                            }`} />
                    </Card>
                ))}
            </div>
        </div>
    )
}
