# Simple Docker build script
Write-Host "Starting Chatilo Docker Build..." -ForegroundColor Green

# Clean up
Write-Host "Cleaning up..." -ForegroundColor Yellow
docker-compose down -v
docker container prune -f
docker image prune -f

# Remove client dependencies
if (Test-Path "client\package-lock.json") {
    Remove-Item "client\package-lock.json" -Force
    Write-Host "Removed package-lock.json" -ForegroundColor Green
}
if (Test-Path "client\node_modules") {
    Remove-Item "client\node_modules" -Recurse -Force
    Write-Host "Removed node_modules" -ForegroundColor Green
}

# Build
Write-Host "Building containers..." -ForegroundColor Green
docker-compose up --build --force-recreate -d

# Show results
Write-Host ""
Write-Host "Build completed!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:1234" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:1113" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check status with: docker-compose ps" -ForegroundColor Yellow
Write-Host "View logs with: docker-compose logs -f" -ForegroundColor Yellow