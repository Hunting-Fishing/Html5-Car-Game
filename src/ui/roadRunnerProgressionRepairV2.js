const RR_SAVE_KEY = '365_canvas_road_runner_v4';

const RR_VEHICLES_V2 = {
  hatchback:{coins:0,parts:0},greenCompact:{coins:180,parts:1},cityTaxi:{coins:260,parts:2},pickup:{coins:420,parts:4},rallyLite:{coins:640,parts:6},serviceVan:{coins:820,parts:8},desertRunner:{coins:1050,parts:11},offroad:{coins:1300,parts:14},exportVan:{coins:1650,parts:18},race:{coins:2050,parts:22},mountainCourier:{coins:2600,parts:28},superCoupe:{coins:3400,parts:36}
};
const RR_UPGRADES_V2 = {
  engine:{label:'Engine',max:15,baseCoins:45,baseParts:0,growth:1.42,partsEvery:4},tires:{label:'Tires',max:15,baseCoins:40,baseParts:0,growth:1.40,partsEvery:3},fuelTank:{label:'Fuel Tank',max:15,baseCoins:55,baseParts:0,growth:1.45,partsEvery:3},suspension:{label:'Suspension',max:15,baseCoins:45,baseParts:0,growth:1.42,partsEvery:3},durability:{label:'Durability',max:15,baseCoins:60,baseParts:1,growth:1.50,partsEvery:2},transmission:{label:'Transmission',max:10,baseCoins:95,baseParts:1,growth:1.55,partsEvery:2},brakes:{label:'Brakes',max:10,baseCoins:70,baseParts:0,growth:1.46,partsEvery:3},repairKit:{label:'Repair Kit',max:10,baseCoins:85,baseParts:1,growth:1.48,partsEvery:2}
};

