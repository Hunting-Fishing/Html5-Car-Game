import * as PIXI from 'pixi.js';

const WORLD = { width: 960, height: 1720, startX: -220, startY: -300 };
const GRID = { size: 40, storageKey: '365_mobile_city_buildings_v1' };

const ROADS = {
  width: 88,
  sidewalk: 16,
  laneOffset: 18,
  horizontal: [
    { y: 235, label: 'Dealer / Factory Ave' },
    { y: 545, label: 'Parts / Repair Row' },
    { y: 865, label: 'Salvage Way' },
    { y: 1195, label: 'Showcase Loop' }
  ],
  vertical: [
    { x: 245, label: 'West Service' },
    { x: 655, label: 'East Service' }
  ]
};

const BUILDING_CATALOG = [
  { key: 'streetKiosk', name: 'Street Kiosk', shortName: 'Kiosk', footprintW: 1, footprintH: 1, cost: 50, owned: 4, tags: ['kiosk', 'shop', 'store', 'commercial'] },
  { key: 'tireRepair', name: 'Tire Repair Shop', shortName: 'Tire', footprintW: 2, footprintH: 2, cost: 150, owned: 3, tags: ['garage', 'shop', 'service', 'commercial'] },
  { key: 'privateShop', name: 'Private Repair Shop', shortName: 'Repair', footprintW: 3, footprintH: 2, cost: 350, owned: 2, tags: ['garage', 'industrial', 'building'] },
  { key: 'partsWarehouse', name: 'Parts Warehouse', shortName: 'Parts WH', footprintW: 4, footprintH: 3, cost: 750, owned: 1, tags: ['warehouse', 'industrial', 'factory'] },
  { key: 'dealerShowroom', name: 'Dealer Showroom', shortName: 'Dealer', footprintW: 3, footprintH: 2, cost: 900, owned: 1, tags: ['commercial', 'showroom', 'store', 'office'] },
  { key: 'salvageBlock', name: 'Salvage Yard Block', shortName: 'Salvage', footprintW: 5, footprintH: 4, cost: 1200, owned: 1, tags: ['industrial', 'warehouse', 'factory'] }
];

const FIXED_BUILDINGS = [
  { x: 60, y: 90, w: 2, h: 2, key: 'dealerShowroom', label: 'Dealer Row', action: 'lines' },
  { x: 465, y: 84, w: 3, h: 2, key: 'partsWarehouse', label: '365 Garage', action: 'garage' },
  { x: 70, y: 395, w: 2, h: 2, key: 'streetKiosk', label: 'Parts Hub', action: 'merge' },
  { x: 710, y: 395, w: 2, h: 2, key: 'privateShop', label: 'Repair Shops', action: 'lines' },
  { x: 70, y: 740, w: 3, h: 2, key: 'salvageBlock', label: 'Salvage Yard', action: 'garage' },
  { x: 710, y: 740, w: 2, h: 2, key: 'tireRepair', label: 'Tow Dispatch', action: 'lines' },
  { x: 70, y: 1070, w: 3, h: 2, key: 'dealerShowroom', label: 'Showcase', action: 'lines' },
  { x: 700, y: 1070, w: 3, h: 2, key: 'privateShop', label: 'Test Track', action: 'race' }
];

const DIRECT_VEHICLE_CANDIDATES = [
  '/assets/vendor/kenney/car-kit/Previews/sedan.png',
  '/assets/vendor/kenney/car-kit/Previews/hatchback-sports.png',
  '/assets/vendor/kenney/car-kit/Previews/taxi.png',
  '/assets/vendor/kenney/car-kit/Previews/truck.png',
  '/assets/vendor/kenney/car-kit/Previews/van.png',
  '/assets/vendor/kenney/car-kit/Previews/delivery.png'
];

let app = null;
let hostMounted = null;
let world = null;
let gridLayer = null;
let placementLayer = null;
let ghostLayer = null;
let fixedLayer = null;
let manifest = { vehicles: [], buildings: [], roads: [], allImages: [] };
let textures = new Map();
let traffic = [];
let walkers = [];
let placedBuildings = [];
let selectedKey = 'streetKiosk';
let mode = 'normal';
let pendingPlacement = null;
let selectedPlacedId = null;
let movingBuilding = null;
let dragMoved = false;
let isInitialized = false;

