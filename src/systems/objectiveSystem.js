export function getObjectiveList(state) {
  return [
    {
      key: 'firstTap',
      title: 'Start your first route',
      body: 'Tap Race Boost once on the Race screen.',
      done: state.objectives.firstTap
    },
    {
      key: 'firstMerge',
      title: 'Merge two starter items',
      body: 'Use the Merge Bay. Supplier only gives Level 1 items.',
      done: state.objectives.firstMerge
    },
    {
      key: 'buildStorage',
      title: 'Build Parts Storage',
      body: 'Use parts and coins to increase your board permit.',
      done: state.objectives.buildStorage
    },
    {
      key: 'unlockPerformance',
      title: 'Unlock Performance Parts',
      body: 'Build the Tuning Corner. Do not drop performance items early.',
      done: state.objectives.unlockPerformance
    },
    {
      key: 'unlockTrack',
      title: 'Open the 2D Test Track',
      body: 'Build the Test Track to unlock racing gear.',
      done: state.objectives.unlockTrack
    },
    {
      key: 'fixProblem',
      title: 'Fix one route problem',
      body: 'Resolve fuel, breakdown, police heat, or traffic once.',
      done: state.objectives.fixProblem
    },
    {
      key: 'stageFive',
      title: 'Reach Stage 5',
      body: 'Keep upgrading and completing route stages.',
      done: state.objectives.stageFive
    }
  ];
}

export function applyDerivedObjectives(state) {
  state.objectives.buildStorage = state.buildings.partsStorage > 0 || state.objectives.buildStorage;
  state.objectives.unlockPerformance = state.buildings.tuningCorner > 0 || state.objectives.unlockPerformance;
  state.objectives.unlockTrack = state.buildings.testTrack > 0 || state.objectives.unlockTrack;
  state.objectives.stageFive = state.stage >= 5 || state.objectives.stageFive;
}
