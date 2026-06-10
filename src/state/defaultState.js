export function defaultState() {
  return {
    version: 9,
    activeScreen: 'hub',
    playerName: 'Garage Rookie',
    createdAt: Date.now(),
    lastSaveAt: Date.now(),
    lastTickAt: Date.now(),
    stage: 1,
    level: 1,
    xp: 0,
    currencies: {
      coins: 0,
      scrap: 10,
      parts: 0,
      tools: 0,
      tune: 0,
      rep: 0,
      fuelCans: 2
    },
    race: {
      mode: 'street',
      progress: 0,
      fuel: 100,
      condition: 100,
      heat: 0,
      problem: null,
      lifetimeMeters: 0,
      completedStages: 0
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
      supplierDuration: 5,
      supplierSlots: [null, null, null],
      board: Array.from({ length: 16 }, () => null),
      selectedIndex: null,
      totalMerges: 0,
      highestItemLevel: 1
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
    log: [
      'Welcome to 365 Micro Garage. Tap Race, merge starter parts, and build the garage systems.'
    ]
  };
}
