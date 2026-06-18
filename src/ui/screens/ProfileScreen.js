import { GamePanel, ObjectiveCard, ProblemAlert, renderIconImage } from '../components/GamePanel.js';
import { meterLine } from '../components/StatMeter.js';
import { fmt } from '../../systems/economySystem.js';
import { getObjectiveList } from '../../systems/objectiveSystem.js';

function renderObjectiveStatusIcon(done) {
  const icon = done ? '/assets/ui/icons/rep.png' : '/assets/ui/icons/menu.png';
  return renderIconImage(icon, done ? 'Objective complete' : 'Objective open', 'checkIconImg', done ? 'OK' : '--');
}

export function renderProfileScreen(state) {
  const objectives = getObjectiveList(state);
  const garageValue = Math.round(
    state.currencies.coins +
    state.stage * 100 +
    state.merge.totalMerges * 18 +
    Object.values(state.buildings).reduce((a, b) => a + b, 0) * 500 +
    state.idleLines.lifetimeCollections * 12
  );
  return [
    GamePanel({
      icon: 'menu',
      title: 'Menu Sections',
      subtitle: 'Menu groups profile, creator rules, settings, and save controls.',
      badge: 'Menu Group',
      className: 'screenGroupPanel menuGroupPanel',
      body: `
        <div class="screenSubTabs menuSubTabs" role="tablist" aria-label="Menu sections">
          <button class="btn primary active" type="button" data-action="screen" data-screen="profile" aria-current="page">Profile</button>
          <button class="btn" type="button" data-action="screen" data-screen="creator">Creator Rules</button>
          <a class="btn ghost" href="#profile-settings">Settings</a>
          <button class="btn red" type="button" data-action="reset">Reset Save</button>
        </div>
      `
    }),
    GamePanel({
      icon: 'profile',
      title: state.playerName,
      subtitle: 'Local-only profile. Git repo stage. No Supabase yet.',
      badge: `Lv ${state.level}`,
      heading: 'h2',
      className: 'profilePanel',
      body: `
        ${meterLine('XP', state.xp, state.level * 80, '')}
        <div class="grid2">
          <div class="notice good"><b>${fmt(garageValue)}</b><br>Garage Value</div>
          <div class="notice good"><b>${fmt(state.race.lifetimeMeters)}</b><br>Lifetime Meters</div>
          <div class="notice"><b>${state.merge.totalMerges}</b><br>Total Merges</div>
          <div class="notice"><b>${fmt(state.idleLines.lifetimeCollections)}</b><br>Line Collects</div>
        </div>
      `
    }),
    GamePanel({
      icon: 'tools',
      title: 'Settings',
      subtitle: 'Current local test settings and app controls.',
      badge: 'Local',
      className: 'settingsPanel',
      body: `
        <div id="profile-settings" class="settingsGrid">
          <div class="notice good"><b>Save Mode</b><br>Local browser save</div>
          <div class="notice"><b>Fullscreen</b><br>Use the FS button in the top HUD</div>
          <div class="notice"><b>Creator Rules</b><br>Available from this Menu group</div>
          <div class="notice bad"><b>Reset Save</b><br>Use only for test profiles</div>
        </div>
      `
    }),
    GamePanel({
      icon: 'menu',
      title: 'Quick Links',
      subtitle: 'Secondary screens live here so the main nav stays player-focused.',
      badge: 'Shortcuts',
      className: 'menuHubCard',
      body: `
        <div class="grid2">
          <button class="btn primary" data-action="screen" data-screen="world">World Map</button>
          <button class="btn gold" data-action="screen" data-screen="lines">Lines</button>
          <button class="btn" data-action="screen" data-screen="creator">Creator Rules</button>
          <button class="btn ghost" data-action="screen" data-screen="hub">Back Home</button>
        </div>
        <div class="notice">Profile and Creator are grouped under Menu so the bottom nav stays player-focused.</div>
      `
    }),
    ObjectiveCard({
      icon: 'home',
      title: 'Objective Checklist',
      subtitle: 'The player always needs a clear reason to continue.',
      body: objectives.map((o) => `<div class="objective"><div class="checkIcon">${renderObjectiveStatusIcon(o.done)}</div><div><h4>${o.title}</h4><p>${o.body}</p></div><span class="pill">${o.done ? 'Done' : 'Open'}</span></div>`).join('')
    }),
    ProblemAlert({
      icon: 'tools',
      title: 'Reset Local Save',
      subtitle: 'Use carefully. This clears the local test profile.',
      badge: 'Danger',
      body: `<button class="btn red" data-action="reset">Reset Local Save</button>`
    })
  ].join('');
}
