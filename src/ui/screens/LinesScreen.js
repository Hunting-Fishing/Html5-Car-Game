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
  quoteLineUpgrade,
  unlockText
} from '../../systems/idleLineSystem.js';

export function renderLinesScreen(state) {
  const buildComm = getBuildCommunicationState(state);
  const lines = IDLE_LINES.map((line) => getLineViewModel(state, line));
  const featured = selectFeaturedLine(lines);

  return ScreenFrame({
    title: 'Supplies',
    subtitle: 'Buy a stack, watch the bar, then collect. Hire a manager and it keeps running.',
    badge: `${buildComm.unlockedLineCount}/${buildComm.totalLineCount}`,
    className: 'linesCompactFrame',
    body: `
      <div class="staffJump">
        <button class="btn gold" data-action="screen" data-screen="world">World</button>
        <button class="btn primary" data-action="openStaff" data-staff="streetRoute">Managers</button>
      </div>
      <div class="adcapBuyBar" role="group" aria-label="Buy amount">
        <span>Buy</span>
        ${[1, 10, 100, 'max'].map((qty) => `<button type="button" class="${state.idleLines.buyQty === qty ? 'active' : ''}" data-action="lineBuyQty" data-qty="${qty}">${qty === 'max' ? 'Max' : `x${qty}`}</button>`).join('')}
      </div>
      <div class="capitalistList">
        ${lines.map((item) => renderCapitalistLine(state, item)).join('')}
      </div>
    `
  });
}

