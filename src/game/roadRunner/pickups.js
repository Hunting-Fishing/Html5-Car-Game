import Phaser from 'phaser';
import { routeY } from './terrain.js';

export function createPickups(scene, route) {
  const pickups = [];

  for (let x = 220; x < route.length; x += 130) {
    const type = x % 390 === 0 ? 'energy' : x % 260 === 0 ? 'parts' : 'coin';
    const y = routeY(route, x) - 55 - ((x / 130) % 3) * 15;
    const color = type === 'energy' ? 0x38bdf8 : type === 'parts' ? 0xa78bfa : 0xfacc15;
    const pickup = scene.add.container(x, y);

    pickup.type = type;
    pickup.collected = false;
    pickup.add(scene.add.circle(0, 0, 14, color).setStrokeStyle(3, 0xffffff, 0.65));
    pickup.add(scene.add.text(-7, -9, type === 'energy' ? 'E' : type === 'parts' ? 'P' : '$', {
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#06131d'
    }));
    pickups.push(pickup);
  }

  return pickups;
}

export function collectPickups(vehicle, pickups, routeReward = 1) {
  const rewards = { coins: 0, parts: 0, energy: 0 };

  for (const pickup of pickups) {
    if (pickup.collected) continue;
    const distance = Phaser.Math.Distance.Between(vehicle.x, vehicle.y, pickup.x, pickup.y);
    if (distance >= 46) continue;

    pickup.collected = true;
    pickup.visible = false;

    if (pickup.type === 'energy') rewards.energy += 22;
    if (pickup.type === 'parts') rewards.parts += 2;
    if (pickup.type === 'coin') rewards.coins += Math.round(8 * routeReward);
  }

  return rewards;
}
