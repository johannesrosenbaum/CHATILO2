@echo off
echo 🧹 CHATILO PROJECT CLEANUP - KEEPING CLIENT VERSION
echo ==================================================

echo.
echo 📋 CLEANUP PLAN:
echo ---------------
echo ✅ KEEP: client/ directory (complete React app)
echo ✅ KEEP: server/ directory (backend)
echo ❌ REMOVE: src/ directory (duplicate React app)
echo ❌ REMOVE: root tsconfig.json (duplicate)
echo.

pause

echo 🗑️ Step 1: Removing duplicate src/ directory...
if exist "src" (
    echo    Backing up src/ to src-backup/ first...
    if exist "src-backup" rmdir /s /q "src-backup"
    move "src" "src-backup"
    echo    ✅ src/ moved to src-backup/
) else (
    echo    ⚠️ src/ directory not found
)

echo.
echo 🗑️ Step 2: Removing duplicate tsconfig.json...
if exist "tsconfig.json" (
    echo    Backing up to tsconfig-backup.json first...
    if exist "tsconfig-backup.json" del "tsconfig-backup.json"
    move "tsconfig.json" "tsconfig-backup.json"
    echo    ✅ tsconfig.json moved to tsconfig-backup.json
) else (
    echo    ⚠️ Root tsconfig.json not found
)

echo.
echo 🔧 Step 3: Updating root package.json...
echo {                                                    > package-temp.json
echo   "name": "chatilo-app",                            >> package-temp.json
echo   "version": "1.0.0",                               >> package-temp.json
echo   "description": "Location-based chat application", >> package-temp.json
echo   "scripts": {                                      >> package-temp.json
echo     "dev": "concurrently \"npm run server\" \"npm run client\"", >> package-temp.json
echo     "server": "cd server && npm start",             >> package-temp.json
echo     "client": "cd client && npm start",             >> package-temp.json
echo     "build": "cd client && npm run build",          >> package-temp.json
echo     "install-all": "npm install && cd client && npm install && cd ../server && npm install" >> package-temp.json
echo   },                                                >> package-temp.json
echo   "dependencies": {                                 >> package-temp.json
echo     "concurrently": "^7.6.0"                       >> package-temp.json
echo   }                                                 >> package-temp.json
echo }                                                   >> package-temp.json

if exist "package.json" move "package.json" "package-backup.json"
move "package-temp.json" "package.json"
echo    ✅ package.json updated

echo.
echo ✅ CLEANUP COMPLETE!
echo ===================
echo.
echo 🎯 CURRENT PROJECT STRUCTURE:
echo -----------------------------
echo ✅ client/     - React frontend (port 3000)
echo ✅ server/     - Node.js backend (port 1113)  
echo ✅ package.json - Root orchestration
echo.
echo 📁 BACKUPS CREATED:
echo ------------------
echo 💾 src-backup/           - Old React app
echo 💾 tsconfig-backup.json  - Old TypeScript config
echo 💾 package-backup.json   - Old package.json
echo.
echo 🚀 TO START CHATILO:
echo -------------------
echo npm run dev           (starts both client and server)
echo   OR
echo npm run client       (frontend only)
echo npm run server       (backend only)
echo.
pause
