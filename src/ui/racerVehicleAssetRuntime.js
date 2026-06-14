const VEHICLE_CARD_ASSETS = {
  'Starter Hatchback': {
    png: '/assets/vehicles/racer/sprite_0000.png',
    fallback: '/assets/vehicles/racer/starter-hatchback.svg'
  },
  'Compact Sport': {
    png: '/assets/vehicles/racer/sprite_0010.png',
    fallback: '/assets/vehicles/racer/compact-sport.svg'
  },
  'City Taxi': {
    png: '/assets/vehicles/racer/sprite_0002.png',
    fallback: '/assets/vehicles/racer/city-taxi.svg'
  },
  'Parts Pickup': {
    png: '/assets/vehicles/racer/sprite_0011.png',
    fallback: '/assets/vehicles/racer/parts-pickup.svg'
  },
  'Rally Lite': {
    png: '/assets/vehicles/racer/sprite_0012.png',
    fallback: '/assets/vehicles/racer/rally-lite.svg'
  },
  'Service Van': {
    png: '/assets/vehicles/racer/sprite_0007.png',
    fallback: '/assets/vehicles/racer/service-van.svg'
  },
  'Desert Runner': {
    png: '/assets/vehicles/racer/sprite_0015.png',
    fallback: '/assets/vehicles/racer/desert-runner.svg'
  },
  'Off-Road Truck': {
    png: '/assets/vehicles/racer/sprite_0006.png',
    fallback: '/assets/vehicles/racer/off-road-truck.svg'
  },
  'Export Support Van': {
    png: '/assets/vehicles/racer/sprite_0013.png',
    fallback: '/assets/vehicles/racer/export-support-van.svg'
  },
  'Purple Race Coupe': {
    png: '/assets/vehicles/racer/sprite_0005.png',
    fallback: '/assets/vehicles/racer/purple-race-coupe.svg'
  },
  'Mountain Courier': {
    png: '/assets/vehicles/racer/sprite_0014.png',
    fallback: '/assets/vehicles/racer/mountain-courier.svg'
  },
  '365 Super Coupe': {
    png: '/assets/vehicles/racer/sprite_0009.png',
    fallback: '/assets/vehicles/racer/super-coupe.svg'
  }
};

function applyRacerVehicleAssets() {
  const panel = document.querySelector('[data-road-runner-vehicles]');
  if (!panel) return;
  panel.querySelectorAll('.roadRunnerVehicleCard').forEach((card) => {
    const title = card.querySelector('h4')?.textContent?.trim();
    const asset = VEHICLE_CARD_ASSETS[title];
    if (!asset) return;
    const thumb = card.querySelector('.vehicleThumb');
    if (!thumb || thumb.dataset.racerAsset === asset.png) return;
    thumb.dataset.racerAsset = asset.png;
    thumb.innerHTML = `<img class="racerVehicleSprite" src="${asset.png}" alt="${title}" loading="lazy">`;
    const img = thumb.querySelector('img');
    img.addEventListener('error', () => {
      if (img.dataset.usedFallback === 'true') return;
      img.dataset.usedFallback = 'true';
      img.src = asset.fallback;
    }, { once: true });
  });
}

const observer = new MutationObserver(() => requestAnimationFrame(applyRacerVehicleAssets));
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.addEventListener('load', applyRacerVehicleAssets);
document.addEventListener('click', () => requestAnimationFrame(applyRacerVehicleAssets));
setInterval(applyRacerVehicleAssets, 600);
