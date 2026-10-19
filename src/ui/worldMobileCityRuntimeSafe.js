import * as PIXI from 'pixi.js';
import { WORLD_ASSET_LIST, WORLD_ASSETS, buildingAssetForKey, personAnimationFramesForKey, personAssetForKey, vehicleAssetForKey } from '../data/worldAssetMap.js';
import { BUILD_COMMUNICATION_STORAGE_KEY, readBuildCommunicationState } from '../systems/buildCommunicationSystem.js';

const WORLD = { width: 960, height: 1720, startX: -175, startY: -20 };
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
  { key: 'streetKiosk', name: 'Street Kiosk', shortName: 'Kiosk', footprintW: 1, footprintH: 1, cost: 50, owned: 4, colorA: 0x35e58a, colorB: 0x0f766e, happiness: 6, want: 'quick snacks and small route jobs', output: 'coins', outputLabel: 'Coins', baseYield: 24, cycleMs: 90000, stockDrain: 8, bonus: 'Local order income', maxLevel: 10 },
  { key: 'tireRepair', name: 'Tire Repair Shop', shortName: 'Tire', footprintW: 2, footprintH: 2, cost: 150, owned: 3, colorA: 0xfacc15, colorB: 0xca8a04, happiness: 10, want: 'fresh tires and roadside repairs', output: 'parts', outputLabel: 'Parts', baseYield: 18, cycleMs: 150000, stockDrain: 10, bonus: 'Tire grip and repair happiness', maxLevel: 10 },
  { key: 'privateShop', name: 'Private Repair Shop', shortName: 'Repair', footprintW: 3, footprintH: 2, cost: 350, owned: 2, colorA: 0xa78bfa, colorB: 0x6d28d9, happiness: 14, want: 'more mechanics nearby', output: 'tools', outputLabel: 'Tools', baseYield: 12, cycleMs: 210000, stockDrain: 12, bonus: 'Service speed and tool flow', maxLevel: 10 },
  { key: 'partsWarehouse', name: 'Parts Warehouse', shortName: 'Parts WH', footprintW: 4, footprintH: 3, cost: 750, owned: 1, colorA: 0x2dd4bf, colorB: 0x0891b2, happiness: 16, want: 'stocked shelves and faster deliveries', output: 'parts', outputLabel: 'Bulk Parts', baseYield: 44, cycleMs: 300000, stockDrain: 16, bonus: 'Warehouse storage and build supply', maxLevel: 12 },
  { key: 'dealerShowroom', name: 'Dealer Showroom', shortName: 'Dealer', footprintW: 3, footprintH: 2, cost: 900, owned: 1, colorA: 0x60a5fa, colorB: 0x2563eb, happiness: 18, want: 'more cars to browse', output: 'rep', outputLabel: 'Rep', baseYield: 20, cycleMs: 360000, stockDrain: 10, bonus: 'Reputation and customer traffic', maxLevel: 12 },
  { key: 'salvageBlock', name: 'Salvage Yard Block', shortName: 'Salvage', footprintW: 5, footprintH: 4, cost: 1200, owned: 1, colorA: 0xf97316, colorB: 0x9a3412, happiness: 12, want: 'scrap recovery and cheaper parts', output: 'scrap', outputLabel: 'Scrap', baseYield: 38, cycleMs: 390000, stockDrain: 14, bonus: 'Scrap recovery and repair discounts', maxLevel: 12 },
  { key: 'towDispatch', name: 'Tow Dispatch', shortName: 'Tow', footprintW: 2, footprintH: 2, cost: 650, owned: 0, colorA: 0xf59e0b, colorB: 0x92400e, happiness: 12, want: 'tow trucks ready for breakdowns', output: 'scrap', outputLabel: 'Tow Scrap', baseYield: 26, cycleMs: 240000, stockDrain: 12, bonus: 'Breakdown response and recovery work', maxLevel: 10 },
  { key: 'testTrack', name: 'Mini Test Track', shortName: 'Track', footprintW: 4, footprintH: 2, cost: 1100, owned: 0, colorA: 0x22c55e, colorB: 0x14532d, happiness: 16, want: 'safe test loops and racing events', output: 'rep', outputLabel: 'Race Rep', baseYield: 30, cycleMs: 270000, stockDrain: 9, bonus: 'Test data, race rep, and tune readiness', maxLevel: 10 }
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

const SUPPLY_MANAGERS = [
  { key: 'driver', lineKey: 'streetRoute', name: 'Route Driver', business: 'Street Route', shirt: 0xf6c445 },
  { key: 'courier', lineKey: 'partsDelivery', name: 'Parts Courier', business: 'Parts Delivery', shirt: 0x16a34a },
  { key: 'mechanic', lineKey: 'mobileMechanic', name: 'Mobile Tech', business: 'Mobile Mechanic', shirt: 0x38bdf8 },
  { key: 'racer', lineKey: 'fuelRun', name: 'Fuel Runner', business: 'Fuel Run', shirt: 0xf59e0b },
  { key: 'towOperator', lineKey: 'towingJob', name: 'Tow Operator', business: 'Towing Job', shirt: 0xf97316 },
  { key: 'salesRep', lineKey: 'dealerShowcase', name: 'Sales Rep', business: 'Dealer Showcase', shirt: 0x7c3aed }
];

