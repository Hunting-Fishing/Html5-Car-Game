import { RACE_MODES } from '../data/gameData.js';

const FALLBACK_STAGE_LENGTH = 120;

export function getRaceMode(modeKey) {
  return RACE_MODES[modeKey] || RACE_MODES.street;
}

export function getRaceStageLength(modeKey) {
  const mode = getRaceMode(modeKey);
  return Math.max(1, Number(mode?.stageLength) || FALLBACK_STAGE_LENGTH);
}

export function getRaceProgressRatio(raceState = {}) {
  const progress = Math.max(0, Number(raceState.progress) || 0);
  return Math.min(1, progress / getRaceStageLength(raceState.mode));
}
