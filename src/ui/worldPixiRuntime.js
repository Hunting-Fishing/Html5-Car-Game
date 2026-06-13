import * as PIXI from 'pixi.js';

const WORLD = {
  width: 920,
  height: 1680,
  startX: -210,
  startY: -280
};

const KENNEY_ROOT = '/assets/vendor/kenney/car-kit/Previews/';
const KENNEY_NESTED = '/assets/vendor/kenney/car-kit/kenney_car-kit/Previews/';

const VEHICLE_CANDIDATES = {
  green: ['hatchback-sports.png', 'sedan.png'],
  blue: ['sedan.png', 'hatchback.png'],
  yellow: ['taxi.png', 'sedan.png'],
  pickup: ['truck.png', 'pickup.png', 'suv.png'],
  van: ['van.png', 'delivery.png'],
  delivery: ['delivery.png', 'truck-delivery.png', 'van.png'],
  tow: ['truck-flat.png', 'truck.png'],
  broken: ['debris-bumper.png', 'debris-side.png', 'debris-wheel.png', 'sedan.png']
};

const FALLBACK_ASSETS = {
  green: '/assets/vehicles/iso-car-green.svg',
  blue: '/assets/vehicles/iso-car-blue.svg',
  yellow: '/assets/vehicles/iso-sedan-yellow.svg',
  pickup: '/assets/vehicles/iso-pickup-orange.svg',
  van: '/assets/vehicles/iso-van-white.svg',
  delivery: '/assets/vehicles/iso-delivery-teal.svg',
  tow: '/assets/vehicles/iso-tow-yellow.svg',
  broken: '/assets/vehicles/iso-broken-red.svg'
};

const ROADS = {
  horizontal: [
    { key: 'dealerAve', y: 238, label: 'Dealer / Factory Ave' },
    { key: 'partsRow', y: 545, label: 'Parts / Repair Row' },
    { key: 'salvageWay', y: 865, label: 'Salvage Way' },
    { key: 'showcaseLoop', y: 1195, label: 'Showcase Loop' }
  ],
  vertical: [
    { key: 'westService', x: 230, label: 'West Service Rd' },
    { key: 'eastService', x: 640, label: 'East Service Rd' }
  ],
  roadWidth: 92,
  laneOffset: 19,
  sidewalk: 18
};

const LOTS = [
  { x: 34, y: 70, w: 170, h: 118, label: 'Dealer Lot' },
  { x: 410, y: 68, w: 225, h: 128, label: '365 Garage Lot' },
  { x: 38, y: 380, w: 168, h: 120, label: 'Parts Lot' },
  { x: 690, y: 378, w: 175, h: 126, label: 'Repair Lot' },
  { x: 38, y: 720, w: 215, h: 132, label: 'Salvage Lot', color: 0xc7d7b7 },
  { x: 685, y: 720, w: 175, h: 126, label: 'Tow Lot' },
  { x: 38, y: 1045, w: 188, h: 130, label: 'Showcase Lot' },
  { x: 650, y: 1045, w: 230, h: 132, label: 'Track Lot', color: 0xa8d5c8 }
];

let app = null;
let mountedHost = null;
let world = null;
let vehicles = [];
let walkers = [];
let initialized = false;
let vehicleAssets = { ...FALLBACK_ASSETS };
let vehicleTextures = {};
let dragMoved = false;

function proxyClick(selector) {
  if (dragMoved) return;
  document.querySelector(selector)?.click();
}

function testImage(path) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = `${path}?v=${Date.now()}`;
  });
}

async function resolveVehicleAsset(key) {
  const names = VEHICLE_CANDIDATES[key] || [];
  for (const name of names) {
    const rootPath = `${KENNEY_ROOT}${name}`;
    if (await testImage(rootPath)) return rootPath;

    const nestedPath = `${KENNEY_NESTED}${name}`;
    if (await testImage(nestedPath)) return nestedPath;
  }
  return FALLBACK_ASSETS[key];
}

