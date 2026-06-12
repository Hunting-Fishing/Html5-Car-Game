export const AUTO_WORLD_LOCATIONS = [
  {
    key: 'mainGarage',
    name: '365 Main Garage',
    icon: '🏢',
    type: 'garage',
    x: 46,
    y: 46,
    screen: 'garage',
    lineKey: 'mobileMechanic',
    description: 'Your central shop. Upgrade bays, parts storage, staff, and service capacity.'
  },
  {
    key: 'dealerRow',
    name: 'Dealer Row',
    icon: '🚘',
    type: 'dealer',
    x: 18,
    y: 26,
    screen: 'lines',
    lineKey: 'dealerShowcase',
    description: 'Vehicle showcase area. Builds reputation and future listing activity.'
  },
  {
    key: 'partsHub',
    name: 'Parts Hub',
    icon: '📦',
    type: 'parts',
    x: 72,
    y: 25,
    screen: 'merge',
    lineKey: 'partsDelivery',
    description: 'Supplier and parts flow. Feeds the merge bay and repair jobs.'
  },
  {
    key: 'privateRepair',
    name: 'Private Repair Shops',
    icon: '🔧',
    type: 'repair',
    x: 24,
    y: 68,
    screen: 'lines',
    lineKey: 'mobileMechanic',
    description: 'Local private shops. They create repair jobs, toolkits, and service demand.'
  },
  {
    key: 'salvageYard',
    name: 'Auto Salvage Yard',
    icon: '🧲',
    type: 'salvage',
    x: 78,
    y: 70,
    screen: 'garage',
    lineKey: 'towingJob',
    description: 'Scrap, recovery, dismantling, and tow-truck work live here.'
  },
  {
    key: 'roadsideBreakdown',
    name: 'Roadside Breakdown',
    icon: '⚠️',
    asset: '/assets/vehicles/iso-broken-red.svg',
    type: 'event',
    x: 52,
    y: 78,
    action: 'towEvent',
    lineKey: 'towingJob',
    description: 'A generic car is stuck on the road. Dispatch tow support for coins and scrap.'
  }
];

export const WORLD_TRAFFIC = [
  { key: 'greenCompactA', asset: '/assets/vehicles/iso-car-green.svg', lane: 'horizontalA', delay: 0, speedClass: 'normal' },
  { key: 'whiteVanA', asset: '/assets/vehicles/iso-van-white.svg', lane: 'horizontalB', delay: -3.1, speedClass: 'slow' },
  { key: 'orangePickupA', asset: '/assets/vehicles/iso-pickup-orange.svg', lane: 'verticalA', delay: -1.7, speedClass: 'normal' },
  { key: 'tealDeliveryA', asset: '/assets/vehicles/iso-delivery-teal.svg', lane: 'verticalB', delay: -5.4, speedClass: 'slow' },
  { key: 'yellowTowA', asset: '/assets/vehicles/iso-tow-yellow.svg', lane: 'horizontalC', delay: -6.3, speedClass: 'normal' },
  { key: 'blueCompactB', asset: '/assets/vehicles/iso-car-blue.svg', lane: 'horizontalA', delay: -7.8, speedClass: 'slow' },
  { key: 'yellowSedanB', asset: '/assets/vehicles/iso-sedan-yellow.svg', lane: 'horizontalC', delay: -2.8, speedClass: 'slow' },
  { key: 'greenCompactC', asset: '/assets/vehicles/iso-car-green.svg', lane: 'roadLoopA', delay: -4.2, speedClass: 'normal' }
];

export const WORLD_PEOPLE = [
  { key: 'buyer', icon: '🧍', x: 20, y: 35, label: 'buyer' },
  { key: 'mechanic', icon: '👨‍🔧', x: 38, y: 56, label: 'mechanic' },
  { key: 'yardWorker', icon: '🧑‍🏭', x: 82, y: 78, label: 'yard' },
  { key: 'driver', icon: '🚶', x: 56, y: 82, label: 'driver' }
];

export const AUTO_SHOP_ROOMS = [
  {
    key: 'frontLot',
    name: 'Front Lot',
    icon: '🚗',
    asset: '/assets/shop/room-front-lot.svg',
    buildingKey: null,
    description: 'Customer cars arrive here. This is the first visual anchor for the companion game.',
    lineKey: 'streetRoute'
  },
  {
    key: 'partsCounter',
    name: 'Parts Counter',
    icon: '📦',
    asset: '/assets/shop/room-parts-counter.svg',
    buildingKey: 'partsStorage',
    description: 'Small parts shelf for bolts, filters, clamps, and starter merge items.',
    lineKey: 'partsDelivery'
  },
  {
    key: 'serviceBay',
    name: 'Service Bay',
    icon: '🧑‍🔧',
    asset: '/assets/shop/room-service-bay.svg',
    buildingKey: 'partsStorage',
    description: 'Basic repair bay. Use it as the visual home for Mobile Mechanic income.',
    lineKey: 'mobileMechanic'
  },
  {
    key: 'towYard',
    name: 'Tow Yard',
    icon: '🪝',
    asset: '/assets/shop/room-tow-yard.svg',
    buildingKey: 'companionHub',
    description: 'Recovery/scrap area for breakdown and towing jobs.',
    lineKey: 'towingJob'
  },
  {
    key: 'tuningCorner',
    name: 'Tuning Corner',
    icon: '⚙️',
    asset: '/assets/shop/room-tuning-corner.svg',
    buildingKey: 'tuningCorner',
    description: 'Performance micro-upgrade area. Locked until Tuning Corner is built.',
    lineKey: 'performanceBay'
  },
  {
    key: 'testTrack',
    name: '2D Test Track',
    icon: '🏁',
    asset: '/assets/shop/room-test-track.svg',
    buildingKey: 'testTrack',
    description: 'Small track for offline route testing and Race Event income.',
    lineKey: 'raceEvent'
  }
];

export const ASSET_SOURCE_RULES = [
  {
    source: 'Original 365 assets',
    allowed: 'Best choice for brand-critical UI, shop rooms, vehicles, and icons.',
    caution: 'Keep all vehicles generic. Do not use manufacturer marks.'
  },
  {
    source: 'Kenney',
    allowed: 'Useful for CC0 placeholder UI, icons, sounds, and simple game props.',
    caution: 'Still organize downloaded packs under /public/assets/vendor/kenney with a license note.'
  },
  {
    source: 'Game-icons.net',
    allowed: 'Useful for SVG repair, fuel, tool, warning, and racing icons.',
    caution: 'Requires attribution because the icon set uses CC BY licensing.'
  },
  {
    source: 'OpenGameArt',
    allowed: 'Useful for optional sounds and small props.',
    caution: 'Check every individual asset license before using it commercially.'
  }
];
