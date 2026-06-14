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
  hatchback: { label: 'Starter Hatchback', asset: 'hatchback', unlock: { coins: 0, parts: 0 }, speed: 1, accel: 1, fuel: 1, handling: 1, durability: 1, description: 'Balanced starter car.' },
  greenCompact: { label: 'Compact Sport', asset: 'greenCompact', unlock: { coins: 180, parts: 1 }, speed: 1.08, accel: 1.08, fuel: 0.96, handling: 1.05, durability: 0.95, description: 'Faster compact for early ghost runs.' },
  pickup: { label: 'Parts Pickup', asset: 'pickup', unlock: { coins: 360, parts: 3 }, speed: 0.96, accel: 0.95, fuel: 1.2, handling: 1.08, durability: 1.22, description: 'More fuel and durability.' },
  serviceVan: { label: 'Service Van', asset: 'serviceVan', unlock: { coins: 720, parts: 6 }, speed: 0.92, accel: 0.90, fuel: 1.35, handling: 1.04, durability: 1.35, description: 'Endurance route vehicle.' },
  offroad: { label: 'Off-Road Truck', asset: 'offroad', unlock: { coins: 1100, parts: 10 }, speed: 1, accel: 1, fuel: 1.18, handling: 1.32, durability: 1.45, description: 'Best for rough roads.' },
  race: { label: 'Purple Race Coupe', asset: 'race', unlock: { coins: 1450, parts: 12 }, speed: 1.24, accel: 1.18, fuel: 0.90, handling: 1.08, durability: 0.85, description: 'Fastest track vehicle.' }
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

const MISSIONS = [
  { key: 'fuel-run', label: 'Reach Next Fuel', description: 'Reach 900m with at least 10% fuel.', target: 900, minFuelPct: 10, rewardCoins: 70, rewardParts: 0 },
  { key: 'parts-salvage', label: 'Salvage Parts', description: 'Collect 4 parts in one run.', targetParts: 4, rewardCoins: 45, rewardParts: 2 },
  { key: 'smooth-driver', label: 'Smooth Driver', description: 'Reach 1200m with less than 45% wear.', target: 1200, maxWearPct: 45, rewardCoins: 90, rewardParts: 1 },
  { key: 'repair-run', label: 'Use Repairs', description: 'Use a mechanic shop or tool pickup during a run.', needRepair: true, rewardCoins: 75, rewardParts: 1 },
  { key: 'hazard-control', label: 'Hazard Control', description: 'Pass 3 hazards while keeping wear under 60%.', targetHazards: 3, maxWearPct: 60, rewardCoins: 120, rewardParts: 1 }
];

const ASSET_PATHS = {
  hatchback: '/assets/vehicles/car-compact-blue.svg',
  greenCompact: '/assets/vehicles/car-compact-green.svg',
  pickup: '/assets/vehicles/pickup-orange.svg',
  serviceVan: '/assets/vehicles/van-service-white.svg',
  offroad: '/assets/vehicles/offroad-red.svg',
  race: '/assets/vehicles/race-purple.svg',
  ghostA: '/assets/vehicles/car-compact-green.svg',
  ghostB: '/assets/vehicles/pickup-orange.svg',
  ghostC: '/assets/vehicles/van-service-white.svg',
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
    return {
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
      lifetimeRepairs: parsed.lifetimeRepairs || 0
    };
  } catch {
    return { coins: 0, parts: 0, tools: 0, bestDistance: 0, bestTrail: [], upgrades: defaultUpgrades(), unlockedVehicles: ['hatchback'], selectedVehicle: 'hatchback', completedMissions: [], lifetimeFuel: 0, lifetimeWear: 0, lifetimeRepairs: 0 };
  }
}

function saveGameData() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
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

function currentMission() {
  return MISSIONS.find((mission) => !saveData.completedMissions.includes(mission.key)) || MISSIONS[MISSIONS.length - 1];
}

