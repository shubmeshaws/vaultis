import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/middleware'
import { Sidebar } from '@/components/layout/Sidebar'
import { CommandPaletteRegistry } from '@/components/layout/CommandPaletteRegistry'
import { ToastProvider } from '@/contexts/ToastContext'
import { CheckCircle } from 'lucide-react'
import { AccessPollingHandler } from '@/components/auth/AccessPollingHandler'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Handle inactive users - block access to dashboard and show pending message
  // Allow admins to always access the dashboard even if status is toggled (security precaution)
  if (!user.isActive && user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background dark:bg-[#05050A] text-foreground flex items-center justify-center p-6 relative overflow-hidden">
        <AccessPollingHandler />
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-amber-500/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
        </div>

        <div className="relative z-10 w-full max-w-lg text-center space-y-8">
          <div className="w-24 h-24 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto animate-pulse shadow-[0_0_30px_rgba(245,158,11,0.1)]">
            <span className="text-4xl">⏳</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">
              Access Pending
            </h1>
            <p className="text-sm text-muted-foreground font-medium tracking-wide max-w-xs mx-auto">
              Your account has been registered successfully but requires administrative approval before gaining access to the platform.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-foreground/[0.02] border border-foreground/10 backdrop-blur-xl">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Next Step</p>
                <p className="text-xs text-muted-foreground">Expect an email once your access has been enabled by the security team.</p>
              </div>
            </div>
          </div>

          <a
            href="/login"
            className="inline-block text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
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
          <main className="flex-1 lg:ml-56 p-4 lg:p-8 transition-all duration-300">
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
    </ToastProvider>
  )
}
