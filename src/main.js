import './styles.css';
import './ui/screenControlRuntime.js';
import { gsap } from 'gsap';
import { SCREENS, CHAINS, PROBLEMS } from './data/gameData.js';
import { AUTO_WORLD_LOCATIONS } from './data/visualData.js';
import { chainIconForKey, currencyIconForKey, UI_ICONS } from './data/uiIconMap.js';
import { mountShell, renderScreenContent, setActiveScreen } from './ui/components/Shell.js';
import { updateTopHud } from './ui/components/TopHud.js';
import { showFloatingReward, showRewardToast, showToast as toast } from './ui/components/RewardToast.js';
import { renderHubScreen } from './ui/screens/HubScreen.js';
import { renderWorldScreen } from './ui/screens/WorldScreen.js';
import { renderRaceScreen } from './ui/screens/RaceScreen.js';
import { renderLinesScreen } from './ui/screens/LinesScreen.js';
import { renderMergeScreen } from './ui/screens/MergeScreen.js';
import { renderGarageScreen } from './ui/screens/GarageScreen.js';
import { renderProfileScreen } from './ui/screens/ProfileScreen.js';
import { renderCreatorScreen } from './ui/screens/CreatorScreen.js';
import { loadState, saveState, resetState } from './systems/saveSystem.js';
import { fmt, addCurrency, addXp, labelCurrency } from './systems/economySystem.js';
import { applyDerivedObjectives } from './systems/objectiveSystem.js';
import { tickSupplier, placeSupplierItem, placeAllReady, selectOrMergeCell, sellSelected, autoMergeOnce, normalizeMergeState, unlockedChainKeys } from './systems/mergeSystem.js';
import { tickRace, tapRace, changeRaceMode, fixProblem, getRaceStats } from './systems/raceSystem.js';
import { buyUpgrade, buyBuilding } from './systems/upgradeSystem.js';
import { publishBuildCommunicationState } from './systems/buildCommunicationSystem.js';
import { ensureIdleLineState, tickIdleLines, collectIdleLine, buyLineUpgrade, buyLineManager, toggleLineAutoCollect, getLineState } from './systems/idleLineSystem.js';
import { mountRaceCanvas, updateRaceCanvas, pulseCar } from './ui/racePixi.js';

let state = loadState();
let lastTime = performance.now();
let renderLock = false;
let saveQueued = false;
const root = document.querySelector('#app');

function feedbackSnapshot(source) {
  return {
    stage: source.stage || 1,
    problem: source.race?.problem || '',
    currencies: { ...(source.currencies || {}) },
    totalMerges: source.merge?.totalMerges || 0,
    highestItemLevel: source.merge?.highestItemLevel || 1,
    idleCollections: source.idleLines?.lifetimeCollections || 0,
    chains: unlockedChainKeys(source),
    buildings: { ...(source.buildings || {}) },
    upgrades: { ...(source.upgrades || {}) }
  };
}

function changedLevelKeys(before = {}, after = {}) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys].filter((key) => Number(after[key] || 0) > Number(before[key] || 0));
}

function unlockedKeys(before = [], after = []) {
  const seen = new Set(before);
  return after.filter((key) => !seen.has(key));
}

function positiveCurrencyRewards(before, after) {
  const keys = new Set([...Object.keys(before.currencies), ...Object.keys(after.currencies)]);
  return [...keys]
    .map((key) => {
      const delta = Number(after.currencies[key] || 0) - Number(before.currencies[key] || 0);
      if (delta <= 0.005) return null;
      return {
        resource: key,
        amount: delta,
        text: `+${fmt(delta)}`,
        label: labelCurrency(key),
        icon: currencyIconForKey(key)
      };
    })
    .filter(Boolean);
}

