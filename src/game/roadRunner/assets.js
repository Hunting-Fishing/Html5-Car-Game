export const ROAD_RUNNER_ASSETS = {
  player: {
    key: 'rr-player-car',
    path: '/assets/vehicles/car-compact-blue.svg',
    width: 112,
    height: 56
  },
  ghostA: {
    key: 'rr-ghost-a',
    path: '/assets/vehicles/car-compact-green.svg',
    width: 112,
    height: 56
  },
  ghostB: {
    key: 'rr-ghost-b',
    path: '/assets/vehicles/pickup-orange.svg',
    width: 124,
    height: 58
  },
  ghostC: {
    key: 'rr-ghost-c',
    path: '/assets/vehicles/van-service-white.svg',
    width: 126,
    height: 58
  },
  coin: {
    key: 'rr-token-coin',
    path: '/assets/road-runner/token-coin.svg',
    width: 48,
    height: 48
  },
  energy: {
    key: 'rr-token-energy',
    path: '/assets/road-runner/token-energy.svg',
    width: 48,
    height: 48
  },
  parts: {
    key: 'rr-token-parts',
    path: '/assets/road-runner/token-parts.svg',
    width: 48,
    height: 48
  }
};

export function preloadRoadRunnerAssets(scene) {
  Object.values(ROAD_RUNNER_ASSETS).forEach((asset) => {
    scene.load.svg(asset.key, asset.path, {
      width: asset.width,
      height: asset.height
    });
  });
}
