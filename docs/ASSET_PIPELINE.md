# Asset Pipeline — Phase 10+

## Purpose

Move the game toward an idle auto-shop / tower-builder visual style without copying proprietary games.

Reference inspiration is allowed at the mechanics level:

- stacked rooms
- visible workstations
- customers/cars arriving
- room upgrades
- worker/manager automation
- income bubbles
- progress bars
- problem alerts

Do not copy:

- Fallout Shelter artwork
- JILI Idle Auto Shop artwork
- Idle Car Repair artwork
- screenshots, characters, UI layouts, fonts, icons, names, or branding from those games

## Correct 365 Direction

Use the reference games only to validate what is missing from our game:

1. A visual auto-shop floor
2. Rooms/workstations that map to idle lines
3. Workers/managers shown as automation
4. Cars/customers moving through service areas
5. Upgradeable rooms with visible changes
6. Small problem alerts over rooms
7. Income bubbles over rooms
8. Clear next objective guidance

## Asset Folder Structure

```text
public/assets/
  shop/                 Original 365 room SVGs
  vehicles/             Original generic vehicle silhouettes
  icons/                Original game icons
  effects/              Original UI/effect sprites
  vendor/
    kenney/             Downloaded Kenney packs, CC0
    game-icons/         Downloaded game-icons.net SVGs, attribution required
    opengameart/        Only assets with license checked
```

## Installed Package Direction

Current packages:

- PixiJS: animated race lane and future animated shop layer
- GSAP: UI transitions, income bubbles, button bounce
- Howler: future click/engine/shop sounds
- canvas-confetti: rewards, milestones, manager unlocks
- lucide-static: clean generic UI icons if needed

## What To Add Next

### Visual Shop Layer

Create a new screen or panel that shows a compact stacked auto shop:

```text
[Front Lot]        [Parts Counter]
[Service Bay]      [Tow Yard]
[Tuning Corner]    [2D Test Track]
```

Each room maps to one or more idle lines.

### First Visual Rooms

| Room | Related Line | Unlock |
|---|---|---|
| Front Lot | Street Route | Start |
| Parts Counter | Parts Delivery | Parts Storage |
| Service Bay | Mobile Mechanic | Parts Storage |
| Tow Yard | Towing Job | Companion Hub or Mobile Mechanic Lv 5 |
| Tuning Corner | Performance Bay | Tuning Corner |
| 2D Test Track | Race Event | Test Track |

## Visual Style Rules

Do:

- bright 2D vector style
- rounded mobile cards
- clear resource icons
- generic vehicles only
- 365 color family: green, teal, blue, yellow accents
- small animated feedback

Don't:

- use dark gritty realism
- copy Fallout Shelter vault rooms
- copy other idle auto-shop game screenshots
- use real car logos
- use trademarks on vehicles/tools
- download random paid asset packs without license review

## Asset License Rules

- Original assets are safest.
- Kenney assets are preferred for placeholders because many packs are CC0.
- Game-icons.net assets can be used with attribution.
- OpenGameArt assets must be checked one by one.
- Store attribution and license notes in `docs/ASSET_CREDITS.md`.
