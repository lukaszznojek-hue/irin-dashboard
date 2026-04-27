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

function renderMapaSvg(alokacje, minK, maxK) {
  const container = document.getElementById('mapa-svg-container');
  if (!container) return;
  const cellW = 110, cellH = 70, gap = 8;
  const cols = 5, rows = 5;
  const w = cols * (cellW + gap), h = rows * (cellH + gap);
  let svg = `<svg viewBox="0 0 ${w} ${h}" class="mapa-svg" xmlns="http://www.w3.org/2000/svg">`;
  Object.entries(WOJ_POSITIONS).forEach(([slug, pos]) => {
    const x = pos.x * (cellW + gap);
    const y = pos.y * (cellH + gap);
    const kwota = alokacje[slug] || 0;
    const color = colorForKwota(kwota, minK, maxK);
    const txtColor = textColorForBg(kwota, minK, maxK);
    const tooltip = `${pos.label}: ${fmtKwota(kwota)}`;
    const labelShadow = txtColor === '#fff' ? 'paint-order:stroke;stroke:rgba(0,0,0,0.4);stroke-width:2px;' : '';
    svg += `<g class="mapa-woj-cell" data-woj="${slug}" onclick="onWojClick('${slug}')" tabindex="0">
      <rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="6" fill="${color}" stroke="#222" stroke-width="1.5">
        <title>${tooltip}</title>
      </rect>
      <text x="${x + cellW/2}" y="${y + 26}" text-anchor="middle" class="mapa-woj-label" style="fill:${txtColor};font-size:12px;font-weight:700;${labelShadow}">${pos.label}</text>
      <text x="${x + cellW/2}" y="${y + 50}" text-anchor="middle" class="mapa-woj-kwota" style="fill:${txtColor};font-size:12px;font-weight:600;${labelShadow}">${fmtKwota(kwota)}</text>
    </g>`;
  });
  svg += `</svg>`;
  container.innerHTML = svg;
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
}

function onWojClick(woj) {
  const drilldown = document.getElementById('mapa-drilldown');
  const title = document.getElementById('mapa-drilldown-title');
  const meta = document.getElementById('mapa-drilldown-meta');
  const tbody = document.getElementById('mapa-drilldown-body');
  if (!drilldown || !tbody) return;
  const wojLabel = WOJ_POSITIONS[woj]?.label || woj;
  const wupData = DASHBOARD_DATA.wup?.[woj] || {};
  const alokacja = wupData.alokacja_kfs_2026_wojewodztwo_pln || 0;
  const powiaty = (DASHBOARD_DATA.powiaty || []).filter(p => p.voivodeship === woj);
  const zKwota = powiaty.filter(p => (p.amount_kfs||0) > 0).length;
  title.textContent = `Powiaty województwa ${wojLabel}`;
  meta.innerHTML = `Alokacja KFS 2026: <strong>${fmtKwota(alokacja)}</strong> · Powiatów: ${powiaty.length} (z kwotą: ${zKwota}) · Operator BUR: ${wupData.operator_bur || '—'}`;
  tbody.innerHTML = powiaty.map(p => {
    const dates = p.kfs_start_date ? `${p.kfs_start_date} → ${p.kfs_end_date || '?'}` : '—';
    const statusClass = `mapa-status-${(p.kfs_status||'unk').toLowerCase()}`;
    const statusBadge = p.kfs_status ? `<span class="mapa-status-badge ${statusClass}">${p.kfs_status}</span>` : '<span class="mapa-status-badge mapa-status-unk">brak danych</span>';
    return `<tr>
      <td>${p.display_name || p.name}</td>
      <td>${fmtKwota(p.amount_kfs)}</td>
      <td>${statusBadge}</td>
      <td>${dates}</td>
      <td><a href="${p.url_pup || '#'}" target="_blank" rel="noopener">PUP ↗</a></td>
    </tr>`;
  }).join('');
  drilldown.style.display = 'block';
  drilldown.scrollIntoView({behavior:'smooth', block:'nearest'});
}

// Helper: setText (jeśli nie istnieje globalnie - wzór z core.js)
if (typeof setText === 'undefined') {
  window.setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
}
