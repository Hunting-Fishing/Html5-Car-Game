import { IDLE_LINES } from '../../data/gameData.js';
import { lineAssetForKey, LINES_GUI_ASSETS } from '../../data/linesAssetMap.js';
import { BUILD_ICON_ASSETS, buildSystemAssetForKey } from '../../data/buildAssetMap.js';
import { connectionForLine } from '../../data/buildLinkData.js';
import { GamePanel, renderDataIcon } from '../components/GamePanel.js';
import { segmentedMeter } from '../components/StatMeter.js';
import { fmt, costToText, canAfford } from '../../systems/economySystem.js';
import { getBuildCommunicationState } from '../../systems/buildCommunicationSystem.js';
import {
  canCollectLine,
  getLineCycleMs,
  getLineIncome,
  getLineState,
  getLineUpgradeCost,
  getManagerCost,
  getNextMilestone,
  hasManager,
  isAutoCollectEnabled,
  isLineUnlocked,
  unlockText
} from '../../systems/idleLineSystem.js';

export function renderLinesScreen(state) {
  const buildComm = getBuildCommunicationState(state);
  return `
    ${GamePanel({
      icon: 'garage',
      title: 'Garage',
      subtitle: 'Garage is grouped into Build Rooms and Business Lines.',
      badge: 'Garage Group',
      className: 'screenGroupPanel garageGroupPanel',
      body: `
        <div class="screenSubTabs" role="tablist" aria-label="Garage sections">
          <button class="btn" type="button" data-action="screen" data-screen="garage">
            <img class="buildButtonAsset buildAssetImage" src="${BUILD_ICON_ASSETS.buildMode}" alt="" loading="eager">
            <span>Build Rooms</span>
          </button>
          <button class="btn primary active" type="button" data-action="screen" data-screen="lines" aria-current="page">
            <img class="buildButtonAsset buildAssetImage" src="${BUILD_ICON_ASSETS.lineSync}" alt="" loading="eager">
            <span>Business Lines</span>
          </button>
        </div>
      `
    })}

    <section class="card linesIntroCard">
      <div class="cardTitle">
        <div><h2>Idle Business Lines</h2><p>Upgrade each automotive line. Hire managers at Lv 10 to auto-collect.</p></div>
        <span class="pill">Phase 10</span>
      </div>
      <div class="notice good"><b>Goal:</b> Street Route -> Parts Delivery -> Mobile Mechanic -> Fuel/Towing -> Dealer/Performance/Race.</div>
      <div class="linesAssetPreload" aria-hidden="true">
        ${Object.entries(LINES_GUI_ASSETS).map(([key, src]) => `<img class="linesGuiAsset" data-lines-gui="${key}" src="${src}" alt="" loading="eager">`).join('')}
      </div>
    </section>
    ${renderBuildLineBridge(buildComm)}
    ${IDLE_LINES.map((line) => renderLineCard(state, line)).join('')}
  `;
}

