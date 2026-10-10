import './styles.css';
import './ui/screenControlRuntime.js';
import './ui/assetFallbackRuntime.js';
import { publicAsset } from './data/assetUrl.js';
import './ui/mobileUiSkinRuntime.js';
import './ui/worldMobileCityRuntimeSafe.js';
import './ui/worldAssetRuntime.js';
import './ui/roadRunnerRuntime.js?v=12';
import './ui/roadRunnerRuntimeWorldMapsHudLoader.js';
import './ui/mergeAssetRuntime.js';
import './ui/mergeAssetChecklistNote.js';
import './ui/linesAssetRuntime.js';
import './ui/buildAssetRuntime.js';
import { playSfx } from './ui/sfx.js';
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
import { renderLinesScreen, updateLineBars, updateReadyBadge } from './ui/screens/LinesScreen.js';
import { renderMergeScreen } from './ui/screens/MergeScreen.js';
import { renderGarageScreen } from './ui/screens/GarageScreen.js';
import { renderProfileScreen } from './ui/screens/ProfileScreen.js';
import { renderCreatorScreen } from './ui/screens/CreatorScreen.js';
import { loadState, saveState, resetState } from './systems/saveSystem.js';
import { fmt, addCurrency, addXp } from './systems/economySystem.js';
import { applyDerivedObjectives } from './systems/objectiveSystem.js';
import { claimDaily } from './systems/objectiveSystem.js';
import { tickSupplier, placeSupplierItem, placeAllReady, selectOrMergeCell, sellSelected, autoMergeOnce, normalizeMergeState } from './systems/mergeSystem.js';
import { tickRace, tapRace, changeRaceMode, fixProblem, getRaceStats } from './systems/raceSystem.js';
import { buyUpgrade, buyBuilding } from './systems/upgradeSystem.js';
import { publishBuildCommunicationState } from './systems/buildCommunicationSystem.js';
import { ensureIdleLineState, tickIdleLines, collectIdleLine, buyLineUpgrade, buyLineManager, toggleLineAutoCollect, getLineState } from './systems/idleLineSystem.js';
import { mountRaceCanvas, updateRaceCanvas, pulseCar } from './ui/racePixi.js';

const WEBSITE_URL = 'https://www.365motorsales.com';
let state = loadState();
let lastTime = performance.now();
let saveQueued = false;
let raceMounted = false;
let renderLock = false;
const root = document.querySelector('#app');

function fixAssetSrc(value) {
  const raw = String(value || '');
  if (!raw.includes('/assets/')) return raw;
  if (raw.includes('/Html5-Car-Game/assets/')) return raw;
  const path = raw.replace(/^https?:\/\/[^/]+/, '');
  const idx = path.indexOf('/assets/');
  return idx >= 0 ? publicAsset(path.slice(idx + 1)) : raw;
}

function repairAssetImages(node = document) {
  node.querySelectorAll?.('img').forEach((img) => {
    const fixed = fixAssetSrc(img.getAttribute('src'));
    if (fixed && fixed !== img.getAttribute('src')) img.src = fixed;
  });
}

repairAssetImages();
new MutationObserver(() => repairAssetImages()).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });

applyInitialScreenParam();
boot();

function applyInitialScreenParam() {
  const requested = new URLSearchParams(window.location.search).get('screen');
  if (requested && SCREENS.some((screen) => screen.id === requested)) {
    state.activeScreen = requested;
  }
}

function readRaceStage() {
  try {
    const parsed = JSON.parse(localStorage.getItem('365_canvas_road_runner_v4') || '{}');
    const stage = Number(parsed.stageProgress?.current);
    return Number.isFinite(stage) && stage > 0 ? stage : 1;
  } catch {
    return 1;
  }
}

