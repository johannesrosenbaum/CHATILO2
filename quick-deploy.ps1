Write-Host "🚀 QUICK DEPLOY - Chatilo Docker Stack" -ForegroundColor Green

# Prüfe ob Docker läuft
try {
    $dockerInfo = docker info 2>$null
    if (!$dockerInfo) {
        Write-Host "❌ Docker ist nicht gestartet!" -ForegroundColor Red
        Write-Host "💡 Starte Docker Desktop und versuche es erneut." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Docker ist nicht verfügbar!" -ForegroundColor Red
    exit 1
}

# Option wählen
Write-Host "`n🔧 Wähle eine Option:" -ForegroundColor Yellow
Write-Host "   1) Quick Restart (schnell)" -ForegroundColor White
Write-Host "   2) Clean Rebuild (vollständig)" -ForegroundColor White
Write-Host "   3) Show Logs (nur Logs anzeigen)" -ForegroundColor White
Write-Host "   4) Status Check (Container Status)" -ForegroundColor White

$choice = Read-Host "Wähle (1/2/3/4)"

switch ($choice) {
    "1" {
        Write-Host "🔄 Quick Restart..." -ForegroundColor Yellow
        docker-compose restart
        Write-Host "`n📊 Container Status:" -ForegroundColor Green
        docker-compose ps
    }
    "2" {
        Write-Host "🧹 Clean Rebuild..." -ForegroundColor Yellow
        .\build-clean.ps1
    }
    "3" {
        Write-Host "📝 Showing logs..." -ForegroundColor Yellow
        Write-Host "💡 Drücke Ctrl+C zum Beenden" -ForegroundColor Cyan
        docker-compose logs -f
    }
    "4" {
        Write-Host "📊 Container Status Check..." -ForegroundColor Yellow
        docker-compose ps
        Write-Host "`n🔧 Detailed Status:" -ForegroundColor Green
        docker-compose ps --format "table {{.Name}}\t{{.State}}\t{{.Status}}"
    }
    default {
        Write-Host "🔄 Default: Quick Restart..." -ForegroundColor Yellow
        docker-compose restart
        Write-Host "`n📊 Container Status:" -ForegroundColor Green
        docker-compose ps
    }
}

Write-Host "`n✅ Done! Services should be available at:" -ForegroundColor Green
Write-Host "   🌐 Frontend: http://localhost:1234" -ForegroundColor Cyan
Write-Host "   🔧 Backend:  http://localhost:1113" -ForegroundColor Cyan
Write-Host "   🗄️ MongoDB:  localhost:27017" -ForegroundColor Cyan

Write-Host "`n💡 Useful commands:" -ForegroundColor Yellow
Write-Host "   docker-compose logs -f              # Live logs" -ForegroundColor White
Write-Host "   docker-compose down                 # Stop all" -ForegroundColor White
Write-Host "   docker-compose up -d               # Start detached" -ForegroundColor White
Write-Host "   docker-compose ps                  # Status" -ForegroundColor White
