import { Role } from '@/lib/auth/permissions'
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: Role
      isActive?: boolean
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: Role
    isActive?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
    isActive?: boolean
  }
}
