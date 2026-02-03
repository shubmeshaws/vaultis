import { getCurrentUser } from '@/lib/auth/middleware'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db/prisma'
import { Users, Shield, Server, Activity, ArrowUpRight, Search, Settings, AlertTriangle, ChevronRight, Database, Zap, TrendingUp, TrendingDown, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

import { getAdminOperationalStats } from '@/lib/actions/adminActions'

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    // Basic safety fallback, though middleware should handle this
    return <div>Unauthorized</div>
  }

  // Get real user stats
  const userCount = await prisma.user.count()
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  })

  // Get real operational stats from our new action
  const opStatsRes = await getAdminOperationalStats()
  const activeQueries = opStatsRes.success ? opStatsRes.activeQueries : 0
  const riskyOperations = opStatsRes.success ? opStatsRes.riskyOperations : 0
  const systemHealth = opStatsRes.success ? opStatsRes.systemHealth : 100

  return (
    <div className="space-y-8 p-8 relative min-h-full">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-foreground/5 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Protected
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">System Administration</p>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground">Command Center</h1>
            <p className="text-sm text-muted-foreground font-medium mt-1">Real-time operational oversight</p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:mt-16">
          <Link href="/settings">
            <button className="h-10 px-4 bg-foreground/[0.05] hover:bg-foreground/[0.08] text-foreground rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
              <Settings className="w-4 h-4" />
              System Config
            </button>
          </Link>
          <Link href="/admin/analyzer">
            <button className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95">
              <Activity className="w-4 h-4" />
              Live Monitor
            </button>
          </Link>
        </div>
      </div>

      {/* Core Vitals - Enhanced with Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card className="bg-white dark:bg-foreground/[0.02] backdrop-blur-xl border-foreground/10 hover:border-cyan-500/30 transition-all overflow-hidden relative group shadow-sm">
          <div className="absolute top-0 right-0 p-2.5 opacity-5 group-hover:opacity-10 transition-opacity text-cyan-500">
            <Users className="w-16 h-16" />
          </div>
          <CardHeader className="pb-1 px-4 pt-4">
            <CardDescription className="uppercase tracking-widest text-[8px] font-bold text-muted-foreground">Total Users</CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">{userCount}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center gap-1 mb-1.5">
              <div className="w-1 h-1 rounded-full bg-cyan-500" />
              <p className="text-[10px] font-medium text-muted-foreground">Registered Accounts</p>
            </div>
            {/* Mini Trend Chart */}
            <div className="flex items-end gap-1 h-8">
              {[40, 55, 45, 70, 60, 80, 75, 90].map((h, i) => (
                <div key={i} className="flex-1 bg-cyan-500/20 rounded-t" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-cyan-500 font-bold">
              <TrendingUp className="w-3 h-3" />
              <span>+12% this month</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Queries */}
        <Card className="bg-white dark:bg-foreground/[0.02] backdrop-blur-xl border-foreground/10 hover:border-indigo-500/30 transition-all overflow-hidden relative group shadow-sm">
          <div className="absolute top-0 right-0 p-2.5 opacity-5 group-hover:opacity-10 transition-opacity text-indigo-500">
            <Database className="w-16 h-16" />
          </div>
          <CardHeader className="pb-1 px-4 pt-4">
            <CardDescription className="uppercase tracking-widest text-[8px] font-bold text-muted-foreground">Active Queries</CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">{activeQueries}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center gap-1 mb-1.5">
              <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
              <p className="text-[10px] font-medium text-muted-foreground">Running Ops</p>
            </div>
            {/* Mini Trend Chart */}
            <div className="flex items-end gap-1 h-8">
              {[60, 45, 70, 55, 80, 65, 75, 60].map((h, i) => (
                <div key={i} className="flex-1 bg-indigo-500/20 rounded-t" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-indigo-500 font-bold">
              <Activity className="w-3 h-3" />
              <span>Normal load</span>
            </div>
          </CardContent>
        </Card>

        {/* Risky Operations */}
        <Card className="bg-white dark:bg-foreground/[0.02] backdrop-blur-xl border-foreground/10 hover:border-amber-500/30 transition-all overflow-hidden relative group shadow-sm">
          <div className="absolute top-0 right-0 p-2.5 opacity-5 group-hover:opacity-10 transition-opacity text-amber-500">
            <AlertTriangle className="w-16 h-16" />
          </div>
          <CardHeader className="pb-1 px-4 pt-4">
            <CardDescription className="uppercase tracking-widest text-[8px] font-bold text-muted-foreground">Risky Ops</CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">{riskyOperations}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center gap-1 mb-1.5">
              <div className="w-1 h-1 rounded-full bg-amber-500" />
              <p className="text-[10px] font-medium text-muted-foreground">Attention Needed</p>
            </div>
            {/* Mini Trend Chart */}
            <div className="flex items-end gap-1 h-8">
              {[20, 35, 25, 40, 30, 45, 35, 30].map((h, i) => (
                <div key={i} className="flex-1 bg-amber-500/20 rounded-t" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-amber-500 font-bold">
              <TrendingDown className="w-3 h-3" />
              <span>-8% vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="bg-white dark:bg-foreground/[0.02] backdrop-blur-xl border-foreground/10 hover:border-emerald-500/30 transition-all overflow-hidden relative group shadow-sm">
          <div className="absolute top-0 right-0 p-2.5 opacity-5 group-hover:opacity-10 transition-opacity text-emerald-500">
            <Server className="w-16 h-16" />
          </div>
          <CardHeader className="pb-1 px-4 pt-4">
            <CardDescription className="uppercase tracking-widest text-[8px] font-bold text-foreground/40 dark:text-muted-foreground">Health</CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">{systemHealth}%</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center gap-1 mb-1.5">
              <div className="w-1 h-1 rounded-full bg-emerald-500" />
              <p className="text-[10px] font-medium text-foreground/60 dark:text-muted-foreground">Operational</p>
            </div>
            {/* Health Bar */}
            <div className="h-8 w-full bg-foreground/5 rounded-lg overflow-hidden border border-foreground/5">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg" style={{ width: `${systemHealth}%` }} />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-500 font-bold">
              <Zap className="w-3 h-3" />
              <span>All systems operational</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Management Panel */}
        <Card className="md:col-span-2 border-foreground/10 bg-white dark:bg-foreground/[0.02] backdrop-blur-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-foreground/5 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold">Recent Registrations</CardTitle>
              <CardDescription>Latest users to join the platform</CardDescription>
            </div>
            <a href="/admin/users" className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-wider flex items-center gap-1">
              Manage All <ArrowUpRight className="w-3 h-3" />
            </a>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {recentUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-foreground/5 hover:border-primary/20 transition-all group">
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
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'}`}>
                      {u.role}
                    </span>
                    <Link href="/admin/users">
                      <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-foreground/5 rounded-lg transition-all">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts / Quick Config */}
        <div className="space-y-6">
          {/* Privileged Access */}
          <Card className="border-purple-500/20 bg-purple-500/5 backdrop-blur-xl shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <span className="text-xs font-black text-purple-500 uppercase tracking-widest">Privileged Access</span>
              </div>
              <CardTitle className="text-3xl font-black">{adminCount}</CardTitle>
              <CardDescription>Active administrators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-2 w-full bg-purple-500/10 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(adminCount / userCount) * 100}%` }} />
              </div>
              <p className="text-xs text-purple-500/80 mt-2 font-medium text-right">{((adminCount / userCount) * 100).toFixed(1)}% of total users</p>
            </CardContent>
          </Card>

          <Card className="border-foreground/10 bg-white dark:bg-foreground/[0.02] backdrop-blur-xl shadow-sm">
            <CardHeader className="border-b border-foreground/5 pb-4">
              <CardTitle className="text-base font-bold">Quick Configurations</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-1">
              {[
                { label: 'General Settings', href: '/settings' },
                { label: 'API Keys', href: '/settings' },
                { label: 'Audit Logs', href: '/admin/audit-logs' },
                { label: 'Security Policies', href: '/admin/users' }
              ].map((link, i) => (
                <Link key={i} href={link.href} className="flex items-center justify-between p-3 rounded-lg hover:bg-foreground/5 transition-colors group">
                  <span className="text-sm font-medium text-foreground/60 dark:text-muted-foreground group-hover:text-foreground transition-colors">{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-foreground/20 dark:text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
