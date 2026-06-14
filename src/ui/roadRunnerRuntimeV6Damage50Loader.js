const originalUrl = '/src/ui/roadRunnerRuntimeV6.js?v=damage50-source';

const oldHazardDamage = `function hazardDamage(hazard) {
  if (!hazard) return { slow: 1, wear: 0 };
  const speedFactor = clamp(Math.abs(game.speed) / game.stats.topSpeed, 0, 1);
  const carefulFactor = input.brake ? 0.38 : 1;
  const speedDamageScale = 0.10 + Math.pow(speedFactor, 1.75) * 0.90;
  const suspensionReduction = clamp(1.12 - saveData.upgrades.suspension * 0.035, 0.48, 1.0);
  const baseWear = hazard.type === 'pothole' ? 1.55 : hazard.type === 'rough' ? 0.75 : hazard.type === 'gravel' ? 0.42 : 0.24;
  const slow = hazard.type === 'mud' ? 0.72 : hazard.type === 'gravel' ? 0.86 : hazard.type === 'rough' ? 0.90 : 0.80;
  return { slow, wear: baseWear * speedDamageScale * carefulFactor * suspensionReduction };
}`;

const newHazardDamage = `function hazardDamage(hazard) {
  if (!hazard) return { slow: 1, wear: 0 };
  const dashboardKmh = Math.abs(game.speed) * 0.55;
  const overSpeed = Math.max(0, dashboardKmh - 50);
  const damageScale = overSpeed <= 0 ? 0 : Math.pow(clamp(overSpeed / 55, 0, 1.8), 1.35);
  const carefulFactor = input.brake ? 0.32 : 1;
  const suspensionReduction = clamp(1.12 - saveData.upgrades.suspension * 0.04, 0.42, 1.0);
  const baseWear = hazard.type === 'pothole' ? 0.48 : hazard.type === 'rough' ? 0.26 : hazard.type === 'gravel' ? 0.16 : 0.08;
  const slow = hazard.type === 'mud' ? 0.76 : hazard.type === 'gravel' ? 0.89 : hazard.type === 'rough' ? 0.92 : 0.84;
  const label = damageScale === 0 ? 'ZERO DMG' : dashboardKmh < 63 ? 'SMALL' : dashboardKmh < 75 ? 'MINOR' : dashboardKmh < 89 ? 'MODERATE' : dashboardKmh < 105 ? 'LOTS' : 'EPIC DMG';
  window.__rrTelemetry = { speedKmh: dashboardKmh, hazardSpeedKmh: dashboardKmh, damageLabel: label, nextHazardMeters: typeof nextHazardMeters === 'function' ? nextHazardMeters() : null, hazardType: hazard.type };
  return { slow, wear: baseWear * damageScale * carefulFactor * suspensionReduction };
}`;

async function loadPatchedRuntime() {
  const response = await fetch(originalUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to load race runtime: ${response.status}`);
  const source = await response.text();
  if (!source.includes(oldHazardDamage)) {
    console.warn('[365 Racer] Hazard patch target not found. Loading original V6 runtime.');
    await import(originalUrl);
    return;
  }
  const patched = source.replace(oldHazardDamage, newHazardDamage);
  const blob = new Blob([patched], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  await import(url);
}

loadPatchedRuntime().catch((error) => {
  console.error('[365 Racer] Patched runtime failed. Loading original V6 runtime.', error);
  import(originalUrl);
});
