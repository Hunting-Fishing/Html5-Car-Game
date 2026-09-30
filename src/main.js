import './styles.css';
import './styles-extra.css';
import { gsap } from 'gsap';
import { SCREENS, RACE_MODES, CHAINS, UPGRADES, BUILDINGS, PROBLEMS, BUSINESSES, LOT_PLOTS, DAILY_ORDERS } from './data/gameData.js';
import { loadState, saveState, resetState, rollDaily } from './systems/saveSystem.js';
import { fmt, costToText, canAfford } from './systems/economySystem.js';
import { getObjectiveList, applyDerivedObjectives, claimDaily } from './systems/objectiveSystem.js';
import { tickSupplier, placeSupplierItem, placeAllReady, selectOrMergeCell, sellSelected, autoMergeOnce, itemDisplayName, boardLimit, activeBoardCount, shelfCapacity, normalizeMergeState, unlockedChainKeys } from './systems/mergeSystem.js';
import { tickRace, tapRace, changeRaceMode, fixProblem, getRaceStats } from './systems/raceSystem.js';
import { buyUpgrade, upgradeCost, buyBuilding, nextBuildingCost } from './systems/upgradeSystem.js';
import { tickShop, shopIncomePerSec, buyBusiness, businessCost } from './systems/shopSystem.js';
import { tickLot, collectLot, buyLotPlot, lotIncomePerSec } from './systems/lotSystem.js';
import { startHill, setHillGas, tickHill } from './systems/hillSystem.js';
import { mountRaceCanvas, updateRaceCanvas, pulseCar } from './ui/racePixi.js';

const WEBSITE_URL = 'https://www.365motorsales.com';
let state = loadState();
let lastTime = performance.now();
let saveQueued = false;
let raceMounted = false;
const root = document.querySelector('#app');

boot();

function boot() {
  normalizeMergeState(state);
  if (!state.tips) state.tips = {};
  if (!state.lot) state.lot = { owned: { office: 1 }, pending: 0 };
  if (!state.shop) state.shop = { wash: 1, detail: 0, service: 0, lotRental: 0, showcaseShop: 0, banked: 0 };
  if (!state.hill) state.hill = { running: false, gasHeld: false, distance: 0, fuel: 100, tilt: 0, best: 0, speed: 0 };
  if (!state.daily) rollDaily(state);
  if (state.activeScreen === 'garage' || state.activeScreen === 'creator') state.activeScreen = 'lot';
  renderShell();
  render();
  root.addEventListener('click', handleClick);
  root.addEventListener('pointerdown', handlePointer);
  root.addEventListener('pointerup', handlePointer);
  root.addEventListener('pointercancel', handlePointer);
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
  rollDaily(state);
  tickRace(state, dt);
  tickHill(state, dt);
  tickSupplier(state, dt);
  tickShop(state, dt);
  tickLot(state, dt);
  applyDerivedObjectives(state);
  updateRaceCanvas(state);
  updateLiveHud();
  if (now - (state._lastAutoSave || 0) > 5000) {
    state._lastAutoSave = now;
    queueSave();
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
            <div class="brandText"><b>Micro Garage</b><span>Drive · Merge · Lot · Shop</span></div>
          </div>
          <div class="stagePill" id="stagePill">Stage 1</div>
        </div>
        <div class="currencyGrid seven">
          <div class="cur"><b id="cur-coins">0</b><span>Coins</span></div>
          <div class="cur"><b id="cur-parts">0</b><span>Parts</span></div>
          <div class="cur"><b id="cur-tools">0</b><span>Tools</span></div>
          <div class="cur"><b id="cur-scrap">0</b><span>Scrap</span></div>
          <div class="cur"><b id="cur-tune">0</b><span>Tune</span></div>
          <div class="cur"><b id="cur-rep">0</b><span>Rep</span></div>
          <div class="cur"><b id="cur-fuelCans">0</b><span>Fuel</span></div>
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
  updateLiveHud();
  document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
  document.querySelector(`#screen-${state.activeScreen}`)?.classList.add('active');
  document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.screen === state.activeScreen));
  renderActiveScreen();
}

