function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function HorizontalCarousel({ items = [], className = '' } = {}) {
  return `
    <div class="horizontalCarousel ${escapeHtml(className)}" role="list">
      ${items.map((item) => {
        const body = typeof item === 'string' ? item : item.body || item.html || '';
        const itemClass = typeof item === 'string' ? '' : item.className || '';
        return `<div class="horizontalCarouselItem ${escapeHtml(itemClass)}" role="listitem">${body}</div>`;
      }).join('')}
    </div>
  `;
}
