# Supabase Setup Guide

## Quick Setup Steps

### 1. Create Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign in"
3. Sign up with GitHub, Google, or email (free)
4. Click "New Project"
5. Fill in:
   - **Name**: QueryFlow (or any name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
6. Click "Create new project"
7. Wait 2-3 minutes for database to provision

### 2. Get Your Connection String

1. In Supabase Dashboard, go to **Settings** (gear icon) → **Database**
2. Scroll down to **Connection string**
3. Click on **URI** tab
4. Copy the connection string
5. It looks like:
   ```
   postgresql://postgres.xxxxx:yourpassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

### 3. Update Environment File

Replace `YOUR_PASSWORD` and `YOUR_PROJECT_REF` in the connection string with your actual values.

**Format:**
```
postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?schema=public
```

**Example:**
```
postgresql://postgres.abcdefghijklmnop:MySecurePassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?schema=public
```

### 4. Run Setup Commands

Once you have your connection string, update `.env.local` and run:

```bash
# 1. Update DATABASE_URL in .env.local with your Supabase connection string
# (I'll help you do this)

# 2. Generate Prisma client (already done, but can re-run)
npm run db:generate

# 3. Push schema to Supabase database
npm run db:push

# 4. Create admin user
npm run create-admin admin@example.com yourpassword "Admin User"

# 5. Start development server
npm run dev
```

## Finding Your Connection Details

### Project Reference (PROJECT_REF)
- Found in: Settings → General → Reference ID
- Or in your project URL: `https://supabase.com/dashboard/project/[PROJECT_REF]`

### Database Password
- The password you set when creating the project
- If forgotten: Settings → Database → Reset database password

### Region
- Found in: Settings → General → Region
- Common: us-east-1, eu-west-1, ap-southeast-1

## Connection String Template

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?schema=public
```

## Quick Test

After setup, test your connection:

```bash
# Test with psql (if installed)
psql "your-connection-string-here" -c "SELECT version();"
```

Or just run `npm run db:push` - it will connect and create tables.

## Troubleshooting

### "Connection refused" or "Timeout"
- Check your Supabase project is active (not paused)
- Verify connection string is correct
- Check if your IP needs whitelisting (usually not needed for pooler)

### "Password authentication failed"
- Verify password is correct (no extra spaces)
- Try resetting database password in Supabase dashboard

### "Database does not exist"
- Supabase uses `postgres` as database name (not `queryflow`)
- Connection string should end with `/postgres`

### SSL Errors
- Add `?sslmode=require` to connection string if needed
- Supabase pooler usually handles SSL automatically

## Next Steps After Setup

1. ✅ Database schema will be created automatically
2. ✅ Create your admin user
3. ✅ Start the development server
4. ✅ Login and test the application

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Connection Pooling: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler
