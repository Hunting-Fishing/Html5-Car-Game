const BANDS = [
  ['ZERO DMG', 50, 'rrRiskZero', 'no wear below 50'],
  ['SMALL', 62, 'rrRiskSmall', 'small wear'],
  ['MINOR', 74, 'rrRiskMinor', 'minor wear'],
  ['MODERATE', 88, 'rrRiskModerate', 'moderate wear'],
  ['LOTS', 104, 'rrRiskLots', 'heavy wear'],
  ['EPIC DMG', Infinity, 'rrRiskEpic', 'too fast']
];

const GEARS = [
  { g: 1, up: 11, down: 0, r: 3.25 },
  { g: 2, up: 24, down: 7, r: 2.18 },
  { g: 3, up: 42, down: 17, r: 1.50 },
  { g: 4, up: 66, down: 32, r: 1.08 },
  { g: 5, up: Infinity, down: 48, r: 0.82 }
];

let shownSpeed = 0;
let shownRpm = 850;
let gear = 1;
let lastFrame = 0;
let lastShift = 0;
let lastTelemetryAt = 0;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * clamp(t, 0, 1);

function currentBand(kmh) {
  return BANDS.find((item) => kmh <= item[1]) || BANDS[BANDS.length - 1];
}

function ensurePanel() {
  const frame = document.querySelector('#screen-race.active .roadRunnerGameFrame');
  if (!frame) return null;
  let panel = frame.querySelector('[data-rr-gauge-dash]');
  if (panel) return panel;

  const old = frame.querySelector('[data-rr-telemetry]');
  if (old) old.remove();

  panel = document.createElement('div');
  panel.className = 'rrGaugeDash';
  panel.dataset.rrGaugeDash = 'true';
  panel.innerHTML = `
    <div class="rrGaugeDashGrid">
      <div class="rrDial" data-speed-dial>
        <div class="rrNeedle" data-speed-needle></div><div class="rrNeedleHub"></div>
        <div class="rrDialValue"><b data-speed-value>0</b><span>KM/H</span></div>
      </div>
      <div class="rrDial" data-rpm-dial>
        <div class="rrNeedle" data-rpm-needle></div><div class="rrNeedleHub"></div>
        <div class="rrDialValue"><b data-rpm-value>850</b><span>RPM</span></div>
      </div>
    </div>
    <div class="rrGaugeStatus">
      <div class="rrGearBadge" data-gear-value>G1</div>
      <div class="rrDamageRisk rrGaugeRisk rrRiskZero" data-risk-value>ZERO DMG</div>
    </div>
    <div class="rrGaugeHelp" data-risk-help>No wear below 50 km/h</div>
  `;
  frame.appendChild(panel);
  return panel;
}

function freshTelemetry(now) {
  const live = window.__rrTelemetry;
  if (!live || typeof live.speedKmh !== 'number') return null;
  const stamp = typeof live.t === 'number' ? live.t : now;
  if (now - stamp > 260) return null;
  lastTelemetryAt = now;
  return live;
}

function updateGear(kmh, now) {
  const model = GEARS[gear - 1] || GEARS[0];
  if (kmh < 3) {
    if (gear !== 1) lastShift = now;
    gear = 1;
    return;
  }
  if (kmh > model.up && gear < GEARS.length) {
    gear += 1;
    lastShift = now;
  } else if (kmh < model.down && gear > 1) {
    gear -= 1;
    lastShift = now;
  }
}

function rpmFor(kmh, live, now) {
  const throttle = live?.gas ? 720 : 0;
  const brakeLoad = live?.brake ? -220 : 0;
  updateGear(kmh, now);
  const model = GEARS[gear - 1] || GEARS[0];
  if (kmh < 1 && !live?.gas) return 850;
  const shiftDip = now - lastShift < 180 ? -450 : 0;
  return clamp(980 + kmh * model.r * 42 + throttle + brakeLoad + shiftDip, 800, 6300);
}

function needleAngle(value, max) {
  return -135 + clamp(value / max, 0, 1) * 270;
}

function tick(now) {
  const panel = ensurePanel();
  if (!panel) {
    requestAnimationFrame(tick);
    return;
  }

  const dt = lastFrame ? clamp((now - lastFrame) / 1000, 0.016, 0.08) : 0.016;
  lastFrame = now;

  const live = freshTelemetry(now);
  const wantedSpeed = live ? clamp(Math.abs(live.speedKmh), 0, 120) : 0;
  const speedResponse = live ? 1 - Math.pow(0.10, dt * 7.5) : 1 - Math.pow(0.10, dt * 3.2);
  shownSpeed = lerp(shownSpeed, wantedSpeed, speedResponse);
  if (!live && now - lastTelemetryAt > 300) shownSpeed = lerp(shownSpeed, 0, 1 - Math.pow(0.10, dt * 4.5));
  if (wantedSpeed < 0.8 && !live?.gas) shownSpeed = lerp(shownSpeed, 0, 1 - Math.pow(0.10, dt * 9));

  const wantedRpm = rpmFor(shownSpeed, live, now);
  const rpmResponse = 1 - Math.pow(0.10, dt * 4.6);
  shownRpm = lerp(shownRpm, wantedRpm, rpmResponse);
  if (shownSpeed < 1 && !live?.gas) shownRpm = lerp(shownRpm, 850, 1 - Math.pow(0.10, dt * 6));

  const speed = Math.round(shownSpeed);
  const rpm = Math.round(shownRpm);
  const risk = currentBand(live?.hazardSpeedKmh ?? shownSpeed);

  panel.querySelector('[data-speed-value]').textContent = String(speed);
  panel.querySelector('[data-rpm-value]').textContent = String(rpm);
  panel.querySelector('[data-gear-value]').textContent = `G${gear}`;
  panel.querySelector('[data-speed-needle]').style.setProperty('--needle', `${needleAngle(shownSpeed, 120)}deg`);
  panel.querySelector('[data-rpm-needle]').style.setProperty('--needle', `${needleAngle(shownRpm, 6500)}deg`);

  const riskNode = panel.querySelector('[data-risk-value]');
  riskNode.className = `rrDamageRisk rrGaugeRisk ${risk[2]}`;
  riskNode.textContent = live?.damageLabel || risk[0];
  panel.querySelector('[data-risk-help]').textContent = `${risk[3]} • damage starts 50 km/h`;

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
