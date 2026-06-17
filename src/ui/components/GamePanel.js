import { UI_ICONS, screenIconForId } from '../../data/uiIconMap.js';

export function renderIconImage(src, label, className) {
  return `<img class="${className}" src="${src}" alt="${label}" loading="eager" draggable="false">`;
}

export function panelIconSrc(icon) {
  return UI_ICONS[icon] || screenIconForId(icon) || UI_ICONS.home;
}

export function renderPanelHeader({ icon = 'home', title, subtitle = '', badge = '', heading = 'h3' }) {
  const TitleTag = heading === 'h2' ? 'h2' : 'h3';
  return `
    <div class="gamePanelHeader">
      <span class="gameIconBadge">${renderIconImage(panelIconSrc(icon), `${title} icon`, 'gameIconBadgeImg')}</span>
      <div class="gamePanelTitle"><${TitleTag}>${title}</${TitleTag}>${subtitle ? `<p>${subtitle}</p>` : ''}</div>
      ${badge ? `<span class="pill gamePanelBadge">${badge}</span>` : ''}
    </div>
  `;
}

export function renderGamePanelComponent(component, { icon, title, subtitle, badge = '', body = '', className = '', heading = 'h3' }) {
  return `
    <section class="card gamePanel ${component} ${className}" data-component="${component}">
      <div class="gamePanelField">
        ${renderPanelHeader({ icon, title, subtitle, badge, heading })}
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
