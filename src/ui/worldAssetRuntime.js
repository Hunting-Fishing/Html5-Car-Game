import { WORLD_ASSET_LIST } from '../data/worldAssetMap.js';

function publishWorldAssetState(screen) {
  const images = [...screen.querySelectorAll('img.worldAssetPreloadImage')];
  window.__worldAssetState = {
    mappedCount: WORLD_ASSET_LIST.length,
    renderedCount: images.length,
    readyCount: images.filter((img) => img.complete && img.naturalWidth > 0).length,
    failed: images
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.getAttribute('src'))
  };
}

function enhanceWorldAssetState() {
  const screen = document.querySelector('#screen-world.active');
  if (!screen) return;

  screen.querySelectorAll('img.worldAssetPreloadImage').forEach((img) => {
    if (img.dataset.worldAssetStateBound) return;
    img.dataset.worldAssetStateBound = '1';
    img.addEventListener('load', () => publishWorldAssetState(screen), { once: true });
    img.addEventListener('error', () => publishWorldAssetState(screen), { once: true });
  });

  publishWorldAssetState(screen);
}

const observer = new MutationObserver(() => requestAnimationFrame(enhanceWorldAssetState));
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.addEventListener('load', enhanceWorldAssetState);
document.addEventListener('click', () => requestAnimationFrame(enhanceWorldAssetState));
setInterval(enhanceWorldAssetState, 900);

