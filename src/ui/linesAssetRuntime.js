import { LINE_ASSETS, LINES_GUI_ASSETS } from '../data/linesAssetMap.js';

function publishLinesAssetState(screen) {
  const lineImages = [...screen.querySelectorAll('img.lineIconAsset')];
  const guiImages = [...screen.querySelectorAll('img.linesGuiAsset')];
  const allImages = [...lineImages, ...guiImages];

  window.__linesAssetState = {
    mappedLineCount: Object.keys(LINE_ASSETS).length,
    mappedGuiCount: Object.keys(LINES_GUI_ASSETS).length,
    renderedLineCount: lineImages.length,
    renderedGuiCount: guiImages.length,
    readyLineCount: lineImages.filter((img) => img.complete && img.naturalWidth > 0).length,
    readyGuiCount: guiImages.filter((img) => img.complete && img.naturalWidth > 0).length,
    failed: allImages
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.getAttribute('src'))
  };
}

function enhanceLinesAssets() {
  const screen = document.querySelector('#screen-lines.active');
  if (!screen) return;

  screen.querySelectorAll('img.lineIconAsset, img.linesGuiAsset').forEach((img) => {
    if (img.dataset.linesAssetStateBound) return;
    img.dataset.linesAssetStateBound = '1';
    img.addEventListener('load', () => publishLinesAssetState(screen), { once: true });
    img.addEventListener('error', () => publishLinesAssetState(screen), { once: true });
  });

  publishLinesAssetState(screen);
}

const observer = new MutationObserver(() => requestAnimationFrame(enhanceLinesAssets));
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.addEventListener('load', enhanceLinesAssets);
document.addEventListener('click', () => requestAnimationFrame(enhanceLinesAssets));
setInterval(enhanceLinesAssets, 900);

