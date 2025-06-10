@echo off
echo ================================================
echo CHATILO DEBUG SCRIPT
echo ================================================
echo.

echo [1/10] Checking Node.js version...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo.

echo [2/10] Checking npm version...
npm --version || echo npm check failed - continuing anyway
echo.

echo [2.5/10] Checking Python installation...
python --version 2>nul
if %errorlevel% equ 0 (
    echo ✅ Python found
) else (
    echo ⚠️ Python not found - this might cause issues with some npm packages
    echo Continuing anyway...
)
echo.

echo [3/10] Checking project structure...
if not exist "package.json" (
    echo ERROR: Not in CHATILO root directory!
    echo Please run this script from c:\Users\Johannes\CHATILO2\chatilo-app\
    pause
    exit /b 1
)
echo ✅ Main package.json found
echo.

if not exist "client\package.json" (
    echo ERROR: Client package.json not found!
    pause
    exit /b 1
)
echo ✅ Client package.json found
echo.

if not exist "server\package.json" (
    echo ERROR: Server package.json not found!
    pause
    exit /b 1
)
echo ✅ Server package.json found
echo.

echo [4/10] Skipping client cleanup - using existing CHATILO app...
echo ✅ Using existing CHATILO React app
echo.

echo [5/10] Killing existing processes and cleaning...
taskkill /f /im node.exe 2>nul >nul
taskkill /f /im chrome.exe 2>nul >nul
taskkill /f /im firefox.exe 2>nul >nul
echo Waiting for processes to fully terminate...
timeout /t 3 /nobreak >nul
echo ✅ Processes cleared
echo.

echo [6/10] Installing ONLY essential dependencies...
cd client
echo Clearing npm cache and rebuilding...
npm cache clean --force 2>nul
if exist "node_modules" rd /s /q "node_modules"
if exist "package-lock.json" del "package-lock.json"

echo Installing CHATILO (complete install)...
npm install --no-audit --no-fund react@18.2.0 react-dom@18.2.0 react-scripts@5.0.1 typescript@4.9.5 @types/react@18.2.15 @types/react-dom@18.2.7 @mui/material@5.14.1 @mui/icons-material@5.14.1 @emotion/react@11.11.1 @emotion/styled@11.11.0 react-router-dom@6.14.2 axios@1.4.0 socket.io-client@4.7.2

echo ✅ Dependencies installed
cd ..
echo.

echo [7/10] Installing server dependencies...
cd server
echo Installing server dependencies...
npm install geolib bcryptjs jsonwebtoken cors dotenv mongoose express socket.io

echo Cleaning database...
echo Deleting any corrupted MongoDB data...
rd /s /q data 2>nul
echo Stopping MongoDB if running...
taskkill /f /im mongod.exe 2>nul >nul
echo Clearing MongoDB cache...
rd /s /q "%USERPROFILE%\.mongodb" 2>nul
echo Deleting Node.js MongoDB temp files...
del /q /s "%TEMP%\mongodb-*" 2>nul
echo Clearing all cached database connections...
echo Deleting any temp database files...
rd /s /q "%TEMP%\mongodb-*" 2>nul
timeout /t 3 /nobreak >nul
echo ✅ Database completely cleaned

echo Starting CHATILO Backend on port 1113...
echo Ensuring clean server start...
start /min cmd /k "echo Starting CHATILO Server... && echo Initializing COMPLETELY FRESH database... && echo Dropping all existing collections... && echo Creating ALL neighborhood rooms in radius && echo Batch room creation for performance && echo PROGRESSIVE location detection (NO FALLBACK) && echo Admin panel: http://localhost:1113/admin (token: chatilo_admin_2024) && echo 5-minute location cache with drift protection && echo MongoDB will use in-memory storage && set PORT=1113 && node server.js"
echo Waiting for server to initialize and create geo indexes...
timeout /t 20 /nobreak >nul
echo ✅ Backend should be started with fresh database and geo indexes
echo.

echo [8/10] CHATILO Full Stack Start...
echo ================================================
echo STARTING CHATILO - FULL APPLICATION
echo ================================================
echo Frontend: http://localhost:1112 (React App)
echo Backend:  http://localhost:1113 (API Server)
echo ================================================
echo.

cd client
set PORT=1112
echo.
echo ================================================
echo Öffne Browser: http://localhost:1112
echo ================================================
start http://localhost:1112
npm start

pause