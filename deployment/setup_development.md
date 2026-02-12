# Development Setup Guide (Ubuntu 24.04)

This guide details how to set up the Vaultis (QueryX) application for **development** on an Ubuntu 24.04 server (e.g., EC2).

## 1. System Update

First, ensure your system is up to date.

```bash
sudo apt update && sudo apt upgrade -y
```

## 2. Install Dependencies

### Install Git

```bash
sudo apt install git -y
```

### Install Node.js (via NVM)

Using NVM (Node Version Manager) is recommended for development environments to easily switch versions.

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Activate NVM
source ~/.bashrc

# Install Node.js LTS (v20 Recommended)
nvm install 20
nvm use 20
node -v # Verify version
```

### Install PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Configure Database User

Set a password for the default `postgres` user to match your `.env` later.

```bash
sudo -u postgres psql
# Inside psql console:
ALTER USER postgres PASSWORD 'your_secure_password';
\q
```

## 3. Application Setup

### Clone Repository

```bash
git clone <YOUR_REPO_URL>
cd vaultis
```

### Environment Configuration

Create a `.env` file based on the example.

```bash
cp .env.example .env
nano .env
```

**Critical Variables:**

- `DATABASE_URL="postgresql://postgres:your_secure_password@localhost:5432/vaultis?schema=public"`
- `NEXTAUTH_URL="http://<YOUR_EC2_IP>:3000"` (For dev, IP access is fine)
- `NEXTAUTH_SECRET` (Generate one: `openssl rand -base64 32`)

### Install Packages

```bash
npm install
```

### Database Initialization

For development, use `db push`. This synchronizes your Prisma schema with the database without creating migration history files.

```bash
npx prisma db push
```

_Note: If this command fails, ensure your `DATABASE_URL` is correct and PostgreSQL is running._

### generate Prisma Client

```bash
npx prisma generate
```

## 4. Run Development Server

Start the application in development mode with HMR (Hot Module Replacement).

```bash
npm run dev
```

The app will be available at `http://<YOUR_EC2_IP>:3001` (Note: package.json specifies port 3001).

---

## Troubleshooting

- **Port 3001 not accessible?** Check your EC2 Security Group (Inbound Rules) to allow Custom TCP Port 3001.
- **Database connection error?** Ensure `DATABASE_URL` uses the correct password and `localhost`.
