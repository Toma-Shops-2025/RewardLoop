# Quick RewardLoop keystore check - run before build-aab.ps1
# Usage: .\verify-keystore.ps1

$KeystoreDir = "$env:USERPROFILE\Downloads\Other DO NOT REMOVE"
$pass = Read-Host "Keystore password" -AsSecureString
$storePass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pass)
)

$files = @("rewardloopAAB", "rewardloop1", "keystore")
Write-Host "`nChecking keystores in:`n  $KeystoreDir`n" -ForegroundColor Cyan

foreach ($name in $files) {
    $path = Join-Path $KeystoreDir $name
    if (-not (Test-Path $path)) {
        Write-Host "[skip] $name - not found" -ForegroundColor DarkGray
        continue
    }
    Write-Host "=== $name ===" -ForegroundColor Yellow
    keytool -list -keystore $path -storepass $storePass 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK - password works for this file`n" -ForegroundColor Green
    } else {
        Write-Host "  FAIL - wrong password for this file`n" -ForegroundColor Red
    }
}

$storePass = $null
[System.GC]::Collect()
