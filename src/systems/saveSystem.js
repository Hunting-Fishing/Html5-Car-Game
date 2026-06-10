import { defaultState } from '../state/defaultState.js';

const SAVE_KEY = 'autoMergeGarageV9LocalOnly';

export function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
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
  return defaultState();
}

function reconcile(base, saved) {
  return {
    ...base,
    ...saved,
    currencies: { ...base.currencies, ...(saved.currencies || {}) },
    race: { ...base.race, ...(saved.race || {}) },
    upgrades: { ...base.upgrades, ...(saved.upgrades || {}) },
    buildings: { ...base.buildings, ...(saved.buildings || {}) },
    merge: { ...base.merge, ...(saved.merge || {}) },
    objectives: { ...base.objectives, ...(saved.objectives || {}) }
  };
}
