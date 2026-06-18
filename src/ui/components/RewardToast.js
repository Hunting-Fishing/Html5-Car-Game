import { currencyIconForKey, UI_ICONS } from '../../data/uiIconMap.js';

let toastSequence = 0;
let floatSequence = 0;

const DEFAULT_DURATION = 2400;
const FLOAT_DURATION = 1400;
const MAX_TOASTS = 4;

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function iconForReward(reward = {}) {
  return reward.icon || (reward.resource ? currencyIconForKey(reward.resource) : UI_ICONS.coin);
}

function ensureDebugState(root = document) {
  const target = root.defaultView || window;
  if (!target.__rewardFeedbackState) {
    target.__rewardFeedbackState = { toasts: [], floats: [] };
  }
  return target.__rewardFeedbackState;
}

function setLegacyStatus(message, root = document) {
  const el = root.getElementById ? root.getElementById('toast') : document.getElementById('toast');
  if (el) {
    el.textContent = message;
    el.classList.remove('show');
  }
}

function removeAfter(node, duration) {
  window.setTimeout(() => {
    node.classList.add('leaving');
    window.setTimeout(() => node.remove(), 260);
  }, duration);
}

function rewardChip(reward, root) {
  const item = root.createElement('span');
  item.className = 'rewardToastChip';
  const img = root.createElement('img');
  img.src = iconForReward(reward);
  img.alt = '';
  img.loading = 'eager';
  img.draggable = false;
  const value = root.createElement('b');
  value.textContent = reward.text || `+${reward.amount || ''}`;
  const label = root.createElement('small');
  label.textContent = reward.label || reward.resource || 'Reward';
  item.append(img, value, label);
  return item;
}

export function rewardToast(message) {
  return `<div class="rewardToastCard rewardToastPlain" role="status"><b>${message}</b></div>`;
}

export function showRewardToast({
  title = 'Reward',
  message = '',
  tone = 'good',
  icon = '',
  rewards = [],
  duration = DEFAULT_DURATION,
  root = document
} = {}) {
  const stack = root.getElementById ? root.getElementById('rewardToastStack') : document.getElementById('rewardToastStack');
  if (!stack) {
    setLegacyStatus(message || title, root);
    return;
  }

  const id = ++toastSequence;
  const card = root.createElement('div');
  card.className = `rewardToastCard ${tone}`;
  card.dataset.rewardToastId = String(id);

  const badge = root.createElement('span');
  badge.className = 'rewardToastBadge';
  const badgeImg = root.createElement('img');
  badgeImg.src = icon || UI_ICONS.coin;
  badgeImg.alt = '';
  badgeImg.loading = 'eager';
  badgeImg.draggable = false;
  badge.append(badgeImg);

  const copy = root.createElement('div');
  copy.className = 'rewardToastCopy';
  const heading = root.createElement('b');
  heading.textContent = title;
  const body = root.createElement('span');
  body.textContent = message || title;
  copy.append(heading, body);

  const rewardList = asArray(rewards).slice(0, 4);
  const chips = root.createElement('div');
  chips.className = 'rewardToastChips';
  rewardList.forEach((reward) => chips.append(rewardChip(reward, root)));

  card.append(badge, copy);
  if (rewardList.length) card.append(chips);
  stack.prepend(card);
  while (stack.children.length > MAX_TOASTS) stack.lastElementChild?.remove();

  window.requestAnimationFrame(() => card.classList.add('show'));
  removeAfter(card, duration);
  setLegacyStatus(message || title, root);

  const debug = ensureDebugState(root);
  debug.toasts.unshift({ id, title, message, tone, rewards: rewardList.map((reward) => ({ ...reward })) });
  debug.toasts = debug.toasts.slice(0, 12);
}

export function showFloatingReward(text, {
  tone = 'gold',
  icon = '',
  resource = '',
  root = document,
  x = null,
  y = null
} = {}) {
  const layer = root.getElementById ? root.getElementById('floatingRewardLayer') : document.getElementById('floatingRewardLayer');
  if (!layer || !text) return;

  const id = ++floatSequence;
  const node = root.createElement('div');
  node.className = `floatingReward ${tone}`;
  node.dataset.floatingRewardId = String(id);
  node.style.setProperty('--float-x', `${Number.isFinite(x) ? x : 50 + (Math.random() * 30 - 15)}%`);
  node.style.setProperty('--float-y', `${Number.isFinite(y) ? y : 58 + (Math.random() * 14 - 7)}%`);

  const src = icon || (resource ? currencyIconForKey(resource) : '');
  if (src) {
    const img = root.createElement('img');
    img.src = src;
    img.alt = '';
    img.loading = 'eager';
    img.draggable = false;
    node.append(img);
  }
  const label = root.createElement('span');
  label.textContent = text;
  node.append(label);

  layer.append(node);
  removeAfter(node, FLOAT_DURATION);

  const debug = ensureDebugState(root);
  debug.floats.unshift({ id, text, tone, resource });
  debug.floats = debug.floats.slice(0, 20);
}

export function showToast(message, options = {}) {
  showRewardToast({
    title: options.title || (options.tone === 'bad' ? 'Needs Attention' : 'Update'),
    message,
    tone: options.tone || 'neutral',
    icon: options.icon || UI_ICONS.menu,
    duration: options.duration || DEFAULT_DURATION,
    root: options.root || document
  });
}
