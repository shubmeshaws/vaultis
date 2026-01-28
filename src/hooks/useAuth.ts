'use client'

import { useSession } from 'next-auth/react'
import { Role } from '@/lib/auth/permissions'
import type { AuthUser } from '@/lib/auth/middleware'

export function useAuth() {
  const { data: session, status } = useSession()

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      }
    : null

  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'
  const isAdmin = user?.role === Role.ADMIN
  const isUser = user?.role === Role.USER

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    isUser,
    session,
  }
}
