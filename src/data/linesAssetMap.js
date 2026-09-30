export const LINES_ASSET_BASE = '/assets/Lines';

// Idle business line replacement art belongs under public/assets/Lines.
// Icons are used by compact rows and manager/collection status panels.
export const LINE_ASSETS = {
  streetRoute: `${LINES_ASSET_BASE}/icons/street-route.svg`,
  partsDelivery: `${LINES_ASSET_BASE}/icons/parts-delivery.svg`,
  mobileMechanic: `${LINES_ASSET_BASE}/icons/mobile-mechanic.svg`,
  fuelRun: `${LINES_ASSET_BASE}/icons/fuel-run.svg`,
  towingJob: `${LINES_ASSET_BASE}/icons/towing-job.svg`,
  dealerShowcase: `${LINES_ASSET_BASE}/icons/dealer-showcase.svg`,
  performanceBay: `${LINES_ASSET_BASE}/icons/performance-bay.svg`,
  raceEvent: `${LINES_ASSET_BASE}/icons/race-event.svg`
};

export const LINES_GUI_ASSETS = {
  panelFrame: `${LINES_ASSET_BASE}/gui/panel-frame.svg`,
  lineCard: `${LINES_ASSET_BASE}/gui/line-card.svg`,
  progressTrack: `${LINES_ASSET_BASE}/gui/progress-track.svg`,
  progressFill: `${LINES_ASSET_BASE}/gui/progress-fill.svg`,
  collectButton: `${LINES_ASSET_BASE}/gui/collect-button.svg`,
  upgradeButton: `${LINES_ASSET_BASE}/gui/upgrade-button.svg`,
  hireManagerButton: `${LINES_ASSET_BASE}/gui/hire-manager-button.svg`,
  lockedOverlay: `${LINES_ASSET_BASE}/gui/locked-overlay.svg`,
  autoBadge: `${LINES_ASSET_BASE}/badges/auto-badge.svg`,
  manualBadge: `${LINES_ASSET_BASE}/badges/manual-badge.svg`,
  lockedBadge: `${LINES_ASSET_BASE}/badges/locked-badge.svg`
};

export const LINES_ASSET_LIST = [
  ...Object.entries(LINE_ASSETS).map(([key, src]) => ({ category: 'icons', key, src })),
  ...Object.entries(LINES_GUI_ASSETS).map(([key, src]) => ({ category: 'gui', key, src }))
];

export function lineAssetForKey(key) {
  return LINE_ASSETS[key] || '';
}
