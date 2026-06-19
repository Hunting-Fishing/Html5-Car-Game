function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function BottomSheet({ tabs = [], activeTab = '', body = '', className = '' } = {}) {
  return `
    <section class="bottomSheet ${escapeHtml(className)}">
      ${tabs.length ? `
        <div class="bottomSheetTabs" role="tablist">
          ${tabs.map((tab) => {
            const key = tab.key || tab.id || tab.screen || tab.label || '';
            const active = key === activeTab || tab.active;
            return `
              <button class="bottomSheetTab ${active ? 'active' : ''} ${escapeHtml(tab.className || '')}" type="button" role="tab" data-action="${escapeHtml(tab.action || 'sheetTab')}" data-sheet-tab="${escapeHtml(key)}" ${tab.screen ? `data-screen="${escapeHtml(tab.screen)}"` : ''} ${active ? 'aria-selected="true"' : 'aria-selected="false"'}>
                ${escapeHtml(tab.label || key)}
              </button>
            `;
          }).join('')}
        </div>
      ` : ''}
      <div class="bottomSheetBody">${body || ''}</div>
    </section>
  `;
}
