import { IDLE_LINES } from '../../data/gameData.js';
import { personAssetForKey } from '../../data/worldAssetMap.js';
import { CHARACTERS, characterById } from '../../data/characterRoster.js';
import { ScreenFrame } from '../components/ScreenFrame.js';
import { costToText, canAfford } from '../../systems/economySystem.js';
import { characterView } from '../../systems/characterSystem.js';
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
let staffDesk = 'sales';
let fireArmed = '';
let pickingManager = false;

const DESKS = [
  { id: 'sales', label: 'Sales Floor', short: 'Sales', roles: ['Sales'] },
  { id: 'service', label: 'Service Bay', short: 'Service', roles: ['Mechanic', 'Tuner', 'Pit Crew'] },
  { id: 'parts', label: 'Parts Desk', short: 'Parts', roles: ['Courier', 'Fuel Hand'] },
  { id: 'drive', label: 'Drive Crew', short: 'Drive', roles: ['Driver', 'Tow Hand'] }
];

export function setSelectedStaff(id) {
  const known = [...MANAGERS, ...EMPLOYEES].some((person) => person.id === id) || Boolean(characterById(id));
  if (known) selectedStaff = id;
}

export function setCrewFilter() {}

export function setStaffTab(tab) {
  if (DESKS.some((desk) => desk.id === tab)) {
    staffDesk = tab;
    fireArmed = '';
    pickingManager = false;
  }
}

export function isPickingManager() {
  return pickingManager;
}

export function beginManagerChange(deskId) {
  const desk = DESKS.find((item) => item.id === deskId);
  if (!desk) return;
  if (pickingManager && staffDesk === desk.id) {
    pickingManager = false;
    return;
  }
  staffDesk = desk.id;
  pickingManager = true;
}

export function cancelManagerChange() {
  pickingManager = false;
}

function managerIdFor(state, desk, roster) {
  const saved = state.assignments?.[desk.id];
  if (saved && roster.some((item) => item.id === saved)) return saved;
  return roster[0]?.id || '';
}

export function assignDeskManager(state, characterId) {
  const desk = deskOf(staffDesk);
  const roster = viewsForDesk(state, desk);
  if (!roster.some((item) => item.id === characterId)) return { ok: false, message: 'Pick someone on this desk.' };
  if (!state.assignments) state.assignments = {};
  state.assignments[desk.id] = characterId;
  selectedStaff = characterId;
  pickingManager = false;
  const character = characterById(characterId);
  return { ok: true, message: `${character?.name || 'Crew'} now manages ${desk.label}.` };
}

export function changeDeskManager(state) {
  const desk = deskOf(staffDesk);
  const roster = viewsForDesk(state, desk);
  if (!roster.length) return { ok: false, message: 'Nobody is on this desk.' };
  const current = managerIdFor(state, desk, roster);
  if (selectedStaff && selectedStaff !== current && roster.some((item) => item.id === selectedStaff)) {
    return assignDeskManager(state, selectedStaff);
  }
  const index = Math.max(0, roster.findIndex((item) => item.id === current));
  const next = roster[(index + 1) % roster.length];
  return assignDeskManager(state, next.id);
}

