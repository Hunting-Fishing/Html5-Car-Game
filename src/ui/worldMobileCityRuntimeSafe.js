import * as PIXI from 'pixi.js';
import { WORLD_ASSET_LIST, WORLD_ASSETS, buildingAssetForKey, personAssetForKey, vehicleAssetForKey } from '../data/worldAssetMap.js';
import { BUILD_COMMUNICATION_STORAGE_KEY, readBuildCommunicationState } from '../systems/buildCommunicationSystem.js';

const WORLD = { width: 960, height: 1720, startX: -220, startY: -300 };
const GRID = {
  size: 40,
  storageKey: '365_mobile_city_safe_buildings_v1',
  buildingStateKey: '365_mobile_city_safe_building_state_v2'
};
const ROADS = {
  width: 88,
  sidewalk: 16,
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
  { x: 60, y: 90, w: 2, h: 2, type: 'dealerShowroom', label: 'Dealer Row', action: 'lines' },
  { x: 465, y: 84, w: 3, h: 2, type: 'partsWarehouse', label: '365 Garage', action: 'garage' },
  { x: 70, y: 395, w: 2, h: 2, type: 'streetKiosk', label: 'Parts Hub', action: 'merge' },
  { x: 710, y: 395, w: 2, h: 2, type: 'privateShop', label: 'Repair Shops', action: 'lines' },
  { x: 70, y: 740, w: 3, h: 2, type: 'salvageBlock', label: 'Salvage Yard', action: 'garage' },
  { x: 710, y: 740, w: 2, h: 2, type: 'towDispatch', label: 'Tow Dispatch', action: 'lines' },
  { x: 70, y: 1070, w: 3, h: 2, type: 'dealerShowroom', label: 'Showcase', action: 'lines' },
  { x: 700, y: 1070, w: 3, h: 2, type: 'testTrack', label: 'Test Track', action: 'race' }
];

const CITY_BUILDINGS = [
  ...FIXED_BUILDINGS,
  { x: 410, y: 710, w: 3, h: 2, type: 'tireRepair', label: 'Breakdown Center', action: null }
];

