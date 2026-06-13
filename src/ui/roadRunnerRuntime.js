import Phaser from 'phaser';
import { ROUTES, GHOST_MODES, START_ROUTE, START_GHOST_MODE } from '../game/roadRunner/config.js';
import { HillRouteScene } from '../game/roadRunner/HillRouteScene.js';
import { loadRoadRunnerSave, formatSmall } from '../game/roadRunner/save.js';

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
  text('[data-rr-distance]', `${Math.floor(stats.distance || 0)}m`);
  text('[data-rr-fuel]', `${Math.max(0, Math.floor(stats.energy ?? 100))}%`);
  text('[data-rr-coins]', formatSmall(saveData.coins));
  text('[data-rr-best]', `${formatSmall(saveData.bestDistance)}m`);
  text('[data-rr-route]', ROUTES[activeRoute].label);
  text('[data-rr-mode]', GHOST_MODES[activeGhostMode].label);
}

function shellHtml() {
  return `
    <section class="card roadRunnerShell">
      <div class="roadRunnerHeader">
        <h2>365 Hill Route — Ghost Mode MVP</h2>
        <p>Simple 2D side-scroll route game. Left slows. Right pushes forward. Ghosts are replay/computer opponents, not live multiplayer.</p>
      </div>
      <div class="roadRunnerHud">
        <div class="roadRunnerStat"><b data-rr-distance>0m</b><span>Distance</span></div>
        <div class="roadRunnerStat"><b data-rr-fuel>100%</b><span>Energy</span></div>
        <div class="roadRunnerStat"><b data-rr-coins>${formatSmall(saveData.coins)}</b><span>Coins</span></div>
        <div class="roadRunnerStat"><b data-rr-best>${formatSmall(saveData.bestDistance)}m</b><span>Best</span></div>
      </div>
      <div class="roadRunnerGameFrame">
        <div id="roadRunnerGameHost"></div>
        <div class="roadRunnerOverlay">
          <div class="roadRunnerBadge" data-rr-route>${ROUTES[activeRoute].label}</div>
          <div class="roadRunnerBadge" data-rr-mode>${GHOST_MODES[activeGhostMode].label}</div>
        </div>
      </div>
      <div class="roadRunnerControls">
        <button class="roadRunnerPedal brake" data-rr-control="slow">SLOW</button>
        <button class="roadRunnerPedal gas" data-rr-control="push">PUSH</button>
      </div>
      <section class="roadRunnerPanel">
        <div class="roadRunnerPanelTitle"><h3>Ghost Mode</h3><button class="btn primary" onclick="window.restartHillRoute?.()">Restart</button></div>
        <div class="roadRunnerModeGrid">
          ${Object.entries(GHOST_MODES).map(([key, value]) => `<button class="btn ${key === activeGhostMode ? 'primary' : 'ghost'}" onclick="window.setHillGhosts?.('${key}')">${value.label}</button>`).join('')}
        </div>
      </section>
      <section class="roadRunnerPanel">
        <div class="roadRunnerPanelTitle"><h3>Routes</h3><span class="roadRunnerNotice">Single-player first. Ghost mode gives a 1-4 racer feel.</span></div>
        <div class="roadRunnerModeGrid">
          ${Object.entries(ROUTES).map(([key, value]) => `<button class="btn ${key === activeRoute ? 'gold' : 'ghost'}" onclick="window.setHillRoute?.('${key}')">${value.label}</button>`).join('')}
        </div>
      </section>
    </section>
  `;
}

function bindControls() {
  document.querySelectorAll('[data-rr-control]').forEach((button) => {
    const control = button.getAttribute('data-rr-control');
    const down = (event) => {
      event.preventDefault();
      if (activeScene) activeScene.controls[control] = true;
      button.classList.add('active');
    };
    const up = (event) => {
      event.preventDefault();
      if (activeScene) activeScene.controls[control] = false;
      button.classList.remove('active');
    };
    button.addEventListener('pointerdown', down);
    button.addEventListener('pointerup', up);
    button.addEventListener('pointercancel', up);
    button.addEventListener('pointerleave', up);
  });
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

  game.events.once('ready', () => {
    const scene = game.scene.getScene('HillRouteScene');
    activeScene = scene;
  });

  game.scene.start('HillRouteScene', {
    routeKey: activeRoute,
    ghostKey: activeGhostMode,
    saveData,
    onHud: updateHud
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

function inject() {
  const screen = document.querySelector('#screen-race.active');
  if (!screen) return;
  requestAnimationFrame(() => mountRoadRunner(false));
}

const observer = new MutationObserver(() => inject());
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.addEventListener('load', inject);
document.addEventListener('click', () => requestAnimationFrame(inject));
