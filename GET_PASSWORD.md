# Get Your Supabase Database Password

## Quick Steps

1. **Go to your Supabase project**: https://supabase.com/dashboard/project/xzkkfwedgarqvtpkkyoh

2. **Navigate to Settings**:
   - Click the ⚙️ **Settings** icon (bottom of left sidebar)
   - Click **Database** in the settings menu

3. **Find your password**:
   - Look for **Database password** section
   - If you forgot it, click **Reset database password**
   - Copy the password

4. **Update `.env.local`**:
   - Replace `YOUR_PASSWORD` in the `DATABASE_URL` with your actual password

## Alternative: Get Full Connection String

Instead of just the password, you can get the complete connection string:

1. In **Settings → Database**
2. Scroll to **Connection string** section
3. Click **URI** tab
4. Copy the **Transaction mode** connection string
5. Replace the entire `DATABASE_URL` line in `.env.local`

## Connection String Options

**Option 1: Direct Connection (port 5432)**
```
postgresql://postgres:YOUR_PASSWORD@db.xzkkfwedgarqvtpkkyoh.supabase.co:5432/postgres?schema=public
```

**Option 2: Pooler Connection (port 6543) - Recommended**
```
postgresql://postgres.xzkkfwedgarqvtpkkyoh:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?schema=public
```

**Note**: The pooler connection is better for Next.js/serverless. You may need to check your region in Supabase settings.

## After You Add the Password

Once you've updated `.env.local` with your password, run:

```bash
npm run db:push
npm run create-admin admin@example.com yourpassword "Admin User"
npm run dev
```
