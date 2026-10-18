import { publicAsset } from './assetUrl.js';

export const WORLD_ASSET_BASE = publicAsset('assets/World');

export const WORLD_ASSETS = {
  terrain: {
    grassTile: `${WORLD_ASSET_BASE}/terrain/grass-tile.svg`,
    roadHorizontal: `${WORLD_ASSET_BASE}/terrain/road-horizontal.svg`,
    roadVertical: `${WORLD_ASSET_BASE}/terrain/road-vertical.svg`,
    roadIntersection: `${WORLD_ASSET_BASE}/terrain/road-intersection.svg`,
    sidewalk: `${WORLD_ASSET_BASE}/terrain/sidewalk.svg`,
    crosswalk: `${WORLD_ASSET_BASE}/terrain/crosswalk.svg`,
    buildPad: `${WORLD_ASSET_BASE}/terrain/build-pad.svg`
  },
  buildings: {
    streetKiosk: `${WORLD_ASSET_BASE}/buildings/street-kiosk.svg`,
    tireRepair: `${WORLD_ASSET_BASE}/buildings/tire-repair-shop.svg`,
    privateShop: `${WORLD_ASSET_BASE}/buildings/private-repair-shop.svg`,
    partsWarehouse: `${WORLD_ASSET_BASE}/buildings/parts-warehouse.svg`,
    dealerShowroom: `${WORLD_ASSET_BASE}/buildings/dealer-showroom.svg`,
    salvageBlock: `${WORLD_ASSET_BASE}/buildings/salvage-yard.svg`,
    garage: `${WORLD_ASSET_BASE}/buildings/garage.svg`,
    testTrack: `${WORLD_ASSET_BASE}/buildings/test-track.svg`,
    partsHub: `${WORLD_ASSET_BASE}/buildings/parts-hub.svg`,
    towDispatch: `${WORLD_ASSET_BASE}/buildings/tow-dispatch.svg`
  },
  people: {
    residentBlue: `${WORLD_ASSET_BASE}/people/resident-blue.svg`,
    residentGreen: `${WORLD_ASSET_BASE}/people/resident-green.svg`,
    residentOrange: `${WORLD_ASSET_BASE}/people/resident-orange.svg`,
    residentPurple: `${WORLD_ASSET_BASE}/people/resident-purple.svg`,
    mechanic: `${WORLD_ASSET_BASE}/people/mechanic.svg`,
    driver: `${WORLD_ASSET_BASE}/people/driver.svg`,
    courier: `${WORLD_ASSET_BASE}/people/courier.svg`,
    towOperator: `${WORLD_ASSET_BASE}/people/tow-operator.svg`,
    salesRep: `${WORLD_ASSET_BASE}/people/sales-rep.svg`,
    tuner: `${WORLD_ASSET_BASE}/people/tuner.svg`,
    racer: `${WORLD_ASSET_BASE}/people/racer.svg`,
    customer: `${WORLD_ASSET_BASE}/people/customer.svg`
  },
  vehicles: {
    compactCar: `${WORLD_ASSET_BASE}/vehicles/compact-car.svg`,
    blueCar: `${WORLD_ASSET_BASE}/vehicles/blue-car.svg`,
    yellowCar: `${WORLD_ASSET_BASE}/vehicles/yellow-car.svg`,
    rallyCar: `${WORLD_ASSET_BASE}/vehicles/rally-car.svg`,
    jdmGtCoupe: `${WORLD_ASSET_BASE}/vehicles/jdm-gt-coupe.svg`,
    greenTruck: `${WORLD_ASSET_BASE}/vehicles/green-truck.svg`,
    naMuscle: `${WORLD_ASSET_BASE}/vehicles/na-muscle.svg`,
    bajaSuv: `${WORLD_ASSET_BASE}/vehicles/baja-suv.svg`,
    towTruck: `${WORLD_ASSET_BASE}/vehicles/tow-truck.svg`,
    deliveryVan: `${WORLD_ASSET_BASE}/vehicles/delivery-van.svg`,
    superCar: `${WORLD_ASSET_BASE}/vehicles/super-car.svg`,
    wheelSport: `${WORLD_ASSET_BASE}/vehicles/wheel-sport.svg`,
    wheelGold: `${WORLD_ASSET_BASE}/vehicles/wheel-gold.svg`,
    wheelTruck: `${WORLD_ASSET_BASE}/vehicles/wheel-truck.svg`
  },
  ui: {
    panelFrame: `${WORLD_ASSET_BASE}/ui/panel-frame.svg`,
    buildButton: `${WORLD_ASSET_BASE}/ui/build-button.svg`,
    upgradeButton: `${WORLD_ASSET_BASE}/ui/upgrade-button.svg`,
    restockButton: `${WORLD_ASSET_BASE}/ui/restock-button.svg`,
    moveButton: `${WORLD_ASSET_BASE}/ui/move-button.svg`,
    happyBadge: `${WORLD_ASSET_BASE}/ui/happy-badge.svg`,
    wantBubble: `${WORLD_ASSET_BASE}/ui/want-bubble.svg`,
    placementGood: `${WORLD_ASSET_BASE}/ui/placement-good.svg`,
    placementBlocked: `${WORLD_ASSET_BASE}/ui/placement-blocked.svg`,
    collectReady: `${WORLD_ASSET_BASE}/ui/collect-ready.svg`,
    collectTimer: `${WORLD_ASSET_BASE}/ui/collect-timer.svg`,
    upgradeReady: `${WORLD_ASSET_BASE}/ui/upgrade-ready.svg`,
    requirementBadge: `${WORLD_ASSET_BASE}/ui/requirement-badge.svg`,
    bonusBadge: `${WORLD_ASSET_BASE}/ui/bonus-badge.svg`,
    levelBadge: `${WORLD_ASSET_BASE}/ui/level-badge.svg`
  },
  props: {
    tree: `${WORLD_ASSET_BASE}/props/tree.svg`,
    streetlight: `${WORLD_ASSET_BASE}/props/streetlight.svg`,
    parkingSign: `${WORLD_ASSET_BASE}/props/parking-sign.svg`,
    roadCone: `${WORLD_ASSET_BASE}/props/road-cone.svg`,
    potholeCrater: `${WORLD_ASSET_BASE}/props/pothole-crater.svg`,
    brokenCar: `${WORLD_ASSET_BASE}/props/broken-car.svg`
  }
};

