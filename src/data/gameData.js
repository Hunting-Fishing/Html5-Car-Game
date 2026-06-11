export const SCREENS = [
  { id: 'hub', label: 'Hub', icon: '🏁' },
  { id: 'race', label: 'Race', icon: '🚗' },
  { id: 'lines', label: 'Lines', icon: '📈' },
  { id: 'merge', label: 'Merge', icon: '🔧' },
  { id: 'garage', label: 'Build', icon: '🏗️' },
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'creator', label: 'Creator', icon: '📋' }
];

export const CHAINS = {
  original: {
    label: 'Original Parts', short: 'ORG', icon: '🔩', resource: 'parts', unlockStage: 1,
    description: 'The ordinary parts chain. This must stay active from the start.',
    items: ['Bolt Pack','Washer Set','Nut Kit','Hose Clamp','Spark Plug','Fuse Pack','Oil Filter','Air Filter','Brake Pads','Rotor Pair','Water Pump','Service Engine']
  },
  tools: {
    label: 'Shop Tools', short: 'TLS', icon: '🧰', resource: 'tools', unlockStage: 1,
    description: 'Basic tools that build the mechanic shop systems.',
    items: ['Shop Rag','Gloves','Screwdriver','10mm Socket','Ratchet','Multimeter','Torque Wrench','Jack Stand','Floor Jack','Scanner','Tire Machine','Shop Lift']
  },
  performance: {
    label: 'Performance Parts', short: 'PER', icon: '⚙️', resource: 'tune', unlockStage: 3,
    description: 'Micro tuning parts. Locked until Tuning Corner is built.',
    items: ['Intake Clamp','Intake Pipe','Exhaust Tip','Header Pipe','Fuel Rail','Injectors','Camshaft','Pistons','Crankshaft','ECU Tune','Turbo Kit','Super Kit']
  },
  racing: {
    label: 'Racing Gear', short: 'RCE', icon: '🏎️', resource: 'rep', unlockStage: 4,
    description: 'Race support chain. Locked until Test Track is built.',
    items: ['Tire Gauge','Sport Tire','Coilovers','Strut Bar','Race Seat','Harness','Helmet','Roll Cage','Splitter','Wing','Rally Lamps','Drag Slicks']
  }
};

export const RACE_MODES = {
  street: {
    label: 'Street Loop', icon: '🌆',
    description: 'Balanced route. Earn coins while managing heat, fuel, and reliability.',
    reward: 'coins', stageLength: 100, fuelDrain: 0.34, conditionDrain: 0.18, heatGain: 0.34, rewardRate: 1
  },
  delivery: {
    label: 'Parts Delivery', icon: '📦',
    description: 'Micro delivery run. More service parts, more fuel pressure.',
    reward: 'parts', stageLength: 115, fuelDrain: 0.44, conditionDrain: 0.16, heatGain: 0.18, rewardRate: 0.82
  },
  economy: {
    label: 'Fuel Saver', icon: '⛽',
    description: 'Slower route. Better fuel survival and fewer breakdowns.',
    reward: 'fuelCans', stageLength: 130, fuelDrain: 0.18, conditionDrain: 0.12, heatGain: 0.12, rewardRate: 0.62
  },
  rough: {
    label: 'Rough Road', icon: '🪨',
    description: 'Rough route. Higher scrap rewards, more breakdown risk.',
    reward: 'scrap', stageLength: 120, fuelDrain: 0.32, conditionDrain: 0.44, heatGain: 0.10, rewardRate: 0.96
  },
  showcase: {
    label: 'Dealer Showcase', icon: '📣',
    description: 'Clean promotional run. Earn reputation for 365 vehicle showcase events.',
    reward: 'rep', stageLength: 125, fuelDrain: 0.25, conditionDrain: 0.15, heatGain: 0.30, rewardRate: 0.72
  }
};

