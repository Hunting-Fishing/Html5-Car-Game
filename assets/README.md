# Asset Placement Guide

Use these folders as stable override points for production art. Keep file names and paths stable when replacing placeholder assets so the game data maps and tests continue to work.

- `public/assets/ui/` - shared GUI art root.
- `public/assets/ui/hud/` - top HUD frames, resource capsules, stage/trophy badges.
- `public/assets/ui/nav/` - bottom navigation frames and tab states.
- `public/assets/ui/panels/` - large blue panel frames and screen containers.
- `public/assets/ui/cards/` - reusable game, route, row, and upgrade card frames.
- `public/assets/ui/buttons/` - chunky blue, green, orange, and red CTA buttons.
- `public/assets/ui/meters/` - segmented meter tracks and future fill overlays.
- `public/assets/ui/merge/` - merge slot states and merge board GUI frames.
- `public/assets/ui/fx/` - glows, bursts, reward flashes, and other UI effects.
- `public/assets/Build/` - garage/build room art, system art, and build-specific UI.
- `public/assets/Merge/` - merge item chain art.
- `public/assets/Lines/` - idle business line icons, badges, and GUI pieces.
- `public/assets/race/` - route backgrounds, car sprites, route icons, and race effects.

If a replacement asset is missing or renamed by mistake, `renderIconImage()` falls back to the configured text/emoji fallback and `npm run test:assets` should catch the missing path.
