import * as THREE from 'three';

const MAT_CACHE = {};
const PAINT_MAT_CACHE = {};
const MARQUEE_TEX_CACHE = {};

function getMat(color, opts = {}) {
  const key = `${color}_${opts.roughness ?? 0.36}_${opts.metalness ?? 0.14}_${opts.emissive ?? 0}_${opts.emissiveIntensity ?? 0}_${opts.transparent ? opts.opacity : 1}`;
  if (!MAT_CACHE[key]) {
    MAT_CACHE[key] = new THREE.MeshStandardMaterial({
      color,
      roughness: opts.roughness ?? 0.36,
      metalness: opts.metalness ?? 0.14,
      emissive: opts.emissive ?? 0x000000,
      emissiveIntensity: opts.emissiveIntensity ?? 0,
      transparent: Boolean(opts.transparent),
      opacity: opts.opacity ?? 1
    });
  }
  return MAT_CACHE[key];
}

function getPaintMat(color, opts = {}) {
  const key = `paint_${color}_${opts.roughness ?? 0.16}_${opts.metalness ?? 0.46}_${opts.clearcoat ?? 1.0}`;
  if (!PAINT_MAT_CACHE[key]) {
    PAINT_MAT_CACHE[key] = new THREE.MeshPhysicalMaterial({
      color,
      roughness: opts.roughness ?? 0.16,
      metalness: opts.metalness ?? 0.46,
      clearcoat: opts.clearcoat ?? 1.0,
      clearcoatRoughness: opts.clearcoatRoughness ?? 0.05,
      reflectivity: 0.92,
      emissive: opts.emissive ?? 0x000000,
      emissiveIntensity: opts.emissiveIntensity ?? 0
    });
  }
  return PAINT_MAT_CACHE[key];
}

function makeMarqueeSignTexture(titleText, subText = '365 AUTO WORLD', accentHex = 0x35e58a) {
  const key = `${titleText}_${subText}_${accentHex}`;
  if (MARQUEE_TEX_CACHE[key]) return MARQUEE_TEX_CACHE[key];

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const hexStr = `#${Number(accentHex).toString(16).padStart(6, '0')}`;

  // Deep illuminated architectural sign background
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, '#091e2c');
  grad.addColorStop(0.5, '#04111b');
  grad.addColorStop(1, '#081b28');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 128);

  // Outer glowing neon tube frame
  ctx.strokeStyle = hexStr;
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 112);

  // Subtle inner pinstripe
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, 476, 92);

  // Left 365 Emblem Badge
  ctx.fillStyle = hexStr;
  ctx.beginPath();
  ctx.roundRect(26, 28, 92, 72, 14);
  ctx.fill();

  ctx.fillStyle = '#04111b';
  ctx.font = '900 34px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('365', 72, 66);

  // Main Marquee Title
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = hexStr;
  ctx.shadowBlur = 12;
  ctx.font = '900 40px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(String(titleText || '365 GARAGE').toUpperCase(), 304, 54);

  // Subtitle / Department Line
  ctx.shadowBlur = 0;
  ctx.fillStyle = hexStr;
  ctx.font = '800 18px Arial, sans-serif';
  ctx.fillText(String(subText || 'PREMIER AUTO SERVICE').toUpperCase(), 304, 92);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  MARQUEE_TEX_CACHE[key] = tex;
  return tex;
}

export const HITBOX_MAT = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0,
  depthWrite: false
});

export function makeLabelSprite(lines, {
  bgColor = 'rgba(6, 19, 29, 0.92)',
  borderColor = '#38bdf8',
  textColor = '#f8fafc',
  subColor = '#fef08a',
  width = 160,
  height = 42,
  scale = 0.38,
  clickable = false
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  const r = Math.min(height / 2, 14);
  ctx.fillStyle = bgColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(3, 3, width - 6, height - 6, r);
  ctx.fill();
  ctx.stroke();

  const arr = Array.isArray(lines) ? lines : [String(lines)];
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (arr.length === 1) {
    ctx.fillStyle = textColor;
    ctx.font = '900 12.5px Arial, sans-serif';
    ctx.fillText(arr[0], width / 2, height / 2 + 0.5);
  } else {
    ctx.fillStyle = textColor;
    ctx.font = '900 11px Arial, sans-serif';
    ctx.fillText(arr[0], width / 2, height * 0.35);
    ctx.fillStyle = subColor;
    ctx.font = '800 9.5px Arial, sans-serif';
    ctx.fillText(arr[1], width / 2, height * 0.70);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(width * scale, height * scale, 1);
  sprite.renderOrder = 999;
  if (!clickable) {
    sprite.raycast = () => {};
  }
  return sprite;
}

// ============================================================================
// 1. TRUE 3D TOON TREE & STREET PROPS
// ============================================================================
export function create3DTree(variant = 0) {
  const group = new THREE.Group();

  const planter = new THREE.Mesh(
    new THREE.CylinderGeometry(10.5, 12.5, 4, 12),
    getMat(0x94a3b8, { roughness: 0.65 })
  );
  planter.position.y = 2;
  planter.receiveShadow = true;
  group.add(planter);

  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(9, 9, 4.4, 12),
    getMat(0x3f2e21, { roughness: 0.9 })
  );
  soil.position.y = 2.1;
  group.add(soil);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(3.0, 5.0, 22, 8),
    getMat(0x78350f, { roughness: 0.8 })
  );
  trunk.position.y = 12;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  const crown = new THREE.Group();
  crown.position.y = 26;
  const greens = variant % 2 === 0
    ? [0x22c55e, 0x16a34a, 0x4ade80, 0x15803d]
    : [0x10b981, 0x059669, 0x34d399, 0x047857];
  const puffs = [
    { x: 0, y: 4, z: 0, r: 14.5, c: greens[0] },
    { x: -8.5, y: -2, z: 5, r: 10.5, c: greens[1] },
    { x: 8.5, y: -1, z: 4, r: 11, c: greens[2] },
    { x: 0, y: -2, z: -8, r: 10.5, c: greens[3] },
    { x: -4.5, y: 9.5, z: -2, r: 10, c: greens[2] },
    { x: 5.5, y: 8.5, z: 2, r: 9.5, c: greens[0] }
  ];
  for (const p of puffs) {
    const puff = new THREE.Mesh(
      new THREE.IcosahedronGeometry(p.r, 1),
      getMat(p.c, { roughness: 0.42 })
    );
    puff.position.set(p.x, p.y, p.z);
    puff.castShadow = true;
    puff.receiveShadow = true;
    crown.add(puff);
  }
  group.add(crown);
  group._crown = crown;
  return group;
}

export function create3DStreetlight() {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 4.0, 5.5, 8), getMat(0x334155, { metalness: 0.5, roughness: 0.3 }));
  base.position.y = 2.75;
  group.add(base);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.7, 36, 8), getMat(0x475569, { metalness: 0.6, roughness: 0.3 }));
  pole.position.y = 20;
  pole.castShadow = true;
  group.add(pole);

  const arm = new THREE.Mesh(new THREE.BoxGeometry(11, 1.5, 1.5), getMat(0x475569, { metalness: 0.6 }));
  arm.position.set(4.5, 37.5, 0);
  group.add(arm);

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(3.0, 10, 10),
    getMat(0xfef08a, { emissive: 0xfacc15, emissiveIntensity: 1.4 })
  );
  bulb.position.set(9.5, 36, 0);
  group.add(bulb);

  return group;
}

// ============================================================================
// 2. SCULPTED 3D ICONIC VEHICLES (SKYLINE, MUSTANG, PAJERO, SILVIA, 180SX, 300ZX, RX-7, SUPERCAR)
// ============================================================================
export const VEHICLE_SPECS = {
  // Iconic JDM Legends, American Muscle, Off-Road 4x4s & Exotic Supercars
  skylineR34:      { model: 'skyline',  name: 'R34 Skyline GT-R',     market: 'JDM Legend',      engine: '2.6L Twin-Turbo I6', hp: 520, drivetrain: 'AWD ATTESA', body: 0x0284c7, roof: 0x0369a1, trim: 0xe2e8f0, rim: 0xd97706, spoiler: 'gt',      fmic: true,  stripe: 'side',  afterburners: true, hoodVents: true },
  mustangFastback: { model: 'mustang',  name: 'GT500 Fastback V8',    market: 'NA Muscle',       engine: '5.2L Supercharged V8', hp: 760, drivetrain: 'RWD Tremec', body: 0xdc2626, roof: 0xb91c1c, trim: 0x111827, rim: 0xf8fafc, spoiler: 'duck',    scoop: true, stripe: 'twin',  hoodVents: true },
  pajeroEvo:       { model: 'pajero',   name: 'Pajero Evo 4x4',       market: 'Dakar 4x4',       engine: '3.5L MIVEC V6',      hp: 280, drivetrain: '4WD Super-Select', body: 0xf8fafc, roof: 0xe2e8f0, trim: 0xef4444, rim: 0xfacc15, bullbar: true,      spareTire: true, roofRack: true, scoop: true },
  silviaS15:       { model: 'silvia',   name: 'Silvia S15 Spec-R',    market: 'JDM Touge Drift', engine: '2.0L SR20DET Turbo', hp: 380, drivetrain: 'RWD Helical LSD', body: 0x10b981, roof: 0x059669, trim: 0x111827, rim: 0xfacc15, spoiler: 'drift',   carbonHood: true, underglow: 0x22d3ee, fmic: true, hoodVents: true },
  sx180:           { model: 'sx180',    name: '180SX Type-X Kouki',   market: 'JDM Street',      engine: '2.0L Turbo Fastback', hp: 340, drivetrain: 'RWD 5-Speed', body: 0x7c3aed, roof: 0x111827, trim: 0x22d3ee, rim: 0xe2e8f0, spoiler: 'hoop',    popups: true, underglow: 0xa855f7 },
  zx300:           { model: 'zx300',    name: '300ZX Twin-Turbo',     market: 'JDM Fairlady Z32',engine: '3.0L VG30DETT V6',   hp: 410, drivetrain: 'RWD HICAS', body: 0xf97316, roof: 0x0f172a, trim: 0x1e293b, rim: 0xfef08a, spoiler: 'flush',   ttop: true, fmic: true },
  rx7Spirit:       { model: 'rx7',      name: 'RX-7 FD3S Rotary',     market: 'JDM Rotary Icon', engine: '1.3L 13B-REW Twin-Rotor', hp: 430, drivetrain: 'RWD Lightweight', body: 0xfacc15, roof: 0xeab308, trim: 0x111827, rim: 0x334155, spoiler: 'hoop',    rotaryFlame: true, carbonHood: true, hoodVents: true },
  supraMk4:        { model: 'supra',    name: 'Aero-Top GT90',        market: 'JDM Highway King',engine: '3.0L 2JZ-GTE Twin-Turbo', hp: 620, drivetrain: 'RWD 6-Speed', body: 0xf43f5e, roof: 0xe11d48, trim: 0x111827, rim: 0xe2e8f0, spoiler: 'hoop',    fmic: true, hoodVents: true },
  superCar:        { model: 'supercar', name: 'Apex V10 Supercar',    market: 'Exotic Track',    engine: '5.2L Naturally Aspirated V10', hp: 640, drivetrain: 'AWD Mid-Engine', body: 0x06b6d4, roof: 0x0f172a, trim: 0x22d3ee, rim: 0x38bdf8, spoiler: 'gt',      louvers: true, underglow: 0x38bdf8 },
  // Map legacy keys seamlessly to these sculpted 3D iconic models
  blueCar:         { model: 'skyline',  name: 'R34 Skyline GT-R',     market: 'JDM Legend',      engine: '2.6L Twin-Turbo I6', hp: 520, drivetrain: 'AWD ATTESA', body: 0x0284c7, roof: 0x0369a1, trim: 0xe2e8f0, rim: 0xfacc15, spoiler: 'gt',      fmic: true,  stripe: 'side',  afterburners: true, hoodVents: true },
  jdmGtCoupe:      { model: 'sx180',    name: '180SX Type-X Kouki',   market: 'JDM Street',      engine: '2.0L Turbo Fastback', hp: 340, drivetrain: 'RWD 5-Speed', body: 0x7c3aed, roof: 0x111827, trim: 0x22d3ee, rim: 0xe2e8f0, spoiler: 'hoop',    popups: true, underglow: 0x22d3ee },
  naMuscle:        { model: 'mustang',  name: 'GT500 Fastback V8',    market: 'NA Muscle',       engine: '5.2L Supercharged V8', hp: 760, drivetrain: 'RWD Tremec', body: 0xdc2626, roof: 0xb91c1c, trim: 0x111827, rim: 0xf8fafc, spoiler: 'duck',    scoop: true, stripe: 'twin',  hoodVents: true },
  yellowCar:       { model: 'rx7',      name: 'RX-7 FD3S Rotary',     market: 'JDM Rotary Icon', engine: '1.3L 13B-REW Twin-Rotor', hp: 430, drivetrain: 'RWD Lightweight', body: 0xfacc15, roof: 0xeab308, trim: 0x111827, rim: 0x1e293b, spoiler: 'hoop',    rotaryFlame: true },
  compactCar:      { model: 'pajero',   name: 'Pajero Evo 4x4',       market: 'Dakar 4x4',       engine: '3.5L MIVEC V6',      hp: 280, drivetrain: '4WD Super-Select', body: 0xf8fafc, roof: 0xe2e8f0, trim: 0xef4444, rim: 0xfacc15, bullbar: true,      spareTire: true, roofRack: true },
  rallyCar:        { model: 'silvia',   name: 'Silvia S15 Spec-R',    market: 'JDM Touge Drift', engine: '2.0L SR20DET Turbo', hp: 380, drivetrain: 'RWD Helical LSD', body: 0x10b981, roof: 0x059669, trim: 0x111827, rim: 0xfacc15, spoiler: 'drift',   carbonHood: true, fmic: true, hoodVents: true },
  greenTruck:      { model: 'pickup',   name: 'Baja Raptor 4x4',      market: 'NA Trophy Truck', engine: '3.5L Twin-Turbo EcoV6', hp: 450, drivetrain: '4x4 Long-Travel', body: 0x16a34a, roof: 0x15803d, trim: 0x111827, rim: 0xfacc15, bullbar: true,      bedSpare: true, scoop: true },
  bajaSuv:         { model: 'zx300',    name: '300ZX Twin-Turbo',     market: 'JDM Fairlady Z32',engine: '3.0L VG30DETT V6',   hp: 410, drivetrain: 'RWD HICAS', body: 0xf97316, roof: 0x0f172a, trim: 0x111827, rim: 0xf8fafc, spoiler: 'flush',   ttop: true },
  deliveryVan:     { model: 'van',      name: '365 Parts Sprinter',   market: 'Commercial Fleet',engine: '3.0L Turbo-Diesel V6', hp: 220, drivetrain: 'RWD Dually', body: 0x0284c7, roof: 0xf8fafc, trim: 0xfacc15, rim: 0xe2e8f0 },
  towTruck:        { model: 'tow',      name: '365 Heavy Wrecker',    market: 'Recovery Rig',    engine: '6.7L Cummins Turbo-Diesel', hp: 480, drivetrain: '4x4 Heavy-Duty', body: 0xf59e0b, roof: 0xd97706, trim: 0x991b1b, rim: 0xe2e8f0 }
};

function make3DWheel(radius, width, rimColor, offroad = false) {
  const wheelGroup = new THREE.Group();

  // Outer rubber tire with shoulder bevel + tread ring
  const tire = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, width, offroad ? 14 : 24),
    getMat(0x0f172a, { roughness: 0.72, metalness: 0.12 })
  );
  tire.rotation.x = Math.PI / 2;
  tire.castShadow = true;
  wheelGroup.add(tire);

  // Sidewall performance tire lettering ring
  const sidewallRing = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.84, radius * 0.84, width + 0.14, 20),
    getMat(0x334155, { roughness: 0.5, metalness: 0.2 })
  );
  sidewallRing.rotation.x = Math.PI / 2;
  wheelGroup.add(sidewallRing);

  // Deep-dish polished alloy lip & barrel
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.72, radius * 0.72, width + 0.38, 18),
    getMat(0xe2e8f0, { roughness: 0.12, metalness: 0.92 })
  );
  barrel.rotation.x = Math.PI / 2;
  wheelGroup.add(barrel);

  // Recessed dark cross-drilled brake rotor + Red Brembo caliper inside wheel
  const rotor = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.52, radius * 0.52, width + 0.48, 14),
    getMat(0x475569, { roughness: 0.28, metalness: 0.82 })
  );
  rotor.rotation.x = Math.PI / 2;
  wheelGroup.add(rotor);

  // 6-Spoke Rays TE37 / Volk Racing Style Concave Alloy Wheel Face
  const spokeGeo = new THREE.BoxGeometry(radius * 1.28, radius * 0.19, width + 0.72);
  const spokeMat = getMat(rimColor, { roughness: 0.14, metalness: 0.88 });
  for (let i = 0; i < 3; i++) {
    const sp = new THREE.Mesh(spokeGeo, spokeMat);
    sp.rotation.z = (i * Math.PI) / 3;
    wheelGroup.add(sp);
  }

  // Anodized Red Center Lug Cap
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.19, radius * 0.19, width + 0.90, 10),
    getMat(0xef4444, { roughness: 0.18, metalness: 0.78 })
  );
  cap.rotation.x = Math.PI / 2;
  wheelGroup.add(cap);

  return wheelGroup;
}

