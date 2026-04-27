$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

$Port = 4173
$NoOpen = $args -contains "--no-open"
$Lan = $args -contains "--lan"
foreach ($arg in $args) {
  if ($arg -match '^\d+$') {
    $Port = [int]$arg
    break
  }
}

function Test-PortFree($PortNumber, $BindAddress) {
  $listener = $null
  try {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse($BindAddress), $PortNumber)
    $listener.Start()
    return $true
  } catch {
    return $false
  } finally {
    if ($listener) {
      $listener.Stop()
    }
  }
}

function Get-LanAddress {
  $addresses = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -notlike "127.*" -and
      $_.IPAddress -notlike "169.254.*" -and
      $_.PrefixOrigin -ne "WellKnown"
    } |
    Sort-Object InterfaceMetric, InterfaceAlias

  if ($addresses) {
    return $addresses[0].IPAddress
  }

  $hostEntry = [System.Net.Dns]::GetHostEntry([System.Net.Dns]::GetHostName())
  $fallback = $hostEntry.AddressList |
    Where-Object {
      $_.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork -and
      $_.ToString() -notlike "127.*"
    } |
    Select-Object -First 1

  if ($fallback) {
    return $fallback.ToString()
  }

  return "127.0.0.1"
}

$BindAddress = if ($Lan) { "0.0.0.0" } else { "127.0.0.1" }
$TestAddress = if ($Lan) { "0.0.0.0" } else { "127.0.0.1" }

while (-not (Test-PortFree $Port $TestAddress)) {
  $Port += 1
}

$Python = Get-Command py -ErrorAction SilentlyContinue
if ($Python) {
  $Exe = $Python.Source
  $PythonArgs = @("-3", "server.py", "--port", "$Port", "--bind", $BindAddress)
} else {
  $Python = Get-Command python -ErrorAction SilentlyContinue
  if (-not $Python) {
    Write-Host "Python was not found. Install Python 3, then run start-map.bat again."
    Read-Host "Press Enter to exit"
    exit 1
  }
  $Exe = $Python.Source
  $PythonArgs = @("server.py", "--port", "$Port", "--bind", $BindAddress)
}

$DisplayHost = if ($Lan) { Get-LanAddress } else { "127.0.0.1" }
$Url = "http://${DisplayHost}:$Port/"
Write-Host "Historical globe map: $Url"
if ($Lan) {
  Write-Host "Open this URL on iPad/iPhone Safari while connected to the same Wi-Fi."
  Write-Host "If it does not open, allow Python through Windows Firewall for private networks."
}
Write-Host "Keep this window open. Close it or press Ctrl+C to stop the server."

if (-not $NoOpen) {
  Start-Job -ScriptBlock {
    param($TargetUrl)
    Start-Sleep -Milliseconds 900
    Start-Process $TargetUrl
  } -ArgumentList $Url | Out-Null
}

& $Exe @PythonArgs
