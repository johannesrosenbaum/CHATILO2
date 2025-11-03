# Deploy new build with Villages & Schools features
Write-Host "🚀 Deploying new build to server..." -ForegroundColor Cyan

# SSH to server and execute commands
$sshCommand = @"
cd /root/CHATILO2 && 
echo "📥 Pulling latest changes..." && 
git pull origin main && 
echo "🛑 Stopping containers..." && 
docker-compose down && 
echo "🔄 Rebuilding client with no cache..." && 
docker-compose build --no-cache client && 
echo "▶️ Starting containers..." && 
docker-compose up -d && 
echo "🧹 Cleaning up old images..." && 
docker image prune -f && 
echo "✅ Deployment complete!" && 
echo "📊 Checking running containers..." && 
docker-compose ps
"@

# Execute via SSH (without config file to avoid issues)
ssh -o "UserKnownHostsFile=NUL" -o "StrictHostKeyChecking=no" root@5.230.32.248 $sshCommand

Write-Host "✅ Deployment script completed!" -ForegroundColor Green
Write-Host "🌐 Check https://chatilo.de for the new Villages & Schools features" -ForegroundColor Yellow