async function resolveVehicleAssets() {
  const entries = await Promise.all(
    Object.keys(FALLBACK_ASSETS).map(async (key) => [key, await resolveVehicleAsset(key)])
  );
  vehicleAssets = Object.fromEntries(entries);
  console.info('[365 Auto City] Vehicle assets resolved:', vehicleAssets);
}

async function preloadVehicleTextures() {
  const uniquePaths = [...new Set(Object.values(vehicleAssets))];
  const loaded = await Promise.all(uniquePaths.map(async (path) => {
    try {
      const texture = await PIXI.Assets.load(path);
      return [path, texture];
    } catch (error) {
      console.warn('[365 Auto City] Texture preload failed:', path, error);
      return [path, null];
    }
  }));

  vehicleTextures = Object.fromEntries(loaded.filter(([, texture]) => Boolean(texture)));
  console.info('[365 Auto City] Vehicle textures preloaded:', Object.keys(vehicleTextures));
}

function spriteFrom(path) {
  const texture = vehicleTextures[path];
  if (texture) return new PIXI.Sprite(texture);
  return PIXI.Sprite.from(path);
}

function html() {
  return `
    <section class="card pixiWorldShell">
      <div class="pixiWorldHeader">
        <h2>365 Auto City — Road Rules V1</h2>
        <p>Drag the map. Roads now use lanes, sidewalks, smaller lots, rule-based traffic, and controlled pedestrian paths.</p>
      </div>
      <div class="pixiWorldHost" id="pixiWorldHost"></div>
      <div class="pixiWorldHud">
        <div class="hint">Road Rules V1: vehicles stay in lanes, pedestrians stay on sidewalks/lots, buildings are scaled down, and traffic no longer randomly rotates on every path.</div>
        <div class="pixiProxyRow">
          <button class="btn primary" data-action="worldTow">Dispatch Tow</button>
          <button class="btn" data-action="screen" data-screen="garage">Manage Shop</button>
          <button class="btn" data-action="screen" data-screen="lines">Upgrade Businesses</button>
          <button class="btn ghost" data-action="screen" data-screen="merge">Parts / Merge</button>
        </div>
      </div>
    </section>
    <button class="pixiWorldProxy" data-proxy="garage" data-action="screen" data-screen="garage" hidden></button>
    <button class="pixiWorldProxy" data-proxy="lines" data-action="screen" data-screen="lines" hidden></button>
    <button class="pixiWorldProxy" data-proxy="merge" data-action="screen" data-screen="merge" hidden></button>
    <button class="pixiWorldProxy" data-proxy="race" data-action="screen" data-screen="race" hidden></button>
    <button class="pixiWorldProxy" data-proxy="tow" data-action="worldTow" hidden></button>
  `;
}

async function createPixiApp(host) {
  if (app) {
    try { app.destroy(true); } catch {}
    app = null;
  }

  if (PIXI.Application.prototype.init) {
    const instance = new PIXI.Application();
    await instance.init({
      resizeTo: host,
      backgroundColor: 0x153a50,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true
    });
    return instance;
  }

  return new PIXI.Application({
    resizeTo: host,
    backgroundColor: 0x153a50,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true
  });
}

function appendCanvas(host, instance) {
  host.innerHTML = '';
  host.appendChild(instance.canvas || instance.view);
}

function fillStyle(fill) {
  return typeof fill === 'number' ? { color: fill, alpha: 1 } : fill;
}

function makeText(text, style = {}) {
  const finalStyle = {
    fontFamily: 'Arial, sans-serif',
    fontSize: 20,
    fontWeight: '900',
    fill: 0xffffff,
    align: 'center',
    ...style
  };
  try {
    return new PIXI.Text({ text, style: finalStyle });
  } catch {
    return new PIXI.Text(text, finalStyle);
  }
}

