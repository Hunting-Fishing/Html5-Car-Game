import * as PIXI from 'pixi.js';
import { WORLD_ASSET_LIST, WORLD_ASSETS, buildingAssetForKey, personAnimationFramesForKey, personAssetForKey, vehicleAssetForKey } from '../data/worldAssetMap.js';
import { BUILD_COMMUNICATION_STORAGE_KEY, readBuildCommunicationState } from '../systems/buildCommunicationSystem.js';
import { Three3DCityViewport, VEHICLE_SPECS, getIntersectionLightState } from './worldThree3dCity.js';

const WORLD = { width: 960, height: 1720, startX: -210, startY: -75 };
const GRID = {
  size: 40,
  storageKey: '365_mobile_city_safe_buildings_v1',
  buildingStateKey: '365_mobile_city_safe_building_state_v2'
};
const ROADS = {
  width: 88,
  sidewalk: 36,
  laneOffset: 18,
  horizontal: [
    { y: 235, label: 'Dealer / Factory Ave' },
    { y: 545, label: 'Parts / Repair Row' },
    { y: 865, label: 'Salvage Way' },
    { y: 1195, label: 'Showcase Loop' }
  ],
  vertical: [
    { x: 245, label: 'West Service' },
    { x: 655, label: 'East Service' }
  ]
};

const BUILDING_CATALOG = [
  {
    key: 'streetKiosk',
    name: 'Street Kiosk',
    shortName: 'Kiosk',
    category: 'Route Dispatch',
    lineKey: 'streetRoute',
    footprintW: 1,
    footprintH: 1,
    cost: 50,
    upgradeCostBase: 65,
    restockCostBase: 18,
    repairCostBase: 14,
    owned: 4,
    colorA: 0x35e58a,
    colorB: 0x0f766e,
    happiness: 6,
    want: 'Quick express dispatches, driver snacks, and local street route orders',
    output: 'coins',
    outputLabel: 'Coins',
    secondaryOutput: 'parts',
    secondaryLabel: 'Parts',
    baseYield: 24,
    cycleMs: 90000,
    stockDrain: 8,
    bonus: 'Local order income & green-wave signal coordination',
    raceSkill: 'route',
    raceBuffLabel: 'Route Pace & Stage Coins',
    raceBuffDesc: 'Boosts Road Runner route speed & checkpoint coin payouts',
    mergeBuffLabel: 'Original Parts Shelf',
    mergeBuffDesc: 'Speeds up starter parts shelf recharge in Merge Bay',
    cityIssueKey: 'trafficLights',
    cityEffectLabel: 'Synchronizes street signals & eases intersection queues',
    maxLevel: 10
  },
  {
    key: 'tireRepair',
    name: 'Tire Repair Shop',
    shortName: 'Tire',
    category: 'Grip & Alignment',
    lineKey: 'fuelRun',
    footprintW: 2,
    footprintH: 2,
    cost: 150,
    upgradeCostBase: 95,
    restockCostBase: 24,
    repairCostBase: 20,
    owned: 3,
    colorA: 0xfacc15,
    colorB: 0xca8a04,
    happiness: 10,
    want: 'Fresh performance slicks, alloy rim repairs, and roadside flat service',
    output: 'parts',
    outputLabel: 'Parts',
    secondaryOutput: 'coins',
    secondaryLabel: 'Coins',
    baseYield: 18,
    cycleMs: 150000,
    stockDrain: 10,
    bonus: 'Tire grip, alignment precision & pothole protection',
    raceSkill: 'grip',
    raceBuffLabel: 'Tire Grip & Cornering',
    raceBuffDesc: 'Increases Road Runner traction & reduces pothole speed loss',
    mergeBuffLabel: 'Tire & Wheel Chain',
    mergeBuffDesc: 'Boosts wheel, rim & suspension crafting in Merge Bay',
    cityIssueKey: 'potholes',
    cityEffectLabel: 'Patches avenue potholes & prevents flat-tire breakdowns',
    maxLevel: 10
  },
  {
    key: 'privateShop',
    name: 'Private Repair Shop',
    shortName: 'Repair',
    category: 'Mechanical Service',
    lineKey: 'mobileMechanic',
    footprintW: 3,
    footprintH: 2,
    cost: 350,
    upgradeCostBase: 130,
    restockCostBase: 28,
    repairCostBase: 22,
    owned: 2,
    colorA: 0xa78bfa,
    colorB: 0x6d28d9,
    happiness: 14,
    want: 'Certified mechanics, hydraulic lifts, and full engine diagnostics',
    output: 'tools',
    outputLabel: 'Tools',
    secondaryOutput: 'coins',
    secondaryLabel: 'Coins',
    baseYield: 12,
    cycleMs: 210000,
    stockDrain: 12,
    bonus: 'Service bay speed, tool fabrication & breakdown defense',
    raceSkill: 'repair',
    raceBuffLabel: 'Durability & Pit Repair',
    raceBuffDesc: 'Protects car condition in Road Runner & lowers repair cost',
    mergeBuffLabel: 'Workbench Tool Yield',
    mergeBuffDesc: 'Generates bonus Shop Tools for Merge & Garage upgrades',
    cityIssueKey: 'vehicleBreakdowns',
    cityEffectLabel: 'Dispatches mobile mechanics to clear street breakdowns',
    maxLevel: 10
  },
  {
    key: 'partsWarehouse',
    name: 'Parts Warehouse',
    shortName: 'Parts WH',
    category: 'Supply Logistics',
    lineKey: 'partsDelivery',
    footprintW: 4,
    footprintH: 3,
    cost: 750,
    upgradeCostBase: 165,
    restockCostBase: 32,
    repairCostBase: 26,
    owned: 1,
    colorA: 0x2dd4bf,
    colorB: 0x0891b2,
    happiness: 16,
    want: 'High-bay pallet racks, turbo crates, and express freight loading docks',
    output: 'parts',
    outputLabel: 'Bulk Parts',
    secondaryOutput: 'tools',
    secondaryLabel: 'Tools',
    baseYield: 44,
    cycleMs: 300000,
    stockDrain: 16,
    bonus: 'Bulk parts reserves & city-wide restock efficiency',
    raceSkill: 'parts',
    raceBuffLabel: 'Crate Parts Multiplier',
    raceBuffDesc: 'Increases parts earned from Road Runner race stages',
    mergeBuffLabel: 'Parts Bin Capacity',
    mergeBuffDesc: 'Boosts high-tier engine & turbo merges in Merge Bay',
    cityIssueKey: 'potholes',
    cityEffectLabel: 'Keeps all city repair bays & kiosks stocked with parts',
    maxLevel: 12
  },
  {
    key: 'dealerShowroom',
    name: 'Dealer Showroom',
    shortName: 'Dealer',
    category: 'VIP Dealership',
    lineKey: 'dealerShowcase',
    footprintW: 3,
    footprintH: 2,
    cost: 900,
    upgradeCostBase: 185,
    restockCostBase: 35,
    repairCostBase: 25,
    owned: 1,
    colorA: 0x60a5fa,
    colorB: 0x2563eb,
    happiness: 18,
    want: 'Illuminated showroom turntables, JDM/Supercar displays & VIP buyers',
    output: 'rep',
    outputLabel: 'Rep',
    secondaryOutput: 'coins',
    secondaryLabel: 'Coins',
    baseYield: 20,
    cycleMs: 360000,
    stockDrain: 10,
    bonus: 'City reputation, VIP buyer traffic & stage prestige',
    raceSkill: 'sales',
    raceBuffLabel: 'VIP Race Payout & Rep',
    raceBuffDesc: 'Increases stage finish Coin & Reputation multipliers',
    mergeBuffLabel: 'Customer Order Bonus',
    mergeBuffDesc: 'Increases coin & trophy rewards on completed Merge orders',
    cityIssueKey: 'trafficJams',
    cityEffectLabel: 'Attracts high-value VIP traffic & boosts city prestige',
    maxLevel: 12
  },
  {
    key: 'salvageBlock',
    name: 'Salvage Yard Block',
    shortName: 'Salvage',
    category: 'Heavy Recovery',
    lineKey: 'towingJob',
    footprintW: 5,
    footprintH: 4,
    cost: 1200,
    upgradeCostBase: 195,
    restockCostBase: 30,
    repairCostBase: 24,
    owned: 1,
    colorA: 0xf97316,
    colorB: 0x9a3412,
    happiness: 12,
    want: 'Crusher cranes, chassis stripping bays, and heavy alloy recycling',
    output: 'scrap',
    outputLabel: 'Scrap',
    secondaryOutput: 'parts',
    secondaryLabel: 'Parts',
    baseYield: 38,
    cycleMs: 390000,
    stockDrain: 14,
    bonus: 'Scrap recovery & -15% city building repair discounts',
    raceSkill: 'tow',
    raceBuffLabel: 'Salvage & Recovery Yield',
    raceBuffDesc: 'Awards bonus scrap & parts after every Road Runner run',
    mergeBuffLabel: 'Chassis & Body Salvage',
    mergeBuffDesc: 'Feeds reclaimed metal & body panels to the workshop',
    cityIssueKey: 'stuckVehicles',
    cityEffectLabel: 'Processes impounded wrecks & clears blocked lanes',
    maxLevel: 12
  },
  {
    key: 'towDispatch',
    name: 'Tow Dispatch',
    shortName: 'Tow',
    category: 'Emergency Wrecker',
    lineKey: 'towingJob',
    footprintW: 2,
    footprintH: 2,
    cost: 650,
    upgradeCostBase: 145,
    restockCostBase: 26,
    repairCostBase: 20,
    owned: 0,
    colorA: 0xf59e0b,
    colorB: 0x92400e,
    happiness: 12,
    want: '24/7 heavy wreckers, radar dispatch, and rapid lane clearance',
    output: 'scrap',
    outputLabel: 'Tow Scrap',
    secondaryOutput: 'coins',
    secondaryLabel: 'Coins',
    baseYield: 26,
    cycleMs: 240000,
    stockDrain: 12,
    bonus: 'Rapid breakdown response & emergency tow bounties',
    raceSkill: 'tow',
    raceBuffLabel: 'Heavy Tow & Recovery',
    raceBuffDesc: 'Prevents DNF penalties & boosts roadside scrap recovery',
    mergeBuffLabel: 'Recovery Winch Parts',
    mergeBuffDesc: 'Unlocks heavy-duty truck & off-road parts in Merge Bay',
    cityIssueKey: 'vehicleBreakdowns',
    cityEffectLabel: 'Rapidly tows smoking broken-down vehicles off avenues',
    maxLevel: 10
  },
  {
    key: 'testTrack',
    name: 'Mini Test Track',
    shortName: 'Track',
    category: 'Motorsport & Dyno',
    lineKey: 'fuelRun',
    footprintW: 4,
    footprintH: 2,
    cost: 1100,
    upgradeCostBase: 175,
    restockCostBase: 30,
    repairCostBase: 22,
    owned: 0,
    colorA: 0x22c55e,
    colorB: 0x14532d,
    happiness: 16,
    want: 'High-grip apex loops, race fuel rigs, and live ECU dyno telemetry',
    output: 'rep',
    outputLabel: 'Race Rep',
    secondaryOutput: 'fuelCans',
    secondaryLabel: 'Fuel',
    baseYield: 30,
    cycleMs: 270000,
    stockDrain: 9,
    bonus: 'Dyno telemetry, race rep & high-octane fuel efficiency',
    raceSkill: 'fuel',
    raceBuffLabel: 'Top Speed & Fuel Tech',
    raceBuffDesc: 'Boosts Road Runner boost power & reduces fuel burn',
    mergeBuffLabel: 'Pro Motorsport Tuning',
    mergeBuffDesc: 'Accelerates ECU & performance tuning merges',
    cityIssueKey: 'trafficJams',
    cityEffectLabel: 'Keeps street racers on the track & improves avenue flow',
    maxLevel: 10
  },
  {
    key: 'garage',
    name: '365 Flagship Garage',
    shortName: '365 Garage',
    category: 'Flagship HQ & Tuning',
    lineKey: 'streetRoute',
    coreHubOnly: true,
    footprintW: 4,
    footprintH: 3,
    cost: 1000,
    upgradeCostBase: 140,
    restockCostBase: 25,
    repairCostBase: 20,
    owned: 0,
    colorA: 0x38bdf8,
    colorB: 0x0284c7,
    happiness: 20,
    want: 'Twin hydraulic lifts, pro dyno bay, custom builds & 365 command HQ',
    output: 'coins',
    outputLabel: 'Coins',
    secondaryOutput: 'tools',
    secondaryLabel: 'Tools',
    baseYield: 36,
    cycleMs: 120000,
    stockDrain: 9,
    bonus: 'Command HQ: boosts all connected 365 Garage bays, Race tuning & Route income',
    raceSkill: 'race',
    raceBuffLabel: '365 Pro Tune & Speed',
    raceBuffDesc: 'Directly increases Road Runner top speed, acceleration & coin payout',
    mergeBuffLabel: 'Master Workshop Bay',
    mergeBuffDesc: 'Boosts all 365 Garage Floor rooms & Merge Bay craft speed',
    cityIssueKey: 'vehicleBreakdowns',
    cityEffectLabel: 'Anchors the city service network & raises all resident morale',
    maxLevel: 12
  },
  {
    key: 'partsHub',
    name: '365 Parts & Merge Hub',
    shortName: 'Parts Hub',
    category: 'Crafting & Logistics HQ',
    lineKey: 'partsDelivery',
    coreHubOnly: true,
    footprintW: 4,
    footprintH: 3,
    cost: 950,
    upgradeCostBase: 150,
    restockCostBase: 26,
    repairCostBase: 20,
    owned: 0,
    colorA: 0x2dd4bf,
    colorB: 0x0d9488,
    happiness: 18,
    want: 'Automated parts sorters, twin-turbo crate assembly & Merge Bay link',
    output: 'parts',
    outputLabel: 'Pro Parts',
    secondaryOutput: 'tools',
    secondaryLabel: 'Tools',
    baseYield: 40,
    cycleMs: 180000,
    stockDrain: 11,
    bonus: 'Logistics HQ: supplies Merge Bay generators & reduces restock costs across town',
    raceSkill: 'parts',
    raceBuffLabel: 'Performance Parts Drop',
    raceBuffDesc: 'Increases rare parts & upgrade crate drops in Road Runner',
    mergeBuffLabel: 'Merge Bay Overclock',
    mergeBuffDesc: 'Directly speeds up Merge Bay supplier shelf & part tiers',
    cityIssueKey: 'trafficLights',
    cityEffectLabel: 'Powers automated smart-traffic sensors & parts couriers',
    maxLevel: 12
  }
];

const FIXED_BUILDINGS = [
  { x: 60, y: 84, w: 3, h: 3, type: 'dealerShowroom', label: 'Dealer Showcase', action: 'lines', lineKey: 'dealerShowcase' },
  { x: 430, y: 78, w: 4, h: 3, type: 'garage', label: '365 Garage', action: 'garage', lineKey: 'streetRoute' },
  { x: 60, y: 385, w: 3, h: 3, type: 'streetKiosk', label: 'Parts Delivery', action: 'lines', lineKey: 'partsDelivery' },
  { x: 430, y: 385, w: 4, h: 3, type: 'partsHub', label: 'Parts Hub', action: 'merge', lineKey: 'partsDelivery' },
  { x: 775, y: 385, w: 3, h: 3, type: 'privateShop', label: 'Mobile Mechanic', action: 'lines', lineKey: 'mobileMechanic' },
  { x: 60, y: 710, w: 3, h: 3, type: 'salvageBlock', label: 'Towing Yard', action: 'lines', lineKey: 'towingJob' },
  { x: 775, y: 710, w: 3, h: 3, type: 'towDispatch', label: 'Tow Dispatch', action: 'lines', lineKey: 'towingJob' },
  { x: 60, y: 1040, w: 3, h: 3, type: 'partsWarehouse', label: 'Parts Warehouse', action: 'lines', lineKey: 'partsDelivery' },
  { x: 770, y: 1040, w: 3, h: 3, type: 'testTrack', label: 'Fuel Run', action: 'lines', lineKey: 'fuelRun' }
];

const CITY_BUILDINGS = [
  ...FIXED_BUILDINGS,
  { x: 430, y: 710, w: 3, h: 3, type: 'tireRepair', label: 'Fuel Stop', action: 'lines', lineKey: 'fuelRun' }
];

const TOWN_EXPANSION_STORAGE_KEY = '365_mobile_city_unlocked_plots_v1';
const TOWN_EXPANSION_PLOTS = [
  { id: 'harborPier', name: 'Harbor Import Pier', x: 755, y: 40, w: 185, h: 145, cost: 250, bonus: '+15% Asian JDM Import Speed', color: 0x38bdf8, defaultUnlocked: false },
  { id: 'techLogistics', name: '365 Tech Annex', x: 350, y: 1020, w: 280, h: 130, cost: 350, bonus: '+20% Parts Hub Capacity', color: 0x35e58a, defaultUnlocked: false },
  { id: 'salvageAnnex', name: 'South Salvage Annex', x: 32, y: 1325, w: 195, h: 165, cost: 450, bonus: '+25% Tow Recovery & Scrap', color: 0xf97316, defaultUnlocked: false },
  { id: 'autoMallPlaza', name: 'VIP Auto Mall Plaza', x: 355, y: 1325, w: 275, h: 165, cost: 650, bonus: '+25% Dealer Showroom Rep', color: 0xa855f7, defaultUnlocked: false },
  { id: 'motorsportPark', name: 'Pro Motorsport Park', x: 755, y: 1325, w: 185, h: 165, cost: 900, bonus: '+30% Track Dyno Telemetry', color: 0xfacc15, defaultUnlocked: false }
];

const SUPPLY_MANAGERS = [
  {
    key: 'driver',
    lineKey: 'streetRoute',
    crewId: 'crew-001',
    crewName: 'Maya Lin',
    name: 'Route Driver',
    jobTitle: 'Lead Route Driver',
    desk: 'Street Route · 365 Garage',
    business: 'Street Route',
    building: 'garage365',
    menuLabel: '365 Garage & Route hubs',
    want: 'Keep 365 Garage stocked and street signals green so Street Route runs fast.',
    factors: ['trafficJams', 'trafficLights', 'mapBuild'],
    hireCostCoins: 80,
    salaryCoins: 12,
    primarySkill: 'route',
    skills: [
      { key: 'route', label: 'Route Pace', base: 44 },
      { key: 'race', label: 'Street Speed', base: 38 },
      { key: 'fuel', label: 'Fuel Econ', base: 31 }
    ],
    raceEffectLabel: 'Idle Route Speed & Coin Payout',
    mergeEffectLabel: 'Original Parts Shelf Speed',
    shirt: 0xf6c445
  },
  {
    key: 'courier',
    lineKey: 'partsDelivery',
    crewId: 'crew-002',
    crewName: 'Jaxon Cole',
    name: 'Parts Courier',
    jobTitle: 'Express Parts Courier',
    desk: 'Parts Delivery · Parts Hub',
    business: 'Parts Delivery',
    building: 'partsWarehouse',
    menuLabel: 'Parts supply buildings',
    want: 'Keep Parts Hub shelves stocked and clear delivery lanes for workshop runs.',
    factors: ['trafficJams', 'stuckVehicles', 'mapBuild'],
    hireCostCoins: 90,
    salaryCoins: 14,
    primarySkill: 'parts',
    skills: [
      { key: 'parts', label: 'Parts Logistics', base: 48 },
      { key: 'route', label: 'Route Pace', base: 36 },
      { key: 'grip', label: 'Load Grip', base: 29 }
    ],
    raceEffectLabel: 'Delivery Run Parts Bonus',
    mergeEffectLabel: 'Parts Bin Generator Yield',
    shirt: 0x16a34a
  },
  {
    key: 'mechanic',
    lineKey: 'mobileMechanic',
    crewId: 'crew-003',
    crewName: 'Elena Vance',
    name: 'Mobile Tech',
    jobTitle: 'Chief Mobile Mechanic',
    desk: 'Mobile Mechanic · Repair Shop',
    business: 'Mobile Mechanic',
    building: 'privateShop',
    menuLabel: 'Repair shop buildings',
    want: 'Upgrade Repair Shops and supply toolkits to fix roadside breakdowns.',
    factors: ['vehicleBreakdowns', 'potholes', 'mapBuild'],
    hireCostCoins: 105,
    salaryCoins: 15,
    primarySkill: 'repair',
    skills: [
      { key: 'repair', label: 'Field Repair', base: 50 },
      { key: 'parts', label: 'Tool Prep', base: 38 },
      { key: 'grip', label: 'Chassis Tune', base: 33 }
    ],
    raceEffectLabel: 'Condition Protection & Pit Fix',
    mergeEffectLabel: 'Workbench Shop Tools Crafting',
    shirt: 0x38bdf8
  },
  {
    key: 'racer',
    lineKey: 'fuelRun',
    crewId: 'crew-004',
    crewName: 'Marcus Sterling',
    name: 'Fuel Runner',
    jobTitle: 'Pro Fuel & Pace Runner',
    desk: 'Fuel Run · 2D Test Track',
    business: 'Fuel Run',
    building: 'testTrack',
    menuLabel: 'Test Track & Fuel bays',
    want: 'Keep Test Track active and fuel reserves full for Road Runner stages.',
    factors: ['potholes', 'trafficLights', 'mapBuild'],
    hireCostCoins: 115,
    salaryCoins: 16,
    primarySkill: 'fuel',
    skills: [
      { key: 'fuel', label: 'Fuel Tech', base: 47 },
      { key: 'race', label: 'Track Pace', base: 45 },
      { key: 'grip', label: 'Apex Grip', base: 35 }
    ],
    raceEffectLabel: 'Fuel Burn Reduction & Boost Power',
    mergeEffectLabel: 'Shop Fluids & Race Gear Yield',
    shirt: 0xf59e0b
  },
  {
    key: 'towOperator',
    lineKey: 'towingJob',
    crewId: 'crew-005',
    crewName: 'Kendra Shaw',
    name: 'Tow Operator',
    jobTitle: 'Heavy Recovery Operator',
    desk: 'Towing Job · Tow Dispatch',
    business: 'Towing Job',
    building: 'towDispatch',
    menuLabel: 'Tow and recovery buildings',
    want: 'Keep Tow Dispatch fueled and ready so broken-down cars never block the avenue.',
    factors: ['vehicleBreakdowns', 'stuckVehicles', 'trafficJams'],
    hireCostCoins: 120,
    salaryCoins: 18,
    primarySkill: 'tow',
    skills: [
      { key: 'tow', label: 'Heavy Tow', base: 52 },
      { key: 'repair', label: 'Salvage Fix', base: 40 },
      { key: 'route', label: 'Dispatch Route', base: 34 }
    ],
    raceEffectLabel: 'Roadside Recovery & Scrap Yield',
    mergeEffectLabel: 'Body Shop & Salvage Parts',
    shirt: 0xf97316
  },
  {
    key: 'salesRep',
    lineKey: 'dealerShowcase',
    crewId: 'crew-006',
    crewName: 'Devon Brooks',
    name: 'Sales Rep',
    jobTitle: 'Executive Showroom Rep',
    desk: 'Dealer Showcase · Showroom',
    business: 'Dealer Showcase',
    building: 'dealerShowroom',
    menuLabel: 'Showroom buildings',
    want: 'Keep Dealer Showroom stocked with display cars to grow 365 City Reputation.',
    factors: ['trafficJams', 'trafficLights', 'mapBuild'],
    hireCostCoins: 135,
    salaryCoins: 20,
    primarySkill: 'sales',
    skills: [
      { key: 'sales', label: 'VIP Sales', base: 54 },
      { key: 'race', label: 'Showcase Pace', base: 36 },
      { key: 'route', label: 'Buyer Reach', base: 32 }
    ],
    raceEffectLabel: 'Showcase Rep & Stage Multiplier',
    mergeEffectLabel: 'Cabin & Customer Order Payout',
    shirt: 0x7c3aed
  }
];

const RESIDENT_WANTS = [
  {
    key: 'residentBlue',
    crewId: 'crew-009',
    crewName: 'Chloe Bennett',
    name: 'Mia',
    jobTitle: 'Tire & Grip Specialist',
    desk: 'Tire Repair Desk',
    business: 'Performance Bay',
    lineKeyRef: 'performanceBay',
    want: 'I want a tire shop closer to this block.',
    building: 'tireRepair',
    menuLabel: 'Tire repair buildings',
    factors: ['potholes', 'trafficLights', 'mapBuild'],
    hireCostCoins: 75,
    salaryCoins: 10,
    primarySkill: 'grip',
    skills: [
      { key: 'grip', label: 'Tire Grip', base: 45 },
      { key: 'repair', label: 'Rim Repair', base: 35 },
      { key: 'race', label: 'Cornering', base: 30 }
    ],
    raceEffectLabel: 'Tire Grip & Less Road Wear',
    mergeEffectLabel: 'Tire Station & Racing Chain'
  },
  {
    key: 'residentGreen',
    crewId: 'crew-010',
    crewName: "Liam O'Connor",
    name: 'Jay',
    jobTitle: 'Warehouse Parts Clerk',
    desk: 'Parts Desk',
    business: 'Parts Delivery',
    lineKeyRef: 'partsDelivery',
    want: 'I want the parts warehouse restocked.',
    building: 'partsWarehouse',
    menuLabel: 'Parts supply buildings',
    factors: ['trafficJams', 'stuckVehicles', 'mapBuild'],
    hireCostCoins: 80,
    salaryCoins: 11,
    primarySkill: 'parts',
    skills: [
      { key: 'parts', label: 'Stock Inventory', base: 47 },
      { key: 'route', label: 'Dock Dispatch', base: 33 },
      { key: 'sales', label: 'Order Fill', base: 28 }
    ],
    raceEffectLabel: 'Parts Delivery Route Yield',
    mergeEffectLabel: 'Parts Bin & Original Chain'
  },
  {
    key: 'residentOrange',
    crewId: 'crew-011',
    crewName: 'Zoe Ramirez',
    name: 'Nico',
    jobTitle: 'Street Traffic & Tune Scout',
    desk: 'Street Watch Desk',
    business: 'Street Route',
    lineKeyRef: 'streetRoute',
    want: 'I want a repair shop before traffic gets worse.',
    building: 'privateShop',
    menuLabel: 'Repair buildings',
    factors: ['potholes', 'vehicleBreakdowns', 'trafficJams'],
    hireCostCoins: 85,
    salaryCoins: 12,
    primarySkill: 'route',
    skills: [
      { key: 'route', label: 'Traffic Scout', base: 44 },
      { key: 'repair', label: 'Quick Tune', base: 37 },
      { key: 'race', label: 'Street Sprint', base: 34 }
    ],
    raceEffectLabel: 'Lower Police Heat & Idle Speed',
    mergeEffectLabel: 'Diagnostic Bench & ECU Tune'
  },
  {
    key: 'residentPurple',
    crewId: 'crew-012',
    crewName: 'Noah Takahashi',
    name: 'Ari',
    jobTitle: 'VIP Showroom Host',
    desk: 'Showroom Floor',
    business: 'Dealer Showcase',
    lineKeyRef: 'dealerShowcase',
    want: 'I want more cars in the dealer showroom.',
    building: 'dealerShowroom',
    menuLabel: 'Showroom buildings',
    factors: ['trafficJams', 'trafficLights', 'mapBuild'],
    hireCostCoins: 90,
    salaryCoins: 13,
    primarySkill: 'sales',
    skills: [
      { key: 'sales', label: 'Showroom Pitch', base: 49 },
      { key: 'race', label: 'Demo Drive', base: 32 },
      { key: 'grip', label: 'Spec Polish', base: 29 }
    ],
    raceEffectLabel: 'Dealer Showcase Rep Bonus',
    mergeEffectLabel: 'VIP Customer Delivery Bonus'
  },
  {
    key: 'mechanic',
    crewId: 'crew-013',
    crewName: 'Sadie Morales',
    name: 'Rae',
    jobTitle: 'Tool Crib & Work Order Tech',
    desk: 'Tool Crib Desk',
    business: 'Mobile Mechanic',
    lineKeyRef: 'mobileMechanic',
    want: 'I want tools and work orders from upgraded shops.',
    building: 'streetKiosk',
    menuLabel: 'Work order buildings',
    factors: ['vehicleBreakdowns', 'potholes', 'mapBuild'],
    hireCostCoins: 85,
    salaryCoins: 12,
    primarySkill: 'repair',
    skills: [
      { key: 'repair', label: 'Wrench Mastery', base: 48 },
      { key: 'parts', label: 'Tool Crib', base: 38 },
      { key: 'tow', label: 'Field Assist', base: 29 }
    ],
    raceEffectLabel: 'Cheaper Pit Fixes & Reliability',
    mergeEffectLabel: 'Workbench & Garage Build Speed'
  },
  {
    key: 'driver',
    crewId: 'crew-014',
    crewName: 'Caleb Wright',
    name: 'Sol',
    jobTitle: 'Recovery Dispatch Spotter',
    desk: 'Tow Desk',
    business: 'Towing Job',
    lineKeyRef: 'towingJob',
    want: 'I want tow dispatch ready when cars break down.',
    building: 'towDispatch',
    menuLabel: 'Tow and recovery buildings',
    factors: ['vehicleBreakdowns', 'stuckVehicles', 'trafficJams'],
    hireCostCoins: 90,
    salaryCoins: 12,
    primarySkill: 'tow',
    skills: [
      { key: 'tow', label: 'Recovery Spotter', base: 46 },
      { key: 'fuel', label: 'Emergency Fuel', base: 36 },
      { key: 'route', label: 'Lane Clearing', base: 33 }
    ],
    raceEffectLabel: 'Rough Road & Tow Event Bonus',
    mergeEffectLabel: 'Salvage & Electrical Chain'
  }
];


function residentTree({ problem, ask, personal, favor, cold, rumor, stake }) {
  return {
    greet: {
      text: problem,
      topic: 'Start',
      choices: [
        { id: 'help', label: 'What do you need?', next: 'ask' },
        { id: 'rumor', label: 'Heard anything?', next: 'rumor' },
        { id: 'trade', label: 'Want to trade?', next: 'trade' },
        { id: 'personal', label: 'How are you holding up?', next: 'personal' },
        { id: 'later', label: 'Not now', next: 'brush' }
      ]
    },
    ask: {
      text: ask,
      choices: [
        { id: 'shops', label: 'Open Supplies', screen: 'lines', next: 'sent' },
        { id: 'more', label: 'Tell me the rest', next: 'more' },
        { id: 'back', label: 'Back', next: 'greet' }
      ]
    },
    more: {
      text: personal,
      choices: [
        { id: 'help', label: 'I will handle it', next: 'favor' },
        { id: 'garage', label: 'Open Garage', screen: 'garage', next: 'sent' },
        { id: 'back', label: 'Back', next: 'ask' }
      ]
    },
    personal: {
      text: personal,
      friend: 'You have shown up before. I can tell you the part I do not tell strangers.',
      partner: 'You are one of us. Skip the small talk. The favor is yours.',
      choices: [
        { id: 'help', label: 'I am listening', next: 'favor' },
        { id: 'secret', label: 'Ask for a favor', next: 'secret', need: 40 },
        { id: 'back', label: 'Back', next: 'greet' }
      ]
    },
    favor: {
      text: favor,
      choices: [
        { id: 'shops', label: 'Open Supplies', screen: 'lines', next: 'sent' },
        { id: 'race', label: 'I have a race first', screen: 'race', next: 'brush' },
        { id: 'back', label: 'Back', next: 'greet' }
      ]
    },
    secret: {
      text: favor,
      partner: 'Because it is you, I will keep watch on this block while you are gone.',
      choices: [
        { id: 'shops', label: 'Open Supplies', screen: 'lines', next: 'sent' },
        { id: 'back', label: 'Thanks', next: 'greet' }
      ]
    },
    locked: {
      text: 'Not yet. Help the block a little and ask me again.',
      choices: [{ id: 'back', label: 'Fair', next: 'personal' }]
    },
    sent: {
      text: 'I will be on this sidewalk when you get back.',
      choices: [
        { id: 'back', label: 'Keep talking', next: 'greet' },
        { id: 'close', label: 'See you', screen: 'close' }
      ]
    },
    brush: {
      text: cold,
      choices: [
        { id: 'back', label: 'Sorry. Go on.', next: 'greet' },
        { id: 'close', label: 'Later', screen: 'close' }
      ]
    },
    trade: {
      text: 'Here is what I am carrying, and what I will take off your hands.',
      topic: 'Trade',
      choices: [{ id: 'back', label: 'Back to the talk', next: 'greet' }]
    },
    rumor: {
      text: rumor,
      topic: 'Rumor',
      choices: [
        { id: 'help', label: 'Who is behind it?', next: 'stake' },
        { id: 'city', label: 'What does the city say?', next: 'city', need: 35, needKind: 'rep' },
        { id: 'back', label: 'Back', next: 'greet' }
      ]
    },
    stake: {
      text: stake,
      topic: 'Rumor',
      choices: [
        { id: 'help', label: 'I will look into it', next: 'favor' },
        { id: 'trade', label: 'Show me your stock', next: 'trade' },
        { id: 'back', label: 'Back', next: 'rumor' }
      ]
    },
    city: {
      text: 'Your name is getting around. Do not spend it on an empty promise.',
      topic: 'City',
      friend: 'They know you here. If you fix this, I will say it was you.',
      partner: 'You are the name they trust. I will tell the block you handled it.',
      choices: [
        { id: 'help', label: 'Then I will handle it', next: 'favor' },
        { id: 'back', label: 'Back', next: 'rumor' }
      ]
    },
    repLocked: {
      text: 'The block does not know you well enough for that story. Raise your city name first.',
      topic: 'Locked',
      choices: [{ id: 'back', label: 'Fair', next: 'rumor' }]
    }
  };
}

const NPC_DIALOGUE = {
  residentBlue: residentTree({
    problem: 'My tires keep popping on this block. A closer tire shop would save the rims.',
    ask: 'Restock the tire shop. The potholes are eating the rubber.',
    personal: 'I drive this street every morning. One more flat and I am walking to work.',
    favor: 'If the tire shop stays stocked, I will send the neighbors there instead of cursing the road.',
    cold: 'Fine. Do not leave me stranded when the next one blows.',
    rumor: 'Someone said the tire truck skipped this block again. The flats are not an accident.',
    stake: 'The parts courier knows who held the delivery. Ask around the warehouse, not the drivers.'
  }),
  residentGreen: residentTree({
    problem: 'The parts warehouse is thin. Deliveries stall when the shelves go empty.',
    ask: 'Bring parts in. The courier cannot move shops on an empty shelf.',
    personal: 'I count boxes for a living. Today the count is embarrassing.',
    favor: 'Keep Parts Delivery running and I will stop flagging you down about it.',
    cold: 'Then the next repair waits on a box that is not here.',
    rumor: 'A whole pallet was marked delivered and never hit the shelf.',
    stake: 'The mobile mechanic signed for it. Either the tools ate the parts, or the paper is a lie.'
  }),
  residentOrange: residentTree({
    problem: 'Traffic is stacking up. We need a repair shop before the next breakdown.',
    ask: 'A working bay clears the street faster than another horn.',
    personal: 'I have been stuck behind the same dead car twice this week.',
    favor: 'Upgrade the repair shop. I will stop waving people into the jam.',
    cold: 'Race if you want. Just come back before this lane locks up.',
    rumor: 'The jam is not random. The same car dies in the same lane after lunch.',
    stake: 'Tow dispatch has the plate. They will not roll until the yard has fuel and a driver.'
  }),
  residentPurple: residentTree({
    problem: 'The showroom looks empty from the sidewalk. Buyers walk past.',
    ask: 'Put cars on the dealer showcase. An empty lot does not get a second look.',
    personal: 'I sell the idea of a car before anyone sits in it. I cannot sell a blank row.',
    favor: 'Fill the showcase and I will walk buyers over myself.',
    cold: 'They will not come back. An empty lot stays empty.',
    rumor: 'A buyer with cash asked for a car this morning and left because the row was bare.',
    stake: 'The sales rep still has the name. One car on the showcase and I can call them back.'
  }),
  mechanic: residentTree({
    problem: 'I have work orders and no tools. Upgrade the shops or I am standing around.',
    ask: 'Toolkits come from the mobile mechanic. Without them the orders sit.',
    personal: 'I can fix the car. I cannot invent a wrench.',
    favor: 'Stock the tools and I will clear the work orders on this block.',
    cold: 'Then I will keep standing here with a list and nothing to turn.',
    rumor: 'Three work orders are for the same car. Somebody is putting it back on the road half fixed.',
    stake: 'It is a garage job, not a sidewalk job. Open the bay and I will stop pretending a wrench will appear.'
  }),
  driver: residentTree({
    problem: 'Cars die in the lane and nobody tows them. Dispatch has to be ready.',
    ask: 'Hire the tow operator and keep the yard stocked.',
    personal: 'I drive around them until I am the one stuck behind them.',
    favor: 'Keep tow dispatch ready and I will stop laying on the horn.',
    cold: 'Drive around them, then. Until you are the one boxed in.',
    rumor: 'The last tow made it two blocks and quit. Out of fuel, not out of road.',
    stake: 'Fuel Run has the cans. Dispatch has the truck. Neither moves until you say so.'
  })
};

const npcStep = {};
const relationshipCache = {};
const tradeCache = {};
const purseCache = {};
const spentBond = new Set();
let lastBondNote = '';
let lastReputationDelta = 0;

const CITY_PROBLEM_DEFS = {
  mapBuild: { label: 'Built Map', type: 'streetKiosk', types: [], help: 'More placed services make the city feel complete.' },
  vehicleBreakdowns: { label: 'Breakdowns', type: 'towDispatch', types: ['towDispatch', 'tireRepair', 'privateShop'], help: 'Tow, tire, and repair health reduce breakdown stress.' },
  stuckVehicles: { label: 'Stuck Vehicles', type: 'towDispatch', types: ['towDispatch', 'privateShop', 'tireRepair'], help: 'Tow dispatch stock and repair coverage clears stuck traffic.' },
  potholes: { label: 'Potholes', type: 'privateShop', types: ['privateShop', 'tireRepair', 'partsWarehouse'], help: 'Repair shops, tire shops, and stocked parts keep roads patched.' },
  trafficJams: { label: 'Traffic Jams', type: 'streetKiosk', types: ['streetKiosk', 'towDispatch', 'dealerShowroom', 'testTrack'], help: 'Traffic flow improves when roads, lights, and stuck cars are handled.' },
  trafficLights: { label: 'Traffic Lights', type: 'privateShop', types: ['privateShop', 'streetKiosk', 'partsWarehouse'], help: 'Street service and repair crews keep lights working.' }
};

