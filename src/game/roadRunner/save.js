import { SAVE_KEY } from './config.js';

export function loadRoadRunnerSave() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    return {
      coins: parsed.coins || 0,
      parts: parsed.parts || 0,
      bestDistance: parsed.bestDistance || 0,
      bestTrail: Array.isArray(parsed.bestTrail) ? parsed.bestTrail : []
    };
  } catch {
    return {
      coins: 0,
      parts: 0,
      bestDistance: 0,
      bestTrail: []
    };
  }
}

export function saveRoadRunner(data) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function formatSmall(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${Math.floor(value)}`;
}
