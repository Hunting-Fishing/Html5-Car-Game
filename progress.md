Original prompt: Html5 .JS.Css , Please make the assets i put in for merge Shown in the merge game section.

- Located 48 mapped merge item assets under `public/assets/Merge`.
- Found asset URLs use lowercase `/assets/merge`, which does not match the actual folder casing.
- Confirmed the broken URLs produced completed images with zero natural dimensions.
- Corrected all asset URLs to `/assets/Merge`, rendered images directly in `renderItem()`, and removed the observer runtime from `index.html`.
- Verified all 48 asset URLs return HTTP 200 and the production build succeeds.
- Verified `Place All` and `Auto Merge`: Bolt Pack art changes to Washer Set art with valid image dimensions.
- Removed the global crate texture from Merge cards so item artwork stays readable.
- Final mobile visual check passed with shelf and board artwork visible at the intended size.
- No browser console or page errors were reported.

Current prompt: Update the Road Runner drive HUD: combine wallet/run resource values, show next fuel distance, place Ghost beside Route, raise gauges, move gear to GAS, and remove the brake instruction banner.

- Restored `src/ui/roadRunnerRuntimeWorldMapsHudLoader.js` as a direct HUD enhancer for the current runtime.
- Runtime now publishes live coins, parts, tools, fuel range, speed, RPM, and gear state.
- Removed the drive-screen brake instruction banner.
- Found and fixed a hidden post-run panel rule that was darkening the active drive screen.
- 537x612 layout check passed: route/ghost gap 6px, gauge/counter gap 12px, gear updates on GAS, and no console errors.
- Shortened the fuel card to keep next-stop distance fully visible.
- Added a 2x2 resource grid below 430px so totals and run gains remain readable.
- 390x844 check passed with 153px resource cards, live G2 gear feedback, no instruction banner, and the post-run panel hidden correctly.
- Final production build passed. TODOs: none for this request.
## Road Runner physics and damage

- Terrain hazard wear now starts at 50 km/h; potholes, gravel, rough road, and mud cause zero wear below the threshold.
- Braking and suspension upgrades reduce terrain hazard damage above 50 km/h.
- Speed, gears, RPM, redline, and gauge ranges now derive from the selected vehicle, route scale, and engine/tire/transmission upgrades.
- The HUD uses dynamic speedometer and tachometer maxima and supports reverse gear on the GAS pedal.
- Terrain wear is time-scaled so high-speed impacts are progressive instead of ending a run instantly.
- Added `render_game_to_text()` and `advanceTime(ms)` hooks for deterministic Road Runner playtests.
- Verified pure physics assertions, mobile playtests for starter and upgraded race vehicles, `git diff --check`, and `npm run build`.

Current prompt: Correct the speed/RPM gauge behavior and fix the clipped after-race card.

- Baseline measurement found the starter reached 98 km/h in 1 second and redlined first gear within 0.25 seconds.
- Retuned acceleration, drag, braking, hill force, and high-speed power taper for a more believable speed build.
- Widened gear bands and added RPM inertia so the tach no longer snaps through the range.
- Made the post-race overlay vertically scroll-safe and compacted its mobile reward/detail/action layout.
- Verified the maximum nine-reward result layout fits with all details and actions visible, and clamped displayed fuel to 100%.
- Added shift hysteresis so terrain speed changes do not chatter between adjacent gears.
- 634x987 result-card test passed: nine rewards, all four details, and all three actions fit without scrolling or clipping.
- Starter test: about 95 km/h after 7 seconds. Max race test: about 205 km/h after 6 seconds. No browser console errors.

Current prompt: Remove all Race/result scrolling and enhance the GUI with assets already in the HTML5 folder.

- Located the bundled Kenney UI pack and selected scalable blue/green/yellow/red button SVGs plus filled/outline star assets.
- Converted Drive into a fixed viewport with compact tabs, in-frame Ghost cycling, and an in-frame Restart control.
- Converted the result overlay to a fixed grid with overflow disabled rather than a scrollable card.
- Applied Kenney GUI art to Race tabs, route/ghost badges, restart, pedals, result stars, percentage plate, and result actions.
- Verified zero scrolling at 390x844 and 466x456: body height equals viewport height, result scroll height equals client height, and all nine rewards/details/actions fit.
- Verified Retry, Restart, and Ghost cycling interactions; no browser console errors.

Follow-up prompt: Fix the ugly post-run result card where reward tiles stretched into vertical pillars.

- Reworked the no-scroll result overlay from a stretching CSS grid into a compact flex card with fixed reward, detail, and action heights.
- Kept short viewports full-frame for fit, but made taller screens use an auto-height centered result card to remove the empty dark slab below the buttons.
- Verified the three-reward case at 634x987, 466x456, and 390x844 with zero page scroll and zero panel scroll.
- Verified a nine-reward stress case at 634x987; all reward chips, detail chips, and action buttons fit without scroll or clipping.
- Production build passed. Only observed browser warning was a Playwright/WebGL driver performance warning during automated capture, not an app error.

Follow-up prompt: Use the same collection/token assets on the post-run rewards and GUI assets for Retry/Garage/Missions.

- Updated post-run reward tiles to use the race HUD token assets for coins, parts, and tools.
- Added a tools reward tile when a run collects tools, matching the drive collection HUD.
- Grouped mission rewards by Progress/Day/Week so the result card stays compact while still showing parts add-ons as `+1P`/`+5P`.
- Added asset icons to Retry, Garage, and Missions buttons, using the Kenney repeat/check assets plus the existing mechanic-shop asset.
- Verified tall, narrow, and short race result screens: seven reward tiles, all reward/action icons loaded, zero page scroll, and zero panel scroll.
- Production build passed. The only automated-browser warning observed was the known WebGL driver performance warning during capture.

Follow-up prompt: Retune Road Runner vehicle speed and RPM so the km/h gauge matches the on-screen speed better.