let app = null;
let threeViewport = null;
let mountedHost = null;
let world = null;
let traffic = [];
let walkers = [];
let selectedSupplyKey = null;
let placedBuildings = [];
let fixedBuildingStates = {};
let unlockedTownPlots = {};
let fixedLayer = null;
let placementLayer = null;
let expansionLayer = null;
let incidentLayer = null;
let gridLayer = null;
let ghostLayer = null;
let mode = 'normal';
let selectedKey = 'streetKiosk';
let selectedRotation = 0;
let pendingPlacement = null;
let movingBuilding = null;
let selectedPlacedId = null;
let selectedBuildingTarget = null;
let selectedResidentKey = null;
let selectedResidentMenu = 'mood';
let selectedVehicleItem = null;
let dragMoved = false;
let initialized = false;
let pixiWorldAssetsLoaded = false;
let buildSync = null;
let statusRefreshTimer = 0;

function loadTownExpansions() {
  try {
    unlockedTownPlots = JSON.parse(localStorage.getItem(TOWN_EXPANSION_STORAGE_KEY) || '{}');
  } catch {
    unlockedTownPlots = {};
  }
  for (const plot of TOWN_EXPANSION_PLOTS) {
    if (typeof unlockedTownPlots[plot.id] !== 'boolean') {
      unlockedTownPlots[plot.id] = Boolean(plot.defaultUnlocked);
    }
  }
  saveTownExpansions();
}

function saveTownExpansions() {
  localStorage.setItem(TOWN_EXPANSION_STORAGE_KEY, JSON.stringify(unlockedTownPlots));
}

function isPlotUnlocked(plotId) {
  return Boolean(unlockedTownPlots[plotId]);
}

function unlockedPlotCount() {
  return TOWN_EXPANSION_PLOTS.filter((p) => isPlotUnlocked(p.id)).length;
}

function normalizeBuildingKey(key) {
  if (key === 'garage365') return 'garage';
  return key || 'streetKiosk';
}

function defByKey(key) {
  const norm = normalizeBuildingKey(key);
  return BUILDING_CATALOG.find((item) => item.key === norm) || BUILDING_CATALOG[0];
}

function placeableBuildingCatalog() {
  return BUILDING_CATALOG.filter((item) => !item.coreHubOnly);
}

const BUILDING_WORK_MODES = {
  standard: {
    key: 'standard',
    label: 'Balanced Ops',
    shortLabel: 'Balanced',
    icon: '⚖️',
    yieldMult: 1.0,
    cycleMult: 1.0,
    drainAdd: 0,
    modeBuffMult: 1.0,
    happinessAdd: 0,
    desc: 'Standard production cycle & normal stock drain'
  },
  overdrive: {
    key: 'overdrive',
    label: 'Turbo Overdrive',
    shortLabel: 'Overdrive',
    icon: '🔥',
    yieldMult: 1.22,
    cycleMult: 0.75,
    drainAdd: 4,
    modeBuffMult: 1.15,
    happinessAdd: 2,
    desc: '-25% faster cycle & +22% yield (+4% stock drain)'
  },
  vip: {
    key: 'vip',
    label: 'VIP Quality',
    shortLabel: 'VIP Spec',
    icon: '👑',
    yieldMult: 1.32,
    cycleMult: 1.05,
    drainAdd: 2,
    modeBuffMult: 1.50,
    happinessAdd: 5,
    desc: '+32% yield, +50% Race/Merge/City buffs & +5 Happiness'
  }
};

function buildingWorkMode(item) {
  const modeKey = item?.workMode || 'standard';
  return BUILDING_WORK_MODES[modeKey] || BUILDING_WORK_MODES.standard;
}

function selectedDef() {
  return defByKey(selectedKey);
}

function currentFootprint(def = selectedDef(), rotation = selectedRotation) {
  const turns = Math.abs(Number(rotation) || 0) % 4;
  return turns % 2
    ? { footprintW: def.footprintH, footprintH: def.footprintW }
    : { footprintW: def.footprintW, footprintH: def.footprintH };
}

function getBuildSync() {
  buildSync = readBuildCommunicationState() || buildSync || null;
  return buildSync;
}

function syncedOwnedCount(type) {
  const def = defByKey(type);
  const sync = getBuildSync();
  const bonus = Math.max(0, Math.floor(Number(sync?.worldInventory?.[type]) || 0));
  return (def.owned || 0) + bonus;
}

function totalSyncedWorldInventory() {
  const sync = getBuildSync();
  return Object.values(sync?.worldInventory || {}).reduce((total, amount) => total + Math.max(0, Number(amount) || 0), 0);
}

