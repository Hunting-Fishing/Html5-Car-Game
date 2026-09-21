export const SCREENS = [
  { id: 'hub', label: 'Hub', icon: '🏁' },
  { id: 'race', label: 'Drive', icon: '🚗' },
  { id: 'merge', label: 'Merge', icon: '🔧' },
  { id: 'lot', label: 'Lot', icon: '🏘️' },
  { id: 'profile', label: 'Me', icon: '👤' }
];

export const CHAINS = {
  original: {
    label: 'Original Parts', short: 'ORG', icon: '🔩', resource: 'parts', unlockStage: 1,
    description: 'Starter merge chain. Always available.',
    items: ['Bolt Pack','Washer Set','Nut Kit','Hose Clamp','Spark Plug','Fuse Pack','Oil Filter','Air Filter','Brake Pads','Rotor Pair','Water Pump','Service Engine']
  },
  tools: {
    label: 'Shop Tools', short: 'TLS', icon: '🧰', resource: 'tools', unlockStage: 1,
    description: 'Tools that feed the idle shop.',
    items: ['Shop Rag','Gloves','Screwdriver','10mm Socket','Ratchet','Multimeter','Torque Wrench','Jack Stand','Floor Jack','Scanner','Tire Machine','Shop Lift']
  },
  performance: {
    label: 'Performance Parts', short: 'PER', icon: '⚙️', resource: 'tune', unlockStage: 3,
    description: 'Locked until Tuning Corner is built on the lot.',
    items: ['Intake Clamp','Intake Pipe','Exhaust Tip','Header Pipe','Fuel Rail','Injectors','Camshaft','Pistons','Crankshaft','ECU Tune','Turbo Kit','Super Kit']
  },
  racing: {
    label: 'Racing Gear', short: 'RCE', icon: '🏎️', resource: 'rep', unlockStage: 4,
    description: 'Locked until Test Track is built.',
    items: ['Tire Gauge','Sport Tire','Coilovers','Strut Bar','Race Seat','Harness','Helmet','Roll Cage','Splitter','Wing','Rally Lamps','Drag Slicks']
  }
};

export const RACE_MODES = {
  street: {
    label: 'Street Loop', icon: '🌆', playstyle: 'idle',
    description: 'Idle clicker route. Tap or let it run.',
    reward: 'coins', stageLength: 90, fuelDrain: 0.30, conditionDrain: 0.16, heatGain: 0.30, rewardRate: 1.05
  },
  delivery: {
    label: 'Parts Delivery', icon: '📦', playstyle: 'idle',
    description: 'Earn parts for the merge bay and shop.',
    reward: 'parts', stageLength: 105, fuelDrain: 0.40, conditionDrain: 0.15, heatGain: 0.16, rewardRate: 0.9
  },
  economy: {
    label: 'Fuel Saver', icon: '⛽', playstyle: 'idle',
    description: 'Slow route. Banks fuel cans for Hill Runs.',
    reward: 'fuelCans', stageLength: 120, fuelDrain: 0.15, conditionDrain: 0.11, heatGain: 0.10, rewardRate: 0.7
  },
  rough: {
    label: 'Rough Road', icon: '🪨', playstyle: 'idle',
    description: 'Scrap route. Feeds Hill Climb repairs.',
    reward: 'scrap', stageLength: 110, fuelDrain: 0.28, conditionDrain: 0.38, heatGain: 0.09, rewardRate: 1.05
  },
  showcase: {
    label: 'Dealer Showcase', icon: '📣', playstyle: 'idle',
    description: 'Reputation run. Pushes players to 365 inventory.',
    reward: 'rep', stageLength: 100, fuelDrain: 0.22, conditionDrain: 0.13, heatGain: 0.24, rewardRate: 0.95
  },
  hill: {
    label: 'Hill Run', icon: '⛰️', playstyle: 'climb',
    description: 'Hill Climb style. Hold GAS, manage fuel, reach distance.',
    reward: 'coins', stageLength: 160, fuelDrain: 0.55, conditionDrain: 0.22, heatGain: 0.08, rewardRate: 1.2
  }
};

