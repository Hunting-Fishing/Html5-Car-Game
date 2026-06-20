import { AUTO_WORLD_LOCATIONS, WORLD_PEOPLE, WORLD_TRAFFIC } from '../../data/visualData.js';
import { renderDataIcon } from '../components/GamePanel.js';
import { ActionDock } from '../components/ActionDock.js';
import { ScreenFrame } from '../components/ScreenFrame.js';
import { SubTabBar } from '../components/SubTabBar.js';

export function renderWorldScreen() {
  return ScreenFrame({
    title: '365 Auto World',
    subtitle: 'Tap buildings, people, and events around the city.',
    badge: 'World Map',
    className: 'worldPlayArea',
    body: `
      ${SubTabBar({
        tabs: [
          { label: 'Today', screen: 'hub', icon: 'home' },
          { label: 'World Map', screen: 'world', icon: 'home', active: true }
        ]
      })}

      <section class="worldMapPrimary" aria-label="365 Auto World map">
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

      <div class="worldActionDock">
        ${ActionDock({
          actions: [
            { label: 'Dispatch Tow', action: 'worldTow', icon: 'tools', className: 'primary' },
            { label: 'Manage Shop', screen: 'garage', icon: 'garage' },
            { label: 'Upgrade Businesses', screen: 'lines', icon: 'parts', className: 'gold' },
            { label: 'Run Route', screen: 'race', icon: 'race', className: 'ghost' }
          ]
        })}
      </div>
    `
  });
}

function renderTrafficCar(car) {
  const vehicle = car.asset
    ? `<img src="${car.asset}" alt="${car.key}" loading="eager">`
    : renderDataIcon(car, car.key, 'trafficCarIcon');
  return `<div class="trafficCar ${car.lane} ${car.speedClass}" style="animation-delay:${car.delay}s">${vehicle}</div>`;
}

function renderWorldPerson(person) {
  return `<div class="worldPerson" style="left:${person.x}%; top:${person.y}%" title="${person.label}">${renderDataIcon(person, person.label, 'worldPersonIcon')}</div>`;
}

function renderWorldLocation(location) {
  const locationIcon = location.asset
    ? `<img class="worldLocationVehicle" src="${location.asset}" alt="${location.name}" loading="eager">`
    : `<span class="worldIcon">${renderDataIcon(location, location.name, 'worldIconAsset')}</span>`;
  return `
    <button class="worldLocation ${location.type}" style="left:${location.x}%; top:${location.y}%" data-action="worldLocation" data-location="${location.key}">
      ${locationIcon}
      <span class="worldLabel">${location.name}</span>
      ${location.type === 'event' ? '<span class="alertPing">!</span>' : ''}
    </button>
  `;
}
