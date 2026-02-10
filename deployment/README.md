# Vaultis Deployment Documentation

This directory contains detailed guides for deploying Vaultis in various environments.

## Deployment Guides

| Target Environment | Guide |
| :--- | :--- |
| **Docker / Docker Compose** | [docker.md](./docker.md) |
| **AWS EC2 (Linux VM)** | [ec2.md](./ec2.md) |
| **Kubernetes** | [kubernetes.md](./kubernetes.md) |
| **Database Schema & Queries** | [database_schema.md](./database_schema.md) |

## Supported Database Configurations

All deployment methods support the following database options:

- **Supabase**: Managed PostgreSQL (Fastest setup)
- **Local Postgres**: Running on the same host or container network.
- **Docker Database**: Included in the `docker-compose.yml` for isolated environments.

## Common Post-Deployment Steps

After deployment, always ensure you:
1. Run `npx prisma db push` to sync your schema.
2. Create your initial admin user using `npm run create-admin`.
3. Configure `NEXTAUTH_URL` to match your public domain.
