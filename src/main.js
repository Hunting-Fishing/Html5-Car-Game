import './styles.css';
import { gsap } from 'gsap';
import { SCREENS, RACE_MODES, CHAINS, UPGRADES, BUILDINGS, PROBLEMS, CREATOR_RULES, IDLE_LINES } from './data/gameData.js';
import { AUTO_SHOP_ROOMS, AUTO_WORLD_LOCATIONS, WORLD_TRAFFIC, WORLD_PEOPLE } from './data/visualData.js';
import { lineAssetForKey, LINES_GUI_ASSETS } from './data/linesAssetMap.js';
import { BUILD_ASSET_LIST, BUILD_GUI_ASSETS, BUILD_ICON_ASSETS, buildRoomAssetForKey, buildSystemAssetForKey } from './data/buildAssetMap.js';
import { connectionForBuilding, connectionForLine, connectionForRoom } from './data/buildLinkData.js';
import { mergeAssetForName } from './data/mergeAssetMap.js';
import { loadState, saveState, resetState } from './systems/saveSystem.js';
import { fmt, costToText, canAfford, addCurrency, addXp } from './systems/economySystem.js';
import { getObjectiveList, applyDerivedObjectives } from './systems/objectiveSystem.js';
import { tickSupplier, placeSupplierItem, placeAllReady, selectOrMergeCell, sellSelected, autoMergeOnce, itemDisplayName, boardLimit, activeBoardCount, shelfCapacity, normalizeMergeState, unlockedChainKeys } from './systems/mergeSystem.js';
import { tickRace, tapRace, changeRaceMode, fixProblem, getRaceStats } from './systems/raceSystem.js';
import { buyUpgrade, upgradeCost, buyBuilding, nextBuildingCost } from './systems/upgradeSystem.js';
import { getBuildCommunicationState, publishBuildCommunicationState } from './systems/buildCommunicationSystem.js';
import { ensureIdleLineState, tickIdleLines, collectIdleLine, buyLineUpgrade, buyLineManager, toggleLineAutoCollect, getLineState, getLineIncome, getLineCycleMs, getLineUpgradeCost, getManagerCost, getNextMilestone, canCollectLine, hasManager, isAutoCollectEnabled, isLineUnlocked, unlockText, getTotalIdlePerMinute } from './systems/idleLineSystem.js';
import { mountRaceCanvas, updateRaceCanvas, pulseCar } from './ui/racePixi.js';

let state = loadState();
let lastTime = performance.now();
let renderLock = false;
let saveQueued = false;
const root = document.querySelector('#app');
const WORLD_BUILDING_LABELS = {
  streetKiosk: 'Kiosk',
  tireRepair: 'Tire Shop',
  privateShop: 'Repair Shop',
  partsWarehouse: 'Parts WH',
  dealerShowroom: 'Dealer',
  salvageBlock: 'Salvage',
  towDispatch: 'Tow Dispatch',
  testTrack: 'Test Track'
};

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
  renderShell();
  render();
  root.addEventListener('click', handleClick);
  requestAnimationFrame(gameLoop);
}

function gameLoop(now) {
  const dt = Math.min(2, (now - lastTime) / 1000);
  lastTime = now;
  tickRace(state, dt);
  tickIdleLines(state, dt);
  tickSupplier(state, dt);
  applyDerivedObjectives(state);
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

function renderShell() {
  root.innerHTML = `
    <div class="appShell">
      <header class="topBar">
        <div class="topLine">
          <div class="brand">
            <div class="brandLogo">365</div>
            <div class="brandText"><b>Micro Garage</b><span>Playable auto world · local save</span></div>
          </div>
          <div class="stagePill" id="stagePill">Stage 1</div>
        </div>
        <div class="currencyGrid">
          <div class="cur"><b id="cur-coins">0</b><span>Coins</span></div>
          <div class="cur"><b id="cur-parts">0</b><span>Parts</span></div>
          <div class="cur"><b id="cur-tools">0</b><span>Tools</span></div>
          <div class="cur"><b id="cur-scrap">0</b><span>Scrap</span></div>
          <div class="cur"><b id="cur-tune">0</b><span>Tune</span></div>
          <div class="cur"><b id="cur-rep">0</b><span>Rep</span></div>
        </div>
      </header>
      <main class="screenHost">
        ${SCREENS.map((screen) => `<section class="screen" id="screen-${screen.id}"></section>`).join('')}
      </main>
      <nav class="bottomNav">
        ${SCREENS.map((screen) => `<button class="tab" data-action="screen" data-screen="${screen.id}"><span class="tabIcon">${screen.icon}</span><span>${screen.label}</span></button>`).join('')}
      </nav>
    </div>
    <div class="toast" id="toast"></div>
  `;
}

function render() {
  ensureIdleLineState(state);
  publishBuildCommunicationState(state);
  updateTopBar();
  document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
  document.querySelector(`#screen-${state.activeScreen}`)?.classList.add('active');
  document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.screen === state.activeScreen));
  renderActiveScreen();
}