- Calibrated the km/h gauge conversion so stock and upgraded vehicles report believable road speeds for the visible screen motion.
- Telemetry now uses actual traveled distance per frame after hazard slowdown and clamping, so the speedometer reflects what the car is really doing on screen.
- Reduced throttle RPM boost and slowed RPM smoothing so the tach no longer snaps as quickly through shifts.
- Verified sample curves: stock hatchback top speed now reads about 110 km/h, max hatchback about 178 km/h, and max super coupe about 240 km/h.
- Captured and inspected starter/max/super drive screenshots; gauges and HUD remained readable.
- `git diff --check` passed for touched files, and production build passed.

Follow-up prompt: Compare against Hill Climb Racing references and make Road Runner speed more responsive.

- Reviewed `gllms/Hill`, which uses Matter.js bodies, direct wheel angular velocity for throttle, camera follow, non-wireframe rendering, and continuously generated road segments from noise.
- Confirmed `seanpm2001/SeansLifeArchive_Images_Hill-Climb-Racing` is an image/archive reference rather than runnable physics or map-generation code.
- Added a sampled terrain profile per route so road height is generated in chunks with clamped slope changes instead of relying only on live sine formulas.
- Increased launch/low-speed torque, reduced drag/gravity braking, and added a top-end power band so vehicles respond quickly without instantly snapping to maximum speed.
- Recalibrated km/h output again so starter, upgraded hatchback, and upgraded super coupe feel faster and better match the visible road motion.
- Probe results after the tuning: stock hatchback reaches about 51 km/h at 2.8s and 114 km/h at 7.8s; max hatchback reaches about 181 km/h at 5.6s; max super coupe reaches about 260 km/h at 6.6s.
- Inspected starter/max/super screenshots, ran `git diff --check`, and production build passed.

Follow-up prompt: Make cars move faster and make engine/other upgrades matter more.

- Retuned Road Runner vehicle stats so engine upgrades add stronger real acceleration, tires and transmission raise true top speed, suspension/tires reduce hazard slowdown, and brakes/fuel/durability still balance faster runs.
- Updated the live drive loop with stronger launch torque, mid-range/top-end pull, lower gravity drag on climbs, speed-aware fuel use, and upgrade-based hazard speed resistance.
- Verified deterministic speed samples: stock hatchback reaches about 80.8 km/h at 2.1s and 130.5 km/h by 5.1s; engine-8 hatchback reaches about 151.4 km/h at 2.1s; max hatchback reaches about 239.7 km/h by 2.1s; max super coupe reaches about 323.6 km/h by 2.1s.
- Ran the standard web-game client through a temporary project-local copy after the skill client could not resolve Playwright from its install folder; the captured state showed stock hatchback at 125.3 km/h after a short GAS burst with no console errors.
- Inspected stock/mid/super screenshots, ran `git diff --check`, and production build passed.

Follow-up prompt: Use Hill Climb Racing topic repos for code/wireframe ideas only, with no copied images.

- Reviewed code patterns from `gllms/Hill`, `0ql/AI-Hill-Climb-Racing`, `veprogames/hill-climb-fanmade`, `joelgomes1994/hill-climb-racing`, `Acemany/hill-climb-driving`, `kosero/FlipFlip`, and `alexzh3/hillclimbracing` without importing any external images.
- Adapted the useful code ideas into Road Runner in our own runtime: procedural coin formations, special pickup spacing, nearest-fuel targeting, speed streaks, next-fuel canvas guide, wheel-spin overlays, and terrain-contact traction.
- Added traction, next-fuel, and open-pickup data to `render_game_to_text()` for playtest verification.
- Focused probe passed: generated 104 open pickups at run start, dropped to 90 after driving/collection, reached 185.6 km/h, showed nearest fuel distance, and reported no console errors.
- Standard web-game client pass completed after moving the temporary client copy under `node_modules` to avoid a Windows/Vite watcher lock; captured state reported pothole contact, traction at 91%, 94 open pickups, and no client errors.
- Inspected the wireframe drive screenshots, ran `git diff --check`, and production build passed.

Follow-up prompt: Make sure Car assets and Merge assets from the repo folders are used.

- Centralized Road Runner vehicle art on `src/data/racerVehicleAssetMap.js` so Race uses the repo car files from `public/assets/vehicles/racer`.
- Loaded `public/racerVehicleSprites.css` and applied `racerVehicleSprite` to vehicle cards so the car asset styling is active.
- Loaded the Merge asset runtime from `index.html`, corrected the Merge asset console note to `public/assets/Merge`, and added `window.__mergeAssetState`.
- Added `window.__rrAssetState` plus active vehicle asset fields in `render_game_to_text()` for browser verification.
- Added Merge chain preview icons using the real `public/assets/Merge` item art, without changing merge progression rules.
- Filesystem check passed: 48/48 Merge asset paths and 12/12 racer vehicle asset paths exist.
- Browser check passed: 12/12 racer vehicle images rendered with nonzero dimensions, and 16 Merge preview images rendered with nonzero dimensions and zero failures.
- Ran `git diff --check` and production build; both passed.

Follow-up prompt: Build the Lines mode assets folder so GUI/interface art can be overridden later.

- Added `public/assets/Lines` with replaceable placeholders for 8 business line icons, 8 GUI/button/frame files, and 3 status badges, plus README/path list docs.
- Added `src/data/linesAssetMap.js` so Lines mode has stable public asset paths.
- Wired Lines cards in `src/main.js` to render the new line icons, status badges, and action button art.
- Added `public/linesAssetRuntime.css` to give Lines mode its own clean frame styling without the noisy global panel texture.
- Added `src/ui/linesAssetRuntime.js` and loaded it from `index.html`; it publishes `window.__linesAssetState` for verification.
- Verified filesystem paths: 19/19 Lines override files exist.
- Browser probe passed: 8/8 line icons and 22/22 rendered GUI images loaded, with no browser console or page errors.
- Ran the standard web-game client, inspected the Lines screenshot, ran `git diff --check`, and production build passed. Only warnings were existing CRLF notices and Vite chunk-size/plugin timing warnings.

