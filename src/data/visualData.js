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
