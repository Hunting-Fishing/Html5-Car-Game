import { renderPrimaryNavTab } from './BottomNav.js';
import { renderTopHud } from './TopHud.js';

export function renderShellFrame({ screens, primaryNav }) {
  return `
    <div class="appShell">
      ${renderTopHud()}
      <main class="screenHost">
        ${screens.map((screen) => `<section class="screen" id="screen-${screen.id}"></section>`).join('')}
      </main>
      <nav class="bottomNav">
        ${primaryNav.map(renderPrimaryNavTab).join('')}
      </nav>
    </div>
    <div class="toast" id="toast"></div>
  `;
}