function renderActiveScreen() {
  const el = document.querySelector(`#screen-${state.activeScreen}`);
  if (!el) return;
  if (state.activeScreen === 'hub') el.innerHTML = renderHub();
  if (state.activeScreen === 'race') {
    const sig = `${state.race.mode}|${state.race.problem || ''}|${state.hill.running ? 1 : 0}`;
    if (el.dataset.raceSig !== sig || !el.querySelector('#raceCanvas')) {
      el.innerHTML = renderRace();
      el.dataset.raceSig = sig;
      const host = el.querySelector('#raceCanvas');
      if (host) mountRaceCanvas(host).then(() => { raceMounted = true; updateRaceCanvas(state); });
    }
  }
  if (state.activeScreen === 'merge') el.innerHTML = renderMerge();
  if (state.activeScreen === 'lot') el.innerHTML = renderLot();
  if (state.activeScreen === 'profile') el.innerHTML = renderProfile();
}

function updateLiveHud() {
  const c = state.currencies;
  setText('stagePill', `Stage ${state.stage}`);
  ['coins', 'parts', 'tools', 'scrap', 'tune', 'rep', 'fuelCans'].forEach((key) => setText(`cur-${key}`, fmt(c[key])));
  const stats = getRaceStats(state);
  setFill('fill-progress', state.race.mode === 'hill' ? state.hill.distance / 160 : state.race.progress / stats.mode.stageLength);
  setFill('fill-fuel', state.race.mode === 'hill' ? state.hill.fuel / 100 : state.race.fuel / stats.fuelMax);
  setFill('fill-condition', state.race.condition / stats.conditionMax);
  setFill('fill-heat', state.race.heat / 100);
  setFill('fill-tilt', (state.hill.tilt || 0) / 1.35);
  setText('live-supplier', `${Math.max(0, Math.ceil(state.merge.supplierTimer))}s`);
  setText('live-shop', `${fmt(shopIncomePerSec(state))}/s`);
  setText('live-lot', `${fmt(state.lot.pending || 0)} ready`);
  setText('live-hill', `${Math.floor(state.hill.distance)}m`);
  setText('live-speed', `${Math.floor(state.hill.speed)} mph`);
}

function setFill(id, ratio) {
  const el = document.getElementById(id);
  if (el) el.style.width = `${Math.max(0, Math.min(100, ratio * 100))}%`;
}

function tipCard(key, title, body) {
  if (state.tips?.[key]) return '';
  return `<section class="card tipCard"><div class="cardTitle"><div><h3>💡 ${title}</h3><p>${body}</p></div><button class="btn small ghost" data-action="dismissTip" data-tip="${key}">Got it</button></div></section>`;
}

function offlineBanner() {
  const o = state.pendingOffline;
  if (!o) return '';
  const mins = Math.max(1, Math.round(o.seconds / 60));
  return `<section class="card tipCard"><div class="cardTitle"><div><h3>⏱ Offline</h3><p>~${mins} min away. +${fmt(o.coins)} coins${o.parts ? `, +${fmt(o.parts)} parts` : ''}.</p></div></div><button class="btn primary" data-action="claimOffline">Collect</button></section>`;
}

