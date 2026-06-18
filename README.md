# 365 Micro Garage Companion - V10 / v0.11.0

Mobile-first HTML5/PWA companion game for 365 Motor Sales. The current build combines idle business lines, merge progression, garage upgrades, an open-world city layer, and a race mode with local browser saves.

## Current Game Modes

- **World** - Mini open-world city view with buildings, residents, traffic, collection timers, restock/repair needs, and upgrade hooks.
- **Race** - Drive mode with route progress, fuel/wear/heat pressure, route problems, ghost/race HUD work, sprite-backed visuals, and fullscreen support. Ghost racing is asynchronous best-time/replay racing, not live PVP.
- **Lines** - Idle business lines that generate resources, unlock managers, support auto-collect toggles, and communicate with Garage/World progression.
- **Merge** - Parts and tool-chain merge bay with unlock previews, chain guides, slot states, and asset-based merge item rendering.
- **Garage** - Room/build hub for shop systems, room cards, building upgrades, and linked World/Lines systems.
- **Profile/Menu** - Player overview, objectives, garage value, resource stats, and access to secondary/dev screens.
- **Creator** - Internal design-rule reference screen for UI, asset, and gameplay consistency.

## V10 Features

- Asset-based GUI styling for HUD, nav, cards, buttons, meters, merge slots, garage cards, and icons.
- Five-tab mobile navigation: Home, Race, Parts, Garage, and Menu.
- Top HUD resource capsules with asset icons, seven tracked resources, plus buttons, and stage badge.
- Segmented cartoon meters for progress, fuel, condition, heat, XP, unlocks, line cycles, and garage/build progress.
- Idle business lines with managers, auto-collect control, unlock requirements, and build/world communication.
- Reward toast layer with stacked reward cards, reward chips, and hidden legacy status fallback.
- Floating reward numbers for collection and reward moments.
- Sprite-based race canvas assets for cars, route backgrounds, speed effects, boost glow, warnings, and checkpoints.
- Race progress helpers and `test:race-progress` coverage for stage-length based progress.
- Local-first ghost racing model for route/stage best-time replays, local best ghosts, and seeded AI ghosts. See [Ghost Racing Model](docs/ghost-racing-model.md).
- Fullscreen support through the screen control runtime.
- Local browser save only while the core loop, UI, and balance are still changing quickly.

## Tech Stack

- Vite
- HTML5 / JavaScript / CSS
- PixiJS for the current canvas/world/race rendering layers
- Phaser road-runner modules are present for side-scroll route work
- GSAP for tap/pulse animation
- PWA generation via `vite-plugin-pwa`
- Local storage save system

## Install

```bash
npm install
npm run dev
```

Open the local Vite URL on desktop or phone.

## Build

```bash
npm run build
npm run preview
```

## Tests

```bash
npm run test:race-progress
```

## Current Scope

- Mobile-first HTML5/PWA game
- Local browser save only
- Asset folders are designed for manual replacement/override as better production art arrives
- No Supabase/cloud save yet
- No real-time PVP yet
- Ghost racing uses asynchronous saved best-time/replay data and computer ghost pacing; it is not live PVP.
- No trademarked vehicle brands or manufacturer logos

## Why no Supabase yet?

Supabase should wait until the core game loop is stable.

For now, keep the game local so we can quickly change:

- race feel and route problems
- idle line pacing
- merge-chain progression
- garage/building unlock order
- world happiness/restock/repair loops
- mobile GUI layout
- creator/design rules

Once the game is fun and stable, Supabase can be added for:

- user accounts
- cloud saves
- daily objectives
- leaderboards
- ghost race records
- event rewards
- server-validated inventory

## Core Loop

```text
Collect idle line output
-> merge parts/tools
-> upgrade garage rooms and buildings
-> improve world services and resident happiness
-> race routes for rewards
-> solve route/world problems
-> unlock stronger lines, chains, and systems
```

## Repo Workflow

Recommended branch style:

```text
main
v10
feature/mobile-ui
feature/merge-balance
feature/race-physics
feature/world-buildings
feature/assets-audio
feature/supabase-later
```
