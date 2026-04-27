/* filtry.js - filtry powiatow + sort */

function toggleFilter(el) {
  const filterType = el.dataset.filter;
  const value = el.dataset.value;
  if (filterType === 'akcja') {
    document.querySelectorAll('[data-filter="akcja"]').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    activeFilters.akcja = value;
  } else if (filterType === 'pillar') {
    if (el.classList.contains('active')) {
      el.classList.remove('active');
      activeFilters.pillar = null;
    } else {
      document.querySelectorAll('[data-filter="pillar"]').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      activeFilters.pillar = value;
    }
  } else if (filterType === 'kwota') {
    document.querySelectorAll('[data-filter="kwota"]').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    activeFilters.kwota = value;
  } else if (filterType === 'swiezosc') {
    document.querySelectorAll('[data-filter="swiezosc"]').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    activeFilters.swiezosc = value;
  } else if (filterType === 'tier') {
    document.querySelectorAll('[data-filter="tier"]').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    activeFilters.tier = value;
  } else if (filterType === 'priorytet') {
    if (el.classList.contains('active')) {
      el.classList.remove('active');
      activeFilters.priorytety.delete(value);
    } else {
      el.classList.add('active');
      activeFilters.priorytety.add(value);
    }
  }
  applyFilters();
  updateHashFromState();
}

function applyFilters() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let visible = 0;

  document.querySelectorAll('.woj-group').forEach(group => {
    let groupVisible = 0;
    group.querySelectorAll('.card').forEach(card => {
      let show = true;
      const akcja = card.dataset.akcja;
      const pillars = card.dataset.pillars || '';
      const woj = card.dataset.voivodeship;
      const amount = parseInt(card.dataset.amount) || 0;
      const tier = card.dataset.tier;
      const updated = card.dataset.updated || '';
      const priors = (card.dataset.priorytety || '').split(',').filter(Boolean);

      if (activeFilters.akcja !== 'all' && akcja !== activeFilters.akcja) show = false;
      if (activeFilters.pillar && !pillars.includes(activeFilters.pillar)) show = false;
      if (activeFilters.voivodeships.size && !activeFilters.voivodeships.has(woj)) show = false;
      if (activeFilters.tier !== 'all' && tier !== activeFilters.tier) show = false;
      if (activeFilters.kwota !== 'all') {
        if (activeFilters.kwota === 'mniej500k' && !(amount > 0 && amount < 500000)) show = false;
        if (activeFilters.kwota === '500k_2m' && !(amount >= 500000 && amount <= 2000000)) show = false;
        if (activeFilters.kwota === 'wiecej2m' && !(amount > 2000000)) show = false;
        if (activeFilters.kwota === 'brak' && amount > 0) show = false;
      }
      if (activeFilters.swiezosc !== 'all' && updated) {
        const days = Math.ceil((today - new Date(updated)) / 86400000);
        if (activeFilters.swiezosc === 'mniej7' && days > 7) show = false;
        if (activeFilters.swiezosc === '7_30' && (days < 7 || days > 30)) show = false;
        if (activeFilters.swiezosc === 'wiecej30' && days <= 30) show = false;
      }
      if (activeFilters.priorytety.size) {
        const hit = priors.some(p => activeFilters.priorytety.has(p));
        if (!hit) show = false;
      }

      card.style.display = show ? '' : 'none';
      if (show) { visible++; groupVisible++; }
    });
    // Ukryj cala grupe jesli zero kart
    group.style.display = groupVisible > 0 ? '' : 'none';
  });

  const rc = document.getElementById('results-count');
  if (rc) {
    const total = document.querySelectorAll('#cards-grid .card').length;
    rc.textContent = `Widocznych: ${visible} z ${total}`;
  }
}

function applySortPreset(preset) {
  // Sort wewnatrz kazdej grupy wojewodztwa, nie grup miedzy soba (te zostaja w WOJEWODZTWA_KOLEJNOSC)
  document.querySelectorAll('.woj-group .woj-body').forEach(body => {
    const cards = [...body.querySelectorAll('.card')];
    cards.sort((a, b) => {
      if (preset === 'urgency') return akcjaOrder(a) - akcjaOrder(b);
      if (preset === 'amount') return (parseInt(b.dataset.amount) || 0) - (parseInt(a.dataset.amount) || 0);
      if (preset === 'irin') return (parseInt(b.dataset.irin) || 0) - (parseInt(a.dataset.irin) || 0) || akcjaOrder(a) - akcjaOrder(b);
      if (preset === 'geo') return (a.dataset.name || '').localeCompare(b.dataset.name || '');
      return 0;
    });
    cards.forEach(c => body.appendChild(c));
  });
}

function akcjaOrder(card) {
  const map = { aktywny: 0, monitor: 1, zadzwon: 2, zakonczony: 3 };
  return map[card.dataset.akcja] ?? 4;
}

// === Voivodeship dropdown ===
function renderVoivodeshipChips() {
  const panel = document.getElementById('woj-dropdown-panel');
  if (!panel) return;
  const voivs = [...new Set(DASHBOARD_DATA.powiaty.map(p => p.voivodeship))].sort();
  panel.innerHTML = voivs.map(v =>
    `<label class="woj-checkbox-label"><input type="checkbox" class="woj-checkbox" value="${v}" checked onchange="onWojCheckboxChange()"> ${VOIVODESHIP_LABELS[v] || v}</label>`
  ).join('');
  voivs.forEach(v => activeFilters.voivodeships.add(v));
}

function toggleWojDropdown(e) {
  if (e) e.stopPropagation();
  const panel = document.getElementById('woj-dropdown-panel');
  if (panel) panel.classList.toggle('open');
}

function onWojCheckboxChange() {
  activeFilters.voivodeships.clear();
  document.querySelectorAll('.woj-checkbox:checked').forEach(cb => activeFilters.voivodeships.add(cb.value));
  syncWojBadge();
  applyFilters();
  updateHashFromState();
}

function selectAllVoivodeships() {
  document.querySelectorAll('.woj-checkbox').forEach(cb => { cb.checked = true; });
  onWojCheckboxChange();
}

function syncWojBadge() {
  const badge = document.getElementById('woj-dropdown-badge');
  if (!badge) return;
  const total = document.querySelectorAll('.woj-checkbox').length;
  const checked = activeFilters.voivodeships.size;
  if (checked < total) { badge.textContent = checked; badge.style.display = ''; }
  else { badge.style.display = 'none'; }
}
