import { renderBottomNav, setBottomNavActive } from './BottomNav.js';
import { renderTopHud } from './TopHud.js';

export function renderShellFrame({ screens }) {
  return `
    <div class="appShell">
      ${renderTopHud()}
      <main class="screenHost">
        ${screens.map((screen) => `<section class="screen" id="screen-${screen.id}"></section>`).join('')}
      </main>
      <nav class="bottomNav" aria-label="Main player navigation">
        ${renderBottomNav()}
      </nav>
    </div>
    <div class="floatingRewardLayer" id="floatingRewardLayer" aria-hidden="true"></div>
    <div class="rewardToastStack" id="rewardToastStack" aria-live="polite" aria-atomic="false"></div>
    <div class="toast" id="toast"></div>
  `;
}

export function mountShell(root, { screens } = {}) {
  root.innerHTML = renderShellFrame({ screens });
}

export function getScreenElement(screenId, root = document) {
  return root.querySelector(`#screen-${screenId}`);
}

export function setActiveScreen(activeScreen, root = document) {
  root.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
  getScreenElement(activeScreen, root)?.classList.add('active');
  setBottomNavActive(activeScreen, root);
}

export function renderScreenContent(screenId, { renderers, root = document, shouldSkip } = {}) {
  const el = getScreenElement(screenId, root);
  const renderer = renderers?.[screenId];
  if (!el || !renderer) return { el, rendered: false };
  if (shouldSkip?.(screenId, el)) return { el, rendered: false };
  el.innerHTML = renderer();
  return { el, rendered: true };
}
