import { getCurrentUser } from '@/lib/auth/middleware'
import { Card, CardContent } from '@/components/ui/card'
import { QueryEditor } from '@/components/editor/QueryEditor'
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
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <QueryEditor />

          {/* Results Area (Mock) */}
          <Card className="bg-card/50 backdrop-blur-xl border-foreground/10 overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-foreground/5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Query Results</span>
              <span className="text-[10px] font-mono text-muted-foreground">142ms • 12 rows</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-foreground/5 text-xs uppercase font-bold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/5">
                  {[1, 2, 3].map((row) => (
                    <tr key={row} className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs opacity-70">#829{row}</td>
                      <td className="px-4 py-3 font-bold">Alex Johnson</td>
                      <td className="px-4 py-3 text-muted-foreground">alex@example.com</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase">Admin</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-xs font-medium">Active</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
