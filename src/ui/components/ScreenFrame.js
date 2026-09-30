function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function ScreenFrame({ title = '', subtitle = '', badge = '', className = '', children = '', body = '' } = {}) {
  const content = children || body || '';
  return `
    <section class="screenFrame ${escapeHtml(className)}">
      <header class="screenFrameHeader">
        <div>
          ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
          ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ''}
        </div>
        ${badge ? `<span class="pill screenFrameBadge">${escapeHtml(badge)}</span>` : ''}
      </header>
      <div class="screenFrameBody">${content}</div>
    </section>
  `;
}
