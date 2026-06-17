export const BUILD_ASSET_BASE = '/assets/Build';

export const BUILD_ROOM_ASSETS = {
  frontLot: `${BUILD_ASSET_BASE}/rooms/front-lot.svg`,
  partsCounter: `${BUILD_ASSET_BASE}/rooms/parts-counter.svg`,
  serviceBay: `${BUILD_ASSET_BASE}/rooms/service-bay.svg`,
  towYard: `${BUILD_ASSET_BASE}/rooms/tow-yard.svg`,
  tuningCorner: `${BUILD_ASSET_BASE}/rooms/tuning-corner.svg`,
  testTrack: `${BUILD_ASSET_BASE}/rooms/test-track.svg`
};

export const BUILD_SYSTEM_ASSETS = {
  partsStorage: `${BUILD_ASSET_BASE}/systems/parts-storage.svg`,
  tuningCorner: `${BUILD_ASSET_BASE}/systems/tuning-corner.svg`,
  testTrack: `${BUILD_ASSET_BASE}/systems/test-track.svg`,
  companionHub: `${BUILD_ASSET_BASE}/systems/companion-hub.svg`
};

export const BUILD_GUI_ASSETS = {
  panelFrame: `${BUILD_ASSET_BASE}/ui/panel-frame.svg`,
  roomCard: `${BUILD_ASSET_BASE}/ui/room-card.svg`,
  buildButton: `${BUILD_ASSET_BASE}/ui/build-button.svg`,
  upgradeButton: `${BUILD_ASSET_BASE}/ui/upgrade-button.svg`,
  worldButton: `${BUILD_ASSET_BASE}/ui/world-button.svg`,
  linesButton: `${BUILD_ASSET_BASE}/ui/lines-button.svg`,
  lockedBadge: `${BUILD_ASSET_BASE}/ui/locked-badge.svg`,
  levelBadge: `${BUILD_ASSET_BASE}/ui/level-badge.svg`,
  syncBadge: `${BUILD_ASSET_BASE}/ui/sync-badge.svg`,
  progressTrack: `${BUILD_ASSET_BASE}/ui/progress-track.svg`,
  progressFill: `${BUILD_ASSET_BASE}/ui/progress-fill.svg`
};

export const BUILD_ICON_ASSETS = {
  buildMode: `${BUILD_ASSET_BASE}/icons/build-mode.svg`,
  worldSync: `${BUILD_ASSET_BASE}/icons/world-sync.svg`,
  lineSync: `${BUILD_ASSET_BASE}/icons/line-sync.svg`,
  restock: `${BUILD_ASSET_BASE}/icons/restock.svg`,
  routeLink: `${BUILD_ASSET_BASE}/icons/route-link.svg`
};

export const BUILD_ASSET_LIST = [
  ...Object.entries(BUILD_ROOM_ASSETS).map(([key, src]) => ({ category: 'rooms', key, src })),
  ...Object.entries(BUILD_SYSTEM_ASSETS).map(([key, src]) => ({ category: 'systems', key, src })),
  ...Object.entries(BUILD_GUI_ASSETS).map(([key, src]) => ({ category: 'ui', key, src })),
  ...Object.entries(BUILD_ICON_ASSETS).map(([key, src]) => ({ category: 'icons', key, src }))
];

export function buildRoomAssetForKey(key) {
  return BUILD_ROOM_ASSETS[key] || '';
}

export function buildSystemAssetForKey(key) {
  return BUILD_SYSTEM_ASSETS[key] || BUILD_ROOM_ASSETS[key] || '';
}

