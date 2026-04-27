/* slownik.js - akordeon slownik */

function renderSlownik() {
  const grid = document.getElementById('slownik-grid');
  if (!grid || !DASHBOARD_DATA.slownik?.terminy) return;
  grid.innerHTML = DASHBOARD_DATA.slownik.terminy.map(t => `
    <div class="slownik-item" onclick="this.classList.toggle('expanded')">
      <div class="slownik-head">
        <div class="slownik-head-left">
          <span class="slownik-skrot">${t.skrot}</span>
          <span class="slownik-nazwa">${t.nazwa}</span>
        </div>
        <span class="slownik-chevron">▸</span>
      </div>
      <div class="slownik-krotki">${t.krotki_opis}</div>
      <div class="slownik-body">
        <div class="slownik-body-inner">
          ${t.pelny_opis_html}
          ${t.uwagi_2026 ? `<div class="slownik-uwaga-2026"><strong>Nowości 2026:</strong> ${t.uwagi_2026}</div>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}
