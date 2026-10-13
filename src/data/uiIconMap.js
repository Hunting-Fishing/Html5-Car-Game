import { publicAsset } from './assetUrl.js';
const UI_NAV_BASE = publicAsset('/assets/ui/nav');

// Player-facing UI icons live in public/assets/ui/icons.
// Keep these paths stable so designers can replace PNG/SVG files without
// touching rendering code. New HUD/nav art should stay under public/assets/ui/.
const ART = '?v=99';

export const UI_ICONS = {
  home: `${UI_NAV_BASE}/nav-home.png${ART}`,
  race: `${UI_NAV_BASE}/nav-race.png${ART}`,
  parts: `${UI_NAV_BASE}/nav-parts.png${ART}`,
  garage: `${UI_NAV_BASE}/nav-garage.png${ART}`,
  profile: `${UI_NAV_BASE}/item-driver.png${ART}`,
  menu: `${UI_NAV_BASE}/nav-menu.png${ART}`,
  staff: `${UI_NAV_BASE}/nav-staff.png${ART}`,
  settings: `${UI_NAV_BASE}/item-settings.png${ART}`,
  coin: `${UI_NAV_BASE}/item-coin.png${ART}`,
  tools: `${UI_NAV_BASE}/item-tools.png${ART}`,
  scrap: `${UI_NAV_BASE}/item-scrap.png${ART}`,
  tune: `${UI_NAV_BASE}/item-tune.png${ART}`,
  rep: `${UI_NAV_BASE}/item-rep.png${ART}`,
  fuel: `${UI_NAV_BASE}/item-fuel.png${ART}`
};

export const UI_NAV_ICONS = {
  home: `${UI_NAV_BASE}/nav-home.png${ART}`,
  race: `${UI_NAV_BASE}/nav-race.png${ART}`,
  parts: `${UI_NAV_BASE}/nav-parts.png${ART}`,
  garage: `${UI_NAV_BASE}/nav-garage.png${ART}`,
  staff: `${UI_NAV_BASE}/nav-staff.png${ART}`,
  menu: `${UI_NAV_BASE}/nav-menu.png${ART}`,
  driver: `${UI_NAV_BASE}/item-driver.png${ART}`,
  settings: `${UI_NAV_BASE}/item-settings.png${ART}`,
  coin: `${UI_NAV_BASE}/item-coin.png${ART}`,
  tools: `${UI_NAV_BASE}/item-tools.png${ART}`,
  tune: `${UI_NAV_BASE}/item-tune.png${ART}`,
  rep: `${UI_NAV_BASE}/item-rep.png${ART}`,
  scrap: `${UI_NAV_BASE}/item-scrap.png${ART}`,
  fuel: `${UI_NAV_BASE}/item-fuel.png${ART}`
};

export const SCREEN_ICON_MAP = {
  hub: UI_ICONS.home,
  world: UI_ICONS.home,
  race: UI_ICONS.race,
  parts: UI_ICONS.parts,
  lines: UI_ICONS.parts,
  merge: UI_ICONS.parts,
  garage: UI_ICONS.garage,
  profile: UI_ICONS.profile,
  creator: UI_ICONS.menu,
  menu: UI_ICONS.menu
};

export const CURRENCY_ICON_MAP = {
  coins: UI_ICONS.coin,
  parts: UI_ICONS.parts,
  tools: UI_ICONS.tools,
  scrap: UI_ICONS.scrap,
  tune: UI_ICONS.tune,
  rep: UI_ICONS.rep,
  fuelCans: UI_ICONS.fuel
};

export const CHAIN_ICON_MAP = {
  original: UI_ICONS.parts,
  tools: UI_ICONS.tools,
  performance: UI_ICONS.tune,
  racing: UI_ICONS.race
};

export function screenIconForId(id) {
  return SCREEN_ICON_MAP[id] || UI_ICONS.home;
}

export function currencyIconForKey(key) {
  return CURRENCY_ICON_MAP[key] || UI_ICONS.coin;
}

export function chainIconForKey(key) {
  return CHAIN_ICON_MAP[key] || UI_ICONS.parts;
}
