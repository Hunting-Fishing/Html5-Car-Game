import { Application, Container, Graphics, Text } from 'pixi.js';

let app;
let car;
let roadMarks = [];
let warningText;
let hostElement;

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

  const scene = new Container();
  app.stage.addChild(scene);

  const sky = new Graphics();
  sky.rect(0, 0, 900, 230).fill(0x0d2638);
  scene.addChild(sky);

  const hills = new Graphics();
  hills.moveTo(0, 105).lineTo(90, 72).lineTo(180, 108).lineTo(270, 68).lineTo(390, 110).lineTo(520, 76).lineTo(720, 116).lineTo(900, 84).lineTo(900, 230).lineTo(0, 230).fill(0x12384f);
  scene.addChild(hills);

  const road = new Graphics();
  road.rect(0, 132, 900, 82).fill(0x1e2830);
  road.rect(0, 130, 900, 3).fill(0x415260);
  scene.addChild(road);

  for (let i = 0; i < 12; i += 1) {
    const mark = new Graphics();
    mark.roundRect(i * 86, 168, 42, 5, 3).fill(0xf7f2d2);
    roadMarks.push(mark);
    scene.addChild(mark);
  }

  car = new Container();
  const body = new Graphics();
  body.roundRect(0, 24, 116, 34, 16).fill(0x35e58a).stroke({ width: 2, color: 0xdff9ff, alpha: 0.35 });
  body.roundRect(35, 6, 50, 30, 10).fill(0xbff6ff);
  const nose = new Graphics();
  nose.roundRect(84, 34, 42, 20, 10).fill(0x0ea5e9);
  const w1 = wheel(20, 56);
  const w2 = wheel(90, 56);
  car.addChild(body, nose, w1, w2);
  car.x = 105;
  car.y = 103;
  scene.addChild(car);

  warningText = new Text({ text: '', style: { fill: '#ffd166', fontSize: 18, fontWeight: '900' } });
  warningText.x = 16;
  warningText.y = 16;
  scene.addChild(warningText);

  app.ticker.add((ticker) => {
    const speed = 2.3 * ticker.deltaTime;
    roadMarks.forEach((mark) => {
      mark.x -= speed;
      if (mark.x < -90) mark.x += 86 * 12;
    });
    if (car) car.y = 103 + Math.sin(Date.now() / 120) * 1.6;
  });
}

export function updateRaceCanvas(state) {
  if (!app || !car || !warningText) return;
  const progressRatio = Math.min(1, state.race.progress / 120);
  car.x = 60 + progressRatio * 160;
  car.scale.set(state.race.problem ? 0.94 : 1);
  warningText.text = state.race.problem ? 'ROUTE PROBLEM' : `STAGE ${state.stage}`;
}

export function pulseCar() {
  if (!car) return;
  car.scale.set(1.08);
  setTimeout(() => car && car.scale.set(1), 120);
}

function wheel(x, y) {
  const outer = new Graphics();
  outer.circle(x, y, 14).fill(0x04080c);
  outer.circle(x, y, 7).fill(0x8da6b8);
  return outer;
}

function resize() {
  if (!app || !hostElement) return;
  app.renderer.resize(hostElement.clientWidth, hostElement.clientHeight);
}
