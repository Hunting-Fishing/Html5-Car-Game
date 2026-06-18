import { UI_ICONS } from '../../data/uiIconMap.js';

const GUIDE_STEPS = [
  {
    key: 'raceBoost',
    number: 1,
    screen: 'race',
    title: 'Tap Boost',
    label: 'Race',
    icon: UI_ICONS.race,
    targetSelectors: ['[data-guide-target="raceBoost"]', '.roadRunnerPedal.gas', '[data-nav-tab="race"]']
  },
  {
    key: 'openParts',
    number: 2,
    screen: 'merge',
    title: 'Open Parts',
    label: 'Parts',
    icon: UI_ICONS.parts,
    targetSelectors: ['[data-nav-tab="parts"]', '[data-action="screen"][data-screen="merge"]']
  },
  {
    key: 'mergePair',
    number: 3,
    screen: 'merge',
    title: 'Merge Pair',
    label: '2 Match',
    icon: UI_ICONS.parts,
    targetSelectors: ['[data-guide-target="mergePair"]', '[data-guide-target="supplierReady"]', '[data-guide-target="placeAll"]', '[data-guide-target="mergeBoard"]']
  },
  {
    key: 'openGarage',
    number: 4,
    screen: 'garage',
    title: 'Open Garage',
    label: 'Garage',
    icon: UI_ICONS.garage,
    targetSelectors: ['[data-nav-tab="garage"]', '[data-action="screen"][data-screen="garage"]']
  },
  {
    key: 'buildPartsStorage',
    number: 5,
    screen: 'garage',
    title: 'Build Storage',
    label: 'Parts',
    icon: UI_ICONS.garage,
    targetSelectors: ['[data-guide-target="buildPartsStorage"]', '[data-build-system="partsStorage"]', '[data-nav-tab="garage"]']
  }
];

let lastGuideKey = '';

export function getFirstSessionGuideState(state) {
  const objectives = state?.objectives || {};
  if (objectives.buildStorage) {
    return { complete: true, step: null, stepIndex: GUIDE_STEPS.length, steps: GUIDE_STEPS };
  }

  if (!objectives.firstTap) {
    return guidePayload(state, 'raceBoost');
  }

  if (!objectives.firstMerge) {
    return guidePayload(state, state.activeScreen === 'merge' ? 'mergePair' : 'openParts');
  }

  return guidePayload(state, state.activeScreen === 'garage' ? 'buildPartsStorage' : 'openGarage');
}

export function updateFirstSessionGuide(state, root = document) {
  const host = root.querySelector('#firstSessionGuide');
  if (!host) return;

  root.querySelectorAll('.guideTargetActive').forEach((target) => {
    target.classList.remove('guideTargetActive');
    target.removeAttribute('data-guide-active');
  });

  const guide = getFirstSessionGuideState(state);
  if (guide.complete || !guide.step) {
    host.hidden = true;
    host.innerHTML = '';
    host.removeAttribute('data-guide-step');
    root.documentElement?.classList.remove('firstSessionGuideActive');
    return;
  }

  host.hidden = false;
  if (host.dataset.guideStep !== guide.step.key) {
    host.dataset.guideStep = guide.step.key;
    host.innerHTML = renderFirstSessionGuide(guide);
  }
  root.documentElement?.classList.add('firstSessionGuideActive');

  const targets = findGuideTargets(guide.step, root);
  targets.slice(0, 4).forEach((target) => {
    target.classList.add('guideTargetActive');
    target.setAttribute('data-guide-active', guide.step.key);
  });

  if (guide.step.key !== lastGuideKey) {
    lastGuideKey = guide.step.key;
    scrollTargetIntoView(targets[0]);
  }
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
