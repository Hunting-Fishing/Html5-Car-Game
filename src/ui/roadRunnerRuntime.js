const SAVE_KEY = '365_canvas_road_runner_v4';

const ROUTES = {
  track: { label: '365 Test Track', profile: 'track', length: 9800, meters: 3200, reward: 1.05, difficulty: 0.70, skyA: '#7ddcff', skyB: '#d9fbff', grass: '#58b957', road: '#2d3748', seed: 4, unlock: 0 },
  barangay: { label: 'Barangay Route', profile: 'barangay', length: 10800, meters: 3500, reward: 1.0, difficulty: 0.95, skyA: '#8bdcff', skyB: '#e1fbff', grass: '#5fbf57', road: '#3a4555', seed: 1, unlock: 600 },
  farm: { label: 'Farm Supply Run', profile: 'farm', length: 11800, meters: 3900, reward: 1.15, difficulty: 1.08, skyA: '#9ee8ff', skyB: '#e7fcff', grass: '#66bd45', road: '#554537', seed: 3, unlock: 1200 },
  mountain: { label: 'Mountain Parts Run', profile: 'mountain', length: 13800, meters: 4600, reward: 1.25, difficulty: 1.35, skyA: '#86d4ff', skyB: '#e0f7ff', grass: '#4f9e52', road: '#39414d', seed: 2, unlock: 1900 },
  port: { label: 'Port Export Route', profile: 'port', length: 15000, meters: 5000, reward: 1.35, difficulty: 1.45, skyA: '#93dfff', skyB: '#e4fbff', grass: '#49a985', road: '#36414d', seed: 5, unlock: 2700 }
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

const DAMAGE_SPEED_KMH = 50;
const GEAR_COUNT = 5;
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
  hatchback: '/assets/vehicles/racer/starter-hatchback.svg',
  greenCompact: '/assets/vehicles/racer/compact-sport.svg',
  cityTaxi: '/assets/vehicles/racer/city-taxi.svg',
  pickup: '/assets/vehicles/racer/parts-pickup.svg',
  rallyLite: '/assets/vehicles/racer/rally-lite.svg',
  serviceVan: '/assets/vehicles/racer/service-van.svg',
  desertRunner: '/assets/vehicles/racer/desert-runner.svg',
  offroad: '/assets/vehicles/racer/off-road-truck.svg',
  exportVan: '/assets/vehicles/racer/export-support-van.svg',
  race: '/assets/vehicles/racer/purple-race-coupe.svg',
  mountainCourier: '/assets/vehicles/racer/mountain-courier.svg',
  superCoupe: '/assets/vehicles/racer/super-coupe.svg',
  ghostA: '/assets/vehicles/racer/compact-sport.svg',
  ghostB: '/assets/vehicles/racer/parts-pickup.svg',
  ghostC: '/assets/vehicles/racer/service-van.svg',
  coin: '/assets/road-runner/token-coin.svg',
  fuel: '/assets/road-runner/token-energy.svg',
  parts: '/assets/road-runner/token-parts.svg',
  tools: '/assets/road-runner/tool-kit.svg',
  fuelStation: '/assets/road-runner/fuel-station.svg',
  partsStore: '/assets/road-runner/parts-store.svg',
  mechanicShop: '/assets/road-runner/mechanic-shop.svg',
  wreck: '/assets/road-runner/wrecked-car.svg'
};

let canvas = null;
let ctx = null;
let frameId = 0;
let mountedScreen = null;
let activeRoute = 'track';
let activeGhostMode = 'ghost2';
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
  return {
    acceleration: (82 + u.engine * 8) * vehicle.accel,
    topSpeed: (132 + u.tires * 6) * vehicle.speed,
    reverseTop: 24 + u.transmission * 3,
    drag: Math.max(3, 11 - u.tires * 0.35),
    grip: 0.78 + u.tires * 0.022,
    maxFuel: (95 + u.fuelTank * 20) * vehicle.fuel,
    fuelUse: Math.max(1.6, 4.0 - u.fuelTank * 0.08),
    handling: (0.08 + u.suspension * 0.014) * vehicle.handling,
    spring: 4.8 + u.suspension * 0.42,
    damping: 2.7 + u.suspension * 0.18,
    durability: (1 + u.durability * 0.1) * vehicle.durability,
    wearLimit: 100 + u.durability * 12,
    climb: 1 + u.transmission * 0.045,
    brakePower: 170 + u.brakes * 11,
    repairPower: 6 + u.repairKit * 2
  };
}

