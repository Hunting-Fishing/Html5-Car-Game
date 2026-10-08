import { ObjectiveCard } from '../components/GamePanel.js';
import { ScreenFrame } from '../components/ScreenFrame.js';
import { SubTabBar } from '../components/SubTabBar.js';
import { CompactStatStrip } from '../components/CompactStatStrip.js';
import { ActionDock } from '../components/ActionDock.js';
import { getObjectiveList } from '../../systems/objectiveSystem.js';
import { DAILY_ORDERS } from '../../data/gameData.js';
import { getRaceStats } from '../../systems/raceSystem.js';

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
  const stats = getRaceStats(state);
  const recommended = recommendedActionForObjective(next);
  const recentReward = state.log?.[0] || 'Collect, merge, or upgrade to start the reward feed.';

  return ScreenFrame({
    title: 'Home',
    subtitle: 'Today, routes, and quick actions.',
    badge: 'Today',
    className: 'hubMobileHome',
    body: [
      SubTabBar({
        tabs: [
          { label: 'Today', screen: 'hub', active: true, icon: 'home' },
          { label: 'World Map', screen: 'world', icon: 'home' }
        ]
      }),
      ObjectiveCard({
        icon: 'home',
        title: next ? next.title : 'Objective Set Complete',
        subtitle: next ? 'Recommended next step' : 'Keep building the garage loop.',
        badge: next ? 'Next' : 'Done',
        heading: 'h2',
        className: 'hubMainObjective',
        body: next
          ? `
            <div class="hubObjectiveCopy">${next.body}</div>
            ${ActionDock({ actions: [recommended] })}
          `
          : `
            <div class="hubObjectiveCopy">Continue building resources, upgrades, and routes.</div>
            ${ActionDock({ actions: [{ label: 'Run Race', screen: 'race', icon: 'race', className: 'primary' }] })}
          `
      }),
      ActionDock({
        actions: [
          { label: 'Race', screen: 'race', icon: 'race', className: 'primary' },
          { label: 'Parts', screen: 'merge', icon: 'parts' },
          { label: 'Garage', screen: 'garage', icon: 'garage' },
          { label: 'World', screen: 'world', icon: 'home', className: 'gold' }
        ]
      }),
      `
        <section class="hubRouteStrip">
          <div class="hubRouteHead">
            <div><h3>Route Status</h3><p>${stats.mode.label}</p></div>
            <span class="pill">${Math.floor(state.race.progress)}/${stats.mode.stageLength}m</span>
          </div>
          ${CompactStatStrip({
            stats: [
              { label: 'Progress', value: Math.floor(state.race.progress), max: stats.mode.stageLength, tone: 'good', icon: 'race' },
              { label: 'Fuel', value: Math.round(state.race.fuel), max: stats.fuelMax, tone: state.race.fuel < 25 ? 'bad' : 'good', icon: 'fuel' },
              { label: 'Condition', value: Math.round(state.race.condition), max: stats.conditionMax, tone: state.race.condition < 25 ? 'bad' : 'good', icon: 'tools' },
              { label: 'Heat', value: Math.round(state.race.heat), max: 100, tone: 'dangerHigh', dangerHigh: true, icon: 'rep' }
            ]
          })}
        </section>
      `,
      `<div class="rewardTicker"><b>Recent</b><span>${recentReward}</span></div>`,
      `<section class="hubRouteStrip">
        <div class="hubRouteHead"><div><h3>Today's service orders</h3><p>Claim once. Resets with the local day.</p></div></div>
        ${DAILY_ORDERS.map((order) => {
          const done = order.check(state);
          const claimed = Boolean(state.daily?.claimed?.[order.key]);
          const reward = Object.entries(order.reward).map(([k, v]) => `+${v} ${k}`).join(', ');
          return `<div class="rewardTicker"><b>${order.title}</b><span>${claimed ? 'Paid' : done ? reward : 'Not finished'}</span>${done && !claimed ? `<button class="btn small gold" data-action="claimDaily" data-key="${order.key}">Claim</button>` : ''}</div>`;
        }).join('')}
        <a class="btn primary" href="https://www.365motorsales.com" target="_blank" rel="noopener">Visit 365 Motor Sales</a>
      </section>`,
      `<section class="hubRouteStrip">
        <div class="hubRouteHead"><div><h3>Showcase</h3><p>Dealer run for 365 Motor Sales. No store, no packs.</p></div></div>
        <div class="rewardTicker"><b>Dealer Showcase</b><span>Reputation route plus the live lot.</span></div>
        <button class="btn gold" data-action="openShowcase">Run Showcase</button>
        <a class="btn primary" href="https://www.365motorsales.com" target="_blank" rel="noopener">Visit 365 Motor Sales</a>
      </section>`,
      state.pendingOffline?.coins ? `<section class="hubRouteStrip">
        <div class="hubRouteHead"><div><h3>While you were away</h3><p>${Math.max(1, Math.round(state.pendingOffline.seconds / 60))}m of idle garage pay.</p></div></div>
        <div class="rewardTicker"><b>Offline</b><span>+${state.pendingOffline.coins} coins, +${state.pendingOffline.parts || 0} parts</span></div>
        <button class="btn gold" data-action="claimOffline">Collect offline pay</button>
      </section>` : ''
    ].join('')
  });
}
