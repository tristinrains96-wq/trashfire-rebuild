# TrashFire FFmpeg Installer for Windows
# Downloads and installs FFmpeg to tools/ffmpeg/windows/ in the repo

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TrashFire FFmpeg Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory (should be scripts/)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$toolsDir = Join-Path $repoRoot "tools"
$ffmpegDir = Join-Path $toolsDir "ffmpeg\windows"
$binDir = Join-Path $ffmpegDir "bin"
$ffmpegExe = Join-Path $binDir "ffmpeg.exe"

# Check if already installed
if (Test-Path $ffmpegExe) {
    Write-Host "FFmpeg is already installed at:" -ForegroundColor Green
    Write-Host $ffmpegExe -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Skipping download. Updating .env.local if needed..." -ForegroundColor Yellow
} else {
    Write-Host "Downloading FFmpeg for Windows..." -ForegroundColor Yellow
    
    # Use a stable FFmpeg Windows build URL (BtbN builds are popular and reliable)
    # Using the latest release from BtbN's GitHub releases
    $ffmpegUrl = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
    $zipPath = Join-Path $env:TEMP "ffmpeg-windows.zip"
    
    try {
        # Download FFmpeg
        Write-Host "Downloading from: $ffmpegUrl" -ForegroundColor Gray
        Invoke-WebRequest -Uri $ffmpegUrl -OutFile $zipPath -UseBasicParsing
        
        Write-Host "Extracting FFmpeg..." -ForegroundColor Yellow
        
        # Create directories
        New-Item -ItemType Directory -Force -Path $binDir | Out-Null
        
        # Extract zip
        Expand-Archive -Path $zipPath -DestinationPath $env:TEMP\ffmpeg-extract -Force
        
        # Find ffmpeg.exe in the extracted folder (structure varies, search recursively)
        $extractedDir = Join-Path $env:TEMP "ffmpeg-extract"
        $foundFfmpeg = Get-ChildItem -Path $extractedDir -Filter "ffmpeg.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
        
        if ($foundFfmpeg) {
            # Copy ffmpeg.exe and ffprobe.exe to bin directory
            Copy-Item $foundFfmpeg.FullName -Destination $ffmpegExe -Force
            Write-Host "Installed: $ffmpegExe" -ForegroundColor Green
            
            # Also copy ffprobe if available
            $ffprobeExe = Get-ChildItem -Path $extractedDir -Filter "ffprobe.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($ffprobeExe) {
                $ffprobeDest = Join-Path $binDir "ffprobe.exe"
                Copy-Item $ffprobeExe.FullName -Destination $ffprobeDest -Force
                Write-Host "Installed: $ffprobeDest" -ForegroundColor Green
            }
        } else {
            throw "Could not find ffmpeg.exe in downloaded archive"
        }
        
        # Cleanup
        Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
        Remove-Item $extractedDir -Recurse -Force -ErrorAction SilentlyContinue
        
        Write-Host ""
        Write-Host "FFmpeg installed successfully!" -ForegroundColor Green
    } catch {
        Write-Host ""
        Write-Host "ERROR: Failed to download or extract FFmpeg" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Yellow
        Write-Host "MANUAL INSTALLATION REQUIRED" -ForegroundColor Yellow
        Write-Host "========================================" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Please download the FFmpeg zip file in your browser:" -ForegroundColor Yellow
        Write-Host $ffmpegUrl -ForegroundColor Cyan
        Write-Host ""
        Write-Host "After downloading, the script will automatically:" -ForegroundColor Yellow
        Write-Host "1. Extract it from your Downloads folder" -ForegroundColor White
        Write-Host "2. Install to: $ffmpegExe" -ForegroundColor White
        Write-Host "3. Update .env.local with the path" -ForegroundColor White
        Write-Host ""
        Write-Host "Press ENTER after you have downloaded the file to your Downloads folder..." -ForegroundColor Yellow
        $null = Read-Host
        
        # Check Downloads folder for the zip file
        $downloadsPath = [Environment]::GetFolderPath("UserProfile") + "\Downloads"
        $zipFileName = Split-Path -Leaf $ffmpegUrl
        $downloadedZip = Join-Path $downloadsPath $zipFileName
        
        # Also check for common variations
        $possibleNames = @(
            $zipFileName,
            "ffmpeg-master-latest-win64-gpl.zip",
            "ffmpeg*.zip"
        )
        
        $foundZip = $null
        foreach ($name in $possibleNames) {
            $searchPath = Join-Path $downloadsPath $name
            if ($name -like "*") {
                # Wildcard search
                $found = Get-ChildItem -Path $downloadsPath -Filter $name -ErrorAction SilentlyContinue | Select-Object -First 1
                if ($found) {
                    $foundZip = $found.FullName
                    break
                }
            } elseif (Test-Path $searchPath) {
                $foundZip = $searchPath
                break
            }
        }
        
        if (-not $foundZip) {
            # Try to find any ffmpeg zip in Downloads
            $foundZip = Get-ChildItem -Path $downloadsPath -Filter "*ffmpeg*.zip" -ErrorAction SilentlyContinue | 
                Sort-Object LastWriteTime -Descending | 
                Select-Object -First 1
            if ($foundZip) {
                $foundZip = $foundZip.FullName
            }
        }
        
        if ($foundZip -and (Test-Path $foundZip)) {
            Write-Host ""
            Write-Host "Found downloaded file: $foundZip" -ForegroundColor Green
            Write-Host "Extracting..." -ForegroundColor Yellow
            
            try {
                # Create directories
                New-Item -ItemType Directory -Force -Path $binDir | Out-Null
                
                # Extract zip
                Expand-Archive -Path $foundZip -DestinationPath $env:TEMP\ffmpeg-extract -Force
                
                # Find ffmpeg.exe in the extracted folder
                $extractedDir = Join-Path $env:TEMP "ffmpeg-extract"
                $foundFfmpeg = Get-ChildItem -Path $extractedDir -Filter "ffmpeg.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
                
                if ($foundFfmpeg) {
                    # Copy ffmpeg.exe and ffprobe.exe to bin directory
                    Copy-Item $foundFfmpeg.FullName -Destination $ffmpegExe -Force
                    Write-Host "Installed: $ffmpegExe" -ForegroundColor Green
                    
                    # Also copy ffprobe if available
                    $ffprobeExe = Get-ChildItem -Path $extractedDir -Filter "ffprobe.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
                    if ($ffprobeExe) {
                        $ffprobeDest = Join-Path $binDir "ffprobe.exe"
                        Copy-Item $ffprobeExe.FullName -Destination $ffprobeDest -Force
                        Write-Host "Installed: $ffprobeDest" -ForegroundColor Green
                    }
                    
                    # Cleanup
                    Remove-Item $env:TEMP\ffmpeg-extract -Recurse -Force -ErrorAction SilentlyContinue
                    
                    Write-Host ""
                    Write-Host "FFmpeg installed successfully from manual download!" -ForegroundColor Green
                } else {
                    throw "Could not find ffmpeg.exe in downloaded archive"
                }
            } catch {
                Write-Host ""
                Write-Host "ERROR: Failed to extract from manual download" -ForegroundColor Red
                Write-Host $_.Exception.Message -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host ""
            Write-Host "ERROR: Could not find downloaded zip file in Downloads folder" -ForegroundColor Red
            Write-Host "Expected file: $zipFileName" -ForegroundColor Yellow
            Write-Host "Downloads folder: $downloadsPath" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Please ensure the file is downloaded and try again." -ForegroundColor Yellow
            exit 1
        }
    }
}

