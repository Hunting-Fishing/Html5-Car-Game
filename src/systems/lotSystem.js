import { LOT_PLOTS } from '../data/gameData.js';
import { addCurrency, canAfford, spendCost } from './economySystem.js';

export function lotIncomePerSec(state) {
  let n = 0;
  LOT_PLOTS.forEach((plot) => {
    if (state.lot.owned[plot.key]) n += plot.income;
  });
  return n * (1 + (state.buildings.companionHub || 0) * 0.1);
}

export function tickLot(state, dt) {
  state.lot.pending = (state.lot.pending || 0) + lotIncomePerSec(state) * dt;
}

export function collectLot(state) {
  const amount = Math.floor(state.lot.pending || 0);
  if (amount < 1) return { ok: false, message: 'Nothing to collect yet.' };
  addCurrency(state, 'coins', amount);
  state.lot.pending = 0;
  state.lot.lastCollectAt = Date.now();
  state.daily.lotCollects = (state.daily.lotCollects || 0) + 1;
  return { ok: true, message: `Collected ${amount} coins from the lot.` };
}

export function buyLotPlot(state, key) {
  const plot = LOT_PLOTS.find((p) => p.key === key);
  if (!plot) return { ok: false, message: 'Unknown plot.' };
  if (state.lot.owned[plot.key]) return { ok: false, message: 'Already built.' };
  if (!canAfford(state, plot.cost)) return { ok: false, message: 'Need more resources.' };
  spendCost(state, plot.cost);
  state.lot.owned[plot.key] = 1;
  if (['partsStorage', 'tuningCorner', 'testTrack', 'companionHub'].includes(key)) {
    state.buildings[key] = Math.max(state.buildings[key] || 0, 1);
  }
  return { ok: true, message: `${plot.name} opened on the lot.` };
}