function renderBuildLineBridge(snapshot) {
  const systems = snapshot.systems.filter((system) => system.lineKeys.length);
  return `
    <section class="card buildLineBridgeCard">
      <div class="cardTitle">
        <div><h3>Build Links</h3><p>Garage systems now publish to Lines and World inventory together.</p></div>
        <span class="pill buildSyncBadge">${snapshot.unlockedLineCount}/${snapshot.totalLineCount} lines</span>
      </div>
      <div class="buildLineBridgeGrid">
        ${systems.map((system) => {
          const icon = buildSystemAssetForKey(system.buildingKey || system.key) || BUILD_ICON_ASSETS.buildMode;
          const lineText = system.lines.map((line) => `${line.name} ${line.unlocked ? `Lv ${line.level}` : 'locked'}`).join(' / ');
          return `
            <div class="buildLineChip">
              <b><img class="buildAssetIcon buildAssetImage" src="${icon}" alt="" loading="eager"> ${system.title}</b>
              <span>${system.built ? lineText : 'Build this system to activate the linked line.'}</span>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function renderLineIcon(line) {
  return `
    <div class="lineIcon">
      ${renderDataIcon({ ...line, icon: line.icon || lineAssetForKey(line.key) }, line.name, 'lineIconAsset')}
    </div>
  `;
}

function renderLineStatusPill(label, asset) {
  return `<span class="pill lineStatusPill"><img class="lineStatusAsset linesGuiAsset" src="${asset}" alt="" loading="eager">${label}</span>`;
}

function getLineRequirementInfo(state, line) {
  const unlock = line.unlock || { type: 'starter' };
  if (unlock.type === 'starter') {
    return { met: true, label: 'Open from start', detail: 'Ready', current: 1, required: 1, actionScreen: null };
  }
  if (unlock.type === 'lineLevel') {
    const current = getLineState(state, unlock.key)?.level || 0;
    return {
      met: current >= unlock.level,
      label: `Upgrade ${unlock.label} to Lv ${unlock.level}`,
      detail: `Lv ${current}/${unlock.level}`,
      current,
      required: unlock.level,
      actionScreen: 'lines'
    };
  }
  if (unlock.type === 'building') {
    const current = state.buildings?.[unlock.key] || 0;
    return {
      met: current >= unlock.level,
      label: `Build ${unlock.label} Lv ${unlock.level}`,
      detail: `Lv ${current}/${unlock.level}`,
      current,
      required: unlock.level,
      actionScreen: 'garage'
    };
  }
  if (unlock.type === 'stage') {
    const current = state.stage || 1;
    return {
      met: current >= unlock.stage,
      label: `Reach Stage ${unlock.stage}`,
      detail: `Stage ${current}/${unlock.stage}`,
      current,
      required: unlock.stage,
      actionScreen: 'hub'
    };
  }
  return { met: false, label: 'Requirement unknown', detail: 'Locked', current: 0, required: 1, actionScreen: null };
}

function renderLineRequirement(state, line) {
  const req = getLineRequirementInfo(state, line);
  const action = !req.met && req.actionScreen
    ? `<button class="btn small ghost" data-action="screen" data-screen="${req.actionScreen}">Go</button>`
    : '';
  return `
    <div class="lineRequirement ${req.met ? 'met' : 'open'}">
      <div class="lineRequirementText">
        <b>${req.met ? 'Requirement met' : 'Requirement'}</b>
        <span>${req.label}</span>
      </div>
      <strong>${req.detail}</strong>
      ${action}
      ${segmentedMeter({ value: req.current, max: req.required, label: `${req.label} unlock progress`, className: 'lineRequirementMeter' })}
    </div>
  `;
}

function renderManagerRequirement(state, line, level, managerOwned, managerCost, autoEnabled) {
  if (managerOwned) {
    return `
      <div class="lineManagerGrid">
        <div class="notice good">
          <b>${line.manager.name}</b> hired.<br>
          Auto collect is <b>${autoEnabled ? 'ON' : 'OFF'}</b>. ${autoEnabled ? 'Rewards collect automatically.' : 'Cycle stops when ready for manual collection.'}
        </div>
        <button class="btn small ${autoEnabled ? 'red' : 'primary'}" data-action="toggleLineAuto" data-line="${line.key}">
          <img class="lineButtonAsset linesGuiAsset" src="${autoEnabled ? LINES_GUI_ASSETS.manualBadge : LINES_GUI_ASSETS.autoBadge}" alt="" loading="eager">
          <span>${autoEnabled ? 'Pause Auto' : 'Turn Auto On'}</span>
        </button>
      </div>
    `;
  }

  const managerReady = level >= line.manager.unlockLevel;
  return `
    <div class="lineManagerNeed">
      <div class="lineRequirement ${managerReady ? 'met' : 'open'}">
        <div class="lineRequirementText">
          <b>Manager requirement</b>
          <span>${line.manager.name} unlocks at Lv ${line.manager.unlockLevel}</span>
        </div>
        <strong>Lv ${level}/${line.manager.unlockLevel}</strong>
        ${segmentedMeter({ value: level, max: line.manager.unlockLevel, label: `${line.manager.name} unlock progress`, className: 'lineRequirementMeter' })}
      </div>
      <button class="btn small" data-action="buyManager" data-line="${line.key}" ${managerReady && canAfford(state, managerCost) ? '' : 'disabled'}>
        <img class="lineButtonAsset linesGuiAsset" src="${LINES_GUI_ASSETS.hireManagerButton}" alt="" loading="eager">
        <span>Hire ${line.manager.name}<br><small>${managerReady ? costToText(managerCost) : `Needs Lv ${line.manager.unlockLevel}`}</small></span>
      </button>
    </div>
  `;
}

function renderLineCard(state, line) {
  const current = getLineState(state, line.key);
  const unlocked = isLineUnlocked(state, line);
  const level = current.level;
  const cycleMs = getLineCycleMs(state, line);
  const income = getLineIncome(state, line);
  const upgradeCost = getLineUpgradeCost(state, line);
  const managerCost = getManagerCost(state, line);
  const managerOwned = hasManager(state, line.key);
  const autoEnabled = isAutoCollectEnabled(state, line.key);
  const nextMilestone = getNextMilestone(state, line);
  const collectReady = canCollectLine(state, line);
  const statusAsset = !unlocked ? LINES_GUI_ASSETS.lockedBadge : managerOwned && autoEnabled ? LINES_GUI_ASSETS.autoBadge : LINES_GUI_ASSETS.manualBadge;
  const statusLabel = !unlocked ? 'Locked' : managerOwned ? (autoEnabled ? 'AUTO ON' : 'AUTO OFF') : 'MANUAL';
  const guideTarget = line.key === 'streetRoute' && !state.objectives?.idleLineUpgrade ? ' data-guide-target="upgradeStreetRoute"' : '';

  if (!unlocked) {
    const buildConnection = connectionForLine(line.key);
    const buildLink = buildConnection?.buildingKey
      ? `<div class="lockedLineActions"><button class="btn small gold" data-action="screen" data-screen="garage"><img class="roomButtonAsset buildAssetImage" src="${BUILD_ICON_ASSETS.buildMode}" alt="" loading="eager"><span>Open Build</span></button></div>`
      : '';
    return `
      <section class="lineCard lockedLine" data-line-key="${line.key}">
        <div class="lineHead">
          ${renderLineIcon(line)}
          <div><h3>${line.name}</h3><p>${line.description}</p></div>
          ${renderLineStatusPill(statusLabel, statusAsset)}
        </div>
        ${renderLineRequirement(state, line)}
        <div class="notice">${unlockText(line)}</div>
        ${buildLink}
      </section>
    `;
  }

  return `
    <section class="lineCard" data-line-key="${line.key}">
      <div class="lineHead">
        ${renderLineIcon(line)}
        <div><h3>${line.name} <span class="pill">Lv ${level}</span></h3><p>${line.description}</p></div>
        ${renderLineStatusPill(statusLabel, statusAsset)}
      </div>
      ${renderLineRequirement(state, line)}
      <div class="lineStats">
        <div><b>${fmt(income)}</b><span>${line.outputLabel}/cycle</span></div>
        <div><b>${(cycleMs / 1000).toFixed(1)}s</b><span>Cycle</span></div>
        <div><b>${fmt(current.collected)}</b><span>Collects</span></div>
      </div>
      ${segmentedMeter({ value: current.cycle, max: cycleMs, label: `${line.name} cycle progress`, className: 'lineProgress' })}
      <div class="lineButtons">
        <button class="btn small ${collectReady ? 'gold' : 'ghost'}" data-action="collectLine" data-line="${line.key}" ${collectReady ? '' : 'disabled'}><img class="lineButtonAsset linesGuiAsset" src="${LINES_GUI_ASSETS.collectButton}" alt="" loading="eager"><span>${managerOwned && autoEnabled ? 'Auto Running' : 'Collect'}</span></button>
        <button class="btn small primary" data-action="upgradeLine" data-line="${line.key}"${guideTarget} ${canAfford(state, upgradeCost) ? '' : 'disabled'}><img class="lineButtonAsset linesGuiAsset" src="${LINES_GUI_ASSETS.upgradeButton}" alt="" loading="eager"><span>Upgrade<br><small>${costToText(upgradeCost)}</small></span></button>
      </div>
      <div class="lineManager">
        ${renderManagerRequirement(state, line, level, managerOwned, managerCost, autoEnabled)}
      </div>
      <div class="cost">Next milestone: ${nextMilestone ? `Lv ${nextMilestone.level} - ${nextMilestone.label}` : 'All early milestones reached.'}</div>
    </section>
  `;
}
