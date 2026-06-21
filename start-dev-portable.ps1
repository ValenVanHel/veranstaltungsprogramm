$ErrorActionPreference = 'Stop'

$appDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$webversionDir = Split-Path -Parent $appDir
$nodeDir = Join-Path $webversionDir '.tools\node-v24.16.0-win-x64'
$nodeExe = Join-Path $nodeDir 'node.exe'
$npmCmd = Join-Path $nodeDir 'npm.cmd'

if (-not (Test-Path $nodeExe)) {
    Write-Error "Portable Node wurde nicht gefunden: $nodeExe"
}

$env:Path = "$nodeDir;$env:Path"
Set-Location $appDir
& $npmCmd run dev
