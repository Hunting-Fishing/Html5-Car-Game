export const SAVE_KEY = '365_road_runner_v1';

export const ROUTES = {
  barangay: {
    label: 'Barangay Route',
    length: 1600,
    sky: 0x8bdcff,
    grass: 0x58b957,
    road: 0x3a4555,
    seed: 1
  },
  mountain: {
    label: 'Mountain Parts Run',
    length: 2050,
    sky: 0x86d4ff,
    grass: 0x4f9e52,
    road: 0x39414d,
    seed: 2
  },
  farm: {
    label: 'Farm Supply Run',
    length: 1850,
    sky: 0xa4e7ff,
    grass: 0x66bd45,
    road: 0x554537,
    seed: 3
  },
  port: {
    label: 'Port Export Route',
    length: 2250,
    sky: 0x93dfff,
    grass: 0x49a985,
    road: 0x36414d,
    seed: 4
  }
};

export const GHOST_MODES = {
  solo: { label: 'Solo', count: 0 },
  ghost2: { label: '1 Ghost', count: 1 },
  ghost3: { label: '2 Ghosts', count: 2 },
  ghost4: { label: '3 Ghosts', count: 3 }
};

export const START_ROUTE = 'barangay';
export const START_GHOST_MODE = 'ghost2';