export const BUSINESSES = [
  { key: 'wash', icon: '🚿', name: 'Express Wash', description: 'Adventure Capitalist style. Coins while you play other modes.', baseCost: 40, costRate: 1.18, baseIncome: 0.6 },
  { key: 'detail', icon: '✨', name: 'Detail Bay', description: 'Higher coin drip. Needs tools from merge.', baseCost: 180, costRate: 1.20, baseIncome: 2.2, needTools: 4 },
  { key: 'service', icon: '🛠️', name: 'Quick Service', description: 'Parts + coins. Stronger with merge levels.', baseCost: 420, costRate: 1.22, baseIncome: 5.5 },
  { key: 'lotRental', icon: '🅿️', name: 'Lot Stalls', description: 'Idle rent. Boosted by Lot Town buildings.', baseCost: 900, costRate: 1.24, baseIncome: 12 },
  { key: 'showcaseShop', icon: '📣', name: 'Showcase Booth', description: 'Rep + coins. Unlocks after first Showcase stage.', baseCost: 1600, costRate: 1.26, baseIncome: 18 }
];

export const LOT_PLOTS = [
  { key: 'office', icon: '🏢', name: 'Sales Office', cost: { coins: 60 }, income: 0.4, unlocks: 'Tap to collect coins' },
  { key: 'canopy', icon: '⛺', name: 'Lot Canopy', cost: { coins: 140, parts: 8 }, income: 0.8, unlocks: '+shop income' },
  { key: 'partsStorage', icon: '🏚️', name: 'Parts Storage', cost: { coins: 80, parts: 12 }, income: 0.3, unlocks: 'More merge board' },
  { key: 'cafe', icon: '☕', name: 'Lot Cafe', cost: { coins: 220, tools: 6 }, income: 1.1, unlocks: 'Offline bonus' },
  { key: 'tuningCorner', icon: '🔬', name: 'Tuning Corner', cost: { coins: 240, parts: 40, tools: 24 }, income: 0.6, unlocks: 'Performance merge chain' },
  { key: 'billboard', icon: '🪧', name: '365 Billboard', cost: { coins: 300, rep: 6 }, income: 0.9, unlocks: 'Showcase bonus' },
  { key: 'testTrack', icon: '🛣️', name: '2D Test Track', cost: { coins: 550, tune: 24, rep: 12 }, income: 0.5, unlocks: 'Racing chain + Hill boost' },
  { key: 'companionHub', icon: '📱', name: 'Companion Hub', cost: { coins: 420, rep: 16, tools: 28 }, income: 1.4, unlocks: 'Better offline + shop' }
];

export const UPGRADES = [
  { key: 'tapCrew', icon: '👆', name: 'Tap Boost Crew', description: '+tap power on idle routes and Hill GAS.', resource: 'coins', baseCost: 55, costRate: 1.30 },
  { key: 'idleDriver', icon: '🧑‍🔧', name: 'Idle Driver', description: '+idle meters and shop drip.', resource: 'coins', baseCost: 90, costRate: 1.33 },
  { key: 'routeScout', icon: '🗺️', name: 'Route Scout', description: '-heat, better stage rewards.', resource: 'rep', baseCost: 12, costRate: 1.32 },
  { key: 'fuelPlan', icon: '⛽', name: 'Fuel Planning', description: '+max fuel, cheaper Hill runs.', resource: 'parts', baseCost: 14, costRate: 1.32 },
  { key: 'pitKit', icon: '🛠️', name: 'Pit Kit', description: '+condition and Hill grip.', resource: 'scrap', baseCost: 10, costRate: 1.30 },
  { key: 'supplierShelf', icon: '📦', name: 'Supplier Shelf', description: '+merge shelf and board permit.', resource: 'tools', baseCost: 16, costRate: 1.34 }
];

