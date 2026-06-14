const originalUrl = '/src/ui/roadRunnerRuntimeV6.js?v=live-speed-ghost-source';

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
  if (!current || Math.abs(current.x - targetX) > 520) {
    game.ghostSmooth[index] = { x: targetX, y: targetY };
  } else {
    current.x += (targetX - current.x) * 0.16;
    current.y += (targetY - current.y) * 0.16;
  }
  const smoothed = game.ghostSmooth[index];
  return { x: smoothed.x, y: smoothed.y };
}`;

const oldWearLine = 'game.wear += (pitchStress * Math.abs(game.speed) * 0.014 + overspeedStress + hazardEffect.wear) * dt * 60 / game.stats.durability;';
const newWearLine = `const movingChassisWear = Math.abs(game.speed) > 2 ? pitchStress * Math.abs(game.speed) * 0.014 : 0;
  game.wear += (movingChassisWear + overspeedStress + hazardEffect.wear) * dt * 60 / game.stats.durability;`;

function replaceFunction(source, name, replacement, nextName) {
  const start = source.indexOf(`function ${name}`);
  const end = source.indexOf(`\nfunction ${nextName}`, start);
  if (start < 0 || end < 0) return { source, patched: false };
  return { source: source.slice(0, start) + replacement + source.slice(end), patched: true };
}

function patchRuntime(source) {
  let hazard = replaceFunction(source, 'hazardDamage(hazard)', patchedHazard, 'update(dt)');
  let patched = hazard.source;

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

  const ghost = replaceFunction(patched, 'ghostPoint(index, height)', patchedGhostPoint, 'drawPlayer(width, height, route, cameraX)');
  patched = ghost.source;

  return { patched, hazardPatched: hazard.patched, wearPatched, livePatched, ghostPatched: ghost.patched };
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
