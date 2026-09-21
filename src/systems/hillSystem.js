import { addCurrency, addXp } from './economySystem.js';

export function startHill(state) {
  if (state.race.problem) return { ok: false, message: 'Fix the route problem first.' };
  if ((state.currencies.fuelCans || 0) < 1 && state.race.fuel < 20) {
    return { ok: false, message: 'Need fuel or a fuel can.' };
  }
  state.driveTab = 'hill';
  state.race.mode = 'hill';
  state.hill.running = true;
  state.hill.gasHeld = false;
  state.hill.distance = 0;
  state.hill.tilt = 0;
  state.hill.speed = 0;
  state.hill.fuel = Math.max(35, Math.min(100, state.race.fuel));
  return { ok: true, message: 'Hill Run started. Hold GAS.' };
}

export function setHillGas(state, held) {
  state.hill.gasHeld = !!held;
}

export function tickHill(state, dt) {
  if (!state.hill.running) return;
  const grip = 1 + (state.upgrades.pitKit || 0) * 0.06 + (state.buildings.testTrack || 0) * 0.08;
  const power = 18 + (state.upgrades.tapCrew || 0) * 2.2;
  if (state.hill.gasHeld) {
    state.hill.speed = Math.min(42, state.hill.speed + power * dt);
    state.hill.fuel -= (12 + state.hill.speed * 0.15) * dt * Math.max(0.55, 1 - (state.upgrades.fuelPlan || 0) * 0.04);
    state.hill.tilt += (0.35 + state.hill.speed * 0.02) * dt;
  } else {
    state.hill.speed = Math.max(0, state.hill.speed - 16 * dt);
    state.hill.tilt = Math.max(0, state.hill.tilt - 0.55 * dt);
  }

  const climb = Math.sin((state.hill.distance / 28) + 0.4);
  const effective = Math.max(0, state.hill.speed * (0.55 + grip * 0.2) - Math.max(0, climb) * 10);
  state.hill.distance += effective * dt;

  if (state.hill.tilt > 1.35) {
    state.hill.running = false;
    state.hill.gasHeld = false;
    state.race.problem = 'flip';
    state.race.condition = Math.max(0, state.race.condition - 12);
    return;
  }
  if (state.hill.fuel <= 0) {
    finishHill(state, false);
    return;
  }
  if (state.hill.distance >= 160) finishHill(state, true);
}

export function finishHill(state, cleared) {
  state.hill.running = false;
  state.hill.gasHeld = false;
  const dist = Math.floor(state.hill.distance);
  state.hill.best = Math.max(state.hill.best || 0, dist);
  state.race.lifetimeMeters += dist;
  state.race.fuel = Math.max(0, state.hill.fuel);
  const coins = Math.round(dist * 0.45 + (cleared ? 40 : 8));
  addCurrency(state, 'coins', coins);
  addCurrency(state, 'scrap', Math.max(1, Math.floor(dist / 40)));
  if (cleared) {
    addXp(state, 18);
    state.race.completedStages += 1;
    if (state.race.completedStages % 3 === 0) state.stage += 1;
    state.daily.hills = (state.daily.hills || 0) + 1;
    if (state.stage >= 5) state.objectives.stageFive = true;
  }
  return { ok: true, message: cleared ? `Hill cleared! +${coins} coins` : `Stalled at ${dist}m. +${coins} coins` };
}
