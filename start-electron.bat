@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Install Node.js, then run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\electron\cli.js" (
  echo Installing Electron dependencies...
  call npm install
  if errorlevel 1 (
    echo Failed to install Electron dependencies.
    pause
    exit /b 1
  )
)

call npm start
if errorlevel 1 (
  echo Electron app exited with an error.
  pause
  exit /b %errorlevel%
)
