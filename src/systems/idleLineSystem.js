import { IDLE_LINES } from '../data/gameData.js';
import { addCurrency, addXp, canAfford, spendCost } from './economySystem.js';

export function ensureIdleLineState(state) {
  if (!state.idleLines) state.idleLines = {};
  if (!state.idleLines.lines) state.idleLines.lines = {};
  if (!state.idleLines.managers) state.idleLines.managers = {};
  if (!state.idleLines.autoCollect) state.idleLines.autoCollect = {};
  if (typeof state.idleLines.lifetimeCollections !== 'number') state.idleLines.lifetimeCollections = 0;

  IDLE_LINES.forEach((line) => {
    if (!state.idleLines.lines[line.key]) {
      state.idleLines.lines[line.key] = { level: line.startLevel || 0, cycle: 0, collected: 0 };
    }
    const current = state.idleLines.lines[line.key];
    if (typeof current.level !== 'number') current.level = line.startLevel || 0;
    if (typeof current.cycle !== 'number') current.cycle = 0;
    if (typeof current.collected !== 'number') current.collected = 0;
    if (typeof state.idleLines.managers[line.key] !== 'boolean') state.idleLines.managers[line.key] = false;
    if (typeof state.idleLines.autoCollect[line.key] !== 'boolean') state.idleLines.autoCollect[line.key] = true;
  });
}

export function tickIdleLines(state, dt) {
  ensureIdleLineState(state);
  IDLE_LINES.forEach((line) => {
    const current = getLineState(state, line.key);
    if (!current || current.level <= 0) return;
    const cycleMs = getLineCycleMs(state, line);
    current.cycle += dt * 1000;
    if (!hasManager(state, line.key) || !isAutoCollectEnabled(state, line.key)) {
      current.cycle = Math.min(current.cycle, cycleMs);
      return;
    }
    let loops = 0;
    while (current.cycle >= cycleMs && loops < 20) {
      current.cycle -= cycleMs;
      collectLineReward(state, line, true);
      loops += 1;
    }
  });
}

export function getLineDef(lineKey) {
  return IDLE_LINES.find((line) => line.key === lineKey);
}

export function getLineState(state, lineKey) {
  ensureIdleLineState(state);
  return state.idleLines.lines[lineKey];
}

export function isLineUnlocked(state, line) {
  const current = getLineState(state, line.key);
  if (current.level > 0) return true;
  if (!line.unlock || line.unlock.type === 'starter') return true;
  if (line.unlock.type === 'lineLevel') return (getLineState(state, line.unlock.key)?.level || 0) >= line.unlock.level;
  if (line.unlock.type === 'building') return (state.buildings?.[line.unlock.key] || 0) >= line.unlock.level;
  if (line.unlock.type === 'stage') return (state.stage || 1) >= line.unlock.stage;
  return false;
}

export function unlockText(line) {
  if (!line.unlock || line.unlock.type === 'starter') return 'Unlocked from start.';
  if (line.unlock.type === 'lineLevel') return `Requires ${line.unlock.label} Lv ${line.unlock.level}.`;
  if (line.unlock.type === 'building') return `Requires ${line.unlock.label} Lv ${line.unlock.level}.`;
  if (line.unlock.type === 'stage') return `Requires Stage ${line.unlock.stage}.`;
  return 'Locked.';
}

export function getLineUpgradeCost(state, line) {
  const level = getLineState(state, line.key).level;
  const value = Math.floor(line.baseCost * Math.pow(line.costRate, level));
  return { [line.costResource || 'coins']: Math.max(1, value) };
}

export function getManagerCost(state, line) {
  const level = getLineState(state, line.key).level;
  const multiplier = Math.max(1, Math.floor(level / 25) + 1);
  return Object.fromEntries(Object.entries(line.manager.cost).map(([key, value]) => [key, Math.floor(value * multiplier)]));
}

export function getLineIncome(state, line) {
  const level = getLineState(state, line.key).level;
  if (level <= 0) return 0;
  return Math.max(1, Math.floor(line.baseIncome * level * getIncomeMultiplier(state, line)));
}

export function getLineCycleMs(state, line) {
  return Math.max(850, Math.floor(line.baseCycleMs * getCycleMultiplier(state, line)));
}

export function getIncomeMultiplier(state, line) {
  const level = getLineState(state, line.key).level;
  return line.milestones.reduce((mult, milestone) => {
    if (level >= milestone.level && milestone.type === 'incomeMultiplier') return mult * milestone.value;
    return mult;
  }, 1);
}

