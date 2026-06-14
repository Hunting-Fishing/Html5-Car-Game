import Phaser from 'phaser';
import { ROUTES, GHOST_MODES, START_ROUTE, START_GHOST_MODE } from '../game/roadRunner/config.js';
import { HillRouteScene } from '../game/roadRunner/HillRouteScene.js';
import { loadRoadRunnerSave, saveRoadRunner, formatSmall } from '../game/roadRunner/save.js';
import { UPGRADE_CATALOG, buyUpgrade, upgradeCost } from '../game/roadRunner/upgrades.js';

let game = null;
let activeScene = null;
let mountedHost = null;
let activeRoute = START_ROUTE;
let activeGhostMode = START_GHOST_MODE;
let saveData = loadRoadRunnerSave();

function text(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function updateHud(stats = {}) {
  const maxEnergy = stats.maxEnergy || 100;
  const energyPercent = Math.max(0, Math.min(100, ((stats.energy ?? maxEnergy) / maxEnergy) * 100));
  text('[data-rr-distance]', `${Math.floor(stats.distance || 0)}m`);
  text('[data-rr-fuel]', `${Math.floor(energyPercent)}%`);
  text('[data-rr-coins]', formatSmall(saveData.coins));
  text('[data-rr-parts]', formatSmall(saveData.parts));
  text('[data-rr-best]', `${formatSmall(saveData.bestDistance)}m`);
  text('[data-rr-route]', ROUTES[activeRoute].label);
  text('[data-rr-mode]', GHOST_MODES[activeGhostMode].label);
  renderGaragePanel();
}

function upgradeButtonHtml(item) {
  const level = saveData.upgrades[item.key] || 1;
  const maxed = level >= item.maxLevel;
  const cost = upgradeCost(item.key, level);
  const affordable = !maxed && saveData.coins >= cost.coins && saveData.parts >= cost.parts;
  const buttonClass = affordable ? 'primary' : 'ghost';
  const costText = maxed ? 'MAX' : `${formatSmall(cost.coins)} coins • ${cost.parts} parts`;

  return `
    <div class="roadRunnerUpgradeCard">
      <h4>${item.label} Lv.${level}</h4>
      <p>${item.description}</p>
      <div class="roadRunnerUpgradeMeta"><span>${maxed ? 'Max Level' : `Next Lv.${level + 1}`}</span><span>${costText}</span></div>
      <button class="btn ${buttonClass}" ${affordable ? '' : 'disabled'} onclick="window.buyRoadRunnerUpgrade?.('${item.key}')">${maxed ? 'Maxed' : 'Upgrade'}</button>
    </div>
  `;
}

function renderGaragePanel() {
  const panel = document.querySelector('[data-road-runner-garage]');
  if (!panel) return;
  panel.innerHTML = `
    <div class="roadRunnerPanelTitle"><h3>Garage Upgrades</h3><span class="roadRunnerNotice">Run → earn → upgrade → go farther.</span></div>
    <div class="roadRunnerWalletRow">
      <div class="roadRunnerWalletPill">Coins: ${formatSmall(saveData.coins)}</div>
      <div class="roadRunnerWalletPill">Parts: ${formatSmall(saveData.parts)}</div>
    </div>
    <div class="roadRunnerGarageGrid">
      ${Object.values(UPGRADE_CATALOG).map(upgradeButtonHtml).join('')}
    </div>
  `;
}

function shellHtml() {
  return `
    <section class="card roadRunnerShell">
      <div class="roadRunnerHeader">
        <h2>365 Hill Route — Playable Mobile Controls</h2>
        <p>Hold GAS to drive. Hold BRAKE to slow and balance. Controls stay on top of the game frame for mobile play.</p>
      </div>
      <div class="roadRunnerHud">
        <div class="roadRunnerStat"><b data-rr-distance>0m</b><span>Distance</span></div>
        <div class="roadRunnerStat"><b data-rr-fuel>100%</b><span>Energy</span></div>
        <div class="roadRunnerStat"><b data-rr-coins>${formatSmall(saveData.coins)}</b><span>Coins</span></div>
        <div class="roadRunnerStat"><b data-rr-parts>${formatSmall(saveData.parts)}</b><span>Parts</span></div>
        <div class="roadRunnerStat"><b data-rr-best>${formatSmall(saveData.bestDistance)}m</b><span>Best</span></div>
      </div>
      <div class="roadRunnerGameFrame">
        <div id="roadRunnerGameHost"></div>
        <div class="roadRunnerOverlay">
          <div class="roadRunnerBadge" data-rr-route>${ROUTES[activeRoute].label}</div>
          <div class="roadRunnerBadge" data-rr-mode>${GHOST_MODES[activeGhostMode].label}</div>
        </div>
        <div class="roadRunnerControlHint">Hold GAS to move. Hold BRAKE for control. Keyboard: → / ←</div>
        <div class="roadRunnerControls">
          <button class="roadRunnerPedal brake" data-rr-control="slow">BRAKE</button>
          <button class="roadRunnerPedal gas" data-rr-control="push">GAS</button>
        </div>
      </div>
      <section class="roadRunnerPanel">
        <div class="roadRunnerPanelTitle"><h3>Ghost Mode</h3><button class="btn primary" onclick="window.restartHillRoute?.()">Restart</button></div>
        <div class="roadRunnerModeGrid">
          ${Object.entries(GHOST_MODES).map(([key, value]) => `<button class="btn ${key === activeGhostMode ? 'primary' : 'ghost'}" onclick="window.setHillGhosts?.('${key}')">${value.label}</button>`).join('')}
        </div>
      </section>
      <section class="roadRunnerPanel">
        <div class="roadRunnerPanelTitle"><h3>Routes</h3><span class="roadRunnerNotice">More routes later unlock by stage/rep.</span></div>
        <div class="roadRunnerModeGrid">
          ${Object.entries(ROUTES).map(([key, value]) => `<button class="btn ${key === activeRoute ? 'gold' : 'ghost'}" onclick="window.setHillRoute?.('${key}')">${value.label}</button>`).join('')}
        </div>
      </section>
      <section class="roadRunnerPanel" data-road-runner-garage></section>
    </section>
  `;
}

function setSceneControl(control, isActive) {
  if (activeScene) activeScene.controls[control] = isActive;
  document.querySelector(`[data-rr-control="${control}"]`)?.classList.toggle('active', isActive);
}

function bindControls() {
  document.querySelectorAll('[data-rr-control]').forEach((button) => {
    const control = button.getAttribute('data-rr-control');
    const down = (event) => {
      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);
      setSceneControl(control, true);
    };
    const up = (event) => {
      event.preventDefault();
      setSceneControl(control, false);
    };
    button.addEventListener('pointerdown', down, { passive: false });
    button.addEventListener('pointerup', up, { passive: false });
    button.addEventListener('pointercancel', up, { passive: false });
    button.addEventListener('pointerleave', up, { passive: false });
  });

  window.onkeydown = (event) => {
    if (!document.querySelector('#screen-race.active')) return;
    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') setSceneControl('push', true);
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') setSceneControl('slow', true);
  };
  window.onkeyup = (event) => {
    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') setSceneControl('push', false);
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') setSceneControl('slow', false);
  };
}

