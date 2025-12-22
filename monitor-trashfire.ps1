# TrashFire Startup Monitor
# Monitors the health endpoint and displays status

$healthUrl = "http://localhost:3000/healthz"
$serverUrl = "http://localhost:3000"
$checkInterval = 5 # seconds

Write-Host "`n🚀 TrashFire Status Monitor" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host "Server URL: $serverUrl" -ForegroundColor Green
Write-Host "Health Endpoint: $healthUrl" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host "`n📊 Monitoring health endpoint every $checkInterval seconds..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop monitoring`n" -ForegroundColor Gray

$startTime = Get-Date
$successCount = 0
$failCount = 0

while ($true) {
    try {
        $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        $healthData = $response.Content | ConvertFrom-Json
        
        $successCount++
        $uptime = (Get-Date) - $startTime
        
        $statusColor = if ($healthData.status -eq "ok") { "Green" } else { "Yellow" }
        
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] " -NoNewline -ForegroundColor Gray
        Write-Host "✅ HEALTHY " -NoNewline -ForegroundColor $statusColor
        Write-Host "| Status: $($healthData.status) " -NoNewline
        Write-Host "| Mode: $($healthData.mode) " -NoNewline
        Write-Host "| Uptime: $($uptime.ToString('hh\:mm\:ss')) " -NoNewline
        Write-Host "| Checks: $successCount/$($successCount + $failCount)" -ForegroundColor Gray
        
        if ($healthData.services) {
            Write-Host "         Services: $($healthData.services -join ', ')" -ForegroundColor DarkGray
        }
        
    } catch {
        $failCount++
        $uptime = (Get-Date) - $startTime
        
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] " -NoNewline -ForegroundColor Gray
        Write-Host "❌ FAILED " -NoNewline -ForegroundColor Red
        Write-Host "| Error: $($_.Exception.Message) " -NoNewline
        Write-Host "| Uptime: $($uptime.ToString('hh\:mm\:ss')) " -NoNewline
        Write-Host "| Fails: $failCount/$($successCount + $failCount)" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds $checkInterval
}

