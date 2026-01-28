# QueryFlow - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │   Admin Panel    │              │   User Panel     │        │
│  │  (Next.js App)   │              │  (Next.js App)   │        │
│  └────────┬─────────┘              └────────┬─────────┘        │
│           │                                   │                  │
│           └───────────────┬───────────────────┘                  │
│                           │                                      │
│                    ┌──────▼──────┐                              │
│                    │  Next.js    │                              │
│                    │  Frontend   │                              │
│                    └──────┬──────┘                              │
└───────────────────────────┼────────────────────────────────────┘
                            │
                            │ HTTPS / WebSocket
                            │
┌───────────────────────────▼────────────────────────────────────┐
│                      API GATEWAY LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Next.js API Routes / tRPC                    │ │
│  │  - Authentication                                         │ │
│  │  - Authorization (RBAC)                                   │ │
│  │  - Request validation                                     │ │
│  │  - Rate limiting                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼────────────────────────────────────┐
│                      APPLICATION LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Auth       │  │   Query      │  │   Admin      │         │
│  │   Service    │  │   Service    │  │   Service    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                  │
│  ┌──────▼─────────────────▼─────────────────▼──────┐          │
│  │         Business Logic Layer                      │          │
│  │  - Query execution engine                         │          │
│  │  - Query validation & sanitization                │          │
│  │  - Result processing                              │          │
│  │  - User management                                │          │
│  │  - Permission checks                              │          │
│  └───────────────────────────────────────────────────┘          │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼────────────────────────────────────┐
│                        DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  PostgreSQL  │  │    Redis     │  │   Job Queue  │         │
│  │  (Prisma)    │  │   (Cache)    │  │   (BullMQ)   │         │
│  └──────┬───────┘  └──────────────┘  └──────────────┘         │
└─────────┼──────────────────────────────────────────────────────┘
          │
          │
┌─────────▼──────────────────────────────────────────────────────┐
│                    EXTERNAL DATABASES                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │PostgreSQL│  │  MySQL   │  │SQL Server│  │  Oracle  │      │
│  │(Customer)│  │(Customer)│  │(Customer)│  │(Customer)│      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Frontend (Next.js App)

**Pages/Routes:**
- `/` - Landing/Dashboard
- `/login` - Authentication
- `/dashboard` - Main dashboard (role-based)
- `/queries` - Query execution interface
- `/queries/[id]` - Query details & results
- `/history` - Query history
- `/connections` - Database connections (Admin only)
- `/users` - User management (Admin only)
- `/settings` - User settings
- `/admin/*` - Admin-only routes

**Key Features:**
- Server-side rendering for SEO
- Client-side navigation for SPA feel
- Real-time updates via WebSocket
- Optimistic UI updates
- Progressive Web App (PWA) support

### 2. Authentication & Authorization

**Flow:**
```
User Login → NextAuth.js → JWT Token → Session Storage
                                    ↓
                            Role Check (RBAC)
                                    ↓
                            Route Protection
```

**Implementation:**
- NextAuth.js for session management
- JWT tokens for stateless auth
- Role-based access control (RBAC)
- Middleware for route protection
- API route guards

### 3. API Layer (tRPC)

**Structure:**
```
tRPC Router
├── auth (authentication)
├── queries (query execution)
├── connections (database connections)
├── users (user management - admin)
├── admin (admin operations)
└── analytics (query analytics)
```

**Features:**
- Type-safe API calls
- Automatic request validation
- Error handling
- Rate limiting per user/role
- Request logging

### 4. Query Execution Engine

**Flow:**
```
Query Request → Validation → Sanitization → Connection Pool
                                              ↓
                                    Execute Query (with timeout)
                                              ↓
                                    Process Results
                                              ↓
                                    Cache (Redis) + Store (PostgreSQL)
                                              ↓
                                    Real-time Update (WebSocket)
```

**Safety Features:**
- Query timeout (configurable)
- Result size limits
- Read-only mode option
- SQL injection prevention
- Connection pooling
- Query queuing for long operations

### 5. Real-time Updates

