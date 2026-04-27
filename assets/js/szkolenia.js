/* szkolenia.js - tabela szkolen IRIN + benchmark cenowy */

let activeBurFilters = { kat: 'all', forma: 'all', tier: 'all', benchmark: 'all' };

function renderBURTable() {
  const tbody = document.getElementById('irin-tbody');
  if (!tbody || !DASHBOARD_DATA.szkolenia?.uslugi) return;
  const d = DASHBOARD_DATA.szkolenia;
  setText('irin-date', d.data_fetch_bur);
  setText('irin-rating', (d.ocena_dostawcy || '?') + '/5');
  setText('irin-reviews', d.liczba_ocen || '?');

  const benchmarki = DASHBOARD_DATA.benchmarki?.kategorie || {};

  tbody.innerHTML = d.uslugi.map(u => {
    const cenaIrin = u.cena_h;
    const cenaRynek = (u.cena_h_rynek_avg != null) ? u.cena_h_rynek_avg : benchmarki[u.kategoria]?.cena_h_rynek_avg;
    const benchKat = benchmarkKategoria(cenaIrin, cenaRynek);
    const benchmark = renderBenchmarkBadge(cenaIrin, cenaRynek, u, benchKat);
    const tierBadge = `<span class="tier-irin tier-${u.tier_priorytetu_irin}">T${u.tier_priorytetu_irin}</span>`;
    const priors = (u.powiazane_priorytety || []).map(p => `<span class="prior-tag">${p}</span>`).join(' ');

    return `<tr class="bur-row"
              data-kat="${u.kategoria}"
              data-forma="${u.forma || ''}"
              data-tier="${u.tier_priorytetu_irin}"
              data-benchmark="${benchKat}">
      <td><div class="bur-title">${u.tytul}</div><div class="bur-id"><a href="${u.url_bur || 'https://uslugirozwojowe.parp.gov.pl/wyszukiwarka/uslugi/podglad?id=' + u.id_bur}" target="_blank" rel="noopener" class="bur-link">ID: ${u.id_bur} ↗</a></div></td>
      <td><span class="irin-cat ${u.kategoria}">${katLabel(u.kategoria)}</span></td>
      <td class="amount">${formatKwota(u.cena_brutto)}</td>
      <td class="cena-h-irin">${cenaIrin} zł/h</td>
      <td class="cena-h-rynek">${cenaRynek ? cenaRynek + ' zł/h' : '—'}</td>
      <td class="benchmark-cell">${benchmark}</td>
      <td>${u.godziny}h</td>
      <td>${u.forma}${u.miasto ? '<br><small>' + u.miasto + '</small>' : ''}</td>
      <td>${u.data_start ? fmtDateShort(new Date(u.data_start)) : '—'}</td>
      <td>${tierBadge}</td>
      <td>${priors}</td>
    </tr>`;
  }).join('');
}

function benchmarkKategoria(cenaIrin, cenaRynek) {
  if (cenaIrin == null || !cenaRynek) return 'unknown';
  const diff = ((cenaIrin - cenaRynek) / cenaRynek) * 100;
  if (diff < -10) return 'cheaper';
  if (diff > 25) return 'premium';
  if (diff > 10) return 'higher';
  return 'equal';
}

function renderBenchmarkBadge(cenaIrin, cenaRynek, szkolenie, kat) {
  if (kat === 'unknown') return '<span class="bench-badge bench-unknown">—</span>';
  const diff = ((cenaIrin - cenaRynek) / cenaRynek) * 100;
  const diffR = Math.round(diff);
  let label, tooltip;
  if (kat === 'cheaper') {
    label = `↓ ${diffR}%`;
    tooltip = `Tańsi o ${Math.abs(diffR)}%. Argument: cena niższa niż rynek (${cenaRynek} zł/h średnia).`;
  } else if (kat === 'premium') {
    label = `↑ +${diffR}%`;
    tooltip = `Premium ${diffR}% powyżej rynku. Pozycjonuj jako akademicki standard, ocena 4.9/5 (813 ocen).`;
  } else if (kat === 'higher') {
    label = `↑ +${diffR}%`;
    const formaArg = szkolenie.forma === 'zdalna' ? 'zdalna forma' : 'praktyczne podejście';
    tooltip = `Drożsi o ${diffR}%. Argument jakością: ocena 4.9/5 (813 ocen), priorytet PARP, ${formaArg}.`;
  } else {
    label = diffR >= 0 ? `~ +${diffR}%` : `~ ${diffR}%`;
    tooltip = `Cena na poziomie rynku (±10%). Argument: ocena 4.9/5 jako wyróżnik.`;
  }
  return `<span class="bench-badge bench-${kat}" title="${escapeAttr(tooltip)}">${label}</span>`;
}

function toggleBurFilter(el) {
  const group = el.dataset.burFilter;
  const val = el.dataset.val;
  document.querySelectorAll(`[data-bur-filter="${group}"]`).forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  activeBurFilters[group] = val;
  applyBurFilters();
}

function applyBurFilters() {
  document.querySelectorAll('.bur-row').forEach(row => {
    let show = true;
    if (activeBurFilters.kat !== 'all' && row.dataset.kat !== activeBurFilters.kat) show = false;
    if (activeBurFilters.forma !== 'all' && row.dataset.forma !== activeBurFilters.forma) show = false;
    if (activeBurFilters.tier !== 'all' && row.dataset.tier !== activeBurFilters.tier) show = false;
    if (activeBurFilters.benchmark !== 'all' && row.dataset.benchmark !== activeBurFilters.benchmark) show = false;
    row.style.display = show ? '' : 'none';
  });
}
