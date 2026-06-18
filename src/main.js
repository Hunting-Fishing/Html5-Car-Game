import './styles.css';
import './ui/screenControlRuntime.js';
import { gsap } from 'gsap';
import { SCREENS } from './data/gameData.js';
import { AUTO_WORLD_LOCATIONS } from './data/visualData.js';
import { mountShell, renderScreenContent, setActiveScreen } from './ui/components/Shell.js';
import { updateTopHud } from './ui/components/TopHud.js';
import { showToast as toast } from './ui/components/RewardToast.js';
import { emitPassiveRewardFeedback, emitRewardFeedback, feedbackSnapshot } from './ui/feedback/rewardFeedback.js';
import { updateFirstSessionGuide } from './ui/guides/FirstSessionGuide.js';
import { renderHubScreen } from './ui/screens/HubScreen.js';
import { renderWorldScreen } from './ui/screens/WorldScreen.js';
import { renderRaceScreen } from './ui/screens/RaceScreen.js';
import { renderLinesScreen } from './ui/screens/LinesScreen.js';
import { renderMergeScreen } from './ui/screens/MergeScreen.js';
import { renderGarageScreen } from './ui/screens/GarageScreen.js';
import { renderProfileScreen } from './ui/screens/ProfileScreen.js';
import { renderCreatorScreen } from './ui/screens/CreatorScreen.js';
import { loadState, saveState, resetState } from './systems/saveSystem.js';
import { fmt, addCurrency, addXp } from './systems/economySystem.js';
import { applyDerivedObjectives } from './systems/objectiveSystem.js';
import { tickSupplier, placeSupplierItem, placeAllReady, selectOrMergeCell, sellSelected, autoMergeOnce, normalizeMergeState } from './systems/mergeSystem.js';
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
  window.addEventListener('roadRunnerFirstGas', handleRoadRunnerFirstGas);
  window.addEventListener('roadRunnerGhostPreview', handleRoadRunnerGhostPreview);
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
  emitPassiveRewardFeedback({ state, before: feedbackBefore, addLog });
  publishBuildCommunicationState(state);
  updateRaceCanvas(state);
  updateTopBar();
  updateGuide();

  if (!renderLock && ['race', 'hub', 'merge', 'lines', 'garage', 'world'].includes(state.activeScreen)) {
    renderLock = true;
    setTimeout(() => {
      renderLock = false;
      renderActiveScreen();
      updateGuide();
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
  updateGuide();
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
  updateGuide();
}

function updateTopBar() {
  updateTopHud({ currencies: state.currencies, stage: state.stage, format: fmt });
}

function updateGuide() {
  updateFirstSessionGuide(state);
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
    emitRewardFeedback({ state, result, before: feedbackBefore, action });
    if (result.ok) addLog(result.message);
  }
  render();
  queueSave();
}

function handleRoadRunnerFirstGas() {
  if (state.objectives.firstTap) return;
  state.objectives.firstTap = true;
  updateGuide();
  queueSave();
}

function handleRoadRunnerGhostPreview() {
  if (state.objectives.previewGhostRace) return;
  state.objectives.previewGhostRace = true;
  updateGuide();
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
