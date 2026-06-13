export function routeY(route, x) {
  const seed = route.seed || 1;
  return 545
    + Math.sin((x + seed * 120) / 120) * 35
    + Math.sin((x + seed * 70) / 57) * 14
    - Math.sin((x + seed * 30) / 310) * 55;
}

export function routeAngle(route, x) {
  const rise = routeY(route, x + 8) - routeY(route, x - 8);
  return Math.max(-0.65, Math.min(0.65, (rise / 16) * 0.55));
}

export function drawRouteScene(scene, route) {
  const maxX = route.length + 700;

  for (let x = 140; x < maxX; x += 320) {
    scene.add.ellipse(x, 610, 400, 190, 0x3f9a48, 0.24).setDepth(-20);
  }

  for (let x = 180; x < maxX; x += 360) {
    const cloud = scene.add.container(x, 100 + (x % 120));
    cloud.add(scene.add.circle(0, 8, 22, 0xffffff, 0.72));
    cloud.add(scene.add.circle(26, 0, 28, 0xffffff, 0.72));
    cloud.add(scene.add.circle(58, 10, 20, 0xffffff, 0.72));
    cloud.setDepth(-25);
  }

  const ground = scene.add.graphics();
  ground.fillStyle(route.grass, 1);
  ground.beginPath();
  ground.moveTo(0, 820);
  for (let x = 0; x <= maxX; x += 16) ground.lineTo(x, routeY(route, x) + 38);
  ground.lineTo(maxX, 820);
  ground.closePath();
  ground.fillPath();

  const road = scene.add.graphics();
  road.lineStyle(26, route.road, 1);
  road.beginPath();
  road.moveTo(0, routeY(route, 0));
  for (let x = 0; x <= maxX; x += 14) road.lineTo(x, routeY(route, x));
  road.strokePath();

  road.lineStyle(3, 0xf8fafc, 0.5);
  for (let x = 0; x <= maxX; x += 90) {
    road.beginPath();
    road.moveTo(x, routeY(route, x) - 2);
    road.lineTo(x + 42, routeY(route, x + 42) - 2);
    road.strokePath();
  }
}
