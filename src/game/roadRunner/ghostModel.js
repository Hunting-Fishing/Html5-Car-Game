export const GHOST_MODEL_VERSION = 1;
export const GHOST_STORAGE_KEY = '365_road_runner_ghosts_v1';
export const GHOST_SAMPLE_INTERVAL_MS = 500;
export const DEFAULT_GHOST_PLAYER = 'Garage Rookie';

export const GHOST_SOURCES = {
  LOCAL_BEST: 'local_best',
  SEEDED_AI: 'seeded_ai',
  REMOTE_BEST: 'remote_best'
};

const AI_GHOST_DEFS = [
  { id: 'ai_route_scout', name: 'Route Scout', carKey: 'greenCompact', pace: 0.91, variance: 0.035 },
  { id: 'ai_parts_runner', name: 'Parts Runner', carKey: 'pickup', pace: 1.00, variance: 0.045 },
  { id: 'ai_garage_pro', name: 'Garage Pro', carKey: 'serviceVan', pace: 1.08, variance: 0.028 }
];

export function ghostBucketKey(route, stage) {
  return `${safeKey(route || 'track')}::stage_${normalizeStage(stage)}`;
}

export function emptyGhostStore() {
  return {
    version: GHOST_MODEL_VERSION,
    localBest: {},
    routeBestTimes: {},
    stageBestTimes: {},
    updatedAt: 0
  };
}

export function loadGhostStore(storage = browserStorage()) {
  if (!storage) return emptyGhostStore();
  try {
    return normalizeGhostStore(JSON.parse(storage.getItem(GHOST_STORAGE_KEY) || '{}'));
  } catch {
    return emptyGhostStore();
  }
}