function fixedId(building) {
  return `fixed:${building.label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
}

function defaultLastCollected(def) {
  return Date.now() - (def.cycleMs || 120000) - 1000;
}

function normalizeBuildingState(item = {}, type = 'streetKiosk') {
  const def = defByKey(type);
  const stock = Number.isFinite(item.stock) ? item.stock : 80;
  const health = Number.isFinite(item.health) ? item.health : 88;
  const level = Number.isFinite(item.level) ? item.level : 1;
  const collected = Number.isFinite(item.collected) ? item.collected : 0;
  const lastCollectedAt = Number.isFinite(item.lastCollectedAt) ? item.lastCollectedAt : defaultLastCollected(def);
  const workMode = BUILDING_WORK_MODES[item.workMode] ? item.workMode : 'standard';
  const cratesClaimed = Number.isFinite(item.cratesClaimed) ? item.cratesClaimed : 0;
  return {
    ...item,
    level: Math.max(1, Math.min(def.maxLevel || 10, level)),
    stock: Math.max(0, Math.min(100, stock)),
    health: Math.max(0, Math.min(100, health)),
    collected: Math.max(0, collected),
    lastCollectedAt,
    workMode,
    cratesClaimed
  };
}

function loadFixedBuildingStates() {
  try { fixedBuildingStates = JSON.parse(localStorage.getItem(GRID.buildingStateKey) || '{}'); }
  catch { fixedBuildingStates = {}; }
  for (const b of CITY_BUILDINGS) {
    const id = fixedId(b);
    fixedBuildingStates[id] = normalizeBuildingState(fixedBuildingStates[id], b.type);
  }
  saveFixedBuildingStates();
}

function saveFixedBuildingStates() {
  localStorage.setItem(GRID.buildingStateKey, JSON.stringify(fixedBuildingStates));
}

function getBuildingRecord(target) {
  if (!target) return null;
  if (target.kind === 'fixed') {
    const fixed = CITY_BUILDINGS.find((b) => fixedId(b) === target.id) || target.fixed;
    if (!fixed) return null;
    fixedBuildingStates[target.id] = normalizeBuildingState(fixedBuildingStates[target.id], fixed.type);
    return { item: fixedBuildingStates[target.id], def: defByKey(fixed.type), fixed };
  }
  const item = placedBuildings.find((b) => b.id === target.id);
  return item ? { item, def: defByKey(item.type), fixed: null } : null;
}

function updateBuildingRecord(target, updater) {
  const record = getBuildingRecord(target);
  if (!record) return null;
  updater(record.item, record.def);
  const normalized = normalizeBuildingState(record.item, record.fixed?.type || record.item.type);
  Object.assign(record.item, normalized);
  if (target.kind === 'fixed') saveFixedBuildingStates();
  else savePlaced();
  return record;
}

function buildingLinkedPeople(def, fixed = null) {
  const normKey = normalizeBuildingKey(def?.key);
  const lineKey = fixed?.lineKey || def?.lineKey || 'streetRoute';
  const leadStaff = supplyManagerByLine(lineKey) || SUPPLY_MANAGERS[0];
  const specialists = [...SUPPLY_MANAGERS, ...RESIDENT_WANTS].filter((p) => {
    const pBuild = normalizeBuildingKey(p.building);
    return pBuild === normKey || p.lineKey === lineKey || p.lineKeyRef === lineKey;
  });
  const unique = [];
  const seen = new Set();
  for (const p of [leadStaff, ...specialists]) {
    if (!p) continue;
    const id = p.lineKey || p.key;
    if (seen.has(id)) continue;
    seen.add(id);
    unique.push(p);
  }
  return { leadStaff, people: unique };
}

function buildingStaffYieldMultiplier(buildingKey) {
  const normKey = normalizeBuildingKey(buildingKey);
  if (!normKey) return 1;
  const linked = [...SUPPLY_MANAGERS, ...RESIDENT_WANTS].filter((p) => normalizeBuildingKey(p.building) === normKey);
  if (!linked.length) return 1;
  let bonus = 0;
  const save = readSupplyState();
  for (const p of linked) {
    const id = p.lineKey || p.key;
    const rt = personRuntimeState[id] || {};
    const hired = rt.hired !== undefined
      ? Boolean(rt.hired)
      : Boolean(save.worldHiredPeople?.[id] || (p.lineKey && save.idleLines?.managers?.[p.lineKey]));
    const lvl = Math.max(1, Number(rt.level || save.worldPersonStats?.[id]?.level || 1));
    const moodBoost = Number(rt.moodBoost || save.worldPersonStats?.[id]?.moodBoost || 0);
    if (hired) {
      bonus += 0.14 + Math.min(0.32, (lvl - 1) * 0.035 + moodBoost * 0.005);
    }
  }
  return 1 + Math.min(0.75, bonus);
}

function cycleMsFor(item, def) {
  const level = item?.level || 1;
  const wm = buildingWorkMode(item);
  const staffMult = buildingStaffYieldMultiplier(def?.key);
  const staffSpeedFactor = Math.max(0.72, 1 - (staffMult - 1) * 0.35);
  const levelSpeedFactor = Math.max(0.54, 1 - (level - 1) * 0.045);
  return Math.max(15000, Math.round((def.cycleMs || 120000) * levelSpeedFactor * wm.cycleMult * staffSpeedFactor));
}

function collectStatus(item, def) {
  const cycle = cycleMsFor(item, def);
  const elapsed = Math.max(0, Date.now() - (item.lastCollectedAt || 0));
  const ready = elapsed >= cycle && (item.stock ?? 0) > 0;
  const pct = Math.max(0, Math.min(100, (elapsed / cycle) * 100));
  const msLeft = Math.max(0, cycle - elapsed);
  const rushCostCoins = ready ? 0 : Math.max(6, Math.min(45, Math.ceil(msLeft / 12000)));
  return { ready, elapsed, cycle, msLeft, pct, rushCostCoins };
}

function buildingYield(item, def) {
  const stockFactor = Math.max(0.25, (item.stock ?? 80) / 100);
  const healthFactor = Math.max(0.5, (item.health ?? 88) / 100);
  const staffMult = buildingStaffYieldMultiplier(def?.key);
  const wm = buildingWorkMode(item);
  return Math.max(1, Math.round((def.baseYield || 10) * (item.level || 1) * stockFactor * (0.7 + healthFactor * 0.3) * staffMult * wm.yieldMult));
}

function buildingSecondaryYield(item, def) {
  const level = item?.level || 1;
  const wm = buildingWorkMode(item);
  const staffMult = buildingStaffYieldMultiplier(def?.key);
  const baseSec = Math.max(1, Math.round((level * 1.4 + (staffMult > 1.05 ? 1.5 : 0.5)) * wm.modeBuffMult));
  return {
    output: def?.secondaryOutput || 'parts',
    label: def?.secondaryLabel || 'Parts',
    amount: baseSec
  };
}

function buildingPower(item, def) {
  return Math.round((def.cost || 50) * 6 + (item.level || 1) * (def.happiness || 8) * 95 + (item.collected || 0) * 24);
}

function upgradeRequirement(item, def) {
  const level = item.level || 1;
  const max = def.maxLevel || 10;
  const staffMult = buildingStaffYieldMultiplier(def?.key);
  const discountFactor = Math.max(0.70, 1 - (level - 1) * 0.015 - (staffMult - 1) * 0.25);
  const baseUpgradeCoins = Math.round((def.upgradeCostBase || 90) * Math.pow(1.36, level - 1));
  const coinCost = Math.max(25, Math.round(baseUpgradeCoins * discountFactor));
  if (level >= max) {
    return { maxed: true, met: false, text: 'Max level reached', stockNeed: 0, collectNeed: 0, coinCost: 0, nextLevel: level };
  }
  const nextLevel = level + 1;
  const stockNeed = Math.min(95, 45 + nextLevel * 5);
  const collectNeed = Math.max(0, Math.floor((nextLevel - 2) * 2));
  const stockMet = (item.stock ?? 0) >= stockNeed;
  const collectMet = (item.collected || 0) >= collectNeed;
  const met = stockMet && collectMet;
  return {
    maxed: false,
    met,
    stockMet,
    collectMet,
    nextLevel,
    stockNeed,
    collectNeed,
    coinCost,
    text: `Needs ${stockNeed}% stock, ${collectNeed} runs & ${coinCost} Coins`
  };
}

function formatDuration(ms) {
  if (ms <= 0) return 'Ready';
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes < 60) return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

function collectReadyCount() {
  const fixedReady = CITY_BUILDINGS.filter((b) => {
    const id = fixedId(b);
    return collectStatus(fixedBuildingStates[id] || normalizeBuildingState({}, b.type), defByKey(b.type)).ready;
  }).length;
  const placedReady = placedBuildings.filter((b) => collectStatus(b, defByKey(b.type)).ready).length;
  return fixedReady + placedReady;
}

function allBuildingRecords() {
  const fixed = CITY_BUILDINGS.map((building) => {
    const id = fixedId(building);
    fixedBuildingStates[id] = normalizeBuildingState(fixedBuildingStates[id], building.type);
    return {
      id,
      kind: 'fixed',
      type: normalizeBuildingKey(building.type),
      label: building.label,
      target: { kind: 'fixed', id },
      item: fixedBuildingStates[id],
      def: defByKey(building.type),
      fixed: building
    };
  });
  const placed = placedBuildings.map((item) => ({
    id: item.id,
    kind: 'placed',
    type: normalizeBuildingKey(item.type),
    label: item.name || defByKey(item.type).shortName,
    target: { kind: 'placed', id: item.id },
    item,
    def: defByKey(item.type),
    fixed: null
  }));
  return [...fixed, ...placed];
}

function computeWorldBuildingPerks() {
  const perks = { race: 0, grip: 0, fuel: 0, repair: 0, parts: 0, tow: 0, sales: 0, route: 0 };
  for (const rec of allBuildingRecords()) {
    const skill = rec.def?.raceSkill || 'route';
    const stockFactor = Math.max(0.2, (rec.item.stock ?? 80) / 100);
    const healthFactor = Math.max(0.3, (rec.item.health ?? 88) / 100);
    const wm = buildingWorkMode(rec.item);
    const staffMult = buildingStaffYieldMultiplier(rec.def?.key);
    const val = (2.5 + (rec.item.level || 1) * 1.8) * stockFactor * healthFactor * wm.modeBuffMult * staffMult;
    perks[skill] = Math.min(45, Math.round((perks[skill] || 0) + val));
  }
  return perks;
}

function average(values) {
  const usable = values.filter((value) => Number.isFinite(value));
  if (!usable.length) return 0;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

function clampScore(value) {
  return Math.round(Math.max(0, Math.min(100, Number(value) || 0)));
}

function issueCountFromScore(score, step = 20) {
  return Math.max(0, Math.round((100 - clampScore(score)) / step));
}

function serviceStats(type) {
  const norm = normalizeBuildingKey(type);
  const records = allBuildingRecords().filter((record) => normalizeBuildingKey(record.type) === norm);
  if (!records.length) {
    return { score: 0, count: 0, avgLevel: 0, avgStock: 0, avgHealth: 0, levelScore: 0, stockScore: 0, healthScore: 0, coverageScore: 0 };
  }
  const avgStock = average(records.map((record) => record.item.stock ?? 0));
  const avgHealth = average(records.map((record) => record.item.health ?? 88));
  const avgLevel = average(records.map((record) => record.item.level || 1));
  const avgMaxLevel = average(records.map((record) => record.def.maxLevel || 10)) || 10;
  const stockScore = Math.max(0, Math.min(100, avgStock));
  const healthScore = Math.max(0, Math.min(100, avgHealth));
  const levelScore = Math.max(0, Math.min(100, (avgLevel / avgMaxLevel) * 100));
  const coverageScore = Math.max(0, Math.min(100, records.length * 42));
  const score = Math.round(coverageScore * 0.20 + levelScore * 0.25 + stockScore * 0.35 + healthScore * 0.20);
  return { score, count: records.length, avgLevel, avgStock, avgHealth, levelScore, stockScore, healthScore, coverageScore };
}

function cityNeedStats() {
  const scores = RESIDENT_WANTS.map((resident) => residentBaseScore(resident));
  const averageScore = Math.round(average(scores));
  const metCount = scores.filter((score) => score >= 60).length;
  const strainedCount = scores.filter((score) => score < 45).length;
  return {
    average: averageScore,
    metCount,
    strainedCount,
    total: RESIDENT_WANTS.length
  };
}

function cityDiversityScore() {
  const stockedTypes = new Set(allBuildingRecords()
    .filter((record) => (record.item.stock ?? 0) > 0)
    .map((record) => record.type));
  return Math.round(Math.min(100, (stockedTypes.size / BUILDING_CATALOG.length) * 100));
}

function cityConditionStats() {
  const records = allBuildingRecords();
  const countScore = Math.min(100, (records.length / 14) * 100);
  const mapBuildScore = Math.round(countScore * 0.56 + cityDiversityScore() * 0.44);
  const tire = serviceStats('tireRepair');
  const repair = serviceStats('privateShop');
  const parts = serviceStats('partsWarehouse');
  const tow = serviceStats('towDispatch');
  const kiosk = serviceStats('streetKiosk');
  const dealer = serviceStats('dealerShowroom');
  const track = serviceStats('testTrack');
  const roadCareScore = Math.round(average([tire.score, repair.score, parts.score]));
  const breakdownResponseScore = Math.round(average([tow.score, tire.score, repair.healthScore || repair.score]));
  const trafficLightScore = Math.round(average([kiosk.score, repair.healthScore || repair.score, parts.stockScore || parts.score]));
  const trafficFlowScore = Math.round(average([kiosk.score, dealer.score, track.score || mapBuildScore, roadCareScore]));
  const potholeScore = clampScore(roadCareScore);
  const vehicleBreakdownScore = clampScore(breakdownResponseScore);
  const trafficLightServiceScore = clampScore(trafficLightScore);
  const stuckVehicleScore = clampScore(100 - ((100 - tow.score) * 0.54 + (100 - roadCareScore) * 0.24 + (100 - breakdownResponseScore) * 0.22));
  const trafficJamScore = clampScore(100 - ((100 - trafficFlowScore) * 0.48 + (100 - stuckVehicleScore) * 0.22 + (100 - trafficLightServiceScore) * 0.18 + (100 - roadCareScore) * 0.12));
  const potholeCount = issueCountFromScore(potholeScore, 22);
  const vehicleBreakdownCount = issueCountFromScore(vehicleBreakdownScore, 22);
  const lightOutCount = issueCountFromScore(trafficLightServiceScore, 26);
  const stuckVehicleCount = issueCountFromScore(stuckVehicleScore, 22);
  const trafficJamCount = issueCountFromScore(trafficJamScore, 20);
  return {
    mapBuild: { key: 'mapBuild', score: clampScore(mapBuildScore), count: records.length, label: CITY_PROBLEM_DEFS.mapBuild.label },
    potholes: { key: 'potholes', score: potholeScore, count: potholeCount, label: CITY_PROBLEM_DEFS.potholes.label },
    vehicleBreakdowns: { key: 'vehicleBreakdowns', score: vehicleBreakdownScore, count: vehicleBreakdownCount, label: CITY_PROBLEM_DEFS.vehicleBreakdowns.label },
    stuckVehicles: { key: 'stuckVehicles', score: stuckVehicleScore, count: stuckVehicleCount, label: CITY_PROBLEM_DEFS.stuckVehicles.label },
    trafficJams: { key: 'trafficJams', score: trafficJamScore, count: trafficJamCount, label: CITY_PROBLEM_DEFS.trafficJams.label },
    trafficLights: { key: 'trafficLights', score: trafficLightServiceScore, count: lightOutCount, label: CITY_PROBLEM_DEFS.trafficLights.label }
  };
}

const personRuntimeState = {};

function rankLabelForPersonLevel(level = 1) {
  if (level >= 12) return 'Partner';
  if (level >= 8) return 'Chief';
  if (level >= 5) return 'Lead';
  if (level >= 3) return 'Specialist';
  return 'Rookie';
}

function personProfile(person) {
  if (!person) return null;
  const id = person.lineKey || person.key;
  const isSupply = Boolean(person.lineKey);
  const linkedLineKey = person.lineKey || person.lineKeyRef || 'streetRoute';
  const save = readSupplyState();
  const runtime = personRuntimeState[id] || {};
  const savedPerson = save.worldPersonStats?.[id] || {};
  const savedCrew = person.crewId ? (save.characters?.[person.crewId] || {}) : {};
  const lineLevel = Math.max(
    Number(runtime.lineLevel || 0),
    Number(save.idleLines?.lines?.[linkedLineKey]?.level || 0)
  );
  const managerHired = Boolean(save.idleLines?.managers?.[linkedLineKey]);
  const worldHired = runtime.hired !== undefined
    ? Boolean(runtime.hired)
    : save.worldHiredPeople?.[id] !== undefined
      ? Boolean(save.worldHiredPeople[id])
      : isSupply
        ? managerHired
        : Boolean(savedCrew.hired);

  const level = Math.max(
    1,
    Number(runtime.level || savedPerson.level || savedCrew.level || (worldHired ? 2 : 1))
  );
  const energyMax = 100;
  const energy = Math.max(
    20,
    Math.min(energyMax, Number(runtime.energy ?? savedPerson.energy ?? savedCrew.energy ?? (worldHired ? 88 : 64)))
  );
  const moodBoost = Number(runtime.moodBoost || savedPerson.moodBoost || 0);
  const skillBonus = (level - 1) * 3.5 + (worldHired ? 6 : 0);
  const skills = (person.skills || [
    { key: 'route', label: 'Route Pace', base: 40 },
    { key: 'repair', label: 'Shop Repair', base: 34 },
    { key: 'race', label: 'Street Speed', base: 30 }
  ]).map((sk) => ({
    key: sk.key,
    label: sk.label,
    base: sk.base,
    value: Math.min(100, Math.round(sk.base + skillBonus))
  }));

  const primarySkillObj = skills[0] || { key: 'route', label: 'Route Pace', value: 45 };
  const avgSkill = Math.round(average(skills.map((s) => s.value)));
  const jobScore = worldHired
    ? Math.min(100, Math.round(78 + level * 2.5 + (energy / energyMax) * 12))
    : 28;
  const supplyScore = worldHired
    ? Math.min(100, 76 + Math.min(24, Math.max(1, lineLevel) * 3))
    : Math.max(24, Math.min(62, lineLevel * 6 + (managerHired ? 25 : 18)));
  const trustScore = relationshipScore(id);
  const trustRank = relationshipRank(trustScore);
  const cityRep = cityReputation();
  const bondScore = Math.min(100, Math.round(46 + trustScore * 0.42 + cityRep * 0.25));

  const conditions = cityConditionStats();
  const streetFactors = (person.factors || ['mapBuild']).map((k) => conditions[k]?.score ?? 70);
  const streetScore = Math.round(average(streetFactors));

  const hireCost = Number(person.hireCostCoins || 85);
  const trainCost = 35 + level * 15;
  const salaryCoins = Number(person.salaryCoins || 12) + Math.max(0, level - 1) * 2;

  return {
    id,
    isSupply,
    linkedLineKey,
    lineLevel: worldHired ? Math.max(1, lineLevel) : lineLevel,
    hired: worldHired,
    level,
    rank: rankLabelForPersonLevel(level),
    energy,
    energyMax,
    moodBoost,
    skills,
    primarySkillKey: primarySkillObj.key,
    primarySkillLabel: primarySkillObj.label,
    primarySkillValue: primarySkillObj.value,
    avgSkill,
    jobScore,
    supplyScore,
    streetScore,
    trustScore,
    trustRank,
    bondScore,
    hireCost,
    trainCost,
    salaryCoins
  };
}

function residentFactorList(resident) {
  const buildingKey = resident?.building || 'garage365';
  const def = defByKey(buildingKey);
  const service = serviceStats(buildingKey);
  const conditions = cityConditionStats();
  const profile = personProfile(resident);
  const factors = [
    {
      key: 'employment',
      label: profile.hired ? `Job: Hired (${resident.jobTitle || 'Staff'})` : 'Job: Unemployed (Hire to boost)',
      score: profile.jobScore,
      weight: 24,
      kind: 'job'
    },
    { key: 'service', label: `${def.shortName} coverage`, score: service.score, weight: 24, kind: 'service' },
    { key: 'supply', label: `${resident.business || 'Supply'} line`, score: profile.supplyScore, weight: 16, kind: 'supply' },
    { key: 'stock', label: 'Stocked supply', score: service.stockScore, weight: 14, kind: 'stock' },
    { key: 'health', label: 'Building repair', score: service.healthScore, weight: 12, kind: 'service' },
    { key: 'bond', label: `Trust (${profile.trustRank}) & Rep`, score: profile.bondScore, weight: 10, kind: 'bond' }
  ];
  for (const key of resident.factors || []) {
    const condition = conditions[key];
    if (condition) {
      factors.push({
        key,
        label: condition.label,
        score: condition.score,
        count: condition.count,
        weight: key === 'mapBuild' ? 8 : 10,
        kind: 'condition'
      });
    }
  }
  return factors;
}

function weightedScore(factors) {
  const totalWeight = factors.reduce((sum, factor) => sum + Math.max(0, factor.weight || 0), 0) || 1;
  return Math.round(factors.reduce((sum, factor) => sum + Math.max(0, Math.min(100, factor.score || 0)) * Math.max(0, factor.weight || 0), 0) / totalWeight);
}

function residentBaseScore(resident) {
  return weightedScore(residentFactorList(resident));
}

function moodTone(score) {
  if (score >= 75) return { key: 'green', label: 'Happy', face: ':D' };
  if (score >= 55) return { key: 'yellow', label: 'Okay', face: ':)' };
  if (score >= 35) return { key: 'orange', label: 'Worried', face: ':/' };
  return { key: 'red', label: 'Upset', face: '>:(' };
}

function residentMood(resident) {
  const buildingKey = resident?.building || 'garage365';
  const service = serviceStats(buildingKey);
  const profile = personProfile(resident);
  const factors = residentFactorList(resident);
  const baseScore = weightedScore(factors);
  const city = cityNeedStats();
  const diversity = cityDiversityScore();
  const conditions = cityConditionStats();
  const rawScore = baseScore * 0.80 + city.average * 0.12 + diversity * 0.08 + (profile.moodBoost || 0);
  const score = Math.round(Math.max(0, Math.min(100, rawScore)));
  const tone = moodTone(score);

  // Connected Game-Mode Bonuses driven by (Happiness × Character Skills × Employment)
  const activeFactor = profile.hired ? (0.65 + (score / 100) * 0.65) : (0.20 + (score / 100) * 0.25);
  const worldYieldBonus = Math.max(2, Math.round((profile.avgSkill * 0.36 + score * 0.18) * activeFactor));
  const supplyYieldBonus = Math.max(2, Math.round((profile.primarySkillValue * 0.42 + score * 0.20) * activeFactor));
  const raceBonusPct = Math.max(2, Math.round((profile.primarySkillValue * 0.38 + score * 0.16) * activeFactor));
  const mergeBonusPct = Math.max(2, Math.round((profile.avgSkill * 0.32 + score * 0.15) * activeFactor));
  const totalModeBonusPct = Math.round((worldYieldBonus + supplyYieldBonus + raceBonusPct + mergeBonusPct) / 4);
  const potentialBonusPct = Math.round((profile.primarySkillValue * 0.42 + 80 * 0.20) * 1.15);

  return {
    ...tone,
    score,
    service,
    city,
    diversity,
    factors,
    baseScore,
    conditions,
    profile: {
      ...profile,
      worldYieldBonus,
      supplyYieldBonus,
      raceBonusPct,
      mergeBonusPct,
      totalModeBonusPct,
      potentialBonusPct
    }
  };
}

function residentByKey(key) {
  return RESIDENT_WANTS.find((resident) => resident.key === key) || SUPPLY_MANAGERS.find((staff) => staff.lineKey === key || staff.key === key) || null;
}

function allCityPeople() {
  return [...SUPPLY_MANAGERS, ...RESIDENT_WANTS];
}


function buildingCondition(record) {
  const item = record.item;
  const def = record.def;
  const req = upgradeRequirement(item, def);
  const status = collectStatus(item, def);
  const stock = Math.round(item.stock ?? 0);
  const health = Math.round(item.health ?? 88);
  const levelScore = Math.round(((item.level || 1) / (def.maxLevel || 10)) * 100);
  const score = Math.round(stock * 0.34 + health * 0.36 + levelScore * 0.20 + (req.met && !req.maxed ? 10 : 0));
  const reasons = [];
  if (health < 76) reasons.push(`Repair ${health}%`);
  if (stock < 70) reasons.push(`Restock ${stock}%`);
  if (req.met && !req.maxed) reasons.push(`Upgrade Lv ${req.nextLevel}`);
  if (status.ready) reasons.push('Collect ready');
  if (!reasons.length) reasons.push('Stable');
  return {
    stock,
    health,
    levelScore,
    score: Math.max(0, Math.min(100, score)),
    req,
    status,
    reasons,
    poor: health < 76 || stock < 70 || (req.met && !req.maxed)
  };
}

function problemBuildings(type = null, onlyPoor = false) {
  const types = Array.isArray(type) ? new Set(type) : null;
  return allBuildingRecords()
    .filter((record) => !type || (types ? types.has(record.type) : record.type === type))
    .map((record) => ({ ...record, condition: buildingCondition(record) }))
    .filter((record) => !onlyPoor || record.condition.poor)
    .sort((a, b) => {
      if (a.condition.poor !== b.condition.poor) return a.condition.poor ? -1 : 1;
      return a.condition.score - b.condition.score;
    });
}

function targetToken(target) {
  return encodeURIComponent(JSON.stringify(target));
}

function targetFromToken(token) {
  try {
    const parsed = JSON.parse(decodeURIComponent(token || ''));
    if (parsed?.kind === 'fixed' || parsed?.kind === 'placed') return { kind: parsed.kind, id: parsed.id };
  } catch {}
  return null;
}

function html() {
  return `
    <section class="card pixiWorldShell worldPlayArea">
      <div class="worldRuntimeTabs subTabBar" hidden></div>
      <div class="pixiWorldHeader worldMapPrimaryHeader">
        <h2>World</h2>
        <p>Tap any building, car, person, or frontier plot to explore &amp; expand your 3D town.</p>
      </div>
      <div class="pixiWorldHost worldMapPrimary" id="pixiWorldHost"></div>
      <div class="worldAssetPreload" aria-hidden="true">
        ${WORLD_ASSET_LIST.map((item) => `<img class="worldAssetPreloadImage" data-world-asset="${item.category}:${item.key}" src="${item.src}" alt="" loading="eager">`).join('')}
      </div>
      <div class="mobileCityHud">
        <div class="mobileCityStatus">
          <span class="mobileCityModeBadge" data-mobile-city-mode>Normal</span>
          <span data-mobile-city-help>Tap buildings to collect, inspect, and upgrade.</span>
          <div class="cityReputation" data-city-reputation><b data-city-reputation-rank>Unknown</b><span><i data-city-reputation-bar></i></span><small data-city-reputation-score>0</small></div>
          <div class="mobileMapTools">
            <button class="btn small primary" onclick="window.openMobileBuildTraySafe?.()">Build</button>
            <button class="btn small gold" data-expand-town-btn onclick="window.unlockNextTownPlotSafe?.()">Expand (<span data-town-expansion-count>${unlockedPlotCount()}/${TOWN_EXPANSION_PLOTS.length}</span>)</button>
            <button class="btn small ghost" data-camera-angle-btn onclick="window.toggleCityCameraAngleSafe?.()">3D City</button>
            <button class="btn small ghost" data-zoom-in-btn onclick="window.zoomMobileCityInSafe?.()">Zoom +</button>
            <button class="btn small ghost" data-zoom-out-btn onclick="window.zoomMobileCityOutSafe?.()">Zoom -</button>
            <button class="btn small ghost" onclick="window.centerMobileCitySafe?.()">Center</button>
          </div>
        </div>
        <div class="mobileBuildSyncStatus"><span>Sync</span><b data-build-sync-total>+${totalSyncedWorldInventory()} world</b><small data-build-sync-lines>${getBuildSync()?.unlockedLineCount || 0}/${getBuildSync()?.totalLineCount || 0} lines</small></div>
        <div class="mobileCityActions worldActionDock" hidden></div>
        <div class="mobileBuildTray" data-build-tray hidden>
          <div class="mobileTrayTitle mobileBuildTrayTitle">
            <span class="buildTrayKicker">Choose Building</span>
            <span data-selected-building>${selectedDef().name}</span>
            <span data-selected-rotation>0 deg</span>
          </div>
          <div class="mobileBuildingList">
            ${placeableBuildingCatalog().map((item) => `
              <button class="btn small ghost buildCatalogCard" data-building-key="${item.key}" onclick="window.selectMobileBuildingSafe?.('${item.key}')">
                <img class="buildCardThumb" src="${buildingAssetForKey(item.key, item.name, 1)}" alt="" loading="eager">
                <strong class="buildCardName">${item.shortName}</strong>
                <em class="buildCardYield">+${item.baseYield} ${item.outputLabel}</em>
                <small>${item.footprintW}x${item.footprintH} · owned <span data-owned-count="${item.key}">${ownedRemaining(item.key)}</span></small>
              </button>
            `).join('')}
          </div>
          <div class="mobileBuildBottomBar">
            <div class="mobileGhostHelp">Tap green land to preview · Confirm to place</div>
            <div class="mobileConfirmRow" data-confirm-row hidden>
              <button class="btn primary" onclick="window.confirmMobilePlacementSafe?.()">Confirm</button>
              <button class="btn red" onclick="window.cancelMobilePlacementSafe?.()">Cancel</button>
            </div>
            <div class="mobileBuildActions">
              <button class="btn gold" onclick="window.rotateMobileBuildingSafe?.()">Rotate Building</button>
              <button class="btn ghost" onclick="window.cancelMobilePlacementSafe?.()">Close Build Mode</button>
              <button class="btn red" onclick="window.clearMobilePlacementsSafe?.()">Clear Test Buildings</button>
            </div>
          </div>
        </div>
        <div class="mobilePlacedSheet" data-placed-sheet hidden>
          <div class="mobileTrayTitle"><span>Building</span><span>Stats</span></div>
        </div>
        <div class="mobileResidentSheet" data-resident-sheet hidden>
          <div class="mobileTrayTitle"><span data-resident-name>Resident</span><span>Want</span></div>
          <div class="mobileNeedText">
            <strong data-resident-want>Needs a city service.</strong>
            <span data-resident-target>Build and restock matching shops to improve happiness.</span>
          </div>
          <div class="mobilePlacedActions">
            <button class="btn gold" onclick="window.openMobileBuildTraySafe?.()">Build</button>
            <button class="btn ghost" onclick="window.closeMobileResidentSheetSafe?.()">Close</button>
          </div>
        </div>
        <div class="mobileVehicleSheet" data-vehicle-sheet hidden></div>
      </div>
    </section>
    <button class="pixiWorldProxy" data-proxy="garage" data-action="screen" data-screen="garage" hidden></button>
    <button class="pixiWorldProxy" data-proxy="lines" data-action="screen" data-screen="lines" hidden></button>
    <button class="pixiWorldProxy" data-proxy="merge" data-action="screen" data-screen="merge" hidden></button>
    <button class="pixiWorldProxy" data-proxy="race" data-action="screen" data-screen="race" hidden></button>
  `;
}

function fillStyle(value) {
  return typeof value === 'number' ? { color: value, alpha: 1 } : value;
}

function rect(x, y, w, h, fill, stroke = null) {
  const g = new PIXI.Graphics();
  g.rect(x, y, w, h).fill(fillStyle(fill));
  if (stroke) g.rect(x, y, w, h).stroke(stroke);
  return g;
}

function roundRect(x, y, w, h, r, fill, stroke = null) {
  const g = new PIXI.Graphics();
  g.roundRect(x, y, w, h, r).fill(fillStyle(fill));
  if (stroke) g.roundRect(x, y, w, h, r).stroke(stroke);
  return g;
}

function circle(x, y, r, fill, stroke = null) {
  const g = new PIXI.Graphics();
  g.circle(x, y, r).fill(fillStyle(fill));
  if (stroke) g.circle(x, y, r).stroke(stroke);
  return g;
}

function textLabel(text, x, y, size = 11, color = 0xffffff) {
  const t = new PIXI.Text({ text, style: { fontFamily: 'Arial', fontSize: size, fontWeight: '900', fill: color, align: 'center' } });
  t.anchor.set(0.5);
  t.x = x;
  t.y = y;
  return t;
}

function assetSprite(src, x, y, width, height, alpha = 1) {
  if (!src) return null;
  const sprite = PIXI.Sprite.from(src);
  sprite.anchor.set(0.5);
  sprite.x = x;
  sprite.y = y;
  sprite.width = width;
  sprite.height = height;
  sprite.alpha = alpha;
  return sprite;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function makeClickable(container, handler) {
  container.eventMode = 'static';
  container.cursor = 'pointer';
  container.on('pointertap', () => { if (!dragMoved) handler(); });
}

function buildingStarsForLevel(level = 1) {
  if (level >= 9) return 5;
  if (level >= 7) return 4;
  if (level >= 5) return 3;
  if (level >= 3) return 2;
  return 1;
}

function spawnRichdomCollectBurst(container, cx, cy, amount, label) {
  if (!container) return;
  const burst = new PIXI.Container();
  burst.x = cx;
  burst.y = cy;
  burst.zIndex = 2200;
  container.addChild(burst);

  const bills = [];
  for (let i = 0; i < 6; i++) {
    const bill = new PIXI.Graphics();
    bill.roundRect(-11, -6, 22, 12, 3).fill({ color: 0x22c55e, alpha: 0.96 }).stroke({ width: 1.4, color: 0x052e16 });
    bill.circle(0, 0, 3).fill({ color: 0x86efac, alpha: 0.95 });
    bill.x = (i - 2.5) * 9;
    bill.y = 0;
    bill.rotation = (i - 2.5) * 0.16;
    burst.addChild(bill);
    bills.push({ node: bill, vx: (i - 2.5) * 0.85, vy: -1.8 - (i % 3) * 0.45, vr: (i % 2 === 0 ? 1 : -1) * 0.04 });
  }

  const floatPill = new PIXI.Container();
  floatPill.y = -14;
  floatPill.addChild(roundRect(-44, -11, 88, 22, 11, { color: 0xf8fafc, alpha: 0.98 }, { width: 2, color: 0x16a34a }));
  floatPill.addChild(textLabel(`+${amount} ${label}`, 0, 0, 9.2, 0x15803d));
  burst.addChild(floatPill);

  let step = 0;
  const timer = setInterval(() => {
    step += 1;
    if (!burst.parent || step > 24) {
      clearInterval(timer);
      if (burst.parent) burst.destroy({ children: true });
      return;
    }
    for (const b of bills) {
      b.node.x += b.vx;
      b.node.y += b.vy;
      b.node.rotation += b.vr;
      b.node.alpha = Math.max(0, 1 - step / 24);
    }
    floatPill.y -= 1.25;
    floatPill.alpha = Math.max(0, 1 - step / 24);
  }, 28);
}

function addBuildingStatusBadges(container, w, h, item, def, onCollect = null) {
  if (!item) return null;
  container.sortableChildren = true;
  const status = collectStatus(item, def);
  const req = upgradeRequirement(item, def);
  const yieldAmount = buildingYield(item, def);
  const stars = buildingStarsForLevel(item.level || 1);
  const bubble = new PIXI.Container();
  bubble.x = w / 2;
  bubble.y = -38;
  bubble.zIndex = 1000;

  if (status.ready) {
    // Richdom-style crisp white & emerald speech callout pill with pointer tail
    const tail = new PIXI.Graphics();
    tail.poly([-6, 11, 6, 11, 0, 18]).fill({ color: 0xf8fafc, alpha: 0.98 }).stroke({ width: 1.8, color: 0x22c55e });
    bubble.addChild(tail);
    bubble.addChild(roundRect(-44, -13, 88, 25, 12.5, { color: 0xf8fafc, alpha: 0.98 }, { width: 2.2, color: 0x22c55e, alpha: 0.98 }));
    const billIcon = new PIXI.Graphics();
    billIcon.roundRect(-36, -6, 16, 12, 2.5).fill({ color: 0x22c55e }).stroke({ width: 1.2, color: 0x052e16 });
    billIcon.circle(-28, 0, 2.5).fill({ color: 0xbbf7d0 });
    bubble.addChild(billIcon);
    bubble.addChild(textLabel(`+${yieldAmount} ${def.outputLabel}`, 7, 0, 8.5, 0x15803d));
  } else {
    bubble.addChild(roundRect(-38, -12, 76, 24, 12, { color: 0x06131d, alpha: 0.90 }, { width: 2, color: 0x38bdf8, alpha: 0.95 }));
    const iconSrc = req.met ? WORLD_ASSETS.ui.upgradeReady : WORLD_ASSETS.ui.collectTimer;
    const icon = assetSprite(iconSrc, -22, 0, 17, 17, 1);
    if (icon) bubble.addChild(icon);
    bubble.addChild(textLabel(formatDuration(status.msLeft), 7, 0.5, 8.2, 0xe2e8f0));
  }

  if (status.ready && onCollect) {
    bubble.eventMode = 'static';
    bubble.cursor = 'pointer';
    bubble.on('pointertap', (event) => {
      event.stopPropagation?.();
      if (!dragMoved && mode === 'normal') {
        spawnRichdomCollectBurst(container, w / 2, -38, yieldAmount, def.outputLabel);
        onCollect();
      }
    });
  }
  container.addChild(bubble);

  const levelBadge = new PIXI.Container();
  levelBadge.x = w - 12;
  levelBadge.y = h - 9;
  levelBadge.zIndex = 1001;
  const levelIcon = assetSprite(WORLD_ASSETS.ui.levelBadge, 0, 0, 32, 22, 1);
  if (levelIcon) levelBadge.addChild(levelIcon);
  levelBadge.addChild(roundRect(-22, -9, 44, 18, 9, { color: 0x04111d, alpha: 0.88 }, { width: 1.2, color: 0xfacc15 }));
  levelBadge.addChild(textLabel(`Lv${item.level || 1} ${'★'.repeat(Math.min(3, stars))}`, 0, 0, 7.2, 0xfef08a));
  container.addChild(levelBadge);

  if (req.met && !req.maxed) {
    const upgrade = new PIXI.Container();
    upgrade.x = w - 6;
    upgrade.y = -12;
    upgrade.zIndex = 1002;
    const upgradeIcon = assetSprite(WORLD_ASSETS.ui.upgradeReady, 0, 0, 22, 22, 1);
    if (upgradeIcon) upgrade.addChild(upgradeIcon);
    upgrade.addChild(textLabel('UP', 0, 1, 6.5, 0x092b16));
    container.addChild(upgrade);
  }
  return bubble;
}

function buildingTargetForFixed(building) {
  return { kind: 'fixed', id: fixedId(building), fixed: building };
}

function drawGround() {
  const groundLayer = new PIXI.Container();
  groundLayer.zIndex = 0;
  // Base velvety dark-slate asphalt across the entire street grid
  groundLayer.addChild(rect(0, 0, WORLD.width, WORLD.height, 0x1b2638));
  world.addChild(groundLayer);
}

function drawRoads() {
  const roadLayer = new PIXI.Container();
  roadLayer.zIndex = 1;
  world.addChild(roadLayer);

  const blockLayer = new PIXI.Container();
  blockLayer.zIndex = 2;
  world.addChild(blockLayer);

  const decorLayer = new PIXI.Container();
  decorLayer.zIndex = 3;
  world.addChild(decorLayer);

  const vRoads = ROADS.vertical.map((r) => r.x).sort((a, b) => a - b);
  const hRoads = ROADS.horizontal.map((r) => r.y).sort((a, b) => a - b);

  const xCols = [];
  let prevX = -24;
  for (const vx of vRoads) {
    xCols.push({ x1: prevX, x2: vx });
    prevX = vx + ROADS.width;
  }
  xCols.push({ x1: prevX, x2: WORLD.width + 24 });

  const yRows = [];
  let prevY = -24;
  for (const hy of hRoads) {
    yRows.push({ y1: prevY, y2: hy });
    prevY = hy + ROADS.width;
  }
  yRows.push({ y1: prevY, y2: WORLD.height + 24 });

  // 1. Subtle Crowned Asphalt Texture & Tire Ruts along all Horizontal & Vertical Avenues
  for (const road of ROADS.horizontal) {
    const cy = road.y + ROADS.width / 2;
    roadLayer.addChild(rect(0, road.y + 18, WORLD.width, ROADS.width - 36, { color: 0x24334a, alpha: 0.85 }));
    roadLayer.addChild(rect(0, road.y + 19, WORLD.width, 3.5, { color: 0x101826, alpha: 0.42 }));
    roadLayer.addChild(rect(0, road.y + 30, WORLD.width, 3.5, { color: 0x101826, alpha: 0.42 }));
    roadLayer.addChild(rect(0, road.y + 54.5, WORLD.width, 3.5, { color: 0x101826, alpha: 0.42 }));
    roadLayer.addChild(rect(0, road.y + 65.5, WORLD.width, 3.5, { color: 0x101826, alpha: 0.42 }));

    for (const col of xCols) {
      const segX1 = Math.max(0, col.x1 + 20);
      const segX2 = Math.min(WORLD.width, col.x2 - 20);
      const segW = segX2 - segX1;
      if (segW <= 20) continue;

      const tex = assetSprite(WORLD_ASSETS.terrain.roadHorizontal, segX1 + segW / 2, cy, segW, ROADS.width, 0.26);
      if (tex) roadLayer.addChild(tex);

      // Crisp white outer shoulder fog lines
      roadLayer.addChild(rect(segX1, road.y + 8.5, segW, 1.8, { color: 0xf8fafc, alpha: 0.72 }));
      roadLayer.addChild(rect(segX1, road.y + ROADS.width - 10.3, segW, 1.8, { color: 0xf8fafc, alpha: 0.72 }));

      // Dark median channel + Double Amber-Gold Center Divider
      roadLayer.addChild(rect(segX1, cy - 3.8, segW, 7.6, { color: 0x0d1522, alpha: 0.62 }));
      roadLayer.addChild(rect(segX1, cy - 2.6, segW, 2.1, { color: 0xfbbf24, alpha: 0.96 }));
      roadLayer.addChild(rect(segX1, cy + 0.6, segW, 2.1, { color: 0xf59e0b, alpha: 0.96 }));

      for (let sx = segX1 + 22; sx < segX2 - 18; sx += 48) {
        roadLayer.addChild(roundRect(sx - 2, cy - 1.1, 4, 2.2, 0.8, 0xfef08a));
        roadLayer.addChild(roundRect(sx - 8, road.y + 25, 16, 1.8, 0.9, { color: 0xe2e8f0, alpha: 0.16 }));
        roadLayer.addChild(roundRect(sx + 10, road.y + 61, 16, 1.8, 0.9, { color: 0xe2e8f0, alpha: 0.16 }));
      }

      if (segW >= 120) {
        const midX = (segX1 + segX2) / 2;
        const arrW = new PIXI.Graphics();
        arrW.poly([midX - 18, road.y + 26, midX - 10, road.y + 21.5, midX - 10, road.y + 24.2, midX + 2, road.y + 24.2, midX + 2, road.y + 27.8, midX - 10, road.y + 27.8, midX - 10, road.y + 30.5]).fill({ color: 0xf8fafc, alpha: 0.22 });
        arrW.poly([midX + 18, road.y + 62, midX + 10, road.y + 57.5, midX + 10, road.y + 60.2, midX - 2, road.y + 60.2, midX - 2, road.y + 63.8, midX + 10, road.y + 63.8, midX + 10, road.y + 66.5]).fill({ color: 0xf8fafc, alpha: 0.22 });
        roadLayer.addChild(arrW);
      }
    }
  }

  for (const road of ROADS.vertical) {
    const cx = road.x + ROADS.width / 2;
    roadLayer.addChild(rect(road.x + 18, 0, ROADS.width - 36, WORLD.height, { color: 0x24334a, alpha: 0.85 }));
    roadLayer.addChild(rect(road.x + 19, 0, 3.5, WORLD.height, { color: 0x101826, alpha: 0.42 }));
    roadLayer.addChild(rect(road.x + 30, 0, 3.5, WORLD.height, { color: 0x101826, alpha: 0.42 }));
    roadLayer.addChild(rect(road.x + 54.5, 0, 3.5, WORLD.height, { color: 0x101826, alpha: 0.42 }));
    roadLayer.addChild(rect(road.x + 65.5, 0, 3.5, WORLD.height, { color: 0x101826, alpha: 0.42 }));

    for (const row of yRows) {
      const segY1 = Math.max(0, row.y1 + 20);
      const segY2 = Math.min(WORLD.height, row.y2 - 20);
      const segH = segY2 - segY1;
      if (segH <= 20) continue;

      const tex = assetSprite(WORLD_ASSETS.terrain.roadVertical, cx, segY1 + segH / 2, ROADS.width, segH, 0.26);
      if (tex) roadLayer.addChild(tex);

      roadLayer.addChild(rect(road.x + 8.5, segY1, 1.8, segH, { color: 0xf8fafc, alpha: 0.72 }));
      roadLayer.addChild(rect(road.x + ROADS.width - 10.3, segY1, 1.8, segH, { color: 0xf8fafc, alpha: 0.72 }));

      roadLayer.addChild(rect(cx - 3.8, segY1, 7.6, segH, { color: 0x0d1522, alpha: 0.62 }));
      roadLayer.addChild(rect(cx - 2.6, segY1, 2.1, segH, { color: 0xfbbf24, alpha: 0.96 }));
      roadLayer.addChild(rect(cx + 0.6, segY1, 2.1, segH, { color: 0xf59e0b, alpha: 0.96 }));

      for (let sy = segY1 + 22; sy < segY2 - 18; sy += 48) {
        roadLayer.addChild(roundRect(cx - 1.1, sy - 2, 2.2, 4, 0.8, 0xfef08a));
        roadLayer.addChild(roundRect(road.x + 25, sy - 8, 1.8, 16, 0.9, { color: 0xe2e8f0, alpha: 0.16 }));
        roadLayer.addChild(roundRect(road.x + 61, sy + 10, 1.8, 16, 0.9, { color: 0xe2e8f0, alpha: 0.16 }));
      }
    }
  }

  // 2. 3D Extruded City Block Plazas (Simpsons: Tapped Out / Town City / SimCity BuildIt style)
  const sw = ROADS.sidewalk;
  for (const row of yRows) {
    for (const col of xCols) {
      const bx = col.x1;
      const by = row.y1;
      const bw = col.x2 - col.x1;
      const bh = row.y2 - row.y1;
      const curbR = 20;

      // Step A: Deep Recessed Asphalt Gutter Shadow + 8px 3D Extruded Southern Concrete Curb Wall
      blockLayer.addChild(roundRect(bx - 4, by - 2, bw + 8, bh + 12, curbR + 3, { color: 0x070d16, alpha: 0.82 }));
      blockLayer.addChild(roundRect(bx, by + 6, bw, bh, curbR, 0x475569));
      blockLayer.addChild(roundRect(bx, by + 3, bw, bh, curbR, 0x94a3b8));
      blockLayer.addChild(roundRect(bx + 2.5, by + 2.5, bw - 5, bh - 5, curbR - 2, 0xe2e8f0, { width: 2, color: 0xf8fafc, alpha: 0.95 }));

      // Step B: Isometric 2:1 Diagonal & Orthogonal Sidewalk Paver Joints
      const paverG = new PIXI.Graphics();
      const pxStart = Math.max(0, bx + 16);
      const pxEnd = Math.min(WORLD.width, bx + bw - 16);
      for (let px = pxStart; px <= pxEnd; px += 28) {
        if (by > 0) paverG.moveTo(px, by + 3).lineTo(px, by + sw);
        if (by + bh < WORLD.height) paverG.moveTo(px, by + bh - sw).lineTo(px, by + bh - 3);
      }
      const pyStart = Math.max(0, by + 16);
      const pyEnd = Math.min(WORLD.height, by + bh - 16);
      for (let py = pyStart; py <= pyEnd; py += 28) {
        if (bx > 0) paverG.moveTo(bx + 3, py).lineTo(bx + sw, py);
        if (bx + bw < WORLD.width) paverG.moveTo(bx + bw - sw, py).lineTo(bx + bw - 3, py);
      }
      paverG.stroke({ width: 1.1, color: 0x94a3b8, alpha: 0.55 });
      blockLayer.addChild(paverG);

      // Step C: Inset Raised 3D Lush Emerald Park Lawn with 2:1 Isometric Diagonal Mowing Stripes!
      const lx1 = bx < 0 ? bx : bx + sw;
      const lx2 = bx + bw > WORLD.width ? bx + bw : bx + bw - sw;
      const ly1 = by < 0 ? by : by + sw;
      const ly2 = by + bh > WORLD.height ? by + bh : by + bh - sw;
      const lw = lx2 - lx1;
      const lh = ly2 - ly1;
      if (lw > 16 && lh > 16) {
        const lawnR = 12;
        // 3D Recessed Stone Garden Planter Wall
        blockLayer.addChild(roundRect(lx1 - 2.5, ly1 - 1.5, lw + 5, lh + 6, lawnR + 2, 0x475569));
        blockLayer.addChild(roundRect(lx1, ly1, lw, lh, lawnR, 0x55b648, { width: 2.5, color: 0x38862d, alpha: 0.85 }));

        // Isometric 2:1 Diagonal Lawn Stripes (slope = ±0.5, matching the 30° isometric buildings!)
        const isoLawnG = new PIXI.Graphics();
        const clipX1 = Math.max(0, lx1 + 6);
        const clipX2 = Math.min(WORLD.width, lx2 - 6);
        const clipY1 = Math.max(0, ly1 + 6);
        const clipY2 = Math.min(WORLD.height, ly2 - 6);
        const cw = clipX2 - clipX1;
        const ch = clipY2 - clipY1;
        if (cw > 24 && ch > 24) {
          for (let offset = -ch * 2; offset < cw + ch * 2; offset += 56) {
            const xA = clipX1 + offset;
            const yA = clipY1;
            const xB = clipX1 + offset + 28;
            const yB = clipY1;
            const xC = xB - ch * 1.6;
            const yC = clipY2;
            const xD = xA - ch * 1.6;
            const yD = clipY2;
            const clampX = (v) => Math.max(clipX1, Math.min(clipX2, v));
            isoLawnG.poly([
              clampX(xA), yA,
              clampX(xB), yB,
              clampX(xC), yC,
              clampX(xD), yD
            ]).fill({ color: 0x67c958, alpha: 0.34 });
          }
          // Subtle isometric garden border path framing the block interior
          isoLawnG.roundRect(clipX1 + 4, clipY1 + 4, cw - 8, ch - 8, 8)
            .stroke({ width: 1.5, color: 0x86efac, alpha: 0.25 });
          blockLayer.addChild(isoLawnG);
        }

        const grassTex = assetSprite(WORLD_ASSETS.terrain.grassTile, lx1 + lw / 2, ly1 + lh / 2, Math.max(40, lw - 12), Math.max(40, lh - 12), 0.28);
        if (grassTex) blockLayer.addChild(grassTex);
      }
    }
  }

  drawCrosswalks(roadLayer);

  // 3. Sleek Highway Street-Name Badges & Warm Streetlight Glow Pools
  for (const road of ROADS.horizontal) {
    const signW = Math.max(108, road.label.length * 6.2 + 20);
    const signX = 112;
    const signY = road.y - ROADS.sidewalk / 2;
    const sign = new PIXI.Container();
    sign.x = signX;
    sign.y = signY;
    sign.addChild(roundRect(-signW / 2, -9.5, signW, 19, 9.5, { color: 0x06131d, alpha: 0.92 }, { width: 1.5, color: 0x35e58a, alpha: 0.88 }));
    sign.addChild(circle(-signW / 2 + 10, 0, 3.2, { color: 0x35e58a, alpha: 0.95 }));
    sign.addChild(textLabel(road.label, 5, 0, 8.2, 0xe2e8f0));
    decorLayer.addChild(sign);

    for (const lx of [160, 480, 820]) {
      decorLayer.addChild(circle(lx, road.y + 10, 26, { color: 0xfef08a, alpha: 0.07 }));
    }
  }
}

function drawCrosswalks(targetLayer = world) {
  for (const h of ROADS.horizontal) {
    for (const v of ROADS.vertical) {
      const ix = v.x;
      const iy = h.y;
      const rw = ROADS.width;
      const cx = ix + rw / 2;
      const cy = iy + rw / 2;

      const g = new PIXI.Graphics();

      g.moveTo(ix + 16, iy - 4).quadraticCurveTo(ix + 16, iy + 16, ix - 4, iy + 16).stroke({ width: 1.2, color: 0xcbd5e1, alpha: 0.22 });
      g.moveTo(ix + rw - 16, iy - 4).quadraticCurveTo(ix + rw - 16, iy + 16, ix + rw + 4, iy + 16).stroke({ width: 1.2, color: 0xcbd5e1, alpha: 0.22 });
      g.moveTo(ix + 16, iy + rw + 4).quadraticCurveTo(ix + 16, iy + rw - 16, ix - 4, iy + rw - 16).stroke({ width: 1.2, color: 0xcbd5e1, alpha: 0.22 });
      g.moveTo(ix + rw - 16, iy + rw + 4).quadraticCurveTo(ix + rw - 16, iy + rw - 16, ix + rw + 4, iy + rw - 16).stroke({ width: 1.2, color: 0xcbd5e1, alpha: 0.22 });

      const offsets = [-28, -14, 0, 14, 28];
      for (const off of offsets) {
        g.roundRect(cx + off - 3, iy - 16, 6, 13, 1.5).fill({ color: 0x090f17, alpha: 0.45 });
        g.roundRect(cx + off - 3, iy - 17, 6, 13, 1.5).fill({ color: 0xf8fafc, alpha: 0.92 });

        g.roundRect(cx + off - 3, iy + rw + 4, 6, 13, 1.5).fill({ color: 0x090f17, alpha: 0.45 });
        g.roundRect(cx + off - 3, iy + rw + 3, 6, 13, 1.5).fill({ color: 0xf8fafc, alpha: 0.92 });

        g.roundRect(ix - 16, cy + off - 3, 13, 6, 1.5).fill({ color: 0x090f17, alpha: 0.45 });
        g.roundRect(ix - 17, cy + off - 3, 13, 6, 1.5).fill({ color: 0xf8fafc, alpha: 0.92 });

        g.roundRect(ix + rw + 4, cy + off - 3, 13, 6, 1.5).fill({ color: 0x090f17, alpha: 0.45 });
        g.roundRect(ix + rw + 3, cy + off - 3, 13, 6, 1.5).fill({ color: 0xf8fafc, alpha: 0.92 });
      }

      g.rect(ix + 10, iy - 21, rw - 20, 2.5).fill({ color: 0xf8fafc, alpha: 0.85 });
      g.rect(ix + 10, iy + rw + 18.5, rw - 20, 2.5).fill({ color: 0xf8fafc, alpha: 0.85 });
      g.rect(ix - 21, iy + 10, 2.5, rw - 20).fill({ color: 0xf8fafc, alpha: 0.85 });
      g.rect(ix + rw + 18.5, iy + 10, 2.5, rw - 20).fill({ color: 0xf8fafc, alpha: 0.85 });

      g.circle(cx, cy, 9.5).fill({ color: 0x0f172a, alpha: 0.95 }).stroke({ width: 1.8, color: 0x475569, alpha: 0.9 });
      g.circle(cx, cy, 6).fill({ color: 0x1e293b, alpha: 0.95 }).stroke({ width: 1, color: 0x64748b, alpha: 0.8 });

      targetLayer.addChild(g);
    }
  }
}

let animatedBuildings = [];
let animatedTrees = [];
let incidentAnims = [];
let expansionAnims = [];
let activePotholePositions = [];
let worldAnimClock = 0;
let lastBuildingsStateSig = '';

function makeIsoFanRotor(x, y, radius = 9, color = 0xcbd5e1) {
  const rotor = new PIXI.Container();
  rotor.x = x;
  rotor.y = y;
  rotor.scale.y = 0.62;
  const g = new PIXI.Graphics();
  g.circle(0, 0, radius).fill({ color: 0x0f172a, alpha: 0.72 }).stroke({ width: 1.5, color: 0x475569, alpha: 0.9 });
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    g.moveTo(0, 0).lineTo(Math.cos(a) * (radius - 1.5), Math.sin(a) * (radius - 1.5)).stroke({ width: 2.2, color, alpha: 0.95 });
  }
  g.circle(0, 0, 2.5).fill({ color: 0x38bdf8, alpha: 0.95 });
  rotor.addChild(g);
  return rotor;
}

function attachClashBuildingRig(rigRoot, type, spriteSize) {
  const s = spriteSize / 200;
  const parts = {
    rotors: [],
    strobes: [],
    holoSign: null,
    liftCar: null,
    weldingArc: null,
    forklift: null,
    searchlightA: null,
    searchlightB: null,
    turntableRing: null,
    radarWave: null,
    dynoFlame: null,
    craneArm: null,
    trackCar: null
  };

  const overlay = new PIXI.Container();
  overlay.zIndex = 20;
  rigRoot.addChild(overlay);

  if (type === 'garage') {
    const f1 = makeIsoFanRotor(-8 * s, -69 * s, 7.5 * s, 0xe2e8f0);
    const f2 = makeIsoFanRotor(7 * s, -61 * s, 7.5 * s, 0xe2e8f0);
    overlay.addChild(f1, f2);
    parts.rotors.push(f1, f2);

    const liftCar = new PIXI.Container();
    liftCar.x = -38 * s;
    liftCar.y = 8 * s;
    const liftBeam = roundRect(-14 * s, 6 * s, 28 * s, 4 * s, 2, 0xfacc15, { width: 1, color: 0x0f172a });
    const carGlow = circle(0, 0, 14 * s, { color: 0x38bdf8, alpha: 0.28 });
    const bayCar = assetSprite(WORLD_ASSETS.vehicles.blueCar, 0, -2 * s, 38 * s, 26 * s, 0.95);
    liftCar.addChild(carGlow, liftBeam);
    if (bayCar) liftCar.addChild(bayCar);
    overlay.addChild(liftCar);
    parts.liftCar = { node: liftCar, baseY: 8 * s, amp: 4.5 * s };

    const weldingArc = new PIXI.Container();
    weldingArc.x = -2 * s;
    weldingArc.y = 28 * s;
    const arcCore = circle(0, 0, 12 * s, { color: 0x38bdf8, alpha: 0.55 });
    const arcCenter = circle(0, 0, 4.5 * s, { color: 0xffffff, alpha: 0.95 });
    weldingArc.addChild(arcCore, arcCenter);
    overlay.addChild(weldingArc);
    parts.weldingArc = weldingArc;
  } else if (type === 'partsHub' || type === 'partsWarehouse') {
    const fanCoords = [[-48, -46], [-32, -55], [-34, -38], [-18, -46]];
    for (const [fx, fy] of fanCoords) {
      const rotor = makeIsoFanRotor(fx * s, fy * s, 6.5 * s, 0x99f6e4);
      overlay.addChild(rotor);
      parts.rotors.push(rotor);
    }

    const forklift = new PIXI.Container();
    forklift.x = -24 * s;
    forklift.y = 44 * s;
    const fkBody = new PIXI.Graphics();
    fkBody.roundRect(-8 * s, -7 * s, 16 * s, 12 * s, 3).fill({ color: 0xf59e0b }).stroke({ width: 1.5, color: 0x0f172a });
    fkBody.roundRect(-5 * s, -12 * s, 10 * s, 7 * s, 2).fill({ color: 0x1e293b });
    fkBody.roundRect(7 * s, -5 * s, 9 * s, 8 * s, 1.5).fill({ color: 0xfcd34d }).stroke({ width: 1, color: 0x78350f });
    const fkBeacon = circle(0, -14 * s, 3 * s, { color: 0xfef08a, alpha: 0.95 });
    forklift.addChild(fkBody, fkBeacon);
    overlay.addChild(forklift);
    parts.forklift = { node: forklift, baseX: -24 * s, baseY: 44 * s, rangeX: 22 * s, rangeY: 13 * s };
  } else if (type === 'dealerShowroom') {
    const turntableRing = new PIXI.Container();
    turntableRing.x = -12 * s;
    turntableRing.y = 22 * s;
    turntableRing.scale.y = 0.56;
    const tg = new PIXI.Graphics();
    tg.circle(0, 0, 26 * s).stroke({ width: 2.5, color: 0xfacc15, alpha: 0.82 });
    tg.arc(0, 0, 26 * s, 0, Math.PI * 0.65).stroke({ width: 4, color: 0x35e58a, alpha: 0.95 });
    tg.arc(0, 0, 26 * s, Math.PI, Math.PI * 1.65).stroke({ width: 4, color: 0x38bdf8, alpha: 0.95 });
    turntableRing.addChild(tg);
    overlay.addChild(turntableRing);
    parts.turntableRing = turntableRing;

    const makeBeam = (bx, by) => {
      const b = new PIXI.Container();
      b.x = bx;
      b.y = by;
      const g = new PIXI.Graphics();
      g.poly([0, 0, -18 * s, -48 * s, 18 * s, -48 * s]).fill({ color: 0xfef08a, alpha: 0.24 });
      g.circle(0, 0, 4 * s).fill({ color: 0xffffff, alpha: 0.95 });
      b.addChild(g);
      return b;
    };
    const beamA = makeBeam(-54 * s, -42 * s);
    const beamB = makeBeam(2 * s, -74 * s);
    overlay.addChild(beamA, beamB);
    parts.searchlightA = beamA;
    parts.searchlightB = beamB;
  } else if (type === 'towDispatch') {
    const radarWave = new PIXI.Container();
    radarWave.x = -22 * s;
    radarWave.y = -56 * s;
    const rg = new PIXI.Graphics();
    rg.circle(0, 0, 18 * s).stroke({ width: 2, color: 0x38bdf8, alpha: 0.85 });
    rg.circle(0, 0, 10 * s).stroke({ width: 1.5, color: 0x67e8f9, alpha: 0.95 });
    radarWave.addChild(rg);
    overlay.addChild(radarWave);
    parts.radarWave = radarWave;

    const s1 = circle(-39 * s, -38 * s, 6 * s, { color: 0xf59e0b, alpha: 0.95 });
    const s2 = circle(28 * s, -15 * s, 6 * s, { color: 0xef4444, alpha: 0.95 });
    const s3 = circle(-3 * s, 16 * s, 5 * s, { color: 0xfacc15, alpha: 0.95 });
    overlay.addChild(s1, s2, s3);
    parts.strobes.push(s1, s2, s3);
  } else if (type === 'tireRepair') {
    const tireRotor = new PIXI.Container();
    tireRotor.x = -12 * s;
    tireRotor.y = -58 * s;
    tireRotor.scale.x = 0.82;
    const tg = new PIXI.Graphics();
    tg.circle(0, 0, 18 * s).stroke({ width: 3, color: 0x38bdf8, alpha: 0.92 });
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5;
      tg.moveTo(0, 0).lineTo(Math.cos(a) * 15 * s, Math.sin(a) * 15 * s).stroke({ width: 2.5, color: 0xfacc15, alpha: 0.95 });
    }
    tg.circle(0, 0, 4 * s).fill({ color: 0xfef08a });
    tireRotor.addChild(tg);
    overlay.addChild(tireRotor);
    parts.rotors.push(tireRotor);

    const f1 = makeIsoFanRotor(44 * s, -42 * s, 6 * s, 0x99f6e4);
    const f2 = makeIsoFanRotor(56 * s, -35 * s, 6 * s, 0x99f6e4);
    overlay.addChild(f1, f2);
    parts.rotors.push(f1, f2);
  } else if (type === 'privateShop') {
    for (const [fx, fy] of [[-46, -37], [-30, -47], [-14, -56], [2, -65]]) {
      const r = makeIsoFanRotor(fx * s, fy * s, 6.5 * s, 0xc4b5fd);
      overlay.addChild(r);
      parts.rotors.push(r);
    }
    const dynoFlame = new PIXI.Container();
    dynoFlame.x = -10 * s;
    dynoFlame.y = 22 * s;
    const fg = new PIXI.Graphics();
    fg.circle(0, 0, 10 * s).fill({ color: 0x38bdf8, alpha: 0.65 });
    fg.circle(-4 * s, 2 * s, 5 * s).fill({ color: 0xfacc15, alpha: 0.95 });
    dynoFlame.addChild(fg);
    overlay.addChild(dynoFlame);
    parts.dynoFlame = dynoFlame;
  } else if (type === 'salvageBlock') {
    const craneArm = new PIXI.Container();
    craneArm.x = 56 * s;
    craneArm.y = 4 * s;
    const cg = new PIXI.Graphics();
    cg.circle(0, 8 * s, 10 * s).fill({ color: 0xf97316, alpha: 0.85 }).stroke({ width: 2, color: 0xfef08a });
    cg.moveTo(-8 * s, 12 * s).lineTo(-12 * s, 20 * s).stroke({ width: 2, color: 0x38bdf8 });
    cg.moveTo(8 * s, 12 * s).lineTo(12 * s, 20 * s).stroke({ width: 2, color: 0x38bdf8 });
    craneArm.addChild(cg);
    overlay.addChild(craneArm);
    parts.craneArm = { node: craneArm, baseX: 56 * s, baseY: 4 * s };
  } else if (type === 'testTrack') {
    const f1 = makeIsoFanRotor(-14 * s, -54 * s, 6.5 * s, 0xe2e8f0);
    const f2 = makeIsoFanRotor(-2 * s, -48 * s, 6.5 * s, 0xe2e8f0);
    overlay.addChild(f1, f2);
    parts.rotors.push(f1, f2);

    const g1 = circle(-62 * s, -2 * s, 4.5 * s, { color: 0xef4444, alpha: 0.95 });
    const g2 = circle(-54 * s, -6 * s, 4.5 * s, { color: 0x22c55e, alpha: 0.95 });
    overlay.addChild(g1, g2);
    parts.strobes.push(g1, g2);

    const driftSmoke = circle(42 * s, 44 * s, 9 * s, { color: 0xe2e8f0, alpha: 0.55 });
    overlay.addChild(driftSmoke);
    parts.trackCar = { smoke: driftSmoke, baseX: 42 * s, baseY: 44 * s };
  } else if (type === 'streetKiosk') {
    const holo = new PIXI.Container();
    holo.x = 12 * s;
    holo.y = -32 * s;
    const hg = new PIXI.Graphics();
    hg.circle(0, 0, 14 * s).fill({ color: 0x35e58a, alpha: 0.22 }).stroke({ width: 2, color: 0x35e58a, alpha: 0.9 });
    hg.circle(0, 0, 5 * s).fill({ color: 0x67e8f9, alpha: 0.95 });
    holo.addChild(hg);
    overlay.addChild(holo);
    parts.holoSign = { node: holo, baseY: -32 * s };
  }

  return parts;
}

// 3D Extruded Isometric Diamond Plaza Pad under each building (Simpsons: Tapped Out / SimCity BuildIt style)
function drawIsoBuildingPlaza(w, h, ready = false, accentColor = 0x38bdf8) {
  const plaza = new PIXI.Graphics();
  const cx = w / 2;
  const cy = h / 2 + 14;
  const rx = Math.min(116, Math.max(76, w * 0.58));
  const ry = rx * 0.52;
  const wallH = 8;

  // 1. Soft Ambient Ground Shadow under the 3D Isometric Terrace
  plaza.poly([
    cx, cy - ry + 6,
    cx + rx + 8, cy + 6,
    cx, cy + ry + wallH + 8,
    cx - rx - 8, cy + 6
  ]).fill({ color: 0x040b14, alpha: 0.58 });

  // 2. 3D Extruded South-West Concrete Curb Wall (Sunlit Left Face)
  plaza.poly([
    cx - rx, cy,
    cx, cy + ry,
    cx, cy + ry + wallH,
    cx - rx, cy + wallH
  ]).fill({ color: 0x94a3b8, alpha: 0.98 });

  // 3. 3D Extruded South-East Concrete Curb Wall (Shaded Right Face)
  plaza.poly([
    cx, cy + ry,
    cx + rx, cy,
    cx + rx, cy + wallH,
    cx, cy + ry + wallH
  ]).fill({ color: 0x475569, alpha: 0.98 });

  // 4. Isometric Diamond Concrete Sidewalk Terrace Top
  plaza.poly([
    cx, cy - ry,
    cx + rx, cy,
    cx, cy + ry,
    cx - rx, cy
  ]).fill({ color: 0xdbe4ef, alpha: 0.96 })
    .stroke({ width: 2, color: 0xf8fafc, alpha: 0.95 });

  // 5. Inset Dark-Slate Asphalt Lot Pad matching the building's 2:1 diamond base
  const irx = rx * 0.84;
  const iry = ry * 0.84;
  plaza.poly([
    cx, cy - iry,
    cx + irx, cy,
    cx, cy + iry,
    cx - irx, cy
  ]).fill({ color: 0x1e293b, alpha: 0.95 })
    .stroke({ width: ready ? 2.5 : 1.5, color: ready ? 0x35e58a : accentColor, alpha: ready ? 0.92 : 0.58 });

  // 6. Flush Isometric SE Service Driveway Curb Cut inside the terrace rim
  plaza.poly([
    cx + irx * 0.30, cy + iry * 0.70,
    cx + irx * 0.68, cy + iry * 0.32,
    cx + rx * 0.68, cy + ry * 0.32,
    cx + rx * 0.30, cy + ry * 0.70
  ]).fill({ color: 0x334155, alpha: 0.92 })
    .stroke({ width: 1.2, color: 0xfacc15, alpha: 0.75 });

  // 7. Lush Isometric Corner Shrub Planters on West & East Diamond Points
  plaza.circle(cx - rx + 11, cy, 5.5).fill({ color: 0x22c55e, alpha: 0.95 }).stroke({ width: 1.2, color: 0x14532d });
  plaza.circle(cx + rx - 11, cy, 5.5).fill({ color: 0x16a34a, alpha: 0.95 }).stroke({ width: 1.2, color: 0x14532d });

  return plaza;
}

function buildingVisual({ x, y, wCells, hCells, type, name, alpha = 1, rotation = 0, buildingState = null, onCollect = null }) {
  const def = defByKey(type);
  const w = wCells * GRID.size;
  const h = hCells * GRID.size;
  const c = new PIXI.Container();
  c.sortableChildren = true;
  c.x = x;
  c.y = y;
  c.zIndex = y + 100;
  c.alpha = alpha;

  const status = buildingState ? collectStatus(buildingState, def) : { ready: false };

  // 3D Isometric Diamond Plaza Pad under the building (aligns the 2:1 diamond building flush with the city block!)
  const isoPlaza = drawIsoBuildingPlaza(w, h, status.ready, def.colorA || 0x38bdf8);
  isoPlaza.zIndex = 2;
  c.addChild(isoPlaza);

  // Subtle Pulsing Isometric Aura Ring
  const aura = new PIXI.Graphics();
  const auraColor = status.ready ? 0x35e58a : 0x38bdf8;
  aura.poly([
    w / 2, h + 22,
    w + 22, h / 2 + 16,
    w / 2, -6,
    -22, h / 2 + 16
  ]).stroke({ width: status.ready ? 2.8 : 1.4, color: auraColor, alpha: status.ready ? 0.85 : 0.32 });
  aura.zIndex = 4;
  c.addChild(aura);

  // Rigged Building Root (supports Clash-style squash & stretch bounce + animated mechanical sub-parts)
  const rigRoot = new PIXI.Container();
  rigRoot.sortableChildren = true;
  rigRoot.x = w / 2;
  rigRoot.y = h / 2 - 6;
  rigRoot.zIndex = 10;
  c.addChild(rigRoot);

  const spriteSize = Math.max(162, w * 1.36, h * 1.36);
  const art = assetSprite(buildingAssetForKey(type, name, buildingState?.level || 1), 0, 0, spriteSize, spriteSize, 1);
  if (art) {
    art.zIndex = 10;
    art.rotation = (Math.abs(Number(rotation) || 0) % 4) * Math.PI / 2;
    rigRoot.addChild(art);
  }

  const rigParts = attachClashBuildingRig(rigRoot, type, spriteSize);

  const labelPlate = new PIXI.Container();
  labelPlate.zIndex = 30;
  labelPlate.addChild(roundRect(8, h + 2, w - 16, 20, 10, { color: 0x04111d, alpha: 0.90 }, { width: 1.5, color: status.ready ? 0x35e58a : 0x38bdf8, alpha: 0.86 }));
  labelPlate.addChild(textLabel(name || def.shortName, w / 2, h + 12, 9.5, 0xf8fafc));
  c.addChild(labelPlate);

  const animRecord = {
    container: c,
    rigRoot,
    art,
    glowRing: aura,
    rigParts,
    ready: status.ready,
    bounceTimer: 0,
    phase: (x * 0.013 + y * 0.017) % (Math.PI * 2)
  };

  c.on('pointertap', () => {
    animRecord.bounceTimer = 0.42;
  });

  animRecord.collectBubble = addBuildingStatusBadges(c, w, h, buildingState, def, () => {
    animRecord.bounceTimer = 0.55;
    if (onCollect) onCollect();
  });

  animatedBuildings.push(animRecord);
  return c;
}

function makeVehicle({ color = 0xf97316, accent = 0xffffff, direction = 'east', truck = false, assetKey = 'compactCar', towTargetKey = '' }) {
  const bodyW = truck ? 64 : 56;
  const bodyH = truck ? 44 : 38;
  const car = new PIXI.Container();
  car.sortableChildren = true;
  const wheels = [];
  const chassis = new PIXI.Container();
  chassis.sortableChildren = true;
  car.addChild(chassis);

  // 1. Subtle Warm Headlight Ground Glow Cone in front of the 3D Isometric Vehicle
  const headlightBeam = new PIXI.Graphics();
  headlightBeam.poly([
    18, 4,
    56, -8,
    56, 22
  ]).fill({ color: 0xfef08a, alpha: 0.16 });
  headlightBeam.zIndex = 2;
  chassis.addChild(headlightBeam);

  // 2. True 30° Elevated 3D Isometric Vehicle Render (280x200 1.4:1 aspect ratio)
  // Raw spritesheet faces SW (bottom-left); mirror horizontally (scale.x < 0) and rotate -0.44 rad (-25°) so Eastbound faces straight right (+X) with full 3D roof/hood visibility!
  const spriteW = bodyW * 1.54;
  const spriteH = spriteW * (200 / 280);
  const art = assetSprite(vehicleAssetForKey(assetKey), 0, -2, spriteW, spriteH, 1);
  if (art) {
    art.scale.x = -Math.abs(art.scale.x);
    art.rotation = -0.44;
    art.zIndex = 10;
    chassis.addChild(art);
  } else {
    chassis.addChild(roundRect(-bodyW / 2, -bodyH / 2 + 3, bodyW, bodyH, 8, { color: 0x000000, alpha: 0.22 }));
    chassis.addChild(roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 8, color, { width: 2, color: 0x172033 }));
    chassis.addChild(roundRect(-bodyW / 2 + 8, -bodyH / 2 + 4, bodyW - 24, bodyH - 8, 5, accent, { width: 2, color: 0x172033 }));
  }

  // 3. Animated Exhaust Vapor Puff behind rear bumper
  const exhaustPuff = circle(-spriteW * 0.36, 4, 4.5, { color: 0xe2e8f0, alpha: 0.32 });
  exhaustPuff.zIndex = 8;
  chassis.addChild(exhaustPuff);
  car._exhaustPuff = exhaustPuff;

  if (assetKey === 'towTruck') {
    const strobeRed = circle(6, -16, 4.5, { color: 0xef4444, alpha: 0.90 });
    const strobeAmber = circle(12, -14, 4.5, { color: 0xfacc15, alpha: 0.90 });
    strobeRed.zIndex = 28;
    strobeAmber.zIndex = 28;
    chassis.addChild(strobeRed);
    chassis.addChild(strobeAmber);
    car._strobes = [strobeRed, strobeAmber];

    if (towTargetKey) {
      const towCable = new PIXI.Graphics();
      towCable.moveTo(-32, 0).lineTo(-58, 6).stroke({ width: 2.5, color: 0xfacc15, alpha: 0.95 });
      towCable.zIndex = 8;
      chassis.addChild(towCable);

      const towed = new PIXI.Container();
      towed.x = -76;
      towed.y = 2;
      towed.rotation = 0.06;
      towed.zIndex = 9;
      const towedArt = assetSprite(vehicleAssetForKey(towTargetKey), 0, 0, 78, 56, 0.98);
      if (towedArt) {
        towedArt.scale.x = -Math.abs(towedArt.scale.x);
        towedArt.rotation = -0.44;
        towed.addChild(towedArt);
      }
      chassis.addChild(towed);
    }
  }

  if (direction === 'west') car.scale.set(-1, 1);
  if (direction === 'north') car.rotation = -Math.PI / 2;
  if (direction === 'south') car.rotation = Math.PI / 2;
  car._wheels = wheels;
  car._chassis = chassis;
  return car;
}

function pathPoint(path, distance) {
  if (!path?.length) return { x: 0, y: 0, facing: 1 };
  if (path.length < 2) return { x: path[0].x, y: path[0].y, facing: 1 };
  let total = 0;
  const segs = [];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segs.push({ a, b, len });
    total += len;
  }
  if (!total) return { x: path[0].x, y: path[0].y, facing: 1 };
  let d = ((distance % total) + total) % total;
  for (const seg of segs) {
    if (d <= seg.len || seg === segs[segs.length - 1]) {
      const t = seg.len ? Math.min(1, d / seg.len) : 0;
      return {
        x: seg.a.x + (seg.b.x - seg.a.x) * t,
        y: seg.a.y + (seg.b.y - seg.a.y) * t,
        facing: seg.b.x >= seg.a.x ? 1 : -1
      };
    }
    d -= seg.len;
  }
  return { x: path[0].x, y: path[0].y, facing: 1 };
}

function sidewalkY(roadIndex, side) {
  const road = ROADS.horizontal[roadIndex];
  return side === 'north' ? road.y - ROADS.sidewalk / 2 : road.y + ROADS.width + ROADS.sidewalk / 2;
}

function sidewalkX(roadIndex, side) {
  const road = ROADS.vertical[roadIndex];
  return side === 'west' ? road.x - ROADS.sidewalk / 2 : road.x + ROADS.width + ROADS.sidewalk / 2;
}

function blockLoop(hIndex, colIndex = 1) {
  const top = sidewalkY(hIndex, 'south');
  const bottom = sidewalkY(Math.min(hIndex + 1, ROADS.horizontal.length - 1), 'north');
  const left = colIndex === 0
    ? 48
    : colIndex === 1
      ? sidewalkX(0, 'east')
      : sidewalkX(1, 'east');
  const right = colIndex === 0
    ? sidewalkX(0, 'west')
    : colIndex === 1
      ? sidewalkX(1, 'west')
      : WORLD.width - 48;
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
    { x: left, y: top }
  ];
}

function avenueLoop(roadIndex, side) {
  const y = sidewalkY(roadIndex, side);
  return [
    { x: 48, y },
    { x: sidewalkX(0, 'west'), y },
    { x: sidewalkX(0, 'east'), y },
    { x: sidewalkX(1, 'west'), y },
    { x: sidewalkX(1, 'east'), y },
    { x: WORLD.width - 48, y },
    { x: 48, y }
  ];
}

function laneY(index, lane) {
  const center = ROADS.horizontal[index].y + ROADS.width / 2;
  return lane === 'east' ? center + ROADS.laneOffset : center - ROADS.laneOffset;
}

function laneX(index, lane) {
  const center = ROADS.vertical[index].x + ROADS.width / 2;
  return lane === 'south' ? center + ROADS.laneOffset : center - ROADS.laneOffset;
}

function pathH(index, lane) {
  const y = laneY(index, lane);
  const pts = lane === 'east' ? [{ x: -80, y }, { x: WORLD.width + 80, y }] : [{ x: WORLD.width + 80, y }, { x: -80, y }];
  pts._axis = 'h';
  pts._index = index;
  pts._lane = lane;
  pts._len = WORLD.width + 160;
  return pts;
}

function pathV(index, lane) {
  const x = laneX(index, lane);
  const pts = lane === 'south' ? [{ x, y: -80 }, { x, y: WORLD.height + 80 }] : [{ x, y: WORLD.height + 80 }, { x, y: -80 }];
  pts._axis = 'v';
  pts._index = index;
  pts._lane = lane;
  pts._len = WORLD.height + 160;
  return pts;
}

function addTraffic(path, options) {
  const vehicle = makeVehicle(options);
  vehicle.scale.x *= options.scale || 0.72;
  vehicle.scale.y *= options.scale || 0.72;
  vehicle.zIndex = 100;
  world.addChild(vehicle);
  const baseSpeed = options.speed || 80;
  const pathLen = path._len || 1120;
  const startD = typeof options.startD === 'number' ? options.startD : Math.random() * 600;
  const trafficItem = {
    sprite: vehicle,
    path,
    pathLen,
    roadAxis: path._axis || 'h',
    roadIndex: path._index ?? 0,
    speed: baseSpeed,
    currentSpeed: baseSpeed,
    isBraking: false,
    pitchAngle: 0,
    d: ((startD % pathLen) + pathLen) % pathLen,
    wheelSpeed: baseSpeed / 10,
    assetKey: options.assetKey || 'skylineR34',
    direction: options.direction || path._lane || 'east',
    towTargetKey: options.towTargetKey || '',
    scale: options.scale || 0.80,
    isSelected: false,
    onTap: () => openVehicleInspector(trafficItem)
  };
  makeClickable(vehicle, () => openVehicleInspector(trafficItem));
  traffic.push(trafficItem);
}

function readSupplyState() {
  try {
    return JSON.parse(localStorage.getItem('autoMergeGarageV10LocalOnly') || '{}');
  } catch {
    return {};
  }
}

function supplyStatus(lineKey) {
  const save = readSupplyState();
  const runtime = personRuntimeState[lineKey] || {};
  const hired = runtime.hired !== undefined
    ? Boolean(runtime.hired)
    : Boolean(save.idleLines?.managers?.[lineKey] || save.worldHiredPeople?.[lineKey]);
  return {
    level: Math.max(hired ? 1 : 0, Number(runtime.lineLevel || save.idleLines?.lines?.[lineKey]?.level || 0)),
    hired
  };
}


function managerDialogue(staff) {
  const status = supplyStatus(staff.lineKey);
  const score = relationshipScore(staff.lineKey);
  const running = status.hired
    ? `${staff.business} is covered. I am collecting it. We are at level ${status.level}.`
    : `Nobody is running ${staff.business} yet. It is level ${status.level}. Hire me from Supplies and I will collect it.`;
  const trusted = score >= 40
    ? `You have been straight with me. ${staff.business} is in better shape because of it.`
    : `I stay on ${staff.business} while you race. You still buy the levels. I only collect.`;
  return {
    greet: {
      text: running,
      choices: [
        { id: 'job', label: 'What do you do?', next: 'job' },
        { id: 'rumor', label: 'Heard anything?', next: 'rumor' },
        { id: 'trade', label: 'Want to trade?', next: 'trade' },
        { id: 'pay', label: 'How does the pay work?', next: 'pay' },
        { id: 'later', label: 'Later', next: 'brush' }
      ]
    },
    job: {
      text: trusted,
      choices: [
        { id: 'shops', label: 'Open Supplies', screen: 'lines', next: 'sent' },
        { id: 'more', label: 'What if I hire you?', next: 'hire' },
        { id: 'back', label: 'Back', next: 'greet' }
      ]
    },
    pay: {
      text: 'The supply pays the shop, not me. My cut is the route staying open.',
      choices: [
        { id: 'help', label: 'That is fair', next: 'hire' },
        { id: 'back', label: 'Back', next: 'greet' }
      ]
    },
    hire: {
      text: status.hired ? 'I am already hired. Leave the levels to you and the collecting to me.' : `Hire me once ${staff.business} is high enough. Then this route runs while you are gone.`,
      friend: `We are good. Keep buying levels and I will not let ${staff.business} sit full.`,
      choices: [
        { id: 'shops', label: 'Open Supplies', screen: 'lines', next: 'sent' },
        { id: 'secret', label: 'Watch the route for me', next: 'secret', need: 40 },
        { id: 'back', label: 'Back', next: 'greet' }
      ]
    },
    secret: {
      text: `I will keep an eye on ${staff.business} and wave you down if it stalls.`,
      partner: `Partner's word. If ${staff.business} stalls, I am the first person you see.`,
      choices: [
        { id: 'back', label: 'I am counting on you', next: 'greet' },
        { id: 'close', label: 'See you on the route', screen: 'close' }
      ]
    },
    locked: {
      text: 'Ask me that when we are friends. Help the route a little first.',
      choices: [{ id: 'back', label: 'Alright', next: 'hire' }]
    },
    sent: {
      text: 'I will keep walking this sidewalk. Come back when the supply changes.',
      choices: [
        { id: 'back', label: 'Keep talking', next: 'greet' },
        { id: 'close', label: 'See you', screen: 'close' }
      ]
    },
    brush: {
      text: 'The route does not pause because you do. I will be here.',
      choices: [
        { id: 'back', label: 'Sorry. Go on.', next: 'greet' },
        { id: 'close', label: 'Later', screen: 'close' }
      ]
    },
    trade: {
      text: 'I can spare a little from the route, or buy what you are hauling.',
      topic: 'Trade',
      choices: [{ id: 'back', label: 'Back to the talk', next: 'greet' }]
    },
    rumor: {
      text: `People on this sidewalk keep asking if ${staff.business} is actually running.`,
      topic: 'Rumor',
      choices: [
        { id: 'more', label: 'What are they saying?', next: 'stake' },
        { id: 'city', label: 'Does the city know my name?', next: 'city', need: 35, needKind: 'rep' },
        { id: 'back', label: 'Back', next: 'greet' }
      ]
    },
    stake: {
      text: status.hired
        ? `They say it is running because I am on it. Level ${status.level} is the part they can see.`
        : `They say it is idle. Level ${status.level} and no one hired. That story travels.`,
      topic: 'Rumor',
      choices: [
        { id: 'shops', label: 'Open Supplies', screen: 'lines', next: 'sent' },
        { id: 'help', label: 'I will fix that', next: 'hire' },
        { id: 'back', label: 'Back', next: 'rumor' }
      ]
    },
    city: {
      text: 'Yes. Your name is attached to the shops now. A stalled route makes both of us look bad.',
      topic: 'City',
      partner: 'They say partner, not boss. Keep the route moving and I will keep saying it.',
      choices: [
        { id: 'shops', label: 'Open Supplies', screen: 'lines', next: 'sent' },
        { id: 'back', label: 'Back', next: 'rumor' }
      ]
    },
    repLocked: {
      text: 'Not yet. The city still talks about the shops, not about you.',
      topic: 'Locked',
      choices: [{ id: 'back', label: 'Alright', next: 'rumor' }]
    }
  };
}

