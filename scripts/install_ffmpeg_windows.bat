@echo off
REM TrashFire FFmpeg Installer Launcher for Windows
REM Double-click this file to install FFmpeg

echo ========================================
echo TrashFire FFmpeg Installer
echo ========================================
echo.
echo This will download and install FFmpeg for Windows.
echo.
pause

REM Get the directory where this batch file is located
set SCRIPT_DIR=%~dp0
set PS1_SCRIPT=%SCRIPT_DIR%install_ffmpeg_windows.ps1

REM Check if PowerShell script exists
if not exist "%PS1_SCRIPT%" (
    echo ERROR: Could not find install_ffmpeg_windows.ps1
    echo Make sure this .bat file is in the same folder as the .ps1 file.
    pause
    exit /b 1
)

REM Run PowerShell script with execution policy bypass
powershell.exe -ExecutionPolicy Bypass -File "%PS1_SCRIPT%"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Installation failed. See error messages above.
    pause
    exit /b 1
)

