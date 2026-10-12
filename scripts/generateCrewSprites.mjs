import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public/assets/World/people/crew');

const ROLES = [
  { role: 'Driver', shirt: '#c72a0d', trim: '#7a1204', hat: 'cap' },
  { role: 'Mechanic', shirt: '#0d518c', trim: '#072844', hat: 'beanie' },
  { role: 'Courier', shirt: '#1f7a4d', trim: '#0d3d26', hat: 'cap' },
  { role: 'Fuel Hand', shirt: '#e07a12', trim: '#8a4308', hat: 'hardhat' },
  { role: 'Tow Hand', shirt: '#d6b21a', trim: '#6e5a08', hat: 'cap' },
  { role: 'Sales', shirt: '#6d3fa0', trim: '#3a1d5c', hat: 'none' },
  { role: 'Tuner', shirt: '#2c3138', trim: '#111418', hat: 'band' },
  { role: 'Pit Crew', shirt: '#f4f1ea', trim: '#c72a0d', hat: 'helmet' }
];
const SKIN = ['#f3d2b0', '#e7b98a', '#c68642', '#8d5524', '#5a3318', '#f7e0c8'];
const HAIR = ['#1b1408', '#3b2414', '#6b3a1f', '#c9a15b', '#241818', '#7a2430', '#2d2a28'];
const HAIR_CUTS = ['short', 'side', 'bun', 'mohawk', 'curls', 'bangs'];

function sprite({ index, role }) {
  const skin = SKIN[index % SKIN.length];
  const hair = HAIR[(index * 3) % HAIR.length];
  const cut = HAIR_CUTS[index % HAIR_CUTS.length];
  const look = index % 5 === 0 ? 'glasses' : index % 7 === 0 ? 'shades' : 'open';
  const hairMarkup = {
    short: `<path d="M18 22c1-10 8-16 14-16s13 6 14 16c-2-6-8-9-14-9s-12 3-14 9z" fill="${hair}"/>`,
    side: `<path d="M17 24c0-12 8-18 16-18 7 0 13 5 14 14-8-2-14 1-18 6-4-1-8-1-12-2z" fill="${hair}"/>`,
    bun: `<path d="M18 22c1-9 8-15 14-15s13 6 14 15c-3-6-8-8-14-8s-11 2-14 8z" fill="${hair}"/><circle cx="46" cy="16" r="6" fill="${hair}"/>`,
    mohawk: `<path d="M28 8c2-6 6-8 4 2 6-8 10-6 6 4-2 8-6 10-10 8-4 2-8 0-10-8 0-6 4-10 6-4 0-4 2-6 4-2z" fill="${hair}"/>`,
    curls: `<circle cx="22" cy="18" r="6" fill="${hair}"/><circle cx="32" cy="12" r="7" fill="${hair}"/><circle cx="42" cy="18" r="6" fill="${hair}"/>`,
    bangs: `<path d="M16 24c2-14 10-18 16-18s14 4 16 18c-4-4-8-2-12 0-3-3-7-4-12-2-3 1-6 1-8 2z" fill="${hair}"/>`
  }[cut];
  const face = look === 'glasses'
    ? `<circle cx="26" cy="24" r="4" fill="none" stroke="#1b1408" stroke-width="1.4"/><circle cx="38" cy="24" r="4" fill="none" stroke="#1b1408" stroke-width="1.4"/><path d="M30 24h4" stroke="#1b1408" stroke-width="1.4"/>`
    : look === 'shades'
      ? `<rect x="21" y="21" width="22" height="6" rx="3" fill="#111"/>`
      : `<circle cx="26" cy="24" r="1.5" fill="#1b1408"/><circle cx="38" cy="24" r="1.5" fill="#1b1408"/>`;
  const hat = {
    cap: `<path d="M18 18h22l2 4H16z" fill="${role.trim}"/><path d="M16 22h34" stroke="${role.trim}" stroke-width="3"/>`,
    beanie: `<path d="M18 20c2-10 8-14 14-14s12 4 14 14z" fill="${role.trim}"/>`,
    hardhat: `<path d="M16 20h32v4H14z" fill="${role.shirt}"/><path d="M20 20c2-8 6-12 12-12s10 4 12 12z" fill="${role.shirt}"/>`,
    helmet: `<path d="M16 22c1-12 8-16 16-16s15 4 16 16z" fill="#f4f1ea" stroke="${role.trim}" stroke-width="2"/><path d="M18 22h28" stroke="${role.trim}" stroke-width="2"/>`,
    band: `<path d="M18 18h28v5H18z" fill="${role.trim}"/>`,
    none: ''
  }[role.hat];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80" width="64" height="80" role="img" aria-label="${role.role} sprite ${index + 1}">
  <rect width="64" height="80" rx="14" fill="#10283c"/>
  <ellipse cx="32" cy="74" rx="16" ry="3" fill="#000" opacity=".28"/>
  <rect x="22" y="54" width="8" height="16" rx="3" fill="#1b2430"/>
  <rect x="34" y="54" width="8" height="16" rx="3" fill="#1b2430"/>
  <rect x="16" y="34" width="32" height="24" rx="8" fill="${role.shirt}"/>
  <rect x="16" y="34" width="32" height="6" fill="${role.trim}"/>
  <rect x="8" y="36" width="8" height="16" rx="4" fill="${skin}"/>
  <rect x="48" y="36" width="8" height="16" rx="4" fill="${skin}"/>
  <circle cx="32" cy="24" r="14" fill="${skin}"/>
  ${hairMarkup}
  ${hat}
  ${face}
  <path d="M28 30c2 2 6 2 8 0" fill="none" stroke="#7a3b22" stroke-width="1.2" stroke-linecap="round"/>
  <circle cx="44" cy="46" r="4" fill="#f6c445"/>
  <text x="44" y="48" text-anchor="middle" font-size="6" font-family="sans-serif" font-weight="700" fill="#1b1408">${(index % 9) + 1}</text>
</svg>`;
}

await mkdir(outDir, { recursive: true });
const cells = [];
for (let index = 0; index < 100; index += 1) {
  const role = ROLES[index % ROLES.length];
  const id = String(index + 1).padStart(3, '0');
  const file = `crew-${id}.svg`;
  await writeFile(join(outDir, file), sprite({ index, role }));
  const x = (index % 10) * 72;
  const y = Math.floor(index / 10) * 88;
  cells.push(`<image href="./${file}" x="${x}" y="${y}" width="64" height="80"/>`);
}
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 880" width="720" height="880">
  <rect width="720" height="880" fill="#06131d"/>
  ${cells.join('\n  ')}
</svg>`;
await writeFile(join(outDir, 'crew-sheet.svg'), sheet);
console.log('wrote 100 crew sprites');
