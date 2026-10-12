import { CHARACTERS, SKILL_LABELS, characterById } from '../data/characterRoster.js';
import { canAfford, spendCost, costToText } from './economySystem.js';

const STAT_MAX = 100;
const PROMO_TITLES = ['', 'Associate', 'Senior', 'Principal', 'Director', 'Partner'];
const PAY_EVERY = 90;
const CARDS = {
  fuel: ['fuelCans', 'Fuel card'],
  parts: ['parts', 'Parts card'],
  repair: ['tools', 'Tool card'],
  sales: ['rep', 'Rep card'],
  race: ['tune', 'Tune card'],
  grip: ['tune', 'Tune card'],
  route: ['scrap', 'Route card'],
  tow: ['scrap', 'Tow card']
};
const DESKS = [
  { id: 'sales', roles: ['Sales'] },
  { id: 'service', roles: ['Mechanic', 'Tuner', 'Pit Crew'] },
  { id: 'parts', roles: ['Courier', 'Fuel Hand'] },
  { id: 'drive', roles: ['Driver', 'Tow Hand'] }
];

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
  if (typeof row.hired !== 'boolean') row.hired = false;
  if (typeof row.promotions !== 'number') row.promotions = 0;
  if (typeof row.lastChange !== 'string') row.lastChange = '';
  return row;
}

function benefitFor(character) {
  return CARDS[character.skills[0]?.key] || ['scrap', 'Supply card'];
}

function raiseSkill(character, row, gain) {
  const skills = character.skills.map((skill) => ({
    key: skill.key,
    label: SKILL_LABELS[skill.key] || skill.key,
    value: skillValue(skill, row.boosts?.[skill.key]),
    start: skill.start
  }));
  const open = skills.filter((skill) => skill.value < STAT_MAX).sort((a, b) => a.value - b.value);
  if (!open.length) return null;
  const target = open[0];
  const add = Math.min(gain, Math.round((STAT_MAX - target.value) * 100) / 100);
  if (add <= 0) return null;
  row.boosts[target.key] = Math.round(((row.boosts[target.key] || 0) + add) * 100) / 100;
  const next = skillValue(character.skills.find((skill) => skill.key === target.key), row.boosts[target.key]);
  row.lastChange = `${target.label} ${target.value.toFixed(2)}% → ${next.toFixed(2)}%`;
  return row.lastChange;
}