Follow-up prompt: Build the World/open-world asset folder and wire override art for people, cars, buildings, wants, upgrades, and restock.

- Added `public/assets/World` with 40 replaceable placeholder files across terrain, buildings, people, vehicles, UI, and props, plus README/path list docs.
- Added `src/data/worldAssetMap.js` for stable public World asset paths and fixed-building label overrides.
- Wired `src/ui/worldMobileCityRuntimeSafe.js` to preload Pixi assets, render override art for terrain, roads, buildings, cars, walkers, want bubbles, and props, while keeping the old geometry as fallback shapes.
- Added tap/inspect surfaces for resident wants and placed-building management; placed buildings now track level and stock, with upgrade/restock actions updating local placed-building state.
- Added `window.__worldAssetState` and `window.__worldOpenWorldState` for browser verification, plus dev/test helpers for deterministic placement and sheet inspection.
- Added `public/worldAssetRuntime.css` and `src/ui/worldAssetRuntime.js`, loaded from `index.html`.
- Added `?screen=world` deep-link support in `src/main.js` so browser tests can start directly on the World screen.
- Enabled `preserveDrawingBuffer` for the World Pixi app so the standard web-game client can capture the WebGL canvas.
- Verified filesystem paths: 40/40 World override files exist.
- Browser probe passed: 40/40 World assets loaded, 8 traffic vehicles, 6 walkers/resident wants, one placed kiosk, upgrade to level 2, and restock to 100%. Only observed browser warnings were WebGL readback performance warnings during screenshot capture.
- Standard web-game client captured the World canvas successfully via `?screen=world`; `git diff --check` and production build passed with only existing CRLF/chunk-size/plugin-timing warnings.

Follow-up prompt: Setup the Build page properly with folders, files, assets, and communication between Build, World, and Lines.

- Added the replaceable `public/assets/Build` override pack with room art, system art, UI frame/button art, icons, README, and path list.
- Added Build asset mapping/runtime state so `window.__buildAssetState` reports rendered and loaded Build assets.
- Added a shared Build communication snapshot in `src/systems/buildCommunicationSystem.js`, published to `window.__buildCommunicationState` and local storage.
- Reworked the Build page into a Build Hub with live sync stats, asset-backed room cards, system cards, and direct buttons to World and Lines.
- Added a Lines Build Links bridge and direct Build buttons for building-locked lines.
- Connected World building inventory to the Build snapshot, including placeable Tow Dispatch and Mini Test Track entries.
- Fixed the Lines Build Links card so it no longer inherits the oversized Kenney preview background.
- Verified seeded Build sync: 26/26 Build assets loaded, 5/5 systems built, 6/7 linked lines, and +9 World inventory published.
- Verified World consumes the Build sync: owned counts include Build bonuses and a Mini Test Track can be placed/persisted from the Build-unlocked inventory.
- Ran the standard web-game client against `?screen=garage`, inspected the Build screenshot, ran `git diff --check`, and production build passed.

Follow-up prompt: Improve Lines requirements, allow auto-collect to be turned off, and show Merge item progression for each unlocked set.

- Split manager ownership from auto-collect state with `idleLines.autoCollect`, keeping existing managers while allowing per-line auto collection to be paused/resumed.
- Added Lines requirement panels for starter, line-level, building, and stage requirements with current/needed progress and direct navigation where useful.
- Added manager requirement panels and an Auto ON/OFF toggle for hired managers; when auto is off, the cycle stops ready for manual collection.
- Replaced the small Merge chain preview with full unlocked chain recipe ladders showing each item and the next item it merges into.
- Locked Merge chains now show their exact Build requirement and a Build navigation button.
- Verified with browser probes: Street Route toggled AUTO ON to AUTO OFF and saved; Merge showed 12-step ladders for unlocked Original, Tools, and Performance chains plus locked Racing requirements.

Follow-up prompt: Build World building assets and make World buildings upgrade/collect entities instead of route shortcuts.

- Added six World UI override assets for building collection and upgrade presentation: collect-ready, collect-timer, upgrade-ready, requirement-badge, bonus-badge, and level-badge.
- Expanded the World building catalog with output type, yield, collection cycle, stock drain, bonus text, max level, and per-building upgrade state.
- Converted fixed map buildings, including the Breakdown Center, into clickable city buildings with their own stored level, stock, collection count, timer, power, and upgrade requirements.
- Added overhead building badges on the Pixi map for collect-ready/timer, level, and upgrade-ready states using the new World UI assets.
- Replaced the old placed-building sheet with a compact building management card showing stats, bonus, requirements, collect, upgrade, restock, and move/close actions.
- Moved the World HUD/card into a bottom overlay so the building card and action buttons are visible in one mobile viewport instead of sitting below the map.
- Verified with browser probes: 46/46 World assets loaded, 9 fixed buildings available, fixed building collection reduced ready count from 9 to 8, restock worked, upgrade moved Dealer Row to level 2, and the action row stayed visible in the 900px viewport.
- Ran the standard web-game client against `?screen=world`; it captured the World WebGL canvas with no error artifact. `git diff --check` and production build passed with only existing CRLF/chunk-size/plugin-timing warnings.

Follow-up prompt: Let World overhead icons collect directly, add upgrade-level building assets, and fix the half-developed Build Mode panel.

