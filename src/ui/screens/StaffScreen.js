import { IDLE_LINES } from '../../data/gameData.js';
import { personAssetForKey } from '../../data/worldAssetMap.js';
import { CHARACTERS, characterById } from '../../data/characterRoster.js';
import { ScreenFrame } from '../components/ScreenFrame.js';
import { costToText, canAfford } from '../../systems/economySystem.js';
import { characterViews } from '../../systems/characterSystem.js';
import { getLineState, getManagerCost, hasManager, isAutoCollectEnabled, isLineUnlocked, quoteLineUpgrade } from '../../systems/idleLineSystem.js';

const MANAGERS = [
  { id: 'streetRoute', avatar: 'driver', name: 'Route Driver', role: 'Manager', phone: '365-010', place: 'Bay 1 sidewalk', desk: 'Street Route' },
  { id: 'partsDelivery', avatar: 'residentGreen', name: 'Parts Courier', role: 'Manager', phone: '365-020', place: 'Warehouse dock', desk: 'Parts Delivery' },
  { id: 'mobileMechanic', avatar: 'mechanic', name: 'Mobile Tech', role: 'Manager', phone: '365-030', place: 'Service van', desk: 'Mobile Mechanic' },
  { id: 'fuelRun', avatar: 'residentBlue', name: 'Fuel Runner', role: 'Manager', phone: '365-040', place: 'Fuel bay', desk: 'Fuel Run' },
  { id: 'towingJob', avatar: 'residentOrange', name: 'Tow Operator', role: 'Manager', phone: '365-050', place: 'Tow yard', desk: 'Towing Job' },
  { id: 'dealerShowcase', avatar: 'residentPurple', name: 'Sales Rep', role: 'Manager', phone: '365-060', place: 'Showroom floor', desk: 'Dealer Showcase' },
  { id: 'performanceBay', avatar: 'mechanic', name: 'Tuner', role: 'Manager', phone: '365-070', place: 'Dyno bay', desk: 'Performance Bay' },
  { id: 'raceEvent', avatar: 'driver', name: 'Crew Chief', role: 'Manager', phone: '365-080', place: 'Pit lane', desk: 'Race Event' }
];

const EMPLOYEES = [
  { id: 'residentBlue', avatar: 'residentBlue', name: 'Mia', role: 'Employee', job: 'Tires', phone: '365-101', place: 'Tire shop sidewalk', desk: 'Tire Repair' },
  { id: 'residentGreen', avatar: 'residentGreen', name: 'Jay', role: 'Employee', job: 'Parts', phone: '365-102', place: 'Parts warehouse', desk: 'Parts Desk' },
  { id: 'residentOrange', avatar: 'residentOrange', name: 'Nico', role: 'Employee', job: 'Traffic', phone: '365-103', place: 'Avenue corner', desk: 'Street Watch' },
  { id: 'residentPurple', avatar: 'residentPurple', name: 'Ari', role: 'Employee', job: 'Sales', phone: '365-104', place: 'Dealer sidewalk', desk: 'Showroom' },
  { id: 'mechanic', avatar: 'mechanic', name: 'Rae', role: 'Employee', job: 'Tools', phone: '365-105', place: 'Mechanic bay', desk: 'Tool Crib' },
  { id: 'driver', avatar: 'driver', name: 'Sol', role: 'Employee', job: 'Tow', phone: '365-106', place: 'Dispatch curb', desk: 'Tow Desk' }
];

let selectedStaff = 'crew-001';
let staffTab = 'list';
let fireArmed = '';
let crewFilter = 'All';

const CREW_FILTERS = ['All', 'Drive', 'Shop', 'Crew'];

const STAFF_TABS = [
  { id: 'list', label: 'List' },
  { id: 'hire', label: 'Hire' },
  { id: 'upgrade', label: 'Upgrade' },
  { id: 'fire', label: 'Fire' }
];

export function setSelectedStaff(id) {
  const known = [...MANAGERS, ...EMPLOYEES].some((person) => person.id === id) || Boolean(characterById(id));
  if (known) selectedStaff = id;
}

export function setCrewFilter(crew) {
  crewFilter = CREW_FILTERS.includes(crew) ? crew : 'All';
}

export function setStaffTab(tab) {
  staffTab = STAFF_TABS.some((item) => item.id === tab) ? tab : 'hire';
  if (staffTab !== 'fire') fireArmed = '';
}

export function armStaffFire(id) {
  fireArmed = id || '';
  staffTab = 'fire';
}

export function clearStaffFire() {
  fireArmed = '';
}

function trustRank(score) {
  if (score >= 70) return 'Partner';
  if (score >= 40) return 'Friend';
  if (score >= 20) return 'Neighbor';
  return 'Stranger';
}

