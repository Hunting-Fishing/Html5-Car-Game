const SAVE_KEY = '365_canvas_road_runner_v1';

const ROUTES = {
  track: { label: '365 Test Track', profile: 'track', length: 9600, meters: 3200, reward: 1.05, skyA: '#7ddcff', skyB: '#d9fbff', grass: '#58b957', road: '#2d3748', seed: 4 },
  barangay: { label: 'Barangay Route', profile: 'barangay', length: 10400, meters: 3500, reward: 1, skyA: '#8bdcff', skyB: '#e1fbff', grass: '#5fbf57', road: '#3a4555', seed: 1 },
  farm: { label: 'Farm Supply Run', profile: 'farm', length: 11600, meters: 3900, reward: 1.15, skyA: '#9ee8ff', skyB: '#e7fcff', grass: '#66bd45', road: '#554537', seed: 3 },
  mountain: { label: 'Mountain Parts Run', profile: 'mountain', length: 13600, meters: 4600, reward: 1.25, skyA: '#86d4ff', skyB: '#e0f7ff', grass: '#4f9e52', road: '#39414d', seed: 2 },
  port: { label: 'Port Export Route', profile: 'port', length: 14800, meters: 5000, reward: 1.35, skyA: '#93dfff', skyB: '#e4fbff', grass: '#49a985', road: '#36414d', seed: 5 }
};

const GHOST_MODES = {
  solo: { label: 'Solo', count: 0 },
  ghost2: { label: '1 Ghost', count: 1 },
  ghost3: { label: '2 Ghosts', count: 2 },
  ghost4: { label: '3 Ghosts', count: 3 }
};

const VEHICLES = {
  hatchback: { label: 'Starter Hatchback', asset: 'hatchback', unlock: { coins: 0, parts: 0 }, speed: 1, accel: 1, energy: 1, handling: 1, description: 'Balanced starter car.' },
  greenCompact: { label: 'Compact Sport', asset: 'greenCompact', unlock: { coins: 180, parts: 1 }, speed: 1.08, accel: 1.08, energy: 0.96, handling: 1.05, description: 'Faster compact for early ghost runs.' },
  pickup: { label: 'Parts Pickup', asset: 'pickup', unlock: { coins: 360, parts: 3 }, speed: 0.96, accel: 0.95, energy: 1.20, handling: 1.08, description: 'Longer range and better stability.' },
  serviceVan: { label: 'Service Van', asset: 'serviceVan', unlock: { coins: 720, parts: 6 }, speed: 0.92, accel: 0.90, energy: 1.35, handling: 1.04, description: 'Endurance vehicle for long routes.' },
  offroad: { label: 'Off-Road Truck', asset: 'offroad', unlock: { coins: 1100, parts: 10 }, speed: 1.00, accel: 1.00, energy: 1.18, handling: 1.32, description: 'Best for mountain and rough routes.' },
  race: { label: 'Purple Race Coupe', asset: 'race', unlock: { coins: 1450, parts: 12 }, speed: 1.24, accel: 1.18, energy: 0.90, handling: 1.08, description: 'Fastest track vehicle.' }
};

const UPGRADES = {
  engine: { label: 'Engine', description: 'More acceleration.', max: 15, baseCoins: 45, baseParts: 0, growth: 1.42, partsEvery: 4 },
  tires: { label: 'Tires', description: 'Higher speed and less drag.', max: 15, baseCoins: 40, baseParts: 0, growth: 1.40, partsEvery: 3 },
  energyTank: { label: 'Energy Tank', description: 'More starting energy.', max: 15, baseCoins: 55, baseParts: 0, growth: 1.45, partsEvery: 3 },
  suspension: { label: 'Suspension', description: 'Smoother hill handling.', max: 15, baseCoins: 45, baseParts: 0, growth: 1.42, partsEvery: 3 }
};

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
  energy: '/assets/road-runner/token-energy.svg',
  parts: '/assets/road-runner/token-parts.svg'
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

