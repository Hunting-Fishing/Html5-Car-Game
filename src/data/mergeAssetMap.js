import { publicAsset } from './assetUrl.js';
export const MERGE_ASSET_BASE = publicAsset('/assets/Merge');

// Merge item replacement art belongs under public/assets/Merge.
// Keep item names aligned with CHAINS in gameData.js so art can be swapped
// without changing merge rules.
export const MERGE_ASSETS = {
  'Bolt Pack': publicAsset('/assets/Merge/original/bolt-pack.svg'),
  'Washer Set': publicAsset('/assets/Merge/original/washer-set.svg'),
  'Nut Kit': publicAsset('/assets/Merge/original/nut-kit.svg'),
  'Hose Clamp': publicAsset('/assets/Merge/original/hose-clamp.svg'),
  'Spark Plug': publicAsset('/assets/Merge/original/spark-plug.svg'),
  'Fuse Pack': publicAsset('/assets/Merge/original/fuse-pack.svg'),
  'Oil Filter': publicAsset('/assets/Merge/original/oil-filter.svg'),
  'Air Filter': publicAsset('/assets/Merge/original/air-filter.svg'),
  'Brake Pads': publicAsset('/assets/Merge/original/brake-pads.svg'),
  'Rotor Pair': publicAsset('/assets/Merge/original/rotor-pair.svg'),
  'Water Pump': publicAsset('/assets/Merge/original/water-pump.svg'),
  'Service Engine': publicAsset('/assets/Merge/original/service-engine.svg'),

  'Shop Rag': publicAsset('/assets/Merge/tools/shop-rag.svg'),
  'Gloves': publicAsset('/assets/Merge/tools/gloves.svg'),
  'Screwdriver': publicAsset('/assets/Merge/tools/screwdriver.svg'),
  '10mm Socket': publicAsset('/assets/Merge/tools/10mm-socket.svg'),
  'Ratchet': publicAsset('/assets/Merge/tools/ratchet.svg'),
  'Multimeter': publicAsset('/assets/Merge/tools/multimeter.svg'),
  'Torque Wrench': publicAsset('/assets/Merge/tools/torque-wrench.svg'),
  'Jack Stand': publicAsset('/assets/Merge/tools/jack-stand.svg'),
  'Floor Jack': publicAsset('/assets/Merge/tools/floor-jack.svg'),
  'Scanner': publicAsset('/assets/Merge/tools/scanner.svg'),
  'Tire Machine': publicAsset('/assets/Merge/tools/tire-machine.svg'),
  'Shop Lift': publicAsset('/assets/Merge/tools/shop-lift.svg'),

  'Intake Clamp': publicAsset('/assets/Merge/performance/intake-clamp.svg'),
  'Intake Pipe': publicAsset('/assets/Merge/performance/intake-pipe.svg'),
  'Exhaust Tip': publicAsset('/assets/Merge/performance/exhaust-tip.svg'),
  'Header Pipe': publicAsset('/assets/Merge/performance/header-pipe.svg'),
  'Fuel Rail': publicAsset('/assets/Merge/performance/fuel-rail.svg'),
  'Injectors': publicAsset('/assets/Merge/performance/injectors.svg'),
  'Camshaft': publicAsset('/assets/Merge/performance/camshaft.svg'),
  'Pistons': publicAsset('/assets/Merge/performance/pistons.svg'),
  'Crankshaft': publicAsset('/assets/Merge/performance/crankshaft.svg'),
  'ECU Tune': publicAsset('/assets/Merge/performance/ecu-tune.svg'),
  'Turbo Kit': publicAsset('/assets/Merge/performance/turbo-kit.svg'),
  'Super Kit': publicAsset('/assets/Merge/performance/super-kit.svg'),

  'Tire Gauge': publicAsset('/assets/Merge/racing/tire-gauge.svg'),
  'Sport Tire': publicAsset('/assets/Merge/racing/sport-tire.svg'),
  'Coilovers': publicAsset('/assets/Merge/racing/coilovers.svg'),
  'Strut Bar': publicAsset('/assets/Merge/racing/strut-bar.svg'),
  'Race Seat': publicAsset('/assets/Merge/racing/race-seat.svg'),
  'Harness': publicAsset('/assets/Merge/racing/harness.svg'),
  'Helmet': publicAsset('/assets/Merge/racing/helmet.svg'),
  'Roll Cage': publicAsset('/assets/Merge/racing/roll-cage.svg'),
  'Splitter': publicAsset('/assets/Merge/racing/splitter.svg'),
  'Wing': publicAsset('/assets/Merge/racing/wing.svg'),
  'Rally Lamps': publicAsset('/assets/Merge/racing/rally-lamps.svg'),
  'Drag Slicks': publicAsset('/assets/Merge/racing/drag-slicks.svg')
};

export const MERGE_ASSET_LIST = Object.entries(MERGE_ASSETS)
  .map(([key, src]) => ({ category: 'items', key, src }));

export function mergeAssetForName(name) {
  return MERGE_ASSETS[name] || '';
}
