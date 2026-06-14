const originalUrl = '/src/ui/roadRunnerRuntimeV6.js?v=progression-source';

const WORLD_ROUTES = `const ROUTES = {
  track: { label: 'PH: Barangay Test Loop', profile: 'barangay', length: 9800, meters: 3200, reward: 1.05, difficulty: 0.75, skyA: '#7ddcff', skyB: '#d9fbff', grass: '#58b957', road: '#2d3748', seed: 4, unlock: 0 },
  japan: { label: 'Japan: Touge Night Run', profile: 'mountain', length: 11200, meters: 3600, reward: 1.12, difficulty: 1.00, skyA: '#9ed8ff', skyB: '#f5d0fe', grass: '#4f9e52', road: '#303847', seed: 11, unlock: 450 },
  china: { label: 'China: Great Wall Ridge', profile: 'mountain', length: 12400, meters: 4050, reward: 1.18, difficulty: 1.12, skyA: '#93c5fd', skyB: '#fde68a', grass: '#6b8e3d', road: '#3f3f46', seed: 21, unlock: 900 },
  thailand: { label: 'Thailand: Market Coast', profile: 'barangay', length: 10800, meters: 3500, reward: 1.10, difficulty: 0.95, skyA: '#8bdcff', skyB: '#fed7aa', grass: '#65a30d', road: '#475569', seed: 31, unlock: 1300 },
  india: { label: 'India: Monsoon Highway', profile: 'farm', length: 11800, meters: 3900, reward: 1.18, difficulty: 1.12, skyA: '#7dd3fc', skyB: '#c7d2fe', grass: '#84cc16', road: '#4b5563', seed: 41, unlock: 1800 },
  uae: { label: 'UAE: Desert Express', profile: 'port', length: 12600, meters: 4200, reward: 1.22, difficulty: 1.18, skyA: '#93c5fd', skyB: '#fde68a', grass: '#d6a85c', road: '#3f3f46', seed: 51, unlock: 2300 },
  egypt: { label: 'Egypt: Nile Desert Run', profile: 'port', length: 13200, meters: 4400, reward: 1.25, difficulty: 1.22, skyA: '#bae6fd', skyB: '#fef3c7', grass: '#c2a24a', road: '#44403c', seed: 61, unlock: 2900 },
  italy: { label: 'Italy: Coastal Sprint', profile: 'track', length: 11600, meters: 3800, reward: 1.20, difficulty: 1.05, skyA: '#7dd3fc', skyB: '#dbeafe', grass: '#22c55e', road: '#334155', seed: 71, unlock: 3500 },
  usa: { label: 'USA: Route 365 Highway', profile: 'track', length: 14200, meters: 4700, reward: 1.30, difficulty: 1.25, skyA: '#60a5fa', skyB: '#e0f2fe', grass: '#4ade80', road: '#1f2937', seed: 81, unlock: 4300 },
  brazil: { label: 'Brazil: Rainforest Rally', profile: 'farm', length: 15000, meters: 5000, reward: 1.38, difficulty: 1.38, skyA: '#67e8f9', skyB: '#bbf7d0', grass: '#16a34a', road: '#3f3f46', seed: 91, unlock: 5200 },
  canada: { label: 'Canada: Northern Forest Run', profile: 'mountain', length: 15400, meters: 5100, reward: 1.42, difficulty: 1.42, skyA: '#bfdbfe', skyB: '#f8fafc', grass: '#15803d', road: '#334155', seed: 101, unlock: 6100 },
  australia: { label: 'Australia: Outback Sprint', profile: 'port', length: 16000, meters: 5300, reward: 1.46, difficulty: 1.48, skyA: '#7dd3fc', skyB: '#fed7aa', grass: '#c0843f', road: '#44403c', seed: 111, unlock: 7100 },
  germany: { label: 'Germany: Autobahn Test', profile: 'track', length: 16600, meters: 5500, reward: 1.50, difficulty: 1.30, skyA: '#93c5fd', skyB: '#e5e7eb', grass: '#4ade80', road: '#1f2937', seed: 121, unlock: 8200 },
  uk: { label: 'UK: Rainy Country Road', profile: 'farm', length: 15000, meters: 4950, reward: 1.44, difficulty: 1.44, skyA: '#94a3b8', skyB: '#dbeafe', grass: '#22c55e', road: '#374151', seed: 131, unlock: 9300 },
  mexico: { label: 'Mexico: Baja Dust Trail', profile: 'port', length: 17000, meters: 5600, reward: 1.55, difficulty: 1.55, skyA: '#7dd3fc', skyB: '#fde68a', grass: '#ca8a04', road: '#57534e', seed: 141, unlock: 10500 },
  southAfrica: { label: 'South Africa: Safari Ridge', profile: 'farm', length: 17600, meters: 5850, reward: 1.60, difficulty: 1.60, skyA: '#67e8f9', skyB: '#fef3c7', grass: '#84cc16', road: '#44403c', seed: 151, unlock: 11800 },
  korea: { label: 'Korea: Neon City Climb', profile: 'mountain', length: 16800, meters: 5550, reward: 1.54, difficulty: 1.50, skyA: '#a78bfa', skyB: '#bae6fd', grass: '#16a34a', road: '#334155', seed: 161, unlock: 13200 },
  indonesia: { label: 'Indonesia: Island Volcano Road', profile: 'mountain', length: 18400, meters: 6100, reward: 1.66, difficulty: 1.68, skyA: '#67e8f9', skyB: '#bbf7d0', grass: '#15803d', road: '#3f3f46', seed: 171, unlock: 14800 },
  france: { label: 'France: Alpine Vineyard Pass', profile: 'mountain', length: 17800, meters: 5900, reward: 1.62, difficulty: 1.58, skyA: '#93c5fd', skyB: '#fce7f3', grass: '#65a30d', road: '#374151', seed: 181, unlock: 16500 },
  spain: { label: 'Spain: Mediterranean Rally', profile: 'track', length: 18600, meters: 6200, reward: 1.70, difficulty: 1.62, skyA: '#7dd3fc', skyB: '#fed7aa', grass: '#22c55e', road: '#334155', seed: 191, unlock: 18400 }
};`;

