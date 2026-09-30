import { BUILD_ASSET_LIST } from '../data/buildAssetMap.js';

function publishBuildAssetState(screen) {
  const images = [...screen.querySelectorAll('img.buildAssetPreloadImage, img.buildAssetImage')];
  window.__buildAssetState = {
    mappedCount: BUILD_ASSET_LIST.length,
    renderedCount: images.length,
    readyCount: images.filter((img) => img.complete && img.naturalWidth > 0).length,
    failed: images
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.getAttribute('src'))
  };
}

function enhanceBuildAssetState() {
  const screen = document.querySelector('#screen-garage.active');
  if (!screen) return;

  screen.querySelectorAll('img.buildAssetPreloadImage, img.buildAssetImage').forEach((img) => {
    if (img.dataset.buildAssetStateBound) return;
    img.dataset.buildAssetStateBound = '1';
    img.addEventListener('load', () => publishBuildAssetState(screen), { once: true });
    img.addEventListener('error', () => publishBuildAssetState(screen), { once: true });
  });

  publishBuildAssetState(screen);
}

const observer = new MutationObserver(() => requestAnimationFrame(enhanceBuildAssetState));
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.addEventListener('load', enhanceBuildAssetState);
document.addEventListener('click', () => requestAnimationFrame(enhanceBuildAssetState));
setInterval(enhanceBuildAssetState, 900);