const RESIDENT_WANTS = [
  { key: 'residentBlue', name: 'Mia', want: 'I want a tire shop closer to this block.', building: 'tireRepair', menuLabel: 'Tire repair buildings', factors: ['potholes', 'trafficLights', 'mapBuild'] },
  { key: 'residentGreen', name: 'Jay', want: 'I want the parts warehouse restocked.', building: 'partsWarehouse', menuLabel: 'Parts supply buildings', factors: ['trafficJams', 'stuckVehicles', 'mapBuild'] },
  { key: 'residentOrange', name: 'Nico', want: 'I want a repair shop before traffic gets worse.', building: 'privateShop', menuLabel: 'Repair buildings', factors: ['potholes', 'vehicleBreakdowns', 'trafficJams'] },
  { key: 'residentPurple', name: 'Ari', want: 'I want more cars in the dealer showroom.', building: 'dealerShowroom', menuLabel: 'Showroom buildings', factors: ['trafficJams', 'trafficLights', 'mapBuild'] },
  { key: 'mechanic', name: 'Rae', want: 'I want tools and work orders from upgraded shops.', building: 'streetKiosk', menuLabel: 'Work order buildings', factors: ['vehicleBreakdowns', 'potholes', 'mapBuild'] },
  { key: 'driver', name: 'Sol', want: 'I want tow dispatch ready when cars break down.', building: 'towDispatch', menuLabel: 'Tow and recovery buildings', factors: ['vehicleBreakdowns', 'stuckVehicles', 'trafficJams'] }
];

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
    <section class="card pixiWorldShell">
      <div class="pixiWorldHeader">
        <h2>365 Auto City - World Buildings</h2>
        <p>Tap buildings for collection timers, bonuses, levels, and upgrade requirements.</p>
      </div>
      <div class="pixiWorldHost" id="pixiWorldHost"></div>
      <div class="worldAssetPreload" aria-hidden="true">
        ${WORLD_ASSET_LIST.map((item) => `<img class="worldAssetPreloadImage" data-world-asset="${item.category}:${item.key}" src="${item.src}" alt="" loading="eager">`).join('')}
      </div>
      <div class="mobileCityHud">
        <div class="mobileCityStatus"><span class="mobileCityModeBadge" data-mobile-city-mode>Normal</span> <span data-mobile-city-help>Tap buildings to collect, inspect, and upgrade. Build mode places owned buildings.</span></div>
        <div class="mobileBuildSyncStatus"><span>Build Sync</span><b data-build-sync-total>+${totalSyncedWorldInventory()} world</b><small data-build-sync-lines>${getBuildSync()?.unlockedLineCount || 0}/${getBuildSync()?.totalLineCount || 0} linked lines</small></div>
        <div class="mobileCityActions">
          <button class="btn primary" onclick="window.openMobileBuildTraySafe?.()">Build</button>
          <button class="btn ghost" onclick="window.centerMobileCitySafe?.()">Center</button>
          <button class="btn" data-action="screen" data-screen="garage">Manage Shop</button>
          <button class="btn gold" data-action="screen" data-screen="lines">Upgrade Lines</button>
        </div>
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
  if (!item) return;
  container.sortableChildren = true;
  const status = collectStatus(item, def);
  const req = upgradeRequirement(item, def);
  const bubble = new PIXI.Container();
  bubble.x = w / 2;
  bubble.y = -25;
  bubble.zIndex = 1000;
  bubble.addChild(roundRect(-47, -18, 94, 36, 12, 0xf8fafc, { width: 3, color: status.ready ? 0x22c55e : 0x20384f }));
  const iconSrc = status.ready ? WORLD_ASSETS.ui.collectReady : req.met ? WORLD_ASSETS.ui.upgradeReady : WORLD_ASSETS.ui.collectTimer;
  const icon = assetSprite(iconSrc, -28, 0, 28, 28, 1);
  if (icon) bubble.addChild(icon);
  bubble.addChild(textLabel(status.ready ? 'Collect' : formatDuration(status.msLeft), 13, 1, 9, 0x082f49));
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
  const levelIcon = assetSprite(WORLD_ASSETS.ui.levelBadge, 0, 0, 31, 24, 1);
  if (levelIcon) levelBadge.addChild(levelIcon);
  levelBadge.addChild(roundRect(-18, -10, 36, 20, 9, { color: 0x04111d, alpha: 0.78 }, { width: 1, color: 0x9fe8ff }));
  levelBadge.addChild(textLabel(`Lv ${item.level || 1}`, 0, 0, 8, 0xffffff));
  container.addChild(levelBadge);

  if (req.met && !req.maxed) {
    const upgrade = new PIXI.Container();
    upgrade.x = w - 6;
    upgrade.y = -7;
    upgrade.zIndex = 1002;
    const upgradeIcon = assetSprite(WORLD_ASSETS.ui.upgradeReady, 0, 0, 26, 26, 1);
    if (upgradeIcon) upgrade.addChild(upgradeIcon);
    upgrade.addChild(textLabel('UP', 0, 1, 7, 0x092b16));
    container.addChild(upgrade);
  }
}

function buildingTargetForFixed(building) {
  return { kind: 'fixed', id: fixedId(building), fixed: building };
}

function drawGround() {
  world.addChild(rect(0, 0, WORLD.width, WORLD.height, 0x70c25e));
  for (let y = 0; y < WORLD.height; y += 80) {
    for (let x = 0; x < WORLD.width; x += 80) {
      world.addChild(rect(x, y, 80, 80, { color: (x / 80 + y / 80) % 2 ? 0x65b457 : 0x7bd069, alpha: 0.24 }));
      const tile = assetSprite(WORLD_ASSETS.terrain.grassTile, x + 40, y + 40, 80, 80, 0.18);
      if (tile) world.addChild(tile);
    }
  }
}

