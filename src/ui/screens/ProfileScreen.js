import { renderIconImage } from '../components/GamePanel.js';
import { ScreenFrame } from '../components/ScreenFrame.js';
import { SubTabBar } from '../components/SubTabBar.js';
import { ActionDock } from '../components/ActionDock.js';
import { meterLine } from '../components/StatMeter.js';
import { fmt } from '../../systems/economySystem.js';
import { getObjectiveList } from '../../systems/objectiveSystem.js';
import { DAILY_ORDERS } from '../../data/gameData.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderObjectiveStatusIcon(done) {
  const icon = done ? '/assets/ui/icons/rep.png' : '/assets/ui/icons/menu.png';
  return renderIconImage(icon, done ? 'Objective complete' : 'Objective open', 'checkIconImg', done ? 'OK' : '--');
}

function compactStat(value, label, tone = '') {
  return `<div class="menuStat ${tone}"><b>${escapeHtml(value)}</b><span>${escapeHtml(label)}</span></div>`;
}

export function renderProfileScreen(state) {
  const objectives = getObjectiveList(state);
  const nextObjective = objectives.find((item) => !item.done);
  const doneCount = objectives.filter((item) => item.done).length;
  const garageValue = Math.round(
    state.currencies.coins +
    state.stage * 100 +
    state.merge.totalMerges * 18 +
    Object.values(state.buildings).reduce((a, b) => a + b, 0) * 500 +
    state.idleLines.lifetimeCollections * 12
  );

  return ScreenFrame({
    title: 'Menu',
    subtitle: 'Profile, settings, and creator tools.',
    badge: `Lv ${state.level}`,
    className: 'menuCompactFrame',
    body: `
      ${SubTabBar({
        tabs: [
          { label: 'Profile', screen: 'profile', active: true, icon: 'profile' },
          { label: 'Creator Rules', screen: 'creator', icon: 'menu' },
          { label: 'Home', screen: 'hub', icon: 'home' }
        ]
      })}

      <section class="menuProfileHero assetFrame profilePanel">
        <div class="menuProfileHead"><div><h3>Today</h3><p>Daily orders live here, not on top of the screens.</p></div></div>
        ${DAILY_ORDERS.map((order) => {
          const done = order.check(state);
          const claimed = Boolean(state.daily?.claimed?.[order.key]);
          const status = claimed ? 'Paid' : done ? 'Ready' : 'Open';
          const claim = done && !claimed ? `<button class="btn small gold" data-action="claimDaily" data-key="${order.key}">Claim</button>` : '';
          return `<div class="rewardTicker menuRouteRow"><button type="button" data-action="screen" data-screen="${order.screen}" ${order.raceTab ? `data-rr-tab="${order.raceTab}"` : ''}><b>${escapeHtml(order.title)}</b><span>${status}</span><small>Go</small></button>${claim}</div>`;
        }).join('')}
      </section>

      <section class="menuProfileHero assetFrame profilePanel">
        <div class="menuProfileHead">
          <span class="gameIconBadge">${renderIconImage('/assets/ui/icons/profile.png', 'Profile icon', 'gameIconBadgeImg', 'P')}</span>
          <div>
            <h3>${escapeHtml(state.playerName)}</h3>
            <p>Local save profile. No Supabase yet.</p>
          </div>
          <span class="pill">Stage ${state.stage}</span>
        </div>
        ${meterLine('XP', state.xp, state.level * 80, '')}
        <div class="menuStatGrid">
          ${compactStat(fmt(garageValue), 'Garage Value', 'good')}
          ${compactStat(fmt(state.race.lifetimeMeters), 'Meters')}
          ${compactStat(String(state.merge.totalMerges), 'Merges')}
          ${compactStat(fmt(state.idleLines.lifetimeCollections), 'Line Collects')}
        </div>
      </section>

      <section class="menuActionDock assetBottomSheet">
        ${ActionDock({
          actions: [
            { label: 'Creator Rules', screen: 'creator', icon: 'menu' },
            { label: 'World Map', screen: 'world', icon: 'home', className: 'primary' },
            { label: 'Business Lines', screen: 'lines', icon: 'parts', className: 'gold' },
            { label: 'Reset Save', action: 'reset', icon: 'tools', className: 'red' }
          ]
        })}
      </section>

      <section id="profile-settings" class="menuSettingsStrip assetPanel settingsPanel">
        <button type="button" data-action="screen" data-screen="profile"><b>Local Save</b><span>Stay on this profile</span></button>
        <button type="button" data-action="screenToggle"><b>Fullscreen</b><span>Open the full screen</span></button>
        <button type="button" data-action="screen" data-screen="creator"><b>Creator</b><span>Open the rules</span></button>
        <button type="button" class="danger" data-action="reset"><b>Reset</b><span>Clear this test profile</span></button>
      </section>

      <section class="menuObjectiveCompact assetPanel">
        <div class="menuObjectiveHead">
          <div>
            <h3>Next Objective</h3>
            <p>${nextObjective ? escapeHtml(nextObjective.title) : 'Objective set complete'}</p>
          </div>
          <span class="pill">${doneCount}/${objectives.length}</span>
        </div>
        <button class="menuObjectiveRow" type="button" data-action="screen" data-screen="${nextObjective?.screen || 'hub'}" ${nextObjective?.raceTab ? `data-rr-tab="${nextObjective.raceTab}"` : ''}>
          <span class="checkIcon">${renderObjectiveStatusIcon(!nextObjective)}</span>
          <span>${nextObjective ? escapeHtml(nextObjective.body) : 'Keep racing, merging, and building.'}</span>
          <small>Go</small>
        </button>
        <div class="menuObjectiveDots" aria-label="Objective progress">${objectives.map((objective) => `<span class="${objective.done ? 'done' : ''}"></span>`).join('')}</div>
      </section>
    `
  });
}
