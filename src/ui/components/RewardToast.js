let toastTimer = null;

export function rewardToast(message) {
  return `<div class="rewardToast" role="status">${message}</div>`;
}

export function showToast(message, { root = document, duration = 1800 } = {}) {
  const el = root.getElementById ? root.getElementById('toast') : document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}