export const IDLE_LINES = [
  {
    key: 'streetRoute', name: 'Street Route', icon: '🌆', output: 'coins', outputLabel: 'Coins', costResource: 'coins',
    description: 'First route. Basic clicker income from safe local driving.',
    baseIncome: 8, baseCycleMs: 3000, baseCost: 25, costRate: 1.16, startLevel: 1,
    unlock: { type: 'starter' }, problemRisk: ['fuel', 'traffic', 'heat'],
    manager: { name: 'Route Driver', unlockLevel: 10, cost: { coins: 500 }, description: 'Automatically collects Street Route income.' },
    milestones: [
      { level: 10, type: 'incomeMultiplier', value: 2, label: 'Local route optimized: x2 income' },
      { level: 25, type: 'cycleMultiplier', value: 0.85, label: 'Better timing: 15% faster' },
      { level: 50, type: 'incomeMultiplier', value: 3, label: 'Trusted route: x3 income' }
    ]
  },
  {
    key: 'partsDelivery', name: 'Parts Delivery', icon: '📦', output: 'parts', outputLabel: 'Service Parts', costResource: 'coins',
    description: 'Small 365 parts delivery line. Feeds garage builds and repairs.',
    baseIncome: 3, baseCycleMs: 5000, baseCost: 90, costRate: 1.18, startLevel: 0,
    unlock: { type: 'lineLevel', key: 'streetRoute', level: 5, label: 'Street Route' }, problemRisk: ['fuel', 'traffic'],
    manager: { name: 'Parts Courier', unlockLevel: 10, cost: { coins: 900, parts: 25 }, description: 'Automatically collects Parts Delivery income.' },
    milestones: [
      { level: 10, type: 'incomeMultiplier', value: 2, label: 'Known suppliers: x2 parts' },
      { level: 25, type: 'cycleMultiplier', value: 0.82, label: 'Shorter delivery path' },
      { level: 50, type: 'incomeMultiplier', value: 3, label: 'Bulk delivery rhythm' }
    ]
  },
  {
    key: 'mobileMechanic', name: 'Mobile Mechanic', icon: '🧑‍🔧', output: 'tools', outputLabel: 'Toolkits', costResource: 'parts',
    description: 'Service calls create toolkits for building and problem fixes.',
    baseIncome: 2, baseCycleMs: 6500, baseCost: 35, costRate: 1.19, startLevel: 0,
    unlock: { type: 'lineLevel', key: 'partsDelivery', level: 5, label: 'Parts Delivery' }, problemRisk: ['condition', 'traffic'],
    manager: { name: 'Mobile Tech', unlockLevel: 10, cost: { coins: 1500, tools: 20 }, description: 'Automatically collects Mobile Mechanic income.' },
    milestones: [
      { level: 10, type: 'incomeMultiplier', value: 2, label: 'Faster repairs: x2 tools' },
      { level: 25, type: 'cycleMultiplier', value: 0.84, label: 'Better dispatch timing' },
      { level: 50, type: 'incomeMultiplier', value: 3, label: 'Trusted mobile crew' }
    ]
  },
  {
    key: 'fuelRun', name: 'Fuel Run', icon: '⛽', output: 'fuelCans', outputLabel: 'Fuel Cans', costResource: 'coins',
    description: 'Produces fuel cans so racing problems do not stop progress.',
    baseIncome: 1, baseCycleMs: 7000, baseCost: 240, costRate: 1.17, startLevel: 0,
    unlock: { type: 'stage', stage: 3 }, problemRisk: ['traffic'],
    manager: { name: 'Fuel Runner', unlockLevel: 10, cost: { coins: 2100, fuelCans: 8 }, description: 'Automatically collects Fuel Run income.' },
    milestones: [
      { level: 10, type: 'incomeMultiplier', value: 2, label: 'Fuel route secured' },
      { level: 25, type: 'cycleMultiplier', value: 0.86, label: 'Less waiting at pumps' },
      { level: 50, type: 'incomeMultiplier', value: 3, label: 'Bulk fuel plan' }
    ]
  },
  {
    key: 'towingJob', name: 'Towing Job', icon: '🪝', output: 'scrap', outputLabel: 'Scrap', costResource: 'tools',
    description: 'Recovery jobs provide scrap for repairs and pit upgrades.',
    baseIncome: 3, baseCycleMs: 8500, baseCost: 28, costRate: 1.2, startLevel: 0,
    unlock: { type: 'lineLevel', key: 'mobileMechanic', level: 5, label: 'Mobile Mechanic' }, problemRisk: ['condition', 'traffic'],
    manager: { name: 'Tow Operator', unlockLevel: 10, cost: { coins: 2500, scrap: 45 }, description: 'Automatically collects Towing Job income.' },
    milestones: [
      { level: 10, type: 'incomeMultiplier', value: 2, label: 'Recovery route mapped' },
      { level: 25, type: 'cycleMultiplier', value: 0.85, label: 'Faster hookup time' },
      { level: 50, type: 'incomeMultiplier', value: 3, label: 'Reliable salvage flow' }
    ]
  },
  {
    key: 'dealerShowcase', name: 'Dealer Showcase', icon: '📣', output: 'rep', outputLabel: 'Reputation', costResource: 'coins',
    description: 'Showcase vehicles and dealer activity for 365-style reputation.',
    baseIncome: 2, baseCycleMs: 9000, baseCost: 700, costRate: 1.21, startLevel: 0,
    unlock: { type: 'stage', stage: 5 }, problemRisk: ['heat', 'traffic'],
    manager: { name: 'Sales Rep', unlockLevel: 10, cost: { coins: 3500, rep: 35 }, description: 'Automatically collects Dealer Showcase income.' },
    milestones: [
      { level: 10, type: 'incomeMultiplier', value: 2, label: 'Better listings: x2 rep' },
      { level: 25, type: 'cycleMultiplier', value: 0.84, label: 'Faster buyer attention' },
      { level: 50, type: 'incomeMultiplier', value: 3, label: 'Trusted dealer network' }
    ]
  },
  {
    key: 'performanceBay', name: 'Performance Bay', icon: '⚙️', output: 'tune', outputLabel: 'Tune Points', costResource: 'parts',
    description: 'Micro tuning income. Locked behind the Tuning Corner building.',
    baseIncome: 2, baseCycleMs: 10000, baseCost: 130, costRate: 1.22, startLevel: 0,
    unlock: { type: 'building', key: 'tuningCorner', level: 1, label: 'Tuning Corner' }, problemRisk: ['condition'],
    manager: { name: 'Tuner', unlockLevel: 10, cost: { coins: 4200, tune: 35 }, description: 'Automatically collects Performance Bay income.' },
    milestones: [
      { level: 10, type: 'incomeMultiplier', value: 2, label: 'Better tune cards' },
      { level: 25, type: 'cycleMultiplier', value: 0.84, label: 'Faster tuning cycle' },
      { level: 50, type: 'incomeMultiplier', value: 3, label: 'Pro tuning bench' }
    ]
  },
  {
    key: 'raceEvent', name: 'Race Event', icon: '🏁', output: 'rep', outputLabel: 'Race Rep', costResource: 'tune',
    description: 'Offline 2D race event line. No live PVP.',
    baseIncome: 5, baseCycleMs: 12000, baseCost: 55, costRate: 1.23, startLevel: 0,
    unlock: { type: 'building', key: 'testTrack', level: 1, label: '2D Test Track' }, problemRisk: ['fuel', 'condition', 'heat'],
    manager: { name: 'Crew Chief', unlockLevel: 10, cost: { coins: 6500, tune: 65, rep: 55 }, description: 'Automatically collects Race Event income.' },
    milestones: [
      { level: 10, type: 'incomeMultiplier', value: 2, label: 'Organized event format' },
      { level: 25, type: 'cycleMultiplier', value: 0.82, label: 'Faster staging' },
      { level: 50, type: 'incomeMultiplier', value: 3, label: 'Regional attention' }
    ]
  }
];

