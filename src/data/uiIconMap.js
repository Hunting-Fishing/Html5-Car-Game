const UI_ICON_BASE = '/assets/ui/icons';
const UI_NAV_BASE = '/assets/ui/nav';
const ROAD_RUNNER_ICON_BASE = '/assets/road-runner';

// Player-facing UI icons live in public/assets/ui/icons.
// Keep these paths stable so designers can replace PNG/SVG files without
// touching rendering code. New HUD/nav art should stay under public/assets/ui/.
export const UI_ICONS = {
  home: `${UI_ICON_BASE}/home.png`,
  race: `${UI_ICON_BASE}/race.png`,
  parts: `${UI_ICON_BASE}/parts.png`,
  garage: `${UI_ICON_BASE}/garage.png`,
  profile: `${UI_ICON_BASE}/profile.png`,
  menu: `${UI_ICON_BASE}/menu.png`,
  coin: `${UI_ICON_BASE}/coin.png`,
  tools: `${UI_ICON_BASE}/tools.png`,
  scrap: `${UI_ICON_BASE}/scrap.png`,
  tune: `${UI_ICON_BASE}/tune.png`,
  rep: `${UI_ICON_BASE}/rep.png`,
  fuel: `${ROAD_RUNNER_ICON_BASE}/token-energy.svg`
};

export const UI_NAV_ICONS = {
  home: `${UI_NAV_BASE}/icon-home.svg`,
  race: `${UI_NAV_BASE}/icon-race.svg`,
  parts: `${UI_NAV_BASE}/icon-parts.svg`,
  garage: `${UI_NAV_BASE}/icon-garage.svg`,
  menu: `${UI_NAV_BASE}/icon-menu.svg`,
  tools: `${UI_NAV_BASE}/icon-tools.svg`,
  tune: `${UI_NAV_BASE}/icon-tune.svg`,
  rep: `${UI_NAV_BASE}/icon-rep.svg`,
  scrap: `${UI_NAV_BASE}/icon-scrap.svg`,
  fuel: `${UI_NAV_BASE}/icon-fuel.svg`
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