const VEHICLE_ROSTER = `const VEHICLES = {
  hatchback: { label: 'Starter Hatchback', asset: 'hatchback', unlock: { coins: 0, parts: 0 }, speed: 1, accel: 1, fuel: 1, handling: 1, durability: 1, description: 'Balanced starter car.' },
  greenCompact: { label: 'Compact Sport', asset: 'greenCompact', unlock: { coins: 180, parts: 1 }, speed: 1.08, accel: 1.08, fuel: 0.96, handling: 1.05, durability: 0.95, description: 'Cheap early speed upgrade.' },
  cityTaxi: { label: 'City Taxi', asset: 'greenCompact', unlock: { coins: 260, parts: 2 }, speed: 1.03, accel: 1.12, fuel: 1.05, handling: 1.12, durability: 0.98, description: 'Quick launch and good control.' },
  pickup: { label: 'Parts Pickup', asset: 'pickup', unlock: { coins: 420, parts: 4 }, speed: 0.96, accel: 0.95, fuel: 1.2, handling: 1.08, durability: 1.22, description: 'Carries more fuel and survives longer.' },
  rallyLite: { label: 'Rally Lite', asset: 'offroad', unlock: { coins: 640, parts: 6 }, speed: 1.06, accel: 1.10, fuel: 1.02, handling: 1.28, durability: 1.14, description: 'Great first rough-road car.' },
  serviceVan: { label: 'Service Van', asset: 'serviceVan', unlock: { coins: 820, parts: 8 }, speed: 0.92, accel: 0.90, fuel: 1.35, handling: 1.04, durability: 1.35, description: 'Endurance route vehicle.' },
  desertRunner: { label: 'Desert Runner', asset: 'pickup', unlock: { coins: 1050, parts: 11 }, speed: 1.02, accel: 1.02, fuel: 1.28, handling: 1.18, durability: 1.34, description: 'Built for UAE, Egypt, Australia, and Mexico.' },
  offroad: { label: 'Off-Road Truck', asset: 'offroad', unlock: { coins: 1300, parts: 14 }, speed: 1, accel: 1, fuel: 1.18, handling: 1.36, durability: 1.52, description: 'Best for rough roads and potholes.' },
  exportVan: { label: 'Export Support Van', asset: 'serviceVan', unlock: { coins: 1650, parts: 18 }, speed: 0.94, accel: 0.94, fuel: 1.5, handling: 1.08, durability: 1.55, description: 'Long-distance support vehicle.' },
  race: { label: 'Purple Race Coupe', asset: 'race', unlock: { coins: 2050, parts: 22 }, speed: 1.24, accel: 1.18, fuel: 0.90, handling: 1.08, durability: 0.85, description: 'Fastest early track vehicle.' },
  mountainCourier: { label: 'Mountain Courier', asset: 'offroad', unlock: { coins: 2600, parts: 28 }, speed: 1.10, accel: 1.08, fuel: 1.18, handling: 1.42, durability: 1.38, description: 'Strong hill climbing and stable handling.' },
  superCoupe: { label: '365 Super Coupe', asset: 'race', unlock: { coins: 3400, parts: 36 }, speed: 1.38, accel: 1.28, fuel: 0.86, handling: 1.16, durability: 0.92, description: 'High speed endgame coupe.' }
};`;

