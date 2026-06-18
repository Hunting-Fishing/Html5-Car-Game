import { UI_ICONS, screenIconForId } from '../../data/uiIconMap.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isAssetIcon(icon) {
  return typeof icon === 'string' && (
    icon.startsWith('/') ||
    icon.startsWith('./') ||
    icon.startsWith('../') ||
    icon.startsWith('http://') ||
    icon.startsWith('https://')
  );
}

export function renderIconImage(src, label, className, fallbackIcon = '') {
  const alt = escapeHtml(label);
  const fallback = fallbackIcon
    ? `<span class="${className}Fallback iconEmojiFallback" hidden aria-hidden="true">${escapeHtml(fallbackIcon)}</span>`
    : '';
  if (!src) {
    return fallbackIcon
      ? `<span class="${className}Fallback iconEmojiFallback" aria-hidden="true">${escapeHtml(fallbackIcon)}</span>`
      : '';
  }
  const onError = fallback ? 'this.hidden=true;this.nextElementSibling.hidden=false' : 'this.hidden=true';
  return `<img class="${className}" src="${escapeHtml(src)}" alt="${alt}" loading="eager" draggable="false" onerror="${onError}">${fallback}`;
}

export function panelIconSrc(icon) {
  if (isAssetIcon(icon)) return icon;
  return UI_ICONS[icon] || screenIconForId(icon) || UI_ICONS.home;
}

export function renderDataIcon(data, label, className) {
  if (!data) return '';
  const icon = typeof data === 'string' ? data : data.icon;
  const fallbackIcon = typeof data === 'string' ? '' : data.fallbackIcon;
  return renderIconImage(panelIconSrc(icon), label, className, fallbackIcon);
}

export function renderPanelHeader({ icon = 'home', fallbackIcon = '', title, subtitle = '', badge = '', heading = 'h3' }) {
  const TitleTag = heading === 'h2' ? 'h2' : 'h3';
  return `
    <div class="gamePanelHeader">
      <span class="gameIconBadge">${renderIconImage(panelIconSrc(icon), `${title} icon`, 'gameIconBadgeImg', fallbackIcon)}</span>
      <div class="gamePanelTitle"><${TitleTag}>${title}</${TitleTag}>${subtitle ? `<p>${subtitle}</p>` : ''}</div>
      ${badge ? `<span class="pill gamePanelBadge">${badge}</span>` : ''}
    </div>
  `;
}

export function renderGamePanelComponent(component, { icon, fallbackIcon = '', title, subtitle, badge = '', body = '', className = '', heading = 'h3' }) {
  return `
    <section class="card gamePanel ${component} ${className}" data-component="${component}">
      <div class="gamePanelField">
        ${renderPanelHeader({ icon, fallbackIcon, title, subtitle, badge, heading })}
        <div class="gamePanelBody">${body}</div>
      </div>
    </section>
  `;
}

export function GamePanel(options) {
  return renderGamePanelComponent('GamePanel', options);
}

export function RouteCard(options) {
  return renderGamePanelComponent('RouteCard', options);
}

export function GarageCard(options) {
  return renderGamePanelComponent('GarageCard', options);
}

export function ObjectiveCard(options) {
  return renderGamePanelComponent('ObjectiveCard', options);
}

export function ProblemAlert(options) {
  return renderGamePanelComponent('ProblemAlert', options);
}

export function RewardPanel(options) {
  return renderGamePanelComponent('RewardPanel', options);
}
