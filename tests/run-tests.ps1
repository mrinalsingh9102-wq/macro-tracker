# NutriTrack Automated Test Runner (PowerShell & Backend Integration)
# Tests both local logic and live Vercel endpoints

$ErrorActionPreference = "Stop"

$liveUrl = "https://macro-tracker-1.vercel.app"
$passCount = 0
$failCount = 0

function Assert-Test {
    param(
        [string]$Name,
        [scriptblock]$TestBlock
    )
    Write-Host -NoNewline "  Testing: $Name... "
    try {
        & $TestBlock
        Write-Host -ForegroundColor Green "[PASS]"
        $script:passCount++
    } catch {
        Write-Host -ForegroundColor Red "[FAIL]"
        Write-Host -ForegroundColor Yellow "    Error: $($_.Exception.Message)"
        $script:failCount++
    }
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       🥗 NUTRITRACK AUTOMATED BACKEND TEST SUITE         " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# ------------------------------------------------------------------
# Test Group 1: Live Webhook Security & Verification Handshake
# ------------------------------------------------------------------
Write-Host "[Group 1] Meta Security Handshake Tests" -ForegroundColor Yellow

Assert-Test "Meta Webhook GET Handshake verification" {
    $uri = "$liveUrl/api/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=nutritrack_token&hub.challenge=998877"
    $res = Invoke-WebRequest -Uri $uri -UseBasicParsing -TimeoutSec 10
    if ($res.StatusCode -ne 200 -or $res.Content -ne "998877") {
        throw "Expected 200 with challenge '998877', got '$($res.Content)'"
    }
}

Assert-Test "Rejects invalid verification token" {
    $uri = "$liveUrl/api/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=hacker_invalid_token&hub.challenge=998877"
    $res = Invoke-WebRequest -Uri $uri -UseBasicParsing -TimeoutSec 10
    if ($res.Content -eq "998877") {
        throw "Security vulnerability: Server accepted an invalid token!"
    }
}

# ------------------------------------------------------------------
# Test Group 2: Live WhatsApp NLP Food Parsing & Disambiguation
# ------------------------------------------------------------------
Write-Host ""
Write-Host "[Group 2] WhatsApp Natural Language Food Parsing Tests" -ForegroundColor Yellow

Assert-Test "Parses compound breakfast: 3 eggs, 2 toast, 1 coffee" {
    $uri = "$liveUrl/api/whatsapp-webhook?text=" + [uri]::EscapeDataString("3 eggs, 2 toast, 1 coffee")
    $res = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 10
    if ($res.parsed.items.Count -ne 3) {
        throw "Expected 3 items, got $($res.parsed.items.Count)"
    }
    if ($res.parsed.totalCals -lt 300) {
        throw "Expected total calories > 300, got $($res.parsed.totalCals)"
    }
}

Assert-Test "Parses Indian dinner: Rava Dosa and masala Chai for Dinner" {
    $uri = "$liveUrl/api/whatsapp-webhook?text=" + [uri]::EscapeDataString("Rava Dosa and masala Chai for Dinner")
    $res = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 10
    if ($res.parsed.meal -ne "Dinner") {
        throw "Expected meal 'Dinner', got '$($res.parsed.meal)'"
    }
    if ($res.parsed.items.Count -ne 2) {
        throw "Expected 2 items, got $($res.parsed.items.Count)"
    }
    $dosa = $res.parsed.items | Where-Object { $_.name -match "Rava Dosa" }
    if (-not $dosa) {
        throw "Rava Dosa was not recognized in the Indian specialties database"
    }
    $chai = $res.parsed.items | Where-Object { $_.name -match "Chai" }
    if (-not $chai) {
        throw "Masala Chai was not recognized in the Indian specialties database"
    }
}

Assert-Test "Parses quantity multipliers: 2 idli, 1 sambar" {
    $uri = "$liveUrl/api/whatsapp-webhook?text=" + [uri]::EscapeDataString("2 idli, 1 sambar")
    $res = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 10
    $idli = $res.parsed.items | Where-Object { $_.name -match "Idli" }
    if (-not $idli -or $idli.cals -ne 116) {
        throw "Expected 2 idlis = 116 kcal, got $($idli.cals)"
    }
}

# ------------------------------------------------------------------
# Test Group 3: Simulated Meta POST Webhook & Upstash Queue
# ------------------------------------------------------------------
Write-Host ""
Write-Host "[Group 3] Simulated Meta WhatsApp POST Ingestion Tests" -ForegroundColor Yellow

Assert-Test "Handles Meta WhatsApp Business Webhook JSON POST" {
    $payload = @{
        object = "whatsapp_business_account"
        entry = @(
            @{
                changes = @(
                    @{
                        value = @{
                            messaging_product = "whatsapp"
                            metadata = @{ phone_number_id = "test_phone_id" }
                            messages = @(
                                @{
                                    from = "19876543210"
                                    type = "text"
                                    text = @{ body = "3 eggs, 1 toast for Breakfast" }
                                }
                            )
                        }
                    }
                )
            }
        )
    } | ConvertTo-Json -Depth 10

    $res = Invoke-WebRequest -Uri "$liveUrl/api/whatsapp-webhook" -Method Post -ContentType "application/json" -Body $payload -TimeoutSec 10 -UseBasicParsing
    if ($res.StatusCode -ne 200 -or $res.Content -ne "EVENT_RECEIVED") {
        throw "Expected 200 EVENT_RECEIVED, got $($res.StatusCode): $($res.Content)"
    }
}

# ------------------------------------------------------------------
# Test Group 4: Cloud Sync API (/api/sync)
# ------------------------------------------------------------------
Write-Host ""
Write-Host "[Group 4] Cloud Sync API Tests" -ForegroundColor Yellow

Assert-Test "Sync endpoint is reachable and reports status" {
    $res = Invoke-RestMethod -Uri "$liveUrl/api/sync" -Method Get -TimeoutSec 10
    if ($null -eq $res.connected) {
        throw "Sync endpoint did not return valid JSON status"
    }
}

# ------------------------------------------------------------------
# Test Results Summary
# ------------------------------------------------------------------
Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Total Tests: $($passCount + $failCount)"
Write-Host "  Passed:      $passCount" -ForegroundColor Green
Write-Host "  Failed:      $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "🎉 ALL BACKEND AND LIVE TESTS PASSED SUCCESSFULLY!" -ForegroundColor Green
} else {
    Write-Host "❌ Some tests failed. Please review the errors above." -ForegroundColor Red
}