function renderHub() {
  const objectives = getObjectiveList(state);
  const next = objectives.find((item) => !item.done);
  return `
    ${offlineBanner()}
    ${tipCard('welcome', 'Four modes, one garage', 'Drive (idle + Hill Run), Merge parts, tap the Lot like a town, and buy Idle Shops. Everything shares coins.')}
    <section class="card">
      <div class="cardTitle"><div><h2>Today’s Goal</h2><p>Clear one objective, then a service order.</p></div></div>
      ${next ? `<div class="notice good"><b>${next.title}</b><br>${next.body}</div>` : `<div class="notice good"><b>Core goals done.</b> Keep the shop and lot running.</div>`}
    </section>
    <section class="card brandCard">
      <div class="cardTitle"><div><h2>365 Motor Sales</h2><p>Companion game for the real lot.</p></div></div>
      <button class="btn gold" data-action="openWebsite">View Real Deals →</button>
    </section>
    <section class="card">
      <div class="cardTitle"><div><h3>Play modes</h3><p>Each mode feeds the others.</p></div></div>
      <div class="grid2">
        <button class="btn primary" data-action="screen" data-screen="race">Drive / Hill</button>
        <button class="btn" data-action="screen" data-screen="merge">Merge</button>
        <button class="btn" data-action="screen" data-screen="lot">Lot Town + Shop</button>
        <button class="btn ghost" data-action="screen" data-screen="profile">Profile</button>
      </div>
    </section>
    <section class="card">
      <div class="cardTitle"><div><h3>Service Orders</h3><p>Daily micro jobs.</p></div><span class="pill" id="live-shop">${fmt(shopIncomePerSec(state))}/s</span></div>
      ${DAILY_ORDERS.map((o) => {
        const done = o.check(state);
        const claimed = !!state.daily.claimed[o.key];
        return `<div class="objective"><div class="checkIcon">${claimed ? '✅' : done ? '🎁' : '⬜'}</div><div><h4>${o.title}</h4><p>${claimed ? 'Paid' : done ? 'Ready to claim' : 'In progress'}</p></div>
          <button class="btn small primary" data-action="claimDaily" data-key="${o.key}" ${done && !claimed ? '' : 'disabled'}>Claim</button></div>`;
      }).join('')}
    </section>
    <section class="card">
      <div class="cardTitle"><div><h3>Activity</h3></div></div>
      ${state.log.slice(0, 5).map((line) => `<div class="logLine">${line}</div>`).join('')}
    </section>
  `;
}

function meterLine(id, label, value, max, tone) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return `<div class="statLine"><span>${label}</span><div class="meter"><div class="fill ${tone || ''}" id="${id}" style="width:${pct}%"></div></div><strong>${Math.floor(value)}</strong></div>`;
}

function renderRace() {
  const mode = RACE_MODES[state.race.mode] || RACE_MODES.street;
  const stats = getRaceStats(state);
  const problem = state.race.problem ? PROBLEMS[state.race.problem] : null;
  const hill = state.race.mode === 'hill';
  return `
    ${tipCard('race', 'Idle + Hill', 'Street-style routes idle. Hill Run: hold GAS. Fuel cans from Fuel Saver feed hills.')}
    <section class="card">
      <div class="cardTitle"><div><h2>${hill ? 'Hill Run' : 'Idle Drive'}</h2><p>${mode.description}</p></div><span class="pill">${mode.icon} ${mode.label}</span></div>
      <div class="raceCanvas" id="raceCanvas"></div>
      ${hill ? `
        ${meterLine('fill-progress', 'Distance', state.hill.distance, 160, '')}
        ${meterLine('fill-fuel', 'Hill Fuel', state.hill.fuel, 100, state.hill.fuel < 25 ? 'red' : 'yellow')}
        ${meterLine('fill-tilt', 'Flip Risk', state.hill.tilt * 100, 135, 'red')}
        <div class="grid2"><div class="notice" id="live-hill">${Math.floor(state.hill.distance)}m</div><div class="notice" id="live-speed">${Math.floor(state.hill.speed)} mph</div></div>
        <button class="tapButton gas" data-action="hillGas">${state.hill.running ? 'HOLD GAS' : 'START HILL RUN'}</button>
      ` : `
        ${meterLine('fill-progress', 'Progress', state.race.progress, stats.mode.stageLength, '')}
        ${meterLine('fill-fuel', 'Fuel', state.race.fuel, stats.fuelMax, state.race.fuel < 25 ? 'red' : 'yellow')}
        ${meterLine('fill-condition', 'Condition', state.race.condition, stats.conditionMax, state.race.condition < 25 ? 'red' : '')}
        ${meterLine('fill-heat', 'Heat', state.race.heat, 100, state.race.heat > 70 ? 'red' : 'yellow')}
        <button class="tapButton" data-action="tapRace">TAP BOOST</button>
      `}
    </section>
    ${state.race.mode === 'showcase' ? `<section class="card brandCard"><div class="cardTitle"><div><h3>Dealer Showcase</h3><p>Reputation here, real inventory on the website.</p></div></div><button class="btn gold" data-action="openWebsite">Browse 365 Inventory →</button></section>` : ''}
    ${problem ? renderProblem(problem) : `<section class="notice good">${hill ? 'Ease off GAS if flip risk spikes.' : 'Route clear. Tap or idle.'}</section>`}
    <section class="card">
      <div class="cardTitle"><div><h3>Drive modes</h3><p>Idle routes + Hill Climb. Shared fuel and coins.</p></div></div>
      <div class="modeChips">
        ${Object.entries(RACE_MODES).map(([key, m]) => `<button class="chip ${key === state.race.mode ? 'active' : ''}" data-action="raceMode" data-mode="${key}">${m.icon} ${m.label}</button>`).join('')}
      </div>
    </section>
    <section class="card">
      <div class="cardTitle"><div><h3>Drive upgrades</h3></div></div>
      ${UPGRADES.filter((u) => u.key !== 'supplierShelf').map(renderUpgrade).join('')}
    </section>
  `;
}

