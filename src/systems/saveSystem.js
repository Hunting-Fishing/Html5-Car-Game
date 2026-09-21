import { defaultState } from '../state/defaultState.js';

const SAVE_KEY = 'autoMergeGarageV11LocalOnly';
const MAX_OFFLINE_SECONDS = 60 * 60 * 8;

export function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem('autoMergeGarageV9LocalOnly');
    if (!raw) return defaultState();
    const state = reconcile(defaultState(), JSON.parse(raw));
    rollDaily(state);
    applyOfflineProgress(state);
    return state;
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  state.lastSaveAt = Date.now();
  state.lastTickAt = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem('autoMergeGarageV9LocalOnly');
  return defaultState();
}

function reconcile(base, saved) {
  return {
    ...base,
    ...saved,
    currencies: { ...base.currencies, ...(saved.currencies || {}) },
    race: { ...base.race, ...(saved.race || {}) },
    hill: { ...base.hill, ...(saved.hill || {}) },
    shop: { ...base.shop, ...(saved.shop || {}) },
    lot: { ...base.lot, ...(saved.lot || {}), owned: { ...base.lot.owned, ...((saved.lot && saved.lot.owned) || {}) } },
    upgrades: { ...base.upgrades, ...(saved.upgrades || {}) },
    buildings: { ...base.buildings, ...(saved.buildings || {}) },
    merge: { ...base.merge, ...(saved.merge || {}) },
    daily: { ...base.daily, ...(saved.daily || {}) },
    objectives: { ...base.objectives, ...(saved.objectives || {}) },
    tips: { ...base.tips, ...(saved.tips || {}) }
  };
}

export function rollDaily(state) {
  const today = new Date().toDateString();
  if (state.daily?.day === today) return;
  state.daily = { day: today, taps: 0, merges: 0, hills: 0, lotCollects: 0, claimed: {} };
}

function applyOfflineProgress(state) {
  const now = Date.now();
  const last = state.lastTickAt || state.lastSaveAt || now;
  let seconds = Math.floor((now - last) / 1000);
  if (seconds < 45) {
    state.pendingOffline = null;
    return;
  }
  seconds = Math.min(seconds, MAX_OFFLINE_SECONDS);
  const idleDriver = state.upgrades?.idleDriver || 1;
  const hubBonus = 1 + (state.buildings?.companionHub || 0) * 0.15;
  const lotBonus = 1 + Object.keys(state.lot?.owned || {}).length * 0.03;
  const coins = Math.floor(seconds * 0.08 * idleDriver * hubBonus * lotBonus);
  const meters = Math.floor(seconds * 0.35 * idleDriver * hubBonus);
  const parts = Math.floor(seconds / 180);
  if (coins > 0) state.currencies.coins = (state.currencies.coins || 0) + coins;
  if (parts > 0) state.currencies.parts = (state.currencies.parts || 0) + parts;
  state.race.lifetimeMeters = (state.race.lifetimeMeters || 0) + meters;
  state.race.fuel = Math.min(100 + (state.upgrades?.fuelPlan || 0) * 10, (state.race.fuel || 0) + Math.floor(seconds / 90));
  state.race.condition = Math.min(100 + (state.upgrades?.pitKit || 0) * 8, (state.race.condition || 0) + Math.floor(seconds / 120));
  state.race.heat = Math.max(0, (state.race.heat || 0) - Math.floor(seconds / 100));
  state.pendingOffline = { seconds, coins, parts, meters };
  state.lastTickAt = now;
}
