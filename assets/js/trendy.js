/* trendy.js - karty trendow 2026 */

function renderTrendy() {
  const el = document.getElementById('trendy-content');
  if (!el || !DASHBOARD_DATA.trendy?.kategorie) return;
  el.innerHTML = DASHBOARD_DATA.trendy.kategorie.map(kat => `
    <div class="trendy-category">
      <h3 class="trendy-cat-title">${kat.nazwa} <span class="trendy-heat">${'🔥'.repeat(kat.intensywnosc_popytu || 0)}</span></h3>
      ${kat.opis_ogolny ? `<p class="trendy-desc">${kat.opis_ogolny}</p>` : ''}
      <div class="trendy-items">${(kat.elementy || []).map(e => `
        <div class="trendy-item ${e.luka_oferty ? 'has-gap' : ''}">
          <div class="trendy-item-title">${e.nazwa}</div>
          <div class="trendy-item-desc">${e.opis || ''}</div>
          <div class="trendy-item-meta">
            ${e.popyt ? `<span class="trendy-popyt">Popyt: ${e.popyt}</span>` : ''}
            ${e.irin_obecnie_oferuje === true
              ? '<span class="trendy-irin-yes">IRIN oferuje ✓</span>'
              : e.irin_obecnie_oferuje === false
                ? '<span class="trendy-irin-no">IRIN nie oferuje ✗</span>'
                : '<span class="trendy-irin-partial">Częściowo</span>'}
            ${e.luka_oferty ? '<span class="trendy-gap">LUKA OFERTY</span>' : ''}
          </div>
          ${e.rekomendacja ? `<div class="trendy-reco">→ ${e.rekomendacja}</div>` : ''}
        </div>
      `).join('')}</div>
    </div>
  `).join('');
}
