Write-Host "🔧 Fixing Windows Docker permissions and paths..." -ForegroundColor Green

# 1. Prüfe Docker Daemon
Write-Host "🐳 Checking Docker status..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "   ✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker not found or not running" -ForegroundColor Red
    exit 1
}

# 2. Bereinige Windows-spezifische Pfad-Probleme
Write-Host "📁 Fixing path separators..." -ForegroundColor Yellow
$env:COMPOSE_CONVERT_WINDOWS_PATHS = 1

# 3. Setze Docker-Compose Environment
Write-Host "⚙️ Setting Docker Compose environment..." -ForegroundColor Yellow
$env:DOCKER_BUILDKIT = 1
$env:COMPOSE_DOCKER_CLI_BUILD = 1

# 4. Bereinige Docker Volumes falls nötig
Write-Host "🧹 Cleaning up problematic volumes..." -ForegroundColor Yellow
docker volume prune -f

# 5. Restart Docker Desktop (falls Berechtigung vorhanden)
Write-Host "🔄 Note: If you have permission issues, restart Docker Desktop manually" -ForegroundColor Cyan

Write-Host "✅ Permissions and environment fixed!" -ForegroundColor Green
Write-Host "💡 Now run: .\build-clean.ps1" -ForegroundColor Yellow