function gRoundRect(x, y, w, h, r, fill, stroke = null) {
  const g = new PIXI.Graphics();
  if (g.roundRect) {
    g.roundRect(x, y, w, h, r).fill(fillStyle(fill));
    if (stroke) g.roundRect(x, y, w, h, r).stroke(stroke);
    return g;
  }
  const f = fillStyle(fill);
  g.beginFill(f.color, f.alpha ?? 1);
  if (stroke) g.lineStyle(stroke.width || 1, stroke.color || 0xffffff, stroke.alpha ?? 1);
  g.drawRoundedRect(x, y, w, h, r);
  g.endFill();
  return g;
}

function gRect(x, y, w, h, fill, stroke = null) {
  const g = new PIXI.Graphics();
  if (g.rect) {
    g.rect(x, y, w, h).fill(fillStyle(fill));
    if (stroke) g.rect(x, y, w, h).stroke(stroke);
    return g;
  }
  const f = fillStyle(fill);
  g.beginFill(f.color, f.alpha ?? 1);
  if (stroke) g.lineStyle(stroke.width || 1, stroke.color || 0xffffff, stroke.alpha ?? 1);
  g.drawRect(x, y, w, h);
  g.endFill();
  return g;
}

function gPolygon(points, fill) {
  const g = new PIXI.Graphics();
  const style = fillStyle(fill);
  if (g.poly) {
    g.poly(points).fill(style);
    return g;
  }
  g.beginFill(style.color, style.alpha ?? 1);
  g.drawPolygon(points);
  g.endFill();
  return g;
}

function makeButton(container, onTap) {
  container.eventMode = 'static';
  container.interactive = true;
  container.cursor = 'pointer';
  container.on('pointertap', onTap);
  container.on('pointerover', () => { container.alpha = 0.92; });
  container.on('pointerout', () => { container.alpha = 1; });
  return container;
}

function drawGround() {
  const ground = new PIXI.Container();
  ground.zIndex = 0;
  ground.addChild(gRect(0, 0, WORLD.width, WORLD.height, 0x70c25e));

  for (let y = 0; y < WORLD.height; y += 80) {
    for (let x = 0; x < WORLD.width; x += 80) {
      const tileColor = (x / 80 + y / 80) % 2 === 0 ? 0x7bd069 : 0x68b95b;
      ground.addChild(gRect(x, y, 80, 80, { color: tileColor, alpha: 0.22 }));
    }
  }

  world.addChild(ground);
}

function addLaneArrow(x, y, direction) {
  const arrow = new PIXI.Container();
  arrow.x = x;
  arrow.y = y;
  arrow.alpha = 0.52;

  if (direction === 'east') {
    arrow.addChild(gPolygon([0, -6, 18, 0, 0, 6], 0xffffff));
  } else if (direction === 'west') {
    arrow.addChild(gPolygon([18, -6, 0, 0, 18, 6], 0xffffff));
  } else if (direction === 'south') {
    arrow.addChild(gPolygon([-6, 0, 0, 18, 6, 0], 0xffffff));
  } else if (direction === 'north') {
    arrow.addChild(gPolygon([-6, 18, 0, 0, 6, 18], 0xffffff));
  }

  world.addChild(arrow);
}

function addHorizontalRoad(y, label = '') {
  const h = ROADS.roadWidth;
  const road = new PIXI.Container();
  road.zIndex = y;

  road.addChild(gRect(0, y - ROADS.sidewalk, WORLD.width, ROADS.sidewalk, 0xb9c1cc));
  road.addChild(gRect(0, y + h, WORLD.width, ROADS.sidewalk, 0xb9c1cc));
  road.addChild(gRect(0, y, WORLD.width, h, 0x202936, { width: 3, color: 0x111827 }));
  road.addChild(gRect(0, y + h / 2 - 2, WORLD.width, 4, { color: 0xf8fafc, alpha: 0.42 }));

  if (label) {
    const t = makeText(label, { fontSize: 13, fill: 0xcbd5e1 });
    t.x = 12;
    t.y = y + 7;
    road.addChild(t);
  }

  world.addChild(road);

  for (let x = 95; x < WORLD.width; x += 180) {
    addLaneArrow(x, y + h / 2 + ROADS.laneOffset, 'east');
    addLaneArrow(x + 70, y + h / 2 - ROADS.laneOffset, 'west');
  }
}

