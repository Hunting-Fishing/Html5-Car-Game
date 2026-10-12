import { CHARACTERS, SKILL_LABELS, characterById } from '../data/characterRoster.js';
import { canAfford, spendCost } from './economySystem.js';

const STAT_MAX = 100;
const ENERGY_COST = 10;

export function rankFor(level) {
  if (level >= 35) return 'Chief';
  if (level >= 20) return 'Lead';
  if (level >= 10) return 'Specialist';
  if (level >= 5) return 'Driver';
  return 'Rookie';
}

function skillValue(skill, extra) {
  return Math.min(STAT_MAX, Math.round((skill.start + (extra || 0)) * 100) / 100);
}

function rowFor(state, character) {
  if (!state.characters) state.characters = {};
  if (!state.characters[character.id]) {
    state.characters[character.id] = { level: character.startLevel, xp: 0, uses: 0 };
  }
  const row = state.characters[character.id];
  if (typeof row.level !== 'number') row.level = character.startLevel;
  if (typeof row.xp !== 'number') row.xp = 0;
  if (typeof row.uses !== 'number') row.uses = 0;
  if (!row.boosts) row.boosts = {};
  if (typeof row.energy !== 'number') row.energy = character.energy;
  if (!row.boostReady) {
    const times = Math.max(0, row.level - 1);
    character.skills.forEach((skill, index) => {
      let extra = 0;
      for (let step = index; step < times; step += character.skills.length) {
        extra = Math.min(STAT_MAX - skill.start, extra + character.step);
      }
      if (extra > 0) row.boosts[skill.key] = Math.round(extra * 100) / 100;
    });
    row.boostReady = true;
  }
  return row;
}

export function characterView(state, character) {
  const row = rowFor(state, character);
  const level = Math.max(character.startLevel, row.level || character.startLevel);
  const skills = character.skills.map((skill) => ({
    key: skill.key,
    label: SKILL_LABELS[skill.key] || skill.key,
    value: skillValue(skill, row.boosts?.[skill.key])
  }));
  return {
    ...character,
    level,
    xp: row.xp || 0,
    uses: row.uses || 0,
    nextXp: level * 25,
    rank: rankFor(level),
    energy: Math.max(0, Math.min(character.energy, row.energy)),
    energyMax: character.energy,
    skills,
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
  row.energy = Math.min(character.energy, (row.energy || 0) + 6);
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
  const row = rowFor(state, character);
  if (view.energy < ENERGY_COST) {
    row.energy = Math.min(character.energy, view.energy + 25);
    return { ok: true, message: `${character.name} rested. Energy ${Math.round(row.energy)}/${character.energy}.` };
  }
  const open = view.skills.filter((skill) => skill.value < STAT_MAX);
  if (!open.length) return { ok: false, message: `${character.name} is at 100% on every stat.` };
  if (!canAfford(state, view.trainCost)) return { ok: false, message: 'Not enough coins to train.' };
  const target = open.slice().sort((a, b) => a.value - b.value)[0];
  const skill = character.skills.find((item) => item.key === target.key);
  const gain = Math.min(character.step, Math.round((STAT_MAX - target.value) * 100) / 100);
  spendCost(state, view.trainCost);
  row.boosts[target.key] = Math.round(((row.boosts[target.key] || 0) + gain) * 100) / 100;
  row.energy = Math.max(0, view.energy - ENERGY_COST);
  row.level += 1;
  const next = skillValue(skill, row.boosts[target.key]);
  return { ok: true, message: `${character.name} ${target.label} +${gain.toFixed(2)}% to ${next.toFixed(2)}%.` };
}
