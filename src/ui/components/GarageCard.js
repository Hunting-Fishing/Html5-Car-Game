export function renderGarageSystemCard({
  key,
  name,
  description,
  imageSrc,
  level,
  max,
  progressHtml,
  costText,
  unlocks,
  worldChipsHtml,
  lineChipsHtml,
  primaryActionHtml,
  secondaryActionsHtml = ''
}) {
  return `
    <article class="building buildSystemCard garageSystemRoomCard GarageCard" data-component="GarageCard" data-build-system="${key}">
      <div class="garageSystemArtWrap">
        <img class="garageSystemArt buildAssetImage" src="${imageSrc}" alt="${name}" loading="eager">
        <span class="roomLevelBadge garageSystemLevel">Lv ${level}/${max}</span>
      </div>
      <div class="garageSystemRoomBody">
        <div class="garageSystemRoomHead">
          <div><h4>${name}</h4><p>${description}</p></div>
          <span class="pill">${level > 0 ? 'Built' : 'Ready'}</span>
        </div>
        ${progressHtml}
        <div class="garageSystemCost"><b>Cost:</b> ${costText}</div>
        <p class="garageSystemUnlock"><b>Unlocks:</b> ${unlocks}</p>
        <div class="buildCommMeta garageSystemMeta">
          <div class="roomSyncRow">${worldChipsHtml}</div>
          <div class="lineBuildBridge">${lineChipsHtml}</div>
        </div>
        <div class="garageSystemActions">
          ${primaryActionHtml}
          ${secondaryActionsHtml}
        </div>
      </div>
    </article>
  `;
}
