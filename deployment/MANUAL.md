# Vaultis Organization - Comprehensive Deployment Manual

Welcome to the **Vaultis** (formerly QueryX) setup guide. This document is designed for users with **zero prior experience** to set up the application from scratch in both **Development** (local computer) and **Production** (live server) environments.

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Installation](#2-project-installation)
3. [Environment Configuration (.env)](#3-environment-configuration-env)
4. [Database Setup](#4-database-setup)
5. [Running the Application](#5-running-the-application)
6. [Creating an Admin User](#6-creating-an-admin-user)
7. [Production Deployment Guide](#7-production-deployment-guide)

---

## 1. Prerequisites

Before installing Vaultis, you must have the following software installed on your computer or server.

### 1.1 Installing Node.js & NPM (Ubuntu/Debian)

If you are on a fresh server (EC2) or Linux machine:

```bash
# 1. Update your package list
sudo apt update

# 2. Install curl (tool to download files)
sudo apt install curl -y

# 3. Download Node.js 18 setup script
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 4. Install Node.js
sudo apt-get install -y nodejs

# 5. Verify installation
node -v  # Should show v18.x.x
npm -v   # Should show 9.x.x or similar
```

### 1.2 Installing Git

```bash
sudo apt install git -y
```

---

## 2. Project Installation

1.  **Open your Terminal** (Command Prompt on Windows, Terminal on Mac/Linux).
2.  **Download the Code**: run the following command to clone the repository.
    ```bash
    git clone <your-repository-url>
    cd vaultis
    ```
3.  **Authentication Setup**: Before installing private packages (if any), authenticate with your registry.
    ```bash
    npm login
    ```
4.  **Install Dependencies**: download all the libraries the project needs.
    ```bash
    npm install
    ```
    _This process may take a few minutes._

---

## 3. Environment Configuration (.env)

The application needs secrets (passwords, API keys) to work. We store these in a file named `.env`.

1.  **Create the File**: Copy the example file to create your actual configuration file.
    ```bash
    cp .env.example .env
    ```
2.  **Edit the File**: Open `.env` in any text editor (Notepad, VS Code, etc.) and fill in the values.

### Env Configuration Reference

| Variable              | Description                                        | Example Value                                                    |
| :-------------------- | :------------------------------------------------- | :--------------------------------------------------------------- |
| **DATABASE_URL**      | Connection string for your PostgreSQL database.    | `postgresql://user:pass@localhost:5432/vaultis`                  |
| **NEXTAUTH_URL**      | The URL of your website.                           | `http://localhost:3000` (Dev) or `https://yourdomain.com` (Prod) |
| **NEXTAUTH_SECRET**   | A random secure password for encrypting sessions.  | Generate one: `openssl rand -base64 32`                          |
| **NODE_ENV**          | The environment mode.                              | `development` or `production`                                    |
| **Github/Google IDs** | (Optional) For detailed setup, see Auth providers. | Leave blank if using email/password only.                        |
| **ALLOWED_DOMAINS**   | Restrict login to specific email domains.          | `gmail.com,yourcompany.com`                                      |

### Setting Up Single Sign-On (SSO)

To enable "Login with Google/GitHub", you need to generate keys.

#### A. GitHub OAuth

1.  Go to **[GitHub Developer Settings](https://github.com/settings/apps)** -> **New OAuth App**.
2.  **Application Name**: Vaultis
3.  **Homepage URL**: `https://your-domain.com` (or `http://localhost:3000` for dev)
4.  **Authorization callback URL**:
    - Dev: `http://localhost:3000/api/auth/callback/github`
    - Prod: `https://your-domain.com/api/auth/callback/github`
5.  Click **Register application**.
6.  Copy the **Client ID** → `GITHUB_ID` in .env
7.  Generate a **Client Secret** → `GITHUB_SECRET` in .env

#### B. Google OAuth

1.  Go to **[Google Cloud Console](https://console.cloud.google.com/)**.
2.  Create a Project -> "APIs & Services" -> "Credentials" -> "Create Credentials" -> "OAuth client ID".
3.  **Application Type**: Web application.
4.  **Authorized JavaScript origins**:
    - `https://your-domain.com`
    - `http://localhost:3000` (for testing)
5.  **Authorized redirect URIs**:
    - Dev: `http://localhost:3000/api/auth/callback/google`
    - Prod: `https://your-domain.com/api/auth/callback/google`
6.  Copy **Client ID** and **Client Secret** to your .env file.

---

## 4. Database Setup

Vaultis uses a **PostgreSQL** database. You must have a database running before starting the app.

### Option A: Using Docker (Easier)

We have a script to set this up automatically.

```bash
# Set up the database container and apply schema
npm run setup:docker
```

_If the script fails on Windows, you can run:_

```bash
docker-compose up -d
npm run db:generate
npm run db:push
```

### Option C: Installing PostgreSQL Directly on EC2 (Production Recommended)

If you don't use Docker or a managed service, install Postgres directly on your Ubuntu server.

**1. Install PostgreSQL**

```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**2. Configure the Database**
Switch to the postgres user to run commands:

```bash
sudo -i -u postgres
```

Enter the PostgreSQL shell:

```bash
psql
```

Run these SQL commands (Change 'secure_password' to a REAL password):

````sql
-- Create the database
CREATE DATABASE vaultis;

-- Create the user
CREATE USER vaultis_user WITH ENCRYPTED PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE vaultis TO vaultis_user;

-- (Optional) If using schema 'public'
\c vaultis
GRANT ALL ON SCHEMA public TO vaultis_user;

---

## 8. Helm & GHCR Deployment Strategy

Vaultis includes production-ready **Helm Charts** and instructions for deploying via **GitHub Container Registry (GHCR)**.

### Step 1: Deploying to GHCR (GitHub Container Registry)

You can host your Docker images directly on GitHub for free (publicly) or privately.

**1. Create a Personal Access Token (PAT)**
*   Go to GitHub Settings -> Developer Settings -> Personal access tokens (Classic).
*   Generate new token (select `write:packages` and `delete:packages`).
*   Copy the token.

**2. Login to GHCR**
```bash
export CR_PAT=YOUR_TOKEN
echo $CR_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
````

**3. Build and Push the Image**

```bash
# Build the image properly for production
docker build -t ghcr.io/YOUR_GITHUB_USERNAME/vaultis:latest .

# Push to GitHub
docker push ghcr.io/YOUR_GITHUB_USERNAME/vaultis:latest
```

### Step 2: Deploying with Helm

We have pre-configured charts in `deployment/helm/vaultis`.

**1. Install Helm**

- [Install Helm Guide](https://helm.sh/docs/intro/install/)

**2. Configure Values**
Edit `deployment/helm/vaultis/values.yaml` to set your environment:

```yaml
image:
  repository: ghcr.io/YOUR_USERNAME/vaultis
  tag: "latest"

env:
  DATABASE_URL: "postgresql://..."
  NEXTAUTH_URL: "https://your-domain.com"
  NEXTAUTH_SECRET: "strong-secret"
```

**3. Deploy to Cluster**

```bash
# Install the chart
helm install vaultis ./deployment/helm/vaultis

# Upgrade the chart (after changes)
helm upgrade vaultis ./deployment/helm/vaultis
```

-- Exit
\q

````

Exit the postgres user session:

```bash
exit
````

**3. Update your .env**

```env
DATABASE_URL="postgresql://vaultis_user:secure_password@localhost:5432/vaultis"
```

---

## 5. Running the Application

### Development Mode (Local)

Use this when you are editing code or testing on your own machine.

```bash
npm run dev
```

- **Access the App**: Open your browser and go to `http://localhost:3000`.

---

## 6. Creating an Admin User

You can't register an Admin account through the website for security reasons. different roles have different permissions.

**To create the FIRST Admin account:**

1.  Ensure your database is running.
2.  Run the following command in your terminal:

    ```bash
    # usage: npm run create-admin <email> <password> "<name>"

    npm run create-admin admin@vaultis.com securePassword123 "Super Admin"
    ```

3.  Now login with `admin@vaultis.com` on the login page.

---

## 7. Production Deployment Guide

Deploying for real users requires robust settings.

### Step 1: Server Preparation

- Get a refined server (Ubuntu 22.04 LTS recommended) from AWS, DigitalOcean, etc.
- Install Node.js, Git, and Nginx (optional, for reverse proxy).

### Step 2: Code Setup

On your server:

```bash
git clone <repo-url>
cd vaultis
npm install --production
```

### Step 3: Environment Setup

Create a production `.env` file:

```bash
nano .env
```

- Set `NODE_ENV="production"`
- Set `NEXTAUTH_URL="https://your-domain.com"`
- Set a strong `NEXTAUTH_SECRET`.
- Use a managed database URL (e.g., AWS RDS) for `DATABASE_URL`.

### Step 4: Build the Application

Compiles the code for performance.

```bash
npm run build
```

### Step 5: Start with Process Manager (PM2)

We use PM2 to keep the app running in the background.

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the app
pm2 start npm --name "vaultis" -- start

# Save settings so it restarts on reboot
pm2 save
pm2 startup
```

### Step 6: Finalize Database

Run migrations on the production database.

```bash
npx prisma migrate deploy
```

**Your Vaultis application is now live!**
