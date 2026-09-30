import { BUILDINGS, IDLE_LINES, UPGRADES } from '../../data/gameData.js';
import { AUTO_SHOP_ROOMS } from '../../data/visualData.js';
import { BUILD_ASSET_LIST, BUILD_GUI_ASSETS, BUILD_ICON_ASSETS, buildRoomAssetForKey, buildSystemAssetForKey } from '../../data/buildAssetMap.js';
import { connectionForBuilding, connectionForRoom } from '../../data/buildLinkData.js';
import { renderDataIcon, renderIconImage } from '../components/GamePanel.js';
import { ScreenFrame } from '../components/ScreenFrame.js';
import { SubTabBar } from '../components/SubTabBar.js';
import { CompactStatStrip } from '../components/CompactStatStrip.js';
import { segmentedMeter } from '../components/StatMeter.js';
import { fmt, costToText, canAfford } from '../../systems/economySystem.js';
import { getBuildCommunicationState, publishBuildCommunicationState } from '../../systems/buildCommunicationSystem.js';
import { getLineCycleMs, getLineIncome, getLineState, hasManager, canCollectLine } from '../../systems/idleLineSystem.js';
import { upgradeCost, nextBuildingCost } from '../../systems/upgradeSystem.js';

const WORLD_BUILDING_LABELS = {
  streetKiosk: 'Kiosk',
  tireRepair: 'Tire Shop',
  privateShop: 'Repair Shop',
  partsWarehouse: 'Parts WH',
  dealerShowroom: 'Dealer',
  salvageBlock: 'Salvage',
  towDispatch: 'Tow Dispatch',
  testTrack: 'Test Track'
};

const GARAGE_DRAWER_TABS = ['room', 'systems', 'supplier'];

function upgradeIconKey(def) {
  const byKey = {
    tapCrew: 'race',
    idleDriver: 'tools',
    routeScout: 'race',
    fuelPlan: 'coin',
    pitKit: 'tools',
    supplierShelf: 'parts'
  };
  return byKey[def.key] || def.resource || 'tools';
}

export function renderGarageScreen(state) {
  const buildComm = publishBuildCommunicationState(state);
  const buildPct = Math.round((buildComm.builtCount / Math.max(1, buildComm.totalSystems)) * 100);
  const drawerTab = GARAGE_DRAWER_TABS.includes(state.garage?.drawerTab) ? state.garage.drawerTab : 'room';
  const selectedRoom = selectedGarageRoom(state);
  const selectedSystem = selectedGarageSystem(state);

  return ScreenFrame({
    title: 'Garage',
    subtitle: 'Build rooms, feed World inventory, and unlock Lines.',
    badge: `${buildPct}% online`,
    className: 'garagePlayArea',
    body: `
      <div class="buildAssetPreload" aria-hidden="true">
        ${BUILD_ASSET_LIST.map((item) => `<img class="buildAssetPreloadImage" data-build-asset="${item.category}:${item.key}" src="${item.src}" alt="" loading="eager">`).join('')}
      </div>
      ${SubTabBar({
        tabs: [
          { label: 'Build Rooms', screen: 'garage', active: true, icon: BUILD_ICON_ASSETS.buildMode },
          { label: 'Business Lines', screen: 'lines', icon: BUILD_ICON_ASSETS.lineSync }
        ]
      })}
      ${renderBuildSummaryStrip(buildComm, buildPct)}
      ${renderShopFloorPrimary(state, selectedRoom)}
      ${renderGarageDrawer(state, drawerTab, selectedRoom, selectedSystem)}
    `
  });
}

function renderBuildSummaryStrip(buildComm, buildPct) {
  return CompactStatStrip({
    stats: [
      {
        label: 'Online',
        value: buildPct,
        max: 100,
        displayValue: `${buildPct}%`,
        icon: BUILD_ICON_ASSETS.buildMode
      },
      {
        label: 'Systems',
        value: buildComm.builtCount,
        max: buildComm.totalSystems,
        displayValue: `${buildComm.builtCount}/${buildComm.totalSystems}`,
        icon: BUILD_GUI_ASSETS.levelBadge
      },
      {
        label: 'Lines',
        value: buildComm.unlockedLineCount,
        max: buildComm.totalLineCount,
        displayValue: `${buildComm.unlockedLineCount}/${buildComm.totalLineCount}`,
        icon: BUILD_ICON_ASSETS.lineSync
      },
      {
        label: 'World',
        displayValue: `+${buildComm.totalWorldInventory}`,
        icon: BUILD_ICON_ASSETS.worldSync
      }
    ]
  });
}

