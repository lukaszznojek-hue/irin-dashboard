/* powiaty.js - render kart pogrupowanych po wojewodztwie + rollup */

function renderCards() {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;
  const grouped = groupByVoivodeship(DASHBOARD_DATA.powiaty);
  grid.innerHTML = WOJEWODZTWA_KOLEJNOSC
    .filter(slug => (grouped[slug] || []).length > 0)
    .map(slug => renderVoivodeshipGroup(slug, grouped[slug]))
    .join('');
  // Po renderze - sort wewnatrz grup
  if (typeof applySortPreset === 'function') applySortPreset('urgency');
}

function groupByVoivodeship(powiaty) {
  return powiaty.reduce((acc, p) => {
    (acc[p.voivodeship] = acc[p.voivodeship] || []).push(p);
    return acc;
  }, {});
}

function renderVoivodeshipGroup(slug, urzedy) {
  const rollup = computeRollup(urzedy);
  const wup = DASHBOARD_DATA.wup[slug] || {};
  const akcjaTyg = wup.akcja_tygodnia;
  const wynikMatryca = getMatrycaWynik(slug);
  const tier = getTier(slug);

  return `
    <div class="woj-group collapsed" data-woj="${slug}">
      <div class="woj-header" onclick="toggleVoivodeshipGroup(this)">
        <span class="woj-chevron">▾</span>
        <span class="woj-nazwa">${VOIVODESHIP_LABELS[slug] || slug}</span>
        <span class="tier-badge tier-${tier}" style="background:${TIER_COLORS[tier]}">${TIER_LABELS[tier]}</span>
        ${wynikMatryca ? `<span class="matryca-wynik wynik-${wynikMatryca}">${wynikMatryca}</span>` : ''}
        <span class="woj-rollup">
          <span class="rollup-stat aktywny" title="Aktywne nabory">${rollup.aktywny}</span>
          <span class="rollup-stat monitor" title="Monitorowane">${rollup.monitor}</span>
          <span class="rollup-stat zadzwon" title="Do dzwonienia">${rollup.zadzwon}</span>
          <span class="rollup-stat zakonczony" title="Zakonczone">${rollup.zakonczony}</span>
          ${rollup.laczna_kwota > 0 ? `<span class="rollup-kwota">${formatKwota(rollup.laczna_kwota)}</span>` : ''}
        </span>
      </div>
      ${akcjaTyg ? `
        <div class="woj-akcja-tygodnia" onclick="handleAkcjaTygodniaClick('${slug}')">
          <span class="akcja-label">Akcja tygodnia:</span> ${interpolateLinks(akcjaTyg)}
        </div>` : ''}
      <div class="woj-body">
        ${urzedy.map(renderCard).join('')}
      </div>
    </div>`;
}

function computeRollup(urzedy) {
  const r = { aktywny: 0, monitor: 0, zadzwon: 0, zakonczony: 0, laczna_kwota: 0 };
  urzedy.forEach(u => {
    const a = mapUrgencyToAkcja(u);
    r[a] = (r[a] || 0) + 1;
    if (u.amount_kfs && u.amount_kfs > 0) r.laczna_kwota += u.amount_kfs;
  });
  return r;
}

function getMatrycaWynik(slug) {
  const m = DASHBOARD_DATA.matryca?.wojewodztwa;
  if (!m) return null;
  const rec = m.find(w => w.wojewodztwo === slug);
  return rec ? rec.wynik : null;
}

