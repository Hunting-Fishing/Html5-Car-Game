const nativeSetTimeout = window.setTimeout.bind(window);

window.setTimeout = function guardedSetTimeout(callback, delay, ...args) {
  const worldIsActive = () => Boolean(document.querySelector('#screen-world.active'));
  if (delay === 650 && worldIsActive()) {
    return nativeSetTimeout(() => {}, delay);
  }
  return nativeSetTimeout(callback, delay, ...args);
};
