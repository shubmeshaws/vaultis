# QueryFlow - Tech Stack

## Frontend Stack

### Core Framework
- **Next.js 14+ (App Router)** - React framework with SSR/SSG
  - Server components for performance
  - Built-in API routes
  - Optimized image handling
  - File-based routing
  - **Reasoning**: Industry standard, excellent DX, SEO-friendly, production-ready

### UI Framework
- **React 18+** - Component library foundation
- **TypeScript** - Type safety across the stack
  - **Reasoning**: Prevents runtime errors, improves DX, better IDE support

### Styling & Design System
- **Tailwind CSS 3.4+** - Utility-first CSS framework
- **CSS Variables** - For dynamic theming
- **Framer Motion** - Smooth animations and micro-interactions
  - **Reasoning**: Fast development, consistent design, excellent performance

### UI Component Library
- **shadcn/ui** - Accessible, customizable components
  - Built on Radix UI primitives
  - Fully customizable with Tailwind
  - **Reasoning**: Modern, accessible, developer-friendly, matches Vercel/Linear aesthetic

### State Management
- **Zustand** - Lightweight state management
  - For global app state (auth, theme, notifications)
- **React Query (TanStack Query)** - Server state management
  - Query caching, mutations, real-time updates
  - **Reasoning**: Minimal boilerplate, excellent caching, perfect for data-heavy apps

### Forms & Validation
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation
  - **Reasoning**: Type-safe validation, excellent DX, minimal re-renders

### Data Visualization
- **Recharts** - Chart library for query analytics
- **React Table (TanStack Table)** - Powerful data tables
  - **Reasoning**: Flexible, performant, great for complex data grids

### Real-time Features
- **Socket.io Client** - WebSocket connections
  - For live query execution monitoring
  - **Reasoning**: Reliable, well-documented, great fallback support

### Authentication
- **NextAuth.js (Auth.js)** - Authentication framework
  - Supports multiple providers (OAuth, email/password)
  - **Reasoning**: Secure, flexible, Next.js optimized

### Code Editor
- **Monaco Editor** - VS Code editor in browser
  - For SQL query editing
  - **Reasoning**: Industry standard, syntax highlighting, autocomplete

---

## Backend Stack

### Runtime & Framework
- **Node.js 20+ (LTS)** - JavaScript runtime
- **Next.js API Routes** - For simple endpoints
- **tRPC** - End-to-end typesafe APIs
  - **Reasoning**: Type safety from frontend to backend, excellent DX, no code generation

### Database
- **PostgreSQL 15+** - Primary database
  - For user data, query history, configurations
- **Prisma** - ORM and database toolkit
  - Type-safe database client
  - Migrations
  - **Reasoning**: Excellent TypeScript support, migrations, type safety

### Query Execution Engine
- **Node.js with connection pooling**
- **Database-specific drivers**:
  - `pg` (PostgreSQL)
  - `mysql2` (MySQL/MariaDB)
  - `mssql` (SQL Server)
  - `oracledb` (Oracle)
  - `better-sqlite3` (SQLite)
- **Connection pooling**: `pg-pool`, `generic-pool`
  - **Reasoning**: Flexible, supports multiple databases, well-maintained

### Caching
- **Redis** - In-memory data store
  - Query result caching
  - Session storage
  - Rate limiting
  - **Reasoning**: Fast, reliable, industry standard

### Job Queue
- **BullMQ** - Redis-based job queue
  - For long-running queries
  - Query scheduling
  - **Reasoning**: Reliable, scalable, Redis-backed

### Real-time
- **Socket.io Server** - WebSocket server
  - Live query execution updates
  - **Reasoning**: Matches client, reliable, room support

### Logging & Monitoring
- **Winston** - Logging library
- **Pino** (alternative) - High-performance logger
- **Sentry** - Error tracking and monitoring
- **Reasoning**: Production-ready error tracking

### API Documentation
- **tRPC Playground** - Built-in API explorer
- **OpenAPI/Swagger** (if needed for external APIs)
  - **Reasoning**: Auto-generated, type-safe docs

---

## DevOps & Infrastructure

### Hosting
- **Vercel** (Frontend + API Routes) - Optimal for Next.js
- **Railway / Render** (Backend services) - Alternative for full control
- **Reasoning**: Zero-config deployment, excellent Next.js integration

### Database Hosting
- **Supabase / Neon** (PostgreSQL) - Serverless Postgres
- **Upstash** (Redis) - Serverless Redis
- **Reasoning**: Serverless, auto-scaling, great DX

### CI/CD
- **GitHub Actions** - Automated testing and deployment
- **Reasoning**: Integrated with GitHub, flexible, free for public repos

### Environment Management
- **Vercel Environment Variables** - Production
- **`.env.local`** - Development
- **Reasoning**: Secure, easy to manage

### Monitoring & Analytics
- **Vercel Analytics** - Web vitals
- **Sentry** - Error tracking
- **PostHog** (optional) - Product analytics
- **Reasoning**: Comprehensive observability

---

## Development Tools

### Code Quality
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit checks
- **Reasoning**: Consistent code quality

### Testing
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **React Testing Library** - Component testing
- **Reasoning**: Fast, modern, great DX

### Type Checking
- **TypeScript** - Static type checking
- **tsc** - Type checking in CI
- **Reasoning**: Catch errors early

---

## Package Manager
- **pnpm** - Fast, disk-efficient package manager
  - **Reasoning**: Faster than npm/yarn, better disk usage, strict dependency resolution

---

## Summary

This stack prioritizes:
1. **Developer Experience** - Type safety, hot reload, great tooling
2. **Performance** - Server components, caching, optimized builds
3. **Scalability** - Serverless architecture, connection pooling, job queues
4. **Maintainability** - TypeScript, Prisma, tRPC for type safety
5. **Modern Aesthetics** - Tailwind + shadcn/ui for premium UI