export const UPGRADES = [
  { key: 'tapCrew', icon: '👆', name: 'Tap Boost Crew', description: '+tap power and manual income.', resource: 'coins', baseCost: 75, costRate: 1.32 },
  { key: 'idleDriver', icon: '🧑‍🔧', name: 'Idle Driver', description: '+idle meters per second.', resource: 'coins', baseCost: 120, costRate: 1.36 },
  { key: 'routeScout', icon: '🗺️', name: 'Route Scout', description: '-police heat gain and better stage rewards.', resource: 'rep', baseCost: 16, costRate: 1.35 },
  { key: 'fuelPlan', icon: '⛽', name: 'Fuel Planning', description: '+max fuel and reduced fuel drain.', resource: 'parts', baseCost: 18, costRate: 1.34 },
  { key: 'pitKit', icon: '🛠️', name: 'Pit Kit', description: '+condition protection and cheaper fixes.', resource: 'scrap', baseCost: 14, costRate: 1.32 },
  { key: 'supplierShelf', icon: '📦', name: 'Supplier Shelf', description: '+shelf capacity and board permit.', resource: 'tools', baseCost: 20, costRate: 1.38 }
];

export const BUILDINGS = [
  {
    key: 'partsStorage', icon: '🏚️', name: 'Parts Storage', max: 3,
    description: 'Increases active board permit. This should be the first build objective.',
    unlocks: 'More board capacity',
    costs: [{ coins: 120, parts: 18 }, { coins: 420, parts: 55, tools: 18 }, { coins: 1200, parts: 140, tools: 60 }]
  },
  {
    key: 'tuningCorner', icon: '🔬', name: 'Tuning Corner', max: 2,
    description: 'Unlocks Performance Parts starter drops after the player proves the core loop.',
    unlocks: 'Performance Parts chain and Performance Bay line',
    costs: [{ coins: 350, parts: 55, tools: 35 }, { coins: 1600, parts: 120, tools: 95, tune: 20 }]
  },
  {
    key: 'testTrack', icon: '🛣️', name: '2D Test Track', max: 2,
    description: 'Unlocks Racing Gear and stronger route rewards.',
    unlocks: 'Racing Gear chain and Race Event line',
    costs: [{ coins: 800, tune: 35, rep: 18 }, { coins: 2600, tune: 95, rep: 70 }]
  },
  {
    key: 'companionHub', icon: '📱', name: '365 Companion Hub', max: 3,
    description: 'Improves offline progress and profile value. No Supabase yet.',
    unlocks: 'Better offline rewards',
    costs: [{ coins: 650, rep: 25, tools: 40 }, { coins: 1900, rep: 75, tools: 90 }, { coins: 5000, rep: 180, tools: 190 }]
  }
];

