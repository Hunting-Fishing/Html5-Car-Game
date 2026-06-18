import { AUTO_WORLD_LOCATIONS, WORLD_PEOPLE, WORLD_TRAFFIC } from '../../data/visualData.js';
import { GamePanel, renderDataIcon } from '../components/GamePanel.js';

export function renderWorldScreen() {
  return `
    ${GamePanel({
      icon: 'home',
      title: 'Home',
      subtitle: 'Home is grouped into Today and the World Map.',
      badge: 'Home Group',
      className: 'screenGroupPanel homeGroupPanel',
      body: `
        <div class="screenSubTabs" role="tablist" aria-label="Home sections">
          <button class="btn" type="button" data-action="screen" data-screen="hub">Today</button>
          <button class="btn primary active" type="button" data-action="screen" data-screen="world" aria-current="page">World Map</button>
        </div>
      `
    })}

    <section class="card worldCard">
      <div class="cardTitle">
        <div><h2>365 Auto World</h2><p>Tap buildings and events. Cars move on roads, shops generate work, and breakdowns feed tow/recovery gameplay.</p></div>
        <span class="pill">Playable Map</span>
      </div>
      <div class="autoWorldMap">
        <div class="mapGround"></div>
        <div class="road roadH roadTop"></div>
        <div class="road roadH roadMid"></div>
        <div class="road roadH roadBottom"></div>
        <div class="road roadV roadLeft"></div>
        <div class="road roadV roadRight"></div>
        <div class="intersection centerCross"></div>
        ${WORLD_TRAFFIC.map(renderTrafficCar).join('')}
        ${WORLD_PEOPLE.map(renderWorldPerson).join('')}
        ${AUTO_WORLD_LOCATIONS.map(renderWorldLocation).join('')}
      </div>
    </section>

    <section class="card">
      <div class="cardTitle"><div><h3>World Jobs</h3><p>This is the beginning of the real game layer: click locations, handle roadside work, grow the auto economy.</p></div></div>
      <div class="grid2">
        <button class="btn primary" data-action="worldTow">Dispatch Tow</button>
        <button class="btn" data-action="screen" data-screen="garage">Manage Shop</button>
        <button class="btn" data-action="screen" data-screen="lines">Upgrade Businesses</button>
        <button class="btn ghost" data-action="screen" data-screen="race">Run Route</button>
      </div>
    </section>
  `;
}

function renderTrafficCar(car) {
  const vehicle = car.asset
    ? `<img src="${car.asset}" alt="${car.key}" loading="lazy">`
    : renderDataIcon(car, car.key, 'trafficCarIcon');
  return `<div class="trafficCar ${car.lane} ${car.speedClass}" style="animation-delay:${car.delay}s">${vehicle}</div>`;
}

function renderWorldPerson(person) {
  return `<div class="worldPerson" style="left:${person.x}%; top:${person.y}%" title="${person.label}">${renderDataIcon(person, person.label, 'worldPersonIcon')}</div>`;
}

function renderWorldLocation(location) {
  const locationIcon = location.asset
    ? `<img class="worldLocationVehicle" src="${location.asset}" alt="${location.name}" loading="lazy">`
    : `<span class="worldIcon">${renderDataIcon(location, location.name, 'worldIconAsset')}</span>`;
  return `
    <button class="worldLocation ${location.type}" style="left:${location.x}%; top:${location.y}%" data-action="worldLocation" data-location="${location.key}">
      ${locationIcon}
      <span class="worldLabel">${location.name}</span>
      ${location.type === 'event' ? '<span class="alertPing">!</span>' : ''}
    </button>
  `;
}
