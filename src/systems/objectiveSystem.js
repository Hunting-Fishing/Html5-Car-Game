import { DAILY_ORDERS } from '../data/gameData.js';
import { addCurrency } from './economySystem.js';

export function getObjectiveList(state) {
  return [
    {
      key: 'firstTap',
      title: 'Tap Race',
      body: 'Tap the Race boost/GAS control to start moving.',
      screen: 'race',
      raceTab: 'drive',
      done: state.objectives.firstTap
    },
    {
      key: 'firstMerge',
      title: 'Merge Parts',
      body: 'Use the Merge Bay to combine two matching starter items.',
      screen: 'merge',
      done: state.objectives.firstMerge
    },
    {
      key: 'buildStorage',
      title: 'Build Parts Storage',
      body: 'Use parts and coins to increase your board permit.',
      screen: 'garage',
      done: state.objectives.buildStorage
    },
    {
      key: 'idleLineUpgrade',
      title: 'Upgrade Street Route',
      body: 'Open Business Lines and upgrade the starter Street Route.',
      screen: 'lines',
      done: state.objectives.idleLineUpgrade
    },
    {
      key: 'previewGhostRace',
      title: 'Choose Rivals',
      body: 'Open the Race Leaderboard, search users, and choose up to 3 friends or best players.',
      screen: 'race',
      raceTab: 'leaderboard',
      done: state.objectives.previewGhostRace
    },
    {
      key: 'unlockPerformance',
      title: 'Unlock Performance Parts',
      body: 'Build the Tuning Corner. Do not drop performance items early.',
      screen: 'garage',
      done: state.objectives.unlockPerformance
    },
    {
      key: 'unlockTrack',
      title: 'Open the 2D Test Track',
      body: 'Build the Test Track to unlock racing gear.',
      screen: 'garage',
      done: state.objectives.unlockTrack
    },
    {
      key: 'fixProblem',
      title: 'Fix one route problem',
      body: 'Resolve fuel, breakdown, police heat, or traffic once.',
      screen: 'race',
      raceTab: 'drive',
      done: state.objectives.fixProblem
    },
    {
      key: 'stageFive',
      title: 'Reach Stage 5',
      body: 'Keep upgrading and completing route stages.',
      screen: 'race',
      raceTab: 'routes',
      done: state.objectives.stageFive
    }
  ];
}

export function applyDerivedObjectives(state) {
  state.objectives.buildStorage = state.buildings.partsStorage > 0 || state.objectives.buildStorage;
  state.objectives.idleLineUpgrade = (state.idleLines?.lines?.streetRoute?.level || 0) > 1 || state.objectives.idleLineUpgrade;
  state.objectives.unlockPerformance = state.buildings.tuningCorner > 0 || state.objectives.unlockPerformance;
  state.objectives.unlockTrack = state.buildings.testTrack > 0 || state.objectives.unlockTrack;
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
