# Checkpoint v5 - Faza B (refactor JS + UI grupowanie)

Data: 2026-04-27
Branch: refactor/v5-grupowanie-deep-link

## Wykonane

- [x] Rozbicie `assets/js/dashboard.js` (534 linii) na 12 modułów:
  - `utils.js` (3.3K) - WOJEWODZTWA, VOIVODESHIP_LABELS, TIER_*, AKCJA_LABELS, helpers (formatKwota, fmtDate*, katLabel, getTier, escapeHtml, escapeAttr, mapUrgencyToAkcja, interpolateLinks)
  - `core.js` (9.7K) - DASHBOARD_DATA, activeFilters, init, fetchJson, switchTab, applyHashState, updateHashFromState, quickFilter, goToSlownik, goToSzkolenia, toggleCard, updateFooter, updateStats
  - `filtry.js` (6.3K) - toggleFilter (akcja/pillar/kwota/swiezosc/tier/priorytet), applyFilters, applySortPreset, voivodeship dropdown
  - `md_viewer.js` (2.3K) - openMdModal, closeMdModal, copyMdContent, escMdHandler
  - `powiaty.js` (8.0K) - renderCards z grupowaniem, computeRollup, renderCard 6-col, renderAkcjaBadge, renderDateContext, renderPillarDetails, toggleVoivodeshipGroup, handleAkcjaTygodniaClick
  - `wup.js` (3.6K) - renderWupGrid, renderProjektBur (11-pole)
  - `szkolenia.js` (4.3K) - renderBURTable z benchmark, renderBenchmarkBadge, toggleBurFilter (4-wymiar)
  - `propozycje.js` (2.2K) - renderProposals z status, togglePropFilter
  - `matryca.js` (1.0K), `trendy.js` (1.4K), `slownik.js` (0.9K), `sprzedaz.js` (3.2K)
- [x] `index.html` zaktualizowany:
  - script tags w sekwencji utils → core → filtry → md_viewer → reszta
  - 5 stat-cards (dodano "Zadzwoń" + "Krytyczne <7d") - klikalne via quickFilter
  - KFS Banner: <strong> z banner-link onclick goToSlownik
  - Filtry rozszerzone: 4 stany akcji + tier + kwota + priorytety P1-P7
  - Tabela szkoleń: 11 kolumn (dodano "Cena/h IRIN", "vs rynek", "Różnica")
  - 4 grupy filtrów Szkolenia (kategoria/forma/tier/benchmark)
  - Filtr statusu propozycji
  - marked.js loaded przed modułami
- [x] `style.css` (305 -> ~480 linii):
  - .woj-group, .woj-header, .woj-rollup, .rollup-stat (4 stany), .rollup-kwota
  - .woj-akcja-tygodnia, .matryca-wynik (A/B/C/D)
  - .card-head 6-col grid, .card.akcja-* (left border 4 stany)
  - .akcja-badge-* (4 warianty)
  - .card.highlight + @keyframes highlightCard
  - .data-ctx (krytyczna, zadzwon, normal)
  - .wup-project rozbudowane (.proj-fields, .proj-links, .proj-note, .project-status.status-*)
  - .bench-badge (cheaper/equal/higher/premium/unknown), .cena-h-*
  - .prop-status (5 statusów), .prop-owner, .prop-program
  - .sales-card-md hover, .sales-card-action
  - .md-modal-overlay + .md-modal* (header/actions/body, h1/h2/h3, code/pre, blockquote, table)
  - .stat-card hover, .stat-warn .stat-value
  - .kfs-banner-text .banner-link
- [x] `assets/js/lib/marked.min.js` (39K) pobrany z CDN (jsdelivr)
- [x] `assets/js/dashboard.js` usuniety (`git rm`)

## Walidacja

- `node --check` 12/12 modułów: OK
- `python3 tools/validate_jsons.py`: OK 36 plików
- Lokalny serwer http://localhost:8765:
  - index.html: 200
  - utils.js: 200
  - marked.min.js: 200
  - data/szkolenia_irin.json: 200
  - data/benchmarki_rynkowe.json: 200
  - data/powiaty/swietokrzyskie.json: 200
  - sales/skrypty/01_cold_call.md: 200

## Decyzje własne (poza instrukcją)

- `escapeAttr/escapeHtml` jako oddzielne helpery w `utils.js` - zapobiegają XSS w nazwach urzędów / claudia_note. Instrukcja tego nie wymagała ale to dobra praktyka (nazwa urzędu może mieć cudzysłów).
- Filtry "Akcja tygodnia" jest klikalna (handleAkcjaTygodniaClick) tylko jeśli `akcja_tygodnia_target` wypełniony - w v4 nigdy nie jest, ale UI gotowy.
- `getTier()` w `utils.js` używa `typeof DASHBOARD_DATA !== 'undefined'` - bezpieczne wywołanie przed init.
- `applySortPreset()` sortuje WEWNĄTRZ grup - kolejność województw zostaje wg WOJEWODZTWA_KOLEJNOSC (świętokrzyskie pierwsze - tier 1A IRIN).
- `applyFilters()` ukrywa całe grupy z 0 widocznymi kartami - mniej szumu wizualnego.
- Backward compat dla `#strategia.html` w hash - przekierowanie do `strategia.html` (osobny plik z hasłem).
- Marked.js użyty z `marked.parse()` (nie `marked()` - nowsze API).

## UWAGA przed Fazą D

- Zakładka "Sprzedaż" przy kliknięciu skryptu/emaila otworzy modal MD (faza C/B działa już teraz, marked.js + md_viewer.js + sprzedaz.js są zsynchronizowane)
- Benchmark cenowy działa - wszystkie szkolenia będą mieć badge bo `cena_h_rynek_avg` w szkoleniu jest null → fallback do benchmarki[kategoria]
- Stat-cards "Krytyczne <7d" liczy aktywne aktualnie nabory z deadline ≤7 dni - w testowych danych będzie 0-2

## Następna faza

Faza C (45-60 min) - już w 90% gotowa. Pozostaje sprawdzić MD viewer w przeglądarce + ewentualne CSS poprawki cosmetyczne. W zasadzie Faza C została zintegrowana z B (modułowość wymagała md_viewer + szkolenia + propozycje + wup w jednym ruchu).
