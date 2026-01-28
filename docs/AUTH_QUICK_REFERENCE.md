# Authentication Quick Reference

## Quick Start

### 1. Environment Setup
```bash
# Copy example env
cp .env.example .env.local

# Generate secret
openssl rand -base64 32
# Add to NEXTAUTH_SECRET in .env.local
```

### 2. Database Setup
```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Push schema
pnpm db:push
```

### 3. Create Admin User
```bash
# Option 1: Use Prisma Studio
pnpm db:studio
# Create user manually with ADMIN role

# Option 2: Use script (create scripts/create-admin.ts)
```

## Common Patterns

### Server Component - Check Auth
```typescript
import { getCurrentUser } from '@/lib/auth/middleware'
import { redirect } from 'next/navigation'

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  // Use user here
}
```

### Server Component - Require Admin
```typescript
import { requireRole } from '@/lib/auth/middleware'
import { Role } from '@/lib/auth/permissions'

export default async function AdminPage() {
  await requireRole(Role.ADMIN)
  // Guaranteed to be admin
}
```

### Client Component - Use Auth
```typescript
'use client'
import { useAuth } from '@/hooks/useAuth'

export function Component() {
  const { user, isAdmin, isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please login</div>
  
  return (
    <div>
      {isAdmin && <AdminContent />}
      <UserContent />
    </div>
  )
}
```

### Client Component - Protect with Guard
```typescript
'use client'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Role } from '@/lib/auth/permissions'

export function ProtectedComponent() {
  return (
    <AuthGuard requiredRole={Role.ADMIN}>
      <AdminOnlyContent />
    </AuthGuard>
  )
}
```

### API Route - Check Permission
```typescript
import { requirePermission } from '@/lib/auth/middleware'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const user = await requirePermission('users.manage')
    // User has permission
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
}
```

## Roles & Permissions

### Roles
- **USER**: Default role, can execute queries, view own history
- **ADMIN**: Full access, can manage users, connections, view all data

### Permission Checks
```typescript
import { hasPermission, requirePermission } from '@/lib/auth/permissions'
import { Role } from '@/lib/auth/permissions'

// Check permission
if (hasPermission(user.role, 'users.manage')) {
  // User can manage users
}

// Require permission (throws if not)
requirePermission(user.role, 'admin.access')
```

## Routes

### Public Routes
- `/login` - Login page
- `/register` - Registration page
- `/` - Redirects to login or dashboard

### Protected Routes (Require Auth)
- `/dashboard` - Main dashboard
- `/queries` - Query execution
- `/queries/history` - Query history
- `/settings` - User settings

### Admin Routes (Require ADMIN role)
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/connections` - Connection management
- `/admin/analytics` - System analytics

## Auth Functions

### Server-Side
- `getCurrentUser()` - Get current user (returns null if not authenticated)
- `requireAuth()` - Get current user (throws if not authenticated)
- `requireRole(role)` - Require specific role
- `requirePermission(permission)` - Require specific permission

### Client-Side
- `useAuth()` - React hook for auth state
  - `user` - Current user object
  - `isAuthenticated` - Boolean
  - `isLoading` - Boolean
  - `isAdmin` - Boolean
  - `isUser` - Boolean

## Troubleshooting

### "Unauthorized" Error
1. Check `NEXTAUTH_SECRET` is set
2. Verify database connection
3. Check user exists in database
4. Clear browser cookies

### Role Not Working
1. Check role in database: `SELECT * FROM "User" WHERE email = '...'`
2. Verify JWT includes role (check `authOptions` callbacks)
3. Sign out and sign in again

### Redirect Loops
1. Check middleware matcher patterns
2. Verify auth pages are public
3. Check redirect logic

### Type Errors
1. Run `pnpm db:generate`
2. Restart TypeScript server
3. Check `src/types/next-auth.d.ts` exists
