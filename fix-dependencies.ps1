Write-Host "Fixing React Dependencies für Docker Build..." -ForegroundColor Green

# Wechsle ins Client-Verzeichnis
Set-Location client

Write-Host "Cleaning existing dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item "node_modules" -Recurse -Force
    Write-Host "   Removed node_modules" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
    Write-Host "   Removed package-lock.json" -ForegroundColor Green
}

Write-Host "Installing dependencies with fixes..." -ForegroundColor Yellow
npm install --legacy-peer-deps --force

Write-Host "Testing build locally..." -ForegroundColor Yellow
$env:CI = "false"
$env:GENERATE_SOURCEMAP = "false"

try {
    npm run build
    Write-Host "Local build successful!" -ForegroundColor Green
    Write-Host "Docker build should now work" -ForegroundColor Cyan
} catch {
    Write-Host "Local build failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

# Zurück zum Hauptverzeichnis
Set-Location ..

Write-Host "Ready for Docker build!" -ForegroundColor Green
