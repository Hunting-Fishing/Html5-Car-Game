import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(rootDir, 'public');
const brainDir = 'C:\\Users\\jordi\\.gemini\\antigravity\\brain\\028b010f-6426-495c-8083-6ccf934239f8';

function writeSvg(relPath, content) {
  const fullPath = path.join(publicDir, relPath.replace(/^\/+/, '').replaceAll('/', path.sep));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ============================================================================
// 1. NANO BANANA 2 2.5D ISOMETRIC WORLD BUILDINGS (10 Base + 30 Level Tiers)
// ============================================================================
const BUILDING_NANO_SPECS = [
  {
    key: 'garage',
    baseFile: 'garage.svg',
    levelPrefix: 'garage',
    renderFile: '365_garage_workshop_1792338543961.jpg',
    title: '365 Main Garage',
    signText: '365 GARAGE',
    accent: '#35e58a',
    secondary: '#38bdf8'
  },
  {
    key: 'streetKiosk',
    baseFile: 'street-kiosk.svg',
    levelPrefix: 'street-kiosk',
    renderFile: 'express_kiosk_1792338778750.jpg',
    title: '365 Express Kiosk',
    signText: '365 EXPRESS',
    accent: '#35e58a',
    secondary: '#ffd166'
  },
  {
    key: 'dealerShowroom',
    baseFile: 'dealer-showroom.svg',
    levelPrefix: 'dealer-showroom',
    renderFile: 'dealer_showroom_1792338543554.jpg',
    title: 'Dealer Showroom',
    signText: 'SHOWROOM',
    accent: '#60a5fa',
    secondary: '#ffd166'
  },
  {
    key: 'partsHub',
    baseFile: 'parts-hub.svg',
    levelPrefix: 'parts-hub',
    renderFile: 'parts_hub_depot_png_1792338543383.jpg',
    title: 'Parts Hub',
    signText: 'PARTS HUB',
    accent: '#2dd4bf',
    secondary: '#38bdf8'
  },
  {
    key: 'partsWarehouse',
    baseFile: 'parts-warehouse.svg',
    levelPrefix: 'parts-warehouse',
    renderFile: 'parts_warehouse_depot_png_1792338657274.jpg',
    title: 'Parts Warehouse',
    signText: 'WAREHOUSE',
    accent: '#22d3ee',
    secondary: '#ffd166'
  },
  {
    key: 'tireRepair',
    baseFile: 'tire-repair-shop.svg',
    levelPrefix: 'tire-repair-shop',
    renderFile: 'tire_lube_shop_isometric_1792338650848.jpg',
    title: 'Tire & Lube Shop',
    signText: 'TIRE & LUBE',
    accent: '#facc15',
    secondary: '#38bdf8'
  },
  {
    key: 'privateShop',
    baseFile: 'private-repair-shop.svg',
    levelPrefix: 'private-repair-shop',
    renderFile: 'tuning_bay_clean_1792338674302.jpg',
    title: 'Tuning & Repair Bay',
    signText: 'TUNING BAY',
    accent: '#a78bfa',
    secondary: '#35e58a'
  },
  {
    key: 'towDispatch',
    baseFile: 'tow-dispatch.svg',
    levelPrefix: 'tow-dispatch',
    renderFile: 'tow_dispatch_station_1792338541864.jpg',
    title: 'Tow Dispatch',
    signText: 'TOW DISPATCH',
    accent: '#f59e0b',
    secondary: '#ef4444'
  },
  {
    key: 'salvageBlock',
    baseFile: 'salvage-yard.svg',
    levelPrefix: 'salvage-yard',
    renderFile: 'salvage_yard_block_1792338656648.jpg',
    title: 'Salvage Yard',
    signText: 'SALVAGE YARD',
    accent: '#fb923c',
    secondary: '#35e58a'
  },
  {
    key: 'testTrack',
    baseFile: 'test-track.svg',
    levelPrefix: 'test-track',
    renderFile: 'test_track_pit_complex_1792338783573.jpg',
    title: '2D Test Track',
    signText: 'TEST TRACK',
    accent: '#4ade80',
    secondary: '#ffd166'
  }
];

function renderNanoBuildingSvg({ id, title, accent, secondary, level = 1, dataUri }) {
  const safeTitle = escapeXml(title);
  const rimStroke = level === 3 ? '#ffd166' : level === 2 ? secondary : accent;
  const rimWidth = level === 3 ? 6 : level === 2 ? 4.5 : 3.5;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="280" viewBox="0 0 320 280" role="img" aria-label="${safeTitle} Lv${level}">
  <defs>
    <clipPath id="clip_${id}">
      <rect x="10" y="6" width="300" height="264" rx="34"/>
    </clipPath>
    <linearGradient id="rim_${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="55%" stop-color="${rimStroke}"/>
      <stop offset="100%" stop-color="${secondary}"/>
    </linearGradient>
    <radialGradient id="glow_${id}" cx="50%" cy="46%" r="52%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Isometric Ground Drop Shadow -->
  <ellipse cx="160" cy="256" rx="146" ry="20" fill="#020810" opacity="0.48"/>
  <circle cx="160" cy="136" r="142" fill="url(#glow_${id})"/>
  <!-- Nano Banana 2 High-Detail 2.5D Isometric Building Render -->
  <g clip-path="url(#clip_${id})">
    <rect x="10" y="6" width="300" height="264" fill="#0f172a"/>
    <image href="${dataUri}" x="6" y="-8" width="308" height="292" preserveAspectRatio="xMidYMid slice"/>
    <!-- Subtle vignette blend at pad edges -->
    <rect x="10" y="6" width="300" height="264" rx="34" fill="none" stroke="#06131d" stroke-width="10" opacity="0.55"/>
  </g>
  <!-- Glowing Isometric Lot Rim -->
  <rect x="10" y="6" width="300" height="264" rx="34" fill="none" stroke="url(#rim_${id})" stroke-width="${rimWidth}" opacity="0.92"/>
  ${level >= 2 ? `
    <!-- Lv2+ Upgraded Corner Beacon Bollards -->
    <circle cx="28" cy="248" r="6" fill="${accent}" stroke="#06131d" stroke-width="2"/>
    <circle cx="292" cy="248" r="6" fill="${accent}" stroke="#06131d" stroke-width="2"/>
  ` : ''}
  ${level >= 3 ? `
    <!-- Lv3 Flagship Golden Crown Stars -->
    <g transform="translate(24, 18)">
      <rect x="0" y="0" width="54" height="22" rx="11" fill="#06131d" stroke="#ffd166" stroke-width="2"/>
      <text x="27" y="15" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="11" fill="#ffd166">★★★</text>
    </g>
  ` : ''}
</svg>`;
}

for (const spec of BUILDING_NANO_SPECS) {
  const srcImgPath = path.join(brainDir, spec.renderFile);
  const dstRenderDir = path.join(publicDir, 'assets', 'World', 'buildings', 'renders');
  fs.mkdirSync(dstRenderDir, { recursive: true });
  const dstImgPath = path.join(dstRenderDir, `${spec.levelPrefix}.jpg`);
  fs.copyFileSync(srcImgPath, dstImgPath);

  const base64 = fs.readFileSync(srcImgPath).toString('base64');
  const dataUri = `data:image/jpeg;base64,${base64}`;

  writeSvg(`assets/World/buildings/${spec.baseFile}`, renderNanoBuildingSvg({ ...spec, id: `${spec.key}_base`, level: 1, dataUri }));
  for (const lv of [1, 2, 3]) {
    writeSvg(
      `assets/World/buildings/levels/${spec.levelPrefix}-lv${lv}.svg`,
      renderNanoBuildingSvg({ ...spec, id: `${spec.key}_lv${lv}`, level: lv, dataUri })
    );
  }
}

// ============================================================================
// 2. REAL ROTATING WHEEL ASSETS (Sport Alloy, JDM Gold 6-Spoke, 4x4 Beadlock)
// ============================================================================
function renderWheelSvg({ id, style = 'sport', rimColor = '#e2e8f0', accentColor = '#38bdf8', caliperColor = '#ef4444' }) {
  const isTruck = style === 'truck';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="Wheel ${id}">
  <!-- Outer Tire with Tread Lugs so rotation is unmistakably visible -->
  <circle cx="32" cy="32" r="28" fill="#0f172a" stroke="#020617" stroke-width="2.5"/>
  <circle cx="32" cy="32" r="24" fill="#1e293b"/>
  <!-- High-visibility Tread Lugs / Sidewall Markers -->
  <g stroke="${isTruck ? '#475569' : '#334155'}" stroke-width="${isTruck ? '4.5' : '3'}" stroke-linecap="round">
    <line x1="32" y1="2" x2="32" y2="7"/>
    <line x1="32" y1="57" x2="32" y2="62"/>
    <line x1="2" y1="32" x2="7" y2="32"/>
    <line x1="57" y1="32" x2="62" y2="32"/>
    <line x1="11" y1="11" x2="15" y2="15"/>
    <line x1="53" y1="11" x2="49" y2="15"/>
    <line x1="11" y1="53" x2="15" y2="49"/>
    <line x1="53" y1="53" x2="49" y2="49"/>
  </g>
  <!-- Tire Sidewall Accent Stripe (rotates visibly) -->
  <path d="M 32 7 A 25 25 0 0 1 55 22" fill="none" stroke="${accentColor}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M 32 57 A 25 25 0 0 1 9 42" fill="none" stroke="${caliperColor}" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Inner Brake Rotor & Caliper -->
  <circle cx="32" cy="32" r="19" fill="#090d16" stroke="${rimColor}" stroke-width="2.5"/>
  <circle cx="32" cy="32" r="13" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
  <!-- 6-Spoke Alloy / Beadlock Rim -->
  <g stroke="${rimColor}" stroke-width="${isTruck ? '4' : '3.2'}" stroke-linecap="round">
    <line x1="32" y1="13" x2="32" y2="51"/>
    <line x1="15.5" y1="22.5" x2="48.5" y2="41.5"/>
    <line x1="48.5" y1="22.5" x2="15.5" y2="41.5"/>
  </g>
  <!-- Center Hub Cap & Lug Nuts -->
  <circle cx="32" cy="32" r="6.5" fill="#0f172a" stroke="${accentColor}" stroke-width="2"/>
  <circle cx="32" cy="32" r="2.5" fill="${caliperColor}"/>
</svg>`;
}

writeSvg('assets/World/vehicles/wheel-sport.svg', renderWheelSvg({ id: 'sport', style: 'sport', rimColor: '#e2e8f0', accentColor: '#38bdf8', caliperColor: '#ef4444' }));
writeSvg('assets/World/vehicles/wheel-gold.svg', renderWheelSvg({ id: 'gold', style: 'gold', rimColor: '#facc15', accentColor: '#35e58a', caliperColor: '#f97316' }));
writeSvg('assets/World/vehicles/wheel-truck.svg', renderWheelSvg({ id: 'truck', style: 'truck', rimColor: '#cbd5e1', accentColor: '#facc15', caliperColor: '#ef4444' }));

// ============================================================================
// 3. TOP ASIAN MARKET & TOP NORTH AMERICAN MARKET VEHICLES (App-Wide + World)
// ============================================================================
function renderMarketVehicleSvg({
  id,
  name,
  market,
  archetype,
  bodyTop,
  bodyBottom,
  trimColor,
  windowTint = '#0f293d',
  glassEdge = '#7dd3fc',
  rimColor = '#e2e8f0',
  caliperColor = '#ef4444',
  includeStaticWheels = false
}) {
  const safeName = escapeXml(name);
  let chassisMarkup = '';
  let wheelPositions = [
    { x: 64, y: 92, r: 17 },
    { x: 174, y: 92, r: 17 }
  ];

  if (archetype === 'kei_hatch') {
    // Top Asian Market: Pearl White JDM Kei Turbo Hot Hatch (Honda N-One RS / Swift Sport style)
    chassisMarkup = `
      <!-- Rear Roof Spoiler -->
      <path d="M30 40 L18 34 L24 30 L42 38 Z" fill="${trimColor}" stroke="#06131d" stroke-width="3"/>
      <!-- Boxy-Sporty JDM Kei Turbo Body -->
      <path d="M24 88 L22 58 Q22 40 42 36 L118 36 Q138 36 158 56 L194 64 Q206 68 206 80 L204 90 H24 Z" fill="url(#body_${id})" stroke="#06131d" stroke-width="4.5" stroke-linejoin="round"/>
      <!-- Black Contrast Roof Canopy -->
      <path d="M36 42 Q44 35 60 35 H118 Q134 35 148 48 H34 Z" fill="#0f172a"/>
      <!-- Wrap-around JDM Greenhouse Windows -->
      <polygon points="40,42 84,42 84,58 34,58" fill="${windowTint}" stroke="${glassEdge}" stroke-width="1.5"/>
      <polygon points="90,42 128,42 150,58 90,58" fill="${windowTint}" stroke="${glassEdge}" stroke-width="1.5"/>
      <!-- RS Red Side Aero Rocker Stripe & Intercooler -->
      <rect x="34" y="76" width="154" height="5" rx="2.5" fill="${trimColor}"/>
      <rect x="190" y="74" width="12" height="10" rx="2" fill="#0f172a" stroke="#94a3b8" stroke-width="1.5"/>
      <!-- JDM Projector Headlight & LED Tail -->
      <polygon points="186,62 203,67 202,73 184,69" fill="#fef08a" stroke="#06131d" stroke-width="1.5"/>
      <rect x="21" y="56" width="7" height="14" rx="3" fill="#fb7185" stroke="#06131d" stroke-width="1.5"/>
    `;
  } else if (archetype === 'jdm_coupe') {
    // Top Asian Market: Bayside Blue / Midnight Purple JDM GT-Apex Coupe (Skyline GT-R / Supra / GR86 style)
    chassisMarkup = `
      <!-- High-Mount Carbon GT Gooseneck Wing -->
      <path d="M24 56 L14 38 H34 L28 43 L34 56 Z" fill="#0f172a" stroke="${trimColor}" stroke-width="2"/>
      <!-- Low-Slung JDM Widebody Coupe Silhouette -->
      <path d="M18 88 L20 60 L48 54 L82 36 H138 L174 56 L210 64 Q218 68 216 88 H18 Z" fill="url(#body_${id})" stroke="#06131d" stroke-width="4.5" stroke-linejoin="round"/>
      <!-- Fastback Greenhouse -->
      <polygon points="62,53 86,40 134,40 166,55" fill="${windowTint}" stroke="${glassEdge}" stroke-width="1.5"/>
      <line x1="108" y1="40" x2="102" y2="54" stroke="#06131d" stroke-width="3"/>
      <!-- Front Mount Intercooler (FMIC) & Side Vent -->
      <rect x="198" y="73" width="16" height="10" rx="2" fill="#cbd5e1" stroke="#0f172a" stroke-width="1.5"/>
      <path d="M88 64 L78 82 H162 L170 68" fill="none" stroke="${trimColor}" stroke-width="3"/>
      <!-- Twin Round JDM Taillights & Laser Headlights -->
      <circle cx="23" cy="66" r="4" fill="#ef4444"/>
      <circle cx="23" cy="74" r="4" fill="#ef4444"/>
      <polygon points="190,62 213,67 211,72 188,68" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.5"/>
    `;
  } else if (archetype === 'asian_taxi') {
    // Top Asian Market: Tokyo Crown / Urban Hybrid Taxi Sedan
    chassisMarkup = `
      <!-- Glowing Roof Taxi Lantern -->
      <rect x="102" y="25" width="28" height="10" rx="4" fill="#fef08a" stroke="#06131d" stroke-width="2.5"/>
      <text x="116" y="33" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="6.5" fill="#06131d">365</text>
      <!-- Three-Box Executive Asian Sedan Body -->
      <path d="M20 88 L22 60 L54 56 L76 36 H142 L168 56 L208 62 L210 88 H20 Z" fill="url(#body_${id})" stroke="#06131d" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="62,55 80,41 112,41 112,55" fill="${windowTint}" stroke="${glassEdge}" stroke-width="1.5"/>
      <polygon points="117,41 140,41 162,55 117,55" fill="${windowTint}" stroke="${glassEdge}" stroke-width="1.5"/>
      <!-- Checkered Taxi Side Beltline -->
      <rect x="34" y="68" width="158" height="6" rx="2" fill="${trimColor}"/>
      <rect x="192" y="64" width="14" height="7" rx="2" fill="#fef08a"/>
      <rect x="20" y="64" width="8" height="9" rx="2" fill="#ef4444"/>
    `;
  } else if (archetype === 'jdm_rally') {
    // Top Asian Market: World Rally Blue AWD Rally Spec (WRX STI / Evo X style)
    chassisMarkup = `
      <!-- Rally Box Wing & Roof Vent + Hood Scoop -->
      <path d="M22 58 V40 H38 L34 58 Z" fill="url(#body_${id})" stroke="#06131d" stroke-width="3"/>
      <path d="M116 35 L126 31 L132 35 Z" fill="${trimColor}" stroke="#06131d" stroke-width="2"/>
      <path d="M168 54 L178 48 H190 L186 55 Z" fill="url(#body_${id})" stroke="#06131d" stroke-width="2.5"/>
      <!-- Aggressive AWD Rally Sedan Body -->
      <path d="M20 88 L22 56 L54 54 L76 35 H140 L168 54 L208 60 L212 88 H20 Z" fill="url(#body_${id})" stroke="#06131d" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="60,53 80,40 112,40 112,53" fill="${windowTint}" stroke="${glassEdge}" stroke-width="1.5"/>
      <polygon points="117,40 138,40 162,53 117,53" fill="${windowTint}" stroke="${glassEdge}" stroke-width="1.5"/>
      <!-- Gold Rally Livery Graphics -->
      <path d="M44 72 L96 62 L88 78 L156 68" fill="none" stroke="${trimColor}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="198" cy="74" r="5" fill="#fef08a" stroke="#06131d" stroke-width="1.5"/>
      <rect x="20" y="62" width="8" height="10" rx="2" fill="#ef4444"/>
    `;
  } else if (archetype === 'na_raptor_truck') {
    // Top North American Market: Lifted 4x4 Baja Raptor Crew Pickup Truck
    wheelPositions = [
      { x: 62, y: 92, r: 20 },
      { x: 174, y: 92, r: 20 }
    ];
    chassisMarkup = `
      <!-- Bed Chase Rack & Roof LED Off-Road Lightbar -->
      <path d="M84 54 L106 34 H114 L94 54 Z" fill="#1e293b" stroke="#06131d" stroke-width="2.5"/>
      <rect x="104" y="27" width="16" height="6" rx="3" fill="#fef08a" stroke="#06131d" stroke-width="2"/>
      <!-- Lifted Crew-Cab 4x4 Pickup Body -->
      <path d="M18 82 L20 52 H98 V34 H158 L178 54 L212 58 L214 84 H18 Z" fill="url(#body_${id})" stroke="#06131d" stroke-width="4.5" stroke-linejoin="round"/>
      <!-- Crew Cab Tinted Windows -->
      <polygon points="104,40 128,40 128,54 104,54" fill="${windowTint}" stroke="${glassEdge}" stroke-width="1.5"/>
      <polygon points="133,40 154,40 171,54 133,54" fill="${windowTint}" stroke="${glassEdge}" stroke-width="1.5"/>
      <!-- Matte Black Wide Baja Fender Flares & Bullbar -->
      <path d="M36 84 A 26 26 0 0 1 88 84" fill="none" stroke="#0f172a" stroke-width="7"/>
      <path d="M148 84 A 26 26 0 0 1 200 84" fill="none" stroke="#0f172a" stroke-width="7"/>
      <path d="M210 58 L220 64 L216 82 H208" fill="none" stroke="#0f172a" stroke-width="4" stroke-linejoin="round"/>
      <!-- Amber Grille Marker Lights & Off-Road Stripe -->
      <rect x="28" y="64" width="120" height="5" rx="2.5" fill="${trimColor}"/>
      <rect x="202" y="62" width="10" height="10" rx="2" fill="#f59e0b" stroke="#06131d" stroke-width="1.5"/>
      <rect x="18" y="56" width="7" height="14" rx="2" fill="#ef4444"/>
    `;
  } else if (archetype === 'na_muscle') {
    // Top North American Market: Deep Crimson & Matte Black American V8 Muscle Coupe
    chassisMarkup = `
      <!-- V8 Supercharger Shaker Hood Scoop & Rear Ducktail -->
      <path d="M154 54 L164 46 H192 L196 55 Z" fill="#0f172a" stroke="${trimColor}" stroke-width="2"/>
      <path d="M18 58 L14 48 L28 54 Z" fill="#0f172a"/>
      <!-- Muscular Long-Hood Fastback Body -->
      <path d="M16 88 L20 56 L58 52 L84 36 H136 L158 53 L212 58 L216 86 H16 Z" fill="url(#body_${id})" stroke="#06131d" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="66,51 88,41 132,41 152,53" fill="${windowTint}" stroke="${glassEdge}" stroke-width="1.5"/>
      <!-- Matte Black Hockey-Stick Muscle Stripe & Chrome Side Exhaust Pipe -->
      <path d="M156 56 L144 74 H42" fill="none" stroke="#0f172a" stroke-width="6" stroke-linecap="round"/>
      <rect x="86" y="84" width="64" height="5" rx="2.5" fill="#cbd5e1" stroke="#0f172a" stroke-width="1.5"/>
      <rect x="204" y="62" width="10" height="8" rx="2" fill="#fef08a"/>
      <rect x="16" y="60" width="8" height="10" rx="2" fill="#ef4444"/>
    `;
  } else if (archetype === 'na_baja_suv') {
    // Top North American Market: Mojave Orange 4x4 Bronco Trophy SUV
    wheelPositions = [
      { x: 64, y: 92, r: 19 },
      { x: 174, y: 92, r: 19 }
    ];
    chassisMarkup = `
      <!-- Rear Tailgate Spare Tire & Roof Adventure Rack -->
      <rect x="12" y="48" width="14" height="28" rx="5" fill="#1e293b" stroke="#06131d" stroke-width="3"/>
      <rect x="44" y="28" width="96" height="5" rx="2.5" fill="#0f172a"/>
      <!-- Modular Black Hardtop & Boxy 4x4 SUV Body -->
      <path d="M24 84 V36 H152 L172 56 L210 60 L212 84 H24 Z" fill="url(#body_${id})" stroke="#06131d" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M26 36 H148 L166 55 H26 Z" fill="#1e293b"/>
      <rect x="34" y="41" width="38" height="14" rx="2" fill="${windowTint}" stroke="${glassEdge}" stroke-width="1.5"/>
      <rect x="78" y="41" width="34" height="14" rx="2" fill="${windowTint}" stroke="${glassEdge}" stroke-width="1.5"/>
      <polygon points="118,41 144,41 160,55 118,55" fill="${windowTint}" stroke="${glassEdge}" stroke-width="1.5"/>
      <rect x="36" y="68" width="152" height="5" rx="2.5" fill="${trimColor}"/>
      <circle cx="204" cy="68" r="5" fill="#fef08a"/>
    `;
  } else if (archetype === 'na_wrecker_tow') {
    // Top North American Market: Industrial Yellow Heavy-Duty Recovery Wrecker Tow Truck
    wheelPositions = [
      { x: 58, y: 92, r: 18 },
      { x: 172, y: 92, r: 18 }
    ];
    chassisMarkup = `
      <!-- Articulated Hydraulic Boom Arm, Winch Cable & Hook -->
      <path d="M88 60 L26 24 L20 30 L76 64 Z" fill="#f59e0b" stroke="#06131d" stroke-width="3.5" stroke-linejoin="round"/>
      <line x1="23" y1="28" x2="23" y2="66" stroke="#cbd5e1" stroke-width="3" stroke-dasharray="4 2"/>
      <path d="M18 66 Q23 76 29 68" fill="none" stroke="#facc15" stroke-width="4" stroke-linecap="round"/>
      <!-- Rear Wheel-Lift Cradle -->
      <path d="M8 84 H32 V76" fill="none" stroke="#94a3b8" stroke-width="4.5" stroke-linecap="round"/>
      <!-- Chrome Vertical Exhaust Stack & Flashing Amber/Red Emergency Lightbar -->
      <rect x="114" y="24" width="7" height="38" rx="3" fill="#e2e8f0" stroke="#06131d" stroke-width="2"/>
      <rect x="132" y="24" width="28" height="8" rx="4" fill="#ef4444" stroke="#06131d" stroke-width="2"/>
      <rect x="146" y="24" width="14" height="8" rx="3" fill="#fef08a"/>
      <!-- Heavy-Duty American Wrecker Cab & Utility Bed -->
      <path d="M24 88 V58 H118 V32 H166 L184 56 L212 62 V88 H24 Z" fill="url(#body_${id})" stroke="#06131d" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="126,38 160,38 176,56 126,56" fill="${windowTint}" stroke="${glassEdge}" stroke-width="1.5"/>
      <!-- Utility Toolboxes & Hazard Chevron Stripe -->
      <rect x="42" y="64" width="38" height="16" rx="3" fill="#cbd5e1" stroke="#0f172a" stroke-width="2"/>
      <rect x="86" y="64" width="28" height="16" rx="3" fill="#cbd5e1" stroke="#0f172a" stroke-width="2"/>
      <rect x="28" y="81" width="176" height="5" rx="2" fill="${trimColor}"/>
      <rect x="202" y="66" width="9" height="10" rx="2" fill="#fef08a"/>
    `;
  } else if (archetype === 'na_fleet_van') {
    // Top North American Market: Commercial High-Roof 365 Logistics Transit Van
    chassisMarkup = `
      <!-- Roof Cargo Rack -->
      <rect x="38" y="26" width="106" height="5" rx="2" fill="#94a3b8" stroke="#06131d" stroke-width="2"/>
      <!-- High-Roof Commercial Van Body -->
      <path d="M22 88 V38 Q22 30 32 30 H154 L184 56 L208 64 V88 H22 Z" fill="url(#body_${id})" stroke="#06131d" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="142,36 154,36 178,56 142,56" fill="${windowTint}" stroke="${glassEdge}" stroke-width="1.5"/>
      <!-- 365 Fleet Logistics Stripe & Badge -->
      <rect x="28" y="64" width="168" height="8" rx="4" fill="${trimColor}"/>
      <rect x="42" y="42" width="76" height="18" rx="5" fill="#06131d" opacity="0.85"/>
      <text x="80" y="54" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="10" fill="#35e58a">365 FLEET</text>
      <rect x="198" y="68" width="9" height="8" rx="2" fill="#fef08a"/>
      <rect x="20" y="62" width="6" height="14" rx="2" fill="#ef4444"/>
    `;
  } else {
    // Top North American Market: Velocity Cyan Mid-Engine V8 Supercar (Corvette C8 Z06 / Ford GT style)
    chassisMarkup = `
      <!-- Low-Profile Carbon Aero Wing -->
      <path d="M16 58 L10 46 H28 L24 58 Z" fill="#0f172a" stroke="${trimColor}" stroke-width="2"/>
      <!-- Mid-Engine Exotic Wedge Body -->
      <path d="M16 88 L18 58 L64 52 L96 36 H148 L182 56 L216 68 L214 88 H16 Z" fill="url(#body_${id})" stroke="#06131d" stroke-width="4.5" stroke-linejoin="round"/>
      <!-- Fighter-Jet Canopy & Carbon Side Scoop Boomerang -->
      <polygon points="78,50 100,40 144,40 174,55" fill="${windowTint}" stroke="${glassEdge}" stroke-width="1.5"/>
      <polygon points="94,58 134,58 122,78 82,74" fill="#0f172a" stroke="${trimColor}" stroke-width="1.5"/>
      <rect x="26" y="82" width="178" height="4" rx="2" fill="${trimColor}"/>
      <polygon points="192,62 214,69 210,74 190,67" fill="#fef08a"/>
      <rect x="16" y="62" width="10" height="6" rx="2" fill="#ef4444"/>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="124" viewBox="0 0 240 124" role="img" aria-label="${safeName} (${market})">
  <defs>
    <linearGradient id="body_${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${bodyTop}"/>
      <stop offset="100%" stop-color="${bodyBottom}"/>
    </linearGradient>
  </defs>
  <!-- Ground Contact Shadow -->
  <ellipse cx="118" cy="108" rx="98" ry="11" fill="#020810" opacity="0.40"/>
  ${chassisMarkup}
  <!-- Recessed Wheel Arches & Brake Calipers (for real rotating wheels) -->
  ${wheelPositions.map((w) => `
    <g transform="translate(${w.x}, ${w.y})">
      <circle r="${w.r + 3}" fill="#020617"/>
      <circle r="${w.r - 4}" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
      <!-- Glowing Brake Caliper -->
      <path d="M-${w.r - 5} -6 A ${w.r - 4} ${w.r - 4} 0 0 1 -${w.r - 5} 6" fill="none" stroke="${caliperColor}" stroke-width="4" stroke-linecap="round"/>
      ${includeStaticWheels ? `
        <circle r="${w.r}" fill="#0f172a" stroke="#020617" stroke-width="2"/>
        <circle r="${w.r - 5}" fill="none" stroke="${rimColor}" stroke-width="2.2"/>
        <g stroke="${rimColor}" stroke-width="2.5" stroke-linecap="round">
          <line x1="0" y1="-${w.r - 5}" x2="0" y2="${w.r - 5}"/>
          <line x1="-${(w.r - 5) * 0.86}" y1="-${(w.r - 5) * 0.5}" x2="${(w.r - 5) * 0.86}" y2="${(w.r - 5) * 0.5}"/>
          <line x1="${(w.r - 5) * 0.86}" y1="-${(w.r - 5) * 0.5}" x2="-${(w.r - 5) * 0.86}" y2="${(w.r - 5) * 0.5}"/>
        </g>
        <circle r="4" fill="#0f172a" stroke="${trimColor}" stroke-width="1.5"/>
      ` : ''}
    </g>
  `).join('')}
</svg>`;
}

const VEHICLE_FLEET_SPECS = [
  // Top Asian Market Cars
  {
    id: 'kei_hatch',
    name: 'JDM Kei RS Turbo Hatch',
    market: 'Asian Market',
    archetype: 'kei_hatch',
    bodyTop: '#f8fafc',
    bodyBottom: '#cbd5e1',
    trimColor: '#ef4444',
    rimColor: '#94a3b8',
    caliperColor: '#ef4444',
    worldFile: 'assets/World/vehicles/compact-car.svg',
    racerFiles: ['assets/vehicles/racer/starter-hatch.svg']
  },
  {
    id: 'bayside_gt',
    name: 'Asian Bayside Blue GT-Apex',
    market: 'Asian Market',
    archetype: 'jdm_coupe',
    bodyTop: '#60a5fa',
    bodyBottom: '#1d4ed8',
    trimColor: '#35e58a',
    rimColor: '#facc15',
    caliperColor: '#ef4444',
    worldFile: 'assets/World/vehicles/blue-car.svg',
    racerFiles: ['assets/vehicles/racer/compact-sport.svg']
  },
  {
    id: 'tokyo_taxi',
    name: 'Asian Crown Hybrid Taxi',
    market: 'Asian Market',
    archetype: 'asian_taxi',
    bodyTop: '#fde047',
    bodyBottom: '#ca8a04',
    trimColor: '#0f172a',
    rimColor: '#e2e8f0',
    caliperColor: '#f59e0b',
    worldFile: 'assets/World/vehicles/yellow-car.svg',
    racerFiles: ['assets/vehicles/racer/city-taxi.svg']
  },
  {
    id: 'jdm_rally_awd',
    name: 'JDM World Rally Blue AWD',
    market: 'Asian Market',
    archetype: 'jdm_rally',
    bodyTop: '#38bdf8',
    bodyBottom: '#0369a1',
    trimColor: '#facc15',
    rimColor: '#facc15',
    caliperColor: '#ef4444',
    worldFile: 'assets/World/vehicles/rally-car.svg',
    racerFiles: ['assets/vehicles/racer/rally-lite.svg']
  },
  {
    id: 'midnight_purple_gt',
    name: 'JDM Midnight Purple Touge GT',
    market: 'Asian Market',
    archetype: 'jdm_coupe',
    bodyTop: '#a855f7',
    bodyBottom: '#4c1d95',
    trimColor: '#38bdf8',
    rimColor: '#e2e8f0',
    caliperColor: '#35e58a',
    worldFile: 'assets/World/vehicles/jdm-gt-coupe.svg',
    racerFiles: ['assets/vehicles/racer/purple-race-coupe.svg']
  },
  // Top North American Market Cars & Trucks
  {
    id: 'na_raptor_4x4',
    name: 'North American 4x4 Baja Raptor Pickup',
    market: 'North American Market',
    archetype: 'na_raptor_truck',
    bodyTop: '#4ade80',
    bodyBottom: '#15803d',
    trimColor: '#ffd166',
    rimColor: '#94a3b8',
    caliperColor: '#ef4444',
    worldFile: 'assets/World/vehicles/green-truck.svg',
    racerFiles: ['assets/vehicles/racer/parts-pickup.svg', 'assets/vehicles/racer/off-road-truck.svg']
  },
  {
    id: 'na_v8_muscle',
    name: 'North American Crimson V8 Muscle',
    market: 'North American Market',
    archetype: 'na_muscle',
    bodyTop: '#f43f5e',
    bodyBottom: '#9f1239',
    trimColor: '#facc15',
    rimColor: '#e2e8f0',
    caliperColor: '#facc15',
    worldFile: 'assets/World/vehicles/na-muscle.svg',
    racerFiles: ['assets/vehicles/racer/mountain-courier.svg']
  },
  {
    id: 'na_baja_bronco',
    name: 'North American Bronco Trophy SUV',
    market: 'North American Market',
    archetype: 'na_baja_suv',
    bodyTop: '#fb923c',
    bodyBottom: '#c2410c',
    trimColor: '#fde047',
    rimColor: '#cbd5e1',
    caliperColor: '#ef4444',
    worldFile: 'assets/World/vehicles/baja-suv.svg',
    racerFiles: ['assets/vehicles/racer/desert-runner.svg']
  },
  {
    id: 'na_wrecker_tow',
    name: 'North American Heavy-Duty Wrecker Tow',
    market: 'North American Market',
    archetype: 'na_wrecker_tow',
    bodyTop: '#facc15',
    bodyBottom: '#d97706',
    trimColor: '#ef4444',
    rimColor: '#cbd5e1',
    caliperColor: '#ef4444',
    worldFile: 'assets/World/vehicles/tow-truck.svg',
    racerFiles: ['assets/vehicles/racer/export-support-van.svg']
  },
  {
    id: 'na_transit_van',
    name: 'North American 365 Fleet Transit Van',
    market: 'North American Market',
    archetype: 'na_fleet_van',
    bodyTop: '#38bdf8',
    bodyBottom: '#0284c7',
    trimColor: '#35e58a',
    rimColor: '#e2e8f0',
    caliperColor: '#38bdf8',
    worldFile: 'assets/World/vehicles/delivery-van.svg',
    racerFiles: ['assets/vehicles/racer/service-van.svg']
  },
  {
    id: 'na_mid_v8_supercar',
    name: 'North American Velocity Cyan V8 Supercar',
    market: 'North American Market',
    archetype: 'na_supercar',
    bodyTop: '#22d3ee',
    bodyBottom: '#0e7490',
    trimColor: '#35e58a',
    rimColor: '#facc15',
    caliperColor: '#ef4444',
    worldFile: 'assets/World/vehicles/super-car.svg',
    racerFiles: ['assets/vehicles/racer/super-coupe.svg']
  }
];

for (const spec of VEHICLE_FLEET_SPECS) {
  // World vehicle sprite (separate spinning wheels are attached in PixiJS, plus subtle inner hub so it also looks great in static previews)
  writeSvg(spec.worldFile, renderMarketVehicleSvg({ ...spec, includeStaticWheels: true }));
  for (const racerFile of spec.racerFiles) {
    writeSvg(racerFile, renderMarketVehicleSvg({ ...spec, includeStaticWheels: true }));
  }
}

// ============================================================================
// 4. REAL ASSET PEOPLE WITH 6-FRAME BIOMECHANICAL WALKING ANIMATION
// ============================================================================
const PEOPLE_SPECS = [
  { key: 'residentBlue', slug: 'resident-blue', jacket: '#2563eb', trim: '#60a5fa', pants: '#1e293b', skin: '#f5cba7', hair: '#1e293b', headgear: 'hair', prop: 'bag' },
  { key: 'residentGreen', slug: 'resident-green', jacket: '#16a34a', trim: '#4ade80', pants: '#1f2937', skin: '#e59866', hair: '#3e2723', headgear: 'cap', prop: 'phone' },
  { key: 'residentOrange', slug: 'resident-orange', jacket: '#ea580c', trim: '#fb923c', pants: '#1e293b', skin: '#f5cba7', hair: '#4a2311', headgear: 'hair', prop: 'cup' },
  { key: 'residentPurple', slug: 'resident-purple', jacket: '#7c3aed', trim: '#c084fc', pants: '#0f172a', skin: '#fad7a0', hair: '#111827', headgear: 'visor', prop: 'bag' },
  { key: 'mechanic', slug: 'mechanic', jacket: '#0284c7', trim: '#38bdf8', pants: '#0f172a', skin: '#f5cba7', hair: '#1e293b', headgear: 'cap', prop: 'wrench' },
  { key: 'driver', slug: 'driver', jacket: '#059669', trim: '#35e58a', pants: '#1e293b', skin: '#e59866', hair: '#111827', headgear: 'cap', prop: 'keyfob' },
  { key: 'courier', slug: 'courier', jacket: '#0d9488', trim: '#facc15', pants: '#1e293b', skin: '#f5cba7', hair: '#3e2723', headgear: 'cap', prop: 'parcel' },
  { key: 'towOperator', slug: 'tow-operator', jacket: '#d97706', trim: '#fef08a', pants: '#1e293b', skin: '#e59866', hair: '#1e293b', headgear: 'hardhat', prop: 'hook' },
  { key: 'racer', slug: 'racer', jacket: '#dc2626', trim: '#f8fafc', pants: '#111827', skin: '#f5cba7', hair: '#0f172a', headgear: 'helmet', prop: 'flag' },
  { key: 'customer', slug: 'customer', jacket: '#4f46e5', trim: '#818cf8', pants: '#1e293b', skin: '#fad7a0', hair: '#4a2311', headgear: 'hair', prop: 'bag' },
  { key: 'salesRep', slug: 'sales-rep', jacket: '#1d4ed8', trim: '#ffd166', pants: '#0f172a', skin: '#f5cba7', hair: '#1f2937', headgear: 'headset', prop: 'clipboard' },
  { key: 'tuner', slug: 'tuner', jacket: '#6d28d9', trim: '#35e58a', pants: '#0f172a', skin: '#fad7a0', hair: '#111827', headgear: 'headset', prop: 'laptop' }
];

// 6 biomechanical walk cycle poses (stride phase 0..5)
const WALK_POSES = [
  { lHip: -24, lKnee: 12, rHip: 22, rKnee: 18, lArm: 22, rArm: -24, bob: 0 },
  { lHip: -12, lKnee: 6,  rHip: 10, rKnee: 26, lArm: 10, rArm: -12, bob: -2.2 },
  { lHip: 6,   lKnee: 10, rHip: -10, rKnee: 14, lArm: -8, rArm: 10, bob: -1.0 },
  { lHip: 22,  lKnee: 18, rHip: -24, rKnee: 12, lArm: -24, rArm: 22, bob: 0 },
  { lHip: 10,  lKnee: 26, rHip: -12, rKnee: 6,  lArm: -12, rArm: 10, bob: -2.2 },
  { lHip: -10, lKnee: 14, rHip: 6,   rKnee: 10, lArm: 10, rArm: -8, bob: -1.0 }
];

function renderPersonSvg(spec, frameIndex = 0) {
  const pose = WALK_POSES[frameIndex % WALK_POSES.length];
  const bob = pose.bob;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="128" viewBox="0 0 64 88" role="img" aria-label="${spec.slug} walk ${frameIndex + 1}">
  <!-- Dynamic Ground Shadow -->
  <ellipse cx="32" cy="81" rx="${14 - Math.abs(bob)}" ry="5" fill="#020810" opacity="0.36"/>
  <g transform="translate(0, ${bob})">
    <!-- Back Arm (Left) -->
    <g transform="translate(30, 36) rotate(${pose.lArm})">
      <rect x="-4" y="0" width="8" height="19" rx="4" fill="${spec.jacket}" stroke="#06131d" stroke-width="2.2"/>
      <circle cx="0" cy="20" r="4" fill="${spec.skin}" stroke="#06131d" stroke-width="2"/>
    </g>
    <!-- Back Leg (Left) with Articulated Knee & Sneaker -->
    <g transform="translate(29, 52) rotate(${pose.lHip})">
      <rect x="-5" y="0" width="10" height="14" rx="4" fill="${spec.pants}" stroke="#06131d" stroke-width="2.2"/>
      <g transform="translate(0, 12) rotate(${pose.lKnee})">
        <rect x="-4.5" y="0" width="9" height="13" rx="4" fill="${spec.pants}" stroke="#06131d" stroke-width="2.2"/>
        <path d="M-5 11 H8 Q11 11 11 15 H-5 Z" fill="#f8fafc" stroke="#06131d" stroke-width="2"/>
      </g>
    </g>
    <!-- Front Leg (Right) with Articulated Knee & Sneaker -->
    <g transform="translate(35, 52) rotate(${pose.rHip})">
      <rect x="-5" y="0" width="10" height="14" rx="4" fill="${spec.pants}" stroke="#06131d" stroke-width="2.2"/>
      <g transform="translate(0, 12) rotate(${pose.rKnee})">
        <rect x="-4.5" y="0" width="9" height="13" rx="4" fill="${spec.pants}" stroke="#06131d" stroke-width="2.2"/>
        <path d="M-5 11 H8 Q11 11 11 15 H-5 Z" fill="${spec.trim}" stroke="#06131d" stroke-width="2"/>
      </g>
    </g>
    <!-- Stylized 2.5D Torso / Uniform Jacket -->
    <rect x="21" y="30" width="22" height="25" rx="8" fill="${spec.jacket}" stroke="#06131d" stroke-width="2.6"/>
    <!-- Hi-Vis / Uniform Trim & Badge -->
    <rect x="23" y="38" width="18" height="4" rx="2" fill="${spec.trim}"/>
    <rect x="29" y="31" width="6" height="12" rx="2" fill="#f8fafc" opacity="0.85"/>
    <!-- Head & Expressive Face -->
    <rect x="22" y="11" width="20" height="19" rx="9" fill="${spec.skin}" stroke="#06131d" stroke-width="2.6"/>
    <circle cx="36" cy="19" r="1.8" fill="#06131d"/>
    <circle cx="29" cy="19" r="1.8" fill="#06131d"/>
    <path d="M30 24 Q33 26.5 36 24" fill="none" stroke="#7c2d12" stroke-width="1.8" stroke-linecap="round"/>
    <!-- Role Headgear -->
    ${spec.headgear === 'helmet' ? `
      <path d="M20 22 Q20 8 32 8 Q44 8 44 22 Z" fill="${spec.jacket}" stroke="#06131d" stroke-width="2.5"/>
      <rect x="26" y="15" width="17" height="7" rx="3" fill="#38bdf8" stroke="#06131d" stroke-width="1.8"/>
    ` : spec.headgear === 'hardhat' ? `
      <path d="M20 15 Q20 7 32 7 Q44 7 44 15 Z" fill="#facc15" stroke="#06131d" stroke-width="2.4"/>
      <rect x="19" y="14" width="28" height="3.5" rx="1.5" fill="#f59e0b" stroke="#06131d" stroke-width="1.8"/>
    ` : spec.headgear === 'cap' ? `
      <path d="M21 15 Q22 8 32 8 Q42 8 42 15 Z" fill="${spec.jacket}" stroke="#06131d" stroke-width="2.4"/>
      <path d="M32 13 H47 Q49 13 48 16 H32 Z" fill="${spec.trim}" stroke="#06131d" stroke-width="1.8"/>
    ` : `
      <path d="M21 16 Q21 7 32 7 Q43 7 43 16 Q38 12 26 13 Z" fill="${spec.hair}" stroke="#06131d" stroke-width="2.2"/>
    `}
    <!-- Front Arm (Right) & Role Tool/Accessory -->
    <g transform="translate(34, 36) rotate(${pose.rArm})">
      <rect x="-4" y="0" width="8" height="19" rx="4" fill="${spec.jacket}" stroke="#06131d" stroke-width="2.2"/>
      <circle cx="0" cy="20" r="4" fill="${spec.skin}" stroke="#06131d" stroke-width="2"/>
      ${spec.prop === 'wrench' ? `
        <path d="M-2 20 L8 28" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
        <circle cx="9" cy="29" r="3.5" fill="none" stroke="#cbd5e1" stroke-width="2.2"/>
      ` : spec.prop === 'parcel' ? `
        <rect x="-4" y="16" width="14" height="11" rx="2" fill="#f59e0b" stroke="#06131d" stroke-width="2"/>
        <line x1="3" y1="16" x2="3" y2="27" stroke="#fef08a" stroke-width="2"/>
      ` : spec.prop === 'laptop' || spec.prop === 'clipboard' ? `
        <rect x="-2" y="16" width="12" height="9" rx="2" fill="#38bdf8" stroke="#06131d" stroke-width="2"/>
      ` : spec.prop === 'hook' ? `
        <rect x="-2" y="17" width="10" height="8" rx="2" fill="#ef4444" stroke="#06131d" stroke-width="1.8"/>
      ` : ''}
    </g>
  </g>
</svg>`;
}

for (const person of PEOPLE_SPECS) {
  writeSvg(`assets/World/people/${person.slug}.svg`, renderPersonSvg(person, 0));
  for (let i = 0; i < 6; i++) {
    const frameNum = String(i + 1).padStart(2, '0');
    writeSvg(`assets/World/people/animated/${person.slug}/walk-${frameNum}.svg`, renderPersonSvg(person, i));
  }
}

// ============================================================================
// 5. REAL POTHOLE CRATER, BROKEN-DOWN CAR & CITY PROPS
// ============================================================================
writeSvg('assets/World/props/pothole-crater.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="96" viewBox="0 0 140 96" role="img" aria-label="Road pothole crater">
  <!-- Radial Asphalt Stress Cracks -->
  <g stroke="#090d16" stroke-width="2.5" stroke-linecap="round" fill="none">
    <path d="M26 48 L8 34 M28 56 L12 72 M112 44 L132 30 M110 58 L128 74 M68 26 L62 10 M74 72 L82 88"/>
  </g>
  <!-- Jagged Outer Asphalt Rim -->
  <polygon points="22,48 34,32 58,26 88,28 112,38 118,54 102,68 74,74 42,70 24,60" fill="#334155" stroke="#0f172a" stroke-width="3.5" stroke-linejoin="round"/>
  <!-- Deep Crater Cavity & Muddy Water Reflection -->
  <polygon points="30,50 40,37 60,32 86,34 104,42 108,53 96,63 72,68 46,64" fill="#090d16"/>
  <ellipse cx="68" cy="52" rx="28" ry="11" fill="#1e293b"/>
  <ellipse cx="64" cy="50" rx="18" ry="6" fill="#38bdf8" opacity="0.38"/>
  <!-- Loose Gravel Stones & Hazard Barrier Stripe -->
  <circle cx="42" cy="48" r="3.5" fill="#64748b"/>
  <circle cx="88" cy="54" r="4" fill="#475569"/>
  <circle cx="54" cy="60" r="3" fill="#94a3b8"/>
  <rect x="38" y="14" width="64" height="10" rx="4" fill="#f97316" stroke="#06131d" stroke-width="2.5"/>
  <path d="M48 14 L42 24 M62 14 L56 24 M76 14 L70 24 M90 14 L84 24" stroke="#fef08a" stroke-width="3"/>
</svg>`);

writeSvg('assets/World/props/broken-car.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="120" viewBox="0 0 220 120" role="img" aria-label="Broken down car">
  <ellipse cx="110" cy="102" rx="86" ry="11" fill="#020810" opacity="0.42"/>
  <!-- Tilted Stranded Sedan Body -->
  <g transform="rotate(-4 110 80)">
    <path d="M24 88 L28 58 L58 54 L82 38 H138 L164 56 L196 62 L198 88 H24 Z" fill="#e11d48" stroke="#06131d" stroke-width="4.5" stroke-linejoin="round"/>
    <polygon points="66,54 84,42 134,42 156,55" fill="#0f293d" stroke="#7dd3fc" stroke-width="1.5"/>
    <!-- Popped Open Hood with Engine Bay Visible -->
    <path d="M162 56 L198 34 L202 40 L168 60 Z" fill="#be123c" stroke="#06131d" stroke-width="3.5"/>
    <rect x="168" y="56" width="22" height="10" rx="2" fill="#334155" stroke="#0f172a" stroke-width="2"/>
    <!-- Hazard Blinkers -->
    <circle cx="194" cy="68" r="6" fill="#facc15" stroke="#ef4444" stroke-width="2"/>
    <circle cx="26" cy="66" r="6" fill="#facc15" stroke="#ef4444" stroke-width="2"/>
    <!-- Wheels (Front Flat Tire) -->
    <g transform="translate(64, 90)">
      <circle r="15" fill="#0f172a" stroke="#020617" stroke-width="3"/>
      <circle r="8" fill="#cbd5e1"/>
    </g>
    <g transform="translate(158, 93) scale(1.12, 0.78)">
      <circle r="15" fill="#0f172a" stroke="#020617" stroke-width="3"/>
      <circle r="8" fill="#cbd5e1"/>
    </g>
  </g>
</svg>`);

writeSvg('assets/World/props/tree.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="150" viewBox="0 0 120 150" role="img" aria-label="City tree">
  <ellipse cx="60" cy="134" rx="36" ry="11" fill="#020810" opacity="0.35"/>
  <rect x="38" y="118" width="44" height="18" rx="6" fill="#475569" stroke="#0f172a" stroke-width="3"/>
  <rect x="44" y="121" width="32" height="6" rx="3" fill="#15803d"/>
  <rect x="52" y="82" width="16" height="42" rx="4" fill="#78350f" stroke="#0f172a" stroke-width="3"/>
  <circle cx="40" cy="68" r="26" fill="#15803d" stroke="#06131d" stroke-width="3"/>
  <circle cx="80" cy="68" r="24" fill="#166534" stroke="#06131d" stroke-width="3"/>
  <circle cx="60" cy="46" r="32" fill="#22c55e" stroke="#06131d" stroke-width="3"/>
  <circle cx="52" cy="36" r="14" fill="#4ade80" opacity="0.75"/>
</svg>`);

writeSvg('assets/World/props/streetlight.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="90" height="160" viewBox="0 0 90 160" role="img" aria-label="Streetlight">
  <ellipse cx="45" cy="144" rx="22" ry="8" fill="#ffd166" opacity="0.35"/>
  <rect x="36" y="132" width="18" height="14" rx="4" fill="#334155" stroke="#0f172a" stroke-width="3"/>
  <path d="M45 132 V28 Q45 14 62 14 H72" fill="none" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="70" cy="18" rx="12" ry="6" fill="#fef08a" stroke="#f59e0b" stroke-width="2"/>
  <circle cx="70" cy="22" r="18" fill="#ffd166" opacity="0.28"/>
</svg>`);

writeSvg('assets/World/terrain/road-intersection.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240" role="img" aria-label="Road intersection">
  <rect x="8" y="8" width="224" height="224" rx="22" fill="#192332" stroke="#334155" stroke-width="4"/>
  <path d="M8 8 H46 Q46 46 8 46 Z" fill="#475569" stroke="#facc15" stroke-width="3"/>
  <path d="M232 8 H194 Q194 46 232 46 Z" fill="#475569" stroke="#facc15" stroke-width="3"/>
  <path d="M8 232 H46 Q46 194 8 194 Z" fill="#475569" stroke="#facc15" stroke-width="3"/>
  <path d="M232 232 H194 Q194 194 232 194 Z" fill="#475569" stroke="#facc15" stroke-width="3"/>
  <line x1="56" y1="48" x2="184" y2="48" stroke="#f8fafc" stroke-width="4" opacity="0.85"/>
  <line x1="56" y1="192" x2="184" y2="192" stroke="#f8fafc" stroke-width="4" opacity="0.85"/>
  <line x1="48" y1="56" x2="48" y2="184" stroke="#f8fafc" stroke-width="4" opacity="0.85"/>
  <line x1="192" y1="56" x2="192" y2="184" stroke="#f8fafc" stroke-width="4" opacity="0.85"/>
  <g fill="#e2e8f0" opacity="0.88">
    <rect x="64" y="18" width="12" height="24" rx="2"/>
    <rect x="88" y="18" width="12" height="24" rx="2"/>
    <rect x="114" y="18" width="12" height="24" rx="2"/>
    <rect x="140" y="18" width="12" height="24" rx="2"/>
    <rect x="164" y="18" width="12" height="24" rx="2"/>
    <rect x="64" y="198" width="12" height="24" rx="2"/>
    <rect x="88" y="198" width="12" height="24" rx="2"/>
    <rect x="114" y="198" width="12" height="24" rx="2"/>
    <rect x="140" y="198" width="12" height="24" rx="2"/>
    <rect x="164" y="198" width="12" height="24" rx="2"/>
    <rect x="18" y="64" width="24" height="12" rx="2"/>
    <rect x="18" y="88" width="24" height="12" rx="2"/>
    <rect x="18" y="114" width="24" height="12" rx="2"/>
    <rect x="18" y="140" width="24" height="12" rx="2"/>
    <rect x="18" y="164" width="24" height="12" rx="2"/>
    <rect x="198" y="64" width="24" height="12" rx="2"/>
    <rect x="198" y="88" width="24" height="12" rx="2"/>
    <rect x="198" y="114" width="24" height="12" rx="2"/>
    <rect x="198" y="140" width="24" height="12" rx="2"/>
    <rect x="198" y="164" width="24" height="12" rx="2"/>
  </g>
  <circle cx="120" cy="120" r="14" fill="#0f172a" stroke="#475569" stroke-width="3"/>
  <circle cx="120" cy="120" r="8" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="4 3"/>
</svg>`);

const rrPath = path.join(rootDir, 'src/ui/roadRunnerRuntime.js');
if (fs.existsSync(rrPath)) {
  let rrSource = fs.readFileSync(rrPath, 'utf8');
  const vehiclesReplacement = `const VEHICLES = {
  hatchback: { label: 'JDM Kei Turbo Hatch', asset: 'hatchback', cls: 'starter', unlock: { coins: 0, parts: 0 }, speed: 1, accel: 1, fuel: 1, handling: 1, durability: 1, description: 'Asian Market Pearl White turbo kei hatch.' },
  greenCompact: { label: 'Bayside Blue GT-Apex', asset: 'greenCompact', cls: 'starter', unlock: { coins: 180, parts: 1 }, speed: 1.08, accel: 1.08, fuel: 0.96, handling: 1.05, durability: 0.95, description: 'Asian Market twin-turbo sport coupe.' },
  cityTaxi: { label: 'Tokyo Crown Hybrid Taxi', asset: 'cityTaxi', cls: 'utility', unlock: { coins: 260, parts: 2 }, speed: 1.0, accel: 1.0, fuel: 1.1, handling: 1.1, durability: 1.05, description: 'Asian Market nimble executive city taxi.' },
  pickup: { label: 'NA 4x4 Raptor Pickup', asset: 'pickup', cls: 'utility', unlock: { coins: 420, parts: 4 }, speed: 0.96, accel: 0.95, fuel: 1.2, handling: 1.08, durability: 1.22, description: 'North American crew-cab utility & trail truck.' },
  rallyLite: { label: 'WR-Blue Rally Legend', asset: 'rallyLite', cls: 'offroad', unlock: { coins: 640, parts: 6 }, speed: 1.05, accel: 1.05, fuel: 1.0, handling: 1.2, durability: 1.05, description: 'Asian Market AWD turbo rally sedan with gold rims.' },
  serviceVan: { label: 'NA 365 Fleet Transit Van', asset: 'serviceVan', cls: 'endurance', unlock: { coins: 820, parts: 8 }, speed: 0.92, accel: 0.90, fuel: 1.35, handling: 1.04, durability: 1.35, description: 'North American high-roof parts & service van.' },
  desertRunner: { label: 'NA Bronco Trophy SUV', asset: 'desertRunner', cls: 'endurance', unlock: { coins: 1050, parts: 11 }, speed: 1.1, accel: 1.05, fuel: 1.15, handling: 1.25, durability: 1.3, description: 'North American desert raid 4x4 SUV.' },
  offroad: { label: 'NA Heavy Duty Baja Truck', asset: 'offroad', cls: 'offroad', unlock: { coins: 1300, parts: 14 }, speed: 1, accel: 1, fuel: 1.18, handling: 1.32, durability: 1.45, description: 'North American lifted off-road pickup.' },
  exportVan: { label: 'NA Heavy Wrecker Tow Rig', asset: 'exportVan', cls: 'endurance', unlock: { coins: 1650, parts: 18 }, speed: 0.98, accel: 0.95, fuel: 1.45, handling: 1.1, durability: 1.5, description: 'North American heavy-duty recovery wrecker.' },
  race: { label: 'Midnight Purple Touge GT', asset: 'race', cls: 'race', unlock: { coins: 2050, parts: 22 }, speed: 1.24, accel: 1.18, fuel: 0.90, handling: 1.08, durability: 0.85, description: 'Asian Market widebody street & track fastback.' },
  mountainCourier: { label: 'NA Crimson V8 Muscle', asset: 'mountainCourier', cls: 'offroad', unlock: { coins: 2600, parts: 28 }, speed: 1.12, accel: 1.1, fuel: 1.25, handling: 1.35, durability: 1.4, description: 'North American supercharged V8 muscle coupe.' },
  superCoupe: { label: 'NA Velocity V8 Supercar', asset: 'superCoupe', cls: 'race', unlock: { coins: 3400, parts: 36 }, speed: 1.35, accel: 1.3, fuel: 0.85, handling: 1.15, durability: 0.9, description: 'North American mid-engine V8 flagship supercar.' }
};`;
  rrSource = rrSource.replace(/const VEHICLES = \{[\s\S]*?\r?\n\};/, vehiclesReplacement);
  rrSource = rrSource.replace(
    "hatchback: '/assets/race/cars/starter_compact.png',",
    "legacyStarterCompact: '/assets/race/cars/starter_compact.png',"
  );
  fs.writeFileSync(rrPath, rrSource, 'utf8');
}

console.log('Generated 40 Nano Banana 2 building SVGs, 11 Asian & NA vehicles, 3 spinning wheels, 84 walking people SVGs, and real pothole/breakdown props.');
