import { getCurrentUser } from '@/lib/auth/middleware'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Role } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { Activity, Database, Shield, Zap, Clock, ChevronRight, Search, Plus } from 'lucide-react'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const isAdmin = user.role === Role.ADMIN

  return (
    <div className="space-y-5 p-5 relative overflow-hidden min-h-full">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5">
        <div className="space-y-0.5">
          <h1 className="text-xl font-black tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-[12px] font-medium">
            Welcome back, <span className="text-primary">{user.name || user.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search queries..."
              className="h-10 w-64 pl-9 pr-4 rounded-xl bg-background/50 border border-foreground/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95">
            <Plus className="w-4 h-4" />
            New Query
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Queries', value: '1,284', change: '+12.5%', icon: Database, color: 'text-blue-500' },
          { label: 'Success Rate', value: '98.2%', change: '+2.1%', icon: Activity, color: 'text-green-500' },
          { label: 'Avg Latency', value: '45ms', change: '-10.5%', icon: Zap, color: 'text-yellow-500' },
          { label: 'Active Connections', value: '12', change: '+4', icon: Shield, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="group relative p-4 bg-white dark:bg-foreground/[0.02] backdrop-blur-xl hover:bg-slate-50 dark:hover:bg-foreground/[0.04] border border-foreground/10 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 shadow-sm">
            <div className="flex justify-between items-start mb-2.5">
              <div className={`p-2 rounded-lg bg-background shadow-sm border border-foreground/5 ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full border border-transparent ${stat.change.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
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
            <button className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">View All</button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-foreground/[0.03] transition-colors group cursor-pointer border border-transparent hover:border-foreground/5">
                  <div className="p-2.5 rounded-lg bg-background border border-foreground/5 shadow-sm">
                    <Database className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">SELECT * FROM users_production LIMIT 100</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 2 mins ago
                      </span>
                      <span className="w-1 h-1 rounded-full bg-foreground/20" />
                      <span className="text-[10px] font-bold text-green-500">SUCCESS</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
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
                <a
                  href="/admin"
                  className="w-full h-8 flex items-center justify-center gap-2 bg-white dark:bg-background border border-foreground/10 hover:border-primary/50 text-foreground rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-md group"
                >
                  Admin <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                </a>
              )}
            </CardContent>
          </Card>

          <Card className="border-foreground/10 bg-foreground/[0.02] shadow-none">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 pb-3 px-4">
              {[
                { label: 'History', href: '/queries/history', icon: Clock },
                { label: 'Saved', href: '/queries/saved', icon: Database },
                { label: 'Documentation', href: '/docs', icon: Search },
                { label: 'Settings', href: '/settings', icon: Zap },
              ].map((action, i) => (
                <a
                  key={i}
                  href={action.href}
                  className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg bg-white dark:bg-background border border-foreground/5 hover:border-primary/30 hover:bg-primary/5 transition-all group shadow-sm text-center"
                >
                  <action.icon className="w-3.5 h-3.5 text-foreground/40 dark:text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-[8.5px] font-bold uppercase tracking-wider text-foreground/60 dark:text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
                </a>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
