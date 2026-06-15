let lastDistance = null;
let lastTime = performance.now();
let smoothSpeed = 0;
let gasDown = false;
let brakeDown = false;

function parseMeters(text) {
  const match = String(text || '').match(/([\d.]+)(K|M)?m/i);
  if (!match) return 0;
  let value = Number(match[1]);
  if (match[2]?.toUpperCase() === 'K') value *= 1000;
  if (match[2]?.toUpperCase() === 'M') value *= 1000000;
  return value;
}

function riskLabel(kmh) {
  if (kmh <= 50) return 'ZERO DMG';
  if (kmh < 63) return 'SMALL';
  if (kmh < 75) return 'MINOR';
  if (kmh < 89) return 'MODERATE';
  if (kmh < 105) return 'LOTS';
  return 'EPIC DMG';
}

document.addEventListener('pointerdown', (event) => {
  const control = event.target.closest('[data-rr-control]');
  if (!control) return;
  gasDown = control.dataset.rrControl === 'gas';
  brakeDown = control.dataset.rrControl === 'brake';
}, true);

document.addEventListener('pointerup', () => { gasDown = false; brakeDown = false; }, true);
document.addEventListener('pointercancel', () => { gasDown = false; brakeDown = false; }, true);
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') gasDown = true;
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') brakeDown = true;
}, true);
document.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') gasDown = false;
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') brakeDown = false;
}, true);

function updateTelemetry() {
  const now = performance.now();
  const distanceNode = document.querySelector('#screen-race.active [data-rr-distance]');
  const distance = parseMeters(distanceNode?.textContent || '0m');
  if (lastDistance === null || distance < lastDistance) {
    lastDistance = distance;
    lastTime = now;
    window.__rrTelemetry = { speedKmh: 0, hazardSpeedKmh: 0, damageLabel: 'ZERO DMG', gas: gasDown, brake: brakeDown, t: now };
    return;
  }

  const dt = Math.max(0.08, (now - lastTime) / 1000);
  const delta = Math.max(0, distance - lastDistance);
  const measured = Math.min(125, (delta / dt) * 3.6);
  const target = measured || (gasDown ? smoothSpeed * 0.985 : brakeDown ? smoothSpeed * 0.86 : smoothSpeed * 0.94);
  smoothSpeed += (target - smoothSpeed) * 0.38;
  if (distance === 0 && !gasDown) smoothSpeed *= 0.65;

  lastDistance = distance;
  lastTime = now;
  window.__rrTelemetry = {
    speedKmh: smoothSpeed,
    hazardSpeedKmh: smoothSpeed,
    damageLabel: riskLabel(smoothSpeed),
    gas: gasDown,
    brake: brakeDown,
    t: now
  };
}

setInterval(updateTelemetry, 90);
window.addEventListener('load', updateTelemetry);
