const ROUTE_META = [
  ['track','🇵🇭','PH: Barangay Test Loop','Starter route','3200m','1.05x','0m'],
  ['japan','🇯🇵','Japan: Touge Night Run','Mountain handling','3600m','1.12x','450m'],
  ['china','🇨🇳','China: Great Wall Ridge','Long ridge climb','4050m','1.18x','900m'],
  ['thailand','🇹🇭','Thailand: Market Coast','Market sprint','3500m','1.10x','1300m'],
  ['india','🇮🇳','India: Monsoon Highway','Wet-road control','3900m','1.18x','1800m'],
  ['uae','🇦🇪','UAE: Desert Express','Fuel endurance','4200m','1.22x','2300m'],
  ['egypt','🇪🇬','Egypt: Nile Desert Run','Desert economy','4400m','1.25x','2900m'],
  ['italy','🇮🇹','Italy: Coastal Sprint','Speed route','3800m','1.20x','3500m'],
  ['usa','🇺🇸','USA: Route 365 Highway','Fast highway','4700m','1.30x','4300m'],
  ['brazil','🇧🇷','Brazil: Rainforest Rally','Rough rally','5000m','1.38x','5200m'],
  ['canada','🇨🇦','Canada: Northern Forest Run','Forest hills','5100m','1.42x','6100m'],
  ['australia','🇦🇺','Australia: Outback Sprint','Heat endurance','5300m','1.46x','7100m'],
  ['germany','🇩🇪','Germany: Autobahn Test','High speed','5500m','1.50x','8200m'],
  ['uk','🇬🇧','UK: Rainy Country Road','Slippery route','4950m','1.44x','9300m'],
  ['mexico','🇲🇽','Mexico: Baja Dust Trail','Dust trail','5600m','1.55x','10500m'],
  ['southAfrica','🇿🇦','South Africa: Safari Ridge','Ridge rally','5850m','1.60x','11800m'],
  ['korea','🇰🇷','Korea: Neon City Climb','City climb','5550m','1.54x','13200m'],
  ['indonesia','🇮🇩','Indonesia: Island Volcano Road','Volcano climb','6100m','1.66x','14800m'],
  ['france','🇫🇷','France: Alpine Vineyard Pass','Alpine road','5900m','1.62x','16500m'],
  ['spain','🇪🇸','Spain: Mediterranean Rally','Late rally','6200m','1.70x','18400m']
];

const VEHICLE_CLASSES = [
  ['all','All'],['starter','Starter'],['utility','Utility'],['offroad','Off-Road'],['race','Race'],['endurance','Endurance']
];

const VEHICLE_CLASS_BY_NAME = {
  hatchback:'starter', greencompact:'starter', citytaxi:'starter', pickup:'utility', servicvan:'utility', servicevan:'utility', exportvan:'endurance', desertrunner:'endurance', offroad:'offroad', rallylite:'offroad', mountaincourier:'offroad', race:'race', supercoupe:'race'
};

function save() {
  try { return JSON.parse(localStorage.getItem('365_canvas_road_runner_v4') || '{}'); } catch { return {}; }
}

function resourceRow() {
  const s = save();
  return `<div class="rrProgressWallet"><span>🪙 ${Math.floor(s.coins||0)} Coins</span><span>🔩 ${Math.floor(s.parts||0)} Parts</span><span>🧰 ${Math.floor(s.tools||0)} Tools</span><span>🏁 Best ${Math.floor(s.bestDistance||0)}m</span></div>`;
}

function injectRouteCards() {
  const page = document.querySelector('[data-racer-page="routes"]');
  if (!page || page.dataset.progressRoutes === 'true') return;
  const s = save();
  const best = Math.floor(s.bestDistance || 0);
  const cards = document.createElement('section');
  cards.className = 'rrProgressBlock';
  cards.innerHTML = `<div class="rrProgressTitle"><h4>World Route Map</h4><span>100+ map structure ready</span></div>${resourceRow()}<div class="rrDailyRoute">🌍 Daily Event: ${ROUTE_META[(new Date().getDate()) % ROUTE_META.length][2]} <b>+25% route rewards today</b></div><div class="rrRouteCards">${ROUTE_META.map(([key,flag,label,tag,meters,reward,unlock])=>{
    const needed = Number(unlock.replace('m','')) || 0;
    const locked = best < needed;
    const left = Math.max(0, needed - best);
    return `<article class="rrRouteCard ${locked?'locked':'open'}" data-route-key="${key}"><div class="rrRouteFlag">${flag}</div><div><h5>${label}</h5><p>${tag}</p><div class="rrRouteMeta"><span>${meters}</span><span>${reward} reward</span><span>${locked?'Unlock '+left+'m':'Open'}</span></div><div class="rrUnlockBar"><i style="width:${Math.min(100, needed?best/needed*100:100)}%"></i></div></div></article>`;
  }).join('')}</div>`;
  page.prepend(cards);
  page.dataset.progressRoutes = 'true';
}

