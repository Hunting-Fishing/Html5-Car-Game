import { MERGE_ASSETS } from '../data/mergeAssetMap.js';

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
  });
}

const observer = new MutationObserver(() => requestAnimationFrame(enhanceMergeAssets));
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.addEventListener('load', enhanceMergeAssets);
document.addEventListener('click', () => requestAnimationFrame(enhanceMergeAssets));
setInterval(enhanceMergeAssets, 900);
