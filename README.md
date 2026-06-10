# 365 Micro Garage Companion — V9 Repo Build

This is the repo-ready version of the 365 Motor Sales companion idle racing / merge game.

## Current scope

- Mobile-first HTML5/PWA game
- Vite project structure
- PixiJS race lane rendering
- GSAP tap animation
- Local browser save only
- No Supabase yet
- No real-time PVP
- No trademarked vehicle brands or manufacturer logos

## Why no Supabase yet?

Supabase should wait until the core game loop is stable.

For now, keep the game local so we can quickly change:

- idle racing loop
- route problems
- merge pacing
- building unlock order
- upgrade balance
- mobile GUI layout
- creator rules

Once the game is fun and stable, Supabase can be added for:

- user accounts
- cloud saves
- daily objectives
- leaderboards
- ghost race records
- event rewards
- server-validated inventory

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

## Repo-first workflow

Recommended branch style:

```text
main
feature/mobile-ui
feature/merge-balance
feature/idle-racing
feature/garage-buildings
feature/assets-audio
feature/supabase-later
```

## Current game screens

- Hub
- Race
- Merge
- Build
- Profile
- Creator

## Game loop

```text
Tap Race / idle drive
→ handle route problems
→ earn micro resources
→ merge Level 1 starter parts
→ build garage systems
→ unlock performance and racing chains
→ upgrade idle output
```