function renderActiveScreen() {
  const el = document.querySelector(`#screen-${state.activeScreen}`);
  if (!el) return;
  if (state.activeScreen === 'hub') el.innerHTML = renderHub();
  if (state.activeScreen === 'world') {
    if (!el.querySelector('.pixiWorldShell')) el.innerHTML = renderWorld();
  }
  if (state.activeScreen === 'race') {
    if (!el.querySelector('.roadRunnerShell')) {
      el.innerHTML = renderRace();
      const host = el.querySelector('#raceCanvas');
      if (host) mountRaceCanvas(host).then(() => updateRaceCanvas(state));
    }
  }
  if (state.activeScreen === 'lines') el.innerHTML = renderLines();
  if (state.activeScreen === 'merge') el.innerHTML = renderMerge();
  if (state.activeScreen === 'garage') el.innerHTML = renderGarage();
  if (state.activeScreen === 'profile') el.innerHTML = renderProfile();
  if (state.activeScreen === 'creator') el.innerHTML = renderCreator();
}

function updateTopBar() {
  const c = state.currencies;
  setText('stagePill', `Stage ${state.stage}`);
  ['coins', 'parts', 'tools', 'scrap', 'tune', 'rep'].forEach((key) => setText(`cur-${key}`, fmt(c[key])));
}

function renderHub() {
  const objectives = getObjectiveList(state);
  const next = objectives.find((item) => !item.done);
  const stats = getRaceStats(state);
  const totals = getTotalIdlePerMinute(state);
  return `
    <section class="card">
      <div class="cardTitle">
        <div><h2>Today’s Goal</h2><p>Clear objectives keep this feeling like a mobile idle game.</p></div>
        <span class="pill">${next ? 'Next' : 'Complete'}</span>
      </div>
      ${next ? `<div class="notice good"><b>${next.title}</b><br>${next.body}</div>` : `<div class="notice good"><b>Objective set complete.</b><br>Continue building resources, upgrades, and routes.</div>`}
    </section>

    <section class="card">
      <div class="cardTitle">
        <div><h2>Playable Auto World</h2><p>Move through the 365 auto world by tapping buildings, roads, repair shops, dealers, and roadside events.</p></div>
      </div>
      <div class="grid2">
        <button class="btn primary" data-action="screen" data-screen="world">Open World Map</button>
        <button class="btn gold" data-action="screen" data-screen="lines">Upgrade Lines</button>
        <button class="btn" data-action="screen" data-screen="garage">Auto Shop</button>
        <button class="btn ghost" data-action="screen" data-screen="merge">Merge Parts</button>
      </div>
    </section>

    <section class="card">
      <div class="cardTitle"><div><h3>Idle Output / Minute</h3><p>Managers automate lines. Manual collect is required until then.</p></div></div>
      <div class="grid2">
        ${Object.entries(totals).length ? Object.entries(totals).map(([key, value]) => `<div class="notice good"><b>${fmt(value)}</b><br>${key}/min</div>`).join('') : `<div class="notice">Upgrade an idle line to begin output.</div>`}
      </div>
    </section>

    <section class="card">
      <div class="cardTitle"><div><h3>Route Status</h3><p>${RACE_MODES[state.race.mode].label} · ${RACE_MODES[state.race.mode].description}</p></div><span class="pill">${Math.floor(state.race.progress)}/${stats.mode.stageLength}m</span></div>
      ${meterLine('Progress', state.race.progress, stats.mode.stageLength, '')}
      ${meterLine('Fuel', state.race.fuel, stats.fuelMax, state.race.fuel < 25 ? 'red' : 'yellow')}
      ${meterLine('Condition', state.race.condition, stats.conditionMax, state.race.condition < 25 ? 'red' : '')}
      ${meterLine('Heat', state.race.heat, 100, state.race.heat > 70 ? 'red' : 'yellow')}
    </section>

    <section class="card">
      <div class="cardTitle"><div><h3>Activity Log</h3><p>Short feedback only. Mobile games need fast readable feedback.</p></div></div>
      ${state.log.slice(0, 5).map((line) => `<div class="logLine">${line}</div>`).join('')}
    </section>
  `;
}

function renderWorld() {
  return `
    <section class="card worldCard">
      <div class="cardTitle">
        <div><h2>365 Auto World</h2><p>Tap buildings and events. Cars move on roads, shops generate work, and breakdowns feed tow/recovery gameplay.</p></div>
        <span class="pill">Playable Map</span>
      </div>
      <div class="autoWorldMap">
        <div class="mapGround"></div>
        <div class="road roadH roadTop"></div>
        <div class="road roadH roadMid"></div>
        <div class="road roadH roadBottom"></div>
        <div class="road roadV roadLeft"></div>
        <div class="road roadV roadRight"></div>
        <div class="intersection centerCross"></div>
        ${WORLD_TRAFFIC.map(renderTrafficCar).join('')}
        ${WORLD_PEOPLE.map(renderWorldPerson).join('')}
        ${AUTO_WORLD_LOCATIONS.map(renderWorldLocation).join('')}
      </div>
    </section>

    <section class="card">
      <div class="cardTitle"><div><h3>World Jobs</h3><p>This is the beginning of the real game layer: click locations, handle roadside work, grow the auto economy.</p></div></div>
      <div class="grid2">
        <button class="btn primary" data-action="worldTow">Dispatch Tow</button>
        <button class="btn" data-action="screen" data-screen="garage">Manage Shop</button>
        <button class="btn" data-action="screen" data-screen="lines">Upgrade Businesses</button>
        <button class="btn ghost" data-action="screen" data-screen="race">Run Route</button>
      </div>
    </section>
  `;
}