function defByKey(key) {
  return BUILDING_CATALOG.find((item) => item.key === key) || BUILDING_CATALOG[0];
}

function selectedDef() {
  return defByKey(selectedKey);
}

function publicPath(item) {
  return typeof item === 'string' ? item : item?.publicPath;
}

function includesAny(value, words) {
  const v = String(value || '').toLowerCase();
  return words.some((word) => v.includes(String(word).toLowerCase()));
}

async function pathExists(path) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = `${path}?v=${Date.now()}`;
  });
}

async function loadManifest() {
  try {
    const res = await fetch('/assets/generated/kenney-manifest.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`manifest HTTP ${res.status}`);
    manifest = await res.json();
    console.info('[365 Auto City] Kenney manifest loaded:', manifest.counts || manifest);
  } catch (error) {
    console.warn('[365 Auto City] Kenney manifest not found. Run scripts/generate-kenney-manifest.ps1 after adding assets.', error);
    manifest = { vehicles: [], buildings: [], roads: [], allImages: [] };
  }
}

function findFromManifest(list, keywords = [], folderKeywords = []) {
  const items = Array.isArray(list) ? list : [];
  return publicPath(items.find((item) => {
    const path = publicPath(item) || '';
    const name = item.name || path;
    const folderOk = !folderKeywords.length || includesAny(path, folderKeywords);
    const nameOk = !keywords.length || includesAny(name, keywords) || includesAny(path, keywords);
    return folderOk && nameOk;
  }));
}

async function findDirect(paths) {
  for (const path of paths) {
    if (await pathExists(path)) return path;
  }
  return null;
}

async function resolveVehicleSet() {
  const fromManifest = {
    carA: findFromManifest(manifest.vehicles, ['sedan', 'hatchback', 'car'], ['car-kit', 'racing-kit']),
    carB: findFromManifest(manifest.vehicles, ['taxi', 'sports', 'race', 'racer'], ['car-kit', 'racing-kit']),
    truck: findFromManifest(manifest.vehicles, ['truck', 'pickup'], ['car-kit', 'racing-kit']),
    van: findFromManifest(manifest.vehicles, ['van', 'delivery'], ['car-kit', 'racing-kit']),
    broken: findFromManifest(manifest.vehicles, ['debris', 'bumper', 'wheel'], ['car-kit', 'racing-kit'])
  };

  const direct = await findDirect(DIRECT_VEHICLE_CANDIDATES);
  const fallback = direct || '/assets/vehicles/iso-car-blue.svg';
  return {
    carA: fromManifest.carA || fallback,
    carB: fromManifest.carB || fromManifest.carA || fallback,
    truck: fromManifest.truck || fromManifest.van || fallback,
    van: fromManifest.van || fromManifest.truck || fallback,
    broken: fromManifest.broken || fromManifest.carB || fallback
  };
}

function resolveBuildingAsset(def) {
  return findFromManifest(manifest.buildings, def.tags || [], ['city-kit-commercial', 'city-kit-industrial', 'city-kit-suburban'])
    || findFromManifest(manifest.buildings, ['building', 'shop', 'house', 'garage', 'store'], ['city-kit'])
    || null;
}

async function preload(paths) {
  const unique = [...new Set(paths.filter(Boolean))];
  for (const path of unique) {
    try {
      textures.set(path, await PIXI.Assets.load(path));
    } catch (error) {
      console.warn('[365 Auto City] Texture failed:', path, error);
    }
  }
}

function sprite(path) {
  const tex = textures.get(path);
  return tex ? new PIXI.Sprite(tex) : PIXI.Sprite.from(path);
}

function placedCount(type) {
  return placedBuildings.filter((item) => item.type === type).length;
}

function ownedRemaining(type) {
  const def = defByKey(type);
  return Math.max(0, (def.owned || 0) - placedCount(type));
}

function html() {
  return `
    <section class="card pixiWorldShell">
      <div class="pixiWorldHeader">
        <h2>365 Auto City — Mobile Build Mode V1</h2>
        <p>Drag the map with one finger. Tap Build to open the tray. The grid only appears while placing or moving buildings.</p>
      </div>
      <div class="pixiWorldHost" id="pixiWorldHost"></div>
      <div class="mobileCityHud">
        <div class="mobileCityStatus"><span class="mobileCityModeBadge" data-mobile-city-mode>Normal</span> <span data-mobile-city-help>Tap Build to place owned buildings. Tap your placed buildings to move them.</span></div>
        <div class="mobileCityActions" data-normal-actions>
          <button class="btn primary" onclick="window.openMobileBuildTray?.()">Build</button>
          <button class="btn ghost" onclick="window.centerMobileCity?.()">Center Map</button>
          <button class="btn" data-action="screen" data-screen="garage">Manage Shop</button>
          <button class="btn ghost" data-action="screen" data-screen="merge">Parts / Merge</button>
        </div>
        <div class="mobileBuildTray" data-build-tray hidden>
          <div class="mobileTrayTitle"><span>Choose Building</span><span data-selected-building>${selectedDef().name}</span></div>
          <div class="mobileBuildingList">
            ${BUILDING_CATALOG.map((item) => `<button class="btn small ghost" data-building-key="${item.key}" onclick="window.selectMobileBuilding?.('${item.key}')">${item.shortName}<small>${item.footprintW}×${item.footprintH} • owned <span data-owned-count="${item.key}">${ownedRemaining(item.key)}</span></small></button>`).join('')}
          </div>
          <div class="mobileGhostHelp" data-placement-help>Select a building, tap green land, then confirm. Red cells are blocked.</div>
          <div class="mobileConfirmRow" data-confirm-row hidden>
            <button class="btn primary" onclick="window.confirmMobilePlacement?.()">Confirm</button>
            <button class="btn red" onclick="window.cancelMobilePlacement?.()">Cancel</button>
          </div>
          <div class="mobileBuildActions" data-build-actions>
            <button class="btn ghost" onclick="window.cancelMobilePlacement?.()">Close Build Mode</button>
            <button class="btn red" onclick="window.clearMobilePlacements?.()">Clear Test Buildings</button>
          </div>
        </div>
        <div class="mobilePlacedSheet" data-placed-sheet hidden>
          <div class="mobileTrayTitle"><span data-placed-title>Building</span><span>Owned</span></div>
          <div class="mobileGhostHelp">Move mode shows the grid. Choose a green cell, then confirm.</div>
          <div class="mobilePlacedActions">
            <button class="btn primary" onclick="window.moveSelectedMobileBuilding?.()">Move</button>
            <button class="btn ghost" onclick="window.closeMobileBuildingSheet?.()">Close</button>
          </div>
        </div>
      </div>
    </section>
    <button class="pixiWorldProxy" data-proxy="garage" data-action="screen" data-screen="garage" hidden></button>
    <button class="pixiWorldProxy" data-proxy="lines" data-action="screen" data-screen="lines" hidden></button>
    <button class="pixiWorldProxy" data-proxy="merge" data-action="screen" data-screen="merge" hidden></button>
    <button class="pixiWorldProxy" data-proxy="race" data-action="screen" data-screen="race" hidden></button>
  `;
}

function setUiMode(nextMode) {
  mode = nextMode;
  const badge = document.querySelector('[data-mobile-city-mode]');
  const help = document.querySelector('[data-mobile-city-help]');
  const tray = document.querySelector('[data-build-tray]');
  const sheet = document.querySelector('[data-placed-sheet]');
  const confirm = document.querySelector('[data-confirm-row]');

  if (badge) badge.textContent = mode === 'placing' ? 'Build Mode' : mode === 'moving' ? 'Move Mode' : 'Normal';
  if (help) help.textContent = mode === 'normal'
    ? 'Tap Build to place owned buildings. Tap your placed buildings to move them.'
    : mode === 'placing'
      ? 'Grid is active. Tap a green cell to preview placement.'
      : 'Move mode active. Tap a green cell to preview the new location.';
  if (tray) tray.hidden = mode === 'normal';
  if (sheet && mode !== 'normal') sheet.hidden = true;
  if (confirm) confirm.hidden = !pendingPlacement;

  if (gridLayer) gridLayer.visible = mode === 'placing' || mode === 'moving';
  refreshInventoryButtons();
}

function refreshInventoryButtons() {
  const def = selectedDef();
  const selectedLabel = document.querySelector('[data-selected-building]');
  if (selectedLabel) selectedLabel.textContent = `${def.name} • ${def.footprintW}×${def.footprintH}`;

  document.querySelectorAll('[data-building-key]').forEach((button) => {
    const key = button.getAttribute('data-building-key');
    const active = key === selectedKey;
    const remaining = ownedRemaining(key);
    button.classList.toggle('primary', active);
    button.classList.toggle('ghost', !active);
    button.disabled = remaining <= 0 && mode !== 'moving';
  });

  document.querySelectorAll('[data-owned-count]').forEach((span) => {
    const key = span.getAttribute('data-owned-count');
    span.textContent = String(ownedRemaining(key));
  });

  const confirm = document.querySelector('[data-confirm-row]');
  if (confirm) confirm.hidden = !pendingPlacement;
}

window.openMobileBuildTray = () => {
  pendingPlacement = null;
  movingBuilding = null;
  selectedPlacedId = null;
  clearGhost();
  setUiMode('placing');
  rebuildGrid();
};

window.selectMobileBuilding = (key) => {
  if (!BUILDING_CATALOG.some((item) => item.key === key)) return;
  if (ownedRemaining(key) <= 0 && mode !== 'moving') return;
  selectedKey = key;
  pendingPlacement = null;
  clearGhost();
  setUiMode('placing');
  rebuildGrid();
};

window.cancelMobilePlacement = () => {
  pendingPlacement = null;
  movingBuilding = null;
  selectedPlacedId = null;
  clearGhost();
  setUiMode('normal');
  rebuildPlacements();
  rebuildGrid();
};

window.confirmMobilePlacement = () => {
  if (!pendingPlacement) return;
  if (mode === 'moving' && movingBuilding) {
    placedBuildings = placedBuildings.map((item) => item.id === movingBuilding.id ? { ...item, x: pendingPlacement.x, y: pendingPlacement.y } : item);
  } else {
    const def = selectedDef();
    if (ownedRemaining(def.key) <= 0) return;
    placedBuildings.push({
      id: `${def.key}-${Date.now()}`,
      type: def.key,
      name: def.shortName,
      x: pendingPlacement.x,
      y: pendingPlacement.y,
      w: def.footprintW * GRID.size,
      h: def.footprintH * GRID.size
    });
  }

  savePlaced();
  pendingPlacement = null;
  movingBuilding = null;
  selectedPlacedId = null;
  clearGhost();
  rebuildPlacements();
  rebuildGrid();
  setUiMode('normal');
};

window.clearMobilePlacements = () => {
  placedBuildings = [];
  pendingPlacement = null;
  movingBuilding = null;
  selectedPlacedId = null;
  localStorage.removeItem(GRID.storageKey);
  clearGhost();
  rebuildPlacements();
  rebuildGrid();
  setUiMode('normal');
};

window.closeMobileBuildingSheet = () => {
  selectedPlacedId = null;
  const sheet = document.querySelector('[data-placed-sheet]');
  if (sheet) sheet.hidden = true;
};

window.moveSelectedMobileBuilding = () => {
  const item = placedBuildings.find((building) => building.id === selectedPlacedId);
  if (!item) return;
  movingBuilding = item;
  selectedKey = item.type;
  pendingPlacement = null;
  clearGhost();
  setUiMode('moving');
  rebuildGrid();
};

window.centerMobileCity = () => {
  if (!world) return;
  world.x = WORLD.startX;
  world.y = WORLD.startY;
  clamp();
};

function fill(fillValue) {
  return typeof fillValue === 'number' ? { color: fillValue, alpha: 1 } : fillValue;
}

function rect(x, y, w, h, color, stroke = null) {
  const g = new PIXI.Graphics();
  g.rect(x, y, w, h).fill(fill(color));
  if (stroke) g.rect(x, y, w, h).stroke(stroke);
  return g;
}

function roundRect(x, y, w, h, r, color, stroke = null) {
  const g = new PIXI.Graphics();
  g.roundRect(x, y, w, h, r).fill(fill(color));
  if (stroke) g.roundRect(x, y, w, h, r).stroke(stroke);
  return g;
}

function label(text, x, y, size = 11, color = 0xffffff) {
  const t = new PIXI.Text({ text, style: { fontFamily: 'Arial', fontSize: size, fontWeight: '900', fill: color, align: 'center' } });
  t.anchor.set(0.5);
  t.x = x;
  t.y = y;
  return t;
}

function makeClick(container, fn) {
  container.eventMode = 'static';
  container.cursor = 'pointer';
  container.on('pointertap', () => { if (!dragMoved) fn(); });
}

function roadRects() {
  return [
    ...ROADS.horizontal.map((r) => ({ x: 0, y: r.y - ROADS.sidewalk, w: WORLD.width, h: ROADS.width + ROADS.sidewalk * 2 })),
    ...ROADS.vertical.map((r) => ({ x: r.x - ROADS.sidewalk, y: 0, w: ROADS.width + ROADS.sidewalk * 2, h: WORLD.height }))
  ];
}

function buildingRects() {
  const fixed = FIXED_BUILDINGS.map((b) => ({ x: b.x, y: b.y, w: b.w * GRID.size, h: b.h * GRID.size }));
  const placed = placedBuildings
    .filter((b) => !(mode === 'moving' && movingBuilding && b.id === movingBuilding.id))
    .map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h }));
  return [...fixed, ...placed, { x: 410, y: 710, w: 110, h: 90 }];
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function gridRect(col, row, w = 1, h = 1) {
  return { x: col * GRID.size, y: row * GRID.size, w: w * GRID.size, h: h * GRID.size };
}

