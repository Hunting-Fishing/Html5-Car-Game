import { publicAsset } from './assetUrl.js';
export const MERGE_ASSET_BASE = publicAsset('/assets/Merge');

// Merge item replacement art belongs under public/assets/Merge.
// Keep item names aligned with CHAINS in gameData.js so art can be swapped
// without changing merge rules.
export const MERGE_ASSETS = {
  'Bolt Pack': publicAsset('/assets/Merge/original/bolt-pack.png'),
  'Washer Set': publicAsset('/assets/Merge/original/washer-set.png'),
  'Nut Kit': publicAsset('/assets/Merge/original/nut-kit.png'),
  'Hose Clamp': publicAsset('/assets/Merge/original/hose-clamp.png'),
  'Spark Plug': publicAsset('/assets/Merge/original/spark-plug.png'),
  'Fuse Pack': publicAsset('/assets/Merge/original/fuse-pack.png'),
  'Oil Filter': publicAsset('/assets/Merge/original/oil-filter.png'),
  'Air Filter': publicAsset('/assets/Merge/original/air-filter.png'),
  'Brake Pads': publicAsset('/assets/Merge/original/brake-pads.png'),
  'Rotor Pair': publicAsset('/assets/Merge/original/rotor-pair.png'),
  'Water Pump': publicAsset('/assets/Merge/original/water-pump.png'),
  'Service Engine': publicAsset('/assets/Merge/original/service-engine.png'),
  'Timing Belt': publicAsset('/assets/Merge/original/timing-belt.png'),
  'Radiator': publicAsset('/assets/Merge/original/radiator.png'),
  'Serpentine Belt': publicAsset('/assets/Merge/original/serpentine-belt.png'),
  'Crate Motor': publicAsset('/assets/Merge/original/crate-motor.png'),

  'Shop Rag': publicAsset('/assets/Merge/tools/shop-rag.png'),
  'Gloves': publicAsset('/assets/Merge/tools/gloves.png'),
  'Screwdriver': publicAsset('/assets/Merge/tools/screwdriver.png'),
  '10mm Socket': publicAsset('/assets/Merge/tools/10mm-socket.png'),
  'Ratchet': publicAsset('/assets/Merge/tools/ratchet.png'),
  'Multimeter': publicAsset('/assets/Merge/tools/multimeter.png'),
  'Torque Wrench': publicAsset('/assets/Merge/tools/torque-wrench.png'),
  'Jack Stand': publicAsset('/assets/Merge/tools/jack-stand.png'),
  'Floor Jack': publicAsset('/assets/Merge/tools/floor-jack.png'),
  'Scanner': publicAsset('/assets/Merge/tools/scanner.png'),
  'Tire Machine': publicAsset('/assets/Merge/tools/tire-machine.png'),
  'Shop Lift': publicAsset('/assets/Merge/tools/shop-lift.png'),
  'Impact Gun': publicAsset('/assets/Merge/tools/impact-gun.png'),
  'Air Hose': publicAsset('/assets/Merge/tools/air-hose.png'),
  'Welder': publicAsset('/assets/Merge/tools/welder.png'),
  'Paint Booth': publicAsset('/assets/Merge/tools/paint-booth.png'),

  'Intake Clamp': publicAsset('/assets/Merge/performance/intake-clamp.png'),
  'Intake Pipe': publicAsset('/assets/Merge/performance/intake-pipe.png'),
  'Exhaust Tip': publicAsset('/assets/Merge/performance/exhaust-tip.png'),
  'Header Pipe': publicAsset('/assets/Merge/performance/header-pipe.png'),
  'Fuel Rail': publicAsset('/assets/Merge/performance/fuel-rail.png'),
  'Injectors': publicAsset('/assets/Merge/performance/injectors.png'),
  'Camshaft': publicAsset('/assets/Merge/performance/camshaft.png'),
  'Pistons': publicAsset('/assets/Merge/performance/piston.png'),
  'Crankshaft': publicAsset('/assets/Merge/performance/crankshaft.png'),
  'ECU Tune': publicAsset('/assets/Merge/performance/ecu-tune.png'),
  'Turbo Kit': publicAsset('/assets/Merge/performance/turbo-kit.png'),
  'Super Kit': publicAsset('/assets/Merge/performance/super-kit.png'),

  'Tire Gauge': publicAsset('/assets/Merge/racing/tire-gauge.png'),
  'Sport Tire': publicAsset('/assets/Merge/racing/sport-tire.png'),
  'Coilovers': publicAsset('/assets/Merge/racing/coilovers.png'),
  'Strut Bar': publicAsset('/assets/Merge/racing/strut-bar.png'),
  'Race Seat': publicAsset('/assets/Merge/racing/race-seat.png'),
  'Harness': publicAsset('/assets/Merge/racing/harness.png'),
  'Helmet': publicAsset('/assets/Merge/racing/helmet.png'),
  'Roll Cage': publicAsset('/assets/Merge/racing/roll-cage.png'),
  'Splitter': publicAsset('/assets/Merge/racing/splitter.png'),
  'Wing': publicAsset('/assets/Merge/racing/wing.png'),
  'Rally Lamps': publicAsset('/assets/Merge/racing/rally-lamps.png'),
  'Drag Slicks': publicAsset('/assets/Merge/racing/drag-slicks.png'),

  'Motor Oil': publicAsset('/assets/Merge/fluids/motor-oil.png'),
  'Coolant': publicAsset('/assets/Merge/fluids/coolant.png'),
  'Brake Fluid': publicAsset('/assets/Merge/fluids/brake-fluid.png'),
  'Power Steering': publicAsset('/assets/Merge/fluids/power-steering.png'),
  'Gear Oil': publicAsset('/assets/Merge/fluids/gear-oil.png'),
  'Diff Fluid': publicAsset('/assets/Merge/fluids/diff-fluid.png'),
  'Washer Fluid': publicAsset('/assets/Merge/fluids/washer-fluid.png'),
  'Race Fuel': publicAsset('/assets/Merge/fluids/race-fuel.png'),
  'Additive': publicAsset('/assets/Merge/fluids/additive.png'),
  'Flush Kit': publicAsset('/assets/Merge/fluids/flush-kit.png'),
  'Sealant': publicAsset('/assets/Merge/fluids/sealant.png'),
  'Shop Barrel': publicAsset('/assets/Merge/fluids/shop-barrel.png'),

  'Fuse Wire': publicAsset('/assets/Merge/electrical/fuse-wire.png'),
  'Relay': publicAsset('/assets/Merge/electrical/relay.png'),
  'Car Battery': publicAsset('/assets/Merge/electrical/car-battery.png'),
  'Alternator': publicAsset('/assets/Merge/electrical/alternator.png'),
  'Starter': publicAsset('/assets/Merge/electrical/starter.png'),
  'Coil Pack': publicAsset('/assets/Merge/electrical/coil-pack.png'),
  'Wire Harness': publicAsset('/assets/Merge/electrical/wire-harness.png'),
  'Control Module': publicAsset('/assets/Merge/electrical/control-module.png'),
  'Sensor Pack': publicAsset('/assets/Merge/electrical/sensor-pack.png'),
  'Amp': publicAsset('/assets/Merge/electrical/amp.png'),
  'Inverter': publicAsset('/assets/Merge/electrical/inverter.png'),
  'Wiring Loom': publicAsset('/assets/Merge/electrical/wiring-loom.png'),

  'Mirror': publicAsset('/assets/Merge/body/mirror.png'),
  'Headlamp': publicAsset('/assets/Merge/body/headlamp.png'),
  'Grille': publicAsset('/assets/Merge/body/grille.png'),
  'Bumper': publicAsset('/assets/Merge/body/bumper.png'),
  'Fender': publicAsset('/assets/Merge/body/fender.png'),
  'Door Skin': publicAsset('/assets/Merge/body/door-skin.png'),
  'Hood': publicAsset('/assets/Merge/body/hood.png'),
  'Windshield': publicAsset('/assets/Merge/body/windshield.png'),

  'Floor Mat': publicAsset('/assets/Merge/interior/floor-mat.png'),
  'Shift Knob': publicAsset('/assets/Merge/interior/shift-knob.png'),
  'Radio': publicAsset('/assets/Merge/interior/radio.png'),
  'Steering Wheel': publicAsset('/assets/Merge/interior/steering-wheel.png'),
  'Seat': publicAsset('/assets/Merge/interior/seat.png'),
  'Dash': publicAsset('/assets/Merge/interior/dash.png'),
  'Door Panel': publicAsset('/assets/Merge/interior/door-panel.png'),
  'Cabin Kit': publicAsset('/assets/Merge/interior/cabin.png')
};

export const MERGE_ASSET_LIST = Object.entries(MERGE_ASSETS)
  .map(([key, src]) => ({ category: 'items', key, src }));

export function mergeAssetForName(name) {
  return MERGE_ASSETS[name] || '';
}
