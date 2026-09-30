export const MERGE_ASSET_BASE = '/assets/Merge';

// Merge item replacement art belongs under public/assets/Merge.
// Keep item names aligned with CHAINS in gameData.js so art can be swapped
// without changing merge rules.
export const MERGE_ASSETS = {
  'Bolt Pack': '/assets/Merge/original/bolt-pack.svg',
  'Washer Set': '/assets/Merge/original/washer-set.svg',
  'Nut Kit': '/assets/Merge/original/nut-kit.svg',
  'Hose Clamp': '/assets/Merge/original/hose-clamp.svg',
  'Spark Plug': '/assets/Merge/original/spark-plug.svg',
  'Fuse Pack': '/assets/Merge/original/fuse-pack.svg',
  'Oil Filter': '/assets/Merge/original/oil-filter.svg',
  'Air Filter': '/assets/Merge/original/air-filter.svg',
  'Brake Pads': '/assets/Merge/original/brake-pads.svg',
  'Rotor Pair': '/assets/Merge/original/rotor-pair.svg',
  'Water Pump': '/assets/Merge/original/water-pump.svg',
  'Service Engine': '/assets/Merge/original/service-engine.svg',

  'Shop Rag': '/assets/Merge/tools/shop-rag.svg',
  'Gloves': '/assets/Merge/tools/gloves.svg',
  'Screwdriver': '/assets/Merge/tools/screwdriver.svg',
  '10mm Socket': '/assets/Merge/tools/10mm-socket.svg',
  'Ratchet': '/assets/Merge/tools/ratchet.svg',
  'Multimeter': '/assets/Merge/tools/multimeter.svg',
  'Torque Wrench': '/assets/Merge/tools/torque-wrench.svg',
  'Jack Stand': '/assets/Merge/tools/jack-stand.svg',
  'Floor Jack': '/assets/Merge/tools/floor-jack.svg',
  'Scanner': '/assets/Merge/tools/scanner.svg',
  'Tire Machine': '/assets/Merge/tools/tire-machine.svg',
  'Shop Lift': '/assets/Merge/tools/shop-lift.svg',

  'Intake Clamp': '/assets/Merge/performance/intake-clamp.svg',
  'Intake Pipe': '/assets/Merge/performance/intake-pipe.svg',
  'Exhaust Tip': '/assets/Merge/performance/exhaust-tip.svg',
  'Header Pipe': '/assets/Merge/performance/header-pipe.svg',
  'Fuel Rail': '/assets/Merge/performance/fuel-rail.svg',
  'Injectors': '/assets/Merge/performance/injectors.svg',
  'Camshaft': '/assets/Merge/performance/camshaft.svg',
  'Pistons': '/assets/Merge/performance/pistons.svg',
  'Crankshaft': '/assets/Merge/performance/crankshaft.svg',
  'ECU Tune': '/assets/Merge/performance/ecu-tune.svg',
  'Turbo Kit': '/assets/Merge/performance/turbo-kit.svg',
  'Super Kit': '/assets/Merge/performance/super-kit.svg',

  'Tire Gauge': '/assets/Merge/racing/tire-gauge.svg',
  'Sport Tire': '/assets/Merge/racing/sport-tire.svg',
  'Coilovers': '/assets/Merge/racing/coilovers.svg',
  'Strut Bar': '/assets/Merge/racing/strut-bar.svg',
  'Race Seat': '/assets/Merge/racing/race-seat.svg',
  'Harness': '/assets/Merge/racing/harness.svg',
  'Helmet': '/assets/Merge/racing/helmet.svg',
  'Roll Cage': '/assets/Merge/racing/roll-cage.svg',
  'Splitter': '/assets/Merge/racing/splitter.svg',
  'Wing': '/assets/Merge/racing/wing.svg',
  'Rally Lamps': '/assets/Merge/racing/rally-lamps.svg',
  'Drag Slicks': '/assets/Merge/racing/drag-slicks.svg'
};

export const MERGE_ASSET_LIST = Object.entries(MERGE_ASSETS)
  .map(([key, src]) => ({ category: 'items', key, src }));

export function mergeAssetForName(name) {
  return MERGE_ASSETS[name] || '';
}
