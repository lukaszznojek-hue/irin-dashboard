/* akcje_dnia.js - sekcja "Twoje akcje dziś" na górze dashboardu */

function renderAkcjeDnia() {
  const el = document.getElementById('akcje-dnia-grid');
  if (!el) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const items = [];

  // 1. Aktywne nabory (najważniejsze)
  (DASHBOARD_DATA.powiaty || []).forEach(p => {
    const akcja = mapUrgencyToAkcja(p);
    if (akcja !== 'aktywny') return;
    const days = p.kfs_end_date
      ? Math.ceil((new Date(p.kfs_end_date) - today) / 86400000)
      : null;
    items.push({
      priority: days !== null ? days : 999,
      type: 'nabor',
      html: `<div class="ad-card ad-nabor" onclick="navigateToPowiat('${p.voivodeship}','${escapeAttr(p.name)}')">
        <div class="ad-badge ad-badge-aktywny">AKTYWNY</div>
        <div class="ad-title">${p.display_name || p.name}</div>
        <div class="ad-sub">${VOIVODESHIP_LABELS[p.voivodeship] || p.voivodeship}${days !== null ? ' - ' + (days <= 0 ? 'koniec dziś!' : days + ' dni do końca') : ''}</div>
        ${p.amount_kfs > 0 ? `<div class="ad-kwota">${formatKwota(p.amount_kfs)}</div>` : ''}
      </div>`
    });
  });

  // 2. Monitoring (bliskie starty)
  (DASHBOARD_DATA.powiaty || []).forEach(p => {
    const akcja = mapUrgencyToAkcja(p);
    if (akcja !== 'monitor') return;
    if (!p.kfs_start_date) return;
    const days = Math.ceil((new Date(p.kfs_start_date) - today) / 86400000);
    if (days > 14) return;
    items.push({
      priority: 100 + days,
      type: 'monitor',
      html: `<div class="ad-card ad-monitor" onclick="navigateToPowiat('${p.voivodeship}','${escapeAttr(p.name)}')">
        <div class="ad-badge ad-badge-monitor">START ZA ${days}D</div>
        <div class="ad-title">${p.display_name || p.name}</div>
        <div class="ad-sub">${VOIVODESHIP_LABELS[p.voivodeship] || p.voivodeship}</div>
      </div>`
    });
  });

  // 3. Tailwinds deadline
  const aiActDays = Math.ceil((new Date('2026-08-02') - today) / 86400000);
  if (aiActDays > 0 && aiActDays <= 120) {
    items.push({
      priority: 50,
      type: 'deadline',
      html: `<div class="ad-card ad-deadline" onclick="switchTab(document.querySelector('[data-panel=&quot;tailwinds&quot;]'),'tailwinds')">
        <div class="ad-badge ad-badge-deadline">DEADLINE</div>
        <div class="ad-title">AI Act - pełne stosowanie</div>
        <div class="ad-sub">${aiActDays} dni (02.08.2026)</div>
      </div>`
    });
  }

  // 4. Szkolenia z bliskim terminem
  (DASHBOARD_DATA.szkolenia?.uslugi || []).forEach(s => {
    if (!s.data_start) return;
    const days = Math.ceil((new Date(s.data_start) - today) / 86400000);
    if (days < 0 || days > 30) return;
    items.push({
      priority: 200 + days,
      type: 'szkolenie',
      html: `<div class="ad-card ad-szkolenie" onclick="goToSzkolenia('${s.id_bur}')">
        <div class="ad-badge ad-badge-szkolenie">ZA ${days}D</div>
        <div class="ad-title">${s.tytul.length > 40 ? s.tytul.slice(0, 37) + '...' : s.tytul}</div>
        <div class="ad-sub">${formatKwota(s.cena_brutto)} - ${s.forma}</div>
      </div>`
    });
  });

  items.sort((a, b) => a.priority - b.priority);
  const top = items.slice(0, 6);

  if (!top.length) {
    el.closest('.akcje-dnia').style.display = 'none';
    return;
  }

  el.innerHTML = top.map(i => i.html).join('');
}
