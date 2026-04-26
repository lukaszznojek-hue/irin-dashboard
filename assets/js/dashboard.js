/* Dashboard IRIN v4 - modular fetch architecture */

const WOJEWODZTWA_KOLEJNOSC = [
  'swietokrzyskie','pomorskie','zachodniopomorskie','kujawsko-pomorskie',
  'wielkopolskie','slaskie','dolnoslaskie','malopolskie','mazowieckie',
  'lubelskie','lubuskie','lodzkie','opolskie','podkarpackie','podlaskie','warminsko-mazurskie'
];

const VOIVODESHIP_LABELS = {
  'dolnoslaskie':'Dolnośląskie','kujawsko-pomorskie':'Kujawsko-pomorskie',
  'lubelskie':'Lubelskie','lubuskie':'Lubuskie','lodzkie':'Łódzkie',
  'malopolskie':'Małopolskie','mazowieckie':'Mazowieckie','opolskie':'Opolskie',
  'podkarpackie':'Podkarpackie','podlaskie':'Podlaskie','pomorskie':'Pomorskie',
  'slaskie':'Śląskie','swietokrzyskie':'Świętokrzyskie',
  'warminsko-mazurskie':'Warmińsko-mazurskie','wielkopolskie':'Wielkopolskie',
  'zachodniopomorskie':'Zachodniopomorskie'
};

const TIER_LABELS = {'1a':'Pełne dane','1b':'Dane podstawowe','2':'Skeleton'};
const TIER_COLORS = {'1a':'#2D7A3E','1b':'#D17A00','2':'#999'};

let DASHBOARD_DATA = { powiaty: [], meta: {}, slownik: [], szkolenia: {}, propozycje: [], matryca: {}, trendy: {}, parp: {}, wup: {} };
let activeFilters = { status: 'all', pillar: null, voivodeships: new Set() };

// ===== INIT =====
async function init() {
  try {
    const [meta, slownik, parp, trendy, szkolenia, propozycje, matryca, ...wojResults] = await Promise.all([
      fetchJson('./data/meta.json'),
      fetchJson('./data/slownik.json'),
      fetchJson('./data/parp_priorytety.json'),
      fetchJson('./data/trendy.json'),
      fetchJson('./data/szkolenia_irin.json'),
      fetchJson('./data/szkolenia_propozycje.json'),
      fetchJson('./data/matryca.json'),
      ...WOJEWODZTWA_KOLEJNOSC.map(s => fetchJson(`./data/powiaty/${s}.json`))
    ]);

    DASHBOARD_DATA.meta = meta;
    DASHBOARD_DATA.slownik = slownik;
    DASHBOARD_DATA.parp = parp;
    DASHBOARD_DATA.trendy = trendy;
    DASHBOARD_DATA.szkolenia = szkolenia;
    DASHBOARD_DATA.propozycje = propozycje;
    DASHBOARD_DATA.matryca = matryca;
    DASHBOARD_DATA.powiaty = wojResults.flatMap(w => w ? w.powiaty || [] : []);

    // Load WUP data
    const wupResults = await Promise.all(
      WOJEWODZTWA_KOLEJNOSC.map(s => fetchJson(`./data/wup/${s}.json`))
    );
    DASHBOARD_DATA.wup = {};
    wupResults.forEach((w, i) => { if (w) DASHBOARD_DATA.wup[WOJEWODZTWA_KOLEJNOSC[i]] = w; });

    renderAll();
    recalculateDates();
    updateStats();
    applySortPreset('urgency');
    applyTabFromHash();
    updateFooter();

  } catch (e) {
    console.error('Init error:', e);
    document.getElementById('cards-grid').innerHTML = '<div class="error-msg">Błąd ładowania danych. Sprawdź czy pliki JSON są dostępne.</div>';
  }
}

async function fetchJson(url) {
  try {
    const r = await fetch(url);
    return r.ok ? r.json() : null;
  } catch { return null; }
}

