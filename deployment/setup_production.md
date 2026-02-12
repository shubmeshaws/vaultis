# Production Setup Guide (Ubuntu 24.04)

This guide details how to deploy Vaultis (QueryX) for **production** on an Ubuntu 24.04 server.

## Why use `npm run build` and PM2?

Running your application in production mode (`npm run build` + `npm start`) managed by PM2 offers critical advantages over development mode (`npm run dev`):

1.  **Performance & Optimization**: `npm run build` compiles your code, removing development-only features (like hot reloading/HMR), optimizing bundles, and enabling production-specific caching. This results in significantly faster load times and lower resource consumption.
2.  **Stability & Persistence**: PM2 is a process manager that keeps your application alive. If the app crashes or the server reboots, PM2 automatically restarts it, ensuring zero downtime.
3.  **Scalability**: PM2 allows you to run your application in **cluster mode** (if configured), utilizing all available CPU cores to handle more concurrent traffic.
4.  **Monitoring**: PM2 provides built-in tools (`pm2 monit`, `pm2 logs`) to monitor CPU/memory usage and view application logs in real-time.

---

## 1. System Preparation

Update system packages and install essential tools.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install git curl wget build-essential -y
```

## 2. Install Dependencies

### Node.js (via NodeSource)

For production, a system-wide installation represents a more standard approach than NVM.

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Secure Database Setup:**

```bash
sudo -u postgres psql
# In psql:
ALTER USER postgres PASSWORD 'YOUR_STRONG_PASSWORD';
CREATE DATABASE vaultis;
\q
```

### Nginx & Certbot

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 3. Application Deployment

### Clone Repository

We'll deploy to `/var/www/vaultis`.

```bash
sudo mkdir -p /var/www/vaultis
sudo chown -R $USER:$USER /var/www/vaultis
git clone <YOUR_REPO_URL> /var/www/vaultis
cd /var/www/vaultis
```

### Install Dependencies

```bash
npm install --production=false
# We need devDependencies to build the app (Next.js, TypeScript, etc.)
# You can prune them later with `npm prune --production` if desired.
```

### Environment Configuration

Create a `.env` file for production.

```bash
nano .env
```

**Required Variables:**

- `DATABASE_URL="postgresql://postgres:YOUR_STRONG_PASSWORD@localhost:5432/vaultis?schema=public"`
- `NEXTAUTH_URL="https://your-domain.com"` (Must use HTTPS for production)
- `NEXTAUTH_SECRET` (Generate a random string)
- `NODE_ENV="production"`

## 4. Database Migrations

**Important:** In production, use `prisma migrate deploy`, NOT `db push`.

- `db push`: Prototyping tool. It force-resets the database schema to match your Prisma file, potentially causing data loss.
- `migrate deploy`: Applies version-controlled migrations safely.

**If `migrate deploy` fails:**
It likely means you haven't initialized migrations in your codebase.

1. Locally (on your dev machine): Run `npx prisma migrate dev --name init_schema`. This creates a `migrations/` folder.
2. Commit and push this folder to Git.
3. Pull changes on the server.
4. Run `npx prisma migrate deploy`.

_Fallback (Only if starting fresh/empty DB):_

```bash
npx prisma db push
```

## 5. Build Application

```bash
npx prisma generate
npm run build
```

## 6. Process Management (PM2)

Use PM2 to keep the application running.

```bash
pm2 start npm --name "vaultis" -- start
pm2 save
pm2 startup
# Run the command output by `pm2 startup` to freeze the process list on reboot.
```

## 7. Nginx Configuration

Create a configuration file for your domain.

```bash
sudo nano /etc/nginx/sites-available/vaultis
```

**Content:**

```nginx
server {
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000; # Production runs on 3000 by default
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/vaultis /etc/nginx/sites-enabled/
sudo nginx -t # Test config
sudo systemctl restart nginx
```

## 8. SSL Setup (HTTPS)

Secure your site with Let's Encrypt.

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 9. Firewall (UFW)

Secure the server ports.

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Maintenance

- **View Logs:** `pm2 logs vaultis`
- **Restart App:** `pm2 restart vaultis`
- **Update App:**
  1. `git pull`
  2. `npm install`
  3. `npx prisma migrate deploy`
  4. `npm run build`
  5. `pm2 restart vaultis`
