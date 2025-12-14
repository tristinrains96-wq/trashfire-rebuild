@echo off
cd /d %~dp0

echo 🚀 Starting TrashFire...

REM Check for package manager
where pnpm >nul 2>nul && set PM=pnpm || set PM=npm

echo 📦 Package manager: %PM%

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📥 Installing dependencies...
    %PM% install
)

REM Start the application
echo 🌐 Starting development server and opening browser...
%PM% run dev:open

pause