const LOWER_BODY_GEO_CACHE = {};
const CABIN_GEO_CACHE = {};

// Contoured Lower Widebody Chassis & Beltline (full width with sculpted nose, hood slope & rear haunches)
function getLowerBodyGeometry(model, length, width, baseH) {
  const key = `lower_${model}_${length}_${width}_${baseH}`;
  if (LOWER_BODY_GEO_CACHE[key]) return LOWER_BODY_GEO_CACHE[key];

  const hl = length / 2;
  const shape = new THREE.Shape();

  if (model === 'supercar') {
    shape.moveTo(-hl, 1.3);
    shape.lineTo(hl + 0.8, 0.9);
    shape.lineTo(hl + 1.5, 3.6);
    shape.lineTo(hl * 0.46, baseH + 0.4);
    shape.lineTo(-hl * 0.45, baseH + 0.9);
    shape.lineTo(-hl * 0.95, baseH + 0.5);
    shape.lineTo(-hl, 4.8);
    shape.closePath();
  } else if (model === 'mustang') {
    // Aggressive Shark-Nose American Muscle Lower Body
    shape.moveTo(-hl, 1.7);
    shape.lineTo(hl + 0.6, 1.4);
    shape.lineTo(hl + 1.2, baseH + 0.6);
    shape.lineTo(hl * 0.36, baseH + 1.1);
    shape.lineTo(-hl * 0.42, baseH + 1.0);
    shape.lineTo(-hl * 0.94, baseH + 0.8);
    shape.lineTo(-hl, 2.4);
    shape.closePath();
  } else if (model === 'pajero' || model === 'pickup' || model === 'tow') {
    // High-Clearance Off-Road 4x4 / Heavy Utility Lower Chassis
    shape.moveTo(-hl, 2.4);
    shape.lineTo(hl, 2.2);
    shape.lineTo(hl + 0.8, baseH + 0.8);
    shape.lineTo(hl * 0.42, baseH + 1.2);
    shape.lineTo(-hl * 0.96, baseH + 1.0);
    shape.lineTo(-hl, 2.8);
    shape.closePath();
  } else if (model === 'van') {
    shape.moveTo(-hl, 2.0);
    shape.lineTo(hl, 1.8);
    shape.lineTo(hl + 0.6, baseH + 1.0);
    shape.lineTo(-hl, baseH + 1.0);
    shape.closePath();
  } else {
    // Sculpted JDM Tuner Lower Body (Skyline R34 / Silvia S15 / 180SX / 300ZX / RX-7 / Supra)
    const noseH = model === 'sx180' || model === 'rx7' || model === 'zx300' ? 5.0 : 6.2;
    shape.moveTo(-hl, 1.5);
    shape.lineTo(hl + 0.6, 1.2);
    shape.lineTo(hl + 1.1, noseH);
    shape.lineTo(hl * 0.38, baseH + 0.9);
    shape.lineTo(-hl * 0.46, baseH + 1.1);
    shape.lineTo(-hl * 0.94, baseH + 0.7);
    shape.lineTo(-hl, 2.2);
    shape.closePath();
  }

  const extrudeDepth = width - 1.8;
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: extrudeDepth,
    bevelEnabled: true,
    bevelThickness: 1.25,
    bevelSize: 1.05,
    bevelSegments: 4,
    curveSegments: 10
  });
  geo.translate(0, 0, -extrudeDepth / 2);
  LOWER_BODY_GEO_CACHE[key] = geo;
  return geo;
}

// Tapered 3D Upper Cabin Greenhouse (narrower than lower fenders for authentic 3D tumblehome & shoulder line!)
function getCabinGeometry(model, length, width, baseH, topH) {
  const key = `cabin_${model}_${length}_${width}_${baseH}_${topH}`;
  if (CABIN_GEO_CACHE[key]) return CABIN_GEO_CACHE[key];

  const hl = length / 2;
  const shape = new THREE.Shape();

  if (model === 'supercar') {
    shape.moveTo(hl * 0.44, baseH - 0.2);
    shape.lineTo(hl * 0.08, topH);
    shape.lineTo(-hl * 0.42, topH - 0.5);
    shape.lineTo(-hl * 0.86, baseH + 0.2);
    shape.closePath();
  } else if (model === 'mustang' || model === 'sx180' || model === 'rx7' || model === 'supra') {
    // Sweeping Fastback / Liftback Cabin
    shape.moveTo(hl * 0.36, baseH + 0.2);
    shape.lineTo(hl * 0.05, topH);
    shape.lineTo(-hl * 0.34, topH - 0.3);
    shape.lineTo(-hl * 0.88, baseH + 0.3);
    shape.closePath();
  } else if (model === 'pajero') {
    // Dakar Rally Wide-Quarter SUV Cabin
    shape.moveTo(hl * 0.40, baseH + 0.4);
    shape.lineTo(hl * 0.16, topH);
    shape.lineTo(-hl * 0.82, topH);
    shape.lineTo(-hl * 0.94, baseH + 0.4);
    shape.closePath();
  } else if (model === 'pickup') {
    // Crew-Cab Pickup Greenhouse
    shape.moveTo(hl * 0.42, baseH + 0.4);
    shape.lineTo(hl * 0.20, topH);
    shape.lineTo(-hl * 0.18, topH);
    shape.lineTo(-hl * 0.24, baseH + 0.4);
    shape.closePath();
  } else if (model === 'tow') {
    // Wrecker Cab Greenhouse
    shape.moveTo(hl * 0.46, baseH + 0.5);
    shape.lineTo(hl * 0.30, topH);
    shape.lineTo(-hl * 0.04, topH);
    shape.lineTo(-hl * 0.08, baseH + 0.4);
    shape.closePath();
  } else if (model === 'van') {
    shape.moveTo(hl * 0.86, baseH + 0.2);
    shape.lineTo(hl * 0.58, topH);
    shape.lineTo(-hl * 0.92, topH);
    shape.lineTo(-hl * 0.96, baseH + 0.2);
    shape.closePath();
  } else {
    // Iconic JDM Notchback / GT Coupe Cabin (Skyline R34 / Silvia S15 / 300ZX)
    shape.moveTo(hl * 0.36, baseH + 0.1);
    shape.lineTo(hl * 0.10, topH);
    shape.lineTo(-hl * 0.34, topH - 0.2);
    shape.lineTo(-hl * 0.66, baseH + 0.2);
    shape.closePath();
  }

  const cabWidth = model === 'van' ? width - 2.2 : width * 0.78;
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: cabWidth,
    bevelEnabled: true,
    bevelThickness: 1.05,
    bevelSize: 0.90,
    bevelSegments: 4,
    curveSegments: 10
  });
  geo.translate(0, 0, -cabWidth / 2);
  CABIN_GEO_CACHE[key] = geo;
  return geo;
}

