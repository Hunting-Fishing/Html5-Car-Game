import { UI_ICONS } from '../../data/uiIconMap.js';
import { DAILY_ORDERS } from '../../data/gameData.js';

const GUIDE_STEPS = [
  {
    key: 'raceBoost',
    number: 1,
    screen: 'race',
    raceTab: 'drive',
    title: 'Tap Boost',
    label: 'Race',
    icon: UI_ICONS.race,
    targetSelectors: ['[data-guide-target="raceBoost"]', '.roadRunnerPedal.gas', '[data-nav-tab="race"]']
  },
  {
    key: 'mergePair',
    number: 2,
    screen: 'merge',
    title: 'Merge Parts',
    label: 'Parts',
    icon: UI_ICONS.parts,
    targetSelectors: ['[data-guide-target="mergePair"]', '[data-guide-target="supplierReady"]', '[data-guide-target="placeAll"]', '[data-guide-target="mergeBoard"]', '[data-nav-tab="parts"]', '[data-action="screen"][data-screen="merge"]']
  },
  {
    key: 'buildPartsStorage',
    number: 3,
    screen: 'garage',
    title: 'Build Storage',
    label: 'Garage',
    icon: UI_ICONS.garage,
    targetSelectors: ['[data-guide-target="buildPartsStorage"]', '[data-build-system="partsStorage"]', '[data-nav-tab="garage"]']
  },
  {
    key: 'upgradeStreetRoute',
    number: 4,
    screen: 'lines',
    title: 'Upgrade Route',
    label: 'Lines',
    icon: UI_ICONS.garage,
    targetSelectors: ['[data-guide-target="upgradeStreetRoute"]', '[data-action="screen"][data-screen="lines"]', '[data-nav-tab="garage"]']
  },
  {
    key: 'previewGhostRace',
    number: 5,
    screen: 'race',
    raceTab: 'leaderboard',
    title: 'Open Leaderboard',
    label: 'Race',
    icon: UI_ICONS.race,
    targetSelectors: ['[data-rr-tab="leaderboard"]', '[data-road-runner-leaderboard]', '[data-guide-target="previewGhostRace"]']
  }
];

let lastGuideKey = '';

export function getFirstSessionGuideState(state) {
  const objectives = state?.objectives || {};
  if (objectives.previewGhostRace) {
    return { complete: true, step: null, stepIndex: GUIDE_STEPS.length, steps: GUIDE_STEPS };
  }

  if (!objectives.firstTap) {
    return guidePayload(state, 'raceBoost');
  }

  if (!objectives.firstMerge) {
    return guidePayload(state, 'mergePair');
  }

  if (!objectives.buildStorage) {
    return guidePayload(state, 'buildPartsStorage');
  }

  if (!objectives.idleLineUpgrade) {
    return guidePayload(state, 'upgradeStreetRoute');
  }

  return guidePayload(state, 'previewGhostRace');
}

export function updateFirstSessionGuide(state, root = document) {
  const host = root.querySelector('#questMenu');
  const button = root.querySelector('.questButton');
  if (!host) return;

  root.querySelectorAll('.guideTargetActive').forEach((target) => {
    target.classList.remove('guideTargetActive');
    target.removeAttribute('data-guide-active');
  });

  const guide = getFirstSessionGuideState(state);
  const wasOpen = !host.hidden;
  host.innerHTML = renderQuestMenu(state, guide);
  host.hidden = !wasOpen;
  const claimReady = DAILY_ORDERS.some((order) => {
    try {
      return Boolean(order.check(state)) && !state.daily?.claimed?.[order.key];
    } catch {
      return false;
    }
  });
  root.querySelectorAll('.questReady, .hasQuest').forEach((el) => {
    el.classList.remove('questReady', 'hasQuest');
  });
  if (claimReady) {
    root.querySelector('[data-nav-tab="menu"]')?.classList.add('questReady');
    button?.classList.add('questReady');
  }
  button?.setAttribute('aria-expanded', String(!host.hidden));
  root.documentElement?.classList.remove('firstSessionGuideActive');
}

function guidePayload(state, key) {
  const step = GUIDE_STEPS.find((item) => item.key === key) || GUIDE_STEPS[0];
  return {
    complete: false,
    step,
    stepIndex: GUIDE_STEPS.findIndex((item) => item.key === step.key),
    steps: GUIDE_STEPS,
    activeScreen: state?.activeScreen || 'hub'
  };
}

function renderQuestMenu(state, guide) {
  const step = guide.step;
  const stepHtml = step
    ? `<button class="questJump" type="button" data-action="screen" data-screen="${step.screen}" ${step.raceTab ? `data-rr-tab="${step.raceTab}"` : ''}>${step.title}</button>`
    : `<p class="questQuiet">First jobs are done.</p>`;
  const dailyHtml = DAILY_ORDERS.map((order) => {
    let status = 'Go';
    try {
      const done = order.check(state);
      const claimed = Boolean(state.daily?.claimed?.[order.key]);
      status = claimed ? 'Paid' : done ? 'Ready' : 'Go';
    } catch {}
    return `<button class="questJump" type="button" data-action="screen" data-screen="${order.screen || 'hub'}" ${order.raceTab ? `data-rr-tab="${order.raceTab}"` : ''}>${order.title}<small>${status}</small></button>`;
  }).join('');
  return `<b>Quest</b>${stepHtml}<b>Today</b>${dailyHtml}`;
}

function renderFirstSessionGuide({ step, stepIndex, steps, activeScreen }) {
  const jump = activeScreen !== step.screen
    ? `<button class="firstGuideJump" type="button" data-action="screen" data-screen="${step.screen}" aria-label="Go to ${step.label}">${step.label}</button>`
    : `<span class="firstGuideNow">${step.label}</span>`;

  return `
    <div class="firstGuideCard" data-guide-step="${step.key}">
      <div class="firstGuideIcon"><img src="${step.icon}" alt="" draggable="false"></div>
      <div class="firstGuideCopy">
        <div class="firstGuideDots" aria-label="First session guide step ${step.number} of ${steps.length}">
          ${steps.map((item, index) => `<span class="${index < stepIndex ? 'done' : index === stepIndex ? 'active' : ''}" aria-hidden="true"></span>`).join('')}
        </div>
        <b>${step.title}</b>
      </div>
      ${jump}
    </div>
  `;
}

function findGuideTargets(step, root) {
  const targets = [];
  for (const selector of step.targetSelectors) {
    root.querySelectorAll(selector).forEach((element) => {
      if (!targets.includes(element) && isVisible(element)) targets.push(element);
    });
    if (targets.length) break;
  }
  return targets;
}

function isVisible(element) {
  if (!element || element.disabled || element.hidden) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function scrollTargetIntoView(target) {
  if (!target || target.closest('.bottomNav')) return;
  target.scrollIntoView?.({ block: 'center', inline: 'nearest', behavior: 'smooth' });
}