**WebSocket Architecture:**
```
Client ←→ Socket.io Server ←→ Query Execution Engine
                              ↓
                        Event Emitter
                              ↓
                    Room-based Broadcasting
```

**Events:**
- `query:start` - Query execution started
- `query:progress` - Query progress update
- `query:complete` - Query completed
- `query:error` - Query failed
- `connection:status` - Database connection status

### 6. Caching Strategy

**Redis Cache Layers:**
1. **Query Results Cache**
   - Key: `query:result:{hash}`
   - TTL: 5 minutes (configurable)
   - Invalidate on data changes

2. **Connection Metadata Cache**
   - Key: `connection:{id}:meta`
   - TTL: 1 hour
   - Stores connection info, schema, etc.

3. **User Session Cache**
   - Key: `session:{userId}`
   - TTL: 24 hours
   - Stores user permissions, preferences

### 7. Job Queue (Long-running Queries)

**BullMQ Flow:**
```
Long Query → Add to Queue → Worker Process → Execute
                                          ↓
                                    Progress Updates
                                          ↓
                                    Complete/Error
```

**Features:**
- Background job processing
- Job status tracking
- Retry logic for failed queries
- Priority queues
- Job cancellation

### 8. Logging & Monitoring

**Log Levels:**
- `ERROR` - Critical errors, query failures
- `WARN` - Warnings, slow queries
- `INFO` - User actions, query executions
- `DEBUG` - Detailed debugging info

**Log Destinations:**
- Console (development)
- File system (production)
- Sentry (errors)
- Analytics service (user actions)

**Metrics Tracked:**
- Query execution time
- Query success/failure rate
- API response times
- Database connection pool usage
- Active users
- Error rates

### 9. Security Architecture

**Layers:**
1. **Network Security**
   - HTTPS only
   - CORS configuration
   - Rate limiting

2. **Authentication Security**
   - Secure JWT tokens
   - Refresh token rotation
   - Session timeout

3. **Authorization Security**
   - Role-based access control
   - Resource-level permissions
   - API route guards

4. **Data Security**
   - SQL injection prevention
   - Input sanitization
   - Encrypted database connections
   - Secrets management (environment variables)

5. **Query Security**
   - Query timeout limits
   - Result size limits
   - Read-only mode enforcement
   - Query whitelist/blacklist (optional)

## Data Flow Examples

### Example 1: Execute Query (User)

```
1. User types SQL query in Monaco Editor
2. Client validates query syntax (client-side)
3. Submit → tRPC mutation `queries.execute`
4. API validates permissions & query
5. Check Redis cache for recent results
6. If cache miss:
   - Get connection from pool
   - Execute query (with timeout)
   - Process results
   - Cache results in Redis
   - Store query history in PostgreSQL
7. Emit WebSocket event: `query:complete`
8. Return results to client
9. Client updates UI optimistically
```

### Example 2: Admin Creates User

```
1. Admin navigates to /admin/users
2. Fills user creation form
3. Submit → tRPC mutation `admin.createUser`
4. API checks: Is user admin? (middleware)
5. Validate user data (Zod schema)
6. Create user in PostgreSQL (Prisma)
7. Generate password hash (bcrypt)
8. Send welcome email (optional)
9. Invalidate user list cache
10. Return success response
11. Client updates UI
```

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers (can scale horizontally)
- Redis for shared state
- PostgreSQL connection pooling
- Load balancer for multiple instances

### Vertical Scaling
- Database query optimization
- Caching frequently accessed data
- Job queue for async processing
- CDN for static assets

### Performance Optimizations
- Server-side rendering for initial load
- Client-side caching with React Query
- Database indexing
- Query result pagination
- Lazy loading of components

## Deployment Architecture

### Production Setup
```
┌─────────────┐
│   Vercel    │  ← Next.js App (Frontend + API Routes)
└──────┬──────┘
       │
       ├──→ Supabase/Neon (PostgreSQL)
       ├──→ Upstash (Redis)
       └──→ External Monitoring (Sentry, Analytics)
```

### Environment Variables
- Database URLs (encrypted)
- Redis connection string
- JWT secrets
- OAuth provider credentials
- API keys for external services
