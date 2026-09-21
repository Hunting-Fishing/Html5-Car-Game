# 365 Micro Garage Companion

Mobile-first idle racing / merge companion game for **365 Motor Sales**.

Style: idle collector (Simpsons Tapped Out / Adventure Capitalist) with automotive theme.

## Features

- Idle racing with fuel, breakdowns, heat, traffic
- Merge bay (Level 1 supplier drops only)
- Garage buildings that unlock systems
- Offline progress
- 365 Motor Sales website CTAs (especially Dealer Showcase)
- PWA + Capacitor-ready for iOS/Android

## Quick start

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

Output: `dist/` — host anywhere static.

## Mobile (Capacitor)

```bash
npm run build
npm run cap:add:android   # once
npm run cap:add:ios       # once (macOS)
npm run cap:android       # open Android Studio
npm run cap:ios           # open Xcode
```

Full guide: see **DEPLOY.md**.

## Screens

Hub · Race · Merge · Build · Profile

## Game loop

```text
Tap / idle race
→ fix route problems
→ earn micro resources
→ merge Level 1 parts
→ build garage systems
→ unlock performance & racing chains
→ upgrade idle output
→ visit 365motorsales.com for real deals
```

## Notes

- Local save only (no Supabase yet)
- No real-time PVP
- No trademarked manufacturer logos
