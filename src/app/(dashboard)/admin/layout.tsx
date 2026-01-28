import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth/middleware'
import { Role } from '@/lib/auth/permissions'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireRole(Role.ADMIN)
  } catch {
    redirect('/dashboard')
  }

  return <>{children}</>
}
