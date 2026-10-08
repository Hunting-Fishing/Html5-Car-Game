/** Prefix public files with the Vite/Pages base. Node tests and local root keep /assets. */
export function publicAsset(path = '') {
  const clean = String(path || '').replace(/^\/+/, '');
  if (!clean) return '';
  const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
  if (base === '/' || base === './' || base === '.') return `/${clean}`;
  return `${String(base).replace(/\/?$/, '/')}${clean}`;
}