function selectedGarageRoom(state) {
  const saved = state.garage?.selectedRoom;
  return AUTO_SHOP_ROOMS.find((room) => room.key === saved)
    || AUTO_SHOP_ROOMS.find((room) => room.buildingKey === 'partsStorage')
    || AUTO_SHOP_ROOMS[0];
}

function selectedGarageSystem(state) {
  const saved = state.garage?.selectedSystem;
  return BUILDINGS.find((building) => building.key === saved)
    || BUILDINGS.find((building) => building.key === 'partsStorage')
    || BUILDINGS[0];
}

function renderShopFloorPrimary(state, selectedRoom) {
  return `
    <section class="shopFloorPrimary" aria-label="365 Auto Shop Floor">
      <div class="compactSectionHead">
        <div>
          <h3>365 Auto Shop Floor</h3>
          <p>Tap a room to inspect its line, World sync, and build requirement.</p>
        </div>
        <span class="pill">Room Map</span>
      </div>
      <div class="shopFloor garageShopFloorCompact">
        ${AUTO_SHOP_ROOMS.map((room) => renderShopRoomTile(state, room, selectedRoom.key === room.key)).join('')}
      </div>
    </section>
  `;
}

function renderShopRoomTile(state, room, selected) {
  const data = getRoomPresentation(state, room);
  const roomAsset = buildRoomAssetForKey(room.key) || room.asset;
  return `
    <button class="shopRoom GarageCard garageRoomTile ${selected ? 'selected' : ''} ${data.unlocked ? '' : 'lockedRoom'}" type="button" data-action="garageRoom" data-room="${room.key}" data-component="GarageCard" data-build-room="${room.key}">
      <div class="roomArtWrap">
        <img class="roomArt buildAssetImage" src="${roomAsset}" alt="${room.name}" loading="eager">
        <span class="roomLevelBadge">${data.unlocked ? `Lv ${data.level}` : 'Locked'}</span>
        <span class="roomStatusBadge">${data.roomStatus}</span>
      </div>
      <div class="roomTileInfo">
        <b>${renderDataIcon(room, room.name, 'roomHeadIcon')}<span>${room.name}</span></b>
        <span>${data.line ? data.line.outputLabel : 'Room'}</span>
      </div>
      ${data.unlocked && data.line && canCollectLine(state, data.line) && !data.manager ? `<div class="incomeBubble">Collect</div>` : ''}
      ${!data.unlocked ? `<div class="roomLock">${renderIconImage(BUILD_GUI_ASSETS.lockedBadge, 'Locked room', 'roomLockIcon', 'LOCK')}</div>` : ''}
    </button>
  `;
}

function renderGarageDrawer(state, drawerTab, selectedRoom, selectedSystem) {
  return `
    <section class="garageSystemDrawer">
      <div class="garageDrawerTabs" role="tablist" aria-label="Garage detail sections">
        <button class="garageDrawerTab ${drawerTab === 'room' ? 'active' : ''}" type="button" role="tab" data-action="garageTab" data-tab="room" aria-selected="${drawerTab === 'room'}">Room</button>
        <button class="garageDrawerTab ${drawerTab === 'systems' ? 'active' : ''}" type="button" role="tab" data-action="garageTab" data-tab="systems" aria-selected="${drawerTab === 'systems'}">Systems</button>
        <button class="garageDrawerTab ${drawerTab === 'supplier' ? 'active' : ''}" type="button" role="tab" data-action="garageTab" data-tab="supplier" aria-selected="${drawerTab === 'supplier'}">Supplier</button>
      </div>
      <div class="garageDrawerPane ${drawerTab === 'room' ? 'active' : ''}" data-garage-pane="room">
        ${renderRoomDetailDrawer(state, selectedRoom)}
      </div>
      <div class="garageDrawerPane ${drawerTab === 'systems' ? 'active' : ''}" data-garage-pane="systems">
        ${renderSystemsDrawer(state, selectedSystem)}
      </div>
      <div class="garageDrawerPane ${drawerTab === 'supplier' ? 'active' : ''}" data-garage-pane="supplier">
        ${renderSupplierDrawer(state)}
      </div>
    </section>
  `;
}

