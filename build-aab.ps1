# =============================================================================
# RewardLoop — Build signed AAB for Google Play (Closed Testing)
# =============================================================================
# One-shot PowerShell script: git pull -> web build -> cap sync -> bump
# versionCode -> signed bundleRelease -> opens the AAB folder in Explorer.
#
# FIRST RUN ONLY (if PowerShell blocks scripts):
#   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
#
# Then from PowerShell:
#   cd Desktop\rewardloop
#   .\build-aab.ps1
# =============================================================================

# ---- EDIT THESE 4 VARIABLES --------------------------------------------------
$ProjectPath  = "$env:USERPROFILE\Desktop\rewardloop"
$KeystorePath = "$env:USERPROFILE\rewardloop-keystore.jks"
$KeyAlias     = "rewardloop"
$BumpVersion  = $true   # set $false to keep current versionCode
# -----------------------------------------------------------------------------

$ErrorActionPreference = "Stop"

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }

Step "Switching to project: $ProjectPath"
Set-Location $ProjectPath

Step "git pull"
git pull

Step "bun install"
bun install

Step "Building web app (bun run build)"
bun run build

Step "Capacitor sync (Android)"
bunx cap sync android

if ($BumpVersion) {
    Step "Bumping versionCode in android/app/build.gradle"
    $gradle = "android/app/build.gradle"
    $content = Get-Content $gradle -Raw
    if ($content -match 'versionCode\s+(\d+)') {
        $old = [int]$Matches[1]
        $new = $old + 1
        $content = $content -replace "versionCode\s+$old", "versionCode $new"
        Set-Content $gradle $content -NoNewline
        Write-Host "    versionCode: $old -> $new" -ForegroundColor Green
    } else {
        Write-Warning "Could not find versionCode in $gradle — skipping bump."
    }
}

Step "Keystore credentials (typing is hidden)"
$storePassSecure = Read-Host "Keystore password" -AsSecureString
$keyPassSecure   = Read-Host "Key password (press Enter to reuse keystore password)" -AsSecureString

$storePass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($storePassSecure))
$keyPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($keyPassSecure))
if ([string]::IsNullOrEmpty($keyPass)) { $keyPass = $storePass }

Step "Building signed release AAB (gradlew bundleRelease)"
Set-Location "$ProjectPath\android"

.\gradlew.bat bundleRelease `
    "-Pandroid.injected.signing.store.file=$KeystorePath" `
    "-Pandroid.injected.signing.store.password=$storePass" `
    "-Pandroid.injected.signing.key.alias=$KeyAlias" `
    "-Pandroid.injected.signing.key.password=$keyPass"

# Wipe the plaintext passwords from memory ASAP
$storePass = $null; $keyPass = $null
[System.GC]::Collect()

$aab = "$ProjectPath\android\app\build\outputs\bundle\release\app-release.aab"

Set-Location $ProjectPath

if (Test-Path $aab) {
    Write-Host "`n  SUCCESS" -ForegroundColor Green
    Write-Host "  Signed AAB: $aab" -ForegroundColor Green
    Write-Host "  Upload it to Play Console -> Closed testing -> Create new release.`n"
    Start-Process explorer.exe "/select,`"$aab`""
} else {
    Write-Error "Build finished but AAB not found at: $aab"
}
