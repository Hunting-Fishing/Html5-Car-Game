export const SCREENS = [
  { id: 'hub', label: 'Hub', icon: '🏁' },
  { id: 'race', label: 'Race', icon: '🚗' },
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
    unlocks: 'Performance Parts chain',
    costs: [{ coins: 350, parts: 55, tools: 35 }, { coins: 1600, parts: 120, tools: 95, tune: 20 }]
  },
  {
    key: 'testTrack', icon: '🛣️', name: '2D Test Track', max: 2,
    description: 'Unlocks Racing Gear and stronger route rewards.',
    unlocks: 'Racing Gear chain',
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
    do: ['Use fuel, police heat, breakdowns, traffic, and maintenance as the “enemy.”', 'Show constant progress feedback.', 'Let players recover quickly from problems.'],
    dont: ['Do not require steering controls.', 'Do not promise realistic physics.', 'Do not punish players so hard that idle progress stops for too long.']
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