function getRoomPresentation(state, room) {
  const unlocked = !room.buildingKey || (state.buildings[room.buildingKey] || 0) > 0;
  const connection = connectionForRoom(room.key);
  const system = connection ? getBuildCommunicationState(state).systems.find((item) => item.key === connection.key) : null;
  const line = IDLE_LINES.find((item) => item.key === room.lineKey);
  const lineState = line ? getLineState(state, line.key) : null;
  const level = lineState?.level || 0;
  const income = line ? getLineIncome(state, line) : 0;
  const cycleMs = line ? getLineCycleMs(state, line) : 1;
  const progress = lineState && level > 0 ? Math.max(0, Math.min(100, (lineState.cycle / cycleMs) * 100)) : 0;
  const manager = line ? hasManager(state, line.key) : false;
  const requiredBuilding = room.buildingKey ? BUILDINGS.find((item) => item.key === room.buildingKey) : null;
  const lockedText = requiredBuilding ? `Build ${requiredBuilding.name} to open.` : 'Open from start.';
  const roomStatus = unlocked ? (manager ? 'Auto' : 'Manual') : 'Locked';
  return { unlocked, connection, system, line, lineState, level, income, progress, manager, requiredBuilding, lockedText, roomStatus };
}

function renderRoomDetailDrawer(state, room) {
  const data = getRoomPresentation(state, room);
  const buildAction = data.requiredBuilding ? renderBuildingPrimaryAction(state, data.requiredBuilding) : '';
  return `
    <article class="roomDetailDrawer ${data.unlocked ? '' : 'lockedRoom'}">
      <div class="compactSectionHead">
        <div>
          <h3>${renderDataIcon(room, room.name, 'roomHeadIcon')} ${room.name}</h3>
          <p>${data.unlocked ? room.description : data.lockedText}</p>
        </div>
        <span class="pill">${data.roomStatus}</span>
      </div>
      ${segmentedMeter({ value: data.progress, max: 100, label: `${room.name} room progress`, className: 'roomProgress' })}
      <div class="roomDetailStats">
        <div><b>${data.line ? `Lv ${data.level}` : '-'}</b><span>Line Level</span></div>
        <div><b>${data.line ? `${fmt(data.income)}` : '0'}</b><span>${data.line ? data.line.outputLabel : 'Output'}</span></div>
        <div><b>${data.manager ? 'Auto' : 'Manual'}</b><span>Collect</span></div>
      </div>
      <div class="roomSyncRow">${renderBuildWorldChips(data.system?.worldInventory)}</div>
      <div class="lineBuildBridge">${renderBuildLineChips(data.system)}</div>
      <div class="roomActions">
        ${buildAction}
        <button class="btn small" data-action="screen" data-screen="lines"><img class="roomButtonAsset buildAssetImage" src="${BUILD_GUI_ASSETS.linesButton}" alt="" loading="eager"><span>Lines</span></button>
        <button class="btn small" data-action="screen" data-screen="world"><img class="roomButtonAsset buildAssetImage" src="${BUILD_GUI_ASSETS.worldButton}" alt="" loading="eager"><span>World</span></button>
      </div>
    </article>
  `;
}

function renderSystemsDrawer(state, selectedSystem) {
  return `
    <div class="garageSystemsRail">
      ${BUILDINGS.map((building) => renderBuildingCompact(state, building, selectedSystem.key === building.key)).join('')}
    </div>
  `;
}

function renderSupplierDrawer(state) {
  const supplierUpgrades = UPGRADES.filter((upgrade) => upgrade.key === 'supplierShelf');
  return `
    <div class="garageSupplierRail">
      ${supplierUpgrades.map((upgrade) => renderUpgradeCompact(state, upgrade)).join('')}
    </div>
  `;
}

function renderUpgradeCompact(state, def) {
  const level = state.upgrades[def.key] || 0;
  const cost = upgradeCost(state, def);
  return `
    <article class="garageSystemCompact supplierUpgradeCompact">
      <div class="garageSystemCompactArt">
        ${renderDataIcon({ icon: def.icon || upgradeIconKey(def), fallbackIcon: def.fallbackIcon }, def.name, 'garageSystemCompactIcon')}
      </div>
      <div class="garageSystemCompactBody">
        <div class="garageSystemCompactHead">
          <div><h4>${def.name}</h4><p>${def.description}</p></div>
          <span class="pill">Lv ${level}</span>
        </div>
        <div class="garageSystemCost"><b>Cost:</b> ${costToText(cost)}</div>
        <button class="btn small primary" data-action="upgrade" data-key="${def.key}" ${canAfford(state, cost) ? '' : 'disabled'}>Buy</button>
      </div>
    </article>
  `;
}

