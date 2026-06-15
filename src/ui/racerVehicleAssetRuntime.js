const css = document.createElement('link');
css.rel = 'stylesheet';
css.href = '/racerVehicleSprites.css';
document.head.appendChild(css);

const SAVE_KEY = '365_canvas_road_runner_v4';
let activeVehicleFilter = 'all';

const VEHICLE_CARD_ASSETS = {
  'Starter Hatchback': { key: 'hatchback', cls: 'starter', coins: 0, parts: 0, png: '/assets/vehicles/racer/sprite_0000.png', fallback: '/assets/vehicles/racer/starter-hatchback.svg' },
  'Compact Sport': { key: 'greenCompact', cls: 'starter', coins: 180, parts: 1, png: '/assets/vehicles/racer/sprite_0010.png', fallback: '/assets/vehicles/racer/compact-sport.svg' },
  'City Taxi': { key: 'cityTaxi', cls: 'utility', coins: 260, parts: 2, png: '/assets/vehicles/racer/sprite_0002.png', fallback: '/assets/vehicles/racer/city-taxi.svg' },
  'Parts Pickup': { key: 'pickup', cls: 'utility', coins: 420, parts: 4, png: '/assets/vehicles/racer/sprite_0011.png', fallback: '/assets/vehicles/racer/parts-pickup.svg' },
  'Rally Lite': { key: 'rallyLite', cls: 'offroad', coins: 640, parts: 6, png: '/assets/vehicles/racer/sprite_0012.png', fallback: '/assets/vehicles/racer/rally-lite.svg' },
  'Service Van': { key: 'serviceVan', cls: 'endurance', coins: 820, parts: 8, png: '/assets/vehicles/racer/sprite_0007.png', fallback: '/assets/vehicles/racer/service-van.svg' },
  'Desert Runner': { key: 'desertRunner', cls: 'endurance', coins: 1050, parts: 11, png: '/assets/vehicles/racer/sprite_0015.png', fallback: '/assets/vehicles/racer/desert-runner.svg' },
  'Off-Road Truck': { key: 'offroad', cls: 'offroad', coins: 1300, parts: 14, png: '/assets/vehicles/racer/sprite_0006.png', fallback: '/assets/vehicles/racer/off-road-truck.svg' },
  'Export Support Van': { key: 'exportVan', cls: 'endurance', coins: 1650, parts: 18, png: '/assets/vehicles/racer/sprite_0013.png', fallback: '/assets/vehicles/racer/export-support-van.svg' },
  'Purple Race Coupe': { key: 'race', cls: 'race', coins: 2050, parts: 22, png: '/assets/vehicles/racer/sprite_0005.png', fallback: '/assets/vehicles/racer/purple-race-coupe.svg' },
  'Mountain Courier': { key: 'mountainCourier', cls: 'offroad', coins: 2600, parts: 28, png: '/assets/vehicles/racer/sprite_0014.png', fallback: '/assets/vehicles/racer/mountain-courier.svg' },
  '365 Super Coupe': { key: 'superCoupe', cls: 'race', coins: 3400, parts: 36, png: '/assets/vehicles/racer/sprite_0009.png', fallback: '/assets/vehicles/racer/super-coupe.svg' }
};

function loadSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); } catch { return {}; }
}

function saveGame(data) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function toast(text) {
  let node = document.querySelector('.rrProgressToast');
  if (!node) {
    node = document.createElement('div');
    node.className = 'rrProgressToast';
    document.body.appendChild(node);
  }
  node.textContent = text;
  node.classList.add('show');
  clearTimeout(node._timer);
  node._timer = setTimeout(() => node.classList.remove('show'), 2300);
}

function normalizeSave(data) {
  data.coins = Number(data.coins || 0);
  data.parts = Number(data.parts || 0);
  data.unlockedVehicles = Array.isArray(data.unlockedVehicles) && data.unlockedVehicles.length ? data.unlockedVehicles : ['hatchback'];
  data.selectedVehicle = data.unlockedVehicles.includes(data.selectedVehicle) ? data.selectedVehicle : 'hatchback';
  return data;
}

function forceRuntimeReload() {
  if (typeof window.setHillGhosts === 'function') window.setHillGhosts('ghost2');
  else if (typeof window.restartHillRoute === 'function') window.restartHillRoute();
  setTimeout(() => document.dispatchEvent(new Event('click')), 100);
}

function titleForCard(card) {
  return card.querySelector('h4')?.textContent?.trim() || '';
}

