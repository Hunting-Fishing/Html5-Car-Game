import { ObjectiveCard } from '../components/GamePanel.js';
import { ScreenFrame } from '../components/ScreenFrame.js';
import { SubTabBar } from '../components/SubTabBar.js';
import { CompactStatStrip } from '../components/CompactStatStrip.js';
import { ActionDock } from '../components/ActionDock.js';
import { getObjectiveList } from '../../systems/objectiveSystem.js';
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
      `<div class="rewardTicker"><b>Recent</b><span>${recentReward}</span></div>`
    ].join('')
  });
}