const PERSON_ANIMATION_SLUGS = {
  residentBlue: 'resident-blue',
  residentGreen: 'resident-green',
  residentOrange: 'resident-orange',
  residentPurple: 'resident-purple',
  mechanic: 'mechanic',
  driver: 'driver',
  courier: 'courier',
  towOperator: 'tow-operator',
  salesRep: 'sales-rep',
  tuner: 'tuner',
  racer: 'racer',
  customer: 'customer'
};

export const WORLD_PERSON_ANIMATION_FRAMES = Object.fromEntries(
  Object.entries(PERSON_ANIMATION_SLUGS).map(([key, slug]) => [
    key,
    Array.from({ length: 6 }, (_, index) => `${WORLD_ASSET_BASE}/people/animated/${slug}/walk-0${index + 1}.svg`)
  ])
);

export const WORLD_BUILDING_LEVEL_ASSETS = {
  streetKiosk: {
    level1: `${WORLD_ASSET_BASE}/buildings/levels/street-kiosk-lv1.svg`,
    level2: `${WORLD_ASSET_BASE}/buildings/levels/street-kiosk-lv2.svg`,
    level3: `${WORLD_ASSET_BASE}/buildings/levels/street-kiosk-lv3.svg`
  },
  tireRepair: {
    level1: `${WORLD_ASSET_BASE}/buildings/levels/tire-repair-shop-lv1.svg`,
    level2: `${WORLD_ASSET_BASE}/buildings/levels/tire-repair-shop-lv2.svg`,
    level3: `${WORLD_ASSET_BASE}/buildings/levels/tire-repair-shop-lv3.svg`
  },
  privateShop: {
    level1: `${WORLD_ASSET_BASE}/buildings/levels/private-repair-shop-lv1.svg`,
    level2: `${WORLD_ASSET_BASE}/buildings/levels/private-repair-shop-lv2.svg`,
    level3: `${WORLD_ASSET_BASE}/buildings/levels/private-repair-shop-lv3.svg`
  },
  partsWarehouse: {
    level1: `${WORLD_ASSET_BASE}/buildings/levels/parts-warehouse-lv1.svg`,
    level2: `${WORLD_ASSET_BASE}/buildings/levels/parts-warehouse-lv2.svg`,
    level3: `${WORLD_ASSET_BASE}/buildings/levels/parts-warehouse-lv3.svg`
  },
  dealerShowroom: {
    level1: `${WORLD_ASSET_BASE}/buildings/levels/dealer-showroom-lv1.svg`,
    level2: `${WORLD_ASSET_BASE}/buildings/levels/dealer-showroom-lv2.svg`,
    level3: `${WORLD_ASSET_BASE}/buildings/levels/dealer-showroom-lv3.svg`
  },
  salvageBlock: {
    level1: `${WORLD_ASSET_BASE}/buildings/levels/salvage-yard-lv1.svg`,
    level2: `${WORLD_ASSET_BASE}/buildings/levels/salvage-yard-lv2.svg`,
    level3: `${WORLD_ASSET_BASE}/buildings/levels/salvage-yard-lv3.svg`
  },
  towDispatch: {
    level1: `${WORLD_ASSET_BASE}/buildings/levels/tow-dispatch-lv1.svg`,
    level2: `${WORLD_ASSET_BASE}/buildings/levels/tow-dispatch-lv2.svg`,
    level3: `${WORLD_ASSET_BASE}/buildings/levels/tow-dispatch-lv3.svg`
  },
  testTrack: {
    level1: `${WORLD_ASSET_BASE}/buildings/levels/test-track-lv1.svg`,
    level2: `${WORLD_ASSET_BASE}/buildings/levels/test-track-lv2.svg`,
    level3: `${WORLD_ASSET_BASE}/buildings/levels/test-track-lv3.svg`
  },
  garage: {
    level1: `${WORLD_ASSET_BASE}/buildings/levels/garage-lv1.svg`,
    level2: `${WORLD_ASSET_BASE}/buildings/levels/garage-lv2.svg`,
    level3: `${WORLD_ASSET_BASE}/buildings/levels/garage-lv3.svg`
  },
  partsHub: {
    level1: `${WORLD_ASSET_BASE}/buildings/levels/parts-hub-lv1.svg`,
    level2: `${WORLD_ASSET_BASE}/buildings/levels/parts-hub-lv2.svg`,
    level3: `${WORLD_ASSET_BASE}/buildings/levels/parts-hub-lv3.svg`
  }
};

