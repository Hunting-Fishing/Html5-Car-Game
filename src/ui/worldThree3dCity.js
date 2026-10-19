import * as THREE from 'three';

const MAT_CACHE = {};

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

export function makeLabelSprite(lines, {
  bgColor = 'rgba(6, 19, 29, 0.92)',
  borderColor = '#38bdf8',
  textColor = '#f8fafc',
  subColor = '#fef08a',
  width = 160,
  height = 42,
  scale = 0.38
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
// 2. TRUE 3D ARTICULATED VEHICLES WITH 4 SPINNING 3D WHEELS & BODY KITS
// ============================================================================
const VEHICLE_SPECS = {
  blueCar:      { body: 0x2563eb, roof: 0x3b82f6, trim: 0x1e3a8a, rim: 0xfacc15, type: 'coupe', spoiler: true },
  jdmGtCoupe:   { body: 0x7e22ce, roof: 0x9333ea, trim: 0x22d3ee, rim: 0x38bdf8, type: 'coupe', spoiler: true, underglow: 0x22d3ee },
  yellowCar:    { body: 0xfacc15, roof: 0xfde047, trim: 0x0f172a, rim: 0xe2e8f0, type: 'taxi' },
  naMuscle:     { body: 0xdc2626, roof: 0x991b1b, trim: 0x111827, rim: 0xe2e8f0, type: 'muscle', scoop: true },
  compactCar:   { body: 0xf8fafc, roof: 0xe2e8f0, trim: 0xef4444, rim: 0x94a3b8, type: 'hatch' },
  rallyCar:     { body: 0x0284c7, roof: 0x38bdf8, trim: 0xfacc15, rim: 0xfacc15, type: 'coupe', spoiler: true, scoop: true },
  superCar:     { body: 0x06b6d4, roof: 0x0f172a, trim: 0x22d3ee, rim: 0x38bdf8, type: 'supercar', spoiler: true },
  greenTruck:   { body: 0x16a34a, roof: 0x22c55e, trim: 0x14532d, rim: 0xfacc15, type: 'pickup' },
  bajaSuv:      { body: 0xea580c, roof: 0x1e293b, trim: 0xfed7aa, rim: 0xfacc15, type: 'suv' },
  deliveryVan:  { body: 0x0284c7, roof: 0xf8fafc, trim: 0x38bdf8, rim: 0xcbd5e1, type: 'van' },
  towTruck:     { body: 0xf59e0b, roof: 0xfbbf24, trim: 0xb45309, rim: 0xe2e8f0, type: 'tow' }
};

function make3DWheel(radius, width, rimColor) {
  const wheelGroup = new THREE.Group();
  const tire = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, width, 16),
    getMat(0x111827, { roughness: 0.72, metalness: 0.1 })
  );
  tire.rotation.x = Math.PI / 2;
  tire.castShadow = true;
  wheelGroup.add(tire);

  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.62, radius * 0.62, width + 0.5, 10),
    getMat(rimColor, { roughness: 0.22, metalness: 0.78 })
  );
  rim.rotation.x = Math.PI / 2;
  wheelGroup.add(rim);

  const spokeGeo = new THREE.BoxGeometry(radius * 1.15, radius * 0.22, width + 0.9);
  const spokeMat = getMat(0xffffff, { roughness: 0.2, metalness: 0.85 });
  const spoke1 = new THREE.Mesh(spokeGeo, spokeMat);
  const spoke2 = new THREE.Mesh(spokeGeo, spokeMat);
  spoke2.rotation.z = Math.PI / 2;
  wheelGroup.add(spoke1, spoke2);

  return wheelGroup;
}

