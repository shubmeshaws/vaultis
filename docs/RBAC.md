# QueryFlow - Role-Based Access Control (RBAC)

## Overview

QueryFlow implements a **Role-Based Access Control (RBAC)** system with two primary roles: **Admin** and **User**. This document defines the permission model, role capabilities, and implementation details.

---

## Roles

### 1. User (Default Role)

**Capabilities:**
- ✅ Execute database queries
- ✅ View own query history
- ✅ View query results
- ✅ Create and manage own saved queries
- ✅ Test database connections (read-only)
- ✅ View own profile and settings
- ✅ Export own query results

**Restrictions:**
- ❌ Cannot create/edit/delete database connections
- ❌ Cannot view other users' queries
- ❌ Cannot access admin panel
- ❌ Cannot manage users
- ❌ Cannot view system analytics
- ❌ Cannot modify system settings

**Use Case:**
Standard users who need to execute queries and monitor their own database activities.

---

### 2. Admin (Elevated Role)

**Capabilities:**
- ✅ **All User capabilities** +
- ✅ Create, edit, and delete database connections
- ✅ View all users' queries and history
- ✅ Manage users (create, edit, delete, assign roles)
- ✅ View system analytics and metrics
- ✅ Configure system settings
- ✅ Access admin dashboard
- ✅ View connection usage statistics
- ✅ Manage query execution limits
- ✅ View audit logs

**Use Case:**
System administrators who need full control over the platform, user management, and system configuration.

---

## Permission Matrix

| Feature | User | Admin |
|---------|------|-------|
| Execute Queries | ✅ | ✅ |
| View Own Queries | ✅ | ✅ |
| View All Queries | ❌ | ✅ |
| Save Queries | ✅ | ✅ |
| Delete Own Queries | ✅ | ✅ |
| Delete Any Queries | ❌ | ✅ |
| Create Connections | ❌ | ✅ |
| Edit Connections | ❌ | ✅ |
| Delete Connections | ❌ | ✅ |
| View Connections | ✅ (own only) | ✅ (all) |
| Manage Users | ❌ | ✅ |
| View Analytics | ❌ | ✅ |
| System Settings | ❌ | ✅ |
| Export Results | ✅ | ✅ |

---

## Implementation

### Database Schema

```prisma
enum Role {
  USER
  ADMIN
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  queries      Query[]
  connections  Connection[]  // Only admins can create connections
}

model Connection {
  id        String   @id @default(cuid())
  name      String
  type      String   // postgresql, mysql, etc.
  host      String
  port      Int
  database  String
  // ... other connection fields
  createdBy String
  user      User     @relation(fields: [createdBy], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Permission Check Utilities

```typescript
// src/lib/auth/permissions.ts

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export type Permission = 
  | 'queries.execute'
  | 'queries.view.own'
  | 'queries.view.all'
  | 'queries.delete.own'
  | 'queries.delete.all'
  | 'connections.create'
  | 'connections.edit'
  | 'connections.delete'
  | 'connections.view.all'
  | 'users.manage'
  | 'admin.access'
  | 'analytics.view'

const rolePermissions: Record<Role, Permission[]> = {
  [Role.USER]: [
    'queries.execute',
    'queries.view.own',
    'queries.delete.own',
  ],
  [Role.ADMIN]: [
    'queries.execute',
    'queries.view.own',
    'queries.view.all',
    'queries.delete.own',
    'queries.delete.all',
    'connections.create',
    'connections.edit',
    'connections.delete',
    'connections.view.all',
    'users.manage',
    'admin.access',
    'analytics.view',
  ],
}

export function hasPermission(
  userRole: Role,
  permission: Permission
): boolean {
  return rolePermissions[userRole]?.includes(permission) ?? false
}

export function requirePermission(
  userRole: Role,
  permission: Permission
): void {
  if (!hasPermission(userRole, permission)) {
    throw new Error(`Insufficient permissions: ${permission}`)
  }
}

export function isAdmin(userRole: Role): boolean {
  return userRole === Role.ADMIN
}
```

### Middleware Implementation

```typescript
// src/lib/auth/middleware.ts

import { getServerSession } from 'next-auth'
import { authOptions } from './config'
import { requirePermission, Role } from './permissions'
import type { Permission } from './permissions'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session.user
}

export async function requireRole(role: Role) {
  const user = await requireAuth()
  if (user.role !== role) {
    throw new Error(`Requires ${role} role`)
  }
  return user
}