const patchedHazard = `function hazardDamage(hazard) {
  if (!hazard) return { slow: 1, wear: 0 };
  const kmh = Math.abs(game.speed) * 0.55;
  const over = Math.max(0, kmh - 50);
  const scale = over <= 0 ? 0 : Math.pow(clamp(over / 55, 0, 1.8), 1.35);
  const brakeCut = input.brake ? 0.32 : 1;
  const suspensionCut = clamp(1.12 - saveData.upgrades.suspension * 0.04, 0.42, 1.0);
  const baseWear = hazard.type === 'pothole' ? 0.48 : hazard.type === 'rough' ? 0.26 : hazard.type === 'gravel' ? 0.16 : 0.08;
  const slow = hazard.type === 'mud' ? 0.76 : hazard.type === 'gravel' ? 0.89 : hazard.type === 'rough' ? 0.92 : 0.84;
  return { slow, wear: baseWear * scale * brakeCut * suspensionCut };
}

function publishLiveRacerTelemetry(hazard) {
  if (!game) return;
  const kmh = Math.max(0, Math.abs(game.speed) * 0.55);
  const label = kmh <= 50 ? 'ZERO DMG' : kmh < 63 ? 'SMALL' : kmh < 75 ? 'MINOR' : kmh < 89 ? 'MODERATE' : kmh < 105 ? 'LOTS' : 'EPIC DMG';
  window.__rrTelemetry = { speedKmh: kmh, hazardSpeedKmh: kmh, damageLabel: label, hazardType: hazard ? hazard.type : null, gas: !!input.gas, brake: !!input.brake, t: performance.now() };
}
`;

const patchedGhostPoint = `function ghostPoint(index, height) {
  const route = game.route;
  let targetX;
  if (index === 0 && saveData.bestTrail.length > 5) {
    const target = Math.max(0, game.elapsed - index * 0.8);
    let before = saveData.bestTrail[0];
    let after = saveData.bestTrail[saveData.bestTrail.length - 1];
    for (let i = 1; i < saveData.bestTrail.length; i += 1) {
      if (saveData.bestTrail[i].t >= target) { after = saveData.bestTrail[i]; before = saveData.bestTrail[i - 1] || after; break; }
    }
    const span = Math.max(0.001, after.t - before.t);
    const mix = clamp((target - before.t) / span, 0, 1);
    targetX = before.x + (after.x - before.x) * mix;
  } else {
    const pace = 0.9 + index * 0.08;
    targetX = 80 + Math.max(0, game.elapsed - index * 0.75) * (game.stats.topSpeed * pace * 0.58);
  }
  if (!game.ghostSmooth) game.ghostSmooth = [];
  const current = game.ghostSmooth[index];
  const targetY = routeY(route, targetX, height) - 30;
  if (!current || Math.abs(current.x - targetX) > 520) game.ghostSmooth[index] = { x: targetX, y: targetY };
  else { current.x += (targetX - current.x) * 0.16; current.y += (targetY - current.y) * 0.16; }
  const smoothed = game.ghostSmooth[index];
  return { x: smoothed.x, y: smoothed.y };
}`;

