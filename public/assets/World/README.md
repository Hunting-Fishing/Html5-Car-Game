# World Mode Asset Overrides

Drop replacement art for the mini open-world city mode into this folder. Keep the same filenames and the game will pick them up without code changes.

This folder is intended for a mobile city-builder feel: people walking around, cars driving, player-placed buildings, building upgrades, restock actions, happiness/wants, and small UI panels.

Recommended sizes:

- `buildings/*.svg` or PNG: transparent background, 256x256 or larger.
- `buildings/levels/*-lv1.svg`, `*-lv2.svg`, and `*-lv3.svg`: upgrade-tier building art. The game shows lv1 for building levels 1-3, lv2 for levels 4-6, and lv3 for levels 7+.
- `people/*.svg` or PNG: transparent background, 96x128 or larger.
- `vehicles/*.svg` or PNG: transparent background, 180x100 or larger.
- `terrain/*.svg` or PNG: tileable or stretch-safe map pieces.
- `ui/*.svg` or PNG: button/panel/badge art, including `collect-ready`, `collect-timer`, `upgrade-ready`, `requirement-badge`, `bonus-badge`, and `level-badge` for the overhead building icons and building detail card.
- `props/*.svg` or PNG: transparent background, 96x96 or larger.

Current wired paths are listed in `_ASSET_PATHS.txt`.
