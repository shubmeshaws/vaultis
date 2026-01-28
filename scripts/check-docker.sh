#!/bin/bash

# Check Docker availability

if ! command -v docker &> /dev/null; then
    echo "Docker is not installed."
    echo "Install Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "Docker is not running."
    echo "Please start Docker Desktop."
    exit 1
fi

if command -v docker-compose &> /dev/null; then
    echo "docker-compose"
elif docker compose version &> /dev/null; then
    echo "docker compose"
else
    echo "docker-compose not found"
    exit 1
fi
