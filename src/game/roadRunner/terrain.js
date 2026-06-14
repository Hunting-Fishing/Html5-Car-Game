const VIEW = {
  roadBaseY: 285,
  groundBottomY: 560,
  hillBackdropY: 420
};

export function routeY(route, x) {
  const seed = route.seed || 1;
  const profile = route.profile || 'barangay';
  const base = VIEW.roadBaseY;

  if (profile === 'track') {
    return base
      + Math.sin((x + seed * 90) / 430) * 14
      + Math.sin((x + seed * 40) / 190) * 6
      + Math.sin((x + seed * 20) / 820) * 16;
  }

  if (profile === 'mountain') {
    return base
      + Math.sin((x + seed * 160) / 180) * 44
      + Math.sin((x + seed * 85) / 74) * 14
      - Math.sin((x + seed * 60) / 520) * 48;
  }

  if (profile === 'farm') {
    return base
      + Math.sin((x + seed * 120) / 240) * 26
      + Math.sin((x + seed * 70) / 96) * 10
      - Math.sin((x + seed * 30) / 680) * 22;
  }

  if (profile === 'port') {
    return base
      + Math.sin((x + seed * 110) / 360) * 20
      + Math.sin((x + seed * 55) / 155) * 7
      - Math.sin((x + seed * 40) / 940) * 24;
  }

  return base
    + Math.sin((x + seed * 120) / 175) * 24
    + Math.sin((x + seed * 70) / 78) * 9
    - Math.sin((x + seed * 30) / 540) * 26;
}

export function routeAngle(route, x) {
  const rise = routeY(route, x + 8) - routeY(route, x - 8);
  return Math.max(-0.65, Math.min(0.65, (rise / 16) * 0.55));
}

export function drawRouteScene(scene, route) {
  const maxX = route.length + 700;

  for (let x = 140; x < maxX; x += 360) {
    scene.add.ellipse(x, VIEW.hillBackdropY, 430, 150, 0x3f9a48, 0.22).setDepth(-20);
  }

  for (let x = 180; x < maxX; x += 520) {
    const cloud = scene.add.container(x, 60 + (x % 70));
    cloud.add(scene.add.circle(0, 8, 22, 0xffffff, 0.72));
    cloud.add(scene.add.circle(26, 0, 28, 0xffffff, 0.72));
    cloud.add(scene.add.circle(58, 10, 20, 0xffffff, 0.72));
    cloud.setDepth(-25);
  }

  for (let x = 260; x < maxX; x += 620) {
    const sign = scene.add.container(x, routeY(route, x) - 72);
    sign.add(scene.add.rectangle(0, 18, 6, 40, 0x78350f));
    sign.add(scene.add.roundRectangle(0, 0, 88, 28, 6, 0xfff7ed).setStrokeStyle(3, 0x78350f));
    sign.add(scene.add.text(-34, -8, route.profile === 'track' ? 'TRACK' : '365', { fontSize: '13px', color: '#78350f', fontStyle: 'bold' }));
  }

  const ground = scene.add.graphics();
  ground.fillStyle(route.grass, 1);
  ground.beginPath();
  ground.moveTo(0, VIEW.groundBottomY);
  for (let x = 0; x <= maxX; x += 16) ground.lineTo(x, routeY(route, x) + 38);
  ground.lineTo(maxX, VIEW.groundBottomY);
  ground.closePath();
  ground.fillPath();

  const road = scene.add.graphics();
  road.lineStyle(route.profile === 'track' ? 34 : 28, route.road, 1);
  road.beginPath();
  road.moveTo(0, routeY(route, 0));
  for (let x = 0; x <= maxX; x += 12) road.lineTo(x, routeY(route, x));
  road.strokePath();

  road.lineStyle(4, 0xf8fafc, 0.58);
  for (let x = 0; x <= maxX; x += 120) {
    road.beginPath();
    road.moveTo(x, routeY(route, x) - 2);
    road.lineTo(x + 56, routeY(route, x + 56) - 2);
    road.strokePath();
  }

  if (route.profile === 'track') {
    const curb = scene.add.graphics();
    curb.lineStyle(4, 0xef4444, 0.9);
    curb.beginPath();
    curb.moveTo(0, routeY(route, 0) - 19);
    for (let x = 0; x <= maxX; x += 22) curb.lineTo(x, routeY(route, x) - 19);
    curb.strokePath();
    curb.lineStyle(4, 0xffffff, 0.9);
    curb.beginPath();
    curb.moveTo(0, routeY(route, 0) + 19);
    for (let x = 0; x <= maxX; x += 22) curb.lineTo(x, routeY(route, x) + 19);
    curb.strokePath();
  }
}
