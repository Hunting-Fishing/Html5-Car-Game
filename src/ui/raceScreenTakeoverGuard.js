function isOldIdleRaceScreen(screen) {
  if (!screen || screen.querySelector('.roadRunnerShell')) return false;
  const text = screen.textContent || '';
  return text.includes('Idle Racing') || text.includes('TAP RACE BOOST') || text.includes('Route Modes') || Boolean(screen.querySelector('#raceCanvas'));
}

function clearOldRaceScreen() {
  const screen = document.querySelector('#screen-race.active');
  if (!screen) return;
  if (!isOldIdleRaceScreen(screen)) return;

  screen.innerHTML = `
    <section class="card roadRunnerOnlyMount">
      <div class="cardTitle">
        <div>
          <h2>365 Hill Climb Racer</h2>
          <p>Loading dedicated 2D hill climb mode. The old Idle Racing screen is disabled.</p>
        </div>
        <span class="pill">2D Racer</span>
      </div>
      <div class="notice good">Preparing Racer Hub...</div>
    </section>
  `;

  document.dispatchEvent(new CustomEvent('hillclimb:race-screen-ready'));
  requestAnimationFrame(() => document.dispatchEvent(new CustomEvent('hillclimb:race-screen-ready')));
}

const observer = new MutationObserver(() => clearOldRaceScreen());
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

window.addEventListener('load', clearOldRaceScreen);
document.addEventListener('click', () => requestAnimationFrame(clearOldRaceScreen));
setInterval(clearOldRaceScreen, 500);
