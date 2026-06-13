import * as PIXI from 'pixi.js';

const WORLD = { width: 960, height: 1720, startX: -220, startY: -300 };
const GRID = { size: 40, storageKey: '365_mobile_city_safe_buildings_v1' };
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
  { key: 'streetKiosk', name: 'Street Kiosk', shortName: 'Kiosk', footprintW: 1, footprintH: 1, cost: 50, owned: 4, colorA: 0x35e58a, colorB: 0x0f766e },
  { key: 'tireRepair', name: 'Tire Repair Shop', shortName: 'Tire', footprintW: 2, footprintH: 2, cost: 150, owned: 3, colorA: 0xfacc15, colorB: 0xca8a04 },
  { key: 'privateShop', name: 'Private Repair Shop', shortName: 'Repair', footprintW: 3, footprintH: 2, cost: 350, owned: 2, colorA: 0xa78bfa, colorB: 0x6d28d9 },
  { key: 'partsWarehouse', name: 'Parts Warehouse', shortName: 'Parts WH', footprintW: 4, footprintH: 3, cost: 750, owned: 1, colorA: 0x2dd4bf, colorB: 0x0891b2 },
  { key: 'dealerShowroom', name: 'Dealer Showroom', shortName: 'Dealer', footprintW: 3, footprintH: 2, cost: 900, owned: 1, colorA: 0x60a5fa, colorB: 0x2563eb },
  { key: 'salvageBlock', name: 'Salvage Yard Block', shortName: 'Salvage', footprintW: 5, footprintH: 4, cost: 1200, owned: 1, colorA: 0xf97316, colorB: 0x9a3412 }
];

const FIXED_BUILDINGS = [
  { x: 60, y: 90, w: 2, h: 2, type: 'dealerShowroom', label: 'Dealer Row', action: 'lines' },
  { x: 465, y: 84, w: 3, h: 2, type: 'partsWarehouse', label: '365 Garage', action: 'garage' },
  { x: 70, y: 395, w: 2, h: 2, type: 'streetKiosk', label: 'Parts Hub', action: 'merge' },
  { x: 710, y: 395, w: 2, h: 2, type: 'privateShop', label: 'Repair Shops', action: 'lines' },
  { x: 70, y: 740, w: 3, h: 2, type: 'salvageBlock', label: 'Salvage Yard', action: 'garage' },
  { x: 710, y: 740, w: 2, h: 2, type: 'tireRepair', label: 'Tow Dispatch', action: 'lines' },
  { x: 70, y: 1070, w: 3, h: 2, type: 'dealerShowroom', label: 'Showcase', action: 'lines' },
  { x: 700, y: 1070, w: 3, h: 2, type: 'privateShop', label: 'Test Track', action: 'race' }
];

let app = null;
let mountedHost = null;
let world = null;
let traffic = [];
let walkers = [];
let placedBuildings = [];
let placementLayer = null;
let gridLayer = null;
let ghostLayer = null;
let mode = 'normal';
let selectedKey = 'streetKiosk';
let pendingPlacement = null;
let movingBuilding = null;
let selectedPlacedId = null;
let dragMoved = false;
let initialized = false;

function defByKey(key) {
  return BUILDING_CATALOG.find((item) => item.key === key) || BUILDING_CATALOG[0];
}

function selectedDef() {
  return defByKey(selectedKey);
}

