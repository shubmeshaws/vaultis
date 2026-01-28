import { getCurrentUser } from '@/lib/auth/middleware'
import { QueriesPageClient } from '@/components/dashboard/QueriesPageClient'
import { redirect } from 'next/navigation'

export default async function QueriesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return <QueriesPageClient />
}