export const PROBLEMS = {
  fuel: { icon: '⛽', label: 'Out of Fuel', description: 'Race paused until fuel is restored.', fixes: [{ resource: 'fuelCans', amount: 1, label: 'Use Fuel Can' }, { resource: 'coins', amount: 80, label: 'Buy Fuel' }] },
  condition: { icon: '💨', label: 'Breakdown', description: 'Car condition is too low.', fixes: [{ resource: 'scrap', amount: 16, label: 'Patch Repair' }, { resource: 'parts', amount: 12, label: 'Replace Part' }] },
  heat: { icon: '🚨', label: 'Police Heat', description: 'Cool down the route before another run.', fixes: [{ resource: 'rep', amount: 12, label: 'Legal Event Permit' }, { resource: 'coins', amount: 120, label: 'Pay Ticket' }] },
  traffic: { icon: '🚧', label: 'Traffic Jam', description: 'Progress slowed. Clear the route.', fixes: [{ resource: 'coins', amount: 55, label: 'Reroute' }, { resource: 'tools', amount: 8, label: 'Traffic Crew' }] }
};

export const CREATOR_RULES = [
  {
    mode: 'Core Companion Scope',
    do: ['Keep rewards micro-sized.', 'Use this app to support the larger 365 ecosystem.', 'Make every mode understandable in one sentence.'],
    dont: ['Do not build the full racing game here.', 'Do not add live PVP yet.', 'Do not make rewards valuable enough to require complex anti-cheat.']
  },
  {
    mode: 'Idle Racing',
    do: ['Use fuel, police heat, breakdowns, traffic, and maintenance as the enemy.', 'Show constant progress feedback.', 'Let players recover quickly from problems.'],
    dont: ['Do not require steering controls.', 'Do not promise realistic physics.', 'Do not punish players so hard that idle progress stops for too long.']
  },
  {
    mode: 'Idle Lines',
    do: ['Use upgradeable income lines.', 'Show cycle progress and output clearly.', 'Unlock automation with managers.'],
    dont: ['Do not show every advanced line as playable at the start.', 'Do not hide upgrade costs.', 'Do not make line cards too large for mobile.']
  },
  {
    mode: 'Merge Bay',
    do: ['Supplier drops Level 1 only.', 'Higher levels must come from merging.', 'Unlock new chains through buildings.'],
    dont: ['Do not drop high-level items directly.', 'Do not unlock Performance/Racing before the player builds the systems.', 'Do not let the board become a giant scrolling page.']
  },
  {
    mode: 'Garage Building',
    do: ['Buildings should unlock mechanics.', 'Costs should use resources from both racing and merging.', 'Each building must clearly say what it unlocks.'],
    dont: ['Do not add cosmetic-only buildings early.', 'Do not create buildings without gameplay purpose.', 'Do not gate the first fun moment behind a long grind.']
  }
];