function startGame() {
  const host = document.querySelector('#roadRunnerGameHost');
  if (!host) return;

  if (game) {
    game.destroy(true);
    game = null;
    activeScene = null;
  }

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: host,
    width: host.clientWidth || 420,
    height: host.clientHeight || 340,
    backgroundColor: '#8bdcff',
    scene: HillRouteScene,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  });

  game.scene.start('HillRouteScene', {
    routeKey: activeRoute,
    ghostKey: activeGhostMode,
    saveData,
    onHud: updateHud,
    onReady: (scene) => {
      activeScene = scene;
    }
  });
}

function mountRoadRunner(force = false) {
  const screen = document.querySelector('#screen-race.active');
  if (!screen) return;

  if (force || !screen.querySelector('.roadRunnerShell')) {
    if (game) {
      game.destroy(true);
      game = null;
      activeScene = null;
    }
    saveData = loadRoadRunnerSave();
    screen.innerHTML = shellHtml();
    mountedHost = null;
  }

  const host = screen.querySelector('#roadRunnerGameHost');
  if (!host || mountedHost === host) return;
  mountedHost = host;
  bindControls();
  updateHud();
  renderGaragePanel();
  startGame();
}

window.restartHillRoute = () => mountRoadRunner(true);
window.setHillGhosts = (mode) => {
  if (!GHOST_MODES[mode]) return;
  activeGhostMode = mode;
  mountRoadRunner(true);
};
window.setHillRoute = (route) => {
  if (!ROUTES[route]) return;
  activeRoute = route;
  mountRoadRunner(true);
};
window.buyRoadRunnerUpgrade = (key) => {
  saveData = loadRoadRunnerSave();
  const result = buyUpgrade(saveData, key);
  if (!result.ok) return;
  saveRoadRunner(saveData);
  updateHud();
  renderGaragePanel();
  mountRoadRunner(true);
};

function inject() {
  const screen = document.querySelector('#screen-race.active');
  if (!screen) return;
  requestAnimationFrame(() => mountRoadRunner(false));
}

const observer = new MutationObserver(() => inject());
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.addEventListener('load', inject);
document.addEventListener('click', () => requestAnimationFrame(inject));
