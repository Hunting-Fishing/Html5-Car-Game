# Ghost Racing Model

Ghost racing is asynchronous replay racing. It is not live PVP.

The current implementation is local-first:

- local best ghosts are stored in `localStorage` under `365_road_runner_ghosts_v1`
- best records are keyed by route and stage
- route best time and stage best time indexes are kept for menus and future leaderboards
- seeded AI ghosts are generated locally and deterministically
- future friend/remote ghosts should use the same shape with `source: "remote_best"`

The app-level utility facade lives in `src/systems/ghostRaceSystem.js`:

- `saveLocalGhostRun(routeKey, stage, runData)`
- `getBestLocalGhost(routeKey, stage?)`
- `compareGhostTime(playerTimeMs, ghostTimeMs)`
- `serializeGhostRun(samples)`
- `validateGhostRunShape(ghost)`

This facade must stay localStorage-based until server validation is intentionally added.

## Ghost Record Contract

```json
{
  "ghostId": "local_best_street",
  "playerName": "Garage Rookie",
  "route": "street",
  "stage": 4,
  "bestTimeMs": 42350,
  "carKey": "starter_compact",
  "recordedAt": 1730000000000,
  "source": "local_best",
  "samples": [
    { "t": 0, "x": 0, "speed": 0 },
    { "t": 500, "x": 6.5, "speed": 13 },
    { "t": 1000, "x": 14.2, "speed": 15 }
  ]
}
```

## Fields

- `ghostId`: stable ID for the replay, such as `local_best_track_stage_4`
- `playerName`: display name shown over the ghost car
- `route`: route key, such as `track`, `barangay`, `farm`, `mountain`, or `port`
- `stage`: companion game stage when the replay was recorded
- `bestTimeMs`: completed-route time in milliseconds
- `carKey`: vehicle asset/gameplay key used by the replay
- `recordedAt`: Unix timestamp in milliseconds
- `source`: `local_best`, `seeded_ai`, or future `remote_best`
- `samples`: replay points recorded during the run

## Sample Coordinates

Each sample uses route-local progress:

- `t`: milliseconds since run start
- `x`: route-local x progress, where `0` is the start line
- `speed`: displayed km/h at that moment

The renderer converts `x` back into canvas world position for replay. This keeps saved ghosts portable if the screen camera or canvas size changes.

## Storage Shape

```json
{
  "version": 1,
  "localBest": {
    "track::stage_4": {
      "ghostId": "local_best_track_stage_4",
      "playerName": "Garage Rookie",
      "route": "track",
      "stage": 4,
      "bestTimeMs": 42350,
      "carKey": "hatchback",
      "recordedAt": 1730000000000,
      "source": "local_best",
      "samples": []
    }
  },
  "routeBestTimes": {
    "track": {
      "ghostId": "local_best_track_stage_4",
      "bestTimeMs": 42350,
      "route": "track",
      "stage": 4,
      "carKey": "hatchback",
      "recordedAt": 1730000000000
    }
  },
  "stageBestTimes": {
    "4": {
      "ghostId": "local_best_track_stage_4",
      "bestTimeMs": 42350,
      "route": "track",
      "stage": 4,
      "carKey": "hatchback",
      "recordedAt": 1730000000000
    }
  },
  "updatedAt": 1730000000000
}
```

## Runtime Rules

1. A ghost is only saved as a local best when the route is completed.
2. A new local ghost replaces the stored route/stage ghost only when `bestTimeMs` is faster.
3. The active race ghost list is selected in this order:
   - current route/stage local best, when available
   - seeded AI ghosts until the selected ghost count is filled
4. Old `bestTrail` saves are migrated into the new store as `track::stage_1` only when no local best exists there.
5. No server or cloud save is used yet.
