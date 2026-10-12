import { renderIconImage, renderFlatDataIcon } from '../components/GamePanel.js';
import { ScreenFrame } from '../components/ScreenFrame.js';
import { meterLine } from '../components/StatMeter.js';
import { fmt } from '../../systems/economySystem.js';
import { getObjectiveList } from '../../systems/objectiveSystem.js';
import { DAILY_ORDERS } from '../../data/gameData.js';
import { soundEnabled } from '../sfx.js';

const MENU_TABS = [
  { id: 'today', label: 'Today', icon: 'coin' },
  { id: 'driver', label: 'Driver', icon: 'profile' },
  { id: 'go', label: 'Go', icon: 'race' },
  { id: 'settings', label: 'Settings', icon: 'tools' }
];

let menuTab = 'today';
let resetArmed = false;

export function setMenuTab(tab) {
  menuTab = MENU_TABS.some((item) => item.id === tab) ? tab : 'today';
  if (menuTab !== 'settings') resetArmed = false;
}

export function armMenuReset() {
  resetArmed = true;
}

export function disarmMenuReset() {
  resetArmed = false;
}

export function isMenuResetArmed() {
  return resetArmed;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#39;');
}

function renderObjectiveStatusIcon(done) {
  const icon = done ? '/assets/ui/icons/rep.png' : '/assets/ui/icons/menu.png';
  return renderIconImage(icon, done ? 'Objective complete' : 'Objective open', 'checkIconImg', done ? 'OK' : '--');
}

function compactStat(value, label, tone = '') {
  return `<div class="menuStat ${tone}"><b>${escapeHtml(value)}</b><span>${escapeHtml(label)}</span></div>`;
}

function todayPane(state) {
  return `<section class="menuPaneCard">
    <div class="menuProfileHead"><div><h3>Today</h3><p>Finish an order, then claim it here.</p></div></div>
    ${DAILY_ORDERS.map((order) => {
      const done = order.check(state);
      const claimed = Boolean(state.daily?.claimed?.[order.key]);
      const status = claimed ? 'Paid' : done ? 'Ready' : 'Open';
      const claim = done && !claimed ? `<button class="btn small gold" data-action="claimDaily" data-key="${order.key}">Claim</button>` : '';
      return `<div class="rewardTicker menuRouteRow"><button type="button" data-action="screen" data-screen="${order.screen}" ${order.raceTab ? `data-rr-tab="${order.raceTab}"` : ''}><b>${escapeHtml(order.title)}</b><span>${status}</span><small>Go</small></button>${claim}</div>`;
    }).join('')}
  </section>`;
}

function driverPane(state, garageValue, objectives, nextObjective, doneCount) {
  return `<section class="menuPaneCard">
    <div class="menuProfileHead">
      <span class="gameIconBadge">${renderIconImage('/assets/ui/icons/profile.png', 'Profile icon', 'gameIconBadgeImg', 'P')}</span>
      <div>
        <h3>${escapeHtml(state.playerName)}</h3>
        <p>Saved on this device.</p>
      </div>
      <span class="pill">Stage ${state.stage}</span>
    </div>
    ${meterLine('XP', state.xp, state.level * 80, '')}
    <div class="menuStatGrid">
      ${compactStat(fmt(garageValue), 'Garage Value', 'good')}
      ${compactStat(fmt(state.race.lifetimeMeters), 'Meters')}
      ${compactStat(String(state.merge.totalMerges), 'Merges')}
      ${compactStat(fmt(state.idleLines.lifetimeCollections), 'Supplies')}
    </div>
    <button class="menuObjectiveRow" type="button" data-action="screen" data-screen="${nextObjective?.screen || 'hub'}" ${nextObjective?.raceTab ? `data-rr-tab="${nextObjective.raceTab}"` : ''}>
      <span class="checkIcon">${renderObjectiveStatusIcon(!nextObjective)}</span>
      <span><b>${nextObjective ? escapeHtml(nextObjective.title) : 'Set complete'}</b><small>${nextObjective ? escapeHtml(nextObjective.body) : 'Keep racing, merging, and building.'}</small></span>
      <em>${doneCount}/${objectives.length}</em>
    </button>
  </section>`;
}

