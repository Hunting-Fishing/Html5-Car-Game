import { IDLE_LINES } from '../../data/gameData.js';
import { personAssetForKey } from '../../data/worldAssetMap.js';
import { CHARACTERS, characterById } from '../../data/characterRoster.js';
import { ScreenFrame } from '../components/ScreenFrame.js';
import { costToText, canAfford } from '../../systems/economySystem.js';
import { characterView, ensureCrewEmployment, taskInfo, perkList, courseList, treeFor } from '../../systems/characterSystem.js';
import { getLineState, getManagerCost, hasManager, isAutoCollectEnabled, isLineUnlocked } from '../../systems/idleLineSystem.js';

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
let personOpen = false;
let staffPane = 'overview';

const DESKS = [
  { id: 'sales', label: 'Sales Floor', short: 'Sales', roles: ['Sales'] },
  { id: 'service', label: 'Service Bay', short: 'Service', roles: ['Mechanic', 'Tuner', 'Pit Crew'] },
  { id: 'parts', label: 'Parts Desk', short: 'Parts', roles: ['Courier', 'Fuel Hand'] },
  { id: 'drive', label: 'Drive Crew', short: 'Drive', roles: ['Driver', 'Tow Hand'] }
];

export function setSelectedStaff(id) {
  const known = [...MANAGERS, ...EMPLOYEES].some((person) => person.id === id) || Boolean(characterById(id));
  if (known) selectedStaff = id;
  personOpen = Boolean(characterById(id));
  staffPane = 'overview';
}

export function setStaffPane(pane) {
  if (pane === 'work' || pane === 'grow' || pane === 'overview') staffPane = pane;
}

export function closeStaffSheet() {
  personOpen = false;
  fireArmed = '';
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
  if (saved && roster.some((item) => item.id === saved && item.hired)) return saved;
  return roster.find((item) => item.hired)?.id || '';
}

