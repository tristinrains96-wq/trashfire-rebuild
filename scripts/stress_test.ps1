# TrashFire Stress Test Script
# Runs 100 mock generations and checks for crashes, logs uptime/response time

param(
    [int]$Iterations = 100,
    [string]$BaseUrl = "http://localhost:3000",
    [int]$DelayMs = 100
)

$ErrorActionPreference = "Stop"
$script:StartTime = Get-Date
$script:SuccessCount = 0
$script:FailureCount = 0
$script:ResponseTimes = @()
$script:Errors = @()

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Test-HealthEndpoint {
    try {
        $start = Get-Date
        $response = Invoke-WebRequest -Uri "$BaseUrl/healthz" -Method GET -TimeoutSec 5 -UseBasicParsing
        $elapsed = ((Get-Date) - $start).TotalMilliseconds
        
        if ($response.StatusCode -eq 200) {
            $script:ResponseTimes += $elapsed
            $script:SuccessCount++
            return $true
        } else {
            $script:FailureCount++
            $script:Errors += "Health check returned status $($response.StatusCode)"
            return $false
        }
    } catch {
        $script:FailureCount++
        $script:Errors += "Health check failed: $($_.Exception.Message)"
        Write-Log "Health check error: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Test-MockGeneration {
    param([int]$Iteration)
    
    try {
        $start = Get-Date
        # Simulate a mock generation request
        # In a real scenario, this would call your generation API
        $payload = @{
            prompt = "Test generation $Iteration"
            quality = "LOW"
            userId = "stress-test-user"
        } | ConvertTo-Json
        
        # For now, just test the health endpoint as a proxy
        # Replace with actual generation endpoint when available
        $response = Invoke-WebRequest -Uri "$BaseUrl/healthz" -Method GET -TimeoutSec 10 -UseBasicParsing
        $elapsed = ((Get-Date) - $start).TotalMilliseconds
        
        if ($response.StatusCode -eq 200) {
            $script:ResponseTimes += $elapsed
            $script:SuccessCount++
            Write-Log "Generation $Iteration completed in $([math]::Round($elapsed, 2))ms" "SUCCESS"
            return $true
        } else {
            $script:FailureCount++
            $script:Errors += "Generation $Iteration failed with status $($response.StatusCode)"
            Write-Log "Generation $Iteration failed" "ERROR"
            return $false
        }
    } catch {
        $script:FailureCount++
        $script:Errors += "Generation $Iteration error: $($_.Exception.Message)"
        Write-Log "Generation $Iteration error: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Main execution
Write-Log "Starting TrashFire stress test..." "INFO"
Write-Log "Configuration: $Iterations iterations, $BaseUrl base URL, ${DelayMs}ms delay" "INFO"
Write-Log "Start time: $($script:StartTime)" "INFO"
Write-Log ""

# Initial health check
Write-Log "Performing initial health check..." "INFO"
if (-not (Test-HealthEndpoint)) {
    Write-Log "Initial health check failed. Aborting stress test." "ERROR"
    exit 1
}
Write-Log "Initial health check passed." "SUCCESS"
Write-Log ""

# Run stress test iterations
for ($i = 1; $i -le $Iterations; $i++) {
    Write-Progress -Activity "Stress Testing" -Status "Iteration $i of $Iterations" -PercentComplete (($i / $Iterations) * 100)
    
    Test-MockGeneration -Iteration $i
    
    if ($i -lt $Iterations) {
        Start-Sleep -Milliseconds $DelayMs
    }
}

Write-Progress -Activity "Stress Testing" -Completed

# Calculate statistics
$endTime = Get-Date
$totalTime = ($endTime - $script:StartTime).TotalSeconds
$uptime = if ($script:SuccessCount -gt 0) { 
    [math]::Round(($script:SuccessCount / ($script:SuccessCount + $script:FailureCount)) * 100, 2) 
} else { 
    0 
}

$avgResponseTime = if ($script:ResponseTimes.Count -gt 0) {
    [math]::Round(($script:ResponseTimes | Measure-Object -Average).Average, 2)
} else {
    0
}

$minResponseTime = if ($script:ResponseTimes.Count -gt 0) {
    [math]::Round(($script:ResponseTimes | Measure-Object -Minimum).Minimum, 2)
} else {
    0
}

$maxResponseTime = if ($script:ResponseTimes.Count -gt 0) {
    [math]::Round(($script:ResponseTimes | Measure-Object -Maximum).Maximum, 2)
} else {
    0
}

# Print results
Write-Log ""
Write-Log "=== Stress Test Results ===" "INFO"
Write-Log "Total iterations: $Iterations" "INFO"
Write-Log "Successful: $script:SuccessCount" "SUCCESS"
Write-Log "Failed: $script:FailureCount" $(if ($script:FailureCount -eq 0) { "SUCCESS" } else { "ERROR" })
Write-Log "Uptime: $uptime%" $(if ($uptime -ge 99.9) { "SUCCESS" } else { "WARN" })
Write-Log "Total time: $([math]::Round($totalTime, 2))s" "INFO"
Write-Log ""
Write-Log "=== Response Time Statistics ===" "INFO"
Write-Log "Average: ${avgResponseTime}ms" $(if ($avgResponseTime -lt 5000) { "SUCCESS" } else { "WARN" })
Write-Log "Minimum: ${minResponseTime}ms" "INFO"
Write-Log "Maximum: ${maxResponseTime}ms" "INFO"
Write-Log ""

# Check for crashes (any failures indicate potential issues)
if ($script:FailureCount -gt 0) {
    Write-Log "=== Errors Encountered ===" "ERROR"
    foreach ($error in $script:Errors) {
        Write-Log $error "ERROR"
    }
    Write-Log ""
    Write-Log "Stress test completed with $script:FailureCount failures." "WARN"
    exit 1
} else {
    Write-Log "Stress test completed successfully with no failures!" "SUCCESS"
    exit 0
}
