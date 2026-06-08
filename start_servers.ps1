$root = "C:\Users\st290\Downloads\ApexRankPilot\apexrank"
$logDir = "$root\logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$p1 = Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory "$root\server" -RedirectStandardOutput "$logDir\server.log" -RedirectStandardError "$logDir\server.err" -PassThru
$p2 = Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory "$root\client" -RedirectStandardOutput "$logDir\client.log" -RedirectStandardError "$logDir\client.err" -PassThru

Write-Host "Server PID: $($p1.Id)"
Write-Host "Client PID: $($p2.Id)"
Write-Host "Waiting for servers to start..."

Start-Sleep -Seconds 8

Write-Host "=== Server log ==="
Get-Content "$logDir\server.log" -Tail 10
Write-Host "=== Client log ==="
Get-Content "$logDir\client.log" -Tail 10

Write-Host "=== Port check ==="
netstat -ano | Select-String ':3001|LISTENING' | Select-Object -First 5
netstat -ano | Select-String ':5173|LISTENING' | Select-Object -First 5
