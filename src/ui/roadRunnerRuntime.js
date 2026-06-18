import {
  DAMAGE_SPEED_KMH,
  calculateHazardEffect,
  computeVehicleTelemetry
} from '../game/roadRunner/physics.js';
import {
  GHOST_SAMPLE_INTERVAL_MS,
  GHOST_STORAGE_KEY,
  createGhostFromLegacyTrail,
  createLocalBestGhost,
  getLocalBestGhost,
  loadGhostStore,
  sampleGhostAt,
  saveGhostStore,
  selectGhostsForRace,
  upsertLocalBestGhost
} from '../game/roadRunner/ghostModel.js';
import { RACER_VEHICLE_ASSETS } from '../data/racerVehicleAssetMap.js';

const SAVE_KEY = '365_canvas_road_runner_v4';
const COMPANION_SAVE_KEY = 'autoMergeGarageV10LocalOnly';

const ROUTES = {
  track: { label: '365 Test Track', profile: 'track', length: 9800, meters: 3200, reward: 1.05, difficulty: 0.70, skyA: '#7ddcff', skyB: '#d9fbff', grass: '#58b957', road: '#2d3748', seed: 4, unlock: 0, bgAsset: 'routeTrack' },
  barangay: { label: 'Barangay Route', profile: 'barangay', length: 10800, meters: 3500, reward: 1.0, difficulty: 0.95, skyA: '#8bdcff', skyB: '#e1fbff', grass: '#5fbf57', road: '#3a4555', seed: 1, unlock: 600, bgAsset: 'routeBarangay' },
  farm: { label: 'Farm Supply Run', profile: 'farm', length: 11800, meters: 3900, reward: 1.15, difficulty: 1.08, skyA: '#9ee8ff', skyB: '#e7fcff', grass: '#66bd45', road: '#554537', seed: 3, unlock: 1200, bgAsset: 'routeFarm' },
  mountain: { label: 'Mountain Parts Run', profile: 'mountain', length: 13800, meters: 4600, reward: 1.25, difficulty: 1.35, skyA: '#86d4ff', skyB: '#e0f7ff', grass: '#4f9e52', road: '#39414d', seed: 2, unlock: 1900, bgAsset: 'routeMountain' },
  port: { label: 'Port Export Route', profile: 'port', length: 15000, meters: 5000, reward: 1.35, difficulty: 1.45, skyA: '#93dfff', skyB: '#e4fbff', grass: '#49a985', road: '#36414d', seed: 5, unlock: 2700, bgAsset: 'routePort' }
};

const GHOST_MODES = {
  solo: { label: 'Solo', count: 0 },
  ghost2: { label: '1 Ghost', count: 1 },
  ghost3: { label: '2 Ghosts', count: 2 },
  ghost4: { label: '3 Ghosts', count: 3 }
};

const VEHICLES = {
  hatchback: { label: 'Starter Hatchback', asset: 'hatchback', cls: 'starter', unlock: { coins: 0, parts: 0 }, speed: 1, accel: 1, fuel: 1, handling: 1, durability: 1, description: 'Balanced starter car.' },
  greenCompact: { label: 'Compact Sport', asset: 'greenCompact', cls: 'starter', unlock: { coins: 180, parts: 1 }, speed: 1.08, accel: 1.08, fuel: 0.96, handling: 1.05, durability: 0.95, description: 'Faster compact for early ghost runs.' },
  cityTaxi: { label: 'City Taxi', asset: 'cityTaxi', cls: 'utility', unlock: { coins: 260, parts: 2 }, speed: 1.0, accel: 1.0, fuel: 1.1, handling: 1.1, durability: 1.05, description: 'Nimble all-rounder for city routes.' },
  pickup: { label: 'Parts Pickup', asset: 'pickup', cls: 'utility', unlock: { coins: 420, parts: 4 }, speed: 0.96, accel: 0.95, fuel: 1.2, handling: 1.08, durability: 1.22, description: 'More fuel and durability.' },
  rallyLite: { label: 'Rally Lite', asset: 'rallyLite', cls: 'offroad', unlock: { coins: 640, parts: 6 }, speed: 1.05, accel: 1.05, fuel: 1.0, handling: 1.2, durability: 1.05, description: 'Agile handling on loose surfaces.' },
  serviceVan: { label: 'Service Van', asset: 'serviceVan', cls: 'endurance', unlock: { coins: 820, parts: 8 }, speed: 0.92, accel: 0.90, fuel: 1.35, handling: 1.04, durability: 1.35, description: 'Endurance route vehicle.' },
  desertRunner: { label: 'Desert Runner', asset: 'desertRunner', cls: 'endurance', unlock: { coins: 1050, parts: 11 }, speed: 1.1, accel: 1.05, fuel: 1.15, handling: 1.25, durability: 1.3, description: 'Built for long hot hauls.' },
  offroad: { label: 'Off-Road Truck', asset: 'offroad', cls: 'offroad', unlock: { coins: 1300, parts: 14 }, speed: 1, accel: 1, fuel: 1.18, handling: 1.32, durability: 1.45, description: 'Best for rough roads.' },
  exportVan: { label: 'Export Support Van', asset: 'exportVan', cls: 'endurance', unlock: { coins: 1650, parts: 18 }, speed: 0.98, accel: 0.95, fuel: 1.45, handling: 1.1, durability: 1.5, description: 'Maximum range for port routes.' },
  race: { label: 'Purple Race Coupe', asset: 'race', cls: 'race', unlock: { coins: 2050, parts: 22 }, speed: 1.24, accel: 1.18, fuel: 0.90, handling: 1.08, durability: 0.85, description: 'Fastest track vehicle.' },
  mountainCourier: { label: 'Mountain Courier', asset: 'mountainCourier', cls: 'offroad', unlock: { coins: 2600, parts: 28 }, speed: 1.12, accel: 1.1, fuel: 1.25, handling: 1.35, durability: 1.4, description: 'Heavy-duty mountain hauler.' },
  superCoupe: { label: '365 Super Coupe', asset: 'superCoupe', cls: 'race', unlock: { coins: 3400, parts: 36 }, speed: 1.35, accel: 1.3, fuel: 0.85, handling: 1.15, durability: 0.9, description: 'Top-tier performance flagship.' }
};

const UPGRADES = {
  engine: { label: 'Engine', description: 'More acceleration.', max: 15, baseCoins: 45, baseParts: 0, growth: 1.42, partsEvery: 4 },
  tires: { label: 'Tires', description: 'Higher speed, grip, and less drag.', max: 15, baseCoins: 40, baseParts: 0, growth: 1.40, partsEvery: 3 },
  fuelTank: { label: 'Fuel Tank', description: 'More fuel range and station capacity.', max: 15, baseCoins: 55, baseParts: 0, growth: 1.45, partsEvery: 3 },
  suspension: { label: 'Suspension', description: 'Better hill movement and less hazard damage.', max: 15, baseCoins: 45, baseParts: 0, growth: 1.42, partsEvery: 3 },
  durability: { label: 'Durability', description: 'Reduces wear and tear damage.', max: 15, baseCoins: 60, baseParts: 1, growth: 1.50, partsEvery: 2 },
  transmission: { label: 'Transmission', description: 'Better hill climbing and reverse recovery.', max: 10, baseCoins: 95, baseParts: 1, growth: 1.55, partsEvery: 2 },
  brakes: { label: 'Brakes', description: 'Slows quicker and reduces hazard damage while braking.', max: 10, baseCoins: 70, baseParts: 0, growth: 1.46, partsEvery: 3 },
  repairKit: { label: 'Repair Kit', description: 'Tools repair more wear during the run.', max: 10, baseCoins: 85, baseParts: 1, growth: 1.48, partsEvery: 2 }
};

const DAILY_PICK_COUNT = 3;
const WEEKLY_PICK_COUNT = 2;
const VEHICLE_FILTERS = ['all', 'starter', 'utility', 'offroad', 'endurance', 'race'];

const PROGRESSION_MISSIONS = [
  { key: 'fuel-run', label: 'Reach Next Fuel', description: 'Reach 900m with at least 10% fuel.', target: 900, minFuelPct: 10, rewardCoins: 70, rewardParts: 0 },
  { key: 'parts-salvage', label: 'Salvage Parts', description: 'Collect 4 parts in one run.', targetParts: 4, rewardCoins: 45, rewardParts: 2 },
  { key: 'smooth-driver', label: 'Smooth Driver', description: 'Reach 1200m with less than 45% wear.', target: 1200, maxWearPct: 45, rewardCoins: 90, rewardParts: 1 },
  { key: 'repair-run', label: 'Use Repairs', description: 'Use a mechanic shop or tool pickup during a run.', needRepair: true, rewardCoins: 75, rewardParts: 1 },
  { key: 'hazard-control', label: 'Hazard Control', description: 'Clear 3 hazards while keeping wear under 60%.', targetHazards: 3, maxWearPct: 60, rewardCoins: 120, rewardParts: 1 },
  { key: 'speed-limit', label: 'Speed Limit', description: `Reach 800m without exceeding ${DAMAGE_SPEED_KMH}km/h.`, target: 800, maxKmh: DAMAGE_SPEED_KMH, rewardCoins: 130, rewardParts: 1 },
  { key: 'long-haul', label: 'Long Haul', description: 'Reach 2500m in one run.', target: 2500, rewardCoins: 160, rewardParts: 2 },
  { key: 'high-roller', label: 'High Roller', description: 'Reach 3500m in one run.', target: 3500, rewardCoins: 220, rewardParts: 3 },
  { key: 'master-driver', label: 'Master Driver', description: 'Finish a route with under 70% wear.', completedRoute: true, maxWearPct: 70, rewardCoins: 300, rewardParts: 4 }
];

const DAILY_MISSION_POOL = [
  { key: 'daily-distance', label: 'Daily Drive', description: 'Reach 800m in a run.', target: 800, rewardCoins: 40, rewardParts: 0 },
  { key: 'daily-parts', label: 'Daily Salvage', description: 'Collect 3 parts in a run.', targetParts: 3, rewardCoins: 50, rewardParts: 1 },
  { key: 'daily-repair', label: 'Daily Repair', description: 'Use a repair during a run.', needRepair: true, rewardCoins: 35, rewardParts: 0 },
  { key: 'daily-hazards', label: 'Daily Hazards', description: 'Clear 2 hazards in a run.', targetHazards: 2, rewardCoins: 45, rewardParts: 0 },
  { key: 'daily-clean', label: 'Clean Run', description: 'Reach 1000m with under 50% wear.', target: 1000, maxWearPct: 50, rewardCoins: 60, rewardParts: 0 },
  { key: 'daily-haul', label: 'Daily Haul', description: 'Reach 1500m in a run.', target: 1500, rewardCoins: 80, rewardParts: 1 }
];

const WEEKLY_MISSION_POOL = [
  { key: 'weekly-distance', label: 'Weekly Distance', description: 'Drive 6000m total this week.', lifetimeKey: 'distance', target: 6000, rewardCoins: 250, rewardParts: 3 },
  { key: 'weekly-runs', label: 'Weekly Runs', description: 'Complete 8 runs this week.', lifetimeKey: 'runs', target: 8, rewardCoins: 200, rewardParts: 2 },
  { key: 'weekly-coins', label: 'Weekly Earnings', description: 'Earn 600 coins this week.', lifetimeKey: 'coinsEarned', target: 600, rewardCoins: 180, rewardParts: 2 },
  { key: 'weekly-parts', label: 'Weekly Parts', description: 'Earn 15 parts this week.', lifetimeKey: 'partsEarned', target: 15, rewardCoins: 220, rewardParts: 0 }
];

const ASSET_PATHS = {
  ...RACER_VEHICLE_ASSETS,
  hatchback: '/assets/race/cars/starter_compact.png',
  ghostA: RACER_VEHICLE_ASSETS.greenCompact,
  ghostB: RACER_VEHICLE_ASSETS.pickup,
  ghostC: RACER_VEHICLE_ASSETS.serviceVan,
  coin: '/assets/road-runner/token-coin.svg',
  fuel: '/assets/road-runner/token-energy.svg',
  parts: '/assets/road-runner/token-parts.svg',
  tools: '/assets/road-runner/tool-kit.svg',
  fuelStation: '/assets/road-runner/fuel-station.svg',
  partsStore: '/assets/road-runner/parts-store.svg',
  mechanicShop: '/assets/road-runner/mechanic-shop.svg',
  wreck: '/assets/road-runner/wrecked-car.svg',
  routeTrack: '/assets/race/backgrounds/street_loop.png',
  routeBarangay: '/assets/race/backgrounds/street_loop.png',
  routeFarm: '/assets/race/backgrounds/parts_delivery.png',
  routeMountain: '/assets/race/backgrounds/rough_road.png',
  routePort: '/assets/race/backgrounds/dealer_showcase.png',
  roadStrip: '/assets/race/fx/road_strip.png',
  speedStreaks: '/assets/race/fx/speed_streaks.png',
  boostRing: '/assets/race/fx/tap_boost_ring.png',
  checkpointFlag: '/assets/race/fx/checkpoint_flag.png',
  warningPanel: '/assets/race/fx/warning_panel.png',
  warningBadge: '/assets/race/fx/warning_badge.png'
};