function renderBuildLineBridge(snapshot) {
  const systems = snapshot.systems.filter((system) => system.lineKeys.length);
  return `
    <section class="buildLineBridgeCard compactBuildLinks">
      <div class="compactSectionHead">
        <div><h3>Build Links</h3><p>Garage systems publish to Supplies and World inventory.</p></div>
        <span class="pill buildSyncBadge">${snapshot.unlockedLineCount}/${snapshot.totalLineCount} supplies</span>
      </div>
      <div class="buildLineBridgeGrid">
        ${systems.map((system) => {
          const icon = buildSystemAssetForKey(system.buildingKey || system.key) || BUILD_ICON_ASSETS.buildMode;
          const lineText = system.lines.map((line) => `${line.name} ${line.unlocked ? `Lv ${line.level}` : 'locked'}`).join(' / ');
          return `
            <div class="buildLineChip">
              <b><img class="buildAssetIcon buildAssetImage" src="${icon}" alt="" loading="eager"> ${system.title}</b>
              <span>${system.built ? lineText : 'Build this system to activate the linked supply.'}</span>
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
    : 'Upgrade a supply to begin output';
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
    <div class="lineFilterChips" aria-label="Supply filters">
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

function lineStarsForLevel(level) {
  if (level >= 50) return 5;
  if (level >= 25) return 4;
  if (level >= 10) return 3;
  if (level >= 5) return 2;
  return level > 0 ? 1 : 0;
}

function renderLineStarDots(level) {
  const stars = lineStarsForLevel(level);
  if (!stars) return '';
  return `<span class="richdomLineStars" aria-label="${stars} stars">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</span>`;
}

function formatRichdomCycleSec(cycleMs) {
  return `${(Math.max(100, cycleMs) / 1000).toFixed(2)}s`;
}

function renderCapitalistLine(state, item) {
  const { line, current, unlocked, level, cycleMs, income, collectReady, managerOwned, autoEnabled, nextMilestone } = item;
  const qty = state.idleLines.buyQty || 1;
  const quote = unlocked ? quoteLineUpgrade(state, line, qty) : null;
  const progress = unlocked ? Math.min(100, Math.round((current.cycle / Math.max(1, cycleMs)) * 100)) : 0;
  const guideTarget = line.key === 'streetRoute' && !state.objectives?.idleLineUpgrade ? ' data-guide-target="upgradeStreetRoute"' : '';
  const running = managerOwned && autoEnabled;
  const cycleText = unlocked ? `⏱ ${formatRichdomCycleSec(cycleMs)}` : '';
  const barLabel = !unlocked
    ? 'Locked'
    : collectReady && !running
      ? `Collect +${fmt(income)}`
      : `${cycleText} · +${fmt(income)} ${line.outputLabel}`;
  const milestoneHint = unlocked && nextMilestone
    ? ` · Lv ${nextMilestone.level} ${nextMilestone.type === 'incomeMultiplier' ? `x${nextMilestone.value}` : 'Speed+'}`
    : '';
  const canHire = unlocked && !managerOwned && level >= line.manager.unlockLevel && canAfford(state, item.managerCost);
  const managerLabel = managerOwned
    ? `<b>${line.manager.name.split(' ')[0]}</b><small>${autoEnabled ? 'Working' : 'Off'}</small>`
    : canHire
      ? `<b>Hire</b><small>${costToText(item.managerCost)}</small>`
      : `<b>Lv ${line.manager.unlockLevel}</b><small>Mgr</small>`;
  return `
    <article class="adcapRow richdomProfitRow ${unlocked ? '' : 'lockedLine'}" data-line-key="${line.key}">
      <div class="adcapIcon">${renderLineIcon(line)}<b>${level}</b>${renderLineStarDots(level)}</div>
      <button class="adcapBuy" data-action="upgradeLine" data-line="${line.key}"${guideTarget} ${quote?.affordable ? '' : 'disabled'}>
        <b>${line.name}</b>
        <small>${unlocked ? `${qty === 'max' ? `x${quote.count || 1}` : `x${qty}`} ${costToText(quote.cost)}${milestoneHint}` : unlockText(line)}</small>
      </button>
      <button class="adcapTrack richdomProfitTrack ${collectReady && !running ? 'ready' : ''} ${running ? 'auto' : ''}" data-action="collectLine" data-line="${line.key}" ${collectReady && !running ? '' : 'disabled'}>
        <span class="adcapFill" data-line-progress style="width:${progress}%"></span>
        <em>${barLabel}</em>
      </button>
      <button class="adcapManager ${managerOwned ? 'hired' : ''}" data-action="openStaff" data-line="${line.key}">
        ${managerLabel}
      </button>
    </article>
  `;
}

export function updateLineBars(state) {
  let ready = 0;
  document.querySelectorAll('.adcapRow[data-line-key]').forEach((row) => {
    const key = row.dataset.lineKey;
    const line = IDLE_LINES.find((item) => item.key === key);
    if (!line || !isLineUnlocked(state, line)) return;
    const current = getLineState(state, line.key);
    const cycleMs = getLineCycleMs(state, line);
    const income = getLineIncome(state, line);
    const progress = Math.min(100, (current.cycle / Math.max(1, cycleMs)) * 100);
    const fill = row.querySelector('[data-line-progress]');
    const label = row.querySelector('.adcapTrack em');
    const running = hasManager(state, line.key) && isAutoCollectEnabled(state, line.key);
    const canCollect = canCollectLine(state, line) && !running;
    if (canCollect) ready += 1;
    if (fill) fill.style.width = `${progress}%`;
    if (label) {
      label.textContent = !isLineUnlocked(state, line)
        ? 'Locked'
        : canCollect
          ? `Collect +${fmt(income)}`
          : `⏱ ${formatRichdomCycleSec(cycleMs)} · +${fmt(income)} ${line.outputLabel}`;
    }
    const track = row.querySelector('.adcapTrack');
    track?.classList.toggle('ready', canCollect);
    track?.classList.toggle('auto', running);
    track?.toggleAttribute('disabled', !canCollect);
  });
}

export function updateReadyBadge(state) {
  const ready = IDLE_LINES.filter((line) => isLineUnlocked(state, line) && canCollectLine(state, line)).length;
  const badge = document.querySelector('[data-ready-for="garage"]');
  if (!badge) return;
  badge.hidden = ready === 0;
  badge.textContent = String(ready);
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