function defaultUpgrades() { return { engine: 1, tires: 1, energyTank: 1, suspension: 1 }; }
function defaultUnlocked() { return ['hatchback']; }
function normalizeUpgrades(upgrades = {}) {
  const result = {};
  Object.keys(defaultUpgrades()).forEach((key) => { result[key] = Math.max(1, Math.min(UPGRADES[key].max, Number(upgrades[key] || 1))); });
  return result;
}
function loadSave() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    const unlockedVehicles = Array.isArray(parsed.unlockedVehicles) && parsed.unlockedVehicles.length ? parsed.unlockedVehicles : defaultUnlocked();
    const selectedVehicle = unlockedVehicles.includes(parsed.selectedVehicle) ? parsed.selectedVehicle : 'hatchback';
    return { coins: parsed.coins || 0, parts: parsed.parts || 0, bestDistance: parsed.bestDistance || 0, bestTrail: Array.isArray(parsed.bestTrail) ? parsed.bestTrail : [], upgrades: normalizeUpgrades(parsed.upgrades), unlockedVehicles, selectedVehicle };
  } catch {
    return { coins: 0, parts: 0, bestDistance: 0, bestTrail: [], upgrades: defaultUpgrades(), unlockedVehicles: defaultUnlocked(), selectedVehicle: 'hatchback' };
  }
}
function saveGameData() { localStorage.setItem(SAVE_KEY, JSON.stringify(saveData)); }
function fmt(value) { if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`; if (value >= 1000) return `${(value / 1000).toFixed(1)}K`; return `${Math.floor(value)}`; }
function upgradeCost(key, level) { const item = UPGRADES[key]; if (!item || level >= item.max) return { coins: Infinity, parts: Infinity }; return { coins: Math.round(item.baseCoins * Math.pow(item.growth, level - 1)), parts: item.baseParts + Math.floor(level / item.partsEvery) }; }
function selectedVehicle() { return VEHICLES[saveData.selectedVehicle] || VEHICLES.hatchback; }
function vehicleStats() {
  const u = normalizeUpgrades(saveData.upgrades);
  const vehicle = selectedVehicle();
  return { acceleration: (82 + u.engine * 8) * vehicle.accel, topSpeed: (130 + u.tires * 6) * vehicle.speed, drag: Math.max(3.5, 11 - u.tires * 0.35), startEnergy: (95 + u.energyTank * 18) * vehicle.energy, energyUse: Math.max(1.9, 3.9 - u.energyTank * 0.08), handling: (0.08 + u.suspension * 0.012) * vehicle.handling };
}
function routeMeters(route, pixels) { return Math.floor(Math.max(0, pixels) * (route.meters / route.length)); }
function routeY(route, x, height) {
  const base = Math.max(160, Math.min(height - 126, height * 0.60));
  const seed = route.seed || 1;
  if (route.profile === 'track') return base + Math.sin((x + seed * 90) / 430) * 14 + Math.sin((x + seed * 40) / 190) * 6 + Math.sin((x + seed * 20) / 820) * 16;
  if (route.profile === 'mountain') return base + Math.sin((x + seed * 160) / 180) * 42 + Math.sin((x + seed * 85) / 74) * 13 - Math.sin((x + seed * 60) / 520) * 46;
  if (route.profile === 'farm') return base + Math.sin((x + seed * 120) / 240) * 26 + Math.sin((x + seed * 70) / 96) * 10 - Math.sin((x + seed * 30) / 680) * 22;
  if (route.profile === 'port') return base + Math.sin((x + seed * 110) / 360) * 20 + Math.sin((x + seed * 55) / 155) * 7 - Math.sin((x + seed * 40) / 940) * 24;
  return base + Math.sin((x + seed * 120) / 175) * 24 + Math.sin((x + seed * 70) / 78) * 9 - Math.sin((x + seed * 30) / 540) * 26;
}
function routeAngle(route, x, height) { const rise = routeY(route, x + 8, height) - routeY(route, x - 8, height); return Math.max(-0.55, Math.min(0.55, (rise / 16) * 0.42)); }
function loadImages() { const result = {}; Object.entries(ASSET_PATHS).forEach(([key, path]) => { const img = new Image(); img.onload = () => { img.ready = true; }; img.onerror = () => { img.ready = false; }; img.src = path; result[key] = img; }); return result; }
function makePickups(route) { const pickups = []; const spacing = route.profile === 'track' ? 245 : 210; for (let x = 320; x < route.length - 260; x += spacing) { const type = x % (spacing * 6) === 0 ? 'energy' : x % (spacing * 4) === 0 ? 'parts' : 'coin'; pickups.push({ x, type, collected: false }); } return pickups; }
function resetRun() { const route = ROUTES[activeRoute]; const stats = vehicleStats(); game = { route, stats, x: 80, speed: 0, energy: stats.startEnergy, distancePx: 0, distanceM: 0, coins: 0, parts: 0, elapsed: 0, finished: false, pickups: makePickups(route), samples: [], lastSample: 0, message: '', ghostColors: ['#22c55e', '#f97316', '#e5e7eb'] }; updateHud(); }

function shellHtml() {
  return `
    <section class="card roadRunnerShell">
      <div class="roadRunnerHeader"><h2>365 Hill Route - Race UX Phase 2</h2><p>Now includes restart, opponent info, vehicle selection, upgrades, pickup legend, and visible race identity.</p></div>
      <div class="roadRunnerHud"><div class="roadRunnerStat"><b data-rr-distance>0m</b><span>Distance</span></div><div class="roadRunnerStat"><b data-rr-fuel>100%</b><span>Energy</span></div><div class="roadRunnerStat"><b data-rr-coins>${fmt(saveData.coins)}</b><span>Coins</span></div><div class="roadRunnerStat"><b data-rr-parts>${fmt(saveData.parts)}</b><span>Parts</span></div><div class="roadRunnerStat"><b data-rr-best>${fmt(saveData.bestDistance)}m</b><span>Best</span></div></div>
      <div class="roadRunnerQuickPanel"><button class="btn primary" onclick="window.restartHillRoute?.()">Restart Run</button><div class="roadRunnerVs" data-rr-vs></div><div class="roadRunnerLegend"><span><i class="coin"></i>Coins</span><span><i class="energy"></i>Energy</span><span><i class="parts"></i>Parts</span></div></div>
      <div class="roadRunnerGameFrame"><div id="roadRunnerGameHost"><canvas id="roadRunnerCanvas"></canvas></div><div class="roadRunnerOverlay"><div class="roadRunnerBadge" data-rr-route>${ROUTES[activeRoute].label}</div><div class="roadRunnerBadge" data-rr-mode>${GHOST_MODES[activeGhostMode].label}</div></div><div class="roadRunnerControlHint">Hold GAS to move. Hold BRAKE to slow. Keyboard: Right/Left or D/A.</div><div class="roadRunnerControls"><button class="roadRunnerPedal brake" data-rr-control="brake">BRAKE</button><button class="roadRunnerPedal gas" data-rr-control="gas">GAS</button></div></div>
      <section class="roadRunnerPanel"><div class="roadRunnerPanelTitle"><h3>Ghost Race</h3><span class="roadRunnerNotice">You are racing computer ghosts or your saved best trail.</span></div><div class="roadRunnerModeGrid">${Object.entries(GHOST_MODES).map(([key, value]) => `<button class="btn ${key === activeGhostMode ? 'primary' : 'ghost'}" onclick="window.setHillGhosts?.('${key}')">${value.label}</button>`).join('')}</div></section>
      <section class="roadRunnerPanel"><div class="roadRunnerPanelTitle"><h3>Routes</h3><span class="roadRunnerNotice">Track is easiest. Mountain and Port are endurance routes.</span></div><div class="roadRunnerModeGrid">${Object.entries(ROUTES).map(([key, value]) => `<button class="btn ${key === activeRoute ? 'gold' : 'ghost'}" onclick="window.setHillRoute?.('${key}')">${value.label}</button>`).join('')}</div></section>
      <section class="roadRunnerPanel" data-road-runner-vehicles></section>
      <section class="roadRunnerPanel" data-road-runner-garage></section>
    </section>`;
}

function updateHud() {
  if (!game) return;
  const energyPercent = Math.max(0, Math.min(100, game.energy / game.stats.startEnergy * 100));
  setText('[data-rr-distance]', `${Math.floor(game.distanceM)}m`);
  setText('[data-rr-fuel]', `${Math.floor(energyPercent)}%`);
  setText('[data-rr-coins]', fmt(saveData.coins));
  setText('[data-rr-parts]', fmt(saveData.parts));
  setText('[data-rr-best]', `${fmt(saveData.bestDistance)}m`);
  setText('[data-rr-route]', ROUTES[activeRoute].label);
  setText('[data-rr-mode]', GHOST_MODES[activeGhostMode].label);
  setText('[data-rr-vs]', `You: ${selectedVehicle().label}  |  Opponent: ${activeGhostMode === 'solo' ? 'None' : saveData.bestTrail.length ? 'Your Best Ghost' : 'Computer Ghosts'}`);
  renderVehiclePanel();
  renderGaragePanel();
}
function setText(selector, value) { const element = document.querySelector(selector); if (element) element.textContent = value; }

function renderVehiclePanel() {
  const panel = document.querySelector('[data-road-runner-vehicles]');
  if (!panel) return;
  panel.innerHTML = `<div class="roadRunnerPanelTitle"><h3>Vehicle Selection</h3><span class="roadRunnerNotice">Choose vehicle before starting a run.</span></div><div class="roadRunnerVehicleGrid">${Object.entries(VEHICLES).map(([key, item]) => vehicleCard(key, item)).join('')}</div>`;
}
function vehicleCard(key, item) {
  const unlocked = saveData.unlockedVehicles.includes(key);
  const selected = saveData.selectedVehicle === key;
  const canUnlock = saveData.coins >= item.unlock.coins && saveData.parts >= item.unlock.parts;
  const action = unlocked ? `window.selectRoadRunnerVehicle?.('${key}')` : `window.unlockRoadRunnerVehicle?.('${key}')`;
  const buttonText = selected ? 'Selected' : unlocked ? 'Select' : canUnlock ? `Unlock ${fmt(item.unlock.coins)}C / ${item.unlock.parts}P` : `Locked ${fmt(item.unlock.coins)}C / ${item.unlock.parts}P`;
  const buttonClass = selected ? 'gold' : unlocked || canUnlock ? 'primary' : 'ghost';
  const img = ASSET_PATHS[item.asset];
  return `<div class="roadRunnerVehicleCard ${selected ? 'selected' : ''}"><div class="vehicleThumb">${img ? `<img src="${img}" alt="${item.label}" />` : ''}</div><h4>${item.label}</h4><p>${item.description}</p><div class="vehicleStats">SPD ${item.speed.toFixed(2)} • ACC ${item.accel.toFixed(2)} • ENG ${item.energy.toFixed(2)}</div><button class="btn ${buttonClass}" ${(!unlocked && !canUnlock) || selected ? 'disabled' : ''} onclick="${action}">${buttonText}</button></div>`;
}

function renderGaragePanel() {
  const panel = document.querySelector('[data-road-runner-garage]');
  if (!panel) return;
  panel.innerHTML = `<div class="roadRunnerPanelTitle"><h3>Garage Upgrades</h3><span class="roadRunnerNotice">This is where you upgrade the car.</span></div><div class="roadRunnerWalletRow"><div class="roadRunnerWalletPill">Coins: ${fmt(saveData.coins)}</div><div class="roadRunnerWalletPill">Parts: ${fmt(saveData.parts)}</div></div><div class="roadRunnerGarageGrid">${Object.entries(UPGRADES).map(([key, item]) => upgradeCard(key, item)).join('')}</div>`;
}
function upgradeCard(key, item) { const level = saveData.upgrades[key] || 1; const maxed = level >= item.max; const cost = upgradeCost(key, level); const canBuy = !maxed && saveData.coins >= cost.coins && saveData.parts >= cost.parts; return `<div class="roadRunnerUpgradeCard"><h4>${item.label} Lv.${level}</h4><p>${item.description}</p><div class="roadRunnerUpgradeMeta"><span>${maxed ? 'Max' : `Next Lv.${level + 1}`}</span><span>${maxed ? 'MAX' : `${fmt(cost.coins)} coins - ${cost.parts} parts`}</span></div><button class="btn ${canBuy ? 'primary' : 'ghost'}" ${canBuy ? '' : 'disabled'} onclick="window.buyRoadRunnerUpgrade?.('${key}')">${maxed ? 'Maxed' : 'Upgrade'}</button></div>`; }

function draw() { if (!canvas || !ctx || !game) return; const width = canvas.width; const height = canvas.height; const route = game.route; const cameraX = Math.max(0, Math.min(route.length - width + 260, game.x - width * 0.34)); drawBackground(width, height, route, cameraX); drawRoad(width, height, route, cameraX); drawPickups(width, height, route, cameraX); drawGhosts(width, height, route, cameraX); drawPlayer(width, height, route, cameraX); drawFinish(width, height, route, cameraX); drawTopDebug(); if (game.finished) drawFinishMessage(width, height); }
function drawBackground(width, height, route, cameraX) { const sky = ctx.createLinearGradient(0, 0, 0, height); sky.addColorStop(0, route.skyA); sky.addColorStop(0.58, route.skyB); sky.addColorStop(0.59, route.grass); sky.addColorStop(1, '#2f8f3f'); ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height); for (let wx = Math.floor(cameraX / 520) * 520 - 200; wx < cameraX + width + 520; wx += 520) { const x = wx - cameraX; const y = 52 + (wx % 110); ctx.globalAlpha = 0.70; ctx.fillStyle = '#ffffff'; roundedCloud(x, y); ctx.globalAlpha = 1; } ctx.fillStyle = 'rgba(47,143,63,0.28)'; for (let wx = Math.floor(cameraX / 360) * 360 - 360; wx < cameraX + width + 360; wx += 360) { const x = wx - cameraX; const y = height * 0.76; ctx.beginPath(); ctx.ellipse(x + 160, y, 240, 74, 0, 0, Math.PI * 2); ctx.fill(); } }
function roundedCloud(x, y) { ctx.beginPath(); ctx.arc(x, y + 8, 22, 0, Math.PI * 2); ctx.arc(x + 26, y, 28, 0, Math.PI * 2); ctx.arc(x + 58, y + 10, 20, 0, Math.PI * 2); ctx.fill(); }
function drawRoad(width, height, route, cameraX) { const start = Math.max(0, cameraX - 80); const end = Math.min(route.length + 260, cameraX + width + 140); ctx.fillStyle = route.grass; ctx.beginPath(); ctx.moveTo(0, height); for (let wx = start; wx <= end; wx += 18) ctx.lineTo(wx - cameraX, routeY(route, wx, height) + 38); ctx.lineTo(end - cameraX, height); ctx.closePath(); ctx.fill(); ctx.strokeStyle = route.road; ctx.lineWidth = route.profile === 'track' ? 34 : 28; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); for (let wx = start; wx <= end; wx += 14) { const x = wx - cameraX; const y = routeY(route, wx, height); if (wx === start) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); if (route.profile === 'track') { ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4; ctx.beginPath(); for (let wx = start; wx <= end; wx += 20) { const x = wx - cameraX; const y = routeY(route, wx, height) - 20; if (wx === start) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); } ctx.strokeStyle = 'rgba(248,250,252,0.62)'; ctx.lineWidth = 4; for (let wx = Math.floor(start / 120) * 120; wx <= end; wx += 120) { ctx.beginPath(); ctx.moveTo(wx - cameraX, routeY(route, wx, height) - 1); ctx.lineTo(wx + 58 - cameraX, routeY(route, wx + 58, height) - 1); ctx.stroke(); } }
function drawPickups(width, height, route, cameraX) { for (const pickup of game.pickups) { if (pickup.collected) continue; const x = pickup.x - cameraX; if (x < -60 || x > width + 60) continue; const y = routeY(route, pickup.x, height) - 34; const img = images[pickup.type]; if (img?.ready) ctx.drawImage(img, x - 20, y - 20, 40, 40); else { ctx.fillStyle = pickup.type === 'energy' ? '#38bdf8' : pickup.type === 'parts' ? '#a78bfa' : '#facc15'; ctx.beginPath(); ctx.arc(x, y, 17, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#06131d'; ctx.font = '900 13px Arial'; ctx.textAlign = 'center'; ctx.fillText(pickup.type === 'energy' ? 'E' : pickup.type === 'parts' ? 'P' : 'C', x, y + 5); } ctx.fillStyle = '#fff'; ctx.font = '900 10px Arial'; ctx.textAlign = 'center'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3; const label = pickup.type === 'energy' ? 'ENERGY' : pickup.type === 'parts' ? 'PARTS' : 'COIN'; ctx.strokeText(label, x, y - 24); ctx.fillText(label, x, y - 24); } }
function drawGhosts(width, height, route, cameraX) { const mode = GHOST_MODES[activeGhostMode]; const ghostKeys = ['ghostA', 'ghostB', 'ghostC']; for (let i = 0; i < mode.count; i++) { const p = ghostPoint(i, height); const x = p.x - cameraX; if (x < -100 || x > width + 120) continue; const name = i === 0 && saveData.bestTrail.length ? 'Best Ghost' : `Computer ${i + 1}`; drawCar(x, p.y, routeAngle(route, p.x, height), images[ghostKeys[i]], name, 0.50, game.ghostColors[i]); } }
function ghostPoint(index, height) { const route = game.route; if (index === 0 && saveData.bestTrail.length > 5) { const target = Math.max(0, game.elapsed - index * 0.8); let sample = saveData.bestTrail[saveData.bestTrail.length - 1]; for (const item of saveData.bestTrail) { if (item.t >= target) { sample = item; break; } } return { x: sample.x, y: routeY(route, sample.x, height) - 30 }; } const pace = 0.90 + index * 0.08; const x = 80 + Math.max(0, game.elapsed - index * 0.75) * (game.stats.topSpeed * pace * 0.58); return { x, y: routeY(route, x, height) - 30 }; }
function drawPlayer(width, height, route, cameraX) { const x = game.x - cameraX; const y = routeY(route, game.x, height) - 30; const angle = routeAngle(route, game.x, height) * game.stats.handling; drawCar(x, y, angle, images[selectedVehicle().asset], 'You', 1, '#3b82f6'); }
function drawCar(x, y, angle, img, label, alpha, color) { ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.globalAlpha = alpha; ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(0, 19, 44, 10, 0, 0, Math.PI * 2); ctx.fill(); if (img?.ready) ctx.drawImage(img, -52, -28, 104, 52); else { ctx.fillStyle = color; roundRect(-34, -14, 68, 28, 9); ctx.fill(); ctx.strokeStyle = '#172033'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(-22, 16, 8, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(22, 16, 8, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); ctx.globalAlpha = alpha; ctx.fillStyle = '#fff'; ctx.font = '900 11px Arial'; ctx.textAlign = 'center'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeText(label, x, y - 42); ctx.fillText(label, x, y - 42); ctx.globalAlpha = 1; }
function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); }
function drawFinish(width, height, route, cameraX) { const x = route.length - cameraX; if (x < -20 || x > width + 30) return; const y = routeY(route, route.length, height); ctx.fillStyle = '#fff'; ctx.fillRect(x - 5, y - 70, 10, 90); ctx.fillStyle = '#111827'; for (let i = 0; i < 6; i++) ctx.fillRect(x - 5 + (i % 2) * 5, y - 70 + i * 10, 5, 10); ctx.fillStyle = '#fff'; ctx.font = '900 12px Arial'; ctx.textAlign = 'center'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeText('FINISH', x, y - 78); ctx.fillText('FINISH', x, y - 78); }
function drawTopDebug() { ctx.fillStyle = 'rgba(4,17,29,0.70)'; roundRect(12, 42, 198, 30, 14); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '900 11px Arial'; ctx.textAlign = 'left'; ctx.fillText(`Speed ${Math.floor(game.speed)}  Vehicle ${selectedVehicle().label}`, 24, 62); }
function drawFinishMessage(width, height) { ctx.fillStyle = 'rgba(4,17,29,0.88)'; roundRect(width / 2 - 150, height / 2 - 52, 300, 104, 18); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '900 16px Arial'; ctx.textAlign = 'center'; ctx.fillText(game.message, width / 2, height / 2 - 8); ctx.font = '800 12px Arial'; ctx.fillText('Tap Restart Run to run again.', width / 2, height / 2 + 18); }
function update(dt) { if (!game || game.finished) return; if (input.gas && game.energy > 0) { game.speed += game.stats.acceleration * dt; game.energy -= game.stats.energyUse * dt; } if (input.brake) game.speed -= 170 * dt; game.speed -= game.stats.drag * dt; game.speed = Math.max(0, Math.min(game.stats.topSpeed, game.speed)); game.x += game.speed * dt; game.distancePx = Math.max(0, game.x - 80); game.distanceM = routeMeters(game.route, game.distancePx); collectVisiblePickups(); if (game.elapsed - game.lastSample > 0.18) { game.samples.push({ t: Number(game.elapsed.toFixed(2)), x: Math.round(game.x) }); game.lastSample = game.elapsed; } if (game.energy <= 0 || game.distancePx >= game.route.length) finishRun(game.distancePx >= game.route.length); updateHud(); }
function collectVisiblePickups() { for (const pickup of game.pickups) { if (pickup.collected) continue; if (Math.abs(game.x - pickup.x) > 42) continue; pickup.collected = true; if (pickup.type === 'energy') game.energy = Math.min(game.stats.startEnergy + 24, game.energy + 18); if (pickup.type === 'parts') game.parts += 1; if (pickup.type === 'coin') game.coins += Math.round(4 * game.route.reward); } }
function finishRun(completed) { game.finished = true; const earned = game.coins + Math.floor(game.distanceM / 55); saveData.coins += earned; saveData.parts += game.parts; if (game.distanceM > saveData.bestDistance) { saveData.bestDistance = Math.floor(game.distanceM); saveData.bestTrail = game.samples.slice(-520); } saveGameData(); game.message = completed ? `Route complete +${earned} coins` : `${Math.floor(game.distanceM)}m +${earned} coins`; updateHud(); }
function loop(timestamp) { if (!document.querySelector('#screen-race.active .roadRunnerShell')) { frameId = requestAnimationFrame(loop); return; } const dt = Math.min((timestamp - lastTime) / 1000 || 0.016, 0.05); lastTime = timestamp; if (game) { game.elapsed += dt; update(dt); draw(); } frameId = requestAnimationFrame(loop); }
function resizeCanvas() { if (!canvas) return; const host = document.querySelector('#roadRunnerGameHost'); if (!host) return; const rect = host.getBoundingClientRect(); const width = Math.max(320, Math.floor(rect.width || 420)); const height = Math.max(320, Math.floor(rect.height || 340)); canvas.width = width; canvas.height = height; canvas.style.width = `${width}px`; canvas.style.height = `${height}px`; }
function bindControls() { document.querySelectorAll('[data-rr-control]').forEach((button) => { const control = button.getAttribute('data-rr-control'); const set = (value, event) => { event?.preventDefault(); if (control === 'gas') input.gas = value; if (control === 'brake') input.brake = value; button.classList.toggle('active', value); }; button.addEventListener('pointerdown', (event) => { button.setPointerCapture?.(event.pointerId); set(true, event); }, { passive: false }); button.addEventListener('pointerup', (event) => set(false, event), { passive: false }); button.addEventListener('pointercancel', (event) => set(false, event), { passive: false }); button.addEventListener('pointerleave', (event) => set(false, event), { passive: false }); }); window.onkeydown = (event) => { if (!document.querySelector('#screen-race.active')) return; if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') input.gas = true; if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') input.brake = true; }; window.onkeyup = (event) => { if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') input.gas = false; if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') input.brake = false; }; }
function mountRoadRunner(force = false) { const screen = document.querySelector('#screen-race.active'); if (!screen) return; if (force || screen !== mountedScreen || !screen.querySelector('.roadRunnerShell')) { saveData = loadSave(); screen.innerHTML = shellHtml(); mountedScreen = screen; canvas = screen.querySelector('#roadRunnerCanvas'); ctx = canvas.getContext('2d'); bindControls(); resizeCanvas(); resetRun(); renderVehiclePanel(); renderGaragePanel(); draw(); } if (!frameId) { lastTime = performance.now(); frameId = requestAnimationFrame(loop); } }
window.restartHillRoute = () => { input.gas = false; input.brake = false; resetRun(); draw(); };
window.setHillGhosts = (mode) => { if (!GHOST_MODES[mode]) return; activeGhostMode = mode; mountRoadRunner(true); };
window.setHillRoute = (route) => { if (!ROUTES[route]) return; activeRoute = route; mountRoadRunner(true); };
window.selectRoadRunnerVehicle = (key) => { if (!saveData.unlockedVehicles.includes(key)) return; saveData.selectedVehicle = key; saveGameData(); resetRun(); renderVehiclePanel(); updateHud(); draw(); };
window.unlockRoadRunnerVehicle = (key) => { const item = VEHICLES[key]; if (!item || saveData.unlockedVehicles.includes(key)) return; if (saveData.coins < item.unlock.coins || saveData.parts < item.unlock.parts) return; saveData.coins -= item.unlock.coins; saveData.parts -= item.unlock.parts; saveData.unlockedVehicles.push(key); saveData.selectedVehicle = key; saveGameData(); resetRun(); renderVehiclePanel(); updateHud(); draw(); };
window.buyRoadRunnerUpgrade = (key) => { const level = saveData.upgrades[key] || 1; const item = UPGRADES[key]; if (!item || level >= item.max) return; const cost = upgradeCost(key, level); if (saveData.coins < cost.coins || saveData.parts < cost.parts) return; saveData.coins -= cost.coins; saveData.parts -= cost.parts; saveData.upgrades[key] = level + 1; saveGameData(); renderGaragePanel(); resetRun(); updateHud(); draw(); };
function inject() { const screen = document.querySelector('#screen-race.active'); if (!screen) return; requestAnimationFrame(() => mountRoadRunner(false)); }
window.addEventListener('resize', () => { resizeCanvas(); draw(); });
const observer = new MutationObserver(() => inject());
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.addEventListener('load', inject);
document.addEventListener('click', () => requestAnimationFrame(inject));