export function saveGhostStore(store, storage = browserStorage()) {
  if (!storage) return normalizeGhostStore(store);
  const normalized = normalizeGhostStore(store);
  storage.setItem(GHOST_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function normalizeGhostStore(raw = {}) {
  const store = emptyGhostStore();
  const localBest = raw?.localBest && typeof raw.localBest === 'object' ? raw.localBest : {};

  Object.values(localBest).forEach((record) => {
    const ghost = normalizeGhostRecord(record);
    if (!ghost) return;
    const key = ghostBucketKey(ghost.route, ghost.stage);
    store.localBest[key] = ghost;
    applyBestIndexes(store, ghost);
  });

  store.updatedAt = Math.max(Number(raw?.updatedAt) || 0, ...Object.values(store.localBest).map((ghost) => ghost.recordedAt || 0), 0);
  return store;
}

export function normalizeGhostRecord(record) {
  if (!record || typeof record !== 'object') return null;
  const route = safeKey(record.route || 'track');
  const stage = normalizeStage(record.stage);
  const samples = normalizeSamples(record.samples);
  if (!samples.length) return null;

  const bestTimeMs = normalizeTimeMs(record.bestTimeMs) || samples[samples.length - 1].t;
  if (!bestTimeMs) return null;

  const source = Object.values(GHOST_SOURCES).includes(record.source) ? record.source : GHOST_SOURCES.LOCAL_BEST;
  const ghostId = safeGhostId(record.ghostId) || defaultGhostId(source, route, stage);

  return {
    ghostId,
    playerName: String(record.playerName || DEFAULT_GHOST_PLAYER).slice(0, 40),
    route,
    stage,
    bestTimeMs,
    carKey: safeKey(record.carKey || 'hatchback'),
    recordedAt: normalizeTimestamp(record.recordedAt),
    source,
    samples
  };
}

export function createLocalBestGhost({
  ghostId,
  playerName = DEFAULT_GHOST_PLAYER,
  route,
  stage,
  bestTimeMs,
  carKey,
  recordedAt = Date.now(),
  samples
}) {
  return normalizeGhostRecord({
    ghostId: ghostId || defaultGhostId(GHOST_SOURCES.LOCAL_BEST, route, stage),
    playerName,
    route,
    stage,
    bestTimeMs,
    carKey,
    recordedAt,
    source: GHOST_SOURCES.LOCAL_BEST,
    samples
  });
}

export function createGhostFromLegacyTrail({ trail, route = 'track', stage = 1, distance = 0, carKey = 'hatchback', playerName = DEFAULT_GHOST_PLAYER }) {
  const samples = Array.isArray(trail)
    ? trail.map((sample) => ({
      t: Number(sample.t) > 1000 ? Number(sample.t) : Math.round(Number(sample.t || 0) * 1000),
      x: Math.max(0, Number(sample.x || 0) > 80 ? Number(sample.x || 0) - 80 : Number(sample.x || 0)),
      speed: Number(sample.speed || 0)
    }))
    : [];
  const fallbackTime = Math.max(GHOST_SAMPLE_INTERVAL_MS, samples[samples.length - 1]?.t || 0);
  return createLocalBestGhost({
    playerName,
    route,
    stage,
    bestTimeMs: fallbackTime,
    carKey,
    samples: samples.length ? samples : [
      { t: 0, x: 0, speed: 0 },
      { t: fallbackTime, x: Number(distance) || 0, speed: 0 }
    ]
  });
}

export function getLocalBestGhost(store, route, stage) {
  return normalizeGhostStore(store).localBest[ghostBucketKey(route, stage)] || null;
}

export function upsertLocalBestGhost(store, ghostRecord) {
  const normalizedStore = normalizeGhostStore(store);
  const ghost = createLocalBestGhost(ghostRecord || {});
  if (!ghost) return { store: normalizedStore, ghost: null, changed: false };

  const key = ghostBucketKey(ghost.route, ghost.stage);
  const existing = normalizedStore.localBest[key];
  const changed = !existing || ghost.bestTimeMs < existing.bestTimeMs;
  if (!changed) return { store: normalizedStore, ghost: existing, changed: false };

  normalizedStore.localBest[key] = ghost;
  applyBestIndexes(normalizedStore, ghost);
  normalizedStore.updatedAt = Math.max(Date.now(), ghost.recordedAt);
  return { store: normalizedStore, ghost, changed: true };
}

export function createSeededAiGhosts({ route, stage = 1, routeLength = 1000, count = 2, sampleIntervalMs = GHOST_SAMPLE_INTERVAL_MS } = {}) {
  const routeKey = safeKey(route || 'track');
  const stageNo = normalizeStage(stage);
  const length = Math.max(100, Number(routeLength) || 1000);
  const requested = Math.max(0, Math.min(count, AI_GHOST_DEFS.length));

  return AI_GHOST_DEFS.slice(0, requested).map((def, index) => {
    const seed = hashString(`${routeKey}:${stageNo}:${def.id}`);
    const pace = def.pace + ((seed % 17) - 8) * def.variance * 0.01 + stageNo * 0.012;
    const durationMs = Math.round((54000 / Math.max(0.72, pace)) + length * 1.15);
    const samples = [];
    for (let t = 0; t <= durationMs; t += sampleIntervalMs) {
      const ratio = Math.min(1, t / durationMs);
      const eased = 1 - Math.pow(1 - ratio, 1.38);
      const wobble = Math.sin((t / 1000) * (1.1 + index * 0.23) + seed) * length * 0.004;
      const x = Math.min(length, Math.max(0, eased * length + wobble));
      const speed = Math.max(0, (length / Math.max(1, durationMs / 1000)) * 3.6 * (0.22 + ratio * 0.85));
      samples.push({ t, x: Number(x.toFixed(1)), speed: Number(speed.toFixed(1)) });
    }
    if (samples[samples.length - 1].x < length) samples.push({ t: durationMs, x: length, speed: 0 });

    return normalizeGhostRecord({
      ghostId: `${def.id}_${routeKey}_stage_${stageNo}`,
      playerName: def.name,
      route: routeKey,
      stage: stageNo,
      bestTimeMs: durationMs,
      carKey: def.carKey,
      recordedAt: 0,
      source: GHOST_SOURCES.SEEDED_AI,
      samples
    });
  }).filter(Boolean);
}

export function selectGhostsForRace({ store, route, stage = 1, count = 1, routeLength = 1000 } = {}) {
  const max = Math.max(0, Number(count) || 0);
  if (!max) return [];
  const ghosts = [];
  const local = getLocalBestGhost(store, route, stage);
  if (local) ghosts.push(local);
  const ai = createSeededAiGhosts({ route, stage, routeLength, count: max });
  for (const ghost of ai) {
    if (ghosts.length >= max) break;
    if (!ghosts.some((item) => item.ghostId === ghost.ghostId)) ghosts.push(ghost);
  }
  return ghosts.slice(0, max);
}

export function sampleGhostAt(ghost, elapsedMs) {
  const record = normalizeGhostRecord(ghost);
  if (!record) return { t: 0, x: 0, speed: 0 };
  const target = Math.max(0, Number(elapsedMs) || 0);
  const samples = record.samples;
  if (target <= samples[0].t) return samples[0];
  let previous = samples[0];
  for (const sample of samples) {
    if (sample.t >= target) {
      const span = Math.max(1, sample.t - previous.t);
      const ratio = Math.max(0, Math.min(1, (target - previous.t) / span));
      return {
        t: target,
        x: Number((previous.x + (sample.x - previous.x) * ratio).toFixed(1)),
        speed: Number((previous.speed + (sample.speed - previous.speed) * ratio).toFixed(1))
      };
    }
    previous = sample;
  }
  return samples[samples.length - 1];
}

function applyBestIndexes(store, ghost) {
  const routeBest = store.routeBestTimes[ghost.route];
  if (!routeBest || ghost.bestTimeMs < routeBest.bestTimeMs) {
    store.routeBestTimes[ghost.route] = bestTimeIndex(ghost);
  }

  const stageKey = String(ghost.stage);
  const stageBest = store.stageBestTimes[stageKey];
  if (!stageBest || ghost.bestTimeMs < stageBest.bestTimeMs) {
    store.stageBestTimes[stageKey] = { ...bestTimeIndex(ghost), route: ghost.route };
  }
}

function bestTimeIndex(ghost) {
  return {
    ghostId: ghost.ghostId,
    bestTimeMs: ghost.bestTimeMs,
    route: ghost.route,
    stage: ghost.stage,
    carKey: ghost.carKey,
    recordedAt: ghost.recordedAt
  };
}

function normalizeSamples(samples) {
  if (!Array.isArray(samples)) return [];
  return samples
    .map((sample) => ({
      t: normalizeTimeMs(sample?.t),
      x: Number(sample?.x),
      speed: Number(sample?.speed || 0)
    }))
    .filter((sample) => Number.isFinite(sample.t) && sample.t >= 0 && Number.isFinite(sample.x) && sample.x >= 0)
    .sort((a, b) => a.t - b.t)
    .map((sample) => ({
      t: Math.round(sample.t),
      x: Number(sample.x.toFixed(1)),
      speed: Number(Math.max(0, sample.speed).toFixed(1))
    }));
}

function normalizeStage(stage) {
  return Math.max(1, Math.floor(Number(stage) || 1));
}

function normalizeTimeMs(time) {
  return Math.max(0, Math.round(Number(time) || 0));
}

function normalizeTimestamp(value) {
  if (Number(value) === 0) return 0;
  const timestamp = Math.round(Number(value) || Date.now());
  return Math.max(0, timestamp);
}

function safeKey(value) {
  return String(value || '').trim().replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '') || 'unknown';
}

function safeGhostId(value) {
  const id = safeKey(value);
  return id === 'unknown' ? '' : id;
}

function defaultGhostId(source, route, stage) {
  const prefix = source === GHOST_SOURCES.LOCAL_BEST ? 'local_best' : source;
  return `${prefix}_${safeKey(route)}_stage_${normalizeStage(stage)}`;
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function browserStorage() {
  return typeof window !== 'undefined' ? window.localStorage : null;
}
