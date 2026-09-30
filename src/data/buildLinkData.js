export const BUILD_CONNECTIONS = [
  {
    key: 'frontLot',
    title: 'Front Lot',
    buildingKey: null,
    roomKeys: ['frontLot'],
    lineKeys: ['streetRoute'],
    worldInventoryBase: { streetKiosk: 1 },
    worldLabel: 'Street Kiosk',
    summary: 'Starts the city loop with a small customer kiosk and the Street Route line.'
  },
  {
    key: 'partsStorage',
    title: 'Parts Storage',
    buildingKey: 'partsStorage',
    roomKeys: ['partsCounter', 'serviceBay'],
    lineKeys: ['partsDelivery', 'mobileMechanic'],
    worldInventoryPerLevel: { partsWarehouse: 1, tireRepair: 1 },
    worldLabel: 'Parts warehouse and tire support',
    summary: 'Adds stocked world buildings and feeds Parts Delivery plus Mobile Mechanic.'
  },
  {
    key: 'tuningCorner',
    title: 'Tuning Corner',
    buildingKey: 'tuningCorner',
    roomKeys: ['tuningCorner'],
    lineKeys: ['performanceBay'],
    worldInventoryPerLevel: { privateShop: 1 },
    worldLabel: 'Private repair shop',
    summary: 'Connects performance parts to upgraded city repair demand.'
  },
  {
    key: 'testTrack',
    title: '2D Test Track',
    buildingKey: 'testTrack',
    roomKeys: ['testTrack'],
    lineKeys: ['raceEvent'],
    worldInventoryPerLevel: { testTrack: 1 },
    worldLabel: 'Mini test track',
    summary: 'Links racing gear, race events, and a placeable test track tile.'
  },
  {
    key: 'companionHub',
    title: '365 Companion Hub',
    buildingKey: 'companionHub',
    roomKeys: ['towYard'],
    lineKeys: ['towingJob', 'dealerShowcase'],
    worldInventoryPerLevel: { towDispatch: 1, dealerShowroom: 1 },
    worldLabel: 'Tow dispatch and dealer support',
    summary: 'Turns the Build page into city support for towing, dealers, and restock play.'
  }
];

export function connectionForBuilding(key) {
  return BUILD_CONNECTIONS.find((item) => item.buildingKey === key) || null;
}

export function connectionForRoom(key) {
  return BUILD_CONNECTIONS.find((item) => item.roomKeys.includes(key)) || null;
}

export function connectionForLine(key) {
  return BUILD_CONNECTIONS.find((item) => item.lineKeys.includes(key)) || null;
}