export function create3DVehicle({ assetKey = 'skylineR34', direction = 'east', towTargetKey = '', showBadge = false } = {}) {
  const spec = VEHICLE_SPECS[assetKey] || VEHICLE_SPECS.skylineR34;
  const model = spec.model || 'skyline';
  const root = new THREE.Group();
  const chassis = new THREE.Group();
  root.add(chassis);

  const isHeavy = model === 'pickup' || model === 'pajero' || model === 'van' || model === 'tow';
  const length = model === 'tow' || model === 'pickup' ? 49 : model === 'van' || model === 'pajero' ? 45.5 : 43.5;
  const width = isHeavy ? 21.8 : 20.2;
  const wheelR = model === 'pickup' || model === 'pajero' || model === 'tow' ? 5.6 : 4.6;
  const wheelW = isHeavy ? 4.3 : 3.8;
  const baseH = isHeavy ? 8.8 : 7.0;
  const topH = model === 'van' ? 17.5 : model === 'pajero' || model === 'pickup' || model === 'tow' ? 15.8 : model === 'supercar' || model === 'zx300' ? 11.9 : 13.0;

  const paintMat = getPaintMat(spec.body, { roughness: 0.15, metalness: 0.48, clearcoat: 1.0 });
  const roofPaintMat = getPaintMat(spec.roof || spec.body, { roughness: 0.16, metalness: 0.44, clearcoat: 1.0 });

  // 1. 4 Independent Spinning 3D Wheels + Sculpted Widebody Fender Flares & Wheel Well Liners
  const wheels = [];
  const wx = length * 0.31;
  const wz = width * 0.48;
  const archMat = isHeavy ? getMat(0x111827, { roughness: 0.35, metalness: 0.25 }) : paintMat;
  const wellMat = getMat(0x090d16, { roughness: 0.9 });

  for (const [x, z] of [[-wx, wz], [wx, wz], [-wx, -wz], [wx, -wz]]) {
    const w = make3DWheel(wheelR, wheelW, spec.rim, isHeavy);
    w.position.set(x, wheelR, z);
    root.add(w);
    wheels.push(w);

    // Sculpted 3D widebody fender flare over each wheel
    const arch = new THREE.Mesh(
      new THREE.CylinderGeometry(wheelR + 1.45, wheelR + 1.45, 3.6, 16, 1, false, 0, Math.PI),
      archMat
    );
    arch.rotation.x = Math.PI / 2;
    arch.rotation.y = Math.PI / 2;
    arch.position.set(x, wheelR + 0.65, z > 0 ? z - 0.7 : z + 0.7);
    chassis.add(arch);

    // Dark recessed wheel well backing
    const well = new THREE.Mesh(
      new THREE.CylinderGeometry(wheelR + 0.6, wheelR + 0.6, 2.2, 12, 1, false, 0, Math.PI),
      wellMat
    );
    well.rotation.x = Math.PI / 2;
    well.rotation.y = Math.PI / 2;
    well.position.set(x, wheelR + 0.4, z > 0 ? z - 1.4 : z + 1.4);
    chassis.add(well);
  }

  // 2. Two-Tier Contoured 3D Body Shell (Wide Lower Beltline + Tapered Greenhouse Cabin with Clearcoat Paint)
  const lowerGeo = getLowerBodyGeometry(model, length, width, baseH);
  const lowerMesh = new THREE.Mesh(lowerGeo, paintMat);
  lowerMesh.position.y = wheelR * 0.46;
  lowerMesh.castShadow = true;
  lowerMesh.receiveShadow = true;
  chassis.add(lowerMesh);

  const cabinGeo = getCabinGeometry(model, length, width, baseH, topH);
  const cabinMesh = new THREE.Mesh(cabinGeo, roofPaintMat);
  cabinMesh.position.y = wheelR * 0.46;
  cabinMesh.castShadow = true;
  cabinMesh.receiveShadow = true;
  chassis.add(cabinMesh);

  // 3. Sculpted 3D Hood Power Bulge, Aero Side Skirts, Door Seams/Handles & Front Splitter
  if (model !== 'van') {
    const hoodDome = new THREE.Mesh(
      new THREE.BoxGeometry(length * 0.28, 1.15, width * 0.56),
      spec.carbonHood ? getMat(0x111827, { roughness: 0.24, metalness: 0.55 }) : paintMat
    );
    hoodDome.position.set(length * 0.29, wheelR * 0.46 + baseH + 0.7, 0);
    hoodDome.rotation.z = -0.07;
    chassis.add(hoodDome);
  }

  if (spec.hoodVents) {
    const ventMat = getMat(0x090d16, { roughness: 0.4 });
    for (const vz of [-width * 0.16, width * 0.16]) {
      const vent = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.9, 2.2), ventMat);
      vent.position.set(length * 0.30, wheelR * 0.46 + baseH + 1.0, vz);
      vent.rotation.z = -0.07;
      chassis.add(vent);
    }
  }

  // 3D Door Panel Seams & Flush Door Handles on both sides
  const handleMat = getMat(0x0f172a, { roughness: 0.25, metalness: 0.7 });
  for (const side of [-1, 1]) {
    const handle = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.85, 0.8), handleMat);
    handle.position.set(-length * 0.05, wheelR * 0.46 + baseH * 0.86, side * (width * 0.50));
    const doorCharacterLine = new THREE.Mesh(
      new THREE.BoxGeometry(length * 0.46, 0.75, 0.65),
      getMat(spec.trim, { roughness: 0.25, metalness: 0.5 })
    );
    doorCharacterLine.position.set(0, wheelR * 0.46 + baseH * 0.64, side * (width * 0.505));
    chassis.add(handle, doorCharacterLine);
  }

  const skirtMat = getMat(spec.trim, { roughness: 0.28, metalness: 0.4 });
  const skirt = new THREE.Mesh(
    new THREE.BoxGeometry(length * 0.54, 1.7, width + 1.2),
    skirtMat
  );
  skirt.position.set(0, wheelR * 0.64, 0);
  chassis.add(skirt);

  // Front Aero Splitter with Side Canards + Rear Underbody Diffuser
  const frontLip = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 1.3, width + 1.0),
    getMat(0x0f172a, { roughness: 0.28, metalness: 0.4 })
  );
  frontLip.position.set(length / 2 + 0.4, wheelR * 0.56, 0);
  const rearDiffuser = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 1.6, width * 0.86),
    getMat(0x0f172a, { roughness: 0.35, metalness: 0.35 })
  );
  rearDiffuser.position.set(-length / 2 - 0.2, wheelR * 0.58, 0);
  chassis.add(frontLip, rearDiffuser);

  // 4. Glossy Reflective 3D Tinted Windshield, Side Windows, B-Pillars & Fastback Rear Glass
  const glassMat = getPaintMat(0x09152b, {
    roughness: 0.04,
    metalness: 0.92,
    clearcoat: 1.0,
    emissive: 0x1e3a8a,
    emissiveIntensity: 0.34
  });
  const pillarMat = getMat(0x0f172a, { roughness: 0.25, metalness: 0.5 });
  const cabY = wheelR * 0.46 + (baseH + topH) * 0.51;
  const cabW = width * 0.78;

  if (model !== 'van') {
    const windshield = new THREE.Mesh(
      new THREE.BoxGeometry(7.6, 1.25, cabW * 0.90),
      glassMat
    );
    windshield.position.set(length * 0.18, cabY + 0.45, 0);
    windshield.rotation.z = model === 'supercar' ? -0.45 : -0.56;
    chassis.add(windshield);

    const sideWinLen = model === 'pajero' ? length * 0.48 : model === 'pickup' || model === 'tow' ? length * 0.28 : length * 0.35;
    const sideWinX = model === 'pajero' ? -length * 0.14 : model === 'pickup' || model === 'tow' ? length * 0.12 : -length * 0.05;
    const sideGlass = new THREE.Mesh(
      new THREE.BoxGeometry(sideWinLen, (topH - baseH) * 0.74, cabW + 1.85),
      glassMat
    );
    sideGlass.position.set(sideWinX, cabY + 0.25, 0);
    chassis.add(sideGlass);

    // 3D Dark B-Pillar divider across side windows
    const bPillar = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, (topH - baseH) * 0.76, cabW + 2.05),
      pillarMat
    );
    bPillar.position.set(sideWinX + 1.2, cabY + 0.25, 0);
    chassis.add(bPillar);

    if (model !== 'pickup' && model !== 'tow' && model !== 'pajero') {
      const rearGlass = new THREE.Mesh(
        new THREE.BoxGeometry(8.5, 1.25, cabW * 0.86),
        glassMat
      );
      rearGlass.position.set(-length * 0.25, cabY + 0.2, 0);
      rearGlass.rotation.z = 0.46;
      chassis.add(rearGlass);
    }
  } else {
    const vanWindshield = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.25, width * 0.82), glassMat);
    vanWindshield.position.set(length * 0.39, cabY + 0.8, 0);
    vanWindshield.rotation.z = -0.85;
    const vanSideWin = new THREE.Mesh(new THREE.BoxGeometry(length * 0.28, 4.8, width - 0.5), glassMat);
    vanSideWin.position.set(length * 0.22, cabY + 1.0, 0);
    chassis.add(vanWindshield, vanSideWin);
  }

  // 3D Sculpted Side Wing Mirrors with stalks
  for (const side of [-1, 1]) {
    const mirrorCap = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.4, 2.5),
      paintMat
    );
    mirrorCap.position.set(length * 0.15, wheelR * 0.46 + baseH + 1.35, side * (width * 0.51));
    chassis.add(mirrorCap);
  }

  // 5. Model-Specific Iconic Details (Carbon Hoods, Stripes, Intercoolers, Pop-Ups, Bullbars, Spoilers, Taillights)
  if (spec.stripe === 'twin') {
    const stMat = getMat(0xf8fafc, { roughness: 0.16 });
    for (const sz of [-2.4, 2.4]) {
      const stHood = new THREE.Mesh(new THREE.BoxGeometry(length * 0.34, 1.35, 2.5), stMat);
      stHood.position.set(length * 0.30, wheelR * 0.46 + baseH + 0.45, sz);
      stHood.rotation.z = -0.06;
      const stRoof = new THREE.Mesh(new THREE.BoxGeometry(length * 0.32, 0.95, 2.5), stMat);
      stRoof.position.set(-length * 0.08, wheelR * 0.46 + topH + 0.35, sz);
      chassis.add(stHood, stRoof);
    }
  } else if (spec.stripe === 'side') {
    const sideStripe = new THREE.Mesh(
      new THREE.BoxGeometry(length * 0.65, 1.3, width + 0.65),
      getMat(0xf8fafc, { roughness: 0.18 })
    );
    sideStripe.position.set(-1, wheelR * 0.46 + 3.9, 0);
    chassis.add(sideStripe);
  }

  if (spec.ttop) {
    const ttopGlass = new THREE.Mesh(
      new THREE.BoxGeometry(length * 0.26, 1.15, cabW * 0.88),
      glassMat
    );
    ttopGlass.position.set(-length * 0.06, wheelR * 0.46 + topH + 0.25, 0);
    chassis.add(ttopGlass);
  }

  if (spec.scoop) {
    const scoop = new THREE.Mesh(
      new THREE.BoxGeometry(8.8, 2.3, 7.4),
      getMat(0x111827, { roughness: 0.28, metalness: 0.4 })
    );
    scoop.position.set(length * 0.24, wheelR * 0.46 + baseH + 1.15, 0);
    chassis.add(scoop);
  }

  // Front Fascia: Exposed Aluminum Intercooler (FMIC) or Honeycomb Grille + JDM/NA Front Number Plate
  if (spec.fmic) {
    const fmicFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 3.6, width * 0.58),
      getMat(0x090d16, { roughness: 0.5 })
    );
    fmicFrame.position.set(length / 2 + 0.75, wheelR * 0.46 + 2.8, 0);
    const fmicCore = new THREE.Mesh(
      new THREE.BoxGeometry(1.75, 2.9, width * 0.50),
      getMat(0xe2e8f0, { roughness: 0.16, metalness: 0.92 })
    );
    fmicCore.position.set(length / 2 + 0.92, wheelR * 0.46 + 2.8, 0);
    chassis.add(fmicFrame, fmicCore);
  } else {
    const grille = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 3.6, width * 0.58),
      getMat(0x090d16, { roughness: 0.45, metalness: 0.35 })
    );
    grille.position.set(length / 2 + 0.8, wheelR * 0.46 + 3.8, 0);
    chassis.add(grille);
  }

  // Front & Rear Number Plates
  const plateMat = getMat(0xf8fafc, { roughness: 0.25 });
  const frontPlate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.7, 4.2), plateMat);
  frontPlate.position.set(length / 2 + 1.15, wheelR * 0.46 + 2.2, spec.fmic ? width * 0.26 : 0);
  const rearPlate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 4.4), plateMat);
  rearPlate.position.set(-length / 2 - 0.85, wheelR * 0.46 + 3.4, 0);
  chassis.add(frontPlate, rearPlate);

  if (spec.bullbar) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(2.2, 5.2, width * 0.64), getMat(0x1e293b, { metalness: 0.65, roughness: 0.25 }));
    bar.position.set(length / 2 + 1.6, wheelR * 0.46 + 4.4, 0);
    chassis.add(bar);
    const fogMat = getMat(0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.6 });
    for (const fz of [-3.6, 3.6]) {
      const fog = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 1.5, 12), fogMat);
      fog.rotation.z = Math.PI / 2;
      fog.position.set(length / 2 + 2.4, wheelR * 0.46 + 4.8, fz);
      chassis.add(fog);
    }
  }

  if (spec.spareTire) {
    const spare = make3DWheel(wheelR * 0.88, wheelW * 0.85, spec.rim, true);
    spare.rotation.z = Math.PI / 2;
    spare.rotation.y = Math.PI / 2;
    spare.position.set(-length / 2 - 2.2, wheelR * 0.46 + baseH + 1.2, 2.0);
    chassis.add(spare);
  }

  if (spec.bedSpare) {
    const bedSpare = make3DWheel(wheelR * 0.88, wheelW * 0.85, spec.rim, true);
    bedSpare.rotation.x = Math.PI / 2;
    bedSpare.rotation.y = 0.55;
    bedSpare.position.set(-length * 0.28, wheelR * 0.46 + baseH + 1.5, 0);
    chassis.add(bedSpare);
  }

  if (spec.roofRack) {
    const rack = new THREE.Mesh(
      new THREE.BoxGeometry(length * 0.45, 1.4, cabW * 0.90),
      getMat(0x1e293b, { metalness: 0.6 })
    );
    rack.position.set(-length * 0.16, wheelR * 0.46 + topH + 1.2, 0);
    const rallyPodBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1.8, cabW * 0.82),
      getMat(0xfef08a, { emissive: 0xfacc15, emissiveIntensity: 1.5 })
    );
    rallyPodBar.position.set(length * 0.05, wheelR * 0.46 + topH + 1.8, 0);
    chassis.add(rack, rallyPodBar);
  }

  if (spec.louvers) {
    for (let li = 0; li < 4; li++) {
      const louver = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.8, cabW * 0.72),
        getMat(0x0f172a, { roughness: 0.28 })
      );
      louver.position.set(-length * 0.12 - li * 3.2, wheelR * 0.46 + topH - 0.3 - li * 0.65, 0);
      chassis.add(louver);
    }
  }

  // Spoilers (GT Wing, Hoop Wing, Drift Wing, Ducktail)
  const deckY = wheelR * 0.46 + baseH + 1.0;
  if (spec.spoiler === 'gt' || spec.spoiler === 'drift') {
    const wingH = spec.spoiler === 'drift' ? 4.8 : 3.8;
    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 1.1, width * 0.96),
      spec.spoiler === 'drift' ? getMat(0x111827, { roughness: 0.22, metalness: 0.5 }) : paintMat
    );
    wing.position.set(-length * 0.44, deckY + wingH, 0);
    const endplateGeo = new THREE.BoxGeometry(5.2, 2.8, 0.8);
    const epL = new THREE.Mesh(endplateGeo, getMat(0x111827));
    const epR = epL.clone();
    epL.position.set(-length * 0.44, deckY + wingH, -width * 0.48);
    epR.position.set(-length * 0.44, deckY + wingH, width * 0.48);
    const strutGeo = new THREE.BoxGeometry(2.2, wingH, 0.9);
    const stL = new THREE.Mesh(strutGeo, getMat(0x0f172a));
    const stR = stL.clone();
    stL.position.set(-length * 0.43, deckY + wingH / 2, -width * 0.28);
    stR.position.set(-length * 0.43, deckY + wingH / 2, width * 0.28);
    chassis.add(wing, epL, epR, stL, stR);
  } else if (spec.spoiler === 'hoop') {
    const hoopTop = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 1.2, width * 0.88),
      paintMat
    );
    hoopTop.position.set(-length * 0.44, deckY + 3.4, 0);
    const postGeo = new THREE.BoxGeometry(3.6, 3.4, 1.4);
    const pL = new THREE.Mesh(postGeo, paintMat);
    const pR = pL.clone();
    pL.position.set(-length * 0.44, deckY + 1.7, -width * 0.40);
    pR.position.set(-length * 0.44, deckY + 1.7, width * 0.40);
    chassis.add(hoopTop, pL, pR);
  } else if (spec.spoiler === 'duck') {
    const duck = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 2.5, width * 0.88),
      getMat(0x111827, { roughness: 0.28 })
    );
    duck.position.set(-length * 0.47, deckY + 1.0, 0);
    duck.rotation.z = -0.35;
    chassis.add(duck);
  }

  // 6. Dual-Projector Headlights, Working 3D Pop-Up Headlights (180SX), Blinking Turn Signals & Dynamic Brake Lights!
  const hlMat = getMat(0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 1.75 });
  const hlHousingMat = getMat(0x0f172a, { roughness: 0.2, metalness: 0.8 });
  const turnSignals = [];
  const turnMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.9,
    roughness: 0.2
  });

  const brakeLights = [];
  for (const side of [-1, 1]) {
    if (spec.popups) {
      const popupPod = new THREE.Group();
      popupPod.position.set(length * 0.43, wheelR * 0.46 + 5.2, side * (width * 0.31));
      const podCover = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.3, 4.0), paintMat);
      const podLens = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.8, 3.4), hlMat);
      podLens.position.set(1.55, 0, 0);
      popupPod.add(podCover, podLens);
      chassis.add(popupPod);
    } else {
      const hlBezel = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.2, 4.6), hlHousingMat);
      hlBezel.position.set(length / 2 + 0.65, wheelR * 0.46 + (isHeavy ? 6.0 : 4.8), side * (width * 0.33));
      const hlLens = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.7, 3.8), hlMat);
      hlLens.position.set(length / 2 + 0.82, wheelR * 0.46 + (isHeavy ? 6.0 : 4.8), side * (width * 0.33));
      chassis.add(hlBezel, hlLens);
    }

    // Front Corner Amber Turn Signal Lamp
    const tsFront = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.3, 1.6), turnMat);
    tsFront.position.set(length / 2 + 0.65, wheelR * 0.46 + 3.4, side * (width * 0.43));
    chassis.add(tsFront);
    turnSignals.push(tsFront);
  }

  // Unique Clone Material per Vehicle for Dynamic Brake Light Brightening!
  const brakeMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 0.85,
    roughness: 0.2
  });

  if (spec.afterburners) {
    // R34 Skyline Signature Quad Circular Red Afterburner Taillights!
    for (const side of [-1, 1]) {
      const outerRing = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 1.3, 14), brakeMat);
      outerRing.rotation.z = Math.PI / 2;
      outerRing.position.set(-length / 2 - 0.8, wheelR * 0.46 + 5.4, side * (width * 0.35));
      const innerRing = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 1.3, 14), brakeMat);
      innerRing.rotation.z = Math.PI / 2;
      innerRing.position.set(-length / 2 - 0.8, wheelR * 0.46 + 5.4, side * (width * 0.21));
      chassis.add(outerRing, innerRing);
      brakeLights.push(outerRing, innerRing);
    }
  } else {
    for (const side of [-1, 1]) {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 4.8), brakeMat);
      tl.position.set(-length / 2 - 0.7, wheelR * 0.46 + (isHeavy ? 5.8 : 5.0), side * (width * 0.33));
      chassis.add(tl);
      brakeLights.push(tl);
    }
    const centerBar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.15, width * 0.56), brakeMat);
    centerBar.position.set(-length / 2 - 0.65, wheelR * 0.46 + (isHeavy ? 5.8 : 5.0), 0);
    chassis.add(centerBar);
    brakeLights.push(centerBar);
  }

  // Tow Truck Hydraulic Recovery Boom & Strobe Bar
  if (model === 'tow') {
    const strobeRed = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 6.5), getMat(0xef4444, { emissive: 0xef4444, emissiveIntensity: 1.6 }));
    strobeRed.position.set(8, wheelR * 0.46 + topH + 1.2, -3.6);
    const strobeAmber = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 6.5), getMat(0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.6 }));
    strobeAmber.position.set(8, wheelR * 0.46 + topH + 1.2, 3.6);
    chassis.add(strobeRed, strobeAmber);
    root._strobes = [strobeRed, strobeAmber];

    const boomPivot = new THREE.Group();
    boomPivot.position.set(-4, wheelR * 0.46 + baseH, 0);
    const boomArm = new THREE.Mesh(
      new THREE.BoxGeometry(24, 3.2, 4.2),
      getMat(0xfacc15, { roughness: 0.25, metalness: 0.55 })
    );
    boomArm.position.set(-10, 6, 0);
    boomArm.rotation.z = -0.45;
    boomArm.castShadow = true;
    boomPivot.add(boomArm);
    chassis.add(boomPivot);
    root._towBoom = boomPivot;

    if (towTargetKey) {
      const towedCar = create3DVehicle({ assetKey: towTargetKey, direction: 'east', showBadge: false });
      towedCar.position.set(-54, 2.8, 0);
      towedCar.rotation.z = -0.12;
      chassis.add(towedCar);
    }
  }

  if (spec.underglow) {
    const glow = new THREE.Mesh(
      new THREE.BoxGeometry(length * 0.82, 0.7, width * 0.88),
      getMat(spec.underglow, { emissive: spec.underglow, emissiveIntensity: 1.65 })
    );
    glow.position.set(0, 1.4, 0);
    chassis.add(glow);
  }

  // Dual Chrome Exhaust Tips + Exhaust / Rotary Backfire Flame
  const tipGeo = new THREE.CylinderGeometry(1.15, 1.15, 3.4, 12);
  const tipMat = getMat(0xe2e8f0, { roughness: 0.12, metalness: 0.92 });
  for (const ez of [-width * 0.26, width * 0.26]) {
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.rotation.z = Math.PI / 2;
    tip.position.set(-length / 2 - 1.0, wheelR * 0.55, ez);
    chassis.add(tip);
  }

  const exhaustPuff = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 8, 8),
    new THREE.MeshBasicMaterial({
      color: spec.rotaryFlame ? 0x38bdf8 : 0xe2e8f0,
      transparent: true,
      opacity: 0.35
    })
  );
  exhaustPuff.position.set(-length / 2 - 3.8, wheelR * 0.65, -width * 0.26);
  chassis.add(exhaustPuff);

  let modelTag = null;
  if (showBadge && spec.name) {
    modelTag = makeLabelSprite(spec.name, {
      bgColor: 'rgba(6, 19, 29, 0.92)',
      borderColor: '#38bdf8',
      textColor: '#f8fafc',
      width: 148,
      height: 24,
      scale: 0.29
    });
    modelTag.position.set(0, 22.5, 0);
    root.add(modelTag);
  }

  // Generous 3D Click Hitbox + Selection Ring for Vehicle
  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(length + 14, 24, width + 14),
    HITBOX_MAT
  );
  hitbox.position.set(0, 11, 0);
  root.add(hitbox);

  const selectionRing = new THREE.Mesh(
    new THREE.RingGeometry(Math.max(length, width) * 0.48, Math.max(length, width) * 0.62, 28),
    new THREE.MeshBasicMaterial({ color: 0x35e58a, side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
  );
  selectionRing.rotation.x = -Math.PI / 2;
  selectionRing.position.set(0, 0.8, 0);
  selectionRing.visible = false;
  selectionRing.raycast = () => {};
  root.add(selectionRing);

  if (direction === 'east') root.rotation.y = 0;
  else if (direction === 'west') root.rotation.y = Math.PI;
  else if (direction === 'south') root.rotation.y = -Math.PI / 2;
  else if (direction === 'north') root.rotation.y = Math.PI / 2;

  root._wheels = wheels;
  root._chassis = chassis;
  root._exhaustPuff = exhaustPuff;
  root._brakeMat = brakeMat;
  root._brakeLights = brakeLights;
  root._turnMat = turnMat;
  root._turnSignals = turnSignals;
  root._modelTag = modelTag;
  root._selectionRing = selectionRing;
  root._spec = spec;
  root._assetKey = assetKey;
  return root;
}

// ============================================================================
// 3. TRUE 3D ARTICULATED TOON CHARACTERS WITH REAL WALKING LIMB ANIMATION
// ============================================================================
const PERSON_SPECS = {
  driver:         { shirt: 0x16a34a, pants: 0x1e293b, skin: 0xfdba74, hat: 0x15803d, hatType: 'cap', prop: 'wheel' },
  courier:        { shirt: 0x0284c7, pants: 0x334155, skin: 0xfed7aa, hat: 0xfacc15, hatType: 'cap', prop: 'crate' },
  mechanic:       { shirt: 0x0ea5e9, pants: 0x1e3a8a, skin: 0xfdba74, hat: 0x0284c7, hatType: 'goggles', prop: 'wrench' },
  racer:          { shirt: 0xef4444, pants: 0xf8fafc, skin: 0xfed7aa, hat: 0xd97706, hatType: 'hair', prop: 'helmet' },
  towOperator:    { shirt: 0xf97316, pants: 0x1e293b, skin: 0xfdba74, hat: 0xfacc15, hatType: 'hardhat', prop: 'hook' },
  salesRep:       { shirt: 0x7c3aed, pants: 0x0f172a, skin: 0xfed7aa, hat: 0x312e81, hatType: 'hair', prop: 'tablet' },
  residentBlue:   { shirt: 0x2563eb, pants: 0x1e293b, skin: 0xfed7aa, hat: 0x7c2d12, hatType: 'hair', prop: 'none' },
  residentGreen:  { shirt: 0x22c55e, pants: 0x3f3f46, skin: 0xfdba74, hat: 0x1c1917, hatType: 'hair', prop: 'tablet' },
  residentOrange: { shirt: 0xf97316, pants: 0x18181b, skin: 0xfdba74, hat: 0xea580c, hatType: 'beanie', prop: 'turbo' },
  residentPurple: { shirt: 0x9333ea, pants: 0x1e1b4b, skin: 0xfed7aa, hat: 0x4c1d95, hatType: 'hair', prop: 'bag' },
  tuner:          { shirt: 0x14b8a6, pants: 0x0f172a, skin: 0xfed7aa, hat: 0x22d3ee, hatType: 'goggles', prop: 'tablet' },
  customer:       { shirt: 0xe11d48, pants: 0x1e293b, skin: 0xfdba74, hat: 0xfacc15, hatType: 'cap', prop: 'none' }
};

export function create3DPerson({ personKey = 'residentBlue', label = '', isStaff = false } = {}) {
  const spec = PERSON_SPECS[personKey] || PERSON_SPECS.residentBlue;
  const root = new THREE.Group();
  const bodyRoot = new THREE.Group();
  root.add(bodyRoot);

  const legGeo = new THREE.CylinderGeometry(1.9, 1.7, 7.2, 10);
  const pantsMat = getMat(spec.pants, { roughness: 0.55 });
  const shoeGeo = new THREE.BoxGeometry(3.4, 2.4, 5.2);
  const shoeMat = getMat(0xf8fafc, { roughness: 0.4 });

  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-2.3, 8.2, 0);
  const leftLeg = new THREE.Mesh(legGeo, pantsMat);
  leftLeg.position.y = -3.4;
  leftLeg.castShadow = true;
  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.position.set(0, -6.8, 0.9);
  leftShoe.castShadow = true;
  leftLegPivot.add(leftLeg, leftShoe);

  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(2.3, 8.2, 0);
  const rightLeg = new THREE.Mesh(legGeo, pantsMat);
  rightLeg.position.y = -3.4;
  rightLeg.castShadow = true;
  const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
  rightShoe.position.set(0, -6.8, 0.9);
  rightShoe.castShadow = true;
  rightLegPivot.add(rightLeg, rightShoe);

  bodyRoot.add(leftLegPivot, rightLegPivot);

  const torsoPivot = new THREE.Group();
  torsoPivot.position.set(0, 8.5, 0);

  const torsoMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(4.4, 4.0, 9.5, 12),
    getMat(spec.shirt, { roughness: 0.38 })
  );
  torsoMesh.position.y = 4.8;
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  torsoPivot.add(torsoMesh);

  const chestStripe = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 8.2, 1.2),
    getMat(isStaff ? 0xfacc15 : 0xf8fafc, { roughness: 0.35 })
  );
  chestStripe.position.set(0, 4.8, 3.8);
  torsoPivot.add(chestStripe);

  const armGeo = new THREE.CylinderGeometry(1.5, 1.35, 7.0, 8);
  const handGeo = new THREE.SphereGeometry(1.65, 8, 8);
  const shirtMat = getMat(spec.shirt, { roughness: 0.38 });
  const skinMat = getMat(spec.skin, { roughness: 0.42 });

  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-5.6, 8.4, 0);
  const leftArm = new THREE.Mesh(armGeo, shirtMat);
  leftArm.position.y = -3.2;
  leftArm.castShadow = true;
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.position.y = -6.8;
  leftArmPivot.add(leftArm, leftHand);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(5.6, 8.4, 0);
  const rightArm = new THREE.Mesh(armGeo, shirtMat);
  rightArm.position.y = -3.2;
  rightArm.castShadow = true;
  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.y = -6.8;
  rightArmPivot.add(rightArm, rightHand);

  if (spec.prop === 'wrench') {
    const wrench = new THREE.Mesh(new THREE.BoxGeometry(1.2, 6.5, 1.8), getMat(0xe2e8f0, { metalness: 0.85, roughness: 0.2 }));
    wrench.position.set(0, -7.2, 2.5);
    wrench.rotation.x = Math.PI / 3;
    rightArmPivot.add(wrench);
  } else if (spec.prop === 'crate' || spec.prop === 'turbo') {
    const crate = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.2, 4.2), getMat(0xfacc15, { metalness: 0.4, roughness: 0.3 }));
    crate.position.set(0, -7.0, 2.8);
    rightArmPivot.add(crate);
  } else if (spec.prop === 'tablet') {
    const tab = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.6, 0.8), getMat(0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 0.5 }));
    tab.position.set(0, -6.8, 2.4);
    tab.rotation.x = -0.4;
    rightArmPivot.add(tab);
  } else if (spec.prop === 'helmet') {
    const helm = new THREE.Mesh(new THREE.SphereGeometry(2.8, 10, 10), getMat(0xfacc15, { roughness: 0.2, metalness: 0.4 }));
    helm.position.set(1.2, -6.6, 1.8);
    rightArmPivot.add(helm);
  }

  torsoPivot.add(leftArmPivot, rightArmPivot);

  const headPivot = new THREE.Group();
  headPivot.position.set(0, 10.2, 0);

  const headMesh = new THREE.Mesh(
    new THREE.SphereGeometry(5.2, 16, 16),
    skinMat
  );
  headMesh.position.y = 4.6;
  headMesh.castShadow = true;
  headPivot.add(headMesh);

  const eyeMat = getMat(0x0f172a, { roughness: 0.1 });
  const eyeWhiteMat = getMat(0xffffff, { roughness: 0.2 });
  for (const side of [-1, 1]) {
    const eyeW = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 8), eyeWhiteMat);
    eyeW.position.set(side * 1.85, 5.1, 4.3);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 8), eyeMat);
    pupil.position.set(side * 1.85, 5.1, 5.0);
    headPivot.add(eyeW, pupil);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.95, 8, 8), skinMat);
  nose.position.set(0, 4.2, 5.2);
  headPivot.add(nose);

  const hatMat = getMat(spec.hat, { roughness: 0.35 });
  const crownCap = new THREE.Mesh(
    new THREE.SphereGeometry(5.45, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.56),
    hatMat
  );
  crownCap.position.y = 5.0;
  crownCap.castShadow = true;
  headPivot.add(crownCap);

  if (spec.hatType === 'cap' || spec.hatType === 'hardhat') {
    const visor = new THREE.Mesh(new THREE.BoxGeometry(6.8, 1.0, 4.2), hatMat);
    visor.position.set(0, 6.2, 4.2);
    headPivot.add(visor);
  } else if (spec.hatType === 'goggles') {
    const goggleStrap = new THREE.Mesh(new THREE.BoxGeometry(7.6, 2.0, 3.0), getMat(0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 0.6 }));
    goggleStrap.position.set(0, 6.8, 3.6);
    headPivot.add(goggleStrap);
  }

  torsoPivot.add(headPivot);
  bodyRoot.add(torsoPivot);

  if (label) {
    const tag = makeLabelSprite(label, {
      bgColor: isStaff ? 'rgba(250, 204, 21, 0.95)' : 'rgba(15, 23, 42, 0.90)',
      borderColor: isStaff ? '#0f172a' : '#38bdf8',
      textColor: isStaff ? '#0f172a' : '#f8fafc',
      width: 112,
      height: 26,
      scale: 0.32
    });
    tag.position.set(0, 29, 0);
    root.add(tag);
  }

  // Generous 3D Click Hitbox + Selection Ring for Person
  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(24, 34, 24),
    HITBOX_MAT
  );
  hitbox.position.set(0, 15, 0);
  root.add(hitbox);

  const selectionRing = new THREE.Mesh(
    new THREE.RingGeometry(8.5, 12.2, 24),
    new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.95 })
  );
  selectionRing.rotation.x = -Math.PI / 2;
  selectionRing.position.set(0, 0.4, 0);
  selectionRing.visible = false;
  selectionRing.raycast = () => {};
  root.add(selectionRing);

  root._bodyRoot = bodyRoot;
  root._leftLeg = leftLegPivot;
  root._rightLeg = rightLegPivot;
  root._leftArm = leftArmPivot;
  root._rightArm = rightArmPivot;
  root._torso = torsoPivot;
  root._head = headPivot;
  root._selectionRing = selectionRing;
  return root;
}