export function create3DVehicle({ assetKey = 'blueCar', direction = 'east', towTargetKey = '' } = {}) {
  const spec = VEHICLE_SPECS[assetKey] || VEHICLE_SPECS.blueCar;
  const root = new THREE.Group();
  const chassis = new THREE.Group();
  root.add(chassis);

  const isTruck = spec.type === 'pickup' || spec.type === 'suv' || spec.type === 'van' || spec.type === 'tow';
  const length = isTruck ? 48 : 42;
  const width = isTruck ? 22 : 20;
  const wheelR = isTruck ? 5.6 : 4.6;
  const wheelW = isTruck ? 4.4 : 3.6;

  // 1. 4 Independent Spinning 3D Wheels
  const wheels = [];
  const wx = length * 0.31;
  const wz = width * 0.48;
  for (const [x, z] of [[-wx, wz], [wx, wz], [-wx, -wz], [wx, -wz]]) {
    const w = make3DWheel(wheelR, wheelW, spec.rim);
    w.position.set(x, wheelR, z);
    root.add(w);
    wheels.push(w);
  }

  // 2. Sculpted 3D Lower Body & Bumpers (local +X is front)
  const lowerH = isTruck ? 8.5 : 6.8;
  const lowerBody = new THREE.Mesh(
    new THREE.BoxGeometry(length, lowerH, width),
    getMat(spec.body, { roughness: 0.22, metalness: 0.38 })
  );
  lowerBody.position.set(0, wheelR + lowerH * 0.48, 0);
  lowerBody.castShadow = true;
  lowerBody.receiveShadow = true;
  chassis.add(lowerBody);

  const trimStrip = new THREE.Mesh(
    new THREE.BoxGeometry(length + 0.6, 2.0, width + 0.6),
    getMat(spec.trim, { roughness: 0.35, metalness: 0.25 })
  );
  trimStrip.position.set(0, wheelR + 1.8, 0);
  chassis.add(trimStrip);

  const grille = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, lowerH * 0.55, width * 0.56),
    getMat(0x0f172a, { roughness: 0.6 })
  );
  grille.position.set(length / 2 + 0.2, wheelR + lowerH * 0.42, 0);
  chassis.add(grille);

  const hlMat = getMat(0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 1.4 });
  const tlMat = getMat(0xef4444, { emissive: 0xef4444, emissiveIntensity: 1.1 });
  for (const side of [-1, 1]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 4.0), hlMat);
    hl.position.set(length / 2 + 0.2, wheelR + lowerH * 0.56, side * (width * 0.34));
    chassis.add(hl);

    const tl = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 4.4), tlMat);
    tl.position.set(-length / 2 - 0.2, wheelR + lowerH * 0.56, side * (width * 0.33));
    chassis.add(tl);
  }

  // 3. 3D Cabin / Greenhouse / Truck Bed / Tow Boom
  const cabinBaseY = wheelR + lowerH * 0.92;
  const glassMat = getMat(0x0f172a, { roughness: 0.08, metalness: 0.88, emissive: 0x1e3a8a, emissiveIntensity: 0.28 });

  if (spec.type === 'van') {
    const vanBox = new THREE.Mesh(
      new THREE.BoxGeometry(length * 0.86, 11.5, width * 0.92),
      getMat(spec.roof, { roughness: 0.28, metalness: 0.2 })
    );
    vanBox.position.set(-1.5, cabinBaseY + 5.5, 0);
    vanBox.castShadow = true;
    chassis.add(vanBox);

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.2, 7.5, width * 0.82), glassMat);
    windshield.position.set(length * 0.36, cabinBaseY + 5.2, 0);
    windshield.rotation.z = 0.28;
    chassis.add(windshield);
  } else if (spec.type === 'pickup') {
    const cab = new THREE.Mesh(new THREE.BoxGeometry(length * 0.42, 8.8, width * 0.88), getMat(spec.roof, { roughness: 0.26 }));
    cab.position.set(3, cabinBaseY + 4.2, 0);
    cab.castShadow = true;
    chassis.add(cab);

    const cabGlass = new THREE.Mesh(new THREE.BoxGeometry(length * 0.44, 5.6, width * 0.90), glassMat);
    cabGlass.position.set(3.5, cabinBaseY + 4.0, 0);
    chassis.add(cabGlass);

    const lightbar = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.8, width * 0.72), hlMat);
    lightbar.position.set(10, cabinBaseY + 9.2, 0);
    chassis.add(lightbar);
  } else if (spec.type === 'tow') {
    const cab = new THREE.Mesh(new THREE.BoxGeometry(length * 0.38, 9.5, width * 0.90), getMat(spec.roof, { roughness: 0.26 }));
    cab.position.set(7, cabinBaseY + 4.5, 0);
    cab.castShadow = true;
    chassis.add(cab);

    const cabGlass = new THREE.Mesh(new THREE.BoxGeometry(length * 0.40, 5.8, width * 0.92), glassMat);
    cabGlass.position.set(7.5, cabinBaseY + 4.4, 0);
    chassis.add(cabGlass);

    const strobeRed = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 6.5), getMat(0xef4444, { emissive: 0xef4444, emissiveIntensity: 1.5 }));
    strobeRed.position.set(7, cabinBaseY + 10.2, -3.5);
    const strobeAmber = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 6.5), getMat(0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.5 }));
    strobeAmber.position.set(7, cabinBaseY + 10.2, 3.5);
    chassis.add(strobeRed, strobeAmber);
    root._strobes = [strobeRed, strobeAmber];

    const boomPivot = new THREE.Group();
    boomPivot.position.set(-4, cabinBaseY + 1, 0);
    const boomArm = new THREE.Mesh(
      new THREE.BoxGeometry(24, 3.2, 4.2),
      getMat(0xfacc15, { roughness: 0.3, metalness: 0.5 })
    );
    boomArm.position.set(-10, 6, 0);
    boomArm.rotation.z = -0.45;
    boomArm.castShadow = true;
    boomPivot.add(boomArm);

    const winchLine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 11, 6),
      getMat(0x94a3b8, { metalness: 0.8 })
    );
    winchLine.position.set(-20, 6, 0);
    boomPivot.add(winchLine);
    chassis.add(boomPivot);
    root._towBoom = boomPivot;

    if (towTargetKey) {
      const towedCar = create3DVehicle({ assetKey: towTargetKey, direction: 'east' });
      towedCar.position.set(-46, 3, 0);
      towedCar.rotation.z = -0.14;
      chassis.add(towedCar);
    }
  } else {
    const cabLen = spec.type === 'suv' || spec.type === 'hatch' ? length * 0.60 : length * 0.50;
    const cabH = spec.type === 'suv' ? 8.2 : 6.8;
    const cabX = spec.type === 'hatch' || spec.type === 'suv' ? -3 : -2;

    const glassBlock = new THREE.Mesh(
      new THREE.BoxGeometry(cabLen, cabH * 0.82, width * 0.84),
      glassMat
    );
    glassBlock.position.set(cabX, cabinBaseY + cabH * 0.42, 0);
    chassis.add(glassBlock);

    const roofCap = new THREE.Mesh(
      new THREE.BoxGeometry(cabLen * 0.82, 2.0, width * 0.80),
      getMat(spec.roof, { roughness: 0.22, metalness: 0.38 })
    );
    roofCap.position.set(cabX - 0.5, cabinBaseY + cabH * 0.86, 0);
    roofCap.castShadow = true;
    chassis.add(roofCap);

    if (spec.spoiler) {
      const wing = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 1.2, width * 0.92),
        getMat(0x0f172a, { roughness: 0.3, metalness: 0.6 })
      );
      wing.position.set(-length * 0.44, cabinBaseY + 3.8, 0);
      const strutL = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.6, 1.0), getMat(0x0f172a));
      const strutR = strutL.clone();
      strutL.position.set(-length * 0.43, cabinBaseY + 1.8, -width * 0.32);
      strutR.position.set(-length * 0.43, cabinBaseY + 1.8, width * 0.32);
      chassis.add(wing, strutL, strutR);
    }

    if (spec.scoop) {
      const scoop = new THREE.Mesh(
        new THREE.BoxGeometry(8, 2.2, 7.5),
        getMat(0x111827, { roughness: 0.4 })
      );
      scoop.position.set(length * 0.22, cabinBaseY + 0.8, 0);
      chassis.add(scoop);
    }

    if (spec.type === 'taxi') {
      const taxiSign = new THREE.Mesh(
        new THREE.BoxGeometry(6, 3.0, 9),
        getMat(0xfef08a, { emissive: 0xfacc15, emissiveIntensity: 1.2 })
      );
      taxiSign.position.set(cabX, cabinBaseY + cabH + 1.2, 0);
      chassis.add(taxiSign);
    }

    if (spec.underglow) {
      const glow = new THREE.Mesh(
        new THREE.BoxGeometry(length * 0.88, 0.8, width * 0.94),
        getMat(spec.underglow, { emissive: spec.underglow, emissiveIntensity: 1.6 })
      );
      glow.position.set(0, 1.5, 0);
      chassis.add(glow);
    }
  }

  const exhaustPuff = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.4 })
  );
  exhaustPuff.position.set(-length / 2 - 4, wheelR + 1.5, -width * 0.25);
  chassis.add(exhaustPuff);

  if (direction === 'east') root.rotation.y = 0;
  else if (direction === 'west') root.rotation.y = Math.PI;
  else if (direction === 'south') root.rotation.y = -Math.PI / 2;
  else if (direction === 'north') root.rotation.y = Math.PI / 2;

  root._wheels = wheels;
  root._chassis = chassis;
  root._exhaustPuff = exhaustPuff;
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

  root._bodyRoot = bodyRoot;
  root._leftLeg = leftLegPivot;
  root._rightLeg = rightLegPivot;
  root._leftArm = leftArmPivot;
  root._rightArm = rightArmPivot;
  root._torso = torsoPivot;
  root._head = headPivot;
  return root;
}