- Made ready overhead collect badges clickable on the Pixi map; tapping the badge collects immediately, updates stock/timer/state, and does not open the building card.
- Added 30 replaceable upgrade-tier building files under `public/assets/World/buildings/levels`, with lv1/lv2/lv3 slots for every current World building type plus fixed-label art variants like Garage and Parts Hub.
- Updated the World asset map so building art swaps by level tier: levels 1-3 use lv1, levels 4-6 use lv2, and levels 7+ use lv3.
- Updated the building card hero image to use the same level-tier art as the map sprite.
- Fixed World hidden rows/panels with a scoped `[hidden]` rule so Confirm/Cancel and other hidden World panels no longer leak into the UI.
- Reworked Build Mode styling into a compact 4x2 building chooser and hid extra sync/navigation rows while placing, resolving the clipped half-developed drawer.
- Browser probes passed: one-tap Breakdown Center collect reduced ready count from 9 to 8 while keeping the card closed; Build Mode drawer fit in the viewport with Confirm/Cancel hidden until placement preview; level 7 Dealer Row used `dealer-showroom-lv3.svg`.
- Verified 76/76 World assets loaded, all `_ASSET_PATHS.txt` entries exist, ran the standard web-game client against `?screen=world`, `git diff --check`, and production build passed.

Follow-up prompt: Fix person selection opening a half-cut UI that makes World unplayable.

- Added a dedicated `resident-open` World HUD state so tapping a person opens a compact resident want card instead of stacking under the normal HUD controls.
- Hid Build Sync and normal World action buttons while the resident card is open, keeping only the resident want text plus Build and Close buttons visible.
- Ensured `resident-open` is cleared when opening Build Mode, opening building cards, closing resident cards, cancelling placement, confirming placement, or clearing placements.
- Browser probe passed: resident card stayed within the 900px viewport, Close restored the normal HUD, and Build Mode still opened after closing the resident card.
- Ran the standard web-game client against `?screen=world`, `git diff --check`, and production build passed.

Follow-up prompt: Add resident happiness that communicates with World building levels, building stock, and other resident needs.

- Added a resident happiness model driven by matching service buildings, average service building level, building stock/supply, city-wide need coverage, and World service diversity.
- Published the happiness rollup through `window.__worldOpenWorldState`, including selected resident, average resident happiness, needs met, and strained needs.
- Reworked the resident information panel with a 0-100 mood meter, color-changing silly face, mood status, want text, and supporting chips for matching buildings, level, stock, and other resident needs.
- Added green/yellow/orange/red mood states so resident feedback changes visibly as buildings are upgraded, stocked, or missing.
- Refreshed the open resident panel after collection/timer changes so the happiness display stays connected to the live World state.
- Browser probes verified red, orange, yellow, and green resident mood states by changing building levels and stock; the panel fit in the viewport.
- Ran the standard web-game client against `?screen=world`, `git diff --check`, and production build passed.

Follow-up prompt: Make resident needs actionable, add more World happiness factors, and allow rotated building placement.

- Added resident-specific happiness factors for map build-out, vehicle breakdowns, stuck vehicles, potholes, traffic jams, and traffic lights.
- Added building health as a saved World building stat; service happiness now depends on coverage, level, stock, and health.
- Added a selectable resident needs menu: service/repair buildings, restock, map issues, and other residents.
- The resident menu now lists poor matching buildings and lets the user Inspect, Repair, or Restock without leaving the resident screen.
- Added map issue markers for potholes, breakdowns, stuck vehicles, traffic jams, and traffic lights; tapping a marker opens the related resident/problem menu.
- Added rotation-aware Build Mode placement. Rotating swaps the footprint, rotates the building art, validates against roads/buildings, and saves rotation with placed buildings.
- Browser probe verified: poor repair building appeared in Nico's resident menu, Repair and Restock updated it, incident menus opened, city condition counts published, and a rotated 3x2 repair shop saved as an 80x120 footprint.
- Visual QA screenshots were reviewed for the resident repair menu, incident menu, and visible rotated placement.
- Ran the standard web-game client against `?screen=world`, `git diff --check`, and production build passed.

Follow-up prompt: Fix resident happiness not improving after repairing buildings tied to the resident's upset need.

- Found the issue: city problem factors used rounded issue counts as the happiness score, so repairing a building could improve the hidden support math while the visible resident percentage stayed frozen until the issue count crossed a threshold.
- Changed potholes, breakdowns, stuck vehicles, traffic jams, and traffic lights to publish continuous 0-100 scores while keeping rounded counts only for map markers.
- Expanded issue support menus so problems can list all contributing building types, e.g. potholes now use repair, tire, and parts support buildings.
- Added selected resident mood/factor details to `window.__worldOpenWorldState` so repair effects can be verified directly in browser probes.
- Browser probe verified a support-building repair moved resident happiness immediately and improved the specific issue factor score.
- Ran `npm run build`, `git diff --check`, and the standard web-game client against `?screen=world`; all passed, with only existing LF/CRLF and chunk-size warnings.

Follow-up prompt: Improve the resident selected-window GUI/UX with a tabbed layout inspired by Need for Speed: No Limits and Clash of Clans.

- Reviewed Interface In Game references for Need for Speed: No Limits and Clash of Clans, focusing on compact map/card navigation, top tab rails, strong status cards, and bottom action controls.
- Reworked the resident panel from one stacked long page into a four-tab game card: Mood, Fix, City, and People.
- Added a NFS-style compact tab rail with per-tab status values and active-state treatment.
- Added a Clash-style bottom action row so Build and Close stay anchored while tab content changes above.
- Moved the resident happiness face/meter into a hero card and moved factor/status details into the Mood tab.
- Kept repair/restock building rows, city issue rows, and other-resident rows inside tab panels so the whole resident window stays anchored without body/page scrolling.
- Browser probe verified all four tabs, the problem support sub-menu, no body scroll, and stable resident state updates.
- Visual QA screenshots were reviewed for Mood, Fix, City, and People tabs.
- Ran `npm run build`, `git diff --check`, and the standard web-game client against `?screen=world`; all passed.

Follow-up prompt: Improve the Race and Build GUI/UX using Clash of Clans, Need for Speed: No Limits, and Hill Climb Racing references.

