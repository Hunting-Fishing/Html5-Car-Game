const originalUrl = '/src/ui/roadRunnerRuntimeV6.js?v=live-speed-source';

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
  window.__rrTelemetry = {
    speedKmh: kmh,
    hazardSpeedKmh: kmh,
    damageLabel: label,
    hazardType: hazard ? hazard.type : null,
    gas: !!input.gas,
    brake: !!input.brake,
    t: performance.now()
  };
}
`;

const oldWearLine = 'game.wear += (pitchStress * Math.abs(game.speed) * 0.014 + overspeedStress + hazardEffect.wear) * dt * 60 / game.stats.durability;';
const newWearLine = `const movingChassisWear = Math.abs(game.speed) > 2 ? pitchStress * Math.abs(game.speed) * 0.014 : 0;
  game.wear += (movingChassisWear + overspeedStress + hazardEffect.wear) * dt * 60 / game.stats.durability;`;

function patchRuntime(source) {
  const start = source.indexOf('function hazardDamage(hazard)');
  const end = source.indexOf('\nfunction update(dt)', start);
  let patched = source;
  let hazardPatched = false;
  if (start >= 0 && end >= 0) {
    patched = source.slice(0, start) + patchedHazard + source.slice(end + 1);
    hazardPatched = true;
  }

  let wearPatched = false;
  if (patched.includes(oldWearLine)) {
    patched = patched.replace(oldWearLine, newWearLine);
    wearPatched = true;
  }

  const telemetryHook = 'game.distanceM = routeMeters(route, game.distancePx);';
  let livePatched = false;
  if (patched.includes(telemetryHook)) {
    patched = patched.replace(telemetryHook, `${telemetryHook}\n  publishLiveRacerTelemetry(hazard);`);
    livePatched = true;
  }

  return { patched, hazardPatched, wearPatched, livePatched };
}

async function loadRuntime() {
  const response = await fetch(originalUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to load racer runtime: ${response.status}`);
  const source = await response.text();
  const result = patchRuntime(source);
  const blob = new Blob([result.patched], { type: 'text/javascript' });
  await import(URL.createObjectURL(blob));
  console.info('[365 Racer] Live V6 runtime loaded', result);
}

loadRuntime().catch((error) => {
  console.error('[365 Racer] Live runtime patch failed. Loading original V6.', error);
  import(originalUrl);
});