function routeMeters(route, pixels) {
  return Math.floor(Math.max(0, pixels) * (route.meters / route.length));
}

function routeY(route, x, height) {
  const base = Math.max(170, Math.min(height - 130, height * 0.61));
  const seed = route.seed || 1;
  if (route.profile === 'track') return base + Math.sin((x + seed * 90) / 430) * 14 + Math.sin((x + seed * 40) / 190) * 6 + Math.sin((x + seed * 20) / 820) * 16;
  if (route.profile === 'mountain') return base + Math.sin((x + seed * 160) / 180) * 42 + Math.sin((x + seed * 85) / 74) * 13 - Math.sin((x + seed * 60) / 520) * 46;
  if (route.profile === 'farm') return base + Math.sin((x + seed * 120) / 240) * 26 + Math.sin((x + seed * 70) / 96) * 10 - Math.sin((x + seed * 30) / 680) * 22;
  if (route.profile === 'port') return base + Math.sin((x + seed * 110) / 360) * 20 + Math.sin((x + seed * 55) / 155) * 7 - Math.sin((x + seed * 40) / 940) * 24;
  return base + Math.sin((x + seed * 120) / 175) * 24 + Math.sin((x + seed * 70) / 78) * 9 - Math.sin((x + seed * 30) / 540) * 26;
}

function routeAngle(route, x, height) {
  const rise = routeY(route, x + 10, height) - routeY(route, x - 10, height);
  return clamp((rise / 20) * 0.42, -0.55, 0.55);
}

function loadImages() {
  const result = {};
  Object.entries(ASSET_PATHS).forEach(([key, path]) => {
    const img = new Image();
    img.onload = () => { img.ready = true; };
    img.onerror = () => { img.ready = false; };
    img.src = path;
    result[key] = img;
  });
  return result;
}

function seededNoise(x, seed) {
  return Math.abs(Math.sin(x * 0.013 + seed * 9.17) * 43758.5453) % 1;
}

