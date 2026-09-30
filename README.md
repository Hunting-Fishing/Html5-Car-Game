# 365 Micro Garage Companion

Mobile-first companion game for **365 Motor Sales**. Four connected modes, one wallet.

## Live

After Pages is on: https://hunting-fishing.github.io/Html5-Car-Game/

1. Repo Settings → Pages → Deploy from a branch
2. Branch **gh-pages** / folder **/** (root) → Save

## Modes

- **Drive** — idle routes (Street, Delivery, Fuel Saver, Rough, Showcase) plus **Hill Run** (hold GAS).
- **Merge** — supplier drops Level 1 only.
- **Lot Town** — tap plots and collect.
- **Idle Shop** — businesses print coins on other screens.

All currencies are shared. Showcase points players at [365motorsales.com](https://www.365motorsales.com).

## Local

```bash
npm install
npm run dev
```

## Notes

- Local save (`autoMergeGarageV11LocalOnly`; V9 imported)
- No live PVP, no manufacturer logos, no real-money prizes in v1
- Branch `fix/p0-wire-ui` wires Lot, Shop, Hill, daily orders, stable Drive canvas, fuel-can spend
