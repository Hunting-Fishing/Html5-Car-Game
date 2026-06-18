import assert from 'node:assert/strict';
import { RACE_MODES } from '../src/data/gameData.js';
import { getRaceProgressRatio, getRaceStageLength } from '../src/ui/raceProgress.js';

for (const [modeKey, mode] of Object.entries(RACE_MODES)) {
  assert.equal(getRaceStageLength(modeKey), mode.stageLength, `${modeKey} should use its gameData stageLength`);
  assert.equal(getRaceProgressRatio({ mode: modeKey, progress: mode.stageLength / 2 }), 0.5, `${modeKey} half progress`);
  assert.equal(getRaceProgressRatio({ mode: modeKey, progress: mode.stageLength }), 1, `${modeKey} complete progress`);
  assert.equal(getRaceProgressRatio({ mode: modeKey, progress: mode.stageLength + 10 }), 1, `${modeKey} clamps at complete`);
}

assert.equal(getRaceStageLength('missing-mode'), RACE_MODES.street.stageLength, 'unknown modes fall back to street');
assert.equal(getRaceProgressRatio({ mode: 'economy', progress: 65 }), 0.5, 'economy uses 130m, not a fixed 120m');

console.log('race progress ratios use active mode stage lengths');
