import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer';
import screenfull from 'screenfull';

const ResizeObserverImpl = window.ResizeObserver || ResizeObserverPolyfill;

function getActiveScreen() {
  return document.querySelector('.screen.active');
}

function setClass(target, name, active) {
  if (target) target.classList.toggle(name, Boolean(active));
}

function readScreenState() {
  const shell = document.querySelector('.appShell');
  const screen = getActiveScreen();
  const shellRect = shell?.getBoundingClientRect();
  const screenRect = screen?.getBoundingClientRect();
  const width = Math.round(screenRect?.width || shellRect?.width || window.innerWidth);
  const height = Math.round(screenRect?.height || shellRect?.height || window.innerHeight);
  const activeScreen = screen?.id?.replace(/^screen-/, '') || '';
  return {
    activeScreen,
    width,
    height,
    ratio: Number((width / Math.max(1, height)).toFixed(3)),
    compact: width <= 430 || height <= 760,
    tiny: width <= 380 || height <= 640,
    short: height <= 720,
    landscape: width > height,
    fullscreen: Boolean(screenfull.isEnabled && screenfull.isFullscreen)
  };
}

function applyScreenState() {
  const state = readScreenState();
  const root = document.documentElement;
  const shell = document.querySelector('.appShell');
  const screen = getActiveScreen();
  root.style.setProperty('--ui-screen-w', `${state.width}px`);
  root.style.setProperty('--ui-screen-h', `${state.height}px`);
  root.style.setProperty('--ui-race-command-h', state.tiny ? '48px' : state.compact ? '56px' : '64px');
  root.style.setProperty('--ui-build-command-max-h', state.tiny ? '178px' : state.compact ? '205px' : '228px');
  setClass(root, 'uiCompact', state.compact);
  setClass(root, 'uiTiny', state.tiny);
  setClass(root, 'uiShort', state.short);
  setClass(root, 'uiLandscape', state.landscape);
  setClass(root, 'uiFullscreen', state.fullscreen);
  setClass(shell, 'uiShellMeasured', true);
  if (screen) {
    screen.dataset.uiWidth = String(state.width);
    screen.dataset.uiHeight = String(state.height);
    screen.dataset.uiCompact = state.compact ? '1' : '0';
  }
  window.__uiScreenState = state;
  window.dispatchEvent(new CustomEvent('ui-screen-state', { detail: state }));
}

function bindScreenController() {
  const observer = new ResizeObserverImpl(() => requestAnimationFrame(applyScreenState));
  const observeTargets = () => {
    const shell = document.querySelector('.appShell');
    const screen = getActiveScreen();
    if (shell && !shell.dataset.uiObserved) {
      shell.dataset.uiObserved = '1';
      observer.observe(shell);
    }
    if (screen && !screen.dataset.uiObserved) {
      screen.dataset.uiObserved = '1';
      observer.observe(screen);
    }
  };

  const mutationObserver = new MutationObserver(() => {
    observeTargets();
    requestAnimationFrame(applyScreenState);
  });
  mutationObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });

  window.toggleGameFullscreen = async () => {
    if (!screenfull.isEnabled) return false;
    const target = document.querySelector('.appShell') || document.documentElement;
    await screenfull.toggle(target);
    applyScreenState();
    return screenfull.isFullscreen;
  };

  window.addEventListener('resize', () => requestAnimationFrame(applyScreenState));
  document.addEventListener('visibilitychange', () => requestAnimationFrame(applyScreenState));
  if (screenfull.isEnabled) {
    screenfull.on('change', () => requestAnimationFrame(applyScreenState));
  }
  observeTargets();
  applyScreenState();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindScreenController, { once: true });
} else {
  bindScreenController();
}
