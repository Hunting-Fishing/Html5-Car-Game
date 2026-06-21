import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(rootDir, 'public');
const srcDir = path.join(rootDir, 'src');

const dataModules = [
  'src/data/gameData.js',
  'src/data/uiIconMap.js',
  'src/data/visualData.js',
  'src/data/mergeAssetMap.js',
  'src/data/racerVehicleAssetMap.js',
  'src/data/linesAssetMap.js',
  'src/data/buildAssetMap.js',
  'src/data/worldAssetMap.js'
];

const assetRefs = new Map();

function addAssetRef(src, label) {
  if (!isAssetFile(src)) return;
  const key = normalizeAssetPath(src);
  if (!assetRefs.has(key)) assetRefs.set(key, new Set());
  assetRefs.get(key).add(label);
}

function isAssetFile(value) {
  return typeof value === 'string' && /^\/assets\/.+\.[a-z0-9]+([?#].*)?$/i.test(value);
}

function normalizeAssetPath(src) {
  return src.split(/[?#]/, 1)[0];
}

function collectExportedAssets(value, label) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectExportedAssets(item, `${label}[${index}]`));
    return;
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, entry]) => collectExportedAssets(entry, `${label}.${key}`));
    return;
  }
  addAssetRef(value, label);
}

async function collectDataModuleAssets() {
  for (const relPath of dataModules) {
    const modulePath = path.join(rootDir, relPath);
    const mod = await import(pathToFileURL(modulePath).href);
    for (const [exportName, value] of Object.entries(mod)) {
      collectExportedAssets(value, `${relPath}:${exportName}`);
    }
  }
}

function walkFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, out);
    } else if (/\.(css|js|mjs)$/.test(entry.name)) {
      out.push(fullPath);
    }
  }
  return out;
}

function collectLiteralAssetRefs() {
  const assetLiteralPattern = /\/assets\/[^'"`)\s]+/g;
  for (const filePath of walkFiles(srcDir)) {
    const relPath = path.relative(rootDir, filePath).replaceAll(path.sep, '/');
    const source = fs.readFileSync(filePath, 'utf8');
    for (const match of source.matchAll(assetLiteralPattern)) {
      addAssetRef(match[0], `${relPath}:${source.slice(0, match.index).split('\n').length}`);
    }
  }
}

function publicPathForAsset(src) {
  const decoded = decodeURIComponent(normalizeAssetPath(src));
  return path.join(publicDir, decoded.replace(/^\/+/, '').replaceAll('/', path.sep));
}

function assertAssetExists(src, label) {
  assert.ok(isAssetFile(src), `${label} should be an /assets file path: ${src}`);
  assert.ok(fs.existsSync(publicPathForAsset(src)), `${label} is missing public asset file: ${src}`);
}

function flattenAssetEntries(value, prefix = 'asset') {
  const entries = [];
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      entries.push(...flattenAssetEntries(item, `${prefix}[${index}]`));
    });
    return entries;
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, entry]) => {
      entries.push(...flattenAssetEntries(entry, `${prefix}.${key}`));
    });
    return entries;
  }
  if (isAssetFile(value)) entries.push([prefix, value]);
  return entries;
}

function assertAssetGroup(name, value, minCount = 1) {
  const entries = flattenAssetEntries(value, name);
  assert.ok(entries.length >= minCount, `${name} should include at least ${minCount} asset paths`);
  for (const [label, src] of entries) {
    assertAssetExists(src, label);
  }
}

await collectDataModuleAssets();
collectLiteralAssetRefs();

const missing = [...assetRefs.entries()]
  .map(([src, labels]) => ({ src, labels: [...labels].sort(), filePath: publicPathForAsset(src) }))
  .filter((item) => !fs.existsSync(item.filePath));

assert.equal(
  missing.length,
  0,
  `Missing public asset paths:\n${missing.map((item) => `- ${item.src}\n  ${item.labels.join('\n  ')}`).join('\n')}`
);

const gameData = await import(pathToFileURL(path.join(rootDir, 'src/data/gameData.js')).href);
const uiIconMap = await import(pathToFileURL(path.join(rootDir, 'src/data/uiIconMap.js')).href);
const buildAssetMap = await import(pathToFileURL(path.join(rootDir, 'src/data/buildAssetMap.js')).href);
const mergeAssetMap = await import(pathToFileURL(path.join(rootDir, 'src/data/mergeAssetMap.js')).href);
const linesAssetMap = await import(pathToFileURL(path.join(rootDir, 'src/data/linesAssetMap.js')).href);
const gamePanel = await import(pathToFileURL(path.join(rootDir, 'src/ui/components/GamePanel.js')).href);

assertAssetGroup('HUD icons', uiIconMap.CURRENCY_ICON_MAP, 7);
assertAssetGroup('nav icons', uiIconMap.SCREEN_ICON_MAP, 5);
assertAssetGroup('race route icons', Object.fromEntries(Object.entries(gameData.RACE_MODES).map(([key, mode]) => [key, mode.icon])), 5);
assertAssetGroup('merge assets', mergeAssetMap.MERGE_ASSETS, 48);
assertAssetGroup('build room assets', buildAssetMap.BUILD_ROOM_ASSETS, 6);
assertAssetGroup('line assets', linesAssetMap.LINE_ASSETS, 8);
assertAssetGroup('race scene assets', {
  streetLoop: '/assets/race/backgrounds/street_loop.png',
  partsDelivery: '/assets/race/backgrounds/parts_delivery.png',
  fuelSaver: '/assets/race/backgrounds/fuel_saver.png',
  roughRoad: '/assets/race/backgrounds/rough_road.png',
  dealerShowcase: '/assets/race/backgrounds/dealer_showcase.png',
  starterCompact: '/assets/race/cars/starter_compact.png',
  roadStrip: '/assets/race/fx/road_strip.png',
  speedStreaks: '/assets/race/fx/speed_streaks.png',
  tapBoostRing: '/assets/race/fx/tap_boost_ring.png',
  checkpointFlag: '/assets/race/fx/checkpoint_flag.png',
  warningPanel: '/assets/race/fx/warning_panel.png',
  warningBadge: '/assets/race/fx/warning_badge.png'
}, 12);

const iconMarkup = gamePanel.renderIconImage('/assets/ui/icons/home.png', 'Home', 'assetIconTest', 'HOME');
assert.match(iconMarkup, /data-asset-image/, 'renderIconImage should mark images for delegated fallback handling');
assert.match(iconMarkup, /data-asset-fallback-id=/, 'renderIconImage should link image to fallback node');
assert.match(iconMarkup, /data-asset-fallback/, 'renderIconImage should render a fallback node when fallbackIcon is provided');
assert.doesNotMatch(iconMarkup, /onerror=/, 'renderIconImage should not rely on inline onerror handlers');

console.log(`asset path validation passed: ${assetRefs.size} referenced asset files exist across required asset groups`);
