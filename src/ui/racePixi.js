import { Application, Container, Graphics, Text } from 'pixi.js';

let app;
let car;
let scene;
let sky;
let hills;
let road;
let roadMarks = [];
let exhaustParticles = [];
let warningText;
let modeText;
let hostElement;
let currentModeKey = 'street';

const MODE_THEMES = {
  street: {
    sky: 0x0d2638,
    hills: 0x12384f,
    road: 0x1e2830,
    roadEdge: 0x415260,
    mark: 0xf7f2d2,
    carBody: 0x35e58a,
    carAccent: 0x0ea5e9,
    label: 'STREET LOOP'
  },
  delivery: {
    sky: 0x1a2a1a,
    hills: 0x2d4a2d,
    road: 0x2a322a,
    roadEdge: 0x4a5c4a,
    mark: 0xe8f0d0,
    carBody: 0xf59e0b,
    carAccent: 0xdc2626,
    label: 'PARTS DELIVERY'
  },
  economy: {
    sky: 0x0c2a24,
    hills: 0x1a4a3c,
    road: 0x1e2e28,
    roadEdge: 0x3a5a4a,
    mark: 0xd4f0e0,
    carBody: 0x22c55e,
    carAccent: 0x14b8a6,
    label: 'FUEL SAVER'
  },
  rough: {
    sky: 0x2a1a0c,
    hills: 0x4a3520,
    road: 0x3a2e22,
    roadEdge: 0x5a4a38,
    mark: 0xe8d4a8,
    carBody: 0xef4444,
    carAccent: 0xf97316,
    label: 'ROUGH ROAD'
  },
  showcase: {
    sky: 0x1a1030,
    hills: 0x2d1f4a,
    road: 0x221a38,
    roadEdge: 0x4a3a6a,
    mark: 0xf0e0ff,
    carBody: 0xa78bfa,
    carAccent: 0xfbbf24,
    label: 'DEALER SHOWCASE'
  }
};

export async function mountRaceCanvas(host) {
  hostElement = host;
  if (app) {
    host.appendChild(app.canvas);
    resize();
    return;
  }

  app = new Application();
  await app.init({ backgroundAlpha: 0, antialias: true, resizeTo: host });
  host.appendChild(app.canvas);

  scene = new Container();
  app.stage.addChild(scene);

  sky = new Graphics();
  scene.addChild(sky);

  hills = new Graphics();
  scene.addChild(hills);

  road = new Graphics();
  scene.addChild(road);

  for (let i = 0; i < 14; i += 1) {
    const mark = new Graphics();
    roadMarks.push(mark);
    scene.addChild(mark);
  }

  car = new Container();
  scene.addChild(car);
  buildCar(MODE_THEMES.street);

  warningText = new Text({
    text: '',
    style: { fill: '#ffd166', fontSize: 16, fontWeight: '900' }
  });
  warningText.x = 12;
  warningText.y = 10;
  scene.addChild(warningText);

  modeText = new Text({
    text: 'STREET LOOP',
    style: { fill: '#ffffff', fontSize: 13, fontWeight: '800' }
  });
  modeText.x = 12;
  modeText.y = 32;
  modeText.alpha = 0.75;
  scene.addChild(modeText);

  applyTheme('street');

  app.ticker.add((ticker) => {
    const speed = 2.6 * ticker.deltaTime;
    roadMarks.forEach((mark) => {
      mark.x -= speed;
      if (mark.x < -100) mark.x += 92 * 14;
    });
    if (car) {
      car.y = 118 + Math.sin(Date.now() / 130) * 1.8;
    }
    // simple exhaust drift
    exhaustParticles.forEach((p, i) => {
      p.x -= 1.8 * ticker.deltaTime;
      p.alpha -= 0.035 * ticker.deltaTime;
      p.scale.set(Math.max(0.2, p.scale.x - 0.02 * ticker.deltaTime));
      if (p.alpha <= 0) {
        scene.removeChild(p);
        exhaustParticles.splice(i, 1);
      }
    });
  });
}

