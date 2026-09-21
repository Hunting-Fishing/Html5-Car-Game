export function fmt(value) {
  const n = Number(value || 0);
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return Math.floor(n).toString();
}

export function addCurrency(state, key, amount) {
  state.currencies[key] = Math.max(0, (state.currencies[key] || 0) + amount);
}

export function canAfford(state, cost = {}) {
  return Object.entries(cost).every(([key, amount]) => (state.currencies[key] || 0) >= amount);
}

export function spendCost(state, cost = {}) {
  if (!canAfford(state, cost)) return false;
  Object.entries(cost).forEach(([key, amount]) => {
    state.currencies[key] -= amount;
  });
  return true;
}

export function costToText(cost = {}) {
  return Object.entries(cost).map(([key, amount]) => `${fmt(amount)} ${labelCurrency(key)}`).join(' · ');
}

export function labelCurrency(key) {
  const labels = {
    coins: 'Coins', scrap: 'Scrap', parts: 'Parts', tools: 'Tools', tune: 'Tune', rep: 'Rep', fuelCans: 'Fuel'
  };
  return labels[key] || key;
}

export function addXp(state, amount) {
  state.xp += amount;
  let needed = state.level * 80;
  while (state.xp >= needed) {
    state.xp -= needed;
    state.level += 1;
    state.currencies.coins += state.level * 35;
    needed = state.level * 80;
  }
}
