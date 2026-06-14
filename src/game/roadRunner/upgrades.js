export const UPGRADE_CATALOG = {
  engine: {
    key: 'engine',
    label: 'Engine',
    description: 'More push power and faster acceleration.',
    maxLevel: 15,
    baseCoins: 45,
    baseParts: 0,
    coinGrowth: 1.42,
    partsEvery: 4
  },
  tires: {
    key: 'tires',
    label: 'Tires',
    description: 'Higher top speed and less rolling loss.',
    maxLevel: 15,
    baseCoins: 40,
    baseParts: 0,
    coinGrowth: 1.40,
    partsEvery: 3
  },
  energyTank: {
    key: 'energyTank',
    label: 'Energy Tank',
    description: 'More starting energy for longer runs.',
    maxLevel: 15,
    baseCoins: 55,
    baseParts: 0,
    coinGrowth: 1.45,
    partsEvery: 3
  },
  suspension: {
    key: 'suspension',
    label: 'Suspension',
    description: 'Smoother hill handling and better slope stability.',
    maxLevel: 15,
    baseCoins: 45,
    baseParts: 0,
    coinGrowth: 1.42,
    partsEvery: 3
  }
};

export function defaultUpgrades() {
  return {
    engine: 1,
    tires: 1,
    energyTank: 1,
    suspension: 1
  };
}

export function normalizeUpgrades(upgrades = {}) {
  const defaults = defaultUpgrades();
  return Object.fromEntries(
    Object.keys(defaults).map((key) => [
      key,
      Math.max(1, Math.min(UPGRADE_CATALOG[key].maxLevel, Number(upgrades[key] || defaults[key])))
    ])
  );
}

export function upgradeCost(key, level) {
  const item = UPGRADE_CATALOG[key];
  if (!item) return { coins: Infinity, parts: Infinity };
  if (level >= item.maxLevel) return { coins: Infinity, parts: Infinity };
  return {
    coins: Math.round(item.baseCoins * Math.pow(item.coinGrowth, level - 1)),
    parts: item.baseParts + Math.floor(level / item.partsEvery)
  };
}

export function canBuyUpgrade(saveData, key) {
  const level = saveData.upgrades?.[key] || 1;
  const item = UPGRADE_CATALOG[key];
  if (!item || level >= item.maxLevel) return false;
  const cost = upgradeCost(key, level);
  return saveData.coins >= cost.coins && saveData.parts >= cost.parts;
}

export function buyUpgrade(saveData, key) {
  const level = saveData.upgrades?.[key] || 1;
  const item = UPGRADE_CATALOG[key];
  if (!item || level >= item.maxLevel) {
    return { ok: false, reason: 'max' };
  }

  const cost = upgradeCost(key, level);
  if (saveData.coins < cost.coins || saveData.parts < cost.parts) {
    return { ok: false, reason: 'funds', cost };
  }

  saveData.coins -= cost.coins;
  saveData.parts -= cost.parts;
  saveData.upgrades[key] = level + 1;
  return { ok: true, key, level: level + 1, cost };
}

export function vehicleStats(upgrades = defaultUpgrades()) {
  const u = normalizeUpgrades(upgrades);
  return {
    pushPower: 120 + u.engine * 12,
    maxSpeed: 165 + u.tires * 9,
    rollingLoss: Math.max(6, 18 - u.tires * 0.65),
    startingEnergy: 92 + u.energyTank * 18,
    energyUse: Math.max(2.15, 4.2 - u.energyTank * 0.09),
    slopeSmoothing: Math.min(0.24, 0.10 + u.suspension * 0.012),
    slopeLimit: Math.min(0.78, 0.58 + u.suspension * 0.018)
  };
}