let canvas = null;
let ctx = null;
let frameId = 0;
let mountedScreen = null;
let activeRoute = 'track';
let activeGhostMode = 'ghost2';
let ghostStore = loadGhostStore();
let saveData = loadSave();
let images = loadImages();
let input = { gas: false, brake: false };
let game = null;
let lastTime = 0;
let activeTab = 'drive';
let activeVehicleFilter = 'all';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function defaultUpgrades() {
  return { engine: 1, tires: 1, fuelTank: 1, suspension: 1, durability: 1, transmission: 1, brakes: 1, repairKit: 1 };
}

function normalizeUpgrades(upgrades = {}) {
  const migrated = {
    ...upgrades,
    fuelTank: upgrades.fuelTank || upgrades.energyTank || 1,
    transmission: upgrades.transmission || 1,
    brakes: upgrades.brakes || 1,
    repairKit: upgrades.repairKit || 1
  };
  const result = {};
  Object.keys(defaultUpgrades()).forEach((key) => {
    result[key] = clamp(Number(migrated[key] || 1), 1, UPGRADES[key].max);
  });
  return result;
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem('365_canvas_road_runner_v3') || localStorage.getItem('365_canvas_road_runner_v2') || localStorage.getItem('365_canvas_road_runner_v1') || '{}';
    const parsed = JSON.parse(raw);
    const unlockedVehicles = Array.isArray(parsed.unlockedVehicles) && parsed.unlockedVehicles.length ? parsed.unlockedVehicles : ['hatchback'];
    const selectedVehicle = unlockedVehicles.includes(parsed.selectedVehicle) ? parsed.selectedVehicle : 'hatchback';
    const result = {
      coins: parsed.coins || 0,
      parts: parsed.parts || 0,
      tools: parsed.tools || 0,
      bestDistance: parsed.bestDistance || 0,
      bestTrail: Array.isArray(parsed.bestTrail) ? parsed.bestTrail : [],
      upgrades: normalizeUpgrades(parsed.upgrades),
      unlockedVehicles,
      selectedVehicle,
      completedMissions: Array.isArray(parsed.completedMissions) ? parsed.completedMissions : [],
      lifetimeFuel: parsed.lifetimeFuel || 0,
      lifetimeWear: parsed.lifetimeWear || 0,
      lifetimeRepairs: parsed.lifetimeRepairs || 0,
      lifetime: {
        distance: parsed.lifetime?.distance || 0,
        coinsEarned: parsed.lifetime?.coinsEarned || 0,
        partsEarned: parsed.lifetime?.partsEarned || 0,
        runs: parsed.lifetime?.runs || 0
      },
      missions: parsed.missions || null
    };
    ensureMissionState(result);
    migrateLegacyBestTrail(result);
    return result;
  } catch {
    const fallback = { coins: 0, parts: 0, tools: 0, bestDistance: 0, bestTrail: [], upgrades: defaultUpgrades(), unlockedVehicles: ['hatchback'], selectedVehicle: 'hatchback', completedMissions: [], lifetimeFuel: 0, lifetimeWear: 0, lifetimeRepairs: 0, lifetime: { distance: 0, coinsEarned: 0, partsEarned: 0, runs: 0 }, missions: null };
    ensureMissionState(fallback);
    return fallback;
  }
}

function saveGameData() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

function companionProfile() {
  try {
    const parsed = JSON.parse(localStorage.getItem(COMPANION_SAVE_KEY) || '{}');
    return {
      playerName: parsed.playerName || 'Garage Rookie',
      stage: Math.max(1, Math.floor(Number(parsed.stage) || 1))
    };
  } catch {
    return { playerName: 'Garage Rookie', stage: 1 };
  }
}

function currentGhostStage() {
  return companionProfile().stage;
}

function currentPlayerName() {
  return companionProfile().playerName;
}

function migrateLegacyBestTrail(data) {
  if (!Array.isArray(data.bestTrail) || data.bestTrail.length <= 5 || !data.bestDistance) return;
  if (getLocalBestGhost(ghostStore, 'track', 1)) return;
  const ghost = createGhostFromLegacyTrail({
    trail: data.bestTrail,
    route: 'track',
    stage: 1,
    distance: data.bestDistance,
    carKey: data.selectedVehicle || 'hatchback',
    playerName: currentPlayerName()
  });
  const result = upsertLocalBestGhost(ghostStore, ghost);
  ghostStore = result.store;
  if (result.changed) saveGhostStore(ghostStore);
}

function ghostsForRun(route, stage) {
  const mode = GHOST_MODES[activeGhostMode] || GHOST_MODES.ghost2;
  return selectGhostsForRace({
    store: ghostStore,
    route: activeRoute,
    stage,
    count: mode.count,
    routeLength: route.length
  });
}

function refreshActiveGhosts() {
  if (!game) return;
  game.activeGhosts = ghostsForRun(game.route, game.stage || currentGhostStage());
}

function recordGhostSample(force = false) {
  if (!game?.telemetry) return;
  if (!force && (game.elapsed - game.lastSample) * 1000 < GHOST_SAMPLE_INTERVAL_MS) return;
  const sample = {
    t: Math.round(game.elapsed * 1000),
    x: Number(game.distancePx.toFixed(1)),
    speed: Number(game.telemetry.kmh.toFixed(1))
  };
  const previous = game.samples[game.samples.length - 1];
  if (!previous || previous.t !== sample.t || previous.x !== sample.x) game.samples.push(sample);
  game.lastSample = game.elapsed;
}

function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function weekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() + ((day === 0 ? -6 : 1) - day));
  return d.toISOString().slice(0, 10);
}

