export function defaultState() {
  return {
    version: 10,
    activeScreen: 'hub',
    playerName: 'Garage Rookie',
    createdAt: Date.now(),
    lastSaveAt: Date.now(),
    lastTickAt: Date.now(),
    stage: 1,
    level: 1,
    xp: 0,
    currencies: {
      coins: 50,
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
    idleLines: {
      lifetimeCollections: 0,
      managers: {
        streetRoute: false,
        partsDelivery: false,
        mobileMechanic: false,
        fuelRun: false,
        towingJob: false,
        dealerShowcase: false,
        performanceBay: false,
        raceEvent: false
      },
      lines: {
        streetRoute: { level: 1, cycle: 0, collected: 0 },
        partsDelivery: { level: 0, cycle: 0, collected: 0 },
        mobileMechanic: { level: 0, cycle: 0, collected: 0 },
        fuelRun: { level: 0, cycle: 0, collected: 0 },
        towingJob: { level: 0, cycle: 0, collected: 0 },
        dealerShowcase: { level: 0, cycle: 0, collected: 0 },
        performanceBay: { level: 0, cycle: 0, collected: 0 },
        raceEvent: { level: 0, cycle: 0, collected: 0 }
      }
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
      idleLineUpgrade: false,
      firstManager: false,
      buildStorage: false,
      unlockPerformance: false,
      unlockTrack: false,
      fixProblem: false,
      stageFive: false
    },
    log: [
      'Welcome to 365 Micro Garage. Collect Street Route income, upgrade idle lines, then use Merge Bay to support the garage.'
    ]
  };
}
