# Phase 10 Tasks

## Current Status

Branch: `v10`

Goal: convert the V9 companion game into a clearer mobile idle-clicker game with upgradeable automotive income lines and a stronger auto-shop visual direction.

## Task Groups

### 1. Project Memory

- [x] Add `docs/PHASE_10_PLAN.md`
- [x] Add `docs/IDLE_LINES_SPEC.md`
- [x] Add `docs/TASKS.md`
- [ ] Add `docs/DECISIONS.md`
- [ ] Add `docs/CHANGELOG_PHASE_10.md`
- [x] Add `docs/ASSET_PIPELINE.md`
- [x] Add `docs/ASSET_CREDITS.md`

### 2. Data Model

- [x] Add `IDLE_LINES` data to `src/data/gameData.js`
- [x] Add line state to `src/state/defaultState.js`
- [x] Add manager/automation state
- [x] Add milestone state
- [x] Add locked/unlocked state for advanced lines
- [x] Add `AUTO_SHOP_ROOMS` visual room data to `src/data/visualData.js`

### 3. Idle Line System

- [x] Create `src/systems/idleLineSystem.js`
- [x] Add cost formula
- [x] Add income formula
- [x] Add cycle progress formula
- [x] Add manual collect function
- [x] Add auto-collect function for managers
- [x] Add line upgrade function
- [x] Add manager purchase function
- [x] Add milestone bonus function

### 4. UI Screens

- [x] Add `Lines` screen/tab
- [ ] Make Race screen feel more like the main idle-clicker screen
- [x] Add compact mobile line cards
- [x] Add visible cycle progress bars
- [x] Add collect buttons
- [x] Add upgrade buttons
- [x] Add manager buttons
- [x] Add locked-line cards
- [ ] Wire auto-shop room assets into Garage or a new Shop screen
- [ ] Add income bubbles and room problem alerts

### 5. Visual Asset Direction

- [x] Add original placeholder shop room SVGs
- [x] Add package support for `canvas-confetti`
- [x] Add package support for `lucide-static`
- [ ] Add first animated shop floor UI
- [ ] Add generic customer/car flow
- [ ] Add room upgrade states
- [ ] Add vendor asset download folders only after license review
- [ ] Add Kenney asset pack notes after manually downloading chosen packs

### 6. Balance Pass 1

- [x] Street Route playable from start
- [x] Parts Delivery unlocks early
- [x] Mobile Mechanic unlocks after Parts Delivery
- [x] Fuel Run appears after Stage 3
- [x] Towing Job unlocks after Mobile Mechanic
- [x] Dealer Showcase appears after Stage 5
- [x] Performance Bay remains locked behind Tuning Corner
- [x] Race Event remains locked behind Test Track

### 7. Mobile UX

- [ ] Main screen readable on phone without zooming
- [ ] Bottom nav does not cover buttons
- [x] Line cards are thumb-friendly
- [x] No giant single-page layout
- [ ] Player can understand next objective in 10 seconds

### 8. Testing

- [ ] Run `npm install` after package changes
- [ ] Run `npm run dev`
- [ ] Test desktop browser
- [ ] Test phone using LAN URL
- [ ] Confirm save/load works
- [ ] Confirm no console errors
- [ ] Confirm production build works with `npm run build`

## Not For Phase 10

- [ ] Supabase
- [ ] real-time PVP
- [ ] licensed car brands
- [ ] real vehicle logo assets
- [ ] realistic physics
- [ ] full racing game systems
- [ ] copied artwork/UI from other idle games
