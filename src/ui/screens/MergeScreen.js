import { CHAINS } from '../../data/gameData.js';
import { mergeAssetForName } from '../../data/mergeAssetMap.js';
import { chainIconForKey } from '../../data/uiIconMap.js';
import { renderDataIcon } from '../components/GamePanel.js';
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
  const drawerTab = ['recipes', 'chains', 'tips'].includes(state.merge.activeTab) ? state.merge.activeTab : 'recipes';
  const selectedChain = selectedMergeChainKey(state);
  const shelfGuideTarget = guideNeedsPair && !pairSet.size ? ' data-guide-target="placeAll"' : '';

  return `
    <section class="card gamePanel RewardPanel mergeUnifiedPanel mergePlayArea" data-component="RewardPanel">
      <div class="gamePanelField">
        <div class="mergeUnifiedHeader">
          <span class="gameIconBadge">${renderDataIcon('parts', 'Parts icon', 'gameIconBadgeImg')}</span>
          <div class="mergeUnifiedTitle">
            <h2>Merge Board</h2>
            <p>Merge pairs.</p>
          </div>
          <div class="mergeBayDock" aria-label="Merge Bay supplier slots">
            <div class="mergeBayDockMeta">
              <b>${Math.ceil(state.merge.supplierTimer)}s</b>
              <span>${active}/${limit}</span>
            </div>
            <div class="miniShelf"${shelfGuideTarget}>
              ${state.merge.supplierSlots.map((item, index) => renderMiniShelfSlot(item, index)).join('')}
            </div>
          </div>
        </div>

        <div class="mergeBoardActions">
          <button class="btn small primary" data-action="placeAll" ${guideNeedsPair && !pairSet.size ? 'data-guide-target="placeAll"' : ''}>Place All</button>
          <button class="btn small" data-action="autoMerge" ${guideNeedsPair && pairSet.size ? 'data-guide-target="mergePair"' : ''}>Auto Merge</button>
          <button class="btn small red" data-action="sellSelected">Sell</button>
        </div>

        <div class="mergeBoardArea">
          <div class="board mergeBoardGrid" ${guideNeedsPair && !pairSet.size ? 'data-guide-target="mergeBoard"' : ''}>${state.merge.board.map((item, index) => renderBoardCell(state, item, index, pairSet)).join('')}</div>
        </div>

        <div class="mergeRecipeDrawer">
          <div class="mergeBoardTabs mergeDrawerTabs" role="tablist" aria-label="Parts guide sections">
            <button class="mergeBoardTab ${drawerTab === 'recipes' ? 'active' : ''}" type="button" role="tab" data-action="mergeTab" data-tab="recipes" aria-selected="${drawerTab === 'recipes'}">Recipes</button>
            <button class="mergeBoardTab ${drawerTab === 'chains' ? 'active' : ''}" type="button" role="tab" data-action="mergeTab" data-tab="chains" aria-selected="${drawerTab === 'chains'}">Chains</button>
            <button class="mergeBoardTab ${drawerTab === 'tips' ? 'active' : ''}" type="button" role="tab" data-action="mergeTab" data-tab="tips" aria-selected="${drawerTab === 'tips'}">Tips</button>
          </div>

          <div class="mergeDrawerPane ${drawerTab === 'recipes' ? 'active' : ''}" data-merge-pane="recipes">
            <div class="mergeChainCompactList">
              ${Object.entries(CHAINS).map(([key, chain]) => renderMergeChainCompact(state, key, chain, selectedChain)).join('')}
            </div>
            ${renderMergeChainDetail(state, selectedChain, CHAINS[selectedChain])}
          </div>

          <div class="mergeDrawerPane ${drawerTab === 'chains' ? 'active' : ''}" data-merge-pane="chains">
            <div class="mergeRecipesPane mergeChainsPane">
              ${Object.entries(CHAINS).map(([key, chain]) => renderMergeChainSummary(state, key, chain)).join('')}
            </div>
          </div>

          <div class="mergeDrawerPane ${drawerTab === 'tips' ? 'active' : ''}" data-merge-pane="tips">
            ${renderMergeTips(state, active, limit)}
          </div>
        </div>
      </div>
    </section>
  `;
}