export const BUILDINGS = [
  {
    key: 'partsStorage', icon: '🏚️', name: 'Parts Storage', max: 3,
    description: 'Increases merge board permit.',
    unlocks: 'More board capacity',
    costs: [{ coins: 80, parts: 12 }, { coins: 280, parts: 40, tools: 12 }, { coins: 900, parts: 100, tools: 45 }]
  },
  {
    key: 'tuningCorner', icon: '🔬', name: 'Tuning Corner', max: 2,
    description: 'Unlocks Performance Parts in Merge.',
    unlocks: 'Performance Parts chain',
    costs: [{ coins: 240, parts: 40, tools: 24 }, { coins: 1100, parts: 90, tools: 70, tune: 14 }]
  },
  {
    key: 'testTrack', icon: '🛣️', name: '2D Test Track', max: 2,
    description: 'Unlocks Racing Gear and stronger Hill Runs.',
    unlocks: 'Racing Gear + Hill boost',
    costs: [{ coins: 550, tune: 24, rep: 12 }, { coins: 1800, tune: 70, rep: 50 }]
  },
  {
    key: 'companionHub', icon: '📱', name: '365 Companion Hub', max: 3,
    description: 'Improves offline progress and shop income.',
    unlocks: 'Better offline + idle shop',
    costs: [{ coins: 420, rep: 16, tools: 28 }, { coins: 1300, rep: 55, tools: 65 }, { coins: 3500, rep: 140, tools: 140 }]
  }
];

export const PROBLEMS = {
  fuel: { icon: '⛽', label: 'Out of Fuel', description: 'Drive paused until fuel is restored.', fixes: [{ resource: 'fuelCans', amount: 1, label: 'Use Fuel Can' }, { resource: 'coins', amount: 50, label: 'Buy Fuel' }] },
  condition: { icon: '💨', label: 'Breakdown', description: 'Car condition is too low.', fixes: [{ resource: 'scrap', amount: 10, label: 'Patch Repair' }, { resource: 'parts', amount: 8, label: 'Replace Part' }] },
  heat: { icon: '🚨', label: 'Police Heat', description: 'Cool down before another run.', fixes: [{ resource: 'rep', amount: 8, label: 'Legal Event Permit' }, { resource: 'coins', amount: 80, label: 'Pay Ticket' }] },
  traffic: { icon: '🚧', label: 'Traffic Jam', description: 'Progress slowed. Clear the route.', fixes: [{ resource: 'coins', amount: 35, label: 'Reroute' }, { resource: 'tools', amount: 5, label: 'Traffic Crew' }] },
  flip: { icon: '🙃', label: 'Flipped on Hill', description: 'You over-revved the climb.', fixes: [{ resource: 'scrap', amount: 8, label: 'Roll it back' }, { resource: 'coins', amount: 40, label: 'Tow' }] }
};

export const DAILY_ORDERS = [
  { key: 'tap3', title: 'Boost a route 3 times', check: (s) => (s.daily.taps || 0) >= 3, reward: { coins: 40 } },
  { key: 'merge2', title: 'Merge 2 items', check: (s) => (s.daily.merges || 0) >= 2, reward: { parts: 6, coins: 25 } },
  { key: 'hill1', title: 'Finish one Hill Run', check: (s) => (s.daily.hills || 0) >= 1, reward: { fuelCans: 1, coins: 35 } },
  { key: 'collectLot', title: 'Collect from the lot', check: (s) => (s.daily.lotCollects || 0) >= 1, reward: { coins: 30 } }
];

export const CREATOR_RULES = [
  {
    mode: 'Connected companion',
    do: ['Lot Town, Idle Shop, Merge, and Drive share one wallet.', 'Keep rewards micro-sized.', 'Send players to 365motorsales.com.'],
    dont: ['Do not add live PVP.', 'Do not use manufacturer logos.', 'Do not pay real money prizes in v1.']
  }
];