export function update3DPersonWalk(personGroup, distance, prevPos, nextPos, time, isWaiting = false) {
  if (!personGroup) return;
  const phase = distance * 0.22;
  const swing = isWaiting ? 0 : Math.sin(phase);
  const cosSwing = isWaiting ? 0 : Math.cos(phase);

  if (personGroup._leftLeg) personGroup._leftLeg.rotation.x = swing * 0.72;
  if (personGroup._rightLeg) personGroup._rightLeg.rotation.x = -swing * 0.72;
  if (personGroup._leftArm) personGroup._leftArm.rotation.x = isWaiting ? Math.sin(time * 2.5) * 0.06 : -swing * 0.58;
  if (personGroup._rightArm) personGroup._rightArm.rotation.x = isWaiting ? -Math.sin(time * 2.5) * 0.06 : swing * 0.58;

  if (personGroup._bodyRoot) {
    personGroup._bodyRoot.position.y = isWaiting ? Math.sin(time * 3.0) * 0.35 : Math.abs(swing) * 1.9;
  }
  if (personGroup._torso) {
    personGroup._torso.rotation.y = isWaiting ? Math.sin(time * 1.8) * 0.12 : swing * 0.16;
    personGroup._torso.rotation.z = cosSwing * 0.06;
  }
  if (personGroup._head) {
    personGroup._head.rotation.y = isWaiting
      ? Math.sin(time * 3.2 + distance * 0.05) * 0.42
      : Math.sin(time * 2.2 + distance * 0.03) * 0.22;
    personGroup._head.rotation.x = Math.abs(swing) * 0.08;
  }

  if (prevPos && nextPos) {
    const dx = nextPos.x - prevPos.x;
    const dz = nextPos.y - prevPos.y;
    if (Math.hypot(dx, dz) > 0.01) {
      personGroup.rotation.y = Math.atan2(dx, dz);
    }
  }
}

// ============================================================================
// 4. TRUE 3D ARCHITECTURAL BUILDINGS WITH ANIMATED 3D BAYS, LIFTS, MARQUEE SIGNS & COLLECTIBLES
// ============================================================================
const BUILDING_3D_PALETTE = {
  garage:         { wall: 0xdbeafe, lower: 0x0284c7, roof: 0x0f172a, accent: 0x35e58a, trim: 0x38bdf8, sign: '365 GARAGE',   sub: 'PRO TUNING & LIFTS' },
  dealerShowroom: { wall: 0xe0f2fe, lower: 0x1d4ed8, roof: 0x1e3a8a, accent: 0xfacc15, trim: 0x60a5fa, sign: 'DEALER VIP',   sub: 'IMPORT & EXOTIC LOT' },
  partsHub:       { wall: 0xccfbf1, lower: 0x0d9488, roof: 0x115e59, accent: 0xfacc15, trim: 0x2dd4bf, sign: 'PARTS HUB',    sub: 'PERFORMANCE CRATES' },
  partsWarehouse: { wall: 0xcffafe, lower: 0x0891b2, roof: 0x164e63, accent: 0x38bdf8, trim: 0xfacc15, sign: 'WAREHOUSE',    sub: 'BULK OEM LOGISTICS' },
  streetKiosk:    { wall: 0xd1fae5, lower: 0x059669, roof: 0x064e3b, accent: 0xfacc15, trim: 0x35e58a, sign: '365 EXPRESS',  sub: 'ROUTE DISPATCH' },
  privateShop:    { wall: 0xf3e8ff, lower: 0x7c3aed, roof: 0x3b0764, accent: 0x38bdf8, trim: 0xc084fc, sign: 'TUNING LAB',   sub: 'ECU & DYNO CUSTOMS' },
  salvageBlock:   { wall: 0xffedd5, lower: 0xea580c, roof: 0x7c2d12, accent: 0xfacc15, trim: 0xf97316, sign: 'TOWING YARD',  sub: 'SALVAGE & RECOVERY' },
  towDispatch:    { wall: 0xfef3c7, lower: 0xd97706, roof: 0x78350f, accent: 0xef4444, trim: 0xfacc15, sign: 'TOW DISPATCH', sub: '24/7 WRECKER OPS' },
  tireRepair:     { wall: 0xfef9c3, lower: 0xca8a04, roof: 0x991b1b, accent: 0xef4444, trim: 0xfacc15, sign: 'FUEL & TIRE',  sub: 'SLICKS & HIGH OCTANE' },
  testTrack:      { wall: 0xdcfce7, lower: 0x16a34a, roof: 0x14532d, accent: 0xfacc15, trim: 0xef4444, sign: 'PRO TRACK',    sub: 'TIME ATTACK CIRCUIT' }
};

function create3DCollectibleToken(accentHex = 0x35e58a) {
  const tokenGroup = new THREE.Group();

  // Outer Glowing Golden / Emerald 3D Coin & Gear Ring
  const coinBody = new THREE.Mesh(
    new THREE.CylinderGeometry(7.2, 7.2, 2.4, 20),
    getMat(0xfacc15, { roughness: 0.16, metalness: 0.85, emissive: 0xf59e0b, emissiveIntensity: 0.65 })
  );
  coinBody.rotation.x = Math.PI / 2;
  tokenGroup.add(coinBody);

  const innerCore = new THREE.Mesh(
    new THREE.CylinderGeometry(4.8, 4.8, 2.8, 16),
    getMat(accentHex, { roughness: 0.2, metalness: 0.6, emissive: accentHex, emissiveIntensity: 0.95 })
  );
  innerCore.rotation.x = Math.PI / 2;
  tokenGroup.add(innerCore);

  const starBarA = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 1.8, 3.2),
    getMat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.8 })
  );
  const starBarB = starBarA.clone();
  starBarB.rotation.z = Math.PI / 2;
  tokenGroup.add(starBarA, starBarB);

  return tokenGroup;
}

