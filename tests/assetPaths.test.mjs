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

console.log(`asset path validation passed: ${assetRefs.size} referenced asset files exist`);
