# Idle Lines Spec

## Purpose

Idle lines are the main Phase 10 progression system.

They should work like businesses in a classic idle clicker, but themed around 365 Motor Sales, automotive service, racing routes, and marketplace activity.

## Line Object Shape

Each line should eventually use a structure similar to:

```js
{
  key: 'streetRoute',
  name: 'Street Route',
  icon: '🌆',
  description: 'Basic route income. The first line players understand.',
  output: 'coins',
  baseIncome: 8,
  baseCycleMs: 3000,
  baseCost: 25,
  costRate: 1.16,
  unlock: { type: 'starter' },
  manager: {
    name: 'Route Driver',
    cost: { coins: 500 },
    description: 'Automatically collects Street Route income.'
  },
  problemRisk: ['fuel', 'traffic', 'heat'],
  milestones: [
    { level: 10, type: 'incomeMultiplier', value: 2, label: 'Local route optimized: x2 income' },
    { level: 25, type: 'cycleMultiplier', value: 0.85, label: 'Better route timing: 15% faster' },
    { level: 50, type: 'managerDiscount', value: 0.9, label: 'Driver training: cheaper automation' }
  ]
}
```

## Initial Lines

### 1. Street Route

- Output: coins
- First unlocked line
- Main tap/idle income
- Problems: fuel, traffic, police heat
- Manager: Route Driver

### 2. Parts Delivery

- Output: parts
- Unlock: early, after Street Route level 5 or small coin cost
- Theme: 365 marketplace parts delivery
- Problems: traffic, missed delivery, fuel
- Manager: Parts Courier

### 3. Mobile Mechanic

- Output: tools
- Unlock: Parts Delivery level 5 or basic garage build
- Theme: mobile repairs/service calls
- Problems: breakdown, missing tools, traffic
- Manager: Mobile Mechanic

### 4. Fuel Run

- Output: fuelCans
- Unlock: after fuel problem is introduced
- Theme: keeps routes moving
- Problems: traffic, price spike, missed delivery
- Manager: Fuel Runner

### 5. Towing Job

- Output: scrap
- Unlock: after breakdown problem is introduced
- Theme: recovery and salvage
- Problems: breakdown, traffic, bad road
- Manager: Tow Operator

### 6. Dealer Showcase

- Output: rep
- Unlock: after basic profile/garage value milestone
- Theme: listing/showcase/dealer traffic for 365
- Problems: police heat, dirty listing, low turnout
- Manager: Sales Rep

### 7. Performance Bay

- Output: tune
- Unlock: Tuning Corner building
- Theme: micro performance upgrades
- Problems: missing parts, bad tune, overheating
- Manager: Tuner

### 8. Race Event

- Output: raceRep
- Unlock: Test Track building
- Theme: organized offline/ghost-style 2D race events
- Problems: tire wear, breakdown, heat, fuel
- Manager: Crew Chief

## Milestone Levels

Use standard idle-clicker milestones:

```text
10, 25, 50, 100, 250, 500, 1000
```

Early implementation only needs 10, 25, and 50.

## Upgrade Cost Formula

Suggested formula:

```js
cost = Math.floor(baseCost * Math.pow(costRate, level))
```

## Income Formula

Suggested formula:

```js
income = Math.floor(baseIncome * level * milestoneMultiplier)
```

If level is 0, the line is locked or not producing.

## Automation Rule

Before manager:

- player must tap/collect when cycle is full

After manager:

- line auto-collects when cycle is full

## UI Requirements

Each line card should show:

- icon
- name
- level
- progress bar
- output amount
- upgrade cost
- collect button
- upgrade button
- manager state
- next milestone

## Design Rules

Do:

- make line cards compact and readable on mobile
- keep numbers understandable early
- make progress bars visible
- make collect and upgrade buttons large enough for thumbs
- lock advanced lines clearly

Don't:

- show eight complicated cards at once on first load
- require scrolling through a huge page before the player understands the game
- hide what each line produces
- make automation available too early
