import { CHAINS, GENERATORS, CUSTOMER_TEMPLATES } from '../data/gameData.js';
import { addCurrency, addXp, canAfford, spendCost } from './economySystem.js';
import { crewTaskBonus } from './characterSystem.js';

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const BOARD_SIZE = 42;

export function unlockedChainKeys(state) {
  const keys = ['original', 'tools'];
  if (state.buildings.tuningCorner > 0 || state.lot?.owned?.tuningCorner) keys.push('performance');
  if (state.buildings.testTrack > 0 || state.lot?.owned?.testTrack) keys.push('racing');
  return keys;
}

export function boardLimit(state) {
  const lot = state.lot?.owned?.partsStorage ? 4 : 0;
  return Math.min(BOARD_SIZE, 12 + state.upgrades.supplierShelf * 2 + state.buildings.partsStorage * 4 + lot);
}

export function shelfCapacity(state) {
  return Math.min(6, 3 + state.upgrades.supplierShelf + state.buildings.partsStorage);
}

export function normalizeMergeState(state) {
  while (state.merge.board.length < BOARD_SIZE) state.merge.board.push(null);
  if (state.merge.board.length > BOARD_SIZE) state.merge.board = state.merge.board.slice(0, BOARD_SIZE);
  const shelfSize = shelfCapacity(state);
  while (state.merge.supplierSlots.length < shelfSize) state.merge.supplierSlots.push(null);
  if (state.merge.supplierSlots.length > shelfSize) state.merge.supplierSlots = state.merge.supplierSlots.slice(0, shelfSize);
  if (typeof state.merge.energy !== 'number') state.merge.energy = 20;
  if (typeof state.merge.maxEnergy !== 'number') state.merge.maxEnergy = 50;
  if (typeof state.merge.energyRegen !== 'number') state.merge.energyRegen = 0.08;
  if (!Array.isArray(state.merge.customers)) state.merge.customers = [];
  if (typeof state.merge.energyUpgrades !== 'number') state.merge.energyUpgrades = 0;
  if (typeof state.merge.lastFreeEnergy !== 'number') state.merge.lastFreeEnergy = 0;
  if (state.merge.board.every(cell => !cell) && state.merge.totalMerges === 0) {
    state.merge.board[0] = makeItem('original', 1, 'generator');
    state.merge.board[1] = makeItem('tools', 1, 'generator');
    for (let i = 2; i < 6; i += 1) {
      if (!state.merge.board[i]) state.merge.board[i] = makeCobweb();
    }
  }
}

export function activeBoardCount(state) {
  return state.merge.board.filter(Boolean).length;
}

export function makeItem(chain, level = 1, type = 'product') {
  const item = { id: uid(), chain, level, type };
  if (type === 'generator') {
    const gen = Object.values(GENERATORS).find(g => g.produces === chain) || GENERATORS.partsBin;
    item.generatorKey = gen.key;
    item.energyCost = Math.max(1, (gen.energyCost || 1) + Math.floor((level - 1) / 2));
  }
  return item;
}

export function makeCobweb() {
  return { id: uid(), type: 'cobweb' };
}

export function randomStarterItem(state) {
  const keys = unlockedChainKeys(state);
  const chain = keys[Math.floor(Math.random() * keys.length)];
  if (Math.random() < 0.08) return makeCobweb();
  if (Math.random() < 0.12) return makeItem(chain, 1, 'generator');
  return makeItem(chain, 1, 'product');
}

