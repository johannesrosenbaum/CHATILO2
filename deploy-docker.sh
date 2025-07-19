#!/bin/bash

# CHATILO Docker Production Deployment Script
# Deploys using Docker Compose for https://www.chatilo.de

set -e

echo "🐳 CHATILO Docker Production Deployment Starting..."
echo "=================================================="

# Configuration
PROJECT_DIR="/opt/chatilo"
DOMAIN="chatilo.de"
SSL_EMAIL="admin@chatilo.de"  # Change this to your email

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_status "Installing required packages..."
apt install -y curl wget git docker.io docker-compose certbot python3-certbot-nginx

# Start and enable Docker
print_status "Starting Docker service..."
systemctl start docker
systemctl enable docker

# Create project directory
print_status "Setting up project directory..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Clone repository if not exists
if [ ! -d ".git" ]; then
    print_status "Cloning repository..."
    git clone https://github.com/johannesrosenbaum/CHATILO2.git .
else
    print_status "Updating repository..."
    git fetch origin
    git reset --hard origin/main
fi

# Create environment file
print_status "Creating environment configuration..."
cat > .env << EOF
# Production Environment Variables
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
DOMAIN=$DOMAIN
SSL_EMAIL=$SSL_EMAIL

# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=chatilo2024
MONGO_DATABASE=chatilo

# Docker Configuration
COMPOSE_PROJECT_NAME=chatilo
EOF

# Create SSL directory
mkdir -p ssl

# Create upload directories
print_status "Creating upload directories..."
mkdir -p server/uploads/avatars
mkdir -p server/uploads/images
mkdir -p server/uploads/videos
mkdir -p server/uploads/files

# Set permissions
print_status "Setting permissions..."
chown -R root:root $PROJECT_DIR
chmod -R 755 $PROJECT_DIR
chmod -R 777 server/uploads

# Build and start containers
print_status "Building and starting Docker containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for containers to be ready
print_status "Waiting for containers to be ready..."
sleep 30

# Setup SSL certificates
print_status "Setting up SSL certificates..."
if [ ! -f "ssl/fullchain.pem" ]; then
    print_status "Obtaining SSL certificate..."
    
    # Stop nginx temporarily for certbot
    docker-compose -f docker-compose.prod.yml stop nginx
    
    # Get certificate
    certbot certonly --standalone \
        -d chatilo.de \
        -d www.chatilo.de \
        -d api.chatilo.de \
        --email $SSL_EMAIL \
        --agree-tos \
        --non-interactive
    
    # Copy certificates to project directory
    cp /etc/letsencrypt/live/chatilo.de/fullchain.pem ssl/
    cp /etc/letsencrypt/live/chatilo.de/privkey.pem ssl/
    
    # Restart nginx
    docker-compose -f docker-compose.prod.yml start nginx
else
    print_status "Renewing SSL certificate..."
    certbot renew --quiet
    cp /etc/letsencrypt/live/chatilo.de/fullchain.pem ssl/
    cp /etc/letsencrypt/live/chatilo.de/privkey.pem ssl/
fi

# Setup automatic SSL renewal
print_status "Setting up automatic SSL renewal..."
cat > /etc/cron.d/chatilo-ssl-renewal << EOF
0 12 * * * root certbot renew --quiet && cp /etc/letsencrypt/live/chatilo.de/fullchain.pem $PROJECT_DIR/ssl/ && cp /etc/letsencrypt/live/chatilo.de/privkey.pem $PROJECT_DIR/ssl/ && docker-compose -f $PROJECT_DIR/docker-compose.prod.yml restart nginx
EOF

# Create systemd service for auto-start
print_status "Creating systemd service..."
cat > /etc/systemd/system/chatilo.service << EOF
[Unit]
Description=CHATILO Docker Compose Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl daemon-reload
systemctl enable chatilo.service
systemctl start chatilo.service

# Final status check
print_status "Performing final status check..."
sleep 10

# Check if containers are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_success "All containers are running!"
else
    print_error "Some containers failed to start. Check logs:"
    docker-compose -f docker-compose.prod.yml logs
fi

# Test website accessibility
if curl -s -o /dev/null -w "%{http_code}" https://www.chatilo.de | grep -q "200\|301\|302"; then
    print_success "Website is accessible!"
else
    print_warning "Website might not be accessible yet. Please check manually."
fi

echo ""
echo "🎉 CHATILO Docker Deployment Complete!"
echo "======================================"
echo "🌐 Website: https://www.chatilo.de"
echo "🔌 API: https://api.chatilo.de"
echo "📊 Docker Status: docker-compose -f docker-compose.prod.yml ps"
echo "📝 Logs: docker-compose -f docker-compose.prod.yml logs"
echo "🔄 Restart: docker-compose -f docker-compose.prod.yml restart"
echo ""

print_success "Docker deployment completed successfully!" 