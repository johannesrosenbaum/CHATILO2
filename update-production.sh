#!/bin/bash

# CHATILO Production Update Script
# Updates existing installation

set -e

echo "🔄 CHATILO Production Update Starting..."
echo "=========================================="

PROJECT_DIR="/var/www/chatilo"

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

# Stop the application
print_status "Stopping application..."
pm2 stop chatilo-server || true

# Pull latest changes
print_status "Pulling latest changes from repository..."
git fetch origin
git reset --hard origin/main

# Install dependencies
print_status "Installing dependencies..."
npm install

# Build client
print_status "Building client application..."
cd client
npm install
npm run build
cd ..

# Build server
print_status "Building server..."
cd server
npm install
cd ..

# Set permissions
print_status "Setting permissions..."
chown -R www-data:www-data $PROJECT_DIR
chmod -R 755 $PROJECT_DIR
chmod -R 777 $PROJECT_DIR/server/uploads

# Restart application
print_status "Restarting application..."
pm2 restart chatilo-server

# Reload Nginx
print_status "Reloading Nginx..."
systemctl reload nginx

print_success "Update completed successfully!"
echo ""
echo "🌐 Website: https://www.chatilo.de"
echo "📊 PM2 Status: pm2 status"
echo "📝 Logs: pm2 logs chatilo-server" 