- Reviewed the reference pages for mobile construction overlays, car/status menus, route/event maps, progress cards, and in-game race HUD patterns.
- Added a compact Race command card above the live road-runner screen showing selected vehicle, active route/ghost mode, top-speed estimate, best distance, garage completion, next mission, and next route unlock.
- Reworked the Race tab rail into two-line game buttons so Drive, Garage, Vehicles, Routes, and Missions read as a proper mobile racer navigation strip.
- Added a keyed Race command refresh so route, vehicle, ghost, mission, best-distance, and upgrade changes update without rebuilding the drive canvas.
- Rebuilt the Build top card into a construction dashboard with Build/World/Lines actions, systems-online progress, rooms open, world placements, linked lines, line power, and tool bank.
- Added visible room level/status badges and system progress meters using the existing Build asset folder.
- Browser probes verified Race has no body or Race-screen scroll, the drive frame keeps usable height, Build dashboard/room/system elements render, and no new console errors appeared.
- Visual QA screenshots were reviewed for Race and Build: `output/race-build-ui-race.png` and `output/race-build-ui-build.png`.
- Ran `npm run build`, `git diff --check`, and the standard web-game client against `?screen=race` and `?screen=garage`; all passed, with only existing LF/CRLF and chunk-size warnings.

Follow-up prompt: Race and Build UI still not handling properly; add more control over UI/screen and find packages.

- Added `@juggle/resize-observer` for measured screen/layout control and `screenfull` for safe app-shell fullscreen toggling.
- Added `screenControlRuntime.js`, which observes the app shell and active screen, publishes `window.__uiScreenState`, sets compact/tiny/short/fullscreen classes, and exposes `window.toggleGameFullscreen()`.
- Added a small `FS` top-bar control wired to the new fullscreen runtime.
- Removed visible large command-strip art from Race and Build; Race now uses a small vehicle class badge and Build uses a fixed 365 Build chip.
- Hard-clamped Race command height to 64px/56px/48px by screen state and protected the playfield with a fixed command row plus tab row.
- Hard-clamped Build command card to a measured max height and trimmed the top dashboard to three honest stats so no hidden second stat row gets clipped.
- Browser probes verified the reported problem sizes: Race command 64px, Race frame 698-747px, Build icon 48px, Build command 227px, no body scroll, no Race screen scroll, and no giant command images.
- Visual QA screenshots were reviewed for narrow and wide Race/Build: `output/screen-control-race-narrow.png`, `output/screen-control-race-wide.png`, `output/screen-control-build-narrow.png`, and `output/screen-control-build-wide.png`.
- Ran `npm run build`, `git diff --check`, and the standard web-game client against Race and Build; all passed, with only existing LF/CRLF and chunk-size warnings.

Follow-up prompt: Replace emoji icons in the bottom nav, resource counters, and Merge chain UI with real asset icons.

- Created real PNG UI icon assets under `public/assets/ui/icons` for home, race, parts, garage, profile, coin, tools, scrap, tune, and rep.
- Added `src/data/uiIconMap.js` so screens, currencies, and Merge chain families resolve through one asset map instead of inline emoji.
- Updated the shell header resource counters and bottom navigation to render `<img>` icons from `/assets/ui/icons`.
- Updated Merge item fallbacks, chain previews, recipe headers, and chain steps to use asset icons when item art is not available.
- Added fixed image sizing for `.tabIcon`, `.curIcon`, and Merge chain labels so the new assets do not inherit old emoji font sizing.
- Browser DOM probe verified all bottom-nav, wallet, and Merge chain label icons load as real 128x128 PNG images with no emoji text left in the targeted icon slots.
- Visual QA screenshots were reviewed for `output/ui-icons-hub.png`, `output/ui-icons-merge.png`, and `output/ui-icons-standard-merge/shot-0.png`.
- Ran `npm run build`, `git diff --check`, and the standard web-game client against `?screen=merge`; all passed, with only existing LF/CRLF and chunk-size warnings.

Follow-up prompt: Redesign the top HUD to feel more like the route menu mockup.

- Reworked the top shell HUD into a stronger mobile-game command bar: glossy larger 365 badge on the brand row, resource wallet row beneath it, and the stage indicator moved into the wallet row.
- Converted the stage pill into a gold trophy-style badge with a CSS trophy mark and live stage value.
- Converted the six currency cells into rounded blue resource capsules with asset icon, value, label, and a tiny plus button for future store/monetization hooks.
- Added a placeholder `resourceShop` click action so plus buttons currently show a non-destructive future-shop toast.
- Updated the stronger `mobileGameSkin.css` layer and the short Road Runner override so the new HUD does not regress compact race layouts.
- Browser probes verified 6 plus buttons, loaded resource icons, live stage value, no body scroll, and working plus-button toast at 390x844, 360x720, and Race 390x844.
- Visual QA screenshots were reviewed for `output/top-hud-hub-390.png`, `output/top-hud-hub-360.png`, `output/top-hud-race-390.png`, and `output/top-hud-standard/shot-0.png`.
- Ran `npm run build`, `git diff --check`, and the standard web-game client against `?screen=hub`; all passed, with only existing LF/CRLF and chunk-size warnings.

Follow-up prompt: Reduce the bottom navigation to 5 main mobile-game tabs and move Creator into Menu/Profile.

- Added a dedicated `PRIMARY_NAV` model so the bottom nav no longer renders every screen from `SCREENS`.
- Bottom nav now shows exactly five tabs: Home, Race, Parts, Garage, and Menu.
- Kept secondary screens routeable but nested them under primary tabs: World stays under Home, Lines stays under Garage, and Creator stays under Menu.
- Added a real `public/assets/ui/icons/menu.png` asset and mapped Menu/Creator to it.
- Updated Parts/Merge nav mapping to use the parts asset instead of the old tools fallback.
- Added a Menu card inside Profile with World Map, Lines, Creator Tools, and Back Home actions so Creator is accessible without being a primary player tab.
- Browser probes verified 5 loaded tab icons, no old World/Lines/Creator/Profile/Build/Merge/Hub primary tab labels, correct active tab grouping for World/Lines/Profile/Creator, and Creator opening from Menu.
- Visual QA screenshots were reviewed for `output/bottom-nav-hub-final.png`, `output/bottom-nav-profile-final.png`, `output/bottom-nav-creator-final.png`, and `output/bottom-nav-standard/shot-0.png`.
- Ran `npm run build`, `git diff --check`, and the standard web-game client against `?screen=profile`; all passed, with only existing LF/CRLF and chunk-size warnings.

