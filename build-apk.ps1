# RewardLoop - Build signed APK for local testing
# Usage: cd Desktop\rewardloop ; .\build-apk.ps1

$ProjectPath  = "$env:USERPROFILE\Desktop\rewardloop"
$KeystorePath = "$env:USERPROFILE\Downloads\Other DO NOT REMOVE\rewardloopAAB"
$KeyAlias     = "rewardloop1"
$ApkPath      = "$ProjectPath\android\app\build\outputs\apk\release\app-release.apk"

$ErrorActionPreference = "Stop"

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }

Step "Building Web App..."
Set-Location $ProjectPath
bun install
bun run build

Step "Syncing Capacitor..."
bunx cap sync android

Step "Keystore credentials (typing is hidden)"
$storePassSecure = Read-Host "Keystore password" -AsSecureString
$storePass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($storePassSecure))

Step "Building Android APK..."
Set-Location "$ProjectPath\android"
& .\gradlew.bat clean assembleRelease "-Pandroid.injected.signing.store.file=$KeystorePath" "-Pandroid.injected.signing.store.password=$storePass" "-Pandroid.injected.signing.key.alias=$KeyAlias" "-Pandroid.injected.signing.key.password=$storePass"

Set-Location $ProjectPath
if (Test-Path $ApkPath) {
    Write-Host "`n  SUCCESS! APK Ready: $ApkPath" -ForegroundColor Green
    Start-Process explorer.exe "/select,`"$ApkPath`""
}
