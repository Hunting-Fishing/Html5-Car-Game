function rrToast(text) {
  let node = document.querySelector('.rrProgressToast');
  if (!node) {
    node = document.createElement('div');
    node.className = 'rrProgressToast';
    document.body.appendChild(node);
  }
  node.textContent = text;
  node.classList.add('show');
  clearTimeout(node._timer);
  node._timer = setTimeout(() => node.classList.remove('show'), 2300);
}

const TITLE_TO_KEY = {
  'Starter Hatchback': 'hatchback',
  'Compact Sport': 'greenCompact',
  'Parts Pickup': 'pickup',
  'Service Van': 'serviceVan',
  'Off-Road Truck': 'offroad',
  'Purple Race Coupe': 'race'
};

function keyFromVehicleCard(card) {
  const title = card?.querySelector('h4')?.textContent?.trim();
  if (title && TITLE_TO_KEY[title]) return TITLE_TO_KEY[title];
  const old = card?.querySelector('button')?.getAttribute('onclick') || '';
  return old.match(/'([^']+)'/)?.[1] || '';
}

function vehicleCardClick(event) {
  const card = event.target.closest?.('#screen-race.active [data-road-runner-vehicles] .roadRunnerVehicleCard');
  if (!card) return;
  const button = event.target.closest('button');
  if (!button && !event.target.closest('.vehicleThumb')) return;
  const key = keyFromVehicleCard(card);
  if (!key) return;
  event.preventDefault();
  event.stopPropagation();

  const isSelected = /selected/i.test(card.textContent || '');
  const isUnlocked = /\bSelect\b/i.test(button?.textContent || '') || isSelected;
  if (isUnlocked || isSelected) {
    window.selectRoadRunnerVehicle?.(key);
    rrToast(isSelected ? 'Vehicle already selected.' : 'Vehicle selected.');
    return;
  }

  window.unlockRoadRunnerVehicle?.(key);
  setTimeout(() => {
    const updatedText = document.querySelector(`#screen-race.active [data-road-runner-vehicles] .roadRunnerVehicleCard h4`)?.textContent;
    rrToast('Unlock attempted. Check coins/parts or selected state.');
  }, 80);
}

function postRaceClick(event) {
  const panel = event.target.closest?.('#screen-race.active [data-rr-end-panel]:not([hidden])');
  if (!panel) return;
  const restart = event.target.closest('[data-r], [data-rr-post-restart], button.primary');
  const garage = event.target.closest('[data-g], [data-rr-post-garage], .gold');
  const routes = event.target.closest('[data-m], [data-rr-post-routes]');
  if (!restart && !garage && !routes) return;
  event.preventDefault();
  event.stopPropagation();
  if (restart) {
    panel.hidden = true;
    window.restartHillRoute?.();
    return;
  }
  panel.hidden = true;
  if (garage) document.querySelector('#screen-race.active [data-racer-tab="garage"]')?.click();
  if (routes) document.querySelector('#screen-race.active [data-racer-tab="routes"]')?.click();
}

function normalizeDisabledVehicleButtons() {
  document.querySelectorAll('#screen-race.active [data-road-runner-vehicles] .roadRunnerVehicleCard button').forEach((button) => {
    button.disabled = false;
    button.removeAttribute('disabled');
  });
}

document.addEventListener('pointerdown', vehicleCardClick, true);
document.addEventListener('click', vehicleCardClick, true);
document.addEventListener('pointerdown', postRaceClick, true);
document.addEventListener('click', postRaceClick, true);
setInterval(normalizeDisabledVehicleButtons, 300);
window.addEventListener('load', normalizeDisabledVehicleButtons);
