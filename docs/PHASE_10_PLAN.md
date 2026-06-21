# Phase 10 Plan — Idle Clicker Lines

## Phase Goal

Convert the current 365 Micro Garage companion game into a clearer mobile idle-clicker game where players upgrade different automotive income lines.

The merge bay remains important, but it becomes a support system for the idle economy instead of the whole game.

## Core Direction

This is a 365 Motor Sales companion game.

It should feel like a mobile idle clicker:

```text
Tap / collect
→ earn micro resources
→ upgrade income lines
→ automate lines with managers
→ solve small racing/service problems
→ use merge bay to create micro parts
→ build garage systems
→ unlock more routes and income lines
```

## Not the Full Racing Game

This companion game should not become the full racing game.

Do not add:

- live steering controls
- real-time PVP
- realistic physics
- licensed car brands
- high-value tradable rewards
- complex multiplayer backend

## Main Phase 10 Deliverable

Build an idle-business-style line system.

Each line needs:

- line name
- level
- upgrade cost
- income per cycle
- cycle timer
- manual collect button
- manager / automation unlock
- milestone bonuses
- problem risk
- clear resource output

## Initial Idle Lines

| Line | Produces | Theme |
|---|---|---|
| Street Route | Coins | basic racing income |
| Parts Delivery | Service Parts | marketplace parts activity |
| Mobile Mechanic | Toolkits | repair/service work |
| Fuel Run | Fuel Cans | keeps race loops active |
| Towing Job | Scrap | breakdown recovery |
| Dealer Showcase | Reputation | listings/dealer/showcase activity |
| Performance Bay | Tune Points | tuning upgrades |
| Race Event | Race Rep | advanced race progress |

## Phase 10 Screens

Recommended screens:

| Screen | Purpose |
|---|---|
| Race | main tap/idle driving screen |
| Lines | idle upgrade lines |
| Merge | micro parts board |
| Garage | buildings and unlocks |
| Problems | active route/service problems |
| Profile | player progress |
| Creator | creator rules and current scope |

## Minimum Phase 10 Success Criteria

Phase 10 is successful when:

1. The player understands what to do within 10 seconds.
2. The player can tap/collect from at least three income lines.
3. Each income line has level, cost, income, and cycle timer.
4. At least one manager can automate one line.
5. At least one milestone bonus changes the line.
6. Merge bay still drops only Level 1 starter items.
7. The layout feels mobile-first and not like one giant web page.
8. No Supabase is required.

## Current Priority

First build the data model and UI for idle lines.

Do not expand content until the line loop feels good.
