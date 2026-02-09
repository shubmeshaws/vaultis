import { getCurrentUser } from '@/lib/auth/middleware'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Role } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { Activity, Database, Shield, Zap, Clock, ChevronRight, Plus, LayoutDashboard, Search } from 'lucide-react'
import { getDashboardData } from '@/lib/actions/dashboardActions'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'

import { DashboardOverviewClient } from '@/components/dashboard/DashboardOverviewClient'

// Dashboard Overview Page - Aesthetic Overhaul with Client Component
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

  return (
    <DashboardOverviewClient
      user={{
        name: user.name,
        email: user.email,
        role: user.role
      }}
      stats={stats as any}
      recentQueries={recentQueries as any}
    />
  )
}
