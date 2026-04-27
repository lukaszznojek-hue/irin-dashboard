/* propozycje.js - karty propozycji szkolen + filtr statusu */

let activePropFilter = 'all';

const PROP_STATUS_LABELS = {
  pomysl: 'Pomysł',
  analiza: 'W analizie',
  w_opracowaniu: 'W opracowaniu',
  gotowe: 'Gotowe',
  odrzucone: 'Odrzucone'
};

function renderProposals() {
  const grid = document.getElementById('proposals-grid');
  if (!grid || !DASHBOARD_DATA.propozycje?.propozycje) return;
  grid.innerHTML = DASHBOARD_DATA.propozycje.propozycje.map(p => {
    const status = p.status || 'pomysl';
    const owner = p.owner_irin ? `<span class="prop-owner">@${escapeHtml(p.owner_irin)}</span>` : '';
    const programLink = p.url_program
      ? `<a class="prop-program" href="${p.url_program}" target="_blank" rel="noopener">Zobacz program →</a>`
      : '';
    return `<div class="proposal-card" data-prop-status="${status}">
      <div class="proposal-header">
        <span class="prop-status status-${status}">${PROP_STATUS_LABELS[status] || status}</span>
        ${owner}
      </div>
      <div class="proposal-title">${escapeHtml(p.tytul)}</div>
      <div class="proposal-meta">${p.forma || ''} · ~${p.estymowane_godziny || '?'}h · ~${formatKwota(p.estymowana_cena)}</div>
      <div class="proposal-reason">${escapeHtml(p.uzasadnienie || '')}</div>
      <div class="proposal-tags">
        ${(p.powiazane_priorytety || []).map(pr => `<span class="prior-tag">${pr}</span>`).join(' ')}
        <span class="urgency-tag ${pilnoscClass(p.pilnosc)}">${p.pilnosc || ''}</span>
      </div>
      ${programLink}
    </div>`;
  }).join('');
}

function pilnoscClass(p) {
  if (!p) return 'low';
  if (p.toLowerCase().includes('wysok')) return 'high';
  if (p.toLowerCase().includes('średn') || p.toLowerCase().includes('sredn')) return 'med';
  return 'low';
}

function togglePropFilter(el) {
  const val = el.dataset.val;
  document.querySelectorAll('[data-prop-filter="status"]').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  activePropFilter = val;
  document.querySelectorAll('.proposal-card').forEach(card => {
    if (val === 'all') { card.style.display = ''; return; }
    card.style.display = card.dataset.propStatus === val ? '' : 'none';
  });
}
