/* sprzedaz.js - sekcja Per szkolenie + Propozycje promowane + linki sales (skrypty/emaile/bitrix/prezentacje) z MD viewer modal */

const PER_SZKOLENIE_FOLDERS = {
  '3432404': '01_social_media_ai',
  '3432500': '02_sklep_cyfryzacja',
  '3421591': '03_skutecznosc_ai',
  '3386476': '04_zarzadzanie_ai',
  '3420786': '05_si_gdansk_maj',
  '3405199': '06_si_gdansk_sierpien',
  '3270238': '07_si_kielce',
  '3379725': '08_tus_kielce',
  '3381926': '09_projekty_dofinansowane',
  '3486195': '10_si_kielce_wrzesien',
};

const PROPOZYCJE_FOLDERS = {
  'PROP-01': 'PROP-01_ai_act',
  'PROP-02': 'PROP-02_nis2',
};

function renderPropozycjePromowane() {
  const el = document.getElementById('sales-propozycje-promowane');
  if (!el || !DASHBOARD_DATA.propozycje?.propozycje) return;

  const promowane = DASHBOARD_DATA.propozycje.propozycje.filter(
    p => p.status === 'research_zakonczony' && PROPOZYCJE_FOLDERS[p.kod]
  );

  if (promowane.length === 0) {
    el.innerHTML = '';
    return;
  }

  el.innerHTML = promowane.map(p => {
    const folder = PROPOZYCJE_FOLDERS[p.kod];
    const base = 'sales/per_szkolenie/' + folder + '/';
    const tytulShort = p.tytul.length > 50 ? p.tytul.slice(0, 47) + '...' : p.tytul;
    const pilnoscBadge = p.pilnosc && p.pilnosc.includes('KRYTYCZNA') ? 'pilnosc-krytyczna' : 'pilnosc-normalna';
    return `
      <div class="sales-card sales-card-szkolenie sales-card-propozycja">
        <div class="sales-card-header">
          <span class="propozycja-kod ${pilnoscBadge}">${p.kod} ${p.pilnosc || ''}</span>
        </div>
        <div class="sales-card-title">${tytulShort}</div>
        <div class="sales-card-meta">${formatKwota(p.estymowana_cena)} · ${p.estymowane_godziny}h · ${p.forma}</div>
        <div class="sales-card-files">
          <span class="sales-file-btn" onclick="openMdModal('${base}one_pager.md', 'One-pager: ${escapeAttr(tytulShort)}')" title="One-pager">📋</span>
          <span class="sales-file-btn" onclick="openMdModal('${base}program_skrocony.md', 'Program: ${escapeAttr(tytulShort)}')" title="Program szczegółowy">📚</span>
          <span class="sales-file-btn" onclick="openMdModal('${base}skrypt_rozmowy.md', 'Skrypt: ${escapeAttr(tytulShort)}')" title="Skrypt rozmowy">🗣️</span>
          <span class="sales-file-btn" onclick="openMdModal('${base}email_cold.md', 'Email: ${escapeAttr(tytulShort)}')" title="Email cold">📧</span>
          <span class="sales-file-btn" onclick="openMdModal('${base}obiekcje_specyficzne.md', 'Obiekcje: ${escapeAttr(tytulShort)}')" title="Obiekcje">🛡️</span>
          <span class="sales-file-btn" onclick="openMdModal('${base}linki.md', 'Linki: ${escapeAttr(tytulShort)}')" title="Linki i źródła">🔗</span>
        </div>
        <div class="sales-card-action"><span class="bur-status">Status: research zakończony - rejestracja w BUR oczekuje</span></div>
      </div>
    `;
  }).join('');
}

function renderPerSzkolenie() {
  const el = document.getElementById('sales-per-szkolenie');
  if (!el || !DASHBOARD_DATA.szkolenia?.uslugi) return;

  el.innerHTML = DASHBOARD_DATA.szkolenia.uslugi.map(s => {
    const folder = PER_SZKOLENIE_FOLDERS[s.id_bur];
    if (!folder) return '';
    const base = 'sales/per_szkolenie/' + folder + '/';
    const url = 'https://uslugirozwojowe.parp.gov.pl/wyszukiwarka/uslugi/podglad?id=' + s.id_bur;
    const tierClass = 'tier-' + s.tier_priorytetu_irin;
    const tytulShort = s.tytul.length > 50 ? s.tytul.slice(0, 47) + '...' : s.tytul;
    return `
      <div class="sales-card sales-card-szkolenie">
        <div class="sales-card-header">
          <span class="tier-irin ${tierClass}">T${s.tier_priorytetu_irin}</span>
          <span class="bur-id-small">ID: ${s.id_bur}</span>
        </div>
        <div class="sales-card-title">${tytulShort}</div>
        <div class="sales-card-meta">${formatKwota(s.cena_brutto)} · ${s.godziny}h · ${s.forma}</div>
        <div class="sales-card-files">
          <span class="sales-file-btn" onclick="openMdModal('${base}one_pager.md', 'One-pager: ${escapeAttr(tytulShort)}')" title="One-pager">📋</span>
          <span class="sales-file-btn" onclick="openMdModal('${base}skrypt_rozmowy.md', 'Skrypt: ${escapeAttr(tytulShort)}')" title="Skrypt rozmowy">🗣️</span>
          <span class="sales-file-btn" onclick="openMdModal('${base}email_cold.md', 'Email: ${escapeAttr(tytulShort)}')" title="Email cold">📧</span>
        </div>
        <div class="sales-card-action"><a href="${url}" target="_blank" rel="noopener">Otwórz w BUR ↗</a></div>
      </div>
    `;
  }).join('');
}

