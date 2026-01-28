# Get Your Exact Supabase Connection String

## Quick Steps

1. **Go to your Supabase project settings:**
   ```
   https://supabase.com/dashboard/project/xzkkfwedgarqvtpkkyoh/settings/database
   ```

2. **Scroll down to "Connection string" section**

3. **Click on the "URI" tab**

4. **Copy the "Transaction mode" connection string**
   - This is the full connection string with all correct parameters
   - It will look something like:
     ```
     postgresql://postgres.xzkkfwedgarqvtpkkyoh:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```
   - OR:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xzkkfwedgarqvtpkkyoh.supabase.co:5432/postgres
     ```

5. **Update `.env.local` and `.env`:**
   - Replace the entire `DATABASE_URL` line with the copied connection string
   - Make sure to add `?schema=public` at the end if it's not there

## Example

If Supabase gives you:
```
postgresql://postgres.xzkkfwedgarqvtpkkyoh:kgFCWkqknPINvN2Z@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

Your `.env.local` should have:
```
DATABASE_URL="postgresql://postgres.xzkkfwedgarqvtpkkyoh:kgFCWkqknPINvN2Z@aws-0-us-west-1.pooler.supabase.com:6543/postgres?schema=public"
```

## Why This Is Needed

The exact connection string from Supabase includes:
- ✅ Correct region (us-east-1, us-west-1, eu-west-1, etc.)
- ✅ Correct hostname format
- ✅ Proper SSL/TLS configuration
- ✅ Connection pooling settings

## After You Update

Once you've updated `.env.local` with the exact connection string:

1. **Copy to .env:**
   ```bash
   cp .env.local .env
   ```

2. **Push schema:**
   ```bash
   npm run db:push
   ```

3. **Create admin user:**
   ```bash
   npm run create-admin admin@example.com yourpassword "Admin User"
   ```

4. **Start server:**
   ```bash
   npm run dev
   ```

## Troubleshooting

**Still can't connect?**
- Check if your Supabase project is active (not paused)
- Verify IP restrictions in Supabase Settings → Database → Connection Pooling
- Try the "Session mode" connection string instead of "Transaction mode"