// ===== RENDER ALL =====
function renderAll() {
  renderCards();
  renderVoivodeshipChips();
  renderWupGrid();
  renderBURTable();
  renderProposals();
  renderMatryca();
  renderTrendy();
  renderSlownik();
  renderSalesLinks();
}

// ===== CARDS (POWIATY) =====
function renderCards() {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;
  grid.innerHTML = DASHBOARD_DATA.powiaty.map(renderCard).join('');
}

function renderCard(card) {
  const urgencyClass = card.urgency || 'nieznany';
  const tierBadge = card.voivodeship ? `<span class="tier-badge" style="background:${TIER_COLORS[getTier(card.voivodeship)] || '#999'}">${TIER_LABELS[getTier(card.voivodeship)] || 'Skeleton'}</span>` : '';
  const irinStar = card.irin_match ? '<span class="irin-star" title="Dopasowanie do oferty IRIN">★</span>' : '';
  const warningBadge = card.has_warning ? '<span class="warning-badge" title="Dane niezweryfikowane">⚠️</span>' : '';
  const pillarTags = (card.pillars || []).map(p => `<span class="pillar-tag ${p.toLowerCase().replace('+','plus')}">${p}</span>`).join('');
  const kwota = card.amount_kfs ? formatKwota(card.amount_kfs) : '';
  const statusBadge = `<span class="status-badge ${urgencyClass}">${formatUrgencyLabel(card)}</span>`;

  return `<div class="card ${urgencyClass}" data-voivodeship="${card.voivodeship}" data-urgency="${card.urgency}" data-pillars="${(card.pillars||[]).join(',')}" data-amount="${card.amount_kfs||0}" data-irin="${card.irin_match||0}" data-name="${card.name}">
    <div class="card-head" onclick="toggleCard(this)">
      <div class="card-head-left">
        <span class="card-title">${card.display_name}</span>
        <span class="card-meta">${card.display_meta || ''}</span>
        ${tierBadge}${irinStar}${warningBadge}
      </div>
      <div class="card-head-right">
        ${pillarTags}
        ${kwota ? `<span class="card-kwota">${kwota}</span>` : ''}
        ${statusBadge}
        <span class="card-chevron">▸</span>
      </div>
    </div>
    <div class="card-body">
      ${renderPillarDetails(card)}
      ${card.claudia_note ? `<div class="claudia-note"><span class="claudia-avatar">C</span><div class="claudia-text">${card.claudia_note}</div></div>` : ''}
      ${card.url_pup ? `<div class="card-links"><a href="${card.url_pup}" target="_blank" rel="noopener">Strona PUP ↗</a></div>` : ''}
    </div>
  </div>`;
}

function renderPillarDetails(card) {
  if (!card.pillar_details || !card.pillar_details.length) return '<div class="no-data">Brak szczegółowych danych. Do weryfikacji przez zespół.</div>';
  return card.pillar_details.map(p => {
    const typeClass = p.type ? p.type.toLowerCase().replace('+','plus') : 'other';
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
    if (p.raw_content) {
      fieldsHtml += `<div class="pillar-raw">${p.raw_content}</div>`;
    }
    return `<div class="pillar-detail ${typeClass}"><div class="pillar-title">${p.type ? `<span class="pillar-type-tag ${typeClass}">${p.type}</span>` : ''} ${p.title}</div>${fieldsHtml}</div>`;
  }).join('');
}

// ===== VOIVODESHIP CHIPS =====
function renderVoivodeshipChips() {
  const panel = document.getElementById('woj-dropdown-panel');
  if (!panel) return;
  const voivs = [...new Set(DASHBOARD_DATA.powiaty.map(p => p.voivodeship))].sort();
  panel.innerHTML = voivs.map(v => `<label class="woj-checkbox-label"><input type="checkbox" class="woj-checkbox" value="${v}" checked onchange="onWojCheckboxChange()"> ${VOIVODESHIP_LABELS[v] || v}</label>`).join('');
  voivs.forEach(v => activeFilters.voivodeships.add(v));
}

