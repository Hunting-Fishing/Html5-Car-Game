function ensureGasGearBadge() {
  const gas = document.querySelector('#screen-race.active [data-rr-control="gas"]');
  if (!gas) return null;
  let badge = gas.querySelector('[data-gas-gear-badge]');
  if (badge) return badge;
  badge = document.createElement('span');
  badge.className = 'rrGasGearBadge';
  badge.dataset.gasGearBadge = 'true';
  badge.textContent = 'G1';
  gas.appendChild(badge);
  return badge;
}

function currentGearFromGauge() {
  const gaugeGear = document.querySelector('#screen-race.active [data-gear-value]');
  const text = gaugeGear?.textContent?.trim();
  return text && /^G\d/.test(text) ? text : 'G1';
}

function tickGasGearBadge() {
  const badge = ensureGasGearBadge();
  if (badge) badge.textContent = currentGearFromGauge();
  requestAnimationFrame(tickGasGearBadge);
}

requestAnimationFrame(tickGasGearBadge);