function drawRoads() {
  for (const road of ROADS.horizontal) {
    world.addChild(rect(0, road.y - ROADS.sidewalk, WORLD.width, ROADS.sidewalk, 0xb9c1cc));
    world.addChild(rect(0, road.y + ROADS.width, WORLD.width, ROADS.sidewalk, 0xb9c1cc));
    const sidewalkTop = assetSprite(WORLD_ASSETS.terrain.sidewalk, WORLD.width / 2, road.y - ROADS.sidewalk / 2, WORLD.width, ROADS.sidewalk, 0.65);
    const sidewalkBottom = assetSprite(WORLD_ASSETS.terrain.sidewalk, WORLD.width / 2, road.y + ROADS.width + ROADS.sidewalk / 2, WORLD.width, ROADS.sidewalk, 0.65);
    if (sidewalkTop) world.addChild(sidewalkTop);
    if (sidewalkBottom) world.addChild(sidewalkBottom);
    world.addChild(rect(0, road.y, WORLD.width, ROADS.width, 0x202936, { width: 3, color: 0x111827 }));
    const roadAsset = assetSprite(WORLD_ASSETS.terrain.roadHorizontal, WORLD.width / 2, road.y + ROADS.width / 2, WORLD.width, ROADS.width, 0.82);
    if (roadAsset) world.addChild(roadAsset);
    world.addChild(rect(0, road.y + ROADS.width / 2 - 2, WORLD.width, 4, { color: 0xf8fafc, alpha: 0.42 }));
    world.addChild(textLabel(road.label, 100, road.y + 18, 10, 0xcbd5e1));
  }
  for (const road of ROADS.vertical) {
    world.addChild(rect(road.x - ROADS.sidewalk, 0, ROADS.sidewalk, WORLD.height, 0xb9c1cc));
    world.addChild(rect(road.x + ROADS.width, 0, ROADS.sidewalk, WORLD.height, 0xb9c1cc));
    const sidewalkLeft = assetSprite(WORLD_ASSETS.terrain.sidewalk, road.x - ROADS.sidewalk / 2, WORLD.height / 2, ROADS.sidewalk, WORLD.height, 0.65);
    const sidewalkRight = assetSprite(WORLD_ASSETS.terrain.sidewalk, road.x + ROADS.width + ROADS.sidewalk / 2, WORLD.height / 2, ROADS.sidewalk, WORLD.height, 0.65);
    if (sidewalkLeft) {
      sidewalkLeft.rotation = Math.PI / 2;
      world.addChild(sidewalkLeft);
    }
    if (sidewalkRight) {
      sidewalkRight.rotation = Math.PI / 2;
      world.addChild(sidewalkRight);
    }
    world.addChild(rect(road.x, 0, ROADS.width, WORLD.height, 0x202936, { width: 3, color: 0x111827 }));
    const roadAsset = assetSprite(WORLD_ASSETS.terrain.roadVertical, road.x + ROADS.width / 2, WORLD.height / 2, ROADS.width, WORLD.height, 0.82);
    if (roadAsset) world.addChild(roadAsset);
    world.addChild(rect(road.x + ROADS.width / 2 - 2, 0, 4, WORLD.height, { color: 0xf8fafc, alpha: 0.42 }));
  }
}

function buildingVisual({ x, y, wCells, hCells, type, name, alpha = 1, rotation = 0, buildingState = null, onCollect = null }) {
  const def = defByKey(type);
  const w = wCells * GRID.size;
  const h = hCells * GRID.size;
  const c = new PIXI.Container();
  c.x = x;
  c.y = y;
  c.zIndex = y + 100;
  c.alpha = alpha;
  c.addChild(roundRect(0, h - 10, w, 16, 8, { color: 0x000000, alpha: 0.20 }));
  c.addChild(roundRect(6, 14, w - 12, h - 18, 9, def.colorA, { width: 2, color: 0x142033 }));
  c.addChild(roundRect(14, 0, w - 28, 28, 7, 0xe2e8f0, { width: 2, color: 0x142033 }));
  c.addChild(roundRect(14, h - 30, Math.max(16, w * 0.22), 30, 5, def.colorB, { width: 2, color: 0x142033 }));
  for (let yy = 0; yy < Math.min(2, hCells); yy++) {
    for (let xx = 0; xx < Math.min(4, wCells + 1); xx++) {
      c.addChild(roundRect(28 + xx * 18, 34 + yy * 16, 10, 8, 2, 0xfde68a));
    }
  }
  const art = assetSprite(buildingAssetForKey(type, name, buildingState?.level || 1), w / 2, h / 2 + 5, Math.max(58, w * 1.08), Math.max(58, h * 1.05), 0.98);
  if (art) {
    art.rotation = (Math.abs(Number(rotation) || 0) % 4) * Math.PI / 2;
    c.addChild(art);
  }
  c.addChild(roundRect(0, h + 4, w, 20, 10, { color: 0x04111d, alpha: 0.88 }));
  c.addChild(textLabel(name || def.shortName, w / 2, h + 15, 9));
  addBuildingStatusBadges(c, w, h, buildingState, def, onCollect);
  return c;
}

