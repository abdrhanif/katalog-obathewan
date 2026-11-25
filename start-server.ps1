param(
    [int]$Port = 8080,
    [string]$RootPath = "$PSScriptRoot\public"
)

$ip = [System.Net.IPAddress]::Loopback
try {
    $listener = [System.Net.Sockets.TcpListener]::new($ip, $Port)
    $listener.Start()
} catch {
    Write-Host "Port $Port sedang digunakan, mencoba port 8081..." -ForegroundColor Yellow
    $Port = 8081
    $listener = [System.Net.Sockets.TcpListener]::new($ip, $Port)
    $listener.Start()
}

$prefix = "http://localhost:$Port/"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 🇮🇩 SERVER WEB APP KATALOG OBAT HEWAN BERJALAN!" -ForegroundColor Green
Write-Host " Akses di browser: $prefix" -ForegroundColor Yellow
Write-Host " Folder publik: $RootPath" -ForegroundColor Gray
Write-Host " Tekan Ctrl+C untuk menghentikan server" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".ico"  = "image/x-icon"
}

# Auto-open browser
Start-Process $prefix

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::UTF8)

        $reqLine = $reader.ReadLine()
        if ([string]::IsNullOrWhiteSpace($reqLine)) {
            $client.Close()
            continue
        }

        # Drain remaining headers
        while (-not [string]::IsNullOrWhiteSpace($reader.ReadLine())) {}

        $tokens = $reqLine.Split(' ')
        $rawPath = if ($tokens.Length -ge 2) { $tokens[1] } else { "/" }
        $urlPath = $rawPath.Split('?')[0].TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($urlPath)) {
            $urlPath = "index.html"
        }

        $filePath = Join-Path $RootPath ($urlPath -replace '/', '\')

        # Fallback for SPA routing
        if (-not (Test-Path $filePath -PathType Leaf)) {
            $filePath = Join-Path $RootPath "index.html"
        }

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)

            $header = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
        } else {
            $notFound = "HTTP/1.1 404 Not Found`r`nContent-Length: 9`r`nConnection: close`r`n`r`nNot Found"
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($notFound)
            $stream.Write($bytes, 0, $bytes.Length)
        }

        $stream.Flush()
        $client.Close()
    } catch {
        # continue on connection reset
    }
}