function boot() {
  normalizeMergeState(state);
  ensureIdleLineState(state);
  state.stage = Math.max(Number(state.stage) || 1, readRaceStage());
  window.syncCompanionStage = (stage) => {
    const next = Math.max(1, Math.floor(Number(stage) || 1));
    if (state.stage === next) return;
    state.stage = next;
    updateTopBar();
    queueSave();
  };
  if ((state.currencies.coins || 0) < 80 && (state.buildings?.partsStorage || 0) < 1) {
    state.currencies.coins = Math.max(state.currencies.coins || 0, 160);
    state.currencies.parts = Math.max(state.currencies.parts || 0, 8);
    state.currencies.tools = Math.max(state.currencies.tools || 0, 8);
  }
  mountShell(root, { screens: SCREENS });
  render();
  root.addEventListener('click', handleClick);
  window.addEventListener('roadRunnerFirstGas', handleRoadRunnerFirstGas);
  window.addEventListener('roadRunnerGhostPreview', handleRoadRunnerGhostPreview);
  requestAnimationFrame(gameLoop);
  if (state.pendingOffline) {
    const o = state.pendingOffline;
    const mins = Math.max(1, Math.round(o.seconds / 60));
    toast(`Welcome back! +${fmt(o.coins)} coins from ${mins}m offline.`);
  }
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
  if (state.activeScreen === 'lines') updateLineBars(state);
  updateReadyBadge(state);
  updateGuide();
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

function closeQuestMenu() {
  const menu = document.querySelector('#questMenu');
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  document.querySelector('.questButton')?.setAttribute('aria-expanded', 'false');
}

function handleClick(event) {
  const target = event.target.closest('[data-action]');
  if (!event.target.closest('.questAnchor')) closeQuestMenu();
  if (!target) return;
  const action = target.dataset.action;
  let result = null;

  if (action === 'toggleQuest') {
    const menu = document.querySelector('#questMenu');
    const button = document.querySelector('.questButton');
    if (!menu) return;
    menu.hidden = !menu.hidden;
    button?.setAttribute('aria-expanded', String(!menu.hidden));
    return;
  }

  closeQuestMenu();

  if (action === 'screenToggle') {
    window.toggleGameFullscreen?.();
    return;
  }

  if (action === 'resourceShop') {
    window.open(WEBSITE_URL, '_blank', 'noopener');
    toast('Parts packs are not for sale here. The lot is on 365 Motor Sales.');
    return;
  }

  if (action === 'openShowcase') {
    changeRaceMode(state, 'showcase');
    state.activeScreen = 'race';
    window.open(WEBSITE_URL, '_blank', 'noopener');
    toast('Dealer Showcase is running. The lot site is open.');
    render();
    queueSave();
    return;
  }

  if (action === 'claimOffline') {
    const pay = state.pendingOffline;
    if (!pay) return;
    addLog(`Offline pay collected: +${pay.coins} coins.`);
    state.pendingOffline = null;
    toast('Offline pay collected.');
    render();
    queueSave();
    return;
  }

  if (action === 'screen') {
    if (target.dataset.rrTab) window.__openRaceTab = target.dataset.rrTab;
    state.activeScreen = target.dataset.screen;
    render();
    queueSave();
    return;
  }

  if (action === 'mergeTab') {
    const tab = target.dataset.tab;
    state.merge.activeTab = ['recipes', 'chains', 'tips'].includes(tab) ? tab : 'recipes';
    render();
    queueSave();
    return;
  }

  if (action === 'mergeChain') {
    state.merge.selectedChain = target.dataset.chain || '';
    state.merge.activeTab = 'recipes';
    render();
    queueSave();
    return;
  }

  if (action === 'garageTab') {
    state.garage = state.garage || {};
    const tab = target.dataset.tab;
    state.garage.drawerTab = ['room', 'systems', 'supplier'].includes(tab) ? tab : 'room';
    render();
    queueSave();
    return;
  }

  if (action === 'garageRoom') {
    state.garage = state.garage || {};
    state.garage.selectedRoom = target.dataset.room || '';
    state.garage.drawerTab = 'room';
    render();
    queueSave();
    return;
  }

  if (action === 'garageSystem') {
    state.garage = state.garage || {};
    state.garage.selectedSystem = target.dataset.key || '';
    state.garage.drawerTab = 'systems';
    render();
    queueSave();
    return;
  }

  const feedbackBefore = feedbackSnapshot(state);

  if (action === 'tapRace') {
    result = tapRace(state);
    playSfx('tap');
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
  if (action === 'claimDaily') result = claimDaily(state, target.dataset.key);
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
  if (result?.ok && action === 'cell') playSfx('merge');
  if (result?.ok && (action === 'collectLine' || action === 'claimDaily' || action === 'claimOffline')) playSfx(action === 'collectLine' ? 'collect' : 'claim');
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
  state.daily.lotCollects = (state.daily.lotCollects || 0) + 1;
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

setInterval(() => saveState(state), 5000);