Follow-up prompt: Replace generic CSS cards with reusable game-card components.

- Added reusable HTML render helpers for `GamePanel`, `RouteCard`, `GarageCard`, `UpgradeCard`, `ObjectiveCard`, `ProblemAlert`, and `RewardPanel`.
- Converted Hub, Race fallback content, Merge, Garage/Build, and Profile/Menu screens away from generic `<section class="card">` output and into component-specific panels with `data-component` hooks.
- Reworked upgrade rows, shop rooms, and building system rows to use card component classes while preserving their existing click actions and data attributes.
- Added a shared visual language in `src/styles.css`: bright blue frames, dark navy content fields, gold corner caps, icon badges, bold titles, and chunky green/orange/red CTA buttons.
- Added stronger runtime CSS overrides in `public/mobileGameSkin.css` so the game-card treatment wins over the broad legacy `.card` skin.
- Hooked the Road Runner runtime Race command shell into the component system with `GamePanel`/`RouteCard` markers and a real race icon badge without disrupting the live drive canvas.
- Browser probes verified expected components on Hub, Race, Parts/Merge, Garage, and Menu/Profile, confirmed all component icons loaded, and captured `output/game-panels-*.png` screenshots.
- Ran the standard web-game client against `?screen=race`; the Road Runner runtime stayed active and reported valid runtime state.

Follow-up prompt: Rebuild the meter system as cartoon segmented meters.

- Added a reusable `segmentedMeter` renderer with five chunky red, orange, yellow, lime, and green segments plus a small pointer.
- Replaced the old single-fill `meterLine` output for route progress, fuel, condition, heat, and XP.
- Added a danger-high meter mode so heat and wear still communicate risk correctly while sharing the same segmented meter language.
- Converted Lines unlock requirements, manager unlock requirements, and line cycle/card progress to segmented meters.
- Converted Garage systems-online efficiency, room progress, and building upgrade progress to segmented meters.
- Rebuilt the live Road Runner canvas Fuel and Wear bars with the same segmented visual logic.
- Updated Lines and Build asset-runtime CSS so old progress-track selectors no longer override the new multi-segment markup.
- Browser probes verified five-cell meters on Hub, Lines, Garage, and Profile, with Heat marked as danger-high and Garage efficiency present.
- Visual QA screenshots were reviewed for `output/meter-system-hub.png`, `output/meter-system-lines.png`, `output/meter-system-garage.png`, `output/meter-system-profile.png`, and `output/meter-system-race.png`.
- Ran `npm run build` and the standard web-game client against Garage and Race; both passed.

Follow-up prompt: Upgrade Race screen visuals from Graphics prototype to asset-driven mobile-game visuals.

- Added override-friendly route background assets under `public/assets/race/routes` plus a README explaining replacement filenames.
- Rebuilt the Pixi fallback `racePixi.js` scene around sprites: route background sprites, starter car sprite, speed streaks, boost glow, warning banner, floating reward text, and milestone flags.
- Swapped the starter hatchback asset to the richer existing PNG sprite at `/assets/vehicles/racer/sprite_0000.png`.
- Added route background image loading to the live Road Runner canvas with gradient fallback.
- Added live route milestone checkpoint flags at 25/50/75/100%.
- Added boost glow behind the player car when gas/speed/boost is active.
- Added floating reward numbers for coins, fuel, parts, tools, repairs, and checkpoints.
- Replaced the old plain event text with a game-style warning/reward banner.
- Updated the Road Runner text-state probe to report route background readiness and active floating reward count.
- Browser probes verified vehicle sprite readiness, route background readiness, floating rewards, and Pixi fallback canvas rendering.
- Visual QA screenshots were reviewed for `output/race-visual-live.png`, `output/race-visual-live-sized.png`, `output/race-visual-pixi-fallback.png`, and `output/race-visual-standard-final/shot-0.png`.
- Ran `npm run build` and the standard web-game client against Race; both passed.

Follow-up prompt: Improve Garage / Build UI with room-card upgrade cards and UI asset folders.

- Added the override folder skeleton under `public/assets/ui/` for `hud`, `nav`, `panels`, `buttons`, `meters`, `cards`, `merge`, `garage`, `race`, `icons`, and `fx`.
- Added replaceable SVG UI frames for resource capsules, nav tabs, blue panels, game cards, green/orange buttons, segmented meters, and Garage room cards.
- Split presentation helpers into `src/ui/components/` modules for Shell, TopHud, BottomNav, GamePanel, StatMeter, ResourcePill, RouteCard, MergeSlot, GarageCard, UpgradeCard, ProblemAlert, and RewardToast.
- Cleaned `main.js` so the shell, top HUD, bottom nav, panels, meters, upgrade rows, and Garage system cards render through the new component helpers.
- Rebuilt the four Garage systems as compact room-style cards with large asset art, room name, level badge, description, segmented progress, cost, sync chips, and Build/World/Lines actions.
- Updated `public/mobileGameSkin.css` and `public/buildAssetRuntime.css` to use the new asset backgrounds where useful and to keep the Garage system cards in a tighter 2x2 layout on the normal game frame.
- Browser probe verified four active `.garageSystemRoomCard` cards, loaded system art, five bottom nav tabs, ASCII-safe HUD subtitle, and no app console errors beyond the existing missing `favicon.ico`.
- Visual QA screenshots were reviewed during the Playwright pass for both the top of Garage and the scrolled Garage Systems section.
- Ran `npm run build`; production build passed with the existing large-chunk warning only.

Follow-up prompt: Reduce the high-risk `main.js` GUI architecture surface.

