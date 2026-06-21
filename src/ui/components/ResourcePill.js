import { currencyIconForKey } from '../../data/uiIconMap.js';
import { renderIconImage } from './GamePanel.js';

export function renderCurrencyIcon(key, label) {
  return renderIconImage(currencyIconForKey(key), `${label} icon`, 'curIcon');
}

export function renderCurrencyCapsule(key, label) {
  return `
    <div class="cur resourceCapsule" data-resource="${key}">
      ${renderCurrencyIcon(key, label)}
      <div class="curCopy"><b id="cur-${key}">0</b><span>${label}</span></div>
      <button class="curPlus" data-action="resourceShop" data-resource="${key}" aria-label="Open ${label} shop link" title="${label} shop">+</button>
    </div>
  `;
}
