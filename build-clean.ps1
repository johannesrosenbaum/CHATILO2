Write-Host "CLEAN DOCKER BUILD for Chatilo..." -ForegroundColor Green

# 1. Stop all containers
Write-Host "Stopping all containers..." -ForegroundColor Yellow
docker-compose down -v
docker container prune -f

# 2. Remove old images
Write-Host "Removing old images..." -ForegroundColor Yellow
docker image prune -f
docker rmi chatilo-app-chatilo-server chatilo-app-chatilo-client 2>$null

# 3. Clean client dependencies
Write-Host "Cleaning client dependencies..." -ForegroundColor Yellow
if (Test-Path "client\package-lock.json") {
    Remove-Item "client\package-lock.json" -Force
    Write-Host "   Removed old package-lock.json" -ForegroundColor Green
}
if (Test-Path "client\node_modules") {
    Remove-Item "client\node_modules" -Recurse -Force
    Write-Host "   Removed old node_modules" -ForegroundColor Green
}

# 4. Clean Docker caches
Write-Host "Cleaning Docker build cache..." -ForegroundColor Yellow
docker builder prune -f

# 5. Build with force rebuild
Write-Host "Building with force rebuild..." -ForegroundColor Green
docker-compose up --build --force-recreate -d

# 6. Show status
Write-Host "Container Status:" -ForegroundColor Green
docker-compose ps

# 7. Check for errors and show results
try {
    $failedContainers = docker-compose ps --filter "status=exited" --format "table {{.Service}}"
    if ($failedContainers -and $failedContainers.Length -gt 1) {
        Write-Host "Failed containers detected. Showing logs..." -ForegroundColor Red
        docker-compose logs
    } else {
        Write-Host ""
        Write-Host "BUILD SUCCESSFUL!" -ForegroundColor Green
        Write-Host "Frontend: http://localhost:1234" -ForegroundColor Cyan
        Write-Host "Backend: http://localhost:1113" -ForegroundColor Cyan
        Write-Host "MongoDB: localhost:27017" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Available Commands:" -ForegroundColor Yellow
        Write-Host "   Logs: docker-compose logs -f" -ForegroundColor White
        Write-Host "   Stop: docker-compose down" -ForegroundColor White
        Write-Host "   Restart: docker-compose restart" -ForegroundColor White
    }
} catch {
    Write-Host "Could not check container status, but build completed" -ForegroundColor Yellow
    Write-Host "Frontend: http://localhost:1234" -ForegroundColor Cyan
    Write-Host "Backend: http://localhost:1113" -ForegroundColor Cyan
    Write-Host "MongoDB: localhost:27017" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Build process completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test frontend: http://localhost:1234" -ForegroundColor White
Write-Host "2. Test backend API: http://localhost:1113/api/health" -ForegroundColor White
Write-Host "3. View logs: docker-compose logs -f" -ForegroundColor White