function renderCard(card) {
  const akcja = mapUrgencyToAkcja(card);
  const irinStar = card.irin_match ? '<span class="irin-star" title="Dopasowanie do oferty IRIN">★</span>' : '';
  const pillarTags = (card.pillars || [])
    .map(p => `<span class="pillar-tag ${p.toLowerCase().replace('+','plus')}">${p}</span>`)
    .join('');
  const kwota = card.amount_kfs > 0
    ? `<span class="card-kwota">${formatKwota(card.amount_kfs)}</span>`
    : (card.amount_kfs === 0 ? '<span class="brak-danych">brak danych</span>' : '');
  const dataKontekst = renderDateContext(card, akcja);
  const akcjaBadge = renderAkcjaBadge(akcja);
  const tier = getTier(card.voivodeship);
  const updated = card.data_aktualizacji || '';
  const priors = (card.priorytety || []).join(',');

  return `<div class="card akcja-${akcja}"
              data-voivodeship="${card.voivodeship}"
              data-akcja="${akcja}"
              data-pillars="${(card.pillars||[]).join(',')}"
              data-amount="${card.amount_kfs||0}"
              data-irin="${card.irin_match||0}"
              data-name="${escapeAttr(card.name)}"
              data-tier="${tier}"
              data-priorytety="${priors}"
              data-updated="${updated}">
    <div class="card-head" onclick="toggleCard(this)">
      <div class="card-col-chevron">▸</div>
      <div class="card-col-nazwa">
        <div class="card-title">${card.display_name || card.name}</div>
        <div class="card-meta">${card.display_meta || ''} ${irinStar}</div>
      </div>
      <div class="card-col-pillar">${pillarTags}</div>
      <div class="card-col-kwota">${kwota}</div>
      <div class="card-col-data">${dataKontekst}</div>
      <div class="card-col-akcja">${akcjaBadge}</div>
    </div>
    <div class="card-body">
      ${renderPillarDetails(card)}
      ${(card.priorytety && card.priorytety.length) ? `<div class="card-priorytety"><strong>Priorytety PARP:</strong> ${card.priorytety.map(p => `<span class="prior-tag">${p}</span>`).join(' ')}</div>` : ''}
      ${card.akcja_status_uzasadnienie ? `<div class="akcja-uzasadnienie"><strong>Status:</strong> ${escapeHtml(card.akcja_status_uzasadnienie)}</div>` : ''}
      ${card.claudia_note ? `<div class="claudia-note">
        <span class="claudia-avatar">C</span>
        <div class="claudia-text">${interpolateLinks(card.claudia_note)}</div>
      </div>` : ''}
      ${(card.telefon || card.email) ? `<div class="card-contact">
        ${card.telefon ? `<span class="contact-item">📞 <a href="tel:${card.telefon}">${card.telefon}</a></span>` : ''}
        ${card.email ? `<span class="contact-item">✉️ <a href="mailto:${card.email}">${card.email}</a></span>` : ''}
      </div>` : ''}
      ${card.url_pup ? `<div class="card-links">
        <a href="${card.url_pup}" target="_blank" rel="noopener">Strona PUP ↗</a>
        <a href="${card.url_pup}/urzad/kfs/" target="_blank" rel="noopener">Nabory KFS / regulaminy ↗</a>
        <a href="${card.url_pup}/urzad/dokumenty-do-pobrania/" target="_blank" rel="noopener">Dokumenty do pobrania ↗</a>
      </div>` : ''}
    </div>
  </div>`;
}

function renderAkcjaBadge(akcja) {
  return `<span class="akcja-badge akcja-badge-${akcja}">${AKCJA_LABELS[akcja] || '?'}</span>`;
}

function renderDateContext(card, akcja) {
  const today = new Date(); today.setHours(0,0,0,0);
  if (akcja === 'aktywny' && card.kfs_end_date) {
    const days = Math.ceil((new Date(card.kfs_end_date) - today) / 86400000);
    if (days <= 0) return `<span class="data-ctx krytyczna">koniec dziś</span>`;
    if (days <= 7) return `<span class="data-ctx krytyczna">do końca ${days}d</span>`;
    return `<span class="data-ctx">do końca ${days}d</span>`;
  }
  if (akcja === 'monitor' && card.kfs_start_date) {
    const days = Math.ceil((new Date(card.kfs_start_date) - today) / 86400000);
    return `<span class="data-ctx">start za ${days}d</span>`;
  }
  if (akcja === 'zakonczony' && card.kfs_end_date) {
    return `<span class="data-ctx">do ${fmtDateDDMM(card.kfs_end_date)}</span>`;
  }
  if (akcja === 'zadzwon') {
    return `<span class="data-ctx zadzwon">brak danych</span>`;
  }
  return '';
}

function renderPillarDetails(card) {
  if (!card.pillar_details || !card.pillar_details.length) {
    return '<div class="no-data">Brak szczegółowych danych. Do weryfikacji przez zespół.</div>';
  }
  return card.pillar_details.map(p => {
    const typeClass = p.type ? p.type.toLowerCase().replace('+', 'plus') : 'other';
    let fieldsHtml = '';
    if (p.fields && Object.keys(p.fields).length) {
      fieldsHtml = Object.entries(p.fields)
        .filter(([k]) => !k.endsWith('_irin_star'))
        .map(([k, v]) => {
          const star = p.fields[k + '_irin_star'] ? ' <span class="irin-star">★</span>' : '';
          const amtClass = (k === 'Kwota' || k === 'Alokacja') ? ' amount' : '';
          return `<div class="pillar-field${amtClass}"><span class="field-label">${k}:</span> <strong>${v}</strong>${star}</div>`;
        }).join('');
    }
    if (p.raw_content) fieldsHtml += `<div class="pillar-raw">${p.raw_content}</div>`;
    return `<div class="pillar-detail ${typeClass}">
      <div class="pillar-title">${p.type ? `<span class="pillar-type-tag ${typeClass}">${p.type}</span>` : ''} ${p.title}</div>
      ${fieldsHtml}
    </div>`;
  }).join('');
}

function toggleVoivodeshipGroup(el) {
  el.parentElement.classList.toggle('collapsed');
}

function handleAkcjaTygodniaClick(slug) {
  const wup = DASHBOARD_DATA.wup[slug];
  const target = wup?.akcja_tygodnia_target;
  if (!target) return;
  const [tWoj, tName] = target.split('/');
  const grp = document.querySelector(`.woj-group[data-woj="${tWoj}"]`);
  if (!grp) return;
  grp.classList.remove('collapsed');
  const card = grp.querySelector(`.card[data-name="${tName}"]`);
  if (card) {
    card.classList.add('expanded', 'highlight');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => card.classList.remove('highlight'), 2000);
  }
}
