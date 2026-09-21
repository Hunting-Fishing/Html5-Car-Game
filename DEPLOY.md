# 365 Micro Garage — Deploy & Mobile Guide

## 1. Production web build

```bash
npm install
npm run build
npm run preview
```

- Output folder: `dist/`
- Host `dist/` on any static host (Netlify, Vercel, Cloudflare Pages, or your own server)
- For a subfolder (e.g. `365motorsales.com/game/`), the Vite `base: './'` setting already supports relative paths

### Embed on 365motorsales.com

Option A — full page:
```html
<iframe src="https://your-game-host.example/" style="width:100%;height:100vh;border:0" allow="fullscreen"></iframe>
```

Option B — link from the site:
```html
<a href="https://your-game-host.example/">Play 365 Micro Garage</a>
```

---

## 2. Capacitor (iOS / Android)

### One-time setup

```bash
npm install
npm run build

# Add native platforms (once)
npm run cap:add:android
npm run cap:add:ios   # requires macOS + Xcode
```

### Daily build / open

```bash
# Rebuild web assets + sync into native projects
npm run cap:sync

# Open Android Studio
npm run cap:android

# Open Xcode (macOS only)
npm run cap:ios
```

### Notes
- Android: install Android Studio, create an emulator or use a USB device, then Run
- iOS: requires a Mac, Xcode, and an Apple Developer account for device/TestFlight
- After any web code change: `npm run cap:sync` again

---

## 3. PWA (install from browser)

The project already includes a PWA manifest via `vite-plugin-pwa`.

On mobile Chrome/Safari:
1. Open the live site
2. Use “Add to Home Screen”
3. Launches like an app (portrait, standalone)

---

## 4. Quick checklist before launch

- [ ] `npm run build` succeeds with no errors
- [ ] Test on a real phone browser
- [ ] Website CTA opens https://www.365motorsales.com
- [ ] Offline progress works after closing the tab ~1 minute
- [ ] Dealer Showcase mode shows the 365 promo card
