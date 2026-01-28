# Authentication & RBAC Implementation

## Overview

Complete authentication and role-based access control system for QueryFlow with secure login, session handling, and role-based route protection.

## ✅ Implemented Features

### 1. Backend Authentication

#### NextAuth.js Configuration (`src/lib/auth/config.ts`)
- **Credentials Provider**: Email/password authentication
- **JWT Strategy**: Stateless session management
- **Password Hashing**: bcrypt with 12 rounds
- **Session Callbacks**: Role injection into JWT and session
- **Database Adapter**: Prisma adapter for session storage

#### API Routes
- **`/api/auth/[...nextauth]`**: NextAuth.js handler
- **`/api/auth/register`**: User registration endpoint
  - Input validation with Zod
  - Password hashing
  - Duplicate email checking
  - Default USER role assignment

#### Database Schema (`prisma/schema.prisma`)
- **User Model**: Email, password (hashed), role, timestamps
- **Account Model**: OAuth account linking (for future SSO)
- **Session Model**: Session storage
- **Role Enum**: USER, ADMIN

### 2. Authentication Middleware

#### Server-Side Middleware (`src/lib/auth/middleware.ts`)
- `requireAuth()`: Ensures user is authenticated
- `requireRole(role)`: Ensures user has specific role
- `requirePermission(permission)`: Checks specific permission
- `getCurrentUser()`: Safely gets current user (returns null if not authenticated)

#### Next.js Middleware (`src/middleware.ts`)
- Route protection using `withAuth`
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from auth pages
- Admin route protection
- Configurable matcher patterns

### 3. Permission System

#### RBAC Implementation (`src/lib/auth/permissions.ts`)
- **Roles**: USER, ADMIN
- **Permissions**: Granular permission system
  - `queries.execute`
  - `queries.view.own` / `queries.view.all`
  - `queries.delete.own` / `queries.delete.all`
  - `connections.create` / `connections.edit` / `connections.delete`
  - `users.manage`
  - `admin.access`
  - `analytics.view`

- **Helper Functions**:
  - `hasPermission(role, permission)`: Check if role has permission
  - `requirePermission(role, permission)`: Throw if no permission
  - `isAdmin(role)`: Quick admin check

### 4. Frontend Authentication

#### Auth Hook (`src/hooks/useAuth.ts`)
- `useAuth()`: React hook for auth state
  - Returns: `user`, `isAuthenticated`, `isLoading`, `isAdmin`, `isUser`
  - Uses NextAuth's `useSession` hook

#### Auth Components
- **`LoginForm`**: 
  - React Hook Form with Zod validation
  - Error handling
  - Loading states
  - Redirects to dashboard on success

- **`RegisterForm`**:
  - Form validation
  - Password confirmation
  - API integration
  - Redirects to login after registration

- **`AuthGuard`**:
  - Client-side route protection
  - Role-based access control
  - Loading states
  - Fallback UI

#### Layout Components
- **`Header`**: 
  - User info display
  - Role badge (Admin indicator)
  - Sign out button
  - Navigation (role-based links)

### 5. Protected Routes

#### Route Structure
```
app/
├── (dashboard)/           # Protected by layout
│   ├── layout.tsx         # Server-side auth check
│   ├── dashboard/         # User & Admin
│   ├── queries/           # User & Admin
│   └── admin/             # Admin only
│       ├── layout.tsx     # Admin role check
│       └── page.tsx       # Admin dashboard
├── login/                 # Public
└── register/              # Public
```

#### Protection Layers
1. **Next.js Middleware**: First line of defense
2. **Layout Guards**: Server-side role checks
3. **Component Guards**: Client-side UI adaptation
4. **API Route Guards**: Server-side permission checks

### 6. Type Safety

#### TypeScript Definitions
- **`src/types/next-auth.d.ts`**: Extended NextAuth types
  - Session with role
  - User with role
  - JWT with role

- **AuthUser Interface**: Consistent user type across app

## Security Features

✅ **No Hardcoded Secrets**: All secrets in environment variables
✅ **Password Security**: bcrypt hashing (12 rounds)
✅ **JWT Tokens**: Secure, stateless sessions
✅ **Input Validation**: Zod schemas for all inputs
✅ **SQL Injection Prevention**: Prisma ORM
✅ **CSRF Protection**: NextAuth built-in
✅ **Secure Cookies**: HttpOnly, Secure flags
✅ **Role Verification**: Server-side checks only

## Usage Examples

### Server Component - Get Current User
```typescript
import { getCurrentUser } from '@/lib/auth/middleware'

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  
  return <div>Welcome {user.email}</div>
}
```

### Server Component - Require Admin
```typescript
import { requireRole } from '@/lib/auth/middleware'
import { Role } from '@/lib/auth/permissions'

export default async function AdminPage() {
  const user = await requireRole(Role.ADMIN)
  // User is guaranteed to be admin here
}
```

### Client Component - Use Auth
```typescript
'use client'
import { useAuth } from '@/hooks/useAuth'

export function MyComponent() {
  const { user, isAdmin, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) return <div>Please login</div>
  
  return (
    <div>
      {isAdmin && <AdminPanel />}
      <UserContent />
    </div>
  )
}
```

### Client Component - Protect Route
```typescript
'use client'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Role } from '@/lib/auth/permissions'

export function ProtectedPage() {
  return (
    <AuthGuard requiredRole={Role.ADMIN}>
      <AdminContent />
    </AuthGuard>
  )
}
```

## Environment Variables

Required in `.env.local`:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

Generate secret:
```bash
openssl rand -base64 32
```

## Database Setup

1. **Run migrations:**
   ```bash
   pnpm db:migrate
   ```

2. **Create admin user:**
   - Use Prisma Studio: `pnpm db:studio`
   - Or create a script (see README_SETUP.md)

## Future Enhancements

### SSO Support
The architecture is ready for SSO:
- OAuth providers can be added to `authOptions.providers`
- Account model already supports OAuth linking
- Session handling works with both credentials and OAuth

### Additional Features
- [ ] Email verification
- [ ] Password reset flow
- [ ] Two-factor authentication
- [ ] Session management (view/revoke sessions)
- [ ] Audit logging for auth events
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout after failed attempts

## Testing

### Manual Testing Checklist
- [ ] Register new user
- [ ] Login with credentials
- [ ] Access protected routes (should redirect if not logged in)
- [ ] Access admin routes as USER (should redirect)
- [ ] Access admin routes as ADMIN (should work)
- [ ] Sign out (should redirect to login)
- [ ] Session persistence across page refreshes

### Test Users
Create test users with different roles:
- `user@test.com` (USER role)
- `admin@test.com` (ADMIN role)

## Troubleshooting

### "Unauthorized" Errors
- Check `NEXTAUTH_SECRET` is set
- Verify database connection
- Check session cookies in browser

### Role Not Working
- Ensure role is set in database
- Check JWT callback in `authOptions`
- Verify session callback includes role

### Redirect Loops
- Check middleware matcher patterns
- Verify auth pages are excluded from protection
- Check redirect logic in middleware
