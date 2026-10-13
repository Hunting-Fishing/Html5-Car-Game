import { ScreenFrame } from '../components/ScreenFrame.js';
import { VIP_OFFERS } from '../../systems/vipSystem.js';

function grantLine(grant) {
  return Object.entries(grant).map(([key, amount]) => `+${amount} ${key}`).join(' · ');
}

export function renderVipScreen(state) {
  const rank = state.vipLevel || 0;
  const cards = VIP_OFFERS.map((offer) => {
    const owned = rank >= offer.level;
    return `<article class="vipCard vip${offer.level}">
      <div class="toolbox" aria-hidden="true"><b>${offer.level}</b></div>
      <h3>${offer.name}</h3>
      <small>VIP ${offer.level}</small>
      <p>${offer.bonus}</p>
      <em>${offer.box}<br>${grantLine(offer.grant)}</em>
      <button type="button" class="vipBuy" data-action="buyVip" data-level="${offer.level}" ${owned ? 'disabled' : ''}>${owned ? 'Owned' : offer.price}</button>
    </article>`;
  }).join('');
  return ScreenFrame({
    title: 'VIP Shop',
    subtitle: `Current rank VIP ${rank}. Card checkout is not connected, so unlocking changes this save only.`,
    className: 'vipFrame',
    body: `
      <button type="button" class="vipBack" data-action="closeVip">Back</button>
      <div class="vipRibbon">Mechanic toolboxes</div>
      <div class="vipGrid">${cards}</div>
    `
  });
}