export function update3DPersonWalk(personGroup, distance, prevPos, nextPos, time) {
  if (!personGroup) return;
  const phase = distance * 0.22;
  const swing = Math.sin(phase);
  const cosSwing = Math.cos(phase);

  if (personGroup._leftLeg) personGroup._leftLeg.rotation.x = swing * 0.72;
  if (personGroup._rightLeg) personGroup._rightLeg.rotation.x = -swing * 0.72;
  if (personGroup._leftArm) personGroup._leftArm.rotation.x = -swing * 0.58;
  if (personGroup._rightArm) personGroup._rightArm.rotation.x = swing * 0.58;

  if (personGroup._bodyRoot) {
    personGroup._bodyRoot.position.y = Math.abs(swing) * 1.9;
  }
  if (personGroup._torso) {
    personGroup._torso.rotation.y = swing * 0.16;
    personGroup._torso.rotation.z = cosSwing * 0.06;
  }
  if (personGroup._head) {
    personGroup._head.rotation.y = Math.sin(time * 2.2 + distance * 0.03) * 0.22;
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
// 4. TRUE 3D ARCHITECTURAL BUILDINGS WITH ANIMATED 3D BAYS, LIFTS & TURNTABLES
// ============================================================================
const BUILDING_3D_PALETTE = {
  garage:         { wall: 0xdbeafe, lower: 0x0284c7, roof: 0x0f172a, accent: 0x35e58a, trim: 0x38bdf8, sign: '365 GARAGE' },
  dealerShowroom: { wall: 0xe0f2fe, lower: 0x1d4ed8, roof: 0x1e3a8a, accent: 0xfacc15, trim: 0x60a5fa, sign: 'DEALER VIP' },
  partsHub:       { wall: 0xccfbf1, lower: 0x0d9488, roof: 0x115e59, accent: 0xfacc15, trim: 0x2dd4bf, sign: 'PARTS HUB' },
  partsWarehouse: { wall: 0xcffafe, lower: 0x0891b2, roof: 0x164e63, accent: 0x38bdf8, trim: 0xfacc15, sign: 'WAREHOUSE' },
  streetKiosk:    { wall: 0xd1fae5, lower: 0x059669, roof: 0x064e3b, accent: 0xfacc15, trim: 0x35e58a, sign: '365 EXPRESS' },
  privateShop:    { wall: 0xf3e8ff, lower: 0x7c3aed, roof: 0x3b0764, accent: 0x38bdf8, trim: 0xc084fc, sign: 'TUNING LAB' },
  salvageBlock:   { wall: 0xffedd5, lower: 0xea580c, roof: 0x7c2d12, accent: 0xfacc15, trim: 0xf97316, sign: 'TOWING YARD' },
  towDispatch:    { wall: 0xfef3c7, lower: 0xd97706, roof: 0x78350f, accent: 0xef4444, trim: 0xfacc15, sign: 'TOW DISPATCH' },
  tireRepair:     { wall: 0xfef9c3, lower: 0xca8a04, roof: 0x991b1b, accent: 0xef4444, trim: 0xfacc15, sign: 'FUEL & TIRE' },
  testTrack:      { wall: 0xdcfce7, lower: 0x16a34a, roof: 0x14532d, accent: 0xfacc15, trim: 0xef4444, sign: 'PRO TRACK' }
};

export function create3DBuilding({
  type = 'garage',
  name = '365 Garage',
  w = 120,
  h = 120,
  level = 1,
  ready = false,
  statusText = 'Collect',
  rotation = 0
} = {}) {
  const pal = BUILDING_3D_PALETTE[type] || BUILDING_3D_PALETTE.garage;
  const group = new THREE.Group();
  const animParts = { rotors: [], liftCar: null, turntable: null, forklift: null, trackCar: null, signGroup: null };

  // 1. 3D Beveled Concrete Plaza Base & Dark Asphalt Forecourt
  const padW = w + 16;
  const padD = h + 16;
  const concretePad = new THREE.Mesh(
    new THREE.BoxGeometry(padW, 5.2, padD),
    getMat(0xe2e8f0, { roughness: 0.55 })
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

  const rimMat = getMat(ready ? 0x35e58a : pal.accent, {
    emissive: ready ? 0x35e58a : pal.accent,
    emissiveIntensity: ready ? 1.15 : 0.55
  });
  const frontRim = new THREE.Mesh(new THREE.BoxGeometry(w + 6, 1.6, 2.6), rimMat);
  frontRim.position.set(0, 5.7, (h + 4) / 2);
  const leftRim = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, h + 6), rimMat);
  leftRim.position.set(-(w + 4) / 2, 5.7, 0);
  group.add(frontRim, leftRim);

  // Yellow safety driveway apron on front (+Z) and side (-X)
  const apronF = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.68, 6.0, 6.5),
    getMat(0xfacc15, { roughness: 0.4 })
  );
  apronF.position.set(0, 2.8, h * 0.40);
  group.add(apronF);

  const bW = w * 0.78;
  const bD = h * 0.66;
  const bH = Math.min(72, (type === 'streetKiosk' ? 36 : 46) + (level - 1) * 3.5);
  const baseY = 5.6;
  const centerZ = -h * 0.06;
  const frontZ = centerZ + bD / 2;
  const leftX = -bW / 2;

  // 2. Two-Tone 3D Architectural Main Structure (Vibrant Lower Tier + Crisp Sunlit Upper Facade)
  const lowerTierH = bH * 0.54;
  const upperTierH = bH * 0.46;

  const lowerShell = new THREE.Mesh(
    new THREE.BoxGeometry(bW, lowerTierH, bD),
    getMat(pal.lower, { roughness: 0.32, metalness: 0.22 })
  );
  lowerShell.position.set(0, baseY + lowerTierH / 2, centerZ);
  lowerShell.castShadow = true;
  lowerShell.receiveShadow = true;
  group.add(lowerShell);

  const upperShell = new THREE.Mesh(
    new THREE.BoxGeometry(bW - 2, upperTierH, bD - 2),
    getMat(pal.wall, { roughness: 0.36, metalness: 0.15 })
  );
  upperShell.position.set(0, baseY + lowerTierH + upperTierH / 2, centerZ);
  upperShell.castShadow = true;
  upperShell.receiveShadow = true;
  group.add(upperShell);

  // Mid-Belt Trim Cornice & Rooftop Parapet
  const midBelt = new THREE.Mesh(
    new THREE.BoxGeometry(bW + 4, 2.6, bD + 4),
    getMat(pal.trim, { roughness: 0.28, metalness: 0.45 })
  );
  midBelt.position.set(0, baseY + lowerTierH, centerZ);
  group.add(midBelt);

  const parapet = new THREE.Mesh(
    new THREE.BoxGeometry(bW + 5, 4.8, bD + 5),
    getMat(pal.roof, { roughness: 0.28, metalness: 0.35 })
  );
  parapet.position.set(0, baseY + bH + 2.0, centerZ);
  parapet.castShadow = true;
  group.add(parapet);

  const neonFascia = new THREE.Mesh(
    new THREE.BoxGeometry(bW + 6.5, 2.0, bD + 6.5),
    getMat(pal.accent, { emissive: pal.accent, emissiveIntensity: 0.95 })
  );
  neonFascia.position.set(0, baseY + bH + 0.2, centerZ);
  group.add(neonFascia);

  // 3. Glowing 2nd-Story Clerestory Windows on BOTH Front (+Z) and Left (-X) Camera-Facing Walls!
  const winMat = getMat(0x7dd3fc, {
    roughness: 0.1,
    metalness: 0.85,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.55
  });
  const winY = baseY + lowerTierH + upperTierH * 0.52;

  for (const wx of [-bW * 0.28, 0, bW * 0.28]) {
    const winF = new THREE.Mesh(new THREE.BoxGeometry(bW * 0.20, upperTierH * 0.48, 1.8), winMat);
    winF.position.set(wx, winY, frontZ - 0.5);
    group.add(winF);
  }
  for (const wz of [-bD * 0.24, bD * 0.24]) {
    const winL = new THREE.Mesh(new THREE.BoxGeometry(1.8, upperTierH * 0.48, bD * 0.26), winMat);
    winL.position.set(leftX + 0.5, winY, centerZ + wz);
    group.add(winL);
  }

  // Left-Side (-X) Service Door & Striped Awning (so the left camera-facing wall looks alive!)
  const sideAwning = new THREE.Mesh(
    new THREE.BoxGeometry(7, 2.4, bD * 0.46),
    getMat(pal.accent, { roughness: 0.3 })
  );
  sideAwning.position.set(leftX - 3.2, baseY + lowerTierH * 0.72, centerZ);
  sideAwning.castShadow = true;
  group.add(sideAwning);

  const sideDoor = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, lowerTierH * 0.65, bD * 0.32),
    getMat(0x0f172a, { metalness: 0.6, roughness: 0.25 })
  );
  sideDoor.position.set(leftX - 0.2, baseY + lowerTierH * 0.33, centerZ);
  group.add(sideDoor);

  // 4. Building-Specific 3D Bays, Rotundas, Hydraulic Lifts, Turntables & Forecourt Vehicles
  if (type === 'dealerShowroom') {
    // Panoramic 3D Glass Rotunda on Front-Left Corner
    const rotundaGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(bW * 0.32, bW * 0.32, bH * 0.86, 20),
      getMat(0x38bdf8, { roughness: 0.08, metalness: 0.9, emissive: 0x0284c7, emissiveIntensity: 0.45, transparent: true, opacity: 0.76 })
    );
    rotundaGlass.position.set(-bW * 0.22, baseY + bH * 0.43, frontZ - 2);
    group.add(rotundaGlass);

    // VIP Red Carpet & Rotating 3D Gold Showroom Turntable
    const ttBase = new THREE.Mesh(
      new THREE.CylinderGeometry(19, 21, 3.4, 24),
      getMat(0x0f172a, { roughness: 0.2, metalness: 0.6 })
    );
    ttBase.position.set(bW * 0.08, baseY + 1.7, frontZ + 12);
    const ttRim = new THREE.Mesh(
      new THREE.CylinderGeometry(20.5, 20.5, 2.0, 24),
      getMat(0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.9 })
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
        new THREE.BoxGeometry(bayW, bayH, 8),
        getMat(0x1e293b, { roughness: 0.5, emissive: 0x0f172a, emissiveIntensity: 0.5 })
      );
      bayInterior.position.set(bx, baseY + bayH / 2, frontZ - 2.2);
      group.add(bayInterior);

      const bayLight = new THREE.Mesh(
        new THREE.BoxGeometry(bayW * 0.78, 2.0, 3.2),
        getMat(0xfef08a, { emissive: 0xfacc15, emissiveIntensity: 1.25 })
      );
      bayLight.position.set(bx, baseY + bayH - 1.2, frontZ - 0.5);
      group.add(bayLight);

      const rollDoor = new THREE.Mesh(
        new THREE.BoxGeometry(bayW + 2, 4.5, 3.0),
        getMat(pal.trim, { metalness: 0.5, roughness: 0.25 })
      );
      rollDoor.position.set(bx, baseY + bayH + 1.2, frontZ + 0.8);
      group.add(rollDoor);
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

      // Forecourt props: parked customer car or fuel pumps
      if (type === 'garage' && bW > 100) {
        const parked = create3DVehicle({ assetKey: 'jdmGtCoupe', direction: 'south' });
        parked.scale.set(0.52, 0.52, 0.52);
        parked.position.set(bW * 0.22, baseY + 0.5, frontZ + 11);
        group.add(parked);
      } else if (type === 'tireRepair') {
        // 3D Fuel Station Forecourt Canopy & Red Fuel Pumps
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
      // 3D Stacked Cargo Containers on left forecourt + Animated 3D Forklift
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

  // 5. 3D Rooftop Penthouse Skylight + Spinning 3D HVAC Turbine Fans + 3D Neon Signboard
  const roofY = baseY + bH + 4.4;
  const skylight = new THREE.Mesh(
    new THREE.BoxGeometry(bW * 0.38, 6.5, bD * 0.38),
    getMat(0x0284c7, { roughness: 0.15, metalness: 0.8, emissive: 0x0369a1, emissiveIntensity: 0.45 })
  );
  skylight.position.set(0, roofY + 3.2, centerZ - 4);
  skylight.castShadow = true;
  group.add(skylight);

  for (const rx of [-bW * 0.30, bW * 0.30]) {
    const fanHousing = new THREE.Mesh(
      new THREE.CylinderGeometry(7.2, 8.0, 4.2, 14),
      getMat(0x475569, { metalness: 0.6, roughness: 0.3 })
    );
    fanHousing.position.set(rx, roofY + 2.1, centerZ - bD * 0.16);
    group.add(fanHousing);

    const bladeGroup = new THREE.Group();
    bladeGroup.position.set(rx, roofY + 4.5, centerZ - bD * 0.16);
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(12, 0.9, 2.5), getMat(0xf8fafc, { metalness: 0.8 }));
    const b2 = b1.clone();
    b2.rotation.y = Math.PI / 2;
    bladeGroup.add(b1, b2);
    group.add(bladeGroup);
    animParts.rotors.push(bladeGroup);
  }

  const signPost = new THREE.Group();
  signPost.position.set(0, roofY + 9, centerZ + bD * 0.22);
  const signBack = new THREE.Mesh(
    new THREE.BoxGeometry(Math.min(bW * 0.78, 86), 11, 4.5),
    getMat(0x06131d, { roughness: 0.2, metalness: 0.7, emissive: pal.accent, emissiveIntensity: 0.55 })
  );
  signBack.castShadow = true;
  signPost.add(signBack);
  group.add(signPost);
  animParts.signGroup = signPost;

  // 6. Floating 3D Status Pill Badge Above Rooftop
  const hudSprite = makeLabelSprite(
    [
      `${name} · Lv ${level}`,
      ready ? `✓ ${statusText} READY` : statusText
    ],
    {
      bgColor: ready ? 'rgba(6, 46, 34, 0.95)' : 'rgba(6, 19, 29, 0.92)',
      borderColor: ready ? '#35e58a' : '#38bdf8',
      textColor: '#ffffff',
      subColor: ready ? '#8fffc2' : '#fef08a',
      width: 156,
      height: 38,
      scale: 0.40
    }
  );
  hudSprite.position.set(0, roofY + 24, 0);
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
    const tow = create3DVehicle({ assetKey: 'towTruck', direction: 'west' });
    tow.scale.set(0.66, 0.66, 0.66);
    tow.position.set(-22, 0, 0);
    group.add(tow);

    const broken = create3DVehicle({ assetKey: 'naMuscle', direction: 'west' });
    broken.scale.set(0.62, 0.62, 0.62);
    broken.position.set(20, 2.5, 0);
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
    // Real 3D Intersection Traffic Signal Gantry Pole with Red/Yellow/Green 3D Signal Box!
    const poleMat = getMat(0x334155, { metalness: 0.7, roughness: 0.3 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 28, 8), poleMat);
    pole.position.set(-26, 14, -26);
    pole.castShadow = true;

    const mastArm = new THREE.Mesh(new THREE.BoxGeometry(24, 1.4, 1.4), poleMat);
    mastArm.position.set(-14, 26, -26);

    const signalHead = new THREE.Mesh(new THREE.BoxGeometry(4.2, 9.5, 3.2), getMat(0xfacc15, { roughness: 0.3 }));
    signalHead.position.set(-5, 24, -26);

    const redLamp = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 8), getMat(0xef4444, { emissive: 0xef4444, emissiveIntensity: 1.2 }));
    redLamp.position.set(-5, 26.8, -24.2);
    const ambLamp = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 8), getMat(0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 1.0 }));
    ambLamp.position.set(-5, 24.0, -24.2);
    const grnLamp = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 8), getMat(0x22c55e, { emissive: 0x22c55e, emissiveIntensity: 1.2 }));
    grnLamp.position.set(-5, 21.2, -24.2);

    group.add(pole, mastArm, signalHead, redLamp, ambLamp, grnLamp);

    const badge = makeLabelSprite(`SIGNAL ${score}%`, {
      borderColor: '#38bdf8',
      textColor: '#e0f2fe',
      width: 110,
      height: 26,
      scale: 0.32
    });
    badge.position.set(-14, 34, -26);
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
// 7. COMPLETE THREE.JS 3D WEBGL TOON CITY SCENE CONTROLLER
// ============================================================================
const CAMERA_PRESETS = [
  { id: 'toon3d',   label: '3D City',   fov: 42, offset: { x: -155, y: 315, z: 345 } },
  { id: 'street3d', label: '3D Street', fov: 40, offset: { x: -85,  y: 150, z: 245 } },
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
    this.scene.background = new THREE.Color(0x0c2135);
    this.scene.fog = new THREE.FogExp2(0x0c2135, 0.00068);

    const w = Math.max(320, host.clientWidth || 420);
    const h = Math.max(320, host.clientHeight || 420);

    this.camera = new THREE.PerspectiveCamera(CAMERA_PRESETS[0].fov, w / h, 10, 2600);

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
    this.renderer.toneMappingExposure = 1.15;

    this.canvas = this.renderer.domElement;
    this.canvas.className = 'three3dWorldCanvas';
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;z-index:5;touch-action:none;';
    host.appendChild(this.canvas);

    // 1. Golden-Hour 3D Lighting & Crisp Cast Shadows
    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 1.15);
    this.scene.add(hemi);

    this.sunLight = new THREE.DirectionalLight(0xfffbeb, 2.15);
    this.sunLight.position.set(480, 460, 420);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 60;
    this.sunLight.shadow.camera.far = 1200;
    const d = 390;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0006;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.72);
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
    const hits = this.raycaster.intersectObjects(this.interactiveTargets, true);
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
  }

  buildStatic3DCity() {
    const { WORLD, ROADS } = this;

    // 1. Base 3D Asphalt Ground Plane
    const baseAsphalt = new THREE.Mesh(
      new THREE.BoxGeometry(WORLD.width + 600, 4, WORLD.height + 600),
      getMat(0x162030, { roughness: 0.85 })
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
          getMat(0xcbd5e1, { roughness: 0.6 })
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

    // 3. 3D Road Markings: Double Amber-Gold Center Dividers, White Lane Dashes, & 3D Zebra Crosswalks
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

    // 3D Raised Zebra Crosswalks at every Intersection
    for (const h of ROADS.horizontal) {
      for (const v of ROADS.vertical) {
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
      }
    }

    // 4. 3D Swaying Park Trees & 3D Streetlights
    const treePositions = [
      [390, 170], [608, 170], [390, 478], [608, 478], [390, 798], [608, 798]
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

    // 1. Sync 3D Camera & Directional Sun Shadow Frustum with Pan Position
    const focusX = -worldPanX + viewW * 0.5;
    const focusZ = -worldPanY + viewH * 0.5;
    const preset = this.currentPreset();

    this.camera.position.set(
      focusX + preset.offset.x * this.zoom,
      preset.offset.y * this.zoom,
      focusZ + preset.offset.z * this.zoom
    );
    this.camera.lookAt(focusX, 14, focusZ - 12);

    this.sunLight.position.set(focusX + 210, 440, focusZ + 250);
    this.sunLight.target.position.set(focusX, 0, focusZ);
    this.sunLight.target.updateMatrixWorld();

    // 2. Update 3D Traffic Vehicles (4 Spinning 3D Wheels, 3D Heading, Suspension Bounce, Strobe Lights)
    for (const item of traffic) {
      let mesh3d = this.trafficMeshes.get(item);
      if (!mesh3d) {
        mesh3d = create3DVehicle({
          assetKey: item.assetKey || 'blueCar',
          direction: item.direction || 'east',
          towTargetKey: item.towTargetKey || ''
        });
        const sc = (item.scale || 0.78) * 1.05;
        mesh3d.scale.set(sc, sc, sc);
        this.trafficLayer.add(mesh3d);
        this.trafficMeshes.set(item, mesh3d);
      }

      const pNow = pathPointFn(item.path, item.d);
      const pNext = pathPointFn(item.path, item.d + 6);
      const dx = pNext.x - pNow.x;
      const dz = pNext.y - pNow.y;
      if (Math.hypot(dx, dz) > 0.01) {
        mesh3d.rotation.y = Math.atan2(-dz, dx);
      }

      let potholeJoltY = 0;
      let potholePitch = 0;
      for (const pot of potholes) {
        const dist = Math.hypot(pNow.x - pot.x, pNow.y - pot.y);
        if (dist < 46) {
          const intensity = 1 - dist / 46;
          potholeJoltY = Math.abs(Math.sin(item.d * 0.9)) * 4.5 * intensity;
          potholePitch = Math.cos(item.d * 0.85) * 0.14 * intensity;
          break;
        }
      }

      mesh3d.position.set(pNow.x, 0.2 + potholeJoltY, pNow.y);

      // Spin all 4 3D cylindrical tires around their axle!
      if (mesh3d._wheels) {
        const spinDelta = (item.speed || 80) * dt * 0.26;
        for (const w of mesh3d._wheels) {
          w.rotation.z -= spinDelta;
        }
      }

      // 3D Chassis suspension & engine vibration
      if (mesh3d._chassis) {
        mesh3d._chassis.position.y = Math.sin(item.d * 0.35) * 0.65;
        mesh3d._chassis.rotation.z = potholePitch;
      }

      if (mesh3d._exhaustPuff) {
        const puffPhase = (item.d * 0.06) % 1;
        mesh3d._exhaustPuff.scale.setScalar(0.6 + puffPhase * 1.1);
        mesh3d._exhaustPuff.material.opacity = (1 - puffPhase) * 0.45;
      }

      if (mesh3d._strobes) {
        const flash = Math.sin(clock * 15) > 0;
        mesh3d._strobes[0].visible = flash;
        mesh3d._strobes[1].visible = !flash;
      }
    }

    // 3. Update 3D Articulated Walking People (Swinging 3D Arms & Legs, Torso Twist, Head Look, Corner Turning)
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

      const pNow = pathPointFn(item.path, item.d);
      const pNext = pathPointFn(item.path, item.d + 5);
      person3d.position.set(pNow.x, 4.8, pNow.y);
      update3DPersonWalk(person3d, item.d, pNow, pNext, clock);
    }

    // 4. Animate 3D Building Mechanical Rigs (3D Hydraulic Lifts, 3D Rooftop Fans, 3D Turntables, 3D Forklifts, 3D Race Track)
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
