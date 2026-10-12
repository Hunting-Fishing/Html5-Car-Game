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
