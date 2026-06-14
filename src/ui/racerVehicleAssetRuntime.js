const VEHICLE_CARD_ASSETS = {
  'Starter Hatchback': '/assets/vehicles/racer/starter-hatchback.svg',
  'Compact Sport': '/assets/vehicles/racer/compact-sport.svg',
  'City Taxi': '/assets/vehicles/racer/city-taxi.svg',
  'Parts Pickup': '/assets/vehicles/racer/parts-pickup.svg',
  'Rally Lite': '/assets/vehicles/racer/rally-lite.svg',
  'Service Van': '/assets/vehicles/racer/service-van.svg',
  'Desert Runner': '/assets/vehicles/racer/desert-runner.svg',
  'Off-Road Truck': '/assets/vehicles/racer/off-road-truck.svg',
  'Export Support Van': '/assets/vehicles/racer/export-support-van.svg',
  'Purple Race Coupe': '/assets/vehicles/racer/purple-race-coupe.svg',
  'Mountain Courier': '/assets/vehicles/racer/mountain-courier.svg',
  '365 Super Coupe': '/assets/vehicles/racer/super-coupe.svg'
};

function applyRacerVehicleAssets() {
  const panel = document.querySelector('[data-road-runner-vehicles]');
  if (!panel) return;
  panel.querySelectorAll('.roadRunnerVehicleCard').forEach((card) => {
    const title = card.querySelector('h4')?.textContent?.trim();
    const asset = VEHICLE_CARD_ASSETS[title];
    if (!asset) return;
    const thumb = card.querySelector('.vehicleThumb');
    if (!thumb || thumb.dataset.racerAsset === asset) return;
    thumb.dataset.racerAsset = asset;
    thumb.innerHTML = `<img src="${asset}" alt="${title}" loading="lazy">`;
  });
}

const observer = new MutationObserver(() => requestAnimationFrame(applyRacerVehicleAssets));
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.addEventListener('load', applyRacerVehicleAssets);
document.addEventListener('click', () => requestAnimationFrame(applyRacerVehicleAssets));
setInterval(applyRacerVehicleAssets, 900);
