import { routeY, routeAngle } from './terrain.js';
import { createVehicle } from './vehicle.js';

export function createGhostVehicles(scene, route, ghostMode, saveData) {
  const colors = [0x60a5fa, 0xa78bfa, 0x2dd4bf];
  const ghosts = [];

  for (let i = 0; i < ghostMode.count; i++) {
    const label = i === 0 && saveData.bestTrail.length ? 'Best' : `Ghost ${i + 1}`;
    const node = createVehicle(scene, colors[i], label);
    node.alpha = 0.42;
    ghosts.push({
      node,
      offset: i * 0.75,
      pace: 0.94 + i * 0.07
    });
  }

  return ghosts;
}

export function updateGhostVehicles(route, ghosts, saveData, elapsed) {
  for (const ghost of ghosts) {
    const point = ghostPoint(route, saveData, elapsed, ghost);
    ghost.node.x = point.x;
    ghost.node.y = point.y;
    ghost.node.rotation = routeAngle(route, point.x);
  }
}

function ghostPoint(route, saveData, elapsed, ghost) {
  if (saveData.bestTrail.length > 6) {
    const target = Math.max(0, elapsed - ghost.offset) * ghost.pace;
    let sample = saveData.bestTrail[saveData.bestTrail.length - 1];

    for (const item of saveData.bestTrail) {
      if (item.t >= target) {
        sample = item;
        break;
      }
    }

    return { x: sample.x, y: sample.y };
  }

  const x = 80 + Math.max(0, elapsed - ghost.offset) * (88 * ghost.pace);
  return { x, y: routeY(route, x) - 68 };
}
