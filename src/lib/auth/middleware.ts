import { getServerSession } from 'next-auth'
import { authOptions } from './config'
import { Role, requirePermission as checkPermission } from './permissions'
import type { Permission } from './permissions'

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  role: Role
  isActive: boolean
}

export async function requireAuth(): Promise<AuthUser> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const user = session.user as AuthUser

  if (!user.id || !user.role) {
    throw new Error('Invalid session')
  }

  return user
}

export async function requireRole(role: Role): Promise<AuthUser> {
  const user = await requireAuth()

  if (user.role !== role) {
    throw new Error(`Requires ${role} role`)
  }

  return user
}

export async function requirePermission(permission: Permission): Promise<AuthUser> {
  const user = await requireAuth()
  checkPermission(user.role, permission)
  return user
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    return await requireAuth()
  } catch {
    return null
  }
}
