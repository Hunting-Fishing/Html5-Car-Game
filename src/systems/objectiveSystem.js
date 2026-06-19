export function getObjectiveList(state) {
  return [
    {
      key: 'firstTap',
      title: 'Tap Race',
      body: 'Tap the Race boost/GAS control to start moving.',
      done: state.objectives.firstTap
    },
    {
      key: 'firstMerge',
      title: 'Merge Parts',
      body: 'Use the Merge Bay to combine two matching starter items.',
      done: state.objectives.firstMerge
    },
    {
      key: 'buildStorage',
      title: 'Build Parts Storage',
      body: 'Use parts and coins to increase your board permit.',
      done: state.objectives.buildStorage
    },
    {
      key: 'idleLineUpgrade',
      title: 'Upgrade Street Route',
      body: 'Open Business Lines and upgrade the starter Street Route.',
      done: state.objectives.idleLineUpgrade
    },
    {
      key: 'previewGhostRace',
      title: 'Challenge Rivals',
      body: 'Tap the Rivals badge in Race to line up nearby challengers.',
      done: state.objectives.previewGhostRace
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
  state.objectives.idleLineUpgrade = (state.idleLines?.lines?.streetRoute?.level || 0) > 1 || state.objectives.idleLineUpgrade;
  state.objectives.unlockPerformance = state.buildings.tuningCorner > 0 || state.objectives.unlockPerformance;
  state.objectives.unlockTrack = state.buildings.testTrack > 0 || state.objectives.unlockTrack;
  state.objectives.stageFive = state.stage >= 5 || state.objectives.stageFive;
}
