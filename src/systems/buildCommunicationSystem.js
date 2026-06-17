import { BUILDINGS, IDLE_LINES } from '../data/gameData.js';
import { BUILD_CONNECTIONS } from '../data/buildLinkData.js';
import { getLineState, isLineUnlocked } from './idleLineSystem.js';

export const BUILD_COMMUNICATION_STORAGE_KEY = '365_build_communication_v1';

let lastSerialized = '';

function addCounts(target, source, multiplier = 1) {
  Object.entries(source || {}).forEach(([key, value]) => {
    const amount = Math.max(0, Math.floor(Number(value) || 0) * multiplier);
    if (amount > 0) target[key] = (target[key] || 0) + amount;
  });
}

function getBuildingDef(key) {
  return BUILDINGS.find((item) => item.key === key) || null;
}

function getLineDef(key) {
  return IDLE_LINES.find((item) => item.key === key) || null;
}

function lineSummary(state, key) {
  const line = getLineDef(key);
  const current = line ? getLineState(state, key) : null;
  return {
    key,
    name: line?.name || key,
    level: current?.level || 0,
    unlocked: line ? isLineUnlocked(state, line) : false,
    output: line?.output || '',
    outputLabel: line?.outputLabel || ''
  };
}

export function getBuildCommunicationState(state) {
  const worldInventory = {};
  const systems = BUILD_CONNECTIONS.map((connection) => {
    const building = connection.buildingKey ? getBuildingDef(connection.buildingKey) : null;
    const level = building ? Math.max(0, state.buildings?.[building.key] || 0) : 1;
    const max = building?.max || 1;
    const built = !building || level > 0;
    const systemInventory = {};

    if (built) {
      addCounts(systemInventory, connection.worldInventoryBase, 1);
      addCounts(systemInventory, connection.worldInventoryPerLevel, Math.max(1, level));
      addCounts(worldInventory, systemInventory, 1);
    }

    const lines = connection.lineKeys.map((key) => lineSummary(state, key));
    const unlockedLines = lines.filter((line) => line.unlocked).length;

    return {
      key: connection.key,
      title: connection.title,
      buildingKey: connection.buildingKey,
      roomKeys: connection.roomKeys,
      lineKeys: connection.lineKeys,
      level,
      max,
      built,
      summary: connection.summary,
      worldLabel: connection.worldLabel,
      worldInventory: systemInventory,
      lines,
      unlockedLines,
      totalLines: lines.length
    };
  });

  const linkedLineKeys = [...new Set(systems.flatMap((system) => system.lineKeys))];
  const unlockedLineCount = systems.reduce((total, system) => total + system.unlockedLines, 0);
  const totalLineCount = systems.reduce((total, system) => total + system.totalLines, 0);
  const totalWorldInventory = Object.values(worldInventory).reduce((total, amount) => total + amount, 0);

  return {
    schemaVersion: 1,
    builtCount: systems.filter((system) => system.built).length,
    totalSystems: systems.length,
    unlockedLineCount,
    totalLineCount,
    linkedLineKeys,
    totalWorldInventory,
    worldInventory,
    systems
  };
}

export function publishBuildCommunicationState(state) {
  const snapshot = getBuildCommunicationState(state);
  if (typeof window === 'undefined') return snapshot;

  const serialized = JSON.stringify(snapshot);
  window.__buildCommunicationState = snapshot;

  if (serialized !== lastSerialized) {
    lastSerialized = serialized;
    try {
      window.localStorage?.setItem(BUILD_COMMUNICATION_STORAGE_KEY, serialized);
    } catch {}
    window.dispatchEvent(new CustomEvent('build-communication-updated', { detail: snapshot }));
  }

  return snapshot;
}

export function readBuildCommunicationState() {
  if (typeof window === 'undefined') return null;
  if (window.__buildCommunicationState) return window.__buildCommunicationState;
  try {
    const raw = window.localStorage?.getItem(BUILD_COMMUNICATION_STORAGE_KEY);
    if (raw) {
      window.__buildCommunicationState = JSON.parse(raw);
      return window.__buildCommunicationState;
    }
  } catch {}
  return null;
}

