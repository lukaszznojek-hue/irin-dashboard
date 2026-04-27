/* sprzedaz.js - linki sales (skrypty/emaile/bitrix/prezentacje) z MD viewer modal */

function renderSalesLinks() {
  const skrypty = [
    {title:'Cold call', file:'sales/skrypty/01_cold_call.md', desc:'Pierwszy kontakt z firmą - 3 warianty otwarcia, 5 obiekcji+odpowiedzi'},
    {title:'Follow-up', file:'sales/skrypty/02_follow_up.md', desc:'Po cold call bez decyzji'},
    {title:'Sprzedaż szkolenia', file:'sales/skrypty/03_sprzedaz_szkolenia.md', desc:'Prezentacja konkretnego szkolenia: potrzeba → dofinansowanie → szkolenie'},
    {title:'Obiekcje', file:'sales/skrypty/04_obiekcje.md', desc:'15 obiekcji + odpowiedzi'},
    {title:'Zamykanie', file:'sales/skrypty/05_zamykanie.md', desc:'5 technik zamykania'},
    {title:'After-sale', file:'sales/skrypty/06_after_sale.md', desc:'Po podpisaniu: referral, upsell, NPS'}
  ];
  const emaile = [
    {title:'HR manager', file:'sales/emaile/01_hr_manager.md', desc:'Profesjonalny, ROI HR, retencja'},
    {title:'Prezes mikrofirmy', file:'sales/emaile/02_prezes_mikrofirmy.md', desc:'Krótko, korzyść finansowa, 90% dofinansowania'},
    {title:'Dyrektor rozwoju', file:'sales/emaile/03_dyrektor_rozwoju.md', desc:'Kompetencje strategiczne, certyfikaty'},
    {title:'Spec. dofinansowań', file:'sales/emaile/04_specjalista_dofinansowan.md', desc:'Numery projektów, intensywność, terminy'},
    {title:'Księgowa', file:'sales/emaile/05_ksiegowa.md', desc:'Aspekty rozliczeniowe, koszt kwalifikowany'},
    {title:'Cold outreach', file:'sales/emaile/06_cold_outreach.md', desc:'Hook: priorytet PARP w branży klienta'},
    {title:'Follow-up po rozmowie', file:'sales/emaile/07_follow_up_po_rozmowie.md', desc:'Personalizowane, kalendarz, materiały'},
    {title:'Oferta szkolenia', file:'sales/emaile/08_oferta_konkretne_szkolenie.md', desc:'Z załącznikami: program, harmonogram, link BUR'}
  ];
  const bitrix = [
    {title:'Pola leada', file:'sales/bitrix/pola_lead.md', desc:'Obowiązkowe pola kontaktu w Bitrix'},
    {title:'Pola deala', file:'sales/bitrix/pola_deal.md', desc:'Specyfikacja pól transakcji'},
    {title:'Workflow', file:'sales/bitrix/workflow.md', desc:'Przepływ statusów lead→deal→realizacja'}
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
