import { publicAsset } from './assetUrl.js';

const LAST = ['Reyes', 'Santos', 'Cruz', 'Bautista'];
const FACE = 'MFFMMMMFMFMFMFFMFMMFMFMFMFMMFMFMFMFMMFMFFMFFMMFMFMMFFMFMMFFMMFMFMFMFFMMMMFFMMFFMFMFMFMFMFFMFMFMFFMMM';
const MALE = ['Marco', 'Nico', 'Carlo', 'Enzo', 'Gino', 'Isko', 'Kiko', 'Mico', 'Omar', 'Tito', 'Sol', 'Rae', 'Andres', 'Ben', 'Cesar', 'Diego', 'Eli', 'Felix', 'Hugo', 'Ivan', 'Jorge', 'Ken', 'Luis', 'Mateo', 'Noel', 'Paolo', 'Rafael', 'Sergio', 'Tomas', 'Vicente', 'Bong', 'Danilo', 'Emil', 'Franco', 'Hector', 'Jun', 'Leo', 'Mario', 'Nestor', 'Oscar', 'Pedro', 'Ramon', 'Teo', 'Vito', 'Wilson', 'Alex', 'Bruno', 'Chris', 'Dante', 'Edgar', 'Fred', 'Gabe', 'Hiro'];
const FEMALE = ['Liza', 'Bea', 'Dina', 'Faye', 'Hana', 'Jade', 'Lani', 'Nia', 'Pia', 'Rosa', 'Uma', 'Ari', 'Ana', 'Bella', 'Cora', 'Elena', 'Flora', 'Gina', 'Ines', 'Joy', 'Kara', 'Luz', 'Maya', 'Nina', 'Olga', 'Perla', 'Rita', 'Sara', 'Tala', 'Vera', 'Willa', 'Yana', 'Zia', 'Amina', 'Bianca', 'Celia', 'Daisy', 'Eva', 'Fe', 'Grace', 'Helen', 'Ida', 'Jessa', 'Kim', 'Lara', 'Mina', 'Nora'];
const FIRST = Array.from(FACE, (face, index) => {
  const pool = face === 'M' ? MALE : FEMALE;
  const used = FACE.slice(0, index).split('').filter((item) => item === face).length;
  return pool[used];
});
const ROLES = [
  { role: 'Driver', crew: 'Drive', avatar: 'driver', parts: ['race', 'grip', 'fuel'] },
  { role: 'Mechanic', crew: 'Shop', avatar: 'mechanic', parts: ['repair', 'parts', 'grip'] },
  { role: 'Courier', crew: 'Drive', avatar: 'residentGreen', parts: ['parts', 'route', 'fuel'] },
  { role: 'Fuel Hand', crew: 'Shop', avatar: 'residentBlue', parts: ['fuel', 'route', 'parts'] },
  { role: 'Tow Hand', crew: 'Crew', avatar: 'residentOrange', parts: ['tow', 'repair', 'route'] },
  { role: 'Sales', crew: 'Crew', avatar: 'residentPurple', parts: ['sales', 'route', 'race'] },
  { role: 'Tuner', crew: 'Shop', avatar: 'mechanic', parts: ['grip', 'race', 'fuel'] },
  { role: 'Pit Crew', crew: 'Crew', avatar: 'driver', parts: ['race', 'repair', 'fuel'] }
];
const LINES = ['streetRoute', 'partsDelivery', 'mobileMechanic', 'fuelRun', 'towingJob', 'dealerShowcase', 'performanceBay', 'raceEvent'];

export const SKILL_LABELS = {
  race: 'Race',
  grip: 'Grip',
  fuel: 'Fuel',
  repair: 'Repair',
  parts: 'Parts',
  route: 'Route',
  tow: 'Tow',
  sales: 'Sales'
};

function quarter(index, salt) {
  const steps = 1 + ((index * 5 + salt * 7) % 28);
  return Math.round(steps * 25) / 100;
}

function enhanceStep(index) {
  const roll = (index * 17) % 20;
  if (roll === 0) return 7;
  if (roll === 1) return 4;
  if (roll < 4) return 2;
  if (roll < 8) return 1;
  if (roll < 14) return 0.5;
  return 0.25;
}

function skillsFor(index, parts) {
  const count = 1 + (index % 3);
  const startAt = index % parts.length;
  const keys = Array.from({ length: count }, (_, offset) => parts[(startAt + offset) % parts.length]);
  const used = new Set();
  return keys.map((key, salt) => {
    let start = quarter(index, salt + 2);
    while (used.has(start) && start > 0.25) start = Math.round((start - 0.25) * 100) / 100;
    used.add(start);
    return { key, start };
  });
}

export const CHARACTERS = Array.from({ length: 100 }, (_, index) => {
  const role = ROLES[index % ROLES.length];
  const startLevel = 1 + (index % 11 === 0 ? 4 : index % 6 === 0 ? 2 : 0);
  return {
    id: `crew-${String(index + 1).padStart(3, '0')}`,
    name: `${FIRST[index]} ${LAST[Math.floor(index / 25)]}`,
    role: role.role,
    crew: role.crew,
    avatar: role.avatar,
    sprite: publicAsset(`assets/World/people/crew/crew-${String(index + 1).padStart(3, '0')}.png?v=84`),
    lineKey: LINES[index] || '',
    startLevel,
    energy: 40 + ((index * 13) % 61),
    step: enhanceStep(index),
    skills: skillsFor(index, role.parts)
  };
});

export function characterById(id) {
  return CHARACTERS.find((character) => character.id === id) || null;
}

export function characterForLine(lineKey) {
  return CHARACTERS.find((character) => character.lineKey === lineKey) || null;
}
