const VEHICLE_URL_REWRITE = new Map([
  ['/assets/vehicles/car-compact-blue.svg', '/assets/vehicles/racer/sprite_0000.png'],
  ['/assets/vehicles/car-compact-green.svg', '/assets/vehicles/racer/sprite_0010.png'],
  ['/assets/vehicles/pickup-orange.svg', '/assets/vehicles/racer/sprite_0011.png'],
  ['/assets/vehicles/van-service-white.svg', '/assets/vehicles/racer/sprite_0007.png'],
  ['/assets/vehicles/offroad-red.svg', '/assets/vehicles/racer/sprite_0006.png'],
  ['/assets/vehicles/race-purple.svg', '/assets/vehicles/racer/sprite_0005.png']
]);

const proto = HTMLImageElement.prototype;
const descriptor = Object.getOwnPropertyDescriptor(proto, 'src');

function rewriteVehicleSrc(value) {
  try {
    const url = new URL(value, window.location.origin);
    const mapped = VEHICLE_URL_REWRITE.get(url.pathname);
    return mapped || value;
  } catch {
    return value;
  }
}

if (descriptor?.set && !window.__racerAssetRewriteInstalled) {
  window.__racerAssetRewriteInstalled = true;
  Object.defineProperty(proto, 'src', {
    configurable: true,
    enumerable: descriptor.enumerable,
    get: descriptor.get,
    set(value) {
      descriptor.set.call(this, rewriteVehicleSrc(value));
    }
  });
  console.info('[365 Racer] Vehicle asset URL rewrite active');
}
