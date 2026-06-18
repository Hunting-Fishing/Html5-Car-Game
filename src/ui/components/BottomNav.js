import { UI_ICONS, screenIconForId } from '../../data/uiIconMap.js';
import { renderIconImage } from './GamePanel.js';

export const PRIMARY_NAV = [
  { id: 'home', screen: 'hub', label: 'Home', icon: UI_ICONS.home, fallbackIcon: '\u{1F3E0}', activeScreens: ['hub', 'world'] },
  { id: 'race', screen: 'race', label: 'Race', icon: UI_ICONS.race, fallbackIcon: '\u{1F697}', activeScreens: ['race'] },
  { id: 'parts', screen: 'merge', label: 'Parts', icon: UI_ICONS.parts, fallbackIcon: '\u{1F527}', activeScreens: ['merge'] },
  { id: 'garage', screen: 'garage', label: 'Garage', icon: UI_ICONS.garage, fallbackIcon: '\u{1F3D7}\uFE0F', activeScreens: ['garage', 'lines'] },
  { id: 'menu', screen: 'profile', label: 'Menu', icon: UI_ICONS.menu, fallbackIcon: '\u{1F4CB}', activeScreens: ['profile', 'creator'] }
];

export function renderScreenIcon(screen) {
  return renderIconImage(screen.icon || screenIconForId(screen.id), `${screen.label} icon`, 'tabIcon', screen.fallbackIcon);
}

export function renderPrimaryNavTab(tab) {
  return `<button class="tab" type="button" data-action="screen" data-screen="${tab.screen}" data-nav-tab="${tab.id}" data-active-screens="${tab.activeScreens.join(',')}" aria-label="${tab.label} tab">${renderScreenIcon(tab)}<span>${tab.label}</span></button>`;
}

export function renderBottomNav() {
  return PRIMARY_NAV.map(renderPrimaryNavTab).join('');
}

export function setBottomNavActive(activeScreen, root = document) {
  root.querySelectorAll('.tab').forEach((tab) => {
    const activeScreens = (tab.dataset.activeScreens || tab.dataset.screen || '').split(',');
    const isActive = activeScreens.includes(activeScreen);
    tab.classList.toggle('active', isActive);
    if (isActive) {
      tab.setAttribute('aria-current', 'page');
    } else {
      tab.removeAttribute('aria-current');
    }
  });
}
