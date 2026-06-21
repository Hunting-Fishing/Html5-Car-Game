import Phaser from 'phaser';
import { routeY } from './terrain.js';
import { ROAD_RUNNER_ASSETS } from './assets.js';

export function createPickups(scene, route) {
  const pickups = [];
  const spacing = route.profile === 'track' ? 210 : 185;

  for (let x = 260; x < route.length - 220; x += spacing) {
    const type = x % (spacing * 6) === 0 ? 'energy' : x % (spacing * 4) === 0 ? 'parts' : 'coin';
    const laneOffset = type === 'energy' ? -30 : type === 'parts' ? -34 : -28;
    const y = routeY(route, x) + laneOffset;
    const fallbackColor = type === 'energy' ? 0x38bdf8 : type === 'parts' ? 0xa78bfa : 0xfacc15;
    const pickup = scene.add.container(x, y);
    const asset = ROAD_RUNNER_ASSETS[type];

    pickup.type = type;
    pickup.collected = false;

    if (asset && scene.textures.exists(asset.key)) {
      const icon = scene.add.image(0, 0, asset.key);
      icon.setDisplaySize(28, 28);
      pickup.add(icon);
    } else {
      pickup.add(scene.add.circle(0, 0, 12, fallbackColor).setStrokeStyle(3, 0xffffff, 0.65));
      pickup.add(scene.add.text(-6, -8, type === 'energy' ? 'E' : type === 'parts' ? 'P' : 'C', {
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#06131d'
      }));
    }

    pickups.push(pickup);
  }

  return pickups;
}

export function collectPickups(vehicle, pickups, routeReward = 1) {
  const rewards = { coins: 0, parts: 0, energy: 0 };

  for (const pickup of pickups) {
    if (pickup.collected) continue;
    const distance = Phaser.Math.Distance.Between(vehicle.x, vehicle.y, pickup.x, pickup.y);
    if (distance >= 52) continue;

    pickup.collected = true;
    pickup.visible = false;

    if (pickup.type === 'energy') rewards.energy += 18;
    if (pickup.type === 'parts') rewards.parts += 1;
    if (pickup.type === 'coin') rewards.coins += Math.round(4 * routeReward);
  }

  return rewards;
}