export function create3DBuilding({
  type = 'garage',
  name = '365 Garage',
  w = 120,
  h = 120,
  level = 1,
  ready = false,
  selected = false,
  statusText = 'Collect',
  rotation = 0
} = {}) {
  const pal = BUILDING_3D_PALETTE[type] || BUILDING_3D_PALETTE.garage;
  const group = new THREE.Group();
  const animParts = {
    rotors: [],
    liftCar: null,
    turntable: null,
    forklift: null,
    trackCar: null,
    signGroup: null,
    collectible3D: null,
    selectionRing: null
  };

  // 1. 3D Beveled Concrete Plaza Base & Dark Asphalt Forecourt with Painted Parking Stalls
  const padW = w + 16;
  const padD = h + 16;
  const concretePad = new THREE.Mesh(
    new THREE.BoxGeometry(padW, 5.2, padD),
    getMat(selected ? 0xfef08a : 0xe2e8f0, {
      roughness: 0.45,
      emissive: selected ? 0xf59e0b : 0x000000,
      emissiveIntensity: selected ? 0.35 : 0
    })
  );
  concretePad.position.y = 2.6;
  concretePad.receiveShadow = true;
  concretePad.castShadow = true;
  group.add(concretePad);

  const asphaltLot = new THREE.Mesh(
    new THREE.BoxGeometry(w + 4, 5.8, h + 4),
    getMat(0x1e293b, { roughness: 0.72 })
  );
  asphaltLot.position.y = 2.7;
  asphaltLot.receiveShadow = true;
  group.add(asphaltLot);

  const rimColor = selected ? 0xfacc15 : ready ? 0x35e58a : pal.accent;
  const rimMat = getMat(rimColor, {
    emissive: rimColor,
    emissiveIntensity: selected ? 1.85 : ready ? 1.15 : 0.55
  });
  const frontRim = new THREE.Mesh(new THREE.BoxGeometry(w + 6, selected ? 2.4 : 1.6, selected ? 3.4 : 2.6), rimMat);
  frontRim.position.set(0, 5.7, (h + 4) / 2);
  const leftRim = new THREE.Mesh(new THREE.BoxGeometry(selected ? 3.4 : 2.6, selected ? 2.4 : 1.6, h + 6), rimMat);
  leftRim.position.set(-(w + 4) / 2, 5.7, 0);
  group.add(frontRim, leftRim);
  if (selected) {
    const backRim = new THREE.Mesh(new THREE.BoxGeometry(w + 6, 2.4, 3.4), rimMat);
    backRim.position.set(0, 5.7, -(h + 4) / 2);
    const rightRim = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.4, h + 6), rimMat);
    rightRim.position.set((w + 4) / 2, 5.7, 0);
    group.add(backRim, rightRim);
  }

  // Yellow safety driveway apron + crisp white forecourt parking stall lines
  const apronF = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.68, 6.0, 6.5),
    getMat(0xfacc15, { roughness: 0.4 })
  );
  apronF.position.set(0, 2.8, h * 0.40);
  group.add(apronF);

  const stallMat = getMat(0xf8fafc, { roughness: 0.4 });
  for (const sx of [-w * 0.34, -w * 0.14, w * 0.14, w * 0.34]) {
    const stallLine = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 14), stallMat);
    stallLine.position.set(sx, 5.75, h * 0.32);
    group.add(stallLine);
  }

  const bW = w * 0.78;
  const bD = h * 0.66;
  const bH = Math.min(72, (type === 'streetKiosk' ? 36 : 46) + (level - 1) * 3.5);
  const baseY = 5.6;
  const centerZ = -h * 0.06;
  const frontZ = centerZ + bD / 2;
  const leftX = -bW / 2;

  // 2. Two-Tone 3D Architectural Main Structure + Vertical Corner & Mid-Wall Pilasters
  const lowerTierH = bH * 0.54;
  const upperTierH = bH * 0.46;

  const lowerShell = new THREE.Mesh(
    new THREE.BoxGeometry(bW, lowerTierH, bD),
    getMat(pal.lower, { roughness: 0.30, metalness: 0.24 })
  );
  lowerShell.position.set(0, baseY + lowerTierH / 2, centerZ);
  lowerShell.castShadow = true;
  lowerShell.receiveShadow = true;
  group.add(lowerShell);

  const upperShell = new THREE.Mesh(
    new THREE.BoxGeometry(bW - 2, upperTierH, bD - 2),
    getMat(pal.wall, { roughness: 0.34, metalness: 0.16 })
  );
  upperShell.position.set(0, baseY + lowerTierH + upperTierH / 2, centerZ);
  upperShell.castShadow = true;
  upperShell.receiveShadow = true;
  group.add(upperShell);

  // 3D Vertical Architectural Columns / Pilasters on Corners & Facade
  const pilasterMat = getMat(pal.roof, { roughness: 0.3, metalness: 0.45 });
  const pilasterGeo = new THREE.BoxGeometry(3.6, bH + 1.5, 3.6);
  for (const [px, pz] of [
    [-bW / 2, centerZ + bD / 2],
    [bW / 2, centerZ + bD / 2],
    [-bW / 2, centerZ - bD / 2],
    [bW / 2, centerZ - bD / 2],
    [0, centerZ + bD / 2]
  ]) {
    const col = new THREE.Mesh(pilasterGeo, pilasterMat);
    col.position.set(px, baseY + bH / 2, pz);
    col.castShadow = true;
    group.add(col);
  }

  // Mid-Belt Trim Cornice & Rooftop Parapet
  const midBelt = new THREE.Mesh(
    new THREE.BoxGeometry(bW + 4.5, 2.8, bD + 4.5),
    getMat(pal.trim, { roughness: 0.25, metalness: 0.48 })
  );
  midBelt.position.set(0, baseY + lowerTierH, centerZ);
  group.add(midBelt);

  const parapet = new THREE.Mesh(
    new THREE.BoxGeometry(bW + 5.5, 5.0, bD + 5.5),
    getMat(pal.roof, { roughness: 0.26, metalness: 0.4 })
  );
  parapet.position.set(0, baseY + bH + 2.0, centerZ);
  parapet.castShadow = true;
  group.add(parapet);

  const neonFascia = new THREE.Mesh(
    new THREE.BoxGeometry(bW + 6.8, 2.1, bD + 6.8),
    getMat(pal.accent, { emissive: pal.accent, emissiveIntensity: 0.98 })
  );
  neonFascia.position.set(0, baseY + bH + 0.2, centerZ);
  group.add(neonFascia);

  // 3. Glowing 2nd-Story Clerestory Windows with 3D Mullion Frames & Stone Sills on Front (+Z) & Left (-X)
  const winMat = getPaintMat(0x7dd3fc, {
    roughness: 0.06,
    metalness: 0.88,
    clearcoat: 1.0,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.52
  });
  const frameMat = getMat(0x0f172a, { roughness: 0.3, metalness: 0.6 });
  const winY = baseY + lowerTierH + upperTierH * 0.52;
  const winH = upperTierH * 0.50;

  for (const wx of [-bW * 0.28, 0, bW * 0.28]) {
    const ww = bW * 0.21;
    const frameF = new THREE.Mesh(new THREE.BoxGeometry(ww + 2.0, winH + 2.0, 1.8), frameMat);
    frameF.position.set(wx, winY, frontZ - 0.6);
    const winF = new THREE.Mesh(new THREE.BoxGeometry(ww, winH, 2.2), winMat);
    winF.position.set(wx, winY, frontZ - 0.4);
    const mullionV = new THREE.Mesh(new THREE.BoxGeometry(1.1, winH, 2.5), frameMat);
    mullionV.position.set(wx, winY, frontZ - 0.3);
    const sillF = new THREE.Mesh(new THREE.BoxGeometry(ww + 3.2, 1.4, 3.0), getMat(0xcbd5e1));
    sillF.position.set(wx, winY - winH / 2 - 0.6, frontZ + 0.2);
    group.add(frameF, winF, mullionV, sillF);
  }

  for (const wz of [-bD * 0.24, bD * 0.24]) {
    const wd = bD * 0.27;
    const frameL = new THREE.Mesh(new THREE.BoxGeometry(1.8, winH + 2.0, wd + 2.0), frameMat);
    frameL.position.set(leftX + 0.6, winY, centerZ + wz);
    const winL = new THREE.Mesh(new THREE.BoxGeometry(2.2, winH, wd), winMat);
    winL.position.set(leftX + 0.4, winY, centerZ + wz);
    const mullionL = new THREE.Mesh(new THREE.BoxGeometry(2.5, winH, 1.1), frameMat);
    mullionL.position.set(leftX + 0.3, winY, centerZ + wz);
    group.add(frameL, winL, mullionL);
  }

  // Left-Side (-X) Service Entrance Door & Striped Awning
  const sideAwning = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 2.5, bD * 0.48),
    getMat(pal.accent, { roughness: 0.28 })
  );
  sideAwning.position.set(leftX - 3.4, baseY + lowerTierH * 0.74, centerZ);
  sideAwning.castShadow = true;
  group.add(sideAwning);

  const sideDoor = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, lowerTierH * 0.66, bD * 0.32),
    getMat(0x0f172a, { metalness: 0.6, roughness: 0.25 })
  );
  sideDoor.position.set(leftX - 0.2, baseY + lowerTierH * 0.33, centerZ);
  group.add(sideDoor);

  // 4. Building-Specific 3D Bays, Rotundas, Hydraulic Lifts, Turntables & Forecourt Vehicles
  if (type === 'dealerShowroom') {
    const rotundaGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(bW * 0.32, bW * 0.32, bH * 0.88, 24),
      getPaintMat(0x38bdf8, { roughness: 0.05, metalness: 0.9, clearcoat: 1.0, emissive: 0x0284c7, emissiveIntensity: 0.45 })
    );
    rotundaGlass.position.set(-bW * 0.22, baseY + bH * 0.44, frontZ - 2);
    group.add(rotundaGlass);

    // VIP Red Carpet & Rotating 3D Gold Showroom Turntable
    const ttBase = new THREE.Mesh(
      new THREE.CylinderGeometry(19.5, 21.5, 3.4, 24),
      getMat(0x0f172a, { roughness: 0.2, metalness: 0.6 })
    );
    ttBase.position.set(bW * 0.08, baseY + 1.7, frontZ + 12);
    const ttRim = new THREE.Mesh(
      new THREE.CylinderGeometry(20.8, 20.8, 2.0, 24),
      getMat(0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.95 })
    );
    ttRim.position.set(bW * 0.08, baseY + 1.3, frontZ + 12);
    group.add(ttBase, ttRim);

    const displayCar = create3DVehicle({ assetKey: 'naMuscle', direction: 'east' });
    displayCar.scale.set(0.58, 0.58, 0.58);
    displayCar.position.set(bW * 0.08, baseY + 3.2, frontZ + 12);
    group.add(displayCar);
    animParts.turntable = displayCar;
  } else if (type === 'testTrack') {
    const trackOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(w * 0.36, w * 0.36, 1.8, 28),
      getMat(0xef4444, { roughness: 0.5 })
    );
    trackOuter.position.set(0, baseY + 0.9, frontZ + 10);
    const trackAsphalt = new THREE.Mesh(
      new THREE.CylinderGeometry(w * 0.31, w * 0.31, 2.2, 28),
      getMat(0x0f172a, { roughness: 0.8 })
    );
    trackAsphalt.position.set(0, baseY + 1.1, frontZ + 10);
    group.add(trackOuter, trackAsphalt);

    const trackPivot = new THREE.Group();
    trackPivot.position.set(0, baseY + 2.2, frontZ + 10);
    const racer = create3DVehicle({ assetKey: 'rallyCar', direction: 'east' });
    racer.scale.set(0.48, 0.48, 0.48);
    racer.position.set(w * 0.22, 0, 0);
    racer.rotation.y = Math.PI / 2;
    trackPivot.add(racer);
    group.add(trackPivot);
    animParts.trackCar = trackPivot;
  } else {
    const bayCount = bW > 100 ? 2 : 1;
    const bayW = (bW * 0.72) / bayCount;
    const bayH = lowerTierH * 0.84;
    for (let i = 0; i < bayCount; i++) {
      const bx = bayCount === 1 ? 0 : (i === 0 ? -bW * 0.22 : bW * 0.22);
      // Warm illuminated workshop bay interior
      const bayInterior = new THREE.Mesh(
        new THREE.BoxGeometry(bayW, bayH, 8.5),
        getMat(0x0f172a, { roughness: 0.5, emissive: 0x1e293b, emissiveIntensity: 0.55 })
      );
      bayInterior.position.set(bx, baseY + bayH / 2, frontZ - 2.2);
      group.add(bayInterior);

      // Red Snap-On Style 3D Mechanic Tool Chest inside Bay
      const toolChest = new THREE.Mesh(
        new THREE.BoxGeometry(bayW * 0.32, bayH * 0.52, 3.5),
        getMat(0xef4444, { roughness: 0.25, metalness: 0.5 })
      );
      toolChest.position.set(bx - bayW * 0.26, baseY + bayH * 0.26, frontZ - 0.8);
      group.add(toolChest);

      const bayLight = new THREE.Mesh(
        new THREE.BoxGeometry(bayW * 0.78, 2.0, 3.2),
        getMat(0xfef08a, { emissive: 0xfacc15, emissiveIntensity: 1.35 })
      );
      bayLight.position.set(bx, baseY + bayH - 1.2, frontZ - 0.5);
      group.add(bayLight);

      // Corrugated 3D Roll-Up Door Header + Slat Ribs
      const rollDoor = new THREE.Mesh(
        new THREE.BoxGeometry(bayW + 2.4, 5.2, 3.2),
        getMat(pal.trim, { metalness: 0.55, roughness: 0.22 })
      );
      rollDoor.position.set(bx, baseY + bayH + 1.2, frontZ + 0.9);
      const slatRib = new THREE.Mesh(
        new THREE.BoxGeometry(bayW + 2.6, 1.1, 3.6),
        getMat(0x0f172a, { metalness: 0.7 })
      );
      slatRib.position.set(bx, baseY + bayH + 0.2, frontZ + 1.0);
      group.add(rollDoor, slatRib);
    }

    if (type === 'garage' || type === 'privateShop' || type === 'tireRepair') {
      const postMat = getMat(0xfacc15, { metalness: 0.5, roughness: 0.25 });
      const postL = new THREE.Mesh(new THREE.BoxGeometry(2.8, 23, 2.8), postMat);
      const postR = postL.clone();
      const liftX = bW > 100 ? -bW * 0.20 : 0;
      postL.position.set(liftX - 11.5, baseY + 11.5, frontZ + 8);
      postR.position.set(liftX + 11.5, baseY + 11.5, frontZ + 8);
      group.add(postL, postR);

      const liftPlatform = new THREE.Group();
      liftPlatform.position.set(liftX, baseY + 6.5, frontZ + 8);
      const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(25, 2.0, 13), postMat);
      liftPlatform.add(crossBeam);

      const bayCar = create3DVehicle({ assetKey: type === 'garage' ? 'blueCar' : 'superCar', direction: 'south' });
      bayCar.scale.set(0.50, 0.50, 0.50);
      bayCar.position.set(0, 1.2, 0);
      liftPlatform.add(bayCar);
      group.add(liftPlatform);
      animParts.liftCar = { node: liftPlatform, baseY: baseY + 6.5 };

      if (type === 'garage' && bW > 100) {
        const parked = create3DVehicle({ assetKey: 'jdmGtCoupe', direction: 'south' });
        parked.scale.set(0.52, 0.52, 0.52);
        parked.position.set(bW * 0.22, baseY + 0.5, frontZ + 11);
        group.add(parked);
      } else if (type === 'tireRepair') {
        const pumpCanopy = new THREE.Mesh(
          new THREE.BoxGeometry(bW * 0.55, 3.2, 16),
          getMat(0xef4444, { roughness: 0.3 })
        );
        pumpCanopy.position.set(bW * 0.18, baseY + 22, frontZ + 13);
        pumpCanopy.castShadow = true;
        const pColL = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 22, 8), getMat(0xf8fafc));
        pColL.position.set(bW * 0.02, baseY + 11, frontZ + 13);
        const pColR = pColL.clone();
        pColR.position.set(bW * 0.34, baseY + 11, frontZ + 13);
        const pumpBox = new THREE.Mesh(new THREE.BoxGeometry(6, 9, 4), getMat(0xfacc15));
        pumpBox.position.set(bW * 0.18, baseY + 4.5, frontZ + 13);
        group.add(pumpCanopy, pColL, pColR, pumpBox);
      }
    }

    if (type === 'partsHub' || type === 'partsWarehouse') {
      const cont1 = new THREE.Mesh(new THREE.BoxGeometry(16, 10, 24), getMat(0xf97316, { roughness: 0.4 }));
      cont1.position.set(leftX - 8, baseY + 5, centerZ + 6);
      cont1.castShadow = true;
      const cont2 = new THREE.Mesh(new THREE.BoxGeometry(16, 10, 22), getMat(0x38bdf8, { roughness: 0.4 }));
      cont2.position.set(leftX - 8, baseY + 15, centerZ + 5);
      cont2.castShadow = true;
      group.add(cont1, cont2);

      const fk = new THREE.Group();
      fk.position.set(0, baseY + 3, frontZ + 12);
      const fkBody = new THREE.Mesh(new THREE.BoxGeometry(12, 7.5, 8.5), getMat(0xf59e0b, { roughness: 0.3 }));
      const fkCab = new THREE.Mesh(new THREE.BoxGeometry(6.5, 6.5, 7.5), getMat(0x0f172a));
      fkCab.position.set(-1, 5.8, 0);
      const crate = new THREE.Mesh(new THREE.BoxGeometry(6.5, 5.5, 6.5), getMat(0x35e58a, { emissive: 0x10b981, emissiveIntensity: 0.4 }));
      crate.position.set(8.5, 1.2, 0);
      fk.add(fkBody, fkCab, crate);
      group.add(fk);
      animParts.forklift = { node: fk, baseX: 0, range: bW * 0.25 };
    }

    if (type === 'salvageBlock' || type === 'towDispatch') {
      const parkedTow = create3DVehicle({ assetKey: 'towTruck', direction: 'south' });
      parkedTow.scale.set(0.54, 0.54, 0.54);
      parkedTow.position.set(0, baseY + 0.5, frontZ + 12);
      group.add(parkedTow);
    }
  }

  // 5. 3D Rooftop Penthouse Skylight + Solar Panels + Spinning 3D HVAC Turbine Fans + Textured 3D Illuminated Marquee Billboard!
  const roofY = baseY + bH + 4.4;
  const skylight = new THREE.Mesh(
    new THREE.BoxGeometry(bW * 0.38, 6.5, bD * 0.34),
    getPaintMat(0x0284c7, { roughness: 0.12, metalness: 0.85, clearcoat: 1.0, emissive: 0x0369a1, emissiveIntensity: 0.45 })
  );
  skylight.position.set(0, roofY + 3.2, centerZ - 6);
  skylight.castShadow = true;
  group.add(skylight);

  // Rooftop Solar Panel Array behind Skylight
  const solarPanel = new THREE.Mesh(
    new THREE.BoxGeometry(bW * 0.48, 1.2, 12),
    getPaintMat(0x1e3a8a, { roughness: 0.1, metalness: 0.9, clearcoat: 1.0 })
  );
  solarPanel.position.set(0, roofY + 2.4, centerZ - bD * 0.34);
  solarPanel.rotation.x = 0.28;
  group.add(solarPanel);

  for (const rx of [-bW * 0.30, bW * 0.30]) {
    const fanHousing = new THREE.Mesh(
      new THREE.CylinderGeometry(7.2, 8.0, 4.2, 14),
      getMat(0x475569, { metalness: 0.6, roughness: 0.3 })
    );
    fanHousing.position.set(rx, roofY + 2.1, centerZ - bD * 0.14);
    group.add(fanHousing);

    const bladeGroup = new THREE.Group();
    bladeGroup.position.set(rx, roofY + 4.5, centerZ - bD * 0.14);
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(12, 0.9, 2.5), getMat(0xf8fafc, { metalness: 0.8 }));
    const b2 = b1.clone();
    b2.rotation.y = Math.PI / 2;
    bladeGroup.add(b1, b2);
    group.add(bladeGroup);
    animParts.rotors.push(bladeGroup);
  }

  // Real 3D Illuminated Marquee Billboard with Canvas Typography Texture & Steel Support Struts!
  const signW = Math.min(bW * 0.82, 88);
  const signH = 16.5;
  const signPost = new THREE.Group();
  signPost.position.set(0, roofY + 10.5, centerZ + bD * 0.26);

  // Steel Support Struts holding the rooftop billboard
  const strutMat = getMat(0x334155, { metalness: 0.75, roughness: 0.25 });
  for (const sx of [-signW * 0.34, signW * 0.34]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 12, 8), strutMat);
    leg.position.set(sx, -5.5, 0);
    signPost.add(leg);
  }

  // Dark metallic billboard cabinet + glowing neon border trim
  const signCabinet = new THREE.Mesh(
    new THREE.BoxGeometry(signW + 3, signH + 2.6, 4.2),
    getMat(0x0f172a, { roughness: 0.25, metalness: 0.75 })
  );
  signCabinet.castShadow = true;
  signPost.add(signCabinet);

  const signBorderRim = new THREE.Mesh(
    new THREE.BoxGeometry(signW + 4.2, signH + 3.6, 3.0),
    getMat(pal.accent, { emissive: pal.accent, emissiveIntensity: 0.85 })
  );
  signPost.add(signBorderRim);

  // Illuminated Textured Sign Face (Front +Z)
  const marqueeTex = makeMarqueeSignTexture(pal.sign || name, pal.sub || `LV ${level} · 365 AUTO`, pal.accent);
  const signFaceMat = new THREE.MeshBasicMaterial({ map: marqueeTex });
  const signFaceFront = new THREE.Mesh(new THREE.PlaneGeometry(signW, signH), signFaceMat);
  signFaceFront.position.set(0, 0, 2.25);
  signPost.add(signFaceFront);

  group.add(signPost);
  animParts.signGroup = signPost;

  // 5B. Simpsons: Tapped Out / SimCity BuildIt Floating 3D Collectible Token when Ready!
  if (ready) {
    const token3D = create3DCollectibleToken(pal.accent);
    token3D.position.set(0, roofY + 26, centerZ + bD * 0.15);
    group.add(token3D);
    animParts.collectible3D = { node: token3D, baseY: roofY + 26 };
  }

  if (selected) {
    const selGroup = new THREE.Group();
    selGroup.position.set(0, roofY + 18, 0);
    const haloRing = new THREE.Mesh(
      new THREE.TorusGeometry(Math.max(18, bW * 0.28), 1.6, 10, 28),
      getMat(0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.85 })
    );
    haloRing.rotation.x = Math.PI / 2;
    selGroup.add(haloRing);
    group.add(selGroup);
    animParts.selectionRing = selGroup;
  }

  // 6. Floating 3D Status Pill Badge Above Rooftop
  const hudSprite = makeLabelSprite(
    [
      selected ? `★ ${name} · Lv ${level}` : `${name} · Lv ${level}`,
      ready ? `✓ ${statusText}` : statusText
    ],
    {
      bgColor: selected ? 'rgba(69, 26, 3, 0.96)' : ready ? 'rgba(6, 46, 34, 0.95)' : 'rgba(6, 19, 29, 0.92)',
      borderColor: selected ? '#facc15' : ready ? '#35e58a' : '#38bdf8',
      textColor: selected ? '#fef08a' : '#ffffff',
      subColor: ready ? '#8fffc2' : '#fef08a',
      width: selected ? 168 : 152,
      height: 36,
      scale: selected ? 0.39 : 0.36
    }
  );
  hudSprite.position.set(0, roofY + (ready ? 40 : 28), 0);
  group.add(hudSprite);

  group.rotation.y = -(Math.abs(Number(rotation) || 0) % 4) * (Math.PI / 2);
  group._animParts = animParts;
  group._hudSprite = hudSprite;
  return group;
}

