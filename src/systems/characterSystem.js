import { CHARACTERS, characterById } from '../data/characterRoster.js';
import { canAfford, spendCost } from './economySystem.js';

export function rankFor(level) {
  if (level >= 35) return 'Chief';
  if (level >= 20) return 'Lead';
  if (level >= 10) return 'Specialist';
  if (level >= 5) return 'Driver';
  return 'Rookie';
}

function rowFor(state, character) {
  if (!state.characters) state.characters = {};
  const saved = state.characters[character.id];
  if (!saved) {
    state.characters[character.id] = { level: character.startLevel, xp: 0, uses: 0 };
  }
  const row = state.characters[character.id];
  if (typeof row.level !== 'number') row.level = character.startLevel;
  if (typeof row.xp !== 'number') row.xp = 0;
  if (typeof row.uses !== 'number') row.uses = 0;
  return row;
}

export function characterView(state, character) {
  const row = rowFor(state, character);
  const level = Math.max(character.startLevel, row.level || character.startLevel);
  const grown = level - 1;
  const score = (key) => character.base[key] + grown * character.growth[key];
  return {
    ...character,
    level,
    xp: row.xp || 0,
    uses: row.uses || 0,
    nextXp: level * 25,
    rank: rankFor(level),
    drive: score('drive'),
    grip: score('grip'),
    fuel: score('fuel'),
    repair: score('repair'),
    trainCost: { coins: 40 + level * 20 }
  };
}

export function characterViews(state, crew = 'All') {
  return CHARACTERS
    .filter((character) => crew === 'All' || character.crew === crew)
    .map((character) => characterView(state, character));
}

export function useCharacter(state, id, amount = 8) {
  const character = characterById(id);
  if (!character) return { ok: false };
  const row = rowFor(state, character);
  const before = rankFor(row.level);
  row.uses = (row.uses || 0) + 1;
  row.xp = (row.xp || 0) + amount;
  while (row.xp >= row.level * 25 && row.level < 50) {
    row.xp -= row.level * 25;
    row.level += 1;
  }
  const rank = rankFor(row.level);
  return {
    ok: true,
    message: rank !== before ? `${character.name} ranked up to ${rank}.` : ''
  };
}

export function trainCharacter(state, id) {
  const character = characterById(id);
  if (!character) return { ok: false, message: 'Unknown crew.' };
  const view = characterView(state, character);
  if (view.level >= 50) return { ok: false, message: `${character.name} is maxed.` };
  if (!canAfford(state, view.trainCost)) return { ok: false, message: 'Not enough coins to train.' };
  spendCost(state, view.trainCost);
  const row = rowFor(state, character);
  row.level += 1;
  return { ok: true, message: `${character.name} trained to Lv ${row.level} ${rankFor(row.level)}.` };
}
