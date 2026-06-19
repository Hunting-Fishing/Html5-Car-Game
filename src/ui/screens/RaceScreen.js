import { PROBLEMS, RACE_MODES, UPGRADES } from '../../data/gameData.js';
import { ProblemAlert, renderDataIcon } from '../components/GamePanel.js';
import { UpgradeCard } from '../components/UpgradeCard.js';
import { ScreenFrame } from '../components/ScreenFrame.js';
import { CompactStatStrip } from '../components/CompactStatStrip.js';
import { BottomSheet } from '../components/BottomSheet.js';
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
  const progress = Math.floor(state.race.progress);
  const stageLength = stats.mode.stageLength;

  return ScreenFrame({
    title: mode.label,
    subtitle: 'Compact racing cockpit with rival best-run challenges.',
    badge: `Stage ${state.stage}`,
    className: 'raceCockpitFrame',
    body: `
      <div class="raceCockpitBadges">
        <span class="raceBadge progressBadge">${progress}/${stageLength}m</span>
        <span class="raceBadge ${problem ? 'problem' : 'clear'}">${problem ? problem.label : 'Route Clear'}</span>
        <span class="raceBadge rival" data-guide-target="previewGhostRace">Rivals</span>
      </div>

      <section class="raceCanvasWrap">
        <div class="raceCanvas raceCockpitCanvas" id="raceCanvas"></div>
        ${problem ? renderProblem(problem) : renderRouteClear(mode)}
        ${CompactStatStrip({
          stats: [
            { label: 'Progress', value: progress, max: stageLength, displayValue: `${progress}m`, tone: 'good', icon: 'race' },
            { label: 'Fuel', value: Math.round(state.race.fuel), max: stats.fuelMax, displayValue: `${Math.round(state.race.fuel)}%`, tone: state.race.fuel < 25 ? 'bad' : 'good', icon: '/assets/road-runner/token-energy.svg' },
            { label: 'Condition', value: Math.round(state.race.condition), max: stats.conditionMax, displayValue: `${Math.round(state.race.condition)}%`, tone: state.race.condition < 25 ? 'bad' : 'good', icon: 'tools' },
            { label: 'Heat', value: Math.round(state.race.heat), max: 100, displayValue: `${Math.round(state.race.heat)}%`, tone: 'dangerHigh', dangerHigh: true, icon: 'rep' }
          ]
        })}
        <button class="tapButton raceBoostButton" data-action="tapRace" data-guide-target="raceBoost">Tap Boost</button>
      </section>

      ${BottomSheet({
        tabs: [
          { key: 'modes', label: 'Modes', active: true },
          { key: 'upgrades', label: 'Upgrades' },
          { key: 'ghosts', label: 'Rivals' }
        ],
        activeTab: 'modes',
        className: 'raceCockpitBottomSheet',
        body: `
          <div class="raceSheetStack">
            ${renderModeSection(state)}
            ${renderUpgradeSection(state)}
            ${renderGhostSection()}
          </div>
        `
      })}
    `
  });
}

function renderProblem(problem) {
  return ProblemAlert({
    icon: problem.icon,
    fallbackIcon: problem.fallbackIcon,
    title: problem.label,
    subtitle: problem.description,
    badge: 'Alert',
    className: 'problemCard raceProblemCompact',
    body: `
      <div class="grid2">
        ${problem.fixes.map((fix, index) => `<button class="btn red" data-action="fixProblem" data-fix="${index}">${fix.label}<br><small>${fix.amount} ${fix.resource}</small></button>`).join('')}
      </div>
    `
  });
}

function renderRouteClear(mode) {
  return `
    <div class="raceClearStatus">
      <b>Route Clear</b>
      <span>${mode.description}</span>
    </div>
  `;
}

function renderModeSection(state) {
  return `
    <section class="raceSheetSection raceModesSection">
      <div class="raceSheetHeader"><b>Route Modes</b><span>Choose a route.</span></div>
      <div class="modeChips">
        ${Object.entries(RACE_MODES).map(([key, mode]) => `
          <button class="chip raceCockpitModeChip ${key === state.race.mode ? 'active' : ''}" data-action="raceMode" data-mode="${key}">
            ${renderLabeledDataIcon(mode, mode.label)}
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

function renderUpgradeSection(state) {
  return `
    <section class="raceSheetSection raceUpgradeSection">
      <div class="raceSheetHeader"><b>Fast Upgrades</b><span>Race route modifiers.</span></div>
      <div class="raceUpgradeList">
        ${UPGRADES.filter((upgrade) => upgrade.key !== 'supplierShelf').map((upgrade) => renderUpgrade(state, upgrade)).join('')}
      </div>
    </section>
  `;
}

function renderGhostSection() {
  return `
    <section class="raceSheetSection raceGhostSection" data-guide-target="previewGhostRace">
      <div class="raceSheetHeader"><b>Rivals</b><span>Best-run challengers.</span></div>
      <div class="raceGhostNotice">
        Line up against rival best runs and try to beat the next marker.
      </div>
    </section>
  `;
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
    className: 'upgrade raceUpgradeCompact',
    body: `<div class="cost">Cost: ${costToText(cost)}</div>`,
    action: `<button class="btn small primary" data-action="upgrade" data-key="${def.key}" ${canAfford(state, cost) ? '' : 'disabled'}>Buy</button>`
  });
}
