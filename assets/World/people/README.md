# World People Sprites

These lightweight SVG people are transparent-background world-map sprites for residents and staff walkers. Keep the filenames stable so the Pixi world map can swap in replacement art without code changes.

The active World people are six-frame pixel-art walk cycles under `animated/<person>/walk-01.svg` through `walk-06.svg`. They are intentionally full-body, bottom-center anchored sprites with moving legs and arms for the sidewalk walkers. Regenerate the whole set with `node scripts/generateWorldPeoplePixelSprites.mjs` after changing palettes or proportions.

A compatible free source for a future imported character pack is Kenney's CC0 catalog, especially Toon Characters. If a downloaded pack is imported, place it under `public/assets/vendor/kenney/<pack-name>/` with its original license file, then map the chosen files in `src/data/worldAssetMap.js`.

Recommended sprite target: 96x128 or larger, transparent background, full-body character centered over the feet.
