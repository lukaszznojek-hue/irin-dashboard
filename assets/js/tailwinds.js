/* tailwinds.js - banner countdown + zakładka Tailwinds 2026 */

const TAILWINDS_DATA = [
  {
    id: 'aiact',
    ikona: '⚖️',
    tytul: 'AI Act - pełne stosowanie',
    status: 'W MOCY',
    deadline: '2026-08-02',
    opis: 'Rozporządzenie EU 2024/1689. Od 02.08.2026 pełne stosowanie: obowiązek AI literacy dla pracowników, rejestr systemów AI wysokiego ryzyka, wymogi transparentności.',
    co_irin: 'Szkolenia AI (klaster 01-04) pokrywają wymóg AI literacy. Argument sprzedażowy #1: kary do 35 mln EUR za non-compliance.',
    link: 'https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32024R1689'
  },
  {
    id: 'nis2',
    tytul: 'NIS2 - rejestracja podmiotów',
    ikona: '🛡️',
    status: 'TRANSPOZYCJA',
    deadline: '2026-10-03',
    opis: 'Dyrektywa NIS2 (2022/2555). Polska transpozycja: ustawa o krajowym systemie cyberbezpieczeństwa. Podmioty kluczowe i ważne muszą się zarejestrować i wdrożyć środki bezpieczeństwa.',
    co_irin: 'Szkolenia z cyberbezpieczeństwa (propozycja w pipeline). Cross-sell: szkolenie „Bezpieczeństwo cyfrowe" w ramach 02_sklep_cyfryzacja.',
    link: 'https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32022L2555'
  },
  {
    id: 'akademia_hr',
    tytul: 'Akademia HR - nabory PARP',
    ikona: '🎓',
    status: 'NABORY',
    deadline: '2026-11-30',
    opis: 'Program PARP „Akademia HR" - dofinansowanie usług rozwojowych z BUR dla MŚP. Nabory regionalne przez operatorów. Budżet: do 80% dofinansowania.',
    co_irin: 'Wszystkie szkolenia IRIN kwalifikują się (BUR ID 160205). Handlowiec: „Macie nabór Akademii HR w Waszym regionie? My jesteśmy w BUR."',
    link: 'https://www.parp.gov.pl/component/grants/grants/akademia-hr'
  },
  {
    id: 'inno_lab',
    tytul: 'Inno_Lab - dofinansowanie innowacji',
    ikona: '🔬',
    status: 'NABORY',
    deadline: '2026-12-31',
    opis: 'Program PARP dla MŚP na zakup usług doradczych i szkoleniowych związanych z innowacjami. Budżet EU z KPO.',
    co_irin: 'Szkolenia AI/cyfryzacja (klaster 01-04) + „Projekty dofinansowane" (09) kwalifikują się. Cross-sell naturalny.',
    link: 'https://www.parp.gov.pl/component/grants/grants/inno-lab'
  }
];

function renderTailwinds() {
  const el = document.getElementById('tailwinds-content');
  if (!el) return;
  const today = new Date();

  el.innerHTML = '<div class="tailwinds-grid">' + TAILWINDS_DATA.map(tw => {
    const deadline = new Date(tw.deadline);
    const days = Math.ceil((deadline - today) / 86400000);
    const urgency = days < 60 ? 'tw-urgent' : days < 120 ? 'tw-soon' : 'tw-ok';
    return `
      <div class="tailwinds-card ${urgency}">
        <div class="tw-card-header">
          <span class="tw-icon">${tw.ikona}</span>
          <span class="tw-status tw-status-${tw.status.toLowerCase().replace(' ', '-')}">${tw.status}</span>
        </div>
        <h4 class="tw-card-title">${tw.tytul}</h4>
        <div class="tw-countdown">
          <span class="tw-days">${days}</span> dni do deadline
          <span class="tw-date">(${tw.deadline})</span>
        </div>
        <p class="tw-desc">${tw.opis}</p>
        <div class="tw-irin">
          <strong>Co IRIN może zrobić:</strong> ${tw.co_irin}
        </div>
        <a href="${tw.link}" target="_blank" rel="noopener" class="tw-link">Źródło ↗</a>
      </div>
    `;
  }).join('') + '</div>';
}

function updateTailwindsBanner() {
  const el = document.getElementById('tw-aiact-days');
  if (!el) return;
  const days = Math.ceil((new Date('2026-08-02') - new Date()) / 86400000);
  el.textContent = days;
}
