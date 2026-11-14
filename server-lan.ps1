$port = 8085
$folder = "C:\Users\mrian\.gemini\antigravity\scratch\macro-tracker"
$endpoint = [System.Net.IPEndPoint]::new([System.Net.IPAddress]::Any, $port)
$tcp = [System.Net.Sockets.TcpListener]::new($endpoint)
$tcp.Start()
Write-Output "NutriTrack LAN Server listening on port $port"

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".ico"  = "image/x-icon"
}

try {
    while ($true) {
        $client = $tcp.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $stream.ReadTimeout = 2000
            $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::UTF8)
            $firstLine = $reader.ReadLine()
            if (-not $firstLine) { $client.Close(); continue }

            $parts = $firstLine.Split(" ")
            if ($parts.Length -lt 2) { $client.Close(); continue }
            $reqPath = $parts[1]
            if ($reqPath -eq "/" -or [string]::IsNullOrEmpty($reqPath)) { $reqPath = "/index.html" }
            if ($reqPath.Contains("?")) { $reqPath = $reqPath.Split("?")[0] }

            $cleanSubPath = $reqPath.TrimStart("/").Replace("/", "\")
            $filePath = Join-Path $folder $cleanSubPath

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = $mimeTypes[$ext]
                if (-not $contentType) { $contentType = "application/octet-stream" }
                $bytes = [System.IO.File]::ReadAllBytes($filePath)

                $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                $stream.Write($headerBytes, 0, $headerBytes.Length)
                $stream.Write($bytes, 0, $bytes.Length)
            } else {
                $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($msg.Length)`r`nConnection: close`r`n`r`n"
                $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                $stream.Write($headerBytes, 0, $headerBytes.Length)
                $stream.Write($msg, 0, $msg.Length)
            }
            $stream.Flush()
        } catch {
        } finally {
            $client.Close()
        }
    }
} finally {
    $tcp.Stop()
}