function selectedMergeChainKey(state) {
  const keys = Object.keys(CHAINS);
  const saved = state.merge.selectedChain;
  if (saved && keys.includes(saved)) return saved;
  const unlocked = unlockedChainKeys(state).find((key) => keys.includes(key));
  return unlocked || keys[0];
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

function renderMiniShelfSlot(item, index) {
  if (!item) return `<button class="miniShelfSlot" type="button" disabled><span class="emptyText">+</span></button>`;
  return `<button class="miniShelfSlot ready" type="button" data-action="placeShelf" data-index="${index}" data-guide-target="supplierReady">${renderItem(item)}</button>`;
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

function renderMergeChainCompact(state, key, chain, selectedChain) {
  const unlocked = unlockedChainKeys(state).includes(key);
  const req = mergeChainRequirement(state, key);
  return `
    <button class="mergeChainCompact ${unlocked ? 'unlocked' : 'locked'} ${selectedChain === key ? 'selected' : ''}" type="button" data-action="mergeChain" data-chain="${key}">
      <div class="mergeRecipeHead">
        <div><b>${renderChainLabel(key, chain)}</b><span>${chain.description}</span></div>
        <span class="pill">${unlocked ? 'Open' : 'Locked'}</span>
      </div>
      <span class="mergeChainRequirement">${unlocked ? '2 matching items make next level.' : req.text}</span>
      ${renderMergeChainPreview(key, chain, unlocked)}
    </button>
  `;
}

function renderMergeChainDetail(state, key, chain) {
  if (!chain) return '';
  const unlocked = unlockedChainKeys(state).includes(key);
  const req = mergeChainRequirement(state, key);
  if (!unlocked) {
    return `
      <div class="mergeRecipe mergeChainDetail locked">
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
    <div class="mergeRecipe mergeChainDetail good">
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

function renderMergeChainSummary(state, key, chain) {
  const unlocked = unlockedChainKeys(state).includes(key);
  const req = mergeChainRequirement(state, key);
  return `
    <div class="mergeRecipe mergeCompactRecipe ${unlocked ? 'good' : 'locked'}">
      <div class="mergeRecipeHead">
        <div><b>${renderChainLabel(key, chain)}</b><span>${chain.description}</span></div>
        <span class="pill">${unlocked ? 'Unlocked' : 'Locked'}</span>
      </div>
      <div class="${unlocked ? 'mergeRecipeRule' : 'notice'}">${unlocked ? '2 matching items make the next level.' : `Requirement: ${req.text}`}</div>
      ${renderMergeChainPreview(key, chain, unlocked)}
      ${!unlocked && req.actionScreen ? `<button class="btn small gold mergeRecipeAction" data-action="screen" data-screen="${req.actionScreen}">Open Build Requirements</button>` : ''}
    </div>
  `;
}

function renderMergeTips(state, active, limit) {
  const selected = selectedMergeChainKey(state);
  const selectedLabel = CHAINS[selected]?.label || 'Original Parts';
  return `
    <div class="mergeTipsGrid">
      <div class="mergeTipCard">
        <b>Board Space</b>
        <span>${active}/${limit} filled</span>
      </div>
      <div class="mergeTipCard">
        <b>Supplier Bay</b>
        <span>${shelfCapacity(state)} slots ready</span>
      </div>
      <div class="mergeTipCard">
        <b>Selected Chain</b>
        <span>${selectedLabel}</span>
      </div>
      <div class="mergeTipCard">
        <b>Fast Rule</b>
        <span>Tap two matching levels or use Auto Merge.</span>
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
