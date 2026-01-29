import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/middleware'
import { Sidebar } from '@/components/layout/Sidebar'
import { CommandPaletteRegistry } from '@/components/layout/CommandPaletteRegistry'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[#05050A] text-foreground relative overflow-hidden font-sans selection:bg-primary/30 transition-colors duration-500">
      {/* Global Ambient Background - Dark Mode Only */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-900/20 rounded-full blur-[180px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-blue-900/10 rounded-full blur-[200px] opacity-30" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      </div>

      {/* Global Ambient Background - Light Mode Only */}
      <div className="fixed inset-0 z-0 pointer-events-none dark:opacity-0 transition-opacity duration-500">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Shell Structure */}
      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        {/* Command Palette */}
        <CommandPaletteRegistry />

        {/* Main Floating Content Area */}
        <main className="flex-1 lg:pl-72 p-4 lg:p-6 transition-all duration-300">
          <div className="h-full rounded-[2.5rem] bg-foreground/[0.02] dark:bg-black/40 border border-foreground/5 dark:border-white/5 backdrop-blur-2xl shadow-sm dark:shadow-2xl overflow-hidden relative">
            {/* Inner Glass Highlights - Dark Mode */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 dark:opacity-100" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 dark:opacity-100" />

            {/* Content Scroll Area */}
            <div className="h-full overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