// ============================================================================
// 5. 3D EXPANDABLE TOWN FRONTIER PLOTS & UNLOCKED 3D SHOWCASE PLAZAS
// ============================================================================
export function create3DExpansionPlot(plot, unlocked = false) {
  const group = new THREE.Group();
  const w = plot.w;
  const d = plot.h;

  if (!unlocked) {
    const turf = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.88, 3.5, d * 0.84),
      getMat(0x0f291e, { roughness: 0.85 })
    );
    turf.position.y = 1.8;
    turf.receiveShadow = true;
    group.add(turf);

    const hw = w * 0.41;
    const hd = d * 0.39;
    const stakeGeo = new THREE.CylinderGeometry(2.2, 2.2, 16, 8);
    const stakeMat = getMat(0xfacc15, { roughness: 0.3, metalness: 0.5 });
    const capMat = getMat(0xef4444, { emissive: 0xef4444, emissiveIntensity: 0.8 });

    for (const [sx, sz] of [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]]) {
      const stake = new THREE.Mesh(stakeGeo, stakeMat);
      stake.position.set(sx, 9, sz);
      stake.castShadow = true;
      const cap = new THREE.Mesh(new THREE.SphereGeometry(3.2, 8, 8), capMat);
      cap.position.set(sx, 17.5, sz);
      group.add(stake, cap);
    }

    const railMat = getMat(0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.35 });
    const railFB = new THREE.BoxGeometry(hw * 2, 1.4, 1.4);
    const railLR = new THREE.BoxGeometry(1.4, 1.4, hd * 2);
    for (const sz of [-hd, hd]) {
      const r = new THREE.Mesh(railFB, railMat);
      r.position.set(0, 11, sz);
      group.add(r);
    }
    for (const sx of [-hw, hw]) {
      const r = new THREE.Mesh(railLR, railMat);
      r.position.set(sx, 11, 0);
      group.add(r);
    }

    const sign = makeLabelSprite(
      [`LOCKED · ${plot.name.toUpperCase()}`, `TAP TO EXPAND (${plot.cost}G) · ${plot.bonus}`],
      {
        bgColor: 'rgba(6, 19, 29, 0.95)',
        borderColor: '#facc15',
        textColor: '#fef08a',
        subColor: '#35e58a',
        width: 210,
        height: 44,
        scale: 0.40
      }
    );
    sign.position.set(0, 28, 0);
    group.add(sign);
    group._sign = sign;
  } else {
    const terrace = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.90, 6.5, d * 0.86),
      getMat(0xdbe4ef, { roughness: 0.55 })
    );
    terrace.position.y = 3.25;
    terrace.receiveShadow = true;
    terrace.castShadow = true;
    group.add(terrace);

    const innerPad = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.78, 7.2, d * 0.74),
      getMat(0x1e293b, { roughness: 0.7 })
    );
    innerPad.position.y = 3.4;
    innerPad.receiveShadow = true;
    group.add(innerPad);

    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(34, 37, 4, 24),
      getMat(0x0f172a, { metalness: 0.6, roughness: 0.25 })
    );
    ped.position.y = 8;
    const pedRing = new THREE.Mesh(
      new THREE.CylinderGeometry(36, 36, 2.2, 24),
      getMat(plot.color || 0x35e58a, { emissive: plot.color || 0x35e58a, emissiveIntensity: 0.9 })
    );
    pedRing.position.y = 7.5;
    group.add(ped, pedRing);

    const showcaseKeys = {
      harborPier: ['blueCar', 'rallyCar'],
      techLogistics: ['superCar', 'deliveryVan'],
      salvageAnnex: ['towTruck', 'greenTruck'],
      autoMallPlaza: ['naMuscle', 'superCar'],
      motorsportPark: ['jdmGtCoupe', 'rallyCar']
    }[plot.id] || ['blueCar', 'naMuscle'];

    const turntableGroup = new THREE.Group();
    turntableGroup.position.set(0, 10, 0);

    const carA = create3DVehicle({ assetKey: showcaseKeys[0], direction: 'east' });
    carA.scale.set(0.62, 0.62, 0.62);
    carA.position.set(-14, 0, -9);
    carA.rotation.y = 0.4;

    const carB = create3DVehicle({ assetKey: showcaseKeys[1], direction: 'east' });
    carB.scale.set(0.62, 0.62, 0.62);
    carB.position.set(14, 0, 9);
    carB.rotation.y = -2.7;

    turntableGroup.add(carA, carB);
    group.add(turntableGroup);
    group._turntable = turntableGroup;

    const treeL = create3DTree(0);
    treeL.position.set(-w * 0.34, 6, 0);
    const treeR = create3DTree(1);
    treeR.position.set(w * 0.34, 6, 0);
    group.add(treeL, treeR);

    const badge = makeLabelSprite(
      [`UNLOCKED · ${plot.name.toUpperCase()}`, plot.bonus],
      {
        bgColor: 'rgba(4, 34, 24, 0.95)',
        borderColor: '#35e58a',
        textColor: '#8fffc2',
        subColor: '#fef08a',
        width: 196,
        height: 40,
        scale: 0.38
      }
    );
    badge.position.set(0, 42, 0);
    group.add(badge);
  }

  return group;
}

// ============================================================================
// 6. 3D CITY INCIDENTS (3D POTHOLE CRATERS, 3D TOW RECOVERY, 3D TRAFFIC GANTRIES)
// ============================================================================
export function create3DIncident({ key, score }) {
  const group = new THREE.Group();

  if (key === 'potholes') {
    const craterRim = new THREE.Mesh(
      new THREE.CylinderGeometry(14, 16, 1.4, 12),
      getMat(0x334155, { roughness: 0.9 })
    );
    craterRim.position.y = 0.7;
    const craterHole = new THREE.Mesh(
      new THREE.CylinderGeometry(10, 8, 1.8, 10),
      getMat(0x090d16, { roughness: 0.95 })
    );
    craterHole.position.y = 0.8;
    group.add(craterRim, craterHole);

    const coneMat = getMat(0xf97316, { emissive: 0xea580c, emissiveIntensity: 0.45 });
    for (const cx of [-13, 13]) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(2.8, 8.0, 8), coneMat);
      cone.position.set(cx, 4.2, 8);
      cone.castShadow = true;
      group.add(cone);
    }

    const badge = makeLabelSprite(`POTHOLE ${score}%`, {
      borderColor: '#f97316',
      textColor: '#fed7aa',
      width: 118,
      height: 28,
      scale: 0.34
    });
    badge.position.set(0, 21, 0);
    group.add(badge);
  } else if (key === 'vehicleBreakdowns' || key === 'stuckVehicles') {
    const tow = create3DVehicle({ assetKey: 'towTruck', direction: 'west', showBadge: false });
    tow.scale.set(0.64, 0.64, 0.64);
    tow.position.set(-26, 0, 0);
    group.add(tow);

    const broken = create3DVehicle({ assetKey: 'naMuscle', direction: 'west', showBadge: false });
    broken.scale.set(0.60, 0.60, 0.60);
    broken.position.set(24, 2.5, 0);
    broken.rotation.z = 0.14;
    group.add(broken);
    group._brokenCar = broken;

    const smokeA = new THREE.Mesh(
      new THREE.SphereGeometry(4.0, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xcbd5e1, transparent: true, opacity: 0.65 })
    );
    smokeA.position.set(14, 14, 0);
    group.add(smokeA);
    group._smoke = smokeA;

    const badge = makeLabelSprite(`TOW OPS · ${score}%`, {
      borderColor: '#facc15',
      textColor: '#fef08a',
      width: 126,
      height: 28,
      scale: 0.34
    });
    badge.position.set(0, 28, 0);
    group.add(badge);
  } else if (key === 'trafficLights') {
    const badge = makeLabelSprite(`SIGNAL ${score}%`, {
      borderColor: '#38bdf8',
      textColor: '#e0f2fe',
      width: 110,
      height: 26,
      scale: 0.32
    });
    badge.position.set(-38, 35, -42);
    group.add(badge);
  } else {
    // 3D Road Hazard Barricade & Cones for Traffic Jams
    const barBeam = new THREE.Mesh(
      new THREE.BoxGeometry(16, 3.2, 2.2),
      getMat(0xf97316, { emissive: 0xea580c, emissiveIntensity: 0.45 })
    );
    barBeam.position.set(0, 5.5, 0);
    barBeam.castShadow = true;
    group.add(barBeam);

    const badge = makeLabelSprite(`JAM ${score}%`, {
      borderColor: '#a855f7',
      textColor: '#f3e8ff',
      width: 106,
      height: 26,
      scale: 0.32
    });
    badge.position.set(0, 18, 0);
    group.add(badge);
  }

  return group;
}

// ============================================================================
// 6B. 3D INTERSECTION TRAFFIC LIGHT GANTRIES & SIMPSONS TAPPED OUT / SIMCITY PROPS
// ============================================================================
export function getIntersectionLightState(hIndex, vIndex, clock) {
  const offset = (hIndex * 3.7 + vIndex * 5.3) % 16;
  const phase = (clock + offset) % 16;
  if (phase < 6.4) {
    return { ew: 'green', ns: 'red' };
  }
  if (phase < 8.0) {
    return { ew: 'yellow', ns: 'red' };
  }
  if (phase < 14.4) {
    return { ew: 'red', ns: 'green' };
  }
  return { ew: 'red', ns: 'yellow' };
}

function createSignalBox(rotationY = 0) {
  const boxGroup = new THREE.Group();
  const housing = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 10.6, 3.6),
    getMat(0xfacc15, { roughness: 0.32, metalness: 0.18 })
  );
  housing.castShadow = true;
  boxGroup.add(housing);

  const backing = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 9.8, 0.6),
    getMat(0x0f172a, { roughness: 0.7 })
  );
  backing.position.z = 1.65;
  boxGroup.add(backing);

  const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2.2, roughness: 0.2 });
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 0.1, roughness: 0.2 });
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.1, roughness: 0.2 });

  const redBulb = new THREE.Mesh(new THREE.SphereGeometry(1.25, 10, 10), redMat);
  redBulb.position.set(0, 3.1, 1.9);
  const yellowBulb = new THREE.Mesh(new THREE.SphereGeometry(1.25, 10, 10), yellowMat);
  yellowBulb.position.set(0, 0, 1.9);
  const greenBulb = new THREE.Mesh(new THREE.SphereGeometry(1.25, 10, 10), greenMat);
  greenBulb.position.set(0, -3.1, 1.9);

  boxGroup.add(redBulb, yellowBulb, greenBulb);
  boxGroup.rotation.y = rotationY;
  boxGroup._mats = { redMat, yellowMat, greenMat };
  return boxGroup;
}

function create3DIntersectionTrafficSignal(ix, iz, rw) {
  const group = new THREE.Group();
  const poleMat = getMat(0x334155, { metalness: 0.68, roughness: 0.28 });

  // NW Corner Gantry (controls Southbound & Eastbound)
  const poleNW = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.7, 29, 10), poleMat);
  poleNW.position.set(ix - 8, 14.5, iz - 8);
  poleNW.castShadow = true;

  const armNW_E = new THREE.Mesh(new THREE.BoxGeometry(28, 1.3, 1.3), poleMat);
  armNW_E.position.set(ix + 6, 27.5, iz - 8);
  const sigNS = createSignalBox(0);
  sigNS.position.set(ix + 15, 24.5, iz - 8);

  // SE Corner Gantry (controls Northbound & Westbound)
  const poleSE = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.7, 29, 10), poleMat);
  poleSE.position.set(ix + rw + 8, 14.5, iz + rw + 8);
  poleSE.castShadow = true;

  const armSE_N = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 28), poleMat);
  armSE_N.position.set(ix + rw + 8, 27.5, iz + rw - 6);
  const sigEW = createSignalBox(Math.PI * 0.5);
  sigEW.position.set(ix + rw + 8, 24.5, iz + rw - 15);

  group.add(poleNW, armNW_E, sigNS, poleSE, armSE_N, sigEW);
  group._sigEW = sigEW;
  group._sigNS = sigNS;
  return group;
}

