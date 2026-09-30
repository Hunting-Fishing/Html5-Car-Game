import assert from 'node:assert/strict';
import {
  GHOST_SOURCES,
  createLocalBestGhost,
  emptyGhostStore,
  getLocalBestGhost,
  sampleGhostAt,
  selectGhostsForRace,
  upsertLocalBestGhost
} from '../src/game/roadRunner/ghostModel.js';

const exampleGhost = createLocalBestGhost({
  ghostId: 'local_best_street',
  playerName: 'Garage Rookie',
  route: 'street',
  stage: 4,
  bestTimeMs: 42350,
  carKey: 'starter_compact',
  recordedAt: 1730000000000,
  samples: [
    { t: 0, x: 0, speed: 0 },
    { t: 500, x: 6.5, speed: 13 },
    { t: 1000, x: 14.2, speed: 15 }
  ]
});

assert.equal(exampleGhost.ghostId, 'local_best_street');
assert.equal(exampleGhost.playerName, 'Garage Rookie');
assert.equal(exampleGhost.route, 'street');
assert.equal(exampleGhost.stage, 4);
assert.equal(exampleGhost.bestTimeMs, 42350);
assert.equal(exampleGhost.carKey, 'starter_compact');
assert.equal(exampleGhost.recordedAt, 1730000000000);
assert.equal(exampleGhost.source, GHOST_SOURCES.LOCAL_BEST);
assert.deepEqual(exampleGhost.samples[1], { t: 500, x: 6.5, speed: 13 });

let result = upsertLocalBestGhost(emptyGhostStore(), exampleGhost);
assert.equal(result.changed, true, 'first local best should save');
assert.equal(getLocalBestGhost(result.store, 'street', 4).ghostId, 'local_best_street');
assert.equal(result.store.routeBestTimes.street.bestTimeMs, 42350);
assert.equal(result.store.stageBestTimes['4'].bestTimeMs, 42350);

const slowerGhost = { ...exampleGhost, ghostId: 'local_best_street_slow', bestTimeMs: 50000 };
result = upsertLocalBestGhost(result.store, slowerGhost);
assert.equal(result.changed, false, 'slower route/stage ghost should not replace local best');
assert.equal(getLocalBestGhost(result.store, 'street', 4).ghostId, 'local_best_street');

const fasterGhost = { ...exampleGhost, ghostId: 'local_best_street_fast', bestTimeMs: 39000 };
result = upsertLocalBestGhost(result.store, fasterGhost);
assert.equal(result.changed, true, 'faster route/stage ghost should replace local best');
assert.equal(getLocalBestGhost(result.store, 'street', 4).ghostId, 'local_best_street_fast');
assert.equal(result.store.routeBestTimes.street.bestTimeMs, 39000);
assert.equal(result.store.stageBestTimes['4'].bestTimeMs, 39000);

const interpolated = sampleGhostAt(exampleGhost, 750);
assert.equal(interpolated.t, 750);
assert.ok(Math.abs(interpolated.x - 10.35) < 0.1, `interpolated x was ${interpolated.x}`);
assert.equal(interpolated.speed, 14);

const ghosts = selectGhostsForRace({
  store: result.store,
  route: 'street',
  stage: 4,
  count: 3,
  routeLength: 1200
});
assert.equal(ghosts.length, 3);
assert.equal(ghosts[0].source, GHOST_SOURCES.LOCAL_BEST);
assert.equal(ghosts[1].source, GHOST_SOURCES.SEEDED_AI);
assert.equal(ghosts[2].source, GHOST_SOURCES.SEEDED_AI);

console.log('ghost model stores local bests and seeded AI ghosts by route/stage');