function npcById(id) {
  return SUPPLY_MANAGERS.find((staff) => staff.lineKey === id) || RESIDENT_WANTS.find((resident) => resident.key === id) || null;
}

function supplyManagerByLine(lineKey) {
  return SUPPLY_MANAGERS.find((staff) => staff.lineKey === lineKey) || null;
}

function currentNpcNode(person) {
  const id = person.lineKey || person.key;
  const book = person.lineKey ? managerDialogue(person) : NPC_DIALOGUE[person.key];
  const step = npcStep[id] || 'greet';
  return book?.[step] || book?.greet || { text: person.want || person.business || 'Hey.', choices: [] };
}

function spokenText(node, score) {
  if (score >= 70 && node.partner) return node.partner;
  if (score >= 40 && node.friend) return node.friend;
  return node.text;
}

function renderNpcTalk(person) {
  const id = person.lineKey || person.key;
  const node = currentNpcNode(person);
  const score = relationshipScore(id);
  const rank = relationshipRank(score);
  const replies = (node.choices || []).map((choice) => `<button type="button" class="btn small" onclick="window.replyToNpc?.('${id}','${choice.id}')">${escapeHtml(choice.label)}</button>`).join('');
  const market = (npcStep[id] || 'greet') === 'trade' ? renderNpcMarket(person) : '';
  return `<div class="npcTalk"><div class="npcBond"><b>${rank}</b><span><i style="width:${score}%"></i></span><small>${score}</small></div><em class="npcTopic">${escapeHtml(node.topic || 'Talk')}</em><p>${escapeHtml(spokenText(node, score))}</p>${market}${lastBondNote ? `<em>${escapeHtml(lastBondNote)}</em>` : ''}<div class="npcReplies">${replies}</div></div>`;
}

const NPC_MARKET = {
  residentBlue: { sell: [{ key: 'parts', name: 'Tire patch', price: 22, stock: 4 }], buy: [{ key: 'scrap', name: 'Scrap rubber', price: 8, stock: 6 }] },
  residentGreen: { sell: [{ key: 'parts', name: 'Boxed parts', price: 16, stock: 6 }], buy: [{ key: 'tools', name: 'Spare tools', price: 14, stock: 4 }] },
  residentOrange: { sell: [{ key: 'tools', name: 'Shop tools', price: 24, stock: 3 }], buy: [{ key: 'parts', name: 'Loose parts', price: 9, stock: 5 }] },
  residentPurple: { sell: [{ key: 'rep', name: 'Buyer lead', price: 30, stock: 3 }], buy: [{ key: 'scrap', name: 'Lot scrap', price: 7, stock: 5 }] },
  mechanic: { sell: [{ key: 'tools', name: 'Toolkit', price: 20, stock: 4 }], buy: [{ key: 'parts', name: 'Job parts', price: 10, stock: 5 }] },
  driver: { sell: [{ key: 'scrap', name: 'Tow scrap', price: 12, stock: 5 }], buy: [{ key: 'fuelCans', name: 'Fuel can', price: 18, stock: 3 }] },
  streetRoute: { sell: [{ key: 'coins', name: 'Route tip', price: 0, stock: 0 }], buy: [{ key: 'parts', name: 'Route parts', price: 11, stock: 5 }] },
  partsDelivery: { sell: [{ key: 'parts', name: 'Delivery parts', price: 14, stock: 5 }], buy: [{ key: 'tools', name: 'Courier tools', price: 12, stock: 4 }] },
  mobileMechanic: { sell: [{ key: 'tools', name: 'Service tools', price: 18, stock: 4 }], buy: [{ key: 'parts', name: 'Service parts', price: 9, stock: 5 }] },
  fuelRun: { sell: [{ key: 'fuelCans', name: 'Fuel can', price: 26, stock: 3 }], buy: [{ key: 'scrap', name: 'Pump scrap', price: 6, stock: 5 }] },
  towingJob: { sell: [{ key: 'scrap', name: 'Yard scrap', price: 11, stock: 6 }], buy: [{ key: 'fuelCans', name: 'Tow fuel', price: 16, stock: 3 }] },
  dealerShowcase: { sell: [{ key: 'rep', name: 'Showroom lead', price: 28, stock: 3 }], buy: [{ key: 'parts', name: 'Detail parts', price: 10, stock: 4 }] }
};

function tradeRate(score) {
  const personal = score >= 70 ? 0.25 : score >= 40 ? 0.15 : score >= 20 ? 0.05 : 0;
  const city = cityReputation();
  const civic = city >= 85 ? 0.1 : city >= 60 ? 0.06 : city >= 35 ? 0.03 : 0;
  return Math.min(0.35, personal + civic);
}

function tradeBook(id) {
  return NPC_MARKET[id] || { sell: [], buy: [] };
}

function freshTrade(id) {
  const book = tradeBook(id);
  const slots = {};
  book.sell.forEach((item) => { if (item.stock > 0) slots[`sell:${item.key}`] = item.stock; });
  book.buy.forEach((item) => { slots[`buy:${item.key}`] = item.stock; });
  return { at: Date.now(), slots };
}

function tradeState(id) {
  const now = Date.now();
  const save = readSupplyState();
  const stored = tradeCache[id] || save.npcTrade?.[id];
  if (!stored?.at || now - stored.at > 15 * 60 * 1000) {
    tradeCache[id] = freshTrade(id);
    return tradeCache[id];
  }
  tradeCache[id] = { at: stored.at, slots: { ...stored.slots } };
  return tradeCache[id];
}

function playerPurse() {
  if (!purseCache.ready) {
    const save = readSupplyState();
    Object.assign(purseCache, save.currencies || {}, { ready: true });
  }
  return purseCache;
}

function tradePrice(price, score, selling) {
  const rate = tradeRate(score);
  const next = selling ? price * (1 - rate) : price * (1 + rate);
  return Math.max(1, Math.round(next));
}

function renderNpcMarket(person) {
  const id = person.lineKey || person.key;
  const book = tradeBook(id);
  const stock = tradeState(id);
  const score = relationshipScore(id);
  const row = (item, side) => {
    const left = stock.slots?.[`${side}:${item.key}`] ?? 0;
    const price = tradePrice(item.price, score, side === 'sell');
    const verb = side === 'sell' ? 'Buy' : 'Sell';
    return `<button type="button" class="npcTradeRow" onclick="window.tradeWithNpc?.('${id}','${side}','${item.key}')" ${left > 0 ? '' : 'disabled'}><b>${verb} ${escapeHtml(item.name)}</b><span>${price} coins · ${left} left</span></button>`;
  };
  const selling = book.sell.filter((item) => item.stock > 0).map((item) => row(item, 'sell')).join('');
  const buying = book.buy.map((item) => row(item, 'buy')).join('');
  return `<div class="npcMarket">${selling}${buying}</div>`;
}

window.tradeWithNpc = (id, side, key) => {
  const book = tradeBook(id);
  const item = (side === 'sell' ? book.sell : book.buy).find((entry) => entry.key === key);
  const person = npcById(id);
  if (!item || !person) return;
  const stock = tradeState(id);
  const slot = `${side}:${key}`;
  const left = stock.slots?.[slot] ?? 0;
  if (left < 1) {
    lastBondNote = 'Nothing left';
  } else {
    const price = tradePrice(item.price, relationshipScore(id), side === 'sell');
    const purse = playerPurse();
    const pay = side === 'sell' ? { coins: price } : { [key]: item.qty || 1 };
    const gain = side === 'sell' ? { [key]: item.qty || 1 } : { coins: price };
    const short = Object.entries(pay).some(([resource, amount]) => (purse[resource] || 0) < amount);
    if (short) {
      lastBondNote = 'Not enough for that';
    } else {
      Object.entries(pay).forEach(([resource, amount]) => { purse[resource] = (purse[resource] || 0) - amount; });
      Object.entries(gain).forEach(([resource, amount]) => { purse[resource] = (purse[resource] || 0) + amount; });
      stock.slots[slot] = left - 1;
      tradeCache[id] = stock;
      const spentKey = `trade:${id}:${slot}`;
      if (!spentBond.has(spentKey)) {
        spentBond.add(spentKey);
        shiftRelationship(id, person.name, 2);
      }
      lastBondNote = `${side === 'sell' ? 'Bought' : 'Sold'} ${item.name}${lastReputationDelta ? ` · Rep ${lastReputationDelta > 0 ? '+' : ''}${lastReputationDelta}` : ''}`;
      lastReputationDelta = 0;
      window.dispatchEvent(new CustomEvent('npc-trade', {
        detail: { id, pay, gain, stock, note: lastBondNote }
      }));
    }
  }
  if (selectedSupplyKey) refreshSupplyManagerSheet();
  else if (selectedResidentKey) refreshOpenResidentSheet();
};

function relationshipScore(id) {
  if (typeof relationshipCache[id] === 'number') return relationshipCache[id];
  const save = readSupplyState();
  return Math.max(0, Math.min(100, Number(save.relationships?.[id] || 0)));
}

function relationshipRank(score) {
  if (score >= 70) return 'Partner';
  if (score >= 40) return 'Friend';
  if (score >= 20) return 'Neighbor';
  return 'Stranger';
}

let reputationCache = null;

function cityReputation() {
  if (typeof reputationCache === 'number') return reputationCache;
  const save = readSupplyState();
  reputationCache = Math.max(0, Math.min(100, Number(save.reputation || 0)));
  return reputationCache;
}

function reputationTitle(score) {
  if (score >= 85) return 'Famous';
  if (score >= 60) return 'Respected';
  if (score >= 35) return 'Known';
  if (score >= 15) return 'Local';
  return 'Unknown';
}

function bondFor(choice) {
  if (choice.screen === 'close') return 0;
  if (choice.id === 'later' || choice.next === 'brush') return -5;
  if (choice.id === 'race') return -3;
  return 8;
}

function shiftRelationship(id, name, delta) {
  const prev = relationshipScore(id);
  const score = Math.max(0, Math.min(100, prev + delta));
  relationshipCache[id] = score;
  let gift = null;
  if (score >= 70 && prev < 70) gift = 'partner';
  else if (score >= 40 && prev < 40) gift = 'friend';
  const repDelta = delta > 0 ? Math.max(1, Math.round(delta / 2)) : Math.min(-1, Math.round(delta / 2));
  const reputation = Math.max(0, Math.min(100, cityReputation() + repDelta));
  reputationCache = reputation;
  lastReputationDelta = repDelta;
  window.dispatchEvent(new CustomEvent('npc-relationship', { detail: { id, name, score, delta, gift, reputation } }));
  updateHud();
  return score;
}

window.replyToNpc = (id, choiceId) => {
  const person = npcById(id);
  if (!person) return;
  const step = npcStep[id] || 'greet';
  const choice = (currentNpcNode(person).choices || []).find((item) => item.id === choiceId);
  if (!choice) return;
  if (choice.need && (choice.needKind === 'rep' ? cityReputation() : relationshipScore(id)) < choice.need) {
    npcStep[id] = choice.needKind === 'rep' ? 'repLocked' : 'locked';
    lastBondNote = choice.needKind === 'rep' ? 'Need a higher city name' : 'Need more trust';
  } else {
    const delta = bondFor(choice);
    const spentKey = `${id}:${step}:${choice.id}`;
    const gained = delta > 0 && spentBond.has(spentKey) ? 0 : delta;
    if (delta > 0) spentBond.add(spentKey);
    if (gained) shiftRelationship(id, person.name, gained);
    const repBit = lastReputationDelta ? ` · Rep ${lastReputationDelta > 0 ? '+' : ''}${lastReputationDelta}` : '';
    lastBondNote = gained > 0 ? `Trust +${gained}${repBit}` : gained < 0 ? `Trust ${gained}${repBit}` : '';
    lastReputationDelta = 0;
    if (choice.next) npcStep[id] = choice.next;
    if (choice.screen === 'close') {
      window.closeMobileResidentSheetSafe?.();
      return;
    }
    if (choice.screen === 'lines') window.openSupplyFromWorld?.();
    if (choice.screen === 'garage') document.querySelector('.pixiWorldProxy[data-proxy="garage"]')?.click();
    if (choice.screen === 'race') document.querySelector('.pixiWorldProxy[data-proxy="race"]')?.click();
  }
  if (selectedSupplyKey) refreshSupplyManagerSheet();
  else if (selectedResidentKey) refreshOpenResidentSheet();
};

function createAnimatedPersonSprite(personKey, width = 52, height = 68) {
  const frameSources = personAnimationFramesForKey(personKey);
  const firstSrc = frameSources[0] || personAssetForKey(personKey);
  if (!firstSrc) return { sprite: null, frameTextures: [] };
  const sprite = PIXI.Sprite.from(firstSrc);
  sprite.anchor.set(0.5, 0.94);
  sprite.x = 0;
  sprite.y = 4;
  sprite.width = width;
  sprite.height = height;
  const frameTextures = frameSources.map((src) => PIXI.Texture.from(src)).filter(Boolean);
  return { sprite, frameTextures };
}

function updatePersonWalkVisual(item, point) {
  if (!item?.sprite) return;
  const facing = point?.facing || 1;
  if (item.art) {
    const baseWidth = item.artBaseWidth || 52;
    const baseHeight = item.artBaseHeight || 68;
    const strideCycle = (item.d || 0) * 0.14;
    const bounceY = Math.abs(Math.sin(strideCycle)) * 2.2;
    const lean = Math.sin(strideCycle) * 0.035 * facing;
    item.art.width = baseWidth;
    item.art.height = baseHeight;
    item.art.y = 4 - bounceY;
    item.art.rotation = lean;
    item.art.scale.x = Math.abs(item.art.scale.x) * facing;
    if (item.frameTextures?.length) {
      const frameIndex = Math.floor((item.d || 0) / 10) % item.frameTextures.length;
      if (item.walkFrame !== frameIndex) {
        item.walkFrame = frameIndex;
        item.art.texture = item.frameTextures[frameIndex];
      }
    }
  } else {
    item.sprite.scale.x = Math.abs(item.sprite.scale.x) * facing;
  }
}

function addSupplyWalker(path, staff, customStartD = null) {
  const p = new PIXI.Container();
  p.sortableChildren = true;
  p.addChild(roundRect(-14, -2, 28, 9, 4.5, { color: 0x04111d, alpha: 0.36 }));
  const { sprite: art, frameTextures } = createAnimatedPersonSprite(staff.key, 54, 70);
  if (art) {
    art.zIndex = 10;
    p.addChild(art);
  }
  const tag = textLabel(staff.name, 0, -72, 9.5, 0x1b1408);
  const backing = roundRect(-38, -81, 76, 17, 8.5, 0xf6c445, { width: 1.5, color: 0x0f172a });
  backing.zIndex = 20;
  tag.zIndex = 21;
  p.addChild(backing);
  p.addChild(tag);
  p.scale.set(0.92);
  makeClickable(p, () => openResidentSheet(staff));
  world.addChild(p);
  const startD = typeof customStartD === 'number' ? customStartD : Math.random() * 800;
  const walkerItem = {
    sprite: p,
    art,
    frameTextures,
    artBaseWidth: 54,
    artBaseHeight: 70,
    walkFrame: 0,
    path,
    d: startD,
    speed: 40,
    staff,
    personId: staff.lineKey || staff.key,
    isSelected: false,
    onTap: () => openResidentSheet(staff)
  };
  updatePersonWalkVisual(walkerItem, pathPoint(path, startD));
  walkers.push(walkerItem);
}

function renderSupplyManagerSheet(staff) {
  return renderResidentSheet(staff);
}

function openSupplyManager(staff) {
  openResidentSheet(staff);
}

function refreshSupplyManagerSheet() {
  const staff = supplyManagerByLine(selectedSupplyKey);
  if (!staff) return;
  openResidentSheet(staff, true);
}

function addWalker(path, resident = RESIDENT_WANTS[0], shirt = 0x2563eb, customStartD = null) {
  const p = new PIXI.Container();
  p.sortableChildren = true;
  p.addChild(roundRect(-14, -2, 28, 9, 4.5, { color: 0x04111d, alpha: 0.36 }));
  const { sprite: art, frameTextures } = createAnimatedPersonSprite(resident.key, 52, 68);
  if (art) {
    art.zIndex = 10;
    p.addChild(art);
  } else {
    p.addChild(roundRect(-8, -11, 16, 22, 7, shirt, { width: 2, color: 0x1e293b }));
  }
  const bubble = assetSprite(WORLD_ASSETS.ui.wantBubble, 18, -66, 28, 16, 0.92);
  if (bubble) {
    bubble.zIndex = 20;
    p.addChild(bubble);
  }
  p.scale.set(0.90);
  makeClickable(p, () => openResidentSheet(resident));
  world.addChild(p);
  const startD = typeof customStartD === 'number' ? customStartD : Math.random() * 800;
  const walkerItem = {
    sprite: p,
    art,
    frameTextures,
    artBaseWidth: 52,
    artBaseHeight: 68,
    walkFrame: 0,
    path,
    d: startD,
    speed: 46,
    resident,
    personId: resident.lineKey || resident.key,
    isSelected: false,
    onTap: () => openResidentSheet(resident)
  };
  updatePersonWalkVisual(walkerItem, pathPoint(path, startD));
  walkers.push(walkerItem);
}

function roadRects() {
  return [
    ...ROADS.horizontal.map((road) => ({ x: 0, y: road.y - ROADS.sidewalk, w: WORLD.width, h: ROADS.width + ROADS.sidewalk * 2 })),
    ...ROADS.vertical.map((road) => ({ x: road.x - ROADS.sidewalk, y: 0, w: ROADS.width + ROADS.sidewalk * 2, h: WORLD.height }))
  ];
}

function buildingRects() {
  const fixed = CITY_BUILDINGS.map((b) => ({ x: b.x, y: b.y, w: b.w * GRID.size, h: b.h * GRID.size }));
  const placed = placedBuildings.filter((b) => !(mode === 'moving' && movingBuilding?.id === b.id)).map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h }));
  return [...fixed, ...placed];
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function gridRect(col, row, w = 1, h = 1) {
  return { x: col * GRID.size, y: row * GRID.size, w: w * GRID.size, h: h * GRID.size };
}

function canBuild(col, row, def = selectedDef(), rotation = selectedRotation) {
  const fp = currentFootprint(def, rotation);
  const box = gridRect(col, row, fp.footprintW, fp.footprintH);
  if (box.x < 0 || box.y < 0 || box.x + box.w > WORLD.width || box.y + box.h > WORLD.height) return false;
  return ![...roadRects(), ...buildingRects()].some((blocked) => overlaps(box, blocked));
}

function placedCount(type) {
  return placedBuildings.filter((item) => item.type === type).length;
}

function ownedRemaining(type) {
  return Math.max(0, syncedOwnedCount(type) - placedCount(type));
}

function normalizePlacedBuilding(item) {
  const def = defByKey(item.type);
  const normalized = normalizeBuildingState(item, item.type);
  const rotation = Math.abs(Number(item.rotation) || 0) % 4;
  const fp = currentFootprint(def, rotation);
  return {
    ...normalized,
    rotation,
    name: item.name || def.shortName,
    w: fp.footprintW * GRID.size,
    h: fp.footprintH * GRID.size
  };
}

function loadPlaced() {
  try { placedBuildings = JSON.parse(localStorage.getItem(GRID.storageKey) || '[]'); }
  catch { placedBuildings = []; }
  placedBuildings = placedBuildings.map(normalizePlacedBuilding);
}

function savePlaced() {
  localStorage.setItem(GRID.storageKey, JSON.stringify(placedBuildings));
}

function publishWorldOpenState() {
  const sync = getBuildSync();
  const cityNeeds = cityNeedStats();
  const cityConditions = cityConditionStats();
  const selectedResident = selectedResidentKey ? residentByKey(selectedResidentKey) : null;
  const selectedResidentMood = selectedResident ? residentMood(selectedResident) : null;
  window.__worldOpenWorldState = {
    mode,
    selectedBuilding: selectedKey,
    selectedRotation,
    placedCount: placedBuildings.length,
    fixedBuildingCount: CITY_BUILDINGS.length,
    readyBuildingCount: collectReadyCount(),
    poorBuildingCount: problemBuildings(null, true).length,
    unlockedPlotCount: unlockedPlotCount(),
    totalPlotCount: TOWN_EXPANSION_PLOTS.length,
    unlockedPlots: { ...unlockedTownPlots },
    selectedBuildingTarget,
    selectedResidentKey,
    selectedResidentMenu,
    selectedVehicleKey: selectedVehicleItem?.assetKey || null,
    selectedResidentMood: selectedResidentMood ? {
      score: selectedResidentMood.score,
      label: selectedResidentMood.label,
      baseScore: selectedResidentMood.baseScore,
      factors: selectedResidentMood.factors.map((factor) => ({
        key: factor.key,
        label: factor.label,
        score: Math.round(factor.score || 0),
        weight: factor.weight || 0,
        count: factor.count || 0
      }))
    } : null,
    residentHappinessAverage: cityNeeds.average,
    residentNeedsMet: `${cityNeeds.metCount}/${cityNeeds.total}`,
    residentNeedsStrained: cityNeeds.strainedCount,
    cityConditions: Object.fromEntries(Object.entries(cityConditions).map(([key, value]) => [key, { score: value.score, count: value.count }])),
    trafficCount: traffic.length,
    walkerCount: walkers.length,
    residentWantCount: RESIDENT_WANTS.length,
    assetMappedCount: WORLD_ASSET_LIST.length,
    buildSyncWorldInventory: sync?.worldInventory || {},
    buildSyncPlacements: totalSyncedWorldInventory(),
    buildSyncLines: `${sync?.unlockedLineCount || 0}/${sync?.totalLineCount || 0}`
  };
}

function updateHud() {
  const badge = document.querySelector('[data-mobile-city-mode]');
  const help = document.querySelector('[data-mobile-city-help]');
  const tray = document.querySelector('[data-build-tray]');
  const sheet = document.querySelector('[data-placed-sheet]');
  const residentSheet = document.querySelector('[data-resident-sheet]');
  const vehicleSheet = document.querySelector('[data-vehicle-sheet]');
  const confirm = document.querySelector('[data-confirm-row]');
  const syncTotal = document.querySelector('[data-build-sync-total]');
  const syncLines = document.querySelector('[data-build-sync-lines]');
  const expandCount = document.querySelector('[data-town-expansion-count]');
  const hud = document.querySelector('.mobileCityHud');
  if (hud) {
    hud.classList.toggle('build-mode', mode !== 'normal');
    if (mode !== 'normal') hud.classList.remove('building-open', 'resident-open', 'vehicle-open');
  }
  if (badge) badge.textContent = mode === 'placing' ? 'Build Mode' : mode === 'moving' ? 'Move Mode' : 'Normal';
  if (help) help.textContent = mode === 'normal' ? 'Tap buildings to collect, inspect, and upgrade. Tap any vehicle or resident to inspect.' : mode === 'placing' ? 'Tap a green cell to preview placement.' : 'Tap a green cell to preview the new location.';
  if (tray) tray.hidden = mode === 'normal';
  if (sheet && mode !== 'normal') sheet.hidden = true;
  if (residentSheet && mode !== 'normal') residentSheet.hidden = true;
  if (vehicleSheet && mode !== 'normal') vehicleSheet.hidden = true;
  if (confirm) confirm.hidden = !pendingPlacement;
  if (syncTotal) syncTotal.textContent = `+${totalSyncedWorldInventory()} world`;
  if (expandCount) expandCount.textContent = `${unlockedPlotCount()}/${TOWN_EXPANSION_PLOTS.length}`;
  if (syncLines) {
    const sync = getBuildSync();
    syncLines.textContent = `${sync?.unlockedLineCount || 0}/${sync?.totalLineCount || 0} linked supplies`;
  }
  const repScore = cityReputation();
  const repRank = document.querySelector('[data-city-reputation-rank]');
  const repBar = document.querySelector('[data-city-reputation-bar]');
  const repValue = document.querySelector('[data-city-reputation-score]');
  if (repRank) repRank.textContent = reputationTitle(repScore);
  if (repBar) repBar.style.width = `${repScore}%`;
  if (repValue) repValue.textContent = String(repScore);
  document.querySelectorAll('[data-building-key]').forEach((button) => {
    const key = button.getAttribute('data-building-key');
    button.classList.toggle('primary', key === selectedKey);
    button.classList.toggle('ghost', key !== selectedKey);
    button.disabled = ownedRemaining(key) <= 0 && mode !== 'moving';
  });
  document.querySelectorAll('[data-owned-count]').forEach((span) => span.textContent = String(ownedRemaining(span.getAttribute('data-owned-count'))));
  const selected = document.querySelector('[data-selected-building]');
  const fp = currentFootprint(selectedDef(), selectedRotation);
  if (selected) selected.textContent = `${selectedDef().name} / ${fp.footprintW}x${fp.footprintH}`;
  const rotation = document.querySelector('[data-selected-rotation]');
  if (rotation) rotation.textContent = `${selectedRotation * 90} deg`;
  if (gridLayer) gridLayer.visible = mode === 'placing' || mode === 'moving';
  publishWorldOpenState();
}

