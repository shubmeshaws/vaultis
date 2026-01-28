import { getCurrentUser } from '@/lib/auth/middleware'
import { Card, CardContent } from '@/components/ui/card'
import { QueryEditor } from '@/components/editor/QueryEditor'
import { QueryStatusPanel } from '@/components/dashboard/QueryStatusPanel'
import { QueryResultsTable } from '@/components/dashboard/QueryResultsTable'
import { Sparkles, History, Save, Play } from 'lucide-react'

export default async function QueriesPage() {
  const user = await getCurrentUser()

  return (
    <div className="space-y-6 p-2 lg:p-4 min-h-full">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            Query Explorer
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            Write, execute, and analyze database operations
          </p>
        </div>

        <div className="flex items-center gap-2 bg-foreground/5 p-1 rounded-xl">
          <button className="px-4 py-2 rounded-lg bg-background shadow-sm text-xs font-bold text-foreground transition-all">Editor</button>
          <button className="px-4 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground transition-all">Saved</button>
          <button className="px-4 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground transition-all">History</button>
        </div>
      </div>

      {/* Main Editor Section */}
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <QueryEditor />

          {/* Results Area */}
          <QueryResultsTable
            columns={[
              { key: 'id', label: 'ID', width: 100 },
              { key: 'name', label: 'User', width: 200 },
              { key: 'email', label: 'Email', width: 250 },
              { key: 'role', label: 'Role', width: 120 },
              { key: 'status', label: 'Status', width: 120 },
            ]}
            data={Array.from({ length: 25 }, (_, i) => ({
              id: `#829${i + 1}`,
              name: 'Alex Johnson',
              email: 'alex@example.com',
              role: 'Admin',
              status: 'Active'
            }))}
            totalRows={25}
            executionTime="142ms"
          />
        </div>

        {/* Status Panel (Sidecar) */}
        <div className="hidden lg:block lg:col-span-1">
          <QueryStatusPanel stats={{
            status: 'success',
            executionTime: '142ms',
            rowsAffected: 12,
            dataSize: '2.4 KB',
            message: 'Query executed successfully.'
          }} />
        </div>
      </div>
    </div>
  )
}
