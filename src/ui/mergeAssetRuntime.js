import { MERGE_ASSETS } from '../data/mergeAssetMap.js';

function publishMergeAssetState(screen) {
  const images = [...screen.querySelectorAll('img.mergeItemArt')];
  window.__mergeAssetState = {
    mappedCount: Object.keys(MERGE_ASSETS).length,
    renderedCount: images.length,
    readyCount: images.filter((img) => img.complete && img.naturalWidth > 0).length,
    failed: images
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.getAttribute('src'))
  };
}

function enhanceMergeAssets() {
  const screen = document.querySelector('#screen-merge.active');
  if (!screen) return;
  screen.querySelectorAll('.cell .itemName, .shelfSlot .itemName').forEach((nameEl) => {
    const name = nameEl.textContent?.trim();
    const asset = MERGE_ASSETS[name];
    if (!asset) return;
    const wrap = nameEl.closest('.cell, .shelfSlot');
    const icon = wrap?.querySelector('.itemIcon');
    if (!icon || icon.dataset.assetReady === asset) return;
    icon.dataset.assetReady = asset;
    icon.innerHTML = `<img class="mergeItemArt" src="${asset}" alt="${name}" loading="lazy">`;
    const img = icon.querySelector('img');
    img?.addEventListener('load', () => publishMergeAssetState(screen), { once: true });
    img?.addEventListener('error', () => publishMergeAssetState(screen), { once: true });
  });
  screen.querySelectorAll('img.mergeItemArt').forEach((img) => {
    if (img.dataset.assetStateBound) return;
    img.dataset.assetStateBound = '1';
    img.addEventListener('load', () => publishMergeAssetState(screen), { once: true });
    img.addEventListener('error', () => publishMergeAssetState(screen), { once: true });
  });
  publishMergeAssetState(screen);
}

const observer = new MutationObserver(() => requestAnimationFrame(enhanceMergeAssets));
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.addEventListener('load', enhanceMergeAssets);
document.addEventListener('click', () => requestAnimationFrame(enhanceMergeAssets));
setInterval(enhanceMergeAssets, 900);
