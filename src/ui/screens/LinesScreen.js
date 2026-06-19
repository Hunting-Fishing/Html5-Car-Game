import { IDLE_LINES } from '../../data/gameData.js';
import { lineAssetForKey, LINES_GUI_ASSETS } from '../../data/linesAssetMap.js';
import { BUILD_ICON_ASSETS, buildSystemAssetForKey } from '../../data/buildAssetMap.js';
import { connectionForLine } from '../../data/buildLinkData.js';
import { renderDataIcon } from '../components/GamePanel.js';
import { ScreenFrame } from '../components/ScreenFrame.js';
import { SubTabBar } from '../components/SubTabBar.js';
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
  getTotalIdlePerMinute,
  hasManager,
  isAutoCollectEnabled,
  isLineUnlocked,
  unlockText
} from '../../systems/idleLineSystem.js';

export function renderLinesScreen(state) {
  const buildComm = getBuildCommunicationState(state);
  const lines = IDLE_LINES.map((line) => getLineViewModel(state, line));
  const featured = selectFeaturedLine(lines);

  return ScreenFrame({
    title: 'Business Lines',
    subtitle: 'Compact idle routes, collections, managers, and unlocks.',
    badge: `${buildComm.unlockedLineCount}/${buildComm.totalLineCount}`,
    className: 'linesCompactFrame',
    body: `
      ${SubTabBar({
        tabs: [
          { label: 'Build Rooms', screen: 'garage', icon: BUILD_ICON_ASSETS.buildMode },
          { label: 'Business Lines', screen: 'lines', active: true, icon: BUILD_ICON_ASSETS.lineSync }
        ]
      })}
      ${renderLinesStatusStrip(state, lines)}
      ${renderLineFilterChips(lines)}
      <div class="linesCompactList">
        ${lines.map((line) => renderLineRow(state, line, featured?.line.key)).join('')}
      </div>
      ${featured ? renderFeaturedLineDetail(state, featured) : ''}
      ${renderBuildLineBridge(buildComm)}
      <div class="linesAssetPreload" aria-hidden="true">
        ${Object.entries(LINES_GUI_ASSETS).map(([key, src]) => `<img class="linesGuiAsset" data-lines-gui="${key}" src="${src}" alt="" loading="eager">`).join('')}
      </div>
    `
  });
}

