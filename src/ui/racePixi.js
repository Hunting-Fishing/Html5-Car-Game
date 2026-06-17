import { Application, Assets, Container, Graphics, Sprite, Text } from 'pixi.js';
import { RACE_MODES, PROBLEMS } from '../data/gameData.js';

const STARTER_CAR_SPRITE = '/assets/vehicles/racer/sprite_0000.png';
const ROUTE_BACKGROUNDS = {
  street: '/assets/race/routes/street.svg',
  delivery: '/assets/race/routes/delivery.svg',
  economy: '/assets/race/routes/economy.svg',
  rough: '/assets/race/routes/rough.svg',
  showcase: '/assets/race/routes/showcase.svg'
};

let app;
let scene;
let background;
let activeBackgroundKey = '';
let roadLayer;
let milestoneLayer;
let streakLayer;
let rewardLayer;
let car;
let carSprite;
let boostGlow;
let warningBanner;
let warningText;
let warningSubText;
let roadMarks = [];
let streaks = [];
let floatingRewards = [];
let hostElement;
let lastProgress = 0;
let lastRewardProgress = 0;
let speedIntensity = 0.15;
let boostTimer = 0;

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
  await Assets.load([STARTER_CAR_SPRITE, ...Object.values(ROUTE_BACKGROUNDS)]);

  scene = new Container();
  app.stage.addChild(scene);

  roadLayer = new Container();
  milestoneLayer = new Container();
  streakLayer = new Container();
  rewardLayer = new Container();

  setRouteBackground('street');
  drawRoad();
  createMilestones();
  createSpeedStreaks();
  createCar();
  createWarningBanner();

  scene.addChild(roadLayer, milestoneLayer, streakLayer, car, rewardLayer, warningBanner);

  app.ticker.add((ticker) => {
    const dt = ticker.deltaTime;
    animateRoad(dt);
    animateStreaks(dt);
    animateCar(dt);
    animateRewards(dt);
  });
}

export function updateRaceCanvas(state) {
  if (!app || !car || !warningBanner) return;
  const modeKey = state.race.mode || 'street';
  const mode = RACE_MODES[modeKey] || RACE_MODES.street;
  const stageLength = Math.max(1, mode.stageLength || 120);
  const progress = Math.max(0, Number(state.race.progress) || 0);
  const progressRatio = Math.min(1, progress / stageLength);
  const progressDelta = Math.max(0, progress - lastProgress);

  setRouteBackground(modeKey);
  car.x = 72 + progressRatio * 212;
  car.scale.set(state.race.problem ? 0.9 : 1);
  speedIntensity = Math.max(0.12, Math.min(1, progressDelta / 9 + (boostTimer > 0 ? 0.65 : 0)));

  if (progress - lastRewardProgress >= 18) {
    spawnReward(`+${Math.round(progress - lastRewardProgress)}m`, car.x + 12, car.y - 70, 0x6dff9f);
    lastRewardProgress = progress;
  }

  updateMilestones(progressRatio);
  if (state.race.problem) {
    const problem = PROBLEMS[state.race.problem];
    setWarning(problem?.label || 'Route Problem', problem?.description || 'Slow down and fix the route.');
  } else {
    setWarning(`Stage ${state.stage}`, `${mode.label} route clear`);
  }

  lastProgress = progress;
}

export function pulseCar() {
  if (!car) return;
  boostTimer = 0.45;
  car.scale.set(1.12);
  spawnReward('BOOST', car.x + 18, car.y - 78, 0xffe05f);
}

function setRouteBackground(key) {
  const nextKey = ROUTE_BACKGROUNDS[key] ? key : 'street';
  if (activeBackgroundKey === nextKey && background) return;
  activeBackgroundKey = nextKey;
  const nextBackground = Sprite.from(ROUTE_BACKGROUNDS[nextKey]);
  nextBackground.width = 900;
  nextBackground.height = 230;
  nextBackground.alpha = 0.98;
  if (background && scene) scene.removeChild(background);
  background = nextBackground;
  if (scene) scene.addChildAt(background, 0);
}

function drawRoad() {
  roadLayer.removeChildren();
  const road = new Graphics();
  road.moveTo(-20, 148)
    .bezierCurveTo(150, 125, 250, 172, 390, 146)
    .bezierCurveTo(535, 118, 635, 184, 920, 142)
    .lineTo(920, 226)
    .bezierCurveTo(710, 250, 580, 210, 424, 224)
    .bezierCurveTo(255, 240, 155, 206, -20, 230)
    .closePath()
    .fill(0x242f3d);
  road.moveTo(-20, 145)
    .bezierCurveTo(150, 122, 250, 169, 390, 143)
    .bezierCurveTo(535, 115, 635, 181, 920, 139)
    .stroke({ width: 4, color: 0x9be7ff, alpha: 0.34 });
  roadLayer.addChild(road);

  roadMarks = [];
  for (let i = 0; i < 13; i += 1) {
    const mark = new Graphics();
    mark.roundRect(i * 82 - 30, 177 + Math.sin(i) * 7, 46, 5, 3).fill({ color: 0xf7f2d2, alpha: 0.72 });
    mark.rotation = Math.sin(i * 0.7) * 0.04;
    roadMarks.push(mark);
    roadLayer.addChild(mark);
  }
}

function createMilestones() {
  milestoneLayer.removeChildren();
  for (let i = 1; i <= 4; i += 1) {
    const marker = new Container();
    marker.x = 72 + i * 52;
    marker.y = 121 + Math.sin(i) * 10;
    const pole = new Graphics();
    pole.roundRect(-2, 0, 4, 42, 2).fill(0x082033);
    const flag = new Graphics();
    flag.roundRect(2, 0, 34, 20, 5).fill(i === 4 ? 0xffd166 : 0x6dff9f).stroke({ width: 2, color: 0x082033, alpha: 0.68 });
    const label = new Text({ text: `${i * 25}%`, style: { fill: '#06131d', fontSize: 8, fontWeight: '900' } });
    label.x = 6;
    label.y = 6;
    marker.addChild(pole, flag, label);
    marker.alpha = 0.48;
    marker.scale.set(0.9);
    milestoneLayer.addChild(marker);
  }
}

