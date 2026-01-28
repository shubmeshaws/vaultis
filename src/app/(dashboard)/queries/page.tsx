import { getCurrentUser } from '@/lib/auth/middleware'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function QueriesPage() {
  const user = await getCurrentUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Queries</h1>
        <p className="text-muted-foreground">
          Execute and manage your database queries
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Query Runner</CardTitle>
          <CardDescription>
            Execute SQL queries against your database connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Query execution interface coming soon...
            </p>
            <Button>New Query</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