function renderBuildLineBridge(snapshot) {
  const systems = snapshot.systems.filter((system) => system.lineKeys.length);
  return `
    <section class="buildLineBridgeCard compactBuildLinks">
      <div class="compactSectionHead">
        <div><h3>Build Links</h3><p>Garage systems publish to Lines and World inventory.</p></div>
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

function getLineViewModel(state, line) {
  const current = getLineState(state, line.key);
  const unlocked = isLineUnlocked(state, line);
  const level = current.level;
  const cycleMs = getLineCycleMs(state, line);
  const income = getLineIncome(state, line);
  const upgradeCost = getLineUpgradeCost(state, line);
  const managerCost = getManagerCost(state, line);
  const managerOwned = hasManager(state, line.key);
  const autoEnabled = isAutoCollectEnabled(state, line.key);
  const collectReady = canCollectLine(state, line);
  const upgradeAffordable = unlocked && canAfford(state, upgradeCost);
  const statusAsset = !unlocked ? LINES_GUI_ASSETS.lockedBadge : collectReady ? LINES_GUI_ASSETS.collectButton : managerOwned && autoEnabled ? LINES_GUI_ASSETS.autoBadge : LINES_GUI_ASSETS.manualBadge;
  const statusLabel = !unlocked ? 'Locked' : collectReady ? 'Ready' : managerOwned && autoEnabled ? 'Auto' : 'Manual';

  return {
    line,
    current,
    unlocked,
    level,
    cycleMs,
    income,
    upgradeCost,
    managerCost,
    managerOwned,
    autoEnabled,
    collectReady,
    upgradeAffordable,
    statusAsset,
    statusLabel,
    nextMilestone: getNextMilestone(state, line)
  };
}

function selectFeaturedLine(lines) {
  return lines.find((item) => item.collectReady)
    || lines.find((item) => item.unlocked)
    || lines.find((item) => !item.unlocked)
    || null;
}

function renderLinesStatusStrip(state, lines) {
  const totals = getTotalIdlePerMinute(state);
  const totalText = Object.entries(totals).length
    ? Object.entries(totals).map(([resource, value]) => `${fmt(value)}/${resource}`).join(' + ')
    : 'Upgrade a line to begin output';
  const readyCount = lines.filter((item) => item.collectReady).length;
  const autoCount = lines.filter((item) => item.managerOwned && item.autoEnabled).length;
  const unlockedCount = lines.filter((item) => item.unlocked).length;

  return `
    <div class="linesStatusStrip">
      <div><b>${totalText}</b><span>Idle output / minute</span></div>
      <div><b>${readyCount}</b><span>Ready</span></div>
      <div><b>${autoCount}</b><span>Auto</span></div>
      <div><b>${unlockedCount}/${lines.length}</b><span>Open</span></div>
    </div>
  `;
}

function renderLineFilterChips(lines) {
  const ready = lines.filter((item) => item.collectReady).length;
  const upgradeable = lines.filter((item) => item.upgradeAffordable).length;
  const locked = lines.filter((item) => !item.unlocked).length;

  return `
    <div class="lineFilterChips" aria-label="Line filters">
      <span class="chip active">All ${lines.length}</span>
      <span class="chip">Ready ${ready}</span>
      <span class="chip">Upgradeable ${upgradeable}</span>
      <span class="chip">Locked ${locked}</span>
    </div>
  `;
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

function renderLineRow(state, item, featuredKey) {
  const { line, current, unlocked, level, cycleMs, income, upgradeCost, collectReady, upgradeAffordable, statusAsset, statusLabel, managerOwned, autoEnabled } = item;
  const guideTarget = line.key === 'streetRoute' && !state.objectives?.idleLineUpgrade ? ' data-guide-target="upgradeStreetRoute"' : '';

  if (!unlocked) {
    const buildConnection = connectionForLine(line.key);
    const buildLink = buildConnection?.buildingKey
      ? `<button class="btn small ghost" data-action="screen" data-screen="garage">Req</button>`
      : '';
    return `
      <article class="lineCompactRow lockedLine ${line.key === featuredKey ? 'featured' : ''}" data-line-key="${line.key}">
        ${renderLineIcon(line)}
        <div class="lineCompactMain">
          <div class="lineCompactHead"><b>${line.name}</b><span>Lv ${level}</span></div>
          <div class="lineCompactMeta"><span>${renderLineStatusPill(statusLabel, statusAsset)}</span><span>${unlockText(line)}</span></div>
          ${segmentedMeter({ value: 0, max: 1, label: `${line.name} locked progress`, className: 'lineProgress lineRowMeter' })}
        </div>
        <div class="lineCompactActions">${buildLink}</div>
      </article>
    `;
  }

  return `
    <article class="lineCompactRow ${collectReady ? 'ready' : ''} ${line.key === featuredKey ? 'featured' : ''}" data-line-key="${line.key}">
      ${renderLineIcon(line)}
      <div class="lineCompactMain">
        <div class="lineCompactHead"><b>${line.name}</b><span>Lv ${level}</span></div>
        <div class="lineCompactMeta">
          <span>${renderLineStatusPill(statusLabel, statusAsset)}</span>
          <span>${fmt(income)} ${line.outputLabel}/cycle</span>
          <span>${(cycleMs / 1000).toFixed(1)}s</span>
        </div>
        ${segmentedMeter({ value: current.cycle, max: cycleMs, label: `${line.name} cycle progress`, className: 'lineProgress lineRowMeter' })}
      </div>
      <div class="lineCompactActions">
        <button class="btn small ${collectReady ? 'gold' : 'ghost'}" data-action="collectLine" data-line="${line.key}" ${collectReady ? '' : 'disabled'}><img class="lineButtonAsset linesGuiAsset" src="${LINES_GUI_ASSETS.collectButton}" alt="" loading="eager"><span>${managerOwned && autoEnabled ? 'Auto' : 'Collect'}</span></button>
        <button class="btn small primary" data-action="upgradeLine" data-line="${line.key}"${guideTarget} ${upgradeAffordable ? '' : 'disabled'}><img class="lineButtonAsset linesGuiAsset" src="${LINES_GUI_ASSETS.upgradeButton}" alt="" loading="eager"><span>Up</span></button>
      </div>
    </article>
  `;
}

function renderFeaturedLineDetail(state, item) {
  const { line, current, unlocked, level, cycleMs, income, upgradeCost, managerCost, managerOwned, autoEnabled, collectReady, upgradeAffordable, nextMilestone } = item;
  const guideTarget = line.key === 'streetRoute' && !state.objectives?.idleLineUpgrade ? ' data-guide-target="upgradeStreetRoute"' : '';

  if (!unlocked) {
    const buildConnection = connectionForLine(line.key);
    const buildAction = buildConnection?.buildingKey
      ? `<button class="btn small gold" data-action="screen" data-screen="garage"><img class="roomButtonAsset buildAssetImage" src="${BUILD_ICON_ASSETS.buildMode}" alt="" loading="eager"><span>Open Build</span></button>`
      : '';
    return `
      <section class="lineFeaturedDetail lockedLine">
        <div class="compactSectionHead">
          <div><h3>${line.name}</h3><p>${line.description}</p></div>
          <span class="pill">Featured</span>
        </div>
        ${renderLineRequirement(state, line)}
        <div class="notice">${unlockText(line)}</div>
        ${buildAction}
      </section>
    `;
  }

  return `
    <section class="lineFeaturedDetail" data-line-key="${line.key}">
      <div class="compactSectionHead">
        <div><h3>${line.name}</h3><p>${line.description}</p></div>
        <span class="pill">Featured</span>
      </div>
      <div class="lineStats">
        <div><b>${fmt(income)}</b><span>${line.outputLabel}/cycle</span></div>
        <div><b>${(cycleMs / 1000).toFixed(1)}s</b><span>Cycle</span></div>
        <div><b>${fmt(current.collected)}</b><span>Collects</span></div>
      </div>
      ${segmentedMeter({ value: current.cycle, max: cycleMs, label: `${line.name} cycle progress`, className: 'lineProgress' })}
      <div class="lineButtons">
        <button class="btn small ${collectReady ? 'gold' : 'ghost'}" data-action="collectLine" data-line="${line.key}" ${collectReady ? '' : 'disabled'}><img class="lineButtonAsset linesGuiAsset" src="${LINES_GUI_ASSETS.collectButton}" alt="" loading="eager"><span>${managerOwned && autoEnabled ? 'Auto Running' : 'Collect'}</span></button>
        <button class="btn small primary" data-action="upgradeLine" data-line="${line.key}"${guideTarget} ${upgradeAffordable ? '' : 'disabled'}><img class="lineButtonAsset linesGuiAsset" src="${LINES_GUI_ASSETS.upgradeButton}" alt="" loading="eager"><span>Upgrade<br><small>${costToText(upgradeCost)}</small></span></button>
      </div>
      <div class="lineManager compactLineManager">
        <div class="compactSectionHead mini">
          <div><h3>Manager</h3><p>Auto collect unlocks at Lv ${line.manager.unlockLevel}.</p></div>
          <span class="pill">${managerOwned ? (autoEnabled ? 'Auto On' : 'Auto Off') : `Lv ${level}/${line.manager.unlockLevel}`}</span>
        </div>
        ${renderManagerRequirement(state, line, level, managerOwned, managerCost, autoEnabled)}
      </div>
      <div class="cost">Next milestone: ${nextMilestone ? `Lv ${nextMilestone.level} - ${nextMilestone.label}` : 'All early milestones reached.'}</div>
    </section>
  `;
}