export function assignDeskManager(state, characterId) {
  const desk = deskOf(staffDesk);
  const roster = viewsForDesk(state, desk);
  if (!roster.some((item) => item.id === characterId && item.hired)) return { ok: false, message: 'Hire them before making them manager.' };
  if (!state.assignments) state.assignments = {};
  state.assignments[desk.id] = characterId;
  selectedStaff = characterId;
  pickingManager = false;
  personOpen = false;
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

function barWidth(value) {
  const amount = Math.max(0, Math.min(100, Number(value) || 0));
  if (amount <= 0) return 0;
  return Math.max(8, Math.round(100 * Math.pow(amount / 100, 0.45)));
}

function renderBars(view, compact = false) {
  const energyPct = Math.max(0, Math.min(100, (view.energy / Math.max(1, view.energyMax)) * 100));
  const energy = `<div class="statBar energy"><span>Energy</span><i><b style="width:${energyPct}%"></b></i>${compact ? '' : `<em>${Math.round(view.energy)}</em>`}</div>`;
  const skills = view.skills.map((skill) => {
    const width = barWidth(skill.value);
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

function renderTasks(view) {
  if (!view?.hired) return '<p class="taskNote">Hire them to equip a task.</p>';
  const current = taskInfo(view.task);
  const buttons = view.skills.map((skill) => {
    const info = taskInfo(skill.key);
    if (!info) return '';
    const on = view.task === skill.key ? 'on' : '';
    const bonus = Math.round(Math.min(35, skill.value * 0.35));
    return `<button type="button" class="taskBtn ${on}" data-action="equipTask" data-staff="${view.id}" data-task="${skill.key}">${info.label}<small>+${bonus}% · ${info.where}</small></button>`;
  }).join('');
  const clear = view.task ? `<button type="button" class="taskBtn" data-action="equipTask" data-staff="${view.id}" data-task="">Unequip</button>` : '';
  return `<div class="taskRow"><span>Task</span>${buttons}${clear}<small>${current ? current.blurb : 'Pick a task that matches a talent.'}</small></div>`;
}

function renderTraining(state, view) {
  if (!view?.hired) return '';
  const ready = canAfford(state, view.trainCost) && view.energy >= view.trainEnergy;
  const buttons = view.skills.map((skill) => `<button type="button" class="taskBtn" data-action="trainSkill" data-staff="${view.id}" data-skill="${skill.key}" ${ready ? '' : 'disabled'}>Train ${skill.label}<small>${costToText(view.trainCost)} · ${view.trainEnergy} energy</small></button>`).join('');
  const rest = `<button type="button" class="taskBtn" data-action="restCrew" data-staff="${view.id}" ${canAfford(state, { coins: 10 }) ? '' : 'disabled'}>Rest<small>20 energy · 10 coins</small></button>`;
  return `<div class="taskRow"><span>Training · ${view.trains} done</span>${buttons}${rest}</div>`;
}

function renderTrees(state, view) {
  if (!view?.hired || !view.skills.length) return '';
  const lines = view.skills.map((skill) => {
    const owned = view.trees?.[skill.key] || [];
    const nodes = treeFor(skill.key);
    const buttons = nodes.map((node, index) => {
      const has = owned.includes(node.id);
      const previous = index === 0 || owned.includes(nodes[index - 1].id);
      const ready = !has && previous && skill.value >= node.need && canAfford(state, node.cost);
      const note = has ? 'Owned' : !previous ? `Needs ${nodes[index - 1].label}` : skill.value < node.need ? `Needs ${node.need}%` : costToText(node.cost);
      return `<button type="button" class="taskBtn treeNode ${has ? 'on' : ''}" data-action="buyTree" data-staff="${view.id}" data-stat="${skill.key}" data-node="${node.id}" ${has || !ready ? 'disabled' : ''}>${node.label}<small>${node.blurb} · ${note}</small></button>`;
    }).join('');
    return `<div class="treeLine"><b>${skill.label} ${formatPct(skill.value)}</b><div class="treeNodes">${buttons}</div></div>`;
  }).join('');
  return `<div class="taskRow"><span>Skill trees</span>${lines}</div>`;
}

function renderCourses(state, view) {
  if (!view?.hired) return '';
  const open = view.skills.length < view.slots;
  const note = view.skills.length >= 4
    ? 'All 4 stats are filled. Re-Training rerolls them.'
    : open
      ? `Stat slot ${view.skills.length + 1} of ${view.slots} is open.`
      : `Stats ${view.skills.length}/${view.slots}. Upgrade to open the next slot.`;
  const buttons = courseList().map((course) => `<button type="button" class="taskBtn" data-action="sendCourse" data-staff="${view.id}" data-course="${course.id}" ${canAfford(state, course.cost) ? '' : 'disabled'}>${course.label}<small>${course.blurb} · ${costToText(course.cost)}</small></button>`).join('');
  return `<div class="taskRow"><span>Courses</span><small>${note}</small>${buttons}</div>`;
}

function renderPerks(view) {
  if (!view?.hired) return '';
  if (view.trains < 1) return '<p class="taskNote">Train once to unlock a perk.</p>';
  const buttons = perkList().map((perk) => `<button type="button" class="taskBtn ${view.perk === perk.key ? 'on' : ''}" data-action="equipPerk" data-staff="${view.id}" data-perk="${perk.key}">${perk.label}<small>${perk.blurb}</small></button>`).join('');
  const clear = view.perk ? `<button type="button" class="taskBtn" data-action="equipPerk" data-staff="${view.id}" data-perk="">Clear perk</button>` : '';
  return `<div class="taskRow"><span>Perk</span>${buttons}${clear}</div>`;
}

function renderSalary(view) {
  if (!view?.hired) return '';
  const percent = Math.round(view.payRate * 100);
  const mood = view.payRate < 1 ? 'Underpaid. Energy drops on payday.' : view.payRate > 1 ? 'Raise. Energy recovers on payday.' : 'Fair pay.';
  return `<label class="salarySlide">
    <span>Salary <b data-salary-readout>${percent}% · ${view.pay.coins} coins</b></span>
    <input type="range" min="50" max="200" step="5" value="${percent}" data-salary data-staff="${view.id}" data-base="${view.basePay}" aria-label="Salary for ${view.name}">
    <small data-salary-mood>${mood}</small>
  </label>`;
}

function renderAssignCard(view, managerId) {
  const selected = view.id === selectedStaff ? 'selected' : '';
  const lead = view.id === managerId ? 'manager' : '';
  const first = view.name.split(' ')[0];
  const badge = lead ? '<span class="assignRole">MGR</span>' : view.hired ? '<span class="assignRole hired">Hired</span>' : '';
  return `<button type="button" class="assignCard ${rarityFor(view.level)} ${selected} ${lead} ${view.hired ? '' : 'open'}" data-action="selectStaff" data-staff="${view.id}">
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
  const armed = fireArmed === view.id;
  const isLead = view.id === managerId;
  const hire = view.hired
    ? ''
    : `<button class="btn small primary" data-action="hireCrew" data-staff="${view.id}" ${canAfford(state, view.hireCost) ? '' : 'disabled'}>Hire ${costToText(view.hireCost)}</button>`;
  const fire = !view.hired
    ? ''
    : armed
      ? `<button class="btn small ghost" data-action="fireCrewCancel">Cancel</button><button class="btn small red" data-action="fireCrew" data-staff="${view.id}">Confirm fire</button>`
      : `<button class="btn small ghost" data-action="fireCrewArm" data-staff="${view.id}">Fire</button>`;
  const makeManager = !view.hired || isLead
    ? ''
    : `<button class="btn small primary" data-action="assignManager" data-staff="${view.id}">Make manager</button>`;
  const grade = view.promotions ? view.promoTitle : '';
  const card = view.cardActive
    ? `${view.cardLabel}: ${costToText({ [view.cardKey]: view.pay[view.cardKey] })} each payday`
    : `${view.cardLabel} starts after a promotion`;
  const upgrade = view.hired ? `<button class="btn small primary" data-action="upgradeCrew" data-staff="${view.id}" ${canAfford(state, view.upgradeCost) ? '' : 'disabled'}>Upgrade ${costToText(view.upgradeCost)}</button>` : '';
  const promote = view.hired ? `<button class="btn small primary" data-action="promoteCrew" data-staff="${view.id}" ${view.promoCost && canAfford(state, view.promoCost) ? '' : 'disabled'}>${view.promoCost ? `Promote ${costToText(view.promoCost)}` : 'Partner'}</button>` : '';
  let jobButton = '';
  const lineArmed = Boolean(job && fireArmed === line?.key);
  if (job && !job.hired) {
    jobButton = `<button class="btn small ghost" data-action="buyManager" data-line="${line.key}" ${job.canHire ? '' : 'disabled'}>${job.ready ? `Hire line ${costToText(job.cost)}` : `Line Lv ${line.manager.unlockLevel}`}</button>`;
  } else if (lineArmed) {
    jobButton = `<button class="btn small ghost" data-action="fireManagerCancel">Cancel</button><button class="btn small red" data-action="fireManager" data-line="${line.key}">Confirm</button>`;
  } else if (job) {
    jobButton = `<button class="btn small ghost" data-action="fireManagerArm" data-line="${line.key}">Release line</button>`;
  }
  const panes = view.hired
    ? `<nav class="staffPanes">
        <button type="button" data-action="staffPane" data-pane="overview" class="${staffPane === 'overview' ? 'on' : ''}">Overview</button>
        <button type="button" data-action="staffPane" data-pane="work" class="${staffPane === 'work' ? 'on' : ''}">Work</button>
        <button type="button" data-action="staffPane" data-pane="grow" class="${staffPane === 'grow' ? 'on' : ''}">Grow</button>
      </nav>`
    : '';
  const overview = staffPane === 'overview' || !view.hired
    ? `${renderBars(view)}
      ${view.lastChange ? `<em class="staffDelta">${view.lastChange}</em>` : ''}
      <div class="staffPay"><span>Salary</span><b>${costToText({ coins: view.pay.coins })}</b><small>${card}</small></div>
      ${renderSalary(view)}
      <div class="assignDockActions">${hire}${fire}${makeManager}${jobButton}</div>`
    : '';
  const work = staffPane === 'work' && view.hired ? renderTasks(view) : '';
  const grow = staffPane === 'grow' && view.hired
    ? `${renderTraining(state, view)}${renderPerks(view)}${renderCourses(state, view)}${renderTrees(state, view)}<div class="assignDockActions">${upgrade}${promote}</div>`
    : '';
  return `<div class="staffPop">
    <button type="button" class="staffPopBack" data-action="closeStaffSheet" aria-label="Close"></button>
    <div class="staffPopCard">
      <button type="button" class="staffPopX" data-action="closeStaffSheet" aria-label="Close">×</button>
      ${renderAvatar(view, 'assignDockFace')}
      <div><b>${view.name}</b><span>${view.role} · Lv ${view.level} ${view.rank}${view.promotions ? ` · ${grade}` : ''}${view.hired ? '' : ' · Not hired'}${isLead ? ' · Manager' : ''}</span></div>
      ${panes}
      ${overview}
      ${work}
      ${grow}
    </div>
  </div>`;
}

function renderDesk(state, desk) {
  const roster = viewsForDesk(state, desk);
  const managerId = managerIdFor(state, desk, roster);
  const lead = roster.find((item) => item.id === managerId) || null;
  const open = pickingManager && staffDesk === desk.id;
  const grid = open ? `<div class="assignGrid">${roster.map((item) => renderAssignCard(item, managerId)).join('')}</div>` : '';
  const head = lead
    ? `<button type="button" class="assignLead ${lead.id === selectedStaff ? 'selected' : ''}" data-action="selectStaff" data-staff="${lead.id}" data-desk="${desk.id}">
      ${renderAvatar(lead, 'assignDockFace')}
      <span><b>${desk.label}</b><small>${lead.name}</small>${renderBars(lead)}</span>
    </button>`
    : `<button type="button" class="assignLead vacant" data-action="beginChangeManager" data-desk="${desk.id}">
      <span><b>${desk.label}</b><small>Open seat</small></span>
    </button>`;
  return `<section class="assignDesk ${desk.id} ${open ? 'picking' : ''}">
    ${head}
    ${lead ? renderSalary(lead) : ''}
    <button type="button" class="assignChange" data-action="${open ? 'cancelChangeManager' : 'beginChangeManager'}" data-desk="${desk.id}">${open ? 'Cancel' : 'Change'}</button>
    ${grid}
  </section>`;
}

export function renderStaffScreen(state) {
  ensureCrewEmployment(state);
  const hiredCount = CHARACTERS.filter((character) => characterView(state, character).hired).length;
  const picked = DESKS.map((desk) => {
    const roster = viewsForDesk(state, desk);
    return roster.find((item) => item.id === selectedStaff) || null;
  }).find(Boolean);
  const view = picked || viewsForDesk(state, deskOf(staffDesk))[0] || null;
  const home = DESKS.map((desk) => ({ desk, roster: viewsForDesk(state, desk) })).find((item) => item.roster.some((person) => person.id === view?.id));
  if (home && !pickingManager) staffDesk = home.desk.id;
  const managerId = home ? managerIdFor(state, home.desk, home.roster) : '';
  const hint = pickingManager ? 'Tap a person, then hire them.' : `${hiredCount} hired. Open Change to hire or fire.`;
  return ScreenFrame({
    title: 'Assignments',
    subtitle: hint,
    badge: `${hiredCount}`,
    className: 'staffFrame',
    body: `
      <div class="assignList">${DESKS.map((desk) => renderDesk(state, desk)).join('')}</div>
      ${personOpen ? renderDock(state, view, managerId) : ''}
    `
  });
}

