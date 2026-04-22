# ===========================================
# AutoFi Multi-Window Backtest - API Test Script
# ===========================================
# Pastikan server sudah jalan: npm start
# Lalu buka terminal baru dan jalankan: .\test-api.ps1

$baseUrl = "http://localhost:3001/intent"

# --- Test 1: Balanced Strategy ---
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " TEST 1: Balanced Strategy (1 SOL)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$body = @{
    wallet = "0xUserWalletABC"
    amount = 1
    token = "SOL"
    strategy = "balanced"
} | ConvertTo-Json

Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 5

# --- Test 2: Aggressive Strategy ---
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host " TEST 2: Aggressive Strategy (5 SOL)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
$bodyAgg = @{
    wallet = "0xUserWalletABC"
    amount = 5
    token = "SOL"
    strategy = "aggressive"
} | ConvertTo-Json

Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $bodyAgg | ConvertTo-Json -Depth 5

# --- Test 3: Low Strategy ---
Write-Host "`n========================================" -ForegroundColor Green
Write-Host " TEST 3: Low Risk Strategy (0.5 SOL)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
$bodyLow = @{
    wallet = "0xUserWalletABC"
    amount = 0.5
    token = "SOL"
    strategy = "low"
} | ConvertTo-Json

Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $bodyLow | ConvertTo-Json -Depth 5

# --- Test 4: Error - Amount Too Low ---
Write-Host "`n========================================" -ForegroundColor Red
Write-Host " TEST 4: Error - Amount Below Minimum" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
$bodyErr = @{
    wallet = "0xUserWalletABC"
    amount = 0.05
    token = "SOL"
    strategy = "low"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $bodyErr
} catch {
    Write-Host "Expected Error: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# --- Test 5: Error - Missing Wallet ---
Write-Host "`n========================================" -ForegroundColor Red
Write-Host " TEST 5: Error - Missing Wallet" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
$bodyNoWallet = @{
    amount = 1
    token = "SOL"
    strategy = "balanced"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $bodyNoWallet
} catch {
    Write-Host "Expected Error: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host " ALL TESTS COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