export function getCycleMultiplier(state, line) {
  const level = getLineState(state, line.key).level;
  return line.milestones.reduce((mult, milestone) => {
    if (level >= milestone.level && milestone.type === 'cycleMultiplier') return mult * milestone.value;
    return mult;
  }, 1);
}

export function getNextMilestone(state, line) {
  const level = getLineState(state, line.key).level;
  return line.milestones.find((milestone) => level < milestone.level) || null;
}

export function hasManager(state, lineKey) {
  ensureIdleLineState(state);
  return Boolean(state.idleLines.managers[lineKey]);
}

export function isAutoCollectEnabled(state, lineKey) {
  ensureIdleLineState(state);
  return state.idleLines.autoCollect[lineKey] !== false;
}

export function toggleLineAutoCollect(state, lineKey) {
  const line = getLineDef(lineKey);
  if (!line) return { ok: false, message: 'Unknown income line.' };
  if (!hasManager(state, lineKey)) return { ok: false, message: `Hire ${line.manager.name} before toggling auto collect.` };
  state.idleLines.autoCollect[lineKey] = !isAutoCollectEnabled(state, lineKey);
  return {
    ok: true,
    message: `${line.name} auto collect ${state.idleLines.autoCollect[lineKey] ? 'enabled' : 'paused'}.`
  };
}

export function canCollectLine(state, line) {
  const current = getLineState(state, line.key);
  return current.level > 0 && current.cycle >= getLineCycleMs(state, line);
}

export function collectIdleLine(state, lineKey) {
  const line = getLineDef(lineKey);
  if (!line) return { ok: false, message: 'Unknown income line.' };
  const current = getLineState(state, line.key);
  if (current.level <= 0) return { ok: false, message: `${line.name} is not open yet.` };
  if (!canCollectLine(state, line)) return { ok: false, message: `${line.name} is still running.` };
  current.cycle -= getLineCycleMs(state, line);
  const reward = collectLineReward(state, line, false);
  return { ok: true, message: `${line.name}: +${reward.amount} ${reward.label}.` };
}

export function buyLineUpgrade(state, lineKey) {
  const line = getLineDef(lineKey);
  if (!line) return { ok: false, message: 'Unknown income line.' };
  if (!isLineUnlocked(state, line)) return { ok: false, message: unlockText(line) };
  const cost = getLineUpgradeCost(state, line);
  if (!canAfford(state, cost)) return { ok: false, message: 'Not enough resources for this line.' };
  spendCost(state, cost);
  const current = getLineState(state, line.key);
  current.level += 1;
  state.objectives.idleLineUpgrade = true;
  return { ok: true, message: `${line.name} upgraded to Lv ${current.level}.` };
}

export function buyLineManager(state, lineKey) {
  const line = getLineDef(lineKey);
  if (!line) return { ok: false, message: 'Unknown income line.' };
  const current = getLineState(state, line.key);
  if (current.level < line.manager.unlockLevel) return { ok: false, message: `${line.manager.name} unlocks at Lv ${line.manager.unlockLevel}.` };
  if (hasManager(state, line.key)) return { ok: false, message: `${line.manager.name} is already hired.` };
  const cost = getManagerCost(state, line);
  if (!canAfford(state, cost)) return { ok: false, message: 'Not enough resources for manager.' };
  spendCost(state, cost);
  state.idleLines.managers[line.key] = true;
  state.objectives.firstManager = true;
  return { ok: true, message: `${line.manager.name} hired. ${line.name} now auto-collects.` };
}

export function getTotalIdlePerMinute(state) {
  ensureIdleLineState(state);
  return IDLE_LINES.reduce((totals, line) => {
    const current = getLineState(state, line.key);
    if (current.level <= 0) return totals;
    const amount = (getLineIncome(state, line) * 60000) / getLineCycleMs(state, line);
    totals[line.output] = (totals[line.output] || 0) + amount;
    return totals;
  }, {});
}

function collectLineReward(state, line, automatic) {
  const amount = getLineIncome(state, line);
  addCurrency(state, line.output, amount);
  addXp(state, Math.max(1, Math.floor(amount / 12)));
  const current = getLineState(state, line.key);
  current.collected += 1;
  state.idleLines.lifetimeCollections += 1;
  if (!automatic) {
    state.log.unshift(`${line.icon} ${line.name} collected +${amount} ${line.output}.`);
    state.log = state.log.slice(0, 10);
  }
  return { amount, label: line.outputLabel };
}
