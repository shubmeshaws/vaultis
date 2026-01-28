# How to Get Your Supabase Connection String

## Step-by-Step Instructions

### 1. Create Supabase Account (if you don't have one)

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email (it's free!)

### 2. Create a New Project

1. Click "New Project" in your Supabase dashboard
2. Fill in:
   - **Name**: QueryFlow (or any name you like)
   - **Database Password**: Create a strong password (⚠️ **SAVE THIS!**)
   - **Region**: Choose the one closest to you
3. Click "Create new project"
4. ⏳ Wait 2-3 minutes for the database to be provisioned

### 3. Get Your Connection String

1. In your Supabase dashboard, click the **Settings** icon (⚙️) in the left sidebar
2. Click **Database** in the settings menu
3. Scroll down to **Connection string** section
4. You'll see several tabs: **URI**, **JDBC**, **Golang**, etc.
5. Click on the **URI** tab
6. You'll see two connection strings:
   - **Session mode** (for transactions)
   - **Transaction mode** (for single queries) ← **Use this one**
7. Copy the **Transaction mode** connection string

### 4. Connection String Format

Your connection string will look like one of these:

**Option A (Direct connection):**
```
postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Option B (Direct connection, port 5432):**
```
postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**For QueryFlow, use Option A (pooler on port 6543) - it's better for serverless/Next.js**

### 5. Update Your .env.local File

1. Open `.env.local` in your project
2. Find the line: `DATABASE_URL="..."`
3. Replace it with your copied connection string
4. **Important**: Add `?schema=public` at the end if it's not there

**Final format should be:**
```
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?schema=public"
```

### 6. Example

If your connection string from Supabase is:
```
postgresql://postgres.abcdefghijklmnop:MyPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

Your `.env.local` should have:
```
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:MyPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?schema=public"
```

## Quick Checklist

- [ ] Created Supabase account
- [ ] Created new project
- [ ] Saved database password
- [ ] Got connection string from Settings → Database → URI tab
- [ ] Updated `.env.local` with connection string
- [ ] Added `?schema=public` to the end

## After You Update .env.local

Once you've updated `.env.local` with your Supabase connection string, run:

```bash
# 1. Push database schema
npm run db:push

# 2. Create admin user
npm run create-admin admin@example.com yourpassword "Admin User"

# 3. Start server
npm run dev
```

## Need Help Finding It?

**Where to find in Supabase Dashboard:**
1. Left sidebar → ⚙️ **Settings**
2. **Database** (in settings menu)
3. Scroll down to **Connection string**
4. Click **URI** tab
5. Copy **Transaction mode** connection string

**Screenshot locations:**
- Settings icon is usually at the bottom of the left sidebar
- Database settings is in the main settings page
- Connection string section is near the bottom of the Database settings page

## Troubleshooting

**"Can't find connection string"**
- Make sure your project is fully provisioned (wait a few minutes)
- Check you're in Settings → Database (not API settings)

**"Connection refused"**
- Make sure you're using the pooler connection (port 6543)
- Check your project is active (not paused)

**"Password authentication failed"**
- Double-check your password (no extra spaces)
- Try resetting password in Supabase dashboard
