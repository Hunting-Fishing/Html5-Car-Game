# Merge Board Asset Replacement Guide

Copy your real merge item images over these placeholder files.

## Preferred format

- PNG
- Transparent background
- 512 x 512 px source canvas
- Square image
- Object centered
- No text baked into the image
- File size target: under 300 KB each

SVG also works. The current placeholders are SVG files so the folders exist in GitHub.

## Replacement rule

Use the same file name and same folder path. Example:

```text
public/assets/merge/original/bolt-pack.svg
```

can be replaced with either:

```text
public/assets/merge/original/bolt-pack.svg
```

or, after code path update later:

```text
public/assets/merge/original/bolt-pack.png
```

For fastest replacement right now, export your real art as SVG using the same names, or tell me when your PNGs are uploaded and I will switch the manifest from `.svg` to `.png`.

## Current folders

```text
public/assets/merge/original/
public/assets/merge/tools/
public/assets/merge/performance/
public/assets/merge/racing/
```