function toggleWojDropdown(e) {
  e && e.stopPropagation();
  document.getElementById('woj-dropdown-panel').classList.toggle('open');
}

function onWojCheckboxChange() {
  activeFilters.voivodeships.clear();
  document.querySelectorAll('.woj-checkbox:checked').forEach(cb => activeFilters.voivodeships.add(cb.value));
  const badge = document.getElementById('woj-dropdown-badge');
  const total = document.querySelectorAll('.woj-checkbox').length;
  const checked = activeFilters.voivodeships.size;
  if (checked < total) { badge.textContent = checked; badge.style.display = ''; }
  else { badge.style.display = 'none'; }
  applyFilters();
}

function selectAllVoivodeships() {
  document.querySelectorAll('.woj-checkbox').forEach(cb => { cb.checked = true; });
  onWojCheckboxChange();
}

// ===== FILTERS =====
function toggleFilter(el) {
  const filterType = el.dataset.filter;
  const value = el.dataset.value;
  if (filterType === 'status') {
    document.querySelectorAll(`[data-filter="status"]`).forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    activeFilters.status = value;
  } else if (filterType === 'pillar') {
    if (el.classList.contains('active')) { el.classList.remove('active'); activeFilters.pillar = null; }
    else { document.querySelectorAll(`[data-filter="pillar"]`).forEach(c => c.classList.remove('active')); el.classList.add('active'); activeFilters.pillar = value; }
  }
  applyFilters();
}

