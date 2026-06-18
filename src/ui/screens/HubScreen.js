import { RACE_MODES } from '../../data/gameData.js';
import { GamePanel, ObjectiveCard, RewardPanel, RouteCard } from '../components/GamePanel.js';
import { meterLine } from '../components/StatMeter.js';
import { fmt } from '../../systems/economySystem.js';
import { getObjectiveList } from '../../systems/objectiveSystem.js';
import { getRaceStats } from '../../systems/raceSystem.js';
import { getTotalIdlePerMinute } from '../../systems/idleLineSystem.js';

export function renderHubScreen(state) {
  const objectives = getObjectiveList(state);
  const next = objectives.find((item) => !item.done);
  const stats = getRaceStats(state);
  const totals = getTotalIdlePerMinute(state);
  const idleOutput = Object.entries(totals).length
    ? Object.entries(totals).map(([key, value]) => `<div class="notice good"><b>${fmt(value)}</b><br>${key}/min</div>`).join('')
    : `<div class="notice">Upgrade an idle line to begin output.</div>`;

  return [
    GamePanel({
      icon: 'home',
      title: 'Home',
      subtitle: 'Home is grouped into Today and the World Map.',
      badge: 'Home Group',
      className: 'screenGroupPanel homeGroupPanel',
      body: `
        <div class="screenSubTabs" role="tablist" aria-label="Home sections">
          <button class="btn primary active" type="button" data-action="screen" data-screen="hub" aria-current="page">Today</button>
          <button class="btn" type="button" data-action="screen" data-screen="world">World Map</button>
        </div>
      `
    }),
    ObjectiveCard({
      icon: 'home',
      title: "Today's Goal",
      subtitle: 'Clear objectives keep this feeling like a mobile idle game.',
      badge: next ? 'Next' : 'Complete',
      heading: 'h2',
      body: next
        ? `<div class="notice good"><b>${next.title}</b><br>${next.body}</div>`
        : `<div class="notice good"><b>Objective set complete.</b><br>Continue building resources, upgrades, and routes.</div>`
    }),
    GamePanel({
      icon: 'home',
      title: 'Playable Auto World',
      subtitle: 'Tap buildings, roads, repair shops, dealers, and roadside events.',
      heading: 'h2',
      body: `
        <div class="grid2">
          <button class="btn primary" data-action="screen" data-screen="world">Open World Map</button>
          <button class="btn gold" data-action="screen" data-screen="lines">Upgrade Lines</button>
          <button class="btn" data-action="screen" data-screen="garage">Auto Shop</button>
          <button class="btn ghost" data-action="screen" data-screen="merge">Merge Parts</button>
        </div>
      `
    }),
    RewardPanel({
      icon: 'coin',
      title: 'Idle Output / Minute',
      subtitle: 'Managers automate lines. Manual collect is required until then.',
      body: `<div class="grid2">${idleOutput}</div>`
    }),
    RouteCard({
      icon: 'race',
      title: 'Route Status',
      subtitle: `${RACE_MODES[state.race.mode].label} - ${RACE_MODES[state.race.mode].description}`,
      badge: `${Math.floor(state.race.progress)}/${stats.mode.stageLength}m`,
      body: `
        ${meterLine('Progress', state.race.progress, stats.mode.stageLength, '')}
        ${meterLine('Fuel', state.race.fuel, stats.fuelMax, state.race.fuel < 25 ? 'red' : 'yellow')}
        ${meterLine('Condition', state.race.condition, stats.conditionMax, state.race.condition < 25 ? 'red' : '')}
        ${meterLine('Heat', state.race.heat, 100, state.race.heat > 70 ? 'red' : 'yellow')}
      `
    }),
    GamePanel({
      icon: 'menu',
      title: 'Reward Feed',
      subtitle: 'Recent rewards, fixes, upgrades, and unlocks.',
      body: state.log.slice(0, 8).map((line) => `<div class="logLine">${line}</div>`).join('') || `<div class="logLine">No rewards yet. Collect, merge, or upgrade to start the feed.</div>`
    })
  ].join('');
}