function canBuild(col, row, def = selectedDef()) {
  const box = gridRect(col, row, def.footprintW, def.footprintH);
  if (box.x < 0 || box.y < 0 || box.x + box.w > WORLD.width || box.y + box.h > WORLD.height) return false;
  return ![...roadRects(), ...buildingRects()].some((blocked) => overlap(box, blocked));
}

function loadPlaced() {
  try { placedBuildings = JSON.parse(localStorage.getItem(GRID.storageKey) || '[]'); }
  catch { placedBuildings = []; }
}

function savePlaced() {
  localStorage.setItem(GRID.storageKey, JSON.stringify(placedBuildings));
}

function drawGround() {
  world.addChild(rect(0, 0, WORLD.width, WORLD.height, 0x70c25e));
  for (let y = 0; y < WORLD.height; y += 80) {
    for (let x = 0; x < WORLD.width; x += 80) {
      world.addChild(rect(x, y, 80, 80, { color: (x / 80 + y / 80) % 2 ? 0x65b457 : 0x7bd069, alpha: 0.22 }));
    }
  }
}

function drawRoads() {
  for (const r of ROADS.horizontal) {
    world.addChild(rect(0, r.y - ROADS.sidewalk, WORLD.width, ROADS.sidewalk, 0xb9c1cc));
    world.addChild(rect(0, r.y + ROADS.width, WORLD.width, ROADS.sidewalk, 0xb9c1cc));
    world.addChild(rect(0, r.y, WORLD.width, ROADS.width, 0x202936, { width: 3, color: 0x111827 }));
    world.addChild(rect(0, r.y + ROADS.width / 2 - 2, WORLD.width, 4, { color: 0xf8fafc, alpha: 0.42 }));
    world.addChild(label(r.label, 96, r.y + 18, 10, 0xcbd5e1));
  }
  for (const r of ROADS.vertical) {
    world.addChild(rect(r.x - ROADS.sidewalk, 0, ROADS.sidewalk, WORLD.height, 0xb9c1cc));
    world.addChild(rect(r.x + ROADS.width, 0, ROADS.sidewalk, WORLD.height, 0xb9c1cc));
    world.addChild(rect(r.x, 0, ROADS.width, WORLD.height, 0x202936, { width: 3, color: 0x111827 }));
    world.addChild(rect(r.x + ROADS.width / 2 - 2, 0, 4, WORLD.height, { color: 0xf8fafc, alpha: 0.42 }));
  }
}