function rewardFeedbackMeta(action, result, before, after) {
  if (!result?.ok) {
    return {
      title: 'Needs Attention',
      tone: 'bad',
      icon: UI_ICONS.menu,
      floats: []
    };
  }

  const newChains = unlockedKeys(before.chains, after.chains);
  const buildingUpgrades = changedLevelKeys(before.buildings, after.buildings);
  const upgradeBuys = changedLevelKeys(before.upgrades, after.upgrades);
  const problem = after.problem && !before.problem ? PROBLEMS[after.problem] : null;

  if (after.stage > before.stage) {
    return {
      title: 'Stage Complete',
      tone: 'gold',
      icon: UI_ICONS.race,
      floats: [{ text: `Stage ${after.stage}`, tone: 'gold', icon: UI_ICONS.race, x: 50, y: 46 }]
    };
  }

  if (newChains.length) {
    const chainKey = newChains[0];
    return {
      title: 'New Chain Unlocked',
      tone: 'gold',
      icon: chainIconForKey(chainKey),
      floats: [{ text: `${CHAINS[chainKey]?.label || 'Chain'} unlocked`, tone: 'gold', icon: chainIconForKey(chainKey), x: 50, y: 50 }]
    };
  }

  if (after.totalMerges > before.totalMerges || after.highestItemLevel > before.highestItemLevel) {
    return {
      title: 'Merge Success',
      tone: 'good',
      icon: UI_ICONS.parts,
      floats: [{ text: 'MERGE!', tone: 'good', icon: UI_ICONS.parts, x: 50, y: 52 }]
    };
  }

  if (buildingUpgrades.length) {
    return {
      title: 'Room Upgraded',
      tone: 'good',
      icon: UI_ICONS.garage,
      floats: [{ text: 'UPGRADE!', tone: 'good', icon: UI_ICONS.garage, x: 50, y: 52 }]
    };
  }

  if (upgradeBuys.length || action === 'upgradeLine' || action === 'buyManager' || action === 'toggleLineAuto') {
    return {
      title: action === 'toggleLineAuto' ? 'Automation Updated' : 'Upgrade Complete',
      tone: 'good',
      icon: UI_ICONS.tools,
      floats: [{ text: action === 'toggleLineAuto' ? 'AUTO' : 'UPGRADE!', tone: 'good', icon: UI_ICONS.tools, x: 50, y: 52 }]
    };
  }

  if (problem) {
    return {
      title: 'Route Problem',
      tone: 'bad',
      icon: problem.icon || UI_ICONS.rep,
      floats: []
    };
  }

  if (action === 'fixProblem') {
    return {
      title: 'Route Fixed',
      tone: 'good',
      icon: UI_ICONS.rep,
      floats: [{ text: 'FIXED!', tone: 'good', icon: UI_ICONS.rep, x: 50, y: 52 }]
    };
  }

  if (action === 'collectLine') {
    return {
      title: 'Collected',
      tone: 'gold',
      icon: UI_ICONS.coin,
      floats: []
    };
  }

  if (action === 'worldTow') {
    return {
      title: 'Reward Job Complete',
      tone: 'gold',
      icon: UI_ICONS.rep,
      floats: [{ text: 'TOW JOB!', tone: 'gold', icon: UI_ICONS.rep, x: 50, y: 52 }]
    };
  }

  if (action === 'tapRace') {
    return {
      title: 'Route Boost',
      tone: 'good',
      icon: UI_ICONS.race,
      floats: []
    };
  }

  return {
    title: 'Reward Earned',
    tone: 'good',
    icon: UI_ICONS.coin,
    floats: []
  };
}

function emitRewardFeedback(result, before, action) {
  if (!result?.message) return;
  const after = feedbackSnapshot(state);
  const rewards = positiveCurrencyRewards(before, after);
  const meta = rewardFeedbackMeta(action, result, before, after);

  showRewardToast({
    title: meta.title,
    message: result.message,
    tone: meta.tone,
    icon: meta.icon,
    rewards
  });

  if (result.ok) {
    rewards.slice(0, 3).forEach((reward, index) => {
      showFloatingReward(`${reward.text} ${reward.label}`, {
        tone: meta.tone === 'bad' ? 'bad' : 'gold',
        resource: reward.resource,
        x: 42 + index * 8,
        y: 56 - index * 4
      });
    });
    meta.floats.forEach((float, index) => {
      showFloatingReward(float.text, {
        tone: float.tone,
        icon: float.icon,
        x: Number.isFinite(float.x) ? float.x : 50,
        y: Number.isFinite(float.y) ? float.y + index * 5 : 52 + index * 5
      });
    });
  }

  if (typeof window !== 'undefined' && window.__rewardFeedbackState) {
    window.__rewardFeedbackState.lastAction = {
      action,
      title: meta.title,
      message: result.message,
      rewardCount: rewards.length
    };
  }
}