function makeVehicle({ color = 0xf97316, accent = 0xffffff, direction = 'east', truck = false, assetKey = 'compactCar' }) {
  const bodyW = truck ? 58 : 48;
  const bodyH = truck ? 25 : 23;
  const car = new PIXI.Container();
  const wheels = [];
  car.addChild(roundRect(-bodyW / 2, -bodyH / 2 + 3, bodyW, bodyH, 8, { color: 0x000000, alpha: 0.22 }));
  car.addChild(roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 8, color, { width: 2, color: 0x172033 }));
  car.addChild(roundRect(-bodyW / 2 + 8, -bodyH / 2 + 4, bodyW - 24, bodyH - 8, 5, accent, { width: 2, color: 0x172033 }));
  car.addChild(rect(bodyW / 2 - 11, -5, 12, 10, { color: 0xffffff, alpha: 0.40 }));
  [[-bodyW / 2 + 10, -bodyH / 2 - 2], [bodyW / 2 - 12, -bodyH / 2 - 2], [-bodyW / 2 + 10, bodyH / 2 + 2], [bodyW / 2 - 12, bodyH / 2 + 2]].forEach(([x, y]) => {
    const wheel = new PIXI.Container();
    wheel.x = x;
    wheel.y = y;
    wheel.addChild(circle(0, 0, 5, 0x111827));
    wheel.addChild(rect(-1, -4, 2, 8, 0xcbd5e1));
    wheel.addChild(rect(-4, -1, 8, 2, 0xcbd5e1));
    car.addChild(wheel);
    wheels.push(wheel);
  });
  if (direction === 'west') car.scale.set(-1, 1);
  if (direction === 'north') car.rotation = -Math.PI / 2;
  if (direction === 'south') car.rotation = Math.PI / 2;
  const art = assetSprite(vehicleAssetForKey(assetKey), 0, 2, bodyW * 1.9, bodyH * 2.9, 1);
  if (art) car.addChild(art);
  car._wheels = wheels;
  return car;
}

