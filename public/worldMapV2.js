// Replaces the first prototype World map with a horizontal mobile idle-city map.
// This keeps the existing game actions by using the same data-action attributes.
(() => {
  let injected = false;

  function vehicle(src, cls, alt) {
    return `<img class="mapV2Car ${cls}" src="${src}" alt="${alt}" loading="lazy">`;
  }

  function parked(src, cls, alt) {
    return `<img class="mapV2Car parked ${cls}" src="${src}" alt="${alt}" loading="lazy">`;
  }

  function building(cls, label, action, screen) {
    const actionAttr = action ? `data-action="${action}"` : 'data-action="screen"';
    const screenAttr = screen ? `data-screen="${screen}"` : '';
    return `
      <button class="mapV2Building ${cls}" ${actionAttr} ${screenAttr}>
        <span class="buildingStack">
          <span class="roof"></span>
          <span class="side"></span>
          <span class="front"></span>
          <span class="windowGrid"><span></span><span></span><span></span><span></span><span></span><span></span></span>
        </span>
        <span class="buildingLabel">${label}</span>
      </button>
    `;
  }

  function worldHtml() {
    return `
      <section class="card worldV2Shell">
        <div class="worldV2Header">
          <h2>365 Auto World</h2>
          <p>Swipe left/right. Tap dealerships, factory buildings, repair shops, salvage yards, and roadside breakdown jobs.</p>
        </div>
        <div class="worldV2Viewport">
          <div class="worldV2City">
            <div class="isoRoad roadMainA"></div>
            <div class="isoRoad roadMainB"></div>
            <div class="isoRoad roadMainC"></div>
            <div class="isoRoad roadSpurA"></div>
            <div class="isoRoad roadSpurB"></div>

            <div class="isoLot lotDealer"></div>
            <div class="isoLot lotFactory"></div>
            <div class="isoLot lotParts"></div>
            <div class="isoLot lotRepair"></div>
            <div class="isoLot lotSalvage"></div>

            ${building('dealer bDealer', 'Dealer Row', null, 'lines')}
            ${building('factory bFactory', '365 Factory / Main Garage', null, 'garage')}
            ${building('parts bParts', 'Parts Hub', null, 'merge')}
            ${building('repair bRepair', 'Private Repair Shops', null, 'lines')}
            ${building('salvage bSalvage', 'Auto Salvage Yard', null, 'garage')}

            ${vehicle('/assets/vehicles/iso-car-green.svg', 'routeEastA', 'moving green car')}
            ${vehicle('/assets/vehicles/iso-car-blue.svg', 'routeEastB', 'moving blue car')}
            ${vehicle('/assets/vehicles/iso-sedan-yellow.svg', 'routeWestA', 'moving yellow sedan')}
            ${vehicle('/assets/vehicles/iso-tow-yellow.svg', 'routeTow', 'moving tow truck')}
            ${vehicle('/assets/vehicles/iso-delivery-teal.svg', 'routeDelivery', 'moving delivery truck')}

            ${parked('/assets/vehicles/iso-car-green.svg', 'cPark1', 'parked car')}
            ${parked('/assets/vehicles/iso-car-blue.svg', 'cPark2', 'parked car')}
            ${parked('/assets/vehicles/iso-sedan-yellow.svg', 'cPark3', 'parked car')}
            ${parked('/assets/vehicles/iso-van-white.svg', 'cPark4', 'parked van')}
            ${parked('/assets/vehicles/iso-car-blue.svg', 'cPark5', 'parked car')}
            ${parked('/assets/vehicles/iso-car-green.svg', 'cPark6', 'parked car')}
            ${parked('/assets/vehicles/iso-broken-red.svg', 'cPark7', 'salvage car')}
            ${parked('/assets/vehicles/iso-pickup-orange.svg', 'cPark8', 'salvage pickup')}
            ${parked('/assets/vehicles/iso-broken-red.svg', 'cPark9', 'salvage car')}

            <button class="breakdownV2" data-action="worldTow">
              <span class="mapPingV2">!</span>
              <img src="/assets/vehicles/iso-broken-red.svg" alt="broken-down car" loading="lazy">
              <span>Roadside Breakdown<br>Dispatch Tow</span>
            </button>

            <span class="mapV2Worker w1"></span>
            <span class="mapV2Worker w2"></span>
            <span class="mapV2Worker w3"></span>
          </div>
        </div>
        <div class="worldV2Hint">Prototype map V2: horizontal scroll, isometric road layout, factory/dealer/parts/repair/salvage zones, animated traffic, tow event.</div>
      </section>

      <section class="card">
        <div class="cardTitle"><div><h3>World Jobs</h3><p>Tap the map, dispatch tow work, and use earnings to grow the auto economy.</p></div></div>
        <div class="grid2">
          <button class="btn primary" data-action="worldTow">Dispatch Tow</button>
          <button class="btn" data-action="screen" data-screen="garage">Manage Shop</button>
          <button class="btn" data-action="screen" data-screen="lines">Upgrade Businesses</button>
          <button class="btn ghost" data-action="screen" data-screen="race">Run Route</button>
        </div>
      </section>
    `;
  }

  function inject() {
    const screen = document.querySelector('#screen-world.active');
    if (!screen || screen.querySelector('.worldV2Shell')) return;
    screen.innerHTML = worldHtml();
    injected = true;
    const viewport = screen.querySelector('.worldV2Viewport');
    if (viewport) viewport.scrollLeft = 260;
  }

  const observer = new MutationObserver(() => inject());
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  window.addEventListener('load', inject);
  window.addEventListener('hashchange', inject);
  document.addEventListener('click', () => requestAnimationFrame(inject));
})();
