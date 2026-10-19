import { ScreenFrame } from '../components/ScreenFrame.js';
import { SubTabBar } from '../components/SubTabBar.js';
import { getObjectiveList } from '../../systems/objectiveSystem.js';
import { getTotalIdlePerMinute } from '../../systems/idleLineSystem.js';
import { fmt } from '../../systems/economySystem.js';
import { UI_ICONS } from '../../data/uiIconMap.js';

function recommendedActionForObjective(objective) {
  const key = objective?.key || '';
  if (['firstMerge'].includes(key)) return { label: 'Open Parts', screen: 'merge', detail: 'Merge a pair' };
  if (['buildStorage', 'unlockPerformance', 'unlockTrack'].includes(key)) return { label: 'Open Garage', screen: 'garage', detail: 'Build the next room' };
  if (['idleLineUpgrade'].includes(key)) return { label: 'Open Supplies', screen: 'lines', detail: 'Upgrade a supply' };
  return { label: 'Open Race', screen: 'race', detail: nextTitle(objective) };
}

function nextTitle(objective) {
  return objective?.title || 'Stage map is open';
}

function formatAwayDuration(seconds = 0) {
  const mins = Math.max(1, Math.round(seconds / 60));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hrs}h ${rem}m` : `${hrs}h`;
}

function renderRichdomWelcomeBack(pending) {
  if (!pending?.coins && !pending?.parts) return '';
  const duration = formatAwayDuration(pending.seconds || 60);
  const mgrNote = pending.managerCount
    ? `${pending.managerCount} Elite Manager${pending.managerCount === 1 ? '' : 's'} working`
    : 'Offline Empire Income';
  const extraParts = pending.parts ? ` · +${fmt(pending.parts)} Parts` : '';
  return `
    <section class="adcapRow richdomWelcomeCard" aria-label="Welcome Back Offline Rewards">
      <div class="adcapIcon"><img src="${UI_ICONS.coin}" alt=""></div>
      <button class="adcapBuy" data-action="claimOffline">
        <b>WELCOME BACK!</b>
        <small>+${fmt(pending.coins || 0)} Coins${extraParts}</small>
      </button>
      <div class="adcapTrack richdomWelcomeTrack">
        <em>⏱ ${duration} · ${mgrNote}</em>
      </div>
      <button class="adcapManager richdomCollectBtn" data-action="claimOffline"><b>COLLECT</b></button>
    </section>
  `;
}

function tile(screen, icon, title, detail) {
  return `<button class="homeTile" type="button" data-action="screen" data-screen="${screen}"><img src="${icon}" alt=""><b>${title}</b><small>${detail}</small></button>`;
}

export function renderHubScreen(state) {
  const objectives = getObjectiveList(state);
  const next = objectives.find((item) => !item.done);
  const recommended = recommendedActionForObjective(next);
  const away = renderRichdomWelcomeBack(state.pendingOffline);
  const totals = getTotalIdlePerMinute(state);
  const rateEntries = Object.entries(totals);
  const empireRate = rateEntries.length
    ? rateEntries.slice(0, 3).map(([res, val]) => `+${fmt(val)} ${res}/m`).join(' · ')
    : 'Hire Managers in Supplies for 24/7 idle income';

  return ScreenFrame({
    title: 'Home',
    subtitle: `Empire Rate: ${empireRate}`,
    badge: `Stage ${state.stage || 1}`,
    className: 'hubMobileHome',
    body: `
      ${SubTabBar({
        tabs: [
          { label: 'Today', screen: 'hub', icon: 'home', active: true },
          { label: 'World Map', screen: 'world', icon: 'home' }
        ]
      })}
      ${away}
      <section class="adcapRow">
        <div class="adcapIcon"><img src="${UI_ICONS.race}" alt=""></div>
        <button class="adcapBuy" data-action="screen" data-screen="${recommended.screen}"><b>${recommended.label}</b><small>${recommended.detail}</small></button>
        <div class="adcapTrack"><em>${next ? 'Next job' : 'Ready'}</em></div>
        <button class="adcapManager" data-action="screen" data-screen="${recommended.screen}"><b>Go</b></button>
      </section>
      <button class="homeVip" type="button" data-action="screen" data-screen="vip">
        <b>VIP ${state.vipLevel || 0}</b>
        <span>Open the toolbox shop</span>
      </button>
      <div class="homeGrid">
        ${tile('race', UI_ICONS.race, 'Race', 'Stage map')}
        ${tile('lines', UI_ICONS.tools, 'Supplies', 'Stock the shop')}
        ${tile('merge', UI_ICONS.parts, 'Parts', 'Merge pairs')}
        ${tile('garage', UI_ICONS.garage, 'Garage', 'Build rooms')}
      </div>
      <a class="homeLink" href="https://www.365motorsales.com" target="_blank" rel="noopener">Visit 365 Motor Sales</a>
    `
  });
}

