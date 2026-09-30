# Auto World Map Plan

## Direction

The companion game should become a playable 2D auto world, not just a static idle menu.

The player should see and interact with:

- roads
- moving cars
- car dealerships
- private repair shops
- auto salvage yards
- parts suppliers
- the 365 main garage
- broken-down cars
- tow-truck service jobs
- people around shops and yards

## Current First Version

The first world map is intentionally simple and mobile-safe:

- CSS-rendered map
- clickable buildings
- moving traffic icons
- small people icons
- roadside breakdown event
- dispatch tow button
- links into Garage, Lines, Merge, and Race systems

## Core Loop

```text
Tap World Map
→ see auto economy moving
→ tap building/event
→ complete small jobs
→ earn coins/scrap/parts/rep
→ upgrade idle lines
→ upgrade shop rooms
→ unlock more world locations
```

## Building Types

| Type | Purpose |
|---|---|
| 365 Main Garage | central upgrade/shop floor |
| Dealer Row | listings, showcase, rep, dealer economy |
| Parts Hub | parts delivery and merge economy |
| Private Repair Shops | service jobs and toolkit income |
| Auto Salvage Yard | scrap, recovery, dismantling, tow work |
| Roadside Breakdown | event requiring tow service |

## Next Systems To Add

### 1. Player Avatar / Camera Movement

Add a simple player marker that can move between locations by tapping buildings.

### 2. Job Queue

Add small jobs generated from world locations:

- tow breakdown
- deliver parts
- inspect used car
- repair private-shop vehicle
- salvage vehicle
- prepare dealer showcase

### 3. Vehicles Entering Buildings

Animate cars going:

```text
Road → Shop → Service Bay → Road
Road → Dealer → Road
Road → Breakdown → Tow Yard
```

### 4. Location Upgrades

Each world building should have levels and visible state.

### 5. Unlockable Districts

Start with one small district, then unlock:

- dealer zone
- repair row
- salvage zone
- parts warehouse
- race/test area

## Scope Rules

Do:

- keep this 2D and lightweight
- make the map clickable
- use generic vehicles only
- make the game feel alive with motion
- keep the first version small and playable

Don't:

- add live multiplayer yet
- add realistic driving physics yet
- add copyrighted/trademarked car logos
- build a huge map before the first district is fun
- turn this into the full Unity racing game yet
