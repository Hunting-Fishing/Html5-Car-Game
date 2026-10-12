const FIRST = ['Liza', 'Marco', 'Nico', 'Ari', 'Rae', 'Sol', 'Bea', 'Carlo', 'Dina', 'Enzo', 'Faye', 'Gino', 'Hana', 'Isko', 'Jade', 'Kiko', 'Lani', 'Mico', 'Nia', 'Omar', 'Pia', 'Quin', 'Rosa', 'Tito', 'Uma'];
const LAST = ['Reyes', 'Santos', 'Cruz', 'Bautista'];
const ROLES = [
  { role: 'Driver', crew: 'Drive', avatar: 'driver' },
  { role: 'Mechanic', crew: 'Shop', avatar: 'mechanic' },
  { role: 'Courier', crew: 'Drive', avatar: 'residentGreen' },
  { role: 'Fuel Hand', crew: 'Shop', avatar: 'residentBlue' },
  { role: 'Tow Hand', crew: 'Crew', avatar: 'residentOrange' },
  { role: 'Sales', crew: 'Crew', avatar: 'residentPurple' },
  { role: 'Tuner', crew: 'Shop', avatar: 'mechanic' },
  { role: 'Pit Crew', crew: 'Crew', avatar: 'driver' }
];
const LINES = ['streetRoute', 'partsDelivery', 'mobileMechanic', 'fuelRun', 'towingJob', 'dealerShowcase', 'performanceBay', 'raceEvent'];

function stat(index, salt) {
  return 4 + ((index * 7 + salt * 5) % 10);
}

export const CHARACTERS = Array.from({ length: 100 }, (_, index) => {
  const role = ROLES[index % ROLES.length];
  const startLevel = 1 + (index % 11 === 0 ? 4 : index % 6 === 0 ? 2 : 0);
  return {
    id: `crew-${String(index + 1).padStart(3, '0')}`,
    name: `${FIRST[index % FIRST.length]} ${LAST[Math.floor(index / FIRST.length)]}`,
    role: role.role,
    crew: role.crew,
    avatar: role.avatar,
    lineKey: LINES[index] || '',
    startLevel,
    base: {
      drive: stat(index, 1),
      grip: stat(index, 2),
      fuel: stat(index, 3),
      repair: stat(index, 4)
    },
    growth: {
      drive: 1 + (index % 3),
      grip: 1 + ((index + 1) % 3),
      fuel: 1 + ((index + 2) % 2),
      repair: 1 + (index % 2)
    }
  };
});

export function characterById(id) {
  return CHARACTERS.find((character) => character.id === id) || null;
}

export function characterForLine(lineKey) {
  return CHARACTERS.find((character) => character.lineKey === lineKey) || null;
}
