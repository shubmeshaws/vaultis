# EC2 Deployment Guide (AWS)

Steps to deploy QueryX on an Amazon EC2 instance (Ubuntu 22.04 recommended).

## 1. Instance Setup
1.  Launch an EC2 instance (t2.small or larger recommended).
2.  Open Ports: 22 (SSH), 80 (HTTP), 443 (HTTPS), and 3000/3001 (if not using Nginx).

## 2. Environment Preparation
Connect via SSH and run:
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 3. Application Deployment

1.  **Clone Repository:**
    ```bash
    git clone https://github.com/your-repo/queryx.git
    cd queryx
    npm install
    ```

2.  **Configure Environment:**
    ```bash
    cp .env.example .env
    nano .env
    ```
    - For **Supabase**: Use your Supabase connection string.
    - For **Local Postgres**: Install postgres locally or use Docker (see docker.md).

3.  **Build and Start:**
    ```bash
    npm run build
    sudo npm install -g pm2
    pm2 start npm --name "queryx" -- start
    pm2 save
    pm2 startup

4. **Create Admin User**
   Inside the project directory, run:
   ```bash
   npm run create-admin your@email.com yourpassword "Your Name"
   ```
    ```

## 4. Database Specifics

### Using Supabase
- Simply update `DATABASE_URL` in `.env`.
- Run `npx prisma db push` (development) or `npx prisma migrate deploy` (production) to initialize.

### Using Local Postgres on EC2
```bash
sudo apt install postgresql postgresql-contrib -y
sudo -u postgres psql
# CREATE DATABASE queryflow;
# CREATE USER queryflow WITH PASSWORD 'yourpassword';
# GRANT ALL PRIVILEGES ON DATABASE queryflow TO queryflow;
```

## 5. Nginx Reverse Proxy (Optional but Recommended)
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/default
```
Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
`sudo systemctl restart nginx`
