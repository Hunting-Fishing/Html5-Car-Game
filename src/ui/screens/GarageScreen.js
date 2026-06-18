import { BUILDINGS, IDLE_LINES, UPGRADES } from '../../data/gameData.js';
import { AUTO_SHOP_ROOMS } from '../../data/visualData.js';
import { BUILD_ASSET_LIST, BUILD_GUI_ASSETS, BUILD_ICON_ASSETS, buildRoomAssetForKey, buildSystemAssetForKey } from '../../data/buildAssetMap.js';
import { connectionForBuilding, connectionForRoom } from '../../data/buildLinkData.js';
import { GamePanel, GarageCard, renderDataIcon, renderIconImage } from '../components/GamePanel.js';
import { UpgradeCard } from '../components/UpgradeCard.js';
import { renderGarageSystemCard } from '../components/GarageCard.js';
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
  return [
    GarageCard({
      icon: 'garage',
      title: 'Garage',
      subtitle: 'Garage is grouped into Build Rooms and Business Lines.',
      badge: 'Garage Group',
      className: 'screenGroupPanel garageGroupPanel',
      body: `
        <div class="screenSubTabs" role="tablist" aria-label="Garage sections">
          <button class="btn primary active" type="button" data-action="screen" data-screen="garage" aria-current="page">
            <img class="buildButtonAsset buildAssetImage" src="${BUILD_ICON_ASSETS.buildMode}" alt="" loading="eager">
            <span>Build Rooms</span>
          </button>
          <button class="btn" type="button" data-action="screen" data-screen="lines">
            <img class="buildButtonAsset buildAssetImage" src="${BUILD_ICON_ASSETS.lineSync}" alt="" loading="eager">
            <span>Business Lines</span>
          </button>
        </div>
      `
    }),
    GarageCard({
      icon: 'garage',
      title: 'Build Hub',
      subtitle: 'Upgrade rooms, feed World inventory, and unlock Lines from one control board.',
      badge: 'Live Sync',
      heading: 'h2',
      className: 'buildHubCard buildCommandCenter',
      body: `
        <div class="buildAssetPreload" aria-hidden="true">
          ${BUILD_ASSET_LIST.map((item) => `<img class="buildAssetPreloadImage" data-build-asset="${item.category}:${item.key}" src="${item.src}" alt="" loading="eager">`).join('')}
        </div>
        <div class="buildCommandProgress">
          <div><b>${buildPct}%</b><span>Systems online</span></div>
          ${segmentedMeter({ value: buildPct, max: 100, label: 'Garage systems online', className: 'buildEfficiencyMeter' })}
        </div>
        <div class="buildHubButtons buildCommandActions">
          <button class="btn gold" data-action="screen" data-screen="garage"><img class="buildButtonAsset buildAssetImage" src="${BUILD_ICON_ASSETS.buildMode}" alt="" loading="eager"><span>Build</span></button>
          <button class="btn primary" data-action="screen" data-screen="world"><img class="buildButtonAsset buildAssetImage" src="${BUILD_ICON_ASSETS.worldSync}" alt="" loading="eager"><span>World</span></button>
          <button class="btn" data-action="screen" data-screen="lines"><img class="buildButtonAsset buildAssetImage" src="${BUILD_ICON_ASSETS.lineSync}" alt="" loading="eager"><span>Lines</span></button>
        </div>
        <div class="buildBridgeGrid">
          ${renderBuildHubStat(`${buildComm.builtCount}/${buildComm.totalSystems}`, 'Systems Built')}
          ${renderBuildHubStat(`+${buildComm.totalWorldInventory}`, 'World Placements')}
          ${renderBuildHubStat(`${buildComm.unlockedLineCount}/${buildComm.totalLineCount}`, 'Linked Lines')}
        </div>
      `
    }),
    GarageCard({
      icon: 'garage',
      title: '365 Auto Shop Floor',
      subtitle: 'Each room links to a Line and adds World inventory when its Build system exists.',
      badge: 'Room Map',
      heading: 'h2',
      className: 'buildFloorCard',
      body: `<div class="shopFloor">${AUTO_SHOP_ROOMS.map((room) => renderShopRoom(state, room)).join('')}</div>`
    }),
    GarageCard({
      icon: 'tools',
      title: 'Garage Systems',
      subtitle: 'Buildings unlock mechanics, city inventory, resident support, and line requirements.',
      badge: `${buildPct}% online`,
      heading: 'h2',
      className: 'buildSystemsCard',
      body: `<div class="garageSystemGrid">${BUILDINGS.map((building) => renderBuilding(state, building)).join('')}</div>`
    }),
    GamePanel({
      icon: 'parts',
      title: 'Supplier / Merge Upgrades',
      subtitle: 'These support the merge board instead of replacing it.',
      className: 'supplierUpgradePanel',
      body: UPGRADES.filter((u) => u.key === 'supplierShelf').map((upgrade) => renderUpgrade(state, upgrade)).join('')
    })
  ].join('');
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

