export const SAVE_KEY = '365_road_runner_v1';

export const ROUTES = {
  barangay: {
    label: 'Barangay Route',
    description: 'Long rolling road with small bumps and roadside pickups.',
    profile: 'barangay',
    length: 9600,
    meters: 3200,
    sky: 0x8bdcff,
    grass: 0x58b957,
    road: 0x3a4555,
    seed: 1,
    reward: 1
  },
  mountain: {
    label: 'Mountain Parts Run',
    description: 'Longer climbs, deeper drops, better rewards.',
    profile: 'mountain',
    length: 12600,
    meters: 4200,
    sky: 0x86d4ff,
    grass: 0x4f9e52,
    road: 0x39414d,
    seed: 2,
    reward: 1.25
  },
  farm: {
    label: 'Farm Supply Run',
    description: 'Mixed rural road with moderate hills.',
    profile: 'farm',
    length: 10800,
    meters: 3600,
    sky: 0xa4e7ff,
    grass: 0x66bd45,
    road: 0x554537,
    seed: 3,
    reward: 1.15
  },
  track: {
    label: '365 Test Track',
    description: 'Smoother race-track style route for faster ghost runs.',
    profile: 'track',
    length: 9000,
    meters: 3000,
    sky: 0x9be7ff,
    grass: 0x4fb66b,
    road: 0x2d3748,
    seed: 5,
    reward: 1.1
  },
  port: {
    label: 'Port Export Route',
    description: 'Endurance route with long open sections.',
    profile: 'port',
    length: 13800,
    meters: 4600,
    sky: 0x93dfff,
    grass: 0x49a985,
    road: 0x36414d,
    seed: 4,
    reward: 1.35
  }
};

export function routeMeters(route, pixels) {
  return Math.floor(Math.max(0, pixels) * (route.meters / route.length));
}

export const GHOST_MODES = {
  solo: { label: 'Solo', count: 0 },
  ghost2: { label: '1 Ghost', count: 1 },
  ghost3: { label: '2 Ghosts', count: 2 },
  ghost4: { label: '3 Ghosts', count: 3 }
};

export const START_ROUTE = 'track';
export const START_GHOST_MODE = 'ghost2';
