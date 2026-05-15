@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Install Node.js, then run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\electron-builder\cli.js" (
  echo Installing build dependencies...
  call npm install
  if errorlevel 1 (
    echo Failed to install build dependencies.
    pause
    exit /b 1
  )
)

set CSC_IDENTITY_AUTO_DISCOVERY=false
call npm run dist
if errorlevel 1 (
  echo Failed to build the exe.
  pause
  exit /b %errorlevel%
)

echo.
echo Build complete. Check the release folder.
pause