function createBuildingVisual({ x, y, wCells, hCells, name, type, action = null, fixed = false, alpha = 1 }) {
  const def = defByKey(type);
  const asset = resolveBuildingAsset(def);
  const c = new PIXI.Container();
  c.x = x;
  c.y = y;
  c.zIndex = y + 100;
  c.alpha = alpha;
  const w = wCells * GRID.size;
  const h = hCells * GRID.size;

  c.addChild(roundRect(0, h - 14, w, 18, 8, { color: 0x000000, alpha: 0.18 }));
  if (asset) {
    const s = sprite(asset);
    s.anchor.set(0.5, 1);
    s.x = w / 2;
    s.y = h + 4;
    const scale = Math.min((w * 0.90) / Math.max(1, s.texture.width), (h * 0.90) / Math.max(1, s.texture.height));
    s.scale.set(scale);
    c.addChild(s);
  } else {
    c.addChild(roundRect(4, 12, w - 8, h - 18, 8, def.colorA || 0x35e58a, { width: 2, color: 0x1e293b }));
    c.addChild(roundRect(10, 0, w - 20, 24, 6, 0xe2e8f0, { width: 2, color: 0x1e293b }));
  }

  c.addChild(roundRect(0, h + 4, w, 20, 10, { color: 0x04111d, alpha: 0.86 }));
  c.addChild(label(name || def.shortName, w / 2, h + 15, 9));

  if (fixed && action) makeClick(c, () => document.querySelector(`.pixiWorldProxy[data-proxy="${action}"]`)?.click());
  return c;
}