function renderSalesLinks() {
  renderPropozycjePromowane();
  renderPerSzkolenie();

  const skrypty = [
    {title: 'Cold call', file: 'sales/uniwersalne/skrypt_cold_call.md', desc: 'Pierwszy kontakt z firmą'},
    {title: 'Follow-up', file: 'sales/uniwersalne/skrypt_follow_up.md', desc: 'Po cold call bez decyzji'},
    {title: 'Sprzedaż szkolenia', file: 'sales/uniwersalne/skrypt_sprzedaz_szkolenia.md', desc: 'Prezentacja szkolenia: potrzeba → dofinansowanie'},
    {title: 'Obiekcje', file: 'sales/uniwersalne/skrypt_obiekcje_ogolne.md', desc: 'Najczęstsze obiekcje + odpowiedzi'},
    {title: 'Zamykanie', file: 'sales/uniwersalne/skrypt_zamykanie.md', desc: 'Techniki zamykania'},
    {title: 'After-sale', file: 'sales/uniwersalne/skrypt_after_sale.md', desc: 'Po podpisaniu: referral, upsell, NPS'}
  ];
  const emaile = [
    {title: 'HR manager', file: 'sales/per_persona/hr_manager.md', desc: 'Profesjonalny, ROI HR, retencja'},
    {title: 'Prezes mikrofirmy', file: 'sales/per_persona/prezes_mikrofirmy.md', desc: 'Krótko, korzyść finansowa, 90% dofinansowania'},
    {title: 'Dyrektor rozwoju', file: 'sales/per_persona/dyrektor_rozwoju.md', desc: 'Kompetencje strategiczne, certyfikaty'},
    {title: 'Spec. dofinansowań', file: 'sales/per_persona/specjalista_dofinansowan.md', desc: 'Numery projektów, intensywność, terminy'},
    {title: 'Księgowa', file: 'sales/per_persona/ksiegowa.md', desc: 'Aspekty rozliczeniowe, koszt kwalifikowany'},
    {title: 'Cold outreach', file: 'sales/uniwersalne/email_cold_outreach.md', desc: 'Hook: priorytet PARP w branży klienta'},
    {title: 'Follow-up po rozmowie', file: 'sales/uniwersalne/email_follow_up.md', desc: 'Personalizowane, kalendarz, materiały'},
    {title: 'Oferta szkolenia', file: 'sales/uniwersalne/email_oferta_szablon.md', desc: 'Z załącznikami: program, harmonogram, link BUR'}
  ];
  const bitrix = [
    {title: 'Pola leada', file: 'sales/bitrix/pola_lead.md', desc: 'Obowiązkowe pola kontaktu w Bitrix'},
    {title: 'Pola deala', file: 'sales/bitrix/pola_deal.md', desc: 'Specyfikacja pól transakcji'},
    {title: 'Workflow', file: 'sales/bitrix/workflow.md', desc: 'Przepływ statusów lead→deal→realizacja'}
  ];

  renderSalesSection('sales-skrypty', skrypty);
  renderSalesSection('sales-emaile', emaile);
  renderSalesSection('sales-bitrix', bitrix);

  const prezGrid = document.getElementById('sales-prezentacje');
  if (prezGrid) {
    prezGrid.innerHTML = `<div class="sales-card">
      <div class="sales-card-title">Prezentacja IRIN ogólna</div>
      <div class="sales-card-desc">12-15 slajdów: oferta, dofinansowania, ROI, zespół</div>
      <div class="sales-card-action"><a href="sales/prezentacje/irin_ogolna.pptx" download>Pobierz PPTX ↓</a></div>
    </div>`;
  }
}

function renderSalesSection(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items.map(i => `
    <div class="sales-card sales-card-md" onclick="openMdModal('${i.file}', '${escapeAttr(i.title)}')">
      <div class="sales-card-title">${i.title}</div>
      <div class="sales-card-desc">${i.desc}</div>
      <div class="sales-card-action">Otwórz →</div>
    </div>
  `).join('');
}
