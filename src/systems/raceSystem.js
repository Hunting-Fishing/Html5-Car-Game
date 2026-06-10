import { RACE_MODES, PROBLEMS } from '../data/gameData.js';
import { addCurrency, addXp, spendCost } from './economySystem.js';

export function getRaceStats(state) {
  const mode = RACE_MODES[state.race.mode];
  const tapPower = 5 + state.upgrades.tapCrew * 3 + state.buildings.testTrack * 2;
  const idlePower = 0.55 + state.upgrades.idleDriver * 0.28 + state.buildings.companionHub * 0.12;
  const rewardMult = 1 + state.upgrades.routeScout * 0.06 + state.upgrades.dealerBoost * 0.08 + state.buildings.testTrack * 0.08;
  const fuelMax = 100 + state.upgrades.fuelPlan * 10;
  const conditionMax = 100 + state.upgrades.pitKit * 8;
  return { mode, tapPower, idlePower, rewardMult, fuelMax, conditionMax };
}

export function tapRace(state) {
  if (state.race.problem) return { ok: false, message: `Fix ${PROBLEMS[state.race.problem].label} first.` };
  const stats = getRaceStats(state);
  state.race.progress += stats.tapPower;
  state.race.fuel -= stats.mode.fuelDrain * 1.4 * Math.max(0.55, 1 - state.upgrades.fuelPlan * 0.03);
  state.race.condition -= stats.mode.conditionDrain * 1.15 * Math.max(0.55, 1 - state.upgrades.pitKit * 0.035);
  state.race.heat += stats.mode.heatGain * Math.max(0.5, 1 - state.upgrades.routeScout * 0.04);
  state.race.lifetimeMeters += stats.tapPower;
  state.objectives.firstTap = true;
  addCurrency(state, 'coins', 1 + state.upgrades.tapCrew);
  checkRaceState(state);
  return { ok: true, message: `+${Math.round(stats.tapPower)}m route boost.` };
}

export function tickRace(state, dt) {
  if (state.race.problem) return;
  const stats = getRaceStats(state);
  const distance = stats.idlePower * dt * 4;
  state.race.progress += distance;
  state.race.fuel -= stats.mode.fuelDrain * dt * Math.max(0.5, 1 - state.upgrades.fuelPlan * 0.035);
  state.race.condition -= stats.mode.conditionDrain * dt * Math.max(0.55, 1 - state.upgrades.pitKit * 0.04);
  state.race.heat += stats.mode.heatGain * dt * Math.max(0.5, 1 - state.upgrades.routeScout * 0.045);
  state.race.lifetimeMeters += distance;
  const idleCoin = (0.12 + state.upgrades.idleDriver * 0.05) * dt;
  addCurrency(state, 'coins', idleCoin);
  checkRaceState(state);
}

export function changeRaceMode(state, modeKey) {
  if (!RACE_MODES[modeKey]) return { ok: false, message: 'Unknown mode.' };
  state.race.mode = modeKey;
  state.race.problem = null;
  state.race.progress = 0;
  state.race.fuel = Math.min(getRaceStats(state).fuelMax, state.race.fuel + 20);
  state.race.condition = Math.min(getRaceStats(state).conditionMax, state.race.condition + 10);
  state.race.heat = Math.max(0, state.race.heat - 15);
  return { ok: true, message: `Mode changed to ${RACE_MODES[modeKey].label}.` };
}

export function fixProblem(state, fixIndex = 0) {
  const problemKey = state.race.problem;
  if (!problemKey) return { ok: false, message: 'No active route problem.' };
  const problem = PROBLEMS[problemKey];
  const fix = problem.fixes[fixIndex];
  if (!fix) return { ok: false, message: 'Unknown fix.' };
  if (!spendCost(state, { [fix.resource]: fix.amount })) return { ok: false, message: `Need ${fix.amount} ${fix.resource}.` };

  if (problemKey === 'fuel') state.race.fuel = Math.min(getRaceStats(state).fuelMax, 70);
  if (problemKey === 'condition') state.race.condition = Math.min(getRaceStats(state).conditionMax, 72);
  if (problemKey === 'heat') state.race.heat = 18;
  if (problemKey === 'traffic') state.race.progress += 18;

  state.race.problem = null;
  state.objectives.fixProblem = true;
  return { ok: true, message: `${problem.label} fixed.` };
}

function checkRaceState(state) {
  const stats = getRaceStats(state);
  if (state.race.fuel <= 0) {
    state.race.fuel = 0;
    state.race.problem = 'fuel';
    return;
  }
  if (state.race.condition <= 0) {
    state.race.condition = 0;
    state.race.problem = 'condition';
    return;
  }
  if (state.race.heat >= 100) {
    state.race.heat = 100;
    state.race.problem = 'heat';
    return;
  }
  if (Math.random() < 0.0025 && state.race.progress > 20) {
    state.race.problem = 'traffic';
    return;
  }
  if (state.race.progress >= stats.mode.stageLength) completeStage(state, stats);
}

function completeStage(state, stats) {
  state.race.progress = 0;
  state.race.completedStages += 1;
  state.stage += 1;
  const rewardBase = Math.round((38 + state.stage * 8) * stats.mode.rewardRate * stats.rewardMult);
  addCurrency(state, 'coins', rewardBase);
  addCurrency(state, stats.mode.reward, Math.max(1, Math.round(rewardBase / 16)));
  addXp(state, 18 + state.stage * 2);
  state.race.fuel = Math.min(stats.fuelMax, state.race.fuel + 14);
  state.race.condition = Math.min(stats.conditionMax, state.race.condition + 8);
  state.race.heat = Math.max(0, state.race.heat - 22);
  if (state.stage >= 5) state.objectives.stageFive = true;
}