const RESIDENT_WANTS = [
  { key: 'residentBlue', name: 'Mia', want: 'I want a tire shop closer to this block.', building: 'tireRepair', menuLabel: 'Tire repair buildings', factors: ['potholes', 'trafficLights', 'mapBuild'] },
  { key: 'residentGreen', name: 'Jay', want: 'I want the parts warehouse restocked.', building: 'partsWarehouse', menuLabel: 'Parts supply buildings', factors: ['trafficJams', 'stuckVehicles', 'mapBuild'] },
  { key: 'residentOrange', name: 'Nico', want: 'I want a repair shop before traffic gets worse.', building: 'privateShop', menuLabel: 'Repair buildings', factors: ['potholes', 'vehicleBreakdowns', 'trafficJams'] },
  { key: 'residentPurple', name: 'Ari', want: 'I want more cars in the dealer showroom.', building: 'dealerShowroom', menuLabel: 'Showroom buildings', factors: ['trafficJams', 'trafficLights', 'mapBuild'] },
  { key: 'mechanic', name: 'Rae', want: 'I want tools and work orders from upgraded shops.', building: 'streetKiosk', menuLabel: 'Work order buildings', factors: ['vehicleBreakdowns', 'potholes', 'mapBuild'] },
  { key: 'driver', name: 'Sol', want: 'I want tow dispatch ready when cars break down.', building: 'towDispatch', menuLabel: 'Tow and recovery buildings', factors: ['vehicleBreakdowns', 'stuckVehicles', 'trafficJams'] }
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
let mountedHost = null;
let world = null;
let traffic = [];
let walkers = [];
let selectedSupplyKey = null;
let placedBuildings = [];
let fixedBuildingStates = {};
let fixedLayer = null;
let placementLayer = null;
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
let dragMoved = false;
let initialized = false;
let pixiWorldAssetsLoaded = false;
let buildSync = null;
let statusRefreshTimer = 0;

function defByKey(key) {
  return BUILDING_CATALOG.find((item) => item.key === key) || BUILDING_CATALOG[0];
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
  return {
    ...item,
    level: Math.max(1, Math.min(def.maxLevel || 10, level)),
    stock: Math.max(0, Math.min(100, stock)),
    health: Math.max(0, Math.min(100, health)),
    collected: Math.max(0, collected),
    lastCollectedAt
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

function cycleMsFor(item, def) {
  const level = item?.level || 1;
  const speed = Math.max(0.56, 1 - (level - 1) * 0.045);
  return Math.round((def.cycleMs || 120000) * speed);
}

function collectStatus(item, def) {
  const cycle = cycleMsFor(item, def);
  const elapsed = Math.max(0, Date.now() - (item.lastCollectedAt || 0));
  const ready = elapsed >= cycle && (item.stock ?? 0) > 0;
  const pct = Math.max(0, Math.min(100, (elapsed / cycle) * 100));
  return { ready, elapsed, cycle, msLeft: Math.max(0, cycle - elapsed), pct };
}

function buildingYield(item, def) {
  const stockFactor = Math.max(0.25, (item.stock ?? 80) / 100);
  return Math.max(1, Math.round((def.baseYield || 10) * (item.level || 1) * stockFactor));
}

function buildingPower(item, def) {
  return Math.round((def.cost || 50) * 6 + (item.level || 1) * (def.happiness || 8) * 95 + (item.collected || 0) * 24);
}

function upgradeRequirement(item, def) {
  const level = item.level || 1;
  const max = def.maxLevel || 10;
  if (level >= max) {
    return { maxed: true, met: false, text: 'Max level reached', stockNeed: 0, collectNeed: 0, nextLevel: level };
  }
  const nextLevel = level + 1;
  const stockNeed = Math.min(95, 45 + nextLevel * 5);
  const collectNeed = Math.max(0, Math.floor((nextLevel - 2) * 2));
  const met = (item.stock ?? 0) >= stockNeed && (item.collected || 0) >= collectNeed;
  return {
    maxed: false,
    met,
    nextLevel,
    stockNeed,
    collectNeed,
    text: `Needs ${stockNeed}% stock and ${collectNeed} collections`
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
      type: building.type,
      label: building.label,
      target: { kind: 'fixed', id },
      item: fixedBuildingStates[id],
      def: defByKey(building.type)
    };
  });
  const placed = placedBuildings.map((item) => ({
    id: item.id,
    kind: 'placed',
    type: item.type,
    label: item.name || defByKey(item.type).shortName,
    target: { kind: 'placed', id: item.id },
    item,
    def: defByKey(item.type)
  }));
  return [...fixed, ...placed];
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
  const records = allBuildingRecords().filter((record) => record.type === type);
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

function residentFactorList(resident) {
  const def = defByKey(resident.building);
  const service = serviceStats(resident.building);
  const conditions = cityConditionStats();
  const factors = [
    { key: 'service', label: `${def.shortName} coverage`, score: service.score, weight: 32, kind: 'service' },
    { key: 'stock', label: 'Stocked supply', score: service.stockScore, weight: 18, kind: 'stock' },
    { key: 'health', label: 'Building repair', score: service.healthScore, weight: 16, kind: 'service' },
    { key: 'level', label: 'Building level', score: service.levelScore, weight: 12, kind: 'service' }
  ];
  for (const key of resident.factors || []) {
    const condition = conditions[key];
    if (condition) {
      factors.push({
        key,
        label: condition.label,
        score: condition.score,
        count: condition.count,
        weight: key === 'mapBuild' ? 8 : 12,
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
  const service = serviceStats(resident.building);
  const factors = residentFactorList(resident);
  const baseScore = weightedScore(factors);
  const city = cityNeedStats();
  const diversity = cityDiversityScore();
  const conditions = cityConditionStats();
  const score = Math.round(Math.max(0, Math.min(100, baseScore * 0.78 + city.average * 0.14 + diversity * 0.08)));
  const tone = moodTone(score);
  return { ...tone, score, service, city, diversity, factors, baseScore, conditions };
}

function residentByKey(key) {
  return RESIDENT_WANTS.find((resident) => resident.key === key) || null;
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
        <p>Tap a building or person.</p>
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
            <button class="btn small ghost" onclick="window.centerMobileCitySafe?.()">Center</button>
          </div>
        </div>
        <div class="mobileBuildSyncStatus"><span>Sync</span><b data-build-sync-total>+${totalSyncedWorldInventory()} world</b><small data-build-sync-lines>${getBuildSync()?.unlockedLineCount || 0}/${getBuildSync()?.totalLineCount || 0} lines</small></div>
        <div class="mobileCityActions worldActionDock" hidden></div>
        <div class="mobileBuildTray" data-build-tray hidden>
          <div class="mobileTrayTitle mobileBuildTrayTitle"><span>Choose Building</span><span data-selected-building>${selectedDef().name}</span><span data-selected-rotation>0 deg</span></div>
          <div class="mobileBuildingList">
            ${BUILDING_CATALOG.map((item) => `<button class="btn small ghost" data-building-key="${item.key}" onclick="window.selectMobileBuildingSafe?.('${item.key}')">${item.shortName}<small>${item.footprintW}x${item.footprintH} / owned <span data-owned-count="${item.key}">${ownedRemaining(item.key)}</span></small></button>`).join('')}
          </div>
          <div class="mobileGhostHelp">Tap green land to preview. Confirm to place. Red cells are blocked.</div>
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

function addBuildingStatusBadges(container, w, h, item, def, onCollect = null) {
  if (!item) return null;
  container.sortableChildren = true;
  const status = collectStatus(item, def);
  const req = upgradeRequirement(item, def);
  const bubble = new PIXI.Container();
  bubble.x = w / 2;
  bubble.y = -36;
  bubble.zIndex = 1000;
  bubble.addChild(roundRect(-36, -12, 72, 24, 12, { color: 0x06131d, alpha: 0.90 }, { width: 2, color: status.ready ? 0x35e58a : 0x38bdf8, alpha: 0.95 }));
  const iconSrc = status.ready ? WORLD_ASSETS.ui.collectReady : req.met ? WORLD_ASSETS.ui.upgradeReady : WORLD_ASSETS.ui.collectTimer;
  const icon = assetSprite(iconSrc, -21, 0, 18, 18, 1);
  if (icon) bubble.addChild(icon);
  bubble.addChild(textLabel(status.ready ? 'Collect' : formatDuration(status.msLeft), 8, 0.5, 8.5, status.ready ? 0x8fffc2 : 0xe2e8f0));
  if (status.ready && onCollect) {
    bubble.eventMode = 'static';
    bubble.cursor = 'pointer';
    bubble.on('pointertap', (event) => {
      event.stopPropagation?.();
      if (!dragMoved && mode === 'normal') onCollect();
    });
  }
  container.addChild(bubble);

  const levelBadge = new PIXI.Container();
  levelBadge.x = w - 9;
  levelBadge.y = h - 9;
  levelBadge.zIndex = 1001;
  const levelIcon = assetSprite(WORLD_ASSETS.ui.levelBadge, 0, 0, 28, 22, 1);
  if (levelIcon) levelBadge.addChild(levelIcon);
  levelBadge.addChild(roundRect(-16, -9, 32, 18, 9, { color: 0x04111d, alpha: 0.84 }, { width: 1, color: 0x9fe8ff }));
  levelBadge.addChild(textLabel(`Lv ${item.level || 1}`, 0, 0, 7.5, 0xffffff));
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
  world.addChild(rect(0, 0, WORLD.width, WORLD.height, 0x62b652));
  for (let y = 0; y < WORLD.height; y += 80) {
    for (let x = 0; x < WORLD.width; x += 80) {
      world.addChild(rect(x, y, 80, 80, { color: (x / 80 + y / 80) % 2 ? 0x5aa94b : 0x6dc25b, alpha: 0.28 }));
      const tile = assetSprite(WORLD_ASSETS.terrain.grassTile, x + 40, y + 40, 80, 80, 0.22);
      if (tile) world.addChild(tile);
    }
  }
}

function drawRoads() {
  const segLen = 240;
  for (const road of ROADS.horizontal) {
    world.addChild(rect(0, road.y - ROADS.sidewalk, WORLD.width, ROADS.sidewalk, 0x94a3b8));
    world.addChild(rect(0, road.y + ROADS.width, WORLD.width, ROADS.sidewalk, 0x94a3b8));
    for (let sx = 0; sx < WORLD.width; sx += segLen) {
      const wSeg = Math.min(segLen, WORLD.width - sx);
      const cx = sx + wSeg / 2;
      const swTop = assetSprite(WORLD_ASSETS.terrain.sidewalk, cx, road.y - ROADS.sidewalk / 2, wSeg, ROADS.sidewalk, 0.72);
      const swBot = assetSprite(WORLD_ASSETS.terrain.sidewalk, cx, road.y + ROADS.width + ROADS.sidewalk / 2, wSeg, ROADS.sidewalk, 0.72);
      if (swTop) world.addChild(swTop);
      if (swBot) world.addChild(swBot);
    }
    world.addChild(rect(0, road.y, WORLD.width, ROADS.width, 0x1e293b, { width: 3, color: 0x0f172a }));
    for (let sx = 0; sx < WORLD.width; sx += segLen) {
      const wSeg = Math.min(segLen, WORLD.width - sx);
      const roadSeg = assetSprite(WORLD_ASSETS.terrain.roadHorizontal, sx + wSeg / 2, road.y + ROADS.width / 2, wSeg, ROADS.width, 0.92);
      if (roadSeg) world.addChild(roadSeg);
    }
    world.addChild(textLabel(road.label, 108, road.y + 16, 9.5, 0xe2e8f0));
  }
  for (const road of ROADS.vertical) {
    world.addChild(rect(road.x - ROADS.sidewalk, 0, ROADS.sidewalk, WORLD.height, 0x94a3b8));
    world.addChild(rect(road.x + ROADS.width, 0, ROADS.sidewalk, WORLD.height, 0x94a3b8));
    world.addChild(rect(road.x, 0, ROADS.width, WORLD.height, 0x1e293b, { width: 3, color: 0x0f172a }));
    for (let sy = 0; sy < WORLD.height; sy += segLen) {
      const hSeg = Math.min(segLen, WORLD.height - sy);
      const roadSeg = assetSprite(WORLD_ASSETS.terrain.roadVertical, road.x + ROADS.width / 2, sy + hSeg / 2, ROADS.width, hSeg, 0.92);
      if (roadSeg) world.addChild(roadSeg);
    }
  }
  drawCrosswalks();
}

function drawCrosswalks() {
  for (const h of ROADS.horizontal) {
    for (const v of ROADS.vertical) {
      const cx = v.x + ROADS.width / 2;
      const cy = h.y + ROADS.width / 2;
      const intersection = assetSprite(WORLD_ASSETS.terrain.roadIntersection, cx, cy, ROADS.width + ROADS.sidewalk * 2.1, ROADS.width + ROADS.sidewalk * 2.1, 0.98);
      if (intersection) {
        intersection.zIndex = 4;
        world.addChild(intersection);
      }
    }
  }
}

let animatedBuildings = [];
let animatedTrees = [];
let incidentAnims = [];
let activePotholePositions = [];
let worldAnimClock = 0;
let lastBuildingsStateSig = '';

function makeIsoFanRotor(x, y, radius = 9, color = 0xcbd5e1) {
  const rotor = new PIXI.Container();
  rotor.x = x;
  rotor.y = y;
  rotor.scale.y = 0.62; // Isometric foreshortening
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
    // 1. Twin Rooftop Isometric HVAC Exhaust Fans
    const f1 = makeIsoFanRotor(-8 * s, -69 * s, 7.5 * s, 0xe2e8f0);
    const f2 = makeIsoFanRotor(7 * s, -61 * s, 7.5 * s, 0xe2e8f0);
    overlay.addChild(f1, f2);
    parts.rotors.push(f1, f2);

    // 2. Animated Hydraulic Lift + Sports Car bobbing in Left Service Bay
    const liftCar = new PIXI.Container();
    liftCar.x = -38 * s;
    liftCar.y = 8 * s;
    const liftBeam = roundRect(-14 * s, 6 * s, 28 * s, 4 * s, 2, 0xfacc15, { width: 1, color: 0x0f172a });
    const carGlow = circle(0, 0, 14 * s, { color: 0x38bdf8, alpha: 0.28 });
    const bayCar = assetSprite(WORLD_ASSETS.vehicles.blueCar, 0, -2 * s, 36 * s, 18 * s, 0.95);
    liftCar.addChild(carGlow, liftBeam);
    if (bayCar) liftCar.addChild(bayCar);
    overlay.addChild(liftCar);
    parts.liftCar = { node: liftCar, baseY: 8 * s, amp: 4.5 * s };

    // 3. Center & Right Bay Welding Arc Flash + Sparks
    const weldingArc = new PIXI.Container();
    weldingArc.x = -2 * s;
    weldingArc.y = 28 * s;
    const arcCore = circle(0, 0, 12 * s, { color: 0x38bdf8, alpha: 0.55 });
    const arcCenter = circle(0, 0, 4.5 * s, { color: 0xffffff, alpha: 0.95 });
    weldingArc.addChild(arcCore, arcCenter);
    overlay.addChild(weldingArc);
    parts.weldingArc = weldingArc;
  } else if (type === 'partsHub' || type === 'partsWarehouse') {
    // 1. Rooftop Ventilation Fan Bank
    const fanCoords = [[-48, -46], [-32, -55], [-34, -38], [-18, -46]];
    for (const [fx, fy] of fanCoords) {
      const rotor = makeIsoFanRotor(fx * s, fy * s, 6.5 * s, 0x99f6e4);
      overlay.addChild(rotor);
      parts.rotors.push(rotor);
    }

    // 2. Animated Isometric Forklift patrolling the front loading dock
    const forklift = new PIXI.Container();
    forklift.x = -24 * s;
    forklift.y = 44 * s;
    const fkBody = new PIXI.Graphics();
    fkBody.roundRect(-8 * s, -7 * s, 16 * s, 12 * s, 3).fill({ color: 0xf59e0b }).stroke({ width: 1.5, color: 0x0f172a });
    fkBody.roundRect(-5 * s, -12 * s, 10 * s, 7 * s, 2).fill({ color: 0x1e293b });
    // Pallet crate on forks
    fkBody.roundRect(7 * s, -5 * s, 9 * s, 8 * s, 1.5).fill({ color: 0xfcd34d }).stroke({ width: 1, color: 0x78350f });
    const fkBeacon = circle(0, -14 * s, 3 * s, { color: 0xfef08a, alpha: 0.95 });
    forklift.addChild(fkBody, fkBeacon);
    overlay.addChild(forklift);
    parts.forklift = { node: forklift, baseX: -24 * s, baseY: 44 * s, rangeX: 22 * s, rangeY: 13 * s };
  } else if (type === 'dealerShowroom') {
    // 1. Rotating VIP Showroom Turntable Laser Ring
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

    // 2. Dual Sweeping Rooftop Sky-Tracker Searchlights
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
    // 1. Expanding Rooftop Satellite Radar Waves
    const radarWave = new PIXI.Container();
    radarWave.x = -22 * s;
    radarWave.y = -56 * s;
    const rg = new PIXI.Graphics();
    rg.circle(0, 0, 18 * s).stroke({ width: 2, color: 0x38bdf8, alpha: 0.85 });
    rg.circle(0, 0, 10 * s).stroke({ width: 1.5, color: 0x67e8f9, alpha: 0.95 });
    radarWave.addChild(rg);
    overlay.addChild(radarWave);
    parts.radarWave = radarWave;

    // 2. Dual Rooftop & Wrecker Emergency Strobe Beacons
    const s1 = circle(-39 * s, -38 * s, 6 * s, { color: 0xf59e0b, alpha: 0.95 });
    const s2 = circle(28 * s, -15 * s, 6 * s, { color: 0xef4444, alpha: 0.95 });
    const s3 = circle(-3 * s, 16 * s, 5 * s, { color: 0xfacc15, alpha: 0.95 });
    overlay.addChild(s1, s2, s3);
    parts.strobes.push(s1, s2, s3);
  } else if (type === 'tireRepair') {
    // Giant Spinning 3D Rooftop Neon Tire & Alloy Rim Sign
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

    // Rooftop AC fans
    const f1 = makeIsoFanRotor(44 * s, -42 * s, 6 * s, 0x99f6e4);
    const f2 = makeIsoFanRotor(56 * s, -35 * s, 6 * s, 0x99f6e4);
    overlay.addChild(f1, f2);
    parts.rotors.push(f1, f2);
  } else if (type === 'privateShop') {
    // 1. 4x Rooftop Exhaust Fans
    for (const [fx, fy] of [[-46, -37], [-30, -47], [-14, -56], [2, -65]]) {
      const r = makeIsoFanRotor(fx * s, fy * s, 6.5 * s, 0xc4b5fd);
      overlay.addChild(r);
      parts.rotors.push(r);
    }
    // 2. Dyno Car Twin Exhaust Flame Pop & Roller Glow
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
    // Swinging Electromagnetic Crane Magnet & Electric Sparks
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
    // 1. Rooftop AC Fans
    const f1 = makeIsoFanRotor(-14 * s, -54 * s, 6.5 * s, 0xe2e8f0);
    const f2 = makeIsoFanRotor(-2 * s, -48 * s, 6.5 * s, 0xe2e8f0);
    overlay.addChild(f1, f2);
    parts.rotors.push(f1, f2);

    // 2. Starting Gantry Race Lights & Track Car Drift Smoke
    const g1 = circle(-62 * s, -2 * s, 4.5 * s, { color: 0xef4444, alpha: 0.95 });
    const g2 = circle(-54 * s, -6 * s, 4.5 * s, { color: 0x22c55e, alpha: 0.95 });
    overlay.addChild(g1, g2);
    parts.strobes.push(g1, g2);

    const driftSmoke = circle(42 * s, 44 * s, 9 * s, { color: 0xe2e8f0, alpha: 0.55 });
    overlay.addChild(driftSmoke);
    parts.trackCar = { smoke: driftSmoke, baseX: 42 * s, baseY: 44 * s };
  } else if (type === 'streetKiosk') {
    // Floating Rotating 3D "365" Holo-Beacon on Kiosk Roof
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

  // Isometric Diamond Ground Aura (NO square card box!)
  const aura = new PIXI.Graphics();
  const auraColor = status.ready ? 0x35e58a : 0x38bdf8;
  aura.poly([
    w / 2, h + 14,
    w + 18, h / 2 + 8,
    w / 2, -4,
    -18, h / 2 + 8
  ]).fill({ color: auraColor, alpha: status.ready ? 0.22 : 0.08 })
    .stroke({ width: status.ready ? 2.5 : 1.2, color: auraColor, alpha: status.ready ? 0.78 : 0.28 });
  aura.zIndex = 4;
  c.addChild(aura);

  // Rigged Building Root (supports Clash-style squash & stretch bounce + animated mechanical sub-parts)
  const rigRoot = new PIXI.Container();
  rigRoot.sortableChildren = true;
  rigRoot.x = w / 2;
  rigRoot.y = h / 2 - 6;
  rigRoot.zIndex = 10;
  c.addChild(rigRoot);

  const spriteSize = Math.max(156, w * 1.32, h * 1.32);
  const art = assetSprite(buildingAssetForKey(type, name, buildingState?.level || 1), 0, 0, spriteSize, spriteSize, 1);
  if (art) {
    art.zIndex = 10;
    art.rotation = (Math.abs(Number(rotation) || 0) % 4) * Math.PI / 2;
    rigRoot.addChild(art);
  }

  const rigParts = attachClashBuildingRig(rigRoot, type, spriteSize);

  const labelPlate = new PIXI.Container();
  labelPlate.zIndex = 30;
  labelPlate.addChild(roundRect(8, h - 2, w - 16, 20, 10, { color: 0x04111d, alpha: 0.88 }, { width: 1.5, color: status.ready ? 0x35e58a : 0x38bdf8, alpha: 0.82 }));
  labelPlate.addChild(textLabel(name || def.shortName, w / 2, h + 8, 9.5, 0xf8fafc));
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

const VEHICLE_WHEEL_LAYOUT = {
  compactCar: { wheelKey: 'wheelSport', rearX: -27, frontX: 27, wheelY: 13, size: 15 },
  blueCar: { wheelKey: 'wheelGold', rearX: -26, frontX: 27, wheelY: 13, size: 15.5 },
  yellowCar: { wheelKey: 'wheelSport', rearX: -27, frontX: 27, wheelY: 13, size: 15.5 },
  rallyCar: { wheelKey: 'wheelGold', rearX: -26, frontX: 27, wheelY: 13, size: 15.5 },
  jdmGtCoupe: { wheelKey: 'wheelSport', rearX: -26, frontX: 27, wheelY: 13, size: 15.5 },
  greenTruck: { wheelKey: 'wheelTruck', rearX: -30, frontX: 30, wheelY: 14, size: 20 },
  naMuscle: { wheelKey: 'wheelSport', rearX: -27, frontX: 28, wheelY: 13, size: 16 },
  bajaSuv: { wheelKey: 'wheelTruck', rearX: -27, frontX: 28, wheelY: 14, size: 19 },
  towTruck: { wheelKey: 'wheelTruck', rearX: -25, frontX: 31, wheelY: 14.5, size: 17.5 },
  deliveryVan: { wheelKey: 'wheelTruck', rearX: -27, frontX: 28, wheelY: 14, size: 16.5 },
  superCar: { wheelKey: 'wheelSport', rearX: -27, frontX: 27, wheelY: 13, size: 16 }
};

function makeVehicle({ color = 0xf97316, accent = 0xffffff, direction = 'east', truck = false, assetKey = 'compactCar', towTargetKey = '' }) {
  const bodyW = truck ? 62 : 54;
  const bodyH = truck ? 31 : 27;
  const car = new PIXI.Container();
  car.sortableChildren = true;
  const wheels = [];
  const chassis = new PIXI.Container();
  chassis.sortableChildren = true;
  car.addChild(chassis);

  // Preserve exact 2:1 aspect ratio of our 320x160 cutout vehicle sprites
  const spriteW = bodyW * 1.92;
  const spriteH = spriteW * 0.5;
  const art = assetSprite(vehicleAssetForKey(assetKey), 0, 0, spriteW, spriteH, 1);
  if (art) {
    art.zIndex = 10;
    chassis.addChild(art);
  } else {
    chassis.addChild(roundRect(-bodyW / 2, -bodyH / 2 + 3, bodyW, bodyH, 8, { color: 0x000000, alpha: 0.22 }));
    chassis.addChild(roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 8, color, { width: 2, color: 0x172033 }));
    chassis.addChild(roundRect(-bodyW / 2 + 8, -bodyH / 2 + 4, bodyW - 24, bodyH - 8, 5, accent, { width: 2, color: 0x172033 }));
  }

  // Subtle rotating spoke-spin overlay aligned to each vehicle's wheel wells
  const wheelSpec = VEHICLE_WHEEL_LAYOUT[assetKey] || VEHICLE_WHEEL_LAYOUT.compactCar;
  [wheelSpec.rearX, wheelSpec.frontX].forEach((wx) => {
    const spinRing = new PIXI.Graphics();
    const r = wheelSpec.size * 0.36;
    spinRing.circle(0, 0, r).stroke({ width: 1.4, color: 0xf8fafc, alpha: 0.45 });
    for (let s = 0; s < 3; s++) {
      const a = (s * Math.PI) / 3;
      spinRing.moveTo(Math.cos(a) * -r, Math.sin(a) * -r).lineTo(Math.cos(a) * r, Math.sin(a) * r).stroke({ width: 1.5, color: 0xe2e8f0, alpha: 0.58 });
    }
    spinRing.x = wx;
    spinRing.y = wheelSpec.wheelY;
    spinRing.zIndex = 20;
    chassis.addChild(spinRing);
    wheels.push(spinRing);
  });

  if (assetKey === 'towTruck') {
    const strobeRed = circle(10, -17, 4.5, { color: 0xef4444, alpha: 0.85 });
    const strobeAmber = circle(15, -17, 4.5, { color: 0xfacc15, alpha: 0.85 });
    strobeRed.zIndex = 28;
    strobeAmber.zIndex = 28;
    chassis.addChild(strobeRed);
    chassis.addChild(strobeAmber);
    car._strobes = [strobeRed, strobeAmber];

    if (towTargetKey) {
      const towCable = new PIXI.Graphics();
      towCable.moveTo(-36, -6).lineTo(-64, 4).stroke({ width: 2.5, color: 0xfacc15, alpha: 0.95 });
      towCable.zIndex = 8;
      chassis.addChild(towCable);

      const towed = new PIXI.Container();
      towed.x = -88;
      towed.y = -2;
      towed.rotation = 0.14;
      towed.zIndex = 9;
      const towedArt = assetSprite(vehicleAssetForKey(towTargetKey), 0, 0, 92, 46, 0.98);
      if (towedArt) towed.addChild(towedArt);
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

function blockLoop(hIndex, vIndex) {
  const top = sidewalkY(hIndex, 'south');
  const bottom = sidewalkY(Math.min(hIndex + 1, ROADS.horizontal.length - 1), 'north');
  const left = sidewalkX(vIndex, 'east');
  const right = sidewalkX(Math.min(vIndex + 1, ROADS.vertical.length - 1), 'west');
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
  return lane === 'east' ? [{ x: -80, y }, { x: WORLD.width + 80, y }] : [{ x: WORLD.width + 80, y }, { x: -80, y }];
}

function pathV(index, lane) {
  const x = laneX(index, lane);
  return lane === 'south' ? [{ x, y: -80 }, { x, y: WORLD.height + 80 }] : [{ x, y: WORLD.height + 80 }, { x, y: -80 }];
}

function addTraffic(path, options) {
  const vehicle = makeVehicle(options);
  vehicle.scale.x *= options.scale || 0.72;
  vehicle.scale.y *= options.scale || 0.72;
  vehicle.zIndex = 100;
  world.addChild(vehicle);
  traffic.push({ sprite: vehicle, path, speed: options.speed || 80, d: Math.random() * 600, wheelSpeed: (options.speed || 80) / 10 });
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
  return {
    level: Number(save.idleLines?.lines?.[lineKey]?.level || 0),
    hired: Boolean(save.idleLines?.managers?.[lineKey])
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

function addSupplyWalker(path, staff) {
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
  makeClickable(p, () => openSupplyManager(staff));
  world.addChild(p);
  const startD = Math.random() * 800;
  const walkerItem = { sprite: p, art, frameTextures, artBaseWidth: 54, artBaseHeight: 70, walkFrame: 0, path, d: startD, speed: 40, staff };
  updatePersonWalkVisual(walkerItem, pathPoint(path, startD));
  walkers.push(walkerItem);
}

function renderSupplyManagerSheet(staff) {
  const portraitSrc = personAssetForKey(staff.key);
  return `
    <div class="residentWindow">
      <div class="residentWindowHeader">
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${escapeHtml(portraitSrc)}" alt="${escapeHtml(staff.name)}" style="width:52px;height:66px;object-fit:contain;border-radius:12px;background:rgba(15,23,42,0.65);border:1.5px solid rgba(250,204,21,0.65);padding:2px;" />
          <div>
            <span class="residentKicker">Supply Manager</span>
            <b>${escapeHtml(staff.name)}</b>
          </div>
        </div>
      </div>
      <div class="residentMoodCard">
        ${renderNpcTalk(staff)}
      </div>
      <div class="mobilePlacedActions residentFooterActions">
        <button class="btn gold" onclick="window.openSupplyFromWorld?.()">Open Supplies</button>
        <button class="btn ghost" onclick="window.closeMobileResidentSheetSafe?.()">Close</button>
      </div>
    </div>
  `;
}

function openSupplyManager(staff) {
  if (mode !== 'normal' || !staff) return;
  if (selectedSupplyKey !== staff.lineKey) lastBondNote = '';
  purseCache.ready = false;
  const placedSheet = document.querySelector('[data-placed-sheet]');
  if (placedSheet) placedSheet.hidden = true;
  selectedSupplyKey = staff.lineKey;
  selectedResidentKey = null;
  selectedBuildingTarget = null;
  selectedPlacedId = null;
  document.querySelector('.mobileCityHud')?.classList.add('resident-open');
  document.querySelector('.mobileCityHud')?.classList.remove('building-open');
  const sheet = document.querySelector('[data-resident-sheet]');
  if (sheet) {
    sheet.innerHTML = renderSupplyManagerSheet(staff);
    sheet.hidden = false;
  }
}

function refreshSupplyManagerSheet() {
  const staff = supplyManagerByLine(selectedSupplyKey);
  if (!staff) return;
  openSupplyManager(staff);
}

function addWalker(path, resident = RESIDENT_WANTS[0], shirt = 0x2563eb) {
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
  const startD = Math.random() * 800;
  const walkerItem = { sprite: p, art, frameTextures, artBaseWidth: 52, artBaseHeight: 68, walkFrame: 0, path, d: startD, speed: 46, resident };
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
    selectedBuildingTarget,
    selectedResidentKey,
    selectedResidentMenu,
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
  const confirm = document.querySelector('[data-confirm-row]');
  const syncTotal = document.querySelector('[data-build-sync-total]');
  const syncLines = document.querySelector('[data-build-sync-lines]');
  const hud = document.querySelector('.mobileCityHud');
  if (hud) {
    hud.classList.toggle('build-mode', mode !== 'normal');
    if (mode !== 'normal') hud.classList.remove('building-open', 'resident-open');
  }
  if (badge) badge.textContent = mode === 'placing' ? 'Build Mode' : mode === 'moving' ? 'Move Mode' : 'Normal';
  if (help) help.textContent = mode === 'normal' ? 'Tap buildings to collect, inspect, and upgrade. Build mode places owned buildings.' : mode === 'placing' ? 'Tap a green cell to preview placement.' : 'Tap a green cell to preview the new location.';
  if (tray) tray.hidden = mode === 'normal';
  if (sheet && mode !== 'normal') sheet.hidden = true;
  if (residentSheet && mode !== 'normal') residentSheet.hidden = true;
  if (confirm) confirm.hidden = !pendingPlacement;
  if (syncTotal) syncTotal.textContent = `+${totalSyncedWorldInventory()} world`;
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

function clearGhost() {
  if (ghostLayer) ghostLayer.removeChildren();
}

function drawGhost() {
  clearGhost();
  if (!pendingPlacement || !ghostLayer) return;
  const def = defByKey(pendingPlacement.type);
  const fp = currentFootprint(def, pendingPlacement.rotation || 0);
  ghostLayer.addChild(buildingVisual({ x: pendingPlacement.x, y: pendingPlacement.y, wCells: fp.footprintW, hCells: fp.footprintH, type: def.key, name: def.shortName, alpha: 0.62, rotation: pendingPlacement.rotation || 0 }));
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
}

const CITY_ISSUE_MARKERS = {
  potholes: [
    { x: 350, y: 279 }, { x: 525, y: 589 }, { x: 355, y: 909 }, { x: 755, y: 589 }
  ],
  vehicleBreakdowns: [
    { x: 565, y: 242 }, { x: 205, y: 868 }, { x: 755, y: 1198 }, { x: 345, y: 552 }
  ],
  stuckVehicles: [
    { x: 650, y: 545 }, { x: 247, y: 1038 }, { x: 695, y: 318 }, { x: 300, y: 1195 }
  ],
  trafficJams: [
    { x: 465, y: 235 }, { x: 655, y: 705 }, { x: 245, y: 1000 }, { x: 520, y: 1195 }
  ],
  trafficLights: [
    { x: 245, y: 235 }, { x: 655, y: 545 }, { x: 245, y: 865 }, { x: 655, y: 1195 }
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

      if (key === 'potholes') {
        activePotholePositions.push({ x: pos.x, y: pos.y });
        const ring = circle(0, 2, 26, { color: 0xf97316, alpha: 0.14 }, { width: 2, color: 0xf97316, alpha: 0.72 });
        marker.addChild(ring);
        const crater = assetSprite(WORLD_ASSETS.props.potholeCrater, 0, 0, 66, 46, 0.98);
        if (crater) marker.addChild(crater);

        const badge = new PIXI.Container();
        badge.y = -24;
        badge.addChild(roundRect(-34, -9, 68, 18, 9, { color: 0x04111d, alpha: 0.90 }, { width: 1.5, color: 0xf97316, alpha: 0.9 }));
        badge.addChild(textLabel(`POTHOLE ${condition.score}%`, 0, 0, 7.5, 0xfed7aa));
        marker.addChild(badge);
        incidentAnims.push({ type: 'pothole', marker, ring, phase: i * 1.4 });
      } else if (key === 'vehicleBreakdowns' || key === 'stuckVehicles') {
        const ring = circle(0, 0, 38, { color: 0xef4444, alpha: 0.12 }, { width: 2, color: 0xfacc15, alpha: 0.75 });
        marker.addChild(ring);

        const towRig = new PIXI.Container();
        towRig.x = -28;
        towRig.y = -2;
        const towArt = assetSprite(WORLD_ASSETS.vehicles.towTruck, 0, 0, 84, 42, 1);
        if (towArt) towRig.addChild(towArt);
        const strobe = circle(8, -14, 5, { color: 0xfacc15, alpha: 0.95 });
        towRig.addChild(strobe);
        marker.addChild(towRig);

        const winchCable = new PIXI.Graphics();
        winchCable.moveTo(-4, -6).lineTo(16, 2).stroke({ width: 2.5, color: 0xfacc15, alpha: 0.95 });
        marker.addChild(winchCable);

        const broken = new PIXI.Container();
        broken.x = 28;
        broken.y = 2;
        broken.rotation = -0.10;
        const brokenArt = assetSprite(WORLD_ASSETS.props.brokenCar, 0, 0, 72, 42, 1);
        if (brokenArt) broken.addChild(brokenArt);
        const hazardLight = circle(-22, 2, 4, { color: 0xf97316, alpha: 0.95 });
        broken.addChild(hazardLight);
        marker.addChild(broken);

        const smokeA = circle(16, -12, 6, { color: 0xcbd5e1, alpha: 0.65 });
        const smokeB = circle(22, -20, 8, { color: 0x94a3b8, alpha: 0.45 });
        marker.addChild(smokeA);
        marker.addChild(smokeB);

        const badge = new PIXI.Container();
        badge.y = -28;
        badge.addChild(roundRect(-38, -9, 76, 18, 9, { color: 0x04111d, alpha: 0.92 }, { width: 1.5, color: 0xfacc15, alpha: 0.92 }));
        badge.addChild(textLabel(`TOW OPS · ${condition.score}%`, 0, 0, 7.5, 0xfef08a));
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
        const ring = circle(0, 0, 22, { color: issueColor(key), alpha: 0.22 }, { width: 2, color: issueColor(key), alpha: 0.72 });
        marker.addChild(ring);
        const cone = assetSprite(WORLD_ASSETS.props.roadCone, -16, 4, 20, 24, 0.95);
        if (cone) marker.addChild(cone);
        marker.addChild(circle(0, 0, 17, { color: issueColor(key), alpha: 0.88 }, { width: 2.5, color: 0xffffff, alpha: 0.65 }));
        marker.addChild(textLabel(issueShortLabel(key), 0, -1, 7.5, 0xffffff));
        marker.addChild(roundRect(-25, 20, 50, 15, 7, { color: 0x04111d, alpha: 0.86 }, { width: 1, color: 0x9fe8ff, alpha: 0.55 }));
        marker.addChild(textLabel(`${condition.score}%`, 0, 27.5, 7, 0xffffff));
        incidentAnims.push({ type: 'signal', marker, ring, phase: i * 1.1 });
      }

      makeClickable(marker, () => window.openCityIssueMenuSafe?.(key));
      incidentLayer.addChild(marker);
    }
  }
}

function rebuildGrid() {
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

function renderBuildingSheet(target) {
  const record = getBuildingRecord(target);
  if (!record) return '';
  const { item, def, fixed } = record;
  const title = fixed?.label || item.name || def.name;
  const status = collectStatus(item, def);
  const req = upgradeRequirement(item, def);
  const yieldAmount = buildingYield(item, def);
  const happiness = Math.round(def.happiness * (item.level || 1) * ((item.stock ?? 70) / 100) * ((item.health ?? 88) / 100));
  const health = Math.round(item.health ?? 88);
  const isPlaced = target.kind === 'placed';
  const collectLabel = status.ready ? `Collect +${yieldAmount}` : `Ready in ${formatDuration(status.msLeft)}`;
  const upgradeLabel = req.maxed ? 'Max Level' : `Upgrade to Lv ${req.nextLevel}`;
  const requirementClass = req.met ? 'ready' : req.maxed ? 'maxed' : 'locked';
  return `
    <div class="mobileTrayTitle" data-building-sheet>
      <span>${escapeHtml(title)}</span>
      <span>${isPlaced ? 'Placed' : 'City'} Building</span>
    </div>
    <div class="mobileBuildingHero">
      <img src="${buildingAssetForKey(def.key, title, item.level || 1)}" alt="" loading="eager">
      <div>
        <b>${escapeHtml(def.name)}</b>
        <small>${escapeHtml(def.want)}</small>
      </div>
      <div class="mobileBuildingLevel"><span>Lv</span><strong data-placed-level>${item.level || 1}</strong></div>
    </div>
    <div class="mobileBuildingStatsGrid">
      <div><strong>${escapeHtml(def.outputLabel)}</strong><span>+${yieldAmount} / collect</span></div>
      <div><strong>${status.ready ? 'Ready' : formatDuration(status.msLeft)}</strong><span>${Math.round(status.pct)}% timer</span></div>
      <div><strong data-placed-stock>${Math.round(item.stock ?? 70)}%</strong><span>Stock</span></div>
      <div><strong>+${happiness}</strong><span>Happiness</span></div>
      <div><strong>${health}%</strong><span>Health</span></div>
      <div><strong>${item.collected || 0}</strong><span>Collections</span></div>
    </div>
    <div class="mobileCityMeter mobileBuildingMeter"><span style="--meter-value:${Math.round(item.stock ?? 70)}%" data-placed-stock-meter></span></div>
    <div class="mobileBuildingBonus">
      <img src="${WORLD_ASSETS.ui.bonusBadge}" alt="" loading="eager">
      <span><b>Building Bonus</b>${escapeHtml(def.bonus)}. Cycle improves with level: ${formatDuration(cycleMsFor(item, def))}.</span>
    </div>
    <div class="mobileBuildingRequirement ${requirementClass}">
      <img src="${WORLD_ASSETS.ui.requirementBadge}" alt="" loading="eager">
      <span><b>Upgrade Requirements</b>${escapeHtml(req.text)}${req.maxed ? '' : ` (${req.met ? 'ready' : 'missing'})`}</span>
    </div>
    <div class="mobilePlacedActions mobileBuildingActions">
      <button class="btn primary" onclick="window.collectSelectedMobileBuildingSafe?.()" ${status.ready ? '' : 'disabled'}>${collectLabel}</button>
      <button class="btn primary" onclick="window.upgradeSelectedMobileBuildingSafe?.()" ${req.met ? '' : 'disabled'}>${upgradeLabel}</button>
      <button class="btn gold" onclick="window.restockSelectedMobileBuildingSafe?.()">Restock</button>
      <button class="btn" onclick="window.repairSelectedMobileBuildingSafe?.()" ${health >= 100 ? 'disabled' : ''}>Repair</button>
      ${isPlaced ? '<button class="btn ghost" onclick="window.moveSelectedMobileBuildingSafe?.()">Move</button>' : '<button class="btn gold" onclick="window.openSupplyFromWorld?.()">Open Supplies</button>'}
      <button class="btn ghost" onclick="window.closeMobileBuildingSheetSafe?.()">Close</button>
    </div>
  `;
}

function openBuildingSheet(target, refresh = false) {
  if (mode !== 'normal') return;
  const record = getBuildingRecord(target);
  if (!record) return;
  const residentSheet = document.querySelector('[data-resident-sheet]');
  if (residentSheet) residentSheet.hidden = true;
  selectedBuildingTarget = target;
  selectedPlacedId = target.kind === 'placed' ? target.id : null;
  selectedResidentKey = null;
  selectedSupplyKey = null;
  selectedResidentMenu = 'mood';
  const hud = document.querySelector('.mobileCityHud');
  hud?.classList.remove('resident-open');
  hud?.classList.add('building-open');
  const sheet = document.querySelector('[data-placed-sheet]');
  if (sheet) {
    sheet.innerHTML = renderBuildingSheet(target);
    sheet.hidden = false;
    if (!refresh) sheet.scrollTop = 0;
  }
  publishWorldOpenState();
}

function targetMatches(a, b) {
  return Boolean(a && b && a.kind === b.kind && a.id === b.id);
}

function collectBuildingTarget(target, options = {}) {
  const record = getBuildingRecord(target);
  if (!record || mode !== 'normal') return false;
  const status = collectStatus(record.item, record.def);
  if (!status.ready) return false;
  const amount = buildingYield(record.item, record.def);
  updateBuildingRecord(target, (item, def) => {
    item.lastCollectedAt = Date.now();
    item.collected = (item.collected || 0) + 1;
    item.stock = Math.max(0, (item.stock ?? 80) - (def.stockDrain || 10));
    item.health = Math.max(0, (item.health ?? 88) - Math.max(2, Math.round((def.stockDrain || 10) / 4)));
    item.lastReward = { output: def.output, label: def.outputLabel, amount, at: Date.now() };
  });
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

function renderResidentBuildingRows(type, title) {
  const records = problemBuildings(type, false);
  const poor = records.filter((record) => record.condition.poor);
  const visible = (poor.length ? poor : records).slice(0, 6);
  if (!visible.length) {
    return `
      <div class="residentActionMenu">
        <b>${escapeHtml(title)}</b>
        <p>No matching building exists yet. Build one to satisfy this resident.</p>
        <button class="btn gold" onclick="window.openMobileBuildTraySafe?.()">Build</button>
      </div>
    `;
  }
  return `
    <div class="residentActionMenu">
      <div class="residentActionHeader">
        <b>${escapeHtml(title)}</b>
        <span>${poor.length ? `${poor.length} need work` : 'All stable'}</span>
      </div>
      <div class="residentBuildingRows">
        ${visible.map((record) => {
          const token = targetToken(record.target);
          const condition = record.condition;
          return `
            <div class="residentBuildingRow ${condition.poor ? 'poor' : 'stable'}">
              <div>
                <b>${escapeHtml(record.label)}</b>
                <span>${escapeHtml(record.def.name)} - ${escapeHtml(condition.reasons.join(' / '))}</span>
                <small>Health ${condition.health}% / Stock ${condition.stock}% / Score ${condition.score}%</small>
              </div>
              <div class="residentRowActions">
                <button class="btn small" onclick="window.inspectResidentBuildingSafe?.('${token}')">Inspect</button>
                <button class="btn small primary" onclick="window.repairResidentBuildingSafe?.('${token}')" ${condition.health >= 100 ? 'disabled' : ''}>Repair</button>
                <button class="btn small gold" onclick="window.restockResidentBuildingSafe?.('${token}')" ${condition.stock >= 100 ? 'disabled' : ''}>Restock</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderResidentIncidentMenu(resident, mood) {
  const activeKeys = new Set(['mapBuild', ...(resident.factors || [])]);
  const rows = Object.values(mood.conditions)
    .filter((condition) => activeKeys.has(condition.key) || condition.count > 0)
    .sort((a, b) => (b.count - a.count) || (a.score - b.score));
  return `
    <div class="residentActionMenu">
      <div class="residentActionHeader">
        <b>City problems affecting ${escapeHtml(resident.name)}</b>
        <span>${rows.filter((row) => row.score < 70).length} strained</span>
      </div>
      <div class="residentIssueRows">
        ${rows.map((condition) => {
          const problem = CITY_PROBLEM_DEFS[condition.key] || CITY_PROBLEM_DEFS.mapBuild;
          return `
            <div class="residentIssueRow ${condition.score < 55 ? 'danger' : condition.score < 75 ? 'warn' : 'ok'}">
              <div>
                <b>${escapeHtml(problem.label)} ${condition.score}%</b>
                <span>${condition.key === 'mapBuild' ? `${condition.count} city buildings active` : `${condition.count} active issue${condition.count === 1 ? '' : 's'}`}</span>
                <small>${escapeHtml(problem.help)}</small>
              </div>
              <button class="btn small" onclick="window.openResidentProblemBuildingsSafe?.('${condition.key}')">${escapeHtml(defByKey(problem.type).shortName)}</button>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderResidentCityNeeds(resident) {
  return `
    <div class="residentActionMenu">
      <div class="residentActionHeader">
        <b>Other resident needs</b>
        <span>${cityNeedStats().metCount}/${RESIDENT_WANTS.length} met</span>
      </div>
      <div class="residentIssueRows">
        ${RESIDENT_WANTS.map((item) => {
          const mood = residentMood(item);
          return `
            <button class="residentIssueRow residentSwitchRow ${item.key === resident.key ? 'ok' : mood.score < 55 ? 'warn' : 'ok'}" onclick="window.inspectResidentByKeySafe?.('${item.key}')">
              <div>
                <b>${escapeHtml(item.name)} - ${escapeHtml(mood.label)} ${mood.score}%</b>
                <span>${escapeHtml(defByKey(item.building).name)}</span>
              </div>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function residentMenuTarget(menu = 'mood') {
  const key = String(menu || 'mood');
  if (key === 'overview') return 'mood';
  if (key === 'service' || key === 'stock') return 'needs';
  if (key === 'incidents') return 'city';
  if (key === 'people') return 'people';
  if (key.startsWith('problem:')) return key;
  if (key === 'city') return 'city';
  if (key === 'needs') return 'needs';
  return 'mood';
}

function residentActiveTab(menu = selectedResidentMenu) {
  const target = residentMenuTarget(menu);
  if (target.startsWith('problem:')) return 'city';
  return target;
}

function renderResidentTabs(resident, mood) {
  const active = residentActiveTab();
  const issueCount = (resident.factors || []).reduce((total, key) => total + Math.max(0, mood.conditions[key]?.count || 0), 0);
  const tabs = [
    { key: 'mood', label: 'Mood', value: `${mood.score}%`, icon: mood.face },
    { key: 'needs', label: 'Fix', value: `${problemBuildings(resident.building, true).length}`, icon: '!' },
    { key: 'city', label: 'City', value: `${issueCount}`, icon: '!' },
    { key: 'people', label: 'People', value: `${mood.city.metCount}/${mood.city.total}`, icon: '+' }
  ];
  return `
    <div class="residentTabBar" role="tablist" aria-label="Resident information tabs">
      ${tabs.map((tab) => `
        <button class="residentTab ${active === tab.key ? 'active' : ''}" role="tab" aria-selected="${active === tab.key}" onclick="window.openResidentNeedMenuSafe?.('${tab.key}')">
          <b>${escapeHtml(tab.icon)}</b>
          <span>${escapeHtml(tab.label)}</span>
          <small>${escapeHtml(tab.value)}</small>
        </button>
      `).join('')}
    </div>
  `;
}

function renderResidentMoodOverview(resident, mood) {
  const primaryFactors = mood.factors.slice(0, 6);
  return `
    <div class="residentOverviewPanel">
      <div class="residentOverviewCards">
        <div><strong>${mood.service.count}</strong><span>${escapeHtml(resident.menuLabel || 'Service')}</span></div>
        <div><strong>${Math.round(mood.service.avgStock || 0)}%</strong><span>Stock</span></div>
        <div><strong>${Math.round(mood.service.avgHealth || 0)}%</strong><span>Repair</span></div>
        <div><strong>${mood.city.metCount}/${mood.city.total}</strong><span>Needs</span></div>
      </div>
      <div class="residentFactorList">
        ${primaryFactors.map((factor) => `
          <div class="residentFactorRow ${factor.score < 55 ? 'danger' : factor.score < 75 ? 'warn' : 'ok'}">
            <span>${escapeHtml(factor.label)}</span>
            <b>${Math.round(factor.score || 0)}%</b>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderResidentActionMenu(resident, mood) {
  const active = residentMenuTarget(selectedResidentMenu);
  if (active === 'needs') return renderResidentBuildingRows(resident.building, `${resident.menuLabel || defByKey(resident.building).name} needing attention`);
  if (active === 'city') return renderResidentIncidentMenu(resident, mood);
  if (active === 'people') return renderResidentCityNeeds(resident);
  if (active.startsWith('problem:')) {
    const problemKey = active.slice('problem:'.length);
    const problem = CITY_PROBLEM_DEFS[problemKey] || CITY_PROBLEM_DEFS.mapBuild;
    return renderResidentBuildingRows(problem.types?.length ? problem.types : problem.type, `${problem.label} support buildings`);
  }
  return renderResidentMoodOverview(resident, mood);
}

function renderResidentSheet(resident) {
  const def = defByKey(resident.building);
  const mood = residentMood(resident);
  const portraitSrc = personAssetForKey(resident.key);
  return `
    <div class="residentWindow" data-resident-window>
      <div class="residentWindowHeader" data-resident-sheet-title>
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${escapeHtml(portraitSrc)}" alt="${escapeHtml(resident.name)}" style="width:52px;height:66px;object-fit:contain;border-radius:12px;background:rgba(15,23,42,0.65);border:1.5px solid rgba(56,189,248,0.65);padding:2px;" />
          <div>
            <span class="residentKicker">Resident Request</span>
            <b>${escapeHtml(resident.name)}</b>
          </div>
        </div>
        <strong>${escapeHtml(mood.label)} ${mood.score}%</strong>
      </div>
      ${renderNpcTalk(resident)}
      <div class="residentMoodCard residentHero mood-${mood.key}" data-resident-mood-card>
        <div class="residentMoodFace" data-resident-mood-face aria-label="${escapeHtml(mood.label)}">${escapeHtml(mood.face)}</div>
        <div class="residentMoodInfo">
          <b>${escapeHtml(def.name)} mood driver</b>
          <span data-resident-want>${escapeHtml(resident.want)}</span>
          <div class="residentMoodMeter" style="--resident-mood:${mood.score}%;" aria-label="Resident happiness ${mood.score} percent">
            <span></span><i></i>
          </div>
          <small>0 upset / 100 happy</small>
        </div>
      </div>
      ${renderResidentTabs(resident, mood)}
      <div class="residentTabPanel" data-resident-tab-panel>
        ${renderResidentActionMenu(resident, mood)}
      </div>
      <div class="mobilePlacedActions residentFooterActions">
        <button class="btn gold" onclick="window.openMobileBuildTraySafe?.()">Build</button>
        <button class="btn ghost" onclick="window.closeMobileResidentSheetSafe?.()">Close</button>
      </div>
    </div>
  `;
}

function openResidentSheet(resident) {
  if (mode !== 'normal') return;
  if (selectedResidentKey !== resident.key) lastBondNote = '';
  purseCache.ready = false;
  const placedSheet = document.querySelector('[data-placed-sheet]');
  if (placedSheet) placedSheet.hidden = true;
  if (selectedResidentKey !== resident.key) selectedResidentMenu = 'mood';
  const hud = document.querySelector('.mobileCityHud');
  hud?.classList.remove('building-open', 'build-mode');
  hud?.classList.add('resident-open');
  selectedBuildingTarget = null;
  selectedSupplyKey = null;
  selectedPlacedId = null;
  selectedResidentKey = resident.key;
  const sheet = document.querySelector('[data-resident-sheet]');
  if (sheet) {
    sheet.innerHTML = renderResidentSheet(resident);
    sheet.hidden = false;
  }
  publishWorldOpenState();
}

function refreshOpenResidentSheet() {
  const sheet = document.querySelector('[data-resident-sheet]');
  if (!selectedResidentKey || !sheet || sheet.hidden) return;
  const resident = residentByKey(selectedResidentKey);
  if (resident) openResidentSheet(resident);
}

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

window.openMobileBuildTraySafe = () => {
  mode = 'placing';
  pendingPlacement = null;
  movingBuilding = null;
  selectedPlacedId = null;
  selectedBuildingTarget = null;
  selectedResidentKey = null;
  selectedResidentMenu = 'mood';
  document.querySelector('[data-resident-sheet]')?.setAttribute('hidden', '');
  document.querySelector('[data-placed-sheet]')?.setAttribute('hidden', '');
  document.querySelector('.mobileCityHud')?.classList.remove('building-open', 'resident-open');
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
  document.querySelector('.mobileCityHud')?.classList.remove('building-open', 'resident-open');
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
  document.querySelector('.mobileCityHud')?.classList.remove('building-open', 'resident-open');
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
  document.querySelector('.mobileCityHud')?.classList.remove('building-open', 'resident-open');
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
  document.querySelector('.mobileCityHud')?.classList.remove('building-open', 'resident-open');
  const sheet = document.querySelector('[data-placed-sheet]');
  if (sheet) sheet.hidden = true;
};

window.closeMobileResidentSheetSafe = () => {
  const sheet = document.querySelector('[data-resident-sheet]');
  if (sheet) sheet.hidden = true;
  selectedResidentKey = null;
  selectedSupplyKey = null;
  selectedResidentMenu = 'mood';
  document.querySelector('.mobileCityHud')?.classList.remove('resident-open');
};

window.openSupplyFromWorld = () => {
  document.querySelector('.pixiWorldProxy[data-proxy="lines"]')?.click();
};

window.collectSelectedMobileBuildingSafe = () => {
  return collectBuildingTarget(selectedBuildingTarget, { refreshOpenSheet: true });
};

window.upgradeSelectedMobileBuildingSafe = () => {
  const target = selectedBuildingTarget;
  const record = getBuildingRecord(target);
  if (!record) return false;
  const req = upgradeRequirement(record.item, record.def);
  if (!req.met || req.maxed) return false;
  updateBuildingRecord(target, (item) => {
    item.level = req.nextLevel;
    item.stock = Math.max(25, (item.stock ?? 80) - 10);
    item.health = Math.min(100, (item.health ?? 88) + 15);
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
  updateBuildingRecord(target, (item) => { item.stock = 100; });
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
  updateBuildingRecord(target, (item) => {
    item.health = 100;
    item.lastRepairedAt = Date.now();
    item.repairs = (item.repairs || 0) + 1;
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
  clamp();
};

window.panMobileCitySafe = (x = 0, y = 0) => {
  if (!world) return;
  world.x = Number(x) || 0;
  world.y = Number(y) || 0;
  clamp();
};

function computeBuildingsStateSig() {
  const fixedSig = CITY_BUILDINGS.map((b) => {
    const id = fixedId(b);
    const st = fixedBuildingStates[id] || normalizeBuildingState({}, b.type);
    const ready = collectStatus(st, defByKey(b.type)).ready ? 1 : 0;
    return `${id}:${st.level || 1}:${ready}`;
  }).join('|');
  const placedSig = placedBuildings.map((b) => {
    const ready = collectStatus(b, defByKey(b.type)).ready ? 1 : 0;
    return `${b.id}:${b.x},${b.y},${b.rotation || 0}:${b.level || 1}:${ready}`;
  }).join('|');
  return `${mode}#${fixedSig}#${placedSig}`;
}

function buildWorld() {
  world = new PIXI.Container();
  world.sortableChildren = true;
  app.stage.addChild(world);
  fixedLayer = null;
  placementLayer = null;
  incidentLayer = null;
  gridLayer = null;
  ghostLayer = null;
  animatedTrees = [];
  loadPlaced();
  loadFixedBuildingStates();
  drawGround();
  drawRoads();
  rebuildFixedBuildings();

  // Top Asian Market & Top North American Market Fleet with Real Spinning Tires
  addTraffic(pathH(0, 'east'), { color: 0x60a5fa, accent: 0xdbeafe, direction: 'east', speed: 88, scale: 0.78, assetKey: 'blueCar' }); // Asian Bayside Blue GT-Apex
  addTraffic(pathH(0, 'west'), { color: 0x4ade80, accent: 0xe0f2fe, direction: 'west', truck: true, speed: 74, scale: 0.80, assetKey: 'greenTruck' }); // NA 4x4 Baja Raptor Pickup
  addTraffic(pathH(0, 'east'), { color: 0xf43f5e, accent: 0xfef3c7, direction: 'east', speed: 94, scale: 0.78, assetKey: 'naMuscle' }); // NA Crimson V8 Muscle
  addTraffic(pathH(1, 'east'), { color: 0xfde047, accent: 0xfffbeb, direction: 'east', speed: 84, scale: 0.76, assetKey: 'yellowCar' }); // Asian Crown Hybrid Taxi
  addTraffic(pathH(1, 'west'), { color: 0xa855f7, accent: 0xe0f2fe, direction: 'west', speed: 96, scale: 0.78, assetKey: 'jdmGtCoupe' }); // JDM Midnight Purple Touge GT
  addTraffic(pathH(2, 'east'), { color: 0x38bdf8, accent: 0xdcfce7, direction: 'east', speed: 82, scale: 0.78, assetKey: 'rallyCar' }); // JDM World Rally Blue AWD
  addTraffic(pathH(2, 'west'), { color: 0xfb923c, accent: 0xfef3c7, direction: 'west', truck: true, speed: 76, scale: 0.80, assetKey: 'bajaSuv' }); // NA Bronco Trophy 4x4 SUV
  addTraffic(pathH(3, 'west'), { color: 0x22d3ee, accent: 0xecfeff, direction: 'west', speed: 98, scale: 0.78, assetKey: 'superCar' }); // NA Mid-Engine V8 Supercar
  addTraffic(pathH(3, 'east'), { color: 0x60a5fa, accent: 0xede9fe, direction: 'east', speed: 82, scale: 0.76, assetKey: 'blueCar' });
  addTraffic(pathH(1, 'east'), { color: 0xfacc15, accent: 0xe0f2fe, direction: 'east', truck: true, speed: 62, scale: 0.80, assetKey: 'towTruck', towTargetKey: 'compactCar' }); // Active Wrecker Tow Truck towing a JDM Hatch
  addTraffic(pathH(0, 'west'), { color: 0xf8fafc, accent: 0xfef3c7, direction: 'west', speed: 80, scale: 0.76, assetKey: 'compactCar' }); // JDM Kei RS Turbo Hatch
  addTraffic(pathH(2, 'east'), { color: 0x38bdf8, accent: 0xfffbeb, direction: 'east', truck: true, speed: 68, scale: 0.78, assetKey: 'deliveryVan' }); // NA 365 Fleet Transit Van
  addTraffic(pathH(3, 'east'), { color: 0xfacc15, accent: 0xe0f2fe, direction: 'east', truck: true, speed: 64, scale: 0.78, assetKey: 'towTruck' });

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

  addWalker(blockLoop(0, 0), RESIDENT_WANTS[0], 0x2563eb);
  addWalker(blockLoop(0, 1), RESIDENT_WANTS[1], 0x16a34a);
  addWalker(blockLoop(1, 0), RESIDENT_WANTS[2], 0xf97316);
  addWalker(blockLoop(1, 1), RESIDENT_WANTS[3], 0x7c3aed);
  addWalker(blockLoop(2, 0), RESIDENT_WANTS[4], 0x38bdf8);
  addWalker(blockLoop(2, 1), RESIDENT_WANTS[5], 0xfacc15);
  addWalker(avenueLoop(0, 'north'), RESIDENT_WANTS[0], 0x2563eb);
  addWalker(avenueLoop(1, 'south'), RESIDENT_WANTS[2], 0xf97316);
  addWalker(avenueLoop(3, 'north'), RESIDENT_WANTS[4], 0x38bdf8);
  SUPPLY_MANAGERS.forEach((staff, index) => {
    const path = index < 3 ? blockLoop(index, index % 2) : avenueLoop(index % ROADS.horizontal.length, index % 2 ? 'south' : 'north');
    addSupplyWalker(path, staff);
  });

  placementLayer = new PIXI.Container();
  placementLayer.zIndex = 4000;
  world.addChild(placementLayer);
  ghostLayer = new PIXI.Container();
  ghostLayer.zIndex = 4500;
  world.addChild(ghostLayer);
  rebuildPlacements();
  rebuildIncidents();
  rebuildGrid();
  lastBuildingsStateSig = computeBuildingsStateSig();
  updateHud();
}

function clamp() {
  const viewW = app.renderer.width / app.renderer.resolution;
  const viewH = app.renderer.height / app.renderer.resolution;
  world.x = Math.max(Math.min(0, viewW - WORLD.width), Math.min(0, world.x));
  world.y = Math.max(Math.min(0, viewH - WORLD.height), Math.min(0, world.y));
}

function setupCamera(host) {
  world.x = WORLD.startX;
  world.y = WORLD.startY;
  clamp();
  let dragging = false;
  let last = null;
  host.addEventListener('pointerdown', (event) => { dragging = true; dragMoved = false; last = { x: event.clientX, y: event.clientY }; });
  window.addEventListener('pointermove', (event) => {
    if (!dragging || !last) return;
    const dx = event.clientX - last.x;
    const dy = event.clientY - last.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
    world.x += dx;
    world.y += dy;
    last = { x: event.clientX, y: event.clientY };
    clamp();
  });
  window.addEventListener('pointerup', () => { dragging = false; last = null; setTimeout(() => { dragMoved = false; }, 90); });
}

async function createApp(host) {
  if (app) try { app.destroy(true); } catch {}
  app = new PIXI.Application();
  await app.init({ resizeTo: host, backgroundColor: 0x153a50, antialias: true, preference: 'webgl', resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true, preserveDrawingBuffer: true });
  host.innerHTML = '';
  host.appendChild(app.canvas);
}

async function preloadPixiWorldAssets() {
  if (pixiWorldAssetsLoaded) return;
  pixiWorldAssetsLoaded = true;
  try {
    await PIXI.Assets.load(WORLD_ASSET_LIST.map((item) => item.src));
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

    for (const item of traffic) {
      item.d += item.speed * dt;
      const p = pathPoint(item.path, item.d);

      let potholeJoltY = 0;
      let potholeTilt = 0;
      for (const pot of activePotholePositions) {
        const dist = Math.hypot(p.x - pot.x, p.y - pot.y);
        if (dist < 46) {
          const intensity = (1 - dist / 46);
          potholeJoltY = Math.sin(item.d * 0.95) * 4.2 * intensity;
          potholeTilt = Math.cos(item.d * 0.85) * 0.09 * intensity;
          break;
        }
      }

      item.sprite.x = p.x;
      item.sprite.y = p.y + potholeJoltY;
      item.sprite.zIndex = p.y + 40;

      if (item.sprite._chassis) {
        item.sprite._chassis.y = Math.sin(item.d * 0.24) * 0.85;
        item.sprite._chassis.rotation = potholeTilt;
      }
      if (item.sprite._wheels) {
        for (const wheel of item.sprite._wheels) {
          wheel.rotation += item.speed * dt * 0.14;
        }
      }
      if (item.sprite._strobes) {
        const flash = Math.sin(worldAnimClock * 14) > 0;
        if (item.sprite._strobes[0]) item.sprite._strobes[0].alpha = flash ? 1 : 0.2;
        if (item.sprite._strobes[1]) item.sprite._strobes[1].alpha = flash ? 0.2 : 1;
      }
    }

    for (const item of walkers) {
      item.d += item.speed * dt;
      const p = pathPoint(item.path, item.d);
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
