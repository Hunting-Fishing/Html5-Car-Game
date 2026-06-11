# Phase 10 Tasks

## Current Status

Branch: `v10`

Goal: convert the V9 companion game into a clearer mobile idle-clicker game with upgradeable automotive income lines.

## Task Groups

### 1. Project Memory

- [x] Add `docs/PHASE_10_PLAN.md`
- [x] Add `docs/IDLE_LINES_SPEC.md`
- [x] Add `docs/TASKS.md`
- [ ] Add `docs/DECISIONS.md`
- [ ] Add `docs/CHANGELOG_PHASE_10.md`

### 2. Data Model

- [ ] Add `IDLE_LINES` data to `src/data/gameData.js`
- [ ] Add line state to `src/state/defaultState.js`
- [ ] Add manager/automation state
- [ ] Add milestone state
- [ ] Add locked/unlocked state for advanced lines

### 3. Idle Line System

- [ ] Create `src/systems/idleLineSystem.js`
- [ ] Add cost formula
- [ ] Add income formula
- [ ] Add cycle progress formula
- [ ] Add manual collect function
- [ ] Add auto-collect function for managers
- [ ] Add line upgrade function
- [ ] Add manager purchase function
- [ ] Add milestone bonus function

### 4. UI Screens

- [ ] Add `Lines` screen/tab
- [ ] Make Race screen feel like main idle-clicker screen
- [ ] Add compact mobile line cards
- [ ] Add visible cycle progress bars
- [ ] Add collect buttons
- [ ] Add upgrade buttons
- [ ] Add manager buttons
- [ ] Add locked-line cards

### 5. Balance Pass 1

- [ ] Street Route playable from start
- [ ] Parts Delivery unlocks early
- [ ] Mobile Mechanic unlocks after Parts Delivery
- [ ] Fuel Run appears after fuel problem is introduced
- [ ] Towing Job appears after breakdown problem is introduced
- [ ] Dealer Showcase appears after basic rep objective
- [ ] Performance Bay remains locked behind Tuning Corner
- [ ] Race Event remains locked behind Test Track

### 6. Mobile UX

- [ ] Main screen readable on phone without zooming
- [ ] Bottom nav does not cover buttons
- [ ] Line cards are thumb-friendly
- [ ] No giant single-page layout
- [ ] Player can understand next objective in 10 seconds

### 7. Testing

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