function create3DParkFountain() {
  const group = new THREE.Group();
  const stoneMat = getMat(0xe2e8f0, { roughness: 0.5 });
  const waterMat = getMat(0x38bdf8, { emissive: 0x0284c7, emissiveIntensity: 0.45, roughness: 0.15, metalness: 0.2 });

  const outerBasin = new THREE.Mesh(new THREE.CylinderGeometry(18, 20, 4.2, 20), stoneMat);
  outerBasin.position.y = 2.1;
  outerBasin.castShadow = true;
  outerBasin.receiveShadow = true;

  const poolWater = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 3.6, 20), waterMat);
  poolWater.position.y = 2.4;

  const midPillar = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.8, 11, 14), stoneMat);
  midPillar.position.y = 6.5;
  midPillar.castShadow = true;

  const upperBowl = new THREE.Mesh(new THREE.CylinderGeometry(9.5, 6.0, 2.6, 16), stoneMat);
  upperBowl.position.y = 11.5;
  upperBowl.castShadow = true;

  const waterPlume = new THREE.Mesh(
    new THREE.ConeGeometry(4.2, 8.5, 12),
    getMat(0x7dd3fc, { emissive: 0x38bdf8, emissiveIntensity: 0.65, transparent: true, opacity: 0.82 })
  );
  waterPlume.position.y = 16.2;

  group.add(outerBasin, poolWater, midPillar, upperBowl, waterPlume);
  group._plume = waterPlume;
  return group;
}

function create3DParkBench(rotationY = 0) {
  const group = new THREE.Group();
  const woodMat = getMat(0xd97706, { roughness: 0.55 });
  const ironMat = getMat(0x1e293b, { metalness: 0.7, roughness: 0.35 });

  const seat = new THREE.Mesh(new THREE.BoxGeometry(14, 1.2, 4.6), woodMat);
  seat.position.y = 3.2;
  seat.castShadow = true;
  const back = new THREE.Mesh(new THREE.BoxGeometry(14, 4.2, 1.0), woodMat);
  back.position.set(0, 5.4, -1.8);
  back.rotation.x = -0.15;
  back.castShadow = true;

  const legL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.2, 4.4), ironMat);
  legL.position.set(-5.5, 1.6, 0);
  const legR = legL.clone();
  legR.position.x = 5.5;

  group.add(seat, back, legL, legR);
  group.rotation.y = rotationY;
  return group;
}

function create3DFireHydrant() {
  const group = new THREE.Group();
  const redMat = getMat(0xef4444, { roughness: 0.35, metalness: 0.25 });
  const capMat = getMat(0xf8fafc, { roughness: 0.3, metalness: 0.5 });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.3, 6.5, 10), redMat);
  body.position.y = 3.25;
  body.castShadow = true;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(2.0, 10, 8), capMat);
  dome.position.y = 6.5;
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 5.2, 8), capMat);
  nozzle.rotation.z = Math.PI * 0.5;
  nozzle.position.y = 4.4;
  group.add(body, dome, nozzle);
  return group;
}

// ============================================================================
// 7. COMPLETE THREE.JS 3D WEBGL TOON CITY SCENE CONTROLLER
// ============================================================================
const CAMERA_PRESETS = [
  { id: 'toon3d',   label: '3D City',   fov: 42, offset: { x: -155, y: 315, z: 345 } },
  { id: 'street3d', label: '3D Street', fov: 40, offset: { x: -75,  y: 128, z: 210 } },
  { id: 'iso3d',    label: '3D High',   fov: 45, offset: { x: -190, y: 445, z: 395 } }
];

export class Three3DCityViewport {
  constructor(host, config) {
    this.host = host;
    this.WORLD = config.WORLD;
    this.ROADS = config.ROADS;
    this.GRID = config.GRID;
    this.presetIndex = 0;
    this.zoom = 1.0;

    this.scene = new THREE.Scene();
    // Sunlit Simpsons Tapped Out / SimCity BuildIt vibrant emerald-sky atmosphere
    this.scene.background = new THREE.Color(0x1b4332);
    this.scene.fog = new THREE.FogExp2(0x1b4332, 0.00042);

    const w = Math.max(320, host.clientWidth || 420);
    const h = Math.max(320, host.clientHeight || 420);

    this.camera = new THREE.PerspectiveCamera(CAMERA_PRESETS[0].fov, w / h, 10, 2900);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1.5, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;

    this.canvas = this.renderer.domElement;
    this.canvas.className = 'three3dWorldCanvas';
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;z-index:5;touch-action:none;';
    host.appendChild(this.canvas);

    // 1. Golden-Hour 3D Lighting & Crisp Cast Shadows
    const hemi = new THREE.HemisphereLight(0xf0f9ff, 0x14532d, 1.22);
    this.scene.add(hemi);

    this.sunLight = new THREE.DirectionalLight(0xfffbeb, 2.25);
    this.sunLight.position.set(480, 460, 420);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 60;
    this.sunLight.shadow.camera.far = 1300;
    const d = 410;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0006;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.75);
    rimLight.position.set(-320, 240, -280);
    this.scene.add(rimLight);

    // 2. Scene Layers
    this.staticLayer = new THREE.Group();
    this.fixedBuildingLayer = new THREE.Group();
    this.placedBuildingLayer = new THREE.Group();
    this.expansionLayer = new THREE.Group();
    this.incidentLayer = new THREE.Group();
    this.gridLayer = new THREE.Group();
    this.ghostLayer = new THREE.Group();
    this.trafficLayer = new THREE.Group();
    this.walkerLayer = new THREE.Group();

    this.scene.add(
      this.staticLayer,
      this.fixedBuildingLayer,
      this.placedBuildingLayer,
      this.expansionLayer,
      this.incidentLayer,
      this.gridLayer,
      this.ghostLayer,
      this.trafficLayer,
      this.walkerLayer
    );

    this.interactiveTargets = [];
    this.buildingRecords3D = [];
    this.expansionRecords3D = [];
    this.incidentRecords3D = [];
    this.treeRecords3D = [];
    this.trafficLightRecords3D = [];
    this.fountainRecords3D = [];
    this.trafficMeshes = new Map();
    this.walkerMeshes = new Map();