function rebuildPlacements() {
  if (!world) return;
  if (placementLayer) placementLayer.destroy({ children: true });
  placementLayer = new PIXI.Container();
  placementLayer.zIndex = 4000;
  world.addChild(placementLayer);

  for (const b of placedBuildings) {
    const def = defByKey(b.type);
    const visual = createBuildingVisual({ x: b.x, y: b.y, wCells: def.footprintW, hCells: def.footprintH, name: b.name, type: b.type, alpha: mode === 'moving' && movingBuilding?.id === b.id ? 0.25 : 1 });
    makeClick(visual, () => openPlacedSheet(b.id));
    placementLayer.addChild(visual);
  }
}

function openPlacedSheet(id) {
  if (mode !== 'normal') return;
  selectedPlacedId = id;
  const item = placedBuildings.find((b) => b.id === id);
  const sheet = document.querySelector('[data-placed-sheet]');
  const title = document.querySelector('[data-placed-title]');
  if (title && item) title.textContent = `${item.name || defByKey(item.type).name}`;
  if (sheet) sheet.hidden = false;
}

function clearGhost() {
  if (ghostLayer) ghostLayer.removeChildren();
}

function drawGhost() {
  clearGhost();
  if (!pendingPlacement || !ghostLayer) return;
  const def = defByKey(pendingPlacement.type);
  const ghost = createBuildingVisual({ x: pendingPlacement.x, y: pendingPlacement.y, wCells: def.footprintW, hCells: def.footprintH, name: def.shortName, type: def.key, alpha: 0.68 });
  ghostLayer.addChild(ghost);
}

