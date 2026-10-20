# Replace Merge Item Images Here

Copy your real merge item images over the placeholder SVG files in these folders:

```text
public/assets/merge/original/
public/assets/merge/tools/
public/assets/merge/performance/
public/assets/merge/racing/
```

## Best image format

```text
512 x 512 px
transparent background
PNG preferred for final art
SVG currently wired for placeholders
square canvas
centered object
under 300 KB each when possible
```

## Current fastest method

Export your real art as SVG and overwrite the matching placeholder file.

Example:

```text
Bolt Pack -> public/assets/merge/original/bolt-pack.svg
```

When your final PNGs are ready, upload them with the same names and I will switch `src/data/mergeAssetMap.js` from `.svg` to `.png` paths.

## Full filename checklist

See:

```text
public/assets/merge/_ALL_ASSET_PATHS.txt
```
