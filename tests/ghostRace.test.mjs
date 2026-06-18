import assert from 'node:assert/strict';
import {
  compareGhostTime,
  getBestLocalGhost,
  GHOST_RACE_STORAGE_KEY,
  saveLocalGhostRun,
  serializeGhostRun,
  validateGhostRunShape
} from '../src/systems/ghostRaceSystem.js';

function memoryStorage() {
  const items = new Map();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: (key) => items.delete(key)
  };
}

const storage = memoryStorage();
const samples = serializeGhostRun([
  { t: 1000.2, x: 14.234, speed: 32.29 },
  { t: 0, x: 0, speed: 0 },
  { t: 500, x: 7.02, speed: 18.88 },
  { t: -10, x: 4, speed: 10 }
]);

assert.deepEqual(samples, [
  { t: 0, x: 0, speed: 0 },
  { t: 500, x: 7, speed: 18.9 },
  { t: 1000, x: 14.2, speed: 32.3 }
]);

let result = saveLocalGhostRun('street', 4, {
  playerName: 'Garage Rookie',
  timeMs: 42350,
  carKey: 'starter_compact',
  recordedAt: 1730000000000,
  samples
}, storage);

assert.equal(result.changed, true);
assert.equal(result.ghost.route, 'street');
assert.equal(result.ghost.stage, 4);
assert.equal(result.ghost.bestTimeMs, 42350);
assert.ok(storage.getItem(GHOST_RACE_STORAGE_KEY), 'ghost store should be written to local storage');

const routeBest = getBestLocalGhost('street', undefined, storage);
assert.equal(routeBest.bestTimeMs, 42350);

result = saveLocalGhostRun('street', 4, {
  timeMs: 50000,
  carKey: 'starter_compact',
  samples
}, storage);

assert.equal(result.changed, false, 'slower local ghost should not replace the route/stage best');
assert.equal(getBestLocalGhost('street', 4, storage).bestTimeMs, 42350);

result = saveLocalGhostRun('street', 4, {
  timeMs: 39000,
  carKey: 'starter_compact',
  samples
}, storage);

assert.equal(result.changed, true, 'faster local ghost should replace the route/stage best');
assert.equal(getBestLocalGhost('street', 4, storage).bestTimeMs, 39000);

assert.deepEqual(compareGhostTime(38000, 39000), {
  playerTimeMs: 38000,
  ghostTimeMs: 39000,
  deltaMs: -1000,
  result: 'ahead',
  faster: true
});

assert.equal(validateGhostRunShape(result.ghost).ok, true);
const invalid = validateGhostRunShape({ route: 'street', stage: 0, bestTimeMs: 0, samples: [] });
assert.equal(invalid.ok, false);
assert.ok(invalid.errors.length > 0);

console.log('ghost race utilities save local best ghosts and validate replay data');
