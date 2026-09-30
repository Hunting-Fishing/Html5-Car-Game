import { renderDataIcon } from './GamePanel.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function ExpandableCard({
  title = '',
  subtitle = '',
  icon = '',
  fallbackIcon = '',
  badge = '',
  expanded = false,
  body = '',
  actionHtml = '',
  className = ''
} = {}) {
  return `
    <section class="expandableCard ${expanded ? 'expanded' : ''} ${escapeHtml(className)}">
      <div class="expandableCardHeader">
        ${icon ? `<span class="expandableCardIcon">${renderDataIcon({ icon, fallbackIcon }, title || 'Card', 'expandableCardIconImg')}</span>` : ''}
        <div class="expandableCardTitle">
          ${title ? `<h3>${escapeHtml(title)}</h3>` : ''}
          ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ''}
        </div>
        ${badge ? `<span class="pill expandableCardBadge">${escapeHtml(badge)}</span>` : ''}
      </div>
      ${expanded ? `<div class="expandableCardBody">${body}</div>` : ''}
      ${actionHtml ? `<div class="expandableCardActions">${actionHtml}</div>` : ''}
    </section>
  `;
}
