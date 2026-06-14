const TAB_DEFS = [
  ['hub', 'Racer Hub'],
  ['drive', 'Drive'],
  ['garage', 'Garage'],
  ['vehicles', 'Vehicles'],
  ['routes', 'Routes'],
  ['missions', 'Missions'],
  ['stats', 'Stats']
];

let activeTab = 'hub';

function makePage(key, title) {
  const page = document.createElement('section');
  page.className = `racerPage ${key === activeTab ? 'active' : ''}`;
  page.dataset.racerPage = key;
  const heading = document.createElement('h3');
  heading.className = 'racerPageTitle';
  heading.textContent = title;
  page.appendChild(heading);
  return page;
}

function activateTab(shell, tab) {
  activeTab = tab;
  shell.querySelectorAll('[data-racer-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.racerTab === tab);
  });
  shell.querySelectorAll('[data-racer-page]').forEach((page) => {
    page.classList.toggle('active', page.dataset.racerPage === tab);
  });
  if (tab === 'drive') window.dispatchEvent(new Event('resize'));
}

function findPanel(shell, title) {
  return Array.from(shell.querySelectorAll(':scope > .roadRunnerPanel')).find((panel) => {
    const h3 = panel.querySelector('h3');
    return h3 && h3.textContent.trim().toLowerCase().startsWith(title.toLowerCase());
  });
}

function enhanceRacerShell() {
  const shell = document.querySelector('#screen-race.active .roadRunnerShell');
  if (!shell || shell.dataset.racerTabsReady === 'true') return;

  const header = shell.querySelector(':scope > .roadRunnerHeader');
  const hud = shell.querySelector(':scope > .roadRunnerHud');
  const quickPanel = shell.querySelector(':scope > .roadRunnerQuickPanel');
  const gameFrame = shell.querySelector(':scope > .roadRunnerGameFrame');
  const ghostPanel = findPanel(shell, 'Ghost Race');
  const routesPanel = findPanel(shell, 'Routes');
  const missionsPanel = findPanel(shell, 'Missions');
  const vehiclePanel = shell.querySelector(':scope > [data-road-runner-vehicles]');
  const garagePanel = shell.querySelector(':scope > [data-road-runner-garage]');

  if (!header || !hud || !quickPanel || !gameFrame) return;

  const nav = document.createElement('nav');
  nav.className = 'racerInnerNav';
  TAB_DEFS.forEach(([key, label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.racerTab = key;
    button.textContent = label;
    button.classList.toggle('active', key === activeTab);
    button.addEventListener('click', () => activateTab(shell, key));
    nav.appendChild(button);
  });

  const pages = document.createElement('div');
  pages.className = 'racerPages';

  const hubPage = makePage('hub', 'Racer Hub');
  const drivePage = makePage('drive', 'Drive Mode');
  const garagePage = makePage('garage', 'Garage Upgrades');
  const vehiclesPage = makePage('vehicles', 'Vehicle Selection');
  const routesPage = makePage('routes', 'Routes & Ghost Race');
  const missionsPage = makePage('missions', 'Missions');
  const statsPage = makePage('stats', 'Racer Stats');

  const hubCards = document.createElement('div');
  hubCards.className = 'racerHubCards';
  hubCards.innerHTML = `
    <div class="racerHubCard"><h4>Drive</h4><p>Start a run, collect coins, fuel, and parts, then beat your ghost distance.</p></div>
    <div class="racerHubCard"><h4>Garage</h4><p>Spend coins and parts on Engine, Tires, Fuel Tank, Suspension, and Durability.</p></div>
    <div class="racerHubCard"><h4>Vehicles</h4><p>Unlock different vehicles for fuel range, speed, handling, and durability.</p></div>
    <div class="racerHubCard"><h4>Missions</h4><p>Complete run contracts for extra coins, parts, and route progress.</p></div>
  `;

  const hubActions = document.createElement('div');
  hubActions.className = 'racerHubActions';
  hubActions.innerHTML = `
    <button class="btn primary" type="button" data-open-racer-page="drive">Start Driving</button>
    <button class="btn gold" type="button" data-open-racer-page="garage">Open Garage</button>
    <button class="btn ghost" type="button" data-open-racer-page="vehicles">Change Vehicle</button>
    <button class="btn ghost" type="button" data-open-racer-page="routes">Choose Route</button>
    <button class="btn primary" type="button" data-open-racer-page="missions">View Missions</button>
  `;
  hubActions.querySelectorAll('[data-open-racer-page]').forEach((button) => {
    button.addEventListener('click', () => activateTab(shell, button.dataset.openRacerPage));
  });

  hubPage.appendChild(hubCards);
  hubPage.appendChild(hubActions);
  hubPage.appendChild(quickPanel);
  drivePage.appendChild(gameFrame);
  if (garagePanel) garagePage.appendChild(garagePanel);
  if (vehiclePanel) vehiclesPage.appendChild(vehiclePanel);
  if (routesPanel) routesPage.appendChild(routesPanel);
  if (ghostPanel) routesPage.appendChild(ghostPanel);
  if (missionsPanel) missionsPage.appendChild(missionsPanel);

  const statsBody = document.createElement('div');
  statsBody.className = 'racerHubCards';
  statsBody.innerHTML = `
    <div class="racerHubCard"><h4>Resources</h4><p>Fuel controls range. Wear controls damage. Coins and parts upgrade the vehicle.</p></div>
    <div class="racerHubCard"><h4>Route Director</h4><p>Fuel stops, parts stores, hazards, and salvage are intentionally spaced to create tension.</p></div>
    <div class="racerHubCard"><h4>Reverse</h4><p>Brake slows the car. Holding brake while nearly stopped slowly reverses to recover position.</p></div>
    <div class="racerHubCard"><h4>Next</h4><p>Later: leaderboard ghosts, daily route events, sponsor rewards, and multiplayer ghosts.</p></div>
  `;
  statsPage.appendChild(statsBody);

  pages.append(hubPage, drivePage, garagePage, vehiclesPage, routesPage, missionsPage, statsPage);
  header.after(nav);
  nav.after(hud);
  hud.after(pages);
  shell.dataset.racerTabsReady = 'true';
  activateTab(shell, activeTab);
}

function watchRacerTabs() { enhanceRacerShell(); }

const observer = new MutationObserver(() => watchRacerTabs());
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.addEventListener('load', watchRacerTabs);
document.addEventListener('click', () => requestAnimationFrame(watchRacerTabs));
