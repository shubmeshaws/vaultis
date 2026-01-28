import { getCurrentUser } from '@/lib/auth/middleware'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Role } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const isAdmin = user.role === Role.ADMIN

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name || user.email}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Your Role</CardTitle>
            <CardDescription>Current access level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.role}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a
                href="/queries"
                className="block text-sm text-primary hover:underline"
              >
                Execute Query →
              </a>
              <a
                href="/queries/history"
                className="block text-sm text-primary hover:underline"
              >
                View History →
              </a>
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
              <CardDescription>System management</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="/admin"
                className="block text-sm text-primary hover:underline"
              >
                Go to Admin →
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
