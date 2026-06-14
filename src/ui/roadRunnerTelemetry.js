const DAMAGE_BANDS = [
  { key: 'zero', label: 'ZERO DMG', maxKmh: 8, className: 'rrRiskZero', note: 'safe pothole crawl' },
  { key: 'small', label: 'SMALL', maxKmh: 16, className: 'rrRiskSmall', note: 'light bump risk' },
  { key: 'minor', label: 'MINOR', maxKmh: 26, className: 'rrRiskMinor', note: 'minor wear' },
  { key: 'moderate', label: 'MODERATE', maxKmh: 38, className: 'rrRiskModerate', note: 'slow before hazard' },
  { key: 'lots', label: 'LOTS', maxKmh: 54, className: 'rrRiskLots', note: 'heavy wear risk' },
  { key: 'epic', label: 'EPIC DMG', maxKmh: Infinity, className: 'rrRiskEpic', note: 'brake immediately' }
];

let lastMeters = null;
let lastTime = null;
let smoothKmh = 0;

function parseMeters(text) {
  const match = String(text || '').replace(/,/g, '').match(/([0-9.]+)/);
  return match ? Number(match[1]) : 0;
}

function damageBand(kmh) {
  return DAMAGE_BANDS.find((band) => kmh <= band.maxKmh) || DAMAGE_BANDS[DAMAGE_BANDS.length - 1];
}

function ensureTelemetry() {
  const frame = document.querySelector('#screen-race.active .roadRunnerGameFrame');
  if (!frame) return null;
  let panel = frame.querySelector('[data-rr-telemetry]');
  if (panel) return panel;

  panel = document.createElement('div');
  panel.className = 'rrTelemetry';
  panel.dataset.rrTelemetry = 'true';
  panel.innerHTML = `
    <div class="rrTelemetrySpeed"><b data-rr-speed-value>0</b><span>KM/H</span></div>
    <div class="rrDamageRisk rrRiskZero" data-rr-damage-band>ZERO DMG</div>
    <div class="rrDamageHelp" data-rr-damage-help>Safe &lt; 8 km/h</div>
  `;
  frame.appendChild(panel);
  return panel;
}

function fallbackTextSpeed(now) {
  const distanceNode = document.querySelector('#screen-race.active [data-rr-distance]');
  if (!distanceNode) return 0;
  const meters = parseMeters(distanceNode.textContent);
  if (lastMeters === null || lastTime === null || meters < lastMeters) {
    lastMeters = meters;
    lastTime = now;
    smoothKmh = 0;
    return 0;
  }
  const dt = Math.max(0.001, (now - lastTime) / 1000);
  const dm = Math.max(0, meters - lastMeters);
  const instantKmh = (dm / dt) * 3.6;
  smoothKmh = smoothKmh * 0.55 + instantKmh * 0.45;
  lastMeters = meters;
  lastTime = now;
  return smoothKmh;
}

function currentTelemetrySpeed(now) {
  const live = window.__rrTelemetry;
  if (live && typeof live.speedKmh === 'number') {
    smoothKmh = smoothKmh * 0.35 + Math.max(0, live.speedKmh) * 0.65;
    lastTime = now;
    return smoothKmh;
  }
  return fallbackTextSpeed(now);
}

function tickTelemetry() {
  const panel = ensureTelemetry();
  if (!panel) {
    requestAnimationFrame(tickTelemetry);
    return;
  }

  const now = performance.now();
  const kmh = currentTelemetrySpeed(now);
  const live = window.__rrTelemetry || {};
  const rounded = Math.max(0, Math.round(kmh));
  const band = damageBand(live.hazardSpeedKmh || rounded);
  const speedNode = panel.querySelector('[data-rr-speed-value]');
  const bandNode = panel.querySelector('[data-rr-damage-band]');
  const helpNode = panel.querySelector('[data-rr-damage-help]');

  if (speedNode) speedNode.textContent = String(rounded);
  if (bandNode) {
    bandNode.className = `rrDamageRisk ${band.className}`;
    bandNode.textContent = live.damageLabel || band.label;
  }
  if (helpNode) {
    const hazard = live.nextHazardMeters != null ? ` • hazard ${live.nextHazardMeters}m` : '';
    helpNode.textContent = `${band.note} • zero < 8${hazard}`;
  }

  requestAnimationFrame(tickTelemetry);
}

function resetOnRestartClicks() {
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.textContent?.toLowerCase().includes('restart')) return;
    lastMeters = null;
    lastTime = null;
    smoothKmh = 0;
  });
}

resetOnRestartClicks();
requestAnimationFrame(tickTelemetry);
