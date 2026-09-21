import { CHAINS } from '../data/gameData.js';
import { addCurrency, addXp } from './economySystem.js';

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function unlockedChainKeys(state) {
  const keys = ['original', 'tools'];
  if (state.buildings.tuningCorner > 0 || state.lot?.owned?.tuningCorner) keys.push('performance');
  if (state.buildings.testTrack > 0 || state.lot?.owned?.testTrack) keys.push('racing');
  return keys;
}

export function boardLimit(state) {
  const lot = state.lot?.owned?.partsStorage ? 4 : 0;
  return 8 + state.upgrades.supplierShelf * 2 + state.buildings.partsStorage * 4 + lot;
}

export function shelfCapacity(state) {
  return Math.min(6, 3 + state.upgrades.supplierShelf + state.buildings.partsStorage);
}

export function normalizeMergeState(state) {
  const boardSize = 16;
  while (state.merge.board.length < boardSize) state.merge.board.push(null);
  if (state.merge.board.length > boardSize) state.merge.board = state.merge.board.slice(0, boardSize);
  const shelfSize = shelfCapacity(state);
  while (state.merge.supplierSlots.length < shelfSize) state.merge.supplierSlots.push(null);
  if (state.merge.supplierSlots.length > shelfSize) state.merge.supplierSlots = state.merge.supplierSlots.slice(0, shelfSize);
}

export function activeBoardCount(state) {
  return state.merge.board.filter(Boolean).length;
}

export function makeItem(chain, level = 1) {
  return { id: uid(), chain, level };
}

export function randomStarterItem(state) {
  const keys = unlockedChainKeys(state);
  const chain = keys[Math.floor(Math.random() * keys.length)];
  return makeItem(chain, 1);
}

export function tickSupplier(state, dt) {
  normalizeMergeState(state);
  if (state.merge.supplierSlots.every(Boolean)) return;
  state.merge.supplierTimer -= dt;
  if (state.merge.supplierTimer <= 0) {
    const empty = state.merge.supplierSlots.findIndex((slot) => !slot);
    if (empty >= 0) state.merge.supplierSlots[empty] = randomStarterItem(state);
    state.merge.supplierTimer = state.merge.supplierDuration;
  }
}

export function placeSupplierItem(state, shelfIndex) {
  normalizeMergeState(state);
  const item = state.merge.supplierSlots[shelfIndex];
  if (!item) return { ok: false, message: 'Shelf slot is empty.' };
  if (activeBoardCount(state) >= boardLimit(state)) return { ok: false, message: 'Board permit full. Merge or build Parts Storage on the Lot.' };
  const empty = state.merge.board.findIndex((cell) => !cell);
  if (empty < 0) return { ok: false, message: 'Merge board is full.' };
  state.merge.board[empty] = item;
  state.merge.supplierSlots[shelfIndex] = null;
  state.merge.selectedIndex = null;
  return { ok: true, message: `Placed ${itemDisplayName(item)}.` };
}

export function placeAllReady(state) {
  let count = 0;
  normalizeMergeState(state);
  for (let i = 0; i < state.merge.supplierSlots.length; i += 1) {
    if (!state.merge.supplierSlots[i]) continue;
    if (placeSupplierItem(state, i).ok) count += 1;
  }
  return { ok: count > 0, message: count ? `Placed ${count} item(s).` : 'No room or no ready items.' };
}

export function selectOrMergeCell(state, index) {
  const selected = state.merge.selectedIndex;
  const target = state.merge.board[index];
  if (selected === null || selected === undefined) {
    if (target) state.merge.selectedIndex = index;
    return { ok: true, message: '' };
  }
  if (selected === index) {
    state.merge.selectedIndex = null;
    return { ok: true, message: 'Selection cleared.' };
  }
  const source = state.merge.board[selected];
  if (!source) {
    state.merge.selectedIndex = null;
    return { ok: false, message: 'Selected slot is empty.' };
  }
  if (!target) {
    state.merge.board[index] = source;
    state.merge.board[selected] = null;
    state.merge.selectedIndex = null;
    return { ok: true, message: 'Moved item.' };
  }
  if (source.chain === target.chain && source.level === target.level && source.level < CHAINS[source.chain].items.length) {
    const merged = makeItem(source.chain, source.level + 1);
    state.merge.board[index] = merged;
    state.merge.board[selected] = null;
    state.merge.selectedIndex = null;
    awardMerge(state, merged);
    return { ok: true, message: `Merged into ${itemDisplayName(merged)}.` };
  }
  state.merge.board[index] = source;
  state.merge.board[selected] = target;
  state.merge.selectedIndex = null;
  return { ok: true, message: 'Swapped items.' };
}

export function sellSelected(state) {
  const selected = state.merge.selectedIndex;
  if (selected === null || selected === undefined || !state.merge.board[selected]) {
    return { ok: false, message: 'Select an item first.' };
  }
  const item = state.merge.board[selected];
  const value = item.level * 6;
  addCurrency(state, 'scrap', Math.max(1, Math.floor(item.level / 2)));
  addCurrency(state, 'coins', value);
  state.merge.board[selected] = null;
  state.merge.selectedIndex = null;
  return { ok: true, message: `Sold ${itemDisplayName(item)} for ${value} coins.` };
}

export function autoMergeOnce(state) {
  const board = state.merge.board;
  for (let i = 0; i < board.length; i += 1) {
    if (!board[i]) continue;
    for (let j = i + 1; j < board.length; j += 1) {
      if (!board[j]) continue;
      if (board[i].chain === board[j].chain && board[i].level === board[j].level) {
        const merged = makeItem(board[i].chain, board[i].level + 1);
        board[j] = merged;
        board[i] = null;
        state.merge.selectedIndex = null;
        awardMerge(state, merged);
        return { ok: true, message: `Auto-merged ${itemDisplayName(merged)}.` };
      }
    }
  }
  return { ok: false, message: 'No matching pair found.' };
}

export function itemDisplayName(item) {
  if (!item) return '';
  const chain = CHAINS[item.chain];
  return chain.items[item.level - 1] || chain.items[chain.items.length - 1];
}

export function awardMerge(state, item) {
  const chain = CHAINS[item.chain];
  const level = item.level;
  const coins = Math.round(8 * level + Math.pow(level, 1.45) * 4);
  addCurrency(state, 'coins', coins);
  addCurrency(state, 'scrap', Math.max(1, Math.floor(level / 2)));
  addCurrency(state, chain.resource, Math.ceil(level * 2));
  addXp(state, level * 7);
  state.merge.totalMerges += 1;
  state.merge.highestItemLevel = Math.max(state.merge.highestItemLevel, level);
  state.objectives.firstMerge = true;
  state.daily.merges = (state.daily.merges || 0) + 1;
}