function pathPoint(path, distance) {
  const a = path[0];
  const b = path[1];
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const t = ((distance % len) + len) % len / len;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
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

function addWalker(path, resident = RESIDENT_WANTS[0], shirt = 0x2563eb) {
  const p = new PIXI.Container();
  p.addChild(roundRect(-8, -11, 16, 22, 7, shirt, { width: 2, color: 0x1e293b }));
  p.addChild(roundRect(-7, -27, 14, 14, 7, 0xfed7aa, { width: 2, color: 0x1e293b }));
  const art = assetSprite(personAssetForKey(resident.key), 0, -4, 42, 60, 1);
  if (art) p.addChild(art);
  const bubble = assetSprite(WORLD_ASSETS.ui.wantBubble, 19, -38, 34, 20, 0.92);
  if (bubble) p.addChild(bubble);
  p.scale.set(0.78);
  makeClickable(p, () => openResidentSheet(resident));
  world.addChild(p);
  walkers.push({ sprite: p, path, d: Math.random() * 200, speed: 32, resident });
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
    syncLines.textContent = `${sync?.unlockedLineCount || 0}/${sync?.totalLineCount || 0} linked lines`;
  }
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
    { x: 385, y: 592 }, { x: 535, y: 909 }, { x: 210, y: 1240 }, { x: 755, y: 589 }
  ],
  vehicleBreakdowns: [
    { x: 565, y: 238 }, { x: 205, y: 868 }, { x: 755, y: 1198 }, { x: 315, y: 548 }
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
    potholes: 'POT',
    vehicleBreakdowns: 'TOW',
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
  incidentLayer.zIndex = 4300;
  world.addChild(incidentLayer);
  const conditions = cityConditionStats();
  for (const [key, positions] of Object.entries(CITY_ISSUE_MARKERS)) {
    const condition = conditions[key];
    const count = Math.min(condition?.count || 0, positions.length);
    for (let i = 0; i < count; i++) {
      const pos = positions[i];
      const marker = new PIXI.Container();
      marker.x = pos.x;
      marker.y = pos.y;
      marker.zIndex = pos.y + 900;
      marker.addChild(circle(0, 0, 19, { color: issueColor(key), alpha: 0.88 }, { width: 3, color: 0xffffff, alpha: 0.55 }));
      marker.addChild(textLabel(issueShortLabel(key), 0, -1, key === 'stuckVehicles' ? 7 : 8, 0xffffff));
      marker.addChild(roundRect(-25, 21, 50, 15, 7, { color: 0x04111d, alpha: 0.80 }, { width: 1, color: 0x9fe8ff, alpha: 0.55 }));
      marker.addChild(textLabel(`${condition.score}%`, 0, 29, 7, 0xffffff));
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
      ${isPlaced ? '<button class="btn ghost" onclick="window.moveSelectedMobileBuildingSafe?.()">Move</button>' : ''}
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
  return `
    <div class="residentWindow" data-resident-window>
      <div class="residentWindowHeader" data-resident-sheet-title>
        <div>
          <span class="residentKicker">Resident Request</span>
          <b>${escapeHtml(resident.name)}</b>
        </div>
        <strong>${escapeHtml(mood.label)} ${mood.score}%</strong>
      </div>
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
  const placedSheet = document.querySelector('[data-placed-sheet]');
  if (placedSheet) placedSheet.hidden = true;
  if (selectedResidentKey !== resident.key) selectedResidentMenu = 'mood';
  const hud = document.querySelector('.mobileCityHud');
  hud?.classList.remove('building-open', 'build-mode');
  hud?.classList.add('resident-open');
  selectedBuildingTarget = null;
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
  selectedResidentMenu = 'mood';
  document.querySelector('.mobileCityHud')?.classList.remove('resident-open');
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

function buildWorld() {
  world = new PIXI.Container();
  world.sortableChildren = true;
  app.stage.addChild(world);
  fixedLayer = null;
  placementLayer = null;
  incidentLayer = null;
  gridLayer = null;
  ghostLayer = null;
  loadPlaced();
  loadFixedBuildingStates();
  drawGround();
  drawRoads();
  rebuildFixedBuildings();

  addTraffic(pathH(0, 'east'), { color: 0xf97316, accent: 0xfef3c7, direction: 'east', speed: 92, scale: 0.72, assetKey: 'compactCar' });
  addTraffic(pathH(0, 'west'), { color: 0x60a5fa, accent: 0xdbeafe, direction: 'west', speed: 78, scale: 0.72, assetKey: 'blueCar' });
  addTraffic(pathH(1, 'east'), { color: 0xfacc15, accent: 0xfffbeb, direction: 'east', speed: 86, scale: 0.72, assetKey: 'yellowCar' });
  addTraffic(pathH(1, 'west'), { color: 0x35e58a, accent: 0xe0f2fe, direction: 'west', truck: true, speed: 68, scale: 0.78, assetKey: 'greenTruck' });
  addTraffic(pathH(2, 'east'), { color: 0x22c55e, accent: 0xdcfce7, direction: 'east', speed: 76, scale: 0.72, assetKey: 'deliveryVan' });
  addTraffic(pathH(3, 'west'), { color: 0x2dd4bf, accent: 0xecfeff, direction: 'west', truck: true, speed: 64, scale: 0.78, assetKey: 'towTruck' });
  addTraffic(pathV(1, 'north'), { color: 0xfacc15, accent: 0xfffbeb, direction: 'north', truck: true, speed: 58, scale: 0.76, assetKey: 'deliveryVan' });
  addTraffic(pathV(0, 'south'), { color: 0x38bdf8, accent: 0xe0f2fe, direction: 'south', truck: true, speed: 54, scale: 0.76, assetKey: 'towTruck' });

  [
    { key: 'tree', x: 390, y: 175, w: 58, h: 72 },
    { key: 'streetlight', x: 590, y: 330, w: 34, h: 64 },
    { key: 'parkingSign', x: 370, y: 1010, w: 38, h: 60 },
    { key: 'roadCone', x: 505, y: 725, w: 34, h: 44 }
  ].forEach((prop) => {
    const sprite = assetSprite(WORLD_ASSETS.props[prop.key], prop.x, prop.y, prop.w, prop.h, 1);
    if (sprite) {
      sprite.zIndex = prop.y + 20;
      world.addChild(sprite);
    }
  });

  addWalker([{ x: 210, y: 170 }, { x: 320, y: 170 }], RESIDENT_WANTS[0], 0x2563eb);
  addWalker([{ x: 640, y: 190 }, { x: 820, y: 190 }], RESIDENT_WANTS[1], 0x16a34a);
  addWalker([{ x: 210, y: 500 }, { x: 320, y: 500 }], RESIDENT_WANTS[2], 0xf97316);
  addWalker([{ x: 630, y: 842 }, { x: 842, y: 842 }], RESIDENT_WANTS[3], 0x7c3aed);
  addWalker([{ x: 300, y: 1180 }, { x: 490, y: 1180 }], RESIDENT_WANTS[4], 0x38bdf8);
  addWalker([{ x: 620, y: 1170 }, { x: 820, y: 1170 }], RESIDENT_WANTS[5], 0xfacc15);

  placementLayer = new PIXI.Container();
  placementLayer.zIndex = 4000;
  world.addChild(placementLayer);
  ghostLayer = new PIXI.Container();
  ghostLayer.zIndex = 4500;
  world.addChild(ghostLayer);
  rebuildPlacements();
  rebuildIncidents();
  rebuildGrid();
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
  await app.init({ resizeTo: host, backgroundColor: 0x153a50, antialias: true, resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true, preserveDrawingBuffer: true });
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
    for (const item of traffic) {
      item.d += item.speed * dt;
      const p = pathPoint(item.path, item.d);
      item.sprite.x = p.x;
      item.sprite.y = p.y;
      item.sprite.zIndex = p.y + 40;
      if (item.sprite._wheels) for (const wheel of item.sprite._wheels) wheel.rotation += item.wheelSpeed * dt;
    }
    for (const item of walkers) {
      item.d += item.speed * dt;
      const p = pathPoint(item.path, item.d);
      item.sprite.x = p.x;
      item.sprite.y = p.y;
      item.sprite.zIndex = p.y + 45;
    }
    statusRefreshTimer += dt;
    if (statusRefreshTimer >= 2) {
      statusRefreshTimer = 0;
      if (mode === 'normal') {
        rebuildFixedBuildings();
        rebuildPlacements();
        rebuildIncidents();
        if (selectedBuildingTarget) openBuildingSheet(selectedBuildingTarget, true);
        else refreshOpenResidentSheet();
        updateHud();
      }
    }
  });
}

function inject() {
  const screen = document.querySelector('#screen-world.active');
  if (!screen) return;
  if (!screen.querySelector('.pixiWorldShell')) {
    screen.innerHTML = html();
    initialized = false;
    mountedHost = null;
  }
  const host = screen.querySelector('#pixiWorldHost');
  if (host) mount(host);
}

const observer = new MutationObserver(() => inject());
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.addEventListener('load', inject);
document.addEventListener('click', () => requestAnimationFrame(inject));
