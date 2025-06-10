#!/bin/bash
# Deploy Script für Ubuntu Server

echo "🚀 Setting up Chatilo on Ubuntu Server..."

# 1. Update System
sudo apt update && sudo apt upgrade -y

# 2. Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed!"
fi

# 3. Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed!"
fi

# 4. Setup project directory
PROJECT_DIR="/home/$USER/chatilo-app"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# 5. Load Docker images (if .tar files exist)
if [ -f "chatilo-server.tar" ]; then
    echo "📦 Loading server image..."
    docker load -i chatilo-server.tar
fi

if [ -f "chatilo-client.tar" ]; then
    echo "📦 Loading client image..."
    docker load -i chatilo-client.tar
fi

if [ -f "mongo.tar" ]; then
    echo "📦 Loading MongoDB image..."
    docker load -i mongo.tar
fi

# 6. Set permissions
sudo chown -R $USER:$USER $PROJECT_DIR
chmod +x *.sh 2>/dev/null || true

# 7. Create production environment
cp docker-compose.yml docker-compose.prod.yml

# 8. Start services
echo "🔥 Starting Chatilo services..."
docker-compose -f docker-compose.prod.yml up -d

# 9. Show status
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "✅ Chatilo deployed successfully!"
echo "🌐 Frontend: http://$(hostname -I | awk '{print $1}'):1234"
echo "🔧 Backend: http://$(hostname -I | awk '{print $1}'):1113"
echo "🗄️ MongoDB: $(hostname -I | awk '{print $1}'):27017"
echo ""
echo "📝 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop: docker-compose down"
echo "  Restart: docker-compose restart"
echo "  Update: docker-compose up -d --build"