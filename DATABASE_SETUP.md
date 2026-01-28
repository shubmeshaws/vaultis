# Database Setup Guide

## Option 1: Docker PostgreSQL (Recommended for Local Development)

### Quick Start

1. **Start PostgreSQL with Docker:**
   ```bash
   npm run docker:up
   ```
   Or manually:
   ```bash
   docker-compose up -d
   ```

2. **Use Docker database configuration:**
   ```bash
   cp .env.local.docker .env.local
   ```

3. **Set up database schema:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Create admin user:**
   ```bash
   npm run create-admin admin@example.com yourpassword "Admin User"
   ```

### Docker Commands

- **Start database**: `npm run docker:up` or `docker-compose up -d`
- **Stop database**: `npm run docker:down` or `docker-compose down`
- **View logs**: `npm run docker:logs` or `docker-compose logs -f postgres`
- **Full setup**: `npm run setup:docker` (starts DB, generates client, pushes schema)

### Docker Database Credentials

- **Host**: localhost
- **Port**: 5432
- **Database**: queryflow
- **Username**: queryflow
- **Password**: queryflow123

**Connection String:**
```
postgresql://queryflow:queryflow123@localhost:5432/queryflow?schema=public
```

---

## Option 2: Supabase (Cloud Database)

### Setup Steps

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for database to be provisioned

2. **Get Connection String:**
   - Go to Project Settings → Database
   - Copy the connection string (URI format)
   - Replace `[YOUR-PASSWORD]` with your database password

3. **Configure Environment:**
   ```bash
   cp .env.local.supabase .env.local
   ```
   Then update `DATABASE_URL` in `.env.local` with your Supabase connection string.

4. **Set up database schema:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Create admin user:**
   ```bash
   npm run create-admin admin@example.com yourpassword "Admin User"
   ```

### Supabase Connection String Format

```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public
```

---

## Option 3: Local PostgreSQL

If you have PostgreSQL installed locally:

1. **Create database:**
   ```bash
   createdb queryflow
   # OR
   psql -c "CREATE DATABASE queryflow;"
   ```

2. **Update `.env.local`:**
   ```env
   DATABASE_URL="postgresql://youruser:yourpassword@localhost:5432/queryflow?schema=public"
   ```

3. **Set up schema:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

---

## Verify Database Connection

Test your connection:
```bash
# Using psql
psql "postgresql://queryflow:queryflow123@localhost:5432/queryflow"

# Or check if Docker container is running
docker ps | grep queryflow-postgres
```

## Troubleshooting

### Docker Issues

**Container won't start:**
```bash
# Check if port 5432 is already in use
lsof -i :5432

# Remove old container and start fresh
docker-compose down -v
docker-compose up -d
```

**Can't connect to database:**
- Wait a few seconds after starting Docker (database needs time to initialize)
- Check container logs: `npm run docker:logs`
- Verify container is running: `docker ps`

### Supabase Issues

**Connection timeout:**
- Check your Supabase project is active
- Verify connection string is correct
- Check if your IP needs to be whitelisted (Settings → Database → Connection Pooling)

**SSL errors:**
- Add `?sslmode=require` to connection string if needed

### General Issues

**Prisma can't connect:**
- Verify `DATABASE_URL` in `.env.local` is correct
- Check database is running and accessible
- Try connecting with `psql` first to verify credentials
