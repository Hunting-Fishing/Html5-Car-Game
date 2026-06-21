param(
  [Parameter(Mandatory=$true)]
  [string]$ZipPath
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$target = Join-Path $repoRoot "public\assets\vendor\kenney\car-kit"

if (!(Test-Path $ZipPath)) {
  throw "Zip not found: $ZipPath"
}

if (Test-Path $target) {
  Remove-Item $target -Recurse -Force
}

New-Item -ItemType Directory -Path $target -Force | Out-Null
Expand-Archive -Path $ZipPath -DestinationPath $target -Force

$license = Join-Path $target "License.txt"
$preview = Join-Path $target "Previews\sedan.png"

if (!(Test-Path $license)) {
  throw "Install failed: License.txt was not found in $target"
}

if (!(Test-Path $preview)) {
  throw "Install failed: Preview files were not found. Expected: $preview"
}

Write-Host "Kenney Car Kit installed to:" -ForegroundColor Green
Write-Host $target
Write-Host "Restart npm run dev, then open the World screen." -ForegroundColor Cyan
