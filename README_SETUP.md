# QueryFlow - Setup Instructions

## Prerequisites

- Node.js 20+ (LTS)
- pnpm (or npm/yarn)
- PostgreSQL 15+
- Redis (optional, for caching)

## Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

3. **Configure your `.env.local`:**
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/queryflow?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

   Generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```

4. **Set up the database:**
   ```bash
   # Generate Prisma Client
   pnpm db:generate

   # Push schema to database (or run migrations)
   pnpm db:push
   # OR
   pnpm db:migrate
   ```

5. **Start the development server:**
   ```bash
   pnpm dev
   ```

6. **Open your browser:**
   Navigate to `http://localhost:3000`

## Creating Your First Admin User

After setting up the database, you can create an admin user in two ways:

### Option 1: Using Prisma Studio
```bash
pnpm db:studio
```
- Open Prisma Studio
- Navigate to the `User` model
- Create a new user with:
  - Email: your email
  - Password: (hashed - see Option 2)
  - Role: `ADMIN`

### Option 2: Using a Script

Create a script `scripts/create-admin.ts`:

```typescript
import { prisma } from '../src/lib/db/prisma'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  const email = process.argv[2]
  const password = process.argv[3]
  const name = process.argv[4] || 'Admin'

  if (!email || !password) {
    console.error('Usage: tsx scripts/create-admin.ts <email> <password> [name]')
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'ADMIN',
    },
  })

  console.log('Admin user created:', user)
}

createAdmin()
```

Run it:
```bash
tsx scripts/create-admin.ts admin@example.com yourpassword "Admin User"
```

## Testing Authentication

1. **Register a new user:**
   - Go to `/register`
   - Fill in the form
   - You'll be redirected to login

2. **Login:**
   - Go to `/login`
   - Use your credentials
   - You'll be redirected to `/dashboard`

3. **Test role-based access:**
   - As a USER: You can access `/dashboard` and `/queries`
   - As an ADMIN: You can access `/admin` in addition to user routes

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── admin/          # Admin-only routes
│   │   ├── dashboard/     # Main dashboard
│   │   └── queries/        # Query execution
│   ├── api/                # API routes
│   │   └── auth/           # Auth endpoints
│   ├── login/              # Login page
│   └── register/           # Registration page
├── components/
│   ├── auth/               # Auth components
│   ├── layout/             # Layout components
│   └── ui/                 # UI components
├── lib/
│   ├── auth/               # Auth utilities
│   │   ├── config.ts       # NextAuth config
│   │   ├── middleware.ts   # Auth middleware
│   │   └── permissions.ts  # RBAC permissions
│   └── db/                 # Database utilities
└── hooks/                   # React hooks
    └── useAuth.ts          # Auth hook
```

## Security Features

✅ **Password Hashing**: bcrypt with 12 rounds
✅ **JWT Sessions**: Secure token-based sessions
✅ **Route Protection**: Middleware-based route guards
✅ **Role-Based Access**: ADMIN and USER roles
✅ **No Hardcoded Secrets**: All secrets in environment variables
✅ **Input Validation**: Zod schemas for all inputs
✅ **SQL Injection Prevention**: Prisma ORM protection

## Next Steps

1. Set up your database connections
2. Implement query execution
3. Add query history tracking
4. Set up real-time updates with Socket.io
5. Add analytics dashboard

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check your `DATABASE_URL` in `.env.local`
- Verify database exists: `psql -l`

### NextAuth Issues
- Ensure `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your app URL
- Clear browser cookies if session issues persist

### Type Errors
- Run `pnpm db:generate` after schema changes
- Restart TypeScript server in your IDE
