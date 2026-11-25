param(
    [string]$ProjectRoot = "$PSScriptRoot",
    [string]$ProjectId = "katalog-obathewan"
)

Set-Location $ProjectRoot

$firebaseExe = Join-Path $ProjectRoot "firebase.exe"

# 1. Cek apakah firebase.exe sudah ada
if (-not (Test-Path $firebaseExe)) {
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host " Mengunduh Firebase CLI Standalone (Resmi dari Google)..." -ForegroundColor Yellow
    Write-Host " URL: https://firebase.tools/bin/win/instant/latest" -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Cyan

    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri "https://firebase.tools/bin/win/instant/latest" -OutFile $firebaseExe -UseBasicParsing
        Write-Host "✔ Firebase CLI berhasil diunduh!" -ForegroundColor Green
    } catch {
        Write-Error "Gagal mengunduh Firebase CLI secara otomatis: $_"
        Write-Host "Silakan unduh manual dari: https://firebase.tools/bin/win/instant/latest lalu letakkan di folder ini." -ForegroundColor Yellow
        exit 1
    }
}

# 2. Login ke Firebase
Write-Host "`n[Langkah 1/2] Melakukan Login ke Akun Google Firebase..." -ForegroundColor Cyan
Write-Host "Browser Anda akan terbuka untuk konfirmasi akun Google..." -ForegroundColor Gray
& $firebaseExe login

# 3. Deploy ke Hosting
Write-Host "`n[Langkah 2/2] Mengunggah file ke Firebase Hosting ($ProjectId)..." -ForegroundColor Cyan
& $firebaseExe deploy --only hosting --project $ProjectId

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " ✔ PROSES DEPLOY SELESAI!" -ForegroundColor Green
Write-Host " Buka dan refresh browser Anda di:" -ForegroundColor Yellow
Write-Host " https://katalog-obathewan.web.app" -ForegroundColor Cyan
Write-Host " (Tekan Ctrl + F5 untuk memperbarui cache offline)" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Green
