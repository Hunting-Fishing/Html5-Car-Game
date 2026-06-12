// Phase 10 world-map stability patch.
// The main loop currently refreshes active screens on a timer. Re-rendering the World
// screen recreates the traffic DOM and resets vehicle animation. This patch blocks only
// that timed refresh while the World screen is active. Other screens still refresh normally.
(() => {
  const nativeSetTimeout = window.setTimeout.bind(window);

  window.setTimeout = function patchedSetTimeout(callback, delay, ...args) {
    if (delay === 650 && document.querySelector('#screen-world.active')) {
      return nativeSetTimeout(() => {}, delay);
    }
    return nativeSetTimeout(callback, delay, ...args);
  };
})();
