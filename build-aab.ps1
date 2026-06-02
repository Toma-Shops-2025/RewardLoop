# RewardLoop - Build signed AAB for Google Play
# Usage: cd Desktop\rewardloop ; .\build-aab.ps1

$ProjectPath  = "$env:USERPROFILE\Desktop\rewardloop"
$KeystorePath = "$env:USERPROFILE\Downloads\Other\rewardloop1"
$KeyAlias     = "rewardloop"
$BumpVersion  = $true

$ErrorActionPreference = "Stop"

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }

Step "Switching to project: $ProjectPath"
Set-Location $ProjectPath

Step "git pull"
git pull

Step "bun install"
bun install

Step "Building web app"
bun run build

Step "Capacitor sync (Android)"
bunx cap sync android

if ($BumpVersion) {
    Step "Bumping versionCode"
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
}

Step "Keystore credentials (typing is hidden)"
$storePassSecure = Read-Host "Keystore password" -AsSecureString
$keyPassSecure   = Read-Host "Key password (Enter to reuse keystore password)" -AsSecureString

$storePass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($storePassSecure))
$keyPass   = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($keyPassSecure))
if ([string]::IsNullOrEmpty($keyPass)) { $keyPass = $storePass }

Step "Building signed release AAB"
Set-Location "$ProjectPath\android"

$gradleArgs = @(
    "bundleRelease",
    "-Pandroid.injected.signing.store.file=$KeystorePath",
    "-Pandroid.injected.signing.store.password=$storePass",
    "-Pandroid.injected.signing.key.alias=$KeyAlias",
    "-Pandroid.injected.signing.key.password=$keyPass"
)
& .\gradlew.bat @gradleArgs

$storePass = $null
$keyPass = $null
[System.GC]::Collect()

$aab = "$ProjectPath\android\app\build\outputs\bundle\release\app-release.aab"
Set-Location $ProjectPath

if (Test-Path $aab) {
    Write-Host "`n  SUCCESS" -ForegroundColor Green
    Write-Host "  Signed AAB: $aab" -ForegroundColor Green
    Write-Host "  Upload to Play Console -> Closed testing -> Create new release.`n"
    Start-Process explorer.exe "/select,`"$aab`""
} else {
    Write-Error "Build finished but AAB not found at $aab"
}
