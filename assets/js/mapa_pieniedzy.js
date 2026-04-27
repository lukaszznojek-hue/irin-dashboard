/* mapa_pieniedzy.js - Mapa pieniedzy KFS+BUR 2026
   Heatmap wojewodztw (inline SVG, kolorowanie wg amount_kfs)
   + tabela TOP-20 powiatow z scorem sprzedazowym
   + drill-down per wojewodztwo */

// Geograficzne polozenie wojewodztw na uproszczonej mapie Polski (siatka 5x4)
// {slug: {x, y, label}} - x,y w siatce, label do wyswietlenia
const WOJ_POSITIONS = {
  "pomorskie":          {x: 2, y: 0, label: "Pomorskie"},
  "warminsko-mazurskie":{x: 3, y: 0, label: "Warm-Maz"},
  "podlaskie":          {x: 4, y: 0, label: "Podlaskie"},
  "zachodniopomorskie": {x: 1, y: 1, label: "Zach-Pom"},
  "kujawsko-pomorskie": {x: 2, y: 1, label: "Kuj-Pom"},
  "mazowieckie":        {x: 3, y: 1, label: "Mazowieckie"},
  "lubuskie":           {x: 1, y: 2, label: "Lubuskie"},
  "wielkopolskie":      {x: 2, y: 2, label: "Wielkopolskie"},
  "lodzkie":            {x: 3, y: 2, label: "Łódzkie"},
  "lubelskie":          {x: 4, y: 2, label: "Lubelskie"},
  "dolnoslaskie":       {x: 1, y: 3, label: "Dolnośląskie"},
  "opolskie":           {x: 2, y: 3, label: "Opolskie"},
  "swietokrzyskie":     {x: 3, y: 3, label: "Świętokrzyskie"},
  "podkarpackie":       {x: 4, y: 3, label: "Podkarpackie"},
  "slaskie":            {x: 2, y: 4, label: "Śląskie"},
  "malopolskie":        {x: 3, y: 4, label: "Małopolskie"},
};

// Scoring sprzedazowy
function computeSalesScore(powiat) {
  const kwota = powiat.amount_kfs || 0;
  if (kwota === 0) return 0;
  const baseScore = Math.log10(kwota + 1);
  // status mnoznik
  const status = powiat.kfs_status || '';
  let mnStatus = 1.0;
  if (status === 'NADCHODZI') mnStatus = 2.0;
  else if (status === 'TRWA') mnStatus = 1.5;
  else if (status === 'ZAKONCZONY') mnStatus = 0.3;
  // priorytety mnoznik
  const priorytety = powiat.priorytety || [];
  let mnPriorytet = 1.0;
  if (priorytety.includes('P3')) mnPriorytet = Math.max(mnPriorytet, 1.5);
  if (priorytety.includes('P5')) mnPriorytet = Math.max(mnPriorytet, 1.3);
  // irin match mnoznik
  const mnIrin = powiat.irin_match === 1 ? 1.2 : 0.8;
  return baseScore * mnStatus * mnPriorytet * mnIrin;
}

function colorForKwota(kwota, minK, maxK) {
  if (kwota === 0 || !maxK) return '#e5e5e5';
  const t = Math.log10(kwota + 1) / Math.log10(maxK + 1);
  const r = Math.round(255 * (1 - t * 0.28));
  const g = Math.round(245 - t * 220);
  const b = Math.round(184 - t * 156);
  return `rgb(${r},${g},${b})`;
}

function textColorForBg(kwota, minK, maxK) {
  // Dla ciemnych tla (mazowieckie/slaskie/wielkopolskie - top kwoty) -> bialy tekst
  if (kwota === 0 || !maxK) return '#444';
  const t = Math.log10(kwota + 1) / Math.log10(maxK + 1);
  // Powyzej t=0.55 (tj. orange-czerwony) tekst staje sie nieczytelny na ciemnym tle
  return t > 0.55 ? '#fff' : '#222';
}

