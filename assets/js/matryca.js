/* matryca.js - tabela matryca regionalna */

function renderMatryca() {
  const tbody = document.getElementById('matryca-tbody');
  if (!tbody || !DASHBOARD_DATA.matryca?.wojewodztwa) return;
  tbody.innerHTML = DASHBOARD_DATA.matryca.wojewodztwa.map(w => {
    const cells = ['bur','kfs','efs','doradztwo','elearning'].map(k => {
      const v = w.oceny[k];
      const icon = v === 'high' ? '★' : v === 'med' ? '◐' : v === 'low' ? '○' : '—';
      return `<td class="mat-cell ${v}">${icon}</td>`;
    }).join('');
    const tier = getTier(w.wojewodztwo);
    const tierColor = TIER_COLORS[tier] || '#999';
    return `<tr title="${escapeAttr(w.uzasadnienie || '')}">
      <td><strong>${VOIVODESHIP_LABELS[w.wojewodztwo] || w.wojewodztwo}</strong></td>
      <td><span class="tier-badge small" style="background:${tierColor}">${tier.toUpperCase()}</span></td>
      ${cells}
      <td><span class="mat-wynik ${w.wynik}">${w.wynik}</span></td>
    </tr>`;
  }).join('');
}
