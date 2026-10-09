import { renderCurrencyCapsule } from './ResourcePill.js';
import { publicAsset } from '../../data/assetUrl.js';

export const HUD_RESOURCE_KEYS = ['coins', 'parts', 'fuelCans', 'tools', 'scrap', 'rep', 'tune'];

export function renderTopHud() {
  return `
    <header class="topBar">
      <div class="topLine">
        <div class="brand">
          <div class="brandLogo"><img class="brandLogoImg" src="${publicAsset('/assets/brand/365-logo.png')}" alt="365 Motor Sales"></div>
          <div class="brandText"><b>Micro Garage</b><span>Playable auto world - local save</span></div>
        </div>
        <div class="hudActions">
          <div class="stagePill" aria-label="Stage 1">
            <span class="stageTrophy" aria-hidden="true"></span>
            <span class="stageCopy"><small>Stage</small><b id="stagePillValue">1</b></span>
          </div>
          <div class="questAnchor">
            <button class="questButton" type="button" data-action="toggleQuest" aria-expanded="false">Quest</button>
            <div class="questMenu" id="questMenu" hidden></div>
          </div>
          <button class="screenControlButton" data-action="screenToggle" title="Toggle fullscreen">FS</button>
        </div>
      </div>
      <div class="currencyGrid">
        ${renderCurrencyCapsule('coins', 'Coins')}
        ${renderCurrencyCapsule('parts', 'Parts')}
        ${renderCurrencyCapsule('fuelCans', 'Fuel')}
      </div>
      <div class="currencyGrid currencyGridExtra">
        ${renderCurrencyCapsule('tools', 'Tools')}
        ${renderCurrencyCapsule('scrap', 'Scrap')}
        ${renderCurrencyCapsule('rep', 'Rep')}
        ${renderCurrencyCapsule('tune', 'Tune')}
      </div>
    </header>
  `;
}

function setText(root, id, value) {
  const el = root.getElementById ? root.getElementById(id) : document.getElementById(id);
  if (el) el.textContent = value;
}

export function updateTopHud({ currencies, stage, format = (value) => value, root = document }) {
  setText(root, 'stagePillValue', stage);
  root.querySelector('.stagePill')?.setAttribute('aria-label', `Stage ${stage}`);
  HUD_RESOURCE_KEYS.forEach((key) => setText(root, `cur-${key}`, format(currencies[key])));
}
