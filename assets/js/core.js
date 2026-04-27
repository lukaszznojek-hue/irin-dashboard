/* core.js - init, fetchJson, DASHBOARD_DATA, hash routing */

let DASHBOARD_DATA = {
  powiaty: [], meta: {}, slownik: [], szkolenia: {}, propozycje: [],
  matryca: {}, trendy: {}, parp: {}, wup: {}, benchmarki: {}
};

let activeFilters = {
  akcja: 'all',
  pillar: null,
  voivodeships: new Set(),
  priorytety: new Set(),
  kwota: 'all',
  swiezosc: 'all',
  tier: 'all'
};

async function fetchJson(url) {
  try {
    const r = await fetch(url);
    return r.ok ? r.json() : null;
  } catch { return null; }
}

async function init() {
  try {
    const [meta, slownik, parp, trendy, szkolenia, propozycje, matryca, benchmarki, ...wojResults] = await Promise.all([
      fetchJson('./data/meta.json'),
      fetchJson('./data/slownik.json'),
      fetchJson('./data/parp_priorytety.json'),
      fetchJson('./data/trendy.json'),
      fetchJson('./data/szkolenia_irin.json'),
      fetchJson('./data/szkolenia_propozycje.json'),
      fetchJson('./data/matryca.json'),
      fetchJson('./data/benchmarki_rynkowe.json'),
      ...WOJEWODZTWA_KOLEJNOSC.map(s => fetchJson(`./data/powiaty/${s}.json`))
    ]);

    DASHBOARD_DATA.meta = meta || {};
    DASHBOARD_DATA.slownik = slownik || {};
    DASHBOARD_DATA.parp = parp || {};
    DASHBOARD_DATA.trendy = trendy || {};
    DASHBOARD_DATA.szkolenia = szkolenia || {};
    DASHBOARD_DATA.propozycje = propozycje || {};
    DASHBOARD_DATA.matryca = matryca || {};
    DASHBOARD_DATA.benchmarki = benchmarki || {};
    DASHBOARD_DATA.powiaty = wojResults.flatMap(w => w ? w.powiaty || [] : []);

    const wupResults = await Promise.all(
      WOJEWODZTWA_KOLEJNOSC.map(s => fetchJson(`./data/wup/${s}.json`))
    );
    DASHBOARD_DATA.wup = {};
    wupResults.forEach((w, i) => { if (w) DASHBOARD_DATA.wup[WOJEWODZTWA_KOLEJNOSC[i]] = w; });

    renderAll();
    updateStats();
    applyHashState();
    updateFooter();
  } catch (e) {
    console.error('Init error:', e);
    const grid = document.getElementById('cards-grid');
    if (grid) grid.innerHTML = '<div class="error-msg">Błąd ładowania danych. Sprawdź czy pliki JSON są dostępne.</div>';
  }
}

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
  if (typeof renderTailwinds === 'function') renderTailwinds();
  if (typeof updateTailwindsBanner === 'function') updateTailwindsBanner();
  if (typeof initKalkulator === 'function') initKalkulator();
  if (typeof renderAkcjeDnia === 'function') renderAkcjeDnia();
  if (typeof renderMapaPieniedzy === 'function') renderMapaPieniedzy();
  // Tooltipy - wyłączone na powiaty/wup (zaklóca workflow)
  setTimeout(() => {
    document.querySelectorAll('.panel').forEach(p => {
      if (p.id === 'panel-powiaty' || p.id === 'panel-wup') return;
      addTermTooltips(p);
    });
  }, 100);
}

// ===== TABS + HASH ROUTING =====
function currentActiveTab() {
  const t = document.querySelector('.nav-tab.active');
  return t ? t.dataset.panel : 'powiaty';
}

function switchTab(el, tabId) {
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.remove('active'); t.setAttribute('aria-selected', 'false');
  });
  el.classList.add('active');
  el.setAttribute('aria-selected', 'true');
  document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
  const panel = document.getElementById('panel-' + tabId);
  if (panel) panel.style.display = '';
  updateHashFromState();
}

// Hash format: #powiaty?akcja=aktywny&woj=swietokrzyskie&urzad=mup-kielce
function updateHashFromState() {
  const tab = currentActiveTab();
  const params = new URLSearchParams();
  if (activeFilters.akcja !== 'all') params.set('akcja', activeFilters.akcja);
  if (activeFilters.pillar) params.set('pillar', activeFilters.pillar);
  const totalVoiv = document.querySelectorAll('.woj-checkbox').length;
  if (activeFilters.voivodeships.size && activeFilters.voivodeships.size < totalVoiv) {
    params.set('woj', [...activeFilters.voivodeships].join(','));
  }
  if (activeFilters.tier !== 'all') params.set('tier', activeFilters.tier);
  if (activeFilters.kwota !== 'all') params.set('kwota', activeFilters.kwota);
  if (activeFilters.swiezosc !== 'all') params.set('swiezosc', activeFilters.swiezosc);
  if (activeFilters.priorytety.size) params.set('prior', [...activeFilters.priorytety].join(','));
  const queryStr = params.toString();
  history.replaceState(null, '', `#${tab}${queryStr ? '?' + queryStr : ''}`);
}

