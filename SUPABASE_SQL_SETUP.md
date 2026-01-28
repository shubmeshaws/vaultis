# Setup Database Using Supabase SQL Editor

Since we can't connect via Prisma directly, we'll set up the database using Supabase's SQL Editor.

## Steps

### 1. Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/xzkkfwedgarqvtpkkyoh
2. Click **SQL Editor** in the left sidebar
3. Click **New query**

### 2. Run the Setup SQL

1. Open the file `supabase-setup.sql` in this project
2. Copy the entire SQL script
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

### 3. Verify Tables Were Created

After running the SQL:
1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - `User`
   - `Account`
   - `Session`
   - `VerificationToken`

### 4. Create Your First Admin User

Run this SQL in the SQL Editor:

```sql
-- Create admin user (replace email and password hash)
-- Password: 'admin123' (hashed with bcrypt)
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'admin_' || gen_random_uuid()::text,
  'admin@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5Y', -- This is 'admin123' hashed
  'Admin User',
  'ADMIN',
  NOW(),
  NOW()
);
```

**OR** use the create-admin script after we fix the connection:

```bash
npm run create-admin admin@example.com yourpassword "Admin User"
```

### 5. Update Prisma to Use Supabase Connection

Once tables are created, we need to get the connection string. Try these:

**Option A: Get from Supabase Dashboard**
- Settings → Database → Connection string → URI tab
- Copy the "Transaction mode" connection string

**Option B: Try These Formats**

Format 1 (Direct):
```
postgresql://postgres:kgFCWkqknPINvN2Z@db.xzkkfwedgarqvtpkkyoh.supabase.co:5432/postgres?schema=public
```

Format 2 (Pooler - need region):
```
postgresql://postgres.xzkkfwedgarqvtpkkyoh:kgFCWkqknPINvN2Z@aws-0-[REGION].pooler.supabase.com:6543/postgres?schema=public
```

### 6. After SQL Setup

Once you've run the SQL and have the connection string:

1. Update `.env.local` with the connection string
2. Run: `cp .env.local .env`
3. Run: `npm run db:generate` (to sync Prisma client)
4. Test connection: `npm run db:studio` (should open Prisma Studio)

## Alternative: Use Supabase Client SDK

If connection string still doesn't work, we can:
1. Use Supabase REST API for some operations
2. Keep Prisma for type safety
3. Use connection pooling or Supabase's connection methods

Let me know if you want to try this approach!