function renderProblem(problem) {
  return `<section class="card problemCard"><div class="cardTitle"><div><h3>${problem.icon} ${problem.label}</h3><p>${problem.description}</p></div></div>
    <div class="grid2">${problem.fixes.map((fix, index) => `<button class="btn red" data-action="fixProblem" data-fix="${index}"><strong>${fix.label}</strong><br><small>Costs ${fix.amount} ${fix.resource}</small></button>`).join('')}</div></section>`;
}

function renderMerge() {
  normalizeMergeState(state);
  return `
    ${tipCard('merge', 'Merge feeds the shop', 'Level 1 only from supplier. Higher parts raise idle shop income.')}
    <section class="card">
      <div class="cardTitle"><div><h2>Merge Bay</h2><p>Next drop in <b id="live-supplier">${Math.ceil(state.merge.supplierTimer)}s</b></p></div><span class="pill">${activeBoardCount(state)}/${boardLimit(state)}</span></div>
      <div class="shelf cols-${Math.min(6, shelfCapacity(state))}">
        ${state.merge.supplierSlots.map((item, index) => renderShelfSlot(item, index)).join('')}
      </div>
      <div class="grid3" style="margin-top:8px;">
        <button class="btn small primary" data-action="placeAll">Place All</button>
        <button class="btn small" data-action="autoMerge">Auto Merge</button>
        <button class="btn small red" data-action="sellSelected">Sell</button>
      </div>
    </section>
    <section class="card">
      <div class="cardTitle"><div><h3>Board</h3><p>Tap two matching levels.</p></div></div>
      <div class="board">${state.merge.board.map((item, index) => renderBoardCell(item, index)).join('')}</div>
    </section>
    <section class="card">
      ${Object.entries(CHAINS).map(([key, chain]) => {
        const unlocked = unlockedChainKeys(state).includes(key);
        return `<div class="notice ${unlocked ? 'good' : ''}" style="margin-bottom:7px;"><b>${chain.icon} ${chain.label}</b><br>${unlocked ? chain.description : 'Locked. Build it on the Lot.'}</div>`;
      }).join('')}
    </section>
  `;
}

function renderShelfSlot(item, index) {
  if (!item) return `<button class="shelfSlot"><span class="emptyText">Empty</span></button>`;
  return `<button class="shelfSlot ready" data-action="placeShelf" data-index="${index}">${renderItem(item)}</button>`;
}

function renderBoardCell(item, index) {
  if (index >= boardLimit(state) && !item) {
    return `<button class="cell locked" disabled><span class="emptyText">Locked</span></button>`;
  }
  if (!item) return `<button class="cell" data-action="cell" data-index="${index}"><span class="emptyText">Open</span></button>`;
  const selected = state.merge.selectedIndex === index ? 'selected' : '';
  return `<button class="cell ${selected} chain-${item.chain}" data-action="cell" data-index="${index}">${renderItem(item)}</button>`;
}