function rebuildGrid() {
  if (!world) return;
  if (gridLayer) gridLayer.destroy({ children: true });
  gridLayer = new PIXI.Container();
  gridLayer.zIndex = 5000;
  gridLayer.visible = mode === 'placing' || mode === 'moving';
  world.addChild(gridLayer);

  const def = selectedDef();
  const cols = Math.floor(WORLD.width / GRID.size);
  const rows = Math.floor(WORLD.height / GRID.size);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const ok = canBuild(col, row, def);
      const cell = gridRect(col, row);
      const g = rect(cell.x + 1, cell.y + 1, GRID.size - 2, GRID.size - 2, { color: ok ? 0x35e58a : 0xff5d73, alpha: ok ? 0.10 : 0.18 }, { width: 1, color: ok ? 0x8fffc2 : 0xff9aaa, alpha: 0.30 });
      if (ok) {
        g.eventMode = 'static';
        g.cursor = 'copy';
        g.on('pointertap', () => previewPlacement(col, row));
      }
      gridLayer.addChild(g);
    }
  }
}

function previewPlacement(col, row) {
  if (dragMoved) return;
  const def = selectedDef();
  if (!canBuild(col, row, def)) return;
  pendingPlacement = { type: def.key, x: col * GRID.size, y: row * GRID.size };
  drawGhost();
  refreshInventoryButtons();
}

