import { Application, Assets, Container, Sprite, Text } from 'pixi.js';
import { getRaceMode, getRaceProgressRatio } from './raceProgress.js';

const STARTER_CAR_SPRITE = '/assets/race/cars/starter_compact.png';
const ROUTE_BACKGROUNDS = {
  street: '/assets/race/backgrounds/street_loop.png',
  delivery: '/assets/race/backgrounds/parts_delivery.png',
  economy: '/assets/race/backgrounds/fuel_saver.png',
  rough: '/assets/race/backgrounds/rough_road.png',
  showcase: '/assets/race/backgrounds/dealer_showcase.png'
};
const RACE_SCENE_ASSETS = {
  road: '/assets/race/fx/road_strip.png',
  speedStreaks: '/assets/race/fx/speed_streaks.png',
  boostRing: '/assets/race/fx/tap_boost_ring.png',
  checkpointFlag: '/assets/race/fx/checkpoint_flag.png',
  warningPanel: '/assets/race/fx/warning_panel.png',
  warningBadge: '/assets/race/fx/warning_badge.png'
};
const RACE_ASSET_MANIFEST = [
  STARTER_CAR_SPRITE,
  ...Object.values(ROUTE_BACKGROUNDS),
  ...Object.values(RACE_SCENE_ASSETS)
];
const ROAD_SPACING = 420;

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
let roadSprites = [];
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
  await Assets.load(RACE_ASSET_MANIFEST);

  scene = new Container();
  app.stage.addChild(scene);

  roadLayer = new Container();
  milestoneLayer = new Container();
  streakLayer = new Container();
  rewardLayer = new Container();

  setRouteBackground('street');
  createRoadSprites();
  createMilestones();
  createSpeedStreaks();
  createCar();
  createWarningBanner();
  warningBanner.visible = false;

  scene.addChild(roadLayer, milestoneLayer, streakLayer, car, rewardLayer, warningBanner);

  app.ticker.add((ticker) => {
    const dt = ticker.deltaTime;
    animateRoad(dt);
    animateStreaks(dt);
    animateCar(dt);
    animateRewards(dt);
  });

  window.__racePixiAssetState = {
    car: STARTER_CAR_SPRITE,
    backgrounds: ROUTE_BACKGROUNDS,
    fx: RACE_SCENE_ASSETS,
    graphicsFree: true
  };
}

export function updateRaceCanvas(state) {
  if (!app || !car || !warningBanner) return;
  const raceState = state.race || {};
  const modeKey = raceState.mode || 'street';
  const mode = getRaceMode(modeKey);
  const progress = Math.max(0, Number(raceState.progress) || 0);
  const progressRatio = getRaceProgressRatio(raceState);
  const progressDelta = Math.max(0, progress - lastProgress);

  setRouteBackground(modeKey);
  car.x = 72 + progressRatio * 212;
  car.scale.set(raceState.problem ? 0.9 : 1);
  speedIntensity = Math.max(0.12, Math.min(1, progressDelta / 9 + (boostTimer > 0 ? 0.65 : 0)));

  if (progress - lastRewardProgress >= 18) {
    spawnReward(`+${Math.round(progress - lastRewardProgress)}m`, car.x + 12, car.y - 70, 0x6dff9f);
    lastRewardProgress = progress;
  }

  updateMilestones(progressRatio);
  warningBanner.visible = false;

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

function createRoadSprites() {
  roadLayer.removeChildren();
  roadSprites = [];
  for (let i = 0; i < 3; i += 1) {
    const road = Sprite.from(RACE_SCENE_ASSETS.road);
    road.x = -24 + i * ROAD_SPACING;
    road.y = 118 + (i % 2) * 2;
    road.width = 512;
    road.height = 116;
    road.alpha = 0.98;
    roadSprites.push(road);
    roadLayer.addChild(road);
  }
}

function createMilestones() {
  milestoneLayer.removeChildren();
  for (let i = 1; i <= 4; i += 1) {
    const marker = new Container();
    marker.x = 72 + i * 52;
    marker.y = 121 + Math.sin(i) * 10;
    const flag = Sprite.from(RACE_SCENE_ASSETS.checkpointFlag);
    flag.anchor.set(0.18, 0.24);
    flag.width = 48;
    flag.height = 44;
    flag.tint = i === 4 ? 0xffffff : 0x8dffad;
    const label = new Text({ text: `${i * 25}%`, style: { fill: '#06131d', fontSize: 8, fontWeight: '900' } });
    label.x = 10;
    label.y = 4;
    marker.addChild(flag, label);
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
    const streak = Sprite.from(RACE_SCENE_ASSETS.speedStreaks);
    streak.x = 420 + i * 55;
    streak.y = 64 + (i % 5) * 22;
    streak.width = 62 + i * 5;
    streak.height = 18;
    streak.alpha = 0;
    streaks.push(streak);
    streakLayer.addChild(streak);
  }
}

function createCar() {
  car = new Container();
  boostGlow = Sprite.from(RACE_SCENE_ASSETS.boostRing);
  boostGlow.anchor.set(0.5);
  boostGlow.width = 176;
  boostGlow.height = 96;
  boostGlow.y = 18;
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
  const bg = Sprite.from(RACE_SCENE_ASSETS.warningPanel);
  bg.width = 250;
  bg.height = 48;
  bg.alpha = 0.93;
  const cap = Sprite.from(RACE_SCENE_ASSETS.warningBadge);
  cap.x = 7;
  cap.y = 5;
  cap.width = 43;
  cap.height = 34;
  const warningText = new Text({ text: '', style: { fill: '#ffffff', fontSize: 15, fontWeight: '900' } });
  warningText.x = 58;
  warningText.y = 8;
  const warningSubText = new Text({ text: '', style: { fill: '#bfe9f5', fontSize: 9, fontWeight: '800' } });
  warningSubText.x = 58;
  warningSubText.y = 27;
  warningBanner.addChild(bg, cap, warningText, warningSubText);
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
  roadSprites.forEach((road) => {
    road.x -= speed;
    if (road.x < -ROAD_SPACING - 24) road.x += ROAD_SPACING * roadSprites.length;
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
