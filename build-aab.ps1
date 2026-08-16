# RewardLoop - Build signed AAB for Google Play
# Usage: cd Desktop\RewardLoop ; .\build-aab.ps1

$ProjectPath  = "$env:USERPROFILE\Desktop\RewardLoop"
$KeystoreDir  = "$env:USERPROFILE\Downloads\Other DO NOT REMOVE"
$KeyAlias     = "rewardloop1"
$Keytool      = "keytool"

$ErrorActionPreference = "Stop"

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }

function Test-KeystoreAlias([string]$StorePath, [string]$StorePass, [string]$Alias) {
    $null = & $Keytool -list -keystore $StorePath -storepass $StorePass -alias $Alias 2>&1
    return $LASTEXITCODE -eq 0
}

function Show-KeystoreAliases([string]$StorePath, [string]$StorePass) {
    Write-Host "    Aliases in this keystore:" -ForegroundColor Yellow
    & $Keytool -list -keystore $StorePath -storepass $StorePass 2>&1 | ForEach-Object { Write-Host "      $_" }
}

Step "Keystore credentials (validated before the long build)"
$storePassSecure = Read-Host "Keystore password" -AsSecureString
$keyPassSecure   = Read-Host "Key password (Enter to reuse keystore password)" -AsSecureString

$storePass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($storePassSecure))
$keyPass   = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($keyPassSecure))
if ([string]::IsNullOrEmpty($keyPass)) { $keyPass = $storePass }

$candidates = @(
    "$KeystoreDir\rewardloopAAB",
    "$KeystoreDir\rewardloop1",
    "$KeystoreDir\keystore"
) | Where-Object { Test-Path $_ }

if ($candidates.Count -eq 0) {
    Write-Error "No keystore found. Expected one of: rewardloopAAB, rewardloop1, or keystore in:`n  $KeystoreDir"
    exit 1
}

$KeystorePath = $null
$aliasCandidates = @($KeyAlias, "rewardloop", "key0", "upload")

foreach ($candidate in $candidates) {
    $null = & $Keytool -list -keystore $candidate -storepass $storePass 2>&1
    if ($LASTEXITCODE -ne 0) { continue }

    foreach ($alias in $aliasCandidates) {
        if (Test-KeystoreAlias $candidate $storePass $alias) {
            $KeystorePath = $candidate
            $KeyAlias = $alias
            break
        }
    }
    if ($KeystorePath) { break }

    Write-Host "    Password works for: $candidate" -ForegroundColor Yellow
    Show-KeystoreAliases $candidate $storePass
}

if (-not $KeystorePath) {
    Write-Host "`n  SIGNING FAILED: keystore password or alias is wrong." -ForegroundColor Red
    Write-Host "  Checked files:" -ForegroundColor Red
    $candidates | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    Write-Host "  Tried aliases: $($aliasCandidates -join ', ')" -ForegroundColor Red
    Write-Host "  Tip: This is the key you used for the FIRST RewardLoop Play Store upload." -ForegroundColor Yellow
    Write-Host "  If you lost it, use Play Console -> Setup -> App signing -> request upload key reset.`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "    Using keystore: $KeystorePath" -ForegroundColor Green
Write-Host "    Using alias:    $KeyAlias" -ForegroundColor Green

Step "Switching to project: $ProjectPath"
Set-Location $ProjectPath

Step "Cleaning old web assets..."
if (Test-Path "dist") { Remove-Item "dist" -Recurse -Force }

Step "npm install"
npm install

Step "Building web app (Vite)"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Web build failed!" -ForegroundColor Red
    exit 1
}

Step "Regenerating Android icons from resources/"
npm run assets:generate

Step "Capacitor sync (Forcing fresh public assets)"
if (Test-Path "android/app/src/main/assets/public") {
    Remove-Item "android/app/src/main/assets/public" -Recurse -Force
}
npx cap sync android

Step "Bumping versionCode in build.gradle"
$gradle = "android/app/build.gradle"
$content = Get-Content $gradle -Raw
if ($content -match 'versionCode\s+(\d+)') {
    $old = [int]$Matches[1]
    $new = $old + 1
    $content = $content -replace "versionCode\s+$old", "versionCode $new"
    Set-Content $gradle $content -NoNewline
    Write-Host "    versionCode: $old -> $new" -ForegroundColor Green
}

Step "Building signed release AAB"
Set-Location "$ProjectPath\android"

& .\gradlew.bat --stop 2>$null
& .\gradlew.bat clean 2>$null

$aab = "$ProjectPath\android\app\build\outputs\bundle\release\app-release.aab"
if (Test-Path $aab) { Remove-Item $aab -Force }

$gradleArgs = @(
    "bundleRelease",
    "-Pandroid.injected.signing.store.file=$KeystorePath",
    "-Pandroid.injected.signing.store.password=$storePass",
    "-Pandroid.injected.signing.key.alias=$KeyAlias",
    "-Pandroid.injected.signing.key.password=$keyPass"
)
& .\gradlew.bat @gradleArgs
$gradleExit = $LASTEXITCODE

$storePass = $null
$keyPass = $null
[System.GC]::Collect()

Set-Location $ProjectPath

if ($gradleExit -eq 0 -and (Test-Path $aab)) {
    Write-Host "`n  SUCCESS" -ForegroundColor Green
    Write-Host "  Signed AAB: $aab" -ForegroundColor Green
    Write-Host "  Upload to Play Console -> Create new release.`n"
    Start-Process explorer.exe "/select,`"$aab`""
} else {
    Write-Host "`n  Build FAILED. Please scroll up to see the Red Gradle error." -ForegroundColor Red
    exit 1
}
