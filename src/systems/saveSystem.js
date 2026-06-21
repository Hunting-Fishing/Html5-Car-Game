import { defaultState } from '../state/defaultState.js';

const SAVE_KEY = 'autoMergeGarageV10LocalOnly';
const OLD_SAVE_KEY = 'autoMergeGarageV9LocalOnly';

export function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(OLD_SAVE_KEY);
    if (!raw) return defaultState();
    return reconcile(defaultState(), JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  state.lastSaveAt = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(OLD_SAVE_KEY);
  return defaultState();
}

function reconcile(base, saved) {
  return {
    ...base,
    ...saved,
    version: base.version,
    currencies: { ...base.currencies, ...(saved.currencies || {}) },
    race: { ...base.race, ...(saved.race || {}) },
    idleLines: {
      ...base.idleLines,
      ...(saved.idleLines || {}),
      managers: { ...base.idleLines.managers, ...((saved.idleLines || {}).managers || {}) },
      lines: Object.fromEntries(Object.entries(base.idleLines.lines).map(([key, line]) => [
        key,
        { ...line, ...(((saved.idleLines || {}).lines || {})[key] || {}) }
      ]))
    },
    upgrades: { ...base.upgrades, ...(saved.upgrades || {}) },
    buildings: { ...base.buildings, ...(saved.buildings || {}) },
    merge: { ...base.merge, ...(saved.merge || {}) },
    objectives: { ...base.objectives, ...(saved.objectives || {}) }
  };
}
