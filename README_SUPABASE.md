# 🚀 Supabase Setup - Quick Guide

## Current Status

✅ **Environment file updated** - `.env.local` is configured for Supabase  
⚠️ **Action needed** - You need to add your Supabase connection string

## What You Need to Do

### Step 1: Get Your Supabase Connection String

1. **Go to Supabase**: [https://supabase.com](https://supabase.com)
2. **Create account** (if needed) - Free tier is fine
3. **Create new project**:
   - Name: QueryFlow
   - Set a database password (save it!)
   - Choose region
   - Wait 2-3 minutes for provisioning
4. **Get connection string**:
   - Settings (⚙️) → Database
   - Scroll to "Connection string"
   - Click "URI" tab
   - Copy the **Transaction mode** connection string
   - It looks like: `postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres`

### Step 2: Update .env.local

Open `.env.local` and replace this line:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?schema=public"
```

With your actual connection string (add `?schema=public` at the end if not present):
```
DATABASE_URL="postgresql://postgres.xxxxx:yourpassword@aws-0-region.pooler.supabase.com:6543/postgres?schema=public"
```

### Step 3: Run Setup Commands

Once `.env.local` is updated with your connection string:

```bash
# 1. Push database schema to Supabase
npm run db:push

# 2. Create your admin user
npm run create-admin admin@example.com yourpassword "Admin User"

# 3. Start development server
npm run dev
```

## Detailed Instructions

See `GET_SUPABASE_CONNECTION.md` for step-by-step screenshots and detailed instructions.

## Quick Reference

**Connection String Location:**
- Supabase Dashboard → Settings (⚙️) → Database → Connection string → URI tab

**Connection String Format:**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?schema=public
```

**After Setup:**
```bash
npm run db:push          # Create tables
npm run create-admin ... # Create admin
npm run dev              # Start server
```

## Need Help?

- **Detailed guide**: `GET_SUPABASE_CONNECTION.md`
- **Troubleshooting**: `SUPABASE_SETUP.md`
- **Supabase docs**: https://supabase.com/docs
