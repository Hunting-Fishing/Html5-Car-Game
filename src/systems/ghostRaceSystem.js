import {
  createLocalBestGhost,
  getLocalBestGhost,
  GHOST_STORAGE_KEY,
  loadGhostStore,
  normalizeGhostRecord,
  saveGhostStore,
  upsertLocalBestGhost
} from '../game/roadRunner/ghostModel.js';

export const GHOST_RACE_STORAGE_KEY = GHOST_STORAGE_KEY;

/**
 * Save a completed local ghost run if it is the best replay for this route/stage.
 * This is intentionally localStorage-only until 365 Motor Sales server validation exists.
 */
export function saveLocalGhostRun(routeKey, stage, runData = {}, storage) {
  const ghost = createLocalBestGhost({
    ghostId: runData.ghostId,
    playerName: runData.playerName,
    route: routeKey,
    stage,
    bestTimeMs: runData.bestTimeMs ?? runData.timeMs,
    carKey: runData.carKey,
    recordedAt: runData.recordedAt,
    samples: serializeGhostRun(runData.samples)
  });

  const store = loadGhostStore(storage);
  const result = upsertLocalBestGhost(store, ghost);
  const savedStore = result.changed ? saveGhostStore(result.store, storage) : result.store;
  return { ...result, store: savedStore };
}

/**
 * Get the best local ghost for a route. If a stage is supplied, return that exact stage.
 * Without a stage, return the fastest indexed local replay for the route.
 */
export function getBestLocalGhost(routeKey, stage, storage) {
  const store = loadGhostStore(storage);
  if (stage !== undefined && stage !== null) {
    return getLocalBestGhost(store, routeKey, stage);
  }

  const routeBest = store.routeBestTimes?.[routeKey];
  if (!routeBest) return null;
  return getLocalBestGhost(store, routeBest.route, routeBest.stage);
}

export function compareGhostTime(playerTimeMs, ghostTimeMs) {
  const player = normalizeTimeMs(playerTimeMs);
  const ghost = normalizeTimeMs(ghostTimeMs);
  const deltaMs = player - ghost;
  return {
    playerTimeMs: player,
    ghostTimeMs: ghost,
    deltaMs,
    result: deltaMs < 0 ? 'ahead' : deltaMs > 0 ? 'behind' : 'tie',
    faster: deltaMs < 0
  };
}

export function serializeGhostRun(samples = []) {
  if (!Array.isArray(samples)) return [];
  return samples
    .map((sample) => {
      const rawTime = Number(sample?.t);
      return {
        t: Number.isFinite(rawTime) ? Math.round(rawTime) : NaN,
        x: Number(sample?.x),
        speed: Number(sample?.speed || 0)
      };
    })
    .filter((sample) => Number.isFinite(sample.t) && sample.t >= 0 && Number.isFinite(sample.x) && sample.x >= 0)
    .sort((a, b) => a.t - b.t)
    .map((sample) => ({
      t: sample.t,
      x: Number(sample.x.toFixed(1)),
      speed: Number(Math.max(0, sample.speed).toFixed(1))
    }));
}

export function validateGhostRunShape(ghost) {
  const normalized = normalizeGhostRecord(ghost);
  return {
    ok: Boolean(normalized),
    ghost: normalized,
    errors: normalized ? [] : shapeErrors(ghost)
  };
}

function shapeErrors(ghost) {
  const errors = [];
  if (!ghost || typeof ghost !== 'object') return ['Ghost run must be an object.'];
  if (!ghost.route) errors.push('Ghost route is required.');
  if (!Number.isFinite(Number(ghost.stage)) || Number(ghost.stage) < 1) errors.push('Ghost stage must be a positive number.');
  if (!Number.isFinite(Number(ghost.bestTimeMs)) || Number(ghost.bestTimeMs) <= 0) errors.push('Ghost bestTimeMs must be positive.');
  if (!Array.isArray(ghost.samples) || ghost.samples.length === 0) errors.push('Ghost samples must be a non-empty array.');
  return errors.length ? errors : ['Ghost run shape is invalid.'];
}

function normalizeTimeMs(value) {
  return Math.max(0, Math.round(Number(value) || 0));
}
