import { renderDataIcon } from './GamePanel.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function ActionDock({ actions = [] } = {}) {
  return `
    <div class="actionDock">
      ${actions.map((item) => {
        const action = item.action || (item.screen ? 'screen' : '');
        return `
          <button class="actionDockButton ${escapeHtml(item.className || '')}" type="button" ${action ? `data-action="${escapeHtml(action)}"` : ''} ${item.screen ? `data-screen="${escapeHtml(item.screen)}"` : ''}>
            ${item.icon ? renderDataIcon({ icon: item.icon, fallbackIcon: item.fallbackIcon }, item.label || 'Action', 'actionDockIcon') : ''}
            <span>${escapeHtml(item.label || '')}</span>
          </button>
        `;
      }).join('')}
    </div>
  `;
}