function fmtKwota(n) {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)} mln zł`;
  if (n >= 1_000) return `${Math.round(n/1_000).toLocaleString('pl-PL')} tys. zł`;
  return `${n.toLocaleString('pl-PL')} zł`;
}

function getWojAlokacjaKfs() {
  // Czyta wszystkie WUP-y i zwraca mape {slug: kwota}
  const out = {};
  if (!DASHBOARD_DATA.wup) return out;
  Object.entries(DASHBOARD_DATA.wup).forEach(([slug, w]) => {
    out[slug] = w.alokacja_kfs_2026_wojewodztwo_pln || 0;
  });
  return out;
}

function renderMapaPieniedzy() {
  const panel = document.getElementById('panel-mapa-pieniedzy');
  if (!panel) return;
  const alokacje = getWojAlokacjaKfs();
  const kwoty = Object.values(alokacje).filter(k => k > 0);
  if (kwoty.length === 0) return;

  const sumaPL = kwoty.reduce((a,b) => a+b, 0);
  const maxK = Math.max(...kwoty);
  const minK = Math.min(...kwoty);
  const sredniaWoj = sumaPL / kwoty.length;
  const topWoj = Object.entries(alokacje).sort((a,b) => b[1]-a[1])[0];
  const powiatyZKwota = (DASHBOARD_DATA.powiaty || []).filter(p => (p.amount_kfs||0) > 0).length;

  // Stats
  setText('mp-suma-pl', fmtKwota(sumaPL));
  setText('mp-top-woj', `${WOJ_POSITIONS[topWoj[0]]?.label || topWoj[0]} (${fmtKwota(topWoj[1])})`);
  setText('mp-srednia-woj', fmtKwota(sredniaWoj));
  setText('mp-pow-z-danymi', `${powiatyZKwota}/${(DASHBOARD_DATA.powiaty||[]).length}`);

  renderZrodlaGrid();
  renderMapaSvg(alokacje, minK, maxK);
  renderRankingBars(alokacje, maxK);
  setupWupWideControls();
  renderTabelaWupWide();
  renderTimelineNaborow();
  renderTopPowiaty(20);
}

function renderRankingBars(alokacje, maxK) {
  const el = document.getElementById('mapa-ranking-bars');
  if (!el) return;
  const sorted = Object.entries(alokacje).sort((a,b) => b[1]-a[1]);
  el.innerHTML = sorted.map(([slug, kwota], i) => {
    const label = WOJ_POSITIONS[slug]?.label || slug;
    const pct = maxK ? (kwota * 100 / maxK) : 0;
    const color = colorForKwota(kwota, Math.min(...Object.values(alokacje).filter(k=>k>0)), maxK);
    return `<div class="rank-row" onclick="onWojClick('${slug}')">
      <span class="rank-pos">${i+1}.</span>
      <span class="rank-label">${label}</span>
      <div class="rank-bar-bg">
        <div class="rank-bar-fill" style="width:${pct}%; background:${color}"></div>
        <span class="rank-kwota">${fmtKwota(kwota)}</span>
      </div>
    </div>`;
  }).join('');
}

function renderZrodlaGrid() {
  const el = document.getElementById('mapa-zrodla-grid');
  if (!el) return;
  const zrodla = DASHBOARD_DATA.trendy?.zrodla_dofinansowania_szkolen_2026?.zrodla || [];
  if (zrodla.length === 0) { el.innerHTML = '<p style="color:#999">Brak danych źródeł.</p>'; return; }
  const sumaTotal = DASHBOARD_DATA.trendy?.zrodla_dofinansowania_szkolen_2026?.suma_dostepna_pl_2026_szac_pln || 0;
  const kluczowe = DASHBOARD_DATA.trendy?.zrodla_dofinansowania_szkolen_2026?.kluczowe_dla_irin || [];
  const ikony = {
    kfs: '🏛️', bur_efs: '🇪🇺', akademia_hr: '👥', efs_pup: '🎫', pfron: '♿', inno_lab: '🌱'
  };
  el.innerHTML = zrodla.map(z => {
    const isKlucz = kluczowe.includes(z.id);
    const kwotaStr = z.kwota_pl_pln
      ? fmtKwota(z.kwota_pl_pln)
      : (z.kwota_pl_pln_szac || '?');
    const statusEmoji = z.status_dla_irin?.includes('GŁÓWNE') ? '⭐⭐⭐'
                      : z.status_dla_irin?.includes('DRUGIE') ? '⭐⭐'
                      : z.status_dla_irin?.includes('TRZECIE') ? '⭐'
                      : '';
    return `<div class="zrodlo-card ${isKlucz ? 'zrodlo-kluczowe' : ''}">
      <div class="zrodlo-header">
        <span class="zrodlo-icon">${ikony[z.id] || '💵'}</span>
        <span class="zrodlo-stars">${statusEmoji}</span>
      </div>
      <div class="zrodlo-nazwa">${z.nazwa}</div>
      <div class="zrodlo-kwota">${kwotaStr}</div>
      <div class="zrodlo-meta">
        <div><strong>Kto:</strong> ${z.beneficjent}</div>
        <div><strong>Operator:</strong> ${z.operator}</div>
        <div><strong>Intensywność:</strong> ${z.intensywnosc}</div>
        <div><strong>BUR wymóg:</strong> ${z.wymog_bur === true ? '✅ TAK' : z.wymog_bur === false ? '❌ NIE' : '⚠️ częściowo'}</div>
      </div>
      <div class="zrodlo-status">${z.status_dla_irin || ''}</div>
    </div>`;
  }).join('') + `<div class="zrodla-suma">💰 SUMA dostępna PL 2026: <strong>${fmtKwota(sumaTotal)}</strong> · 6 źródeł zmapowanych</div>`;
}

// Cache pliku SVG - fetch tylko raz, reuse dla kolejnych re-renderow
let _polandSvgCache = null;
async function loadPolandSvg() {
  if (_polandSvgCache) return _polandSvgCache;
  const r = await fetch('assets/img/poland_voivodeships.svg');
  if (!r.ok) throw new Error(`Failed to load SVG: ${r.status}`);
  _polandSvgCache = await r.text();
  return _polandSvgCache;
}

async function renderMapaSvg(alokacje, minK, maxK) {
  const container = document.getElementById('mapa-svg-container');
  if (!container) return;
  let svgText;
  try {
    svgText = await loadPolandSvg();
  } catch (e) {
    container.innerHTML = `<p class="brak-danych">Nie udalo sie zaladowac mapy: ${e.message}</p>`;
    return;
  }

  // Wstrzyknij SVG, dodaj klase + atrybut role dla a11y
  container.innerHTML = svgText;
  const svg = container.querySelector('svg');
  if (!svg) return;
  svg.classList.add('mapa-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Mapa Polski - alokacja KFS 2026 per wojewodztwo');

  // Pokoloruj kazde wojewodztwo + dodaj tooltip + onclick + etykiety
  Object.entries(WOJ_POSITIONS).forEach(([slug, pos]) => {
    const path = svg.querySelector(`#woj-${slug}`);
    if (!path) return;
    const kwota = alokacje[slug] || 0;
    const color = colorForKwota(kwota, minK, maxK);
    path.setAttribute('fill', color);
    path.setAttribute('class', 'mapa-woj-cell');
    path.style.cursor = 'pointer';
    path.addEventListener('click', () => onWojClick(slug));
    path.setAttribute('tabindex', '0');
    path.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') onWojClick(slug); });
    // Tooltip natywny
    let title = path.querySelector('title');
    if (!title) {
      title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      path.appendChild(title);
    }
    title.textContent = `${pos.label}: ${fmtKwota(kwota)}`;
  });

  // Etykiety kwot na centroidach (nakladka zewnetrzna)
  const oldLabels = svg.querySelector('.mapa-svg-labels');
  if (oldLabels) oldLabels.remove();
  const labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  labelsGroup.setAttribute('class', 'mapa-svg-labels');
  labelsGroup.style.pointerEvents = 'none';
  Object.entries(WOJ_POSITIONS).forEach(([slug, pos]) => {
    const path = svg.querySelector(`#woj-${slug}`);
    if (!path) return;
    // Centroidy zapisane w SVG przy generacji (tools/build_poland_svg.py)
    const cx = parseFloat(path.getAttribute('data-cx')) || 0;
    const cy = parseFloat(path.getAttribute('data-cy')) || 0;
    const kwota = alokacje[slug] || 0;
    const txtColor = textColorForBg(kwota, minK, maxK);
    const shadow = txtColor === '#fff' ? 'paint-order:stroke;stroke:rgba(0,0,0,0.45);stroke-width:2px;' : 'paint-order:stroke;stroke:#fff;stroke-width:2px;';
    const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelText.setAttribute('x', cx);
    labelText.setAttribute('y', cy - 4);
    labelText.setAttribute('text-anchor', 'middle');
    labelText.setAttribute('style', `fill:${txtColor};font-size:14px;font-weight:700;${shadow}`);
    labelText.textContent = pos.label;
    const kwotaText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    kwotaText.setAttribute('x', cx);
    kwotaText.setAttribute('y', cy + 14);
    kwotaText.setAttribute('text-anchor', 'middle');
    kwotaText.setAttribute('style', `fill:${txtColor};font-size:12px;font-weight:600;${shadow}`);
    kwotaText.textContent = fmtKwota(kwota);
    labelsGroup.appendChild(labelText);
    labelsGroup.appendChild(kwotaText);
  });
  svg.appendChild(labelsGroup);
}

