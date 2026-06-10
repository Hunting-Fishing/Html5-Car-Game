import './styles.css';
import { gsap } from 'gsap';
import { SCREENS, RACE_MODES, CHAINS, UPGRADES, BUILDINGS, PROBLEMS, CREATOR_RULES } from './data/gameData.js';
import { loadState, saveState, resetState } from './systems/saveSystem.js';
import { fmt, costToText, canAfford } from './systems/economySystem.js';
import { getObjectiveList, applyDerivedObjectives } from './systems/objectiveSystem.js';
import { tickSupplier, placeSupplierItem, placeAllReady, selectOrMergeCell, sellSelected, autoMergeOnce, itemDisplayName, boardLimit, activeBoardCount, shelfCapacity, normalizeMergeState, unlockedChainKeys } from './systems/mergeSystem.js';
import { tickRace, tapRace, changeRaceMode, fixProblem, getRaceStats } from './systems/raceSystem.js';
import { buyUpgrade, upgradeCost, buyBuilding, nextBuildingCost } from './systems/upgradeSystem.js';
import { mountRaceCanvas, updateRaceCanvas, pulseCar } from './ui/racePixi.js';

let state = loadState();
let lastTime = performance.now();
let renderLock = false;
let saveQueued = false;
const root = document.querySelector('#app');

boot();

function boot() {
  normalizeMergeState(state);
  renderShell();
  render();
  root.addEventListener('click', handleClick);
  requestAnimationFrame(gameLoop);
}

function gameLoop(now) {
  const dt = Math.min(2, (now - lastTime) / 1000);
  lastTime = now;
  tickRace(state, dt);
  tickSupplier(state, dt);
  applyDerivedObjectives(state);
  updateRaceCanvas(state);
  updateTopBar();

  if (!renderLock && ['race', 'hub', 'merge'].includes(state.activeScreen)) {
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
            <div class="brandText"><b>Micro Garage</b><span>Idle racing companion · local save</span></div>
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
  if (state.activeScreen === 'race') {
    el.innerHTML = renderRace();
    const host = el.querySelector('#raceCanvas');
    if (host) mountRaceCanvas(host).then(() => updateRaceCanvas(state));
  }
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
        <div><h2>Companion Loop</h2><p>This app creates micro progress for the larger 365 ecosystem.</p></div>
      </div>
      <div class="grid2">
        <button class="btn primary" data-action="screen" data-screen="race">Race / Click</button>
        <button class="btn" data-action="screen" data-screen="merge">Merge Parts</button>
        <button class="btn" data-action="screen" data-screen="garage">Build Garage</button>
        <button class="btn ghost" data-action="screen" data-screen="creator">Creator Rules</button>
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

    ${problem ? renderProblem(problem) : `<section class="notice good">Route is clear. Tap for burst income or let the idle driver continue.</section>`}

    <section class="card">
      <div class="cardTitle"><div><h3>Route Modes</h3><p>2D idle modes only. No real-time PVP.</p></div></div>
      <div class="modeChips">
        ${Object.entries(RACE_MODES).map(([key, m]) => `<button class="chip ${key === state.race.mode ? 'active' : ''}" data-action="raceMode" data-mode="${key}">${m.icon} ${m.label}</button>`).join('')}
      </div>
    </section>

    <section class="card">
      <div class="cardTitle"><div><h3>Racing Upgrades</h3><p>Idle-clicker upgrades. These should feel like Adventure Capitalist style progression, but automotive.</p></div></div>
      ${UPGRADES.filter((u) => !['supplierShelf'].includes(u.key)).map(renderUpgrade).join('')}
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

    <section class="card">
      <div class="cardTitle"><div><h3>Unlocked Chains</h3><p>Performance and Racing stay locked until the garage systems exist.</p></div></div>
      ${Object.entries(CHAINS).map(([key, chain]) => {
        const unlocked = unlockedChainKeys(state).includes(key);
        return `<div class="notice ${unlocked ? 'good' : ''}" style="margin-bottom:7px;"><b>${chain.icon} ${chain.label}</b><br>${unlocked ? chain.description : 'Locked. Build the required garage system first.'}</div>`;
      }).join('')}
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
  return `<div><span class="lvl">L${item.level}</span><div class="itemIcon">${chain.icon}</div><div class="itemName">${itemDisplayName(item)}</div><span class="chainTag">${chain.short}</span></div>`;
}

function renderGarage() {
  return `
    <section class="card">
      <div class="cardTitle"><div><h2>Build Garage Systems</h2><p>Buildings unlock mechanics. They are not just cosmetics.</p></div></div>
      ${BUILDINGS.map(renderBuilding).join('')}
    </section>
    <section class="card">
      <div class="cardTitle"><div><h3>Supplier / Merge Upgrades</h3><p>These support the merge board instead of replacing it.</p></div></div>
      ${UPGRADES.filter((u) => u.key === 'supplierShelf').map(renderUpgrade).join('')}
    </section>
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
  return `
    <div class="building">
      <div class="buildIcon">${building.icon}</div>
      <div><h4>${building.name} <span class="pill">Lv ${level}/${building.max}</span></h4><p>${building.description}</p><p><b>Unlocks:</b> ${building.unlocks}</p>${cost ? `<div class="cost">Cost: ${costToText(cost)}</div>` : `<div class="cost">Maxed</div>`}</div>
      <button class="btn small primary" data-action="building" data-key="${building.key}" ${cost && canAfford(state, cost) ? '' : 'disabled'}>${cost ? 'Build' : 'Done'}</button>
    </div>
  `;
}

function renderProfile() {
  const objectives = getObjectiveList(state);
  const completed = objectives.filter((o) => o.done).length;
  const garageValue = Math.round(state.currencies.coins + state.stage * 100 + state.merge.totalMerges * 18 + Object.values(state.buildings).reduce((a, b) => a + b, 0) * 500);
  return `
    <section class="card">
      <div class="cardTitle"><div><h2>${state.playerName}</h2><p>Local-only profile. Git repo stage. No Supabase yet.</p></div><span class="pill">Lv ${state.level}</span></div>
      ${meterLine('XP', state.xp, state.level * 80, '')}
      <div class="grid2">
        <div class="notice good"><b>${fmt(garageValue)}</b><br>Garage Value</div>
        <div class="notice good"><b>${fmt(state.race.lifetimeMeters)}</b><br>Lifetime Meters</div>
        <div class="notice"><b>${state.merge.totalMerges}</b><br>Total Merges</div>
        <div class="notice"><b>${completed}/${objectives.length}</b><br>Objectives</div>
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
