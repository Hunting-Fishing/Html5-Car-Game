const originalUrl = '/src/ui/roadRunnerRuntimeV6.js?v=stable-runtime';

const ASSET_PATHS = `const ASSET_PATHS = {
  hatchback: '/assets/vehicles/racer/sprite_0000.png',
  greenCompact: '/assets/vehicles/racer/sprite_0010.png',
  pickup: '/assets/vehicles/racer/sprite_0011.png',
  serviceVan: '/assets/vehicles/racer/sprite_0007.png',
  offroad: '/assets/vehicles/racer/sprite_0006.png',
  race: '/assets/vehicles/racer/sprite_0005.png',
  ghostA: '/assets/vehicles/racer/sprite_0010.png',
  ghostB: '/assets/vehicles/racer/sprite_0011.png',
  ghostC: '/assets/vehicles/racer/sprite_0007.png',
  coin: '/assets/road-runner/token-coin.svg',
  fuel: '/assets/road-runner/token-energy.svg',
  parts: '/assets/road-runner/token-parts.svg',
  tools: '/assets/road-runner/tool-kit.svg',
  fuelStation: '/assets/road-runner/fuel-station.svg',
  partsStore: '/assets/road-runner/parts-store.svg',
  mechanicShop: '/assets/road-runner/mechanic-shop.svg',
  wreck: '/assets/road-runner/wrecked-car.svg'
};`;

const HAZARD_DAMAGE = `function hazardDamage(hazard) {
  if (!hazard) return { slow: 1, wear: 0 };
  const kmh = Math.abs(game.speed) * 0.55;
  const over = Math.max(0, kmh - 50);
  const scale = over <= 0 ? 0 : Math.pow(clamp(over / 55, 0, 1.8), 1.35);
  const carefulFactor = input.brake ? 0.32 : 1;
  const suspensionReduction = clamp(1.12 - saveData.upgrades.suspension * 0.04, 0.42, 1.0);
  const baseWear = hazard.type === 'pothole' ? 0.48 : hazard.type === 'rough' ? 0.26 : hazard.type === 'gravel' ? 0.16 : 0.08;
  const slow = hazard.type === 'mud' ? 0.76 : hazard.type === 'gravel' ? 0.89 : hazard.type === 'rough' ? 0.92 : 0.84;
  return { slow, wear: baseWear * scale * carefulFactor * suspensionReduction };
}

function publishRacerTelemetry(hazard) {
  if (!game) return;
  const kmh = Math.max(0, Math.abs(game.speed) * 0.55);
  const label = kmh <= 50 ? 'ZERO DMG' : kmh < 63 ? 'SMALL' : kmh < 75 ? 'MINOR' : kmh < 89 ? 'MODERATE' : kmh < 105 ? 'LOTS' : 'EPIC DMG';
  window.__rrTelemetry = {
    speedKmh: kmh,
    hazardSpeedKmh: kmh,
    damageLabel: label,
    hazardType: hazard ? hazard.type : null,
    gas: !!input.gas,
    brake: !!input.brake,
    t: performance.now()
  };
}`;

function replaceBlock(source, startToken, endToken, replacement) {
  const start = source.indexOf(startToken);
  const end = source.indexOf(endToken, start);
  if (start < 0 || end < 0) return { source, ok: false };
  return { source: source.slice(0, start) + replacement + source.slice(end), ok: true };
}

function patch(source) {
  let assets = replaceBlock(source, 'const ASSET_PATHS = {', '\n\nlet canvas', ASSET_PATHS);
  let out = assets.source;

  let hazard = replaceBlock(out, 'function hazardDamage(hazard) {', '\n\nfunction update(dt)', HAZARD_DAMAGE);
  out = hazard.source;

  const distanceLine = '  game.distanceM = routeMeters(route, game.distancePx);';
  if (out.includes(distanceLine) && !out.includes('publishRacerTelemetry(hazard);')) {
    out = out.replace(distanceLine, `${distanceLine}\n  publishRacerTelemetry(hazard);`);
  }

  const oldWear = '  game.wear += (pitchStress * Math.abs(game.speed) * 0.014 + overspeedStress + hazardEffect.wear) * dt * 60 / game.stats.durability;';
  const newWear = '  const movingChassisWear = Math.abs(game.speed) > 2 ? pitchStress * Math.abs(game.speed) * 0.014 : 0;\n  game.wear += (movingChassisWear + overspeedStress + hazardEffect.wear) * dt * 60 / game.stats.durability;';
  if (out.includes(oldWear)) out = out.replace(oldWear, newWear);

  return { source: out, assets: assets.ok, hazard: hazard.ok };
}

async function load() {
  const response = await fetch(originalUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error(`V6 load failed ${response.status}`);
  const result = patch(await response.text());
  const blob = new Blob([result.source], { type: 'text/javascript' });
  await import(URL.createObjectURL(blob));
  console.info('[365 Racer] Stable runtime loaded', result);
}

load().catch((error) => {
  console.error('[365 Racer] Stable runtime failed. Loading raw V6.', error);
  import(originalUrl);
});