function addVerticalRoad(x, label = '') {
  const w = ROADS.roadWidth;
  const road = new PIXI.Container();
  road.zIndex = 1;

  road.addChild(gRect(x - ROADS.sidewalk, 0, ROADS.sidewalk, WORLD.height, 0xb9c1cc));
  road.addChild(gRect(x + w, 0, ROADS.sidewalk, WORLD.height, 0xb9c1cc));
  road.addChild(gRect(x, 0, w, WORLD.height, 0x202936, { width: 3, color: 0x111827 }));
  road.addChild(gRect(x + w / 2 - 2, 0, 4, WORLD.height, { color: 0xf8fafc, alpha: 0.42 }));

  if (label) {
    const t = makeText(label, { fontSize: 12, fill: 0xcbd5e1 });
    t.x = x + 8;
    t.y = 22;
    t.rotation = Math.PI / 2;
    road.addChild(t);
  }

  world.addChild(road);

  for (let y = 125; y < WORLD.height; y += 210) {
    addLaneArrow(x + w / 2 - ROADS.laneOffset, y, 'north');
    addLaneArrow(x + w / 2 + ROADS.laneOffset, y + 85, 'south');
  }
}

function drawRoadNetwork() {
  for (const road of ROADS.horizontal) addHorizontalRoad(road.y, road.label);
  for (const road of ROADS.vertical) addVerticalRoad(road.x, road.label);
}

function addLot({ x, y, w, h, label, color = 0xd8dee9 }) {
  const lot = new PIXI.Container();
  lot.zIndex = y + 1;
  lot.addChild(gRoundRect(x, y, w, h, 14, color, { width: 4, color: 0xffffff, alpha: 0.55 }));

  if (label) {
    const t = makeText(label, { fontSize: 11, fill: 0x334155 });
    t.x = x + 10;
    t.y = y + h - 20;
    lot.addChild(t);
  }

  world.addChild(lot);
}

function drawLots() {
  for (const lot of LOTS) addLot(lot);
}

function addBuilding({ x, y, label, colorA, colorB, action, w = 104, h = 76 }) {
  const b = new PIXI.Container();
  b.x = x;
  b.y = y;
  b.zIndex = y + 80;

  b.addChild(gRoundRect(10, h - 4, w, 12, 6, { color: 0x000000, alpha: 0.18 }));
  b.addChild(gRoundRect(5, 30, 24, 42, 5, colorB, { width: 2, color: 0x1e293b }));
  b.addChild(gRoundRect(28, 25, w - 24, 50, 8, colorA, { width: 2, color: 0x1e293b }));
  const roof = gRoundRect(18, 6, w - 22, 34, 8, 0xe2e8f0, { width: 2, color: 0x1e293b });
  b.addChild(roof);

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      b.addChild(gRoundRect(42 + col * 21, 37 + row * 16, 12, 9, 2, 0xfde68a));
    }
  }

  b.addChild(gRoundRect(0, h + 5, w + 20, 24, 12, { color: 0x04111d, alpha: 0.86 }, { width: 1, color: 0xffffff, alpha: 0.18 }));
  const title = makeText(label, { fontSize: 11, fill: 0xffffff, wordWrap: true, wordWrapWidth: w + 14 });
  title.anchor.set(0.5, 0.5);
  title.x = 10 + w / 2;
  title.y = h + 17;
  b.addChild(title);

  makeButton(b, () => proxyClick(`.pixiWorldProxy[data-proxy="${action}"]`));
  world.addChild(b);
}