function applyFilters() {
  const cards = document.querySelectorAll('#cards-grid .card');
  let visible = 0;
  cards.forEach(card => {
    let show = true;
    if (activeFilters.status !== 'all' && card.dataset.urgency !== activeFilters.status) show = false;
    if (activeFilters.pillar && !(card.dataset.pillars || '').includes(activeFilters.pillar)) show = false;
    if (!activeFilters.voivodeships.has(card.dataset.voivodeship)) show = false;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  const rc = document.getElementById('results-count');
  if (rc) rc.textContent = `Widocznych: ${visible} z ${cards.length}`;
}

// ===== SORT =====
function applySortPreset(preset) {
  const cards = [...document.querySelectorAll('#cards-grid .card')];
  const grid = document.getElementById('cards-grid');
  cards.sort((a, b) => {
    if (preset === 'urgency') return urgencyOrder(a) - urgencyOrder(b);
    if (preset === 'amount') return (parseInt(b.dataset.amount) || 0) - (parseInt(a.dataset.amount) || 0);
    if (preset === 'irin') return (parseInt(b.dataset.irin) || 0) - (parseInt(a.dataset.irin) || 0) || urgencyOrder(a) - urgencyOrder(b);
    if (preset === 'geo') return (a.dataset.voivodeship + a.dataset.name).localeCompare(b.dataset.voivodeship + b.dataset.name);
    return 0;
  });
  cards.forEach(c => grid.appendChild(c));
}

function urgencyOrder(card) {
  const map = { krytyczny: 0, pilny: 1, trwa: 2, nadchodzi: 3, nieznany: 4, zakonczony: 5 };
  return map[card.dataset.urgency] ?? 4;
}

// ===== TABS =====
function switchTab(el, tabId) {
  document.querySelectorAll('.nav-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
  el.classList.add('active');
  el.setAttribute('aria-selected', 'true');
  document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
  const panel = document.getElementById('panel-' + tabId);
  if (panel) panel.style.display = '';
  history.replaceState(null, '', '#' + tabId);
}

function applyTabFromHash() {
  const hash = location.hash.replace('#', '');
  if (hash) {
    const tab = document.querySelector(`.nav-tab[data-panel="${hash}"]`);
    if (tab) switchTab(tab, hash);
  }
}

function toggleCard(el) {
  el.parentElement.classList.toggle('expanded');
}

// ===== DATE RECALCULATION =====
function recalculateDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  document.querySelectorAll('#cards-grid .card').forEach(cardEl => {
    const idx = [...document.querySelectorAll('#cards-grid .card')].indexOf(cardEl);
    const card = DASHBOARD_DATA.powiaty[idx];
    if (!card) return;
    const result = processCardUrgency(card, today);
    cardEl.dataset.urgency = result.urgency;
    cardEl.className = cardEl.className.replace(/\b(krytyczny|pilny|trwa|nadchodzi|zakonczony|nieznany)\b/g, '') + ' ' + result.urgency;
    const badge = cardEl.querySelector('.status-badge');
    if (badge) { badge.className = 'status-badge ' + result.urgency; badge.textContent = result.label; }
  });
  updateStats();
}

function processCardUrgency(card, today) {
  if (!card.kfs_start_date && !card.kfs_end_date) return { urgency: card.urgency || 'nieznany', label: formatUrgencyLabel(card) };
  const start = card.kfs_start_date ? new Date(card.kfs_start_date) : null;
  const end = card.kfs_end_date ? new Date(card.kfs_end_date) : null;
  if (end && today > end) return { urgency: 'zakonczony', label: `Zakończony ${fmtDateShort(end)}` };
  if (start && today < start) {
    const days = Math.ceil((start - today) / 86400000);
    return { urgency: 'nadchodzi', label: `Za ${days} dni` };
  }
  if (start && end && today >= start && today <= end) {
    const days = Math.ceil((end - today) / 86400000);
    if (days <= 1) return { urgency: 'krytyczny', label: 'KOŃCZY SIĘ DZIŚ' };
    if (days <= 3) return { urgency: 'krytyczny', label: `Kończy się za ${days} dni` };
    if (days <= 7) return { urgency: 'pilny', label: `${days} dni do końca` };
    return { urgency: 'trwa', label: `Trwa (${days} dni)` };
  }
  return { urgency: card.urgency || 'nieznany', label: formatUrgencyLabel(card) };
}

function formatUrgencyLabel(card) {
  const map = { krytyczny:'KRYTYCZNE', pilny:'Pilne', trwa:'Trwa', nadchodzi:'Nadchodzi', zakonczony:'Zakończony', nieznany:'Brak danych' };
  return map[card.urgency] || card.kfs_status || 'Brak danych';
}

// ===== STATS =====
function updateStats() {
  const cards = document.querySelectorAll('#cards-grid .card');
  let total = cards.length, active = 0, urgent = 0, critical = 0;
  cards.forEach(c => {
    const u = c.dataset.urgency;
    if (u === 'trwa' || u === 'pilny' || u === 'krytyczny') active++;
    if (u === 'pilny') urgent++;
    if (u === 'krytyczny') critical++;
  });
  setText('stat-total', total);
  setText('stat-active', active);
  setText('stat-urgent', urgent);
  setText('stat-critical', critical);
}

// ===== WUP GRID =====
function renderWupGrid() {
  const grid = document.getElementById('wup-grid');
  if (!grid) return;
  grid.innerHTML = WOJEWODZTWA_KOLEJNOSC.map(slug => {
    const w = DASHBOARD_DATA.wup[slug];
    if (!w) return '';
    const priors = (w.priorytety_wojewodzkie || []).map(p => `<div class="wup-priority"><strong>${p.kod}:</strong> ${p.nazwa}</div>`).join('');
    const projects = (w.projekty_bur || []).map(p => `<div class="wup-project"><span class="project-status ${p.status}">${p.status}</span> ${p.nazwa}</div>`).join('');
    const tierColor = TIER_COLORS[w.tier] || '#999';
    return `<div class="wup-card">
      <div class="wup-card-header">
        <div class="wup-title">${w.operator_bur} <span class="tier-badge" style="background:${tierColor}">${TIER_LABELS[w.tier] || ''}</span></div>
        <div class="wup-voiv">${w.wojewodztwo_label}</div>
      </div>
      <div class="wup-card-body">
        <div class="wup-section"><strong>Priorytety wojewódzkie:</strong>${priors || '<div class="no-data">Do weryfikacji</div>'}</div>
        ${projects ? `<div class="wup-section"><strong>Projekty BUR:</strong>${projects}</div>` : ''}
        ${w.claudia_note ? `<div class="claudia-note small"><span class="claudia-avatar small">C</span><div class="claudia-text">${w.claudia_note}</div></div>` : ''}
      </div>
      <div class="wup-card-footer"><a href="${w.wup_url}" target="_blank" rel="noopener">Strona WUP ↗</a></div>
    </div>`;
  }).join('');
}

// ===== SZKOLENIA BUR TABLE =====
function renderBURTable() {
  const tbody = document.getElementById('irin-tbody');
  if (!tbody || !DASHBOARD_DATA.szkolenia?.uslugi) return;
  const d = DASHBOARD_DATA.szkolenia;
  setText('irin-date', d.data_fetch_bur);
  setText('irin-rating', d.ocena_dostawcy + '/5');
  setText('irin-reviews', d.liczba_ocen);

  tbody.innerHTML = d.uslugi.map(u => {
    const katClass = u.kategoria || '';
    const tierBadge = `<span class="tier-irin tier-${u.tier_priorytetu_irin}">T${u.tier_priorytetu_irin}</span>`;
    const priors = (u.powiazane_priorytety || []).map(p => `<span class="prior-tag">${p}</span>`).join(' ');
    return `<tr class="bur-row" data-kat="${u.kategoria}">
      <td><div class="bur-title">${u.tytul}</div><div class="bur-id">ID: ${u.id_bur}</div></td>
      <td><span class="irin-cat ${katClass}">${katLabel(u.kategoria)}</span></td>
      <td class="amount">${formatKwota(u.cena_brutto)}</td>
      <td>${u.cena_h} zł/h</td>
      <td>${u.godziny}h</td>
      <td>${u.forma}${u.miasto ? '<br>' + u.miasto : ''}</td>
      <td>${u.data_start ? fmtDateShort(new Date(u.data_start)) + ' – ' + fmtDateShort(new Date(u.data_end)) : '—'}</td>
      <td>${tierBadge}</td>
      <td>${priors}</td>
    </tr>`;
  }).join('');
}

function toggleBurFilter(el) {
  const group = el.dataset.burFilter;
  const val = el.dataset.val;
  document.querySelectorAll(`[data-bur-filter="${group}"]`).forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.bur-row').forEach(row => {
    if (val === 'all') { row.style.display = ''; return; }
    row.style.display = row.dataset.kat === val ? '' : 'none';
  });
}

