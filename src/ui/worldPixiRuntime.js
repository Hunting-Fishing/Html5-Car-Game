import * as PIXI from 'pixi.js';

const WORLD = {
  width: 980,
  height: 1720,
  startX: -250,
  startY: -320
};

let app = null;
let mountedHost = null;
let world = null;
let vehicles = [];
let walkers = [];
let initialized = false;

const vehicleAssets = {
  green: '/assets/vehicles/iso-car-green.svg',
  blue: '/assets/vehicles/iso-car-blue.svg',
  yellow: '/assets/vehicles/iso-sedan-yellow.svg',
  pickup: '/assets/vehicles/iso-pickup-orange.svg',
  van: '/assets/vehicles/iso-van-white.svg',
  delivery: '/assets/vehicles/iso-delivery-teal.svg',
  tow: '/assets/vehicles/iso-tow-yellow.svg',
  broken: '/assets/vehicles/iso-broken-red.svg'
};

function proxyClick(selector) {
  document.querySelector(selector)?.click();
}

function html() {
  return `
    <section class="card pixiWorldShell">
      <div class="pixiWorldHeader">
        <h2>365 Auto City — PixiJS</h2>
        <p>Drag the map. Tap buildings, cars, people, and breakdown events. This is now a live canvas world layer for real development.</p>
      </div>
      <div class="pixiWorldHost" id="pixiWorldHost"></div>
      <div class="pixiWorldHud">
        <div class="hint">PixiJS V1: draggable city camera, large vertical world, depth-sorted roads/buildings, animated cars, walking people, clickable buildings, and tow event.</div>
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
    g.roundRect(x, y, w, h, r).fill(fill);
    if (stroke) g.roundRect(x, y, w, h, r).stroke(stroke);
    return g;
  }
  g.beginFill(fill);
  if (stroke) g.lineStyle(stroke.width || 1, stroke.color || 0xffffff, stroke.alpha ?? 1);
  g.drawRoundedRect(x, y, w, h, r);
  g.endFill();
  return g;
}

function gRect(x, y, w, h, fill, stroke = null) {
  const g = new PIXI.Graphics();
  if (g.rect) {
    g.rect(x, y, w, h).fill(fill);
    if (stroke) g.rect(x, y, w, h).stroke(stroke);
    return g;
  }
  g.beginFill(fill);
  if (stroke) g.lineStyle(stroke.width || 1, stroke.color || 0xffffff, stroke.alpha ?? 1);
  g.drawRect(x, y, w, h);
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

  ground.addChild(gRect(0, 0, WORLD.width, WORLD.height, 0x71bd5d));

  for (let y = 0; y < WORLD.height; y += 80) {
    for (let x = 0; x < WORLD.width; x += 80) {
      const tile = new PIXI.Graphics();
      const color = (x / 80 + y / 80) % 2 === 0 ? 0x78c966 : 0x67b85a;
      if (tile.rect) tile.rect(x, y, 80, 80).fill({ color, alpha: 0.25 });
      else { tile.beginFill(color, 0.25); tile.drawRect(x, y, 80, 80); tile.endFill(); }
      ground.addChild(tile);
    }
  }

  world.addChild(ground);
}

function addRoad(x, y, w, h, label = '') {
  const road = new PIXI.Container();
  road.zIndex = y;
  road.addChild(gRoundRect(x, y, w, h, 8, 0x202936, { width: 4, color: 0x111827, alpha: 1 }));
  const center = gRect(x, y + h / 2 - 3, w, 6, 0xffffff);
  center.alpha = 0.34;
  road.addChild(center);
  if (label) {
    const t = makeText(label, { fontSize: 13, fill: 0xcbd5e1 });
    t.x = x + 12;
    t.y = y + 8;
    road.addChild(t);
  }
  world.addChild(road);
}

function addLot(x, y, w, h, color = 0xd8dee9) {
  const lot = new PIXI.Container();
  lot.zIndex = y + 1;
  lot.addChild(gRoundRect(x, y, w, h, 16, color, { width: 5, color: 0xffffff, alpha: 0.55 }));
  world.addChild(lot);
  return lot;
}

function addBuilding({ x, y, label, colorA, colorB, action, w = 150, h = 112 }) {
  const b = new PIXI.Container();
  b.x = x;
  b.y = y;
  b.zIndex = y + 80;

  const shadow = gRoundRect(14, h - 8, w, 18, 9, { color: 0x000000, alpha: 0.22 });
  b.addChild(shadow);

  const side = gRoundRect(8, 42, 36, 60, 6, colorB, { width: 3, color: 0x1e293b });
  b.addChild(side);
  const front = gRoundRect(38, 35, w - 36, 72, 10, colorA, { width: 3, color: 0x1e293b });
  b.addChild(front);
  const roof = gRoundRect(22, 8, w - 34, 48, 12, 0xe2e8f0, { width: 3, color: 0x1e293b });
  roof.rotation = -0.1;
  b.addChild(roof);

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const win = gRoundRect(54 + col * 28, 52 + row * 22, 17, 13, 3, 0xfde68a);
      win.alpha = 0.92;
      b.addChild(win);
    }
  }

  const titleBg = gRoundRect(12, h + 4, w + 6, 30, 15, { color: 0x04111d, alpha: 0.86 }, { width: 1, color: 0xffffff, alpha: 0.18 });
  b.addChild(titleBg);
  const title = makeText(label, { fontSize: 13, fill: 0xffffff, wordWrap: true, wordWrapWidth: w + 2 });
  title.anchor.set(0.5, 0.5);
  title.x = 15 + w / 2;
  title.y = h + 19;
  b.addChild(title);

  makeButton(b, () => proxyClick(`.pixiWorldProxy[data-proxy="${action}"]`));
  world.addChild(b);
  return b;
}

function addEvent({ x, y }) {
  const e = new PIXI.Container();
  e.x = x;
  e.y = y;
  e.zIndex = y + 160;
  e.addChild(gRoundRect(0, 0, 170, 130, 20, { color: 0x7f1d1d, alpha: 0.92 }, { width: 4, color: 0xfb7185 }));

  const sprite = PIXI.Sprite.from(vehicleAssets.broken);
  sprite.anchor.set(0.5);
  sprite.x = 85;
  sprite.y = 52;
  sprite.width = 92;
  sprite.scale.y = sprite.scale.x;
  e.addChild(sprite);

  const badge = gRoundRect(132, -12, 38, 38, 19, 0xfb7185);
  e.addChild(badge);
  const mark = makeText('!', { fontSize: 25, fill: 0xffffff });
  mark.anchor.set(0.5);
  mark.x = 151;
  mark.y = 7;
  e.addChild(mark);

  const title = makeText('Roadside\nBreakdown', { fontSize: 13, fill: 0xffffff, align: 'center' });
  title.anchor.set(0.5);
  title.x = 85;
  title.y = 102;
  e.addChild(title);

  makeButton(e, () => proxyClick('.pixiWorldProxy[data-proxy="tow"]'));
  world.addChild(e);
}

function addParkedCar(src, x, y, rotation = 0, scale = 0.48) {
  const s = PIXI.Sprite.from(src);
  s.anchor.set(0.5);
  s.x = x;
  s.y = y;
  s.rotation = rotation;
  s.scale.set(scale);
  s.zIndex = y + 10;
  world.addChild(s);
  return s;
}

function makeVehicle(src, path, speed = 65, scale = 0.56) {
  const sprite = PIXI.Sprite.from(src);
  sprite.anchor.set(0.5);
  sprite.scale.set(scale);
  sprite.zIndex = 100;
  world.addChild(sprite);
  vehicles.push({ sprite, path, speed, distance: Math.random() * 700 });
}

function makeWalker(x, y, path, color = 0x2563eb) {
  const p = new PIXI.Container();
  p.x = x;
  p.y = y;
  p.zIndex = y + 30;
  p.addChild(gRoundRect(-7, -6, 14, 26, 7, color, { width: 2, color: 0x1e293b }));
  p.addChild(gRoundRect(-5, -18, 10, 10, 5, 0xfed7aa, { width: 2, color: 0x1e293b }));
  world.addChild(p);
  walkers.push({ sprite: p, path, t: Math.random() });
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

function buildWorld() {
  world = new PIXI.Container();
  world.sortableChildren = true;
  app.stage.addChild(world);

  drawGround();

  addRoad(0, 215, WORLD.width, 72, 'Dealer / Factory Ave');
  addRoad(0, 545, WORLD.width, 72, 'Parts / Repair Row');
  addRoad(0, 900, WORLD.width, 72, 'Salvage Corridor');
  addRoad(0, 1230, WORLD.width, 72, 'Showcase Loop');
  addRoad(220, 0, 74, WORLD.height, '');
  addRoad(675, 0, 74, WORLD.height, '');

  addLot(34, 70, 235, 132);
  addLot(410, 58, 300, 150);
  addLot(42, 380, 232, 142);
  addLot(660, 365, 240, 158);
  addLot(40, 745, 300, 160, 0xc7d7b7);
  addLot(650, 760, 245, 150);
  addLot(44, 1085, 265, 145);
  addLot(620, 1080, 300, 160, 0xa8d5c8);
  addLot(245, 1420, 460, 100, 0xd0e3d6);

  addBuilding({ x: 64, y: 78, label: 'Dealer Row', colorA: 0xfbbf24, colorB: 0xd97706, action: 'lines' });
  addBuilding({ x: 470, y: 70, label: '365 Factory / Garage', colorA: 0x22c55e, colorB: 0x0f766e, action: 'garage', w: 180 });
  addBuilding({ x: 70, y: 392, label: 'Parts Hub', colorA: 0x2dd4bf, colorB: 0x0891b2, action: 'merge' });
  addBuilding({ x: 710, y: 382, label: 'Private Repair Shops', colorA: 0xa78bfa, colorB: 0x6d28d9, action: 'lines' });
  addBuilding({ x: 78, y: 765, label: 'Auto Salvage Yard', colorA: 0xf97316, colorB: 0x9a3412, action: 'garage', w: 170 });
  addBuilding({ x: 705, y: 775, label: 'Tow Dispatch', colorA: 0xfacc15, colorB: 0xca8a04, action: 'lines' });
  addBuilding({ x: 75, y: 1100, label: 'Used Car Showcase', colorA: 0x60a5fa, colorB: 0x2563eb, action: 'lines', w: 170 });
  addBuilding({ x: 682, y: 1100, label: '2D Test Track', colorA: 0x38bdf8, colorB: 0x2563eb, action: 'race', w: 170 });

  addEvent({ x: 390, y: 675 });

  addParkedCar(vehicleAssets.green, 105, 192, -0.08);
  addParkedCar(vehicleAssets.blue, 155, 204, -0.08);
  addParkedCar(vehicleAssets.yellow, 205, 216, -0.08);
  addParkedCar(vehicleAssets.van, 830, 516, 0.05, 0.5);
  addParkedCar(vehicleAssets.broken, 105, 900, -0.12, 0.5);
  addParkedCar(vehicleAssets.pickup, 165, 920, -0.12, 0.5);
  addParkedCar(vehicleAssets.broken, 225, 940, -0.12, 0.5);
  addParkedCar(vehicleAssets.green, 105, 1230, 0.08);
  addParkedCar(vehicleAssets.blue, 165, 1248, 0.08);

  makeVehicle(vehicleAssets.green, [{ x: -80, y: 250 }, { x: 1030, y: 250 }], 96, 0.52);
  makeVehicle(vehicleAssets.blue, [{ x: 1030, y: 582 }, { x: -80, y: 582 }], 78, 0.52);
  makeVehicle(vehicleAssets.yellow, [{ x: -80, y: 937 }, { x: 1030, y: 937 }], 86, 0.52);
  makeVehicle(vehicleAssets.delivery, [{ x: 1030, y: 1265 }, { x: -80, y: 1265 }], 70, 0.58);
  makeVehicle(vehicleAssets.pickup, [{ x: 257, y: -80 }, { x: 257, y: 1800 }], 88, 0.52);
  makeVehicle(vehicleAssets.van, [{ x: 712, y: 1800 }, { x: 712, y: -80 }], 72, 0.56);
  makeVehicle(vehicleAssets.tow, [{ x: 1030, y: 937 }, { x: 712, y: 937 }, { x: 712, y: 765 }, { x: 480, y: 740 }], 92, 0.62);

  makeWalker(300, 160, [{ x: 300, y: 160 }, { x: 390, y: 205 }, { x: 330, y: 250 }, { x: 260, y: 205 }], 0x2563eb);
  makeWalker(720, 210, [{ x: 720, y: 210 }, { x: 820, y: 250 }, { x: 760, y: 310 }, { x: 690, y: 250 }], 0x16a34a);
  makeWalker(620, 535, [{ x: 620, y: 535 }, { x: 590, y: 620 }, { x: 690, y: 645 }, { x: 730, y: 560 }], 0xf97316);
  makeWalker(355, 865, [{ x: 355, y: 865 }, { x: 450, y: 900 }, { x: 410, y: 990 }, { x: 330, y: 930 }], 0x7c3aed);
  makeWalker(340, 1190, [{ x: 340, y: 1190 }, { x: 440, y: 1245 }, { x: 350, y: 1310 }, { x: 280, y: 1240 }], 0x0ea5e9);
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
    last = { x: event.clientX, y: event.clientY };
  };
  const move = (event) => {
    if (!dragging || !last) return;
    const dx = event.clientX - last.x;
    const dy = event.clientY - last.y;
    world.x += dx;
    world.y += dy;
    last = { x: event.clientX, y: event.clientY };
    clampWorld();
  };
  const up = () => {
    dragging = false;
    last = null;
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
    item.sprite.rotation = p.angle;
    item.sprite.zIndex = p.y + 40;
  }

  for (const item of walkers) {
    item.t += dt * 0.08;
    const p = pointOnPath(item.path, item.t * 500);
    item.sprite.x = p.x;
    item.sprite.y = p.y + Math.sin(item.t * 18) * 2;
    item.sprite.zIndex = p.y + 45;
  }
}

async function mount(host) {
  if (mountedHost === host && initialized) return;
  initialized = true;
  mountedHost = host;
  vehicles = [];
  walkers = [];

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
