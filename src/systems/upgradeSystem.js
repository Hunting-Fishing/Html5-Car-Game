import { BUILDINGS, UPGRADES } from '../data/gameData.js';
import { canAfford, spendCost } from './economySystem.js';

export function upgradeCost(state, def) {
  const level = state.upgrades[def.key] || 0;
  return { [def.resource]: Math.round(def.baseCost * Math.pow(def.costRate, level)) };
}

export function buyUpgrade(state, key) {
  const def = UPGRADES.find((item) => item.key === key);
  if (!def) return { ok: false, message: 'Unknown upgrade.' };
  const cost = upgradeCost(state, def);
  if (!canAfford(state, cost)) return { ok: false, message: 'Not enough resources.' };
  spendCost(state, cost);
  state.upgrades[key] = (state.upgrades[key] || 0) + 1;
  return { ok: true, message: `${def.name} upgraded.` };
}

export function nextBuildingCost(state, building) {
  const level = state.buildings[building.key] || 0;
  if (level >= building.max) return null;
  return building.costs[level];
}

export function buyBuilding(state, key) {
  const building = BUILDINGS.find((item) => item.key === key);
  if (!building) return { ok: false, message: 'Unknown building.' };
  const cost = nextBuildingCost(state, building);
  if (!cost) return { ok: false, message: 'Building is maxed.' };
  if (!canAfford(state, cost)) return { ok: false, message: 'Not enough resources.' };
  spendCost(state, cost);
  state.buildings[key] = (state.buildings[key] || 0) + 1;
  if (!state.lot.owned) state.lot.owned = {};
  state.lot.owned[key] = 1;
  if (key === 'partsStorage') state.objectives.buildStorage = true;
  if (key === 'tuningCorner') state.objectives.unlockPerformance = true;
  if (key === 'testTrack') state.objectives.unlockTrack = true;
  return { ok: true, message: `${building.name} built.` };
}
