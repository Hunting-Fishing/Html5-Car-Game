const originalUrl = '/src/ui/roadRunnerRuntimeV6.js?v=damage50-v2-source';

const replacementHazardDamage = `function hazardDamage(hazard) {
  if (!hazard) return { slow: 1, wear: 0 };
  const dashboardKmh = Math.abs(game.speed) * 0.55;
  const overSpeed = Math.max(0, dashboardKmh - 50);
  const damageScale = overSpeed <= 0 ? 0 : Math.pow(clamp(overSpeed / 55, 0, 1.8), 1.35);
  const carefulFactor = input.brake ? 0.32 : 1;
  const suspensionReduction = clamp(1.12 - saveData.upgrades.suspension * 0.04, 0.42, 1.0);
  const baseWear = hazard.type === 'pothole' ? 0.48 : hazard.type === 'rough' ? 0.26 : hazard.type === 'gravel' ? 0.16 : 0.08;
  const slow = hazard.type === 'mud' ? 0.76 : hazard.type === 'gravel' ? 0.89 : hazard.type === 'rough' ? 0.92 : 0.84;
  const label = damageScale === 0 ? 'ZERO DMG' : dashboardKmh < 63 ? 'SMALL' : dashboardKmh < 75 ? 'MINOR' : dashboardKmh < 89 ? 'MODERATE' : dashboardKmh < 105 ? 'LOTS' : 'EPIC DMG';
  window.__rrTelemetry = { speedKmh: dashboardKmh, hazardSpeedKmh: dashboardKmh, damageLabel: label, nextHazardMeters: null, hazardType: hazard.type };
  return { slow, wear: baseWear * damageScale * carefulFactor * suspensionReduction };
}
`;

const oldWearLine = 'game.wear += (pitchStress * Math.abs(game.speed) * 0.014 + overspeedStress + hazardEffect.wear) * dt * 60 / game.stats.durability;';
const newWearLine = `const movingChassisWear = Math.abs(game.speed) > 2 ? pitchStress * Math.abs(game.speed) * 0.014 : 0;
  game.wear += (movingChassisWear + overspeedStress + hazardEffect.wear) * dt * 60 / game.stats.durability;`;

function patchHazardFunction(source) {
  const start = source.indexOf('function hazardDamage(hazard)');
  const end = source.indexOf('\nfunction update(dt)', start);
  if (start < 0 || end < 0) return { source, patched: false };
  return {
    source: source.slice(0, start) + replacementHazardDamage + source.slice(end + 1),
    patched: true
  };
}

async function loadPatchedRuntime() {
  const response = await fetch(originalUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to load race runtime: ${response.status}`);

  const original = await response.text();
  const hazardPatch = patchHazardFunction(original);
  let patched = hazardPatch.source;
  const wearLinePatched = patched.includes(oldWearLine);
  if (wearLinePatched) patched = patched.replace(oldWearLine, newWearLine);

  if (!hazardPatch.patched) console.warn('[365 Racer] hazardDamage patch did not find target.');
  if (!wearLinePatched) console.warn('[365 Racer] wear line patch did not find target.');

  const blob = new Blob([patched], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  await import(url);
  console.info('[365 Racer] V6 runtime loaded with damage-50 patch:', { hazardPatched: hazardPatch.patched, wearLinePatched });
}

loadPatchedRuntime().catch((error) => {
  console.error('[365 Racer] Patched runtime failed. Loading original V6 runtime.', error);
  import(originalUrl);
});