function laneY(i, lane) {
  const center = ROADS.horizontal[i].y + ROADS.width / 2;
  return lane === 'east' ? center + ROADS.laneOffset : center - ROADS.laneOffset;
}

function laneX(i, lane) {
  const center = ROADS.vertical[i].x + ROADS.width / 2;
  return lane === 'south' ? center + ROADS.laneOffset : center - ROADS.laneOffset;
}

function pathH(i, lane) {
  const y = laneY(i, lane);
  return lane === 'east' ? [{ x: -80, y }, { x: WORLD.width + 80, y }] : [{ x: WORLD.width + 80, y }, { x: -80, y }];
}

function pathV(i, lane) {
  const x = laneX(i, lane);
  return lane === 'south' ? [{ x, y: -80 }, { x, y: WORLD.height + 80 }] : [{ x, y: WORLD.height + 80 }, { x, y: -80 }];
}

function pointOnPath(path, distance) {
  const a = path[0];
  const b = path[1];
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const t = ((distance % len) + len) % len / len;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function addTraffic(asset, path, { scale = 0.55, flip = false, rotation = 0, speed = 80 } = {}) {
  const s = sprite(asset);
  s.anchor.set(0.5);
  s.scale.set(flip ? -scale : scale, scale);
  s.rotation = rotation;
  s.zIndex = 100;
  world.addChild(s);
  traffic.push({ sprite: s, path, speed, d: Math.random() * 600 });
}

function addWalker(path) {
  const p = new PIXI.Container();
  p.addChild(roundRect(-9, -11, 18, 22, 7, 0x2563eb, { width: 2, color: 0x1e293b }));
  p.addChild(roundRect(-7, -27, 14, 14, 7, 0xfed7aa, { width: 2, color: 0x1e293b }));
  p.scale.set(0.78);
  world.addChild(p);
  walkers.push({ sprite: p, path, d: Math.random() * 200, speed: 32 });
}

function buildWorld(vehicleSet) {
  world = new PIXI.Container();
  world.sortableChildren = true;
  app.stage.addChild(world);
  loadPlaced();
  drawGround();
  drawRoads();

  fixedLayer = new PIXI.Container();
  fixedLayer.zIndex = 1000;
  world.addChild(fixedLayer);
  for (const b of FIXED_BUILDINGS) fixedLayer.addChild(createBuildingVisual({ x: b.x, y: b.y, wCells: b.w, hCells: b.h, name: b.label, type: b.key, action: b.action, fixed: true }));
  fixedLayer.addChild(createBuildingVisual({ x: 410, y: 710, wCells: 3, hCells: 2, name: 'Breakdown', type: 'tireRepair' }));

  addTraffic(vehicleSet.carA, pathH(0, 'east'), { scale: 0.43, speed: 92 });
  addTraffic(vehicleSet.carB, pathH(0, 'west'), { scale: 0.43, flip: true, speed: 78 });
  addTraffic(vehicleSet.carA, pathH(1, 'east'), { scale: 0.43, speed: 86 });
  addTraffic(vehicleSet.van, pathH(1, 'west'), { scale: 0.48, flip: true, speed: 68 });
  addTraffic(vehicleSet.truck, pathH(2, 'east'), { scale: 0.48, speed: 76 });
  addTraffic(vehicleSet.carB, pathH(3, 'west'), { scale: 0.43, flip: true, speed: 64 });
  addTraffic(vehicleSet.truck, pathV(1, 'north'), { scale: 0.48, rotation: -Math.PI / 2, speed: 58 });
  addTraffic(vehicleSet.van, pathV(0, 'south'), { scale: 0.48, rotation: Math.PI / 2, speed: 54 });

  addWalker([{ x: 210, y: 170 }, { x: 320, y: 170 }]);
  addWalker([{ x: 640, y: 190 }, { x: 820, y: 190 }]);
  addWalker([{ x: 210, y: 500 }, { x: 320, y: 500 }]);
  addWalker([{ x: 630, y: 842 }, { x: 842, y: 842 }]);

  placementLayer = new PIXI.Container();
  placementLayer.zIndex = 4000;
  world.addChild(placementLayer);
  ghostLayer = new PIXI.Container();
  ghostLayer.zIndex = 4500;
  world.addChild(ghostLayer);
  rebuildPlacements();
  rebuildGrid();
  setUiMode('normal');
}

function setupCamera(host) {
  world.x = WORLD.startX;
  world.y = WORLD.startY;
  clamp();
  let dragging = false;
  let last = null;
  host.addEventListener('pointerdown', (e) => { dragging = true; dragMoved = false; last = { x: e.clientX, y: e.clientY }; });
  window.addEventListener('pointermove', (e) => {
    if (!dragging || !last) return;
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
    world.x += dx;
    world.y += dy;
    last = { x: e.clientX, y: e.clientY };
    clamp();
  });
  window.addEventListener('pointerup', () => { dragging = false; last = null; setTimeout(() => { dragMoved = false; }, 90); });
}

function clamp() {
  const viewW = app.renderer.width / app.renderer.resolution;
  const viewH = app.renderer.height / app.renderer.resolution;
  world.x = Math.max(Math.min(0, viewW - WORLD.width), Math.min(0, world.x));
  world.y = Math.max(Math.min(0, viewH - WORLD.height), Math.min(0, world.y));
}

async function createApp(host) {
  if (app) try { app.destroy(true); } catch {}
  app = new PIXI.Application();
  await app.init({ resizeTo: host, backgroundColor: 0x153a50, antialias: true, resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true });
  host.innerHTML = '';
  host.appendChild(app.canvas);
}

async function mount(host) {
  if (hostMounted === host && isInitialized) return;
  hostMounted = host;
  isInitialized = true;
  traffic = [];
  walkers = [];
  textures.clear();

  await loadManifest();
  const vehicleSet = await resolveVehicleSet();
  const buildingAssets = BUILDING_CATALOG.map(resolveBuildingAsset).filter(Boolean);
  await preload([...Object.values(vehicleSet), ...buildingAssets]);

  await createApp(host);
  buildWorld(vehicleSet);
  setupCamera(host);

  app.ticker.add((ticker) => {
    const dt = Math.min((ticker.deltaMS || 16.67) / 1000, 0.05);
    for (const t of traffic) {
      t.d += t.speed * dt;
      const p = pointOnPath(t.path, t.d);
      t.sprite.x = p.x;
      t.sprite.y = p.y;
      t.sprite.zIndex = p.y + 40;
    }
    for (const w of walkers) {
      w.d += w.speed * dt;
      const p = pointOnPath(w.path, w.d);
      w.sprite.x = p.x;
      w.sprite.y = p.y;
      w.sprite.zIndex = p.y + 45;
    }
  });
}

function inject() {
  const screen = document.querySelector('#screen-world.active');
  if (!screen) return;
  if (!screen.querySelector('.pixiWorldShell')) {
    screen.innerHTML = html();
    isInitialized = false;
    hostMounted = null;
  }
  const host = screen.querySelector('#pixiWorldHost');
  if (host) mount(host);
}

const observer = new MutationObserver(() => inject());
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.addEventListener('load', inject);
document.addEventListener('click', () => requestAnimationFrame(inject));