function renderTrafficCar(car) {
  const vehicle = car.asset ? `<img src="${car.asset}" alt="${car.key}" loading="lazy">` : car.icon;
  return `<div class="trafficCar ${car.lane} ${car.speedClass}" style="animation-delay:${car.delay}s">${vehicle}</div>`;
}

function renderWorldPerson(person) {
  return `<div class="worldPerson" style="left:${person.x}%; top:${person.y}%" title="${person.label}">${person.icon}</div>`;
}

function renderWorldLocation(location) {
  const locationIcon = location.asset ? `<img class="worldLocationVehicle" src="${location.asset}" alt="${location.name}" loading="lazy">` : `<span class="worldIcon">${location.icon}</span>`;
  return `
    <button class="worldLocation ${location.type}" style="left:${location.x}%; top:${location.y}%" data-action="worldLocation" data-location="${location.key}">
      ${locationIcon}
      <span class="worldLabel">${location.name}</span>
      ${location.type === 'event' ? '<span class="alertPing">!</span>' : ''}
    </button>
  `;
}

function renderRace() {
  const mode = RACE_MODES[state.race.mode];
  const stats = getRaceStats(state);
  const problem = state.race.problem ? PROBLEMS[state.race.problem] : null;
  return `
    <section class="card">
      <div class="cardTitle">
        <div><h2>Idle Racing</h2><p>Not about first place. The enemy is fuel, breakdowns, heat, traffic, and route cost.</p></div>
        <span class="pill">${mode.icon} ${mode.label}</span>
      </div>
      <div class="raceCanvas" id="raceCanvas"></div>
      ${meterLine('Progress', state.race.progress, stats.mode.stageLength, '')}
      ${meterLine('Fuel', state.race.fuel, stats.fuelMax, state.race.fuel < 25 ? 'red' : 'yellow')}
      ${meterLine('Condition', state.race.condition, stats.conditionMax, state.race.condition < 25 ? 'red' : '')}
      ${meterLine('Heat', state.race.heat, 100, state.race.heat > 70 ? 'red' : 'yellow')}
      <button class="tapButton" data-action="tapRace">TAP RACE BOOST</button>
    </section>

    ${problem ? renderProblem(problem) : `<section class="notice good">Route is clear. Tap for burst income or let the idle systems continue.</section>`}

    <section class="card">
      <div class="cardTitle"><div><h3>Route Modes</h3><p>2D idle modes only. No real-time PVP.</p></div></div>
      <div class="modeChips">
        ${Object.entries(RACE_MODES).map(([key, m]) => `<button class="chip ${key === state.race.mode ? 'active' : ''}" data-action="raceMode" data-mode="${key}">${m.icon} ${m.label}</button>`).join('')}
      </div>
    </section>

    <section class="card">
      <div class="cardTitle"><div><h3>Fast Upgrades</h3><p>These modify the race route. Main economy upgrades are in Lines.</p></div></div>
      ${UPGRADES.filter((u) => !['supplierShelf'].includes(u.key)).map(renderUpgrade).join('')}
    </section>
  `;
}

function renderLines() {
  const buildComm = getBuildCommunicationState(state);
  return `
    <section class="card linesIntroCard">
      <div class="cardTitle">
        <div><h2>Idle Business Lines</h2><p>Upgrade each automotive line. Hire managers at Lv 10 to auto-collect.</p></div>
        <span class="pill">Phase 10</span>
      </div>
      <div class="notice good"><b>Goal:</b> Street Route → Parts Delivery → Mobile Mechanic → Fuel/Towing → Dealer/Performance/Race.</div>
      <div class="linesAssetPreload" aria-hidden="true">
        ${Object.entries(LINES_GUI_ASSETS).map(([key, src]) => `<img class="linesGuiAsset" data-lines-gui="${key}" src="${src}" alt="" loading="eager">`).join('')}
      </div>
    </section>
    ${renderBuildLineBridge(buildComm)}
    ${IDLE_LINES.map(renderLineCard).join('')}
  `;
}

