const DAMAGE_BANDS = [
  { key: 'zero', label: 'ZERO DMG', maxKmh: 18, className: 'rrRiskZero', note: 'safe over potholes' },
  { key: 'small', label: 'SMALL', maxKmh: 30, className: 'rrRiskSmall', note: 'light bump risk' },
  { key: 'minor', label: 'MINOR', maxKmh: 44, className: 'rrRiskMinor', note: 'some wear' },
  { key: 'moderate', label: 'MODERATE', maxKmh: 60, className: 'rrRiskModerate', note: 'slow before hazards' },
  { key: 'lots', label: 'LOTS', maxKmh: 78, className: 'rrRiskLots', note: 'heavy wear risk' },
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
    <div class="rrDamageHelp" data-rr-damage-help>Safe &lt; 18 km/h</div>
  `;
  frame.appendChild(panel);
  return panel;
}

function tickTelemetry() {
  const panel = ensureTelemetry();
  const distanceNode = document.querySelector('#screen-race.active [data-rr-distance]');
  if (!panel || !distanceNode) {
    requestAnimationFrame(tickTelemetry);
    return;
  }

  const now = performance.now();
  const meters = parseMeters(distanceNode.textContent);
  if (lastMeters === null || lastTime === null || meters < lastMeters) {
    lastMeters = meters;
    lastTime = now;
    smoothKmh = 0;
  }

  const dt = Math.max(0.001, (now - lastTime) / 1000);
  const dm = Math.max(0, meters - lastMeters);
  const instantKmh = (dm / dt) * 3.6;
  smoothKmh = smoothKmh * 0.82 + instantKmh * 0.18;
  lastMeters = meters;
  lastTime = now;

  const rounded = Math.max(0, Math.round(smoothKmh));
  const band = damageBand(rounded);
  const speedNode = panel.querySelector('[data-rr-speed-value]');
  const bandNode = panel.querySelector('[data-rr-damage-band]');
  const helpNode = panel.querySelector('[data-rr-damage-help]');

  if (speedNode) speedNode.textContent = String(rounded);
  if (bandNode) {
    bandNode.className = `rrDamageRisk ${band.className}`;
    bandNode.textContent = band.label;
  }
  if (helpNode) {
    helpNode.textContent = `${band.note} • zero < 18`;
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
