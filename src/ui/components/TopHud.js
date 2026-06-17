import { renderCurrencyCapsule } from './ResourcePill.js';

export function renderTopHud() {
  return `
    <header class="topBar">
      <div class="topLine">
        <div class="brand">
          <div class="brandLogo">365</div>
          <div class="brandText"><b>Micro Garage</b><span>Playable auto world - local save</span></div>
        </div>
        <div class="topActions">
          <button class="screenControlButton" data-action="screenToggle" title="Toggle fullscreen">FS</button>
        </div>
      </div>
      <div class="walletRow">
        <div class="currencyGrid">
          ${renderCurrencyCapsule('coins', 'Coins')}
          ${renderCurrencyCapsule('parts', 'Parts')}
          ${renderCurrencyCapsule('tools', 'Tools')}
          ${renderCurrencyCapsule('scrap', 'Scrap')}
          ${renderCurrencyCapsule('tune', 'Tune')}
          ${renderCurrencyCapsule('rep', 'Rep')}
        </div>
        <div class="stagePill" aria-label="Stage 1">
          <span class="stageTrophy" aria-hidden="true"></span>
          <span class="stageCopy"><small>Stage</small><b id="stagePillValue">1</b></span>
        </div>
      </div>
    </header>
  `;
}
