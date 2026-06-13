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
$ui = @()
$buttons = @()
$panels = @()
$icons = @()
$bars = @()

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

  if (Has-Any $fullLower @("ui", "gui", "interface", "button", "panel", "icon", "hud", "menu", "popup", "window", "frame") -or Has-Any $nameLower @("ui", "gui", "button", "btn", "panel", "icon", "hud", "menu", "popup", "window", "frame", "bar", "badge", "coin", "gem", "check", "close", "cancel", "confirm", "build", "shop", "upgrade")) {
    $ui += $item
  }

  if (Has-Any $nameLower @("button", "btn")) {
    $buttons += $item
  }

  if (Has-Any $nameLower @("panel", "window", "popup", "frame", "box", "container")) {
    $panels += $item
  }

  if (Has-Any $nameLower @("icon", "coin", "gem", "build", "shop", "hammer", "move", "upgrade", "check", "close", "cancel", "confirm")) {
    $icons += $item
  }

  if (Has-Any $nameLower @("bar", "progress", "meter", "fill")) {
    $bars += $item
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
    ui = $ui.Count
    buttons = $buttons.Count
    panels = $panels.Count
    icons = $icons.Count
    bars = $bars.Count
  }
  allImages = $all
  vehicles = $vehicles
  buildings = $buildings
  roads = $roads
  ui = $ui
  buttons = $buttons
  panels = $panels
  icons = $icons
  bars = $bars
}

$manifest | ConvertTo-Json -Depth 8 | Set-Content -Path $outFile -Encoding UTF8

Write-Host "Generated Kenney manifest:" -ForegroundColor Green
Write-Host $outFile
Write-Host "Counts:" -ForegroundColor Cyan
Write-Host ("  allImages: " + $all.Count)
Write-Host ("  vehicles:  " + $vehicles.Count)
Write-Host ("  buildings: " + $buildings.Count)
Write-Host ("  roads:     " + $roads.Count)
Write-Host ("  ui:        " + $ui.Count)
Write-Host ("  buttons:   " + $buttons.Count)
Write-Host ("  panels:    " + $panels.Count)
Write-Host ("  icons:     " + $icons.Count)
Write-Host ("  bars:      " + $bars.Count)