function renderShopRoom(state, room) {
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
  const lockedText = room.buildingKey ? `Build ${BUILDINGS.find((item) => item.key === room.buildingKey)?.name || 'required system'} to open.` : 'Open from start.';
  const roomAsset = buildRoomAssetForKey(room.key) || room.asset;
  const roomStatus = unlocked ? (manager ? 'Auto' : 'Manual') : 'Locked';

  return `
    <article class="shopRoom GarageCard ${unlocked ? '' : 'lockedRoom'}" data-component="GarageCard" data-build-room="${room.key}">
      <div class="roomArtWrap">
        <img class="roomArt buildAssetImage" src="${roomAsset}" alt="${room.name}" loading="eager">
        <span class="roomLevelBadge">${unlocked ? `Lv ${level}` : 'Locked'}</span>
        <span class="roomStatusBadge">${roomStatus}</span>
      </div>
      <div class="roomInfo">
        <div class="roomHead"><h3>${renderDataIcon(room, room.name, 'roomHeadIcon')}<span>${room.name}</span></h3><span class="pill">${line ? line.outputLabel : 'Room'}</span></div>
        <p>${unlocked ? room.description : lockedText}</p>
        ${segmentedMeter({ value: progress, max: 100, label: `${room.name} room progress`, className: 'roomProgress' })}
        <div class="roomMeta">
          <span>${line ? `${fmt(income)} ${line.outputLabel}` : 'No line'}</span>
          <span>${roomStatus}</span>
        </div>
        <div class="roomSyncRow">${renderBuildWorldChips(system?.worldInventory)}</div>
        <div class="roomActions">
          <button class="btn small ${unlocked ? 'primary' : 'ghost'}" data-action="screen" data-screen="lines"><img class="roomButtonAsset buildAssetImage" src="${BUILD_GUI_ASSETS.linesButton}" alt="" loading="eager"><span>${unlocked ? 'Line' : 'Reqs'}</span></button>
          <button class="btn small" data-action="screen" data-screen="world"><img class="roomButtonAsset buildAssetImage" src="${BUILD_GUI_ASSETS.worldButton}" alt="" loading="eager"><span>World</span></button>
          <button class="btn small gold" data-action="screen" data-screen="garage"><img class="roomButtonAsset buildAssetImage" src="${BUILD_GUI_ASSETS.buildButton}" alt="" loading="eager"><span>Build</span></button>
        </div>
      </div>
      ${unlocked && line && canCollectLine(state, line) && !manager ? `<div class="incomeBubble">Collect</div>` : ''}
      ${!unlocked ? `<div class="roomLock">${renderIconImage(BUILD_GUI_ASSETS.lockedBadge, 'Locked room', 'roomLockIcon', 'LOCK')}</div>` : ''}
    </article>
  `;
}

function renderUpgrade(state, def) {
  const level = state.upgrades[def.key] || 0;
  const cost = upgradeCost(state, def);
  return UpgradeCard({
    icon: def.icon || upgradeIconKey(def),
    fallbackIcon: def.fallbackIcon,
    title: def.name,
    subtitle: def.description,
    badge: `Lv ${level}`,
    className: 'upgrade',
    body: `<div class="cost">Cost: ${costToText(cost)}</div>`,
    action: `<button class="btn small primary" data-action="upgrade" data-key="${def.key}" ${canAfford(state, cost) ? '' : 'disabled'}>Buy</button>`
  });
}

function renderBuilding(state, building) {
  const level = state.buildings[building.key] || 0;
  const cost = nextBuildingCost(state, building);
  const connection = connectionForBuilding(building.key);
  const system = connection ? getBuildCommunicationState(state).systems.find((item) => item.key === connection.key) : null;
  const asset = buildSystemAssetForKey(building.key);
  const pct = Math.round((level / Math.max(1, building.max)) * 100);
  const actionLabel = cost ? (level > 0 ? 'Upgrade' : 'Build') : 'Done';
  const costText = cost ? costToText(cost) : 'Maxed';
  return renderGarageSystemCard({
    key: building.key,
    name: building.name,
    description: building.description,
    imageSrc: asset,
    level,
    max: building.max,
    progressHtml: segmentedMeter({ value: pct, max: 100, label: `${building.name} upgrade progress`, className: 'buildSystemMeter' }),
    costText,
    unlocks: building.unlocks,
    worldChipsHtml: renderBuildWorldChips(system?.worldInventory),
    lineChipsHtml: renderBuildLineChips(system),
    primaryActionHtml: `<button class="btn small primary garagePrimaryBuildAction" data-action="building" data-key="${building.key}" ${cost && canAfford(state, cost) ? '' : 'disabled'}><img class="buildButtonAsset buildAssetImage" src="${cost ? BUILD_GUI_ASSETS.upgradeButton : BUILD_GUI_ASSETS.levelBadge}" alt="" loading="eager"><span>${actionLabel}</span></button>`,
    secondaryActionsHtml: `
      <button class="btn small" data-action="screen" data-screen="world"><img class="buildButtonAsset buildAssetImage" src="${BUILD_ICON_ASSETS.worldSync}" alt="" loading="eager"><span>World</span></button>
      <button class="btn small gold" data-action="screen" data-screen="lines"><img class="buildButtonAsset buildAssetImage" src="${BUILD_ICON_ASSETS.lineSync}" alt="" loading="eager"><span>Lines</span></button>
    `
  });
}
