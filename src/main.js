import './styles.css';
import './ui/screenControlRuntime.js';
import './ui/assetFallbackRuntime.js';
import { publicAsset } from './data/assetUrl.js';
import './ui/mobileUiSkinRuntime.js';
import './ui/worldMobileCityRuntimeSafe.js';
import './ui/worldAssetRuntime.js';
import './ui/roadRunnerRuntime.js?v=74';
import './ui/roadRunnerRuntimeWorldMapsHudLoader.js';
import './ui/mergeAssetRuntime.js';
import './ui/mergeAssetChecklistNote.js';
import './ui/linesAssetRuntime.js';
import './ui/buildAssetRuntime.js';
import { playSfx, setSoundEnabled, soundEnabled, stopEngineSound, stopTireScreech } from './ui/sfx.js';
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
import { renderStaffScreen, setSelectedStaff, setStaffTab, setCrewFilter, armStaffFire, clearStaffFire, beginManagerChange, cancelManagerChange, assignDeskManager, closeStaffSheet } from './ui/screens/StaffScreen.js';
import { renderMergeScreen } from './ui/screens/MergeScreen.js';
import { renderGarageScreen } from './ui/screens/GarageScreen.js';
import { renderProfileScreen, setMenuTab, armMenuReset, disarmMenuReset, isMenuResetArmed } from './ui/screens/ProfileScreen.js';
import { renderCreatorScreen } from './ui/screens/CreatorScreen.js';
import { loadState, saveState, resetState } from './systems/saveSystem.js';
import { fmt, addCurrency, addXp, canAfford, spendCost } from './systems/economySystem.js';
import { applyDerivedObjectives } from './systems/objectiveSystem.js';
import { claimDaily } from './systems/objectiveSystem.js';
import { tickSupplier, placeSupplierItem, placeAllReady, selectOrMergeCell, sellSelected, autoMergeOnce, normalizeMergeState } from './systems/mergeSystem.js';
import { tickRace, tapRace, changeRaceMode, fixProblem, getRaceStats } from './systems/raceSystem.js';
import { buyUpgrade, buyBuilding } from './systems/upgradeSystem.js';
import { publishBuildCommunicationState } from './systems/buildCommunicationSystem.js';
import { ensureIdleLineState, tickIdleLines, collectIdleLine, buyLineUpgrade, buyLineManager, fireLineManager, toggleLineAutoCollect, getLineState } from './systems/idleLineSystem.js';
import { characterForLine } from './data/characterRoster.js';
import { trainCharacter, useCharacter, upgradeCharacter, promoteCharacter, tickPayroll, hireCharacter, fireCharacter, setCrewPayRate, equipCrewTask, trainCrewSkill, restCrew, equipCrewPerk, sendToCourse } from './systems/characterSystem.js';
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
  root.addEventListener('input', (event) => {
    const input = event.target.closest('[data-salary]');
    if (!input) return;
    const rate = Number(input.value) / 100;
    const coins = Math.max(1, Math.round(Number(input.dataset.base) * rate));
    const box = input.closest('.salarySlide');
    const readout = box?.querySelector('[data-salary-readout]');
    const mood = box?.querySelector('[data-salary-mood]');
    if (readout) readout.textContent = `${input.value}% · ${coins} coins`;
    if (mood) mood.textContent = rate < 1 ? 'Underpaid. Energy drops on payday.' : rate > 1 ? 'Raise. Energy recovers on payday.' : 'Fair pay.';
    root.querySelectorAll(`[data-salary][data-staff="${input.dataset.staff}"]`).forEach((other) => {
      if (other === input) return;
      other.value = input.value;
      const otherBox = other.closest('.salarySlide');
      const otherReadout = otherBox?.querySelector('[data-salary-readout]');
      const otherMood = otherBox?.querySelector('[data-salary-mood]');
      if (otherReadout) otherReadout.textContent = `${input.value}% · ${coins} coins`;
      if (otherMood && mood) otherMood.textContent = mood.textContent;
    });
  });
  root.addEventListener('change', (event) => {
    const input = event.target.closest('[data-salary]');
    if (!input) return;
    setCrewPayRate(state, input.dataset.staff, Number(input.value));
    queueSave();
  });
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
  const payday = tickPayroll(state, dt);
  if (payday) toast(payday);
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
      staff: () => renderStaffScreen(state),
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

  if (action === 'menuTab') {
    setMenuTab(target.dataset.tab);
    render();
    return;
  }

  if (action === 'selectStaff' || action === 'openStaff') {
    const id = target.dataset.staff || target.dataset.line;
    setSelectedStaff(id);
    state.activeScreen = 'staff';
    render();
    return;
  }

  if (action === 'closeStaffSheet') {
    closeStaffSheet();
    render();
    return;
  }

  if (action === 'assignManager') {
    const assigned = assignDeskManager(state, target.dataset.staff);
    state.activeScreen = 'staff';
    if (assigned.message) toast(assigned.message);
    render();
    queueSave();
    return;
  }

  if (action === 'beginChangeManager') {
    beginManagerChange(target.dataset.desk);
    state.activeScreen = 'staff';
    render();
    return;
  }

  if (action === 'cancelChangeManager') {
    cancelManagerChange();
    state.activeScreen = 'staff';
    render();
    return;
  }

  if (action === 'changeManager') {
    const changed = changeDeskManager(state);
    state.activeScreen = 'staff';
    if (changed.message) toast(changed.message);
    render();
    queueSave();
    return;
  }

  if (action === 'staffTab') {
    setStaffTab(target.dataset.tab);
    state.activeScreen = 'staff';
    render();
    return;
  }

  if (action === 'crewFilter') {
    setCrewFilter(target.dataset.crew);
    state.activeScreen = 'staff';
    render();
    return;
  }

  if (action === 'fireManagerArm') {
    armStaffFire(target.dataset.line);
    state.activeScreen = 'staff';
    render();
    return;
  }

  if (action === 'fireManagerCancel') {
    clearStaffFire();
    render();
    return;
  }

  if (action === 'menuSound') {
    const next = !soundEnabled();
    setSoundEnabled(next);
    if (next) playSfx('tap');
    else {
      stopEngineSound();
      stopTireScreech();
    }
    render();
    return;
  }

  if (action === 'menuResetArm') {
    armMenuReset();
    render();
    return;
  }

  if (action === 'menuResetCancel') {
    disarmMenuReset();
    render();
    return;
  }

  if (action === 'lineBuyQty') {
    const qty = target.dataset.qty === 'max' ? 'max' : Number(target.dataset.qty);
    ensureIdleLineState(state);
    state.idleLines.buyQty = [1, 10, 100, 'max'].includes(qty) ? qty : 1;
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
  if (action === 'collectLine') {
    result = collectIdleLine(state, target.dataset.line);
    const crew = characterForLine(target.dataset.line);
    if (result?.ok && crew) {
      const grown = useCharacter(state, crew.id, 6);
      if (grown.message) toast(grown.message);
    }
  }
  if (action === 'upgradeLine') result = buyLineUpgrade(state, target.dataset.line, target.dataset.qty || state.idleLines?.buyQty || 1);
  if (action === 'buyManager') {
    result = buyLineManager(state, target.dataset.line);
    const crew = characterForLine(target.dataset.line);
    if (result?.ok && crew) useCharacter(state, crew.id, 20);
  }
  if (action === 'fireCrewArm') {
    armStaffFire(target.dataset.staff);
    state.activeScreen = 'staff';
    render();
    return;
  }

  if (action === 'fireCrewCancel') {
    clearStaffFire();
    render();
    return;
  }

  if (action === 'hireCrew') result = hireCharacter(state, target.dataset.staff);
  if (action === 'equipTask') result = equipCrewTask(state, target.dataset.staff, target.dataset.task || '');
  if (action === 'trainSkill') result = trainCrewSkill(state, target.dataset.staff, target.dataset.skill);
  if (action === 'restCrew') result = restCrew(state, target.dataset.staff);
  if (action === 'equipPerk') result = equipCrewPerk(state, target.dataset.staff, target.dataset.perk || '');
  if (action === 'sendCourse') result = sendToCourse(state, target.dataset.staff, target.dataset.course);
  if (action === 'fireCrew') {
    result = fireCharacter(state, target.dataset.staff);
    clearStaffFire();
  }
  if (action === 'upgradeCrew') result = upgradeCharacter(state, target.dataset.staff);
  if (action === 'promoteCrew') result = promoteCharacter(state, target.dataset.staff);
  if (action === 'trainCharacter') result = trainCharacter(state, target.dataset.staff);
  if (action === 'fireManager') {
    result = fireLineManager(state, target.dataset.line);
    clearStaffFire();
  }
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
  if (action === 'resetConfirm') {
    if (!isMenuResetArmed()) return;
    disarmMenuReset();
    state = resetState();
    ensureIdleLineState(state);
    toast('Save erased.');
    render();
    queueSave();
    return;
  }
  if (action === 'reset') return;
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

window.addEventListener('npc-relationship', (event) => {
  const { id, name, score, gift } = event.detail || {};
  if (!id) return;
  state.relationships = { ...(state.relationships || {}), [id]: score };
  const prevReputation = Number(state.reputation || 0);
  if (typeof event.detail.reputation === 'number') state.reputation = event.detail.reputation;
  state.relationshipGifts = state.relationshipGifts || {};
  [
    { at: 35, key: 'known', coins: 25, label: 'Known' },
    { at: 60, key: 'respected', coins: 60, label: 'Respected' },
    { at: 85, key: 'famous', coins: 100, label: 'Famous' }
  ].forEach((rank) => {
    const giftKey = `city:${rank.key}`;
    if (prevReputation < rank.at && state.reputation >= rank.at && !state.relationshipGifts[giftKey]) {
      state.relationshipGifts[giftKey] = true;
      addCurrency(state, 'coins', rank.coins);
      toast(`City reputation: ${rank.label}. +${rank.coins} coins.`);
    }
  });
  if (gift) {
    state.relationshipGifts = state.relationshipGifts || {};
    const key = `${id}:${gift}`;
    if (!state.relationshipGifts[key]) {
      state.relationshipGifts[key] = true;
      const coins = gift === 'partner' ? 80 : 40;
      addCurrency(state, 'coins', coins);
      toast(`${name || 'Someone'} trusts you. +${coins} coins.`);
    }
  }
  queueSave();
});

window.addEventListener('npc-trade', (event) => {
  const { id, pay, gain, stock, note } = event.detail || {};
  if (!id || !stock) return;
  if (pay && !canAfford(state, pay)) {
    toast('Not enough for that trade.');
    return;
  }
  if (pay) spendCost(state, pay);
  Object.entries(gain || {}).forEach(([key, amount]) => addCurrency(state, key, amount));
  state.npcTrade = { ...(state.npcTrade || {}), [id]: stock };
  if (note) toast(note);
  queueSave();
});

setInterval(() => saveState(state), 5000);
