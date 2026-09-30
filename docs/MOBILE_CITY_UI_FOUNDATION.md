# 365 Auto City — Mobile UI Foundation

This document defines the four foundation layers for moving the World screen toward a real mobile city-builder interface.

## 1. UI Art Pack

### Current rule

All third-party UI assets must live under:

```text
public/assets/vendor/kenney/
```

After adding or changing art packs, run:

```powershell
.\scripts\generate-kenney-manifest.ps1
```

The generated file is:

```text
public/assets/generated/kenney-manifest.json
```

### Manifest categories

The generator now classifies image assets into:

```text
vehicles
buildings
roads
ui
buttons
panels
icons
bars
allImages
```

The UI skin runtime reads `buttons`, `panels`, and `icons` from the manifest and applies the first matching assets to CSS variables:

```text
--ui-pack-button
--ui-pack-panel
--ui-pack-icon-build
--ui-pack-icon-shop
--ui-pack-icon-confirm
--ui-pack-icon-cancel
```

### Current use

The CSS skin uses these variables to style:

```text
mobile HUD
build tray
placed-building sheet
buttons
confirm/cancel controls
```

This gives us a safe pipeline for using free UI packs without hardcoding file names.

## 2. Game States

The current World screen uses these core states:

| State | Purpose |
|---|---|
| `normal` | Grid hidden. Player pans map, taps buildings, opens build tray. |
| `placing` | Build tray open. Grid visible. Player selects owned building and previews placement. |
| `moving` | Grid visible. Player is moving an already placed building. |

Runtime state variables:

```text
mode
selectedKey
pendingPlacement
selectedPlacedId
movingBuilding
placedBuildings
```

Next required states:

| State | Purpose |
|---|---|
| `upgrading` | Open upgrade card for selected building. |
| `collecting` | Tap building/resource bubble to collect. |
| `constructing` | Building exists but is under timed construction. |
| `shopOpen` | Store panel open. |
| `inventoryOpen` | Owned building inventory panel open. |
| `confirmDialog` | Confirm spend/move/sell/upgrade. |
| `tutorialStep` | Guided first-time user flow. |

## 3. Mobile Interaction Rules

### Core touch rules

```text
one-finger drag = pan map
tap fixed building = open action
tap Build = open build tray
tap owned building card = select building type
tap green cell = preview placement only
tap Confirm = place or move
tap Cancel = exit without saving
tap placed building = open action sheet
tap Move = enter move mode
```

### Important rules

- The grid must never be visible during normal gameplay.
- Placement must never happen immediately on first tap.
- A ghost preview must appear before confirmation.
- Roads and sidewalks must be blocked.
- Existing buildings/events must be blocked.
- Moving a building temporarily removes its own collision box so it can be repositioned.
- Dragging the map must not place a building.

## 4. Asset Requirements

### UI assets needed

```text
button normal/pressed states
panel/window backgrounds
confirm/check icon
cancel/close icon
build/hammer icon
shop/store icon
upgrade arrow icon
move icon
resource counter frames
coin/parts/tools/scrap/tune/rep icons
progress/timer bars
notification badge
```

### Building assets needed

```text
1x1 kiosk
2x2 tire shop
3x2 private repair shop
4x3 parts warehouse
3x2 dealer/showroom
5x4 salvage yard block
construction scaffold
upgrade stage variants
```

### Road assets needed

```text
straight road tile
intersection tile
corner/curve tile
sidewalk tile
parking lot tile
crosswalk tile
road arrows/lane markings
```

### Vehicle assets needed

```text
left/right/up/down cars
left/right/up/down tow truck
left/right/up/down van
parked car sprites
broken car sprite
repair/tow event sprite
```

### Character assets needed

```text
mechanic walker
customer walker
tow driver walker
sales staff walker
shop worker idle animation
```

## Current technical stack

```text
PixiJS = world/city canvas
HTML/CSS = mobile HUD, tray, panels, buttons
localStorage = test placement save
manifest JSON = local asset discovery
```

## Next implementation layer

The next layer should connect the hardcoded owned counts to actual economy state:

```text
owned buildings from game state
build costs deducted from coins/parts/tools
placed buildings generate income/work orders
upgrade cards per building
timed construction state
```
