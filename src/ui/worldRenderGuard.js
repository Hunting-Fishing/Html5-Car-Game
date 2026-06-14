const nativeSetTimeout = window.setTimeout.bind(window);

window.setTimeout = function guardedSetTimeout(callback, delay, ...args) {
  const worldIsActive = () => Boolean(document.querySelector('#screen-world.active'));
  const raceIsActive = () => Boolean(document.querySelector('#screen-race.active'));
  if (delay === 650 && (worldIsActive() || raceIsActive())) {
    return nativeSetTimeout(() => {}, delay);
  }
  return nativeSetTimeout(callback, delay, ...args);
};
