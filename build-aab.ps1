# RewardLoop - Build signed AAB for Google Play
# Usage: cd Desktop\rewardloop ; .\build-aab.ps1

$ProjectPath  = "$env:USERPROFILE\Desktop\rewardloop"
$KeystorePath = "$env:USERPROFILE\Downloads\Other DO NOT REMOVE\rewardloopAAB"
$KeyAlias     = "rewardloop1"

$ErrorActionPreference = "Stop"

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }

Step "Switching to project: $ProjectPath"
Set-Location $ProjectPath

Step "Cleaning old web assets..."
if (Test-Path "dist") { Remove-Item "dist" -Recurse -Force }

Step "npm install"
npm install

Step "Building web app (Vite)"
npm run build
if ($LASTEXITCODE -ne 0) { throw "Web build failed" }

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
} else {
    Write-Warning "Could not find versionCode in $gradle"
}

Step "Keystore credentials (typing is hidden)"
$storePassSecure = Read-Host "Keystore password" -AsSecureString
$keyPassSecure   = Read-Host "Key password (Enter to reuse keystore password)" -AsSecureString

$storePass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($storePassSecure))
$keyPass   = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($keyPassSecure))
if ([string]::IsNullOrEmpty($keyPass)) { $keyPass = $storePass }

if (-not (Test-Path $KeystorePath)) {
    Write-Error "Keystore not found at: $KeystorePath"
    exit 1
}

Step "Building signed release AAB"
Set-Location "$ProjectPath\android"

# Force stop daemons to prevent file locking
& .\gradlew.bat --stop

# Run clean before bundle
& .\gradlew.bat clean

$aab = "$ProjectPath\android\app\build\outputs\bundle\release\app-release.aab"
if (Test-Path $aab) {
    Remove-Item $aab -Force
}

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
    Write-Error "Build FAILED (gradle exit code $gradleExit). See errors above."
    exit 1
}
