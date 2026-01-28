import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/middleware'
import { LandingWrapper } from './LandingWrapper'

export default async function HomePage() {
  const user = await getCurrentUser()

  if (user) {
    redirect('/dashboard')
  }

  return <LandingWrapper />
}
