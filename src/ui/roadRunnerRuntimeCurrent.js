const baseRuntimeUrl = '/src/ui/roadRunnerRuntimeV6.js?v=current-telemetry-damage-assets';

const ASSET_PATHS_PATCH = `const ASSET_PATHS = {
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

const HAZARD_DAMAGE_PATCH = `function hazardDamage(hazard) {
  if (!hazard) return { slow: 1, wear: 0 };
  const kmh = Math.abs(game.speed) * 0.55;
  const over = Math.max(0, kmh - 50);
  const damageScale = over <= 0 ? 0 : Math.pow(clamp(over / 55, 0, 1.7), 1.35);
  const brakingReduction = input.brake ? 0.32 : 1;
  const suspensionReduction = clamp(1.12 - saveData.upgrades.suspension * 0.04, 0.42, 1.0);
  const baseWear = hazard.type === 'pothole' ? 0.46 : hazard.type === 'rough' ? 0.24 : hazard.type === 'gravel' ? 0.14 : 0.07;
  const slow = hazard.type === 'mud' ? 0.76 : hazard.type === 'gravel' ? 0.89 : hazard.type === 'rough' ? 0.92 : 0.84;
  return { slow, wear: baseWear * damageScale * brakingReduction * suspensionReduction };
}

function publishRacerTelemetry(hazard) {
  if (!game) return;
  const speedKmh = Math.max(0, Math.abs(game.speed) * 0.55);
  const damageLabel = speedKmh <= 50 ? 'ZERO DMG' : speedKmh < 63 ? 'SMALL' : speedKmh < 75 ? 'MINOR' : speedKmh < 89 ? 'MODERATE' : speedKmh < 105 ? 'LOTS' : 'EPIC DMG';
  window.__rrTelemetry = {
    speedKmh,
    hazardSpeedKmh: speedKmh,
    damageLabel,
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

function patchRuntime(source) {
  const assetPatch = replaceBlock(source, 'const ASSET_PATHS = {', '\n\nlet canvas', ASSET_PATHS_PATCH);
  let patched = assetPatch.source;

  const damagePatch = replaceBlock(patched, 'function hazardDamage(hazard) {', '\n\nfunction update(dt)', HAZARD_DAMAGE_PATCH);
  patched = damagePatch.source;

  const telemetryHook = '  game.distanceM = routeMeters(route, game.distancePx);';
  if (patched.includes(telemetryHook) && !patched.includes('publishRacerTelemetry(hazard);')) {
    patched = patched.replace(telemetryHook, `${telemetryHook}\n  publishRacerTelemetry(hazard);`);
  }

  const oldWear = '  game.wear += (pitchStress * Math.abs(game.speed) * 0.014 + overspeedStress + hazardEffect.wear) * dt * 60 / game.stats.durability;';
  const newWear = '  const movingChassisWear = Math.abs(game.speed) > 2 ? pitchStress * Math.abs(game.speed) * 0.014 : 0;\n  game.wear += (movingChassisWear + overspeedStress + hazardEffect.wear) * dt * 60 / game.stats.durability;';
  if (patched.includes(oldWear)) patched = patched.replace(oldWear, newWear);

  return {
    source: patched,
    assetPatch: assetPatch.ok,
    damagePatch: damagePatch.ok,
    telemetryHook: patched.includes('publishRacerTelemetry(hazard);')
  };
}

async function bootCurrentRacerRuntime() {
  const response = await fetch(baseRuntimeUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Base racer runtime failed: ${response.status}`);
  const patch = patchRuntime(await response.text());
  const blob = new Blob([patch.source], { type: 'text/javascript' });
  await import(URL.createObjectURL(blob));
  console.info('[365 Racer] Current runtime loaded', patch);
}

bootCurrentRacerRuntime().catch((error) => {
  console.error('[365 Racer] Current runtime failed. Loading safe base V6.', error);
  import(baseRuntimeUrl);
});