// ===== PROPOSALS =====
function renderProposals() {
  const grid = document.getElementById('proposals-grid');
  if (!grid || !DASHBOARD_DATA.propozycje?.propozycje) return;
  grid.innerHTML = DASHBOARD_DATA.propozycje.propozycje.map(p => `
    <div class="proposal-card">
      <div class="proposal-title">${p.tytul}</div>
      <div class="proposal-meta">${p.forma} · ~${p.estymowane_godziny}h · ~${formatKwota(p.estymowana_cena)}</div>
      <div class="proposal-reason">${p.uzasadnienie}</div>
      <div class="proposal-tags">${(p.powiazane_priorytety||[]).map(pr => `<span class="prior-tag">${pr}</span>`).join(' ')} <span class="urgency-tag ${p.pilnosc === 'wysoka' ? 'high' : p.pilnosc === 'średnia' ? 'med' : 'low'}">${p.pilnosc}</span></div>
    </div>
  `).join('');
}

// ===== MATRYCA =====
function renderMatryca() {
  const tbody = document.getElementById('matryca-tbody');
  if (!tbody || !DASHBOARD_DATA.matryca?.wojewodztwa) return;
  tbody.innerHTML = DASHBOARD_DATA.matryca.wojewodztwa.map(w => {
    const cells = ['bur','kfs','efs','doradztwo','elearning'].map(k => {
      const v = w.oceny[k];
      const icon = v === 'high' ? '★' : v === 'med' ? '◐' : v === 'low' ? '○' : '—';
      return `<td class="mat-cell ${v}">${icon}</td>`;
    }).join('');
    const tierColor = TIER_COLORS[getTier(w.wojewodztwo)] || '#999';
    return `<tr title="${w.uzasadnienie}">
      <td><strong>${VOIVODESHIP_LABELS[w.wojewodztwo] || w.wojewodztwo}</strong></td>
      <td><span class="tier-badge small" style="background:${tierColor}">${getTier(w.wojewodztwo).toUpperCase()}</span></td>
      ${cells}
      <td><span class="mat-wynik ${w.wynik}">${w.wynik}</span></td>
    </tr>`;
  }).join('');
}