    this.raycaster = new THREE.Raycaster();
    this.buildStatic3DCity();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
  }

  resize() {
    if (!this.host) return;
    const w = Math.max(300, this.host.clientWidth || 420);
    const h = Math.max(300, this.host.clientHeight || 420);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  cycleCameraPreset() {
    this.presetIndex = (this.presetIndex + 1) % CAMERA_PRESETS.length;
    const preset = CAMERA_PRESETS[this.presetIndex];
    this.camera.fov = preset.fov;
    this.camera.updateProjectionMatrix();
    return preset;
  }

  currentPreset() {
    return CAMERA_PRESETS[this.presetIndex] || CAMERA_PRESETS[0];
  }

  setZoom(nextZoom) {
    this.zoom = Math.max(0.42, Math.min(1.85, Number(nextZoom) || 1.0));
    return this.zoom;
  }

  zoomIn(step = 0.18) {
    return this.setZoom(this.zoom - step);
  }

  zoomOut(step = 0.18) {
    return this.setZoom(this.zoom + step);
  }

  registerClickable(object3D, callback) {
    object3D.userData.onTap = callback;
    this.interactiveTargets.push(object3D);
  }

  handleTap(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(ndc, this.camera);

    const invokeFirstTap = (objects) => {
      if (!objects || !objects.length) return false;
      const hits = this.raycaster.intersectObjects(objects, true);
      for (const hit of hits) {
        let curr = hit.object;
        while (curr) {
          if (typeof curr.userData?.onTap === 'function') {
            curr.userData.onTap();
            return true;
          }
          curr = curr.parent;
        }
      }
      return false;
    };

    if (this.gridLayer.visible) {
      if (invokeFirstTap(this.gridLayer.children)) return true;
    }

    // Priority 1: Walking People & Street Vehicles (never let buildings or road markers swallow taps on people/cars!)
    if (invokeFirstTap([...this.walkerLayer.children, ...this.trafficLayer.children])) {
      return true;
    }

    // Priority 2: Buildings, Expansions & Roadside Incidents
    if (invokeFirstTap([
      ...this.fixedBuildingLayer.children,
      ...this.placedBuildingLayer.children,
      ...this.expansionLayer.children,
      ...this.incidentLayer.children
    ])) {
      return true;
    }

    return invokeFirstTap(this.interactiveTargets);
  }

  buildStatic3DCity() {
    const { WORLD, ROADS } = this;

    // 0. Lush Simpsons Tapped Out / SimCity BuildIt Outer Suburban Meadow & East Harbor Water Canal
    const outerMeadow = new THREE.Mesh(
      new THREE.BoxGeometry(WORLD.width + 2200, 4, WORLD.height + 2200),
      getMat(0x2d6a4f, { roughness: 0.85 })
    );
    outerMeadow.position.set(WORLD.width / 2, -3.2, WORLD.height / 2);
    outerMeadow.receiveShadow = true;
    this.staticLayer.add(outerMeadow);

    // East Harbor Sparkling Blue Water Canal along the right edge
    const harborWater = new THREE.Mesh(
      new THREE.BoxGeometry(420, 4.5, WORLD.height + 1600),
      getMat(0x0284c7, { emissive: 0x0369a1, emissiveIntensity: 0.28, roughness: 0.18, metalness: 0.25 })
    );
    harborWater.position.set(WORLD.width + 245, -1.5, WORLD.height / 2);
    this.staticLayer.add(harborWater);

    const seawall = new THREE.Mesh(
      new THREE.BoxGeometry(18, 7.5, WORLD.height + 600),
      getMat(0x94a3b8, { roughness: 0.6 })
    );
    seawall.position.set(WORLD.width + 32, 1.5, WORLD.height / 2);
    this.staticLayer.add(seawall);

    // 1. Base 3D Asphalt Ground Plane
    const baseAsphalt = new THREE.Mesh(
      new THREE.BoxGeometry(WORLD.width + 80, 4, WORLD.height + 80),
      getMat(0x1e293b, { roughness: 0.82 })
    );
    baseAsphalt.position.set(WORLD.width / 2, -2, WORLD.height / 2);
    baseAsphalt.receiveShadow = true;
    this.staticLayer.add(baseAsphalt);

    // 2. 3D Extruded Concrete Sidewalks & Raised Lush Park Blocks!
    const vRoads = ROADS.vertical.map((r) => r.x).sort((a, b) => a - b);
    const hRoads = ROADS.horizontal.map((r) => r.y).sort((a, b) => a - b);

    const xCols = [];
    let prevX = -40;
    for (const vx of vRoads) {
      xCols.push({ x1: prevX, x2: vx });
      prevX = vx + ROADS.width;
    }
    xCols.push({ x1: prevX, x2: WORLD.width + 40 });

    const yRows = [];
    let prevY = -40;
    for (const hy of hRoads) {
      yRows.push({ y1: prevY, y2: hy });
      prevY = hy + ROADS.width;
    }
    yRows.push({ y1: prevY, y2: WORLD.height + 40 });

    const sw = ROADS.sidewalk;
    for (const row of yRows) {
      for (const col of xCols) {
        const bx = col.x1;
        const bz = row.y1;
        const bw = col.x2 - col.x1;
        const bd = row.y2 - row.y1;

        // 3D Raised Concrete Sidewalk Slab (height = 4.5)
        const curbSlab = new THREE.Mesh(
          new THREE.BoxGeometry(bw, 4.5, bd),
          getMat(0xdbe4ee, { roughness: 0.55 })
        );
        curbSlab.position.set(bx + bw / 2, 2.25, bz + bd / 2);
        curbSlab.receiveShadow = true;
        curbSlab.castShadow = true;
        this.staticLayer.add(curbSlab);

        // 3D Raised Emerald Toon Park Lawn inside the sidewalk perimeter
        const lx1 = bx < 0 ? bx : bx + sw;
        const lx2 = bx + bw > WORLD.width ? bx + bw : bx + bw - sw;
        const lz1 = bz < 0 ? bz : bz + sw;
        const lz2 = bz + bd > WORLD.height ? bz + bd : bz + bd - sw;
        const lw = lx2 - lx1;
        const ld = lz2 - lz1;
        if (lw > 20 && ld > 20) {
          const lawnSlab = new THREE.Mesh(
            new THREE.BoxGeometry(lw, 5.4, ld),
            getMat(0x38a13c, { roughness: 0.65 })
          );
          lawnSlab.position.set(lx1 + lw / 2, 2.7, lz1 + ld / 2);
          lawnSlab.receiveShadow = true;
          this.staticLayer.add(lawnSlab);

          // Lighter mowing stripe bands on the 3D lawn
          for (let sz = lz1 + 24; sz < lz2 - 20; sz += 52) {
            const stripe = new THREE.Mesh(
              new THREE.BoxGeometry(lw - 8, 5.6, 22),
              getMat(0x4ade80, { roughness: 0.65 })
            );
            stripe.position.set(lx1 + lw / 2, 2.75, sz);
            stripe.receiveShadow = true;
            this.staticLayer.add(stripe);
          }
        }
      }
    }

    // 3. 3D Road Markings: Double Amber-Gold Center Dividers, White Stop Bars, & 3D Zebra Crosswalks
    const yellowMat = getMat(0xfacc15, { emissive: 0xf59e0b, emissiveIntensity: 0.35 });
    const whiteMat = getMat(0xf8fafc, { roughness: 0.4 });

    for (const road of ROADS.horizontal) {
      const cz = road.y + ROADS.width / 2;
      for (const col of xCols) {
        const sx1 = Math.max(0, col.x1 + 16);
        const sx2 = Math.min(WORLD.width, col.x2 - 16);
        const swLen = sx2 - sx1;
        if (swLen <= 20) continue;

        const line1 = new THREE.Mesh(new THREE.BoxGeometry(swLen, 0.5, 1.8), yellowMat);
        line1.position.set(sx1 + swLen / 2, 0.3, cz - 2.0);
        const line2 = new THREE.Mesh(new THREE.BoxGeometry(swLen, 0.5, 1.8), yellowMat);
        line2.position.set(sx1 + swLen / 2, 0.3, cz + 2.0);
        this.staticLayer.add(line1, line2);
      }

      // Floating 3D Avenue Sign
      const aveSign = makeLabelSprite(road.label, {
        bgColor: 'rgba(6, 19, 29, 0.90)',
        borderColor: '#35e58a',
        textColor: '#e2e8f0',
        width: 138,
        height: 24,
        scale: 0.32
      });
      aveSign.position.set(125, 12, road.y - 16);
      this.staticLayer.add(aveSign);
    }

    for (const road of ROADS.vertical) {
      const cx = road.x + ROADS.width / 2;
      for (const row of yRows) {
        const sz1 = Math.max(0, row.y1 + 16);
        const sz2 = Math.min(WORLD.height, row.y2 - 16);
        const shLen = sz2 - sz1;
        if (shLen <= 20) continue;

        const line1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, shLen), yellowMat);
        line1.position.set(cx - 2.0, 0.3, sz1 + shLen / 2);
        const line2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, shLen), yellowMat);
        line2.position.set(cx + 2.0, 0.3, sz1 + shLen / 2);
        this.staticLayer.add(line1, line2);
      }
    }

    // 3D Raised Zebra Crosswalks, White Stop Bars, & 8 Live 3D Traffic Signal Gantries at every Intersection
    ROADS.horizontal.forEach((h, hIndex) => {
      ROADS.vertical.forEach((v, vIndex) => {
        const ix = v.x;
        const iz = h.y;
        const rw = ROADS.width;
        const cx = ix + rw / 2;
        const cz = iz + rw / 2;
        for (const off of [-26, -13, 0, 13, 26]) {
          const barN = new THREE.Mesh(new THREE.BoxGeometry(6, 0.6, 12), whiteMat);
          barN.position.set(cx + off, 0.35, iz - 10);
          const barS = barN.clone();
          barS.position.set(cx + off, 0.35, iz + rw + 10);

          const barW = new THREE.Mesh(new THREE.BoxGeometry(12, 0.6, 6), whiteMat);
          barW.position.set(ix - 10, 0.35, cz + off);
          const barE = barW.clone();
          barE.position.set(ix + rw + 10, 0.35, cz + off);
          this.staticLayer.add(barN, barS, barW, barE);
        }

        // Crisp White Stop Lines before each crosswalk
        const stopW = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.65, 38), whiteMat);
        stopW.position.set(ix - 19, 0.36, cz + 20);
        const stopE = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.65, 38), whiteMat);
        stopE.position.set(ix + rw + 19, 0.36, cz - 20);
        const stopN = new THREE.Mesh(new THREE.BoxGeometry(38, 0.65, 3.2), whiteMat);
        stopN.position.set(cx - 20, 0.36, iz - 19);
        const stopS = new THREE.Mesh(new THREE.BoxGeometry(38, 0.65, 3.2), whiteMat);
        stopS.position.set(cx + 20, 0.36, iz + rw + 19);
        this.staticLayer.add(stopW, stopE, stopN, stopS);

        // 3D Intersection Traffic Signal Gantry
        const sigNode = create3DIntersectionTrafficSignal(ix, iz, rw);
        this.staticLayer.add(sigNode);
        this.trafficLightRecords3D.push({ hIndex, vIndex, node: sigNode });
      });
    });

    // 4. Simpsons Tapped Out / SimCity BuildIt Town Plaza Fountains, Benches, Hydrants, & Swaying Park Trees
    const fountainCoords = [
      [384, 134],
      [384, 442],
      [598, 765]
    ];
    for (const [fx, fz] of fountainCoords) {
      const ftn = create3DParkFountain();
      ftn.position.set(fx, 5.2, fz);
      this.staticLayer.add(ftn);
      this.fountainRecords3D.push(ftn);
    }

    const benchCoords = [
      [384, 162, 0],
      [384, 470, 0],
      [598, 792, 0]
    ];
    for (const [bx, bz, rot] of benchCoords) {
      const bench = create3DParkBench(rot);
      bench.position.set(bx, 5.2, bz);
      this.staticLayer.add(bench);
    }

    const hydrantCoords = [
      [230, 222], [642, 222], [230, 532], [642, 532], [230, 852], [642, 852]
    ];
    for (const [hx, hz] of hydrantCoords) {
      const hyd = create3DFireHydrant();
      hyd.position.set(hx, 4.5, hz);
      this.staticLayer.add(hyd);
    }

    const treePositions = [
      [390, 192], [608, 170], [390, 502], [608, 478], [390, 798], [608, 725],
      [60, 175], [195, 175], [60, 485], [195, 485], [60, 805], [195, 805],
      [785, 175], [915, 175], [785, 485], [915, 485]
    ];
    treePositions.forEach(([tx, tz], idx) => {
      const tree = create3DTree(idx);
      tree.position.set(tx, 5.2, tz);
      this.staticLayer.add(tree);
      this.treeRecords3D.push({ tree, phase: idx * 1.2 });
    });

    const lampPositions = [
      [220, 215], [590, 215], [220, 525], [590, 525], [220, 845], [590, 845], [220, 1175], [590, 1175]
    ];
    lampPositions.forEach(([lx, lz]) => {
      const lamp = create3DStreetlight();
      lamp.position.set(lx, 4.5, lz);
      this.staticLayer.add(lamp);
    });
  }

  clearLayerWithClickables(layer) {
    const toRemove = new Set();
    layer.traverse((child) => {
      if (child.userData?.onTap) toRemove.add(child);
    });
    if (toRemove.size) {
      this.interactiveTargets = this.interactiveTargets.filter((item) => !toRemove.has(item));
    }
    while (layer.children.length) {
      layer.remove(layer.children[0]);
    }
  }

  rebuildBuildings3D(fixedDescriptorList, placedDescriptorList) {
    this.clearLayerWithClickables(this.fixedBuildingLayer);
    this.clearLayerWithClickables(this.placedBuildingLayer);
    this.buildingRecords3D = [];

    for (const desc of fixedDescriptorList) {
      const b3d = create3DBuilding(desc);
      b3d.position.set(desc.x + desc.w / 2, 4.5, desc.y + desc.h / 2);
      if (desc.onTap) this.registerClickable(b3d, desc.onTap);
      this.fixedBuildingLayer.add(b3d);
      this.buildingRecords3D.push(b3d);
    }

    for (const desc of placedDescriptorList) {
      const b3d = create3DBuilding(desc);
      b3d.position.set(desc.x + desc.w / 2, 4.5, desc.y + desc.h / 2);
      if (desc.onTap) this.registerClickable(b3d, desc.onTap);
      this.placedBuildingLayer.add(b3d);
      this.buildingRecords3D.push(b3d);
    }
  }

  rebuildExpansions3D(plots, isUnlockedFn, onUnlockTap) {
    this.clearLayerWithClickables(this.expansionLayer);
    this.expansionRecords3D = [];

    plots.forEach((plot, idx) => {
      const unlocked = isUnlockedFn(plot.id);
      const node3d = create3DExpansionPlot(plot, unlocked);
      node3d.position.set(plot.x + plot.w / 2, 4.5, plot.y + plot.h / 2);
      if (!unlocked && onUnlockTap) {
        this.registerClickable(node3d, () => onUnlockTap(plot.id));
      }
      this.expansionLayer.add(node3d);
      this.expansionRecords3D.push({ node: node3d, phase: idx * 1.1 });
    });
  }

  rebuildIncidents3D(incidentDescriptors) {
    this.clearLayerWithClickables(this.incidentLayer);
    this.incidentRecords3D = [];

    incidentDescriptors.forEach((inc, idx) => {
      const node3d = create3DIncident(inc);
      node3d.position.set(inc.x, 0.5, inc.y);
      if (inc.onTap) this.registerClickable(node3d, inc.onTap);
      this.incidentLayer.add(node3d);
      this.incidentRecords3D.push({ node: node3d, phase: idx * 1.4 });
    });
  }

  rebuildGrid3D(visible, cells, ghostDesc) {
    this.clearLayerWithClickables(this.gridLayer);
    this.clearLayerWithClickables(this.ghostLayer);
    this.gridLayer.visible = visible;
    if (!visible) return;

    for (const cell of cells) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(cell.w - 3, 1.5, cell.h - 3),
        getMat(cell.ok ? 0x35e58a : 0xff5d73, {
          transparent: true,
          opacity: cell.ok ? 0.32 : 0.25,
          emissive: cell.ok ? 0x35e58a : 0xff5d73,
          emissiveIntensity: 0.3
        })
      );
      mesh.position.set(cell.x + cell.w / 2, 6.2, cell.y + cell.h / 2);
      if (cell.ok && cell.onTap) this.registerClickable(mesh, cell.onTap);
      this.gridLayer.add(mesh);
    }

    if (ghostDesc) {
      const ghost = create3DBuilding(ghostDesc);
      ghost.position.set(ghostDesc.x + ghostDesc.w / 2, 4.5, ghostDesc.y + ghostDesc.h / 2);
      this.ghostLayer.add(ghost);
    }
  }

  updateFrame({ dt, clock, worldPanX, worldPanY, traffic, walkers, pathPointFn, potholes }) {
    if (!this.host) return;
    const viewW = Math.max(320, this.host.clientWidth || 420);
    const viewH = Math.max(320, this.host.clientHeight || 420);

    // 1. Sync 3D Camera & Directional Sun Shadow Frustum with Pan Position & Zoom
    const focusX = -worldPanX + viewW * 0.5;
    const focusZ = -worldPanY + viewH * 0.5;
    const preset = this.currentPreset();

    this.camera.position.set(
      focusX + preset.offset.x * this.zoom,
      preset.offset.y * this.zoom,
      focusZ + preset.offset.z * this.zoom
    );
    this.camera.lookAt(focusX, 12, focusZ - 10);

    this.sunLight.position.set(focusX + 210, 440, focusZ + 250);
    this.sunLight.target.position.set(focusX, 0, focusZ);
    this.sunLight.target.updateMatrixWorld();

    // 1B. Update Live 3D Traffic Signal Gantries at all 8 Intersections
    for (const rec of this.trafficLightRecords3D) {
      const state = getIntersectionLightState(rec.hIndex, rec.vIndex, clock);
      const applySignalState = (sigGroup, colorState) => {
        if (!sigGroup || !sigGroup._mats) return;
        sigGroup._mats.redMat.emissiveIntensity = colorState === 'red' ? 2.6 : 0.08;
        sigGroup._mats.yellowMat.emissiveIntensity = colorState === 'yellow' ? 2.4 : 0.08;
        sigGroup._mats.greenMat.emissiveIntensity = colorState === 'green' ? 2.5 : 0.08;
      };
      applySignalState(rec.node._sigEW, state.ew);
      applySignalState(rec.node._sigNS, state.ns);
    }

    // 1C. Animate Park Fountains
    for (const ftn of this.fountainRecords3D) {
      if (ftn._plume) {
        ftn._plume.scale.y = 0.88 + Math.sin(clock * 6.5) * 0.16;
        ftn._plume.rotation.y += dt * 2.4;
      }
    }

    // 2. Update 3D Traffic Vehicles (Real Speed-Synchronized Wheel Spin, Braking Nose-Dive, Brake Lights, Zero Fake Bounce)
    for (const item of traffic) {
      let mesh3d = this.trafficMeshes.get(item);
      if (!mesh3d) {
        mesh3d = create3DVehicle({
          assetKey: item.assetKey || 'skylineR34',
          direction: item.direction || 'east',
          towTargetKey: item.towTargetKey || '',
          showBadge: true
        });
        const sc = (item.scale || 0.80) * 1.08;
        mesh3d.scale.set(sc, sc, sc);
        if (item.onTap) this.registerClickable(mesh3d, item.onTap);
        this.trafficLayer.add(mesh3d);
        this.trafficMeshes.set(item, mesh3d);
      }

      if (mesh3d._modelTag) {
        mesh3d._modelTag.visible = Boolean(this.zoom <= 0.88 || preset.id === 'street3d' || item.isSelected);
      }
      if (mesh3d._selectionRing) {
        mesh3d._selectionRing.visible = Boolean(item.isSelected);
        if (item.isSelected) {
          const sPulse = 1 + Math.sin(clock * 5.0) * 0.08;
          mesh3d._selectionRing.scale.set(sPulse, sPulse, 1);
        }
      }

      const pNow = pathPointFn(item.path, item.d);
      const pNext = pathPointFn(item.path, item.d + 6);
      const dx = pNext.x - pNow.x;
      const dz = pNext.y - pNow.y;
      if (Math.hypot(dx, dz) > 0.01) {
        mesh3d.rotation.y = Math.atan2(-dz, dx);
      }

      const actualSpeed = item.currentSpeed !== undefined ? item.currentSpeed : (item.speed || 80);

      let potholeJoltY = 0;
      let potholePitch = 0;
      if (actualSpeed > 3) {
        for (const pot of potholes) {
          const dist = Math.hypot(pNow.x - pot.x, pNow.y - pot.y);
          if (dist < 44) {
            const intensity = 1 - dist / 44;
            potholeJoltY = Math.abs(Math.sin(item.d * 0.9)) * 3.2 * intensity;
            potholePitch = Math.cos(item.d * 0.85) * 0.11 * intensity;
            break;
          }
        }
      }

      mesh3d.position.set(pNow.x, 0.2 + potholeJoltY, pNow.y);

      // Spin all 4 3D cylindrical tires strictly by actual vehicle speed (0 when stopped at red light or behind a car!)
      if (mesh3d._wheels) {
        const spinDelta = actualSpeed * dt * 0.28;
        for (const w of mesh3d._wheels) {
          w.rotation.z -= spinDelta;
        }
      }

      // Smooth 3D Chassis suspension: NO fake vertical sine bounce! Only real braking nose-dive / acceleration squat + pothole jolt
      if (mesh3d._chassis) {
        mesh3d._chassis.position.y = 0;
        mesh3d._chassis.rotation.z = (item.pitchAngle || 0) + potholePitch;
      }

      // Dynamic glowing 3D red brake lamps when slowing down or stopped at a red light / pedestrian crosswalk
      if (mesh3d._brakeMat) {
        mesh3d._brakeMat.emissiveIntensity = item.isBraking ? 3.2 : 0.72;
      }

      // Subtle amber turn signal blink when waiting at an intersection
      if (mesh3d._turnMat) {
        mesh3d._turnMat.emissiveIntensity = item.isBraking && Math.sin(clock * 8) > 0 ? 2.4 : 0.45;
      }

      if (mesh3d._exhaustPuff) {
        if (actualSpeed > 8) {
          mesh3d._exhaustPuff.visible = true;
          const puffPhase = (item.d * 0.06) % 1;
          mesh3d._exhaustPuff.scale.setScalar(0.6 + puffPhase * 1.1);
          mesh3d._exhaustPuff.material.opacity = (1 - puffPhase) * 0.45;
        } else {
          mesh3d._exhaustPuff.visible = false;
        }
      }

      if (mesh3d._strobes) {
        const flash = Math.sin(clock * 15) > 0;
        mesh3d._strobes[0].visible = flash;
        mesh3d._strobes[1].visible = !flash;
      }
    }

    // 3. Update 3D Articulated Walking People (Swinging 3D Arms & Legs, Torso Twist, Head Look, Crosswalk Yielding)
    for (const item of walkers) {
      let person3d = this.walkerMeshes.get(item);
      if (!person3d) {
        const isStaff = Boolean(item.staff);
        const key = item.staff ? item.staff.key : item.resident?.key || 'residentBlue';
        const label = item.staff ? item.staff.name : item.resident?.name || '';
        person3d = create3DPerson({ personKey: key, label, isStaff });
        if (item.onTap) this.registerClickable(person3d, item.onTap);
        this.walkerLayer.add(person3d);
        this.walkerMeshes.set(item, person3d);
      }

      if (person3d._selectionRing) {
        person3d._selectionRing.visible = Boolean(item.isSelected);
        if (item.isSelected) {
          const pPulse = 1 + Math.sin(clock * 5.0) * 0.10;
          person3d._selectionRing.scale.set(pPulse, pPulse, 1);
        }
      }

      const pNow = pathPointFn(item.path, item.d);
      const pNext = pathPointFn(item.path, item.d + 5);
      person3d.position.set(pNow.x, 4.8, pNow.y);
      update3DPersonWalk(person3d, item.d, pNow, pNext, clock, Boolean(item.isWaiting));
    }

    // 4. Animate 3D Building Mechanical Rigs (3D Hydraulic Lifts, 3D Rooftop Fans, 3D Turntables, 3D Forklifts, 3D Collectibles)
    this.buildingRecords3D.forEach((b3d, idx) => {
      const parts = b3d._animParts;
      if (!parts) return;
      const t = clock * 2.2 + idx * 0.9;
      for (const r of parts.rotors) {
        r.rotation.y += dt * 7.5;
      }
      if (parts.liftCar) {
        parts.liftCar.node.position.y = parts.liftCar.baseY + (Math.sin(t * 1.1) + 1) * 3.8;
      }
      if (parts.turntable) {
        parts.turntable.rotation.y += dt * 1.25;
      }
      if (parts.forklift) {
        const cyc = Math.sin(t * 0.85);
        parts.forklift.node.position.x = parts.forklift.baseX + cyc * parts.forklift.range;
        parts.forklift.node.rotation.y = Math.cos(t * 0.85) >= 0 ? 0 : Math.PI;
      }
      if (parts.trackCar) {
        parts.trackCar.rotation.y -= dt * 2.6;
      }
      if (parts.collectible3D) {
        parts.collectible3D.node.rotation.y += dt * 2.8;
        parts.collectible3D.node.position.y = parts.collectible3D.baseY + Math.sin(clock * 3.4 + idx) * 2.2;
      }
      if (parts.selectionRing) {
        parts.selectionRing.rotation.y += dt * 2.2;
        const pulse = 1 + Math.sin(clock * 4.5) * 0.08;
        parts.selectionRing.scale.set(pulse, 1, pulse);
      }
    });

    // 5. Animate 3D Expansion Plots & 3D Trees & 3D Incidents
    for (const exp of this.expansionRecords3D) {
      if (exp.node._sign) {
        exp.node._sign.position.y = 28 + Math.sin(clock * 2.8 + exp.phase) * 2.5;
      }
      if (exp.node._turntable) {
        exp.node._turntable.rotation.y += dt * 0.9;
      }
    }

    for (const tr of this.treeRecords3D) {
      if (tr.tree._crown) {
        tr.tree._crown.rotation.z = Math.sin(clock * 2.0 + tr.phase) * 0.045;
        tr.tree._crown.rotation.x = Math.cos(clock * 1.6 + tr.phase) * 0.035;
      }
    }

    for (const inc of this.incidentRecords3D) {
      const t = clock * 3.2 + inc.phase;
      if (inc.node._brokenCar) {
        inc.node._brokenCar.position.y = 2.2 + (Math.sin(t) + 1) * 1.4;
      }
      if (inc.node._smoke) {
        const sProg = (clock * 1.2 + inc.phase) % 1;
        inc.node._smoke.position.y = 11 + sProg * 16;
        inc.node._smoke.scale.setScalar(0.6 + sProg * 0.9);
        inc.node._smoke.material.opacity = (1 - sProg) * 0.65;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.resizeObserver?.disconnect();
    this.renderer?.dispose();
    this.canvas?.remove();
  }
}