function ensureVehicleFilters(panel) {
  const existing = document.querySelector('.rrVehicleFilters');
  if (existing && !existing.dataset.assetRuntimeWired) {
    existing.dataset.assetRuntimeWired = 'true';
    existing.querySelectorAll('button').forEach((button) => {
      const label = button.textContent.trim().toLowerCase().replace(/[^a-z]/g, '');
      const key = label === 'all' ? 'all' : label === 'starter' ? 'starter' : label === 'utility' ? 'utility' : label === 'offroad' ? 'offroad' : label === 'race' ? 'race' : label === 'endurance' ? 'endurance' : '';
      if (!key) return;
      button.dataset.vehicleFilter = key;
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        activeVehicleFilter = key;
        applyVehicleFilter(panel);
      });
    });
  }
}

function applyVehicleFilter(panel) {
  document.querySelectorAll('[data-vehicle-filter]').forEach((button) => {
    button.classList.toggle('active', button.dataset.vehicleFilter === activeVehicleFilter);
  });
  panel.querySelectorAll('.roadRunnerVehicleCard').forEach((card) => {
    const title = titleForCard(card);
    const meta = VEHICLE_CARD_ASSETS[title];
    const show = !meta || activeVehicleFilter === 'all' || meta.cls === activeVehicleFilter;
    card.style.display = show ? '' : 'none';
  });
}

function applyRacerVehicleAssets() {
  const panel = document.querySelector('[data-road-runner-vehicles]');
  if (!panel) return;
  ensureVehicleFilters(panel);
  const save = normalizeSave(loadSave());
  panel.querySelectorAll('.roadRunnerVehicleCard').forEach((card) => {
    const title = titleForCard(card);
    const asset = VEHICLE_CARD_ASSETS[title];
    if (!asset) return;

    card.dataset.vehicleKey = asset.key;
    card.dataset.vehicleClass = asset.cls;

    const thumb = card.querySelector('.vehicleThumb');
    if (thumb && thumb.dataset.racerAsset !== asset.png) {
      thumb.dataset.racerAsset = asset.png;
      thumb.innerHTML = `<img class="racerVehicleSprite" src="${asset.png}" alt="${title}" loading="lazy">`;
      const img = thumb.querySelector('img');
      img.addEventListener('error', () => {
        if (img.dataset.usedFallback === 'true') return;
        img.dataset.usedFallback = 'true';
        img.src = asset.fallback;
      }, { once: true });
    }

    const button = card.querySelector('button');
    if (!button) return;
    button.disabled = false;
    button.removeAttribute('disabled');
    button.onclick = null;
    button.dataset.vehicleKey = asset.key;

    const unlocked = save.unlockedVehicles.includes(asset.key);
    const selected = save.selectedVehicle === asset.key;
    const missingCoins = Math.max(0, asset.coins - save.coins);
    const missingParts = Math.max(0, asset.parts - save.parts);
    const canUnlock = missingCoins === 0 && missingParts === 0;

    button.textContent = selected ? 'Selected' : unlocked ? 'Select' : canUnlock ? `Unlock ${asset.coins}C / ${asset.parts}P` : 'Unlock unavailable';
    button.classList.toggle('gold', selected);
    button.classList.toggle('primary', unlocked || canUnlock);
    button.classList.toggle('ghost', !unlocked && !canUnlock);

    let note = card.querySelector('.rrWhyLocked');
    if (!unlocked && !canUnlock) {
      if (!note) {
        note = document.createElement('div');
        note.className = 'rrWhyLocked';
        card.appendChild(note);
      }
      note.textContent = `Need ${missingCoins} coins / ${missingParts} parts`;
    } else if (note) note.remove();
  });
  applyVehicleFilter(panel);
}

function handleVehicleClick(event) {
  const button = event.target.closest('[data-road-runner-vehicles] .roadRunnerVehicleCard button');
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  const key = button.dataset.vehicleKey;
  const meta = Object.values(VEHICLE_CARD_ASSETS).find((item) => item.key === key);
  if (!meta) return;

  const save = normalizeSave(loadSave());
  if (save.unlockedVehicles.includes(key)) {
    save.selectedVehicle = key;
    saveGame(save);
    toast('Vehicle selected.');
    forceRuntimeReload();
    return;
  }

  const missingCoins = Math.max(0, meta.coins - save.coins);
  const missingParts = Math.max(0, meta.parts - save.parts);
  if (missingCoins || missingParts) {
    toast(`Cannot unlock: Need ${missingCoins} coins / ${missingParts} parts`);
    applyRacerVehicleAssets();
    return;
  }

  save.coins -= meta.coins;
  save.parts -= meta.parts;
  save.unlockedVehicles.push(key);
  save.selectedVehicle = key;
  saveGame(save);
  toast('Vehicle unlocked and selected.');
  forceRuntimeReload();
}

const observer = new MutationObserver(() => requestAnimationFrame(applyRacerVehicleAssets));
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.addEventListener('load', applyRacerVehicleAssets);
document.addEventListener('click', handleVehicleClick, true);
document.addEventListener('click', () => requestAnimationFrame(applyRacerVehicleAssets));
setInterval(applyRacerVehicleAssets, 500);