function vehicleClassFromCard(card) {
  const text = card.textContent.toLowerCase().replace(/[^a-z]/g,'');
  if (text.includes('pickup') || text.includes('van') || text.includes('runner')) return text.includes('desert') || text.includes('export') || text.includes('service') ? 'endurance' : 'utility';
  if (text.includes('offroad') || text.includes('rally') || text.includes('mountain')) return 'offroad';
  if (text.includes('race') || text.includes('coupe')) return 'race';
  return 'starter';
}

function addStatBars(card) {
  if (card.querySelector('.rrVehicleBars')) return;
  const cls = vehicleClassFromCard(card);
  const presets = {
    starter:[55,55,55,58], utility:[45,48,76,70], offroad:[58,62,66,86], race:[88,82,42,46], endurance:[50,45,92,82]
  }[cls] || [55,55,55,55];
  const labels = ['Speed','Accel','Fuel','Dur'];
  const box = document.createElement('div');
  box.className = 'rrVehicleBars';
  box.innerHTML = labels.map((label,i)=>`<div class="rrStatBar"><span>${label}</span><b><i style="width:${presets[i]}%"></i></b></div>`).join('');
  const btn = card.querySelector('button');
  if (btn) card.insertBefore(box, btn); else card.appendChild(box);
}

function injectVehicleFilters() {
  const page = document.querySelector('[data-racer-page="vehicles"]');
  if (!page || page.dataset.vehicleFilters === 'true') return;
  const controls = document.createElement('div');
  controls.className = 'rrVehicleFilters';
  controls.innerHTML = VEHICLE_CLASSES.map(([key,label])=>`<button type="button" data-vehicle-filter="${key}" class="${key==='all'?'active':''}">${label}</button>`).join('');
  page.insertBefore(controls, page.children[1] || null);
  controls.addEventListener('click', (event)=>{
    const btn = event.target.closest('[data-vehicle-filter]');
    if (!btn) return;
    const filter = btn.dataset.vehicleFilter;
    controls.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===btn));
    page.querySelectorAll('.roadRunnerVehicleCard, [data-vehicle-card], .vehicleCard').forEach(card=>{
      const cls = vehicleClassFromCard(card);
      card.style.display = filter === 'all' || filter === cls ? '' : 'none';
    });
  });
  page.dataset.vehicleFilters = 'true';
}

function enhanceVehicleCards() {
  document.querySelectorAll('[data-racer-page="vehicles"] .roadRunnerVehicleCard, [data-racer-page="vehicles"] [data-vehicle-card], [data-racer-page="vehicles"] .vehicleCard').forEach(addStatBars);
}

function injectGarageRepair() {
  const page = document.querySelector('[data-racer-page="garage"]');
  if (!page || page.dataset.repairAction === 'true') return;
  const panel = document.createElement('section');
  panel.className = 'rrProgressBlock rrRepairPanel';
  panel.innerHTML = `<div class="rrProgressTitle"><h4>Garage Service Bay</h4><span>Spend tools before a hard map</span></div>${resourceRow()}<p>Use Tools to prep the vehicle. This is a garage action layer; run wear still resets per run.</p><button class="btn gold" type="button" data-garage-tool-service>Use 1 Tool: Pre-Run Service</button><div class="rrRepairNote" data-garage-service-note>Ready.</div>`;
  page.prepend(panel);
  panel.querySelector('[data-garage-tool-service]').addEventListener('click',()=>{
    const s = save();
    const note = panel.querySelector('[data-garage-service-note]');
    if ((s.tools||0) < 1) { note.textContent = 'Need at least 1 Tool.'; return; }
    s.tools = Math.max(0, (s.tools||0) - 1);
    s.preRunService = (s.preRunService||0) + 1;
    localStorage.setItem('365_canvas_road_runner_v4', JSON.stringify(s));
    note.textContent = 'Service applied. Tool spent.';
    panel.querySelector('.rrProgressWallet').outerHTML = resourceRow();
  });
  page.dataset.repairAction = 'true';
}

function enhanceProgression() {
  injectRouteCards();
  injectVehicleFilters();
  enhanceVehicleCards();
  injectGarageRepair();
}

const observer = new MutationObserver(()=>requestAnimationFrame(enhanceProgression));
observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
window.addEventListener('load', enhanceProgression);
document.addEventListener('click',()=>requestAnimationFrame(enhanceProgression));
setInterval(enhanceProgression, 1200);