function emitPassiveRewardFeedback(before) {
  const after = feedbackSnapshot(state);
  if (after.stage > before.stage) {
    const message = `Stage ${after.stage} complete. Rewards banked.`;
    emitRewardFeedback({ ok: true, message }, before, 'stageComplete');
    addLog(message);
  }

  if (!before.problem && after.problem) {
    const problem = PROBLEMS[after.problem];
    const message = problem ? `${problem.label}: ${problem.description}` : 'Route problem detected.';
    showRewardToast({
      title: 'Route Problem',
      message,
      tone: 'bad',
      icon: problem?.icon || UI_ICONS.rep
    });
    addLog(message);
  }

  if (after.idleCollections > before.idleCollections) {
    const rewards = positiveCurrencyRewards(before, after);
    if (rewards.length) {
      const message = rewards.map((reward) => `${reward.text} ${reward.label}`).join(', ');
      showRewardToast({
        title: 'Auto Collected',
        message,
        tone: 'gold',
        icon: UI_ICONS.coin,
        rewards
      });
      rewards.slice(0, 3).forEach((reward, index) => {
        showFloatingReward(`${reward.text} ${reward.label}`, {
          tone: 'gold',
          resource: reward.resource,
          x: 42 + index * 8,
          y: 56 - index * 4
        });
      });
      addLog(`Auto collected ${message}.`);
    }
  }
}

applyInitialScreenParam();
boot();

function applyInitialScreenParam() {
  const requested = new URLSearchParams(window.location.search).get('screen');
  if (requested && SCREENS.some((screen) => screen.id === requested)) {
    state.activeScreen = requested;
  }
}

function boot() {
  normalizeMergeState(state);
  ensureIdleLineState(state);
  mountShell(root, { screens: SCREENS });
  render();
  root.addEventListener('click', handleClick);
  requestAnimationFrame(gameLoop);
}

function gameLoop(now) {
  const dt = Math.min(2, (now - lastTime) / 1000);
  lastTime = now;
  const feedbackBefore = feedbackSnapshot(state);
  tickRace(state, dt);
  tickIdleLines(state, dt);
  tickSupplier(state, dt);
  applyDerivedObjectives(state);
  emitPassiveRewardFeedback(feedbackBefore);
  publishBuildCommunicationState(state);
  updateRaceCanvas(state);
  updateTopBar();

  if (!renderLock && ['race', 'hub', 'merge', 'lines', 'garage', 'world'].includes(state.activeScreen)) {
    renderLock = true;
    setTimeout(() => {
      renderLock = false;
      renderActiveScreen();
      queueSave();
    }, 650);
  }
  requestAnimationFrame(gameLoop);
}

function render() {
  ensureIdleLineState(state);
  publishBuildCommunicationState(state);
  updateTopBar();
  setActiveScreen(state.activeScreen);
  renderActiveScreen();
}

function renderActiveScreen() {
  const { el, rendered } = renderScreenContent(state.activeScreen, {
    renderers: {
      hub: () => renderHubScreen(state),
      world: () => renderWorldScreen(state),
      race: () => renderRaceScreen(state),
      lines: () => renderLinesScreen(state),
      merge: () => renderMergeScreen(state),
      garage: () => renderGarageScreen(state),
      profile: () => renderProfileScreen(state),
      creator: () => renderCreatorScreen(state)
    },
    shouldSkip: (screenId, screenEl) => (
      (screenId === 'world' && screenEl.querySelector('.pixiWorldShell')) ||
      (screenId === 'race' && screenEl.querySelector('.roadRunnerShell'))
    )
  });
  if (state.activeScreen === 'race' && rendered) {
    const host = el?.querySelector('#raceCanvas');
    if (host) mountRaceCanvas(host).then(() => updateRaceCanvas(state));
  }
}

