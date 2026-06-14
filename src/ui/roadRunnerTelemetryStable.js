const RISK_BANDS = [
  { label: 'ZERO DMG', max: 8, className: 'rrRiskZero', note: 'safe crawl' },
  { label: 'SMALL', max: 16, className: 'rrRiskSmall', note: 'light bump' },
  { label: 'MINOR', max: 26, className: 'rrRiskMinor', note: 'minor wear' },
  { label: 'MODERATE', max: 38, className: 'rrRiskModerate', note: 'slow down' },
  { label: 'LOTS', max: 54, className: 'rrRiskLots', note: 'high wear' },
  { label: 'EPIC DMG', max: Infinity, className: 'rrRiskEpic', note: 'too fast' }
];

const GEARS = [
  { gear: 1, up: 13, down: 0, ratio: 3.15 },
  { gear: 2, up: 25, down: 8, ratio: 2.18 },
  { gear: 3, up: 39, down: 18, ratio: 1.55 },
  { gear: 4, up: 56, down: 30, ratio: 1.12 },
  { gear: 5, up: Infinity, down: 44, ratio: 0.86 }
];

let lastMeters = null;
let sampleMeters = null;
let sampleTime = null;
let lastFrameTime = null;
let targetKmh = 0;
let displayKmh = 0;
let displayRpm = 850;
let currentGear = 1;
let lastShiftTime = 0;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseMeters(text) {
  const match = String(text || '').replace(/,/g, '').match(/([0-9.]+)/);
  return match ? Number(match[1]) : 0;
}