function reputationTitle(score) {
  if (score >= 85) return 'Famous';
  if (score >= 60) return 'Respected';
  if (score >= 35) return 'Known';
  if (score >= 15) return 'Local';
  return 'Unknown';
}

function personById(id) {
  return [...MANAGERS, ...EMPLOYEES].find((person) => person.id === id) || MANAGERS[0];
}

function managerStats(state, person) {
  const line = IDLE_LINES.find((item) => item.key === person.id);
  const unlocked = line ? isLineUnlocked(state, line) : false;
  const level = line ? getLineState(state, line.key).level : 0;
  const hired = line ? hasManager(state, line.key) : false;
  const auto = hired && isAutoCollectEnabled(state, line.key);
  const cost = line ? getManagerCost(state, line) : {};
  const ready = unlocked && level >= (line?.manager.unlockLevel || 10);
  const trust = Number(state.relationships?.[person.id] || 0);
  return { line, unlocked, level, hired, auto, cost, ready, trust, canHire: ready && !hired && canAfford(state, cost) };
}

function renderAvatar(person, className = 'staffAvatar') {
  const src = person.sprite || personAssetForKey(person.avatar);
  return `<img class="${className}" src="${src}" alt="" loading="lazy">`;
}

function renderContacts(person) {
  return `<span class="staffContact">${person.phone}</span><small>${person.place}</small>`;
}

function renderCharacterCard(view) {
  const selected = view.id === selectedStaff;
  return `<button type="button" class="staffCard ${selected ? 'selected' : ''}" data-action="selectStaff" data-staff="${view.id}">${renderAvatar(view)}<span class="staffWho"><b>${view.name}</b><span class="staffPlace">${view.role} · ${view.rank}</span></span><span class="staffPhone">Lv ${view.level}<small>Drv ${view.drive}</small></span></button>`;
}

function renderCard(person, state) {
  const selected = person.id === selectedStaff;
  const manager = person.role === 'Manager';
  const stats = manager ? managerStats(state, person) : null;
  const trust = manager ? stats.trust : Number(state.relationships?.[person.id] || 0);
  const status = manager ? (stats.hired ? (stats.auto ? 'Auto' : 'Paused') : stats.ready ? 'Ready' : 'Locked') : trustRank(trust);
  const title = manager ? person.desk : person.job;
  return `<button type="button" class="staffCard ${selected ? 'selected' : ''} ${manager && stats.hired ? 'hired' : ''}" data-action="selectStaff" data-staff="${person.id}">${renderAvatar(person)}<span class="staffWho"><b>${person.name}</b><span class="staffPlace">${person.place} · ${title}</span></span><span class="staffPhone">${person.phone}<small>${status}</small></span></button>`;
}