const patchedRunMeters = `function drawHudPill(x, y, width, iconKey, label, value, accent) {
  ctx.save();
  ctx.fillStyle = 'rgba(4,17,29,.78)';
  roundRect(x, y, width, 27, 13);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.16)';
  ctx.lineWidth = 1;
  ctx.stroke();
  const img = images[iconKey];
  if (img && img.ready) ctx.drawImage(img, x + 6, y + 4, 19, 19);
  else { ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(x + 16, y + 14, 9, 0, Math.PI * 2); ctx.fill(); }
  ctx.textAlign = 'left';
  ctx.fillStyle = '#c7f9ff';
  ctx.font = '800 7px Arial';
  ctx.fillText(label, x + 30, y + 10);
  ctx.fillStyle = '#ffffff';
  ctx.font = '1000 12px Arial';
  ctx.fillText(value, x + 30, y + 23);
  ctx.restore();
}
function drawRunMeters(width, height) {
  const fuelPct = game.fuel / game.stats.maxFuel;
  const wearPct = Math.min(1, game.wear / game.stats.wearLimit);
  drawBar(14, 42, 150, 11, 'Fuel', fuelPct, '#22c55e');
  drawBar(14, 58, 150, 11, 'Wear', wearPct, wearPct > 0.75 ? '#ef4444' : '#f59e0b');
  const startX = 12;
  const y = 75;
  const gap = 5;
  const pillW = Math.max(58, Math.min(74, Math.floor((width - 30) / 4)));
  drawHudPill(startX, y, pillW, 'coin', 'Coins', '+' + game.coins, '#facc15');
  drawHudPill(startX + (pillW + gap), y, pillW, 'parts', 'Parts', '+' + game.parts, '#a78bfa');
  drawHudPill(startX + (pillW + gap) * 2, y, pillW, 'tools', 'Tools', '+' + game.tools, '#f97316');
  drawHudPill(startX + (pillW + gap) * 3, y, pillW + 12, 'fuel', 'Fuel', nextFuelMeters() + 'm', '#38bdf8');
  if (game.fuel / game.stats.maxFuel < 0.18 && nextFuelMeters() > 220) drawOutlinedText('LOW FUEL - COAST OR FIND STATION', width / 2, 116, '14px');
  if (game.eventTimer > 0) drawOutlinedText(game.eventText, width / 2, 122, '14px');
}`;

const oldWearLine = 'game.wear += (pitchStress * Math.abs(game.speed) * 0.014 + overspeedStress + hazardEffect.wear) * dt * 60 / game.stats.durability;';
const newWearLine = `const movingChassisWear = Math.abs(game.speed) > 2 ? pitchStress * Math.abs(game.speed) * 0.014 : 0;
  game.wear += (movingChassisWear + overspeedStress + hazardEffect.wear) * dt * 60 / game.stats.durability;`;
function replaceBlock(source, startToken, endToken, replacement) { const start = source.indexOf(startToken); const end = source.indexOf(endToken, start); if (start < 0 || end < 0) return { source, patched: false }; return { source: source.slice(0, start) + replacement + source.slice(end), patched: true }; }
function replaceFunction(source, name, replacement, nextName) { return replaceBlock(source, `function ${name}`, `\nfunction ${nextName}`, replacement); }
function patchRuntime(source) {
  const routes = replaceBlock(source, 'const ROUTES = {', '\n\nconst GHOST_MODES', WORLD_ROUTES);
  let patched = routes.source;
  const vehicles = replaceBlock(patched, 'const VEHICLES = {', '\n\nconst UPGRADES', VEHICLE_ROSTER);
  patched = vehicles.source;
  const hazard = replaceFunction(patched, 'hazardDamage(hazard)', patchedHazard, 'update(dt)');
  patched = hazard.source;
  let wearPatched = false;
  if (patched.includes(oldWearLine)) { patched = patched.replace(oldWearLine, newWearLine); wearPatched = true; }
  const telemetryHook = 'game.distanceM = routeMeters(route, game.distancePx);';
  let livePatched = false;
  if (patched.includes(telemetryHook)) { patched = patched.replace(telemetryHook, `${telemetryHook}\n  publishLiveRacerTelemetry(hazard);`); livePatched = true; }
  const ghost = replaceFunction(patched, 'ghostPoint(index, height)', patchedGhostPoint, 'drawPlayer(width, height, route, cameraX)');
  patched = ghost.source;
  const hud = replaceFunction(patched, 'drawRunMeters(width, height)', patchedRunMeters, 'drawBar(x, y, width, height, label, pct, color)');
  patched = hud.source;
  return { patched, routesPatched: routes.patched, vehiclesPatched: vehicles.patched, hazardPatched: hazard.patched, wearPatched, livePatched, ghostPatched: ghost.patched, hudPatched: hud.patched };
}
async function loadRuntime() { const response = await fetch(originalUrl, { cache: 'no-store' }); if (!response.ok) throw new Error(`Failed to load racer runtime: ${response.status}`); const source = await response.text(); const result = patchRuntime(source); const blob = new Blob([result.patched], { type: 'text/javascript' }); await import(URL.createObjectURL(blob)); console.info('[365 Racer] Progression runtime loaded', result); }
loadRuntime().catch((error) => { console.error('[365 Racer] Progression runtime patch failed. Loading original V6.', error); import(originalUrl); });