function updateTopBar() {
  updateTopHud({ currencies: state.currencies, stage: state.stage, format: fmt });
}

function handleClick(event) {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  let result = null;

  if (action === 'screenToggle') {
    window.toggleGameFullscreen?.();
    return;
  }

  if (action === 'resourceShop') {
    const label = target.dataset.resource || 'resource';
    toast(`${label[0].toUpperCase()}${label.slice(1)} shop link is ready for a future store hook.`);
    return;
  }

  if (action === 'screen') {
    state.activeScreen = target.dataset.screen;
    render();
    queueSave();
    return;
  }

  const feedbackBefore = feedbackSnapshot(state);

  if (action === 'tapRace') {
    result = tapRace(state);
    pulseCar();
    gsap.fromTo(target, { scale: 1 }, { scale: 1.04, duration: 0.08, yoyo: true, repeat: 1 });
  }
  if (action === 'raceMode') result = changeRaceMode(state, target.dataset.mode);
  if (action === 'fixProblem') result = fixProblem(state, Number(target.dataset.fix));
  if (action === 'collectLine') result = collectIdleLine(state, target.dataset.line);
  if (action === 'upgradeLine') result = buyLineUpgrade(state, target.dataset.line);
  if (action === 'buyManager') result = buyLineManager(state, target.dataset.line);
  if (action === 'toggleLineAuto') result = toggleLineAutoCollect(state, target.dataset.line);
  if (action === 'worldLocation') result = handleWorldLocation(target.dataset.location);
  if (action === 'worldTow') result = completeTowEvent();
  if (action === 'placeShelf') result = placeSupplierItem(state, Number(target.dataset.index));
  if (action === 'placeAll') result = placeAllReady(state);
  if (action === 'autoMerge') result = autoMergeOnce(state);
  if (action === 'sellSelected') result = sellSelected(state);
  if (action === 'cell') result = selectOrMergeCell(state, Number(target.dataset.index));
  if (action === 'upgrade') result = buyUpgrade(state, target.dataset.key);
  if (action === 'building') result = buyBuilding(state, target.dataset.key);
  if (action === 'reset') {
    if (confirm('Reset local save?')) {
      state = resetState();
      ensureIdleLineState(state);
      toast('Local save reset.');
      render();
    }
    return;
  }

  applyDerivedObjectives(state);
  if (result?.message) {
    emitRewardFeedback(result, feedbackBefore, action);
    if (result.ok) addLog(result.message);
  }
  render();
  queueSave();
}

function handleWorldLocation(locationKey) {
  const location = AUTO_WORLD_LOCATIONS.find((item) => item.key === locationKey);
  if (!location) return { ok: false, message: 'Unknown world location.' };
  if (location.action === 'towEvent') return completeTowEvent();
  if (location.screen) {
    state.activeScreen = location.screen;
    return { ok: true, message: `${location.name}: ${location.description}` };
  }
  return { ok: true, message: location.description };
}

function completeTowEvent() {
  const towLine = getLineState(state, 'towingJob');
  const towLevel = towLine?.level || 0;
  const rewardCoins = 55 + towLevel * 6;
  const rewardScrap = 6 + Math.floor(towLevel / 2);
  addCurrency(state, 'coins', rewardCoins);
  addCurrency(state, 'scrap', rewardScrap);
  addXp(state, 10 + towLevel);
  state.race.condition = Math.min(getRaceStats(state).conditionMax, state.race.condition + 8);
  return { ok: true, message: `Tow job complete: +${rewardCoins} coins, +${rewardScrap} scrap.` };
}

function addLog(message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 10);
}

function queueSave() {
  if (saveQueued) return;
  saveQueued = true;
  setTimeout(() => {
    saveQueued = false;
    saveState(state);
  }, 300);
}
