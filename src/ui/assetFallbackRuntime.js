function fallbackForImage(img) {
  const fallbackId = img.getAttribute('data-asset-fallback-id');
  const ownerDocument = img.ownerDocument || globalThis.document;
  if (fallbackId) {
    return ownerDocument?.getElementById?.(fallbackId) || null;
  }
  const next = img.nextElementSibling;
  return next?.matches?.('[data-asset-fallback]') ? next : null;
}

export function showAssetFallback(img) {
  if (!img) return;
  const fallback = fallbackForImage(img);
  img.hidden = true;
  img.classList.add('assetImageFailed');
  img.setAttribute('aria-hidden', 'true');
  img.setAttribute('data-asset-error', 'true');
  if (fallback) {
    fallback.hidden = false;
    fallback.removeAttribute('aria-hidden');
  }
}

let installed = false;

export function installAssetFallbackRuntime(root = globalThis.document) {
  if (installed || !root?.addEventListener) return false;
  root.addEventListener('error', (event) => {
    const target = event.target;
    if (!target?.matches?.('img[data-asset-image]')) return;
    showAssetFallback(target);
  }, true);
  installed = true;
  return true;
}

installAssetFallbackRuntime();
