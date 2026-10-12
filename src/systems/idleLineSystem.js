import { IDLE_LINES } from '../data/gameData.js';
import { addCurrency, addXp, canAfford, spendCost } from './economySystem.js';

export function ensureIdleLineState(state) {
  if (!state.idleLines) state.idleLines = {};
  if (!state.idleLines.lines) state.idleLines.lines = {};
  if (!state.idleLines.managers) state.idleLines.managers = {};
  if (!state.idleLines.autoCollect) state.idleLines.autoCollect = {};
  if (typeof state.idleLines.lifetimeCollections !== 'number') state.idleLines.lifetimeCollections = 0;
  if (![1, 10, 100, 'max'].includes(state.idleLines.buyQty)) state.idleLines.buyQty = 1;

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

export function fireLineManager(state, lineKey) {
  const line = getLineDef(lineKey);
  if (!line) return { ok: false, message: 'Unknown income line.' };
  if (!hasManager(state, line.key)) return { ok: false, message: `${line.manager.name} is not hired.` };
  state.idleLines.managers[line.key] = false;
  state.idleLines.autoCollect[line.key] = false;
  return { ok: true, message: `${line.manager.name} was let go. ${line.name} is manual again.` };
}