export async function requirePermission(permission: Permission) {
  const user = await requireAuth()
  requirePermission(user.role, permission)
  return user
}
```

### Route Protection

```typescript
// src/app/(dashboard)/admin/layout.tsx

import { requireRole } from '@/lib/auth/middleware'
import { Role } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'

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
```

### API Route Protection (tRPC)

```typescript
// src/lib/trpc/routers/admin.ts

import { z } from 'zod'
import { router, protectedProcedure } from '../server'
import { requirePermission } from '@/lib/auth/permissions'

export const adminRouter = router({
  createUser: protectedProcedure
    .input(z.object({ email: z.string().email(), role: z.enum(['USER', 'ADMIN']) }))
    .mutation(async ({ input, ctx }) => {
      // Check permission
      requirePermission(ctx.user.role, 'users.manage')
      
      // Create user logic
      // ...
    }),

  deleteUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      requirePermission(ctx.user.role, 'users.manage')
      // Delete user logic
      // ...
    }),
})
```

### Component-Level Protection

```typescript
// src/components/admin/UserTable.tsx

'use client'

import { useAuth } from '@/hooks/useAuth'
import { hasPermission } from '@/lib/auth/permissions'
import { Permission } from '@/lib/auth/permissions'

export function UserTable() {
  const { user } = useAuth()

  if (!hasPermission(user.role, 'users.manage')) {
    return <div>Access denied</div>
  }

  // Render user table
  return <div>...</div>
}
```

---

## Resource-Level Permissions

### Query Ownership

Users can only view/edit/delete their own queries, unless they are admins:

```typescript
// src/server/db/queries.ts

export async function getQuery(queryId: string, userId: string, userRole: Role) {
  const query = await prisma.query.findUnique({
    where: { id: queryId },
  })

  if (!query) {
    throw new Error('Query not found')
  }

  // Admins can view any query, users can only view their own
  if (userRole !== Role.ADMIN && query.userId !== userId) {
    throw new Error('Unauthorized')
  }

  return query
}
```

### Connection Access

- **Users**: Can only use connections (execute queries)
- **Admins**: Can create, edit, delete, and view all connections

```typescript
// src/server/db/connections.ts

export async function getConnections(userId: string, userRole: Role) {
  if (userRole === Role.ADMIN) {
    // Admins see all connections
    return await prisma.connection.findMany()
  } else {
    // Users see connections they have access to
    // (This could be expanded with a many-to-many relationship)
    return await prisma.connection.findMany({
      where: {
        // For now, all connections are accessible
        // Future: add connection sharing/permissions
      },
    })
  }
}
```

---

## Future Enhancements

### 1. Granular Permissions
Instead of binary roles, implement a permission-based system:
- `queries.execute.readonly` - Execute read-only queries
- `queries.execute.write` - Execute write queries
- `connections.view.shared` - View shared connections

### 2. Team/Organization Roles
- **Team Admin**: Manage team members, team connections
- **Team Member**: Access team resources
- **Viewer**: Read-only access

### 3. Connection-Level Permissions
- Share connections with specific users
- Set connection access levels (read-only, full access)

### 4. Query Sharing
- Share queries with other users
- Public query library

### 5. Audit Logging
- Track all permission checks
- Log admin actions
- User activity history

---

## Security Best Practices

1. **Always verify on the server**: Client-side checks are for UX only
2. **Principle of least privilege**: Users get minimum required permissions
3. **Defense in depth**: Check permissions at multiple layers (route, API, database)
4. **Audit sensitive operations**: Log all admin actions
5. **Regular permission reviews**: Periodically audit user roles
6. **Secure default**: New users default to USER role

---

## Testing Permissions

```typescript
// tests/unit/permissions.test.ts

import { hasPermission, Role } from '@/lib/auth/permissions'

describe('Permissions', () => {
  it('should allow users to execute queries', () => {
    expect(hasPermission(Role.USER, 'queries.execute')).toBe(true)
  })

  it('should deny users from managing users', () => {
    expect(hasPermission(Role.USER, 'users.manage')).toBe(false)
  })

  it('should allow admins all permissions', () => {
    expect(hasPermission(Role.ADMIN, 'users.manage')).toBe(true)
    expect(hasPermission(Role.ADMIN, 'admin.access')).toBe(true)
  })
})
```
