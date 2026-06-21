function includesAny(value, words) {
  const v = String(value || '').toLowerCase();
  return words.some((word) => v.includes(String(word).toLowerCase()));
}

function publicPath(item) {
  return typeof item === 'string' ? item : item?.publicPath;
}

function findAsset(list, keywords = []) {
  const items = Array.isArray(list) ? list : [];
  return publicPath(items.find((item) => {
    const path = publicPath(item) || '';
    const name = item.name || path;
    return includesAny(name, keywords) || includesAny(path, keywords);
  }));
}

function cssUrl(path) {
  return path ? `url("${path}")` : 'none';
}

async function loadUiSkin() {
  try {
    const res = await fetch('/assets/generated/kenney-manifest.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`manifest HTTP ${res.status}`);
    const manifest = await res.json();

    const buttons = manifest.buttons || manifest.ui || [];
    const panels = manifest.panels || manifest.ui || [];
    const icons = manifest.icons || manifest.ui || [];

    const button = findAsset(buttons, ['button', 'btn', 'green', 'blue', 'orange']);
    const panel = findAsset(panels, ['panel', 'window', 'popup', 'frame', 'box', 'container']);
    const buildIcon = findAsset(icons, ['build', 'hammer', 'shop', 'plus']);
    const shopIcon = findAsset(icons, ['shop', 'store', 'garage']);
    const confirmIcon = findAsset(icons, ['check', 'confirm', 'ok', 'yes']);
    const cancelIcon = findAsset(icons, ['close', 'cancel', 'no', 'x']);

    const root = document.documentElement;
    root.style.setProperty('--ui-pack-button', cssUrl(button));
    root.style.setProperty('--ui-pack-panel', cssUrl(panel));
    root.style.setProperty('--ui-pack-icon-build', cssUrl(buildIcon || shopIcon));
    root.style.setProperty('--ui-pack-icon-shop', cssUrl(shopIcon || buildIcon));
    root.style.setProperty('--ui-pack-icon-confirm', cssUrl(confirmIcon));
    root.style.setProperty('--ui-pack-icon-cancel', cssUrl(cancelIcon));

    console.info('[365 UI Skin] UI assets applied:', {
      button,
      panel,
      buildIcon,
      shopIcon,
      confirmIcon,
      cancelIcon,
      counts: manifest.counts
    });
  } catch (error) {
    console.warn('[365 UI Skin] No UI art manifest found yet. Run scripts/generate-kenney-manifest.ps1 after adding the UI pack.', error);
  }
}

loadUiSkin();
