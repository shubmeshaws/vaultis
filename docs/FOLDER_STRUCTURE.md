# QueryFlow - Folder Structure

## Project Root

```
queryx/
├── .env.local                 # Local environment variables
├── .env.example               # Example env file
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── package.json
├── pnpm-lock.yaml
├── README.md
│
├── docs/                      # Documentation
│   ├── TECH_STACK.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN_SYSTEM.md
│   ├── FOLDER_STRUCTURE.md
│   └── RBAC.md
│
├── public/                    # Static assets
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── src/                       # Source code
│   ├── app/                   # Next.js App Router
│   ├── components/            # React components
│   ├── lib/                   # Utilities, helpers
│   ├── server/                # Server-side code
│   ├── styles/                # Global styles
│   └── types/                 # TypeScript types
│
└── tests/                     # Test files
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## Frontend Structure (`src/`)

### `src/app/` - Next.js App Router

```
app/
├── layout.tsx                 # Root layout
├── page.tsx                   # Home/Landing page
├── globals.css                # Global styles + design tokens
│
├── (auth)/                    # Auth route group
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── layout.tsx
│
├── (dashboard)/               # Dashboard route group
│   ├── layout.tsx             # Dashboard layout (sidebar, header)
│   │
│   ├── dashboard/
│   │   └── page.tsx           # Main dashboard
│   │
│   ├── queries/
│   │   ├── page.tsx           # Query list
│   │   ├── [id]/
│   │   │   └── page.tsx       # Query details
│   │   └── new/
│   │       └── page.tsx       # New query
│   │
│   ├── history/
│   │   └── page.tsx           # Query history
│   │
│   ├── connections/
│   │   ├── page.tsx           # Connection list (Admin only)
│   │   ├── [id]/
│   │   │   └── page.tsx       # Connection details
│   │   └── new/
│   │       └── page.tsx       # New connection
│   │
│   ├── settings/
│   │   └── page.tsx           # User settings
│   │
│   └── admin/                 # Admin-only routes
│       ├── layout.tsx         # Admin layout guard
│       ├── page.tsx           # Admin dashboard
│       ├── users/
│       │   ├── page.tsx       # User management
│       │   └── [id]/
│       │       └── page.tsx   # User details
│       └── analytics/
│           └── page.tsx       # System analytics
│
└── api/                       # API routes (if not using tRPC)
    ├── auth/
    │   └── [...nextauth]/
    │       └── route.ts
    └── health/
        └── route.ts
```

### `src/components/` - React Components

```
components/
├── ui/                        # shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── table.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── toast.tsx
│   └── ...
│
├── layout/                    # Layout components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── SidebarNav.tsx
│   ├── Footer.tsx
│   └── PageHeader.tsx
│
├── auth/                      # Authentication components
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── AuthGuard.tsx
│
├── queries/                   # Query-related components
│   ├── QueryEditor.tsx        # Monaco editor wrapper
│   ├── QueryResults.tsx       # Results table
│   ├── QueryHistory.tsx       # History list
│   ├── QueryCard.tsx          # Query card item
│   ├── QueryStatus.tsx        # Status indicator
│   └── QueryActions.tsx       # Action buttons
│
├── connections/               # Database connection components
│   ├── ConnectionForm.tsx
│   ├── ConnectionList.tsx
│   ├── ConnectionCard.tsx
│   └── ConnectionTest.tsx
│
├── admin/                     # Admin components
│   ├── UserTable.tsx
│   ├── UserForm.tsx
│   ├── RoleSelector.tsx
│   └── AnalyticsDashboard.tsx
│
├── dashboard/                 # Dashboard components
│   ├── StatsCard.tsx
│   ├── RecentQueries.tsx
│   ├── QueryChart.tsx
│   └── ActivityFeed.tsx
│
├── data/                      # Data display components
│   ├── DataTable.tsx          # Enhanced table
│   ├── DataGrid.tsx           # Grid view
│   ├── Pagination.tsx
│   └── TableFilters.tsx
│
├── feedback/                  # User feedback components
│   ├── LoadingSpinner.tsx
│   ├── ErrorBoundary.tsx
│   ├── Toast.tsx
│   └── Skeleton.tsx
│
└── shared/                    # Shared/reusable components
    ├── Avatar.tsx
    ├── Badge.tsx
    ├── Tooltip.tsx
    ├── Modal.tsx
    └── EmptyState.tsx
