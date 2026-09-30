export const DAMAGE_SPEED_KMH = 50;
const GAUGE_KMH_SCALE = 0.74;

const GEAR_SPEED_FRACTIONS = [0, 0.27, 0.47, 0.66, 0.84, 1];

const CLASS_REDLINE_RPM = {
  starter: 6500,
  utility: 5600,
  offroad: 6000,
  endurance: 5500,
  race: 7200
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function speedToKmh(speed, route) {
  const routeLength = Math.max(1, Number(route?.length) || 1);
  const routeMeters = Math.max(1, Number(route?.meters) || routeLength);
  return Math.abs(Number(speed) || 0) * (routeMeters / routeLength) * 3.6 * GAUGE_KMH_SCALE;
}

export function getDrivetrainProfile({
  topSpeed,
  route,
  vehicleClass = 'starter',
  engineLevel = 1,
  transmissionLevel = 1
}) {
  const topSpeedKmh = Math.max(1, speedToKmh(topSpeed, route));
  const engineUpgrade = Math.max(0, Number(engineLevel) - 1);
  const transmissionUpgrade = Math.max(0, Number(transmissionLevel) - 1);
  const baseRedline = CLASS_REDLINE_RPM[vehicleClass] || CLASS_REDLINE_RPM.starter;
  const redlineRpm = Math.round(clamp(baseRedline + engineUpgrade * 55, 5200, 8000));
  const idleRpm = Math.round(clamp(825 + engineUpgrade * 8, 800, 1050));
  const shiftDropRatio = clamp(0.45 + transmissionUpgrade * 0.012, 0.45, 0.62);
  const speedometerMaxKmh = Math.max(120, Math.ceil(topSpeedKmh / 20) * 20);

  return {
    topSpeedKmh,
    idleRpm,
    redlineRpm,
    shiftDropRatio,
    speedometerMaxKmh,
    shiftSpeedsKmh: GEAR_SPEED_FRACTIONS.map((fraction) => fraction * topSpeedKmh)
  };
}

export function computeVehicleTelemetry({
  speed,
  topSpeed,
  reverseTop,
  route,
  vehicleClass,
  engineLevel,
  transmissionLevel,
  currentGear,
  throttle = false,
  braking = false
}) {
  const profile = getDrivetrainProfile({
    topSpeed,
    route,
    vehicleClass,
    engineLevel,
    transmissionLevel
  });
  const kmh = speedToKmh(speed, route);
  const isReverse = Number(speed) < -0.05;

  let gear = clamp(Math.round(Number(currentGear) || 1), 1, 5);
  let rpm;
  if (isReverse) {
    gear = 1;
    const reverseTopKmh = Math.max(1, speedToKmh(reverseTop, route));
    const reverseProgress = clamp(kmh / reverseTopKmh, 0, 1);
    const reverseRpmLimit = profile.idleRpm + (profile.redlineRpm - profile.idleRpm) * 0.72;
    rpm = Math.round(profile.idleRpm + (reverseRpmLimit - profile.idleRpm) * reverseProgress);
  } else {
    while (gear < 5 && kmh >= profile.shiftSpeedsKmh[gear]) gear += 1;
    while (gear > 1 && kmh < profile.shiftSpeedsKmh[gear - 1] * 0.86) gear -= 1;

    const gearStart = profile.shiftSpeedsKmh[gear - 1];
    const gearEnd = Math.max(gearStart + 1, profile.shiftSpeedsKmh[gear]);
    const gearProgress = clamp((kmh - gearStart) / (gearEnd - gearStart), 0, 1);
    const rpmFloor = gear === 1
      ? profile.idleRpm
      : profile.idleRpm + (profile.redlineRpm - profile.idleRpm) * profile.shiftDropRatio;
    const loadBoost = throttle ? 0.015 : 0;
    const brakeReduction = braking ? 0.04 : 0;
    const rpmProgress = clamp(gearProgress + loadBoost - brakeReduction, 0, 1);
    rpm = Math.round(rpmFloor + (profile.redlineRpm - rpmFloor) * rpmProgress);
  }

  return {
    kmh,
    gear,
    gearLabel: isReverse ? 'R' : `G${gear}`,
    rpm,
    rpmPct: clamp(
      (rpm - profile.idleRpm) / Math.max(1, profile.redlineRpm - profile.idleRpm),
      0,
      1
    ),
    topSpeedKmh: profile.topSpeedKmh,
    speedometerMaxKmh: profile.speedometerMaxKmh,
    redlineRpm: profile.redlineRpm,
    idleRpm: profile.idleRpm
  };
}

export function calculateHazardEffect({
  type,
  kmh,
  braking = false,
  suspensionLevel = 1
}) {
  const base = {
    pothole: { slow: 0.8, wear: 1.55 },
    rough: { slow: 0.9, wear: 0.75 },
    gravel: { slow: 0.86, wear: 0.42 },
    mud: { slow: 0.72, wear: 0.24 }
  }[type] || { slow: 1, wear: 0 };

  const speedKmh = Number(kmh) || 0;
  if (!base.wear || speedKmh < DAMAGE_SPEED_KMH) return { slow: base.slow, wear: 0 };

  const excessSpeed = speedKmh - DAMAGE_SPEED_KMH;
  const speedDamageScale = 0.08 + Math.pow(excessSpeed / DAMAGE_SPEED_KMH, 1.2);
  const brakingFactor = braking ? 0.68 : 1;
  const suspensionReduction = clamp(1 - (Math.max(1, suspensionLevel) - 1) * 0.035, 0.42, 1);

  return {
    slow: base.slow,
    wear: base.wear * speedDamageScale * brakingFactor * suspensionReduction
  };
}
