import { DAILY_ORDERS } from '../data/gameData.js';
import { addCurrency } from './economySystem.js';

export function getObjectiveList(state) {
  return [
    { key: 'firstTap', title: 'Start your first route', body: 'Tap Race Boost or start a Hill Run.', done: state.objectives.firstTap },
    { key: 'firstMerge', title: 'Merge two starter items', body: 'Supplier only gives Level 1 items.', done: state.objectives.firstMerge },
    { key: 'buildStorage', title: 'Open Parts Storage', body: 'Build it on the Lot or in systems.', done: state.objectives.buildStorage },
    { key: 'unlockPerformance', title: 'Unlock Performance Parts', body: 'Build Tuning Corner on the Lot.', done: state.objectives.unlockPerformance },
    { key: 'unlockTrack', title: 'Open the Test Track', body: 'Unlocks racing gear and stronger hills.', done: state.objectives.unlockTrack },
    { key: 'fixProblem', title: 'Fix one drive problem', body: 'Fuel, breakdown, heat, traffic, or flip.', done: state.objectives.fixProblem },
    { key: 'stageFive', title: 'Reach Stage 5', body: 'Clear routes and Hill Runs.', done: state.objectives.stageFive }
  ];
}

export function applyDerivedObjectives(state) {
  state.objectives.buildStorage = state.buildings.partsStorage > 0 || !!state.lot?.owned?.partsStorage || state.objectives.buildStorage;
  state.objectives.unlockPerformance = state.buildings.tuningCorner > 0 || !!state.lot?.owned?.tuningCorner || state.objectives.unlockPerformance;
  state.objectives.unlockTrack = state.buildings.testTrack > 0 || !!state.lot?.owned?.testTrack || state.objectives.unlockTrack;
  state.objectives.stageFive = state.stage >= 5 || state.objectives.stageFive;
}

export function claimDaily(state, key) {
  const order = DAILY_ORDERS.find((o) => o.key === key);
  if (!order) return { ok: false, message: 'Unknown order.' };
  if (state.daily.claimed[key]) return { ok: false, message: 'Already claimed.' };
  if (!order.check(state)) return { ok: false, message: 'Not finished yet.' };
  Object.entries(order.reward).forEach(([k, v]) => addCurrency(state, k, v));
  state.daily.claimed[key] = true;
  return { ok: true, message: `Service order paid: ${order.title}` };
}