function renderDetail(state, person) {
  const city = Number(state.reputation || 0);
  if (staffTab === 'list' || person.role === 'Employee') {
    const trust = Number(state.relationships?.[person.id] || 0);
    const job = person.role === 'Employee' ? `${person.role} · ${person.job}` : `Manager · ${person.desk}`;
    return `
      <article class="staffDetail">
        ${renderAvatar(person, 'staffPortrait')}
        <div>
          <b>${person.name}</b>
          <span>${job}</span>
          ${renderContacts(person)}
          <div class="staffStats">
            <div><strong>${trust}</strong><small>Trust</small></div>
            <div><strong>${trustRank(trust)}</strong><small>Rank</small></div>
            <div><strong>${reputationTitle(city)}</strong><small>City</small></div>
          </div>
        </div>
        <button class="btn gold" data-action="screen" data-screen="world">Meet in World</button>
      </article>
    `;
  }
  const stats = managerStats(state, person);
  if (staffTab === 'upgrade') {
    const quote = stats.line ? quoteLineUpgrade(state, stats.line, 1) : null;
    return `
      <article class="staffDetail">
        ${renderAvatar(person, 'staffPortrait')}
        <div>
          <b>${person.name}</b>
          <span>Upgrade ${stats.line?.name || 'supply'}</span>
          ${renderContacts(person)}
          <div class="staffStats">
            <div><strong>Lv ${stats.level}</strong><small>Now</small></div>
            <div><strong>${stats.auto ? 'Auto' : 'Paused'}</strong><small>Collect</small></div>
            <div><strong>${stats.trust}</strong><small>${trustRank(stats.trust)}</small></div>
          </div>
        </div>
        <div class="staffActions">
          <button class="btn gold" data-action="upgradeLine" data-line="${person.id}" data-qty="1" ${quote?.affordable ? '' : 'disabled'}>Upgrade${quote ? ` ${costToText(quote.cost)}` : ''}</button>
          <button class="btn ${stats.auto ? 'red' : 'primary'}" data-action="toggleLineAuto" data-line="${person.id}">${stats.auto ? 'Pause' : 'Auto'}</button>
          <button class="btn ghost" data-action="screen" data-screen="lines">Supplies</button>
        </div>
      </article>
    `;
  }
  if (staffTab === 'fire') {
    const armed = fireArmed === person.id;
    const fire = armed
      ? `<button class="btn ghost" data-action="fireManagerCancel">Cancel</button><button class="btn red" data-action="fireManager" data-line="${person.id}">Confirm fire</button>`
      : `<button class="btn red" data-action="fireManagerArm" data-line="${person.id}">Fire ${person.name.split(' ')[0]}</button>`;
    return `
      <article class="staffDetail">
        ${renderAvatar(person, 'staffPortrait')}
        <div>
          <b>${person.name}</b>
          <span>${person.phone} · ${person.place}</span>
          <small>${armed ? 'Confirm before they are let go.' : person.desk}</small>
        </div>
        <div class="staffActions">${fire}<button class="btn ghost" data-action="screen" data-screen="world">World</button></div>
      </article>
    `;
  }
  const hire = `<button class="btn gold" data-action="buyManager" data-line="${person.id}" ${stats.canHire ? '' : 'disabled'}>${stats.ready ? `Hire ${costToText(stats.cost)}` : `Unlocks at Lv ${stats.line?.manager.unlockLevel || 10}`}</button>`;
  return `
    <article class="staffDetail">
      ${renderAvatar(person, 'staffPortrait')}
      <div>
        <b>${person.name}</b>
        <span>Manager · ${stats.line?.name || 'Supply'}</span>
        ${renderContacts(person)}
        <div class="staffStats">
          <div><strong>Lv ${stats.level}</strong><small>Supply</small></div>
          <div><strong>${stats.hired ? 'Hired' : 'Open'}</strong><small>Job</small></div>
          <div><strong>${stats.trust}</strong><small>${trustRank(stats.trust)}</small></div>
        </div>
      </div>
      <div class="staffActions">${hire}<button class="btn ghost" data-action="screen" data-screen="world">World</button><button class="btn ghost" data-action="screen" data-screen="lines">Supplies</button></div>
    </article>
  `;
}

export function renderStaffScreen(state) {
  const hired = MANAGERS.filter((person) => managerStats(state, person).hired);
  const open = MANAGERS.filter((person) => !managerStats(state, person).hired);
  const roster = staffTab === 'list' ? characterViews(state, crewFilter) : staffTab === 'hire' ? open : hired;
  const person = staffTab === 'list'
    ? roster.find((item) => item.id === selectedStaff) || roster[0] || null
    : roster.find((item) => item.id === selectedStaff) || roster[0] || null;
  const empty = staffTab === 'hire'
    ? 'Every manager is already hired.'
    : 'Nobody is hired yet. Start on the Hire tab.';
  const crewPick = person && staffTab === 'list'
    ? `<div class="staffPick"><b>${person.name}</b><span>Lv ${person.level} ${person.rank} · Drive ${person.drive} · Grip ${person.grip} · Fuel ${person.fuel} · Repair ${person.repair}</span><button class="btn small gold" data-action="trainCharacter" data-staff="${person.id}" ${canAfford(state, person.trainCost) ? '' : 'disabled'}>Train ${costToText(person.trainCost)}</button></div>`
    : '';
  return ScreenFrame({
    title: 'Crew',
    subtitle: '100 drivers and techs. They rank up as you use them.',
    badge: `${CHARACTERS.length}`,
    className: 'staffFrame',
    body: `
      <div class="staffJump">
        <button class="btn gold" data-action="screen" data-screen="world">World</button>
        <button class="btn ghost" data-action="screen" data-screen="lines">Supplies</button>
      </div>
      <nav class="staffTabs" role="tablist">
        ${STAFF_TABS.map((tab) => `<button type="button" class="${staffTab === tab.id ? 'active' : ''}" data-action="staffTab" data-tab="${tab.id}">${tab.label}</button>`).join('')}
      </nav>
      ${staffTab === 'list' ? `<div class="crewFilters">${CREW_FILTERS.map((crew) => `<button type="button" class="${crewFilter === crew ? 'active' : ''}" data-action="crewFilter" data-crew="${crew}">${crew}</button>`).join('')}</div>` : ''}
      ${crewPick}
      ${staffTab === 'list' ? '' : person ? renderDetail(state, person) : `<p class="staffEmpty">${empty}</p>`}
      <div class="staffRoster">${staffTab === 'list' ? roster.map((item) => renderCharacterCard(item)).join('') : roster.map((item) => renderCard(item, state)).join('')}</div>
    `
  });
}