function makePickups(route) {
  const pickups = [];
  const spacing = route.profile === 'track' ? 260 : 230;
  for (let x = 360; x < route.length - 260; x += spacing) {
    const roll = seededNoise(x, route.seed);
    const type = roll > 0.90 ? 'tools' : roll > 0.72 ? 'parts' : roll > 0.55 ? 'fuel' : 'coin';
    pickups.push({ x, type, collected: false });
  }
  return pickups;
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

function computeTelemetry() {
  if (!game) return { kmh: 0, gear: 1, rpm: 900, rpmPct: 0 };
  const kmh = Math.abs(game.speed) * (game.route.meters / game.route.length) * 3.6;
  const speedFrac = clamp(Math.abs(game.speed) / game.stats.topSpeed, 0, 1);
  const gearSpan = 1 / GEAR_COUNT;
  const gear = speedFrac <= 0.001 ? 1 : Math.min(GEAR_COUNT, Math.floor(speedFrac / gearSpan) + 1);
  const within = gearSpan > 0 ? clamp((speedFrac - (gear - 1) * gearSpan) / gearSpan, 0, 1) : 0;
  const rpm = Math.round(900 + within * 6100);
  return { kmh, gear, rpm, rpmPct: clamp((rpm - 900) / 6100, 0, 1) };
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

function resetRun() {
  ensureMissionState(saveData);
  const route = ROUTES[activeRoute];
  const stats = vehicleStats();
  const director = makeDirector(route);
  game = {
    route,
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
    elapsed: 0,
    finished: false,
    finishedRoute: false,
    maxKmh: 0,
    earnedProgression: false,
    earnedDaily: new Set(),
    telemetry: { kmh: 0, gear: 1, rpm: 900, rpmPct: 0 },
    pickups: makePickups(route),
    checkpoints: director.checkpoints,
    hazards: director.hazards,
    samples: [],
    lastSample: 0,
    message: '',
    finishReason: '',
    eventText: '',
    eventTimer: 0,
    hazardsCleared: 0,
    usedRepair: false,
    ghostColors: ['#22c55e', '#f97316', '#e5e7eb']
  };
  hidePostRunPanel();
  updateHud();
}

function shellHtml() {
  const tabs = [['drive', 'Drive'], ['garage', 'Garage'], ['vehicles', 'Vehicles'], ['routes', 'Routes'], ['missions', 'Missions']];
  return `<section class="card roadRunnerShell">
    <div class="roadRunnerHeader"><h2>365 Hill Route</h2><p>Drive, repair, upgrade, and unlock vehicles across five routes.</p></div>
    <div class="roadRunnerHud"><div class="roadRunnerStat"><b data-rr-distance>0m</b><span>Distance</span></div><div class="roadRunnerStat"><b data-rr-speed>0 km/h</b><span>Speed</span></div><div class="roadRunnerStat"><b data-rr-gear>1 · 900rpm</b><span>Gear</span></div><div class="roadRunnerStat"><b data-rr-fuel>100%</b><span>Fuel</span></div><div class="roadRunnerStat"><b data-rr-wear>0%</b><span>Wear</span></div><div class="roadRunnerStat"><b data-rr-coins>${formatSmall(saveData.coins)}</b><span>Coins</span></div><div class="roadRunnerStat"><b data-rr-parts>${formatSmall(saveData.parts)}</b><span>Parts</span></div><div class="roadRunnerStat"><b data-rr-best>${formatSmall(saveData.bestDistance)}m</b><span>Best</span></div></div>
    <nav class="racerInnerNav" data-rr-tabs>${tabs.map(([key, label]) => `<button class="${activeTab === key ? 'active' : ''}" data-rr-tab="${key}" onclick="window.rrSetTab?.('${key}')">${label}</button>`).join('')}</nav>
    <div class="racerPages">
      <section class="racerPage ${activeTab === 'drive' ? 'active' : ''}" data-rr-page="drive">
        <div class="roadRunnerGameFrame"><div id="roadRunnerGameHost"><canvas id="roadRunnerCanvas"></canvas></div><div class="roadRunnerOverlay"><div class="roadRunnerBadge" data-rr-route>${ROUTES[activeRoute].label}</div><div class="roadRunnerBadge" data-rr-mode>${GHOST_MODES[activeGhostMode].label}</div></div><div class="roadRunnerControlHint">BRAKE slows. Hold BRAKE when stopped to reverse. Stay under ${DAMAGE_SPEED_KMH}km/h on hazards to limit damage.</div><div class="roadRunnerControls"><button class="roadRunnerPedal brake" data-rr-control="brake">BRAKE / REV</button><button class="roadRunnerPedal gas" data-rr-control="gas">GAS</button></div><div class="roadRunnerEndPanel rrPostRunPanel" hidden data-rr-end-panel></div></div>
        <div class="roadRunnerPanel"><div class="roadRunnerPanelTitle"><h3>Ghost Race</h3><span class="roadRunnerNotice">Computer ghosts or saved best trail.</span></div><div class="roadRunnerModeGrid">${Object.entries(GHOST_MODES).map(([key, value]) => `<button class="btn ${key === activeGhostMode ? 'primary' : 'ghost'}" onclick="window.setHillGhosts?.('${key}')">${value.label}</button>`).join('')}</div></div>
        <div class="roadRunnerPanel"><button class="btn primary" style="width:100%" onclick="window.restartHillRoute?.()">Restart Run</button></div>
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
  setText('[data-rr-distance]', `${Math.floor(game.distanceM)}m`);
  setText('[data-rr-speed]', `${Math.round(game.telemetry.kmh)} km/h`);
  setText('[data-rr-gear]', `${game.telemetry.gear} · ${game.telemetry.rpm}rpm`);
  setText('[data-rr-fuel]', `${Math.max(0, Math.floor(game.fuel / game.stats.maxFuel * 100))}%`);
  setText('[data-rr-wear]', `${Math.floor(Math.min(100, game.wear / game.stats.wearLimit * 100))}%`);
  setText('[data-rr-coins]', formatSmall(saveData.coins));
  setText('[data-rr-parts]', formatSmall(saveData.parts));
  setText('[data-rr-best]', `${formatSmall(saveData.bestDistance)}m`);
}

function refreshPanels() {
  renderMissionPanel();
  renderVehiclePanel();
  renderGaragePanel();
  renderRoutesPanel();
}

function nextFuelMeters() {
  if (!game) return 0;
  const next = game.checkpoints.find((checkpoint) => !checkpoint.used && checkpoint.type === 'fuelStation' && checkpoint.x > game.x);
  return next ? Math.max(0, routeMeters(game.route, next.x - game.x)) : 0;
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
  return `<div class="roadRunnerVehicleCard ${selected ? 'selected' : ''}"><div class="vehicleThumb">${img ? `<img src="${img}" alt="${item.label}"/>` : ''}</div><h4>${item.label}</h4><p>${item.description}</p><div class="vehicleStats">SPD ${item.speed.toFixed(2)} • FUEL ${item.fuel.toFixed(2)} • DUR ${item.durability.toFixed(2)}</div><button class="btn ${selected ? 'gold' : unlocked || canUnlock ? 'primary' : 'ghost'}" ${selected || (!unlocked && !canUnlock) ? 'disabled' : ''} onclick="${action}">${selected ? 'Selected' : unlocked ? 'Select' : canUnlock ? `Unlock ${formatSmall(item.unlock.coins)}C / ${item.unlock.parts}P` : `Locked ${formatSmall(item.unlock.coins)}C / ${item.unlock.parts}P`}</button></div>`;
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
  const missionHtml = missionRewards.map((m) => `<div class="rrPostRunReward"><b>+${m.rewardCoins}</b><span>${m.kind} Bonus</span></div>`).join('');
  panel.innerHTML = `<div class="rrPostRunHero"><div class="rrPostRunStars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div><div class="rrPostRunPlace">${pct}%</div><h3 class="rrPostRunTitle">${title}</h3><p class="rrPostRunSubtitle">${subtitle}</p></div><div class="rrPostRunGrid"><div class="rrPostRunReward"><b>+${game.coins}</b><span>Run Coins</span></div><div class="rrPostRunReward"><b>+${bonus}</b><span>Bonus</span></div><div class="rrPostRunReward"><b>+${game.parts}</b><span>Parts</span></div>${missionHtml}</div><div class="rrPostRunDetails"><div class="rrPostRunDetail"><b>${Math.floor(game.distanceM)}m</b>Distance</div><div class="rrPostRunDetail"><b>${Math.round(game.maxKmh)} km/h</b>Top Speed</div><div class="rrPostRunDetail"><b>${wearPct}%</b>Wear</div><div class="rrPostRunDetail"><b>${formatSmall(saveData.bestDistance)}m</b>Best Distance</div></div><div class="rrPostRunActions"><button onclick="window.restartHillRoute?.()">Retry</button><button class="primary" onclick="window.rrSetTab?.('garage')">Garage</button><button class="gold" onclick="window.rrSetTab?.('missions')">Missions</button></div>`;
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
  drawHazards(width, height, route, cameraX);
  drawCheckpoints(width, height, route, cameraX);
  drawPickups(width, height, route, cameraX);
  drawGhosts(width, height, route, cameraX);
  drawPlayer(width, height, route, cameraX);
  drawFinish(width, height, route, cameraX);
  drawRunMeters(width, height);
}

function drawBackground(width, height, route, cameraX) {
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

function drawPickups(width, height, route, cameraX) {
  for (const pickup of game.pickups) {
    if (pickup.collected) continue;
    const x = pickup.x - cameraX;
    if (x < -60 || x > width + 60) continue;
    const y = routeY(route, pickup.x, height) - 34;
    const img = images[pickup.type];
    if (img && img.ready) ctx.drawImage(img, x - 20, y - 20, 40, 40);
    else {
      ctx.fillStyle = pickup.type === 'fuel' ? '#38bdf8' : pickup.type === 'parts' ? '#a78bfa' : pickup.type === 'tools' ? '#f97316' : '#facc15';
      ctx.beginPath();
      ctx.arc(x, y, 17, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawGhosts(width, height, route, cameraX) {
  const mode = GHOST_MODES[activeGhostMode];
  const keys = ['ghostA', 'ghostB', 'ghostC'];
  for (let i = 0; i < mode.count; i++) {
    const point = ghostPoint(i, height);
    const x = point.x - cameraX;
    if (x < -100 || x > width + 120) continue;
    drawCar(x, point.y, routeAngle(route, point.x, height) * 0.65, images[keys[i]], i === 0 && saveData.bestTrail.length ? 'Best Ghost' : `Computer ${i + 1}`, 0.5, game.ghostColors[i]);
  }
}

function ghostPoint(index, height) {
  const route = game.route;
  if (index === 0 && saveData.bestTrail.length > 5) {
    const target = Math.max(0, game.elapsed - index * 0.8);
    let sample = saveData.bestTrail[saveData.bestTrail.length - 1];
    for (const item of saveData.bestTrail) {
      if (item.t >= target) { sample = item; break; }
    }
    return { x: sample.x, y: routeY(route, sample.x, height) - 30 };
  }
  const pace = 0.9 + index * 0.08;
  const x = 80 + Math.max(0, game.elapsed - index * 0.75) * (game.stats.topSpeed * pace * 0.58);
  return { x, y: routeY(route, x, height) - 30 };
}

function drawPlayer(width, height, route, cameraX) {
  const x = game.x - cameraX;
  const y = routeY(route, game.x, height) - 30;
  drawCar(x, y, game.pitch, images[selectedVehicle().asset], 'You', 1, '#3b82f6');
}

function drawCar(x, y, angle, img, label, alpha, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 48, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  if (img && img.ready) ctx.drawImage(img, -56, -31, 112, 56);
  else {
    ctx.fillStyle = color;
    roundRect(-36, -15, 72, 30, 9);
    ctx.fill();
    ctx.strokeStyle = '#172033';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-28, 18 + game.suspensionTravel);
  ctx.lineTo(-28, 30);
  ctx.moveTo(28, 18 - game.suspensionTravel);
  ctx.lineTo(28, 30);
  ctx.stroke();
  ctx.restore();
  drawOutlinedText(label, x, y - 46, '11px', alpha);
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

function drawRunMeters(width, height) {
  const fuelPct = game.fuel / game.stats.maxFuel;
  const wearPct = Math.min(1, game.wear / game.stats.wearLimit);
  drawBar(14, 42, 150, 11, 'Fuel', fuelPct, '#22c55e');
  drawBar(14, 58, 150, 11, 'Wear', wearPct, wearPct > 0.75 ? '#ef4444' : '#f59e0b');
  if (game.fuel / game.stats.maxFuel < 0.18 && nextFuelMeters() > 220) drawOutlinedText('LOW FUEL - COAST OR FIND STATION', width / 2, 72, '14px');
  if (game.eventTimer > 0) drawOutlinedText(game.eventText, width / 2, 96, '16px');
}

function drawBar(x, y, width, height, label, pct, color) {
  ctx.fillStyle = 'rgba(4,17,29,.72)';
  roundRect(x, y, width, height, 6);
  ctx.fill();
  ctx.fillStyle = color;
  roundRect(x, y, width * clamp(pct, 0, 1), height, 6);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '800 9px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(label, x + width + 6, y + 9);
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
  const kmh = Math.abs(game.speed) * (game.route.meters / game.route.length) * 3.6;
  const carefulFactor = input.brake ? 0.38 : 1;
  const overLimit = Math.max(0, kmh - DAMAGE_SPEED_KMH);
  const speedDamageScale = 0.18 + clamp(kmh / DAMAGE_SPEED_KMH, 0, 1) * 0.32 + Math.pow(overLimit / DAMAGE_SPEED_KMH, 1.5) * 1.0;
  const suspensionReduction = clamp(1.12 - saveData.upgrades.suspension * 0.035, 0.48, 1.0);
  const baseWear = hazard.type === 'pothole' ? 1.55 : hazard.type === 'rough' ? 0.75 : hazard.type === 'gravel' ? 0.42 : 0.24;
  const slow = hazard.type === 'mud' ? 0.72 : hazard.type === 'gravel' ? 0.86 : hazard.type === 'rough' ? 0.90 : 0.80;
  return { slow, wear: baseWear * speedDamageScale * carefulFactor * suspensionReduction };
}

function update(dt) {
  if (!game || game.finished) return;
  const height = canvas.height;
  const route = game.route;
  const targetPitch = routeAngle(route, game.x, height);
  const slope = Math.sin(targetPitch);
  const hazard = activeHazard();
  const hazardEffect = hazardDamage(hazard);
  if (hazard && !hazard.hit) {
    hazard.hit = true;
    game.hazardsCleared += 1;
    triggerEvent(`${hazard.type.toUpperCase()} - slow down!`);
  }

  const gasForce = input.gas && game.fuel > 0 ? game.stats.acceleration * game.stats.climb : 0;
  const gravityForce = -slope * 92;
  const rollingDrag = game.stats.drag + Math.abs(game.speed) * 0.018;
  if (gasForce > 0) {
    game.speed += gasForce * dt;
    game.fuel -= game.stats.fuelUse * dt * (1 + Math.max(0, slope) * 0.8);
  }
  game.speed += gravityForce * dt;
  if (input.brake) {
    if (game.speed > 8) game.speed -= game.stats.brakePower * dt;
    else if (game.x > 82) game.speed -= game.stats.reverseTop * dt;
  }
  if (game.speed > 0) game.speed -= rollingDrag * dt;
  if (game.speed < 0) game.speed += rollingDrag * 0.55 * dt;
  game.speed = clamp(game.speed, -game.stats.reverseTop, game.stats.topSpeed);
  game.x += game.speed * dt * hazardEffect.slow;
  game.x = Math.max(80, game.x);
  game.distancePx = Math.max(0, game.x - 80);
  game.distanceM = routeMeters(route, game.distancePx);

  game.pitchVel += (targetPitch - game.pitch) * game.stats.spring * dt;
  game.pitchVel -= game.pitchVel * game.stats.damping * dt;
  game.pitch += game.pitchVel * dt;
  game.suspensionTravel = Math.sin(game.elapsed * 18) * Math.min(6, Math.abs(game.speed) / 38) + targetPitch * 6;

  game.telemetry = computeTelemetry();
  game.maxKmh = Math.max(game.maxKmh, game.telemetry.kmh);

  const pitchStress = Math.abs(targetPitch - game.pitch);
  const overspeedStress = Math.max(0, Math.abs(game.speed) - game.stats.topSpeed * 0.86) * 0.002;
  const overLimitWear = Math.max(0, game.telemetry.kmh - DAMAGE_SPEED_KMH) * 0.006;
  game.wear += (pitchStress * Math.abs(game.speed) * 0.014 + overspeedStress + hazardEffect.wear + overLimitWear) * dt * 60 / game.stats.durability;

  collectPickupsAndCheckpoints();
  if (game.elapsed - game.lastSample > 0.18) {
    game.samples.push({ t: Number(game.elapsed.toFixed(2)), x: Math.round(game.x) });
    game.lastSample = game.elapsed;
  }
  if (game.eventTimer > 0) game.eventTimer -= dt;
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
    }
    if (pickup.type === 'parts') {
      game.parts += 1;
      saveData.parts += 1;
      triggerEvent('Part +1');
    }
    if (pickup.type === 'tools') {
      game.tools += 1;
      saveData.tools = (saveData.tools || 0) + 1;
      game.wear = Math.max(0, game.wear - game.stats.repairPower);
      game.usedRepair = true;
      saveData.lifetimeRepairs += 1;
      triggerEvent('Tool repair');
    }
    if (pickup.type === 'coin') {
      const coins = Math.round(4 * game.route.reward);
      game.coins += coins;
      saveData.coins += coins;
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
    }
    if (checkpoint.type === 'partsStore') {
      game.parts += 3;
      saveData.parts += 3;
      triggerEvent('Auto Parts +3');
    }
    if (checkpoint.type === 'mechanicShop') {
      const repair = game.stats.wearLimit * 0.45;
      game.wear = Math.max(0, game.wear - repair);
      game.usedRepair = true;
      saveData.lifetimeRepairs += 1;
      triggerEvent('Mechanic Repair');
    }
    if (checkpoint.type === 'wreck') {
      game.parts += 2;
      saveData.parts += 2;
      game.wear = Math.max(0, game.wear - 8);
      game.usedRepair = true;
      triggerEvent('Salvage +2 Parts');
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
  const missionRewards = evaluateMissionSets();
  saveGameData();
  const reason = game.wear >= game.stats.wearLimit ? 'wear' : completed ? 'complete' : 'fuel';
  game.message = completed ? 'Route Complete' : reason === 'wear' ? 'Vehicle Worn Out' : 'Out of Fuel';
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
      button.classList.toggle('active', value);
    };
    button.addEventListener('pointerdown', (event) => { button.setPointerCapture?.(event.pointerId); set(true, event); }, { passive: false });
    button.addEventListener('pointerup', (event) => set(false, event), { passive: false });
    button.addEventListener('pointercancel', (event) => set(false, event), { passive: false });
    button.addEventListener('pointerleave', (event) => set(false, event), { passive: false });
  });
  window.onkeydown = (event) => {
    if (!document.querySelector('#screen-race.active')) return;
    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') input.gas = true;
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
  mountRoadRunner(true);
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

function inject() {
  const screen = document.querySelector('#screen-race.active');
  if (!screen) return;
  requestAnimationFrame(() => mountRoadRunner(false));
}

window.addEventListener('resize', () => { resizeCanvas(); draw(); });
const observer = new MutationObserver(() => inject());
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.addEventListener('load', inject);
document.addEventListener('click', () => requestAnimationFrame(inject));
