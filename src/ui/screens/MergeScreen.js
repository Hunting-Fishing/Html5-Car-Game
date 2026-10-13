import { CHAINS, CUSTOMER_TEMPLATES } from '../../data/gameData.js';
import { mergeAssetForName } from '../../data/mergeAssetMap.js';
import { chainIconForKey } from '../../data/uiIconMap.js';
import { renderDataIcon } from '../components/GamePanel.js';
import {
  activeBoardCount,
  boardLimit,
  itemDisplayName,
  normalizeMergeState,
  shelfCapacity,
  unlockedChainKeys,
  getTutorialHint
} from '../../systems/mergeSystem.js';

function renderChainIcon(key, label, className = 'chainIconAsset') {
  const chain = CHAINS[key];
  return renderDataIcon(chain || { icon: chainIconForKey(key) }, `${label} icon`, className);
}

function renderChainLabel(key, chain) {
  return `<span class="chainLabel">${renderChainIcon(key, chain.label, 'chainLabelIcon')}<span>${chain.label}</span></span>`;
}

function renderCongrats(delivery) {
  if (!delivery) return '';
  const rewardLines = Object.entries(delivery.rewards || {}).map(([k, v]) => `${k}: +${v}`).join('<br>');
  return `<div class="congratsOverlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;z-index:200;">
    <div style="background:#fff;padding:24px;border-radius:16px;text-align:center;max-width:280px;color:#111;">
      <div style="font-size:2em;">⭐</div>
      <h3 style="margin:8px 0;">Congrats!</h3>
      <p style="margin:4px 0;">${delivery.title}</p>
      <p style="font-size:0.9em;">${rewardLines}<br>Energy: +${delivery.energy}</p>
      <button class="btn small primary" data-action="clearLastDelivery" style="margin-top:12px;">Collect</button>
    </div>
  </div>`;
}

function selectedItemInfo(state) {
  const idx = state.merge.selectedIndex;
  const item = idx != null ? state.merge.board[idx] : null;
  if (!item || item.type === 'cobweb') return '';
  const name = itemDisplayName(item);
  let next = 'Top item';
  if (item.type === 'generator') {
    next = `Produces L${Math.min(item.level || 1, 3)} items. Merge two to upgrade.`;
  } else if (item.level < (CHAINS[item.chain]?.items.length || 1)) {
    next = `Merge to become ${itemDisplayName({ ...item, level: item.level + 1 })}`;
  }
  return `<div class="mergeSelectedInfo">
    <div class="mergeSelectedArt">${renderItem(item)}</div>
    <div class="mergeSelectedCopy">
      <b>${name}</b>
      <span>${next}</span>
    </div>
  </div>`;
}

function renderShop(state) {
  const upgrades = state.merge.energyUpgrades || 0;
  const capCost = 150 + upgrades * 80;
  const freeReady = Date.now() - (state.merge.lastFreeEnergy || 0) >= 5 * 60 * 1000;
  return `<details class="mergeShop">
    <summary>Shop</summary>
    <div class="mergeShopRow">
      <button class="btn small gold" data-action="buyEnergyPack">Energy Pack +15 (80 coins)</button>
      <button class="btn small" data-action="upgradeEnergyCap" ${upgrades >= 5 ? 'disabled' : ''}>Raise Cap +10 (${capCost})</button>
      <button class="btn small" data-action="freeEnergyRefill" ${freeReady ? '' : 'disabled'}>Free Energy (ad)</button>
    </div>
  </details>`;
}

export function renderMergeScreen(state) {
  normalizeMergeState(state);
  const active = activeBoardCount(state);
  const limit = boardLimit(state);
  const firstPair = firstMatchingPairIndexes(state);
  const pairSet = new Set(firstPair);
  const guideNeedsPair = !state.objectives?.firstMerge;
  const energy = Math.floor(state.merge.energy || 0);
  const maxEnergy = state.merge.maxEnergy || 50;
  const hint = getTutorialHint(state);
  const delivery = state.merge.lastDelivery;
  const visualSlots = 42;

  return `
    ${renderCongrats(delivery)}
    <section class="mergeLazadaScreen">
      <div class="mergeTopBar">
        <div class="mergeEnergyPill">⚡ ${energy}/${maxEnergy}</div>
        <div class="mergeBoardMeta">${active}/${limit} open</div>
      </div>

      ${renderCustomers(state)}

      ${hint ? `<div class="mergeHint">${hint}</div>` : ''}

      ${selectedItemInfo(state)}

      <div class="mergeBoardArea">
        <div class="board mergeBoardGrid lazadaBoard" ${guideNeedsPair && !pairSet.size ? 'data-guide-target="mergeBoard"' : ''}>
          ${Array.from({ length: visualSlots }, (_, index) => {
            if (index >= limit) {
              return `<button class="cell locked crate" type="button" disabled aria-label="Locked crate"><span class="crateIcon">📦</span></button>`;
            }
            const item = state.merge.board[index] || null;
            return renderBoardCell(state, item, index, pairSet);
          }).join('')}
        </div>
      </div>

      <div class="mergeBottomActions">
        <button class="btn small primary" data-action="placeAll">Place</button>
        <button class="btn small" data-action="autoMerge">Merge</button>
        <button class="btn small red" data-action="sellSelected">Sell</button>
      </div>

      ${renderShop(state)}

      <details class="mergeRecipeDrawer">
        <summary>Recipes & tips</summary>
        ${renderMergeTips(state, active, limit)}
        <div class="mergeChainCompactList">
          ${Object.entries(CHAINS).map(([key, chain]) => renderMergeChainCompact(state, key, chain, selectedMergeChainKey(state))).join('')}
        </div>
      </details>
    </section>
  `;
}

