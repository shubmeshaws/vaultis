import { getCurrentUser } from '@/lib/auth/middleware'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Role } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { Activity, Database, Shield, Zap, Clock, ChevronRight, Plus, LayoutDashboard, Search } from 'lucide-react'
import { getDashboardData } from '@/lib/actions/dashboardActions'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Dashboard Overview Page - Live Data Integration
export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const dashRes = await getDashboardData()
  const stats = (dashRes.success && dashRes.stats) ? dashRes.stats : {
    totalQueries: '0',
    queryChange: '0%',
    successRate: '0%',
    avgLatency: '0ms',
    activeDatabases: 0
  }
  const recentQueries = (dashRes.success && dashRes.recentQueries) ? dashRes.recentQueries : []

  const isAdmin = user.role === Role.ADMIN

  return (
    <div className="space-y-8 p-8 relative overflow-hidden min-h-full">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-foreground/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-1">
              <LayoutDashboard className="w-3 h-3" />
              Overview
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Platform Home</p>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Welcome back, <span className="text-primary">{user.name || user.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 md:mt-16">
          <Link href="/meshy">
            <button className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95">
              <Plus className="w-4 h-4" />
              New Query
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Queries', value: stats.totalQueries, change: stats.queryChange, icon: Database, color: 'text-blue-500' },
          { label: 'Success Rate', value: stats.successRate, change: 'Lifetime', icon: Activity, color: 'text-green-500' },
          { label: 'Avg Latency', value: stats.avgLatency, change: 'Latest 100', icon: Zap, color: 'text-yellow-500' },
          { label: 'Databases', value: stats.activeDatabases.toString(), change: 'Connected', icon: Shield, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="group relative p-4 bg-white dark:bg-foreground/[0.02] backdrop-blur-xl hover:bg-slate-50 dark:hover:bg-foreground/[0.04] border border-foreground/10 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 shadow-sm">
            <div className="flex justify-between items-start mb-2.5">
              <div className={`p-2 rounded-lg bg-background shadow-sm border border-foreground/5 ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full border border-transparent ${stat.change.startsWith('+') ? 'bg-green-500/10 text-green-500' : stat.change.startsWith('-') ? 'bg-red-500/10 text-red-500' : 'bg-muted/10 text-muted-foreground'}`}>
                {stat.change}
              </span>
            </div>
            <div className="space-y-0">
              <h3 className="text-lg font-black text-foreground tracking-tight">{stat.value}</h3>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-foreground/10 bg-white dark:bg-foreground/[0.02] backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold">Recent Queries</CardTitle>
              <CardDescription>Your latest database interactions</CardDescription>
            </div>
            <Link href="/queries?tab=history" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">View All</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQueries.length > 0 ? (
                recentQueries.map((q: any) => (
                  <div key={q.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-foreground/[0.03] transition-colors group cursor-pointer border border-transparent hover:border-foreground/5">
                    <div className="p-2.5 rounded-lg bg-background border border-foreground/5 shadow-sm">
                      <Database className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate font-mono bg-foreground/5 px-2 py-0.5 rounded inline-block max-w-full">
                        {q.sql.length > 60 ? q.sql.substring(0, 60) + '...' : q.sql}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(q.timestamp), { addSuffix: true })}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-foreground/20" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{q.databaseName}</span>
                        <span className="w-1 h-1 rounded-full bg-foreground/20" />
                        <span className={cn(
                          "text-[10px] font-bold",
                          q.status === 'SUCCESS' ? 'text-green-500' : 'text-red-500'
                        )}>{q.status}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <Database className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No queries recorded yet.</p>
                  <Link href="/meshy" className="text-xs text-primary font-bold mt-2 inline-block hover:underline">Start querying with Meshy</Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Role Card */}
        <div className="space-y-4">
          <Card className="border-foreground/10 bg-primary/[0.03] dark:bg-primary/5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl -mr-6 -mt-6" />
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-bold">Access Level</CardTitle>
              <CardDescription className="text-[11px] text-foreground/60 dark:text-muted-foreground">Your permissions</CardDescription>
            </CardHeader>
            <CardContent className="pb-3 px-4">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Shield className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-base font-black text-foreground">{user.role}</p>
                  <p className="text-[10px] text-foreground/50 dark:text-muted-foreground font-medium uppercase tracking-tight">Active</p>
                </div>
              </div>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="w-full h-8 flex items-center justify-center gap-2 bg-white dark:bg-background border border-foreground/10 hover:border-primary/50 text-foreground rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-md group"
                >
                  Admin <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </CardContent>
          </Card>

          <Card className="border-foreground/10 bg-foreground/[0.02] shadow-none">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 pb-3 px-4">
              {[
                { label: 'History', href: '/queries?tab=history', icon: Clock },
                { label: 'Saved', href: '/queries?tab=saved', icon: Database },
                { label: 'Databases', href: '/settings', icon: Search },
                { label: 'Settings', href: '/settings', icon: Zap },
              ].map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg bg-white dark:bg-background border border-foreground/5 hover:border-primary/30 hover:bg-primary/5 transition-all group shadow-sm text-center"
                >
                  <action.icon className="w-3.5 h-3.5 text-foreground/40 dark:text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-[8.5px] font-bold uppercase tracking-wider text-foreground/60 dark:text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
