import { CHAINS } from '../../data/gameData.js';
import { mergeAssetForName } from '../../data/mergeAssetMap.js';
import { chainIconForKey } from '../../data/uiIconMap.js';
import { GamePanel, RewardPanel, renderDataIcon } from '../components/GamePanel.js';
import {
  activeBoardCount,
  boardLimit,
  itemDisplayName,
  normalizeMergeState,
  shelfCapacity,
  unlockedChainKeys
} from '../../systems/mergeSystem.js';

function renderChainIcon(key, label, className = 'chainIconAsset') {
  const chain = CHAINS[key];
  return renderDataIcon(chain || { icon: chainIconForKey(key) }, `${label} icon`, className);
}

function renderChainLabel(key, chain) {
  return `<span class="chainLabel">${renderChainIcon(key, chain.label, 'chainLabelIcon')}<span>${chain.label}</span></span>`;
}

export function renderMergeScreen(state) {
  normalizeMergeState(state);
  const active = activeBoardCount(state);
  const limit = boardLimit(state);
  const firstPair = firstMatchingPairIndexes(state);
  const pairSet = new Set(firstPair);
  const guideNeedsPair = !state.objectives?.firstMerge;
  return [
    RewardPanel({
      icon: 'parts',
      title: 'Merge Bay',
      subtitle: 'Supplier drops Level 1 only. Every higher item must be earned by merging.',
      badge: `${active}/${limit} permit`,
      heading: 'h2',
      className: 'mergeBayPanel',
      body: `
        <div class="notice">Next supplier item in <b>${Math.ceil(state.merge.supplierTimer)}s</b>. Shelf capacity: ${shelfCapacity(state)}.</div>
        <div class="shelf" style="margin-top:8px;">
          ${state.merge.supplierSlots.map((item, index) => renderShelfSlot(item, index)).join('')}
        </div>
        <div class="grid3" style="margin-top:8px;">
          <button class="btn small primary" data-action="placeAll" ${guideNeedsPair && !pairSet.size ? 'data-guide-target="placeAll"' : ''}>Place All</button>
          <button class="btn small" data-action="autoMerge" ${guideNeedsPair && pairSet.size ? 'data-guide-target="mergePair"' : ''}>Auto Merge</button>
          <button class="btn small red" data-action="sellSelected">Sell Selected</button>
        </div>
      `
    }),
    GamePanel({
      icon: 'parts',
      title: 'Merge Board',
      subtitle: 'Tap one item, then tap a matching level item to merge.',
      className: 'mergeBoardPanel',
      body: `<div class="board" ${guideNeedsPair && !pairSet.size ? 'data-guide-target="mergeBoard"' : ''}>${state.merge.board.map((item, index) => renderBoardCell(state, item, index, pairSet)).join('')}</div>`
    }),
    GamePanel({
      icon: 'tools',
      title: 'Merge Recipes',
      subtitle: 'Two matching items combine into the next item. Locked sets show the exact requirement.',
      className: 'mergeGuideCard',
      body: Object.entries(CHAINS).map(([key, chain]) => renderMergeChainGuide(state, key, chain)).join('')
    })
  ].join('');
}

function firstMatchingPairIndexes(state) {
  const board = state.merge.board || [];
  for (let i = 0; i < board.length; i += 1) {
    const source = board[i];
    if (!source) continue;
    for (let j = i + 1; j < board.length; j += 1) {
      const target = board[j];
      if (target && source.chain === target.chain && source.level === target.level) return [i, j];
    }
  }
  return [];
}

function renderShelfSlot(item, index) {
  if (!item) return `<button class="shelfSlot"><span class="emptyText">Empty<br>slot</span></button>`;
  return `<button class="shelfSlot ready" data-action="placeShelf" data-index="${index}" data-guide-target="supplierReady">${renderItem(item)}</button>`;
}

