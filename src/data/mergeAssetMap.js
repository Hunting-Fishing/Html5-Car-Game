export const MERGE_ASSET_BASE = '/assets/merge';

export const MERGE_ASSETS = {
  'Bolt Pack': '/assets/merge/original/bolt-pack.svg',
  'Washer Set': '/assets/merge/original/washer-set.svg',
  'Nut Kit': '/assets/merge/original/nut-kit.svg',
  'Hose Clamp': '/assets/merge/original/hose-clamp.svg',
  'Spark Plug': '/assets/merge/original/spark-plug.svg',
  'Fuse Pack': '/assets/merge/original/fuse-pack.svg',
  'Oil Filter': '/assets/merge/original/oil-filter.svg',
  'Air Filter': '/assets/merge/original/air-filter.svg',
  'Brake Pads': '/assets/merge/original/brake-pads.svg',
  'Rotor Pair': '/assets/merge/original/rotor-pair.svg',
  'Water Pump': '/assets/merge/original/water-pump.svg',
  'Service Engine': '/assets/merge/original/service-engine.svg',

  'Shop Rag': '/assets/merge/tools/shop-rag.svg',
  'Gloves': '/assets/merge/tools/gloves.svg',
  'Screwdriver': '/assets/merge/tools/screwdriver.svg',
  '10mm Socket': '/assets/merge/tools/10mm-socket.svg',
  'Ratchet': '/assets/merge/tools/ratchet.svg',
  'Multimeter': '/assets/merge/tools/multimeter.svg',
  'Torque Wrench': '/assets/merge/tools/torque-wrench.svg',
  'Jack Stand': '/assets/merge/tools/jack-stand.svg',
  'Floor Jack': '/assets/merge/tools/floor-jack.svg',
  'Scanner': '/assets/merge/tools/scanner.svg',
  'Tire Machine': '/assets/merge/tools/tire-machine.svg',
  'Shop Lift': '/assets/merge/tools/shop-lift.svg',

  'Intake Clamp': '/assets/merge/performance/intake-clamp.svg',
  'Intake Pipe': '/assets/merge/performance/intake-pipe.svg',
  'Exhaust Tip': '/assets/merge/performance/exhaust-tip.svg',
  'Header Pipe': '/assets/merge/performance/header-pipe.svg',
  'Fuel Rail': '/assets/merge/performance/fuel-rail.svg',
  'Injectors': '/assets/merge/performance/injectors.svg',
  'Camshaft': '/assets/merge/performance/camshaft.svg',
  'Pistons': '/assets/merge/performance/pistons.svg',
  'Crankshaft': '/assets/merge/performance/crankshaft.svg',
  'ECU Tune': '/assets/merge/performance/ecu-tune.svg',
  'Turbo Kit': '/assets/merge/performance/turbo-kit.svg',
  'Super Kit': '/assets/merge/performance/super-kit.svg',

  'Tire Gauge': '/assets/merge/racing/tire-gauge.svg',
  'Sport Tire': '/assets/merge/racing/sport-tire.svg',
  'Coilovers': '/assets/merge/racing/coilovers.svg',
  'Strut Bar': '/assets/merge/racing/strut-bar.svg',
  'Race Seat': '/assets/merge/racing/race-seat.svg',
  'Harness': '/assets/merge/racing/harness.svg',
  'Helmet': '/assets/merge/racing/helmet.svg',
  'Roll Cage': '/assets/merge/racing/roll-cage.svg',
  'Splitter': '/assets/merge/racing/splitter.svg',
  'Wing': '/assets/merge/racing/wing.svg',
  'Rally Lamps': '/assets/merge/racing/rally-lamps.svg',
  'Drag Slicks': '/assets/merge/racing/drag-slicks.svg'
};

export function mergeAssetForName(name) {
  return MERGE_ASSETS[name] || '';
}
