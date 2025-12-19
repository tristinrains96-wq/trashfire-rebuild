# TrashFire - Open Migration Files
# Double-click this file or run: powershell -ExecutionPolicy Bypass -File Open-MigrationFiles.ps1

Write-Host "🚀 Opening TrashFire Migration Files..." -ForegroundColor Green
Write-Host ""

$files = @(
    @{Path = "supabase\schema.sql"; Name = "1. schema.sql - Base schema"},
    @{Path = "supabase\migrations\2025_12_15_refined_phase2.sql"; Name = "2. 2025_12_15_refined_phase2.sql"},
    @{Path = "supabase\migrations\2025_12_15_phase2_5_guardrails.sql"; Name = "3. 2025_12_15_phase2_5_guardrails.sql"},
    @{Path = "supabase\migrations\2025_12_17_phase3_animatic.sql"; Name = "4. 2025_12_17_phase3_animatic.sql"},
    @{Path = "supabase\migrations\add_episode_passes.sql"; Name = "5. add_episode_passes.sql"}
)

$basePath = Split-Path -Parent $MyInvocation.MyCommand.Path

foreach ($file in $files) {
    $fullPath = Join-Path $basePath $file.Path
    if (Test-Path $fullPath) {
        Write-Host "Opening: $($file.Name)" -ForegroundColor Cyan
        Start-Process $fullPath
        Start-Sleep -Milliseconds 500
    } else {
        Write-Host "NOT FOUND: $fullPath" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ All files opened! Copy each file's contents and paste into Supabase SQL Editor." -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

