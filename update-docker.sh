#!/bin/bash

# CHATILO Docker Update Script
# Updates existing Docker installation

set -e

echo "🔄 CHATILO Docker Update Starting..."
echo "===================================="

PROJECT_DIR="/opt/chatilo"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Navigate to project directory
cd $PROJECT_DIR

# Stop containers
print_status "Stopping containers..."
docker-compose -f docker-compose.prod.yml down

# Pull latest changes
print_status "Pulling latest changes from repository..."
git fetch origin
git reset --hard origin/main

# Rebuild and start containers
print_status "Rebuilding and starting containers..."
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for containers to be ready
print_status "Waiting for containers to be ready..."
sleep 20

# Renew SSL certificates
print_status "Renewing SSL certificates..."
certbot renew --quiet
cp /etc/letsencrypt/live/chatilo.de/fullchain.pem ssl/
cp /etc/letsencrypt/live/chatilo.de/privkey.pem ssl/

# Restart nginx to pick up new certificates
print_status "Restarting nginx..."
docker-compose -f docker-compose.prod.yml restart nginx

print_success "Docker update completed successfully!"
echo ""
echo "🌐 Website: https://www.chatilo.de"
echo "📊 Docker Status: docker-compose -f docker-compose.prod.yml ps"
echo "📝 Logs: docker-compose -f docker-compose.prod.yml logs" 