```

### `src/lib/` - Utilities & Helpers

```
lib/
├── utils.ts                   # General utilities
├── cn.ts                      # className utility (clsx + tailwind-merge)
│
├── auth/                      # Authentication utilities
│   ├── config.ts              # NextAuth config
│   ├── middleware.ts          # Auth middleware
│   └── permissions.ts         # Permission checks
│
├── db/                        # Database utilities
│   └── prisma.ts              # Prisma client instance
│
├── trpc/                      # tRPC setup
│   ├── client.ts              # tRPC React client
│   ├── server.ts              # tRPC server setup
│   └── routers/               # tRPC routers
│       ├── _app.ts            # Root router
│       ├── auth.ts
│       ├── queries.ts
│       ├── connections.ts
│       ├── users.ts
│       └── admin.ts
│
├── validations/               # Zod schemas
│   ├── auth.ts
│   ├── queries.ts
│   ├── connections.ts
│   └── users.ts
│
├── hooks/                     # Custom React hooks
│   ├── useAuth.ts
│   ├── useQuery.ts
│   ├── useSocket.ts           # WebSocket hook
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
│
├── constants/                 # App constants
│   ├── routes.ts
│   ├── roles.ts
│   └── config.ts
│
└── formatters/                # Data formatters
    ├── date.ts
    ├── number.ts
    └── query.ts
```

### `src/server/` - Server-Side Code

```
server/
├── db/                        # Database operations
│   ├── queries.ts             # Query CRUD operations
│   ├── connections.ts         # Connection CRUD
│   ├── users.ts               # User CRUD
│   └── history.ts             # Query history
│
├── services/                  # Business logic
│   ├── query-executor.ts      # Query execution engine
│   ├── connection-pool.ts     # Connection pooling
│   ├── cache.ts               # Redis cache operations
│   ├── queue.ts               # Job queue operations
│   └── socket.ts              # WebSocket server
│
├── middleware/                # Server middleware
│   ├── auth.ts                # Auth middleware
│   ├── rate-limit.ts          # Rate limiting
│   └── logger.ts              # Request logging
│
└── utils/                     # Server utilities
    ├── validation.ts
    ├── sanitization.ts        # SQL sanitization
    └── errors.ts              # Error handling
```

### `src/styles/` - Styles

```
styles/
├── globals.css                # Global styles + design tokens
├── components.css             # Component-specific styles
└── animations.css             # Animation keyframes
```

### `src/types/` - TypeScript Types

```
types/
├── index.ts                   # Re-export all types
├── auth.ts                    # Auth types
├── user.ts                    # User types
├── query.ts                   # Query types
├── connection.ts              # Connection types
├── api.ts                     # API types
└── database.ts                # Database types
```

---

## Backend Structure (Server-Side)

### Database Schema (`prisma/`)

```
prisma/
├── schema.prisma              # Prisma schema
└── migrations/                # Migration files
    └── ...
```

### Environment Configuration

```
.env.local                     # Local development
.env.production                # Production (not in git)
.env.example                   # Example template
```

---

## Testing Structure

```
tests/
├── unit/                      # Unit tests
│   ├── components/
│   ├── lib/
│   └── server/
│
├── integration/               # Integration tests
│   ├── api/
│   └── db/
│
└── e2e/                       # End-to-end tests
    ├── auth.spec.ts
    ├── queries.spec.ts
    └── admin.spec.ts
```

---

## Configuration Files

### Root Level

```
├── .eslintrc.json             # ESLint configuration
├── .prettierrc                # Prettier configuration
├── .prettierignore
├── tsconfig.json              # TypeScript config
├── next.config.js             # Next.js config
├── tailwind.config.js         # Tailwind config
├── postcss.config.js          # PostCSS config
├── vitest.config.ts           # Vitest config
├── playwright.config.ts       # Playwright config
└── .husky/                    # Git hooks
    └── pre-commit
```

---

## Key File Descriptions

### `src/app/layout.tsx`
- Root layout with providers (tRPC, React Query, Theme)
- Global error boundary
- Font loading

### `src/app/(dashboard)/layout.tsx`
- Dashboard layout with sidebar and header
- Auth guard
- Role-based navigation

### `src/lib/trpc/routers/`
- tRPC routers for type-safe API
- Organized by domain (auth, queries, admin, etc.)

### `src/server/services/query-executor.ts`
- Core query execution logic
- Connection pooling
- Timeout handling
- Result processing

### `src/components/ui/`
- Base UI components from shadcn/ui
- Customized with design system tokens

---

## Naming Conventions

### Files & Folders
- **Components**: PascalCase (`QueryEditor.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Types**: camelCase (`user.ts`)
- **Routes**: kebab-case (`query-history/`)

### Code
- **Components**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase

---

## Import Organization

```typescript
// 1. External libraries
import { useState } from 'react'
import { z } from 'zod'

// 2. Internal utilities
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/formatters/date'

// 3. Components
import { Button } from '@/components/ui/button'
import { QueryEditor } from '@/components/queries/QueryEditor'

// 4. Types
import type { Query } from '@/types/query'

// 5. Styles (if needed)
import './styles.css'
```

---

## Future Considerations

- **Monorepo**: Consider splitting into `apps/` and `packages/` if scaling
- **Microservices**: Backend services could be extracted if needed
- **Shared Types**: Consider a shared types package if frontend/backend split
- **Storybook**: Add `storybook/` for component documentation
