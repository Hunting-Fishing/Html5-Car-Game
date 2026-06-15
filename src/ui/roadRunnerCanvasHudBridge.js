const style = document.createElement('style');
style.textContent = `
.rrCollectionHudBridge{position:absolute;left:14px;top:74px;z-index:12;display:flex;gap:6px;align-items:center;pointer-events:none;max-width:calc(100% - 28px);overflow:hidden}.rrCollectionHudBridge .pill{display:flex;align-items:center;gap:5px;min-width:62px;padding:5px 8px;border-radius:999px;background:rgba(4,17,29,.78);border:1px solid rgba(255,255,255,.14);box-shadow:0 3px 0 rgba(0,0,0,.18);color:#fff;font-size:10px;font-weight:1000;text-shadow:0 1px 0 #000}.rrCollectionHudBridge img{width:18px;height:18px;object-fit:contain}.rrCollectionHudBridge .fuelNext{min-width:86px}.rrCollectionHudBridge .label{display:block;color:#c7f9ff;font-size:7px;line-height:1;text-transform:uppercase}.rrCollectionHudBridge b{display:block;line-height:1.05}@media(max-width:430px){.rrCollectionHudBridge{top:72px;left:10px;gap:4px}.rrCollectionHudBridge .pill{min-width:53px;padding:4px 6px;font-size:9px}.rrCollectionHudBridge .fuelNext{min-width:74px}.rrCollectionHudBridge img{width:16px;height:16px}}
`;
document.head.appendChild(style);

window.__rrCollections = { coins: 0, parts: 0, tools: 0, fuel: 0, t: performance.now() };

const originalFillText = CanvasRenderingContext2D.prototype.fillText;
CanvasRenderingContext2D.prototype.fillText = function patchedFillText(text, x, y, maxWidth) {
  if (typeof text === 'string' && text.startsWith('Run +')) {
    const match = text.match(/Run \+(\d+)C \+(\d+)P \+(\d+)T\s+Next fuel\s+(\d+)m/);
    if (match) {
      window.__rrCollections = {
        coins: Number(match[1]),
        parts: Number(match[2]),
        tools: Number(match[3]),
        fuel: Number(match[4]),
        t: performance.now()
      };
      return;
    }
  }
  return originalFillText.call(this, text, x, y, maxWidth);
};

function ensureCollectionHud() {
  const frame = document.querySelector('#screen-race.active .roadRunnerGameFrame');
  if (!frame) return null;
  let hud = frame.querySelector('[data-rr-collection-hud]');
  if (hud) return hud;
  hud = document.createElement('div');
  hud.className = 'rrCollectionHudBridge';
  hud.dataset.rrCollectionHud = 'true';
  hud.innerHTML = `
    <div class="pill"><img src="/assets/road-runner/token-coin.svg" alt=""><span><span class="label">Coins</span><b data-rrc-coins>+0</b></span></div>
    <div class="pill"><img src="/assets/road-runner/token-parts.svg" alt=""><span><span class="label">Parts</span><b data-rrc-parts>+0</b></span></div>
    <div class="pill"><img src="/assets/road-runner/tool-kit.svg" alt=""><span><span class="label">Tools</span><b data-rrc-tools>+0</b></span></div>
    <div class="pill fuelNext"><img src="/assets/road-runner/token-energy.svg" alt=""><span><span class="label">Fuel</span><b data-rrc-fuel>0m</b></span></div>
  `;
  frame.appendChild(hud);
  return hud;
}

function updateCollectionHud() {
  const hud = ensureCollectionHud();
  if (!hud) return;
  const data = window.__rrCollections || {};
  hud.querySelector('[data-rrc-coins]').textContent = `+${data.coins || 0}`;
  hud.querySelector('[data-rrc-parts]').textContent = `+${data.parts || 0}`;
  hud.querySelector('[data-rrc-tools]').textContent = `+${data.tools || 0}`;
  hud.querySelector('[data-rrc-fuel]').textContent = `${data.fuel || 0}m`;
}

setInterval(updateCollectionHud, 120);
window.addEventListener('load', updateCollectionHud);
