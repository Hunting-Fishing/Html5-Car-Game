import { ScreenFrame } from '../components/ScreenFrame.js';
import { getObjectiveList } from '../../systems/objectiveSystem.js';
import { UI_ICONS } from '../../data/uiIconMap.js';

function recommendedActionForObjective(objective) {
  const key = objective?.key || '';
  if (['firstMerge'].includes(key)) return { label: 'Open Parts', screen: 'merge', detail: 'Merge a pair' };
  if (['buildStorage', 'unlockPerformance', 'unlockTrack'].includes(key)) return { label: 'Open Garage', screen: 'garage', detail: 'Build the next room' };
  if (['idleLineUpgrade'].includes(key)) return { label: 'Open Lines', screen: 'lines', detail: 'Upgrade a line' };
  return { label: 'Open Race', screen: 'race', detail: nextTitle(objective) };
}

function nextTitle(objective) {
  return objective?.title || 'Stage map is open';
}

function tile(screen, icon, title, detail) {
  return `<button class="homeTile" type="button" data-action="screen" data-screen="${screen}"><img src="${icon}" alt=""><b>${title}</b><small>${detail}</small></button>`;
}

export function renderHubScreen(state) {
  const objectives = getObjectiveList(state);
  const next = objectives.find((item) => !item.done);
  const recommended = recommendedActionForObjective(next);
  const away = state.pendingOffline?.coins
    ? `<section class="adcapRow"><div class="adcapIcon"><img src="${UI_ICONS.coin}" alt=""></div><button class="adcapBuy" data-action="claimOffline"><b>Collect</b><small>+${state.pendingOffline.coins} coins</small></button><div class="adcapTrack"><em>Away ${Math.max(1, Math.round((state.pendingOffline.seconds || 0) / 60))}m</em></div><button class="adcapManager" data-action="claimOffline"><b>Pay</b></button></section>`
    : '';

  return ScreenFrame({
    title: 'Home',
    subtitle: 'Collect, then pick where to work.',
    badge: `Stage ${state.stage || 1}`,
    className: 'hubMobileHome',
    body: `
      ${away}
      <section class="adcapRow">
        <div class="adcapIcon"><img src="${UI_ICONS.race}" alt=""></div>
        <button class="adcapBuy" data-action="screen" data-screen="${recommended.screen}"><b>${recommended.label}</b><small>${recommended.detail}</small></button>
        <div class="adcapTrack"><em>${next ? 'Next job' : 'Ready'}</em></div>
        <button class="adcapManager" data-action="screen" data-screen="${recommended.screen}"><b>Go</b></button>
      </section>
      <div class="homeGrid">
        ${tile('race', UI_ICONS.race, 'Race', 'Stage map')}
        ${tile('lines', UI_ICONS.garage, 'Lines', 'Run the shop')}
        ${tile('merge', UI_ICONS.parts, 'Parts', 'Merge pairs')}
        ${tile('garage', UI_ICONS.garage, 'Garage', 'Build rooms')}
      </div>
      <a class="homeLink" href="https://www.365motorsales.com" target="_blank" rel="noopener">Visit 365 Motor Sales</a>
    `
  });
}
