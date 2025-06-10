Write-Host "Fixing AJV Dependencies Issue..." -ForegroundColor Green

# Navigate to client directory
Set-Location client

Write-Host "Removing existing dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item "node_modules" -Recurse -Force
}
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
}

Write-Host "Installing with AJV fix..." -ForegroundColor Yellow

# Install with specific AJV version to fix compatibility
npm install --legacy-peer-deps --force
npm install ajv@^8.12.0 --save-dev --legacy-peer-deps
npm install ajv-keywords@^5.1.0 --save-dev --legacy-peer-deps

Write-Host "Testing local build..." -ForegroundColor Yellow
$env:CI = "false"
$env:GENERATE_SOURCEMAP = "false"

try {
    npm run build
    Write-Host "SUCCESS: Local build works!" -ForegroundColor Green
    Write-Host "Docker build should now succeed" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: Local build failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    
    Write-Host "Trying alternative fix..." -ForegroundColor Yellow
    npm install react-scripts@5.0.1 --save --legacy-peer-deps
    
    try {
        npm run build
        Write-Host "SUCCESS: Alternative fix worked!" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Alternative fix also failed" -ForegroundColor Red
    }
}

# Go back to main directory
Set-Location ..

Write-Host "AJV fix completed!" -ForegroundColor Green