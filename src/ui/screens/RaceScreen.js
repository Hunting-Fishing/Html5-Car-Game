import { PROBLEMS, RACE_MODES, UPGRADES } from '../../data/gameData.js';
import { GamePanel, ProblemAlert, RewardPanel, RouteCard, renderDataIcon } from '../components/GamePanel.js';
import { UpgradeCard } from '../components/UpgradeCard.js';
import { meterLine } from '../components/StatMeter.js';
import { costToText, canAfford } from '../../systems/economySystem.js';
import { getRaceStats } from '../../systems/raceSystem.js';
import { upgradeCost } from '../../systems/upgradeSystem.js';

function upgradeIconKey(def) {
  const byKey = {
    tapCrew: 'race',
    idleDriver: 'tools',
    routeScout: 'race',
    fuelPlan: 'coin',
    pitKit: 'tools',
    supplierShelf: 'parts'
  };
  return byKey[def.key] || def.resource || 'tools';
}

function renderInlineDataIcon(data, label, className = 'inlineAssetIcon') {
  return renderDataIcon(data, `${label} icon`, className);
}

function renderLabeledDataIcon(data, label, className = 'chipIcon') {
  return `<span class="assetIconLabel">${renderInlineDataIcon(data, label, className)}<span>${label}</span></span>`;
}

export function renderRaceScreen(state) {
  const mode = RACE_MODES[state.race.mode];
  const stats = getRaceStats(state);
  const problem = state.race.problem ? PROBLEMS[state.race.problem] : null;
  return `
    ${RouteCard({
      icon: 'race',
      title: 'Idle Racing',
      subtitle: 'The enemy is fuel, breakdowns, heat, traffic, and route cost.',
      badge: mode.label,
      heading: 'h2',
      body: `
        <div class="raceCanvas" id="raceCanvas"></div>
        ${meterLine('Progress', state.race.progress, stats.mode.stageLength, '')}
        ${meterLine('Fuel', state.race.fuel, stats.fuelMax, state.race.fuel < 25 ? 'red' : 'yellow')}
        ${meterLine('Condition', state.race.condition, stats.conditionMax, state.race.condition < 25 ? 'red' : '')}
        ${meterLine('Heat', state.race.heat, 100, state.race.heat > 70 ? 'red' : 'yellow')}
        <button class="tapButton" data-action="tapRace" data-guide-target="raceBoost">TAP RACE BOOST</button>
      `
    })}

    ${problem ? renderProblem(problem) : RewardPanel({
      icon: 'coin',
      title: 'Route Clear',
      subtitle: 'Tap for burst income or let idle systems continue.',
      badge: 'Ready',
      body: `<div class="notice good"><b>No active hazard.</b><br>Keep the route running and collect steady rewards.</div>`
    })}

    ${RouteCard({
      icon: 'race',
      title: 'Route Modes',
      subtitle: '2D idle modes only. No real-time PVP.',
      body: `
        <div class="modeChips">
          ${Object.entries(RACE_MODES).map(([key, m]) => `<button class="chip ${key === state.race.mode ? 'active' : ''}" data-action="raceMode" data-mode="${key}">${renderLabeledDataIcon(m, m.label)}</button>`).join('')}
        </div>
      `
    })}

    ${GamePanel({
      icon: 'tune',
      title: 'Fast Upgrades',
      subtitle: 'These modify the race route. Main economy upgrades are in Lines.',
      className: 'upgradePanelStack',
      body: UPGRADES.filter((u) => !['supplierShelf'].includes(u.key)).map((upgrade) => renderUpgrade(state, upgrade)).join('')
    })}
  `;
}

function renderProblem(problem) {
  return ProblemAlert({
    icon: problem.icon,
    fallbackIcon: problem.fallbackIcon,
    title: problem.label,
    subtitle: problem.description,
    badge: 'Alert',
    className: 'problemCard',
    body: `
      <div class="grid2">
        ${problem.fixes.map((fix, index) => `<button class="btn red" data-action="fixProblem" data-fix="${index}">${fix.label}<br><small>${fix.amount} ${fix.resource}</small></button>`).join('')}
      </div>
    `
  });
}

function renderUpgrade(state, def) {
  const level = state.upgrades[def.key] || 0;
  const cost = upgradeCost(state, def);
  return UpgradeCard({
    icon: def.icon || upgradeIconKey(def),
    fallbackIcon: def.fallbackIcon,
    title: def.name,
    subtitle: def.description,
    badge: `Lv ${level}`,
    className: 'upgrade',
    body: `<div class="cost">Cost: ${costToText(cost)}</div>`,
    action: `<button class="btn small primary" data-action="upgrade" data-key="${def.key}" ${canAfford(state, cost) ? '' : 'disabled'}>Buy</button>`
  });
}
