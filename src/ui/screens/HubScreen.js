import { ScreenFrame } from '../components/ScreenFrame.js';
import { SubTabBar } from '../components/SubTabBar.js';
import { getObjectiveList } from '../../systems/objectiveSystem.js';
import { getTotalIdlePerMinute } from '../../systems/idleLineSystem.js';
import { fmt } from '../../systems/economySystem.js';
import { RICHDOM_WHEEL_WEDGES, isFreeTycoonSpinAvailable } from '../../systems/mergeSystem.js';
import { UI_ICONS } from '../../data/uiIconMap.js';

function recommendedActionForObjective(objective) {
  const key = objective?.key || '';
  if (['firstMerge'].includes(key)) return { label: 'Open Parts', screen: 'merge', detail: 'Merge a pair' };
  if (['buildStorage', 'unlockPerformance', 'unlockTrack'].includes(key)) return { label: 'Open Garage', screen: 'garage', detail: 'Build the next room' };
  if (['idleLineUpgrade'].includes(key)) return { label: 'Open Supplies', screen: 'lines', detail: 'Upgrade a supply' };
  return { label: 'Open Race', screen: 'race', detail: nextTitle(objective) };
}

function nextTitle(objective) {
  return objective?.title || 'Stage map is open';
}

function formatAwayDuration(seconds = 0) {
  const mins = Math.max(1, Math.round(seconds / 60));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hrs}h ${rem}m` : `${hrs}h`;
}

function renderRichdomWelcomeBack(pending) {
  if (!pending?.coins && !pending?.parts) return '';
  const duration = formatAwayDuration(pending.seconds || 60);
  const mgrNote = pending.managerCount
    ? `${pending.managerCount} Elite Manager${pending.managerCount === 1 ? '' : 's'} working`
    : 'Offline Empire Income';
  const extraParts = pending.parts ? ` · +${fmt(pending.parts)} Parts` : '';
  return `
    <section class="adcapRow richdomWelcomeCard" aria-label="Welcome Back Offline Rewards">
      <div class="adcapIcon"><img src="${UI_ICONS.coin}" alt=""></div>
      <button class="adcapBuy" data-action="claimOffline">
        <b>WELCOME BACK!</b>
        <small>+${fmt(pending.coins || 0)} Coins${extraParts}</small>
      </button>
      <div class="adcapTrack richdomWelcomeTrack">
        <em>⏱ ${duration} · ${mgrNote}</em>
      </div>
      <button class="adcapManager richdomCollectBtn" data-action="claimOffline"><b>COLLECT</b></button>
    </section>
  `;
}

function renderRichdomWheelRow(state) {
  const freeReady = isFreeTycoonSpinAvailable(state);
  const lastWedge = state?.tycoonWheel?.lastResult?.wedge;
  return `
    <section class="adcapRow richdomWheelRow" aria-label="Tycoon Lucky Wheel">
      <div class="adcapIcon"><img src="${UI_ICONS.trophy}" alt=""></div>
      <button class="adcapBuy" type="button" data-action="openTycoonWheel">
        <b>TYCOON LUCKY WHEEL</b>
        <small>${freeReady ? '🎁 1 Free Daily Spin Ready!' : 'Spin for 1,000G Jackpot & Parts'}</small>
      </button>
      <div class="adcapTrack richdomWheelTrack">
        <em>${lastWedge ? `Last: ${lastWedge.icon} ${lastWedge.short}` : '💎 Win up to +1,000 Coins'}</em>
      </div>
      <button class="adcapManager richdomSpinOpenBtn" type="button" data-action="openTycoonWheel">
        <b>${freeReady ? 'FREE' : 'SPIN'}</b>
      </button>
    </section>
  `;
}

function renderRichdomWheelModal(state) {
  if (!state?.tycoonWheel?.open) return '';
  const freeReady = isFreeTycoonSpinAvailable(state);
  const lastResult = state.tycoonWheel?.lastResult;
  const angle = Number(lastResult?.angle || 0);
  const canAffordExtra = (state.currencies?.coins || 0) >= 120;

  return `
    <div class="richdomWheelBackdrop" data-action="closeTycoonWheel">
      <section class="richdomWheelModal" onclick="event.stopPropagation()" aria-label="Tycoon Lucky Spin Wheel">
        <header class="richdomWheelHeader">
          <div>
            <span class="richdomWheelKicker">RICHDOM TYCOON EVENT</span>
            <h3>Lucky Empire Wheel</h3>
          </div>
          <button type="button" class="richdomWheelClose" data-action="closeTycoonWheel">✕</button>
        </header>

        <div class="richdomWheelStage">
          <div class="richdomWheelPointer">▼</div>
          <div class="richdomWheelDisc" style="transform: rotate(${angle}deg);">
            ${RICHDOM_WHEEL_WEDGES.map((w, idx) => `
              <div class="richdomWheelLabel" style="transform: rotate(${idx * 45 + 22.5}deg);">
                <span>${w.icon} <b>${w.short}</b></span>
              </div>
            `).join('')}
            <div class="richdomWheelCenter"><b>365</b></div>
          </div>
        </div>

        ${lastResult?.wedge ? `
          <div class="richdomWheelResultBanner">
            <span>${lastResult.wedge.icon} WON: <b>${lastResult.wedge.label}</b></span>
          </div>
        ` : `
          <div class="richdomWheelResultBanner muted">
            <span>Tap SPIN below to win instant Empire Cash, Parts, Tools, or the 1,000G Jackpot!</span>
          </div>
        `}

        <div class="richdomWheelPrizeGrid">
          ${RICHDOM_WHEEL_WEDGES.map((w, idx) => `
            <div class="richdomPrizeChip ${lastResult?.index === idx ? 'won' : ''}">
              <span>${w.icon}</span>
              <b>${w.short}</b>
            </div>
          `).join('')}
        </div>

        <div class="richdomWheelActions">
          <button
            type="button"
            class="btn primary richdomSpinActionBtn"
            data-action="spinTycoonWheel"
            ${!freeReady && !canAffordExtra ? 'disabled' : ''}
          >
            ${freeReady ? '🎰 SPIN FREE (DAILY BONUS)' : '🎰 SPIN WHEEL · 120 Coins'}
          </button>
          <button type="button" class="btn ghost" data-action="closeTycoonWheel">Done</button>
        </div>
      </section>
    </div>
  `;
}

function tile(screen, icon, title, detail) {
  return `<button class="homeTile" type="button" data-action="screen" data-screen="${screen}"><img src="${icon}" alt=""><b>${title}</b><small>${detail}</small></button>`;
}

export function renderHubScreen(state) {
  const objectives = getObjectiveList(state);
  const next = objectives.find((item) => !item.done);
  const recommended = recommendedActionForObjective(next);
  const away = renderRichdomWelcomeBack(state.pendingOffline);
  const wheelRow = renderRichdomWheelRow(state);
  const wheelModal = renderRichdomWheelModal(state);
  const totals = getTotalIdlePerMinute(state);
  const rateEntries = Object.entries(totals);
  const empireRate = rateEntries.length
    ? rateEntries.slice(0, 3).map(([res, val]) => `+${fmt(val)} ${res}/m`).join(' · ')
    : 'Hire Managers in Supplies for 24/7 idle income';

  return ScreenFrame({
    title: 'Home',
    subtitle: `Empire Rate: ${empireRate}`,
    badge: `Stage ${state.stage || 1}`,
    className: 'hubMobileHome',
    body: `
      ${SubTabBar({
        tabs: [
          { label: 'Today', screen: 'hub', icon: 'home', active: true },
          { label: 'World Map', screen: 'world', icon: 'home' }
        ]
      })}
      ${away}
      ${wheelRow}
      <section class="adcapRow">
        <div class="adcapIcon"><img src="${UI_ICONS.race}" alt=""></div>
        <button class="adcapBuy" data-action="screen" data-screen="${recommended.screen}"><b>${recommended.label}</b><small>${recommended.detail}</small></button>
        <div class="adcapTrack"><em>${next ? 'Next job' : 'Ready'}</em></div>
        <button class="adcapManager" data-action="screen" data-screen="${recommended.screen}"><b>Go</b></button>
      </section>
      <button class="homeVip" type="button" data-action="screen" data-screen="vip">
        <b>VIP ${state.vipLevel || 0}</b>
        <span>Open the toolbox shop</span>
      </button>
      <div class="homeGrid">
        ${tile('race', UI_ICONS.race, 'Race', 'Stage map')}
        ${tile('lines', UI_ICONS.tools, 'Supplies', 'Stock the shop')}
        ${tile('merge', UI_ICONS.parts, 'Parts', 'Merge pairs')}
        ${tile('garage', UI_ICONS.garage, 'Garage', 'Build rooms')}
      </div>
      <a class="homeLink" href="https://www.365motorsales.com" target="_blank" rel="noopener">Visit 365 Motor Sales</a>
      ${wheelModal}
    `
  });
}