function riskBand(kmh) {
  return RISK_BANDS.find((band) => kmh <= band.max) || RISK_BANDS[RISK_BANDS.length - 1];
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
    <div class="rrTelemetryGauges">
      <div class="rrGaugeBox rrTelemetrySpeed"><b data-rr-speed-value>0</b><span>KM/H</span></div>
      <div class="rrGaugeBox rrTelemetryRpm"><div><b data-rr-rpm-value>850</b><span>RPM</span><div class="rrRpmBar"><div data-rr-rpm-bar></div></div><small data-rr-gear-value>G1</small></div></div>
    </div>
    <div class="rrDamageRisk rrRiskZero" data-rr-damage-band>ZERO DMG</div>
    <div class="rrDamageHelp" data-rr-damage-help>Safe &lt; 8 km/h</div>
  `;
  frame.appendChild(panel);
  return panel;
}

function gasIsPressed() {
  return Boolean(document.querySelector('#screen-race.active [data-rr-control="gas"].active'));
}

function brakeIsPressed() {
  return Boolean(document.querySelector('#screen-race.active [data-rr-control="brake"].active'));
}

function sampleTargetSpeed(now) {
  const live = window.__rrTelemetry;
  if (live && typeof live.speedKmh === 'number') {
    targetKmh = clamp(Math.abs(live.speedKmh), 0, 110);
    return targetKmh;
  }

  const distanceNode = document.querySelector('#screen-race.active [data-rr-distance]');
  if (!distanceNode) return targetKmh;
  const meters = parseMeters(distanceNode.textContent);

  if (lastMeters !== null && meters < lastMeters) {
    resetDashboard();
    sampleMeters = meters;
    sampleTime = now;
    lastMeters = meters;
    return 0;
  }
  lastMeters = meters;

  if (sampleMeters === null || sampleTime === null) {
    sampleMeters = meters;
    sampleTime = now;
    return targetKmh;
  }

  const seconds = (now - sampleTime) / 1000;
  if (seconds < 0.28) return targetKmh;

  const deltaMeters = Math.max(0, meters - sampleMeters);
  const rawKmh = clamp((deltaMeters / seconds) * 3.6, 0, 92);
  sampleMeters = meters;
  sampleTime = now;

  if (deltaMeters === 0) {
    targetKmh = gasIsPressed() ? Math.max(targetKmh * 0.96, displayKmh * 0.94) : Math.max(0, targetKmh - 12 * seconds);
  } else {
    targetKmh = targetKmh * 0.68 + rawKmh * 0.32;
  }
  return targetKmh;
}

function rampValue(current, target, dt, upRate, downRate) {
  const rate = target >= current ? upRate : downRate;
  const maxStep = rate * dt;
  return current + clamp(target - current, -maxStep, maxStep);
}

function updateGear(kmh, now) {
  const model = GEARS[currentGear - 1] || GEARS[0];
  if (kmh > model.up && currentGear < GEARS.length) {
    currentGear += 1;
    lastShiftTime = now;
  } else if (kmh < model.down && currentGear > 1) {
    currentGear -= 1;
    lastShiftTime = now;
  }
}

function rpmTarget(kmh, now) {
  const live = window.__rrTelemetry;
  if (live && typeof live.rpm === 'number') return clamp(live.rpm, 760, 6500);

  updateGear(kmh, now);
  const gear = GEARS[currentGear - 1] || GEARS[0];
  const throttle = gasIsPressed() ? 520 : 0;
  const brakeLoad = brakeIsPressed() ? -220 : 0;
  const shiftDip = now - lastShiftTime < 260 ? -620 : 0;
  const idle = kmh < 2 && !gasIsPressed() ? 850 : 980;
  return clamp(idle + kmh * gear.ratio * 40 + throttle + brakeLoad + shiftDip, 780, 6200);
}

function updateDashboard(now) {
  const dt = lastFrameTime ? clamp((now - lastFrameTime) / 1000, 0.016, 0.08) : 0.016;
  lastFrameTime = now;

  const wantedSpeed = sampleTargetSpeed(now);
  displayKmh = rampValue(displayKmh, wantedSpeed, dt, 13, 22);
  if (!gasIsPressed() && wantedSpeed < 2) displayKmh = rampValue(displayKmh, 0, dt, 13, 18);

  const wantedRpm = rpmTarget(displayKmh, now);
  displayRpm = rampValue(displayRpm, wantedRpm, dt, 950, 1300);

  return { kmh: clamp(displayKmh, 0, 110), rpm: clamp(displayRpm, 760, 6600), gear: currentGear };
}

function tickTelemetry() {
  const panel = ensureTelemetry();
  if (!panel) {
    requestAnimationFrame(tickTelemetry);
    return;
  }

  const now = performance.now();
  const state = updateDashboard(now);
  const live = window.__rrTelemetry || {};
  const roundedSpeed = Math.round(state.kmh);
  const roundedRpm = Math.round(state.rpm);
  const band = riskBand(live.hazardSpeedKmh || roundedSpeed);

  const speedNode = panel.querySelector('[data-rr-speed-value]');
  const rpmNode = panel.querySelector('[data-rr-rpm-value]');
  const rpmBar = panel.querySelector('[data-rr-rpm-bar]');
  const gearNode = panel.querySelector('[data-rr-gear-value]');
  const bandNode = panel.querySelector('[data-rr-damage-band]');
  const helpNode = panel.querySelector('[data-rr-damage-help]');

  if (speedNode) speedNode.textContent = String(roundedSpeed);
  if (rpmNode) rpmNode.textContent = String(roundedRpm);
  if (rpmBar) rpmBar.style.width = `${clamp(roundedRpm / 6200 * 100, 0, 100)}%`;
  if (gearNode) gearNode.textContent = `G${state.gear}`;
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

function resetDashboard() {
  lastMeters = null;
  sampleMeters = null;
  sampleTime = null;
  lastFrameTime = null;
  targetKmh = 0;
  displayKmh = 0;
  displayRpm = 850;
  currentGear = 1;
  lastShiftTime = performance.now();
}

function resetOnRestartClicks() {
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.textContent?.toLowerCase().includes('restart')) return;
    resetDashboard();
  });
}

resetOnRestartClicks();
requestAnimationFrame(tickTelemetry);
