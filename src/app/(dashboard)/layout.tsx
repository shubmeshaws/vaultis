import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/middleware'
import { Header } from '@/components/layout/Header'

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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6">{children}</main>
    </div>
  )
}