function pickRandom(list, count) {
  const pool = list.slice();
  const picked = [];
  while (picked.length < count && pool.length) {
    picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return picked;
}

function formatTimeRemaining(targetMs) {
  const ms = Math.max(0, targetMs - Date.now());
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${minutes}m`;
}

function nextDailyResetAt() {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
}

function nextWeeklyResetAt() {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = ((8 - day) % 7) || 7;
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diff);
}

function ensureMissionState(data) {
  const today = dayKey();
  const week = weekKey();
  let missions = data.missions && typeof data.missions === 'object' ? data.missions : null;
  if (!missions) missions = { day: '', daily: [], dailyDone: [], week: '', weekly: [], weeklyDone: [], weeklyBaseline: {} };
  if (!Array.isArray(missions.daily)) missions.daily = [];
  if (!Array.isArray(missions.dailyDone)) missions.dailyDone = [];
  if (!Array.isArray(missions.weekly)) missions.weekly = [];
  if (!Array.isArray(missions.weeklyDone)) missions.weeklyDone = [];
  if (!missions.weeklyBaseline || typeof missions.weeklyBaseline !== 'object') missions.weeklyBaseline = {};
  if (missions.day !== today) {
    missions.day = today;
    missions.daily = pickRandom(DAILY_MISSION_POOL.map((m) => m.key), DAILY_PICK_COUNT);
    missions.dailyDone = [];
  }
  if (missions.week !== week) {
    missions.week = week;
    missions.weekly = pickRandom(WEEKLY_MISSION_POOL.map((m) => m.key), WEEKLY_PICK_COUNT);
    missions.weeklyDone = [];
    missions.weeklyBaseline = {};
    WEEKLY_MISSION_POOL.forEach((m) => {
      if (missions.weekly.includes(m.key)) missions.weeklyBaseline[m.lifetimeKey] = data.lifetime[m.lifetimeKey] || 0;
    });
  }
  data.missions = missions;
  return missions;
}

function formatSmall(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${Math.floor(value)}`;
}

function upgradeCost(key, level) {
  const item = UPGRADES[key];
  if (!item || level >= item.max) return { coins: Infinity, parts: Infinity };
  return {
    coins: Math.round(item.baseCoins * Math.pow(item.growth, level - 1)),
    parts: item.baseParts + Math.floor(level / item.partsEvery)
  };
}

function selectedVehicle() {
  return VEHICLES[saveData.selectedVehicle] || VEHICLES.hatchback;
}

function routeUnlocked(key) {
  return (saveData.bestDistance || 0) >= (ROUTES[key].unlock || 0);
}

function vehicleStats() {
  const u = normalizeUpgrades(saveData.upgrades);
  const vehicle = selectedVehicle();
  const engineUpgrade = u.engine - 1;
  const tireUpgrade = u.tires - 1;
  const fuelUpgrade = u.fuelTank - 1;
  const suspensionUpgrade = u.suspension - 1;
  const transmissionUpgrade = u.transmission - 1;
  return {
    vehicleClass: vehicle.cls,
    engineLevel: u.engine,
    transmissionLevel: u.transmission,
    acceleration: (36 + engineUpgrade * 2.55 + transmissionUpgrade * 1.15 + tireUpgrade * 0.5) * vehicle.accel,
    topSpeed: (150 + tireUpgrade * 6.2 + engineUpgrade * 2.0 + transmissionUpgrade * 1.2) * vehicle.speed,
    reverseTop: 28 + transmissionUpgrade * 3.8,
    drag: Math.max(0.65, 3.25 - tireUpgrade * 0.12 - suspensionUpgrade * 0.04 - transmissionUpgrade * 0.04),
    grip: 0.82 + tireUpgrade * 0.026 + suspensionUpgrade * 0.012,
    maxFuel: (105 + fuelUpgrade * 24) * vehicle.fuel,
    fuelUse: Math.max(1.55, 3.75 - fuelUpgrade * 0.11 + engineUpgrade * 0.045 + tireUpgrade * 0.015),
    handling: (0.1 + suspensionUpgrade * 0.017 + tireUpgrade * 0.004) * vehicle.handling,
    spring: 5.2 + suspensionUpgrade * 0.48,
    damping: 2.9 + suspensionUpgrade * 0.19,
    durability: (1 + u.durability * 0.1) * vehicle.durability,
    wearLimit: 100 + u.durability * 12,
    climb: 1 + transmissionUpgrade * 0.07 + engineUpgrade * 0.024 + suspensionUpgrade * 0.012,
    brakePower: 54 + u.brakes * 5.4,
    repairPower: 6 + u.repairKit * 2,
    launchBonus: 0.52 + engineUpgrade * 0.022 + transmissionUpgrade * 0.018,
    midRangePull: 1 + engineUpgrade * 0.022 + tireUpgrade * 0.01 + transmissionUpgrade * 0.012,
    topEndPull: 1 + engineUpgrade * 0.012 + tireUpgrade * 0.018 + transmissionUpgrade * 0.012,
    hazardSpeedResistance: clamp(tireUpgrade * 0.01 + suspensionUpgrade * 0.014, 0, 0.34)
  };
}

function routeMeters(route, pixels) {
  return Math.floor(Math.max(0, pixels) * (route.meters / route.length));
}

function terrainOffset(route, x) {
  const seed = route.seed || 1;
  if (route.profile === 'track') return Math.sin((x + seed * 90) / 430) * 14 + Math.sin((x + seed * 40) / 190) * 6 + Math.sin((x + seed * 20) / 820) * 16;
  if (route.profile === 'mountain') return Math.sin((x + seed * 160) / 180) * 42 + Math.sin((x + seed * 85) / 74) * 13 - Math.sin((x + seed * 60) / 520) * 46;
  if (route.profile === 'farm') return Math.sin((x + seed * 120) / 240) * 26 + Math.sin((x + seed * 70) / 96) * 10 - Math.sin((x + seed * 30) / 680) * 22;
  if (route.profile === 'port') return Math.sin((x + seed * 110) / 360) * 20 + Math.sin((x + seed * 55) / 155) * 7 - Math.sin((x + seed * 40) / 940) * 24;
  return Math.sin((x + seed * 120) / 175) * 24 + Math.sin((x + seed * 70) / 78) * 9 - Math.sin((x + seed * 30) / 540) * 26;
}

function makeTerrainProfile(route) {
  const step = route.profile === 'track' ? 56 : 64;
  const roughness = route.profile === 'track' ? 5 : route.profile === 'mountain' ? 18 : 11;
  const maxStep = route.profile === 'track' ? 6 : route.profile === 'mountain' ? 16 : 11;
  const maxOffset = route.profile === 'mountain' ? 92 : route.profile === 'track' ? 34 : 62;
  const points = [];
  let previous = terrainOffset(route, 0);
  for (let x = 0; x <= route.length + 360; x += step) {
    const chunkNoise = (seededNoise(x * 0.41 + 97, route.seed + 11) - 0.5) * roughness;
    const longNoise = (seededNoise(x * 0.13 + 401, route.seed + 23) - 0.5) * roughness * 1.45;
    const target = terrainOffset(route, x) + chunkNoise + longNoise;
    previous = clamp(previous + clamp(target - previous, -maxStep, maxStep), -maxOffset, maxOffset);
    points.push({ x, y: previous });
  }
  return { step, points };
}

function sampledTerrainOffset(route, x) {
  const points = route.terrain?.points;
  if (!points?.length) return terrainOffset(route, x);
  if (x <= points[0].x) return points[0].y;
  const last = points[points.length - 1];
  if (x >= last.x) return last.y;
  const step = route.terrain.step || 64;
  const index = clamp(Math.floor(x / step), 0, points.length - 2);
  const left = points[index];
  const right = points[index + 1];
  const t = clamp((x - left.x) / Math.max(1, right.x - left.x), 0, 1);
  return left.y + (right.y - left.y) * t;
}

function routeY(route, x, height) {
  const base = Math.max(170, Math.min(height - 130, height * 0.61));
  return base + sampledTerrainOffset(route, x);
}

function routeAngle(route, x, height) {
  const rise = routeY(route, x + 10, height) - routeY(route, x - 10, height);
  return clamp((rise / 20) * 0.42, -0.55, 0.55);
}

function loadImages() {
  const result = {};
  Object.entries(ASSET_PATHS).forEach(([key, path]) => {
    const img = new Image();
    img.onload = () => { img.ready = true; publishRoadRunnerAssetState(); };
    img.onerror = () => { img.ready = false; publishRoadRunnerAssetState(); };
    img.src = path;
    result[key] = img;
  });
  return result;
}

function publishRoadRunnerAssetState() {
  if (!images) return;
  const vehicleAssets = Object.entries(VEHICLES).map(([key, vehicle]) => {
    const assetKey = vehicle.asset;
    const img = images[assetKey];
    return {
      key,
      asset: ASSET_PATHS[assetKey] || '',
      ready: Boolean(img?.ready && img.naturalWidth > 0)
    };
  });
  window.__rrAssetState = {
    vehicleCount: vehicleAssets.length,
    vehicleReadyCount: vehicleAssets.filter((item) => item.ready).length,
    activeVehicle: saveData.selectedVehicle,
    activeVehicleAsset: ASSET_PATHS[selectedVehicle().asset] || '',
    activeVehicleReady: Boolean(images[selectedVehicle().asset]?.ready && images[selectedVehicle().asset]?.naturalWidth > 0),
    routeBackgrounds: Object.fromEntries(Object.entries(ROUTES).map(([key, route]) => [
      key,
      {
        asset: ASSET_PATHS[route.bgAsset] || '',
        ready: Boolean(images[route.bgAsset]?.ready && images[route.bgAsset]?.naturalWidth > 0)
      }
    ])),
    sceneFx: Object.fromEntries(['roadStrip', 'speedStreaks', 'boostRing', 'checkpointFlag', 'warningPanel', 'warningBadge'].map((key) => [
      key,
      {
        asset: ASSET_PATHS[key],
        ready: Boolean(images[key]?.ready && images[key]?.naturalWidth > 0)
      }
    ])),
    missingVehicles: vehicleAssets.filter((item) => !item.asset || !item.ready)
  };
}

function seededNoise(x, seed) {
  return Math.abs(Math.sin(x * 0.013 + seed * 9.17) * 43758.5453) % 1;
}

function addCoinFormation(pickups, route, startX, formationIndex) {
  const roll = seededNoise(startX + formationIndex * 41, route.seed + 31);
  const count = 3 + Math.floor(roll * 4);
  const spacing = 35 + Math.floor(seededNoise(startX + 11, route.seed) * 14);
  const arch = roll > 0.56;
  for (let i = 0; i < count; i += 1) {
    const center = (count - 1) / 2;
    const yOffset = arch ? -Math.sin((i / Math.max(1, count - 1)) * Math.PI) * (24 + route.difficulty * 16) : (i % 2) * -12;
    const value = Math.max(1, Math.round((2 + Math.abs(i - center) * 0.25) * route.reward));
    pickups.push({
      x: startX + i * spacing,
      yOffset,
      value,
      type: 'coin',
      formation: formationIndex,
      collected: false
    });
  }
}

function makePickups(route) {
  const pickups = [];
  const coinGap = route.profile === 'track' ? 360 : route.profile === 'mountain' ? 460 : 400;
  let formation = 0;
  for (let x = 330; x < route.length - 360; x += coinGap + seededNoise(x, route.seed + 5) * 170) {
    addCoinFormation(pickups, route, x, formation);
    formation += 1;
  }
  const specialGap = route.profile === 'track' ? 760 : route.profile === 'mountain' ? 940 : 860;
  for (let x = 620; x < route.length - 400; x += specialGap + seededNoise(x + 75, route.seed) * 260) {
    const roll = seededNoise(x, route.seed + 17);
    const type = roll > 0.88 ? 'tools' : roll > 0.66 ? 'parts' : 'fuel';
    pickups.push({ x, yOffset: type === 'fuel' ? -4 : -16, value: 1, type, collected: false });
  }
  return pickups.sort((a, b) => a.x - b.x);
}

function makeDirector(route) {
  const checkpoints = [];
  const hazards = [];
  let fuelX = route.profile === 'track' ? 850 : 1100;
  const baseFuelGap = route.profile === 'track' ? 1550 : route.profile === 'mountain' ? 2450 : route.profile === 'port' ? 2650 : 1900;
  while (fuelX < route.length - 620) {
    const jitter = (seededNoise(fuelX, route.seed) - 0.5) * 760 * route.difficulty;
    fuelX += baseFuelGap + jitter;
    if (fuelX < route.length - 520) checkpoints.push({ x: fuelX, type: 'fuelStation', used: false });
  }
  for (let x = 1350; x < route.length - 700; x += 2600 + seededNoise(x, route.seed) * 500) checkpoints.push({ x, type: 'partsStore', used: false });
  for (let x = 1950; x < route.length - 800; x += 3100 + seededNoise(x, route.seed) * 650) checkpoints.push({ x, type: 'mechanicShop', used: false });
  for (let x = 850; x < route.length - 600; x += 1500 + seededNoise(x, route.seed) * 600) checkpoints.push({ x, type: 'wreck', used: false });
  const hazardTypes = ['pothole', 'mud', 'gravel', 'rough'];
  for (let x = 720; x < route.length - 500; x += 620 + seededNoise(x, route.seed) * 520) {
    const type = hazardTypes[Math.floor(seededNoise(x + 33, route.seed) * hazardTypes.length)];
    const length = type === 'rough' ? 260 : type === 'mud' ? 210 : type === 'gravel' ? 230 : 80;
    hazards.push({ x, type, length, hit: false });
  }
  return { checkpoints: checkpoints.sort((a, b) => a.x - b.x), hazards: hazards.sort((a, b) => a.x - b.x) };
}

function currentProgressionMission() {
  return PROGRESSION_MISSIONS.find((mission) => !saveData.completedMissions.includes(mission.key)) || null;
}

function computeTelemetry(dt = 0, speed = game?.speed || 0) {
  if (!game) {
    return {
      kmh: 0,
      gear: 1,
      gearLabel: 'G1',
      rpm: 900,
      rpmPct: 0,
      topSpeedKmh: 0,
      speedometerMaxKmh: 180,
      redlineRpm: 7000
    };
  }
  const target = computeVehicleTelemetry({
    speed,
    topSpeed: game.stats.topSpeed,
    reverseTop: game.stats.reverseTop,
    route: game.route,
    vehicleClass: game.stats.vehicleClass,
    engineLevel: game.stats.engineLevel,
    transmissionLevel: game.stats.transmissionLevel,
    currentGear: game.telemetry?.gear,
    throttle: input.gas,
    braking: input.brake
  });
  if (!game.telemetry || dt <= 0) return target;

  const rpmRate = target.rpm >= game.telemetry.rpm ? 1.45 : 2.35;
  const rpmAlpha = 1 - Math.exp(-rpmRate * dt);
  const rpm = Math.round(game.telemetry.rpm + (target.rpm - game.telemetry.rpm) * rpmAlpha);
  return {
    ...target,
    rpm,
    rpmPct: clamp(
      (rpm - target.idleRpm) / Math.max(1, target.redlineRpm - target.idleRpm),
      0,
      1
    )
  };
}

function missionRunMatches(mission) {
  if (!game || !mission) return false;
  const wearPct = Math.floor(Math.min(100, game.wear / game.stats.wearLimit * 100));
  const fuelPct = Math.floor(Math.max(0, game.fuel / game.stats.maxFuel * 100));
  if (mission.targetParts && game.parts < mission.targetParts) return false;
  if (mission.needRepair && !game.usedRepair) return false;
  if (mission.targetHazards && game.hazardsCleared < mission.targetHazards) return false;
  if (mission.maxWearPct && wearPct > mission.maxWearPct) return false;
  if (mission.minFuelPct && fuelPct < mission.minFuelPct) return false;
  if (mission.maxKmh && game.maxKmh > mission.maxKmh) return false;
  if (mission.completedRoute && !game.finishedRoute) return false;
  if (mission.target && game.distanceM < mission.target) return false;
  return true;
}

function evaluateRunMissionsLive() {
  if (!game) return;
  if (!game.earnedProgression && game.mission && missionRunMatches(game.mission)) game.earnedProgression = true;
  saveData.missions.daily.forEach((key) => {
    if (game.earnedDaily.has(key) || saveData.missions.dailyDone.includes(key)) return;
    const mission = DAILY_MISSION_POOL.find((m) => m.key === key);
    if (mission && missionRunMatches(mission)) game.earnedDaily.add(key);
  });
}

function evaluateMissionSets() {
  const completed = [];
  const prog = game.mission;
  if (prog && !saveData.completedMissions.includes(prog.key) && (game.earnedProgression || missionRunMatches(prog))) {
    saveData.completedMissions.push(prog.key);
    saveData.coins += prog.rewardCoins;
    saveData.parts += prog.rewardParts;
    completed.push({ label: prog.label, rewardCoins: prog.rewardCoins, rewardParts: prog.rewardParts, kind: 'Progression' });
  }
  saveData.missions.daily.forEach((key) => {
    if (saveData.missions.dailyDone.includes(key)) return;
    const mission = DAILY_MISSION_POOL.find((m) => m.key === key);
    if (mission && (game.earnedDaily.has(key) || missionRunMatches(mission))) {
      saveData.missions.dailyDone.push(key);
      saveData.coins += mission.rewardCoins;
      saveData.parts += mission.rewardParts;
      completed.push({ label: mission.label, rewardCoins: mission.rewardCoins, rewardParts: mission.rewardParts, kind: 'Daily' });
    }
  });
  saveData.missions.weekly.forEach((key) => {
    if (saveData.missions.weeklyDone.includes(key)) return;
    const mission = WEEKLY_MISSION_POOL.find((m) => m.key === key);
    if (!mission) return;
    const base = saveData.missions.weeklyBaseline[mission.lifetimeKey] || 0;
    const current = saveData.lifetime[mission.lifetimeKey] || 0;
    if (current - base >= mission.target) {
      saveData.missions.weeklyDone.push(key);
      saveData.coins += mission.rewardCoins;
      saveData.parts += mission.rewardParts;
      completed.push({ label: mission.label, rewardCoins: mission.rewardCoins, rewardParts: mission.rewardParts, kind: 'Weekly' });
    }
  });
  return completed;
}

function raceUpgradeSummary() {
  const levels = normalizeUpgrades(saveData.upgrades);
  const keys = Object.keys(UPGRADES);
  const total = keys.reduce((sum, key) => sum + (levels[key] || 1), 0);
  const max = keys.reduce((sum, key) => sum + UPGRADES[key].max, 0);
  const pct = Math.round((total / Math.max(1, max)) * 100);
  return { total, max, pct };
}

function nextRouteUnlockLabel() {
  const best = saveData.bestDistance || 0;
  const next = Object.entries(ROUTES).find(([, route]) => best < (route.unlock || 0));
  if (!next) return 'All routes open';
  const [, route] = next;
  return `${formatSmall(Math.max(0, (route.unlock || 0) - best))}m to ${route.label}`;
}

function raceCommandKey() {
  const upgrades = normalizeUpgrades(saveData.upgrades);
  return [
    saveData.selectedVehicle,
    activeRoute,
    currentGhostStage(),
    activeGhostMode,
    ghostStore.updatedAt || 0,
    Math.floor(saveData.bestDistance || 0),
    currentProgressionMission()?.key || 'done',
    Object.keys(UPGRADES).map((key) => upgrades[key] || 1).join('-')
  ].join('|');
}

function raceCommandHtml() {
  const route = ROUTES[activeRoute];
  const vehicle = selectedVehicle();
  const stats = vehicleStats();
  const mission = currentProgressionMission();
  const upgrades = raceUpgradeSummary();
  const missionText = mission ? mission.label : 'All progression done';
  return `
    <div class="rrRaceCommand RouteCard" data-component="RouteCard" data-rr-command data-rr-command-key="${raceCommandKey()}">
      <span class="gameIconBadge rrRaceCommandBadge"><img class="gameIconBadgeImg" src="/assets/ui/icons/race.png" alt="Race icon" loading="eager" draggable="false"></span>
      <div class="rrRaceVehicleMini">
        <div class="rrRaceVehiclePortrait"><b>${vehicle.cls}</b><span>Car</span></div>
        <div class="rrRaceVehicleCopy">
          <span>Selected Vehicle</span>
          <b>${vehicle.label}</b>
          <small>${route.label} - ${GHOST_MODES[activeGhostMode].label}</small>
        </div>
      </div>
      <div class="rrRaceCommandStats">
        <div><b>${Math.round(stats.topSpeed)}</b><span>Top km/h</span></div>
        <div><b>${formatSmall(saveData.bestDistance)}m</b><span>Best</span></div>
        <div><b>${upgrades.pct}%</b><span>Garage</span></div>
      </div>
      <div class="rrRaceMissionStrip">
        <span>Next Goal</span>
        <b>${missionText}</b>
        <small>${nextRouteUnlockLabel()}</small>
      </div>
    </div>
  `;
}

function refreshRaceCommand() {
  const command = document.querySelector('[data-rr-command]');
  if (!command) return;
  const key = raceCommandKey();
  if (command.dataset.rrCommandKey === key) return;
  command.outerHTML = raceCommandHtml();
}

function resetRun() {
  ensureMissionState(saveData);
  const route = { ...ROUTES[activeRoute] };
  route.terrain = makeTerrainProfile(route);
  const stats = vehicleStats();
  const director = makeDirector(route);
  const stage = currentGhostStage();
  game = {
    route,
    routeKey: activeRoute,
    stage,
    stats,
    mission: currentProgressionMission(),
    x: 80,
    speed: 0,
    fuel: stats.maxFuel,
    distancePx: 0,
    distanceM: 0,
    coins: 0,
    parts: 0,
    tools: 0,
    wear: 0,
    pitch: 0,
    pitchVel: 0,
    suspensionTravel: 0,
    wheelRotation: 0,
    traction: 1,
    elapsed: 0,
    finished: false,
    finishedRoute: false,
    maxKmh: 0,
    earnedProgression: false,
    earnedDaily: new Set(),
    telemetry: null,
    pickups: makePickups(route),
    checkpoints: director.checkpoints,
    hazards: director.hazards,
    samples: [{ t: 0, x: 0, speed: 0 }],
    lastSample: 0,
    message: '',
    finishReason: '',
    eventText: '',
    eventTimer: 0,
    floaters: [],
    boostPulse: 0,
    hazardsCleared: 0,
    usedRepair: false,
    activeGhosts: ghostsForRun(route, stage),
    ghostColors: ['#22c55e', '#f97316', '#e5e7eb']
  };
  game.telemetry = computeTelemetry();
  hidePostRunPanel();
  updateHud();
}

function shellHtml() {
  const tabs = [
    ['drive', 'Drive', 'run'],
    ['garage', 'Garage', 'tune'],
    ['vehicles', 'Vehicles', 'cars'],
    ['routes', 'Routes', 'map'],
    ['missions', 'Missions', 'goals']
  ];
  return `<section class="card roadRunnerShell GamePanel" data-component="GamePanel" data-rr-active-tab="${activeTab}">
    <div class="roadRunnerHeader"><h2>365 Hill Route</h2><p>Drive, repair, upgrade, and unlock vehicles across five routes.</p></div>
    <div class="roadRunnerHud"><div class="roadRunnerStat"><b data-rr-distance>0m</b><span>Distance</span></div><div class="roadRunnerStat"><b data-rr-speed>0 km/h</b><span>Speed</span></div><div class="roadRunnerStat"><b data-rr-fuel>100% · 0m</b><span>Fuel / Next</span></div><div class="roadRunnerStat"><b data-rr-wear>0%</b><span>Wear</span></div><div class="roadRunnerStat"><b data-rr-coins>${formatSmall(saveData.coins)} +0</b><span>Coins / Run</span></div><div class="roadRunnerStat"><b data-rr-parts>${formatSmall(saveData.parts)} +0</b><span>Parts / Run</span></div><div class="roadRunnerStat"><b data-rr-tools>${formatSmall(saveData.tools || 0)} +0</b><span>Tools / Run</span></div><div class="roadRunnerStat"><b data-rr-best>${formatSmall(saveData.bestDistance)}m</b><span>Best</span></div></div>
    ${raceCommandHtml()}
    <nav class="racerInnerNav" data-rr-tabs>${tabs.map(([key, label, meta]) => `<button class="${activeTab === key ? 'active' : ''}" data-rr-tab="${key}" onclick="window.rrSetTab?.('${key}')"><b>${label}</b><span>${meta}</span></button>`).join('')}</nav>
    <div class="racerPages">
      <section class="racerPage ${activeTab === 'drive' ? 'active' : ''}" data-rr-page="drive">
        <div class="roadRunnerGameFrame"><div id="roadRunnerGameHost"><canvas id="roadRunnerCanvas"></canvas></div><div class="roadRunnerOverlay"><div class="roadRunnerBadge" data-rr-route>${ROUTES[activeRoute].label}</div><button class="roadRunnerBadge rrGhostCycle" data-rr-mode data-guide-target="previewGhostRace" onclick="window.rrCycleGhosts?.()" aria-label="Change ghost racers">${GHOST_MODES[activeGhostMode].label}</button><button class="rrRestartRunButton" onclick="window.restartHillRoute?.()" aria-label="Restart run" title="Restart run">↻</button></div><div class="roadRunnerControls"><button class="roadRunnerPedal brake" data-rr-control="brake">BRAKE / REV</button><button class="roadRunnerPedal gas" data-rr-control="gas" data-guide-target="raceBoost">GAS</button></div><div class="roadRunnerEndPanel rrPostRunPanel" hidden data-rr-end-panel></div></div>
      </section>
      <section class="racerPage ${activeTab === 'garage' ? 'active' : ''}" data-rr-page="garage"><div data-road-runner-garage></div></section>
      <section class="racerPage ${activeTab === 'vehicles' ? 'active' : ''}" data-rr-page="vehicles"><div data-road-runner-vehicles></div></section>
      <section class="racerPage ${activeTab === 'routes' ? 'active' : ''}" data-rr-page="routes"><div data-road-runner-routes></div></section>
      <section class="racerPage ${activeTab === 'missions' ? 'active' : ''}" data-rr-page="missions"><div data-road-runner-missions></div></section>
    </div>
  </section>`;
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function updateHud() {
  if (!game) return;
  publishRoadRunnerAssetState();
  refreshRaceCommand();
  const fuelPct = clamp(Math.floor(game.fuel / game.stats.maxFuel * 100), 0, 100);
  const nextFuel = nextFuelMeters();
  setText('[data-rr-distance]', `${Math.floor(game.distanceM)}m`);
  setText('[data-rr-speed]', `${Math.round(game.telemetry.kmh)} km/h`);
  setText('[data-rr-fuel]', `${fuelPct}% · ${nextFuel}m`);
  setText('[data-rr-wear]', `${Math.floor(Math.min(100, game.wear / game.stats.wearLimit * 100))}%`);
  setText('[data-rr-coins]', `${formatSmall(saveData.coins)} +${game.coins}`);
  setText('[data-rr-parts]', `${formatSmall(saveData.parts)} +${game.parts}`);
  setText('[data-rr-tools]', `${formatSmall(saveData.tools || 0)} +${game.tools}`);
  setText('[data-rr-best]', `${formatSmall(saveData.bestDistance)}m`);
  window.__rrHudState = {
    coins: saveData.coins,
    runCoins: game.coins,
    parts: saveData.parts,
    runParts: game.parts,
    tools: saveData.tools || 0,
    runTools: game.tools,
    fuelPct,
    nextFuelMeters: nextFuel,
    speedKmh: game.telemetry.kmh,
    rpm: game.telemetry.rpm,
    gear: game.telemetry.gear,
    gearLabel: game.telemetry.gearLabel,
    topSpeedKmh: game.telemetry.topSpeedKmh,
    speedometerMaxKmh: game.telemetry.speedometerMaxKmh,
    rpmMax: game.telemetry.redlineRpm,
    damageThresholdKmh: DAMAGE_SPEED_KMH
  };
}

function refreshPanels() {
  renderMissionPanel();
  renderVehiclePanel();
  renderGaragePanel();
  renderRoutesPanel();
}

function nextFuelMeters() {
  if (!game) return 0;
  const next = nextFuelTarget();
  return next ? Math.max(0, routeMeters(game.route, next.x - game.x)) : 0;
}

function nextFuelTarget() {
  if (!game) return null;
  const checkpoint = game.checkpoints.find((item) => !item.used && item.type === 'fuelStation' && item.x > game.x);
  const pickup = game.pickups.find((item) => !item.collected && item.type === 'fuel' && item.x > game.x);
  if (checkpoint && pickup) return checkpoint.x < pickup.x ? checkpoint : pickup;
  return checkpoint || pickup || null;
}

function renderMissionPanel() {
  const panel = document.querySelector('[data-road-runner-missions]');
  if (!panel) return;
  const prog = currentProgressionMission();
  const progHtml = prog
    ? `<div class="racerHubCard"><h4>${prog.label}</h4><p>${prog.description}</p><p>Reward: ${prog.rewardCoins} coins / ${prog.rewardParts} parts</p><p>Status: ${game && game.mission && game.mission.key === prog.key && (game.earnedProgression || missionRunMatches(prog)) ? 'Ready - finish run to collect' : 'In progress'}</p></div>`
    : `<div class="racerHubCard"><h4>All Progression Missions Complete</h4><p>You have completed every progression contract.</p></div>`;
  const dailyCards = saveData.missions.daily.map((key) => {
    const mission = DAILY_MISSION_POOL.find((m) => m.key === key);
    if (!mission) return '';
    const done = saveData.missions.dailyDone.includes(key);
    const earned = !done && game && game.earnedDaily.has(key);
    return `<div class="racerHubCard"><h4>${mission.label}</h4><p>${mission.description}</p><p>Reward: ${mission.rewardCoins} coins / ${mission.rewardParts} parts</p><p>Status: ${done ? 'Completed' : earned ? 'Ready - finish run to collect' : 'In progress'}</p></div>`;
  }).join('');
  const weeklyCards = saveData.missions.weekly.map((key) => {
    const mission = WEEKLY_MISSION_POOL.find((m) => m.key === key);
    if (!mission) return '';
    const done = saveData.missions.weeklyDone.includes(key);
    const base = saveData.missions.weeklyBaseline[mission.lifetimeKey] || 0;
    const current = saveData.lifetime[mission.lifetimeKey] || 0;
    const progress = Math.min(mission.target, Math.max(0, current - base));
    return `<div class="racerHubCard"><h4>${mission.label}</h4><p>${mission.description}</p><p>Reward: ${mission.rewardCoins} coins / ${mission.rewardParts} parts</p><p>Status: ${done ? 'Completed' : `${progress} / ${mission.target}`}</p></div>`;
  }).join('');
  panel.innerHTML = `<h3 class="racerPageTitle">Progression</h3><div class="racerHubCards">${progHtml}</div><h3 class="racerPageTitle">Daily Missions - resets in ${formatTimeRemaining(nextDailyResetAt())}</h3><div class="racerHubCards">${dailyCards}</div><h3 class="racerPageTitle">Weekly Missions - resets in ${formatTimeRemaining(nextWeeklyResetAt())}</h3><div class="racerHubCards">${weeklyCards}</div>`;
}

function renderVehiclePanel() {
  const panel = document.querySelector('[data-road-runner-vehicles]');
  if (!panel) return;
  const filterBar = VEHICLE_FILTERS.map((key) => `<button class="btn ${activeVehicleFilter === key ? 'primary' : 'ghost'}" onclick="window.rrSetVehicleFilter?.('${key}')">${key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)}</button>`).join('');
  const cards = Object.entries(VEHICLES).filter(([, item]) => activeVehicleFilter === 'all' || item.cls === activeVehicleFilter).map(([key, item]) => vehicleCard(key, item)).join('');
  panel.innerHTML = `<h3 class="racerPageTitle">Vehicles</h3><div class="roadRunnerModeGrid">${filterBar}</div><div class="roadRunnerVehicleGrid">${cards}</div>`;
}

function vehicleCard(key, item) {
  const unlocked = saveData.unlockedVehicles.includes(key);
  const selected = saveData.selectedVehicle === key;
  const canUnlock = saveData.coins >= item.unlock.coins && saveData.parts >= item.unlock.parts;
  const action = unlocked ? `window.selectRoadRunnerVehicle?.('${key}')` : `window.unlockRoadRunnerVehicle?.('${key}')`;
  const img = ASSET_PATHS[item.asset];
  return `<div class="roadRunnerVehicleCard ${selected ? 'selected' : ''}"><div class="vehicleThumb">${img ? `<img class="racerVehicleSprite" src="${img}" alt="${item.label}" loading="lazy" draggable="false">` : ''}</div><h4>${item.label}</h4><p>${item.description}</p><div class="vehicleStats">SPD ${item.speed.toFixed(2)} • FUEL ${item.fuel.toFixed(2)} • DUR ${item.durability.toFixed(2)}</div><button class="btn ${selected ? 'gold' : unlocked || canUnlock ? 'primary' : 'ghost'}" ${selected || (!unlocked && !canUnlock) ? 'disabled' : ''} onclick="${action}">${selected ? 'Selected' : unlocked ? 'Select' : canUnlock ? `Unlock ${formatSmall(item.unlock.coins)}C / ${item.unlock.parts}P` : `Locked ${formatSmall(item.unlock.coins)}C / ${item.unlock.parts}P`}</button></div>`;
}

function renderRoutesPanel() {
  const panel = document.querySelector('[data-road-runner-routes]');
  if (!panel) return;
  const cards = Object.entries(ROUTES).map(([key, route]) => routeCard(key, route)).join('');
  panel.innerHTML = `<h3 class="racerPageTitle">Routes</h3><div class="roadRunnerVehicleGrid">${cards}</div>`;
}

function routeCard(key, route) {
  const unlocked = routeUnlocked(key);
  const selected = activeRoute === key;
  const action = unlocked ? `window.setHillRoute?.('${key}')` : '';
  return `<div class="roadRunnerVehicleCard ${selected ? 'selected' : ''}"><h4>${route.label}</h4><p>Length ${route.meters}m • Reward x${route.reward.toFixed(2)} • Difficulty ${route.difficulty.toFixed(2)}</p><div class="vehicleStats">${unlocked ? 'Unlocked' : `Unlock at ${route.unlock}m best distance`}</div><button class="btn ${selected ? 'gold' : unlocked ? 'primary' : 'ghost'}" ${selected || !unlocked ? 'disabled' : ''} onclick="${action}">${selected ? 'Selected' : unlocked ? 'Select' : `Locked - ${route.unlock}m`}</button></div>`;
}

function renderGaragePanel() {
  const panel = document.querySelector('[data-road-runner-garage]');
  if (!panel) return;
  panel.innerHTML = `<h3 class="racerPageTitle">Garage Upgrades</h3><div class="roadRunnerWalletRow"><div class="roadRunnerWalletPill">Coins: ${formatSmall(saveData.coins)}</div><div class="roadRunnerWalletPill">Parts: ${formatSmall(saveData.parts)}</div><div class="roadRunnerWalletPill">Tools: ${formatSmall(saveData.tools || 0)}</div></div><div class="roadRunnerGarageGrid">${Object.entries(UPGRADES).map(([key, item]) => upgradeCard(key, item)).join('')}</div>`;
}

function upgradeCard(key, item) {
  const level = saveData.upgrades[key] || 1;
  const maxed = level >= item.max;
  const cost = upgradeCost(key, level);
  const canBuy = !maxed && saveData.coins >= cost.coins && saveData.parts >= cost.parts;
  return `<div class="roadRunnerUpgradeCard"><h4>${item.label} Lv.${level}</h4><p>${item.description}</p><div class="roadRunnerUpgradeMeta"><span>${maxed ? 'Max' : `Next Lv.${level + 1}`}</span><span>${maxed ? 'MAX' : `${formatSmall(cost.coins)} coins - ${cost.parts} parts`}</span></div><button class="btn ${canBuy ? 'primary' : 'ghost'}" ${canBuy ? '' : 'disabled'} onclick="window.buyRoadRunnerUpgrade?.('${key}')">${maxed ? 'Maxed' : 'Upgrade'}</button></div>`;
}

function showPostRunPanel(completed, reason, bonus, missionRewards) {
  const panel = document.querySelector('[data-rr-end-panel]');
  if (!panel || !game) return;
  const pct = Math.min(100, Math.floor(game.distancePx / game.route.length * 100));
  const wearPct = Math.floor(Math.min(100, game.wear / game.stats.wearLimit * 100));
  const stars = completed && wearPct < 40 ? 3 : completed || wearPct < 75 ? 2 : 1;
  const title = completed ? 'Route Complete' : reason === 'wear' ? 'Vehicle Worn Out' : 'Out of Fuel';
  const subtitle = completed ? `${game.route.label} finished` : `${game.route.label} - ${pct}% complete`;
  const starAsset = '/assets/vendor/kenney/kenney_ui-pack/Vector/Yellow/star.svg';
  const emptyStarAsset = '/assets/vendor/kenney/kenney_ui-pack/Vector/Grey/star_outline.svg';
  const starHtml = Array.from({ length: 3 }, (_, index) => `<img src="${index < stars ? starAsset : emptyStarAsset}" alt="">`).join('');
  const rewardTile = ({ type, amount, label, detail = '' }) => {
    const icon = { coins: ASSET_PATHS.coin, parts: ASSET_PATHS.parts, tools: ASSET_PATHS.tools }[type] || ASSET_PATHS.coin;
    return `<div class="rrPostRunReward" data-rr-reward="${type}">
      <img class="rrPostRunRewardIcon" src="${icon}" alt="">
      <div class="rrPostRunRewardCopy"><b>+${formatSmall(amount)}</b><span>${label}</span>${detail ? `<small>${detail}</small>` : ''}</div>
    </div>`;
  };
  const missionBuckets = missionRewards.reduce((buckets, reward) => {
    const key = reward.kind || 'Mission';
    if (!buckets[key]) buckets[key] = { kind: key, coins: 0, parts: 0 };
    buckets[key].coins += reward.rewardCoins || 0;
    buckets[key].parts += reward.rewardParts || 0;
    return buckets;
  }, {});
  const missionHtml = Object.values(missionBuckets).map((reward) => {
    const primaryType = reward.coins > 0 ? 'coins' : 'parts';
    const primaryAmount = reward.coins > 0 ? reward.coins : reward.parts;
    const kindLabel = { Progression: 'Prog', Daily: 'Day', Weekly: 'Week' }[reward.kind] || reward.kind;
    const detailText = reward.coins > 0 && reward.parts > 0 ? `+${formatSmall(reward.parts)}P` : '';
    return primaryAmount > 0 ? rewardTile({ type: primaryType, amount: primaryAmount, label: `${kindLabel} Bonus`, detail: detailText }) : '';
  }).join('');
  const rewardHtml = [
    rewardTile({ type: 'coins', amount: game.coins, label: 'Run Coins' }),
    rewardTile({ type: 'coins', amount: bonus, label: 'Bonus' }),
    rewardTile({ type: 'parts', amount: game.parts, label: 'Parts' }),
    game.tools > 0 ? rewardTile({ type: 'tools', amount: game.tools, label: 'Tools' }) : '',
    missionHtml
  ].join('');
  const retryIcon = '/assets/vendor/kenney/kenney_ui-pack/Vector/Extra/icon_repeat_light.svg';
  const garageIcon = ASSET_PATHS.mechanicShop;
  const missionsIcon = '/assets/vendor/kenney/kenney_ui-pack/Vector/Yellow/icon_checkmark.svg';
  panel.innerHTML = `<div class="rrPostRunHero"><div class="rrPostRunStars">${starHtml}</div><div class="rrPostRunPlace">${pct}%</div><div class="rrPostRunHeading"><h3 class="rrPostRunTitle">${title}</h3><p class="rrPostRunSubtitle">${subtitle}</p></div></div><div class="rrPostRunGrid">${rewardHtml}</div><div class="rrPostRunDetails"><div class="rrPostRunDetail"><b>${Math.floor(game.distanceM)}m</b>Distance</div><div class="rrPostRunDetail"><b>${Math.round(game.maxKmh)} km/h</b>Top Speed</div><div class="rrPostRunDetail"><b>${wearPct}%</b>Wear</div><div class="rrPostRunDetail"><b>${formatSmall(saveData.bestDistance)}m</b>Best Distance</div></div><div class="rrPostRunActions"><button class="rrPostRunActionRetry" onclick="window.restartHillRoute?.()" aria-label="Retry route"><img class="rrPostRunActionIcon" src="${retryIcon}" alt=""><span>Retry</span></button><button class="primary rrPostRunActionGarage" onclick="window.rrSetTab?.('garage')" aria-label="Open garage"><img class="rrPostRunActionIcon" src="${garageIcon}" alt=""><span>Garage</span></button><button class="gold rrPostRunActionMissions" onclick="window.rrSetTab?.('missions')" aria-label="Open missions"><img class="rrPostRunActionIcon" src="${missionsIcon}" alt=""><span>Missions</span></button></div>`;
  panel.hidden = false;
}

function hidePostRunPanel() {
  const panel = document.querySelector('[data-rr-end-panel]');
  if (panel) panel.hidden = true;
}

function draw() {
  if (!canvas || !ctx || !game) return;
  const width = canvas.width;
  const height = canvas.height;
  const route = game.route;
  const cameraX = clamp(game.x - width * 0.34, 0, Math.max(0, route.length - width + 260));
  drawBackground(width, height, route, cameraX);
  drawRoad(width, height, route, cameraX);
  drawSpeedStreaks(width, height, route, cameraX);
  drawHazards(width, height, route, cameraX);
  drawCheckpoints(width, height, route, cameraX);
  drawMilestoneCheckpoints(width, height, route, cameraX);
  drawPickups(width, height, route, cameraX);
  drawGhosts(width, height, route, cameraX);
  drawPlayer(width, height, route, cameraX);
  drawFinish(width, height, route, cameraX);
  drawNextFuelGuide(width, height, route, cameraX);
  drawFloatingRewards(width, height, route, cameraX);
  drawProblemWarning(width, height);
  drawRunMeters(width, height);
}

function drawBackground(width, height, route, cameraX) {
  const bg = images[route.bgAsset];
  if (bg?.ready && bg.naturalWidth > 0) {
    const scale = height / Math.max(1, bg.naturalHeight);
    const drawW = Math.max(width, bg.naturalWidth * scale);
    const parallax = (cameraX * 0.09) % drawW;
    for (let x = -parallax; x < width + drawW; x += drawW) {
      ctx.drawImage(bg, x, 0, drawW, height);
    }
    return;
  }

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, route.skyA);
  sky.addColorStop(0.58, route.skyB);
  sky.addColorStop(0.59, route.grass);
  sky.addColorStop(1, '#2f8f3f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
  for (let worldX = Math.floor(cameraX / 520) * 520 - 200; worldX < cameraX + width + 520; worldX += 520) {
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#fff';
    roundedCloud(worldX - cameraX, 52 + (worldX % 110));
    ctx.globalAlpha = 1;
  }
}

function roundedCloud(x, y) {
  ctx.beginPath();
  ctx.arc(x, y + 8, 22, 0, Math.PI * 2);
  ctx.arc(x + 26, y, 28, 0, Math.PI * 2);
  ctx.arc(x + 58, y + 10, 20, 0, Math.PI * 2);
  ctx.fill();
}

function drawRoad(width, height, route, cameraX) {
  const start = Math.max(0, cameraX - 80);
  const end = Math.min(route.length + 260, cameraX + width + 140);
  const roadSprite = images.roadStrip;
  if (roadSprite?.ready && roadSprite.naturalWidth > 0) {
    const spacing = route.profile === 'track' ? 154 : 132;
    const spriteW = route.profile === 'track' ? 236 : 210;
    const spriteH = route.profile === 'track' ? 58 : 52;
    ctx.save();
    for (let worldX = Math.floor(start / spacing) * spacing - spacing; worldX <= end + spacing; worldX += spacing) {
      const x = worldX - cameraX;
      const y = routeY(route, worldX, height);
      const angle = routeAngle(route, worldX, height) * 0.72;
      ctx.save();
      ctx.translate(x + spriteW * 0.44, y + 1);
      ctx.rotate(angle);
      ctx.drawImage(roadSprite, -spriteW * 0.55, -spriteH * 0.47, spriteW, spriteH);
      ctx.restore();
    }
    ctx.restore();
    return;
  }

  ctx.fillStyle = route.grass;
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let worldX = start; worldX <= end; worldX += 18) ctx.lineTo(worldX - cameraX, routeY(route, worldX, height) + 38);
  ctx.lineTo(end - cameraX, height);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = route.road;
  ctx.lineWidth = route.profile === 'track' ? 34 : 28;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let worldX = start; worldX <= end; worldX += 14) {
    const x = worldX - cameraX;
    const y = routeY(route, worldX, height);
    if (worldX === start) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(248,250,252,.62)';
  ctx.lineWidth = 4;
  for (let worldX = Math.floor(start / 120) * 120; worldX <= end; worldX += 120) {
    ctx.beginPath();
    ctx.moveTo(worldX - cameraX, routeY(route, worldX, height) - 1);
    ctx.lineTo(worldX + 58 - cameraX, routeY(route, worldX + 58, height) - 1);
    ctx.stroke();
  }
}

function drawSpeedStreaks(width, height, route, cameraX) {
  const kmh = game.telemetry?.kmh || 0;
  const intensity = clamp((kmh - 95) / 170, 0, 1);
  if (intensity <= 0.02) return;
  const streakSprite = images.speedStreaks;
  ctx.save();
  ctx.globalAlpha = 0.1 + intensity * 0.28;
  if (streakSprite?.ready && streakSprite.naturalWidth > 0) {
    const baseX = game.x - cameraX - 30;
    const roadY = routeY(route, game.x, height);
    for (let i = 0; i < 7; i += 1) {
      const offsetSeed = seededNoise(game.elapsed * 420 + i * 83, route.seed + 91);
      const x = baseX - 58 - i * 35 - offsetSeed * 42;
      const y = roadY - 62 + (i % 4) * 18 + offsetSeed * 12;
      const len = 58 + intensity * 62 + offsetSeed * 18;
      if (x < -100 || x > width + 60) continue;
      ctx.drawImage(streakSprite, x - len, y - 10, len, 22);
    }
    ctx.restore();
    return;
  }

  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 1.5 + intensity * 1.5;
  ctx.lineCap = 'round';
  const baseX = game.x - cameraX - 30;
  const roadY = routeY(route, game.x, height);
  for (let i = 0; i < 7; i += 1) {
    const offsetSeed = seededNoise(game.elapsed * 420 + i * 83, route.seed + 91);
    const x = baseX - 45 - i * 36 - offsetSeed * 42;
    const y = roadY - 54 + (i % 4) * 18 + offsetSeed * 12;
    const len = 24 + intensity * 42 + offsetSeed * 20;
    if (x < -80 || x > width + 40) continue;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - len, y + Math.sin(game.pitch) * 8);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHazards(width, height, route, cameraX) {
  for (const hazard of game.hazards) {
    const x = hazard.x - cameraX;
    if (x < -120 || x > width + 120) continue;
    const y = routeY(route, hazard.x, height) + 4;
    ctx.fillStyle = hazard.type === 'mud' ? 'rgba(101,67,33,.75)' : hazard.type === 'gravel' ? 'rgba(203,213,225,.75)' : hazard.type === 'rough' ? 'rgba(100,116,139,.75)' : 'rgba(15,23,42,.82)';
    ctx.beginPath();
    ctx.ellipse(x + hazard.length / 2, y, hazard.length / 2, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    drawOutlinedText(hazard.type.toUpperCase(), x + hazard.length / 2, y - 18, '10px');
  }
}

function drawCheckpoints(width, height, route, cameraX) {
  for (const item of game.checkpoints) {
    const x = item.x - cameraX;
    if (x < -120 || x > width + 120) continue;
    const y = routeY(route, item.x, height) - 76;
    const img = images[item.type];
    if (img && img.ready) ctx.drawImage(img, x - 42, y - 34, 84, 68);
    else {
      ctx.fillStyle = item.type === 'fuelStation' ? '#22c55e' : item.type === 'partsStore' ? '#f97316' : item.type === 'mechanicShop' ? '#2563eb' : '#94a3b8';
      ctx.fillRect(x - 34, y - 24, 68, 48);
    }
    const label = item.type === 'fuelStation' ? 'FUEL STOP' : item.type === 'partsStore' ? 'PARTS STORE' : item.type === 'mechanicShop' ? 'MECHANIC' : 'SALVAGE';
    drawOutlinedText(item.used ? 'USED' : label, x, y - 40, '10px');
  }
}

function drawMilestoneCheckpoints(width, height, route, cameraX) {
  const milestones = [0.25, 0.5, 0.75, 1];
  const flagSprite = images.checkpointFlag;
  for (const pct of milestones) {
    const worldX = 80 + route.length * pct;
    const x = worldX - cameraX;
    if (x < -90 || x > width + 90) continue;
    const y = routeY(route, worldX, height) - 76;
    const reached = game.distancePx >= route.length * pct;
    ctx.save();
    ctx.globalAlpha = reached ? 1 : 0.58;
    if (flagSprite?.ready && flagSprite.naturalWidth > 0) {
      ctx.drawImage(flagSprite, x - 29, y - 28, 58, 54);
      ctx.fillStyle = '#06131d';
      ctx.font = '900 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(pct * 100)}%`, x + 8, y - 8);
      ctx.restore();
      continue;
    }

    ctx.fillStyle = reached ? '#35e58a' : '#ffd166';
    roundRect(x - 29, y - 22, 58, 28, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(4,17,29,.72)';
    ctx.lineWidth = 3;
    roundRect(x - 29, y - 22, 58, 28, 10);
    ctx.stroke();
    ctx.fillStyle = '#06131d';
    ctx.font = '900 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(pct * 100)}%`, x, y - 4);
    ctx.fillStyle = '#082033';
    roundRect(x - 3, y + 4, 6, 46, 3);
    ctx.fill();
    ctx.restore();
  }
}

function drawPickups(width, height, route, cameraX) {
  for (const pickup of game.pickups) {
    if (pickup.collected) continue;
    const x = pickup.x - cameraX;
    if (x < -60 || x > width + 60) continue;
    const y = routeY(route, pickup.x, height) - 34 + (pickup.yOffset || 0);
    const img = images[pickup.type];
    const size = pickup.type === 'coin' ? 32 : 40;
    if (img && img.ready) ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
    else {
      ctx.fillStyle = pickup.type === 'fuel' ? '#38bdf8' : pickup.type === 'parts' ? '#a78bfa' : pickup.type === 'tools' ? '#f97316' : '#facc15';
      ctx.beginPath();
      ctx.arc(x, y, size / 2 - 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawGhosts(width, height, route, cameraX) {
  const keys = ['ghostA', 'ghostB', 'ghostC'];
  const ghosts = game.activeGhosts || [];
  for (let i = 0; i < ghosts.length; i++) {
    const ghost = ghosts[i];
    const point = ghostPoint(ghost, height);
    const x = point.x - cameraX;
    if (x < -100 || x > width + 120) continue;
    const imageKey = images[ghost.carKey]?.ready ? ghost.carKey : keys[i] || 'ghostA';
    const label = ghost.source === 'local_best' ? 'Best Ghost' : ghost.playerName || `Computer ${i + 1}`;
    drawCar(x, point.y, routeAngle(route, point.x, height) * 0.65, images[imageKey], label, 0.5, game.ghostColors[i] || '#e5e7eb');
  }
}

function ghostPoint(ghost, height) {
  const route = game.route;
  const sample = sampleGhostAt(ghost, game.elapsed * 1000);
  const x = 80 + Math.max(0, sample.x || 0);
  return { x, y: routeY(route, x, height) - 30, speed: sample.speed || 0 };
}

function drawPlayer(width, height, route, cameraX) {
  const x = game.x - cameraX;
  const y = routeY(route, game.x, height) - 30;
  drawBoostGlow(x, y);
  drawCar(x, y, game.pitch, images[selectedVehicle().asset], 'You', 1, '#3b82f6');
}

function drawBoostGlow(x, y) {
  const speedRatio = clamp(Math.abs(game.speed) / Math.max(1, game.stats.topSpeed), 0, 1);
  const glow = clamp((input.gas ? 0.34 : 0) + speedRatio * 0.32 + (game.boostPulse || 0), 0, 1);
  if (glow <= 0.04) return;
  ctx.save();
  ctx.globalAlpha = glow;
  const pulse = 1 + Math.sin(game.elapsed * 20) * 0.08;
  const boostSprite = images.boostRing;
  if (boostSprite?.ready && boostSprite.naturalWidth > 0) {
    ctx.translate(x - 28, y + 17);
    ctx.rotate(game.pitch * 0.22);
    ctx.drawImage(boostSprite, -82 * pulse, -38 * pulse, 164 * pulse, 76 * pulse);
    ctx.restore();
    return;
  }

  const grad = ctx.createRadialGradient(x - 36, y + 18, 4, x - 36, y + 18, 68 * pulse);
  grad.addColorStop(0, 'rgba(109,255,159,.65)');
  grad.addColorStop(0.42, 'rgba(56,189,248,.32)');
  grad.addColorStop(1, 'rgba(56,189,248,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x - 26, y + 17, 82 * pulse, 30 * pulse, game.pitch * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCar(x, y, angle, img, label, alpha, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  const hasSprite = Boolean(img && img.ready);
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 48, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  if (hasSprite) {
    const aspect = Math.max(0.6, Math.min(2.4, img.naturalWidth / Math.max(1, img.naturalHeight)));
    const targetW = alpha < 1 ? 88 : 100;
    const targetH = clamp(targetW / aspect, 46, 76);
    ctx.drawImage(img, -targetW / 2, 27 - targetH, targetW, targetH);
  } else {
    ctx.fillStyle = color;
    roundRect(-36, -15, 72, 30, 9);
    ctx.fill();
    ctx.strokeStyle = '#172033';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  if (!hasSprite) {
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-28, 18 + game.suspensionTravel);
    ctx.lineTo(-28, 30);
    ctx.moveTo(28, 18 - game.suspensionTravel);
    ctx.lineTo(28, 30);
    ctx.stroke();
    drawWheelSpinOverlay(game.wheelRotation + x * 0.01, alpha);
  }
  ctx.restore();
  drawOutlinedText(label, x, y - (alpha >= 1 ? 58 : 46), '11px', alpha);
}

function drawWheelSpinOverlay(rotation, alpha = 1) {
  const wheelY = 22;
  const traction = game?.traction ?? 1;
  const stroke = traction < 0.82 ? '#facc15' : '#e0f2fe';
  for (const wheelX of [-30, 29]) {
    ctx.save();
    ctx.translate(wheelX, wheelY);
    ctx.rotate(rotation);
    ctx.globalAlpha = 0.28 * alpha + (1 - traction) * 0.34;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0.18, Math.PI * 1.25);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(8, 0);
    ctx.moveTo(0, -8);
    ctx.lineTo(0, 8);
    ctx.stroke();
    ctx.restore();
  }
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function drawOutlinedText(text, x, y, size = '11px', alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#fff';
  ctx.font = `900 ${size} Arial`;
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
  ctx.globalAlpha = 1;
}

function drawFinish(width, height, route, cameraX) {
  const x = route.length - cameraX;
  if (x < -20 || x > width + 30) return;
  const y = routeY(route, route.length, height);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x - 5, y - 70, 10, 90);
  ctx.fillStyle = '#111827';
  for (let i = 0; i < 6; i++) ctx.fillRect(x - 5 + (i % 2) * 5, y - 70 + i * 10, 5, 10);
}

function drawNextFuelGuide(width, height, route, cameraX) {
  const target = nextFuelTarget();
  if (!target) return;
  const meters = routeMeters(route, target.x - game.x);
  if (meters <= 0 || meters > 650) return;
  const targetX = target.x - cameraX;
  const onScreen = targetX >= 36 && targetX <= width - 36;
  const x = onScreen ? targetX : width - 42;
  const y = Math.max(92, Math.min(height - 134, routeY(route, game.x + Math.min(520, target.x - game.x), height) - 88));
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = 'rgba(2, 14, 24, .72)';
  roundRect(x - 34, y - 18, 68, 34, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(125, 220, 255, .65)';
  ctx.lineWidth = 1;
  ctx.stroke();
  const img = images.fuel;
  if (img && img.ready) ctx.drawImage(img, x - 28, y - 11, 22, 22);
  ctx.fillStyle = '#e0faff';
  ctx.font = '900 9px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`${meters}m`, x - 2, y + 4);
  if (!onScreen) {
    ctx.beginPath();
    ctx.moveTo(x + 27, y);
    ctx.lineTo(x + 18, y - 7);
    ctx.lineTo(x + 18, y + 7);
    ctx.closePath();
    ctx.fillStyle = '#7ddcff';
    ctx.fill();
  }
  ctx.restore();
}

function drawRunMeters(width, height) {
  const fuelPct = game.fuel / game.stats.maxFuel;
  const wearPct = Math.min(1, game.wear / game.stats.wearLimit);
  const lowFuelY = width <= 430 ? 154 : 124;
  drawBar(14, 42, 154, 15, 'Fuel', fuelPct);
  drawBar(14, 62, 154, 15, 'Wear', wearPct, true);
  if (game.fuel / game.stats.maxFuel < 0.18 && nextFuelMeters() > 220) drawOutlinedText('LOW FUEL - COAST OR FIND STATION', width / 2, lowFuelY, '13px');
}

function drawProblemWarning(width, height) {
  if (!game.eventTimer || game.eventTimer <= 0 || !game.eventText) return;
  const danger = /slow|hazard|pothole|mud|gravel|rough|out|low|worn/i.test(game.eventText);
  const w = Math.min(width - 28, 304);
  const h = 42;
  const x = (width - w) / 2;
  const collectionSafeY = width <= 430 ? 148 : 122;
  const y = clamp(collectionSafeY, 88, Math.max(88, height - 168));
  const alpha = clamp(game.eventTimer / 0.25, 0, 1);
  ctx.save();
  ctx.globalAlpha = alpha;
  const panelSprite = images.warningPanel;
  const badgeSprite = images.warningBadge;
  if (panelSprite?.ready && panelSprite.naturalWidth > 0) {
    ctx.drawImage(panelSprite, x, y, w, h);
    if (badgeSprite?.ready && badgeSprite.naturalWidth > 0) ctx.drawImage(badgeSprite, x + 8, y + 7, 32, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 13px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(game.eventText, x + 48, y + 17);
    ctx.fillStyle = '#bfe9f5';
    ctx.font = '800 9px Arial';
    ctx.fillText(danger ? 'React fast to protect wear and speed.' : 'Reward collected during the run.', x + 48, y + 31);
    ctx.restore();
    return;
  }

  ctx.fillStyle = danger ? 'rgba(89,22,32,.88)' : 'rgba(4,31,49,.86)';
  roundRect(x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = danger ? '#ffd166' : '#7ddcff';
  ctx.lineWidth = 3;
  roundRect(x, y, w, h, 16);
  ctx.stroke();
  ctx.fillStyle = danger ? '#ffd166' : '#6dff9f';
  roundRect(x + 8, y + 8, 31, 26, 10);
  ctx.fill();
  ctx.fillStyle = '#06131d';
  ctx.font = '900 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(danger ? '!' : '+', x + 23.5, y + 28);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 13px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(game.eventText, x + 48, y + 17);
  ctx.fillStyle = '#bfe9f5';
  ctx.font = '800 9px Arial';
  ctx.fillText(danger ? 'React fast to protect wear and speed.' : 'Reward collected during the run.', x + 48, y + 31);
  ctx.restore();
}

function spawnFloatingReward(text, color = '#ffffff', worldX = game?.x || 80, yOffset = -72) {
  if (!game) return;
  game.floaters.push({ text, color, x: worldX, yOffset, life: 1 });
}

function drawFloatingRewards(width, height, route, cameraX) {
  for (const floater of game.floaters || []) {
    const x = floater.x - cameraX;
    if (x < -80 || x > width + 80) continue;
    const age = 1 - floater.life;
    const y = routeY(route, floater.x, height) + floater.yOffset - age * 36;
    ctx.save();
    ctx.globalAlpha = clamp(floater.life, 0, 1);
    ctx.font = '900 18px Arial';
    ctx.textAlign = 'center';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#06131d';
    ctx.strokeText(floater.text, x, y);
    ctx.fillStyle = floater.color;
    ctx.fillText(floater.text, x, y);
    ctx.restore();
  }
}

function drawBar(x, y, width, height, label, pct, dangerHigh = false) {
  const value = clamp(pct, 0, 1);
  const actualHeight = Math.max(15, height);
  const pad = 3;
  const gap = 3;
  const segments = 5;
  const cellW = (width - pad * 2 - gap * (segments - 1)) / segments;
  const colors = dangerHigh
    ? ['#26e872', '#a9f43c', '#ffe05f', '#ff8f1f', '#ff4667']
    : ['#ff4667', '#ff8f1f', '#ffe05f', '#a9f43c', '#26e872'];

  ctx.save();
  ctx.fillStyle = 'rgba(4,17,29,.82)';
  roundRect(x, y, width, actualHeight, actualHeight / 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  roundRect(x + 3, y + 2, width - 6, 4, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.34)';
  ctx.lineWidth = 1.5;
  roundRect(x + 0.75, y + 0.75, width - 1.5, actualHeight - 1.5, actualHeight / 2);
  ctx.stroke();

  for (let i = 0; i < segments; i += 1) {
    const sx = x + pad + i * (cellW + gap);
    const sy = y + pad;
    const sh = actualHeight - pad * 2;
    const fill = clamp(value * segments - i, 0, 1);
    ctx.globalAlpha = 0.30;
    ctx.fillStyle = colors[i];
    roundRect(sx, sy, cellW, sh, 4);
    ctx.fill();
    ctx.globalAlpha = 1;
    if (fill > 0) {
      ctx.fillStyle = colors[i];
      roundRect(sx, sy, cellW * fill, sh, 4);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.44)';
      roundRect(sx + 2, sy + 1, Math.max(0, cellW * fill - 4), 3, 2);
      ctx.fill();
    }
  }

  const needleX = x + clamp(value, 0.02, 0.98) * width;
  ctx.fillStyle = '#ffe08a';
  roundRect(needleX - 2.5, y - 3, 5, actualHeight + 6, 3);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#fff';
  ctx.font = '800 9px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(label, x + width + 6, y + 10);
}

function activeHazard() {
  return game.hazards.find((hazard) => game.x >= hazard.x && game.x <= hazard.x + hazard.length);
}

function triggerEvent(text) {
  game.eventText = text;
  game.eventTimer = 1.2;
}

function hazardDamage(hazard) {
  if (!hazard) return { slow: 1, wear: 0 };
  return calculateHazardEffect({
    type: hazard.type,
    kmh: game.telemetry.kmh,
    braking: input.brake,
    suspensionLevel: saveData.upgrades.suspension
  });
}

function update(dt) {
  if (!game || game.finished) return;
  const height = canvas.height;
  const route = game.route;
  const previousX = game.x;
  const targetPitch = routeAngle(route, game.x, height);
  const slope = Math.sin(targetPitch);
  const hazard = activeHazard();
  const hazardEffect = hazardDamage(hazard);
  if (hazard && !hazard.hit) {
    hazard.hit = true;
    game.hazardsCleared += 1;
    triggerEvent(`${hazard.type.toUpperCase()} - slow down!`);
  }

  const speedRatio = clamp(Math.abs(game.speed) / game.stats.topSpeed, 0, 1);
  const rearPitch = routeAngle(route, Math.max(0, game.x - 42), height);
  const frontPitch = routeAngle(route, game.x + 42, height);
  const terrainChatter = clamp(Math.abs(frontPitch - rearPitch) * 1.75 + (hazard ? 0.16 : 0), 0, 1);
  const tractionPenalty = terrainChatter * clamp(1.08 - game.stats.grip * 0.62, 0.04, 0.42);
  const tractionFactor = clamp(1 - tractionPenalty, 0.68, 1);
  game.traction += (tractionFactor - game.traction) * Math.min(1, dt * 8);
  const lowSpeedGrip = 1 + Math.max(0, 0.38 - speedRatio) * game.stats.grip;
  const powerBand = 1 - Math.pow(speedRatio, 2.15) * 0.38;
  const launchTorque = 1 + Math.pow(Math.max(0, 1 - speedRatio), 1.15) * game.stats.launchBonus;
  const rangePull = speedRatio < 0.72 ? game.stats.midRangePull : game.stats.topEndPull;
  const hillTorque = 1 + Math.max(0, slope) * (0.8 + (game.stats.climb - 1) * 3.2);
  const gasForce = input.gas && game.fuel > 0 ? game.stats.acceleration * hillTorque * powerBand * launchTorque * rangePull * lowSpeedGrip * game.traction : 0;
  const gravityForce = -slope * 28 / game.stats.climb;
  const rollingDrag = game.stats.drag + Math.abs(game.speed) * 0.0065;
  if (gasForce > 0) {
    game.speed += gasForce * dt;
    game.fuel -= game.stats.fuelUse * dt * (1 + Math.max(0, slope) * 0.55 + speedRatio * 0.18);
    game.boostPulse = Math.min(0.8, (game.boostPulse || 0) + dt * 0.65);
  }
  game.speed += gravityForce * dt;
  if (input.brake) {
    if (game.speed > 8) game.speed -= game.stats.brakePower * dt;
    else if (game.x > 82) game.speed -= game.stats.reverseTop * dt;
  }
  if (game.speed > 0) game.speed -= rollingDrag * dt;
  if (game.speed < 0) game.speed += rollingDrag * 0.55 * dt;
  game.speed = clamp(game.speed, -game.stats.reverseTop, game.stats.topSpeed);
  const hazardMoveFactor = hazardEffect.slow + (1 - hazardEffect.slow) * game.stats.hazardSpeedResistance;
  game.x += game.speed * dt * hazardMoveFactor;
  game.x = Math.max(80, game.x);
  const actualSpeed = dt > 0 ? (game.x - previousX) / dt : game.speed * hazardEffect.slow;
  game.wheelRotation = (game.wheelRotation + (actualSpeed * dt) / 16) % (Math.PI * 2);
  game.distancePx = Math.max(0, game.x - 80);
  game.distanceM = routeMeters(route, game.distancePx);

  game.pitchVel += (targetPitch - game.pitch) * game.stats.spring * dt;
  game.pitchVel -= game.pitchVel * game.stats.damping * dt;
  game.pitch += game.pitchVel * dt;
  game.suspensionTravel = Math.sin(game.elapsed * 18) * Math.min(6, Math.abs(game.speed) / 38) + targetPitch * 6;

  game.telemetry = computeTelemetry(dt, actualSpeed);
  game.maxKmh = Math.max(game.maxKmh, game.telemetry.kmh);

  const damageSpeedScale = game.telemetry.kmh > DAMAGE_SPEED_KMH
    ? clamp((game.telemetry.kmh - DAMAGE_SPEED_KMH) / DAMAGE_SPEED_KMH, 0, 2.5)
    : 0;
  const pitchStress = Math.abs(targetPitch - game.pitch);
  const pitchWear = pitchStress * Math.abs(game.speed) * 0.014 * damageSpeedScale;
  const overspeedStress = Math.max(0, Math.abs(game.speed) - game.stats.topSpeed * 0.86) * 0.002;
  const chassisWear = (pitchWear + overspeedStress) * dt * 60;
  const terrainWear = hazardEffect.wear * dt * 8;
  game.wear += (chassisWear + terrainWear) / game.stats.durability;

  collectPickupsAndCheckpoints();
  recordGhostSample();
  if (game.eventTimer > 0) game.eventTimer -= dt;
  if (game.boostPulse > 0) game.boostPulse = Math.max(0, game.boostPulse - dt * 1.9);
  if (game.floaters?.length) {
    game.floaters = game.floaters
      .map((floater) => ({ ...floater, life: floater.life - dt * 1.15 }))
      .filter((floater) => floater.life > 0);
  }
  game.finishedRoute = game.distancePx >= game.route.length;
  evaluateRunMissionsLive();
  if (game.fuel <= 0 || game.wear >= game.stats.wearLimit || game.finishedRoute) finishRun(game.finishedRoute);
  updateHud();
}

function collectPickupsAndCheckpoints() {
  for (const pickup of game.pickups) {
    if (pickup.collected || Math.abs(game.x - pickup.x) > 42) continue;
    pickup.collected = true;
    if (pickup.type === 'fuel') {
      const amount = 16;
      game.fuel = Math.min(game.stats.maxFuel + 24, game.fuel + amount);
      saveData.lifetimeFuel += amount;
      triggerEvent('Fuel +');
      spawnFloatingReward('+Fuel', '#38bdf8', pickup.x);
    }
    if (pickup.type === 'parts') {
      game.parts += 1;
      saveData.parts += 1;
      triggerEvent('Part +1');
      spawnFloatingReward('+1 Part', '#c4b5fd', pickup.x);
    }
    if (pickup.type === 'tools') {
      game.tools += 1;
      saveData.tools = (saveData.tools || 0) + 1;
      game.wear = Math.max(0, game.wear - game.stats.repairPower);
      game.usedRepair = true;
      saveData.lifetimeRepairs += 1;
      triggerEvent('Tool repair');
      spawnFloatingReward('Repair', '#fb923c', pickup.x);
    }
    if (pickup.type === 'coin') {
      const coins = Math.round((pickup.value || 4) * game.route.reward);
      game.coins += coins;
      saveData.coins += coins;
      spawnFloatingReward(`+${coins}`, '#facc15', pickup.x);
    }
    saveGameData();
  }
  for (const checkpoint of game.checkpoints) {
    if (checkpoint.used || Math.abs(game.x - checkpoint.x) > 68) continue;
    checkpoint.used = true;
    if (checkpoint.type === 'fuelStation') {
      const amount = game.stats.maxFuel * 0.42;
      game.fuel = Math.min(game.stats.maxFuel + 36, game.fuel + amount);
      saveData.lifetimeFuel += Math.floor(amount);
      triggerEvent('Fuel Station + Range');
      spawnFloatingReward('+Fuel Stop', '#38bdf8', checkpoint.x, -92);
    }
    if (checkpoint.type === 'partsStore') {
      game.parts += 3;
      saveData.parts += 3;
      triggerEvent('Auto Parts +3');
      spawnFloatingReward('+3 Parts', '#c4b5fd', checkpoint.x, -92);
    }
    if (checkpoint.type === 'mechanicShop') {
      const repair = game.stats.wearLimit * 0.45;
      game.wear = Math.max(0, game.wear - repair);
      game.usedRepair = true;
      saveData.lifetimeRepairs += 1;
      triggerEvent('Mechanic Repair');
      spawnFloatingReward('Repair', '#6dff9f', checkpoint.x, -92);
    }
    if (checkpoint.type === 'wreck') {
      game.parts += 2;
      saveData.parts += 2;
      game.wear = Math.max(0, game.wear - 8);
      game.usedRepair = true;
      triggerEvent('Salvage +2 Parts');
      spawnFloatingReward('+2 Parts', '#f97316', checkpoint.x, -92);
    }
    saveGameData();
  }
}

function finishRun(completed) {
  if (game.finished) return;
  game.finished = true;
  const bonus = Math.floor(game.distanceM / 75);
  saveData.coins += bonus;
  saveData.lifetimeWear += Math.floor(game.wear);
  saveData.lifetime.distance += Math.floor(game.distanceM);
  saveData.lifetime.coinsEarned += game.coins + bonus;
  saveData.lifetime.partsEarned += game.parts;
  saveData.lifetime.runs += 1;
  if (game.distanceM > saveData.bestDistance) {
    saveData.bestDistance = Math.floor(game.distanceM);
    saveData.bestTrail = game.samples.slice(-520);
  }
  let newGhostBest = false;
  if (completed) {
    recordGhostSample(true);
    const ghost = createLocalBestGhost({
      playerName: currentPlayerName(),
      route: game.routeKey || activeRoute,
      stage: game.stage,
      bestTimeMs: Math.round(game.elapsed * 1000),
      carKey: saveData.selectedVehicle,
      recordedAt: Date.now(),
      samples: game.samples.slice(-520)
    });
    const result = upsertLocalBestGhost(ghostStore, ghost);
    ghostStore = result.store;
    newGhostBest = result.changed;
    if (result.changed) saveGhostStore(ghostStore);
  }
  const missionRewards = evaluateMissionSets();
  saveGameData();
  const reason = game.wear >= game.stats.wearLimit ? 'wear' : completed ? 'complete' : 'fuel';
  game.message = completed && newGhostBest ? 'New Ghost Best' : completed ? 'Route Complete' : reason === 'wear' ? 'Vehicle Worn Out' : 'Out of Fuel';
  game.finishReason = reason;
  showPostRunPanel(completed, reason, bonus, missionRewards);
  refreshPanels();
  updateHud();
}

function loop(timestamp) {
  if (!document.querySelector('#screen-race.active .roadRunnerShell')) {
    frameId = requestAnimationFrame(loop);
    return;
  }
  const dt = Math.min((timestamp - lastTime) / 1000 || 0.016, 0.05);
  lastTime = timestamp;
  if (game) {
    game.elapsed += dt;
    update(dt);
    draw();
  }
  frameId = requestAnimationFrame(loop);
}

function resizeCanvas() {
  if (!canvas) return;
  const host = document.querySelector('#roadRunnerGameHost');
  if (!host) return;
  const rect = host.getBoundingClientRect();
  const width = Math.max(320, Math.floor(rect.width || 420));
  const height = Math.max(320, Math.floor(rect.height || 340));
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

function bindControls() {
  document.querySelectorAll('[data-rr-control]').forEach((button) => {
    const control = button.getAttribute('data-rr-control');
    const set = (value, event) => {
      if (event) event.preventDefault();
      if (control === 'gas') input.gas = value;
      if (control === 'brake') input.brake = value;
      if (control === 'gas' && value) window.dispatchEvent(new CustomEvent('roadRunnerFirstGas'));
      button.classList.toggle('active', value);
    };
    button.addEventListener('pointerdown', (event) => { button.setPointerCapture?.(event.pointerId); set(true, event); }, { passive: false });
    button.addEventListener('pointerup', (event) => set(false, event), { passive: false });
    button.addEventListener('pointercancel', (event) => set(false, event), { passive: false });
    button.addEventListener('pointerleave', (event) => set(false, event), { passive: false });
  });
  window.onkeydown = (event) => {
    if (!document.querySelector('#screen-race.active')) return;
    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
      input.gas = true;
      window.dispatchEvent(new CustomEvent('roadRunnerFirstGas'));
    }
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') input.brake = true;
  };
  window.onkeyup = (event) => {
    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') input.gas = false;
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') input.brake = false;
  };
}

function mountRoadRunner(force = false) {
  const screen = document.querySelector('#screen-race.active');
  if (!screen) return;
  if (force || screen !== mountedScreen || !screen.querySelector('.roadRunnerShell')) {
    saveData = loadSave();
    screen.innerHTML = shellHtml();
    mountedScreen = screen;
    canvas = screen.querySelector('#roadRunnerCanvas');
    ctx = canvas.getContext('2d');
    bindControls();
    resizeCanvas();
    resetRun();
    refreshPanels();
    draw();
  }
  if (!frameId) {
    lastTime = performance.now();
    frameId = requestAnimationFrame(loop);
  }
}

window.restartHillRoute = () => {
  input.gas = false;
  input.brake = false;
  resetRun();
  refreshPanels();
  draw();
};
window.setHillGhosts = (mode) => {
  if (!GHOST_MODES[mode]) return;
  activeGhostMode = mode;
  refreshActiveGhosts();
  mountRoadRunner(true);
};
window.rrCycleGhosts = () => {
  const modes = Object.keys(GHOST_MODES);
  activeGhostMode = modes[(modes.indexOf(activeGhostMode) + 1) % modes.length];
  setText('[data-rr-mode]', GHOST_MODES[activeGhostMode].label);
  refreshActiveGhosts();
  window.dispatchEvent(new CustomEvent('roadRunnerGhostPreview'));
};
window.setHillRoute = (route) => {
  if (!ROUTES[route] || !routeUnlocked(route)) return;
  activeRoute = route;
  mountRoadRunner(true);
};
window.selectRoadRunnerVehicle = (key) => {
  if (!saveData.unlockedVehicles.includes(key)) return;
  saveData.selectedVehicle = key;
  saveGameData();
  resetRun();
  refreshPanels();
  updateHud();
  draw();
};
window.unlockRoadRunnerVehicle = (key) => {
  const item = VEHICLES[key];
  if (!item || saveData.unlockedVehicles.includes(key)) return;
  if (saveData.coins < item.unlock.coins || saveData.parts < item.unlock.parts) return;
  saveData.coins -= item.unlock.coins;
  saveData.parts -= item.unlock.parts;
  saveData.unlockedVehicles.push(key);
  saveData.selectedVehicle = key;
  saveGameData();
  resetRun();
  refreshPanels();
  updateHud();
  draw();
};
window.buyRoadRunnerUpgrade = (key) => {
  const level = saveData.upgrades[key] || 1;
  const item = UPGRADES[key];
  if (!item || level >= item.max) return;
  const cost = upgradeCost(key, level);
  if (saveData.coins < cost.coins || saveData.parts < cost.parts) return;
  saveData.coins -= cost.coins;
  saveData.parts -= cost.parts;
  saveData.upgrades[key] = level + 1;
  saveGameData();
  resetRun();
  refreshPanels();
  updateHud();
  draw();
};
window.rrSetTab = (tab) => {
  if (!['drive', 'garage', 'vehicles', 'routes', 'missions'].includes(tab)) return;
  activeTab = tab;
  document.querySelector('.roadRunnerShell')?.setAttribute('data-rr-active-tab', tab);
  document.querySelectorAll('[data-rr-tab]').forEach((btn) => btn.classList.toggle('active', btn.getAttribute('data-rr-tab') === tab));
  document.querySelectorAll('[data-rr-page]').forEach((page) => page.classList.toggle('active', page.getAttribute('data-rr-page') === tab));
  if (tab === 'garage') renderGaragePanel();
  else if (tab === 'vehicles') renderVehiclePanel();
  else if (tab === 'routes') renderRoutesPanel();
  else if (tab === 'missions') renderMissionPanel();
};
window.rrSetVehicleFilter = (filter) => {
  if (!VEHICLE_FILTERS.includes(filter)) return;
  activeVehicleFilter = filter;
  renderVehiclePanel();
};
window.render_game_to_text = () => {
  if (!game) return JSON.stringify({ mode: 'road-runner', active: false });
  const hazard = activeHazard();
  const localBestGhost = getLocalBestGhost(ghostStore, activeRoute, game.stage);
  return JSON.stringify({
    mode: 'road-runner',
    active: true,
    vehicle: saveData.selectedVehicle,
    vehicleAsset: ASSET_PATHS[selectedVehicle().asset] || '',
    vehicleAssetReady: Boolean(images[selectedVehicle().asset]?.ready && images[selectedVehicle().asset]?.naturalWidth > 0),
    route: activeRoute,
    stage: game.stage,
    routeBackgroundAsset: ASSET_PATHS[game.route.bgAsset] || '',
    routeBackgroundReady: Boolean(images[game.route.bgAsset]?.ready && images[game.route.bgAsset]?.naturalWidth > 0),
    ghostStorageKey: GHOST_STORAGE_KEY,
    localBestGhost: localBestGhost ? {
      ghostId: localBestGhost.ghostId,
      bestTimeMs: localBestGhost.bestTimeMs,
      samples: localBestGhost.samples.length
    } : null,
    activeGhosts: (game.activeGhosts || []).map((ghost) => ({
      ghostId: ghost.ghostId,
      source: ghost.source,
      playerName: ghost.playerName,
      route: ghost.route,
      stage: ghost.stage,
      bestTimeMs: ghost.bestTimeMs,
      carKey: ghost.carKey,
      samples: ghost.samples.length
    })),
    elapsedSeconds: Number(game.elapsed.toFixed(1)),
    distanceMeters: Math.floor(game.distanceM),
    speedKmh: Number(game.telemetry.kmh.toFixed(1)),
    topSpeedKmh: Number(game.telemetry.topSpeedKmh.toFixed(1)),
    gear: game.telemetry.gearLabel,
    rpm: game.telemetry.rpm,
    redlineRpm: game.telemetry.redlineRpm,
    fuelPct: clamp(Math.floor(game.fuel / game.stats.maxFuel * 100), 0, 100),
    nextFuelMeters: nextFuelMeters(),
    wearPct: Math.floor(Math.min(100, game.wear / game.stats.wearLimit * 100)),
    tractionPct: Math.round((game.traction || 1) * 100),
    openPickups: game.pickups.filter((pickup) => !pickup.collected).length,
    floatingRewards: game.floaters.length,
    damageThresholdKmh: DAMAGE_SPEED_KMH,
    hazard: hazard ? {
      type: hazard.type,
      damageActive: game.telemetry.kmh >= DAMAGE_SPEED_KMH
    } : null,
    controls: { gas: input.gas, brake: input.brake }
  });
};
window.advanceTime = (milliseconds) => {
  if (!game) return;
  const seconds = clamp(Number(milliseconds) / 1000, 0, 10);
  const steps = Math.ceil(seconds * 60);
  const dt = steps ? seconds / steps : 0;
  for (let step = 0; step < steps; step += 1) {
    game.elapsed += dt;
    update(dt);
  }
  draw();
};

function inject() {
  document.documentElement.classList.toggle('rrRaceViewport', Boolean(document.querySelector('#screen-race.active')));
  const screen = document.querySelector('#screen-race.active');
  if (!screen) return;
  requestAnimationFrame(() => mountRoadRunner(false));
}

window.addEventListener('resize', () => { resizeCanvas(); draw(); });
const observer = new MutationObserver(() => inject());
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.addEventListener('load', inject);
document.addEventListener('click', () => requestAnimationFrame(inject));