// ===== TRENDY =====
function renderTrendy() {
  const el = document.getElementById('trendy-content');
  if (!el || !DASHBOARD_DATA.trendy?.kategorie) return;
  el.innerHTML = DASHBOARD_DATA.trendy.kategorie.map(kat => `
    <div class="trendy-category">
      <h3 class="trendy-cat-title">${kat.nazwa} <span class="trendy-heat">${'🔥'.repeat(kat.intensywnosc_popytu || 0)}</span></h3>
      ${kat.opis_ogolny ? `<p class="trendy-desc">${kat.opis_ogolny}</p>` : ''}
      <div class="trendy-items">${(kat.elementy||[]).map(e => `
        <div class="trendy-item ${e.luka_oferty ? 'has-gap' : ''}">
          <div class="trendy-item-title">${e.nazwa}</div>
          <div class="trendy-item-desc">${e.opis || ''}</div>
          <div class="trendy-item-meta">
            ${e.popyt ? `<span class="trendy-popyt">Popyt: ${e.popyt}</span>` : ''}
            ${e.irin_obecnie_oferuje === true ? '<span class="trendy-irin-yes">IRIN oferuje ✓</span>' : e.irin_obecnie_oferuje === false ? '<span class="trendy-irin-no">IRIN nie oferuje ✗</span>' : `<span class="trendy-irin-partial">Częściowo</span>`}
            ${e.luka_oferty ? '<span class="trendy-gap">LUKA OFERTY</span>' : ''}
          </div>
          ${e.rekomendacja ? `<div class="trendy-reco">→ ${e.rekomendacja}</div>` : ''}
        </div>
      `).join('')}</div>
    </div>
  `).join('');
}

