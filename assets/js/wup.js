/* wup.js - panel WUP + projekty BUR rozszerzone (11 pol) */

function renderWupGrid() {
  const grid = document.getElementById('wup-grid');
  if (!grid) return;
  grid.innerHTML = WOJEWODZTWA_KOLEJNOSC.map(slug => {
    const w = DASHBOARD_DATA.wup[slug];
    if (!w) return '';
    const tierColor = TIER_COLORS[w.tier] || '#999';
    const priors = (w.priorytety_wojewodzkie || []).map(p =>
      `<div class="wup-priority"><strong>${p.kod}:</strong> ${p.nazwa}</div>`
    ).join('') || '<div class="no-data">Do weryfikacji</div>';
    const projektyBur = (w.projekty_bur && w.projekty_bur.length)
      ? w.projekty_bur.map(renderProjektBur).join('')
      : '<div class="no-data">Brak projektów lub do uzupełnienia</div>';

    return `<div class="wup-card">
      <div class="wup-card-header">
        <div class="wup-title">${w.operator_bur} <span class="tier-badge" style="background:${tierColor}">${TIER_LABELS[w.tier] || ''}</span></div>
        <div class="wup-voiv">${w.wojewodztwo_label}</div>
      </div>
      <div class="wup-card-body">
        <div class="wup-section"><strong>Priorytety wojewódzkie:</strong>${priors}</div>
        <div class="wup-section"><strong>Projekty BUR:</strong>${projektyBur}</div>
        ${w.claudia_note ? `<div class="claudia-note small">
          <span class="claudia-avatar small">C</span>
          <div class="claudia-text">${interpolateLinks(w.claudia_note)}</div>
        </div>` : ''}
      </div>
      <div class="wup-card-footer"><a href="${w.wup_url}" target="_blank" rel="noopener">Strona WUP ↗</a></div>
    </div>`;
  }).join('');
}

function renderProjektBur(p) {
  const status = p.status || 'unknown';
  const veryf = p.do_weryfikacji ? '<span class="warning-badge" title="Do weryfikacji">⚠️</span>' : '';
  const fields = [];
  if (p.kwota_alokacji) fields.push(`<div class="proj-field"><span class="field-label">Kwota:</span> ${formatKwota(p.kwota_alokacji)}</div>`);
  if (p.intensywnosc_max) fields.push(`<div class="proj-field"><span class="field-label">Intensywność:</span> ${p.intensywnosc_max}</div>`);
  if (p.data_start || p.data_end) fields.push(`<div class="proj-field"><span class="field-label">Termin:</span> ${p.data_start || '?'} → ${p.data_end || '?'}</div>`);
  if (p.grupa_docelowa) fields.push(`<div class="proj-field"><span class="field-label">Grupa:</span> ${escapeHtml(p.grupa_docelowa)}</div>`);
  if (p.irin_dopasowane_szkolenia && p.irin_dopasowane_szkolenia.length) {
    const links = p.irin_dopasowane_szkolenia.map(id =>
      `<a class="link-akad" onclick="goToSzkolenia('${id}')">${id}</a>`
    ).join(', ');
    fields.push(`<div class="proj-field"><span class="field-label">IRIN dopasowane:</span> ${links}</div>`);
  }
  const linki = (p.url_regulamin || p.url_wniosek)
    ? `<div class="proj-links">
        ${p.url_regulamin ? `<a href="${p.url_regulamin}" target="_blank" rel="noopener">Regulamin ↗</a>` : ''}
        ${p.url_wniosek ? `<a href="${p.url_wniosek}" target="_blank" rel="noopener">Wniosek ↗</a>` : ''}
       </div>`
    : '';
  const note = p.claudia_note ? `<div class="proj-note">${interpolateLinks(p.claudia_note)}</div>` : '';
  const idBur = p.id_bur ? `<span class="proj-id">${p.id_bur}</span>` : '';

  return `<div class="wup-project">
    <div class="proj-head">
      <span class="project-status status-${status}">${status}</span>
      ${idBur}
      <strong>${escapeHtml(p.nazwa)}</strong>
      ${veryf}
    </div>
    ${fields.length ? `<div class="proj-fields">${fields.join('')}</div>` : ''}
    ${linki}
    ${note}
  </div>`;
}
