import { getCurrentUser } from '@/lib/auth/middleware'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db/prisma'
import { Users, Shield, Server, Activity, ArrowUpRight, Search, Settings, AlertTriangle, ChevronRight } from 'lucide-react'

export default async function AdminPage() {
  const user = await getCurrentUser()

  // Get some real stats
  const userCount = await prisma.user.count()
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8 p-8 relative min-h-full">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -z-10 pointer-events-none animate-pulse" />

      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-foreground/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-500">
              Protected Area
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">System Administration</p>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground">Command Center</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-10 px-4 bg-foreground/[0.05] hover:bg-foreground/[0.08] text-foreground rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
            <Settings className="w-4 h-4" />
            System Config
          </button>
          <button className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95">
            <Activity className="w-4 h-4" />
            Live Monitor
          </button>
        </div>
      </div>

      {/* Core Vitals */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Total Users", value: userCount, label: "Registered Accounts", icon: Users, color: "text-blue-500" },
          { title: "Privileged Access", value: adminCount, label: "Administrators", icon: Shield, color: "text-purple-500" },
          { title: "System Health", value: "98%", label: "Operational Status", icon: Server, color: "text-green-500" },
        ].map((stat, i) => (
          <Card key={i} className="bg-card/50 dark:bg-foreground/[0.02] backdrop-blur-xl border-foreground/10 hover:border-primary/20 transition-all overflow-hidden relative group shadow-sm">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}>
              <stat.icon className="w-24 h-24" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="uppercase tracking-widest text-[10px] font-bold text-muted-foreground">{stat.title}</CardDescription>
              <CardTitle className="text-4xl font-black text-foreground">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stat.color.replace('text-', 'bg-')}`} />
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Management Panel */}
        <Card className="md:col-span-2 border-foreground/10 bg-foreground/[0.02]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold">Recent Registrations</CardTitle>
              <CardDescription>Latest users to join the platform</CardDescription>
            </div>
            <a href="/admin/users" className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-wider flex items-center gap-1">
              Manage All <ArrowUpRight className="w-3 h-3" />
            </a>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-foreground/5 hover:border-primary/20 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center text-xs font-black text-muted-foreground uppercase">
                      {u.email?.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{u.name || 'Unnamed User'}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {u.role}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-foreground/5 rounded-lg transition-all">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts / Quick Config */}
        <div className="space-y-6">
          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-xs font-black text-red-500 uppercase tracking-widest">System Alerts</span>
              </div>
              <CardTitle className="text-lg font-bold">Database Load</CardTitle>
              <CardDescription>No critical issues detected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-2 w-full bg-red-500/10 rounded-full overflow-hidden">
                <div className="h-full w-[25%] bg-red-500 rounded-full" />
              </div>
              <p className="text-xs text-red-500/80 mt-2 font-medium text-right">25% Capacity</p>
            </CardContent>
          </Card>

          <Card className="border-foreground/10 bg-foreground/[0.02]">
            <CardHeader>
              <CardTitle className="text-base font-bold">Quick Configurations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['General Settings', 'API Keys', 'Audit Logs', 'Security Policies'].map((link, i) => (
                <a key={i} href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-foreground/5 transition-colors group">
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{link}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </a>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