function html() {
  return `
    <section class="card pixiWorldShell">
      <div class="pixiWorldHeader">
        <h2>365 Auto City — Mobile Game UI V2</h2>
        <p>Normal play hides the grid. Tap Build to place. Tap your placed buildings to move them.</p>
      </div>
      <div class="pixiWorldHost" id="pixiWorldHost"></div>
      <div class="mobileCityHud">
        <div class="mobileCityStatus"><span class="mobileCityModeBadge" data-mobile-city-mode>Normal</span> <span data-mobile-city-help>Tap Build to place owned buildings. Drag the map with one finger.</span></div>
        <div class="mobileCityActions">
          <button class="btn primary" onclick="window.openMobileBuildTraySafe?.()">Build</button>
          <button class="btn ghost" onclick="window.centerMobileCitySafe?.()">Center</button>
          <button class="btn" data-action="screen" data-screen="garage">Manage Shop</button>
          <button class="btn gold" data-action="screen" data-screen="lines">Upgrade Lines</button>
        </div>
        <div class="mobileBuildTray" data-build-tray hidden>
          <div class="mobileTrayTitle"><span>Choose Building</span><span data-selected-building>${selectedDef().name}</span></div>
          <div class="mobileBuildingList">
            ${BUILDING_CATALOG.map((item) => `<button class="btn small ghost" data-building-key="${item.key}" onclick="window.selectMobileBuildingSafe?.('${item.key}')">${item.shortName}<small>${item.footprintW}×${item.footprintH} • owned <span data-owned-count="${item.key}">${ownedRemaining(item.key)}</span></small></button>`).join('')}
          </div>
          <div class="mobileGhostHelp">Tap green land to preview. Confirm to place. Red cells are blocked.</div>
          <div class="mobileConfirmRow" data-confirm-row hidden>
            <button class="btn primary" onclick="window.confirmMobilePlacementSafe?.()">Confirm</button>
            <button class="btn red" onclick="window.cancelMobilePlacementSafe?.()">Cancel</button>
          </div>
          <div class="mobileBuildActions">
            <button class="btn ghost" onclick="window.cancelMobilePlacementSafe?.()">Close Build Mode</button>
            <button class="btn red" onclick="window.clearMobilePlacementsSafe?.()">Clear Test Buildings</button>
          </div>
        </div>
        <div class="mobilePlacedSheet" data-placed-sheet hidden>
          <div class="mobileTrayTitle"><span data-placed-title>Building</span><span>Owned</span></div>
          <div class="mobileGhostHelp">Move mode shows the grid. Choose a green cell, then confirm.</div>
          <div class="mobilePlacedActions">
            <button class="btn primary" onclick="window.moveSelectedMobileBuildingSafe?.()">Move</button>
            <button class="btn ghost" onclick="window.closeMobileBuildingSheetSafe?.()">Close</button>
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

function fillStyle(value) {
  return typeof value === 'number' ? { color: value, alpha: 1 } : value;
}

function rect(x, y, w, h, fill, stroke = null) {
  const g = new PIXI.Graphics();
  g.rect(x, y, w, h).fill(fillStyle(fill));
  if (stroke) g.rect(x, y, w, h).stroke(stroke);
  return g;
}

function roundRect(x, y, w, h, r, fill, stroke = null) {
  const g = new PIXI.Graphics();
  g.roundRect(x, y, w, h, r).fill(fillStyle(fill));
  if (stroke) g.roundRect(x, y, w, h, r).stroke(stroke);
  return g;
}

function circle(x, y, r, fill, stroke = null) {
  const g = new PIXI.Graphics();
  g.circle(x, y, r).fill(fillStyle(fill));
  if (stroke) g.circle(x, y, r).stroke(stroke);
  return g;
}

function textLabel(text, x, y, size = 11, color = 0xffffff) {
  const t = new PIXI.Text({ text, style: { fontFamily: 'Arial', fontSize: size, fontWeight: '900', fill: color, align: 'center' } });
  t.anchor.set(0.5);
  t.x = x;
  t.y = y;
  return t;
}

function makeClickable(container, handler) {
  container.eventMode = 'static';
  container.cursor = 'pointer';
  container.on('pointertap', () => { if (!dragMoved) handler(); });
}

function drawGround() {
  world.addChild(rect(0, 0, WORLD.width, WORLD.height, 0x70c25e));
  for (let y = 0; y < WORLD.height; y += 80) {
    for (let x = 0; x < WORLD.width; x += 80) {
      world.addChild(rect(x, y, 80, 80, { color: (x / 80 + y / 80) % 2 ? 0x65b457 : 0x7bd069, alpha: 0.24 }));
    }
  }
}

function drawRoads() {
  for (const road of ROADS.horizontal) {
    world.addChild(rect(0, road.y - ROADS.sidewalk, WORLD.width, ROADS.sidewalk, 0xb9c1cc));
    world.addChild(rect(0, road.y + ROADS.width, WORLD.width, ROADS.sidewalk, 0xb9c1cc));
    world.addChild(rect(0, road.y, WORLD.width, ROADS.width, 0x202936, { width: 3, color: 0x111827 }));
    world.addChild(rect(0, road.y + ROADS.width / 2 - 2, WORLD.width, 4, { color: 0xf8fafc, alpha: 0.42 }));
    world.addChild(textLabel(road.label, 100, road.y + 18, 10, 0xcbd5e1));
  }
  for (const road of ROADS.vertical) {
    world.addChild(rect(road.x - ROADS.sidewalk, 0, ROADS.sidewalk, WORLD.height, 0xb9c1cc));
    world.addChild(rect(road.x + ROADS.width, 0, ROADS.sidewalk, WORLD.height, 0xb9c1cc));
    world.addChild(rect(road.x, 0, ROADS.width, WORLD.height, 0x202936, { width: 3, color: 0x111827 }));
    world.addChild(rect(road.x + ROADS.width / 2 - 2, 0, 4, WORLD.height, { color: 0xf8fafc, alpha: 0.42 }));
  }
}

function buildingVisual({ x, y, wCells, hCells, type, name, action = null, alpha = 1, fixed = false }) {
  const def = defByKey(type);
  const w = wCells * GRID.size;
  const h = hCells * GRID.size;
  const c = new PIXI.Container();
  c.x = x;
  c.y = y;
  c.zIndex = y + 100;
  c.alpha = alpha;
  c.addChild(roundRect(0, h - 10, w, 16, 8, { color: 0x000000, alpha: 0.20 }));
  c.addChild(roundRect(6, 14, w - 12, h - 18, 9, def.colorA, { width: 2, color: 0x142033 }));
  c.addChild(roundRect(14, 0, w - 28, 28, 7, 0xe2e8f0, { width: 2, color: 0x142033 }));
  c.addChild(roundRect(14, h - 30, Math.max(16, w * 0.22), 30, 5, def.colorB, { width: 2, color: 0x142033 }));
  for (let yy = 0; yy < Math.min(2, hCells); yy++) {
    for (let xx = 0; xx < Math.min(4, wCells + 1); xx++) {
      c.addChild(roundRect(28 + xx * 18, 34 + yy * 16, 10, 8, 2, 0xfde68a));
    }
  }
  c.addChild(roundRect(0, h + 4, w, 20, 10, { color: 0x04111d, alpha: 0.88 }));
  c.addChild(textLabel(name || def.shortName, w / 2, h + 15, 9));
  if (fixed && action) makeClickable(c, () => document.querySelector(`.pixiWorldProxy[data-proxy="${action}"]`)?.click());
  return c;
}

function makeVehicle({ color = 0xf97316, accent = 0xffffff, direction = 'east', truck = false }) {
  const bodyW = truck ? 58 : 48;
  const bodyH = truck ? 25 : 23;
  const car = new PIXI.Container();
  const wheels = [];
  car.addChild(roundRect(-bodyW / 2, -bodyH / 2 + 3, bodyW, bodyH, 8, { color: 0x000000, alpha: 0.22 }));
  car.addChild(roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 8, color, { width: 2, color: 0x172033 }));
  car.addChild(roundRect(-bodyW / 2 + 8, -bodyH / 2 + 4, bodyW - 24, bodyH - 8, 5, accent, { width: 2, color: 0x172033 }));
  car.addChild(rect(bodyW / 2 - 11, -5, 12, 10, { color: 0xffffff, alpha: 0.40 }));
  [[-bodyW / 2 + 10, -bodyH / 2 - 2], [bodyW / 2 - 12, -bodyH / 2 - 2], [-bodyW / 2 + 10, bodyH / 2 + 2], [bodyW / 2 - 12, bodyH / 2 + 2]].forEach(([x, y]) => {
    const wheel = new PIXI.Container();
    wheel.x = x;
    wheel.y = y;
    wheel.addChild(circle(0, 0, 5, 0x111827));
    wheel.addChild(rect(-1, -4, 2, 8, 0xcbd5e1));
    wheel.addChild(rect(-4, -1, 8, 2, 0xcbd5e1));
    car.addChild(wheel);
    wheels.push(wheel);
  });
  if (direction === 'west') car.scale.set(-1, 1);
  if (direction === 'north') car.rotation = -Math.PI / 2;
  if (direction === 'south') car.rotation = Math.PI / 2;
  car._wheels = wheels;
  return car;
}

function pathPoint(path, distance) {
  const a = path[0];
  const b = path[1];
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const t = ((distance % len) + len) % len / len;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function laneY(index, lane) {
  const center = ROADS.horizontal[index].y + ROADS.width / 2;
  return lane === 'east' ? center + ROADS.laneOffset : center - ROADS.laneOffset;
}

function laneX(index, lane) {
  const center = ROADS.vertical[index].x + ROADS.width / 2;
  return lane === 'south' ? center + ROADS.laneOffset : center - ROADS.laneOffset;
}

function pathH(index, lane) {
  const y = laneY(index, lane);
  return lane === 'east' ? [{ x: -80, y }, { x: WORLD.width + 80, y }] : [{ x: WORLD.width + 80, y }, { x: -80, y }];
}

function pathV(index, lane) {
  const x = laneX(index, lane);
  return lane === 'south' ? [{ x, y: -80 }, { x, y: WORLD.height + 80 }] : [{ x, y: WORLD.height + 80 }, { x, y: -80 }];
}

function addTraffic(path, options) {
  const vehicle = makeVehicle(options);
  vehicle.scale.x *= options.scale || 0.72;
  vehicle.scale.y *= options.scale || 0.72;
  vehicle.zIndex = 100;
  world.addChild(vehicle);
  traffic.push({ sprite: vehicle, path, speed: options.speed || 80, d: Math.random() * 600, wheelSpeed: (options.speed || 80) / 10 });
}

function addWalker(path, shirt = 0x2563eb) {
  const p = new PIXI.Container();
  p.addChild(roundRect(-8, -11, 16, 22, 7, shirt, { width: 2, color: 0x1e293b }));
  p.addChild(roundRect(-7, -27, 14, 14, 7, 0xfed7aa, { width: 2, color: 0x1e293b }));
  p.scale.set(0.78);
  world.addChild(p);
  walkers.push({ sprite: p, path, d: Math.random() * 200, speed: 32 });
}

function roadRects() {
  return [
    ...ROADS.horizontal.map((road) => ({ x: 0, y: road.y - ROADS.sidewalk, w: WORLD.width, h: ROADS.width + ROADS.sidewalk * 2 })),
    ...ROADS.vertical.map((road) => ({ x: road.x - ROADS.sidewalk, y: 0, w: ROADS.width + ROADS.sidewalk * 2, h: WORLD.height }))
  ];
}

function buildingRects() {
  const fixed = FIXED_BUILDINGS.map((b) => ({ x: b.x, y: b.y, w: b.w * GRID.size, h: b.h * GRID.size }));
  const placed = placedBuildings.filter((b) => !(mode === 'moving' && movingBuilding?.id === b.id)).map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h }));
  return [...fixed, ...placed, { x: 410, y: 710, w: 120, h: 90 }];
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function gridRect(col, row, w = 1, h = 1) {
  return { x: col * GRID.size, y: row * GRID.size, w: w * GRID.size, h: h * GRID.size };
}

function canBuild(col, row, def = selectedDef()) {
  const box = gridRect(col, row, def.footprintW, def.footprintH);
  if (box.x < 0 || box.y < 0 || box.x + box.w > WORLD.width || box.y + box.h > WORLD.height) return false;
  return ![...roadRects(), ...buildingRects()].some((blocked) => overlaps(box, blocked));
}

function placedCount(type) {
  return placedBuildings.filter((item) => item.type === type).length;
}

function ownedRemaining(type) {
  const def = defByKey(type);
  return Math.max(0, (def.owned || 0) - placedCount(type));
}

function loadPlaced() {
  try { placedBuildings = JSON.parse(localStorage.getItem(GRID.storageKey) || '[]'); }
  catch { placedBuildings = []; }
}

function savePlaced() {
  localStorage.setItem(GRID.storageKey, JSON.stringify(placedBuildings));
}

function updateHud() {
  const badge = document.querySelector('[data-mobile-city-mode]');
  const help = document.querySelector('[data-mobile-city-help]');
  const tray = document.querySelector('[data-build-tray]');
  const sheet = document.querySelector('[data-placed-sheet]');
  const confirm = document.querySelector('[data-confirm-row]');
  if (badge) badge.textContent = mode === 'placing' ? 'Build Mode' : mode === 'moving' ? 'Move Mode' : 'Normal';
  if (help) help.textContent = mode === 'normal' ? 'Tap Build to place owned buildings. Drag the map with one finger.' : mode === 'placing' ? 'Tap a green cell to preview placement.' : 'Tap a green cell to preview the new location.';
  if (tray) tray.hidden = mode === 'normal';
  if (sheet && mode !== 'normal') sheet.hidden = true;
  if (confirm) confirm.hidden = !pendingPlacement;
  document.querySelectorAll('[data-building-key]').forEach((button) => {
    const key = button.getAttribute('data-building-key');
    button.classList.toggle('primary', key === selectedKey);
    button.classList.toggle('ghost', key !== selectedKey);
    button.disabled = ownedRemaining(key) <= 0 && mode !== 'moving';
  });
  document.querySelectorAll('[data-owned-count]').forEach((span) => span.textContent = String(ownedRemaining(span.getAttribute('data-owned-count'))));
  const selected = document.querySelector('[data-selected-building]');
  if (selected) selected.textContent = `${selectedDef().name} • ${selectedDef().footprintW}×${selectedDef().footprintH}`;
  if (gridLayer) gridLayer.visible = mode === 'placing' || mode === 'moving';
}

function clearGhost() {
  if (ghostLayer) ghostLayer.removeChildren();
}

function drawGhost() {
  clearGhost();
  if (!pendingPlacement || !ghostLayer) return;
  const def = defByKey(pendingPlacement.type);
  ghostLayer.addChild(buildingVisual({ x: pendingPlacement.x, y: pendingPlacement.y, wCells: def.footprintW, hCells: def.footprintH, type: def.key, name: def.shortName, alpha: 0.62 }));
}

function rebuildPlacements() {
  if (placementLayer) placementLayer.destroy({ children: true });
  placementLayer = new PIXI.Container();
  placementLayer.zIndex = 4000;
  world.addChild(placementLayer);
  for (const item of placedBuildings) {
    const def = defByKey(item.type);
    const visual = buildingVisual({ x: item.x, y: item.y, wCells: def.footprintW, hCells: def.footprintH, type: item.type, name: item.name, alpha: mode === 'moving' && movingBuilding?.id === item.id ? 0.25 : 1 });
    makeClickable(visual, () => openPlacedSheet(item.id));
    placementLayer.addChild(visual);
  }
}

function rebuildGrid() {
  if (gridLayer) gridLayer.destroy({ children: true });
  gridLayer = new PIXI.Container();
  gridLayer.zIndex = 5000;
  gridLayer.visible = mode === 'placing' || mode === 'moving';
  world.addChild(gridLayer);
  const cols = Math.floor(WORLD.width / GRID.size);
  const rows = Math.floor(WORLD.height / GRID.size);
  const def = selectedDef();
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const ok = canBuild(col, row, def);
      const cell = gridRect(col, row);
      const g = rect(cell.x + 1, cell.y + 1, GRID.size - 2, GRID.size - 2, { color: ok ? 0x35e58a : 0xff5d73, alpha: ok ? 0.10 : 0.18 }, { width: 1, color: ok ? 0x8fffc2 : 0xff9aaa, alpha: 0.32 });
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
  updateHud();
}

function openPlacedSheet(id) {
  if (mode !== 'normal') return;
  selectedPlacedId = id;
  const item = placedBuildings.find((b) => b.id === id);
  const title = document.querySelector('[data-placed-title]');
  const sheet = document.querySelector('[data-placed-sheet]');
  if (title && item) title.textContent = item.name || defByKey(item.type).name;
  if (sheet) sheet.hidden = false;
}

window.openMobileBuildTraySafe = () => {
  mode = 'placing';
  pendingPlacement = null;
  movingBuilding = null;
  selectedPlacedId = null;
  clearGhost();
  rebuildGrid();
  updateHud();
};

window.selectMobileBuildingSafe = (key) => {
  if (!defByKey(key)) return;
  if (ownedRemaining(key) <= 0 && mode !== 'moving') return;
  selectedKey = key;
  pendingPlacement = null;
  clearGhost();
  mode = 'placing';
  rebuildGrid();
  updateHud();
};

window.confirmMobilePlacementSafe = () => {
  if (!pendingPlacement) return;
  const def = selectedDef();
  if (mode === 'moving' && movingBuilding) {
    placedBuildings = placedBuildings.map((b) => b.id === movingBuilding.id ? { ...b, x: pendingPlacement.x, y: pendingPlacement.y } : b);
  } else {
    if (ownedRemaining(def.key) <= 0) return;
    placedBuildings.push({ id: `${def.key}-${Date.now()}`, type: def.key, name: def.shortName, x: pendingPlacement.x, y: pendingPlacement.y, w: def.footprintW * GRID.size, h: def.footprintH * GRID.size });
  }
  savePlaced();
  mode = 'normal';
  pendingPlacement = null;
  movingBuilding = null;
  selectedPlacedId = null;
  clearGhost();
  rebuildPlacements();
  rebuildGrid();
  updateHud();
};

window.cancelMobilePlacementSafe = () => {
  mode = 'normal';
  pendingPlacement = null;
  movingBuilding = null;
  selectedPlacedId = null;
  clearGhost();
  rebuildPlacements();
  rebuildGrid();
  updateHud();
};

window.clearMobilePlacementsSafe = () => {
  placedBuildings = [];
  localStorage.removeItem(GRID.storageKey);
  mode = 'normal';
  pendingPlacement = null;
  movingBuilding = null;
  selectedPlacedId = null;
  clearGhost();
  rebuildPlacements();
  rebuildGrid();
  updateHud();
};

window.closeMobileBuildingSheetSafe = () => {
  selectedPlacedId = null;
  const sheet = document.querySelector('[data-placed-sheet]');
  if (sheet) sheet.hidden = true;
};

window.moveSelectedMobileBuildingSafe = () => {
  const item = placedBuildings.find((b) => b.id === selectedPlacedId);
  if (!item) return;
  movingBuilding = item;
  selectedKey = item.type;
  mode = 'moving';
  pendingPlacement = null;
  clearGhost();
  rebuildPlacements();
  rebuildGrid();
  updateHud();
};

window.centerMobileCitySafe = () => {
  if (!world) return;
  world.x = WORLD.startX;
  world.y = WORLD.startY;
  clamp();
};

function buildWorld() {
  world = new PIXI.Container();
  world.sortableChildren = true;
  app.stage.addChild(world);
  loadPlaced();
  drawGround();
  drawRoads();
  for (const b of FIXED_BUILDINGS) {
    world.addChild(buildingVisual({ x: b.x, y: b.y, wCells: b.w, hCells: b.h, type: b.type, name: b.label, action: b.action, fixed: true }));
  }
  world.addChild(buildingVisual({ x: 410, y: 710, wCells: 3, hCells: 2, type: 'tireRepair', name: 'Breakdown' }));

  addTraffic(pathH(0, 'east'), { color: 0xf97316, accent: 0xfef3c7, direction: 'east', speed: 92, scale: 0.72 });
  addTraffic(pathH(0, 'west'), { color: 0x60a5fa, accent: 0xdbeafe, direction: 'west', speed: 78, scale: 0.72 });
  addTraffic(pathH(1, 'east'), { color: 0xfacc15, accent: 0xfffbeb, direction: 'east', speed: 86, scale: 0.72 });
  addTraffic(pathH(1, 'west'), { color: 0x35e58a, accent: 0xe0f2fe, direction: 'west', truck: true, speed: 68, scale: 0.78 });
  addTraffic(pathH(2, 'east'), { color: 0x22c55e, accent: 0xdcfce7, direction: 'east', speed: 76, scale: 0.72 });
  addTraffic(pathH(3, 'west'), { color: 0x2dd4bf, accent: 0xecfeff, direction: 'west', truck: true, speed: 64, scale: 0.78 });
  addTraffic(pathV(1, 'north'), { color: 0xfacc15, accent: 0xfffbeb, direction: 'north', truck: true, speed: 58, scale: 0.76 });
  addTraffic(pathV(0, 'south'), { color: 0x38bdf8, accent: 0xe0f2fe, direction: 'south', truck: true, speed: 54, scale: 0.76 });

  addWalker([{ x: 210, y: 170 }, { x: 320, y: 170 }], 0x2563eb);
  addWalker([{ x: 640, y: 190 }, { x: 820, y: 190 }], 0x16a34a);
  addWalker([{ x: 210, y: 500 }, { x: 320, y: 500 }], 0xf97316);
  addWalker([{ x: 630, y: 842 }, { x: 842, y: 842 }], 0x7c3aed);

  placementLayer = new PIXI.Container();
  placementLayer.zIndex = 4000;
  world.addChild(placementLayer);
  ghostLayer = new PIXI.Container();
  ghostLayer.zIndex = 4500;
  world.addChild(ghostLayer);
  rebuildPlacements();
  rebuildGrid();
  updateHud();
}

function clamp() {
  const viewW = app.renderer.width / app.renderer.resolution;
  const viewH = app.renderer.height / app.renderer.resolution;
  world.x = Math.max(Math.min(0, viewW - WORLD.width), Math.min(0, world.x));
  world.y = Math.max(Math.min(0, viewH - WORLD.height), Math.min(0, world.y));
}

function setupCamera(host) {
  world.x = WORLD.startX;
  world.y = WORLD.startY;
  clamp();
  let dragging = false;
  let last = null;
  host.addEventListener('pointerdown', (event) => { dragging = true; dragMoved = false; last = { x: event.clientX, y: event.clientY }; });
  window.addEventListener('pointermove', (event) => {
    if (!dragging || !last) return;
    const dx = event.clientX - last.x;
    const dy = event.clientY - last.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
    world.x += dx;
    world.y += dy;
    last = { x: event.clientX, y: event.clientY };
    clamp();
  });
  window.addEventListener('pointerup', () => { dragging = false; last = null; setTimeout(() => { dragMoved = false; }, 90); });
}

async function createApp(host) {
  if (app) try { app.destroy(true); } catch {}
  app = new PIXI.Application();
  await app.init({ resizeTo: host, backgroundColor: 0x153a50, antialias: true, resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true });
  host.innerHTML = '';
  host.appendChild(app.canvas);
}

async function mount(host) {
  if (mountedHost === host && initialized) return;
  initialized = true;
  mountedHost = host;
  traffic = [];
  walkers = [];
  await createApp(host);
  buildWorld();
  setupCamera(host);
  app.ticker.add((ticker) => {
    const dt = Math.min((ticker.deltaMS || 16.67) / 1000, 0.05);
    for (const item of traffic) {
      item.d += item.speed * dt;
      const p = pathPoint(item.path, item.d);
      item.sprite.x = p.x;
      item.sprite.y = p.y;
      item.sprite.zIndex = p.y + 40;
      if (item.sprite._wheels) for (const wheel of item.sprite._wheels) wheel.rotation += item.wheelSpeed * dt;
    }
    for (const item of walkers) {
      item.d += item.speed * dt;
      const p = pathPoint(item.path, item.d);
      item.sprite.x = p.x;
      item.sprite.y = p.y;
      item.sprite.zIndex = p.y + 45;
    }
  });
}

function inject() {
  const screen = document.querySelector('#screen-world.active');
  if (!screen) return;
  if (!screen.querySelector('.pixiWorldShell')) {
    screen.innerHTML = html();
    initialized = false;
    mountedHost = null;
  }
  const host = screen.querySelector('#pixiWorldHost');
  if (host) mount(host);
}

const observer = new MutationObserver(() => inject());
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.addEventListener('load', inject);
document.addEventListener('click', () => requestAnimationFrame(inject));