// ===== SŁOWNIK =====
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
      <div class="slownik-body"><div class="slownik-body-inner">${t.pelny_opis_html}${t.uwagi_2026 ? `<div class="slownik-uwaga-2026"><strong>Nowości 2026:</strong> ${t.uwagi_2026}</div>` : ''}</div></div>
    </div>
  `).join('');
}

// ===== SALES LINKS =====
function renderSalesLinks() {
  const skrypty = [
    {title:'Cold call', file:'sales/skrypty/01_cold_call.md', desc:'Pierwszy kontakt z firmą - 3 warianty otwarcia, 5 obiekcji+odpowiedzi'},
    {title:'Follow-up', file:'sales/skrypty/02_follow_up.md', desc:'Po cold call bez decyzji'},
    {title:'Sprzedaż szkolenia', file:'sales/skrypty/03_sprzedaz_szkolenia.md', desc:'Prezentacja konkretnego szkolenia: potrzeba → dofinansowanie → szkolenie'},
    {title:'Obiekcje', file:'sales/skrypty/04_obiekcje.md', desc:'15 obiekcji + odpowiedzi'},
    {title:'Zamykanie', file:'sales/skrypty/05_zamykanie.md', desc:'5 technik zamykania'},
    {title:'After-sale', file:'sales/skrypty/06_after_sale.md', desc:'Po podpisaniu: referral, upsell, NPS'}
  ];
  const emaile = [
    {title:'HR manager', file:'sales/emaile/01_hr_manager.md', desc:'Profesjonalny, ROI HR, retencja'},
    {title:'Prezes mikrofirmy', file:'sales/emaile/02_prezes_mikrofirmy.md', desc:'Krótko, korzyść finansowa, 90% dofinansowania'},
    {title:'Dyrektor rozwoju', file:'sales/emaile/03_dyrektor_rozwoju.md', desc:'Kompetencje strategiczne, certyfikaty'},
    {title:'Spec. dofinansowań', file:'sales/emaile/04_specjalista_dofinansowan.md', desc:'Numery projektów, intensywność, terminy'},
    {title:'Księgowa', file:'sales/emaile/05_ksiegowa.md', desc:'Aspekty rozliczeniowe, koszt kwalifikowany'},
    {title:'Cold outreach', file:'sales/emaile/06_cold_outreach.md', desc:'Hook: priorytet PARP w branży klienta'},
    {title:'Follow-up po rozmowie', file:'sales/emaile/07_follow_up_po_rozmowie.md', desc:'Personalizowane, kalendarz, materiały'},
    {title:'Oferta szkolenia', file:'sales/emaile/08_oferta_konkretne_szkolenie.md', desc:'Z załącznikami: program, harmonogram, link BUR'}
  ];
  const bitrix = [
    {title:'Pola leada', file:'sales/bitrix/pola_lead.md', desc:'Obowiązkowe pola kontaktu w Bitrix'},
    {title:'Pola deala', file:'sales/bitrix/pola_deal.md', desc:'Specyfikacja pól transakcji'},
    {title:'Workflow', file:'sales/bitrix/workflow.md', desc:'Przepływ statusów lead→deal→realizacja'}
  ];

  renderSalesSection('sales-skrypty', skrypty);
  renderSalesSection('sales-emaile', emaile);
  renderSalesSection('sales-bitrix', bitrix);

  const prezGrid = document.getElementById('sales-prezentacje');
  if (prezGrid) {
    prezGrid.innerHTML = `<div class="sales-card"><div class="sales-card-title">Prezentacja IRIN ogólna</div><div class="sales-card-desc">12-15 slajdów: oferta, dofinansowania, ROI, zespół</div><div class="sales-card-links"><a href="sales/prezentacje/irin_ogolna.pptx" download>PPTX</a> <a href="sales/prezentacje/irin_ogolna.pdf" download>PDF</a></div></div>`;
  }
}

function renderSalesSection(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items.map(i => `<div class="sales-card"><div class="sales-card-title">${i.title}</div><div class="sales-card-desc">${i.desc}</div><div class="sales-card-links"><a href="${i.file}" target="_blank">Otwórz ↗</a></div></div>`).join('');
}

// ===== FOOTER =====
function updateFooter() {
  const m = DASHBOARD_DATA.meta;
  if (!m) return;
  setText('footer-version', `Dashboard IRIN v${m.wersja || '4.0.0'}`);
  setText('footer-date', `Aktualizacja: ${m.data_aktualizacji || '—'}`);
  setText('header-meta', `v${m.wersja || '4.0.0'} · Aktualizacja: ${m.data_aktualizacji || '—'}`);
}

// ===== UTILS =====
function formatKwota(num) {
  if (!num || num === 0) return '';
  return num.toLocaleString('pl-PL') + ' zł';
}

function fmtDateShort(d) {
  if (!d || isNaN(d)) return '—';
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function katLabel(k) {
  const m = { ai: 'AI / Cyfrowe', edukacja: 'Edukacja spec.', biznes: 'Biznes', soft_skills: 'Soft skills' };
  return m[k] || k || '—';
}

function getTier(voiv) {
  const m = DASHBOARD_DATA.meta?.tier_pokrycia;
  if (!m) return '2';
  if (m.tier_1a?.includes(voiv)) return '1a';
  if (m.tier_1b?.includes(voiv)) return '1b';
  return '2';
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// Close dropdown on outside click
document.addEventListener('click', e => {
  const panel = document.getElementById('woj-dropdown-panel');
  const wrap = document.getElementById('woj-dropdown-wrap');
  if (panel && wrap && !wrap.contains(e.target)) panel.classList.remove('open');
});

// ===== START =====
document.addEventListener('DOMContentLoaded', init);