export function tickSupplier(state, dt) {
  normalizeMergeState(state);
  if (state.merge.energy < state.merge.maxEnergy) {
    state.merge.energy = Math.min(state.merge.maxEnergy, state.merge.energy + state.merge.energyRegen * dt);
  }
  if (!state.merge.supplierSlots.every(Boolean)) {
    state.merge.supplierTimer -= dt;
    if (state.merge.supplierTimer <= 0) {
      const empty = state.merge.supplierSlots.findIndex((slot) => !slot);
      if (empty >= 0) state.merge.supplierSlots[empty] = randomStarterItem(state);
      state.merge.supplierTimer = state.merge.supplierDuration;
    }
  }
  const now = Date.now();
  state.merge.customers = state.merge.customers.filter(c => !c.expires || c.expires > now);
  if (state.merge.customers.length < 2 && Math.random() < 0.015) {
    spawnCustomer(state);
  }
}

export function placeSupplierItem(state, shelfIndex) {
  normalizeMergeState(state);
  const item = state.merge.supplierSlots[shelfIndex];
  if (!item) return { ok: false, message: 'Shelf slot is empty.' };
  if (activeBoardCount(state) >= boardLimit(state)) return { ok: false, message: 'Board permit full. Merge or build Parts Storage on the Lot.' };
  const empty = state.merge.board.findIndex((cell, i) => i < boardLimit(state) && !cell);
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
  if (index >= boardLimit(state)) return { ok: false, message: 'Slot locked.' };
  const selected = state.merge.selectedIndex;
  const target = state.merge.board[index];
  if (selected === null || selected === undefined) {
    if (target && target.type !== 'cobweb') state.merge.selectedIndex = index;
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
  if (target && target.type === 'cobweb') {
    return { ok: false, message: 'Clear the cobweb first.' };
  }
  if (!target) {
    state.merge.board[index] = source;
    state.merge.board[selected] = null;
    state.merge.selectedIndex = null;
    return { ok: true, message: 'Moved item.' };
  }
  if (source.chain === target.chain && source.level === target.level && source.level < CHAINS[source.chain].items.length) {
    const mergedType = source.type === 'generator' || target.type === 'generator' ? 'generator' : 'product';
    const merged = makeItem(source.chain, source.level + 1, mergedType);
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

export function clearCobweb(state, index) {
  normalizeMergeState(state);
  const item = state.merge.board[index];
  if (!item || item.type !== 'cobweb') return { ok: false, message: 'Nothing to clear.' };
  if ((state.merge.energy || 0) < 1) return { ok: false, message: 'Need 1 energy to clear cobweb.' };
  state.merge.energy -= 1;
  state.merge.board[index] = null;
  return { ok: true, message: 'Cleared cobweb.' };
}

export function sellSelected(state) {
  const selected = state.merge.selectedIndex;
  if (selected === null || selected === undefined || !state.merge.board[selected]) {
    return { ok: false, message: 'Select an item first.' };
  }
  const item = state.merge.board[selected];
  if (item.type === 'cobweb') return { ok: false, message: 'Clear cobwebs instead of selling.' };
  const value = item.level * 6;
  addCurrency(state, 'scrap', Math.max(1, Math.floor(item.level / 2)));
  addCurrency(state, 'coins', value);
  state.merge.board[selected] = null;
  state.merge.selectedIndex = null;
  return { ok: true, message: `Sold ${itemDisplayName(item)} for ${value} coins.` };
}

export function autoMergeOnce(state) {
  const board = state.merge.board;
  const limit = boardLimit(state);
  for (let i = 0; i < limit; i += 1) {
    if (!board[i] || board[i].type === 'cobweb') continue;
    for (let j = i + 1; j < limit; j += 1) {
      if (!board[j] || board[j].type === 'cobweb') continue;
      if (board[i].chain === board[j].chain && board[i].level === board[j].level) {
        const mergedType = board[i].type === 'generator' || board[j].type === 'generator' ? 'generator' : 'product';
        const merged = makeItem(board[i].chain, board[i].level + 1, mergedType);
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

export function tapGenerator(state, index) {
  normalizeMergeState(state);
  const item = state.merge.board[index];
  if (!item || item.type !== 'generator') return { ok: false, message: 'Not a generator.' };
  const cost = item.energyCost || 1;
  if (state.merge.energy < cost) return { ok: false, message: 'Not enough energy.' };
  if (activeBoardCount(state) >= boardLimit(state)) return { ok: false, message: 'Board full. Merge or sell first.' };
  const empty = state.merge.board.findIndex((cell, i) => i < boardLimit(state) && !cell);
  if (empty < 0) return { ok: false, message: 'No empty slot.' };
  state.merge.energy -= cost;
  const produceLevel = Math.max(1, Math.min(item.level || 1, 3));
  const product = makeItem(item.chain, produceLevel, 'product');
  state.merge.board[empty] = product;
  state.objectives.firstGeneratorTap = true;
  return { ok: true, message: `Produced ${itemDisplayName(product)} (L${produceLevel}).` };
}

export function spawnCustomer(state) {
  const unlocked = unlockedChainKeys(state);
  const possible = CUSTOMER_TEMPLATES.filter(t => unlocked.includes(t.chain));
  if (!possible.length) return;
  const template = possible[Math.floor(Math.random() * possible.length)];
  state.merge.customers.push({
    id: uid(),
    ...template,
    expires: Date.now() + 180000
  });
}

function relatedLineKey(chain) {
  if (chain === 'original') return 'partsDelivery';
  if (chain === 'tools') return 'mobileMechanic';
  if (chain === 'performance') return 'performanceBay';
  if (chain === 'racing') return 'raceEvent';
  return null;
}

export function deliverCustomer(state, customerId, boardIndex) {
  normalizeMergeState(state);
  const custIdx = state.merge.customers.findIndex(c => c.id === customerId);
  if (custIdx < 0) return { ok: false, message: 'Customer gone.' };
  const customer = state.merge.customers[custIdx];
  const item = state.merge.board[boardIndex];
  if (!item || item.type !== 'product' || item.chain !== customer.chain || item.level < customer.level) {
    return { ok: false, message: 'Need a matching or higher product.' };
  }
  state.merge.board[boardIndex] = null;
  state.merge.customers.splice(custIdx, 1);
  Object.entries(customer.reward || {}).forEach(([key, amount]) => addCurrency(state, key, amount));
  addXp(state, 12);
  const energyBack = 3 + Math.floor(customer.level || 1);
  state.merge.energy = Math.min(state.merge.maxEnergy || 50, (state.merge.energy || 0) + energyBack);
  state.reputation = (state.reputation || 0) + 1;
  state.objectives.firstDelivery = true;

  const lineKey = relatedLineKey(customer.chain);
  let lineMsg = '';
  if (lineKey && state.idleLines?.lines?.[lineKey]) {
    const line = state.idleLines.lines[lineKey];
    if (line.level > 0) {
      line.cycle = Math.min((line.cycle || 0) + 1500, 10000);
      lineMsg = ` Boosted ${lineKey}.`;
    }
  }

  state.merge.lastDelivery = {
    title: customer.title,
    energy: energyBack,
    rewards: customer.reward || {},
    line: lineMsg
  };

  return { ok: true, message: `Delivered ${customer.title}. +${energyBack} energy, +1 rep.${lineMsg}` };
}

export function clearLastDelivery(state) {
  if (state.merge) state.merge.lastDelivery = null;
}

const ENERGY_PACKS = {
  small: { coins: 50, gain: 10, label: 'Small Pack' },
  medium: { coins: 120, gain: 30, label: 'Medium Pack' },
  large: { coins: 250, gain: 75, label: 'Large Pack' }
};

export function buyEnergyPack(state, size = 'small') {
  normalizeMergeState(state);
  const pack = ENERGY_PACKS[size] || ENERGY_PACKS.small;
  const cost = { coins: pack.coins };
  if (!canAfford(state, cost)) return { ok: false, message: `Need ${pack.coins} coins for ${pack.label}.` };
  spendCost(state, cost);
  state.merge.energy = Math.min(state.merge.maxEnergy || 50, (state.merge.energy || 0) + pack.gain);
  return { ok: true, message: `${pack.label}: +${pack.gain} energy.` };
}

export function upgradeEnergyCap(state) {
  normalizeMergeState(state);
  const upgrades = state.merge.energyUpgrades || 0;
  if (upgrades >= 5) return { ok: false, message: 'Energy capacity is maxed.' };
  const cost = { coins: 150 + upgrades * 80 };
  if (!canAfford(state, cost)) return { ok: false, message: `Need ${cost.coins} coins to raise energy cap.` };
  spendCost(state, cost);
  state.merge.energyUpgrades = upgrades + 1;
  state.merge.maxEnergy = 50 + state.merge.energyUpgrades * 10;
  return { ok: true, message: `Energy capacity raised to ${state.merge.maxEnergy}.` };
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function freeEnergyRefill(state) {
  normalizeMergeState(state);
  const today = todayKey();
  if (state.merge.lastDailyEnergy === today) {
    return { ok: false, message: 'Daily energy already claimed. Come back tomorrow.' };
  }
  const gain = 25;
  state.merge.energy = Math.min(state.merge.maxEnergy || 50, (state.merge.energy || 0) + gain);
  state.merge.lastDailyEnergy = today;
  return { ok: true, message: `Daily energy: +${gain}.` };
}

const SPIN_REWARDS = [5, 8, 10, 15, 20, 25, 30, 40];

export function dailySpin(state) {
  normalizeMergeState(state);
  const today = todayKey();
  if (state.merge.lastDailySpin === today) {
    return { ok: false, message: 'Daily spin already used. Come back tomorrow.' };
  }
  const gain = SPIN_REWARDS[Math.floor(Math.random() * SPIN_REWARDS.length)];
  state.merge.energy = Math.min(state.merge.maxEnergy || 50, (state.merge.energy || 0) + gain);
  state.merge.lastDailySpin = today;
  state.merge.lastSpinResult = gain;
  return { ok: true, message: `Spin! +${gain} energy.` };
}

export function getTutorialHint(state) {
  if (!state.objectives?.firstGeneratorTap) return 'Tap a highlighted generator to produce items.';
  if (!state.objectives?.firstMerge) return 'Tap two matching items to merge. Merge generators for better output.';
  if (!state.objectives?.firstDelivery) return 'Fill a customer order and tap Deliver for rewards.';
  return 'Claim daily energy or spin the wheel.';
}

export function itemDisplayName(item) {
  if (!item) return '';
  if (item.type === 'cobweb') return 'Cobweb';
  if (item.type === 'generator') {
    const gen = GENERATORS[item.generatorKey] || Object.values(GENERATORS)[0];
    return `${gen.label} L${item.level}`;
  }
  const chain = CHAINS[item.chain];
  return chain.items[item.level - 1] || chain.items[chain.items.length - 1];
}

export function awardMerge(state, item) {
  const chain = CHAINS[item.chain];
  const level = item.level;
  const partsBonus = crewTaskBonus(state, 'parts');
  const salesBonus = crewTaskBonus(state, 'sales');
  let coins = Math.round(8 * level + Math.pow(level, 1.45) * 4);
  let resource = Math.ceil(level * 2);
  if (salesBonus > 0) coins += Math.max(1, Math.round(coins * salesBonus));
  if (partsBonus > 0 && chain.resource === 'parts') resource += Math.max(1, Math.round(resource * partsBonus));
  addCurrency(state, 'coins', coins);
  addCurrency(state, 'scrap', Math.max(1, Math.floor(level / 2)));
  addCurrency(state, chain.resource, resource);
  addXp(state, level * 7);
  state.merge.totalMerges += 1;
  state.merge.highestItemLevel = Math.max(state.merge.highestItemLevel, level);
  state.objectives.firstMerge = true;
  state.daily.merges = (state.daily.merges || 0) + 1;
}
