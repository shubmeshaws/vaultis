import { getCurrentUser } from '@/lib/auth/middleware'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db/prisma'

export default async function AdminPage() {
  const user = await getCurrentUser()

  // Get some stats for admin dashboard
  const userCount = await prisma.user.count()
  const adminCount = await prisma.user.count({
    where: { role: 'ADMIN' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, connections, and system settings
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admins</CardTitle>
            <CardDescription>Administrator accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a
                href="/admin/users"
                className="block text-sm text-primary hover:underline"
              >
                Manage Users →
              </a>
              <a
                href="/admin/connections"
                className="block text-sm text-primary hover:underline"
              >
                Manage Connections →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