function updateMilestones(progressRatio) {
  milestoneLayer.children.forEach((marker, index) => {
    const unlocked = progressRatio >= (index + 1) * 0.25;
    marker.alpha = unlocked ? 1 : 0.42;
    marker.scale.set(unlocked ? 1.07 : 0.9);
  });
}

function createSpeedStreaks() {
  streakLayer.removeChildren();
  streaks = [];
  for (let i = 0; i < 9; i += 1) {
    const streak = new Graphics();
    streak.roundRect(0, 0, 42 + i * 5, 3, 2).fill(0xf8fafc);
    streak.x = 420 + i * 55;
    streak.y = 64 + (i % 5) * 22;
    streak.alpha = 0;
    streaks.push(streak);
    streakLayer.addChild(streak);
  }
}

function createCar() {
  car = new Container();
  boostGlow = new Graphics();
  boostGlow.ellipse(0, 18, 76, 26).fill({ color: 0x6dff9f, alpha: 0.38 });
  boostGlow.alpha = 0;

  carSprite = Sprite.from(STARTER_CAR_SPRITE);
  carSprite.anchor.set(0.5, 0.72);
  carSprite.width = 132;
  carSprite.height = 98;
  carSprite.y = 7;

  car.addChild(boostGlow, carSprite);
  car.x = 72;
  car.y = 146;
}

function createWarningBanner() {
  warningBanner = new Container();
  warningBanner.x = 16;
  warningBanner.y = 14;
  const bg = new Graphics();
  bg.roundRect(0, 0, 250, 45, 16).fill({ color: 0x06131d, alpha: 0.74 }).stroke({ width: 2, color: 0x7ddcff, alpha: 0.58 });
  const cap = new Graphics();
  cap.roundRect(8, 7, 42, 31, 12).fill(0xffd166).stroke({ width: 2, color: 0x3b2300, alpha: 0.45 });
  const bang = new Text({ text: '!', style: { fill: '#3b2300', fontSize: 22, fontWeight: '900' } });
  bang.x = 25;
  bang.y = 8;
  warningText = new Text({ text: '', style: { fill: '#ffffff', fontSize: 15, fontWeight: '900' } });
  warningText.x = 58;
  warningText.y = 8;
  warningSubText = new Text({ text: '', style: { fill: '#bfe9f5', fontSize: 9, fontWeight: '800' } });
  warningSubText.x = 58;
  warningSubText.y = 27;
  warningBanner.addChild(bg, cap, bang, warningText, warningSubText);
}

function setWarning(title, subtitle) {
  warningText.text = title;
  warningSubText.text = subtitle.length > 38 ? `${subtitle.slice(0, 35)}...` : subtitle;
  const problem = title.toLowerCase().includes('problem') || title.toLowerCase().includes('traffic') || title.toLowerCase().includes('break');
  warningBanner.tint = problem ? 0xffd1d1 : 0xffffff;
}

function spawnReward(text, x, y, color = 0xffffff) {
  if (!rewardLayer) return;
  const node = new Text({
    text,
    style: {
      fill: color,
      fontSize: 18,
      fontWeight: '900',
      stroke: { color: '#06131d', width: 4 }
    }
  });
  node.anchor.set(0.5);
  node.x = x;
  node.y = y;
  node.life = 1;
  rewardLayer.addChild(node);
  floatingRewards.push(node);
}

function animateRoad(dt) {
  const speed = (2.1 + speedIntensity * 4.6) * dt;
  roadMarks.forEach((mark) => {
    mark.x -= speed;
    if (mark.x < -110) mark.x += 82 * 13;
  });
}

function animateStreaks(dt) {
  streaks.forEach((streak, index) => {
    streak.alpha = Math.max(0, speedIntensity - 0.18) * (0.38 + index * 0.035);
    streak.x -= (5 + speedIntensity * 20 + index * 0.35) * dt;
    if (streak.x < -120) {
      streak.x = 420 + index * 58;
      streak.y = 58 + ((index + Math.floor(performance.now() / 260)) % 5) * 22;
    }
  });
}

function animateCar(dt) {
  if (!car) return;
  boostTimer = Math.max(0, boostTimer - dt / 60);
  const bob = Math.sin(performance.now() / 115) * (1.2 + speedIntensity * 1.8);
  car.y = 146 + bob;
  car.rotation = Math.sin(performance.now() / 220) * 0.018;
  boostGlow.alpha = Math.max(boostTimer * 1.9, speedIntensity > 0.55 ? speedIntensity * 0.42 : 0);
  boostGlow.scale.set(1 + speedIntensity * 0.18, 0.82 + speedIntensity * 0.18);
  if (boostTimer <= 0 && car.scale.x > 1) {
    const next = Math.max(1, car.scale.x - dt * 0.05);
    car.scale.set(next);
  }
}

function animateRewards(dt) {
  floatingRewards = floatingRewards.filter((node) => {
    node.life -= dt / 60;
    node.y -= dt * 0.62;
    node.alpha = Math.max(0, node.life);
    node.scale.set(1 + (1 - node.life) * 0.16);
    if (node.life <= 0) {
      node.parent?.removeChild(node);
      return false;
    }
    return true;
  });
}

function resize() {
  if (!app || !hostElement) return;
  app.renderer.resize(hostElement.clientWidth, hostElement.clientHeight);
}
