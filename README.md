# QueryFlow

A futuristic SaaS web application for database query execution & monitoring with User and Admin panels.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (LTS)
- PostgreSQL (via Docker, Supabase, or local)
- npm or pnpm

### Installation

1. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Choose your database:**
   - **Option A: Supabase (Recommended)** - See `SETUP_COMPLETE.md`
   - **Option B: Docker** - See `SETUP_COMPLETE.md`
   - **Option C: Local PostgreSQL** - See `SETUP_COMPLETE.md`

3. **Set up database:**
   ```bash
   npm run db:push
   ```

4. **Create admin user:**
   ```bash
   npm run create-admin admin@example.com yourpassword "Admin User"
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation

- **`SETUP_COMPLETE.md`** - Complete setup guide with all database options
- **`QUICK_START.md`** - Quick reference guide
- **`DATABASE_SETUP.md`** - Detailed database setup instructions
- **`docs/AUTH_IMPLEMENTATION.md`** - Authentication system documentation
- **`docs/AUTH_QUICK_REFERENCE.md`** - Auth quick reference
- **`docs/TECH_STACK.md`** - Technology choices
- **`docs/ARCHITECTURE.md`** - System architecture
- **`docs/DESIGN_SYSTEM.md`** - UI/UX design system

## ✨ Features

✅ **Secure Authentication**
- Email/password login
- Password hashing (bcrypt)
- JWT sessions
- Secure token handling

✅ **Role-Based Access Control**
- USER role (default)
- ADMIN role
- Route protection
- Permission system

✅ **Protected Routes**
- Dashboard routes (require auth)
- Admin routes (require ADMIN role)
- Automatic redirects

✅ **UI Components**
- Login form
- Registration form
- Role-based navigation
- User info display

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Run migrations
npm run db:studio       # Open Prisma Studio

# Docker
npm run docker:up       # Start PostgreSQL container
npm run docker:down     # Stop PostgreSQL container
npm run docker:logs     # View container logs

# Setup
npm run create-admin     # Create admin user
npm run setup:docker     # Full Docker setup
npm run setup:supabase   # Supabase setup
```

## 🏗️ Project Structure

```
queryx/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Protected routes
│   │   │   ├── admin/          # Admin-only
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   └── queries/       # Query execution
│   │   ├── api/auth/           # Auth endpoints
│   │   ├── login/             # Login page
│   │   └── register/          # Registration
│   ├── components/
│   │   ├── auth/              # Auth components
│   │   └── layout/            # Layout components
│   ├── lib/
│   │   ├── auth/              # Auth utilities
│   │   └── db/                # Database
│   └── hooks/
│       └── useAuth.ts         # Auth hook
├── prisma/
│   └── schema.prisma          # Database schema
├── scripts/
│   └── create-admin.ts        # Admin creation
└── docker-compose.yml         # Docker config
```

## 🔐 Security

- ✅ No hardcoded secrets (all in `.env.local`)
- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ JWT tokens for sessions
- ✅ Input validation (Zod)
- ✅ SQL injection prevention (Prisma)
- ✅ Server-side permission checks

## 📝 License

MIT