function renderItem(item) {
  const chain = CHAINS[item.chain];
  return `<div><span class="lvl">L${item.level}</span><div class="itemIcon">${chain.icon}</div><div class="itemName">${itemDisplayName(item)}</div><span class="chainTag">${chain.short}</span></div>`;
}

function renderLot() {
  const town = state.lotTab !== 'shop';
  return `
    ${tipCard('lot', 'Lot Town + Idle Shop', 'Tap buildings and collect. Buy shops that print coins on other screens.')}
    <div class="modeChips" style="margin-bottom:10px;">
      <button class="chip ${town ? 'active' : ''}" data-action="lotTab" data-tab="town">🏘️ Lot Town</button>
      <button class="chip ${town ? '' : 'active'}" data-action="lotTab" data-tab="shop">📈 Idle Shop</button>
    </div>
    ${town ? renderTown() : renderShop()}
    <section class="card">
      <div class="cardTitle"><div><h3>System upgrades</h3><p>Also raises merge / drive.</p></div></div>
      ${BUILDINGS.map(renderBuilding).join('')}
      ${UPGRADES.filter((u) => u.key === 'supplierShelf').map(renderUpgrade).join('')}
    </section>
  `;
}

function renderTown() {
  return `
    <section class="card">
      <div class="cardTitle"><div><h2>365 Lot Town</h2><p>Tap a plot to build. Collect idle coins.</p></div>
        <button class="btn small gold" data-action="collectLot">Collect <span id="live-lot">${fmt(state.lot.pending || 0)}</span></button>
      </div>
      <div class="lotGrid">
        ${LOT_PLOTS.map((plot) => {
          const owned = !!state.lot.owned[plot.key];
          return `<button class="lotPlot ${owned ? 'owned' : ''}" data-action="${owned ? 'collectLot' : 'buyPlot'}" data-key="${plot.key}">
            <div class="itemIcon">${plot.icon}</div>
            <b>${plot.name}</b>
            <span>${owned ? `+${plot.income}/s` : costToText(plot.cost)}</span>
            <small>${plot.unlocks}</small>
          </button>`;
        }).join('')}
      </div>
      <div class="notice good">Lot income ${fmt(lotIncomePerSec(state))}/s — also boosts Idle Shop.</div>
    </section>
  `;
}

function renderShop() {
  return `
    <section class="card">
      <div class="cardTitle"><div><h2>Idle Shop</h2><p>Runs while you merge or drive. ${fmt(shopIncomePerSec(state))}/s</p></div></div>
      ${BUSINESSES.map((biz) => {
        const owned = state.shop[biz.key] || 0;
        const cost = businessCost(state, biz);
        return `<div class="upgrade">
          <div class="upIcon">${biz.icon}</div>
          <div><h4>${biz.name} <span class="pill">x${owned}</span></h4><p>${biz.description}</p><div class="cost">${costToText(cost)}</div></div>
          <button class="btn small primary" data-action="buyBiz" data-key="${biz.key}" ${canAfford(state, cost) ? '' : 'disabled'}>Buy</button>
        </div>`;
      }).join('')}
    </section>
  `;
}

function renderUpgrade(def) {
  const level = state.upgrades[def.key] || 0;
  const cost = upgradeCost(state, def);
  return `<div class="upgrade"><div class="upIcon">${def.icon}</div><div><h4>${def.name} <span class="pill">Lv ${level}</span></h4><p>${def.description}</p><div class="cost">${costToText(cost)}</div></div>
    <button class="btn small primary" data-action="upgrade" data-key="${def.key}" ${canAfford(state, cost) ? '' : 'disabled'}>Buy</button></div>`;
}

function renderBuilding(building) {
  const level = state.buildings[building.key] || 0;
  const cost = nextBuildingCost(state, building);
  return `<div class="building"><div class="buildIcon">${building.icon}</div><div><h4>${building.name} <span class="pill">Lv ${level}/${building.max}</span></h4><p>${building.description}</p><p><b>Unlocks:</b> ${building.unlocks}</p>${cost ? `<div class="cost">${costToText(cost)}</div>` : `<div class="cost">Maxed</div>`}</div>
    <button class="btn small primary" data-action="building" data-key="${building.key}" ${cost && canAfford(state, cost) ? '' : 'disabled'}>${cost ? 'Build' : 'Done'}</button></div>`;
}