function addEvent({ x, y }) {
  const e = new PIXI.Container();
  e.x = x;
  e.y = y;
  e.zIndex = y + 160;
  e.addChild(gRoundRect(0, 0, 120, 92, 16, { color: 0x7f1d1d, alpha: 0.92 }, { width: 3, color: 0xfb7185 }));

  const sprite = spriteFrom(vehicleAssets.broken);
  sprite.anchor.set(0.5);
  sprite.x = 60;
  sprite.y = 38;
  sprite.scale.set(0.86);
  e.addChild(sprite);

  e.addChild(gRoundRect(92, -12, 32, 32, 16, 0xfb7185));
  const mark = makeText('!', { fontSize: 21, fill: 0xffffff });
  mark.anchor.set(0.5);
  mark.x = 108;
  mark.y = 4;
  e.addChild(mark);

  const title = makeText('Roadside\nBreakdown', { fontSize: 11, fill: 0xffffff, align: 'center' });
  title.anchor.set(0.5);
  title.x = 60;
  title.y = 74;
  e.addChild(title);

  makeButton(e, () => proxyClick('.pixiWorldProxy[data-proxy="tow"]'));
  world.addChild(e);
}

function addParkedCar(src, x, y, flip = false, scale = 0.62) {
  const s = spriteFrom(src);
  s.anchor.set(0.5);
  s.x = x;
  s.y = y;
  s.scale.set(flip ? -scale : scale, scale);
  s.zIndex = y + 10;
  world.addChild(s);
}

function makeVehicle(src, path, options = {}) {
  const {
    speed = 74,
    scale = 0.76,
    flip = false,
    rotation = 0,
    label = 'traffic'
  } = options;

  const sprite = spriteFrom(src);
  sprite.anchor.set(0.5);
  sprite.scale.set(flip ? -scale : scale, scale);
  sprite.rotation = rotation;
  sprite.zIndex = 100;
  world.addChild(sprite);
  vehicles.push({ sprite, path, speed, distance: Math.random() * 700, label });
}

function makeWalker(x, y, path, shirt = 0x2563eb, hair = 0x3b2418) {
  const p = new PIXI.Container();
  p.x = x;
  p.y = y;
  p.zIndex = y + 30;

  p.addChild(gRoundRect(-11, 14, 22, 7, 4, { color: 0x000000, alpha: 0.20 }));
  p.addChild(gRoundRect(-7, 5, 5, 17, 3, 0x1e293b));
  p.addChild(gRoundRect(2, 5, 5, 17, 3, 0x1e293b));
  p.addChild(gRoundRect(-11, -14, 22, 24, 8, shirt, { width: 2, color: 0x1e293b }));
  p.addChild(gRoundRect(-15, -9, 5, 18, 3, 0xfed7aa, { width: 1, color: 0x1e293b }));
  p.addChild(gRoundRect(10, -9, 5, 18, 3, 0xfed7aa, { width: 1, color: 0x1e293b }));
  p.addChild(gRoundRect(-8, -31, 16, 16, 8, 0xfed7aa, { width: 2, color: 0x1e293b }));
  p.addChild(gRoundRect(-9, -33, 18, 8, 5, hair, { width: 1, color: 0x1e293b }));

  p.scale.set(0.88);
  world.addChild(p);
  walkers.push({ sprite: p, path, t: Math.random() * 400, speed: 34 });
}

function pointOnPath(path, distance) {
  let total = 0;
  const segments = [];
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segments.push({ a, b, len });
    total += len;
  }

  if (!total) return { x: path[0]?.x || 0, y: path[0]?.y || 0, angle: 0 };

  const d = ((distance % total) + total) % total;
  let walked = 0;
  for (const seg of segments) {
    if (walked + seg.len >= d) {
      const t = (d - walked) / seg.len;
      return {
        x: seg.a.x + (seg.b.x - seg.a.x) * t,
        y: seg.a.y + (seg.b.y - seg.a.y) * t,
        angle: Math.atan2(seg.b.y - seg.a.y, seg.b.x - seg.a.x)
      };
    }
    walked += seg.len;
  }
  return { x: path[0].x, y: path[0].y, angle: 0 };
}

function laneY(roadIndex, lane) {
  const road = ROADS.horizontal[roadIndex];
  const center = road.y + ROADS.roadWidth / 2;
  return lane === 'east' ? center + ROADS.laneOffset : center - ROADS.laneOffset;
}

