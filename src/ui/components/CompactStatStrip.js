import { renderFlatDataIcon } from './GamePanel.js';
import { segmentedMeter } from './StatMeter.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function CompactStatStrip({ stats = [] } = {}) {
  return `
    <div class="compactStatStrip">
      ${stats.map((stat) => `
        <div class="compactStatItem ${escapeHtml(stat.tone || '')}">
          ${stat.icon ? `<span class="compactStatIcon">${renderFlatDataIcon({ icon: stat.icon, fallbackIcon: stat.fallbackIcon }, stat.label || 'Stat', 'compactStatIconImg')}</span>` : ''}
          <div class="compactStatCopy">
            <span>${escapeHtml(stat.label || '')}</span>
            <b>${escapeHtml(stat.displayValue ?? stat.value ?? '')}</b>
          </div>
          ${stat.max !== undefined ? segmentedMeter({ value: stat.value, max: stat.max, label: stat.label || 'Stat', className: `compactStatMeter ${stat.tone || ''}`, dangerHigh: stat.dangerHigh || stat.tone === 'dangerHigh' }) : ''}
        </div>
      `).join('')}
    </div>
  `;
}