- Confirmed the requested component files already exist under `src/ui/components`.
- Moved the primary bottom-nav model and active-tab syncing into `BottomNav.js`.
- Expanded `Shell.js` so shell mounting, screen section lookup, active-screen class syncing, and screen-host rendering live outside `main.js`.
- Expanded `TopHud.js` so resource/stage DOM updates live with the HUD renderer instead of hard-coded ids in `main.js`.
- Expanded `RewardToast.js` so toast DOM updates and timer ownership live outside `main.js`.
- Updated `main.js` to call component-layer APIs for shell mount, HUD update, screen activation, screen content rendering, and toast display while leaving game-loop and game-system actions in place.
- Browser probe verified all five main tabs activate the correct screen, six wallet capsules update, and resource plus buttons still show a toast.
- Standard web-game client ran against the Garage tab with no generated error file; reviewed the screenshot and state output.
- Ran `npm run build`; production build passed with the existing large-chunk warning only.

Follow-up prompt: Make the GUI asset-driven instead of CSS-prototype-only.

- Added replaceable cartoon SVG UI assets for HUD frames, stage badge, nav bar/tab states, blue/red CTA buttons, card frames, merge slot states, and cyan glow FX.
- Wired `src/styles.css` and `public/mobileGameSkin.css` to use `/assets/ui/hud`, `/assets/ui/nav`, `/assets/ui/cards`, `/assets/ui/merge`, `/assets/ui/meters`, `/assets/ui/buttons`, `/assets/ui/icons`, and `/assets/ui/fx` backgrounds instead of relying only on gradients and plain rounded rectangles.
- Upgraded HUD, bottom nav, stage badge, buttons, game panels, row cards, garage/build cards, merge cells, shelf slots, meters, and world/build overlays with asset-backed styling while keeping CSS fallback behavior.
- Browser probes verified the rendered HUD, nav, tabs, buttons, merge slots, Garage cards, and panels are pulling asset URLs from the new UI folders.
- Ran `npm run build`, `git diff --check`, and the standard web-game client against the Garage tab; all passed, with only the existing large-chunk and LF/CRLF warnings.

Follow-up prompt: Keep the bottom navigation to five player-facing tabs.

- Hardened `BottomNav.js` so rendering always uses the dedicated five-tab `PRIMARY_NAV` model: Home, Race, Parts, Garage, and Menu.
- Removed the shell-level nav injection path so `SCREENS` cannot accidentally be passed into the bottom nav and expose secondary/dev screens as primary tabs.
- Added tab `type`, `aria-label`, and `aria-current` handling so active state is clearer for the five-tab player nav.
- Verified in browser that the bottom nav renders exactly five tabs, with screen targets `hub`, `race`, `merge`, `garage`, and `profile`.
- Verified Creator is not a primary tab, opens from the Menu/Profile panel, and keeps the Menu tab active while on the Creator screen.
- Ran `npm run build` and the standard web-game client against the Menu tab; build passed with the existing large-chunk warning only.

Follow-up prompt: Replace emoji icons with asset-first icons and fallback emoji data.

- Migrated `gameData.js` so screens, merge chains, race modes, idle lines, upgrades, buildings, and route problems now use asset paths in `icon` plus `fallbackIcon` unicode escapes.
- Migrated visible world/build data in `visualData.js` so map locations, residents, and shop rooms also render asset icons first.
- Expanded the shared icon renderer to support asset paths, safe fallback spans, and image-error fallback behavior.
- Updated Race mode chips, Line icons, Merge chain labels, Problem cards, Upgrade cards, World people/locations, Garage room headings, objective markers, and locked room badges to render image assets instead of direct emoji text.
- Fixed fallback CSS so fallback emoji spans stay hidden unless an asset fails to load.
- Browser probes verified Lines, Merge, Garage, and Profile have no visible emoji-range text, no visible fallback spans, and no broken active-screen images.
- Ran `npm run build` and the standard web-game client against Merge; build passed with the existing large-chunk warning only.

Follow-up prompt: Strengthen the meter system into game-style segmented bars.

- Upgraded `segmentedMeter` to emit five stateful cells, full/partial/empty classes, a gold needle, and a value chip.
- Updated `meterLine` so Progress, Fuel, Condition, Heat, and XP use the segmented meter API with readable percent/value output.
- Rebuilt meter CSS into a chunky asset-backed frame with red, orange, yellow, lime, and green segment colors, stronger outlines, gloss, shadowing, and partial-fill pulse.
- Lifted Lines and Build/Garage runtime overrides so unlock meters, line cycle/card progress, garage efficiency, room progress, and building upgrade meters stay at the readable 22px game size.
- Added defensive styling for any legacy `.meter > .fill` markup so it no longer appears as a plain flat bar.
- Strengthened the live Road Runner canvas Fuel/Wear bars to match the segmented meter treatment.
- Browser probes verified Lines, Garage, and Profile meters have five cells, asset-track backgrounds, value chips, no old `.meter .fill` bars, and no console errors.
- Visual QA screenshots were reviewed for the scrolled Lines meters and Race Fuel/Wear meters.
- Ran `npm run build` and the standard web-game client against Lines; build passed with the existing large-chunk warning only.

Follow-up prompt: Show fuel cans in the resource HUD, remove translucent icon-box treatment, and move race warning overlays below collection counters.

- Added Fuel/Fuel Cans to the seven-resource top HUD so the persistent `fuelCans` currency is visible before fuel-problem fixes ask for it.
- Mapped `fuelCans` to the existing Road Runner energy token asset and kept the Race collection HUD focused on in-run fuel percent plus next fuel distance.
- Tightened top HUD, compact Race viewport, and mobile skin CSS so seven resource capsules fit without restoring old icon-box styling.
- Made HUD/collection icons render as standalone transparent images.
- Moved Road Runner canvas warning banners below the collection cards so pothole/rough-road messages no longer sit underneath the collection counters.