function laneX(roadIndex, lane) {
  const road = ROADS.vertical[roadIndex];
  const center = road.x + ROADS.roadWidth / 2;
  return lane === 'south' ? center + ROADS.laneOffset : center - ROADS.laneOffset;
}

function hPath(roadIndex, lane) {
  const y = laneY(roadIndex, lane);
  return lane === 'east'
    ? [{ x: -80, y }, { x: WORLD.width + 80, y }]
    : [{ x: WORLD.width + 80, y }, { x: -80, y }];
}

function vPath(roadIndex, lane) {
  const x = laneX(roadIndex, lane);
  return lane === 'south'
    ? [{ x, y: -80 }, { x, y: WORLD.height + 80 }]
    : [{ x, y: WORLD.height + 80 }, { x, y: -80 }];
}

function buildWorld() {
  world = new PIXI.Container();
  world.sortableChildren = true;
  app.stage.addChild(world);

  drawGround();
  drawRoadNetwork();
  drawLots();

  addBuilding({ x: 60, y: 88, label: 'Dealer Row', colorA: 0xfbbf24, colorB: 0xd97706, action: 'lines' });
  addBuilding({ x: 455, y: 90, label: '365 Garage', colorA: 0x22c55e, colorB: 0x0f766e, action: 'garage', w: 124 });
  addBuilding({ x: 64, y: 398, label: 'Parts Hub', colorA: 0x2dd4bf, colorB: 0x0891b2, action: 'merge' });
  addBuilding({ x: 720, y: 398, label: 'Repair Shops', colorA: 0xa78bfa, colorB: 0x6d28d9, action: 'lines' });
  addBuilding({ x: 72, y: 745, label: 'Salvage Yard', colorA: 0xf97316, colorB: 0x9a3412, action: 'garage', w: 112 });
  addBuilding({ x: 720, y: 745, label: 'Tow Dispatch', colorA: 0xfacc15, colorB: 0xca8a04, action: 'lines' });
  addBuilding({ x: 70, y: 1072, label: 'Showcase', colorA: 0x60a5fa, colorB: 0x2563eb, action: 'lines', w: 112 });
  addBuilding({ x: 700, y: 1072, label: 'Test Track', colorA: 0x38bdf8, colorB: 0x2563eb, action: 'race', w: 112 });

  addEvent({ x: 402, y: 708 });

  addParkedCar(vehicleAssets.green, 80, 182, false, 0.55);
  addParkedCar(vehicleAssets.blue, 125, 182, false, 0.55);
  addParkedCar(vehicleAssets.yellow, 170, 182, false, 0.55);
  addParkedCar(vehicleAssets.van, 816, 494, true, 0.58);
  addParkedCar(vehicleAssets.broken, 88, 832, false, 0.60);
  addParkedCar(vehicleAssets.pickup, 138, 832, false, 0.60);
  addParkedCar(vehicleAssets.broken, 188, 832, false, 0.60);
  addParkedCar(vehicleAssets.green, 85, 1160, false, 0.55);
  addParkedCar(vehicleAssets.blue, 135, 1160, false, 0.55);

  makeVehicle(vehicleAssets.green, hPath(0, 'east'), { speed: 92, scale: 0.68, flip: false, label: 'eastbound dealer traffic' });
  makeVehicle(vehicleAssets.blue, hPath(0, 'west'), { speed: 78, scale: 0.68, flip: true, label: 'westbound dealer traffic' });
  makeVehicle(vehicleAssets.yellow, hPath(1, 'east'), { speed: 86, scale: 0.68, flip: false, label: 'eastbound repair traffic' });
  makeVehicle(vehicleAssets.delivery, hPath(1, 'west'), { speed: 66, scale: 0.76, flip: true, label: 'westbound delivery traffic' });
  makeVehicle(vehicleAssets.pickup, hPath(2, 'east'), { speed: 78, scale: 0.70, flip: false, label: 'eastbound salvage traffic' });
  makeVehicle(vehicleAssets.van, hPath(3, 'west'), { speed: 62, scale: 0.74, flip: true, label: 'westbound showcase traffic' });

  // Vertical vehicles are deliberately limited until we add directional sprite sheets.
  // They use fixed rotations instead of random path angles so direction stays rule-based.
  makeVehicle(vehicleAssets.tow, vPath(1, 'north'), { speed: 58, scale: 0.78, rotation: -Math.PI / 2, flip: false, label: 'northbound tow traffic' });
  makeVehicle(vehicleAssets.delivery, vPath(0, 'south'), { speed: 52, scale: 0.74, rotation: Math.PI / 2, flip: false, label: 'southbound parts traffic' });

  makeWalker(214, 168, [{ x: 214, y: 166 }, { x: 214, y: 220 }, { x: 318, y: 220 }, { x: 318, y: 166 }], 0x2563eb, 0x2f1b12);
  makeWalker(646, 190, [{ x: 646, y: 190 }, { x: 810, y: 190 }, { x: 810, y: 520 }, { x: 646, y: 520 }], 0x16a34a, 0x1f2937);
  makeWalker(210, 500, [{ x: 210, y: 500 }, { x: 320, y: 500 }, { x: 320, y: 618 }, { x: 210, y: 618 }], 0xf97316, 0x3b2418);
  makeWalker(630, 842, [{ x: 630, y: 842 }, { x: 842, y: 842 }, { x: 842, y: 950 }, { x: 630, y: 950 }], 0x7c3aed, 0x111827);
  makeWalker(230, 1168, [{ x: 230, y: 1168 }, { x: 380, y: 1168 }, { x: 380, y: 1288 }, { x: 230, y: 1288 }], 0x0ea5e9, 0x2f1b12);
}

