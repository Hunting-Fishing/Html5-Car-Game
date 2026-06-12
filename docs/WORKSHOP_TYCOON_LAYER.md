# Workshop Tycoon Layer

## Reference Purpose

This layer uses common idle workshop mechanics as inspiration only. It should not copy artwork, UI, screenshots, branding, or exact layouts from any reference game.

## Mechanics To Adapt

The companion game should add:

1. A visible shop floor
2. Upgradeable rooms
3. Customer/car flow
4. Staff/manager automation
5. Repair/service timers
6. Room income bubbles
7. Problem alerts over rooms
8. Offline earnings later
9. New shop areas unlocked over time
10. Vehicle/service variety without real brands

## Current 365 Room Map

| Room | Related Idle Line | Purpose |
|---|---|---|
| Front Lot | Street Route | car/customer arrival and basic income |
| Parts Counter | Parts Delivery | parts income and merge support |
| Service Bay | Mobile Mechanic | repair/toolkit income |
| Tow Yard | Towing Job | scrap/recovery income |
| Tuning Corner | Performance Bay | tuning income |
| 2D Test Track | Race Event | race rep income |

## Missing Gameplay Pieces To Build Next

### 1. Customer Queue

Add a simple queue of generic vehicles:

- compact car
- hatchback
- small van
- pickup
- service truck
- tuner coupe
- rally build

No real brands.

### 2. Service Jobs

Each vehicle should request a simple job:

- oil/filter service
- brake repair
- tire change
- electrical check
- tow recovery
- basic tune
- track inspection

### 3. Room Assignments

Each service job should point to a room. Example:

```text
Brake repair → Service Bay
Tow recovery → Tow Yard
Basic tune → Tuning Corner
Track inspection → 2D Test Track
```

### 4. Staff Cards

Staff should behave like idle managers:

- Driver
- Parts Courier
- Mobile Tech
- Tow Operator
- Sales Rep
- Tuner
- Crew Chief

### 5. Visual Upgrade States

Rooms should eventually have visual levels:

```text
Lv 0 locked / dark
Lv 1 basic
Lv 2 upgraded tools
Lv 3 professional station
```

## Do / Don't

Do:

- keep it 2D
- keep it mobile-first
- make every room explain what it produces
- show progress visually
- make managers visible
- use original/generic 365 artwork

Don't:

- copy Fallout Shelter rooms
- copy JILI or Idle Car Repair screenshots
- use real automotive logos
- turn this into realistic repair simulation too early
- overload the player before the first 60 seconds are fun
