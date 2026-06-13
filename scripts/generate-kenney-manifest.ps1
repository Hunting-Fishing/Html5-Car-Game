$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$kenneyRoot = Join-Path $repoRoot "public\assets\vendor\kenney"
$outDir = Join-Path $repoRoot "public\assets\generated"
$outFile = Join-Path $outDir "kenney-manifest.json"

if (!(Test-Path $kenneyRoot)) {
  throw "Kenney vendor folder not found: $kenneyRoot"
}

New-Item -ItemType Directory -Path $outDir -Force | Out-Null

$imageExtensions = @(".png", ".webp", ".jpg", ".jpeg", ".svg")
$files = Get-ChildItem $kenneyRoot -Recurse -File | Where-Object { $imageExtensions -contains $_.Extension.ToLowerInvariant() }

function To-PublicPath($file) {
  $relative = $file.FullName.Substring((Join-Path $repoRoot "public").Length).Replace("\", "/")
  return $relative
}

function Has-Any($value, [string[]]$words) {
  $v = $value.ToLowerInvariant()
  foreach ($word in $words) {
    if ($v.Contains($word.ToLowerInvariant())) { return $true }
  }
  return $false
}

$all = @()
$vehicles = @()
$buildings = @()
$roads = @()

foreach ($file in $files) {
  $publicPath = To-PublicPath $file
  $fullLower = $file.FullName.ToLowerInvariant()
  $nameLower = $file.Name.ToLowerInvariant()
  $item = [ordered]@{
    name = $file.Name
    extension = $file.Extension.ToLowerInvariant()
    publicPath = $publicPath
    folder = (Split-Path $file.DirectoryName -Leaf)
    fullPath = $file.FullName
  }

  $all += $item

  if (Has-Any $fullLower @("car-kit", "racing-kit") -or Has-Any $nameLower @("car", "truck", "van", "taxi", "vehicle", "racer", "pickup", "sedan", "kart")) {
    $vehicles += $item
  }

  if (Has-Any $fullLower @("city-kit-commercial", "city-kit-industrial", "city-kit-suburban") -or Has-Any $nameLower @("building", "shop", "garage", "store", "warehouse", "factory", "office", "house", "commercial", "industrial")) {
    $buildings += $item
  }

  if (Has-Any $fullLower @("city-kit-roads", "racing-kit") -or Has-Any $nameLower @("road", "street", "intersection", "cross", "curve", "straight", "track", "turn")) {
    $roads += $item
  }
}

$manifest = [ordered]@{
  generatedAt = (Get-Date).ToUniversalTime().ToString("o")
  root = "/assets/vendor/kenney"
  counts = [ordered]@{
    allImages = $all.Count
    vehicles = $vehicles.Count
    buildings = $buildings.Count
    roads = $roads.Count
  }
  allImages = $all
  vehicles = $vehicles
  buildings = $buildings
  roads = $roads
}

$manifest | ConvertTo-Json -Depth 8 | Set-Content -Path $outFile -Encoding UTF8

Write-Host "Generated Kenney manifest:" -ForegroundColor Green
Write-Host $outFile
Write-Host "Counts:" -ForegroundColor Cyan
Write-Host ("  allImages: " + $all.Count)
Write-Host ("  vehicles:  " + $vehicles.Count)
Write-Host ("  buildings: " + $buildings.Count)
Write-Host ("  roads:     " + $roads.Count)