function refreshBuildSync() {
  buildSync = readBuildCommunicationState() || buildSync;
  if (world && gridLayer) rebuildGrid();
  updateHud();
}

window.addEventListener('build-communication-updated', (event) => {
  buildSync = event.detail || readBuildCommunicationState() || buildSync;
  refreshBuildSync();
});

window.addEventListener('storage', (event) => {
  if (event.key === BUILD_COMMUNICATION_STORAGE_KEY) refreshBuildSync();
});

function sync3DBuildings() {
  if (!threeViewport) return;
  const fixedList = CITY_BUILDINGS.map((building) => {
    const id = fixedId(building);
    const target = buildingTargetForFixed(building);
    const def = defByKey(building.type);
    const state = fixedBuildingStates[id] || normalizeBuildingState({}, building.type);
    const status = collectStatus(state, def);
    const yieldAmt = buildingYield(state, def);
    const isSelected = targetMatches(selectedBuildingTarget, target);
    return {
      x: building.x,
      y: building.y,
      w: building.w * GRID.size,
      h: building.h * GRID.size,
      type: building.type,
      name: building.label,
      level: state.level || 1,
      ready: status.ready,
      selected: isSelected,
      statusText: status.ready ? `READY +${yieldAmt}` : formatDuration(status.msLeft),
      rotation: 0,
      alpha: 1,
      onTap: () => {
        if (status.ready) collectBuildingTarget(target);
        openFixedBuildingSheet(building);
      }
    };
  });

  const placedList = placedBuildings.map((item) => {
    const def = defByKey(item.type);
    const target = { kind: 'placed', id: item.id };
    const fp = currentFootprint(def, item.rotation || 0);
    const status = collectStatus(item, def);
    const yieldAmt = buildingYield(item, def);
    const isSelected = targetMatches(selectedBuildingTarget, target);
    return {
      x: item.x,
      y: item.y,
      w: fp.footprintW * GRID.size,
      h: fp.footprintH * GRID.size,
      type: item.type,
      name: item.name,
      level: item.level || 1,
      ready: status.ready,
      selected: isSelected,
      statusText: status.ready ? `READY +${yieldAmt}` : formatDuration(status.msLeft),
      rotation: item.rotation || 0,
      alpha: mode === 'moving' && movingBuilding?.id === item.id ? 0.35 : 1,
      onTap: () => {
        if (status.ready) collectBuildingTarget(target);
        openPlacedSheet(item.id);
      }
    };
  });

  threeViewport.rebuildBuildings3D(fixedList, placedList);
}

function sync3DGrid() {
  if (!threeViewport) return;
  const visible = mode === 'placing' || mode === 'moving';
  const cells = [];
  if (visible) {
    const cols = Math.floor(WORLD.width / GRID.size);
    const rows = Math.floor(WORLD.height / GRID.size);
    const def = selectedDef();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const ok = canBuild(col, row, def);
        const cell = gridRect(col, row);
        cells.push({
          x: cell.x,
          y: cell.y,
          w: GRID.size,
          h: GRID.size,
          ok,
          onTap: ok ? () => previewPlacement(col, row) : null
        });
      }
    }
  }
  let ghostDesc = null;
  if (pendingPlacement) {
    const def = defByKey(pendingPlacement.type);
    const fp = currentFootprint(def, pendingPlacement.rotation || 0);
    ghostDesc = {
      x: pendingPlacement.x,
      y: pendingPlacement.y,
      w: fp.footprintW * GRID.size,
      h: fp.footprintH * GRID.size,
      type: def.key,
      name: def.shortName,
      level: 1,
      ready: false,
      statusText: 'PREVIEW',
      rotation: pendingPlacement.rotation || 0,
      alpha: 0.65
    };
  }
  threeViewport.rebuildGrid3D(visible, cells, ghostDesc);
}

function clearGhost() {
  if (ghostLayer) ghostLayer.removeChildren();
  sync3DGrid();
}

function drawGhost() {
  if (ghostLayer) ghostLayer.removeChildren();
  if (pendingPlacement && ghostLayer) {
    const def = defByKey(pendingPlacement.type);
    const fp = currentFootprint(def, pendingPlacement.rotation || 0);
    ghostLayer.addChild(buildingVisual({ x: pendingPlacement.x, y: pendingPlacement.y, wCells: fp.footprintW, hCells: fp.footprintH, type: def.key, name: def.shortName, alpha: 0.62, rotation: pendingPlacement.rotation || 0 }));
  }
  sync3DGrid();
}

function rebuildFixedBuildings() {
  if (!world) return;
  animatedBuildings = [];
  if (fixedLayer) fixedLayer.destroy({ children: true });
  fixedLayer = new PIXI.Container();
  fixedLayer.zIndex = 3500;
  world.addChild(fixedLayer);
  for (const building of CITY_BUILDINGS) {
    const id = fixedId(building);
    const target = buildingTargetForFixed(building);
    fixedBuildingStates[id] = normalizeBuildingState(fixedBuildingStates[id], building.type);
    const visual = buildingVisual({
      x: building.x,
      y: building.y,
      wCells: building.w,
      hCells: building.h,
      type: building.type,
      name: building.label,
      buildingState: fixedBuildingStates[id],
      onCollect: () => collectBuildingTarget(target)
    });
    makeClickable(visual, () => openFixedBuildingSheet(building));
    fixedLayer.addChild(visual);
  }
  sync3DBuildings();
}

function rebuildPlacements() {
  if (placementLayer) placementLayer.destroy({ children: true });
  placementLayer = new PIXI.Container();
  placementLayer.zIndex = 4000;
  world.addChild(placementLayer);
  for (const item of placedBuildings) {
    const def = defByKey(item.type);
    const target = { kind: 'placed', id: item.id };
    const fp = currentFootprint(def, item.rotation || 0);
    const visual = buildingVisual({ x: item.x, y: item.y, wCells: fp.footprintW, hCells: fp.footprintH, type: item.type, name: item.name, alpha: mode === 'moving' && movingBuilding?.id === item.id ? 0.25 : 1, rotation: item.rotation || 0, buildingState: item, onCollect: () => collectBuildingTarget(target) });
    makeClickable(visual, () => openPlacedSheet(item.id));
    placementLayer.addChild(visual);
  }
  sync3DBuildings();
}

// Expandable Town Unlockable Frontier Plots (Simpsons: Tapped Out / SimCity BuildIt / Town City style)
function rebuildExpansions() {
  if (!world) return;
  if (expansionLayer) expansionLayer.destroy({ children: true });
  expansionLayer = new PIXI.Container();
  expansionLayer.sortableChildren = true;
  expansionLayer.zIndex = 3200;
  world.addChild(expansionLayer);
  expansionAnims = [];

  TOWN_EXPANSION_PLOTS.forEach((plot, idx) => {
    const unlocked = isPlotUnlocked(plot.id);
    const node = new PIXI.Container();
    node.sortableChildren = true;
    node.x = plot.x;
    node.y = plot.y;
    node.zIndex = plot.y + 50;

    const cx = plot.w / 2;
    const cy = plot.h / 2;
    const rx = plot.w * 0.48;
    const ry = plot.h * 0.44;

    if (!unlocked) {
      // Locked Frontier Land Plot: 3D Isometric Surveyed Parcel with Dashed Boundary & "EXPAND TOWN" Billboard
      const g = new PIXI.Graphics();
      // Shaded uncultivated frontier turf diamond
      g.poly([
        cx, cy - ry,
        cx + rx, cy,
        cx, cy + ry,
        cx - rx, cy
      ]).fill({ color: 0x0f241d, alpha: 0.68 })
        .stroke({ width: 2.5, color: 0xfacc15, alpha: 0.88 });

      // Inner surveyor grid diamond
      g.poly([
        cx, cy - ry * 0.72,
        cx + rx * 0.72, cy,
        cx, cy + ry * 0.72,
        cx - rx * 0.72, cy
      ]).stroke({ width: 1.4, color: plot.color || 0x38bdf8, alpha: 0.55 });

      // 4 Isometric Corner Surveyor Stakes
      for (const [sx, sy] of [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]]) {
        g.roundRect(sx - 3, sy - 9, 6, 12, 2).fill({ color: 0xfacc15 }).stroke({ width: 1, color: 0x0f172a });
        g.circle(sx, sy - 10, 3.5).fill({ color: 0xef4444 });
      }
      node.addChild(g);

      // Floating 3D "EXPAND TOWN" Interactive Signboard
      const sign = new PIXI.Container();
      sign.x = cx;
      sign.y = cy;
      sign.zIndex = 20;
      sign.addChild(roundRect(-74, -27, 148, 54, 12, { color: 0x06131d, alpha: 0.94 }, { width: 2, color: 0xfacc15, alpha: 0.96 }));
      sign.addChild(roundRect(-64, -22, 128, 15, 7, { color: plot.color || 0x38bdf8, alpha: 0.24 }));
      sign.addChild(textLabel(`LOCKED · ${plot.name.toUpperCase()}`, 0, -14.5, 7.5, 0xfef08a));
      sign.addChild(textLabel(plot.bonus, 0, 1, 8, 0xe2e8f0));
      sign.addChild(roundRect(-54, 10, 108, 14, 7, { color: 0x35e58a, alpha: 0.92 }));
      sign.addChild(textLabel(`TAP TO EXPAND (${plot.cost}G)`, 0, 17, 7.2, 0x052e16));
      node.addChild(sign);

      makeClickable(node, () => window.unlockTownPlotSafe?.(plot.id));
      expansionAnims.push({ sign, baseY: cy, phase: idx * 1.3 });
    } else {
      // Unlocked 3D Isometric Developed District Plaza!
      const plaza = drawIsoBuildingPlaza(plot.w, plot.h, true, plot.color || 0x35e58a);
      node.addChild(plaza);

      // 3D Isometric VIP Showcase Turntable + Unlocked Fleet Vehicles on the Expanded District Plaza
      const turntable = new PIXI.Graphics();
      turntable.ellipse(cx, cy - 2, 46, 23).fill({ color: 0x0f172a, alpha: 0.92 }).stroke({ width: 2, color: plot.color || 0x35e58a, alpha: 0.88 });
      turntable.ellipse(cx, cy - 2, 34, 17).stroke({ width: 1.2, color: 0xfacc15, alpha: 0.55 });
      node.addChild(turntable);

      const showcaseKeys = {
        harborPier: ['blueCar', 'rallyCar'],
        techLogistics: ['superCar', 'deliveryVan'],
        salvageAnnex: ['towTruck', 'greenTruck'],
        autoMallPlaza: ['naMuscle', 'superCar'],
        motorsportPark: ['jdmGtCoupe', 'rallyCar']
      }[plot.id] || ['blueCar', 'naMuscle'];

      const carL = assetSprite(vehicleAssetForKey(showcaseKeys[0]), cx - 22, cy - 6, 78, 56, 1);
      const carR = assetSprite(vehicleAssetForKey(showcaseKeys[1]), cx + 24, cy + 4, 78, 56, 1);
      if (carL) node.addChild(carL);
      if (carR) node.addChild(carR);

      // Decorative Lush Trees on the Newly Expanded Plaza
      const treeL = assetSprite(WORLD_ASSETS.props.tree, cx - rx * 0.62, cy - 10, 52, 62, 1);
      const treeR = assetSprite(WORLD_ASSETS.props.tree, cx + rx * 0.62, cy - 10, 52, 62, 1);
      if (treeL) node.addChild(treeL);
      if (treeR) node.addChild(treeR);

      const badge = new PIXI.Container();
      badge.x = cx;
      badge.y = cy + ry * 0.54;
      badge.zIndex = 25;
      badge.addChild(roundRect(-78, -12, 156, 24, 12, { color: 0x04111d, alpha: 0.94 }, { width: 1.8, color: 0x35e58a, alpha: 0.95 }));
      badge.addChild(textLabel(`UNLOCKED · ${plot.name.toUpperCase()}`, 0, -4, 7.2, 0x8fffc2));
      badge.addChild(textLabel(plot.bonus, 0, 5.5, 6.8, 0xfef08a));
      node.addChild(badge);
    }

    expansionLayer.addChild(node);
  });

  if (threeViewport) {
    threeViewport.rebuildExpansions3D(TOWN_EXPANSION_PLOTS, isPlotUnlocked, (plotId) => window.unlockTownPlotSafe?.(plotId));
  }
}

function focusWorldPoint(wx, wy) {
  if (!world || !app) return;
  const viewW = app.renderer.width / app.renderer.resolution;
  const viewH = app.renderer.height / app.renderer.resolution;
  world.x = Math.round(viewW * 0.5 - wx);
  world.y = Math.round(viewH * 0.5 - wy);
  clamp();
}

window.focusTownPlotSafe = (plotId) => {
  const plot = TOWN_EXPANSION_PLOTS.find((p) => p.id === plotId) || TOWN_EXPANSION_PLOTS[0];
  if (!plot) return false;
  focusWorldPoint(plot.x + plot.w / 2, plot.y + plot.h / 2);
  return true;
};

window.unlockTownPlotSafe = (plotId) => {
  const plot = TOWN_EXPANSION_PLOTS.find((p) => p.id === plotId);
  if (!plot) return false;
  if (!unlockedTownPlots[plot.id]) {
    const purse = playerPurse();
    if ((purse.coins || 0) >= plot.cost) {
      purse.coins -= plot.cost;
    }
    unlockedTownPlots[plot.id] = true;
    saveTownExpansions();
    reputationCache = Math.min(100, cityReputation() + 6);
  }
  focusWorldPoint(plot.x + plot.w / 2, plot.y + plot.h / 2);
  rebuildExpansions();
  rebuildGrid();
  updateHud();
  return true;
};

window.unlockNextTownPlotSafe = () => {
  const nextPlot = TOWN_EXPANSION_PLOTS.find((p) => !isPlotUnlocked(p.id));
  if (!nextPlot) {
    window.focusTownPlotSafe?.(TOWN_EXPANSION_PLOTS[0]?.id);
    return false;
  }
  return window.unlockTownPlotSafe(nextPlot.id);
};

const CITY_ISSUE_MARKERS = {
  potholes: [
    { x: 420, y: 295 }, { x: 525, y: 589 }, { x: 420, y: 909 }, { x: 825, y: 589 }
  ],
  vehicleBreakdowns: [
    { x: 565, y: 234 }, { x: 155, y: 864 }, { x: 825, y: 1194 }, { x: 425, y: 544 }
  ],
  stuckVehicles: [
    { x: 825, y: 544 }, { x: 165, y: 1194 }, { x: 825, y: 234 }, { x: 465, y: 1194 }
  ],
  trafficJams: [
    { x: 145, y: 589 }, { x: 555, y: 909 }, { x: 155, y: 1239 }, { x: 555, y: 1239 }
  ],
  trafficLights: [
    { x: 289, y: 279 }, { x: 699, y: 589 }, { x: 289, y: 909 }, { x: 699, y: 1239 }
  ]
};

function issueShortLabel(key) {
  return {
    potholes: 'POTHOLE',
    vehicleBreakdowns: 'TOW OPS',
    stuckVehicles: 'STUCK',
    trafficJams: 'JAM',
    trafficLights: 'LIGHT'
  }[key] || 'CITY';
}

function issueColor(key) {
  return {
    potholes: 0xf97316,
    vehicleBreakdowns: 0xef4444,
    stuckVehicles: 0xf59e0b,
    trafficJams: 0x7c3aed,
    trafficLights: 0x38bdf8
  }[key] || 0x22c55e;
}

function rebuildIncidents() {
  if (!world) return;
  if (incidentLayer) incidentLayer.destroy({ children: true });
  incidentLayer = new PIXI.Container();
  incidentLayer.sortableChildren = true;
  incidentLayer.zIndex = 4300;
  world.addChild(incidentLayer);
  incidentAnims = [];
  activePotholePositions = [];
  const incidentDescriptors3D = [];

  const conditions = cityConditionStats();
  for (const [key, positions] of Object.entries(CITY_ISSUE_MARKERS)) {
    const condition = conditions[key];
    const count = Math.min(condition?.count || 0, positions.length);
    for (let i = 0; i < count; i++) {
      const pos = positions[i];
      const marker = new PIXI.Container();
      marker.sortableChildren = true;
      marker.x = pos.x;
      marker.y = pos.y;
      marker.zIndex = pos.y + 900;

      const roadsideVehicleModels = ['mustangFastback', 'towTruck', 'rx7Spirit', 'silviaS15'];
      const handleIncidentTap = () => {
        if (key === 'vehicleBreakdowns' || key === 'stuckVehicles') {
          const modelKey = roadsideVehicleModels[i % roadsideVehicleModels.length] || 'towTruck';
          const liveMatch = traffic.find((t) => t.assetKey === modelKey) || traffic[0];
          openVehicleInspector({
            ...(liveMatch || {}),
            assetKey: modelKey,
            direction: 'west',
            speed: 0,
            currentSpeed: 0,
            isBraking: true,
            isRoadsideIncident: true,
            incidentKey: key,
            incidentScore: condition.score,
            roadsideX: pos.x,
            roadsideY: pos.y
          });
          return;
        }
        window.openCityIssueMenuSafe?.(key);
      };

      incidentDescriptors3D.push({
        key,
        x: pos.x,
        y: pos.y,
        score: condition.score,
        onTap: handleIncidentTap
      });

      if (key === 'potholes') {
        activePotholePositions.push({ x: pos.x, y: pos.y });
        const ring = new PIXI.Graphics();
        ring.ellipse(0, 2, 22, 12).fill({ color: 0xf97316, alpha: 0.14 }).stroke({ width: 1.5, color: 0xf97316, alpha: 0.68 });
        marker.addChild(ring);
        const crater = assetSprite(WORLD_ASSETS.props.potholeCrater, 0, 0, 56, 38, 0.98);
        if (crater) marker.addChild(crater);

        const badge = new PIXI.Container();
        badge.y = -22;
        badge.addChild(roundRect(-32, -8, 64, 16, 8, { color: 0x04111d, alpha: 0.90 }, { width: 1.2, color: 0xf97316, alpha: 0.9 }));
        badge.addChild(textLabel(`POTHOLE ${condition.score}%`, 0, 0, 7, 0xfed7aa));
        marker.addChild(badge);
        incidentAnims.push({ type: 'pothole', marker, ring, phase: i * 1.4 });
      } else if (key === 'vehicleBreakdowns' || key === 'stuckVehicles') {
        const ring = new PIXI.Graphics();
        ring.ellipse(0, 4, 34, 16).fill({ color: 0xef4444, alpha: 0.10 }).stroke({ width: 1.5, color: 0xfacc15, alpha: 0.65 });
        marker.addChild(ring);

        const towRig = new PIXI.Container();
        towRig.x = -24;
        towRig.y = -2;
        const towArt = assetSprite(WORLD_ASSETS.vehicles.towTruck, 0, 0, 72, 50, 1);
        if (towArt) {
          towArt.rotation = 0.44;
          towRig.addChild(towArt);
        }
        const strobe = circle(6, -12, 4, { color: 0xfacc15, alpha: 0.95 });
        towRig.addChild(strobe);
        marker.addChild(towRig);

        const winchCable = new PIXI.Graphics();
        winchCable.moveTo(-2, -2).lineTo(14, 2).stroke({ width: 2, color: 0xfacc15, alpha: 0.95 });
        marker.addChild(winchCable);

        const broken = new PIXI.Container();
        broken.x = 24;
        broken.y = 2;
        broken.rotation = -0.06;
        const brokenArt = assetSprite(WORLD_ASSETS.props.brokenCar, 0, 0, 64, 38, 1);
        if (brokenArt) broken.addChild(brokenArt);
        const hazardLight = circle(-18, 2, 3.5, { color: 0xf97316, alpha: 0.95 });
        broken.addChild(hazardLight);
        marker.addChild(broken);

        const smokeA = circle(14, -10, 5, { color: 0xcbd5e1, alpha: 0.65 });
        const smokeB = circle(19, -18, 7, { color: 0x94a3b8, alpha: 0.45 });
        marker.addChild(smokeA);
        marker.addChild(smokeB);

        const badge = new PIXI.Container();
        badge.y = -26;
        badge.addChild(roundRect(-36, -8, 72, 16, 8, { color: 0x04111d, alpha: 0.92 }, { width: 1.2, color: 0xfacc15, alpha: 0.92 }));
        badge.addChild(textLabel(`TOW OPS · ${condition.score}%`, 0, 0, 7, 0xfef08a));
        marker.addChild(badge);

        incidentAnims.push({
          type: 'towRecovery',
          marker,
          ring,
          broken,
          winchCable,
          strobe,
          hazardLight,
          smokeA,
          smokeB,
          phase: i * 1.9
        });
      } else {
        // Sleek Isometric Roadside Alert Pill + Traffic Cone (no giant flat circle!)
        const ring = new PIXI.Graphics();
        ring.ellipse(0, 6, 18, 9).fill({ color: issueColor(key), alpha: 0.18 }).stroke({ width: 1.5, color: issueColor(key), alpha: 0.75 });
        marker.addChild(ring);
        const cone = assetSprite(WORLD_ASSETS.props.roadCone, -14, 2, 18, 22, 0.98);
        if (cone) marker.addChild(cone);
        marker.addChild(roundRect(-28, -12, 56, 18, 9, { color: 0x04111d, alpha: 0.92 }, { width: 1.5, color: issueColor(key), alpha: 0.92 }));
        marker.addChild(textLabel(`${issueShortLabel(key)} ${condition.score}%`, 2, -3, 7, 0xf8fafc));
        incidentAnims.push({ type: 'signal', marker, ring, phase: i * 1.1 });
      }

      makeClickable(marker, handleIncidentTap);
      incidentLayer.addChild(marker);
    }
  }

  if (threeViewport) {
    threeViewport.rebuildIncidents3D(incidentDescriptors3D);
  }
}

function rebuildGrid() {
  if (!world) return;
  if (gridLayer) gridLayer.destroy({ children: true });
  gridLayer = new PIXI.Container();
  gridLayer.zIndex = 5000;
  gridLayer.visible = mode === 'placing' || mode === 'moving';
  world.addChild(gridLayer);
  const cols = Math.floor(WORLD.width / GRID.size);
  const rows = Math.floor(WORLD.height / GRID.size);
  const def = selectedDef();
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const ok = canBuild(col, row, def);
      const cell = gridRect(col, row);
      const g = rect(cell.x + 1, cell.y + 1, GRID.size - 2, GRID.size - 2, { color: ok ? 0x35e58a : 0xff5d73, alpha: ok ? 0.10 : 0.18 }, { width: 1, color: ok ? 0x8fffc2 : 0xff9aaa, alpha: 0.32 });
      if (ok) {
        g.eventMode = 'static';
        g.cursor = 'copy';
        g.on('pointertap', () => previewPlacement(col, row));
      }
      gridLayer.addChild(g);
    }
  }
  sync3DGrid();
}

function previewPlacement(col, row) {
  if (dragMoved) return;
  const def = selectedDef();
  if (!canBuild(col, row, def, selectedRotation)) return;
  pendingPlacement = { type: def.key, x: col * GRID.size, y: row * GRID.size, rotation: selectedRotation };
  drawGhost();
  updateHud();
}

window.previewMobilePlacementSafe = (col, row) => {
  if (mode !== 'placing' && mode !== 'moving') return false;
  previewPlacement(col, row);
  return Boolean(pendingPlacement);
};

let selectedBuildingTab = 'overview';
let lastBuildingActionNote = '';

function dispatchWorldBuildingSync(detail = {}) {
  const perks = computeWorldBuildingPerks();
  const cityAvg = cityNeedStats().average;
  window.dispatchEvent(new CustomEvent('world-building-sync', {
    detail: {
      worldBuildingPerks: perks,
      cityAverageHappiness: cityAvg,
      ...detail
    }
  }));
}

function focusBuildingTargetOnMap(target) {
  const record = getBuildingRecord(target);
  if (!record) return;
  if (record.fixed) {
    const cx = record.fixed.x + (record.fixed.w * GRID.size) / 2;
    const cy = record.fixed.y + (record.fixed.h * GRID.size) / 2;
    focusWorldPoint(cx + 35, cy + 165);
  } else if (record.item) {
    const fp = currentFootprint(record.def, record.item.rotation || 0);
    const cx = record.item.x + (fp.footprintW * GRID.size) / 2;
    const cy = record.item.y + (fp.footprintH * GRID.size) / 2;
    focusWorldPoint(cx + 35, cy + 165);
  }
}

function renderBuildingOverviewTab(record, ctx) {
  const { item, def } = record;
  const {
    level, stock, health, happiness, power, tierCode,
    yieldAmount, secYield, cycleNow, req, service, wm,
    raceBuffVal, nextLevelYield, nextCycleMs, nextHappiness, nextRaceBuffVal
  } = ctx;

  const modesHtml = Object.values(BUILDING_WORK_MODES).map((m) => {
    const active = wm.key === m.key;
    return `
      <button class="buildingWorkModeBtn ${active ? 'active' : ''}" onclick="window.setBuildingWorkModeSafe?.('${m.key}')">
        <div class="wmTop">
          <span class="wmIcon">${m.icon}</span>
          <strong>${escapeHtml(m.shortLabel)}</strong>
          ${active ? '<em class="wmActiveTag">ACTIVE</em>' : ''}
        </div>
        <small>${escapeHtml(m.desc)}</small>
      </button>
    `;
  }).join('');

  const stockTone = stock >= 70 ? 'green' : stock >= 40 ? 'yellow' : 'red';
  const healthTone = health >= 76 ? 'green' : health >= 45 ? 'yellow' : 'red';
  const drainPerCycle = (def.stockDrain || 10) + (wm.drainAdd || 0);

  return `
    <div class="buildingTabPane" data-building-tab-pane="overview">
      <div class="buildingSectionBlock">
        <div class="buildingSectionHead">
          <span>⚙️ Production Work Order</span>
          <small>Active: <b>${escapeHtml(wm.label)}</b></small>
        </div>
        <div class="buildingWorkModeBar">
          ${modesHtml}
        </div>
      </div>

      <div class="buildingTelemetryGrid">
        <div class="buildingTelemetryCard">
          <div class="telHead"><span>📦 Stock Supply</span><strong class="tone-${stockTone}" data-placed-stock>${stock}%</strong></div>
          <div class="buildingMiniMeter"><i class="tone-${stockTone}" style="width:${stock}%" data-placed-stock-meter></i></div>
          <small>${stock < 70 ? '⚠️ Restock recommended' : 'Optimal supply'} · -${drainPerCycle}%/run</small>
        </div>
        <div class="buildingTelemetryCard">
          <div class="telHead"><span>🛠️ Building Health</span><strong class="tone-${healthTone}">${health}%</strong></div>
          <div class="buildingMiniMeter"><i class="tone-${healthTone}" style="width:${health}%"></i></div>
          <small>${health < 76 ? '⚠️ Needs maintenance' : 'Structural integrity high'}</small>
        </div>
        <div class="buildingTelemetryCard">
          <div class="telHead"><span>😊 City Happiness</span><strong class="tone-green">+${happiness}</strong></div>
          <small>District Service Score: <b>${service.score}%</b> (${service.count} lot${service.count === 1 ? '' : 's'})</small>
        </div>
        <div class="buildingTelemetryCard">
          <div class="telHead"><span>⚡ Tycoon Valuation</span><strong class="tone-cyan">${power.toLocaleString()} PWR</strong></div>
          <small>Tier Rating: <b>${tierCode}</b> · Runs: <b>${item.collected || 0}</b></small>
        </div>
      </div>

      <div class="buildingUpgradePreviewCard ${req.met ? 'ready' : req.maxed ? 'maxed' : 'locked'}">
        <div class="upPreviewHead">
          <div>
            <span class="upKicker">${req.maxed ? 'MAX TIER ACHIEVED' : `NEXT LEVEL BLUEPRINT · LV ${level} → LV ${req.nextLevel}`}</span>
            <h4>${req.maxed ? `${escapeHtml(def.name)} (Max Lv ${level})` : `Upgrade to Level ${req.nextLevel} (${req.coinCost} Coins)`}</h4>
          </div>
          <span class="upStatusBadge ${req.met ? 'ready' : req.maxed ? 'maxed' : 'locked'}">
            ${req.maxed ? '★ MAXED' : req.met ? '✅ READY' : '⚡ INSTANT UPGRADE AVAILABLE'}
          </span>
        </div>
        ${req.maxed ? `
          <p class="upMaxedCopy">This building is operating at peak architectural capacity with maximum output and district synergy.</p>
        ` : `
          <div class="upDeltaGrid">
            <div>
              <span>Primary Yield</span>
              <b>+${yieldAmount} → <em>+${nextLevelYield} ${escapeHtml(def.outputLabel)}</em></b>
            </div>
            <div>
              <span>Secondary Bonus</span>
              <b>+${secYield.amount} → <em>+${secYield.amount + 1} ${escapeHtml(secYield.label)}</em></b>
            </div>
            <div>
              <span>Cycle Time</span>
              <b>${formatDuration(cycleNow)} → <em>${formatDuration(nextCycleMs)}</em></b>
            </div>
            <div>
              <span>Happiness &amp; Race</span>
              <b>+${happiness} Happy · <em>+${nextRaceBuffVal}% ${escapeHtml(def.raceBuffLabel)}</em></b>
            </div>
          </div>
          <div class="upReqPills">
            <span class="upReqPill ${req.stockMet ? 'met' : 'short'}">
              ${req.stockMet ? '✅' : '⚠️'} Stock ${stock}% / ${req.stockNeed}%
            </span>
            <span class="upReqPill ${req.collectMet ? 'met' : 'short'}">
              ${req.collectMet ? '✅' : '⚠️'} Runs ${item.collected || 0} / ${req.collectNeed}
            </span>
            <span class="upReqPill met">
              🪙 Cost: ${req.coinCost} Coins
            </span>
          </div>
        `}
      </div>
    </div>
  `;
}

