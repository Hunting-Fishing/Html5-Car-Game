import { RACE_MODES, PROBLEMS } from '../data/gameData.js';
import { addCurrency, addXp, spendCost } from './economySystem.js';

export function getRaceStats(state) {
  const mode = RACE_MODES[state.race.mode] || RACE_MODES.street;
  const tapPower = 6 + state.upgrades.tapCrew * 3.2 + state.buildings.testTrack * 2.2;
  const idlePower = 0.7 + state.upgrades.idleDriver * 0.32 + state.buildings.companionHub * 0.15;
  const rewardMult = 1 + state.upgrades.routeScout * 0.07 + state.buildings.testTrack * 0.09 + (state.lot?.owned?.billboard ? 0.08 : 0);
  const fuelMax = 100 + state.upgrades.fuelPlan * 12;
  const conditionMax = 100 + state.upgrades.pitKit * 10;
  return { mode, tapPower, idlePower, rewardMult, fuelMax, conditionMax };
}

export function tapRace(state) {
  if (state.race.mode === 'hill') return { ok: false, message: 'Use GAS on Hill Run.' };
  if (state.race.problem) return { ok: false, message: `Fix ${PROBLEMS[state.race.problem].label} first.` };
  const stats = getRaceStats(state);
  state.race.progress += stats.tapPower;
  state.race.fuel -= stats.mode.fuelDrain * 1.25 * Math.max(0.5, 1 - state.upgrades.fuelPlan * 0.035);
  state.race.condition -= stats.mode.conditionDrain * 1.05 * Math.max(0.5, 1 - state.upgrades.pitKit * 0.04);
  state.race.heat += stats.mode.heatGain * Math.max(0.45, 1 - state.upgrades.routeScout * 0.045);
  state.race.lifetimeMeters += stats.tapPower;
  state.objectives.firstTap = true;
  state.daily.taps = (state.daily.taps || 0) + 1;
  addCurrency(state, 'coins', 1.5 + state.upgrades.tapCrew * 1.1);
  checkRaceState(state);
  return { ok: true, message: `+${Math.round(stats.tapPower)}m route boost.` };
}

export function tickRace(state, dt) {
  if (state.race.mode === 'hill') return;
  if (state.race.trafficCooldown > 0) state.race.trafficCooldown -= dt;
  if (state.race.problem) return;
  const stats = getRaceStats(state);
  const distance = stats.idlePower * dt * 4.2;
  state.race.progress += distance;
  state.race.fuel -= stats.mode.fuelDrain * dt * Math.max(0.48, 1 - state.upgrades.fuelPlan * 0.04);
  state.race.condition -= stats.mode.conditionDrain * dt * Math.max(0.5, 1 - state.upgrades.pitKit * 0.045);
  state.race.heat += stats.mode.heatGain * dt * Math.max(0.45, 1 - state.upgrades.routeScout * 0.05);
  state.race.lifetimeMeters += distance;
  addCurrency(state, 'coins', (0.16 + state.upgrades.idleDriver * 0.06) * dt);
  checkRaceState(state, dt);
}

export function changeRaceMode(state, modeKey) {
  if (!RACE_MODES[modeKey]) return { ok: false, message: 'Unknown mode.' };
  state.race.mode = modeKey;
  state.driveTab = modeKey === 'hill' ? 'hill' : 'idle';
  if (modeKey !== 'hill') {
    state.hill.running = false;
    state.hill.gasHeld = false;
  }
  state.race.problem = null;
  state.race.progress = 0;
  state.race.fuel = Math.min(getRaceStats(state).fuelMax, state.race.fuel + 25);
  state.race.condition = Math.min(getRaceStats(state).conditionMax, state.race.condition + 12);
  state.race.heat = Math.max(0, state.race.heat - 18);
  return { ok: true, message: `Mode: ${RACE_MODES[modeKey].label}` };
}

export function fixProblem(state, fixIndex = 0) {
  const problemKey = state.race.problem;
  if (!problemKey) return { ok: false, message: 'No active problem.' };
  const problem = PROBLEMS[problemKey];
  const fix = problem.fixes[fixIndex];
  if (!fix) return { ok: false, message: 'Unknown fix.' };
  if (!spendCost(state, { [fix.resource]: fix.amount })) return { ok: false, message: `Need ${fix.amount} ${fix.resource}.` };
  if (problemKey === 'fuel' || problemKey === 'flip') state.race.fuel = Math.min(getRaceStats(state).fuelMax, 80);
  if (problemKey === 'condition' || problemKey === 'flip') state.race.condition = Math.min(getRaceStats(state).conditionMax, 80);
  if (problemKey === 'heat') state.race.heat = 12;
  if (problemKey === 'traffic') state.race.progress += 22;
  if (problemKey === 'flip') {
    state.hill.tilt = 0;
    state.hill.speed = 0;
  }
  state.race.problem = null;
  state.objectives.fixProblem = true;
  return { ok: true, message: `${problem.label} fixed.` };
}

function checkRaceState(state, dt = 0.016) {
  const stats = getRaceStats(state);
  if (state.race.fuel <= 0) { state.race.fuel = 0; state.race.problem = 'fuel'; return; }
  if (state.race.condition <= 0) { state.race.condition = 0; state.race.problem = 'condition'; return; }
  if (state.race.heat >= 100) { state.race.heat = 100; state.race.problem = 'heat'; return; }
  if ((state.race.trafficCooldown || 0) <= 0 && state.race.progress > 25 && Math.random() < 0.015 * Math.min(1, dt * 8)) {
    state.race.problem = 'traffic';
    state.race.trafficCooldown = 28;
    return;
  }
  if (state.race.progress >= stats.mode.stageLength) completeStage(state, stats);
}

function completeStage(state, stats) {
  state.race.progress = 0;
  state.race.completedStages += 1;
  if (state.race.completedStages % 3 === 0) state.stage += 1;
  const rewardBase = Math.round((45 + state.stage * 9) * stats.mode.rewardRate * stats.rewardMult);
  addCurrency(state, 'coins', rewardBase);
  addCurrency(state, stats.mode.reward, Math.max(1, Math.round(rewardBase / 14)));
  addXp(state, 20 + state.stage * 2);
  state.race.fuel = Math.min(stats.fuelMax, state.race.fuel + 18);
  state.race.condition = Math.min(stats.conditionMax, state.race.condition + 12);
  state.race.heat = Math.max(0, state.race.heat - 26);
  if (state.stage >= 5) state.objectives.stageFive = true;
}
