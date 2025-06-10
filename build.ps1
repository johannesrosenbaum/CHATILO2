Write-Host "🚀 Building Chatilo Docker Stack..." -ForegroundColor Green

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Remove old images (optional)
$removeOld = Read-Host "Remove old images? (y/N)"
if ($removeOld -eq "y" -or $removeOld -eq "Y") {
    Write-Host "🗑️ Removing old images..." -ForegroundColor Yellow
    docker image prune -f
    docker rmi chatilo-app_chatilo-server chatilo-app_chatilo-client 2>$null
}

# Build and start all services
Write-Host "🔨 Building and starting all services..." -ForegroundColor Green
docker-compose up --build -d

# Show status
Write-Host "📊 Container Status:" -ForegroundColor Green
docker-compose ps

Write-Host "`n✅ Build complete!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:1234" -ForegroundColor Cyan  # 🔥 KORRIGIERT
Write-Host "🔧 Backend: http://localhost:1113" -ForegroundColor Cyan
Write-Host "🗄️ MongoDB: localhost:27017" -ForegroundColor Cyan
Write-Host "`n📝 Logs: docker-compose logs -f" -ForegroundColor Yellow