export function armStaffFire(id) {
  fireArmed = id || '';
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

function starsFor(level) {
  if (level >= 35) return 5;
  if (level >= 20) return 4;
  if (level >= 10) return 3;
  if (level >= 5) return 2;
  return 1;
}

function rarityFor(level) {
  const stars = starsFor(level);
  if (stars >= 5) return 'epic';
  if (stars >= 3) return 'rare';
  return 'common';
}

function formatPct(value) {
  return `${Number(value).toFixed(2)}%`;
}

function renderBars(view, compact = false) {
  const energyPct = Math.max(0, Math.min(100, (view.energy / Math.max(1, view.energyMax)) * 100));
  const energy = `<div class="statBar energy"><span>Energy</span><i><b style="width:${energyPct}%"></b></i>${compact ? '' : `<em>${Math.round(view.energy)}</em>`}</div>`;
  const skills = view.skills.map((skill) => {
    const width = Math.max(0, Math.min(100, Number(skill.value) || 0));
    return `<div class="statBar ${skill.key}"><span>${skill.label}</span><i><b style="width:${width}%"></b></i>${compact ? '' : `<em>${formatPct(skill.value)}</em>`}</div>`;
  }).join('');
  return `<div class="statBars${compact ? ' compact' : ''}">${energy}${skills}</div>`;
}

function deskOf(id) {
  return DESKS.find((desk) => desk.id === id) || DESKS[0];
}

function viewsForDesk(state, desk) {
  const roles = new Set(desk.roles);
  return CHARACTERS.filter((character) => roles.has(character.role)).map((character) => characterView(state, character));
}

function renderAvatar(person, className = 'staffAvatar') {
  const src = person.sprite || personAssetForKey(person.avatar);
  return `<img class="${className}" src="${src}" alt="" loading="lazy">`;
}

function renderStars(level) {
  const filled = starsFor(level);
  return `<span class="assignStars" aria-label="${filled} of 5 stars">${'★'.repeat(filled)}${'☆'.repeat(5 - filled)}</span>`;
}

function renderAssignCard(view, managerId) {
  const selected = view.id === selectedStaff ? 'selected' : '';
  const lead = view.id === managerId ? 'manager' : '';
  const first = view.name.split(' ')[0];
  const badge = lead ? '<span class="assignRole">MGR</span>' : '';
  return `<button type="button" class="assignCard ${rarityFor(view.level)} ${selected} ${lead}" data-action="selectStaff" data-staff="${view.id}">
    ${renderAvatar(view, 'assignFace')}
    <span class="assignName">${first}</span>
    ${badge}
    <span class="assignFoot">${renderBars(view, true)}</span>
  </button>`;
}

function renderDock(state, view, managerId) {
  if (!view) return '';
  const line = view.lineKey ? IDLE_LINES.find((item) => item.key === view.lineKey) : null;
  const job = line ? managerStats(state, { id: line.key }) : null;
  const armed = job && fireArmed === line.key;
  const isLead = view.id === managerId;
  const change = pickingManager
    ? `<button class="btn small ghost" data-action="cancelChangeManager">Cancel</button>`
    : `<button class="btn small primary" data-action="changeManager">${isLead ? 'Change' : 'Make manager'}</button>`;
  let jobButton = '';
  if (job && !job.hired) {
    jobButton = `<button class="btn small primary" data-action="buyManager" data-line="${line.key}" ${job.canHire ? '' : 'disabled'}>${job.ready ? `Hire ${costToText(job.cost)}` : `Lv ${line.manager.unlockLevel}`}</button>`;
  } else if (job && armed) {
    jobButton = `<button class="btn small ghost" data-action="fireManagerCancel">Cancel</button><button class="btn small red" data-action="fireManager" data-line="${line.key}">Confirm</button>`;
  } else if (job) {
    const quote = quoteLineUpgrade(state, line, 1);
    jobButton = `<button class="btn small primary" data-action="upgradeLine" data-line="${line.key}" data-qty="1" ${quote?.affordable ? '' : 'disabled'}>Upgrade</button><button class="btn small ghost" data-action="fireManagerArm" data-line="${line.key}">Release</button>`;
  }
  return `<div class="assignDock">
    ${renderAvatar(view, 'assignDockFace')}
    <div><b>${view.name}</b><span>${view.role} · Lv ${view.level} ${view.rank}${isLead ? ' · Manager' : ''}</span></div>
    ${renderBars(view)}
    <div class="assignDockActions">${change}${jobButton}</div>
  </div>`;
}

function renderDesk(state, desk) {
  const roster = viewsForDesk(state, desk);
  const managerId = managerIdFor(state, desk, roster);
  const lead = roster.find((item) => item.id === managerId) || roster[0];
  if (!lead) return '';
  const open = pickingManager && staffDesk === desk.id;
  const grid = open
    ? `<div class="assignGrid">${roster.map((item) => renderAssignCard(item, managerId)).join('')}</div>`
    : '';
  return `<section class="assignDesk ${desk.id} ${open ? 'picking' : ''}">
    <button type="button" class="assignLead ${lead.id === selectedStaff ? 'selected' : ''}" data-action="selectStaff" data-staff="${lead.id}" data-desk="${desk.id}">
      ${renderAvatar(lead, 'assignDockFace')}
      <span><b>${desk.label}</b><small>${lead.name}</small>${renderBars(lead)}</span>
    </button>
    <button type="button" class="assignChange" data-action="${open ? 'cancelChangeManager' : 'beginChangeManager'}" data-desk="${desk.id}">${open ? 'Cancel' : 'Change'}</button>
    ${grid}
  </section>`;
}

export function renderStaffScreen(state) {
  const picked = DESKS.map((desk) => {
    const roster = viewsForDesk(state, desk);
    return roster.find((item) => item.id === selectedStaff) || null;
  }).find(Boolean);
  const view = picked || viewsForDesk(state, deskOf(staffDesk))[0] || null;
  const home = DESKS.map((desk) => ({ desk, roster: viewsForDesk(state, desk) })).find((item) => item.roster.some((person) => person.id === view?.id));
  if (home && !pickingManager) staffDesk = home.desk.id;
  const managerId = home ? managerIdFor(state, home.desk, home.roster) : '';
  const hint = pickingManager ? 'Tap a card to change this desk’s manager.' : 'Each desk has its own manager.';
  return ScreenFrame({
    title: 'Assignments',
    subtitle: hint,
    badge: `${DESKS.length}`,
    className: 'staffFrame',
    body: `
      <div class="assignList">${DESKS.map((desk) => renderDesk(state, desk)).join('')}</div>
      ${renderDock(state, view, managerId)}
    `
  });
}

