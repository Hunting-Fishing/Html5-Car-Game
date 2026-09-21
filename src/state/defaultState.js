export function defaultState() {
  return {
    version: 11,
    activeScreen: 'hub',
    driveTab: 'idle',
    lotTab: 'town',
    playerName: 'Garage Rookie',
    createdAt: Date.now(),
    lastSaveAt: Date.now(),
    lastTickAt: Date.now(),
    stage: 1,
    level: 1,
    xp: 0,
    currencies: {
      coins: 80,
      scrap: 18,
      parts: 12,
      tools: 6,
      tune: 0,
      rep: 2,
      fuelCans: 3
    },
    race: {
      mode: 'street',
      progress: 0,
      fuel: 100,
      condition: 100,
      heat: 0,
      problem: null,
      lifetimeMeters: 0,
      completedStages: 0,
      trafficCooldown: 0
    },
    hill: {
      running: false,
      gasHeld: false,
      distance: 0,
      fuel: 100,
      tilt: 0,
      best: 0,
      speed: 0
    },
    shop: {
      wash: 1,
      detail: 0,
      service: 0,
      lotRental: 0,
      showcaseShop: 0,
      banked: 0
    },
    lot: {
      owned: { office: 1 },
      pending: 0,
      lastCollectAt: Date.now()
    },
    upgrades: {
      tapCrew: 1,
      idleDriver: 1,
      routeScout: 0,
      fuelPlan: 0,
      pitKit: 0,
      supplierShelf: 0
    },
    buildings: {
      partsStorage: 0,
      tuningCorner: 0,
      testTrack: 0,
      companionHub: 0
    },
    merge: {
      supplierTimer: 2,
      supplierDuration: 4.5,
      supplierSlots: [null, null, null],
      board: Array.from({ length: 16 }, () => null),
      selectedIndex: null,
      totalMerges: 0,
      highestItemLevel: 1
    },
    daily: {
      day: new Date().toDateString(),
      taps: 0,
      merges: 0,
      hills: 0,
      lotCollects: 0,
      claimed: {}
    },
    objectives: {
      firstTap: false,
      firstMerge: false,
      buildStorage: false,
      unlockPerformance: false,
      unlockTrack: false,
      fixProblem: false,
      stageFive: false
    },
    tips: {
      welcome: false,
      race: false,
      merge: false,
      showcase: false,
      lot: false,
      hill: false
    },
    pendingOffline: null,
    log: [
      '365 Micro Garage: Drive, Merge, build the Lot, and run the idle shop. All wallets are shared.'
    ]
  };
}
