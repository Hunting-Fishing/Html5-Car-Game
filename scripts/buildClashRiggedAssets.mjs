import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const BRAIN_DIR = 'C:/Users/jordi/.gemini/antigravity/brain/028b010f-6426-495c-8083-6ccf934239f8';

const STAFF_SHEET = path.join(BRAIN_DIR, 'supercell_characters_spritesheet_1792373375249.jpg');
const RESIDENT_SHEET = path.join(BRAIN_DIR, 'city_residents_sprite_sheet_final_1792373427828.jpg');
const ISO_VEHICLE_SHEET = path.join(BRAIN_DIR, 'isometric_vehicles_spritesheet_v2_1792381600045.jpg');
const VEHICLE_MAIN_SHEET = path.join(BRAIN_DIR, 'vehicle_spritesheet_2x4_1792373685100.jpg');
const VEHICLE_SUPP_SHEET = path.join(BRAIN_DIR, 'game_spritesheet_pack_1792373595149.jpg');

function fileToDataUrl(filePath) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

async function main() {
  console.log('Launching headless Chromium for high-precision canvas cutout & rigging...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Attach browser console logs
  page.on('console', (msg) => console.log('[Canvas]', msg.text()));

  // 1. Process all 10 Isometric Buildings: Flood-fill remove outer dark background -> transparent cutout PNG
  const buildingSlugs = [
    'garage',
    'parts-hub',
    'dealer-showroom',
    'tow-dispatch',
    'tire-repair-shop',
    'private-repair-shop',
    'salvage-yard',
    'parts-warehouse',
    'test-track',
    'street-kiosk'
  ];

  const buildingsDir = path.join(ROOT, 'public/assets/World/buildings');
  const rendersDir = path.join(buildingsDir, 'renders');
  const levelsDir = path.join(buildingsDir, 'levels');
  fs.mkdirSync(levelsDir, { recursive: true });

  for (const slug of buildingSlugs) {
    const jpgPath = path.join(rendersDir, `${slug}.jpg`);
    if (!fs.existsSync(jpgPath)) {
      console.warn(`Missing building render: ${jpgPath}`);
      continue;
    }
    const dataUrl = fileToDataUrl(jpgPath);
    const cutoutPngUrl = await page.evaluate(async (src) => {
      const img = new Image();
      img.src = src;
      await new Promise((r) => { img.onload = r; });
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Sample corner colors as background reference
      const corners = [
        [4, 4], [w - 5, 4], [4, h - 5], [w - 5, h - 5],
        [Math.floor(w / 2), 4], [4, Math.floor(h / 2)], [w - 5, Math.floor(h / 2)]
      ];
      const bgSamples = corners.map(([cx, cy]) => {
        const idx = (cy * w + cx) * 4;
        return [data[idx], data[idx + 1], data[idx + 2]];
      });

      function minColorDist(r, g, b) {
        let best = 999999;
        for (const [br, bg, bb] of bgSamples) {
          const dr = r - br;
          const dg = g - bg;
          const db = b - bb;
          const d = Math.sqrt(dr * dr + dg * dg + db * db);
          if (d < best) best = d;
        }
        return best;
      }

      // BFS Flood fill from all 4 edges
      const visited = new Uint8Array(w * h);
      const queue = new Int32Array(w * h);
      let head = 0;
      let tail = 0;

      const push = (x, y) => {
        if (x < 0 || x >= w || y < 0 || y >= h) return;
        const p = y * w + x;
        if (visited[p]) return;
        const idx = p * 4;
        const dist = minColorDist(data[idx], data[idx + 1], data[idx + 2]);
        if (dist <= 34) {
          visited[p] = 1;
          queue[tail++] = p;
        }
      };

      for (let x = 0; x < w; x++) {
        push(x, 0);
        push(x, h - 1);
      }
      for (let y = 0; y < h; y++) {
        push(0, y);
        push(w - 1, y);
      }

      while (head < tail) {
        const p = queue[head++];
        const x = p % w;
        const y = (p - x) / w;
        push(x + 1, y);
        push(x - 1, y);
        push(x, y + 1);
        push(x, y - 1);
      }

      // Apply transparency and 2px soft edge feathering + find tight bounding box
      let minX = w, minY = h, maxX = 0, maxY = 0;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const p = y * w + x;
          const idx = p * 4;
          if (visited[p]) {
            data[idx + 3] = 0;
          } else {
            // Check if adjacent to background for anti-aliased edge
            let bgNeighbors = 0;
            if (x > 0 && visited[p - 1]) bgNeighbors++;
            if (x < w - 1 && visited[p + 1]) bgNeighbors++;
            if (y > 0 && visited[p - w]) bgNeighbors++;
            if (y < h - 1 && visited[p + w]) bgNeighbors++;
            if (bgNeighbors > 0) {
              data[idx + 3] = Math.round(255 * (1 - bgNeighbors * 0.18));
            }
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // Output cropped & scaled to 512x512 crisp transparent PNG
      const pad = 10;
      minX = Math.max(0, minX - pad);
      minY = Math.max(0, minY - pad);
      maxX = Math.min(w - 1, maxX + pad);
      maxY = Math.min(h - 1, maxY + pad);
      const cw = maxX - minX + 1;
      const ch = maxY - minY + 1;

      const out = document.createElement('canvas');
      out.width = 512;
      out.height = 512;
      const octx = out.getContext('2d');
      const scale = Math.min(496 / cw, 496 / ch);
      const dw = cw * scale;
      const dh = ch * scale;
      octx.drawImage(canvas, minX, minY, cw, ch, (512 - dw) / 2, (512 - dh) / 2, dw, dh);
      return out.toDataURL('image/png');
    }, dataUrl);

    // Build clean transparent isometric SVG (NO square background card, NO box border!)
    const makeBuildingSvg = (tier = 1) => {
      const glowColor = tier >= 3 ? '#ffd166' : tier === 2 ? '#38bdf8' : '#35e58a';
      const glowOpacity = tier >= 3 ? '0.28' : tier === 2 ? '0.20' : '0.14';
      return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="${slug} lv${tier}">
  <defs>
    <radialGradient id="iso_glow_${slug}_${tier}" cx="50%" cy="62%" r="46%">
      <stop offset="0%" stop-color="${glowColor}" stop-opacity="${glowOpacity}"/>
      <stop offset="100%" stop-color="${glowColor}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Soft Isometric Diamond Ground Shadow (No rectangular box!) -->
  <polygon points="256,496 488,368 256,248 24,368" fill="#020617" opacity="0.42"/>
  <ellipse cx="256" cy="360" rx="220" ry="118" fill="url(#iso_glow_${slug}_${tier})"/>
  <!-- Cutout 2.5D Isometric Building Structure -->
  <image href="${cutoutPngUrl}" x="0" y="0" width="512" height="512" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
    };

    fs.writeFileSync(path.join(buildingsDir, `${slug}.svg`), makeBuildingSvg(1));
    fs.writeFileSync(path.join(levelsDir, `${slug}-lv1.svg`), makeBuildingSvg(1));
    fs.writeFileSync(path.join(levelsDir, `${slug}-lv2.svg`), makeBuildingSvg(2));
    fs.writeFileSync(path.join(levelsDir, `${slug}-lv3.svg`), makeBuildingSvg(3));
    console.log(`Processed cutout isometric building: ${slug}`);
  }

  // 2. Process all 12 Supercell-style 3D Characters + Generate Seamless Uncut 6-Frame Walk Cycle SVGs
  const staffDataUrl = fileToDataUrl(STAFF_SHEET);
  const residentDataUrl = fileToDataUrl(RESIDENT_SHEET);

  const characterSpecs = [
    // Staff sheet (3 cols x 2 rows)
    { key: 'driver', slug: 'driver', sheet: 'staff', col: 0, row: 0, cols: 3, rows: 2 },
    { key: 'courier', slug: 'courier', sheet: 'staff', col: 1, row: 0, cols: 3, rows: 2 },
    { key: 'mechanic', slug: 'mechanic', sheet: 'staff', col: 2, row: 0, cols: 3, rows: 2 },
    { key: 'racer', slug: 'racer', sheet: 'staff', col: 0, row: 1, cols: 3, rows: 2 },
    { key: 'towOperator', slug: 'tow-operator', sheet: 'staff', col: 1, row: 1, cols: 3, rows: 2 },
    { key: 'salesRep', slug: 'sales-rep', sheet: 'staff', col: 2, row: 1, cols: 3, rows: 2 },
    // Resident sheet (4 cols x 2 rows)
    { key: 'residentBlue', slug: 'resident-blue', sheet: 'resident', col: 0, row: 0, cols: 4, rows: 2 },
    { key: 'residentGreen', slug: 'resident-green', sheet: 'resident', col: 1, row: 0, cols: 4, rows: 2 },
    { key: 'residentOrange', slug: 'resident-orange', sheet: 'resident', col: 2, row: 0, cols: 4, rows: 2 },
    { key: 'residentPurple', slug: 'resident-purple', sheet: 'resident', col: 0, row: 1, cols: 4, rows: 2 },
    { key: 'tuner', slug: 'tuner', sheet: 'resident', col: 1, row: 1, cols: 4, rows: 2 },
    { key: 'customer', slug: 'customer', sheet: 'resident', col: 2, row: 1, cols: 4, rows: 2 }
  ];

  const peopleDir = path.join(ROOT, 'public/assets/World/people');
  const animDir = path.join(peopleDir, 'animated');

  for (const spec of characterSpecs) {
    const sheetUrl = spec.sheet === 'staff' ? staffDataUrl : residentDataUrl;
    const result = await page.evaluate(async ({ src, col, row, cols, rows }) => {
      const img = new Image();
      img.src = src;
      await new Promise((r) => { img.onload = r; });

      const cellW = Math.floor(img.naturalWidth / cols);
      const cellH = Math.floor(img.naturalHeight / rows);
      const sx = col * cellW;
      const sy = row * cellH;

      const c = document.createElement('canvas');
      c.width = cellW;
      c.height = cellH;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, sx, sy, cellW, cellH, 0, 0, cellW, cellH);

      const imgData = ctx.getImageData(0, 0, cellW, cellH);
      const data = imgData.data;

      // Flood-fill remove pure white (#FFFFFF) background from cell borders
      const visited = new Uint8Array(cellW * cellH);
      const queue = new Int32Array(cellW * cellH);
      let head = 0, tail = 0;

      const isWhiteBg = (r, g, b) => r > 236 && g > 236 && b > 234;

      const push = (x, y) => {
        if (x < 0 || x >= cellW || y < 0 || y >= cellH) return;
        const p = y * cellW + x;
        if (visited[p]) return;
        const idx = p * 4;
        if (isWhiteBg(data[idx], data[idx + 1], data[idx + 2])) {
          visited[p] = 1;
          queue[tail++] = p;
        }
      };

      for (let x = 0; x < cellW; x++) {
        push(x, 0);
        push(x, cellH - 1);
      }
      for (let y = 0; y < cellH; y++) {
        push(0, y);
        push(cellW - 1, y);
      }

      while (head < tail) {
        const p = queue[head++];
        const x = p % cellW;
        const y = (p - x) / cellW;
        push(x + 1, y);
        push(x - 1, y);
        push(x, y + 1);
        push(x, y - 1);
      }

      let minX = cellW, minY = cellH, maxX = 0, maxY = 0;
      for (let y = 0; y < cellH; y++) {
        for (let x = 0; x < cellW; x++) {
          const p = y * cellW + x;
          const idx = p * 4;
          if (visited[p]) {
            data[idx + 3] = 0;
          } else {
            let bgN = 0;
            if (x > 0 && visited[p - 1]) bgN++;
            if (x < cellW - 1 && visited[p + 1]) bgN++;
            if (y > 0 && visited[p - cellW]) bgN++;
            if (y < cellH - 1 && visited[p + cellW]) bgN++;
            if (bgN > 0) {
              data[idx + 3] = Math.round(255 * (1 - bgN * 0.2));
            }
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);

      const cw = Math.max(1, maxX - minX + 1);
      const ch = Math.max(1, maxY - minY + 1);

      // Create normalized 180x240 base character canvas (100% uncut whole-body 3D render!)
      const baseCanvas = document.createElement('canvas');
      baseCanvas.width = 180;
      baseCanvas.height = 240;
      const bctx = baseCanvas.getContext('2d');
      const scale = Math.min(162 / cw, 220 / ch);
      const dw = cw * scale;
      const dh = ch * scale;
      const dx = (180 - dw) / 2;
      const dy = 230 - dh;
      bctx.drawImage(c, minX, minY, cw, ch, dx, dy, dw, dh);
      const idlePng = baseCanvas.toDataURL('image/png');

      // Generate 6-frame seamless whole-body Simpsons: Tapped Out / Brawl Stars walk stride
      // Zero horizontal slicing — keeps hands, props, turbochargers, and knees 100% intact!
      const frames = [];
      for (let f = 0; f < 6; f++) {
        const phase = (f / 6) * Math.PI * 2;
        const swing = Math.sin(phase);
        const hop = Math.abs(Math.cos(phase)) * 6.5;
        const squashX = 1 + Math.cos(phase * 2) * 0.028;
        const stretchY = 1 - Math.cos(phase * 2) * 0.028;
        const tilt = swing * 0.042;

        const fc = document.createElement('canvas');
        fc.width = 180;
        fc.height = 240;
        const fctx = fc.getContext('2d');

        fctx.save();
        fctx.translate(90 + swing * 2.2, 228 - hop);
        fctx.rotate(tilt);
        fctx.scale(squashX, stretchY);
        fctx.drawImage(baseCanvas, -90, -228);
        fctx.restore();

        frames.push(fc.toDataURL('image/png'));
      }

      return { idlePng, frames };
    }, { src: sheetUrl, col: spec.col, row: spec.row, cols: spec.cols, rows: spec.rows });

    const makeCharSvg = (pngDataUrl, label, shadowRx = 42, dustX = 0, dustAlpha = 0) => `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="240" viewBox="0 0 180 240" role="img" aria-label="${label}">
  <ellipse cx="90" cy="228" rx="${shadowRx}" ry="10" fill="#020617" opacity="0.40"/>
  ${dustAlpha > 0 ? `<circle cx="${90 + dustX}" cy="225" r="7" fill="#e2e8f0" opacity="${dustAlpha}"/><circle cx="${90 + dustX * 1.35}" cy="221" r="4.5" fill="#f8fafc" opacity="${(dustAlpha * 0.8).toFixed(2)}"/>` : ''}
  <image href="${pngDataUrl}" x="0" y="0" width="180" height="240" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

    fs.writeFileSync(path.join(peopleDir, `${spec.slug}.svg`), makeCharSvg(result.idlePng, spec.slug, 42, 0, 0));
    const charAnimFolder = path.join(animDir, spec.slug);
    fs.mkdirSync(charAnimFolder, { recursive: true });
    result.frames.forEach((frameUrl, idx) => {
      const phase = (idx / 6) * Math.PI * 2;
      const shadowRx = Math.round(39 + Math.cos(phase * 2) * 4);
      const dustX = Math.round(-Math.sin(phase) * 24);
      const dustAlpha = (idx === 1 || idx === 4) ? 0.42 : 0.16;
      fs.writeFileSync(
        path.join(charAnimFolder, `walk-0${idx + 1}.svg`),
        makeCharSvg(frameUrl, `${spec.slug} walk ${idx + 1}`, shadowRx, dustX, dustAlpha)
      );
    });
    console.log(`Processed seamless uncut 3D character & 6-frame walk stride: ${spec.slug}`);
  }

  // 3A. Process 3D Isometric Vehicles for 365 Auto World (from ISO_VEHICLE_SHEET 4x2 grid)
  const isoVehUrl = fileToDataUrl(ISO_VEHICLE_SHEET);
  const isoWorldVehicleSpecs = [
    // Row 0: (0) Blue JDM GT-Apex, (1) Yellow Taxi, (2) Red V8 Muscle, (3) White Turbo Hatch
    { key: 'blueCar', files: ['blue-car.svg', 'rally-car.svg'], col: 0, row: 0, cols: 4, rows: 2 },
    { key: 'yellowCar', files: ['yellow-car.svg'], col: 1, row: 0, cols: 4, rows: 2 },
    { key: 'naMuscle', files: ['na-muscle.svg'], col: 2, row: 0, cols: 4, rows: 2 },
    { key: 'compactCar', files: ['compact-car.svg'], col: 3, row: 0, cols: 4, rows: 2 },
    // Row 1: (0) Green 4x4 Baja Truck, (1) Yellow Wrecker Tow Truck, (2) 365 Delivery Van, (3) Purple Widebody Coupe
    { key: 'greenTruck', files: ['green-truck.svg', 'baja-suv.svg'], col: 0, row: 1, cols: 4, rows: 2 },
    { key: 'towTruck', files: ['tow-truck.svg'], col: 1, row: 1, cols: 4, rows: 2 },
    { key: 'deliveryVan', files: ['delivery-van.svg'], col: 2, row: 1, cols: 4, rows: 2 },
    { key: 'jdmGtCoupe', files: ['jdm-gt-coupe.svg', 'super-car.svg'], col: 3, row: 1, cols: 4, rows: 2 }
  ];

  const vehiclesDir = path.join(ROOT, 'public/assets/World/vehicles');
  const racerDir = path.join(ROOT, 'public/assets/vehicles/racer');
  fs.mkdirSync(vehiclesDir, { recursive: true });
  fs.mkdirSync(racerDir, { recursive: true });

  for (const isoSpec of isoWorldVehicleSpecs) {
    const isoPng = await page.evaluate(async ({ src, col, row, cols, rows }) => {
      const img = new Image();
      img.src = src;
      await new Promise((r) => { img.onload = r; });

      const cellW = Math.floor(img.naturalWidth / cols);
      const cellH = Math.floor(img.naturalHeight / rows);
      const sx = col * cellW;
      const sy = row * cellH;

      const c = document.createElement('canvas');
      c.width = cellW;
      c.height = cellH;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, sx, sy, cellW, cellH, 0, 0, cellW, cellH);

      const imgData = ctx.getImageData(0, 0, cellW, cellH);
      const data = imgData.data;

      const visited = new Uint8Array(cellW * cellH);
      const queue = new Int32Array(cellW * cellH);
      let head = 0, tail = 0;
      const isWhiteBg = (r, g, b) => r > 236 && g > 236 && b > 234;

      const push = (x, y) => {
        if (x < 0 || x >= cellW || y < 0 || y >= cellH) return;
        const p = y * cellW + x;
        if (visited[p]) return;
        const idx = p * 4;
        if (isWhiteBg(data[idx], data[idx + 1], data[idx + 2])) {
          visited[p] = 1;
          queue[tail++] = p;
        }
      };

      for (let x = 0; x < cellW; x++) {
        push(x, 0);
        push(x, cellH - 1);
      }
      for (let y = 0; y < cellH; y++) {
        push(0, y);
        push(cellW - 1, y);
      }

      while (head < tail) {
        const p = queue[head++];
        const x = p % cellW;
        const y = (p - x) / cellW;
        push(x + 1, y);
        push(x - 1, y);
        push(x, y + 1);
        push(x, y - 1);
      }

      let minX = cellW, minY = cellH, maxX = 0, maxY = 0;
      for (let y = 0; y < cellH; y++) {
        for (let x = 0; x < cellW; x++) {
          const p = y * cellW + x;
          const idx = p * 4;
          if (visited[p]) {
            data[idx + 3] = 0;
          } else {
            let bgN = 0;
            if (x > 0 && visited[p - 1]) bgN++;
            if (x < cellW - 1 && visited[p + 1]) bgN++;
            if (y > 0 && visited[p - cellW]) bgN++;
            if (y < cellH - 1 && visited[p + cellW]) bgN++;
            if (bgN > 0) data[idx + 3] = Math.round(255 * (1 - bgN * 0.2));
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);

      const cw = Math.max(1, maxX - minX + 1);
      const ch = Math.max(1, maxY - minY + 1);

      const out = document.createElement('canvas');
      out.width = 280;
      out.height = 200;
      const octx = out.getContext('2d');
      const scale = Math.min(256 / cw, 180 / ch);
      const dw = cw * scale;
      const dh = ch * scale;
      const dx = (280 - dw) / 2;
      const dy = (200 - dh) / 2;
      octx.drawImage(c, minX, minY, cw, ch, dx, dy, dw, dh);
      return out.toDataURL('image/png');
    }, { src: isoVehUrl, col: isoSpec.col, row: isoSpec.row, cols: isoSpec.cols, rows: isoSpec.rows });

    const isoVehSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="200" viewBox="0 0 280 200" role="img" aria-label="${isoSpec.key}">
  <polygon points="140,184 246,130 140,78 34,130" fill="#020617" opacity="0.32"/>
  <image href="${isoPng}" x="0" y="0" width="280" height="200" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

    for (const vFile of isoSpec.files) {
      fs.writeFileSync(path.join(vehiclesDir, vFile), isoVehSvg);
      console.log(`Processed 3D Isometric World vehicle: ${isoSpec.key} -> ${vFile}`);
    }
  }

  // 3B. Process 2D Side-Profile Vehicles for Road Runner Side-Scroller (public/assets/vehicles/racer/*.svg)
  const mainVehUrl = fileToDataUrl(VEHICLE_MAIN_SHEET);
  const suppVehUrl = fileToDataUrl(VEHICLE_SUPP_SHEET);

  const vehicleSpecs = [
    { key: 'compactCar', racerFiles: ['starter-hatch.svg'], sheet: 'main', col: 0, row: 0, cols: 4, rows: 3 },
    { key: 'blueCar', racerFiles: ['green-compact.svg'], sheet: 'main', col: 1, row: 0, cols: 4, rows: 3 },
    { key: 'rallyCar', racerFiles: ['rally-lite.svg'], sheet: 'main', col: 2, row: 0, cols: 4, rows: 3 },
    { key: 'jdmGtCoupe', racerFiles: ['purple-coupe.svg'], sheet: 'main', col: 3, row: 0, cols: 4, rows: 3 },
    { key: 'greenTruck', racerFiles: ['offroad-truck.svg', 'pickup-truck.svg'], sheet: 'main', col: 0, row: 2, cols: 4, rows: 3 },
    { key: 'towTruck', racerFiles: ['mountain-courier.svg'], sheet: 'main', col: 2, row: 2, cols: 4, rows: 3 },
    { key: 'superCar', racerFiles: ['super-coupe.svg'], sheet: 'main', col: 3, row: 2, cols: 4, rows: 3 },
    { key: 'yellowCar', racerFiles: ['city-taxi.svg'], sheet: 'supp', col: 0, row: 0, cols: 3, rows: 2 },
    { key: 'bajaSuv', racerFiles: ['desert-runner.svg'], sheet: 'supp', col: 1, row: 0, cols: 3, rows: 2 },
    { key: 'deliveryVan', racerFiles: ['service-van.svg', 'export-van.svg'], sheet: 'supp', col: 2, row: 0, cols: 3, rows: 2 }
  ];

  for (const vSpec of vehicleSpecs) {
    const sheetUrl = vSpec.sheet === 'main' ? mainVehUrl : suppVehUrl;
    const vResult = await page.evaluate(async ({ src, col, row, cols, rows }) => {
      const img = new Image();
      img.src = src;
      await new Promise((r) => { img.onload = r; });

      const cellW = Math.floor(img.naturalWidth / cols);
      const cellH = Math.floor(img.naturalHeight / rows);
      const sx = col * cellW;
      const sy = row * cellH;

      const c = document.createElement('canvas');
      c.width = cellW;
      c.height = cellH;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, sx, sy, cellW, cellH, 0, 0, cellW, cellH);

      const imgData = ctx.getImageData(0, 0, cellW, cellH);
      const data = imgData.data;

      const visited = new Uint8Array(cellW * cellH);
      const queue = new Int32Array(cellW * cellH);
      let head = 0, tail = 0;
      const isWhiteBg = (r, g, b) => r > 236 && g > 236 && b > 234;

      const push = (x, y) => {
        if (x < 0 || x >= cellW || y < 0 || y >= cellH) return;
        const p = y * cellW + x;
        if (visited[p]) return;
        const idx = p * 4;
        if (isWhiteBg(data[idx], data[idx + 1], data[idx + 2])) {
          visited[p] = 1;
          queue[tail++] = p;
        }
      };

      for (let x = 0; x < cellW; x++) {
        push(x, 0);
        push(x, cellH - 1);
      }
      for (let y = 0; y < cellH; y++) {
        push(0, y);
        push(cellW - 1, y);
      }

      while (head < tail) {
        const p = queue[head++];
        const x = p % cellW;
        const y = (p - x) / cellW;
        push(x + 1, y);
        push(x - 1, y);
        push(x, y + 1);
        push(x, y - 1);
      }

      let minX = cellW, minY = cellH, maxX = 0, maxY = 0;
      for (let y = 0; y < cellH; y++) {
        for (let x = 0; x < cellW; x++) {
          const p = y * cellW + x;
          const idx = p * 4;
          if (visited[p]) {
            data[idx + 3] = 0;
          } else {
            let bgN = 0;
            if (x > 0 && visited[p - 1]) bgN++;
            if (x < cellW - 1 && visited[p + 1]) bgN++;
            if (y > 0 && visited[p - cellW]) bgN++;
            if (y < cellH - 1 && visited[p + cellW]) bgN++;
            if (bgN > 0) data[idx + 3] = Math.round(255 * (1 - bgN * 0.2));
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);

      const cw = Math.max(1, maxX - minX + 1);
      const ch = Math.max(1, maxY - minY + 1);

      const out = document.createElement('canvas');
      out.width = 320;
      out.height = 160;
      const octx = out.getContext('2d');
      const scale = Math.min(296 / cw, 138 / ch);
      const dw = cw * scale;
      const dh = ch * scale;
      const dx = (320 - dw) / 2;
      const dy = 148 - dh;
      octx.drawImage(c, minX, minY, cw, ch, dx, dy, dw, dh);
      return out.toDataURL('image/png');
    }, { src: sheetUrl, col: vSpec.col, row: vSpec.row, cols: vSpec.cols, rows: vSpec.rows });

    const vehSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160" viewBox="0 0 320 160" role="img" aria-label="${vSpec.key}">
  <ellipse cx="160" cy="146" rx="126" ry="10" fill="#020617" opacity="0.38"/>
  <image href="${vResult}" x="0" y="0" width="320" height="160" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

    for (const rFile of vSpec.racerFiles) {
      fs.writeFileSync(path.join(racerDir, rFile), vehSvg);
    }
    console.log(`Processed Road Runner side-profile racer: ${vSpec.key}`);
  }

  // 4. Process Props from Supplementary Sheet Row 1 (Col 0: broken-car.svg, Col 1: tree.svg, Col 2: pothole-crater.svg)
  const propSpecs = [
    { file: 'broken-car.svg', col: 0, row: 1, w: 320, h: 180 },
    { file: 'tree.svg', col: 1, row: 1, w: 220, h: 260 },
    { file: 'pothole-crater.svg', col: 2, row: 1, w: 280, h: 200 }
  ];
  const propsDir = path.join(ROOT, 'public/assets/World/props');
  fs.mkdirSync(propsDir, { recursive: true });

  for (const pSpec of propSpecs) {
    const pPng = await page.evaluate(async ({ src, col, row, outW, outH }) => {
      const img = new Image();
      img.src = src;
      await new Promise((r) => { img.onload = r; });

      const cellW = Math.floor(img.naturalWidth / 3);
      const cellH = Math.floor(img.naturalHeight / 2);
      const sx = col * cellW;
      const sy = row * cellH;

      const c = document.createElement('canvas');
      c.width = cellW;
      c.height = cellH;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, sx, sy, cellW, cellH, 0, 0, cellW, cellH);

      const imgData = ctx.getImageData(0, 0, cellW, cellH);
      const data = imgData.data;

      const visited = new Uint8Array(cellW * cellH);
      const queue = new Int32Array(cellW * cellH);
      let head = 0, tail = 0;
      const isWhiteBg = (r, g, b) => r > 236 && g > 236 && b > 234;

      const push = (x, y) => {
        if (x < 0 || x >= cellW || y < 0 || y >= cellH) return;
        const p = y * cellW + x;
        if (visited[p]) return;
        const idx = p * 4;
        if (isWhiteBg(data[idx], data[idx + 1], data[idx + 2])) {
          visited[p] = 1;
          queue[tail++] = p;
        }
      };

      for (let x = 0; x < cellW; x++) {
        push(x, 0);
        push(x, cellH - 1);
      }
      for (let y = 0; y < cellH; y++) {
        push(0, y);
        push(cellW - 1, y);
      }

      while (head < tail) {
        const p = queue[head++];
        const x = p % cellW;
        const y = (p - x) / cellW;
        push(x + 1, y);
        push(x - 1, y);
        push(x, y + 1);
        push(x, y - 1);
      }

      let minX = cellW, minY = cellH, maxX = 0, maxY = 0;
      for (let y = 0; y < cellH; y++) {
        for (let x = 0; x < cellW; x++) {
          const p = y * cellW + x;
          const idx = p * 4;
          if (visited[p]) {
            data[idx + 3] = 0;
          } else {
            let bgN = 0;
            if (x > 0 && visited[p - 1]) bgN++;
            if (x < cellW - 1 && visited[p + 1]) bgN++;
            if (y > 0 && visited[p - cellW]) bgN++;
            if (y < cellH - 1 && visited[p + cellW]) bgN++;
            if (bgN > 0) data[idx + 3] = Math.round(255 * (1 - bgN * 0.2));
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);

      const cw = Math.max(1, maxX - minX + 1);
      const ch = Math.max(1, maxY - minY + 1);

      const out = document.createElement('canvas');
      out.width = outW;
      out.height = outH;
      const octx = out.getContext('2d');
      const scale = Math.min((outW - 16) / cw, (outH - 16) / ch);
      const dw = cw * scale;
      const dh = ch * scale;
      octx.drawImage(c, minX, minY, cw, ch, (outW - dw) / 2, (outH - dh) / 2, dw, dh);
      return out.toDataURL('image/png');
    }, { src: suppVehUrl, col: pSpec.col, row: pSpec.row, outW: pSpec.w, outH: pSpec.h });

    const propSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pSpec.w}" height="${pSpec.h}" viewBox="0 0 ${pSpec.w} ${pSpec.h}" role="img" aria-label="${pSpec.file}">
  <image href="${pPng}" x="0" y="0" width="${pSpec.w}" height="${pSpec.h}" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
    fs.writeFileSync(path.join(propsDir, pSpec.file), propSvg);
    console.log(`Processed cutout prop: ${pSpec.file}`);
  }

  await browser.close();
  console.log('All Clash-style cutout buildings, 3D Supercell characters, vehicles, and props built!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
