import { ScreenFrame } from '../components/ScreenFrame.js';
import { getObjectiveList } from '../../systems/objectiveSystem.js';

function recommendedActionForObjective(objective) {
  const key = objective?.key || '';
  if (['firstMerge'].includes(key)) return { label: 'Open Parts', screen: 'merge', icon: 'parts', className: 'primary' };
  if (['buildStorage', 'unlockPerformance', 'unlockTrack'].includes(key)) return { label: 'Open Garage', screen: 'garage', icon: 'garage', className: 'primary' };
  if (['idleLineUpgrade'].includes(key)) return { label: 'Open Lines', screen: 'lines', icon: 'garage', className: 'gold' };
  if (['firstTap', 'previewGhostRace', 'fixProblem', 'stageFive'].includes(key)) return { label: 'Open Race', screen: 'race', icon: 'race', className: 'primary' };
  return { label: 'Open Race', screen: 'race', icon: 'race', className: 'primary' };
}

export function renderHubScreen(state) {
  const objectives = getObjectiveList(state);
  const next = objectives.find((item) => !item.done);
  const recommended = recommendedActionForObjective(next);

  return ScreenFrame({
    title: 'Home',
    subtitle: 'Claim what is ready, then run the shop.',
    badge: 'Today',
    className: 'hubMobileHome',
    body: [
      state.pendingOffline?.coins ? `<section class="adcapRow"><div class="adcapIcon"><b>$</b></div><button class="adcapBuy" data-action="claimOffline"><b>Collect</b><small>+${state.pendingOffline.coins} coins</small></button><div class="adcapTrack"><em>Away ${Math.max(1, Math.round(state.pendingOffline.seconds / 60))}m</em></div><button class="adcapManager" data-action="claimOffline"><b>Pay</b></button></section>` : '',
      `<section class="adcapRow"><div class="adcapIcon"><b>Go</b></div><button class="adcapBuy" data-action="screen" data-screen="${recommended.screen}"><b>${recommended.label}</b><small>${next ? next.title : 'Shop is running'}</small></button><div class="adcapTrack"><em>Next</em></div><button class="adcapManager" data-action="screen" data-screen="lines"><b>Lines</b></button></section>`,
      `<a class="btn primary" href="https://www.365motorsales.com" target="_blank" rel="noopener">Visit 365 Motor Sales</a>`
    ].join('')
  });
}