function renderBuildingStaffTab(record, ctx) {
  const { def, fixed } = record;
  const { staffMult, cycleReduction, upgradeDiscount, incomeBoost } = ctx;
  const { leadStaff, people } = buildingLinkedPeople(def, fixed);
  const leadProfile = personProfile(leadStaff);

  const rowsHtml = people.map((person) => {
    const id = person.lineKey || person.key;
    const mood = residentMood(person);
    const prof = mood.profile;
    const isLead = (leadStaff?.lineKey || leadStaff?.key) === id;
    return `
      <div class="buildingStaffCard ${prof.hired ? 'is-hired' : 'is-unemployed'}">
        <div class="bStaffPortraitWrap">
          <img src="${personAssetForKey(id)}" alt="${escapeHtml(person.name)}" loading="eager">
          <span class="bStaffStateDot ${prof.hired ? 'hired' : 'unemployed'}"></span>
        </div>
        <div class="bStaffMain">
          <div class="bStaffTitleRow">
            <strong>${escapeHtml(person.name)}</strong>
            ${isLead ? '<span class="bStaffLeadTag">LEAD MANAGER</span>' : '<span class="bStaffSpecTag">SPECIALIST</span>'}
            <span class="bStaffJobBadge ${prof.hired ? 'hired' : 'unemployed'}">
              ${prof.hired ? `HIRED LV ${prof.level}` : 'UNEMPLOYED'}
            </span>
          </div>
          <small class="bStaffJobSub">${escapeHtml(person.jobTitle || 'Operations Crew')} · ${escapeHtml(prof.primarySkillLabel)} <b>${prof.primarySkillValue}%</b></small>
          <div class="bStaffHappinessRow">
            <span>Happiness: <b class="tone-${mood.key}">${mood.score}% ${escapeHtml(mood.label)}</b></span>
            <span>Building Buff: <b>+${prof.worldYieldBonus}% Yield</b></span>
          </div>
          <div class="buildingMiniMeter"><i class="tone-${mood.key}" style="width:${mood.score}%"></i></div>
        </div>
        <div class="bStaffActions">
          ${!prof.hired ? `
            <button class="btn small primary" onclick="window.hireBuildingPersonSafe?.('${escapeHtml(id)}')">Hire (${prof.hireCost}c)</button>
          ` : `
            <button class="btn small gold" onclick="window.trainBuildingPersonSafe?.('${escapeHtml(id)}')">Train Lv ${prof.level + 1} (${prof.trainCost}c)</button>
            <button class="btn small ghost" onclick="window.boostBuildingPersonSafe?.('${escapeHtml(id)}')">Morale +12%</button>
          `}
          <button class="btn small ghost" onclick="window.inspectBuildingPersonSafe?.('${escapeHtml(id)}')">Inspect</button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="buildingTabPane" data-building-tab-pane="staff">
      <div class="buildingStaffSummaryBanner">
        <div class="bStaffSumTop">
          <div>
            <span class="upKicker">ASSIGNED BUILDING WORKFORCE</span>
            <h4>Staff Synergy Multiplier: <em>×${staffMult.toFixed(2)}</em></h4>
          </div>
          <span class="bAutoBadge ${leadProfile.hired ? 'on' : 'off'}">
            ${leadProfile.hired ? '⚡ AUTO-COLLECT ACTIVE' : '👤 MANUAL COLLECTION'}
          </span>
        </div>
        <div class="bStaffBuffPills">
          <div><span>Cycle Speed</span><b>-${cycleReduction}%</b></div>
          <div><span>Upgrade Discount</span><b>-${upgradeDiscount}%</b></div>
          <div><span>Output Bonus</span><b>+${incomeBoost}%</b></div>
        </div>
      </div>

      <div class="buildingStaffList">
        ${rowsHtml}
      </div>
    </div>
  `;
}

function renderBuildingModesTab(record, ctx) {
  const { item, def, fixed } = record;
  const { yieldAmount, secYield, raceBuffVal, service } = ctx;
  const lineKey = fixed?.lineKey || def.lineKey || 'streetRoute';
  const leadStaff = supplyManagerByLine(lineKey) || SUPPLY_MANAGERS[0];
  const supStatus = supplyStatus(lineKey);
  const conditions = cityConditionStats();
  const issueKey = def.cityIssueKey || 'mapBuild';
  const issueCond = conditions[issueKey] || conditions.mapBuild || { label: 'City Service', score: 78, count: 0 };

  return `
    <div class="buildingTabPane" data-building-tab-pane="modes">
      <div class="buildingModesIntro">
        <span>🌐 Cross-Mode Tycoon Synergy</span>
        <small>Upgrading, stocking, and staffing <b>${escapeHtml(def.shortName)}</b> actively powers all 4 game modes.</small>
      </div>

      <div class="buildingGameModesGrid">
        <div class="buildingModeCard mode-world">
          <div class="bModeHead">
            <span class="bModeIcon">🏙️</span>
            <div>
              <strong>World City &amp; Street Care</strong>
              <small>${escapeHtml(def.cityEffectLabel || 'District Coverage')}</small>
            </div>
            <em class="bModeVal">${issueCond.score}%</em>
          </div>
          <p>Satisfies resident need: <b>"${escapeHtml(def.want)}"</b>. District coverage is <b>${service.score}%</b> (${issueCond.count || 0} active street alerts).</p>
          <div class="bModeFoot">
            <button class="btn small ghost" onclick="window.openCityIssueMenuSafe?.('${escapeHtml(issueKey)}')">Inspect Street Issue</button>
          </div>
        </div>

        <div class="buildingModeCard mode-supply">
          <div class="bModeHead">
            <span class="bModeIcon">🏭</span>
            <div>
              <strong>Supply Line: ${escapeHtml(leadStaff?.business || 'Service Line')}</strong>
              <small>Line Lv ${supStatus.level || 1} · ${supStatus.hired ? 'Manager Active' : 'Unassigned'}</small>
            </div>
            <em class="bModeVal">+${Math.round(service.score * 0.28)}%</em>
          </div>
          <p>Feeds stock &amp; automation into your <b>${escapeHtml(leadStaff?.business || 'Supply Line')}</b> idle business empire.</p>
          <div class="bModeFoot">
            <button class="btn small primary" onclick="window.syncBuildingSupplyLineSafe?.()">⚡ Boost Supply Line (45c)</button>
            <button class="btn small ghost" onclick="window.openSupplyFromWorld?.()">Open Supplies</button>
          </div>
        </div>

        <div class="buildingModeCard mode-race">
          <div class="bModeHead">
            <span class="bModeIcon">🏁</span>
            <div>
              <strong>Road Runner Race Perk</strong>
              <small>${escapeHtml(def.raceBuffLabel || 'Route Pace')}</small>
            </div>
            <em class="bModeVal">+${raceBuffVal}%</em>
          </div>
          <p>${escapeHtml(def.raceBuffDesc || 'Boosts vehicle performance in Road Runner.')} Synced live to your race crew telemetry.</p>
          <div class="bModeFoot">
            <button class="btn small gold" onclick="window.openPersonGameScreenSafe?.('race')">Launch Road Race</button>
          </div>
        </div>

        <div class="buildingModeCard mode-merge">
          <div class="bModeHead">
            <span class="bModeIcon">🔩</span>
            <div>
              <strong>Merge Bay &amp; 365 Workshop</strong>
              <small>${escapeHtml(def.mergeBuffLabel || 'Workshop Supply')}</small>
            </div>
            <em class="bModeVal">+${secYield.amount * 2} ${escapeHtml(secYield.label)}</em>
          </div>
          <p>${escapeHtml(def.mergeBuffDesc || 'Supplies bonus parts & toolkits.')} Crates claimed from this building: <b>${item.cratesClaimed || 0}</b>.</p>
          <div class="bModeFoot">
            <button class="btn small primary" onclick="window.claimBuildingWorkshopCrateSafe?.()">📦 Claim Crate (+${secYield.amount * 2} ${escapeHtml(secYield.label)})</button>
            <button class="btn small ghost" onclick="window.openPersonGameScreenSafe?.('merge')">Open Merge Bay</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderBuildingDistrictTab(target) {
  const allRecords = allBuildingRecords();
  const readyCount = allRecords.filter((r) => collectStatus(r.item, r.def).ready).length;
  const lowStockCount = allRecords.filter((r) => (r.item.stock ?? 80) < 95).length;
  const damagedCount = allRecords.filter((r) => (r.item.health ?? 88) < 95).length;

  const rowsHtml = allRecords.map((rec) => {
    const isCurrent = targetMatches(target, rec.target);
    const st = collectStatus(rec.item, rec.def);
    const yAmt = buildingYield(rec.item, rec.def);
    const token = targetToken(rec.target);
    const stock = Math.round(rec.item.stock ?? 80);
    const health = Math.round(rec.item.health ?? 88);
    return `
      <div class="buildingDistrictRow ${isCurrent ? 'is-current' : ''}">
        <img class="bDistThumb" src="${buildingAssetForKey(rec.def.key, rec.label, rec.item.level || 1)}" alt="" loading="eager">
        <div class="bDistInfo">
          <div class="bDistTitleLine">
            <strong>${escapeHtml(rec.label)}</strong>
            <span class="bDistLv">Lv ${rec.item.level || 1}</span>
            <span class="bDistKind ${rec.kind}">${rec.kind === 'fixed' ? 'HUB' : 'LOT'}</span>
          </div>
          <small>
            Stock <b>${stock}%</b> · Health <b>${health}%</b> ·
            <em class="${st.ready ? 'ready' : ''}">${st.ready ? `Ready +${yAmt} ${rec.def.outputLabel}` : formatDuration(st.msLeft)}</em>
          </small>
        </div>
        <div class="bDistActions">
          ${st.ready ? `<button class="btn small primary" onclick="window.collectDistrictBuildingSafe?.('${token}')">Collect</button>` : ''}
          <button class="btn small ${isCurrent ? 'gold' : 'ghost'}" onclick="window.selectBuildingFromDistrictSafe?.('${token}')">
            ${isCurrent ? 'Selected' : 'Inspect'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="buildingTabPane" data-building-tab-pane="district">
      <div class="buildingBatchBar">
        <button class="btn small primary" onclick="window.batchBuildingActionSafe?.('collect')">
          💰 Collect All (${readyCount})
        </button>
        <button class="btn small gold" onclick="window.batchBuildingActionSafe?.('restock')">
          📦 Restock All (${lowStockCount})
        </button>
        <button class="btn small ghost" onclick="window.batchBuildingActionSafe?.('repair')">
          🔧 Repair All (${damagedCount})
        </button>
      </div>
      <div class="buildingDistrictList">
        ${rowsHtml}
      </div>
    </div>
  `;
}

function renderBuildingSheet(target) {
  const record = getBuildingRecord(target);
  if (!record) return '';
  const { item, def, fixed } = record;
  const title = fixed?.label || item.name || def.name;
  const level = item.level || 1;
  const status = collectStatus(item, def);
  const req = upgradeRequirement(item, def);
  const wm = buildingWorkMode(item);
  const staffMult = buildingStaffYieldMultiplier(def.key);
  const yieldAmount = buildingYield(item, def);
  const secYield = buildingSecondaryYield(item, def);
  const stock = Math.round(item.stock ?? 80);
  const health = Math.round(item.health ?? 88);
  const happiness = Math.round((def.happiness * level * (stock / 100) * (health / 100)) + (wm.happinessAdd || 0));
  const power = buildingPower(item, def);
  const isPlaced = target.kind === 'placed';
  const stars = buildingStarsForLevel(level);
  const starStr = `${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}`;
  const lineKey = fixed?.lineKey || def.lineKey || 'streetRoute';
  const supStatus = supplyStatus(lineKey);
  const service = serviceStats(def.key);

  const cycleNow = cycleMsFor(item, def);
  const nextItemPreview = { ...item, level: Math.min(def.maxLevel || 10, level + 1) };
  const nextLevelYield = buildingYield(nextItemPreview, def);
  const nextCycleMs = cycleMsFor(nextItemPreview, def);
  const nextHappiness = Math.round((def.happiness * (level + 1) * (stock / 100) * (health / 100)) + (wm.happinessAdd || 0));

  const raceBuffVal = Math.max(3, Math.round((2.5 + level * 1.8) * (stock / 100) * (health / 100) * wm.modeBuffMult * staffMult));
  const nextRaceBuffVal = Math.max(raceBuffVal + 2, Math.round((2.5 + (level + 1) * 1.8) * (stock / 100) * (health / 100) * wm.modeBuffMult * staffMult));

  const cycleReduction = Math.min(45, +(3.5 + level * 1.4 + (supStatus.level || 0) * 0.6 + (staffMult - 1) * 28).toFixed(1));
  const upgradeDiscount = Math.min(30, +(2.0 + level * 0.9 + (staffMult - 1) * 20).toFixed(1));
  const incomeBoost = Math.min(160, +((staffMult - 1) * 100 + (wm.yieldMult - 1) * 100 + (level - 1) * 6).toFixed(1));
  const tierCode = stars >= 4 ? 'SSR' : stars >= 2 ? 'SR' : 'R';

  const { people } = buildingLinkedPeople(def, fixed);
  const hiredCount = people.filter((p) => personProfile(p).hired).length;
  const allRecords = allBuildingRecords();

  const restockCost = stock >= 100 ? 0 : Math.max(10, Math.round(((100 - stock) / 100) * (def.restockCostBase || 32)));
  const repairCost = health >= 100 ? 0 : Math.max(10, Math.round(((100 - health) / 100) * (def.repairCostBase || 28)));

  let opStateLabel = '🟢 OPERATING';
  let opStateCls = 'operating';
  if (status.ready) {
    opStateLabel = '💰 READY TO COLLECT';
    opStateCls = 'ready';
  } else if (health < 65) {
    opStateLabel = '🔧 NEEDS REPAIR';
    opStateCls = 'warn';
  } else if (stock < 50) {
    opStateLabel = '🟡 LOW STOCK';
    opStateCls = 'warn';
  }

  const ctx = {
    level, stock, health, happiness, power, tierCode,
    yieldAmount, secYield, cycleNow, req, service, wm,
    staffMult, cycleReduction, upgradeDiscount, incomeBoost,
    raceBuffVal, nextLevelYield, nextCycleMs, nextHappiness, nextRaceBuffVal
  };

  let activeTabContent = '';
  if (selectedBuildingTab === 'staff') {
    activeTabContent = renderBuildingStaffTab(record, ctx);
  } else if (selectedBuildingTab === 'modes') {
    activeTabContent = renderBuildingModesTab(record, ctx);
  } else if (selectedBuildingTab === 'district') {
    activeTabContent = renderBuildingDistrictTab(target);
  } else {
    activeTabContent = renderBuildingOverviewTab(record, ctx);
  }

  return `
    <div class="buildingWindow" data-building-sheet>
      <div class="buildingWindowHeader">
        <div class="buildingHeroIconBox">
          <img src="${buildingAssetForKey(def.key, title, level)}" alt="${escapeHtml(title)}" loading="eager">
          <span class="buildingHeroStars">${starStr}</span>
        </div>
        <div class="buildingHeaderMain">
          <div class="buildingHeaderKickerRow">
            <span class="buildingCategoryTag">${escapeHtml(def.category || 'City Service')}</span>
            <span class="buildingLotTag">${isPlaced ? `PLACED · ${def.footprintW}x${def.footprintH}` : `CORE HUB · ${(fixed?.w || def.footprintW)}x${(fixed?.h || def.footprintH)}`}</span>
            <span class="buildingOpBadge ${opStateCls}">${opStateLabel}</span>
          </div>
          <h3 class="buildingWindowTitle">${escapeHtml(title)}</h3>
          <p class="buildingWindowSub">${escapeHtml(def.bonus)} — <em>${escapeHtml(def.want)}</em></p>
        </div>
        <div class="buildingHeaderRight">
          <div class="buildingLevelOrb">
            <span>LEVEL</span>
            <strong data-placed-level>${level}</strong>
            <small>/ ${def.maxLevel || 10}</small>
          </div>
          <button class="buildingCloseX" onclick="window.closeMobileBuildingSheetSafe?.()" title="Close">✕</button>
        </div>
      </div>

      <div class="buildingProfitCard ${status.ready ? 'is-ready' : 'is-cycling'}">
        <div class="buildingProfitTop">
          <div class="bProfitTimerCol">
            <span class="bProfitTimerLabel">${status.ready ? '💰 PRODUCTION COMPLETE' : `⏱ NEXT PAYOUT IN ${formatDuration(status.msLeft)}`}</span>
            <small>Cycle: <b>${formatDuration(cycleNow)}</b> · Mode: <b>${wm.icon} ${escapeHtml(wm.shortLabel)}</b> · Staff: <b>×${staffMult.toFixed(2)}</b></small>
          </div>
          <div class="bProfitYieldPills">
            <span class="bYieldPrimary">+${yieldAmount} ${escapeHtml(def.outputLabel)}</span>
            <span class="bYieldSecondary">+${secYield.amount} ${escapeHtml(secYield.label)}</span>
          </div>
        </div>
        <div class="buildingProfitProgressTrack">
          <span class="buildingProfitProgressFill" style="width:${Math.round(status.pct)}%"></span>
        </div>
        <div class="buildingProfitFoot">
          <span class="bMultFormula">
            Base ${def.baseYield} × Lv${level} × Staff ${(staffMult).toFixed(2)}x × Stock ${stock}% × ${escapeHtml(wm.shortLabel)} ${(wm.yieldMult).toFixed(2)}x
          </span>
          ${status.ready ? `
            <button class="btn small primary bInstantCollectBtn" onclick="window.collectSelectedMobileBuildingSafe?.()">
              💰 Collect +${yieldAmount} ${escapeHtml(def.outputLabel)} &amp; +${secYield.amount} ${escapeHtml(secYield.label)}
            </button>
          ` : `
            <button class="btn small gold bInstantRushBtn" onclick="window.rushSelectedMobileBuildingSafe?.()">
              ⚡ Rush Cycle Now (${status.rushCostCoins}c) → +${yieldAmount} ${escapeHtml(def.outputLabel)}
            </button>
          `}
        </div>
      </div>

      ${lastBuildingActionNote ? `
        <div class="buildingFeedbackBanner">
          <span>✨ ${escapeHtml(lastBuildingActionNote)}</span>
        </div>
      ` : ''}

      <div class="buildingTabBar" role="tablist">
        <button class="buildingTabBtn ${selectedBuildingTab === 'overview' ? 'active' : ''}" onclick="window.openBuildingTabSafe?.('overview')">
          📊 Ops &amp; Upgrade
        </button>
        <button class="buildingTabBtn ${selectedBuildingTab === 'staff' ? 'active' : ''}" onclick="window.openBuildingTabSafe?.('staff')">
          👷 Staff (${hiredCount}/${people.length})
        </button>
        <button class="buildingTabBtn ${selectedBuildingTab === 'modes' ? 'active' : ''}" onclick="window.openBuildingTabSafe?.('modes')">
          🌐 Game Links
        </button>
        <button class="buildingTabBtn ${selectedBuildingTab === 'district' ? 'active' : ''}" onclick="window.openBuildingTabSafe?.('district')">
          🏢 District (${allRecords.length})
        </button>
      </div>

      <div class="buildingTabContent">
        ${activeTabContent}
      </div>

      <div class="mobilePlacedActions mobileBuildingActions buildingCommandDock">
        ${status.ready ? `
          <button class="btn primary" onclick="window.collectSelectedMobileBuildingSafe?.()">
            💰 Collect +${yieldAmount} ${escapeHtml(def.outputLabel)}
          </button>
        ` : `
          <button class="btn gold" onclick="window.rushSelectedMobileBuildingSafe?.()">
            ⚡ Rush (${status.rushCostCoins}c)
          </button>
        `}
        <button class="btn primary" onclick="window.upgradeSelectedMobileBuildingSafe?.()" ${req.maxed ? 'disabled' : ''}>
          ${req.maxed ? '★ Max Level' : `⬆️ Upgrade Lv ${req.nextLevel} (${req.coinCost}c)`}
        </button>
        <button class="btn gold" onclick="window.restockSelectedMobileBuildingSafe?.()" ${stock >= 100 ? 'disabled' : ''}>
          ${stock >= 100 ? '📦 Stock 100%' : `📦 Restock (${restockCost}c)`}
        </button>
        <button class="btn" onclick="window.repairSelectedMobileBuildingSafe?.()" ${health >= 100 ? 'disabled' : ''}>
          ${health >= 100 ? '🔧 Health 100%' : `🔧 Repair (${repairCost}c)`}
        </button>
        ${isPlaced
          ? '<button class="btn ghost" onclick="window.moveSelectedMobileBuildingSafe?.()">📐 Move Lot</button>'
          : '<button class="btn ghost" onclick="window.openSupplyFromWorld?.()">🏭 Supplies</button>'}
        <button class="btn ghost" onclick="window.closeMobileBuildingSheetSafe?.()">Close</button>
      </div>
    </div>
  `;
}

function openBuildingSheet(target, refresh = false) {
  if (mode !== 'normal') return;
  const record = getBuildingRecord(target);
  if (!record) return;
  const isNewSelection = !targetMatches(selectedBuildingTarget, target);
  const residentSheet = document.querySelector('[data-resident-sheet]');
  if (residentSheet) residentSheet.hidden = true;
  const vehicleSheet = document.querySelector('[data-vehicle-sheet]');
  if (vehicleSheet) vehicleSheet.hidden = true;
  traffic.forEach((t) => { t.isSelected = false; });
  walkers.forEach((w) => { w.isSelected = false; });
  selectedVehicleItem = null;
  selectedBuildingTarget = target;
  selectedPlacedId = target.kind === 'placed' ? target.id : null;
  selectedResidentKey = null;
  selectedSupplyKey = null;
  selectedResidentMenu = 'job';
  if (isNewSelection && !refresh) {
    lastBuildingActionNote = '';
    focusBuildingTargetOnMap(target);
    sync3DBuildings();
  }
  const hud = document.querySelector('.mobileCityHud');
  hud?.classList.remove('resident-open', 'vehicle-open');
  hud?.classList.add('building-open');
  const sheet = document.querySelector('[data-placed-sheet]');
  if (sheet) {
    sheet.innerHTML = renderBuildingSheet(target);
    sheet.hidden = false;
  }
  publishWorldOpenState();
}

let selectedVehicleTab = 'telemetry';
let lastVehicleActionNote = '';
const vehicleRuntimeUpgrades = {};

function vehicleUpgradeState(assetKey) {
  if (!vehicleRuntimeUpgrades[assetKey]) {
    vehicleRuntimeUpgrades[assetKey] = { tuneStage: 1, hpBonus: 0, polished: false };
  }
  return vehicleRuntimeUpgrades[assetKey];
}

function renderVehicleTelemetryTab(trafficItem, spec, upState, speedKmh, statusText) {
  const roadList = trafficItem?.roadAxis === 'v' ? ROADS.vertical : ROADS.horizontal;
  const roadObj = roadList?.[trafficItem?.roadIndex || 0] || ROADS.horizontal[0];
  const roadLabel = roadObj?.label || 'Dealer / Factory Ave';
  const dirLabel = String(trafficItem?.direction || 'east').toUpperCase();
  const isRoadside = Boolean(trafficItem?.isRoadsideIncident);

  return `
    <div class="vehicleTabPane" data-vehicle-tab-pane="telemetry">
      <div class="vehicleTelemetryGrid">
        <div class="vTelCard">
          <span>⚙️ Powerplant</span>
          <strong>${escapeHtml(spec.engine || 'Twin-Turbo I6')}</strong>
          <small>Stage ${upState.tuneStage} ECU Map</small>
        </div>
        <div class="vTelCard">
          <span>🛞 Drivetrain</span>
          <strong>${escapeHtml(spec.drivetrain || 'AWD')}</strong>
          <small>${upState.polished ? '✨ Ceramic Coated' : 'Street Spec Tires'}</small>
        </div>
        <div class="vTelCard">
          <span>⚡ Live Speed</span>
          <strong class="${speedKmh > 10 ? 'tone-green' : 'tone-yellow'}">${speedKmh} km/h</strong>
          <small>${trafficItem?.isBraking ? '🔴 Brake Lights ON' : '🟢 Cruise Throttle'}</small>
        </div>
        <div class="vTelCard">
          <span>📍 Street GPS</span>
          <strong class="tone-cyan">${escapeHtml(dirLabel)} · ${escapeHtml(roadLabel.split('/')[0].trim())}</strong>
          <small>${isRoadside ? '🚨 Roadside Recovery' : 'Active 3D Signal Sync'}</small>
        </div>
      </div>

      <div class="vehicleLiveStatusBanner ${isRoadside ? 'is-incident' : trafficItem?.isBraking ? 'is-braking' : 'is-cruising'}">
        <div class="vLiveStatusText">
          <b>${isRoadside ? '🚨 Roadside Breakdown / Tow Recovery Active' : '📡 Live 365 Street Telemetry'}</b>
          <span>${escapeHtml(statusText)} · ${upState.hpBonus > 0 ? `+${upState.hpBonus} Dyno HP Tuned` : 'Factory 365 Street Spec'}</span>
        </div>
        <div class="vLiveStatusBtns">
          ${isRoadside ? `
            <button type="button" class="btn small gold" onclick="window.clearRoadsideVehicleSafe?.()">🚨 Dispatch Tow (+40c)</button>
          ` : `
            <button type="button" class="btn small primary" onclick="window.toggleCityCameraAngleSafe?.()">🎥 3D Angle</button>
          `}
          <button type="button" class="btn small" onclick="window.zoomMobileCityInSafe?.()">🔍 Zoom Car</button>
        </div>
      </div>
    </div>
  `;
}

function renderVehicleDynoTab(trafficItem, spec, upState, totalHp) {
  const baseHpNum = parseInt(String(spec.hp || '420'), 10) || 420;
  const speedPct = Math.min(100, Math.round((baseHpNum + upState.hpBonus) / 7.5));
  const accelPct = Math.min(100, Math.round(62 + upState.tuneStage * 8 + (spec.drivetrain?.includes('AWD') ? 12 : 6)));
  const gripPct = Math.min(100, Math.round(68 + (upState.polished ? 12 : 0) + (spec.spoiler ? 10 : 4)));
  const aeroPct = Math.min(100, Math.round(64 + upState.tuneStage * 7 + (spec.underglow ? 12 : 5)));

  return `
    <div class="vehicleTabPane" data-vehicle-tab-pane="dyno">
      <div class="vehicleDynoBars">
        <div class="vDynoBarItem">
          <div class="vDynoHead"><span>Top Speed</span><b>${speedPct}%</b></div>
          <div class="vDynoTrack"><i style="width:${speedPct}%"></i></div>
        </div>
        <div class="vDynoBarItem">
          <div class="vDynoHead"><span>Acceleration</span><b>${accelPct}%</b></div>
          <div class="vDynoTrack"><i style="width:${accelPct}%"></i></div>
        </div>
        <div class="vDynoBarItem">
          <div class="vDynoHead"><span>Corner Grip</span><b>${gripPct}%</b></div>
          <div class="vDynoTrack"><i style="width:${gripPct}%"></i></div>
        </div>
        <div class="vDynoBarItem">
          <div class="vDynoHead"><span>Aero &amp; Drift</span><b>${aeroPct}%</b></div>
          <div class="vDynoTrack"><i style="width:${aeroPct}%"></i></div>
        </div>
      </div>

      <div class="vehicleTuneActionsCard">
        <div class="vTuneInfo">
          <b>🔧 365 Dyno &amp; Showroom Upgrade Bay · Stage ${upState.tuneStage} (${totalHp} HP)</b>
          <small>Upgrade this fleet vehicle on the street to boost City Reputation and Showroom prestige.</small>
        </div>
        <div class="vTuneBtns">
          <button type="button" class="btn small gold" onclick="window.tuneSelectedVehicleSafe?.()">
            ⚡ ECU Tune +25 HP (35c)
          </button>
          <button type="button" class="btn small primary" onclick="window.polishSelectedVehicleSafe?.()">
            ✨ Detail Polish +30c Rep
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderVehicleFleetTab(trafficItem, spec) {
  const curKey = trafficItem?.assetKey || 'skylineR34';
  const fleetQuickList = [
    { key: 'skylineR34', label: 'R34 Skyline' },
    { key: 'mustangFastback', label: 'Mustang V8' },
    { key: 'rx7Spirit', label: 'RX-7 FD3S' },
    { key: 'silviaS15', label: 'Silvia S15' },
    { key: 'pajeroEvo', label: 'Pajero 4x4' },
    { key: 'superCar', label: 'Apex V10' }
  ];

  return `
    <div class="vehicleTabPane" data-vehicle-tab-pane="fleet">
      <div class="personGameModesGrid">
        <button type="button" class="personModeCard" onclick="window.openPersonGameScreenSafe?.('race')">
          <span class="modeKicker">🏎️ Road Runner Route</span>
          <strong>Race ${escapeHtml(spec.market || 'Street')} Class</strong>
          <small>Launch side-scroll route run with ${escapeHtml(spec.name || curKey)}</small>
        </button>
        <button type="button" class="personModeCard" onclick="window.openPersonGameScreenSafe?.('garage')">
          <span class="modeKicker">🏢 365 Garage &amp; Showroom</span>
          <strong>+12% VIP Showcase</strong>
          <small>Open Workshop Floor &amp; Dyno Bays</small>
        </button>
      </div>

      <div class="vehicleQuickFleetBlock">
        <div class="vQuickFleetHead">
          <span>🚗 Switch Active 3D Street Vehicle (${traffic.length} on Map)</span>
          <small>Tap any model to lock camera</small>
        </div>
        <div class="vQuickFleetPills">
          ${fleetQuickList.map((f) => `
            <button type="button" class="vFleetPill ${f.key === curKey ? 'active' : ''}" onclick="window.inspectMobileCityVehicleSafe?.('${f.key}')">
              ${escapeHtml(f.label)}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderVehicleSheet(trafficItem) {
  const key = trafficItem?.assetKey || 'skylineR34';
  const spec = VEHICLE_SPECS[key] || VEHICLE_SPECS.skylineR34;
  const upState = vehicleUpgradeState(key);
  const baseHpNum = parseInt(String(spec.hp || '420'), 10) || 420;
  const totalHp = baseHpNum + (upState.hpBonus || 0);
  const speedKmh = Math.round((trafficItem?.currentSpeed ?? trafficItem?.speed ?? 80) * 1.15);
  const isRoadside = Boolean(trafficItem?.isRoadsideIncident);
  const statusText = isRoadside
    ? 'Roadside Tow Recovery in Progress'
    : trafficItem?.isBraking
      ? 'Yielding at Intersection / Traffic Queue'
      : speedKmh <= 5
        ? 'Stopped at Red Signal'
        : `Cruising ${String(trafficItem?.direction || 'east').toUpperCase()} Avenue`;

  const paintHex = `#${Number(spec.body || spec.bodyColor || 0x0284c7).toString(16).padStart(6, '0')}`;
  const trimHex = `#${Number(spec.trim || spec.accentColor || 0x38bdf8).toString(16).padStart(6, '0')}`;
  const activeTab = ['telemetry', 'dyno', 'fleet'].includes(selectedVehicleTab) ? selectedVehicleTab : 'telemetry';
  const badgeCode = (spec.name || key).slice(0, 3).toUpperCase();

  let tabBody = '';
  if (activeTab === 'dyno') {
    tabBody = renderVehicleDynoTab(trafficItem, spec, upState, totalHp);
  } else if (activeTab === 'fleet') {
    tabBody = renderVehicleFleetTab(trafficItem, spec);
  } else {
    tabBody = renderVehicleTelemetryTab(trafficItem, spec, upState, speedKmh, statusText);
  }

  return `
    <div class="vehicleWindow" data-vehicle-window data-vehicle-key="${escapeHtml(key)}">
      <div class="vehicleWindowHeader" data-vehicle-sheet-title>
        <button type="button" class="inspectorCycleBtn" onclick="window.cycleMobileVehicleSafe?.(-1)" title="Previous Vehicle">◀</button>
        <div class="vehiclePaintSwatch" style="--swatch-main:${paintHex};--swatch-trim:${trimHex}">
          <span>${escapeHtml(badgeCode)}</span>
          <small>STG ${upState.tuneStage}</small>
        </div>
        <div class="vehicleHeaderMain">
          <div class="vehicleKickerRow">
            <span class="vehicleMarketPill">${escapeHtml(spec.market || '365 Custom')}</span>
            <span class="vehicleStatePill ${isRoadside ? 'warn' : speedKmh > 10 ? 'ok' : 'wait'}">
              ${isRoadside ? '🚨 TOW OPS' : speedKmh > 10 ? `🟢 ${speedKmh} KM/H` : '🔴 SIGNAL STOP'}
            </span>
          </div>
          <b class="vehicleTitleName">${escapeHtml(spec.name || spec.label || key)}</b>
          <span class="vehicleSubStatus">${escapeHtml(statusText)}</span>
        </div>
        <div class="vehicleHeaderRight">
          <div class="vehicleHpOrb">
            <span>POWER</span>
            <strong>${totalHp}</strong>
            <small>HP</small>
          </div>
          <button type="button" class="inspectorCycleBtn" onclick="window.cycleMobileVehicleSafe?.(1)" title="Next Vehicle">▶</button>
          <button type="button" class="buildingCloseX" onclick="window.closeMobileVehicleSheetSafe?.()" title="Close">✕</button>
        </div>
      </div>

      ${lastVehicleActionNote ? `
        <div class="buildingFeedbackBanner">
          <span>✨ ${escapeHtml(lastVehicleActionNote)}</span>
        </div>
      ` : ''}

      <div class="residentTabBar vehicleTabBar" role="tablist">
        <button type="button" class="residentTab ${activeTab === 'telemetry' ? 'active' : ''}" onclick="window.openVehicleTabSafe?.('telemetry')">
          <b>🏎️</b>
          <span>Telemetry</span>
          <small>${speedKmh} km/h</small>
        </button>
        <button type="button" class="residentTab ${activeTab === 'dyno' ? 'active' : ''}" onclick="window.openVehicleTabSafe?.('dyno')">
          <b>🔧</b>
          <span>Dyno &amp; Tune</span>
          <small>${totalHp} HP</small>
        </button>
        <button type="button" class="residentTab ${activeTab === 'fleet' ? 'active' : ''}" onclick="window.openVehicleTabSafe?.('fleet')">
          <b>🌐</b>
          <span>Fleet &amp; Race</span>
          <small>${traffic.length} Cars</small>
        </button>
      </div>

      <div class="residentTabPanel vehicleTabPanel" data-vehicle-tab-panel>
        ${tabBody}
      </div>

      <div class="mobilePlacedActions residentFooterActions">
        <button type="button" class="btn gold" onclick="window.tuneSelectedVehicleSafe?.()">⚡ Tune +25 HP (35c)</button>
        <button type="button" class="btn primary" onclick="window.zoomMobileCityInSafe?.()">🔍 Street Zoom</button>
        <button type="button" class="btn ghost" onclick="window.closeMobileVehicleSheetSafe?.()">Close</button>
      </div>
    </div>
  `;
}

function openVehicleInspector(trafficItem, refresh = false) {
  if (mode !== 'normal' || !trafficItem) return;
  const residentSheet = document.querySelector('[data-resident-sheet]');
  if (residentSheet) residentSheet.hidden = true;
  const placedSheet = document.querySelector('[data-placed-sheet]');
  if (placedSheet) placedSheet.hidden = true;
  if (!refresh && selectedVehicleItem !== trafficItem) {
    lastVehicleActionNote = '';
    selectedVehicleTab = 'telemetry';
  }
  traffic.forEach((t) => { t.isSelected = t === trafficItem; });
  walkers.forEach((w) => { w.isSelected = false; });
  selectedVehicleItem = trafficItem;
  selectedBuildingTarget = null;
  selectedPlacedId = null;
  selectedResidentKey = null;
  selectedSupplyKey = null;
  sync3DBuildings();
  const hud = document.querySelector('.mobileCityHud');
  hud?.classList.remove('resident-open', 'building-open', 'build-mode');
  hud?.classList.add('vehicle-open');
  const sheet = document.querySelector('[data-vehicle-sheet]');
  if (sheet) {
    sheet.innerHTML = renderVehicleSheet(trafficItem);
    sheet.hidden = false;
  }
  if (!refresh) {
    if (typeof trafficItem.roadsideX === 'number' && typeof trafficItem.roadsideY === 'number') {
      focusWorldPoint(trafficItem.roadsideX, trafficItem.roadsideY);
    } else if (trafficItem.path) {
      const pt = pathPoint(trafficItem.path, trafficItem.d);
      if (pt) focusWorldPoint(pt.x, pt.y);
    }
  }
  publishWorldOpenState();
}

window.openVehicleTabSafe = (tabKey = 'telemetry') => {
  selectedVehicleTab = ['telemetry', 'dyno', 'fleet'].includes(tabKey) ? tabKey : 'telemetry';
  if (selectedVehicleItem) openVehicleInspector(selectedVehicleItem, true);
  return selectedVehicleTab;
};

window.cycleMobileVehicleSafe = (delta = 1) => {
  if (!traffic.length) return false;
  const curIdx = Math.max(0, traffic.indexOf(selectedVehicleItem));
  const nextIdx = ((curIdx + (Number(delta) || 1)) % traffic.length + traffic.length) % traffic.length;
  openVehicleInspector(traffic[nextIdx]);
  return true;
};

window.tuneSelectedVehicleSafe = () => {
  if (!selectedVehicleItem) return false;
  const key = selectedVehicleItem.assetKey || 'skylineR34';
  const spec = VEHICLE_SPECS[key] || VEHICLE_SPECS.skylineR34;
  const up = vehicleUpgradeState(key);
  up.tuneStage += 1;
  up.hpBonus += 25;
  if (typeof selectedVehicleItem.speed === 'number' && selectedVehicleItem.speed > 0) {
    selectedVehicleItem.speed = Math.min(135, Math.round(selectedVehicleItem.speed * 1.08));
    selectedVehicleItem.currentSpeed = selectedVehicleItem.speed;
  }
  reputationCache = Math.min(100, cityReputation() + 2);
  lastVehicleActionNote = `Tuned ${spec.name || key} to Stage ${up.tuneStage} (+25 HP & +2 City Rep)!`;
  dispatchWorldBuildingSync({ costCoins: 35, note: lastVehicleActionNote });
  openVehicleInspector(selectedVehicleItem, true);
  updateHud();
  return true;
};

window.polishSelectedVehicleSafe = () => {
  if (!selectedVehicleItem) return false;
  const key = selectedVehicleItem.assetKey || 'skylineR34';
  const spec = VEHICLE_SPECS[key] || VEHICLE_SPECS.skylineR34;
  const up = vehicleUpgradeState(key);
  up.polished = true;
  reputationCache = Math.min(100, cityReputation() + 3);
  lastVehicleActionNote = `Detailed ${spec.name || key}! Earned +30 Showcase Coins & +3 City Rep.`;
  dispatchWorldBuildingSync({ rewardCurrencies: { coins: 10 }, note: lastVehicleActionNote });
  openVehicleInspector(selectedVehicleItem, true);
  updateHud();
  return true;
};

window.clearRoadsideVehicleSafe = () => {
  if (!selectedVehicleItem) return false;
  const supportRecords = problemBuildings(['towDispatch', 'privateShop'], false);
  if (supportRecords[0]) {
    updateBuildingRecord(supportRecords[0].target, (item) => {
      item.stock = 100;
      item.health = 100;
    });
  }
  selectedVehicleItem.isRoadsideIncident = false;
  selectedVehicleItem.speed = 86;
  selectedVehicleItem.currentSpeed = 86;
  selectedVehicleItem.isBraking = false;
  lastVehicleActionNote = 'Dispatched 365 Heavy Wrecker! Roadside cleared (+40 Coins).';
  dispatchWorldBuildingSync({ rewardCurrencies: { coins: 40 }, note: lastVehicleActionNote });
  rebuildFixedBuildings();
  rebuildPlacements();
  rebuildIncidents();
  openVehicleInspector(selectedVehicleItem, true);
  updateHud();
  return true;
};

function targetMatches(a, b) {
  return Boolean(a && b && a.kind === b.kind && a.id === b.id);
}

function collectBuildingTarget(target, options = {}) {
  const record = getBuildingRecord(target);
  if (!record || mode !== 'normal') return false;
  const status = collectStatus(record.item, record.def);
  if (!status.ready && !options.forceCollect) return false;
  const wm = buildingWorkMode(record.item);
  const amount = buildingYield(record.item, record.def);
  const sec = buildingSecondaryYield(record.item, record.def);
  const drain = (record.def.stockDrain || 10) + (wm.drainAdd || 0);
  const bTitle = record.fixed?.label || record.item.name || record.def.shortName;
  updateBuildingRecord(target, (item, def) => {
    item.lastCollectedAt = Date.now();
    item.collected = (item.collected || 0) + 1;
    item.stock = Math.max(0, (item.stock ?? 80) - drain);
    item.health = Math.max(0, (item.health ?? 88) - Math.max(2, Math.round(drain / 4)));
    item.lastReward = { output: def.output, label: def.outputLabel, amount, secondaryOutput: sec.output, secondaryAmount: sec.amount, at: Date.now() };
  });
  lastBuildingActionNote = `Collected +${amount} ${record.def.outputLabel} & +${sec.amount} ${sec.label} from ${bTitle}!`;
  window.dispatchEvent(new CustomEvent('world-building-collect', {
    detail: {
      output: record.def.output,
      amount,
      label: record.def.outputLabel,
      secondaryOutput: sec.output,
      secondaryAmount: sec.amount,
      secondaryLabel: sec.label,
      buildingName: bTitle,
      worldBuildingPerks: computeWorldBuildingPerks(),
      cityAverageHappiness: cityNeedStats().average
    }
  }));
  rebuildFixedBuildings();
  rebuildPlacements();
  rebuildIncidents();
  const sheet = document.querySelector('[data-placed-sheet]');
  const sheetOpen = sheet && !sheet.hidden && targetMatches(selectedBuildingTarget, target);
  if (options.refreshOpenSheet || sheetOpen) openBuildingSheet(target, true);
  refreshOpenResidentSheet();
  updateHud();
  return true;
}

function openPlacedSheet(id) {
  openBuildingSheet({ kind: 'placed', id });
}

function openFixedBuildingSheet(building) {
  openBuildingSheet(buildingTargetForFixed(building));
}

function residentMenuTarget(menu = 'job') {
  const key = String(menu || 'job');
  if (key === 'job' || key === 'skills') return 'job';
  if (key === 'mood' || key === 'overview' || key === 'needs' || key === 'service' || key === 'stock' || key === 'city' || key === 'incidents' || key.startsWith('problem:')) return 'mood';
  if (key === 'modes' || key === 'people' || key === 'roster') return 'modes';
  if (key === 'talk' || key === 'trade') return 'talk';
  return 'job';
}

function residentActiveTab(menu = selectedResidentMenu) {
  return residentMenuTarget(menu);
}

function renderResidentTabs(resident, mood) {
  const active = residentActiveTab();
  const id = resident.lineKey || resident.key;
  const prof = mood.profile;
  const relScore = relationshipScore(id);
  const relRank = relationshipRank(relScore);
  const tabs = [
    { key: 'job', label: 'Job & Skills', value: prof.hired ? `LV ${prof.level}` : 'HIRE NOW', icon: '🪪' },
    { key: 'mood', label: 'Happiness', value: `${mood.score}%`, icon: mood.face },
    { key: 'modes', label: 'Mode Perks', value: `+${prof.totalModeBonusPct}%`, icon: '⚡' },
    { key: 'talk', label: 'Talk & Trade', value: `${relRank} ${relScore}`, icon: '💬' }
  ];
  return `
    <div class="residentTabBar" role="tablist" aria-label="Resident information tabs">
      ${tabs.map((tab) => `
        <button type="button" class="residentTab ${active === tab.key ? 'active' : ''}" role="tab" aria-selected="${active === tab.key}" onclick="window.openResidentNeedMenuSafe?.('${tab.key}')">
          <b>${escapeHtml(tab.icon)}</b>
          <span>${escapeHtml(tab.label)}</span>
          <small>${escapeHtml(tab.value)}</small>
        </button>
      `).join('')}
    </div>
  `;
}

function renderResidentJobTab(resident, mood) {
  const id = resident.lineKey || resident.key;
  const prof = mood.profile;
  const buildingKey = resident.building || 'garage365';
  const def = defByKey(buildingKey);
  const records = problemBuildings(buildingKey, false);
  const primaryRecord = records[0] || allBuildingRecords()[0];
  const bToken = primaryRecord ? targetToken(primaryRecord.target) : '';
  const bCond = primaryRecord?.condition || { health: 90, stock: 85, score: 88 };

  return `
    <div class="residentTabPane" data-resident-tab-pane="job">
      <!-- Whiteout Survival / Kingshot Survivor Job Assignment Card -->
      <div class="personJobActionCard ${prof.hired ? 'is-hired' : 'is-unemployed'}" data-person-job-card>
        <div class="personJobDetails">
          <div class="personJobTitleRow">
            <b>${prof.hired ? `✓ Employed: ${escapeHtml(resident.jobTitle)}` : `● Unemployed — Hire as ${escapeHtml(resident.jobTitle)}`}</b>
            <span class="personRankPill">${escapeHtml(prof.rank)} · ⚡ ${prof.energy}/${prof.energyMax}</span>
          </div>
          <small>
            ${prof.hired
              ? `Assigned to ${escapeHtml(resident.business || def.shortName)} & ${escapeHtml(def.name)} · Salary ${prof.salaryCoins}c · +${prof.totalModeBonusPct}% All Mode Buffs.`
              : `Unemployed (+0% automation). Hire now to automate ${escapeHtml(resident.business || def.shortName)} & unlock +${prof.potentialBonusPct}% game-mode buffs!`}
          </small>
        </div>
        <div class="personJobButtons">
          ${!prof.hired
            ? `<button type="button" class="btn primary personHireBtn" data-hire-person="${escapeHtml(id)}" onclick="window.hireWorldPersonSafe?.('${escapeHtml(id)}')">✅ Hire Now · ${prof.hireCost} Coins</button>`
            : `<button type="button" class="btn gold personTrainBtn" data-train-person="${escapeHtml(id)}" onclick="window.trainWorldPersonSafe?.('${escapeHtml(id)}')">⬆️ Train Lv ${prof.level + 1} (${prof.trainCost}c)</button>
               <button type="button" class="btn small primary" data-boost-person="${escapeHtml(id)}" onclick="window.boostWorldPersonSafe?.('${escapeHtml(id)}')">⚡ Morale +12%</button>`
          }
          <button type="button" class="btn small ghost" onclick="window.openStaffFromWorldSafe?.('${escapeHtml(resident.crewId || id)}')">📋 Crew File</button>
        </div>
      </div>

      <!-- 3 Core Specialist Skill Bars -->
      <div class="personSkillsBar">
        ${prof.skills.map((sk) => `
          <div class="personSkillItem">
            <div class="personSkillHead">
              <span>${escapeHtml(sk.label)}</span>
              <b>${sk.value}%</b>
            </div>
            <div class="personSkillTrack"><i style="width:${sk.value}%"></i></div>
          </div>
        `).join('')}
      </div>

      <!-- Assigned Workplace Quick Bar -->
      <div class="personWorkplaceStrip">
        <div class="pwInfo">
          <b>🏢 Workplace: ${escapeHtml(primaryRecord?.label || def.name)}</b>
          <span>Stock ${bCond.stock}% · Health ${bCond.health}% · Service ${bCond.score}%</span>
        </div>
        <div class="pwActions">
          ${bToken ? `
            <button type="button" class="btn small" onclick="window.inspectResidentBuildingSafe?.('${bToken}')">Inspect</button>
            <button type="button" class="btn small gold" onclick="window.restockResidentBuildingSafe?.('${bToken}')" ${bCond.stock >= 100 ? 'disabled' : ''}>Restock</button>
            <button type="button" class="btn small primary" onclick="window.repairResidentBuildingSafe?.('${bToken}')" ${bCond.health >= 100 ? 'disabled' : ''}>Repair</button>
          ` : `
            <button type="button" class="btn small gold" onclick="window.openMobileBuildTraySafe?.()">Build ${escapeHtml(def.shortName)}</button>
          `}
        </div>
      </div>
    </div>
  `;
}

function renderResidentHappinessTab(resident, mood) {
  const id = resident.lineKey || resident.key;
  const prof = mood.profile;
  const buildingKey = resident.building || 'garage365';
  const def = defByKey(buildingKey);
  const records = problemBuildings(buildingKey, false);
  const topShop = records.find((r) => r.condition.poor) || records[0];
  const shopToken = topShop ? targetToken(topShop.target) : '';

  return `
    <div class="residentTabPane" data-resident-tab-pane="mood">
      <!-- RollerCoaster Tycoon / Whiteout Survival Connected Happiness Scale Card -->
      <div class="residentMoodCard residentHero mood-${mood.key}" data-resident-mood-card>
        <div class="residentMoodFace" data-resident-mood-face aria-label="${escapeHtml(mood.label)}">${escapeHtml(mood.face)}</div>
        <div class="residentMoodInfo">
          <div class="personMoodTitleRow">
            <b>Happiness Scale · ${mood.score}/100 (${escapeHtml(mood.label)})</b>
            <em class="happinessBuffPill">+${prof.totalModeBonusPct}% All Mode Buffs</em>
          </div>
          <span data-resident-want>${escapeHtml(resident.want)}</span>
          <div class="residentMoodMeter" style="--resident-mood:${mood.score}%;" aria-label="Resident happiness ${mood.score} percent">
            <span></span><i></i>
          </div>
          <div class="personHappinessPillars">
            <span class="pillarChip ${prof.jobScore < 50 ? 'warn' : 'ok'}">Job <b>${prof.jobScore}%</b></span>
            <span class="pillarChip ${mood.service.score < 55 ? 'warn' : 'ok'}">World <b>${mood.service.score}%</b></span>
            <span class="pillarChip ${prof.supplyScore < 55 ? 'warn' : 'ok'}">Supply <b>${prof.supplyScore}%</b></span>
            <span class="pillarChip ${prof.streetScore < 55 ? 'warn' : 'ok'}">Streets <b>${prof.streetScore}%</b></span>
            <span class="pillarChip ok">Bond <b>${prof.bondScore}%</b></span>
          </div>
        </div>
      </div>

      <!-- 2 Compact Actionable Need Cards (Zero Scroll) -->
      <div class="personMoodFixGrid">
        <div class="personMoodFixCard">
          <div>
            <b>🏪 ${escapeHtml(topShop?.label || def.name)}</b>
            <small>${topShop ? `Stock ${topShop.condition.stock}% · Health ${topShop.condition.health}%` : 'Build shop to satisfy need'}</small>
          </div>
          <div class="pmFixBtns">
            ${shopToken ? `
              <button type="button" class="btn small gold" onclick="window.restockResidentBuildingSafe?.('${shopToken}')">📦 Restock</button>
              <button type="button" class="btn small primary" onclick="window.repairResidentBuildingSafe?.('${shopToken}')">🔧 Repair</button>
            ` : `
              <button type="button" class="btn small gold" onclick="window.openMobileBuildTraySafe?.()">🏗️ Build</button>
            `}
          </div>
        </div>
        <div class="personMoodFixCard">
          <div>
            <b>⚡ Personal Morale &amp; Energy</b>
            <small>Energy ${prof.energy}/100 · ${prof.hired ? 'Employed Bonus Active' : 'Unemployed (-28 Happy)'}</small>
          </div>
          <div class="pmFixBtns">
            ${!prof.hired ? `
              <button type="button" class="btn small primary" onclick="window.hireWorldPersonSafe?.('${escapeHtml(id)}')">Hire (${prof.hireCost}c)</button>
            ` : `
              <button type="button" class="btn small primary" onclick="window.boostWorldPersonSafe?.('${escapeHtml(id)}')">Morale +12%</button>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderResidentModesTab(resident, mood) {
  const currentId = resident.lineKey || resident.key;
  const prof = mood.profile;
  const buildingKey = resident.building || 'garage365';
  const def = defByKey(buildingKey);
  const roster = allCityPeople();
  const records = problemBuildings(buildingKey, false);
  const firstToken = records[0] ? targetToken(records[0].target) : '';

  return `
    <div class="residentTabPane" data-resident-tab-pane="modes">
      <!-- 2x2 Connected Game Mode Synergy Grid -->
      <div class="personGameModesGrid">
        <button type="button" class="personModeCard" onclick="${firstToken ? `window.inspectResidentBuildingSafe?.('${firstToken}')` : `window.openMobileBuildTraySafe?.()`}">
          <span class="modeKicker">🏙️ World City · ${escapeHtml(def.shortName)}</span>
          <strong>+${prof.worldYieldBonus}% Shop Yield</strong>
          <small>Stock ${Math.round(mood.service.avgStock || 0)}% · Health ${Math.round(mood.service.avgHealth || 0)}%</small>
        </button>
        <button type="button" class="personModeCard" onclick="window.openSupplyFromWorld?.()">
          <span class="modeKicker">📦 Supplies · ${escapeHtml(resident.business || 'Line')}</span>
          <strong>+${prof.supplyYieldBonus}% Line Output</strong>
          <small>${prof.hired ? `Auto-Collect ON (Lv ${prof.lineLevel})` : 'Hire to Auto-Collect'}</small>
        </button>
        <button type="button" class="personModeCard" onclick="window.openPersonGameScreenSafe?.('race')">
          <span class="modeKicker">🏎️ Road Runner Race</span>
          <strong>+${prof.raceBonusPct}% ${escapeHtml(prof.primarySkillLabel)}</strong>
          <small>${escapeHtml(resident.raceEffectLabel || 'Speed, Grip & Fuel Bonus')}</small>
        </button>
        <button type="button" class="personModeCard" onclick="window.openPersonGameScreenSafe?.('merge')">
          <span class="modeKicker">🔧 Merge &amp; Garage</span>
          <strong>+${prof.mergeBonusPct}% Craft Speed</strong>
          <small>${escapeHtml(resident.mergeEffectLabel || 'Workshop Parts & Tools')}</small>
        </button>
      </div>

      <!-- Compact 12-Person Quick Switcher Pill Grid (Zero Scroll) -->
      <div class="personQuickRosterBlock">
        <div class="pqHead">
          <span>👥 Quick Crew Switcher (${roster.filter((p) => personProfile(p)?.hired).length}/${roster.length} Hired)</span>
          <small>Tap any specialist to inspect</small>
        </div>
        <div class="personQuickRosterPills">
          ${roster.slice(0, 8).map((item) => {
            const itemId = item.lineKey || item.key;
            const pProf = personProfile(item);
            return `
              <button type="button" class="pqPill ${itemId === currentId ? 'active' : ''} ${pProf.hired ? 'hired' : 'unemployed'}" onclick="window.inspectResidentByKeySafe?.('${escapeHtml(itemId)}')">
                <span class="pqDot"></span>
                <b>${escapeHtml(item.name)}</b>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderResidentTalkTab(resident) {
  const id = resident.lineKey || resident.key;
  const node = currentNpcNode(resident);
  const score = relationshipScore(id);
  const rank = relationshipRank(score);
  const replies = (node.choices || []).slice(0, 4).map((choice) => (
    `<button type="button" class="btn small" onclick="window.replyToNpc?.('${id}','${choice.id}')">${escapeHtml(choice.label)}</button>`
  )).join('');
  const market = renderNpcMarket(resident);

  return `
    <div class="residentTabPane" data-resident-tab-pane="talk">
      <div class="npcTalk compactTalkTab">
        <div class="npcBond">
          <b>🤝 Trust Rank: ${escapeHtml(rank)}</b>
          <span><i style="width:${score}%"></i></span>
          <small>${score}/100</small>
        </div>
        <p class="npcSpeechBubble">"${escapeHtml(spokenText(node, score))}"</p>
        <div class="npcReplies">${replies}</div>
        <div class="npcTradeSection">
          <span class="npcTradeKicker">🛒 Street Barter &amp; Resource Favor</span>
          ${market}
        </div>
      </div>
    </div>
  `;
}

function renderResidentActionMenu(resident, mood) {
  const active = residentActiveTab(selectedResidentMenu);
  if (active === 'mood') return renderResidentHappinessTab(resident, mood);
  if (active === 'modes') return renderResidentModesTab(resident, mood);
  if (active === 'talk') return renderResidentTalkTab(resident, mood);
  return renderResidentJobTab(resident, mood);
}

function renderResidentSheet(resident) {
  const id = resident.lineKey || resident.key;
  const isSupply = Boolean(resident.lineKey);
  const buildingKey = resident.building || 'garage365';
  const def = defByKey(buildingKey);
  const mood = residentMood(resident);
  const prof = mood.profile;
  const portraitSrc = personAssetForKey(resident.key);
  const rarityTag = prof.level >= 4 ? 'SSR' : isSupply ? 'SR' : 'R';

  return `
    <div class="residentWindow" data-resident-window data-person-id="${escapeHtml(id)}">
      <div class="residentWindowHeader" data-resident-sheet-title>
        <button type="button" class="inspectorCycleBtn" onclick="window.cycleWorldPersonSafe?.(-1)" title="Previous Person">◀</button>
        <div class="personHeroFrame rarity-${rarityTag.toLowerCase()}">
          <img class="personHeaderAvatar" src="${escapeHtml(portraitSrc)}" alt="${escapeHtml(resident.name)}" />
          <span class="personRarityTag">${rarityTag}</span>
        </div>
        <div class="personHeaderMeta">
          <div class="personHeaderKickerRow">
            <span class="residentKicker">${isSupply ? 'SUPPLY MANAGER' : 'CITY SPECIALIST'}</span>
            <span class="personStatusBadge ${prof.hired ? 'hired' : 'unemployed'}" data-person-employment-status>
              ${prof.hired ? `✓ HIRED · LV ${prof.level}` : '● UNEMPLOYED'}
            </span>
          </div>
          <b class="personTitleName">${escapeHtml(resident.name)} <small class="personRoleTag">· ${escapeHtml(resident.jobTitle || 'Specialist')}</small></b>
          <span class="personWorkplaceLine">🏢 ${escapeHtml(resident.desk || resident.business || def.name)} · Linked: ${escapeHtml(def.shortName)}</span>
        </div>
        <div class="personHeaderRight">
          <div class="personMoodOrb mood-${mood.key}" onclick="window.openResidentNeedMenuSafe?.('mood')" title="View Happiness Scale">
            <span>${escapeHtml(mood.face)}</span>
            <strong>${mood.score}%</strong>
          </div>
          <button type="button" class="inspectorCycleBtn" onclick="window.cycleWorldPersonSafe?.(1)" title="Next Person">▶</button>
          <button type="button" class="buildingCloseX" onclick="window.closeMobileResidentSheetSafe?.()" title="Close">✕</button>
        </div>
      </div>

      ${lastBondNote ? `
        <div class="buildingFeedbackBanner">
          <span>✨ ${escapeHtml(lastBondNote)}</span>
        </div>
      ` : ''}

      <!-- 4 Zero-Scroll Mobile Tycoon Tabs: Job & Skills | Happiness | Mode Perks | Talk & Trade -->
      ${renderResidentTabs(resident, mood)}

      <div class="residentTabPanel" data-resident-tab-panel>
        ${renderResidentActionMenu(resident, mood)}
      </div>

      <div class="mobilePlacedActions residentFooterActions">
        ${!prof.hired
          ? `<button type="button" class="btn primary" onclick="window.hireWorldPersonSafe?.('${escapeHtml(id)}')">✅ Hire Now (${prof.hireCost}c)</button>`
          : `<button type="button" class="btn gold" onclick="window.trainWorldPersonSafe?.('${escapeHtml(id)}')">⬆️ Train Lv ${prof.level + 1} (${prof.trainCost}c)</button>`}
        <button type="button" class="btn primary" onclick="window.openPersonGameScreenSafe?.('${isSupply ? 'lines' : 'race'}')">Open ${isSupply ? 'Supplies' : 'Race'}</button>
        <button type="button" class="btn ghost" onclick="window.closeMobileResidentSheetSafe?.()">Close</button>
      </div>
    </div>
  `;
}

function openResidentSheet(resident, refresh = false) {
  if (mode !== 'normal' || !resident) return;
  const id = resident.lineKey || resident.key;
  if (selectedResidentKey !== id && !refresh) {
    lastBondNote = '';
    selectedResidentMenu = 'job';
  }
  purseCache.ready = false;
  const placedSheet = document.querySelector('[data-placed-sheet]');
  if (placedSheet) placedSheet.hidden = true;
  const vehicleSheet = document.querySelector('[data-vehicle-sheet]');
  if (vehicleSheet) vehicleSheet.hidden = true;
  traffic.forEach((t) => { t.isSelected = false; });
  selectedVehicleItem = null;
  walkers.forEach((w) => {
    const wId = w.personId || w.staff?.lineKey || w.resident?.key;
    w.isSelected = wId === id;
  });
  const hud = document.querySelector('.mobileCityHud');
  hud?.classList.remove('building-open', 'build-mode', 'vehicle-open');
  hud?.classList.add('resident-open');
  selectedBuildingTarget = null;
  selectedSupplyKey = resident.lineKey || null;
  selectedPlacedId = null;
  selectedResidentKey = id;
  sync3DBuildings();
  const sheet = document.querySelector('[data-resident-sheet]');
  if (sheet) {
    sheet.innerHTML = renderResidentSheet(resident);
    sheet.hidden = false;
  }
  if (!refresh) {
    const walkerMatch = walkers.find((w) => (w.personId || w.staff?.lineKey || w.resident?.key) === id);
    if (walkerMatch?.path) {
      const pt = pathPoint(walkerMatch.path, walkerMatch.d);
      if (pt) focusWorldPoint(pt.x, pt.y);
    }
  }
  publishWorldOpenState();
}

window.cycleWorldPersonSafe = (delta = 1) => {
  const roster = allCityPeople();
  if (!roster.length) return false;
  const currentId = selectedResidentKey || selectedSupplyKey || roster[0].key;
  const curIdx = Math.max(0, roster.findIndex((p) => (p.lineKey || p.key) === currentId));
  const nextIdx = ((curIdx + (Number(delta) || 1)) % roster.length + roster.length) % roster.length;
  openResidentSheet(roster[nextIdx]);
  return true;
};

function refreshOpenResidentSheet() {
  const sheet = document.querySelector('[data-resident-sheet]');
  const activeKey = selectedResidentKey || selectedSupplyKey;
  if (!activeKey || !sheet || sheet.hidden) return;
  const person = residentByKey(activeKey);
  if (person) openResidentSheet(person, true);
}

function persistWorldPersonChange(person, updates, note, costCoins = 0, openStaffId = '') {
  const id = person.lineKey || person.key;
  const current = personProfile(person);
  personRuntimeState[id] = {
    ...(personRuntimeState[id] || {}),
    hired: updates.hired ?? current.hired,
    level: updates.level ?? current.level,
    energy: updates.energy ?? current.energy,
    moodBoost: updates.moodBoost ?? current.moodBoost,
    lineLevel: updates.lineLevel ?? current.lineLevel
  };
  const updatedMood = residentMood(person);
  const save = readSupplyState();
  save.worldHiredPeople = { ...(save.worldHiredPeople || {}), [id]: Boolean(personRuntimeState[id].hired) };
  save.worldPersonStats = {
    ...(save.worldPersonStats || {}),
    [id]: {
      hired: Boolean(personRuntimeState[id].hired),
      level: personRuntimeState[id].level,
      energy: personRuntimeState[id].energy,
      moodBoost: personRuntimeState[id].moodBoost,
      happiness: updatedMood.score
    }
  };
  if (person.crewId) {
    save.characters = save.characters || {};
    save.characters[person.crewId] = {
      ...(save.characters[person.crewId] || { level: 1, xp: 0, uses: 0 }),
      hired: Boolean(personRuntimeState[id].hired),
      level: personRuntimeState[id].level,
      energy: personRuntimeState[id].energy,
      task: person.primarySkill || 'route',
      happiness: updatedMood.score
    };
  }
  if (person.lineKey && personRuntimeState[id].hired) {
    save.idleLines = save.idleLines || { lines: {}, managers: {}, autoCollect: {} };
    save.idleLines.managers = { ...(save.idleLines.managers || {}), [person.lineKey]: true };
    save.idleLines.autoCollect = { ...(save.idleLines.autoCollect || {}), [person.lineKey]: true };
    save.idleLines.lines = save.idleLines.lines || {};
    const curLine = save.idleLines.lines[person.lineKey] || { level: 0, cycle: 0, collected: 0 };
    if ((curLine.level || 0) < 1) curLine.level = 1;
    save.idleLines.lines[person.lineKey] = curLine;
  }
  if (costCoins > 0 && save.currencies) {
    save.currencies.coins = Math.max(0, (save.currencies.coins || 0) - costCoins);
  }
  const cityAvg = cityNeedStats().average;
  save.worldHappiness = { average: cityAvg, updatedAt: Date.now() };
  try {
    localStorage.setItem('autoMergeGarageV10LocalOnly', JSON.stringify(save));
  } catch {}
  window.dispatchEvent(new CustomEvent('world-person-sync', {
    detail: {
      personId: id,
      crewId: person.crewId,
      lineKey: person.lineKey || null,
      hired: Boolean(personRuntimeState[id].hired),
      level: personRuntimeState[id].level,
      energy: personRuntimeState[id].energy,
      primarySkill: person.primarySkill || 'route',
      happiness: updatedMood.score,
      cityAverageHappiness: cityAvg,
      costCoins,
      note,
      openStaffId
    }
  }));
  return updatedMood;
}

window.hireWorldPersonSafe = (keyOrId) => {
  const person = residentByKey(keyOrId);
  if (!person) return false;
  const id = person.lineKey || person.key;
  const prof = personProfile(person);
  if (prof.hired) return true;
  const purse = playerPurse();
  const charge = Math.min(Number(purse.coins ?? prof.hireCost), prof.hireCost);
  if (typeof purse.coins === 'number') purse.coins = Math.max(0, purse.coins - charge);
  shiftRelationship(id, person.name, 10);
  const updatedMood = persistWorldPersonChange(
    person,
    {
      hired: true,
      level: Math.max(2, prof.level),
      energy: 100,
      moodBoost: (prof.moodBoost || 0) + 14,
      lineLevel: Math.max(1, prof.lineLevel)
    },
    `${person.name} hired as ${person.jobTitle}! Happiness ${updatedMoodText(person)} · Auto-boosting ${person.business}.`,
    charge
  );
  lastBondNote = `Hired ${person.name}! Happiness jumped to ${updatedMood.score}% (+${updatedMood.profile.totalModeBonusPct}% All Mode Buffs).`;
  refreshOpenResidentSheet();
  updateHud();
  return true;
};

function updatedMoodText(person) {
  const m = residentMood(person);
  return `${m.score}%`;
}

window.trainWorldPersonSafe = (keyOrId) => {
  const person = residentByKey(keyOrId);
  if (!person) return false;
  const id = person.lineKey || person.key;
  const prof = personProfile(person);
  const purse = playerPurse();
  const charge = Math.min(Number(purse.coins ?? prof.trainCost), prof.trainCost);
  if (typeof purse.coins === 'number') purse.coins = Math.max(0, purse.coins - charge);
  shiftRelationship(id, person.name, 5);
  const nextLevel = prof.level + 1;
  const updatedMood = persistWorldPersonChange(
    person,
    {
      hired: true,
      level: nextLevel,
      energy: Math.max(60, prof.energy - 6),
      moodBoost: (prof.moodBoost || 0) + 5
    },
    `${person.name} trained to Lv ${nextLevel} (${rankLabelForPersonLevel(nextLevel)})! Skills +3.5% · Mode Buffs +${prof.totalModeBonusPct + 3}%.`,
    charge
  );
  lastBondNote = `Trained to Lv ${nextLevel}! ${prof.primarySkillLabel} is now ${updatedMood.profile.primarySkillValue}%.`;
  refreshOpenResidentSheet();
  updateHud();
  return true;
};

window.boostWorldPersonSafe = (keyOrId) => {
  const person = residentByKey(keyOrId);
  if (!person) return false;
  const id = person.lineKey || person.key;
  const prof = personProfile(person);
  const purse = playerPurse();
  const charge = Math.min(Number(purse.coins ?? 25), 25);
  if (typeof purse.coins === 'number') purse.coins = Math.max(0, purse.coins - charge);
  shiftRelationship(id, person.name, 8);
  const updatedMood = persistWorldPersonChange(
    person,
    {
      hired: prof.hired,
      level: prof.level,
      energy: 100,
      moodBoost: Math.min(36, (prof.moodBoost || 0) + 12)
    },
    `${person.name} morale boosted! Energy 100/100 · Happiness ${Math.min(100, residentMood(person).score + 10)}%.`,
    charge
  );
  lastBondNote = `Morale boosted! Happiness is now ${updatedMood.score}% (${updatedMood.label}).`;
  refreshOpenResidentSheet();
  updateHud();
  return true;
};

window.openStaffFromWorldSafe = (crewIdOrKey) => {
  const person = residentByKey(crewIdOrKey) || SUPPLY_MANAGERS.find((s) => s.crewId === crewIdOrKey) || RESIDENT_WANTS.find((r) => r.crewId === crewIdOrKey);
  const targetId = person?.crewId || crewIdOrKey || 'crew-001';
  window.dispatchEvent(new CustomEvent('world-person-sync', {
    detail: { openStaffId: targetId }
  }));
  return true;
};

window.openPersonGameScreenSafe = (screenKey = 'lines') => {
  if (screenKey === 'lines') {
    window.openSupplyFromWorld?.();
    return true;
  }
  const proxy = document.querySelector(`.pixiWorldProxy[data-proxy="${screenKey}"]`);
  if (proxy) {
    proxy.click();
    return true;
  }
  return false;
};

window.inspectSupplyManagerSafe = (lineKeyOrIndex = 0) => {
  let staff = null;
  if (typeof lineKeyOrIndex === 'string') {
    staff = SUPPLY_MANAGERS.find((s) => s.lineKey === lineKeyOrIndex || s.key === lineKeyOrIndex) || SUPPLY_MANAGERS[0];
  } else {
    staff = SUPPLY_MANAGERS[Math.abs(Number(lineKeyOrIndex) || 0) % SUPPLY_MANAGERS.length];
  }
  if (!staff) return false;
  openSupplyManager(staff);
  return true;
};

window.inspectMobileResidentSafe = (index = 0) => {
  const resident = RESIDENT_WANTS[Math.abs(Number(index) || 0) % RESIDENT_WANTS.length];
  openResidentSheet(resident);
};

window.inspectResidentByKeySafe = (key) => {
  const resident = residentByKey(key);
  if (!resident) return false;
  openResidentSheet(resident);
  return true;
};

window.openResidentNeedMenuSafe = (menu = 'mood') => {
  selectedResidentMenu = residentMenuTarget(menu);
  refreshOpenResidentSheet();
  publishWorldOpenState();
  return true;
};

window.openResidentProblemBuildingsSafe = (problemKey = 'mapBuild') => {
  selectedResidentMenu = `problem:${problemKey}`;
  refreshOpenResidentSheet();
  publishWorldOpenState();
  return true;
};

window.openCityIssueMenuSafe = (problemKey = 'mapBuild') => {
  const resident = RESIDENT_WANTS.find((item) => (item.factors || []).includes(problemKey)) || RESIDENT_WANTS[0];
  openResidentSheet(resident);
  selectedResidentMenu = `problem:${problemKey}`;
  refreshOpenResidentSheet();
  publishWorldOpenState();
  return true;
};


window.inspectResidentBuildingSafe = (token) => {
  const target = targetFromToken(token);
  if (!target) return false;
  openBuildingSheet(target);
  return true;
};

window.repairResidentBuildingSafe = (token) => {
  const target = targetFromToken(token);
  return target ? repairBuildingTarget(target) : false;
};

window.restockResidentBuildingSafe = (token) => {
  const target = targetFromToken(token);
  if (!target) return false;
  const record = getBuildingRecord(target);
  if (!record) return false;
  updateBuildingRecord(target, (item) => { item.stock = 100; });
  rebuildFixedBuildings();
  rebuildPlacements();
  rebuildIncidents();
  refreshOpenResidentSheet();
  updateHud();
  return true;
};

window.inspectMobileBuildingSafe = (index = 0) => {
  const item = placedBuildings[Math.abs(Number(index) || 0) % Math.max(placedBuildings.length, 1)];
  if (item?.id) openPlacedSheet(item.id);
  else openFixedBuildingSheet(CITY_BUILDINGS[Math.abs(Number(index) || 0) % CITY_BUILDINGS.length]);
};

window.inspectFixedMobileBuildingSafe = (index = 0) => {
  openFixedBuildingSheet(CITY_BUILDINGS[Math.abs(Number(index) || 0) % CITY_BUILDINGS.length]);
};

window.inspectMobileCityVehicleSafe = (assetKeyOrIndex = 0) => {
  if (!traffic.length) return false;
  let item = null;
  if (typeof assetKeyOrIndex === 'string') {
    item = traffic.find((t) => t.assetKey === assetKeyOrIndex) || traffic[0];
  } else {
    item = traffic[Math.abs(Number(assetKeyOrIndex) || 0) % traffic.length];
  }
  if (!item) return false;
  openVehicleInspector(item);
  return true;
};

window.closeMobileVehicleSheetSafe = () => {
  const sheet = document.querySelector('[data-vehicle-sheet]');
  if (sheet) sheet.hidden = true;
  traffic.forEach((t) => { t.isSelected = false; });
  selectedVehicleItem = null;
  document.querySelector('.mobileCityHud')?.classList.remove('vehicle-open');
  publishWorldOpenState();
};

window.openMobileBuildTraySafe = () => {
  mode = 'placing';
  pendingPlacement = null;
  movingBuilding = null;
  selectedPlacedId = null;
  selectedBuildingTarget = null;
  selectedResidentKey = null;
  selectedResidentMenu = 'mood';
  traffic.forEach((t) => { t.isSelected = false; });
  selectedVehicleItem = null;
  document.querySelector('[data-resident-sheet]')?.setAttribute('hidden', '');
  document.querySelector('[data-placed-sheet]')?.setAttribute('hidden', '');
  document.querySelector('[data-vehicle-sheet]')?.setAttribute('hidden', '');
  document.querySelector('.mobileCityHud')?.classList.remove('building-open', 'resident-open', 'vehicle-open');
  clearGhost();
  rebuildGrid();
  updateHud();
};

window.selectMobileBuildingSafe = (key) => {
  if (!defByKey(key)) return;
  if (ownedRemaining(key) <= 0 && mode !== 'moving') return;
  selectedKey = key;
  selectedRotation = 0;
  pendingPlacement = null;
  clearGhost();
  mode = 'placing';
  rebuildGrid();
  updateHud();
};

window.confirmMobilePlacementSafe = () => {
  if (!pendingPlacement) return;
  const def = selectedDef();
  if (mode === 'moving' && movingBuilding) {
    placedBuildings = placedBuildings.map((b) => b.id === movingBuilding.id ? normalizePlacedBuilding({ ...b, x: pendingPlacement.x, y: pendingPlacement.y, rotation: pendingPlacement.rotation || 0 }) : b);
  } else {
    if (ownedRemaining(def.key) <= 0) return;
    placedBuildings.push(normalizePlacedBuilding({ id: `${def.key}-${Date.now()}`, type: def.key, name: def.shortName, x: pendingPlacement.x, y: pendingPlacement.y, stock: 70, rotation: pendingPlacement.rotation || 0 }));
  }
  savePlaced();
  mode = 'normal';
  pendingPlacement = null;
  movingBuilding = null;
  selectedPlacedId = null;
  selectedBuildingTarget = null;
  selectedResidentKey = null;
  selectedResidentMenu = 'mood';
  traffic.forEach((t) => { t.isSelected = false; });
  selectedVehicleItem = null;
  document.querySelector('.mobileCityHud')?.classList.remove('building-open', 'resident-open', 'vehicle-open');
  clearGhost();
  rebuildPlacements();
  rebuildIncidents();
  rebuildGrid();
  updateHud();
};

window.cancelMobilePlacementSafe = () => {
  mode = 'normal';
  pendingPlacement = null;
  movingBuilding = null;
  selectedPlacedId = null;
  selectedBuildingTarget = null;
  selectedResidentKey = null;
  selectedResidentMenu = 'mood';
  traffic.forEach((t) => { t.isSelected = false; });
  selectedVehicleItem = null;
  document.querySelector('.mobileCityHud')?.classList.remove('building-open', 'resident-open', 'vehicle-open');
  clearGhost();
  rebuildPlacements();
  rebuildIncidents();
  rebuildGrid();
  updateHud();
};

window.clearMobilePlacementsSafe = () => {
  placedBuildings = [];
  localStorage.removeItem(GRID.storageKey);
  mode = 'normal';
  pendingPlacement = null;
  movingBuilding = null;
  selectedPlacedId = null;
  selectedBuildingTarget = null;
  selectedResidentKey = null;
  selectedResidentMenu = 'mood';
  traffic.forEach((t) => { t.isSelected = false; });
  selectedVehicleItem = null;
  document.querySelector('.mobileCityHud')?.classList.remove('building-open', 'resident-open', 'vehicle-open');
  clearGhost();
  rebuildPlacements();
  rebuildIncidents();
  rebuildGrid();
  updateHud();
};

window.closeMobileBuildingSheetSafe = () => {
  selectedPlacedId = null;
  selectedBuildingTarget = null;
  selectedResidentKey = null;
  selectedResidentMenu = 'mood';
  lastBuildingActionNote = '';
  sync3DBuildings();
  document.querySelector('.mobileCityHud')?.classList.remove('building-open', 'resident-open', 'vehicle-open');
  const sheet = document.querySelector('[data-placed-sheet]');
  if (sheet) sheet.hidden = true;
  publishWorldOpenState();
};

window.closeMobileResidentSheetSafe = () => {
  const sheet = document.querySelector('[data-resident-sheet]');
  if (sheet) sheet.hidden = true;
  walkers.forEach((w) => { w.isSelected = false; });
  selectedResidentKey = null;
  selectedSupplyKey = null;
  selectedResidentMenu = 'job';
  document.querySelector('.mobileCityHud')?.classList.remove('resident-open');
  publishWorldOpenState();
};

window.openSupplyFromWorld = () => {
  document.querySelector('.pixiWorldProxy[data-proxy="lines"]')?.click();
};

window.openBuildingTabSafe = (tabKey = 'overview') => {
  selectedBuildingTab = ['overview', 'staff', 'modes', 'district'].includes(tabKey) ? tabKey : 'overview';
  if (selectedBuildingTarget) openBuildingSheet(selectedBuildingTarget, true);
  return selectedBuildingTab;
};

window.setBuildingWorkModeSafe = (modeKey = 'standard') => {
  const target = selectedBuildingTarget;
  const record = getBuildingRecord(target);
  if (!record || !BUILDING_WORK_MODES[modeKey]) return false;
  const wm = BUILDING_WORK_MODES[modeKey];
  const bTitle = record.fixed?.label || record.item.name || record.def.shortName;
  updateBuildingRecord(target, (item) => {
    item.workMode = modeKey;
  });
  lastBuildingActionNote = `${bTitle} switched to ${wm.icon} ${wm.label} (${wm.desc})!`;
  dispatchWorldBuildingSync({
    note: `${bTitle} set to ${wm.label}!`
  });
  rebuildFixedBuildings();
  rebuildPlacements();
  openBuildingSheet(target, true);
  updateHud();
  return true;
};

window.collectSelectedMobileBuildingSafe = () => {
  return collectBuildingTarget(selectedBuildingTarget, { refreshOpenSheet: true });
};

window.rushSelectedMobileBuildingSafe = () => {
  const target = selectedBuildingTarget;
  const record = getBuildingRecord(target);
  if (!record) return false;
  const status = collectStatus(record.item, record.def);
  const rushFee = status.rushCostCoins || 10;
  const purse = playerPurse();
  const charge = Math.min(Number(purse.coins ?? rushFee), rushFee);
  if (typeof purse.coins === 'number') purse.coins = Math.max(0, purse.coins - charge);
  dispatchWorldBuildingSync({ costCoins: charge });
  return collectBuildingTarget(target, { refreshOpenSheet: true, forceCollect: true });
};

window.upgradeSelectedMobileBuildingSafe = () => {
  const target = selectedBuildingTarget;
  const record = getBuildingRecord(target);
  if (!record) return false;
  const req = upgradeRequirement(record.item, record.def);
  if (req.maxed) return false;
  const bTitle = record.fixed?.label || record.item.name || record.def.shortName;
  const purse = playerPurse();
  const charge = Math.min(Number(purse.coins ?? req.coinCost), req.coinCost);
  if (typeof purse.coins === 'number') purse.coins = Math.max(0, purse.coins - charge);
  updateBuildingRecord(target, (item) => {
    item.level = req.nextLevel;
    item.stock = Math.max(85, item.stock ?? 80);
    item.health = 100;
    item.collected = Math.max(item.collected || 0, req.collectNeed || 0);
  });
  const newYield = buildingYield(record.item, record.def);
  lastBuildingActionNote = `Upgraded ${bTitle} to Level ${req.nextLevel}! Output is now +${newYield} ${record.def.outputLabel}/cycle.`;
  dispatchWorldBuildingSync({
    costCoins: charge,
    note: `${bTitle} upgraded to Lv ${req.nextLevel}! (+${newYield} ${record.def.outputLabel}/run)`
  });
  rebuildFixedBuildings();
  rebuildPlacements();
  rebuildIncidents();
  openBuildingSheet(target, true);
  refreshOpenResidentSheet();
  updateHud();
  return true;
};

window.restockSelectedMobileBuildingSafe = () => {
  const target = selectedBuildingTarget;
  const record = getBuildingRecord(target);
  if (!record) return false;
  const stockNow = Math.round(record.item.stock ?? 80);
  const restockCost = stockNow >= 100 ? 0 : Math.max(10, Math.round(((100 - stockNow) / 100) * (record.def.restockCostBase || 32)));
  const bTitle = record.fixed?.label || record.item.name || record.def.shortName;
  const purse = playerPurse();
  const charge = Math.min(Number(purse.coins ?? restockCost), restockCost);
  if (typeof purse.coins === 'number') purse.coins = Math.max(0, purse.coins - charge);
  updateBuildingRecord(target, (item) => { item.stock = 100; });
  lastBuildingActionNote = `Restocked ${bTitle} to 100% supply capacity!`;
  dispatchWorldBuildingSync({
    costCoins: charge,
    note: `${bTitle} restocked to 100%!`
  });
  rebuildFixedBuildings();
  rebuildPlacements();
  rebuildIncidents();
  openBuildingSheet(target, true);
  refreshOpenResidentSheet();
  updateHud();
  return true;
};

function repairBuildingTarget(target, options = {}) {
  const record = getBuildingRecord(target);
  if (!record) return false;
  const healthNow = Math.round(record.item.health ?? 88);
  const repairCost = healthNow >= 100 ? 0 : Math.max(10, Math.round(((100 - healthNow) / 100) * (record.def.repairCostBase || 28)));
  const bTitle = record.fixed?.label || record.item.name || record.def.shortName;
  const purse = playerPurse();
  const charge = Math.min(Number(purse.coins ?? repairCost), repairCost);
  if (typeof purse.coins === 'number') purse.coins = Math.max(0, purse.coins - charge);
  updateBuildingRecord(target, (item) => {
    item.health = 100;
    item.lastRepairedAt = Date.now();
    item.repairs = (item.repairs || 0) + 1;
  });
  lastBuildingActionNote = `Repaired ${bTitle} to 100% structural health!`;
  dispatchWorldBuildingSync({
    costCoins: charge,
    note: `${bTitle} repaired to 100% health!`
  });
  rebuildFixedBuildings();
  rebuildPlacements();
  rebuildIncidents();
  if (options.refreshOpenSheet || targetMatches(selectedBuildingTarget, target)) openBuildingSheet(target, true);
  refreshOpenResidentSheet();
  updateHud();
  return true;
}

window.repairSelectedMobileBuildingSafe = () => {
  return repairBuildingTarget(selectedBuildingTarget, { refreshOpenSheet: true });
};

window.hireBuildingPersonSafe = (personId) => {
  const ok = window.hireWorldPersonSafe?.(personId);
  const person = residentByKey(personId);
  if (person) {
    lastBuildingActionNote = `Hired ${person.name} (${person.jobTitle})! Building yield & cycle speed boosted.`;
  }
  rebuildFixedBuildings();
  rebuildPlacements();
  if (selectedBuildingTarget) openBuildingSheet(selectedBuildingTarget, true);
  return ok;
};

window.trainBuildingPersonSafe = (personId) => {
  const ok = window.trainWorldPersonSafe?.(personId);
  const person = residentByKey(personId);
  if (person) {
    const prof = personProfile(person);
    lastBuildingActionNote = `Trained ${person.name} to Lv ${prof.level}! Building staff multiplier increased.`;
  }
  rebuildFixedBuildings();
  rebuildPlacements();
  if (selectedBuildingTarget) openBuildingSheet(selectedBuildingTarget, true);
  return ok;
};

window.boostBuildingPersonSafe = (personId) => {
  const ok = window.boostWorldPersonSafe?.(personId);
  const person = residentByKey(personId);
  if (person) {
    const mood = residentMood(person);
    lastBuildingActionNote = `Boosted ${person.name}'s morale to ${mood.score}% (${mood.label})!`;
  }
  rebuildFixedBuildings();
  rebuildPlacements();
  if (selectedBuildingTarget) openBuildingSheet(selectedBuildingTarget, true);
  return ok;
};

window.inspectBuildingPersonSafe = (personId) => {
  const person = residentByKey(personId);
  if (!person) return false;
  const sheet = document.querySelector('[data-placed-sheet]');
  if (sheet) sheet.hidden = true;
  selectedBuildingTarget = null;
  selectedPlacedId = null;
  sync3DBuildings();
  if (person.lineKey) openSupplyManager(person);
  else openResidentSheet(person);
  return true;
};

window.syncBuildingSupplyLineSafe = () => {
  const target = selectedBuildingTarget;
  const record = getBuildingRecord(target);
  if (!record) return false;
  const lineKey = record.fixed?.lineKey || record.def.lineKey || 'streetRoute';
  const leadStaff = supplyManagerByLine(lineKey) || SUPPLY_MANAGERS[0];
  const save = readSupplyState();
  save.idleLines = save.idleLines || {};
  save.idleLines.lines = save.idleLines.lines || {};
  const cur = save.idleLines.lines[lineKey] || { level: 1, cycle: 0, collected: 0 };
  const nextLv = (cur.level || 1) + 1;
  cur.level = nextLv;
  save.idleLines.lines[lineKey] = cur;
  save.idleLines.managers = { ...(save.idleLines.managers || {}), [lineKey]: true };
  save.idleLines.autoCollect = { ...(save.idleLines.autoCollect || {}), [lineKey]: true };
  try {
    localStorage.setItem('autoMergeGarageV10LocalOnly', JSON.stringify(save));
  } catch {}
  lastBuildingActionNote = `Boosted ${leadStaff?.business || 'Supply Line'} to Lv ${nextLv} & synced auto-collect!`;
  dispatchWorldBuildingSync({
    costCoins: 45,
    supplyLineKey: lineKey,
    supplyLineLevel: nextLv,
    autoCollect: true,
    note: `${leadStaff?.business || 'Supply Line'} boosted to Lv ${nextLv}!`
  });
  rebuildFixedBuildings();
  rebuildPlacements();
  openBuildingSheet(target, true);
  updateHud();
  return true;
};

window.claimBuildingWorkshopCrateSafe = () => {
  const target = selectedBuildingTarget;
  const record = getBuildingRecord(target);
  if (!record) return false;
  const sec = buildingSecondaryYield(record.item, record.def);
  const crateAmt = sec.amount * 2;
  const bonusCoins = Math.max(12, Math.round(buildingYield(record.item, record.def) * 0.6));
  const bTitle = record.fixed?.label || record.item.name || record.def.shortName;
  updateBuildingRecord(target, (item) => {
    item.cratesClaimed = (item.cratesClaimed || 0) + 1;
  });
  lastBuildingActionNote = `Claimed Workshop Crate from ${bTitle}: +${crateAmt} ${sec.label} & +${bonusCoins} Coins!`;
  dispatchWorldBuildingSync({
    rewardCurrencies: {
      [sec.output]: crateAmt,
      coins: bonusCoins
    },
    note: `Workshop Crate claimed: +${crateAmt} ${sec.label} & +${bonusCoins} Coins!`
  });
  openBuildingSheet(target, true);
  updateHud();
  return true;
};

window.selectBuildingFromDistrictSafe = (token) => {
  const target = targetFromToken(token);
  if (!target) return false;
  selectedBuildingTab = 'overview';
  openBuildingSheet(target);
  return true;
};

window.collectDistrictBuildingSafe = (token) => {
  const target = targetFromToken(token);
  if (!target) return false;
  collectBuildingTarget(target, { refreshOpenSheet: false, forceCollect: true });
  if (selectedBuildingTarget) openBuildingSheet(selectedBuildingTarget, true);
  return true;
};

window.batchBuildingActionSafe = (action = 'collect') => {
  const records = allBuildingRecords();
  let count = 0;
  let totalCoinsEarned = 0;
  if (action === 'collect') {
    for (const rec of records) {
      const st = collectStatus(rec.item, rec.def);
      if (st.ready) {
        totalCoinsEarned += buildingYield(rec.item, rec.def);
        collectBuildingTarget(rec.target, { refreshOpenSheet: false });
        count += 1;
      }
    }
    lastBuildingActionNote = count > 0
      ? `Batch collected ${count} ready building${count === 1 ? '' : 's'} (+${totalCoinsEarned} primary output)!`
      : 'All buildings are currently mid-cycle. Use Rush Cycle for instant collection!';
  } else if (action === 'restock') {
    for (const rec of records) {
      if ((rec.item.stock ?? 80) < 100) {
        updateBuildingRecord(rec.target, (item) => { item.stock = 100; });
        count += 1;
      }
    }
    lastBuildingActionNote = `Restocked ${count} city building${count === 1 ? '' : 's'} to 100% supply!`;
    dispatchWorldBuildingSync({
      costCoins: count * 18,
      note: `Restocked ${count} city buildings to 100%!`
    });
  } else if (action === 'repair') {
    for (const rec of records) {
      if ((rec.item.health ?? 88) < 100) {
        updateBuildingRecord(rec.target, (item) => { item.health = 100; });
        count += 1;
      }
    }
    lastBuildingActionNote = `Repaired ${count} city building${count === 1 ? '' : 's'} to 100% health!`;
    dispatchWorldBuildingSync({
      costCoins: count * 15,
      note: `Repaired ${count} city buildings to 100% health!`
    });
  }
  rebuildFixedBuildings();
  rebuildPlacements();
  rebuildIncidents();
  if (selectedBuildingTarget) openBuildingSheet(selectedBuildingTarget, true);
  updateHud();
  return count;
};

window.moveSelectedMobileBuildingSafe = () => {
  if (selectedBuildingTarget?.kind !== 'placed') return false;
  const item = placedBuildings.find((b) => b.id === selectedBuildingTarget.id);
  if (!item) return false;
  movingBuilding = item;
  selectedKey = item.type;
  selectedRotation = item.rotation || 0;
  mode = 'moving';
  pendingPlacement = null;
  selectedBuildingTarget = null;
  clearGhost();
  rebuildPlacements();
  rebuildGrid();
  updateHud();
  return true;
};

window.rotateMobileBuildingSafe = () => {
  if (mode !== 'placing' && mode !== 'moving') return false;
  selectedRotation = (selectedRotation + 1) % 4;
  if (pendingPlacement) {
    const col = Math.round(pendingPlacement.x / GRID.size);
    const row = Math.round(pendingPlacement.y / GRID.size);
    if (canBuild(col, row, selectedDef(), selectedRotation)) {
      pendingPlacement = { ...pendingPlacement, rotation: selectedRotation };
    } else {
      pendingPlacement = null;
    }
  }
  clearGhost();
  drawGhost();
  rebuildGrid();
  updateHud();
  return true;
};

window.centerMobileCitySafe = () => {
  if (!world) return;
  world.x = WORLD.startX;
  world.y = WORLD.startY;
  if (threeViewport) threeViewport.setZoom(1.0);
  clamp();
};

window.zoomMobileCityInSafe = () => {
  if (!threeViewport) return 1.0;
  return threeViewport.zoomIn(0.18);
};

window.zoomMobileCityOutSafe = () => {
  if (!threeViewport) return 1.0;
  return threeViewport.zoomOut(0.18);
};

window.setMobileCityZoomSafe = (z = 1.0) => {
  if (!threeViewport) return 1.0;
  return threeViewport.setZoom(z);
};

window.toggleCityCameraAngleSafe = () => {
  if (!threeViewport) return null;
  const preset = threeViewport.cycleCameraPreset();
  const btn = document.querySelector('[data-camera-angle-btn]');
  if (btn && preset) btn.textContent = preset.label;
  return preset?.id || null;
};

window.panMobileCitySafe = (x = 0, y = 0) => {
  if (!world) return;
  world.x = Number(x) || 0;
  world.y = Number(y) || 0;
  clamp();
};

function computeBuildingsStateSig() {
  const selSig = selectedBuildingTarget ? `${selectedBuildingTarget.kind}:${selectedBuildingTarget.id}` : 'none';
  const fixedSig = CITY_BUILDINGS.map((b) => {
    const id = fixedId(b);
    const st = fixedBuildingStates[id] || normalizeBuildingState({}, b.type);
    const ready = collectStatus(st, defByKey(b.type)).ready ? 1 : 0;
    return `${id}:${st.level || 1}:${ready}:${st.workMode || 'standard'}`;
  }).join('|');
  const placedSig = placedBuildings.map((b) => {
    const ready = collectStatus(b, defByKey(b.type)).ready ? 1 : 0;
    return `${b.id}:${b.x},${b.y},${b.rotation || 0}:${b.level || 1}:${ready}:${b.workMode || 'standard'}`;
  }).join('|');
  return `${mode}#${selSig}#${fixedSig}#${placedSig}`;
}

function buildWorld() {
  world = new PIXI.Container();
  world.sortableChildren = true;
  app.stage.addChild(world);
  fixedLayer = null;
  placementLayer = null;
  expansionLayer = null;
  incidentLayer = null;
  gridLayer = null;
  ghostLayer = null;
  animatedTrees = [];
  loadPlaced();
  loadFixedBuildingStates();
  loadTownExpansions();
  drawGround();
  drawRoads();
  rebuildFixedBuildings();

  // Iconic JDM, Muscle, 4x4 & Supercar 3D Sculpted Fleet across Horizontal (East/West) & Vertical (North/South) Avenues
  // Avenue 0 (Dealer / Factory Ave): Skyline R34, Mustang Fastback V8, 180SX Type-X, Pajero Evo 4x4
  addTraffic(pathH(0, 'east'), { direction: 'east', speed: 88, scale: 0.84, startD: 210, assetKey: 'skylineR34' });
  addTraffic(pathH(0, 'east'), { direction: 'east', speed: 84, scale: 0.84, startD: 490, assetKey: 'mustangFastback' });
  addTraffic(pathH(0, 'west'), { direction: 'west', speed: 82, scale: 0.82, startD: 470, assetKey: 'sx180' });
  addTraffic(pathH(0, 'west'), { direction: 'west', truck: true, speed: 76, scale: 0.84, startD: 675, assetKey: 'pajeroEvo' });

  // Avenue 1 (Parts / Repair Row): RX-7 FD3S Rotary, Silvia S15 Spec-R, 300ZX Twin-Turbo, 365 Heavy Wrecker
  addTraffic(pathH(1, 'east'), { direction: 'east', speed: 90, scale: 0.84, startD: 390, assetKey: 'rx7Spirit' });
  addTraffic(pathH(1, 'east'), { direction: 'east', truck: true, speed: 68, scale: 0.82, startD: 690, assetKey: 'towTruck', towTargetKey: 'sx180' });
  addTraffic(pathH(1, 'west'), { direction: 'west', speed: 86, scale: 0.84, startD: 450, assetKey: 'silviaS15' });
  addTraffic(pathH(1, 'west'), { direction: 'west', speed: 84, scale: 0.84, startD: 660, assetKey: 'zx300' });

  // Avenue 2 (Salvage Way): Aero-Top GT90, Baja Raptor 4x4, 365 Parts Sprinter Van
  addTraffic(pathH(2, 'east'), { direction: 'east', speed: 88, scale: 0.84, startD: 360, assetKey: 'supraMk4' });
  addTraffic(pathH(2, 'east'), { direction: 'east', truck: true, speed: 72, scale: 0.82, startD: 690, assetKey: 'deliveryVan' });
  addTraffic(pathH(2, 'west'), { direction: 'west', truck: true, speed: 76, scale: 0.84, startD: 490, assetKey: 'greenTruck' });

  // Avenue 3 (Showcase Loop): Apex V10 Supercar, Skyline R34
  addTraffic(pathH(3, 'west'), { direction: 'west', speed: 94, scale: 0.84, startD: 420, assetKey: 'superCar' });
  addTraffic(pathH(3, 'east'), { direction: 'east', speed: 86, scale: 0.84, startD: 460, assetKey: 'skylineR34' });

  // Vertical Avenues (West Service & East Service): North/South Cross-Traffic obeying 3D Intersection Signals!
  addTraffic(pathV(0, 'south'), { direction: 'south', speed: 84, scale: 0.84, startD: 190, assetKey: 'mustangFastback' });
  addTraffic(pathV(0, 'north'), { direction: 'north', speed: 86, scale: 0.84, startD: 1320, assetKey: 'silviaS15' });
  addTraffic(pathV(1, 'south'), { direction: 'south', truck: true, speed: 78, scale: 0.84, startD: 390, assetKey: 'pajeroEvo' });
  addTraffic(pathV(1, 'north'), { direction: 'north', speed: 90, scale: 0.84, startD: 1180, assetKey: 'rx7Spirit' });

  [
    { key: 'tree', x: 390, y: 170, w: 66, h: 78 },
    { key: 'tree', x: 608, y: 170, w: 64, h: 76 },
    { key: 'tree', x: 390, y: 478, w: 64, h: 76 },
    { key: 'tree', x: 608, y: 478, w: 64, h: 76 },
    { key: 'tree', x: 390, y: 798, w: 64, h: 76 },
    { key: 'tree', x: 608, y: 798, w: 64, h: 76 },
    { key: 'streetlight', x: 590, y: 330, w: 34, h: 64 },
    { key: 'streetlight', x: 220, y: 330, w: 34, h: 64 },
    { key: 'parkingSign', x: 370, y: 1010, w: 38, h: 60 },
    { key: 'roadCone', x: 505, y: 725, w: 34, h: 44 }
  ].forEach((prop, idx) => {
    const sprite = assetSprite(WORLD_ASSETS.props[prop.key], prop.x, prop.y, prop.w, prop.h, 1);
    if (sprite) {
      sprite.zIndex = prop.y + 20;
      world.addChild(sprite);
      if (prop.key === 'tree') {
        animatedTrees.push({ sprite, phase: idx * 1.15, baseScaleX: sprite.scale.x, baseScaleY: sprite.scale.y });
      }
    }
  });

  addWalker(blockLoop(0, 0), RESIDENT_WANTS[0], 0x2563eb, 45);
  addWalker(blockLoop(0, 2), RESIDENT_WANTS[1], 0x16a34a, 140);
  addWalker(blockLoop(1, 0), RESIDENT_WANTS[2], 0xf97316, 95);
  addWalker(blockLoop(1, 1), RESIDENT_WANTS[3], 0x7c3aed, 220);
  addWalker(blockLoop(2, 0), RESIDENT_WANTS[4], 0x38bdf8, 130);
  addWalker(blockLoop(2, 2), RESIDENT_WANTS[5], 0xfacc15, 185);
  addWalker(avenueLoop(0, 'north'), RESIDENT_WANTS[0], 0x2563eb, 340);
  addWalker(avenueLoop(1, 'south'), RESIDENT_WANTS[2], 0xf97316, 480);
  addWalker(avenueLoop(3, 'north'), RESIDENT_WANTS[4], 0x38bdf8, 610);
  SUPPLY_MANAGERS.forEach((staff, index) => {
    const blockCol = index % 3;
    const blockRow = Math.min(2, Math.floor(index / 2));
    const path = index < 4
      ? blockLoop(blockRow, blockCol)
      : avenueLoop(index % ROADS.horizontal.length, index % 2 ? 'south' : 'north');
    addSupplyWalker(path, staff, 85 + index * 145);
  });

  placementLayer = new PIXI.Container();
  placementLayer.zIndex = 4000;
  world.addChild(placementLayer);
  ghostLayer = new PIXI.Container();
  ghostLayer.zIndex = 4500;
  world.addChild(ghostLayer);
  rebuildExpansions();
  rebuildPlacements();
  rebuildIncidents();
  rebuildGrid();
  lastBuildingsStateSig = computeBuildingsStateSig();
  dispatchWorldBuildingSync();
  updateHud();
}

function clamp() {
  const viewW = app.renderer.width / app.renderer.resolution;
  const viewH = app.renderer.height / app.renderer.resolution;
  world.x = Math.max(Math.min(0, viewW - WORLD.width - 120), Math.min(220, world.x));
  world.y = Math.max(Math.min(0, viewH - WORLD.height - 120), Math.min(260, world.y));
}

function setupCamera(host) {
  world.x = WORLD.startX;
  world.y = WORLD.startY;
  clamp();
  let dragging = false;
  let last = null;
  const activeTouches = new Map();
  let lastPinchDist = null;

  host.addEventListener('pointerdown', (event) => {
    activeTouches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (activeTouches.size === 1) {
      dragging = true;
      dragMoved = false;
      last = { x: event.clientX, y: event.clientY };
    } else if (activeTouches.size === 2) {
      const pts = [...activeTouches.values()];
      lastPinchDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      dragMoved = true;
    }
  });
  window.addEventListener('pointermove', (event) => {
    if (activeTouches.has(event.pointerId)) {
      activeTouches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
    if (activeTouches.size === 2 && threeViewport) {
      const pts = [...activeTouches.values()];
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      if (lastPinchDist && Math.abs(dist - lastPinchDist) > 1) {
        const zoomDelta = (lastPinchDist - dist) * 0.0035;
        threeViewport.setZoom(threeViewport.zoom + zoomDelta);
      }
      lastPinchDist = dist;
      dragMoved = true;
      return;
    }
    if (!dragging || !last) return;
    const dx = event.clientX - last.x;
    const dy = event.clientY - last.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
    world.x += dx;
    world.y += dy;
    last = { x: event.clientX, y: event.clientY };
    clamp();
  });
  const endPointer = (event) => {
    activeTouches.delete(event.pointerId);
    if (activeTouches.size < 2) lastPinchDist = null;
    if (dragging && !dragMoved && threeViewport && activeTouches.size === 0) {
      threeViewport.handleTap(event.clientX, event.clientY);
    }
    if (activeTouches.size === 0) {
      dragging = false;
      last = null;
      setTimeout(() => { dragMoved = false; }, 90);
    }
  };
  window.addEventListener('pointerup', endPointer);
  window.addEventListener('pointercancel', endPointer);
  host.addEventListener('wheel', (event) => {
    if (!threeViewport) return;
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.10 : -0.10;
    threeViewport.setZoom(threeViewport.zoom + delta);
  }, { passive: false });
}

async function createApp(host) {
  if (app) try { app.destroy(true); } catch {}
  if (threeViewport) {
    try { threeViewport.destroy(); } catch {}
    threeViewport = null;
  }
  app = new PIXI.Application();
  await app.init({ resizeTo: host, backgroundColor: 0x153a50, antialias: true, preference: 'webgl', resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true, preserveDrawingBuffer: true });
  host.innerHTML = '';
  app.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:0;pointer-events:none;z-index:1;';
  host.appendChild(app.canvas);
  threeViewport = new Three3DCityViewport(host, { WORLD, ROADS, GRID });
}

async function preloadPixiWorldAssets() {
  if (pixiWorldAssetsLoaded) return;
  pixiWorldAssetsLoaded = true;
  try {
    await Promise.race([
      PIXI.Assets.load(WORLD_ASSET_LIST.map((item) => item.src)),
      new Promise((resolve) => setTimeout(resolve, 550))
    ]);
  } catch (error) {
    console.warn('[365 World] Some override assets could not be preloaded; fallback shapes will remain visible.', error);
  }
}

async function mount(host) {
  if (mountedHost === host && initialized) return;
  initialized = true;
  mountedHost = host;
  traffic = [];
  walkers = [];
  statusRefreshTimer = 0;
  await createApp(host);
  await preloadPixiWorldAssets();
  buildWorld();
  setupCamera(host);
  app.ticker.add((ticker) => {
    const dt = Math.min((ticker.deltaMS || 16.67) / 1000, 0.05);
    worldAnimClock += dt;

    // Pre-calculate current world positions for all vehicles and pedestrians
    const vehiclePositions = traffic.map((item) => pathPoint(item.path, item.d));
    const walkerPositions = walkers.map((w) => pathPoint(w.path, w.d));

    // 1. Update Vehicles with Traffic Signal Stop Lines + Vehicle-to-Vehicle Queueing + Pedestrian Crosswalk Yielding
    for (let i = 0; i < traffic.length; i++) {
      const item = traffic[i];
      const p = vehiclePositions[i];
      const dir = item.direction || 'east';
      const ux = dir === 'east' ? 1 : dir === 'west' ? -1 : 0;
      const uy = dir === 'south' ? 1 : dir === 'north' ? -1 : 0;

      let targetSpeed = item.speed;

      // (A) 3D Intersection Traffic Light Stop Lines
      if (item.roadAxis === 'h') {
        const hIndex = item.roadIndex;
        for (let vIndex = 0; vIndex < ROADS.vertical.length; vIndex++) {
          const vx = ROADS.vertical[vIndex].x;
          const stopX = dir === 'east' ? vx - 24 : vx + ROADS.width + 24;
          const distToStop = (stopX - p.x) * ux;
          if (distToStop > -4 && distToStop < 78) {
            const sig = getIntersectionLightState(hIndex, vIndex, worldAnimClock);
            if (sig.ew !== 'green') {
              if (distToStop <= 14) {
                targetSpeed = 0;
              } else {
                targetSpeed = Math.min(targetSpeed, item.speed * ((distToStop - 12) / 66));
              }
            }
          }
        }
      } else if (item.roadAxis === 'v') {
        const vIndex = item.roadIndex;
        for (let hIndex = 0; hIndex < ROADS.horizontal.length; hIndex++) {
          const hy = ROADS.horizontal[hIndex].y;
          const stopY = dir === 'south' ? hy - 24 : hy + ROADS.width + 24;
          const distToStop = (stopY - p.y) * uy;
          if (distToStop > -4 && distToStop < 78) {
            const sig = getIntersectionLightState(hIndex, vIndex, worldAnimClock);
            if (sig.ns !== 'green') {
              if (distToStop <= 14) {
                targetSpeed = 0;
              } else {
                targetSpeed = Math.min(targetSpeed, item.speed * ((distToStop - 12) / 66));
              }
            }
          }
        }
      }

      // (B) Vehicle-to-Vehicle Collision Avoidance (Same-lane bumper queueing + Intersection cross-traffic yielding)
      for (let j = 0; j < traffic.length; j++) {
        if (i === j) continue;
        const other = traffic[j];
        const safeGap = (item.towTargetKey || other.towTargetKey) ? 112 : 78;
        const op = vehiclePositions[j];
        const dx = op.x - p.x;
        const dy = op.y - p.y;
        const fwdDist = dx * ux + dy * uy;
        const latDist = Math.abs(-dx * uy + dy * ux);

        if (other.direction === dir && latDist < 20) {
          // Same lane ahead
          let gap = fwdDist;
          if (gap < 0 && other.roadAxis === item.roadAxis && other.roadIndex === item.roadIndex) {
            gap += item.pathLen || 1120;
          }
          if (gap > 0 && gap < 148) {
            if (gap <= safeGap) {
              targetSpeed = 0;
            } else {
              const followSpeed = (other.currentSpeed ?? other.speed) * ((gap - safeGap) / (148 - safeGap));
              targetSpeed = Math.min(targetSpeed, followSpeed);
            }
          }
        } else if (other.direction !== dir) {
          // Cross-traffic vehicle inside intersection box ahead of us
          if (fwdDist > 12 && fwdDist < 76 && latDist < 42) {
            targetSpeed = 0;
          }
        }
      }

      // (C) Vehicle-to-Pedestrian Crosswalk Yielding (Never drive through walking people!)
      for (let wIdx = 0; wIdx < walkers.length; wIdx++) {
        const wp = walkerPositions[wIdx];
        const dx = wp.x - p.x;
        const dy = wp.y - p.y;
        const fwdDist = dx * ux + dy * uy;
        const latDist = Math.abs(-dx * uy + dy * ux);
        if (fwdDist > 6 && fwdDist < 70 && latDist < 32) {
          if (fwdDist <= 42) {
            targetSpeed = 0;
          } else {
            targetSpeed = Math.min(targetSpeed, item.speed * ((fwdDist - 40) / 30));
          }
        }
      }

      // Smoothly accelerate or brake toward targetSpeed + compute realistic nose-dive / squat pitch
      const prevSpeed = item.currentSpeed ?? item.speed;
      const maxDelta = (targetSpeed < prevSpeed ? 240 : 125) * dt;
      if (Math.abs(targetSpeed - prevSpeed) <= maxDelta) {
        item.currentSpeed = Math.max(0, targetSpeed);
      } else {
        item.currentSpeed = Math.max(0, prevSpeed + Math.sign(targetSpeed - prevSpeed) * maxDelta);
      }

      const accel = (item.currentSpeed - prevSpeed) / Math.max(dt, 0.001);
      item.isBraking = accel < -12 || item.currentSpeed < item.speed * 0.22;
      const desiredPitch = accel < -15 ? -0.055 : accel > 18 ? 0.038 : 0;
      item.pitchAngle = (item.pitchAngle || 0) * 0.82 + desiredPitch * 0.18;

      const pLen = item.pathLen || 1120;
      item.d = ((item.d + item.currentSpeed * dt) % pLen + pLen) % pLen;
      const nextP = pathPoint(item.path, item.d);
      vehiclePositions[i] = nextP;

      let potholeJoltY = 0;
      let potholeTilt = 0;
      if (item.currentSpeed > 5) {
        for (const pot of activePotholePositions) {
          const dist = Math.hypot(nextP.x - pot.x, nextP.y - pot.y);
          if (dist < 46) {
            const intensity = (1 - dist / 46);
            potholeJoltY = Math.sin(item.d * 0.95) * 3.2 * intensity;
            potholeTilt = Math.cos(item.d * 0.85) * 0.08 * intensity;
            break;
          }
        }
      }

      item.sprite.x = nextP.x;
      item.sprite.y = nextP.y + potholeJoltY;
      item.sprite.zIndex = nextP.y + 40;

      if (item.sprite._chassis) {
        item.sprite._chassis.y = 0;
        item.sprite._chassis.rotation = (item.pitchAngle || 0) + potholeTilt;
      }
      if (item.sprite._exhaustPuff) {
        if (item.currentSpeed > 8) {
          const puffPhase = (item.d * 0.06) % 1;
          item.sprite._exhaustPuff.alpha = (1 - puffPhase) * 0.35;
          item.sprite._exhaustPuff.scale.set(0.6 + puffPhase * 0.9);
        } else {
          item.sprite._exhaustPuff.alpha = 0;
        }
      }
      if (item.sprite._strobes) {
        const flash = Math.sin(worldAnimClock * 14) > 0;
        if (item.sprite._strobes[0]) item.sprite._strobes[0].alpha = flash ? 1 : 0.2;
        if (item.sprite._strobes[1]) item.sprite._strobes[1].alpha = flash ? 0.2 : 1;
      }
    }

    for (const exp of expansionAnims) {
      if (exp.sign) {
        exp.sign.y = exp.baseY + Math.sin(worldAnimClock * 2.8 + exp.phase) * 3.5;
      }
    }

    // 2. Update Pedestrians (Yield at crosswalks if a car is actively crossing in front, and never walk through other pedestrians)
    for (let wIdx = 0; wIdx < walkers.length; wIdx++) {
      const item = walkers[wIdx];
      const pNow = walkerPositions[wIdx];
      const pAhead = pathPoint(item.path, item.d + 10);
      const wdx = pAhead.x - pNow.x;
      const wdy = pAhead.y - pNow.y;
      const wLen = Math.hypot(wdx, wdy) || 1;
      const wux = wdx / wLen;
      const wuy = wdy / wLen;

      let wait = false;
      // Check if a vehicle is directly in front of the pedestrian in the intersection
      for (let vIdx = 0; vIdx < traffic.length; vIdx++) {
        const vp = vehiclePositions[vIdx];
        const dist = Math.hypot(vp.x - pNow.x, vp.y - pNow.y);
        const fwd = (vp.x - pNow.x) * wux + (vp.y - pNow.y) * wuy;
        if (dist < 42 && fwd > 4) {
          wait = true;
          break;
        }
      }
      // Check if another pedestrian is directly ahead on the same sidewalk
      if (!wait) {
        for (let oIdx = 0; oIdx < walkers.length; oIdx++) {
          if (oIdx === wIdx) continue;
          const op = walkerPositions[oIdx];
          const dx = op.x - pNow.x;
          const dy = op.y - pNow.y;
          const fwd = dx * wux + dy * wuy;
          const lat = Math.abs(-dx * wuy + dy * wux);
          if (fwd > 0 && fwd < 22 && lat < 10 && oIdx < wIdx) {
            wait = true;
            break;
          }
        }
      }

      item.isWaiting = wait;
      if (!wait) {
        item.d += item.speed * dt;
      }
      const p = pathPoint(item.path, item.d);
      walkerPositions[wIdx] = p;
      item.sprite.x = p.x;
      item.sprite.y = p.y;
      updatePersonWalkVisual(item, p);
      item.sprite.zIndex = p.y + 45;
    }

    for (const tree of animatedTrees) {
      const sway = Math.sin(worldAnimClock * 2.2 + tree.phase) * 0.032;
      tree.sprite.rotation = sway;
    }

    for (const bItem of animatedBuildings) {
      const t = worldAnimClock + bItem.phase;
      if (bItem.glowRing) {
        bItem.glowRing.alpha = bItem.ready
          ? 0.58 + Math.sin(t * 4.2) * 0.32
          : 0.28 + Math.sin(t * 2.1) * 0.08;
      }
      if (bItem.collectBubble) {
        bItem.collectBubble.y = -36 + Math.sin(t * 3.1) * 3;
      }

      // Clash-of-Clans style breathing & tap/collect elastic squash-and-stretch bounce
      if (bItem.rigRoot) {
        if (bItem.bounceTimer > 0) {
          bItem.bounceTimer = Math.max(0, bItem.bounceTimer - dt);
          const prog = bItem.bounceTimer / 0.55;
          const squash = Math.sin(prog * Math.PI * 3) * 0.11 * prog;
          bItem.rigRoot.scale.set(1 + squash, 1 - squash);
        } else {
          const breathe = Math.sin(t * 2.4) * 0.012;
          bItem.rigRoot.scale.set(1 + breathe, 1 - breathe);
        }
      }

      const rp = bItem.rigParts;
      if (rp) {
        for (const rotor of rp.rotors) {
          if (rotor.children?.[0]) rotor.children[0].rotation += dt * 7.5;
          else rotor.rotation += dt * 7.5;
        }
        for (let sIdx = 0; sIdx < rp.strobes.length; sIdx++) {
          const st = rp.strobes[sIdx];
          st.alpha = Math.sin(t * 14 + sIdx * 2.1) > 0 ? 1 : 0.18;
        }
        if (rp.liftCar) {
          rp.liftCar.node.y = rp.liftCar.baseY + Math.sin(t * 2.0) * rp.liftCar.amp;
        }
        if (rp.weldingArc) {
          const sparkFlash = Math.sin(t * 23) * Math.cos(t * 17) > 0.35;
          rp.weldingArc.alpha = sparkFlash ? 0.95 : 0.08;
          rp.weldingArc.scale.set(sparkFlash ? 1.15 : 0.7);
        }
        if (rp.forklift) {
          const fkCycle = Math.sin(t * 1.35);
          rp.forklift.node.x = rp.forklift.baseX + fkCycle * rp.forklift.rangeX;
          rp.forklift.node.y = rp.forklift.baseY + fkCycle * rp.forklift.rangeY;
          rp.forklift.node.scale.x = Math.cos(t * 1.35) >= 0 ? 1 : -1;
        }
        if (rp.turntableRing) {
          rp.turntableRing.children[0].rotation += dt * 2.2;
        }
        if (rp.searchlightA && rp.searchlightB) {
          rp.searchlightA.rotation = Math.sin(t * 1.6) * 0.38;
          rp.searchlightB.rotation = -Math.sin(t * 1.4 + 0.8) * 0.38;
        }
        if (rp.radarWave) {
          const waveProg = (t * 0.85) % 1;
          rp.radarWave.scale.set(0.45 + waveProg * 0.95);
          rp.radarWave.alpha = (1 - waveProg) * 0.88;
        }
        if (rp.dynoFlame) {
          const backfire = Math.sin(t * 19) > 0.55;
          rp.dynoFlame.alpha = backfire ? 0.95 : 0.12;
          rp.dynoFlame.scale.set(backfire ? 1.25 : 0.65);
        }
        if (rp.craneArm) {
          rp.craneArm.node.x = rp.craneArm.baseX + Math.sin(t * 1.5) * 5;
          rp.craneArm.node.y = rp.craneArm.baseY + Math.cos(t * 3.0) * 4;
          rp.craneArm.node.rotation = Math.sin(t * 1.5) * 0.18;
        }
        if (rp.trackCar) {
          const smokeProg = (t * 1.6) % 1;
          rp.trackCar.smoke.x = rp.trackCar.baseX - smokeProg * 14;
          rp.trackCar.smoke.y = rp.trackCar.baseY - smokeProg * 10;
          rp.trackCar.smoke.alpha = (1 - smokeProg) * 0.62;
          rp.trackCar.smoke.scale.set(0.6 + smokeProg * 0.9);
        }
        if (rp.holoSign) {
          rp.holoSign.node.y = rp.holoSign.baseY + Math.sin(t * 3.2) * 3.5;
          rp.holoSign.node.scale.x = Math.cos(t * 2.4);
        }
      }
    }

    for (const inc of incidentAnims) {
      const t = worldAnimClock * 3.5 + inc.phase;
      if (inc.ring) {
        const pulse = 1 + Math.sin(t) * 0.12;
        inc.ring.scale.set(pulse);
        inc.ring.alpha = 0.55 + Math.cos(t) * 0.28;
      }
      if (inc.type === 'towRecovery') {
        const liftCycle = Math.sin(worldAnimClock * 2.6 + inc.phase);
        if (inc.broken) {
          inc.broken.y = 2 - (liftCycle + 1) * 1.8;
          inc.broken.rotation = -0.10 - (liftCycle + 1) * 0.04;
        }
        if (inc.winchCable && inc.broken) {
          inc.winchCable.clear();
          inc.winchCable.moveTo(-4, -6).lineTo(inc.broken.x - 14, inc.broken.y).stroke({ width: 2.5, color: 0xfacc15, alpha: 0.95 });
        }
        if (inc.strobe) {
          inc.strobe.alpha = Math.sin(worldAnimClock * 15 + inc.phase) > 0 ? 1 : 0.15;
        }
        if (inc.hazardLight) {
          inc.hazardLight.alpha = Math.sin(worldAnimClock * 8 + inc.phase) > 0 ? 1 : 0.1;
        }
        if (inc.smokeA && inc.smokeB) {
          const sPhaseA = (worldAnimClock * 1.4 + inc.phase) % 1;
          const sPhaseB = (worldAnimClock * 1.4 + inc.phase + 0.5) % 1;
          inc.smokeA.y = -8 - sPhaseA * 22;
          inc.smokeA.x = 16 + Math.sin(sPhaseA * 6) * 4;
          inc.smokeA.alpha = (1 - sPhaseA) * 0.65;
          inc.smokeA.scale.set(0.7 + sPhaseA * 0.8);

          inc.smokeB.y = -8 - sPhaseB * 22;
          inc.smokeB.x = 20 + Math.cos(sPhaseB * 6) * 4;
          inc.smokeB.alpha = (1 - sPhaseB) * 0.55;
          inc.smokeB.scale.set(0.7 + sPhaseB * 0.9);
        }
      }
    }

    if (threeViewport) {
      threeViewport.updateFrame({
        dt,
        clock: worldAnimClock,
        worldPanX: world.x,
        worldPanY: world.y,
        traffic,
        walkers,
        pathPointFn: pathPoint,
        potholes: activePotholePositions
      });
    }

    statusRefreshTimer += dt;
    if (statusRefreshTimer >= 2) {
      statusRefreshTimer = 0;
      if (mode === 'normal') {
        const nextSig = computeBuildingsStateSig();
        if (nextSig !== lastBuildingsStateSig) {
          lastBuildingsStateSig = nextSig;
          rebuildFixedBuildings();
          rebuildPlacements();
          rebuildIncidents();
        }
        if (selectedBuildingTarget) openBuildingSheet(selectedBuildingTarget, true);
        else if (selectedSupplyKey) refreshSupplyManagerSheet();
        else refreshOpenResidentSheet();
        updateHud();
      }
    }
  });
}

function inject() {
  const screen = document.querySelector('#screen-world.active');
  if (!screen) {
    if (app?.ticker?.started) app.ticker.stop();
    return;
  }
  if (!screen.querySelector('.pixiWorldShell')) {
    screen.innerHTML = html();
    initialized = false;
    mountedHost = null;
  }
  const host = screen.querySelector('#pixiWorldHost');
  if (host) mount(host);
  if (app?.ticker && !app.ticker.started) app.ticker.start();
}

const observer = new MutationObserver(() => inject());
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.addEventListener('load', inject);
document.addEventListener('click', () => requestAnimationFrame(inject));