function renderProfile() {
  const objectives = getObjectiveList(state);
  const completed = objectives.filter((o) => o.done).length;
  return `
    <section class="card brandCard">
      <div class="cardTitle"><div><h2>365 Motor Sales</h2><p>Official companion.</p></div></div>
      <button class="btn gold" data-action="openWebsite">Open 365motorsales.com</button>
    </section>
    <section class="card">
      <div class="cardTitle"><div><h2>${state.playerName}</h2><p>Local save. Shared wallet across Drive, Merge, Lot, Shop.</p></div><span class="pill">Lv ${state.level}</span></div>
      ${meterLine('fill-xp', 'XP', state.xp, state.level * 80, '')}
      <div class="grid2">
        <div class="notice good"><b>${fmt(state.race.lifetimeMeters)}</b><br>Meters</div>
        <div class="notice good"><b>${state.hill.best || 0}m</b><br>Best Hill</div>
        <div class="notice"><b>${state.merge.totalMerges}</b><br>Merges</div>
        <div class="notice"><b>${completed}/${objectives.length}</b><br>Goals</div>
      </div>
    </section>
    <section class="card">
      <div class="cardTitle"><div><h3>Objectives</h3></div></div>
      ${objectives.map((o) => `<div class="objective"><div class="checkIcon">${o.done ? '✅' : '⬜'}</div><div><h4>${o.title}</h4><p>${o.body}</p></div><span class="pill">${o.done ? 'Done' : 'Open'}</span></div>`).join('')}
    </section>
    <section class="card">
      <button class="btn red" data-action="reset">Reset Local Save</button>
    </section>
  `;
}

function handlePointer(event) {
  const target = event.target.closest('[data-action="hillGas"]');
  if (!target) return;
  if (event.type === 'pointerdown') {
    if (!state.hill.running) {
      const result = startHill(state);
      if (result.message) toast(result.message);
      state.objectives.firstTap = true;
      render();
    }
    setHillGas(state, true);
  } else {
    setHillGas(state, false);
  }
}

function handleClick(event) {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  let result = null;
  if (action === 'hillGas') return;
  if (action === 'screen') {
    state.activeScreen = target.dataset.screen;
    render();
    queueSave();
    return;
  }
  if (action === 'lotTab') {
    state.lotTab = target.dataset.tab;
    render();
    return;
  }
  if (action === 'openWebsite') {
    window.open(WEBSITE_URL, '_blank', 'noopener,noreferrer');
    toast('Opening 365motorsales.com…');
    addLog('Visited 365 Motor Sales website.');
    return;
  }
  if (action === 'dismissTip') {
    if (target.dataset.tip) state.tips[target.dataset.tip] = true;
    render();
    queueSave();
    return;
  }
  if (action === 'claimOffline') {
    state.pendingOffline = null;
    toast('Offline rewards claimed.');
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
  if (action === 'placeShelf') result = placeSupplierItem(state, Number(target.dataset.index));
  if (action === 'placeAll') result = placeAllReady(state);
  if (action === 'autoMerge') result = autoMergeOnce(state);
  if (action === 'sellSelected') result = sellSelected(state);
  if (action === 'cell') result = selectOrMergeCell(state, Number(target.dataset.index));
  if (action === 'upgrade') result = buyUpgrade(state, target.dataset.key);
  if (action === 'building') result = buyBuilding(state, target.dataset.key);
  if (action === 'buyPlot') result = buyLotPlot(state, target.dataset.key);
  if (action === 'collectLot') result = collectLot(state);
  if (action === 'buyBiz') result = buyBusiness(state, target.dataset.key);
  if (action === 'claimDaily') result = claimDaily(state, target.dataset.key);
  if (action === 'reset') {
    if (confirm('Reset local save?')) {
      state = resetState();
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