export const WORLD_FIXED_BUILDING_KEYS = {
  'Dealer Row': 'dealerShowroom',
  'Dealer Showcase': 'dealerShowroom',
  'Sales Lot': 'dealerShowroom',
  '365 Garage': 'garage',
  'Parts Hub': 'partsHub',
  'Parts Delivery': 'streetKiosk',
  'Repair Shops': 'privateShop',
  'Mobile Mechanic': 'privateShop',
  'Salvage Yard': 'salvageBlock',
  'Towing Yard': 'salvageBlock',
  'Tow Dispatch': 'towDispatch',
  Showcase: 'dealerShowroom',
  'Test Track': 'testTrack',
  'Fuel Run': 'testTrack',
  'Fuel Stop': 'tireRepair',
  Breakdown: 'tireRepair',
  'Breakdown Center': 'tireRepair'
};

export const WORLD_FIXED_BUILDING_ASSETS = {
  'Dealer Row': WORLD_ASSETS.buildings.dealerShowroom,
  'Dealer Showcase': WORLD_ASSETS.buildings.dealerShowroom,
  'Sales Lot': WORLD_ASSETS.buildings.dealerShowroom,
  '365 Garage': WORLD_ASSETS.buildings.garage,
  'Parts Hub': WORLD_ASSETS.buildings.partsHub,
  'Parts Delivery': WORLD_ASSETS.buildings.streetKiosk,
  'Repair Shops': WORLD_ASSETS.buildings.privateShop,
  'Mobile Mechanic': WORLD_ASSETS.buildings.privateShop,
  'Salvage Yard': WORLD_ASSETS.buildings.salvageBlock,
  'Towing Yard': WORLD_ASSETS.buildings.salvageBlock,
  'Tow Dispatch': WORLD_ASSETS.buildings.towDispatch,
  Showcase: WORLD_ASSETS.buildings.dealerShowroom,
  'Test Track': WORLD_ASSETS.buildings.testTrack,
  'Fuel Run': WORLD_ASSETS.buildings.testTrack,
  'Fuel Stop': WORLD_ASSETS.buildings.tireRepair,
  Breakdown: WORLD_ASSETS.buildings.tireRepair,
  'Breakdown Center': WORLD_ASSETS.buildings.tireRepair
};

export const WORLD_ASSET_LIST = [
  ...Object.entries(WORLD_ASSETS).flatMap(([category, entries]) =>
    Object.entries(entries).map(([key, src]) => ({ category, key, src }))
  ),
  ...Object.entries(WORLD_PERSON_ANIMATION_FRAMES).flatMap(([personKey, frames]) =>
    frames.map((src, index) => ({ category: 'peopleWalk', key: `${personKey}:walk-${index + 1}`, src }))
  ),
  ...Object.entries(WORLD_BUILDING_LEVEL_ASSETS).flatMap(([buildingKey, entries]) =>
    Object.entries(entries).map(([levelKey, src]) => ({ category: 'buildingLevels', key: `${buildingKey}:${levelKey}`, src }))
  )
];

export function buildingLevelTier(level = 1) {
  const value = Math.max(1, Number(level) || 1);
  if (value >= 7) return 'level3';
  if (value >= 4) return 'level2';
  return 'level1';
}

export function buildingAssetForKey(key, label = '', level = 1) {
  const assetKey = WORLD_FIXED_BUILDING_KEYS[label] || key;
  const tier = buildingLevelTier(level);
  return WORLD_BUILDING_LEVEL_ASSETS[assetKey]?.[tier] || WORLD_FIXED_BUILDING_ASSETS[label] || WORLD_ASSETS.buildings[key] || '';
}

export function personAssetForKey(key) {
  return WORLD_ASSETS.people[key] || WORLD_ASSETS.people.residentBlue;
}

export function personAnimationFramesForKey(key) {
  return WORLD_PERSON_ANIMATION_FRAMES[key] || WORLD_PERSON_ANIMATION_FRAMES.residentBlue || [personAssetForKey(key)];
}

export function vehicleAssetForKey(key) {
  return WORLD_ASSETS.vehicles[key] || WORLD_ASSETS.vehicles.compactCar;
}