function goPane() {
  const spots = [
    ['race', 'drive', 'Race'],
    ['world', '', 'World'],
    ['staff', '', 'Staff'],
    ['lines', '', 'Supplies'],
    ['merge', '', 'Merge'],
    ['garage', '', 'Build'],
    ['hub', '', 'Home']
  ];
  return `<section class="menuGoGrid">${spots.map(([screen, raceTab, label]) => `<button type="button" data-action="screen" data-screen="${screen}" ${raceTab ? `data-rr-tab="${raceTab}"` : ''}><b>${label}</b></button>`).join('')}</section>`;
}

function settingsPane() {
  const soundOn = soundEnabled();
  const fullscreen = typeof document !== 'undefined' && Boolean(document.fullscreenElement);
  const reset = resetArmed
    ? `<div class="setupWarn">
        <b>Erase this save?</b>
        <p>Coins, garage, lines, and menu progress on this device will be deleted. This cannot be undone.</p>
        <div>
          <button type="button" data-action="menuResetCancel">Cancel</button>
          <button type="button" class="danger" data-action="resetConfirm">Erase save</button>
        </div>
      </div>`
    : `<button type="button" class="setupRow danger" data-action="menuResetArm"><b>Reset save</b><span>Asks again before anything is deleted</span><em>Locked</em></button>`;
  return `<section class="menuSetup">
    <button type="button" class="setupRow" data-action="menuSound"><b>Sound</b><span>Engine, tires, and rewards</span><em class="${soundOn ? 'on' : ''}">${soundOn ? 'On' : 'Off'}</em></button>
    <button type="button" class="setupRow" data-action="screenToggle"><b>Fullscreen</b><span>Use the whole screen</span><em class="${fullscreen ? 'on' : ''}">${fullscreen ? 'On' : 'Off'}</em></button>
    <div class="setupRow"><b>Save</b><span>Stored on this device only</span><em>Local</em></div>
    ${reset}
  </section>`;
}

export function renderProfileScreen(state) {
  const objectives = getObjectiveList(state);
  const nextObjective = objectives.find((item) => !item.done);
  const doneCount = objectives.filter((item) => item.done).length;
  const readyOrders = DAILY_ORDERS.filter((order) => order.check(state) && !state.daily?.claimed?.[order.key]).length;
  const garageValue = Math.round(
    state.currencies.coins +
    state.stage * 100 +
    state.merge.totalMerges * 18 +
    Object.values(state.buildings).reduce((a, b) => a + b, 0) * 500 +
    state.idleLines.lifetimeCollections * 12
  );
  const panes = {
    today: todayPane(state),
    driver: driverPane(state, garageValue, objectives, nextObjective, doneCount),
    go: goPane(),
    settings: settingsPane()
  };

  return ScreenFrame({
    title: 'Menu',
    badge: `Lv ${state.level}`,
    className: 'menuCompactFrame',
    body: `
      <div class="gameMenu">
        <nav class="gameMenuTabs" role="tablist">
          ${MENU_TABS.map((tab) => `<button type="button" role="tab" class="${menuTab === tab.id ? 'active' : ''}" data-action="menuTab" data-tab="${tab.id}" aria-selected="${menuTab === tab.id}">${renderFlatDataIcon(tab.icon, tab.label, 'menuTabIcon')}<span>${tab.label}</span>${tab.id === 'today' && readyOrders ? `<i>${readyOrders}</i>` : ''}</button>`).join('')}
          <button type="button" data-action="screen" data-screen="staff">${renderFlatDataIcon('profile', 'Staff', 'menuTabIcon')}<span>Staff</span></button>
        </nav>
        <div class="gameMenuPane">${panes[menuTab] || panes.today}</div>
      </div>
    `
  });
}
