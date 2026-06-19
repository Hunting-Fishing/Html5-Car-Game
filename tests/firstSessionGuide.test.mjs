import assert from 'node:assert/strict';
import { BUILDINGS } from '../src/data/gameData.js';
import { defaultState } from '../src/state/defaultState.js';
import { getFirstSessionGuideState } from '../src/ui/guides/FirstSessionGuide.js';

const state = defaultState();

let guide = getFirstSessionGuideState(state);
assert.equal(guide.complete, false);
assert.equal(guide.step.key, 'raceBoost');

state.objectives.firstTap = true;
state.activeScreen = 'hub';
guide = getFirstSessionGuideState(state);
assert.equal(guide.step.key, 'mergePair');

state.activeScreen = 'merge';
guide = getFirstSessionGuideState(state);
assert.equal(guide.step.key, 'mergePair');

state.objectives.firstMerge = true;
state.activeScreen = 'merge';
guide = getFirstSessionGuideState(state);
assert.equal(guide.step.key, 'buildPartsStorage');

state.activeScreen = 'garage';
guide = getFirstSessionGuideState(state);
assert.equal(guide.step.key, 'buildPartsStorage');

state.objectives.buildStorage = true;
state.activeScreen = 'garage';
guide = getFirstSessionGuideState(state);
assert.equal(guide.step.key, 'upgradeStreetRoute');

state.objectives.idleLineUpgrade = true;
guide = getFirstSessionGuideState(state);
assert.equal(guide.step.key, 'previewGhostRace');

state.objectives.previewGhostRace = true;
guide = getFirstSessionGuideState(state);
assert.equal(guide.complete, true);

const partsStorage = BUILDINGS.find((building) => building.key === 'partsStorage');
assert.deepEqual(partsStorage.costs[0], { coins: 70, parts: 4 });

console.log('first session guide funnels Tap Race -> Merge Parts -> Parts Storage -> Street Route -> Rival Race');
