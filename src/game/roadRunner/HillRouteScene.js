import Phaser from 'phaser';
import { ROUTES, GHOST_MODES, routeMeters } from './config.js';
import { routeY, routeAngle, drawRouteScene } from './terrain.js';
import { createVehicle, updateVehicleWheels } from './vehicle.js';
import { createPickups, collectPickups } from './pickups.js';
import { createGhostVehicles, updateGhostVehicles } from './ghosts.js';
import { saveRoadRunner } from './save.js';
import { vehicleStats } from './upgrades.js';
import { ROAD_RUNNER_ASSETS, preloadRoadRunnerAssets } from './assets.js';

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
    this.onReady = data.onReady;
  }

  preload() {
    preloadRoadRunnerAssets(this);
  }

  create() {
    this.route = ROUTES[this.routeKey];
    this.stats = vehicleStats(this.saveData.upgrades);
    this.elapsed = 0;
    this.xPos = 80;
    this.speed = 0;
    this.energy = this.stats.startingEnergy;
    this.distance = 0;
    this.displayDistance = 0;
    this.coins = 0;
    this.parts = 0;
    this.samples = [];
    this.lastSample = 0;
    this.finished = false;

    this.cameras.main.setBackgroundColor(this.route.sky);
    this.cameras.main.setBounds(0, 0, this.route.length + 700, 820);
    drawRouteScene(this, this.route);

    this.player = createVehicle(this, 0xf97316, 'You', ROAD_RUNNER_ASSETS.player.key);
    this.player.x = this.xPos;
    this.player.y = routeY(this.route, this.xPos) - 30;

    this.pickups = createPickups(this, this.route);
    this.ghosts = createGhostVehicles(this, this.route, GHOST_MODES[this.ghostKey], this.saveData);
    this.cameras.main.startFollow(this.player, true, 0.10, 0.10, -145, 95);
    this.onReady?.(this);
  }

  update(time, delta) {
    if (this.finished) return;

    const dt = Math.min(delta / 1000, 0.05);
    this.elapsed += dt;

    if (this.controls.push && this.energy > 0) {
      this.speed += this.stats.pushPower * dt;
      this.energy -= this.stats.energyUse * dt;
    }

    if (this.controls.slow) this.speed -= 250 * dt;

    this.speed -= this.stats.rollingLoss * dt;
    this.speed = Phaser.Math.Clamp(this.speed, 0, this.stats.maxSpeed);
    this.xPos += this.speed * dt;
    this.distance = Math.max(0, this.xPos - 80);
    this.displayDistance = routeMeters(this.route, this.distance);

    this.player.x = this.xPos;
    this.player.y = routeY(this.route, this.xPos) - 30;
    this.player.rotation = Phaser.Math.Linear(
      this.player.rotation,
      Phaser.Math.Clamp(routeAngle(this.route, this.xPos), -this.stats.slopeLimit, this.stats.slopeLimit),
      this.stats.slopeSmoothing
    );
    updateVehicleWheels(this.player, this.speed, dt);

    const rewards = collectPickups(this.player, this.pickups, this.route.reward || 1);
    this.coins += rewards.coins;
    this.parts += rewards.parts;
    this.energy = Math.min(this.stats.startingEnergy + 24, this.energy + rewards.energy);

    if (this.elapsed - this.lastSample > 0.18) {
      this.samples.push({
        t: Number(this.elapsed.toFixed(2)),
        x: Math.round(this.player.x),
        y: Math.round(this.player.y)
      });
      this.lastSample = this.elapsed;
    }

    updateGhostVehicles(this.route, this.ghosts, this.saveData, this.elapsed);
    this.onHud?.({ distance: this.displayDistance, energy: this.energy, maxEnergy: this.stats.startingEnergy });

    if (this.energy <= 0 || this.distance >= this.route.length) {
      this.finish(this.distance >= this.route.length);
    }
  }

  finish(completed) {
    this.finished = true;
    const routeProgressBonus = Math.floor(this.displayDistance / 45);
    const earned = this.coins + routeProgressBonus;
    this.saveData.coins += earned;
    this.saveData.parts += this.parts;

    if (this.displayDistance > this.saveData.bestDistance) {
      this.saveData.bestDistance = Math.floor(this.displayDistance);
      this.saveData.bestTrail = this.samples.slice(-520);
    }

    saveRoadRunner(this.saveData);
    this.onHud?.({ distance: this.displayDistance, energy: this.energy, maxEnergy: this.stats.startingEnergy });

    const message = completed
      ? `Route complete. ${this.route.meters}m. +${earned} coins, +${this.parts} parts.`
      : `Run ended at ${Math.floor(this.displayDistance)}m. +${earned} coins, +${this.parts} parts.`;

    this.add.rectangle(this.player.x + 180, this.player.y - 95, 340, 82, 0x04111d, 0.86).setDepth(2000);
    this.add.text(this.player.x + 22, this.player.y - 124, message, {
      fontSize: '15px',
      color: '#fff',
      fontStyle: 'bold',
      wordWrap: { width: 310 }
    }).setDepth(2001);
  }
}
