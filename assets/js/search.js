/* search.js - globalna wyszukiwarka dashboardu */

let searchTimeout = null;

function globalSearch(query) {
  clearTimeout(searchTimeout);
  const results = document.getElementById('global-search-results');
  if (!results) return;

  if (!query || query.length < 2) {
    results.innerHTML = '';
    results.style.display = 'none';
    return;
  }

  searchTimeout = setTimeout(() => {
    const q = query.toLowerCase().trim();
    const hits = [];

    // Powiaty
    (DASHBOARD_DATA.powiaty || []).forEach(p => {
      const haystack = [
        p.display_name, p.name, p.voivodeship,
        VOIVODESHIP_LABELS[p.voivodeship],
        p.akcja_status_uzasadnienie, p.claudia_note,
        ...(p.pillars || []),
        ...(p.pillar_details || []).map(d => d.title + ' ' + JSON.stringify(d.fields || {}))
      ].filter(Boolean).join(' ').toLowerCase();

      if (haystack.includes(q)) {
        const akcja = mapUrgencyToAkcja(p);
        hits.push({
          type: 'powiat',
          label: p.display_name || p.name,
          sub: VOIVODESHIP_LABELS[p.voivodeship] || p.voivodeship,
          badge: akcja,
          action: () => navigateToPowiat(p.voivodeship, p.name)
        });
      }
    });

    // Szkolenia
    (DASHBOARD_DATA.szkolenia?.uslugi || []).forEach(s => {
      const haystack = [s.tytul, s.id_bur, s.kategoria, s.forma, s.miasto].filter(Boolean).join(' ').toLowerCase();
      if (haystack.includes(q)) {
        hits.push({
          type: 'szkolenie',
          label: s.tytul.length > 55 ? s.tytul.slice(0, 52) + '...' : s.tytul,
          sub: formatKwota(s.cena_brutto) + ' · ' + s.godziny + 'h',
          badge: 'T' + s.tier_priorytetu_irin,
          action: () => { goToSzkolenia(s.id_bur); closeSearch(); }
        });
      }
    });

    // WUP
    Object.entries(DASHBOARD_DATA.wup || {}).forEach(([slug, w]) => {
      const haystack = [
        w.operator_bur, w.wojewodztwo_label, w.claudia_note,
        ...(w.priorytety_wojewodzkie || []).map(p => p.kod + ' ' + p.nazwa + ' ' + (p.opis || '')),
        ...(w.projekty_bur || []).map(p => p.nazwa + ' ' + (p.claudia_note || ''))
      ].filter(Boolean).join(' ').toLowerCase();

      if (haystack.includes(q)) {
        hits.push({
          type: 'wup',
          label: w.operator_bur || w.wojewodztwo_label,
          sub: w.wojewodztwo_label,
          badge: w.tier,
          action: () => navigateToWup(slug)
        });
      }
    });

    // Slownik
    (DASHBOARD_DATA.slownik?.terminy || []).forEach(t => {
      const haystack = [t.skrot, t.pelna_nazwa, t.krotki_opis].filter(Boolean).join(' ').toLowerCase();
      if (haystack.includes(q)) {
        hits.push({
          type: 'slownik',
          label: t.skrot,
          sub: t.pelna_nazwa || t.krotki_opis || '',
          badge: '',
          action: () => { goToSlownik(t.skrot); closeSearch(); }
        });
      }
    });

    // Propozycje
    (DASHBOARD_DATA.propozycje?.propozycje || []).forEach(p => {
      const haystack = [p.tytul_roboczy, p.opis_krotki, p.uzasadnienie].filter(Boolean).join(' ').toLowerCase();
      if (haystack.includes(q)) {
        hits.push({
          type: 'propozycja',
          label: p.tytul_roboczy,
          sub: p.status || '',
          badge: p.pilnosc || '',
          action: () => { goToSzkolenia('propozycje'); closeSearch(); }
        });
      }
    });

    renderSearchResults(hits.slice(0, 12), results);
  }, 150);
}

function renderSearchResults(hits, container) {
  if (!hits.length) {
    container.innerHTML = '<div class="search-no-results">Brak wyników</div>';
    container.style.display = '';
    return;
  }

  const typeLabels = {
    powiat: 'Powiat', szkolenie: 'Szkolenie', wup: 'WUP',
    slownik: 'Slownik', propozycja: 'Propozycja'
  };

  container.innerHTML = hits.map(h => `
    <div class="search-result-item" data-type="${h.type}">
      <span class="search-type">${typeLabels[h.type] || h.type}</span>
      <div class="search-result-text">
        <div class="search-result-label">${escapeHtml(h.label)}</div>
        <div class="search-result-sub">${escapeHtml(h.sub)}</div>
      </div>
      ${h.badge ? `<span class="search-badge">${escapeHtml(h.badge)}</span>` : ''}
    </div>
  `).join('');

  container.querySelectorAll('.search-result-item').forEach((el, i) => {
    el.addEventListener('click', () => hits[i].action());
  });

  container.style.display = '';
}

function navigateToPowiat(voivodeship, name) {
  closeSearch();
  const tabEl = document.querySelector('.nav-tab[data-panel="powiaty"]');
  if (tabEl) switchTab(tabEl, 'powiaty');
  setTimeout(() => {
    const grp = document.querySelector(`.woj-group[data-woj="${voivodeship}"]`);
    if (grp) {
      grp.classList.remove('collapsed');
      const card = grp.querySelector(`.card[data-name="${name}"]`);
      if (card) {
        card.classList.add('expanded', 'highlight');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => card.classList.remove('highlight'), 2500);
      }
    }
  }, 100);
}

function navigateToWup(slug) {
  closeSearch();
  const tabEl = document.querySelector('.nav-tab[data-panel="wup"]');
  if (tabEl) switchTab(tabEl, 'wup');
  setTimeout(() => {
    const cards = document.querySelectorAll('.wup-card');
    cards.forEach(c => {
      const voivEl = c.querySelector('.wup-voiv');
      if (voivEl && voivEl.textContent.toLowerCase().includes(VOIVODESHIP_LABELS[slug]?.toLowerCase() || slug)) {
        c.classList.remove('wup-collapsed');
        c.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }, 100);
}

function closeSearch() {
  const input = document.getElementById('global-search');
  const results = document.getElementById('global-search-results');
  if (input) input.value = '';
  if (results) { results.innerHTML = ''; results.style.display = 'none'; }
}

document.addEventListener('click', e => {
  const searchWrap = document.querySelector('.header-search');
  if (searchWrap && !searchWrap.contains(e.target)) {
    const results = document.getElementById('global-search-results');
    if (results) results.style.display = 'none';
  }
});