function renderBuildLineBridge(snapshot) {
  const systems = snapshot.systems.filter((system) => system.lineKeys.length);
  return `
    <section class="card buildLineBridgeCard">
      <div class="cardTitle">
        <div><h3>Build Links</h3><p>Garage systems now publish to Lines and World inventory together.</p></div>
        <span class="pill buildSyncBadge">${snapshot.unlockedLineCount}/${snapshot.totalLineCount} lines</span>
      </div>
      <div class="buildLineBridgeGrid">
        ${systems.map((system) => {
          const icon = buildSystemAssetForKey(system.buildingKey || system.key) || BUILD_ICON_ASSETS.buildMode;
          const lineText = system.lines.map((line) => `${line.name} ${line.unlocked ? `Lv ${line.level}` : 'locked'}`).join(' / ');
          return `
            <div class="buildLineChip">
              <b><img class="buildAssetIcon buildAssetImage" src="${icon}" alt="" loading="eager"> ${system.title}</b>
              <span>${system.built ? lineText : 'Build this system to activate the linked line.'}</span>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function renderLineIcon(line) {
  const asset = lineAssetForKey(line.key);
  return `
    <div class="lineIcon">
      <img class="lineIconAsset" src="${asset}" alt="${line.name}" loading="eager">
      <span class="lineEmojiFallback">${line.icon}</span>
    </div>
  `;
}

function renderLineStatusPill(label, asset) {
  return `<span class="pill lineStatusPill"><img class="lineStatusAsset linesGuiAsset" src="${asset}" alt="" loading="eager">${label}</span>`;
}

function getLineRequirementInfo(line) {
  const unlock = line.unlock || { type: 'starter' };
  if (unlock.type === 'starter') {
    return { met: true, label: 'Open from start', detail: 'Ready', current: 1, required: 1, actionScreen: null };
  }
  if (unlock.type === 'lineLevel') {
    const current = getLineState(state, unlock.key)?.level || 0;
    return {
      met: current >= unlock.level,
      label: `Upgrade ${unlock.label} to Lv ${unlock.level}`,
      detail: `Lv ${current}/${unlock.level}`,
      current,
      required: unlock.level,
      actionScreen: 'lines'
    };
  }
  if (unlock.type === 'building') {
    const current = state.buildings?.[unlock.key] || 0;
    return {
      met: current >= unlock.level,
      label: `Build ${unlock.label} Lv ${unlock.level}`,
      detail: `Lv ${current}/${unlock.level}`,
      current,
      required: unlock.level,
      actionScreen: 'garage'
    };
  }
  if (unlock.type === 'stage') {
    const current = state.stage || 1;
    return {
      met: current >= unlock.stage,
      label: `Reach Stage ${unlock.stage}`,
      detail: `Stage ${current}/${unlock.stage}`,
      current,
      required: unlock.stage,
      actionScreen: 'hub'
    };
  }
  return { met: false, label: 'Requirement unknown', detail: 'Locked', current: 0, required: 1, actionScreen: null };
}

function renderLineRequirement(line) {
  const req = getLineRequirementInfo(line);
  const pct = Math.max(0, Math.min(100, (req.current / Math.max(1, req.required)) * 100));
  const action = !req.met && req.actionScreen
    ? `<button class="btn small ghost" data-action="screen" data-screen="${req.actionScreen}">Go</button>`
    : '';
  return `
    <div class="lineRequirement ${req.met ? 'met' : 'open'}">
      <div class="lineRequirementText">
        <b>${req.met ? 'Requirement met' : 'Requirement'}</b>
        <span>${req.label}</span>
      </div>
      <strong>${req.detail}</strong>
      ${action}
      <div class="lineRequirementMeter"><span style="width:${pct}%"></span></div>
    </div>
  `;
}

function renderManagerRequirement(line, level, managerOwned, managerCost, autoEnabled) {
  if (managerOwned) {
    return `
      <div class="lineManagerGrid">
        <div class="notice good">
          <b>${line.manager.name}</b> hired.<br>
          Auto collect is <b>${autoEnabled ? 'ON' : 'OFF'}</b>. ${autoEnabled ? 'Rewards collect automatically.' : 'Cycle stops when ready for manual collection.'}
        </div>
        <button class="btn small ${autoEnabled ? 'red' : 'primary'}" data-action="toggleLineAuto" data-line="${line.key}">
          <img class="lineButtonAsset linesGuiAsset" src="${autoEnabled ? LINES_GUI_ASSETS.manualBadge : LINES_GUI_ASSETS.autoBadge}" alt="" loading="eager">
          <span>${autoEnabled ? 'Pause Auto' : 'Turn Auto On'}</span>
        </button>
      </div>
    `;
  }

  const managerReady = level >= line.manager.unlockLevel;
  const pct = Math.max(0, Math.min(100, (level / line.manager.unlockLevel) * 100));
  return `
    <div class="lineManagerNeed">
      <div class="lineRequirement ${managerReady ? 'met' : 'open'}">
        <div class="lineRequirementText">
          <b>Manager requirement</b>
          <span>${line.manager.name} unlocks at Lv ${line.manager.unlockLevel}</span>
        </div>
        <strong>Lv ${level}/${line.manager.unlockLevel}</strong>
        <div class="lineRequirementMeter"><span style="width:${pct}%"></span></div>
      </div>
      <button class="btn small" data-action="buyManager" data-line="${line.key}" ${managerReady && canAfford(state, managerCost) ? '' : 'disabled'}>
        <img class="lineButtonAsset linesGuiAsset" src="${LINES_GUI_ASSETS.hireManagerButton}" alt="" loading="eager">
        <span>Hire ${line.manager.name}<br><small>${managerReady ? costToText(managerCost) : `Needs Lv ${line.manager.unlockLevel}`}</small></span>
      </button>
    </div>
  `;
}

function renderLineCard(line) {
  const current = getLineState(state, line.key);
  const unlocked = isLineUnlocked(state, line);
  const level = current.level;
  const cycleMs = getLineCycleMs(state, line);
  const pct = level > 0 ? Math.max(0, Math.min(100, (current.cycle / cycleMs) * 100)) : 0;
  const income = getLineIncome(state, line);
  const upgradeCost = getLineUpgradeCost(state, line);
  const managerCost = getManagerCost(state, line);
  const managerOwned = hasManager(state, line.key);
  const autoEnabled = isAutoCollectEnabled(state, line.key);
  const nextMilestone = getNextMilestone(state, line);
  const collectReady = canCollectLine(state, line);
  const statusAsset = !unlocked ? LINES_GUI_ASSETS.lockedBadge : managerOwned && autoEnabled ? LINES_GUI_ASSETS.autoBadge : LINES_GUI_ASSETS.manualBadge;
  const statusLabel = !unlocked ? 'Locked' : managerOwned ? (autoEnabled ? 'AUTO ON' : 'AUTO OFF') : 'MANUAL';

  if (!unlocked) {
    const buildConnection = connectionForLine(line.key);
    const buildLink = buildConnection?.buildingKey
      ? `<div class="lockedLineActions"><button class="btn small gold" data-action="screen" data-screen="garage"><img class="roomButtonAsset buildAssetImage" src="${BUILD_ICON_ASSETS.buildMode}" alt="" loading="eager"><span>Open Build</span></button></div>`
      : '';
    return `
      <section class="lineCard lockedLine" data-line-key="${line.key}">
        <div class="lineHead">
          ${renderLineIcon(line)}
          <div><h3>${line.name}</h3><p>${line.description}</p></div>
          ${renderLineStatusPill(statusLabel, statusAsset)}
        </div>
        ${renderLineRequirement(line)}
        <div class="notice">${unlockText(line)}</div>
        ${buildLink}
      </section>
    `;
  }

  return `
    <section class="lineCard" data-line-key="${line.key}">
      <div class="lineHead">
        ${renderLineIcon(line)}
        <div><h3>${line.name} <span class="pill">Lv ${level}</span></h3><p>${line.description}</p></div>
        ${renderLineStatusPill(statusLabel, statusAsset)}
      </div>
      ${renderLineRequirement(line)}
      <div class="lineStats">
        <div><b>${fmt(income)}</b><span>${line.outputLabel}/cycle</span></div>
        <div><b>${(cycleMs / 1000).toFixed(1)}s</b><span>Cycle</span></div>
        <div><b>${fmt(current.collected)}</b><span>Collects</span></div>
      </div>
      <div class="lineProgress"><div style="width:${pct}%"></div></div>
      <div class="lineButtons">
        <button class="btn small ${collectReady ? 'gold' : 'ghost'}" data-action="collectLine" data-line="${line.key}" ${collectReady ? '' : 'disabled'}><img class="lineButtonAsset linesGuiAsset" src="${LINES_GUI_ASSETS.collectButton}" alt="" loading="eager"><span>${managerOwned && autoEnabled ? 'Auto Running' : 'Collect'}</span></button>
        <button class="btn small primary" data-action="upgradeLine" data-line="${line.key}" ${canAfford(state, upgradeCost) ? '' : 'disabled'}><img class="lineButtonAsset linesGuiAsset" src="${LINES_GUI_ASSETS.upgradeButton}" alt="" loading="eager"><span>Upgrade<br><small>${costToText(upgradeCost)}</small></span></button>
      </div>
      <div class="lineManager">
        ${renderManagerRequirement(line, level, managerOwned, managerCost, autoEnabled)}
      </div>
      <div class="cost">Next milestone: ${nextMilestone ? `Lv ${nextMilestone.level} · ${nextMilestone.label}` : 'All early milestones reached.'}</div>
    </section>
  `;
}

function renderProblem(problem) {
  return `
    <section class="card problemCard">
      <div class="cardTitle">
        <div><h3>${problem.icon} ${problem.label}</h3><p>${problem.description}</p></div>
      </div>
      <div class="grid2">
        ${problem.fixes.map((fix, index) => `<button class="btn red" data-action="fixProblem" data-fix="${index}">${fix.label}<br><small>${fix.amount} ${fix.resource}</small></button>`).join('')}
      </div>
    </section>
  `;
}

function renderMerge() {
  normalizeMergeState(state);
  const active = activeBoardCount(state);
  const limit = boardLimit(state);
  return `
    <section class="card">
      <div class="cardTitle">
        <div><h2>Merge Bay</h2><p>Supplier drops Level 1 only. Every higher item must be earned by merging.</p></div>
        <span class="pill">${active}/${limit} permit</span>
      </div>
      <div class="notice">Next supplier item in <b>${Math.ceil(state.merge.supplierTimer)}s</b>. Shelf capacity: ${shelfCapacity(state)}.</div>
      <div class="shelf" style="margin-top:8px;">
        ${state.merge.supplierSlots.map((item, index) => renderShelfSlot(item, index)).join('')}
      </div>
      <div class="grid3" style="margin-top:8px;">
        <button class="btn small primary" data-action="placeAll">Place All</button>
        <button class="btn small" data-action="autoMerge">Auto Merge</button>
        <button class="btn small red" data-action="sellSelected">Sell Selected</button>
      </div>
    </section>

    <section class="card">
      <div class="cardTitle"><div><h3>Merge Board</h3><p>Tap one item, then tap a matching level item to merge.</p></div></div>
      <div class="board">
        ${state.merge.board.map((item, index) => renderBoardCell(item, index)).join('')}
      </div>
    </section>

    <section class="card mergeGuideCard">
      <div class="cardTitle"><div><h3>Merge Recipes</h3><p>Two matching items combine into the next item. Locked sets show the exact requirement.</p></div></div>
      ${Object.entries(CHAINS).map(([key, chain]) => renderMergeChainGuide(key, chain)).join('')}
    </section>
  `;
}

function renderShelfSlot(item, index) {
  if (!item) return `<button class="shelfSlot"><span class="emptyText">Empty<br>slot</span></button>`;
  return `<button class="shelfSlot ready" data-action="placeShelf" data-index="${index}">${renderItem(item)}</button>`;
}

function renderBoardCell(item, index) {
  if (!item) return `<button class="cell" data-action="cell" data-index="${index}"><span class="emptyText">Open</span></button>`;
  const selected = state.merge.selectedIndex === index ? 'selected' : '';
  return `<button class="cell ${selected}" data-action="cell" data-index="${index}">${renderItem(item)}</button>`;
}

function renderItem(item) {
  const chain = CHAINS[item.chain];
  const name = itemDisplayName(item);
  const asset = mergeAssetForName(name);
  const icon = asset
    ? `<img class="mergeItemArt" src="${asset}" alt="${name}" draggable="false">`
    : chain.icon;
  return `<div><span class="lvl">L${item.level}</span><div class="itemIcon">${icon}</div><div class="itemName">${name}</div><span class="chainTag">${chain.short}</span></div>`;
}

function renderMergeChainPreview(chain, unlocked) {
  const preview = chain.items.slice(0, 4).map((name) => {
    const asset = mergeAssetForName(name);
    return asset
      ? `<span class="mergeChainAsset"><img class="mergeItemArt" src="${asset}" alt="${name}" loading="eager" draggable="false"></span>`
      : `<span class="mergeChainAsset">${chain.icon}</span>`;
  }).join('');
  return `<div class="mergeChainPreview ${unlocked ? '' : 'locked'}" aria-label="${chain.label} asset preview">${preview}</div>`;
}

function mergeChainRequirement(key) {
  if (key === 'performance') {
    const level = state.buildings?.tuningCorner || 0;
    return {
      met: level > 0,
      text: `Build Tuning Corner Lv 1 (${level}/1)`,
      actionScreen: 'garage'
    };
  }
  if (key === 'racing') {
    const level = state.buildings?.testTrack || 0;
    return {
      met: level > 0,
      text: `Build 2D Test Track Lv 1 (${level}/1)`,
      actionScreen: 'garage'
    };
  }
  return { met: true, text: 'Unlocked from start', actionScreen: null };
}

function renderMergeChainGuide(key, chain) {
  const unlocked = unlockedChainKeys(state).includes(key);
  const req = mergeChainRequirement(key);
  if (!unlocked) {
    return `
      <div class="mergeRecipe locked">
        <div class="mergeRecipeHead">
          <div><b>${chain.icon} ${chain.label}</b><span>${chain.description}</span></div>
          <span class="pill">Locked</span>
        </div>
        <div class="notice">Requirement: ${req.text}</div>
        ${renderMergeChainPreview(chain, false)}
        ${req.actionScreen ? `<button class="btn small gold mergeRecipeAction" data-action="screen" data-screen="${req.actionScreen}">Open Build Requirements</button>` : ''}
      </div>
    `;
  }

  return `
    <div class="mergeRecipe good">
      <div class="mergeRecipeHead">
        <div><b>${chain.icon} ${chain.label}</b><span>${chain.description}</span></div>
        <span class="pill">Unlocked</span>
      </div>
      <div class="mergeRecipeRule">Recipe rule: <b>2 matching items</b> make the next level.</div>
      <div class="mergeChainLadder" aria-label="${chain.label} merge progression">
        ${chain.items.map((name, index) => renderMergeChainStep(chain, name, index)).join('')}
      </div>
    </div>
  `;
}

function renderMergeChainStep(chain, name, index) {
  const asset = mergeAssetForName(name);
  const next = chain.items[index + 1];
  const art = asset
    ? `<img class="mergeItemArt" src="${asset}" alt="${name}" loading="eager" draggable="false">`
    : `<span>${chain.icon}</span>`;
  return `
    <div class="mergeChainStep">
      <div class="mergeChainLevel">L${index + 1}</div>
      <div class="mergeChainNode">${art}</div>
      <b>${name}</b>
      ${next ? `<span class="mergeChainArrow">2x -> ${next}</span>` : `<span class="mergeChainArrow final">Top item</span>`}
    </div>
  `;
}

function renderGarage() {
  const buildComm = publishBuildCommunicationState(state);
  return `
    <section class="card buildHubCard">
      <div class="cardTitle">
        <div><h2>Build Hub</h2><p>Build systems, World placements, and Lines now share one communication snapshot.</p></div>
        <span class="pill buildSyncBadge">Live Sync</span>
      </div>
      <div class="buildAssetPreload" aria-hidden="true">
        ${BUILD_ASSET_LIST.map((item) => `<img class="buildAssetPreloadImage" data-build-asset="${item.category}:${item.key}" src="${item.src}" alt="" loading="eager">`).join('')}
      </div>
      <div class="buildHubButtons">
        <button class="btn gold" data-action="screen" data-screen="garage"><img class="buildButtonAsset buildAssetImage" src="${BUILD_ICON_ASSETS.buildMode}" alt="" loading="eager"><span>Build</span></button>
        <button class="btn primary" data-action="screen" data-screen="world"><img class="buildButtonAsset buildAssetImage" src="${BUILD_ICON_ASSETS.worldSync}" alt="" loading="eager"><span>World</span></button>
        <button class="btn" data-action="screen" data-screen="lines"><img class="buildButtonAsset buildAssetImage" src="${BUILD_ICON_ASSETS.lineSync}" alt="" loading="eager"><span>Lines</span></button>
      </div>
      <div class="buildBridgeGrid">
        ${renderBuildHubStat(`${buildComm.builtCount}/${buildComm.totalSystems}`, 'Systems Built')}
        ${renderBuildHubStat(`+${buildComm.totalWorldInventory}`, 'World Placements')}
        ${renderBuildHubStat(`${buildComm.unlockedLineCount}/${buildComm.totalLineCount}`, 'Linked Lines')}
      </div>
    </section>

    <section class="card">
      <div class="cardTitle"><div><h2>365 Auto Shop Floor</h2><p>Each room links to a Line and adds World inventory when its Build system exists.</p></div><span class="pill">Build View</span></div>
      <div class="shopFloor">
        ${AUTO_SHOP_ROOMS.map(renderShopRoom).join('')}
      </div>
    </section>

    <section class="card">
      <div class="cardTitle"><div><h2>Build Garage Systems</h2><p>Buildings unlock mechanics and city inventory. They are not just cosmetics.</p></div></div>
      ${BUILDINGS.map(renderBuilding).join('')}
    </section>
    <section class="card">
      <div class="cardTitle"><div><h3>Supplier / Merge Upgrades</h3><p>These support the merge board instead of replacing it.</p></div></div>
      ${UPGRADES.filter((u) => u.key === 'supplierShelf').map(renderUpgrade).join('')}
    </section>
  `;
}

function renderBuildHubStat(value, label) {
  return `<div class="buildBridgeStat"><b>${value}</b><span>${label}</span></div>`;
}

function worldTypeLabel(key) {
  return WORLD_BUILDING_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}

function renderBuildWorldChips(inventory) {
  const entries = Object.entries(inventory || {});
  if (!entries.length) return `<span class="buildWorldChip"><b>Pending</b><span>Build to sync World</span></span>`;
  return entries.map(([key, amount]) => `<span class="buildWorldChip"><b>+${amount}</b><span>${worldTypeLabel(key)}</span></span>`).join('');
}

function renderBuildLineChips(system) {
  if (!system?.lines?.length) return `<span class="buildLineChip"><b>No line</b><span>Standalone room</span></span>`;
  return system.lines.map((line) => `<span class="buildLineChip"><b>${line.unlocked ? `Lv ${line.level}` : 'Locked'}</b><span>${line.name}</span></span>`).join('');
}

function renderShopRoom(room) {
  const unlocked = !room.buildingKey || (state.buildings[room.buildingKey] || 0) > 0;
  const connection = connectionForRoom(room.key);
  const system = connection ? getBuildCommunicationState(state).systems.find((item) => item.key === connection.key) : null;
  const line = IDLE_LINES.find((item) => item.key === room.lineKey);
  const lineState = line ? getLineState(state, line.key) : null;
  const level = lineState?.level || 0;
  const income = line ? getLineIncome(state, line) : 0;
  const cycleMs = line ? getLineCycleMs(state, line) : 1;
  const progress = lineState && level > 0 ? Math.max(0, Math.min(100, (lineState.cycle / cycleMs) * 100)) : 0;
  const manager = line ? hasManager(state, line.key) : false;
  const lockedText = room.buildingKey ? `Build ${BUILDINGS.find((item) => item.key === room.buildingKey)?.name || 'required system'} to open.` : 'Open from start.';
  const roomAsset = buildRoomAssetForKey(room.key) || room.asset;

  return `
    <article class="shopRoom ${unlocked ? '' : 'lockedRoom'}" data-build-room="${room.key}">
      <div class="roomArtWrap">
        <img class="roomArt buildAssetImage" src="${roomAsset}" alt="${room.name}" loading="eager">
      </div>
      <div class="roomInfo">
        <div class="roomHead"><h3>${room.icon} ${room.name}</h3><span class="pill">${unlocked ? `Lv ${level}` : 'Locked'}</span></div>
        <p>${unlocked ? room.description : lockedText}</p>
        <div class="roomProgress"><div style="width:${progress}%"></div></div>
        <div class="roomMeta">
          <span>${line ? `${fmt(income)} ${line.outputLabel}` : 'No line'}</span>
          <span>${manager ? 'Manager Active' : 'Manual'}</span>
        </div>
        <div class="roomSyncRow">${renderBuildWorldChips(system?.worldInventory)}</div>
        <div class="roomActions">
          <button class="btn small ${unlocked ? 'primary' : 'ghost'}" data-action="screen" data-screen="lines"><img class="roomButtonAsset buildAssetImage" src="${BUILD_GUI_ASSETS.linesButton}" alt="" loading="eager"><span>${unlocked ? 'Line' : 'Reqs'}</span></button>
          <button class="btn small" data-action="screen" data-screen="world"><img class="roomButtonAsset buildAssetImage" src="${BUILD_GUI_ASSETS.worldButton}" alt="" loading="eager"><span>World</span></button>
          <button class="btn small gold" data-action="screen" data-screen="garage"><img class="roomButtonAsset buildAssetImage" src="${BUILD_GUI_ASSETS.buildButton}" alt="" loading="eager"><span>Build</span></button>
        </div>
      </div>
      ${unlocked && line && canCollectLine(state, line) && !manager ? `<div class="incomeBubble">Collect</div>` : ''}
      ${!unlocked ? `<div class="roomLock">🔒</div>` : ''}
    </article>
  `;
}

function renderUpgrade(def) {
  const level = state.upgrades[def.key] || 0;
  const cost = upgradeCost(state, def);
  return `
    <div class="upgrade">
      <div class="upIcon">${def.icon}</div>
      <div><h4>${def.name} <span class="pill">Lv ${level}</span></h4><p>${def.description}</p><div class="cost">Cost: ${costToText(cost)}</div></div>
      <button class="btn small primary" data-action="upgrade" data-key="${def.key}" ${canAfford(state, cost) ? '' : 'disabled'}>Buy</button>
    </div>
  `;
}

function renderBuilding(building) {
  const level = state.buildings[building.key] || 0;
  const cost = nextBuildingCost(state, building);
  const connection = connectionForBuilding(building.key);
  const system = connection ? getBuildCommunicationState(state).systems.find((item) => item.key === connection.key) : null;
  const asset = buildSystemAssetForKey(building.key);
  return `
    <div class="building" data-build-system="${building.key}">
      <img class="buildSystemAsset buildAssetImage" src="${asset}" alt="${building.name}" loading="eager">
      <div class="buildingMain">
        <div class="buildingHeader">
          <div><h4>${building.name}</h4><p>${building.description}</p></div>
          <span class="pill">Lv ${level}/${building.max}</span>
        </div>
        <p><b>Unlocks:</b> ${building.unlocks}</p>
        <div class="buildCommMeta">
          <div class="roomSyncRow">${renderBuildWorldChips(system?.worldInventory)}</div>
          <div class="lineBuildBridge">${renderBuildLineChips(system)}</div>
          ${cost ? `<div class="cost">Next build: ${costToText(cost)}</div>` : `<div class="cost">Maxed and fully synced.</div>`}
        </div>
        <div class="buildActions">
          <button class="btn small primary" data-action="building" data-key="${building.key}" ${cost && canAfford(state, cost) ? '' : 'disabled'}><img class="buildButtonAsset buildAssetImage" src="${cost ? BUILD_GUI_ASSETS.upgradeButton : BUILD_GUI_ASSETS.levelBadge}" alt="" loading="eager"><span>${cost ? (level > 0 ? 'Upgrade' : 'Build') : 'Done'}</span></button>
          <button class="btn small" data-action="screen" data-screen="world"><img class="buildButtonAsset buildAssetImage" src="${BUILD_ICON_ASSETS.worldSync}" alt="" loading="eager"><span>World</span></button>
          <button class="btn small gold" data-action="screen" data-screen="lines"><img class="buildButtonAsset buildAssetImage" src="${BUILD_ICON_ASSETS.lineSync}" alt="" loading="eager"><span>Lines</span></button>
        </div>
      </div>
    </div>
  `;
}

function renderProfile() {
  const objectives = getObjectiveList(state);
  const completed = objectives.filter((o) => o.done).length;
  const garageValue = Math.round(state.currencies.coins + state.stage * 100 + state.merge.totalMerges * 18 + Object.values(state.buildings).reduce((a, b) => a + b, 0) * 500 + state.idleLines.lifetimeCollections * 12);
  return `
    <section class="card">
      <div class="cardTitle"><div><h2>${state.playerName}</h2><p>Local-only profile. Git repo stage. No Supabase yet.</p></div><span class="pill">Lv ${state.level}</span></div>
      ${meterLine('XP', state.xp, state.level * 80, '')}
      <div class="grid2">
        <div class="notice good"><b>${fmt(garageValue)}</b><br>Garage Value</div>
        <div class="notice good"><b>${fmt(state.race.lifetimeMeters)}</b><br>Lifetime Meters</div>
        <div class="notice"><b>${state.merge.totalMerges}</b><br>Total Merges</div>
        <div class="notice"><b>${fmt(state.idleLines.lifetimeCollections)}</b><br>Line Collects</div>
      </div>
    </section>

    <section class="card">
      <div class="cardTitle"><div><h3>Objective Checklist</h3><p>The player always needs a clear reason to continue.</p></div></div>
      ${objectives.map((o) => `<div class="objective"><div class="checkIcon">${o.done ? '✅' : '⬜'}</div><div><h4>${o.title}</h4><p>${o.body}</p></div><span class="pill">${o.done ? 'Done' : 'Open'}</span></div>`).join('')}
    </section>

    <section class="card">
      <button class="btn red" data-action="reset">Reset Local Save</button>
    </section>
  `;
}

function renderCreator() {
  return `
    <section class="card">
      <div class="cardTitle"><div><h2>Creator Mode Rules</h2><p>Use this screen while we build new modes so the companion app does not lose focus.</p></div></div>
      <div class="notice good"><b>Current rule:</b> Git repo first. Local save only. Supabase later after the game loop is stable.</div>
    </section>
    ${CREATOR_RULES.map((rule) => `
      <section class="ruleBlock">
        <h4>${rule.mode}</h4>
        <div class="doDont">
          <div class="notice good"><b>Do</b><ul>${rule.do.map((item) => `<li>${item}</li>`).join('')}</ul></div>
          <div class="notice bad"><b>Don’t</b><ul>${rule.dont.map((item) => `<li>${item}</li>`).join('')}</ul></div>
        </div>
      </section>
    `).join('')}
  `;
}

function meterLine(label, value, max, tone) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return `<div class="statLine"><span>${label}</span><div class="meter"><div class="fill ${tone}" style="width:${pct}%"></div></div><strong>${Math.floor(value)}</strong></div>`;
}

function handleClick(event) {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  let result = null;

  if (action === 'screen') {
    state.activeScreen = target.dataset.screen;
    render();
    queueSave();
    return;
  }

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
    toast(result.message);
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

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function toast(message) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 1800);
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