function renderTopPowiaty(n) {
  const tbody = document.querySelector('#mapa-top-powiaty tbody');
  if (!tbody) return;
  const powiaty = (DASHBOARD_DATA.powiaty || [])
    .filter(p => (p.amount_kfs||0) > 0)
    .map(p => ({...p, _score: computeSalesScore(p)}))
    .sort((a,b) => b._score - a._score)
    .slice(0, n);

  if (powiaty.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#999;padding:20px">Brak powiatów z wpisaną kwotą KFS. Dograć w v6.5.</td></tr>`;
    setupCsvExport([]);
    return;
  }

  tbody.innerHTML = powiaty.map((p, i) => {
    const wojLabel = WOJ_POSITIONS[p.voivodeship]?.label || p.voivodeship;
    const statusClass = `mapa-status-${(p.kfs_status||'unk').toLowerCase()}`;
    const statusBadge = p.kfs_status ? `<span class="mapa-status-badge ${statusClass}">${p.kfs_status}</span>` : '—';
    return `<tr onclick="onWojClick('${p.voivodeship}')">
      <td><strong>${i+1}</strong></td>
      <td>${p.display_name || p.name}</td>
      <td>${wojLabel}</td>
      <td><strong>${fmtKwota(p.amount_kfs)}</strong></td>
      <td>${statusBadge}</td>
      <td><span class="mapa-score">${p._score.toFixed(1)}</span></td>
    </tr>`;
  }).join('');

  setupCsvExport(powiaty);
}

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes(';')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function eksportCSV(rows) {
  // BOM dla Excela aby polskie znaki sie pokazaly
  const BOM = '﻿';
  const header = ['rank', 'powiat', 'wojewodztwo', 'kwota_kfs_pln', 'status', 'data_start', 'data_end', 'score', 'telefon', 'email', 'url_pup', 'lead_claudia'];
  const lines = [header.join(',')];
  rows.forEach((p, i) => {
    const wojLabel = WOJ_POSITIONS[p.voivodeship]?.label || p.voivodeship;
    lines.push([
      i + 1,
      csvEscape(p.display_name || p.name || ''),
      csvEscape(wojLabel),
      p.amount_kfs || 0,
      csvEscape(p.kfs_status || ''),
      csvEscape(p.kfs_start_date || ''),
      csvEscape(p.kfs_end_date || ''),
      (p._score ?? 0).toFixed(2),
      csvEscape(p.telefon || ''),
      csvEscape(p.email || ''),
      csvEscape(p.url_pup || ''),
      p.claudia_lead ? '1' : '0',
    ].join(','));
  });
  const csv = BOM + lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const today = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `top20_powiaty_${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function setupCsvExport(rows) {
  const btn = document.getElementById('btn-eksport-csv-powiaty');
  if (!btn) return;
  btn.disabled = rows.length === 0;
  btn.onclick = () => eksportCSV(rows);
}

// IRIN portfolio - mapping priorytetow do produktow
const IRIN_PORTFOLIO_MATCH = {
  cyber: { matches: ['PROP-02 NIS2 (gotowy pakiet sprzedazowy)'], keywords: ['cyber', 'kryzys', 'NIS2', 'odpornosc', 'cyfryzacja sieci'] },
  ai: { matches: ['PROP-01 AI Act', 'Social Media AI (id 3432404)', 'Sklep cyfryzacja (id 3432500)', 'Skuteczność osobista + AI (id 3421591)', 'Zarządzanie AI (id 3386476)'], keywords: ['AI', 'sztuczna inteligencja', 'cyfryzacja', 'cyfrow', 'IT', 'digital', 'technolog'] },
  energetyka: { matches: ['Akademia OZE IRIN (rozważyć dograne propozycji)'], keywords: ['energetyka', 'energetycz', 'OZE', 'transformacja energ', 'zielon', 'klimatyczna'] },
  edukacja: { matches: ['SI Kielce (id 3270238)', 'TUS Kielce (id 3379725)', 'SI Gdańsk (id 3420786, 3405199)'], keywords: ['edukacj', 'pedagog', 'szkol', 'nauczyciel', 'wczesnoszk', 'integracj'] },
  hr: { matches: ['PROP-04 Akademia HR z AI (do rejestracji)'], keywords: ['HR', 'kadra', 'rekrutacj', 'zarzadzanie personel', 'mobbing', 'dyskryminacj'] },
  zdrowie: { matches: ['BRAK w portfolio - rozważyć propozycję'], keywords: ['zdrowotn', 'medycyn', 'opiekun'] },
  cudzoziemcy: { matches: ['BRAK w portfolio - LUKA strategiczna'], keywords: ['cudzoziem', 'migrant', 'integracj migrant'] },
  finanse: { matches: ['PROP-13 AI w księgowości (do rejestracji)'], keywords: ['ksiegow', 'finans', 'CFO', 'controlling'] },
  senior: { matches: ['Skuteczność osobista (id 3421591)'], keywords: ['45+', '50+', 'przedemerytalna', 'starsi', 'aktywnosc zawodow'] },
  deficytowe: { matches: ['Portfolio podstawowe (10 aktywnych)'], keywords: ['zawody deficytow', 'kompetencje deficytow'] }
};

function computeIrinMatch(wupData) {
  const matches = [];
  const luki = [];
  (wupData.priorytety_wojewodzkie || []).forEach(p => {
    const text = `${p.nazwa || ''} ${p.opis || ''}`.toLowerCase();
    let foundCategory = null;
    Object.entries(IRIN_PORTFOLIO_MATCH).forEach(([cat, cfg]) => {
      if (cfg.keywords.some(kw => text.includes(kw.toLowerCase()))) {
        foundCategory = cat;
      }
    });
    if (foundCategory) {
      const cfg = IRIN_PORTFOLIO_MATCH[foundCategory];
      const isLuka = cfg.matches.some(m => m.includes('BRAK') || m.includes('rozważyć'));
      const target = { priorytet: p.kod, nazwa: p.nazwa, kategoria: foundCategory, szkolenia: cfg.matches };
      if (isLuka) luki.push(target); else matches.push(target);
    } else if (!p.nazwa?.includes('Do weryfikacji')) {
      luki.push({ priorytet: p.kod, nazwa: p.nazwa, kategoria: 'inne', szkolenia: ['Brak dopasowania w mappingu IRIN - rozważyć ad hoc'] });
    }
  });
  return { matches, luki };
}

function onWojClick(woj) {
  const drilldown = document.getElementById('mapa-drilldown');
  const title = document.getElementById('mapa-drilldown-title');
  const meta = document.getElementById('mapa-drilldown-meta');
  const tbody = document.getElementById('mapa-drilldown-body');
  if (!drilldown || !tbody) return;
  const wojLabel = WOJ_POSITIONS[woj]?.label || woj;
  const wupData = DASHBOARD_DATA.wup?.[woj] || {};
  const alokKfs = wupData.alokacja_kfs_2026_wojewodztwo_pln || 0;
  const burProjekty = wupData.projekty_bur || [];
  const sumaBur = burProjekty.reduce((s, p) => s + (p.kwota_alokacji || 0), 0);
  const powiaty = (DASHBOARD_DATA.powiaty || []).filter(p => p.voivodeship === woj);
  const powZKwota = powiaty.filter(p => (p.amount_kfs||0) > 0);
  const irinMatch = computeIrinMatch(wupData);

  title.innerHTML = `🗺️ WUP ${wojLabel} <span style="font-weight:400;color:#888;font-size:0.8em">(${wupData.operator_bur || ''})</span>`;

  // META BAR z 4 stat-boxami
  meta.innerHTML = `
    <div class="wup-card-stats">
      <div class="wup-stat"><div class="wup-stat-v">${fmtKwota(alokKfs)}</div><div class="wup-stat-l">KFS 2026</div></div>
      <div class="wup-stat"><div class="wup-stat-v">${fmtKwota(sumaBur)}</div><div class="wup-stat-l">BUR aktywne (${burProjekty.length})</div></div>
      <div class="wup-stat"><div class="wup-stat-v">${fmtKwota(alokKfs + sumaBur)}</div><div class="wup-stat-l">SUMA pieniędzy</div></div>
      <div class="wup-stat"><div class="wup-stat-v">${powZKwota.length}/${powiaty.length}</div><div class="wup-stat-l">Powiaty z kwotą</div></div>
    </div>`;

  // KARTA WUP - sekcje
  const priorytetyHtml = (wupData.priorytety_wojewodzkie || []).map(p => {
    const pelne = !p.nazwa?.includes('Do weryfikacji');
    return `<li class="${pelne ? 'priorytet-pelny' : 'priorytet-luka'}"><strong>${p.kod}:</strong> ${p.nazwa || '—'}<br><span class="priorytet-opis">${p.opis || ''}</span></li>`;
  }).join('') || '<li class="priorytet-luka">Brak danych - dograne z PDF uchwały Zarządu Województwa</li>';

  const burHtml = burProjekty.map(p => {
    const statusClass = `bur-status-${(p.status || 'unk').toLowerCase()}`;
    const dates = p.data_start ? `${p.data_start}${p.data_end ? ' → ' + p.data_end : ''}` : '—';
    const kwotaStr = p.kwota_alokacji ? fmtKwota(p.kwota_alokacji) : '—';
    return `<div class="bur-card">
      <div class="bur-card-h"><strong>${p.nazwa || '—'}</strong><span class="${statusClass}">${(p.status || '?').toUpperCase()}</span></div>
      <div class="bur-card-meta">💰 ${kwotaStr} · 📅 ${dates} · ⚙️ ${p.intensywnosc_max || '—'}</div>
      <div class="bur-card-meta">👥 ${p.grupa_docelowa || '—'}</div>
      ${p.url_regulamin ? `<div class="bur-card-link"><a href="${p.url_regulamin}" target="_blank" rel="noopener">📎 Regulamin/info ↗</a></div>` : ''}
      ${p.claudia_note ? `<div class="bur-card-note">💡 ${p.claudia_note}</div>` : ''}
    </div>`;
  }).join('') || '<p class="brak-danych">Brak konkretnych projektów BUR z kwotami. Sprawdzić bezpośrednio na stronie WUP.</p>';

  // Match IRIN
  const matchesHtml = irinMatch.matches.map(m =>
    `<li>✅ <strong>${m.priorytet}: ${m.nazwa}</strong><br><span class="match-irin-szkolenia">→ ${m.szkolenia.join(', ')}</span></li>`
  ).join('');
  const lukiHtml = irinMatch.luki.map(m =>
    `<li>⚠️ <strong>${m.priorytet}: ${m.nazwa}</strong><br><span class="match-irin-luka">→ ${m.szkolenia.join(', ')}</span></li>`
  ).join('');

  // Powiaty - kompaktowa tabela (rozszerzony scroll)
  const powiatyHtml = powiaty.length === 0 ? '<p class="brak-danych">Brak powiatów do wyświetlenia.</p>' : `
    <table class="mapa-tabela mapa-tabela-drilldown">
      <thead><tr><th>Powiat</th><th>Kwota KFS</th><th>Status</th><th>Daty</th><th>Telefon</th><th>Akcja</th></tr></thead>
      <tbody>${powiaty.map(p => {
        const dates = p.kfs_start_date ? `${p.kfs_start_date} → ${p.kfs_end_date || '?'}` : '—';
        const statusClass = `mapa-status-${(p.kfs_status||'unk').toLowerCase()}`;
        const statusBadge = p.kfs_status ? `<span class="mapa-status-badge ${statusClass}">${p.kfs_status}</span>` : '<span class="mapa-status-badge mapa-status-unk">brak</span>';
        const tel = p.telefon || '—';
        const lead = p.claudia_lead ? '🎯' : '';
        return `<tr><td>${lead} ${p.display_name || p.name}</td><td><strong>${fmtKwota(p.amount_kfs)}</strong></td><td>${statusBadge}</td><td>${dates}</td><td class="tel-cell">${tel}</td><td><a href="${p.url_pup || '#'}" target="_blank" rel="noopener">PUP ↗</a></td></tr>`;
      }).join('')}</tbody>
    </table>`;

  // Pełna karta WUP
  tbody.innerHTML = `<tr><td colspan="6" style="padding:0">
    <div class="wup-card-content">
      <div class="wup-card-row">
        <div class="wup-card-col">
          <h4>🏷️ Priorytety wojewódzkie KFS 2026</h4>
          <ul class="wup-card-list priorytety">${priorytetyHtml}</ul>
        </div>
        <div class="wup-card-col">
          <h4>🎯 Match dla IRIN (${irinMatch.matches.length} dopasowań / ${irinMatch.luki.length} luk)</h4>
          <ul class="wup-card-list match-irin">
            ${matchesHtml || '<li class="brak-danych">Brak dopasowań do priorytetów</li>'}
            ${lukiHtml}
          </ul>
        </div>
      </div>
      <div class="wup-card-section">
        <h4>💼 Projekty BUR EFS+ aktywne (${burProjekty.length})</h4>
        <div class="bur-cards">${burHtml}</div>
      </div>
      <div class="wup-card-section">
        <h4>📍 Powiaty (${powiaty.length}) - aktualne nabory KFS</h4>
        ${powiatyHtml}
      </div>
      ${wupData.url_aktualne_nabory || wupData.url_kfs ? `<div class="wup-card-links">📎 ${wupData.url_aktualne_nabory ? `<a href="${wupData.url_aktualne_nabory}" target="_blank" rel="noopener">Aktualne nabory ↗</a> · ` : ''}${wupData.url_kfs ? `<a href="${wupData.url_kfs}" target="_blank" rel="noopener">KFS ${wojLabel} ↗</a>` : ''}</div>` : ''}
    </div>
  </td></tr>`;

  drilldown.style.display = 'block';
  drilldown.scrollIntoView({behavior:'smooth', block:'nearest'});
}

// State sortowania tabeli WUP wide
let _wupSortKey = 'total';
let _wupSortDir = 'desc';

function buildWupRows() {
  return Object.entries(DASHBOARD_DATA.wup || {}).map(([slug, w]) => {
    const kfs = w.alokacja_kfs_2026_wojewodztwo_pln || 0;
    const burProjekty = (w.projekty_bur || []);
    const sumaBur = burProjekty.reduce((s, p) => s + (p.kwota_alokacji || 0), 0);
    const burCount = burProjekty.filter(p => p.kwota_alokacji > 0).length;
    const prCount = (w.priorytety_wojewodzkie || []).filter(p => !p.nazwa?.includes('Do weryfikacji')).length;
    const totalCount = (w.priorytety_wojewodzkie || []).length;
    const irinMatch = computeIrinMatch(w);
    const matchCount = irinMatch.matches.length;
    const matchStars = matchCount > 0 ? '⭐'.repeat(Math.min(matchCount, 3)) : '—';
    return {
      slug,
      label: WOJ_POSITIONS[slug]?.label || slug,
      kfs,
      sumaBur,
      burCount,
      totalBur: burProjekty.length,
      prCount,
      totalPr: totalCount,
      total: kfs + sumaBur,
      matchCount,
      matchStars,
    };
  });
}

function applyWupFilters(rows) {
  const minMatch = parseInt(document.getElementById('filter-match-irin')?.value || '0', 10);
  const minSuma = parseInt(document.getElementById('filter-suma-min')?.value || '0', 10);
  const prStatus = document.getElementById('filter-priorytety-status')?.value || 'all';
  return rows.filter(r => {
    if (r.matchCount < minMatch) return false;
    if (r.total < minSuma) return false;
    if (prStatus === 'full' && r.prCount < 3) return false;
    if (prStatus === 'partial' && r.prCount >= 3) return false;
    return true;
  });
}

function sortWupRows(rows) {
  const key = _wupSortKey;
  const dir = _wupSortDir === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const va = a[key], vb = b[key];
    if (typeof va === 'string') return va.localeCompare(vb, 'pl') * dir;
    return ((va || 0) - (vb || 0)) * dir;
  });
}

function renderTabelaWupWide() {
  const tbody = document.querySelector('#tabela-wup-wide tbody');
  if (!tbody) return;
  const all = buildWupRows();
  const filtered = applyWupFilters(all);
  const rows = sortWupRows(filtered);

  // Update count
  const countEl = document.getElementById('wup-wide-count');
  if (countEl) {
    countEl.textContent = filtered.length === all.length
      ? `${all.length} wojew.`
      : `${filtered.length} z ${all.length} wojew.`;
  }

  // Update sort indicators
  document.querySelectorAll('#tabela-wup-wide thead th[data-sort]').forEach(th => {
    const k = th.getAttribute('data-sort');
    th.classList.toggle('sort-active', k === _wupSortKey);
    th.dataset.dir = (k === _wupSortKey) ? _wupSortDir : '';
  });

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#999;padding:20px">Brak wojew. spełniających filtry. Zmień kryteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map((r, i) => `<tr onclick="onWojClick('${r.slug}')">
    <td><strong>${i + 1}</strong></td>
    <td>${r.label}</td>
    <td><strong>${fmtKwota(r.kfs)}</strong></td>
    <td>${fmtKwota(r.sumaBur)}<br><span class="cell-meta">${r.burCount}/${r.totalBur} z kwotą</span></td>
    <td><strong>${fmtKwota(r.total)}</strong></td>
    <td>${r.prCount}/${r.totalPr}</td>
    <td>${r.matchStars}</td>
  </tr>`).join('');
}

function setupWupWideControls() {
  const ids = ['filter-match-irin', 'filter-suma-min', 'filter-priorytety-status'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && !el._wired) {
      el.addEventListener('change', renderTabelaWupWide);
      el._wired = true;
    }
  });
  const clearBtn = document.getElementById('filter-clear');
  if (clearBtn && !clearBtn._wired) {
    clearBtn.addEventListener('click', () => {
      ids.forEach(id => { const e = document.getElementById(id); if (e) e.value = e.querySelector('option').value; });
      renderTabelaWupWide();
    });
    clearBtn._wired = true;
  }
  document.querySelectorAll('#tabela-wup-wide thead th[data-sort]').forEach(th => {
    if (th._wired) return;
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => {
      const key = th.getAttribute('data-sort');
      if (_wupSortKey === key) {
        _wupSortDir = _wupSortDir === 'desc' ? 'asc' : 'desc';
      } else {
        _wupSortKey = key;
        _wupSortDir = (key === 'label') ? 'asc' : 'desc';
      }
      renderTabelaWupWide();
    });
    th._wired = true;
  });
}

function renderTimelineNaborow() {
  const container = document.getElementById('timeline-naborow');
  if (!container) return;
  const today = new Date('2026-04-27');
  const events = [];
  // Z BUR projektow
  Object.entries(DASHBOARD_DATA.wup || {}).forEach(([slug, w]) => {
    (w.projekty_bur || []).forEach(p => {
      if (p.data_start) {
        events.push({
          data: p.data_start,
          dataEnd: p.data_end,
          tytul: p.nazwa,
          kwota: p.kwota_alokacji,
          source: `WUP ${WOJ_POSITIONS[slug]?.label || slug}`,
          status: p.status || 'unk',
          typ: 'BUR'
        });
      }
    });
  });
  // Z powiatow
  (DASHBOARD_DATA.powiaty || []).forEach(p => {
    if (p.kfs_start_date && p.kfs_status && p.kfs_status !== 'BRAK_DANYCH') {
      events.push({
        data: p.kfs_start_date,
        dataEnd: p.kfs_end_date,
        tytul: p.display_name || p.name,
        kwota: p.amount_kfs,
        source: `${WOJ_POSITIONS[p.voivodeship]?.label || p.voivodeship}`,
        status: p.kfs_status,
        typ: 'KFS'
      });
    }
  });
  // Sort + grupuj per miesiąc
  events.sort((a,b) => a.data.localeCompare(b.data));
  const groupedByMonth = {};
  events.forEach(e => {
    const month = e.data.slice(0, 7);
    if (!groupedByMonth[month]) groupedByMonth[month] = [];
    groupedByMonth[month].push(e);
  });
  // Tylko ostatnie + nadchodzące 6 miesięcy
  const monthsKeys = Object.keys(groupedByMonth).sort();
  const monthsToShow = monthsKeys.filter(m => m >= '2026-04' && m <= '2026-12');

  const monthLabels = {'01':'Sty','02':'Lut','03':'Mar','04':'Kwi','05':'Maj','06':'Cze','07':'Lip','08':'Sie','09':'Wrz','10':'Paź','11':'Lis','12':'Gru'};

  container.innerHTML = monthsToShow.map(month => {
    const [y, m] = month.split('-');
    const events = groupedByMonth[month] || [];
    const isPast = new Date(month + '-15') < today;
    return `<div class="timeline-month ${isPast ? 'timeline-past' : ''}">
      <div class="timeline-month-head">${monthLabels[m]} ${y} <span class="timeline-count">(${events.length})</span></div>
      <div class="timeline-events">
        ${events.slice(0, 8).map(e => `
          <div class="timeline-event timeline-event-${e.typ.toLowerCase()} timeline-status-${e.status.toLowerCase()}" title="${e.tytul} (${e.source})">
            <span class="timeline-date">${e.data.slice(8,10)}.${e.data.slice(5,7)}</span>
            <span class="timeline-title">${e.tytul.length > 35 ? e.tytul.slice(0,32) + '...' : e.tytul}</span>
            <span class="timeline-meta">${e.source}${e.kwota ? ' · ' + fmtKwota(e.kwota) : ''}</span>
          </div>
        `).join('')}
        ${events.length > 8 ? `<div class="timeline-more">+ ${events.length - 8} więcej</div>` : ''}
      </div>
    </div>`;
  }).join('') || '<p class="brak-danych">Brak naborów do wyświetlenia.</p>';
}

// Helper: setText (jeśli nie istnieje globalnie - wzór z core.js)
if (typeof setText === 'undefined') {
  window.setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
}