function renderBuildingCompact(state, building, selected) {
  const level = state.buildings[building.key] || 0;
  const cost = nextBuildingCost(state, building);
  const connection = connectionForBuilding(building.key);
  const system = connection ? getBuildCommunicationState(state).systems.find((item) => item.key === connection.key) : null;
  const asset = buildSystemAssetForKey(building.key);
  const pct = Math.round((level / Math.max(1, building.max)) * 100);
  const actionLabel = cost ? (level > 0 ? 'Upgrade' : 'Build') : 'Done';
  const costText = cost ? costToText(cost) : 'Maxed';
  const guideTarget = building.key === 'partsStorage' && !(state.objectives?.buildStorage) ? 'buildPartsStorage' : '';
  return `
    <article class="garageSystemCompact ${selected ? 'selected' : ''}" data-action="garageSystem" data-key="${building.key}" data-build-system="${building.key}" ${guideTarget ? `data-guide-target="${guideTarget}"` : ''}>
      <div class="garageSystemCompactArt">
        <img class="garageSystemArt buildAssetImage" src="${asset}" alt="${building.name}" loading="eager">
        <span class="roomLevelBadge garageSystemLevel">Lv ${level}/${building.max}</span>
      </div>
      <div class="garageSystemCompactBody">
        <div class="garageSystemCompactHead">
          <div><h4>${building.name}</h4><p>${building.description}</p></div>
          <span class="pill">${level > 0 ? 'Built' : 'Ready'}</span>
        </div>
        ${segmentedMeter({ value: pct, max: 100, label: `${building.name} upgrade progress`, className: 'buildSystemMeter' })}
        <div class="garageSystemCost"><b>Cost:</b> ${costText}</div>
        <p class="garageSystemUnlock"><b>Unlocks:</b> ${building.unlocks}</p>
        <div class="garageSystemActions">
          ${renderBuildingPrimaryAction(state, building)}
          <button class="btn small" data-action="screen" data-screen="world"><img class="buildButtonAsset buildAssetImage" src="${BUILD_ICON_ASSETS.worldSync}" alt="" loading="eager"><span>World</span></button>
          <button class="btn small gold" data-action="screen" data-screen="lines"><img class="buildButtonAsset buildAssetImage" src="${BUILD_ICON_ASSETS.lineSync}" alt="" loading="eager"><span>Lines</span></button>
        </div>
        <div class="buildCommMeta garageSystemMeta">
          <div class="roomSyncRow">${renderBuildWorldChips(system?.worldInventory)}</div>
          <div class="lineBuildBridge">${renderBuildLineChips(system)}</div>
        </div>
      </div>
    </article>
  `;
}

function renderBuildingPrimaryAction(state, building) {
  const level = state.buildings[building.key] || 0;
  const cost = nextBuildingCost(state, building);
  const actionLabel = cost ? (level > 0 ? 'Upgrade' : 'Build') : 'Done';
  const guideTarget = building.key === 'partsStorage' && !(state.objectives?.buildStorage) ? 'buildPartsStorage' : '';
  return `
    <button class="btn small primary garagePrimaryBuildAction" data-action="building" data-key="${building.key}" ${guideTarget ? 'data-guide-target="buildPartsStorage"' : ''} ${cost && canAfford(state, cost) ? '' : 'disabled'}>
      <img class="buildButtonAsset buildAssetImage" src="${cost ? BUILD_GUI_ASSETS.upgradeButton : BUILD_GUI_ASSETS.levelBadge}" alt="" loading="eager">
      <span>${actionLabel}</span>
    </button>
  `;
}

function renderBuildHubStat(value, label) {
  return `<div class="buildBridgeStat"><b>${value}</b><span>${label}</span></div>`;
}

function worldTypeLabel(key) {
  return WORLD_BUILDING_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}

function renderBuildWorldChips(inventory) {
  const entries = Object.entries(inventory || {});
  if (!entries.length) return `<span class="buildWorldChip"><b>Pending</b><span>Build to sync World</span></span>`;
  return entries.map(([key, amount]) => `<span class="buildWorldChip"><b>+${amount}</b><span>${worldTypeLabel(key)}</span></span>`).join('');
}

function renderBuildLineChips(system) {
  if (!system?.lines?.length) return `<span class="buildLineChip"><b>No line</b><span>Standalone room</span></span>`;
  return system.lines.map((line) => `<span class="buildLineChip"><b>${line.unlocked ? `Lv ${line.level}` : 'Locked'}</b><span>${line.name}</span></span>`).join('');
}
