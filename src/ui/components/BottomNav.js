import { screenIconForId } from '../../data/uiIconMap.js';
import { renderIconImage } from './GamePanel.js';

export function renderScreenIcon(screen) {
  return renderIconImage(screenIconForId(screen.id), `${screen.label} icon`, 'tabIcon');
}

export function renderPrimaryNavTab(tab) {
  return `<button class="tab" data-action="screen" data-screen="${tab.screen}" data-nav-tab="${tab.id}" data-active-screens="${tab.activeScreens.join(',')}">${renderScreenIcon(tab)}<span>${tab.label}</span></button>`;
}
