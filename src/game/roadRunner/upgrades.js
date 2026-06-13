export const UPGRADE_CATALOG = {
  engine: {
    key: 'engine',
    label: 'Engine',
    description: 'More push power and faster acceleration.',
    maxLevel: 10,
    baseCoins: 80,
    baseParts: 0,
    coinGrowth: 1.55,
    partsEvery: 3
  },
  tires: {
    key: 'tires',
    label: 'Tires',
    description: 'Higher top speed and less rolling loss.',
    maxLevel: 10,
    baseCoins: 65,
    baseParts: 1,
    coinGrowth: 1.50,
    partsEvery: 2
  },
  energyTank: {
    key: 'energyTank',
    label: 'Energy Tank',
    description: 'More starting energy for longer runs.',
    maxLevel: 10,
    baseCoins: 90,
    baseParts: 1,
    coinGrowth: 1.58,
    partsEvery: 2
  },
  suspension: {
    key: 'suspension',
    label: 'Suspension',
    description: 'Smoother hill handling and better slope stability.',
    maxLevel: 10,
    baseCoins: 75,
    baseParts: 1,
    coinGrowth: 1.52,
    partsEvery: 2
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
    pushPower: 175 + u.engine * 22,
    maxSpeed: 285 + u.tires * 16,
    rollingLoss: Math.max(9, 22 - u.tires * 1.1),
    startingEnergy: 100 + u.energyTank * 12,
    energyUse: Math.max(3.8, 6.3 - u.energyTank * 0.12),
    slopeSmoothing: Math.min(0.24, 0.10 + u.suspension * 0.014),
    slopeLimit: Math.min(0.78, 0.58 + u.suspension * 0.02)
  };
}
