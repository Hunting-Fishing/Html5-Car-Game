export function mergeSlotStateClasses({ ready = false, selected = false, locked = false, canMerge = false, isNew = false } = {}) {
  return [
    ready ? 'ready' : '',
    selected ? 'selected' : '',
    locked ? 'locked' : '',
    canMerge ? 'mergePossible' : '',
    isNew ? 'newItem' : ''
  ].filter(Boolean).join(' ');
}
