// City Map V3: vertical-scroll mobile idle city map.
// This replaces the prototype world map after the app renders #screen-world.
(() => {
  function car(src, cls, alt) {
    return `<img class="cityCar ${cls}" src="${src}" alt="${alt}" loading="lazy">`;
  }

  function parked(src, cls, alt) {
    return `<img class="cityCar parked ${cls}" src="${src}" alt="${alt}" loading="lazy">`;
  }

  function person(cls) {
    return `<span class="cityPerson ${cls}"></span>`;
  }

  function building(cls, label, screen) {
    return `
      <button class="cityBuilding ${cls}" data-action="screen" data-screen="${screen}">
        <span class="tower">
          <span class="roof"></span>
          <span class="side"></span>
          <span class="front"></span>
          <span class="windows"><i></i><i></i><i></i><i></i><i></i><i></i></span>
        </span>
        <span class="label">${label}</span>
      </button>
    `;
  }

  function html() {
    return `
      <section class="card cityV3Shell">
        <div class="cityV3Header">
          <h2>365 Auto City</h2>
          <p>Scroll up/down. Tap city buildings, follow cars, watch workers, dispatch tow jobs, and grow the 365 auto economy.</p>
        </div>
        <div class="cityV3Viewport">
          <div class="cityV3Map">
            <div class="cityRoad vertical roadVLeft"></div>
            <div class="cityRoad vertical roadVRight"></div>
            <div class="cityRoad horizontal roadH1"></div>
            <div class="cityRoad horizontal roadH2"></div>
            <div class="cityRoad horizontal roadH3"></div>
            <div class="cityRoad horizontal roadH4"></div>
            <div class="cityRoad diagonal roadD1"></div>
            <div class="cityRoad diagonal roadD2"></div>

            <div class="cityBlock blockDealer"></div>
            <div class="cityBlock blockFactory"></div>
            <div class="cityBlock blockParts"></div>
            <div class="cityBlock blockRepair"></div>
            <div class="cityBlock blockSalvage"></div>
            <div class="cityBlock blockTow"></div>
            <div class="cityBlock blockShowroom"></div>
            <div class="cityBlock blockTrack"></div>
            <div class="cityBlock blockFuture"></div>

            ${building('dealer b3Dealer', 'Dealer Row', 'lines')}
            ${building('factory b3Factory', '365 Factory / Garage', 'garage')}
            ${building('parts b3Parts', 'Parts Hub', 'merge')}
            ${building('repair b3Repair', 'Private Repair Shops', 'lines')}
            ${building('salvage b3Salvage', 'Auto Salvage Yard', 'garage')}
            ${building('tow b3Tow', 'Tow Dispatch', 'lines')}
            ${building('dealer b3Showroom', 'Used Car Showcase', 'lines')}
            ${building('track b3Track', '2D Test Track', 'race')}

            ${parked('/assets/vehicles/iso-car-green.svg', 'pc1', 'parked car')}
            ${parked('/assets/vehicles/iso-car-blue.svg', 'pc2', 'parked car')}
            ${parked('/assets/vehicles/iso-sedan-yellow.svg', 'pc3', 'parked car')}
            ${parked('/assets/vehicles/iso-van-white.svg', 'pc4', 'parked van')}
            ${parked('/assets/vehicles/iso-broken-red.svg', 'pc5', 'salvage car')}
            ${parked('/assets/vehicles/iso-pickup-orange.svg', 'pc6', 'salvage pickup')}
            ${parked('/assets/vehicles/iso-broken-red.svg', 'pc7', 'salvage car')}
            ${parked('/assets/vehicles/iso-car-green.svg', 'pc8', 'showroom car')}
            ${parked('/assets/vehicles/iso-car-blue.svg', 'pc9', 'showroom car')}

            ${car('/assets/vehicles/iso-car-green.svg', 'driveDownLeft', 'moving car')}
            ${car('/assets/vehicles/iso-car-blue.svg', 'driveUpRight', 'moving car')}
            ${car('/assets/vehicles/iso-sedan-yellow.svg', 'driveAcross1', 'moving sedan')}
            ${car('/assets/vehicles/iso-pickup-orange.svg', 'driveAcross2', 'moving pickup')}
            ${car('/assets/vehicles/iso-car-green.svg', 'driveDiagonal1', 'moving compact car')}
            ${car('/assets/vehicles/iso-tow-yellow.svg', 'driveTow', 'tow truck')}
            ${car('/assets/vehicles/iso-delivery-teal.svg', 'driveDelivery', 'delivery truck')}

            ${person('personBlue walkDealer')}
            ${person('personGreen walkFactory')}
            ${person('personOrange walkRepair')}
            ${person('personBlue walkSalvage')}
            ${person('personGreen walkShowroom')}

            <button class="cityBreakdown" data-action="worldTow">
              <span class="cityPing">!</span>
              <img src="/assets/vehicles/iso-broken-red.svg" alt="broken-down car" loading="lazy">
              <span>Roadside Breakdown<br>Dispatch Tow</span>
            </button>
          </div>
        </div>
        <div class="cityV3Hint">City Map V3: vertical scroll, city districts, moving cars, walking people, parked vehicles, clickable buildings, and tow jobs.</div>
      </section>

      <section class="card">
        <div class="cardTitle"><div><h3>City Jobs</h3><p>This should become the main playable layer. The idle cards should support the city, not replace it.</p></div></div>
        <div class="grid2">
          <button class="btn primary" data-action="worldTow">Dispatch Tow</button>
          <button class="btn" data-action="screen" data-screen="garage">Manage Shop</button>
          <button class="btn" data-action="screen" data-screen="lines">Upgrade Businesses</button>
          <button class="btn ghost" data-action="screen" data-screen="merge">Parts / Merge</button>
        </div>
      </section>
    `;
  }

  function inject() {
    const screen = document.querySelector('#screen-world.active');
    if (!screen || screen.querySelector('.cityV3Shell')) return;
    screen.innerHTML = html();
    const viewport = screen.querySelector('.cityV3Viewport');
    if (viewport) viewport.scrollTop = 250;
  }

  const observer = new MutationObserver(() => inject());
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  window.addEventListener('load', inject);
  document.addEventListener('click', () => requestAnimationFrame(inject));
})();