Follow-up prompt: Add a RewardToast and FloatingReward system so the Hub activity log becomes stronger reward feedback.

- Rebuilt `RewardToast.js` into a stacked reward-card system with asset badges, reward chips, a hidden legacy status fallback, debug state, and a floating reward layer.
- Added `floatingRewardLayer` and `rewardToastStack` to the shell frame and styled reward cards/floating rewards in `styles.css`.
- Centralized reward feedback in `main.js` by diffing before/after state for currency gains, merges, new chain unlocks, stage completion, upgrades, building/room upgrades, repairs, tow jobs, line collection, route problems, and idle auto-collection.
- Renamed the Hub Activity Log to Reward Feed, expanded it to eight entries, and added empty-state copy.
- Removed duplicate manual line-collection logging from `idleLineSystem.js`; the central action handler now owns the feed entry.
- Verified with `npm run build`, the standard web-game Playwright client, and a browser probe that a ready Line collection produces a gold reward toast, coin chip, floating `+Coins`, and one clean Reward Feed entry.
- Existing non-blocking issues observed: Vite chunk-size warning, LF/CRLF warnings, and the existing missing `favicon.ico` browser 404.

Follow-up prompt: Move screen renderers out of the oversized `main.js`.

- Added `src/ui/screens/HubScreen.js`, `WorldScreen.js`, `RaceScreen.js`, `LinesScreen.js`, `MergeScreen.js`, `GarageScreen.js`, `ProfileScreen.js`, and `CreatorScreen.js`.
- Moved each screen's render helpers and presentation imports into its screen module.
- Reduced `main.js` from 1471 lines to 454 lines and narrowed it to state, game loop, routing, action dispatch, reward feedback, and save queue ownership.
- Updated the active-screen router to call imported screen renderers with current state.
- Verified `npm run build`, `npm run test:race-progress`, standard web-game client screenshot capture, and a browser route sweep across Hub, World, Race, Lines, Merge, Garage, Profile, and Creator.
- Console review during the route sweep showed only normal app info logs.

Follow-up prompt: Make the internal 8-screen grouping obvious while keeping the 5-tab bottom nav.

- Added Home section controls for Today and World Map on Hub and the active Pixi World runtime.
- Added Garage section controls for Build Rooms and Business Lines on Garage and Lines.
- Added Menu section controls for Profile, Creator Rules, Settings, and Reset Save on Profile/Menu.
- Added a Settings panel for local save/fullscreen/creator/reset context.
- Added shared `screenSubTabs`, `screenGroupPanel`, and World switcher CSS so the internal controls read as grouped tabs.
- Verified `npm run build`, `npm run test:race-progress`, standard web-game client passes on Profile and World, and a browser DOM sweep for Hub, World, Garage, Lines, and Profile group labels/buttons.

Follow-up prompt: Confirm and finish Problem B around the oversized `main.js` architecture.

- Confirmed the screen renderer part of the audit was stale locally: Hub, World, Race, Lines, Merge, Garage, Profile, and Creator renderers already live in `src/ui/screens/`.
- Moved reward feedback snapshot/meta/toast/floating-reward logic out of `main.js` into `src/ui/feedback/rewardFeedback.js`.
- Kept `main.js` focused on boot, game loop, state coordination, routing, action dispatch, save queue, and feedback dispatch calls.
- Reduced `main.js` from 454 lines to 212 lines after the feedback extraction.
- Verified `npm run build` and `npm run test:race-progress`.
- Ran the standard web-game client against the Hub screen, reviewed `output/web-game/shot-0.png`, and confirmed no generated browser error file.

Follow-up prompt: Add an explicit local-first ghost racing domain model.

- Added `src/game/roadRunner/ghostModel.js` with the ghost record contract, `localStorage` key `365_road_runner_ghosts_v1`, route/stage bucket keys, local-best upsert, route/stage best-time indexes, seeded AI ghost generation, and replay sampling.
- Documented the contract in `docs/ghost-racing-model.md`, including the sample shape `{ t, x, speed }`, local-only storage, async replay behavior, and future `remote_best` source.
- Linked the ghost racing model from `README.md` and kept the wording explicit that ghost racing is asynchronous best-time/replay racing, not live PVP.
- Wired the active Road Runner canvas runtime to load the ghost store, migrate legacy `bestTrail` into `track::stage_1`, record route-local ghost samples, save completed-route local bests by route/stage when faster, and fill ghost races with local best first plus seeded AI ghosts.
- Exposed ghost model state through `render_game_to_text()` including `ghostStorageKey`, `stage`, `localBestGhost`, and `activeGhosts`.
- Added `tests/ghostModel.test.mjs` and `npm run test:ghost-model`.
- Verified `npm run test:ghost-model`, `npm run test:race-progress`, `npm run build`, `git diff --check`, and a Race-screen web-game client pass with one seeded AI ghost and no generated browser error file.

Follow-up prompt: Add a first-session guide funnel so new players are not overwhelmed.

- Added `src/ui/guides/FirstSessionGuide.js` to derive a five-step visual guide from existing objectives: Race Boost -> Open Parts -> Merge Pair -> Open Garage -> Build Parts Storage.
- Added a shell guide host and compact guide styling with step dots, a jump CTA, and pulsing target highlights.
- Tagged the Race/Road Runner GAS controls, Merge supplier/pair/board controls, and Parts Storage Garage card/build button with `data-guide-target` hooks.
- Road Runner GAS now dispatches `roadRunnerFirstGas` so the guide advances from Race even when Road Runner replaces the companion idle race button.
- Lowered the first Parts Storage cost to 70 coins and 4 parts so the starter funnel can complete after the first boost and starter merge.
- Added `tests/firstSessionGuide.test.mjs` and `npm run test:first-session-guide`.
- Verified the guide screenshot, targeted Playwright transitions, `npm run test:first-session-guide`, `npm run test:ghost-model`, `npm run test:race-progress`, `npm run build`, and `git diff --check`.
