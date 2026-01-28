#!/bin/bash

# QueryFlow Database Setup Script

set -e

echo "🚀 QueryFlow Database Setup"
echo "=========================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo ""
    echo "Please install Docker Desktop:"
    echo "  - macOS: https://www.docker.com/products/docker-desktop"
    echo "  - Or use Supabase instead (see DATABASE_SETUP.md)"
    echo ""
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running."
    echo ""
    echo "Please start Docker Desktop and try again."
    echo ""
    exit 1
fi

echo "✅ Docker is installed and running"
echo ""

# Check if docker-compose is available
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ docker-compose is not available"
    echo ""
    exit 1
fi

echo "📦 Starting PostgreSQL container..."
$COMPOSE_CMD up -d

echo ""
echo "⏳ Waiting for database to be ready..."
sleep 5

# Wait for database to be ready
for i in {1..30}; do
    if docker exec queryflow-postgres pg_isready -U queryflow &> /dev/null; then
        echo "✅ Database is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Database failed to start"
        exit 1
    fi
    sleep 1
done

echo ""
echo "🔧 Generating Prisma client..."
npm run db:generate

echo ""
echo "📊 Pushing database schema..."
npm run db:push

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "  1. Create an admin user:"
echo "     npm run create-admin admin@example.com yourpassword \"Admin User\""
echo ""
echo "  2. Start the development server:"
echo "     npm run dev"
echo ""
