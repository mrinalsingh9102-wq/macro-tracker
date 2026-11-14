# NutriTrack Automated Test Runner (PowerShell Regression & Integration Suite)
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
# Test Group 1: Meta Security Handshake Tests
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
# Test Group 2: WhatsApp Conversational NLP Parsing Tests (Bug 1 Fix)
# ------------------------------------------------------------------
Write-Host ""
Write-Host "[Group 2] Conversational NLP Food Parsing & Prefix Stripping" -ForegroundColor Yellow

Assert-Test "Prefix handling: 'Breakfast: 2 eggs, 1 toast' (Qty must be 2)" {
    $uri = "$liveUrl/api/whatsapp-webhook?text=" + [uri]::EscapeDataString("Breakfast: 2 eggs, 1 toast")
    $res = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 10
    $eggs = $res.parsed.items | Where-Object { $_.name -match "Egg" }
    if (-not $eggs) { throw "Eggs not found in parsed result" }
    if ($eggs.cals -ne 144) {
        throw "Expected 2 eggs = 144 kcal, got $($eggs.cals) kcal (Quantity extraction bug!)"
    }
}

Assert-Test "Sentence handling: 'Had 2 eggs for breakfast'" {
    $uri = "$liveUrl/api/whatsapp-webhook?text=" + [uri]::EscapeDataString("Had 2 eggs for breakfast")
    $res = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 10
    if ($res.parsed.meal -ne "Breakfast") {
        throw "Expected meal 'Breakfast', got '$($res.parsed.meal)'"
    }
    $eggs = $res.parsed.items[0]
    if ($eggs.cals -ne 144) {
        throw "Expected 2 eggs = 144 kcal, got $($eggs.cals) kcal"
    }
}

Assert-Test "Indian Specialties: 'Rava Dosa and masala Chai for Dinner'" {
    $uri = "$liveUrl/api/whatsapp-webhook?text=" + [uri]::EscapeDataString("Rava Dosa and masala Chai for Dinner")
    $res = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 10
    if ($res.parsed.meal -ne "Dinner") { throw "Expected meal Dinner" }
    if ($res.parsed.items.Count -ne 2) { throw "Expected 2 items" }
    $dosa = $res.parsed.items | Where-Object { $_.name -match "Rava Dosa" }
    if (-not $dosa -or $dosa.cals -ne 170) { throw "Rava Dosa mismatch" }
    $chai = $res.parsed.items | Where-Object { $_.name -match "Chai" }
    if (-not $chai -or $chai.cals -ne 85) { throw "Masala Chai mismatch" }
}

# ------------------------------------------------------------------
# Test Group 3: Food Descriptions & Category Integrity (Bug 2 Fix)
# ------------------------------------------------------------------
Write-Host ""
Write-Host "[Group 3] Food Description & Culinary Classification Tests" -ForegroundColor Yellow

Assert-Test "Descriptions are rich and category is NOT 'WhatsApp'" {
    $uri = "$liveUrl/api/whatsapp-webhook?text=" + [uri]::EscapeDataString("1 rava dosa, 1 masala chai")
    $res = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 10
    foreach ($item in $res.parsed.items) {
        if ($item.category -eq "WhatsApp") {
            throw "Category must NOT be 'WhatsApp'. Found generic WhatsApp category for $($item.name)"
        }
        if (-not $item.description -or $item.description.Length -lt 5) {
            throw "Item $($item.name) is missing rich culinary description"
        }
        if ($null -eq $item.netCarbs) {
            throw "Item $($item.name) is missing netCarbs property (causes C 0g bug in dashboard)"
        }
    }
}

# ------------------------------------------------------------------
# Test Group 4: Multi-Device Cloud Sync Non-Destructive Tests (Bug 3 Fix)
# ------------------------------------------------------------------
Write-Host ""
Write-Host "[Group 4] Multi-Device Cloud Sync Tests" -ForegroundColor Yellow

Assert-Test "Sync endpoint is reachable and reports valid status" {
    $res = Invoke-RestMethod -Uri "$liveUrl/api/sync" -Method Get -TimeoutSec 10
    if ($null -eq $res.connected) {
        throw "Sync endpoint did not return valid JSON status"
    }
}

Assert-Test "Non-destructive sync (multiple reads preserve data for Phone & Laptop)" {
    $res1 = Invoke-RestMethod -Uri "$liveUrl/api/sync" -Method Get -TimeoutSec 10
    $res2 = Invoke-RestMethod -Uri "$liveUrl/api/sync" -Method Get -TimeoutSec 10
    if ($res1.connected -and $res2.connected) {
        if ($res1.meals.Count -ne $res2.meals.Count) {
            throw "Data was lost or mutated on successive reads! Multi-device sync failed."
        }
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
    Write-Host "🎉 ALL BACKEND REGRESSION & LIVE TESTS PASSED!" -ForegroundColor Green
} else {
    Write-Host "❌ Some tests failed. Please review errors above." -ForegroundColor Red
}
