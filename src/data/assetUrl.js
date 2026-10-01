/** Prefix public files with the Vite/Pages base (e.g. /Html5-Car-Game/). */
export function publicAsset(path = '') {
  const clean = String(path || '').replace(/^\/+/, '');
  if (!clean) return '';
  const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || './';
  return `${String(base).replace(/\/?$/, '/')}${clean}`;
}