# Update .env.local
$envLocalPath = Join-Path $repoRoot ".env.local"

# Get absolute path to ffmpeg.exe
if (Test-Path $ffmpegExe) {
    $ffmpegPathAbsolute = (Resolve-Path $ffmpegExe).Path
} else {
    # Construct absolute path (file should exist after installation, but handle edge case)
    $ffmpegPathAbsolute = [System.IO.Path]::GetFullPath($ffmpegExe)
}

Write-Host ""
Write-Host "Updating .env.local..." -ForegroundColor Yellow

if (Test-Path $envLocalPath) {
    # Read existing .env.local
    $envContent = Get-Content $envLocalPath -Raw
    
    # Check if FFMPEG_PATH already exists
    if ($envContent -match "FFMPEG_PATH\s*=") {
        # Replace existing FFMPEG_PATH
        $envContent = $envContent -replace "FFMPEG_PATH\s*=.*", "FFMPEG_PATH=$ffmpegPathAbsolute"
        Set-Content -Path $envLocalPath -Value $envContent -NoNewline
        Write-Host "Updated existing FFMPEG_PATH in .env.local" -ForegroundColor Green
    } else {
        # Append FFMPEG_PATH
        Add-Content -Path $envLocalPath -Value "`nFFMPEG_PATH=$ffmpegPathAbsolute"
        Write-Host "Added FFMPEG_PATH to .env.local" -ForegroundColor Green
    }
} else {
    # Create new .env.local
    Set-Content -Path $envLocalPath -Value "FFMPEG_PATH=$ffmpegPathAbsolute"
    Write-Host "Created .env.local with FFMPEG_PATH" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your dev server (npm run dev)" -ForegroundColor White
Write-Host "2. Open http://localhost:3000/setup" -ForegroundColor White
Write-Host "3. Confirm FFmpeg shows as 'Available'" -ForegroundColor White
Write-Host ""

# Only pause if running interactively (not from npm/npx)
if ([Environment]::UserInteractive -and $Host.Name -eq "ConsoleHost") {
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

