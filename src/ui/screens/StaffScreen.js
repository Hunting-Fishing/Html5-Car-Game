import { IDLE_LINES } from '../../data/gameData.js';
import { personAssetForKey } from '../../data/worldAssetMap.js';
import { ScreenFrame } from '../components/ScreenFrame.js';
import { costToText, canAfford } from '../../systems/economySystem.js';
import { getLineState, getManagerCost, hasManager, isAutoCollectEnabled, isLineUnlocked, quoteLineUpgrade } from '../../systems/idleLineSystem.js';

const MANAGERS = [
  { id: 'streetRoute', avatar: 'driver', name: 'Route Driver', role: 'Manager' },
  { id: 'partsDelivery', avatar: 'residentGreen', name: 'Parts Courier', role: 'Manager' },
  { id: 'mobileMechanic', avatar: 'mechanic', name: 'Mobile Tech', role: 'Manager' },
  { id: 'fuelRun', avatar: 'residentBlue', name: 'Fuel Runner', role: 'Manager' },
  { id: 'towingJob', avatar: 'residentOrange', name: 'Tow Operator', role: 'Manager' },
  { id: 'dealerShowcase', avatar: 'residentPurple', name: 'Sales Rep', role: 'Manager' },
  { id: 'performanceBay', avatar: 'mechanic', name: 'Tuner', role: 'Manager' },
  { id: 'raceEvent', avatar: 'driver', name: 'Crew Chief', role: 'Manager' }
];

const EMPLOYEES = [
  { id: 'residentBlue', avatar: 'residentBlue', name: 'Mia', role: 'Employee', job: 'Tires' },
  { id: 'residentGreen', avatar: 'residentGreen', name: 'Jay', role: 'Employee', job: 'Parts' },
  { id: 'residentOrange', avatar: 'residentOrange', name: 'Nico', role: 'Employee', job: 'Traffic' },
  { id: 'residentPurple', avatar: 'residentPurple', name: 'Ari', role: 'Employee', job: 'Sales' },
  { id: 'mechanic', avatar: 'mechanic', name: 'Rae', role: 'Employee', job: 'Tools' },
  { id: 'driver', avatar: 'driver', name: 'Sol', role: 'Employee', job: 'Tow' }
];

let selectedStaff = 'streetRoute';
let staffTab = 'hire';
let fireArmed = '';

const STAFF_TABS = [
  { id: 'hire', label: 'Hire' },
  { id: 'upgrade', label: 'Upgrade' },
  { id: 'fire', label: 'Fire' }
];

export function setSelectedStaff(id) {
  const known = [...MANAGERS, ...EMPLOYEES].some((person) => person.id === id);
  if (known) selectedStaff = id;
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
  return `<img class="${className}" src="${personAssetForKey(person.avatar)}" alt="" loading="eager">`;
}

function renderCard(person, state) {
  const selected = person.id === selectedStaff;
  const manager = person.role === 'Manager';
  const stats = manager ? managerStats(state, person) : null;
  const trust = manager ? stats.trust : Number(state.relationships?.[person.id] || 0);
  const status = manager ? (stats.hired ? (stats.auto ? 'Auto' : 'Paused') : stats.ready ? 'Ready' : 'Locked') : trustRank(trust);
  return `<button type="button" class="staffCard ${selected ? 'selected' : ''} ${manager && stats.hired ? 'hired' : ''}" data-action="selectStaff" data-staff="${person.id}">${renderAvatar(person)}<b>${person.name.split(' ')[0]}</b><small>${status}</small></button>`;
}

function renderDetail(state, person) {
  const city = Number(state.reputation || 0);
  if (person.role === 'Employee') {
    const trust = Number(state.relationships?.[person.id] || 0);
    return `
      <article class="staffDetail">
        ${renderAvatar(person, 'staffPortrait')}
        <div>
          <b>${person.name}</b>
          <span>${person.role} · ${person.job}</span>
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
          <span>${armed ? 'This cannot be undone. They stop collecting.' : 'Let them go. The supply goes back to manual.'}</span>
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
  const roster = staffTab === 'hire' ? open : hired;
  const employee = staffTab === 'hire' ? EMPLOYEES.find((item) => item.id === selectedStaff) : null;
  const person = employee || roster.find((item) => item.id === selectedStaff) || roster[0] || null;
  const empty = staffTab === 'hire'
    ? 'Every manager is already hired.'
    : 'Nobody is hired yet. Start on the Hire tab.';
  return ScreenFrame({
    title: 'Staff',
    subtitle: 'Hire, upgrade, or fire.',
    badge: reputationTitle(Number(state.reputation || 0)),
    className: 'staffFrame',
    body: `
      <div class="staffJump">
        <button class="btn gold" data-action="screen" data-screen="world">World</button>
        <button class="btn ghost" data-action="screen" data-screen="lines">Supplies</button>
      </div>
      <nav class="staffTabs" role="tablist">
        ${STAFF_TABS.map((tab) => `<button type="button" class="${staffTab === tab.id ? 'active' : ''}" data-action="staffTab" data-tab="${tab.id}">${tab.label}</button>`).join('')}
      </nav>
      ${person ? renderDetail(state, person) : `<p class="staffEmpty">${empty}</p>`}
      <div class="staffRoster">${roster.map((item) => renderCard(item, state)).join('')}</div>
      ${staffTab === 'hire' ? `<h3 class="staffHeading">Employees</h3><div class="staffRoster">${EMPLOYEES.map((item) => renderCard(item, state)).join('')}</div>` : ''}
    `
  });
}
