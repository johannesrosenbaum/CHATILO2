#!/bin/bash

echo "🚀 Starting CHATILO Production Environment..."

# Load production environment variables
source .env.production

# Stop existing containers
docker-compose -f docker-compose.prod.yml down

# Build and start services
docker-compose -f docker-compose.prod.yml up --build -d

echo "✅ CHATILO Production Environment started!"
echo "🌐 Application: https://your-domain.com"
