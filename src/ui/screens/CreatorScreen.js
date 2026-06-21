import { CREATOR_RULES } from '../../data/gameData.js';

export function renderCreatorScreen() {
  return `
    <section class="card">
      <div class="cardTitle"><div><h2>Creator Mode Rules</h2><p>Use this screen while we build new modes so the companion app does not lose focus.</p></div></div>
      <div class="notice good"><b>Current rule:</b> Git repo first. Local save only. Supabase later when this connects to www.365motorsales.com.</div>
    </section>
    ${CREATOR_RULES.map((rule) => `
      <section class="ruleBlock">
        <h4>${rule.mode}</h4>
        <div class="doDont">
          <div class="notice good"><b>Do</b><ul>${rule.do.map((item) => `<li>${item}</li>`).join('')}</ul></div>
          <div class="notice bad"><b>Don't</b><ul>${rule.dont.map((item) => `<li>${item}</li>`).join('')}</ul></div>
        </div>
      </section>
    `).join('')}
  `;
}
