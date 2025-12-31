# TrashFire Secret Scanner (PowerShell)
# Scans the repository for hardcoded secrets and API keys.
# Exits with non-zero code if secrets are found.

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$foundSecrets = $false
$findings = @()

# Patterns to search for (secret indicators)
$secretPatterns = @(
    @{ Name = "Clerk Publishable Key (test)"; Pattern = "pk_test_[A-Za-z0-9_-]{40,}" },
    @{ Name = "Clerk Publishable Key (live)"; Pattern = "pk_live_[A-Za-z0-9_-]{40,}" },
    @{ Name = "Clerk Secret Key (test)"; Pattern = "sk_test_[A-Za-z0-9_-]{40,}" },
    @{ Name = "Clerk Secret Key (live)"; Pattern = "sk_live_[A-Za-z0-9_-]{40,}" },
    @{ Name = "Supabase Secret"; Pattern = "sb_secret_[A-Za-z0-9_-]{40,}" },
    @{ Name = "JWT Token (Supabase)"; Pattern = "eyJ[A-Za-z0-9_-]{100,}" },
    @{ Name = "API Key (sk-)"; Pattern = "sk-[A-Za-z0-9_-]{40,}" },
    @{ Name = "API Key (sk-ant-)"; Pattern = "sk-ant-[A-Za-z0-9_-]{40,}" },
    @{ Name = "Service Role Key"; Pattern = "service_role.*[A-Za-z0-9_-]{40,}" },
    @{ Name = "Stripe Secret Key"; Pattern = "sk_live_[A-Za-z0-9_-]{40,}" },
    @{ Name = "Stripe Webhook Secret"; Pattern = "whsec_[A-Za-z0-9_-]{40,}" },
    @{ Name = "Groq API Key"; Pattern = "gsk_[A-Za-z0-9_-]{40,}" },
    @{ Name = "ElevenLabs API Key"; Pattern = "[A-Za-z0-9]{32,}" }
)

# Directories to exclude
$excludeDirs = @(
    "node_modules",
    ".next",
    ".git",
    "dist",
    "build",
    ".vercel",
    ".cursor",
    "tools"
)

# Files to exclude
$excludeFiles = @(
    ".env.local",
    ".env",
    "scan_secrets.ps1",
    "public_secret_scan.ts",
    "scan_secrets.ts"
)

# Text file extensions to scan
$textExtensions = @("ts", "tsx", "js", "jsx", "json", "md", "txt", "yml", "yaml", "env", "example", "config", "log")

function Should-ExcludeFile {
    param([string]$filePath)
    
    $fileName = Split-Path -Leaf $filePath
    if ($excludeFiles -contains $fileName) {
        return $true
    }
    if ($fileName -like ".env*") {
        return $true
    }
    return $false
}

function Should-ExcludeDir {
    param([string]$dirName)
    
    return $excludeDirs -contains $dirName
}

function Scan-File {
    param([string]$filePath)
    
    if (Should-ExcludeFile -filePath $filePath) {
        return
    }
    
    try {
        $content = Get-Content -Path $filePath -Raw -ErrorAction Stop
        $lines = $content -split "`n"
        
        for ($i = 0; $i -lt $lines.Length; $i++) {
            $line = $lines[$i]
            
            foreach ($patternInfo in $secretPatterns) {
                $matches = [regex]::Matches($line, $patternInfo.Pattern)
                
                foreach ($match in $matches) {
                    $matchValue = $match.Value
                    
                    # Skip if it's clearly a placeholder or check
                    if ($matchValue -like "*...*" -or 
                        $matchValue -like "*your_key*" -or 
                        $matchValue -like "*YOUR_KEY*" -or
                        $matchValue -like "*pk_test_...*" -or
                        $matchValue -like "*placeholder*" -or
                        $line -like "*!=*" -or
                        $line -like "*===*" -or
                        $line -like "*check*" -or
                        $line -like "*Check*") {
                        continue
                    }
                    
                    # Real secret found
                    $findings += @{
                        File = $filePath.Replace((Get-Location).Path + "\", "").Replace("\", "/")
                        Line = $i + 1
                        PatternName = $patternInfo.Name
                        Preview = $matchValue.Substring(0, [Math]::Min(20, $matchValue.Length)) + "..."
                    }
                    $script:foundSecrets = $true
                }
            }
        }
    }
    catch {
        # Skip files that can't be read (binary, permissions, etc.)
        if ($Verbose) {
            Write-Warning "Could not read file: $filePath"
        }
    }
}

function Scan-Directory {
    param([string]$dirPath)
    
    try {
        $entries = Get-ChildItem -Path $dirPath -ErrorAction Stop
        
        foreach ($entry in $entries) {
            if ($entry.PSIsContainer) {
                if (-not (Should-ExcludeDir -dirName $entry.Name)) {
                    Scan-Directory -dirPath $entry.FullName
                }
            }
            else {
                $ext = $entry.Extension.TrimStart(".")
                if ($textExtensions -contains $ext -or $entry.Name -like ".*") {
                    Scan-File -filePath $entry.FullName
                }
            }
        }
    }
    catch {
        # Skip directories that can't be read
        if ($Verbose) {
            Write-Warning "Could not read directory: $dirPath"
        }
    }
}

# Main scan
$repoRoot = Get-Location
Write-Host "[Secret Scanner] Scanning repository: $repoRoot" -ForegroundColor Cyan
Write-Host ""

Scan-Directory -dirPath $repoRoot

if (-not $foundSecrets) {
    Write-Host "✅ PASS: No secrets found in repository" -ForegroundColor Green
    Write-Host ""
    exit 0
}
else {
    Write-Host "❌ FAIL: Found potential secrets in tracked files:" -ForegroundColor Red
    Write-Host ""
    
    foreach ($finding in $findings) {
        Write-Host "  $($finding.File):$($finding.Line)" -ForegroundColor Yellow
        Write-Host "    Pattern: $($finding.PatternName)" -ForegroundColor Gray
        Write-Host "    Preview: $($finding.Preview)" -ForegroundColor Gray
        Write-Host ""
    }
    
    Write-Host "⚠️  Action required:" -ForegroundColor Red
    Write-Host "  1. Remove all secrets from the files above"
    Write-Host "  2. Ensure no API keys, tokens, or secrets are committed"
    Write-Host "  3. This is a public repository - zero tolerance for secrets"
    Write-Host ""
    exit 1
}

