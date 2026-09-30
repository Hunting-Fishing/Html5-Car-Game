# Kenney Car Kit Install

## Purpose

The PixiJS World screen now uses the Kenney Car Kit preview sprites through local alias files.

This keeps the game code stable while allowing the real asset pack to be replaced or expanded later.

## License

The uploaded `kenney_car-kit.zip` includes `License.txt` stating:

- Pack: Car Kit (3.1)
- Creator/distributor: Kenney
- License: Creative Commons Zero, CC0
- Allowed use: personal, educational, and commercial purposes
- Credit is appreciated but not required

Recommended credit:

```text
Vehicle sprites based on Kenney Car Kit by Kenney.nl, CC0.
```

## Install Location

Extract the full zip to:

```text
public/assets/vendor/kenney/car-kit/
```

After install, this file should exist:

```text
public/assets/vendor/kenney/car-kit/Previews/sedan.png
```

## PowerShell Install

From the repo root:

```powershell
.\scripts\install-kenney-car-kit.ps1 -ZipPath "C:\Path\To\kenney_car-kit.zip"
```

Example using the user's local project path:

```powershell
cd "D:\Game Development\HTML5 Car Game\Html5 Car Game"
.\scripts\install-kenney-car-kit.ps1 -ZipPath "C:\Users\YOURNAME\Downloads\kenney_car-kit.zip"
```

Then restart:

```powershell
npm run dev
```

## Current Sprite Mapping

| Game alias | Kenney source |
|---|---|
| `iso-car-green.svg` | `Previews/hatchback-sports.png` |
| `iso-car-blue.svg` | `Previews/sedan.png` |
| `iso-sedan-yellow.svg` | `Previews/taxi.png` |
| `iso-pickup-orange.svg` | `Previews/truck.png` |
| `iso-van-white.svg` | `Previews/van.png` |
| `iso-delivery-teal.svg` | `Previews/delivery.png` |
| `iso-tow-yellow.svg` | `Previews/truck-flat.png` |
| `iso-broken-red.svg` | `Previews/debris-bumper.png` |

## Next Asset Steps

1. Add a proper Kenney building or city kit.
2. Replace PixiJS-drawn buildings with sprite buildings.
3. Add a real tow-truck or recovery vehicle asset when found.
4. Add pedestrians from a CC0/owned people pack.
5. Keep all third-party assets under `public/assets/vendor/` with license notes.
