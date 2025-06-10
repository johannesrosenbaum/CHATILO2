@echo off
echo 🔍 TESTING BOTH CHATILO VERSIONS
echo ================================

echo.
echo 📋 SETUP INSTRUCTIONS:
echo ----------------------
echo 1. CLIENT VERSION (port 3000): cd client ^&^& npm start
echo 2. SRC VERSION (port 3001): npm start -- --port 3001
echo 3. SERVER (port 1113): cd server ^&^& npm start
echo.

echo 🚀 STARTING CLIENT VERSION (port 3000)...
echo -----------------------------------------
start "CHATILO CLIENT VERSION" cmd /k "cd client && echo 🟢 CLIENT VERSION - PORT 3000 && npm start"

timeout /t 3

echo 🚀 STARTING SRC VERSION (port 3001)...
echo --------------------------------------
start "CHATILO SRC VERSION" cmd /k "echo 🔵 SRC VERSION - PORT 3001 && npm start -- --port 3001"

timeout /t 3

echo 🔧 STARTING SERVER (port 1113)...
echo ----------------------------------
start "CHATILO SERVER" cmd /k "cd server && echo 🟡 SERVER - PORT 1113 && npm start"

echo.
echo ✅ ALL VERSIONS STARTED!
echo ========================
echo.
echo 🌐 URLs to test:
echo ---------------
echo CLIENT VERSION: http://localhost:3000
echo SRC VERSION:    http://localhost:3001
echo SERVER API:     http://localhost:1113/api/health
echo.
echo 📝 Test both versions and tell me which one works better!
echo 🔴 To stop all: Close all command windows
echo.
pause