export function characterView(state, character) {
  const row = rowFor(state, character);
  const level = Math.max(character.startLevel, row.level || character.startLevel);
  const skills = character.skills.map((skill) => ({
    key: skill.key,
    label: SKILL_LABELS[skill.key] || skill.key,
    value: skillValue(skill, row.boosts?.[skill.key])
  }));
  const promotions = row.promotions || 0;
  const [cardKey, cardLabel] = benefitFor(character);
  const pay = { coins: 5 + level * 2 + promotions * 6 };
  if (promotions > 0) pay[cardKey] = 1;
  return {
    ...character,
    level,
    xp: row.xp || 0,
    uses: row.uses || 0,
    nextXp: level * 25,
    rank: rankFor(level),
    promotions,
    promoTitle: PROMO_TITLES[Math.min(promotions, PROMO_TITLES.length - 1)] || '',
    energy: Math.max(0, Math.min(character.energy, row.energy)),
    energyMax: character.energy,
    skills,
    lastChange: row.lastChange || '',
    pay,
    cardKey,
    cardLabel,
    cardActive: promotions > 0,
    hired: Boolean(row.hired),
    hireCost: { coins: 40 + level * 20 },
    upgradeCost: { coins: 30 + level * 15 },
    promoCost: promotions >= 5 ? null : { coins: 100 + (promotions + 1) * 90 },
    trainCost: { coins: 30 + level * 15 }
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

export function upgradeCharacter(state, id) {
  const character = characterById(id);
  if (!character) return { ok: false, message: 'Unknown crew.' };
  const view = characterView(state, character);
  const row = rowFor(state, character);
  if (!row.hired) return { ok: false, message: `Hire ${character.name} before upgrading.` };
  if (!canAfford(state, view.upgradeCost)) return { ok: false, message: 'Not enough coins to upgrade.' };
  const change = raiseSkill(character, row, character.step);
  if (!change) return { ok: false, message: `${character.name} is already at 100% on every stat.` };
  spendCost(state, view.upgradeCost);
  row.level += 1;
  return { ok: true, message: `${character.name} upgraded. ${change}.` };
}

export function trainCharacter(state, id) {
  return upgradeCharacter(state, id);
}

export function promoteCharacter(state, id) {
  const character = characterById(id);
  if (!character) return { ok: false, message: 'Unknown crew.' };
  const view = characterView(state, character);
  const row = rowFor(state, character);
  if (!row.hired) return { ok: false, message: `Hire ${character.name} before promoting.` };
  if (!view.promoCost) return { ok: false, message: `${character.name} is already a Partner.` };
  if (!canAfford(state, view.promoCost)) return { ok: false, message: 'Not enough coins to promote.' };
  const change = raiseSkill(character, row, Math.max(0.5, Math.min(1, character.step)));
  if (!change) return { ok: false, message: `${character.name} is already at 100% on every stat.` };
  spendCost(state, view.promoCost);
  row.promotions += 1;
  const title = PROMO_TITLES[row.promotions] || 'Partner';
  const next = characterView(state, character);
  const cardNote = row.promotions === 1 ? ` ${next.cardLabel} now costs 1 each payday.` : '';
  return { ok: true, message: `${character.name} promoted to ${title}. Bonus ${change}. Pay is now ${next.pay.coins} coins.${cardNote}` };
}

function deskForRole(role) {
  return DESKS.find((desk) => desk.roles.includes(role)) || null;
}

export function ensureCrewEmployment(state) {
  if (!state.payroll) state.payroll = { elapsed: 0 };
  if (state.payroll.seeded) return;
  for (const desk of DESKS) {
    const roster = CHARACTERS.filter((character) => desk.roles.includes(character.role));
    const saved = state.assignments?.[desk.id];
    const id = saved && roster.some((character) => character.id === saved) ? saved : roster[0]?.id;
    const character = id ? characterById(id) : null;
    if (!character) continue;
    rowFor(state, character).hired = true;
    if (!state.assignments) state.assignments = {};
    state.assignments[desk.id] = character.id;
  }
  state.payroll.seeded = true;
}

export function hireCharacter(state, id) {
  ensureCrewEmployment(state);
  const character = characterById(id);
  if (!character) return { ok: false, message: 'Unknown crew.' };
  const view = characterView(state, character);
  const row = rowFor(state, character);
  if (row.hired) return { ok: false, message: `${character.name} is already hired.` };
  if (!canAfford(state, view.hireCost)) return { ok: false, message: 'Not enough coins to hire.' };
  spendCost(state, view.hireCost);
  row.hired = true;
  const desk = deskForRole(character.role);
  if (desk) {
    if (!state.assignments) state.assignments = {};
    const current = state.assignments[desk.id];
    const currentCrew = current ? characterById(current) : null;
    const currentHired = currentCrew ? rowFor(state, currentCrew).hired : false;
    if (!currentHired) state.assignments[desk.id] = character.id;
  }
  return { ok: true, message: `${character.name} hired. Salary ${view.pay.coins} coins.` };
}

export function fireCharacter(state, id) {
  ensureCrewEmployment(state);
  const character = characterById(id);
  if (!character) return { ok: false, message: 'Unknown crew.' };
  const row = rowFor(state, character);
  if (!row.hired) return { ok: false, message: `${character.name} is not on staff.` };
  row.hired = false;
  const desk = deskForRole(character.role);
  if (desk && state.assignments?.[desk.id] === character.id) {
    const next = CHARACTERS.find((item) => desk.roles.includes(item.role) && item.id !== character.id && rowFor(state, item).hired);
    state.assignments[desk.id] = next?.id || '';
  }
  return { ok: true, message: `${character.name} was fired. Their salary stops.` };
}

function employedIds(state) {
  ensureCrewEmployment(state);
  return CHARACTERS.filter((character) => rowFor(state, character).hired).map((character) => character.id);
}

export function tickPayroll(state, dt) {
  if (!state.payroll) state.payroll = { elapsed: 0 };
  state.payroll.elapsed += dt;
  if (state.payroll.elapsed < PAY_EVERY) return '';
  state.payroll.elapsed = 0;
  const spent = {};
  let people = 0;
  for (const id of employedIds(state)) {
    const character = characterById(id);
    if (!character) continue;
    const view = characterView(state, character);
    const bill = {};
    for (const [key, amount] of Object.entries(view.pay)) {
      if ((state.currencies[key] || 0) >= amount) bill[key] = amount;
    }
    if (!bill.coins) continue;
    spendCost(state, bill);
    people += 1;
    for (const [key, amount] of Object.entries(bill)) spent[key] = (spent[key] || 0) + amount;
  }
  if (!people) return '';
  return `Payday for ${people} employees. -${costToText(spent)}.`;
}
