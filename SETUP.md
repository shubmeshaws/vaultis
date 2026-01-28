# QueryFlow - Quick Setup Guide

## ✅ Step 1: Install Dependencies (Already Done!)
```bash
npm install --legacy-peer-deps
```

## ✅ Step 2: Configure Environment Variables

1. **Update `.env.local`** with your database connection:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/queryflow?schema=public"
   ```

2. **Generate and set NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste it into `.env.local` as `NEXTAUTH_SECRET`

## ✅ Step 3: Set Up Database

1. **Create PostgreSQL database** (if not exists):
   ```bash
   createdb queryflow
   # OR using psql:
   psql -c "CREATE DATABASE queryflow;"
   ```

2. **Push Prisma schema to database**:
   ```bash
   npm run db:push
   ```

## ✅ Step 4: Create Admin User

After the database is set up, create your first admin user:

```bash
npm run create-admin <email> <password> [name]
```

Example:
```bash
npm run create-admin admin@example.com mypassword "Admin User"
```

## ✅ Step 5: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Quick Test

1. **Register a new user**: Go to `/register`
2. **Login**: Go to `/login` with your credentials
3. **Access dashboard**: You'll be redirected to `/dashboard`
4. **Test admin access**: Login as admin and go to `/admin`

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running: `pg_isready`
- Check your `DATABASE_URL` in `.env.local`
- Verify database exists: `psql -l | grep queryflow`

### "Module not found" Errors
- Run `npm install --legacy-peer-deps` again
- Delete `node_modules` and reinstall

### Prisma Errors
- Run `npm run db:generate` to regenerate Prisma client
- Check your database connection string

### NextAuth Errors
- Ensure `NEXTAUTH_SECRET` is set in `.env.local`
- Check `NEXTAUTH_URL` matches your app URL
- Clear browser cookies if session issues persist

## Next Steps

- ✅ Authentication system is ready
- ✅ Role-based access control is working
- 🚧 Add database connections
- 🚧 Implement query execution
- 🚧 Add query history

## Default Users

After setup, you'll have:
- **Admin user**: Created via script (full access)
- **Regular users**: Can register via `/register` (USER role by default)

## Security Notes

- All passwords are hashed with bcrypt (12 rounds)
- JWT tokens are used for sessions
- No secrets are hardcoded (all in `.env.local`)
- Routes are protected server-side