function rrLoadSave(){try{return JSON.parse(localStorage.getItem(RR_SAVE_KEY)||'{}')}catch{return{}}}
function rrSave(s){localStorage.setItem(RR_SAVE_KEY,JSON.stringify(s))}
function rrDefaultUpgrades(){return{engine:1,tires:1,fuelTank:1,suspension:1,durability:1,transmission:1,brakes:1,repairKit:1}}
function rrToast(msg){let t=document.querySelector('.rrProgressToast');if(!t){t=document.createElement('div');t.className='rrProgressToast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),2400)}
function rrCost(key,level){const u=RR_UPGRADES_V2[key];return{coins:Math.round(u.baseCoins*Math.pow(u.growth,level-1)),parts:u.baseParts+Math.floor(level/u.partsEvery)}}
function rrMissing(need,s){const c=Math.max(0,(need.coins||0)-(s.coins||0));const p=Math.max(0,(need.parts||0)-(s.parts||0));return c||p?`Need ${c} coins / ${p} parts`:''}
function rrRefresh(){setTimeout(()=>{document.dispatchEvent(new Event('click'));document.querySelector('[data-racer-tab="garage"]')?.dispatchEvent(new Event('click',{bubbles:true}));},80)}

function rrCloseResultPanel(){const p=document.querySelector('#screen-race.active [data-rr-end-panel]');if(p){p.hidden=true;p.classList.remove('rrPostRunPanel');p.dataset.postRunEnhanced='false';} }
function rrEnsureCloseButton(){const p=document.querySelector('#screen-race.active [data-rr-end-panel]:not([hidden])');if(!p)return;if(!p.querySelector('[data-rr-result-close]')){const b=document.createElement('button');b.type='button';b.className='rrResultClose';b.dataset.rrResultClose='true';b.textContent='×';b.addEventListener('click',(e)=>{e.stopPropagation();rrCloseResultPanel();});p.appendChild(b);}p.querySelectorAll('[data-g],[data-m],[data-rr-post-garage],[data-rr-post-routes]').forEach(btn=>{if(btn.dataset.v2Wired)return;btn.dataset.v2Wired='true';btn.addEventListener('click',()=>setTimeout(rrCloseResultPanel,0),true);});p.querySelectorAll('[data-r],[data-rr-post-restart]').forEach(btn=>{if(btn.dataset.v2Wired)return;btn.dataset.v2Wired='true';btn.addEventListener('click',()=>setTimeout(()=>{rrCloseResultPanel();window.restartHillRoute?.();},0),true);});}

document.addEventListener('pointerdown',(e)=>{const p=document.querySelector('#screen-race.active [data-rr-end-panel]:not([hidden])');if(!p)return;if(p.contains(e.target))return;rrCloseResultPanel();},{capture:true});
document.addEventListener('keydown',(e)=>{if(e.key==='Escape')rrCloseResultPanel();});

function rrUpgradeDirect(key){const s=rrLoadSave();s.upgrades={...rrDefaultUpgrades(),...(s.upgrades||{})};const u=RR_UPGRADES_V2[key];if(!u){rrToast('Upgrade not found.');return}const level=s.upgrades[key]||1;if(level>=u.max){rrToast(`${u.label} is maxed.`);return}const need=rrCost(key,level);const miss=rrMissing(need,s);if(miss){rrToast(`Cannot upgrade: ${miss}`);return}s.coins=(s.coins||0)-need.coins;s.parts=(s.parts||0)-need.parts;s.upgrades[key]=level+1;rrSave(s);rrToast(`${u.label} upgraded to Lv.${level+1}.`);window.restartHillRoute?.();rrRefresh();}
function rrUnlockDirect(key){const s=rrLoadSave();s.unlockedVehicles=Array.isArray(s.unlockedVehicles)&&s.unlockedVehicles.length?s.unlockedVehicles:['hatchback'];const v=RR_VEHICLES_V2[key];if(!v){rrToast('Vehicle not found.');return}if(s.unlockedVehicles.includes(key)){s.selectedVehicle=key;rrSave(s);rrToast('Vehicle selected.');window.restartHillRoute?.();rrRefresh();return}const miss=rrMissing(v,s);if(miss){rrToast(`Cannot unlock: ${miss}`);return}s.coins=(s.coins||0)-v.coins;s.parts=(s.parts||0)-v.parts;s.unlockedVehicles.push(key);s.selectedVehicle=key;rrSave(s);rrToast('Vehicle unlocked and selected.');window.restartHillRoute?.();rrRefresh();}
function rrSelectDirect(key){const s=rrLoadSave();s.unlockedVehicles=Array.isArray(s.unlockedVehicles)&&s.unlockedVehicles.length?s.unlockedVehicles:['hatchback'];if(!s.unlockedVehicles.includes(key)){rrToast('Vehicle locked. Unlock it first.');return}s.selectedVehicle=key;rrSave(s);rrToast('Vehicle selected.');window.restartHillRoute?.();rrRefresh();}

function rrPatchActionsV2(){window.buyRoadRunnerUpgrade=rrUpgradeDirect;window.unlockRoadRunnerVehicle=rrUnlockDirect;window.selectRoadRunnerVehicle=rrSelectDirect;}
function rrBindInlineButtons(){document.querySelectorAll('.roadRunnerUpgradeCard button[onclick]').forEach(btn=>{if(btn.dataset.v2Bind)return;btn.dataset.v2Bind='true';const key=(btn.getAttribute('onclick')||'').match(/'([^']+)'/)?.[1];if(key)btn.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();rrUpgradeDirect(key);},{capture:true});});document.querySelectorAll('.roadRunnerVehicleCard button[onclick]').forEach(btn=>{if(btn.dataset.v2Bind)return;btn.dataset.v2Bind='true';const key=(btn.getAttribute('onclick')||'').match(/'([^']+)'/)?.[1];if(!key)return;btn.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();/Unlock|Locked/i.test(btn.textContent||'')?rrUnlockDirect(key):rrSelectDirect(key);},{capture:true});});}

function rrTickV2(){rrPatchActionsV2();rrEnsureCloseButton();rrBindInlineButtons();}
setInterval(rrTickV2,450);window.addEventListener('load',rrTickV2);document.addEventListener('click',()=>setTimeout(rrTickV2,30));