function applyHashState() {
  const hash = location.hash.replace('#', '');
  if (!hash) return;
  // backward compat: #strategia.html otwiera plik (nie tab)
  if (hash === 'strategia.html' || hash.startsWith('strategia')) {
    location.replace('strategia.html');
    return;
  }
  const [tab, query] = hash.split('?');
  if (tab) {
    const tabEl = document.querySelector(`.nav-tab[data-panel="${tab}"]`);
    if (tabEl) switchTab(tabEl, tab);
  }
  if (!query) return;
  const params = new URLSearchParams(query);

  if (params.has('akcja')) {
    const v = params.get('akcja');
    const c = document.querySelector(`[data-filter="akcja"][data-value="${v}"]`);
    if (c) {
      document.querySelectorAll('[data-filter="akcja"]').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      activeFilters.akcja = v;
    }
  }
  if (params.has('pillar')) {
    const v = params.get('pillar');
    const c = document.querySelector(`[data-filter="pillar"][data-value="${v}"]`);
    if (c) { c.classList.add('active'); activeFilters.pillar = v; }
  }
  if (params.has('woj')) {
    const list = params.get('woj').split(',');
    activeFilters.voivodeships = new Set(list);
    document.querySelectorAll('.woj-checkbox').forEach(cb => { cb.checked = list.includes(cb.value); });
    syncWojBadge();
  }
  if (params.has('tier')) activeFilters.tier = params.get('tier');
  if (params.has('kwota')) activeFilters.kwota = params.get('kwota');
  if (params.has('swiezosc')) activeFilters.swiezosc = params.get('swiezosc');
  if (params.has('prior')) activeFilters.priorytety = new Set(params.get('prior').split(','));

  applyFilters();

  if (params.has('urzad')) {
    setTimeout(() => {
      const card = document.querySelector(`.card[data-name="${params.get('urzad')}"]`);
      if (card) {
        const grp = card.closest('.woj-group');
        if (grp) grp.classList.remove('collapsed');
        card.classList.add('expanded', 'highlight');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => card.classList.remove('highlight'), 2000);
      }
    }, 250);
  }
  if (params.has('term')) {
    setTimeout(() => {
      const term = params.get('term');
      const item = [...document.querySelectorAll('.slownik-item')]
        .find(el => el.querySelector('.slownik-skrot')?.textContent.trim() === term);
      if (item) {
        item.classList.add('expanded');
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 250);
  }
}

// Quick navigations from clickable signals
function quickFilter(akcja) {
  const tabEl = document.querySelector('.nav-tab[data-panel="powiaty"]');
  if (tabEl) switchTab(tabEl, 'powiaty');
  if (akcja === 'all' || akcja === 'krytyczne_aktywne') {
    activeFilters.akcja = akcja === 'krytyczne_aktywne' ? 'aktywny' : 'all';
    document.querySelectorAll('[data-filter="akcja"]').forEach(c => c.classList.remove('active'));
    const target = document.querySelector(`[data-filter="akcja"][data-value="${activeFilters.akcja}"]`);
    if (target) target.classList.add('active');
  } else {
    const chip = document.querySelector(`[data-filter="akcja"][data-value="${akcja}"]`);
    if (chip) {
      document.querySelectorAll('[data-filter="akcja"]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilters.akcja = akcja;
    }
  }
  applyFilters();
  updateHashFromState();
}

function goToSlownik(term) {
  const tabEl = document.querySelector('.nav-tab[data-panel="slownik"]');
  if (tabEl) switchTab(tabEl, 'slownik');
  setTimeout(() => {
    const item = [...document.querySelectorAll('.slownik-item')]
      .find(el => el.querySelector('.slownik-skrot')?.textContent.trim() === term);
    if (item) {
      item.classList.add('expanded');
      item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 50);
  history.replaceState(null, '', `#slownik?term=${encodeURIComponent(term)}`);
}

function goToSzkolenia(query) {
  const tabEl = document.querySelector('.nav-tab[data-panel="szkolenia"]');
  if (tabEl) switchTab(tabEl, 'szkolenia');
  history.replaceState(null, '', `#szkolenia${query ? '?q=' + encodeURIComponent(query) : ''}`);
}

function toggleCard(el) {
  el.parentElement.classList.toggle('expanded');
}

function updateFooter() {
  const m = DASHBOARD_DATA.meta;
  if (!m) return;
  setText('footer-version', `Dashboard IRIN v${m.wersja || '5.0.0'}`);
  setText('footer-date', `Aktualizacja: ${m.data_aktualizacji || '—'}`);
  setText('header-meta', `v${m.wersja || '5.0.0'} · Aktualizacja: ${m.data_aktualizacji || '—'}`);
}

// Stats counters: aktywny / monitor / zadzwon / krytyczne (aktywny z deadline <7d)
function updateStats() {
  const cards = DASHBOARD_DATA.powiaty || [];
  const today = new Date(); today.setHours(0,0,0,0);
  let active = 0, monitor = 0, zadzwon = 0, critical = 0;
  cards.forEach(c => {
    const a = mapUrgencyToAkcja(c);
    if (a === 'aktywny') active++;
    if (a === 'monitor') monitor++;
    if (a === 'zadzwon') zadzwon++;
    if (a === 'aktywny' && c.kfs_end_date) {
      const days = Math.ceil((new Date(c.kfs_end_date) - today) / 86400000);
      if (days >= 0 && days <= 7) critical++;
    }
  });
  setText('stat-total', cards.length);
  setText('stat-active', active);
  setText('stat-urgent', monitor);
  setText('stat-zadzwon', zadzwon);
  setText('stat-critical', critical);
}

document.addEventListener('DOMContentLoaded', init);

// Close dropdown on outside click
document.addEventListener('click', e => {
  const panel = document.getElementById('woj-dropdown-panel');
  const wrap = document.getElementById('woj-dropdown-wrap');
  if (panel && wrap && !wrap.contains(e.target)) panel.classList.remove('open');
});
