import { renderFlatDataIcon } from './GamePanel.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function SubTabBar({ tabs = [] } = {}) {
  return `
    <div class="subTabBar" role="tablist">
      ${tabs.map((tab) => `
        <button class="subTab ${tab.active ? 'active' : ''} ${escapeHtml(tab.className || '')}" type="button" role="tab" data-action="screen" data-screen="${escapeHtml(tab.screen || '')}" ${tab.active ? 'aria-current="page" aria-selected="true"' : 'aria-selected="false"'}>
          ${tab.icon ? renderFlatDataIcon({ icon: tab.icon, fallbackIcon: tab.fallbackIcon }, tab.label || 'Tab', 'subTabIcon') : ''}
          <span>${escapeHtml(tab.label || '')}</span>
        </button>
      `).join('')}
    </div>
  `;
}
