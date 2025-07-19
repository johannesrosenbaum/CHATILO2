#!/bin/bash

# CHATILO Production Deployment Script
# Deploys to Ubuntu server and configures for https://www.chatilo.de

set -e  # Exit on any error

echo "🚀 CHATILO Production Deployment Starting..."
echo "=============================================="

# Configuration
REPO_URL="https://github.com/johannesrosenbaum/CHATILO2.git"
PROJECT_DIR="/var/www/chatilo"
BACKUP_DIR="/var/www/chatilo-backup"
DOMAIN="chatilo.de"
SSL_EMAIL="admin@chatilo.de"  # Change this to your email

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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
apt install -y curl wget git nginx certbot python3-certbot-nginx docker.io docker-compose nodejs npm

# Install Node.js 18.x if not already installed
if ! command -v node &> /dev/null || [[ $(node --version | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
    print_status "Installing Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi

# Install PM2 for process management
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    npm install -g pm2
fi

# Create project directory
print_status "Setting up project directory..."
mkdir -p $PROJECT_DIR
mkdir -p $BACKUP_DIR

# Backup existing installation if it exists
if [ -d "$PROJECT_DIR/.git" ]; then
    print_status "Backing up existing installation..."
    cp -r $PROJECT_DIR $BACKUP_DIR/$(date +%Y%m%d_%H%M%S)
fi

# Clone or pull repository
if [ -d "$PROJECT_DIR/.git" ]; then
    print_status "Updating existing repository..."
    cd $PROJECT_DIR
    git fetch origin
    git reset --hard origin/main
else
    print_status "Cloning repository..."
    git clone $REPO_URL $PROJECT_DIR
    cd $PROJECT_DIR
fi

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

# Create environment file
print_status "Creating environment configuration..."
cat > $PROJECT_DIR/.env << EOF
# Production Environment Variables
NODE_ENV=production
PORT=1113
MONGODB_URI=mongodb://localhost:27017/chatilo
JWT_SECRET=$(openssl rand -base64 32)
SOCKET_URL=https://api.chatilo.de
CLIENT_URL=https://www.chatilo.de

# SSL Configuration
SSL_EMAIL=$SSL_EMAIL
DOMAIN=$DOMAIN

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/chatilo/uploads

# CORS
ALLOWED_ORIGINS=https://www.chatilo.de,https://chatilo.de,http://localhost:3000
EOF

# Create upload directories
print_status "Creating upload directories..."
mkdir -p $PROJECT_DIR/server/uploads/avatars
mkdir -p $PROJECT_DIR/server/uploads/images
mkdir -p $PROJECT_DIR/server/uploads/videos
mkdir -p $PROJECT_DIR/server/uploads/files

# Set permissions
print_status "Setting permissions..."
chown -R www-data:www-data $PROJECT_DIR
chmod -R 755 $PROJECT_DIR
chmod -R 777 $PROJECT_DIR/server/uploads

# Create PM2 ecosystem file
print_status "Creating PM2 configuration..."
cat > $PROJECT_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'chatilo-server',
    script: './server/server.js',
    cwd: '$PROJECT_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 1113
    },
    error_file: '/var/log/chatilo/err.log',
    out_file: '/var/log/chatilo/out.log',
    log_file: '/var/log/chatilo/combined.log',
    time: true
  }]
};
EOF

# Create log directory
mkdir -p /var/log/chatilo
chown -R www-data:www-data /var/log/chatilo

# Configure Nginx
print_status "Configuring Nginx..."
cat > /etc/nginx/sites-available/chatilo << EOF
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name chatilo.de www.chatilo.de;
    return 301 https://www.chatilo.de\$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name www.chatilo.de;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/chatilo.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chatilo.de/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Client files
    location / {
        root $PROJECT_DIR/client/build;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:1113;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSocket proxy
    location /socket.io/ {
        proxy_pass http://localhost:1113;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Upload files
    location /uploads/ {
        alias $PROJECT_DIR/server/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }
}

# API subdomain
server {
    listen 443 ssl http2;
    server_name api.chatilo.de;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/chatilo.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chatilo.de/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # API proxy
    location / {
        proxy_pass http://localhost:1113;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/chatilo /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Setup SSL certificates
print_status "Setting up SSL certificates..."
if [ ! -d "/etc/letsencrypt/live/chatilo.de" ]; then
    print_status "Obtaining SSL certificate..."
    certbot --nginx -d chatilo.de -d www.chatilo.de -d api.chatilo.de --email $SSL_EMAIL --agree-tos --non-interactive
else
    print_status "Renewing SSL certificate..."
    certbot renew --quiet
fi

# Setup automatic SSL renewal
print_status "Setting up automatic SSL renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Start MongoDB if not running
if ! systemctl is-active --quiet mongod; then
    print_status "Starting MongoDB..."
    systemctl start mongod
    systemctl enable mongod
fi

# Start application with PM2
print_status "Starting application with PM2..."
cd $PROJECT_DIR
pm2 delete chatilo-server 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Setup PM2 to start on boot
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root

# Reload Nginx
print_status "Reloading Nginx..."
systemctl reload nginx

# Final status check
print_status "Performing final status check..."
sleep 5

if curl -s -o /dev/null -w "%{http_code}" https://www.chatilo.de | grep -q "200\|301\|302"; then
    print_success "Website is accessible!"
else
    print_warning "Website might not be accessible yet. Please check manually."
fi

if pm2 list | grep -q "chatilo-server.*online"; then
    print_success "Server is running!"
else
    print_error "Server failed to start. Check logs with: pm2 logs chatilo-server"
fi

echo ""
echo "🎉 CHATILO Deployment Complete!"
echo "=============================================="
echo "🌐 Website: https://www.chatilo.de"
echo "🔌 API: https://api.chatilo.de"
echo "📊 PM2 Status: pm2 status"
echo "📝 Logs: pm2 logs chatilo-server"
echo "🔄 Restart: pm2 restart chatilo-server"
echo ""

print_success "Deployment completed successfully!" 