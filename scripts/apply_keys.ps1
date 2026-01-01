# TrashFire Key Apply Script (PowerShell)
# Reads PASTE_KEYS_HERE.env and writes to backend/.env and frontend .env.local

$ErrorActionPreference = "Stop"

$RepoRoot = $PSScriptRoot + "\.."
$SourceFile = Join-Path $RepoRoot "PASTE_KEYS_HERE.env"
$BackendEnv = Join-Path $RepoRoot "backend\.env"
$FrontendEnv = Join-Path $RepoRoot ".env.local"

Write-Host "TrashFire Key Apply Script" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Check if source file exists
if (-not (Test-Path $SourceFile)) {
    Write-Host "ERROR: $SourceFile not found!" -ForegroundColor Red
    Write-Host "Please create PASTE_KEYS_HERE.env in the repo root and paste your keys." -ForegroundColor Yellow
    exit 1
}

Write-Host "Reading keys from: $SourceFile" -ForegroundColor Green

# Read source file
$lines = Get-Content $SourceFile -Raw
$envVars = @{}

# Parse env file (handle comments, empty lines, sections)
$currentLine = 0
foreach ($line in ($lines -split "`r?`n")) {
    $currentLine++
    $line = $line.Trim()
    
    # Skip empty lines, comments, section headers
    if ($line -eq "" -or $line.StartsWith("#") -or $line.StartsWith("=") -or $line.StartsWith("-")) {
        continue
    }
    
    # Parse KEY=VALUE
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
    }
}

# Validate required keys (1-5)
$requiredKeys = @(
    "1_RUNPOD_API_KEY",
    "2_RUNPOD_SDXL_ENDPOINT_ID",
    "3_RUNPOD_WAN_MOTION_ENDPOINT_ID",
    "4_SUPABASE_URL",
    "5_SUPABASE_SERVICE_ROLE_KEY"
)

$missingKeys = @()
foreach ($key in $requiredKeys) {
    if (-not $envVars.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($envVars[$key])) {
        $missingKeys += $key
    }
}

if ($missingKeys.Count -gt 0) {
    Write-Host "ERROR: Missing required keys:" -ForegroundColor Red
    foreach ($key in $missingKeys) {
        Write-Host "  - $key" -ForegroundColor Red
    }
    Write-Host "`nPlease fill in all required keys (1-5) in PASTE_KEYS_HERE.env" -ForegroundColor Yellow
    exit 1
}

# Check SUPABASE_STORAGE_BUCKET
if (-not $envVars.ContainsKey("SUPABASE_STORAGE_BUCKET") -or [string]::IsNullOrWhiteSpace($envVars["SUPABASE_STORAGE_BUCKET"])) {
    Write-Host "WARNING: SUPABASE_STORAGE_BUCKET is empty. Pipeline may not work." -ForegroundColor Yellow
}

Write-Host "All required keys found. Applying..." -ForegroundColor Green

# Build backend .env content
$backendContent = @"
# TrashFire Backend Environment Variables
# Auto-generated from PASTE_KEYS_HERE.env
# DO NOT EDIT MANUALLY - run scripts/apply_keys.ps1 instead

"@

# Backend keys (strip prefixes 1_, 2_, 3_, 4_, 5_)
# Note: SUPABASE_STORAGE_BUCKET maps to STORAGE_BUCKET in backend
$backendKeys = @(
    "RUNPOD_API_KEY",
    "RUNPOD_SDXL_ENDPOINT_ID",
    "RUNPOD_WAN_MOTION_ENDPOINT_ID",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STORAGE_BUCKET",
    "REDIS_URL",
    "GROQ_API_KEY",
    "GROQ_MODEL"
)

# Optional later keys (only if non-empty)
$optionalKeys = @(
    "ELEVENLABS_API_KEY",
    "LEONARDO_API_KEY",
    "FAL_API_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "ANTHROPIC_API_KEY",
    "SENTRY_DSN"
)

foreach ($key in $backendKeys) {
    $sourceKey = $key
    # Map numbered keys
    if ($key -eq "RUNPOD_API_KEY") { $sourceKey = "1_RUNPOD_API_KEY" }
    elseif ($key -eq "RUNPOD_SDXL_ENDPOINT_ID") { $sourceKey = "2_RUNPOD_SDXL_ENDPOINT_ID" }
    elseif ($key -eq "RUNPOD_WAN_MOTION_ENDPOINT_ID") { $sourceKey = "3_RUNPOD_WAN_MOTION_ENDPOINT_ID" }
    elseif ($key -eq "SUPABASE_URL") { $sourceKey = "4_SUPABASE_URL" }
    elseif ($key -eq "SUPABASE_SERVICE_ROLE_KEY") { $sourceKey = "5_SUPABASE_SERVICE_ROLE_KEY" }
    elseif ($key -eq "STORAGE_BUCKET") { $sourceKey = "SUPABASE_STORAGE_BUCKET" }
    
    $value = ""
    if ($envVars.ContainsKey($sourceKey)) {
        $value = $envVars[$sourceKey]
    }
    
    # Use default for REDIS_URL if empty
    if ($key -eq "REDIS_URL" -and [string]::IsNullOrWhiteSpace($value)) {
        $value = "redis://redis:6379/0"
    }
    
    $backendContent += "$key=$value`n"
}

# Add optional keys only if non-empty
foreach ($key in $optionalKeys) {
    if ($envVars.ContainsKey($key) -and -not [string]::IsNullOrWhiteSpace($envVars[$key])) {
        $backendContent += "$key=$($envVars[$key])`n"
    }
}

# Write backend .env
$backendDir = Split-Path $BackendEnv -Parent
if (-not (Test-Path $backendDir)) {
    New-Item -ItemType Directory -Path $backendDir -Force | Out-Null
}
$backendContent | Out-File -FilePath $BackendEnv -Encoding utf8 -NoNewline
Write-Host "✓ Written: $BackendEnv" -ForegroundColor Green

# Build frontend .env.local content (only NEXT_PUBLIC_* keys)
$frontendContent = @"
# TrashFire Frontend Environment Variables
# Auto-generated from PASTE_KEYS_HERE.env
# DO NOT EDIT MANUALLY - run scripts/apply_keys.ps1 instead

"@

$frontendKeys = @(
    "NEXT_PUBLIC_BACKEND_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SETUP_ADMIN_EMAIL"
)

foreach ($key in $frontendKeys) {
    $value = ""
    if ($envVars.ContainsKey($key)) {
        $value = $envVars[$key]
    }
    
    # Use default for NEXT_PUBLIC_BACKEND_URL if empty
    if ($key -eq "NEXT_PUBLIC_BACKEND_URL" -and [string]::IsNullOrWhiteSpace($value)) {
        $value = "http://localhost:8000"
    }
    
    $frontendContent += "$key=$value`n"
}

# Write frontend .env.local
$frontendContent | Out-File -FilePath $FrontendEnv -Encoding utf8 -NoNewline
Write-Host "✓ Written: $FrontendEnv" -ForegroundColor Green

Write-Host "`nDone! Keys applied successfully." -ForegroundColor Cyan
Write-Host "Restart your app to use the new keys." -ForegroundColor Yellow

