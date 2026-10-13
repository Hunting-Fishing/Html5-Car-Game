import { addCurrency } from './economySystem.js';

export const VIP_OFFERS = [
  {
    level: 1,
    name: 'Shop Pass',
    price: '$1.99',
    bonus: '+5% race coins',
    box: 'Small toolbox',
    grant: { coins: 500, tools: 20, parts: 10 }
  },
  {
    level: 2,
    name: 'Crew Pass',
    price: '$4.99',
    bonus: '+10% race coins',
    box: 'Crew toolbox',
    grant: { coins: 1500, tools: 40, parts: 25, scrap: 20 }
  },
  {
    level: 3,
    name: 'Garage Pass',
    price: '$9.99',
    bonus: '+15% race coins and a toolbox on each win',
    box: 'Master toolbox',
    grant: { coins: 4000, tools: 80, parts: 50, tune: 10 }
  }
];

export function buyVipPass(state, level) {
  const offer = VIP_OFFERS.find((item) => item.level === Number(level));
  if (!offer) return { ok: false, message: 'Unknown VIP pass.' };
  if ((state.vipLevel || 0) >= offer.level) return { ok: false, message: `${offer.name} is already unlocked.` };
  state.vipLevel = offer.level;
  Object.entries(offer.grant).forEach(([key, amount]) => addCurrency(state, key, amount));
  return { ok: true, message: `${offer.name} unlocked. ${offer.box} added to your save.` };
}