function resetRun() {
  const route = ROUTES[activeRoute];
  const stats = vehicleStats();
  const director = makeDirector(route);
  game = {
    route,
    stats,
    mission: currentMission(),
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
  hideEndPanel();
  updateHud();
}

function shellHtml() {
  return `<section class="card roadRunnerShell">
    <div class="roadRunnerHeader"><h2>365 Hill Route - Repair Physics V6</h2><p>Restart overlay, speed-based road damage, reverse, mechanic shops, tools, and stronger driving physics.</p></div>
    <div class="roadRunnerHud"><div class="roadRunnerStat"><b data-rr-distance>0m</b><span>Distance</span></div><div class="roadRunnerStat"><b data-rr-fuel>100%</b><span>Fuel</span></div><div class="roadRunnerStat"><b data-rr-wear>0%</b><span>Wear</span></div><div class="roadRunnerStat"><b data-rr-coins>${formatSmall(saveData.coins)}</b><span>Coins</span></div><div class="roadRunnerStat"><b data-rr-parts>${formatSmall(saveData.parts)}</b><span>Parts</span></div><div class="roadRunnerStat"><b data-rr-best>${formatSmall(saveData.bestDistance)}m</b><span>Best</span></div></div>
    <div class="roadRunnerQuickPanel"><button class="btn primary" onclick="window.restartHillRoute?.()">Restart Run</button><div class="roadRunnerVs" data-rr-vs></div><div class="roadRunnerLegend"><span><i class="coin"></i>Coins</span><span><i class="energy"></i>Fuel</span><span><i class="parts"></i>Parts</span><div class="racerRepairHint">Slow down before hazards to reduce damage. Mechanic shops repair. Tool kits repair smaller wear.</div></div></div>
    <div class="roadRunnerGameFrame"><div id="roadRunnerGameHost"><canvas id="roadRunnerCanvas"></canvas></div><div class="roadRunnerOverlay"><div class="roadRunnerBadge" data-rr-route>${ROUTES[activeRoute].label}</div><div class="roadRunnerBadge" data-rr-mode>${GHOST_MODES[activeGhostMode].label}</div></div><div class="roadRunnerControlHint">BRAKE slows. Hold BRAKE when stopped to reverse. Slow down for potholes and rough road.</div><div class="roadRunnerControls"><button class="roadRunnerPedal brake" data-rr-control="brake">BRAKE / REV</button><button class="roadRunnerPedal gas" data-rr-control="gas">GAS</button></div><div class="roadRunnerEndPanel" hidden data-rr-end-panel><h3 data-rr-end-title>Run Finished</h3><p data-rr-end-copy></p><button class="btn primary" onclick="window.restartHillRoute?.()">Restart Run</button></div></div>
    <section class="roadRunnerPanel"><div class="roadRunnerPanelTitle"><h3>Ghost Race</h3><span class="roadRunnerNotice">Computer ghosts or saved best trail.</span></div><div class="roadRunnerModeGrid">${Object.entries(GHOST_MODES).map(([key, value]) => `<button class="btn ${key === activeGhostMode ? 'primary' : 'ghost'}" onclick="window.setHillGhosts?.('${key}')">${value.label}</button>`).join('')}</div></section>
    <section class="roadRunnerPanel"><div class="roadRunnerPanelTitle"><h3>Routes</h3><span class="roadRunnerNotice">Routes unlock by best distance.</span></div><div class="roadRunnerModeGrid">${Object.entries(ROUTES).map(([key, value]) => `<button class="btn ${key === activeRoute ? 'gold' : 'ghost'}" ${routeUnlocked(key) ? '' : 'disabled'} onclick="window.setHillRoute?.('${key}')">${routeUnlocked(key) ? value.label : `Locked ${value.unlock}m`}</button>`).join('')}</div></section>
    <section class="roadRunnerPanel" data-road-runner-missions></section>
    <section class="roadRunnerPanel" data-road-runner-vehicles></section>
    <section class="roadRunnerPanel" data-road-runner-garage></section>
  </section>`;
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function updateHud() {
  if (!game) return;
  setText('[data-rr-distance]', `${Math.floor(game.distanceM)}m`);
  setText('[data-rr-fuel]', `${Math.max(0, Math.floor(game.fuel / game.stats.maxFuel * 100))}%`);
  setText('[data-rr-wear]', `${Math.floor(Math.min(100, game.wear / game.stats.wearLimit * 100))}%`);
  setText('[data-rr-coins]', formatSmall(saveData.coins));
  setText('[data-rr-parts]', formatSmall(saveData.parts));
  setText('[data-rr-best]', `${formatSmall(saveData.bestDistance)}m`);
  setText('[data-rr-route]', ROUTES[activeRoute].label);
  setText('[data-rr-mode]', GHOST_MODES[activeGhostMode].label);
  setText('[data-rr-vs]', `You: ${selectedVehicle().label} | Next fuel: ${nextFuelMeters()}m | Mission: ${game.mission.label}`);
  renderMissionPanel();
  renderVehiclePanel();
  renderGaragePanel();
}

function nextFuelMeters() {
  if (!game) return 0;
  const next = game.checkpoints.find((checkpoint) => !checkpoint.used && checkpoint.type === 'fuelStation' && checkpoint.x > game.x);
  return next ? Math.max(0, routeMeters(game.route, next.x - game.x)) : 0;
}

function renderMissionPanel() {
  const panel = document.querySelector('[data-road-runner-missions]');
  if (!panel || !game) return;
  const mission = game.mission;
  const done = missionComplete(false);
  panel.innerHTML = `<div class="roadRunnerPanelTitle"><h3>Missions</h3><span class="roadRunnerNotice">Complete contracts for bonus rewards.</span></div><div class="racerHubCards"><div class="racerHubCard"><h4>${mission.label}</h4><p>${mission.description}</p><p>Reward: ${mission.rewardCoins} coins / ${mission.rewardParts} parts</p><p>Status: ${done ? 'Ready to complete' : 'In progress'}</p></div><div class="racerHubCard"><h4>Repair Systems</h4><p>Mechanic shops repair heavy wear. Tool kits repair smaller damage and add saved tools.</p></div></div>`;
}

function renderVehiclePanel() {
  const panel = document.querySelector('[data-road-runner-vehicles]');
  if (!panel) return;
  panel.innerHTML = `<div class="roadRunnerPanelTitle"><h3>Vehicle Selection</h3><span class="roadRunnerNotice">Vehicles change speed, fuel, handling, and durability.</span></div><div class="roadRunnerVehicleGrid">${Object.entries(VEHICLES).map(([key, item]) => vehicleCard(key, item)).join('')}</div>`;
}

function vehicleCard(key, item) {
  const unlocked = saveData.unlockedVehicles.includes(key);
  const selected = saveData.selectedVehicle === key;
  const canUnlock = saveData.coins >= item.unlock.coins && saveData.parts >= item.unlock.parts;
  const action = unlocked ? `window.selectRoadRunnerVehicle?.('${key}')` : `window.unlockRoadRunnerVehicle?.('${key}')`;
  const img = ASSET_PATHS[item.asset];
  return `<div class="roadRunnerVehicleCard ${selected ? 'selected' : ''}"><div class="vehicleThumb">${img ? `<img src="${img}" alt="${item.label}"/>` : ''}</div><h4>${item.label}</h4><p>${item.description}</p><div class="vehicleStats">SPD ${item.speed.toFixed(2)} • FUEL ${item.fuel.toFixed(2)} • DUR ${item.durability.toFixed(2)}</div><button class="btn ${selected ? 'gold' : unlocked || canUnlock ? 'primary' : 'ghost'}" ${selected || (!unlocked && !canUnlock) ? 'disabled' : ''} onclick="${action}">${selected ? 'Selected' : unlocked ? 'Select' : canUnlock ? `Unlock ${formatSmall(item.unlock.coins)}C / ${item.unlock.parts}P` : `Locked ${formatSmall(item.unlock.coins)}C / ${item.unlock.parts}P`}</button></div>`;
}

function renderGaragePanel() {
  const panel = document.querySelector('[data-road-runner-garage]');
  if (!panel) return;
  panel.innerHTML = `<div class="roadRunnerPanelTitle"><h3>Garage Upgrades</h3><span class="roadRunnerNotice">Upgrade reverse, brakes, fuel, suspension, durability, and repair power.</span></div><div class="roadRunnerWalletRow"><div class="roadRunnerWalletPill">Coins: ${formatSmall(saveData.coins)}</div><div class="roadRunnerWalletPill">Parts: ${formatSmall(saveData.parts)}</div><div class="roadRunnerWalletPill">Tools: ${formatSmall(saveData.tools || 0)}</div></div><div class="roadRunnerGarageGrid">${Object.entries(UPGRADES).map(([key, item]) => upgradeCard(key, item)).join('')}</div>`;
}

function upgradeCard(key, item) {
  const level = saveData.upgrades[key] || 1;
  const maxed = level >= item.max;
  const cost = upgradeCost(key, level);
  const canBuy = !maxed && saveData.coins >= cost.coins && saveData.parts >= cost.parts;
  return `<div class="roadRunnerUpgradeCard"><h4>${item.label} Lv.${level}</h4><p>${item.description}</p><div class="roadRunnerUpgradeMeta"><span>${maxed ? 'Max' : `Next Lv.${level + 1}`}</span><span>${maxed ? 'MAX' : `${formatSmall(cost.coins)} coins - ${cost.parts} parts`}</span></div><button class="btn ${canBuy ? 'primary' : 'ghost'}" ${canBuy ? '' : 'disabled'} onclick="window.buyRoadRunnerUpgrade?.('${key}')">${maxed ? 'Maxed' : 'Upgrade'}</button></div>`;
}

function showEndPanel(title, copy) {
  const panel = document.querySelector('[data-rr-end-panel]');
  if (!panel) return;
  panel.querySelector('[data-rr-end-title]').textContent = title;
  panel.querySelector('[data-rr-end-copy]').textContent = copy;
  panel.hidden = false;
}

function hideEndPanel() {
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
  ctx.fillStyle = 'rgba(4,17,29,.75)';
  roundRect(14, 74, 274, 28, 14);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '900 11px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Run +${game.coins}C +${game.parts}P +${game.tools}T  Next fuel ${nextFuelMeters()}m`, 28, 93);
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
  const speedFactor = clamp(Math.abs(game.speed) / game.stats.topSpeed, 0, 1);
  const carefulFactor = input.brake ? 0.38 : 1;
  const speedDamageScale = 0.10 + Math.pow(speedFactor, 1.75) * 0.90;
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

  const pitchStress = Math.abs(targetPitch - game.pitch);
  const overspeedStress = Math.max(0, Math.abs(game.speed) - game.stats.topSpeed * 0.86) * 0.002;
  game.wear += (pitchStress * Math.abs(game.speed) * 0.014 + overspeedStress + hazardEffect.wear) * dt * 60 / game.stats.durability;

  collectPickupsAndCheckpoints();
  if (game.elapsed - game.lastSample > 0.18) {
    game.samples.push({ t: Number(game.elapsed.toFixed(2)), x: Math.round(game.x) });
    game.lastSample = game.elapsed;
  }
  if (game.eventTimer > 0) game.eventTimer -= dt;
  completeMission(false);
  if (game.fuel <= 0 || game.wear >= game.stats.wearLimit || game.distancePx >= game.route.length) finishRun(game.distancePx >= game.route.length);
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

function missionComplete() {
  if (!game || !game.mission) return false;
  const mission = game.mission;
  const wearPct = Math.floor(Math.min(100, game.wear / game.stats.wearLimit * 100));
  const fuelPct = Math.floor(Math.max(0, game.fuel / game.stats.maxFuel * 100));
  if (mission.targetParts && game.parts >= mission.targetParts) return true;
  if (mission.needRepair && game.usedRepair) return true;
  if (mission.targetHazards && game.hazardsCleared >= mission.targetHazards && (!mission.maxWearPct || wearPct <= mission.maxWearPct)) return true;
  if (mission.target && game.distanceM >= mission.target && (!mission.maxWearPct || wearPct <= mission.maxWearPct) && (!mission.minFuelPct || fuelPct >= mission.minFuelPct)) return true;
  return false;
}

function completeMission(showEvent = true) {
  const mission = game.mission;
  if (!mission || saveData.completedMissions.includes(mission.key) || !missionComplete()) return;
  saveData.completedMissions.push(mission.key);
  saveData.coins += mission.rewardCoins;
  saveData.parts += mission.rewardParts;
  if (showEvent) triggerEvent(`Mission Complete +${mission.rewardCoins}C`);
  saveGameData();
}

function finishRun(completed) {
  if (game.finished) return;
  game.finished = true;
  const bonus = Math.floor(game.distanceM / 75);
  saveData.coins += bonus;
  saveData.parts += game.parts;
  saveData.lifetimeWear += Math.floor(game.wear);
  if (game.distanceM > saveData.bestDistance) {
    saveData.bestDistance = Math.floor(game.distanceM);
    saveData.bestTrail = game.samples.slice(-520);
  }
  completeMission(false);
  saveGameData();
  const title = completed ? 'Route Complete' : game.wear >= game.stats.wearLimit ? 'Vehicle Worn Out' : 'Out of Fuel';
  const copy = `${Math.floor(game.distanceM)}m reached. Bonus +${bonus} coins. Run collected +${game.coins} coins, +${game.parts} parts, +${game.tools} tools.`;
  game.message = copy;
  showEndPanel(title, copy);
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
    renderMissionPanel();
    renderVehiclePanel();
    renderGaragePanel();
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
  renderVehiclePanel();
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
  renderVehiclePanel();
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
  renderGaragePanel();
  resetRun();
  updateHud();
  draw();
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