function renderCustomers(state) {
  const customers = state.merge.customers || [];
  if (!customers.length) return '<div class="mergeCustomersEmpty">Waiting for customers…</div>';
  return `<div class="mergeCustomerStrip">
    ${customers.map(c => {
      const chain = CHAINS[c.chain];
      const needName = chain?.items[(c.level || 1) - 1] || 'Item';
      const asset = mergeAssetForName(needName);
      const art = asset ? `<img class="customerNeedArt" src="${asset}" alt="${needName}">` : renderChainIcon(c.chain, chain?.label || needName, 'customerNeedArt');
      const coins = c.reward?.coins || 0;
      return `<div class="customerCard">
        <div class="customerHead">
          <div class="customerAvatar">👤</div>
          <div class="customerReward">💰 ${coins}</div>
        </div>
        <div class="customerNeed">${art}</div>
        <div class="customerTitle">${c.title}</div>
        <button class="btn small primary" data-action="deliverCustomer" data-customer="${c.id}">Deliver</button>
      </div>`;
    }).join('')}
  </div>`;
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
    if (!source || source.type === 'cobweb') continue;
    for (let j = i + 1; j < board.length; j += 1) {
      const target = board[j];
      if (target && target.type !== 'cobweb' && source.chain === target.chain && source.level === target.level) return [i, j];
    }
  }
  return [];
}

function renderBoardCell(state, item, index, pairSet = new Set()) {
  if (!item) return `<button class="cell" data-action="cell" data-index="${index}" aria-label="Empty slot"></button>`;
  if (item.type === 'cobweb') {
    return `<button class="cell cobweb" data-action="clearCobweb" data-index="${index}" aria-label="Clear cobweb"><span class="cobwebIcon">🕸</span></button>`;
  }
  const selected = state.merge.selectedIndex === index ? 'selected' : '';
  const guideTarget = !state.objectives?.firstMerge && pairSet.has(index) ? 'data-guide-target="mergePair"' : '';
  const isGen = item.type === 'generator';
  const action = isGen ? 'tapGenerator' : 'cell';
  return `<button class="cell ${selected} ${isGen ? 'generator' : ''}" data-action="${action}" data-index="${index}" ${guideTarget}>${renderItem(item)}</button>`;
}

function renderItem(item) {
  const chain = CHAINS[item.chain];
  const name = itemDisplayName(item);
  const asset = mergeAssetForName(name);
  const icon = asset
    ? `<img class="mergeItemArt" src="${asset}" alt="${name}" draggable="false">`
    : renderChainIcon(item.chain, chain?.label || name, 'mergeItemArt chainFallbackArt');
  const tag = item.type === 'generator' ? 'GEN' : '';
  return `<div class="itemInner"><span class="lvl">L${item.level}</span><div class="itemIcon">${icon}</div>${tag ? `<span class="chainTag">${tag}</span>` : ''}</div>`;
}

function mergeChainRequirement(state, key) {
  if (key === 'performance') {
    const level = state.buildings?.tuningCorner || 0;
    return { met: level > 0, text: `Build Tuning Corner (${level}/1)` };
  }
  if (key === 'racing') {
    const level = state.buildings?.testTrack || 0;
    return { met: level > 0, text: `Build Test Track (${level}/1)` };
  }
  return { met: true, text: 'Unlocked' };
}

function renderMergeChainCompact(state, key, chain, selectedChain) {
  const unlocked = unlockedChainKeys(state).includes(key);
  const req = mergeChainRequirement(state, key);
  return `<div class="mergeChainCompact ${unlocked ? 'unlocked' : 'locked'}">
    <b>${renderChainLabel(key, chain)}</b>
    <span>${unlocked ? '2 matching → next' : req.text}</span>
  </div>`;
}

function renderMergeTips(state, active, limit) {
  return `<div class="mergeTips">Board ${active}/${limit} · Merge generators for better output · Clear cobwebs · Deliver for rewards</div>`;
}
