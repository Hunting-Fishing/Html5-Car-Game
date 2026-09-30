import { UI_ICONS, UI_NAV_ICONS, screenIconForId } from '../../data/uiIconMap.js';

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

let assetFallbackId = 0;

export function renderIconImage(src, label, className, fallbackIcon = '') {
  const alt = escapeHtml(label);
  const safeClassName = escapeHtml(className);
  const fallbackId = fallbackIcon ? `assetFallback${assetFallbackId += 1}` : '';
  const fallback = fallbackIcon
    ? `<span id="${fallbackId}" class="${safeClassName}Fallback iconEmojiFallback" hidden aria-hidden="true" data-asset-fallback>${escapeHtml(fallbackIcon)}</span>`
    : '';
  if (!src) {
    return fallbackIcon
      ? `<span class="${safeClassName}Fallback iconEmojiFallback" aria-hidden="true" data-asset-fallback>${escapeHtml(fallbackIcon)}</span>`
      : '';
  }
  const fallbackAttr = fallbackId ? ` data-asset-fallback-id="${fallbackId}"` : '';
  return `<img class="${safeClassName}" src="${escapeHtml(src)}" alt="${alt}" loading="eager" draggable="false" data-asset-image${fallbackAttr}>${fallback}`;
}

export function panelIconSrc(icon) {
  if (isAssetIcon(icon)) return icon;
  return UI_ICONS[icon] || screenIconForId(icon) || UI_ICONS.home;
}

export function flatIconSrc(icon) {
  if (isAssetIcon(icon)) return icon;
  return UI_NAV_ICONS[icon] || panelIconSrc(icon);
}

export function renderDataIcon(data, label, className) {
  if (!data) return '';
  const icon = typeof data === 'string' ? data : data.icon;
  const fallbackIcon = typeof data === 'string' ? '' : data.fallbackIcon;
  return renderIconImage(panelIconSrc(icon), label, className, fallbackIcon);
}

export function renderFlatDataIcon(data, label, className) {
  if (!data) return '';
  const icon = typeof data === 'string' ? data : data.icon;
  const fallbackIcon = typeof data === 'string' ? '' : data.fallbackIcon;
  return renderIconImage(flatIconSrc(icon), label, className, fallbackIcon);
}

export function renderPanelHeader({ icon = 'home', fallbackIcon = '', title, subtitle = '', badge = '', heading = 'h3' }) {
  const TitleTag = heading === 'h2' ? 'h2' : 'h3';
  return `
    <div class="gamePanelHeader">
      <span class="gameIconBadge">${renderIconImage(flatIconSrc(icon), `${title} icon`, 'gameIconBadgeImg', fallbackIcon)}</span>
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
