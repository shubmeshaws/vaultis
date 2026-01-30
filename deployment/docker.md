# Docker Deployment Guide

This guide covers deploying QueryX using Docker and Docker Compose.

## Prerequisites
- Docker installed
- Docker Compose installed

## Deployment Options

### Option 1: Full Stack (App + Local PostgreSQL)
Use this option if you want to run both the application and the database in Docker.

1.  **Configure Environment:**
    Ensure you have the correct variables in `.env`.
    ```env
    DATABASE_URL="postgresql://queryflow:queryflow123@postgres:5432/queryflow?schema=public"
    NEXTAUTH_SECRET="your-secret-here"
    NEXTAUTH_URL="http://localhost:3000"
    
    # OAuth Providers
    GITHUB_ID="your_github_id"
    GITHUB_SECRET="your_github_secret"
    GOOGLE_ID="your_google_id"
    GOOGLE_SECRET="your_google_secret"
    
    # Domain Restrictions (Optional)
    ALLOWED_DOMAINS="gmail.com,prismforce.ai"
    NEXT_PUBLIC_ALLOWED_DOMAINS_MSG="Access denied. Only @gmail.com or @prismforce.ai domains are allowed."
    ```

2.  **Start Services:**
    ```bash
    docker-compose up -d
    ```

3.  **Initialize Database:**
    ```bash
    # For development/first run:
    docker exec -it queryflow-app npm run db:push
    
    # For production updates:
    docker exec -it queryflow-app npx prisma migrate deploy
    
    # Create the first Admin user:
    docker exec -it queryflow-app npm run create-admin your@email.com yourpassword "Your Name"
    ```

### Option 2: App Only (Connecting to External DB)
Use this option if you are using **Supabase** or a managed **PostgreSQL** instance.

1.  **Modify docker-compose.yml:**
    You can remove the `postgres` service and the dependency.

2.  **Configure Environment:**
    Update `DATABASE_URL` with your Supabase/External PG string.
    ```env
    DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
    ```

3.  **Build and Run:**
    ```bash
    docker build -t queryx-app .
    docker run -d -p 3000:3000 --env-file .env queryx-app
    ```

## Maintenance

### Updating the Application
```bash
docker-compose pull
docker-compose up -d
```

### Viewing Logs
```bash
docker-compose logs -f app
```

### Restarting
```bash
docker-compose restart app
```
