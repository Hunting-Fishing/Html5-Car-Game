const HUD_ICONS = {
  coins: '/assets/road-runner/token-coin.svg',
  parts: '/assets/road-runner/token-parts.svg',
  tools: '/assets/road-runner/tool-kit.svg',
  fuel: '/assets/road-runner/token-energy.svg'
};

function needleAngle(value, max) {
  return -135 + Math.max(0, Math.min(1, value / max)) * 270;
}

function collectionItem(key, label) {
  return `<div class="rrCollectionItem rrCollection-${key}">
    <img src="${HUD_ICONS[key]}" alt="">
    <span><small>${label}</small><b data-rr-${key}-total>0</b><em data-rr-${key}-run>+0 run</em></span>
  </div>`;
}

function ensureDriveHud() {
  const frame = document.querySelector('#screen-race.active .roadRunnerGameFrame');
  if (!frame) return null;

  let collection = frame.querySelector('[data-rr-collection-hud]');
  if (!collection) {
    collection = document.createElement('div');
    collection.className = 'rrCollectionHud';
    collection.dataset.rrCollectionHud = 'true';
    collection.innerHTML = [
      collectionItem('coins', 'Coins'),
      collectionItem('parts', 'Parts'),
      collectionItem('tools', 'Tools'),
      collectionItem('fuel', 'Fuel / Next')
    ].join('');
    frame.appendChild(collection);
  }

  let gauge = frame.querySelector('[data-rr-gauge-dash]');
  if (!gauge) {
    gauge = document.createElement('div');
    gauge.className = 'rrGaugeDash';
    gauge.dataset.rrGaugeDash = 'true';
    gauge.innerHTML = `<div class="rrGaugeDashGrid">
      <div class="rrDial">
        <div class="rrNeedle" data-speed-needle></div><div class="rrNeedleHub"></div>
        <div class="rrDialValue"><b data-speed-value>0</b><span>KM/H</span></div>
      </div>
      <div class="rrDial">
        <div class="rrNeedle" data-rpm-needle></div><div class="rrNeedleHub"></div>
        <div class="rrDialValue"><b data-rpm-value>900</b><span>RPM</span></div>
      </div>
    </div>`;
    frame.appendChild(gauge);
  }

  let gear = frame.querySelector('[data-rr-gas-gear]');
  if (!gear) {
    const gas = frame.querySelector('.roadRunnerPedal.gas');
    if (gas) {
      gear = document.createElement('span');
      gear.className = 'rrGasGearBadge';
      gear.dataset.rrGasGear = 'true';
      gear.textContent = 'G1';
      gas.appendChild(gear);
    }
  }

  return { frame, collection, gauge, gear };
}

function setText(root, selector, value) {
  const element = root?.querySelector(selector);
  if (element) element.textContent = value;
}

function updateDriveHud(nodes) {
  const state = window.__rrHudState;
  if (!nodes || !state) return;

  setText(nodes.collection, '[data-rr-coins-total]', String(Math.floor(state.coins || 0)));
  setText(nodes.collection, '[data-rr-coins-run]', `+${Math.floor(state.runCoins || 0)} run`);
  setText(nodes.collection, '[data-rr-parts-total]', String(Math.floor(state.parts || 0)));
  setText(nodes.collection, '[data-rr-parts-run]', `+${Math.floor(state.runParts || 0)} run`);
  setText(nodes.collection, '[data-rr-tools-total]', String(Math.floor(state.tools || 0)));
  setText(nodes.collection, '[data-rr-tools-run]', `+${Math.floor(state.runTools || 0)} run`);
  setText(nodes.collection, '[data-rr-fuel-total]', `${Math.floor(state.fuelPct || 0)}%`);
  setText(nodes.collection, '[data-rr-fuel-run]', `${Math.floor(state.nextFuelMeters || 0)}m`);

  const speed = Math.max(0, Math.round(state.speedKmh || 0));
  const rpm = Math.max(0, Math.round(state.rpm || 900));
  const speedMax = Math.max(1, Number(state.speedometerMaxKmh) || 180);
  const rpmMax = Math.max(1, Number(state.rpmMax) || 7000);
  setText(nodes.gauge, '[data-speed-value]', String(speed));
  setText(nodes.gauge, '[data-rpm-value]', String(rpm));
  const speedNeedle = nodes.gauge.querySelector('[data-speed-needle]');
  const rpmNeedle = nodes.gauge.querySelector('[data-rpm-needle]');
  speedNeedle?.style.setProperty('--needle', `${needleAngle(speed, speedMax)}deg`);
  rpmNeedle?.style.setProperty('--needle', `${needleAngle(rpm, rpmMax)}deg`);
  if (nodes.gear) nodes.gear.textContent = state.gearLabel || `G${Math.max(1, Math.floor(state.gear || 1))}`;
}

function tick() {
  const nodes = ensureDriveHud();
  updateDriveHud(nodes);
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
