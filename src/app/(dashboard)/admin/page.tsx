import { getCurrentUser } from '@/lib/auth/middleware'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db/prisma'
import { Users, Shield, Server, Activity, ArrowUpRight, Search, Settings, AlertTriangle, ChevronRight, Database, Zap, TrendingUp, TrendingDown, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

import { getAdminOperationalStats } from '@/lib/actions/adminActions'

import { AdminOverviewClient } from '@/components/admin/AdminOverviewClient'

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
  const stats = {
    userCount,
    adminCount,
    activeQueries: opStatsRes.success ? opStatsRes.activeQueries : 0,
    riskyOperations: opStatsRes.success ? opStatsRes.riskyOperations : 0,
    systemHealth: opStatsRes.success ? opStatsRes.systemHealth : 100
  }

  return (
    <AdminOverviewClient stats={stats as any} recentUsers={recentUsers} />
  )
}
