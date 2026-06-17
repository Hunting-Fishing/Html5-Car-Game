import { panelIconSrc, renderIconImage } from './GamePanel.js';

export function renderRowComponent(component, { icon, title, subtitle = '', badge = '', body = '', action = '', className = '' }) {
  return `
    <article class="gameRowCard ${component} ${className}" data-component="${component}">
      <span class="gameIconBadge">${renderIconImage(panelIconSrc(icon), `${title} icon`, 'gameIconBadgeImg')}</span>
      <div class="gameRowMain">
        <div class="gameRowHead"><div><h4>${title}</h4>${subtitle ? `<p>${subtitle}</p>` : ''}</div>${badge ? `<span class="pill gamePanelBadge">${badge}</span>` : ''}</div>
        ${body}
      </div>
      ${action}
    </article>
  `;
}

export function UpgradeCard(options) {
  return renderRowComponent('UpgradeCard', options);
}