function renderBoardCell(state, item, index, pairSet = new Set()) {
  if (!item) return `<button class="cell" data-action="cell" data-index="${index}"><span class="emptyText">Open</span></button>`;
  const selected = state.merge.selectedIndex === index ? 'selected' : '';
  const guideTarget = !state.objectives?.firstMerge && pairSet.has(index) ? 'data-guide-target="mergePair"' : '';
  return `<button class="cell ${selected}" data-action="cell" data-index="${index}" ${guideTarget}>${renderItem(item)}</button>`;
}

function renderItem(item) {
  const chain = CHAINS[item.chain];
  const name = itemDisplayName(item);
  const asset = mergeAssetForName(name);
  const icon = asset
    ? `<img class="mergeItemArt" src="${asset}" alt="${name}" draggable="false">`
    : renderChainIcon(item.chain, chain.label, 'mergeItemArt chainFallbackArt');
  return `<div><span class="lvl">L${item.level}</span><div class="itemIcon">${icon}</div><div class="itemName">${name}</div><span class="chainTag">${chain.short}</span></div>`;
}

function renderMergeChainPreview(key, chain, unlocked) {
  const preview = chain.items.slice(0, 4).map((name) => {
    const asset = mergeAssetForName(name);
    return asset
      ? `<span class="mergeChainAsset"><img class="mergeItemArt" src="${asset}" alt="${name}" loading="eager" draggable="false"></span>`
      : `<span class="mergeChainAsset">${renderChainIcon(key, chain.label, 'mergeItemArt chainFallbackArt')}</span>`;
  }).join('');
  return `<div class="mergeChainPreview ${unlocked ? '' : 'locked'}" aria-label="${chain.label} asset preview">${preview}</div>`;
}

function mergeChainRequirement(state, key) {
  if (key === 'performance') {
    const level = state.buildings?.tuningCorner || 0;
    return {
      met: level > 0,
      text: `Build Tuning Corner Lv 1 (${level}/1)`,
      actionScreen: 'garage'
    };
  }
  if (key === 'racing') {
    const level = state.buildings?.testTrack || 0;
    return {
      met: level > 0,
      text: `Build 2D Test Track Lv 1 (${level}/1)`,
      actionScreen: 'garage'
    };
  }
  return { met: true, text: 'Unlocked from start', actionScreen: null };
}

function renderMergeChainGuide(state, key, chain) {
  const unlocked = unlockedChainKeys(state).includes(key);
  const req = mergeChainRequirement(state, key);
  if (!unlocked) {
    return `
      <div class="mergeRecipe locked">
        <div class="mergeRecipeHead">
          <div><b>${renderChainLabel(key, chain)}</b><span>${chain.description}</span></div>
          <span class="pill">Locked</span>
        </div>
        <div class="notice">Requirement: ${req.text}</div>
        ${renderMergeChainPreview(key, chain, false)}
        ${req.actionScreen ? `<button class="btn small gold mergeRecipeAction" data-action="screen" data-screen="${req.actionScreen}">Open Build Requirements</button>` : ''}
      </div>
    `;
  }

  return `
    <div class="mergeRecipe good">
      <div class="mergeRecipeHead">
        <div><b>${renderChainLabel(key, chain)}</b><span>${chain.description}</span></div>
        <span class="pill">Unlocked</span>
      </div>
      <div class="mergeRecipeRule">Recipe rule: <b>2 matching items</b> make the next level.</div>
      <div class="mergeChainLadder" aria-label="${chain.label} merge progression">
        ${chain.items.map((name, index) => renderMergeChainStep(key, chain, name, index)).join('')}
      </div>
    </div>
  `;
}

function renderMergeChainStep(key, chain, name, index) {
  const asset = mergeAssetForName(name);
  const next = chain.items[index + 1];
  const art = asset
    ? `<img class="mergeItemArt" src="${asset}" alt="${name}" loading="eager" draggable="false">`
    : renderChainIcon(key, chain.label, 'mergeItemArt chainFallbackArt');
  return `
    <div class="mergeChainStep">
      <div class="mergeChainLevel">L${index + 1}</div>
      <div class="mergeChainNode">${art}</div>
      <b>${name}</b>
      ${next ? `<span class="mergeChainArrow">2x -> ${next}</span>` : `<span class="mergeChainArrow final">Top item</span>`}
    </div>
  `;
}
