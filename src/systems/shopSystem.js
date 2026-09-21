import { BUSINESSES } from '../data/gameData.js';
import { addCurrency, canAfford, spendCost } from './economySystem.js';

export function shopIncomePerSec(state) {
  const hub = 1 + (state.buildings.companionHub || 0) * 0.12;
  const lotBoost = 1 + Object.keys(state.lot?.owned || {}).length * 0.04;
  const mergeBoost = 1 + Math.min(0.4, (state.merge.highestItemLevel || 1) * 0.03);
  let total = 0;
  BUSINESSES.forEach((biz) => {
    const owned = state.shop[biz.key] || 0;
    if (!owned) return;
    total += biz.baseIncome * owned * hub * lotBoost * mergeBoost;
  });
  total += (state.upgrades.idleDriver || 0) * 0.05;
  return total;
}

export function tickShop(state, dt) {
  const earned = shopIncomePerSec(state) * dt;
  state.shop.banked = (state.shop.banked || 0) + earned;
  if (state.shop.banked >= 1) {
    const take = Math.floor(state.shop.banked);
    addCurrency(state, 'coins', take);
    state.shop.banked -= take;
  }
}

export function businessCost(state, biz) {
  const owned = state.shop[biz.key] || 0;
  return { coins: Math.round(biz.baseCost * Math.pow(biz.costRate, owned)) };
}

export function buyBusiness(state, key) {
  const biz = BUSINESSES.find((b) => b.key === key);
  if (!biz) return { ok: false, message: 'Unknown shop.' };
  if (biz.key === 'showcaseShop' && state.race.completedStages < 1) {
    return { ok: false, message: 'Finish one route first.' };
  }
  if (biz.needTools && (state.currencies.tools || 0) < biz.needTools && (state.shop[biz.key] || 0) === 0) {
    return { ok: false, message: `Need ${biz.needTools} tools from Merge.` };
  }
  const cost = businessCost(state, biz);
  if (!canAfford(state, cost)) return { ok: false, message: 'Need more coins.' };
  spendCost(state, cost);
  state.shop[biz.key] = (state.shop[biz.key] || 0) + 1;
  return { ok: true, message: `${biz.name} x${state.shop[biz.key]}` };
}