function clampWorld() {
  const viewW = app.renderer.width / app.renderer.resolution;
  const viewH = app.renderer.height / app.renderer.resolution;
  const minX = Math.min(0, viewW - WORLD.width);
  const minY = Math.min(0, viewH - WORLD.height);
  world.x = Math.max(minX, Math.min(0, world.x));
  world.y = Math.max(minY, Math.min(0, world.y));
}

function setupCamera(host) {
  world.x = Math.min(0, WORLD.startX);
  world.y = Math.min(0, WORLD.startY);
  clampWorld();

  let dragging = false;
  let last = null;

  const down = (event) => {
    dragging = true;
    dragMoved = false;
    last = { x: event.clientX, y: event.clientY };
  };

  const move = (event) => {
    if (!dragging || !last) return;
    const dx = event.clientX - last.x;
    const dy = event.clientY - last.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
    world.x += dx;
    world.y += dy;
    last = { x: event.clientX, y: event.clientY };
    clampWorld();
  };

  const up = () => {
    dragging = false;
    last = null;
    setTimeout(() => { dragMoved = false; }, 90);
  };

  host.addEventListener('pointerdown', down);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
}

function updateVehicles(dt) {
  for (const item of vehicles) {
    item.distance += item.speed * dt;
    const p = pointOnPath(item.path, item.distance);
    item.sprite.x = p.x;
    item.sprite.y = p.y;
    item.sprite.zIndex = p.y + 40;
  }

  for (const item of walkers) {
    item.t += item.speed * dt;
    const p = pointOnPath(item.path, item.t);
    item.sprite.x = p.x;
    item.sprite.y = p.y;
    item.sprite.zIndex = p.y + 45;
  }
}

async function mount(host) {
  if (mountedHost === host && initialized) return;
  initialized = true;
  mountedHost = host;
  vehicles = [];
  walkers = [];
  vehicleTextures = {};

  await resolveVehicleAssets();
  await preloadVehicleTextures();

  app = await createPixiApp(host);
  appendCanvas(host, app);
  buildWorld();
  setupCamera(host);

  app.ticker.add((ticker) => {
    const dt = (ticker.deltaMS ? ticker.deltaMS : ticker * 16.6667) / 1000;
    updateVehicles(Math.min(dt, 0.05));
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