function buildCar(theme) {
  car.removeChildren();

  // Shadow
  const shadow = new Graphics();
  shadow.ellipse(58, 62, 52, 8).fill({ color: 0x000000, alpha: 0.35 });
  car.addChild(shadow);

  // Main body
  const body = new Graphics();
  body.roundRect(8, 26, 108, 30, 12).fill(theme.carBody);
  body.roundRect(8, 26, 108, 30, 12).stroke({ width: 2, color: 0xffffff, alpha: 0.25 });
  car.addChild(body);

  // Cabin / glass
  const cabin = new Graphics();
  cabin.roundRect(38, 8, 48, 26, 9).fill(0xb8e8ff);
  cabin.roundRect(38, 8, 48, 26, 9).stroke({ width: 1.5, color: 0xffffff, alpha: 0.4 });
  car.addChild(cabin);

  // Nose / front accent
  const nose = new Graphics();
  nose.roundRect(92, 32, 36, 18, 8).fill(theme.carAccent);
  car.addChild(nose);

  // Headlight
  const light = new Graphics();
  light.circle(120, 40, 5).fill(0xfff7cc);
  car.addChild(light);

  // Rear accent
  const rear = new Graphics();
  rear.roundRect(4, 34, 12, 14, 4).fill(0x111827);
  car.addChild(rear);

  // Wheels
  car.addChild(makeWheel(28, 58));
  car.addChild(makeWheel(98, 58));

  // Small wing / spoiler for sportier look
  const spoiler = new Graphics();
  spoiler.roundRect(14, 18, 18, 5, 2).fill(0x1f2937);
  car.addChild(spoiler);

  car.x = 90;
  car.y = 118;
}

function makeWheel(x, y) {
  const g = new Graphics();
  g.circle(x, y, 13).fill(0x0a0f14);
  g.circle(x, y, 7).fill(0x94a3b8);
  g.circle(x, y, 3).fill(0x1e293b);
  return g;
}

function applyTheme(modeKey) {
  const theme = MODE_THEMES[modeKey] || MODE_THEMES.street;
  currentModeKey = modeKey;

  sky.clear();
  sky.rect(0, 0, 1000, 260).fill(theme.sky);

  hills.clear();
  hills
    .moveTo(0, 115)
    .lineTo(80, 78)
    .lineTo(170, 118)
    .lineTo(260, 72)
    .lineTo(380, 120)
    .lineTo(500, 80)
    .lineTo(620, 125)
    .lineTo(760, 88)
    .lineTo(1000, 110)
    .lineTo(1000, 260)
    .lineTo(0, 260)
    .fill(theme.hills);

  road.clear();
  road.rect(0, 148, 1000, 95).fill(theme.road);
  road.rect(0, 146, 1000, 4).fill(theme.roadEdge);

  roadMarks.forEach((mark, i) => {
    mark.clear();
    mark.roundRect(i * 92, 186, 48, 6, 3).fill(theme.mark);
    mark.x = i * 92;
  });

  buildCar(theme);
  if (modeText) modeText.text = theme.label;
}

export function updateRaceCanvas(state) {
  if (!app || !car || !warningText) return;

  // Switch theme when mode changes
  if (state.race.mode !== currentModeKey) {
    applyTheme(state.race.mode);
  }

  const progressRatio = Math.min(1, state.race.progress / 130);
  car.x = 55 + progressRatio * 180;
  car.scale.set(state.race.problem ? 0.93 : 1);

  if (state.race.problem) {
    warningText.text = '⚠ ROUTE PROBLEM';
    warningText.style.fill = '#ff5d73';
  } else {
    warningText.text = `STAGE ${state.stage}`;
    warningText.style.fill = '#ffd166';
  }
}

export function pulseCar() {
  if (!car) return;
  car.scale.set(1.1);
  setTimeout(() => {
    if (car) car.scale.set(1);
  }, 130);

  // Exhaust puff
  if (scene) {
    for (let i = 0; i < 4; i += 1) {
      const p = new Graphics();
      p.circle(0, 0, 5 + Math.random() * 4).fill({ color: 0x94a3b8, alpha: 0.55 });
      p.x = car.x + 8;
      p.y = car.y + 48 + Math.random() * 8;
      p.scale.set(0.8 + Math.random() * 0.4);
      scene.addChild(p);
      exhaustParticles.push(p);
    }
  }
}

function resize() {
  if (!app || !hostElement) return;
  app.renderer.resize(hostElement.clientWidth, hostElement.clientHeight);
}
