import Phaser from 'phaser';
import { ROUTES, GHOST_MODES } from './config.js';
import { routeY, routeAngle, drawRouteScene } from './terrain.js';
import { createVehicle, updateVehicleWheels } from './vehicle.js';
import { createPickups, collectPickups } from './pickups.js';
import { createGhostVehicles, updateGhostVehicles } from './ghosts.js';
import { saveRoadRunner } from './save.js';

export class HillRouteScene extends Phaser.Scene {
  constructor() {
    super('HillRouteScene');
    this.controls = { push: false, slow: false };
  }

  init(data) {
    this.routeKey = data.routeKey;
    this.ghostKey = data.ghostKey;
    this.saveData = data.saveData;
    this.onHud = data.onHud;
  }

  create() {
    this.route = ROUTES[this.routeKey];
    this.elapsed = 0;
    this.xPos = 80;
    this.speed = 0;
    this.energy = 112;
    this.distance = 0;
    this.coins = 0;
    this.parts = 0;
    this.samples = [];
    this.lastSample = 0;
    this.finished = false;

    this.cameras.main.setBackgroundColor(this.route.sky);
    this.cameras.main.setBounds(0, 0, this.route.length + 700, 820);
    drawRouteScene(this, this.route);

    this.player = createVehicle(this, 0xf97316, 'You');
    this.player.x = this.xPos;
    this.player.y = routeY(this.route, this.xPos) - 30;

    this.pickups = createPickups(this, this.route);
    this.ghosts = createGhostVehicles(this, this.route, GHOST_MODES[this.ghostKey], this.saveData);
    this.cameras.main.startFollow(this.player, true, 0.10, 0.10, -145, 95);
  }

  update(time, delta) {
    if (this.finished) return;

    const dt = Math.min(delta / 1000, 0.05);
    this.elapsed += dt;

    if (this.controls.push && this.energy > 0) {
      this.speed += 190 * dt;
      this.energy -= 5.7 * dt;
    }

    if (this.controls.slow) this.speed -= 250 * dt;

    this.speed -= 20 * dt;
    this.speed = Phaser.Math.Clamp(this.speed, 0, 320);
    this.xPos += this.speed * dt;
    this.distance = Math.max(0, this.xPos - 80);

    this.player.x = this.xPos;
    this.player.y = routeY(this.route, this.xPos) - 30;
    this.player.rotation = routeAngle(this.route, this.xPos);
    updateVehicleWheels(this.player, this.speed, dt);

    const rewards = collectPickups(this.player, this.pickups, 1);
    this.coins += rewards.coins;
    this.parts += rewards.parts;
    this.energy = Math.min(120, this.energy + rewards.energy);

    if (this.elapsed - this.lastSample > 0.18) {
      this.samples.push({
        t: Number(this.elapsed.toFixed(2)),
        x: Math.round(this.player.x),
        y: Math.round(this.player.y)
      });
      this.lastSample = this.elapsed;
    }

    updateGhostVehicles(this.route, this.ghosts, this.saveData, this.elapsed);
    this.onHud?.({ distance: this.distance, energy: this.energy });

    if (this.energy <= 0 || this.distance >= this.route.length) {
      this.finish(this.distance >= this.route.length);
    }
  }

  finish(completed) {
    this.finished = true;
    const earned = this.coins + Math.floor(this.distance / 20);
    this.saveData.coins += earned;
    this.saveData.parts += this.parts;

    if (this.distance > this.saveData.bestDistance) {
      this.saveData.bestDistance = Math.floor(this.distance);
      this.saveData.bestTrail = this.samples.slice(-520);
    }

    saveRoadRunner(this.saveData);
    this.onHud?.({ distance: this.distance, energy: this.energy });

    const message = completed
      ? `Route complete. +${earned} coins.`
      : `Run ended at ${Math.floor(this.distance)}m. +${earned} coins.`;

    this.add.rectangle(this.player.x + 170, this.player.y - 95, 310, 78, 0x04111d, 0.86).setDepth(2000);
    this.add.text(this.player.x + 32, this.player.y - 120, message, {
      fontSize: '15px',
      color: '#fff',
      fontStyle: 'bold',
      wordWrap: { width: 280 }
    }).setDepth(2001);
  }
}
