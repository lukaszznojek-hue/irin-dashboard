# Checkpoint v5 - Faza C (zintegrowana z B)

Data: 2026-04-27
Branch: refactor/v5-grupowanie-deep-link

## Wykonane (zintegrowane z fazą B)

C1. **Marked.js + MD viewer modal** ✓
- `assets/js/lib/marked.min.js` (39K) z jsdelivr CDN
- `assets/js/md_viewer.js` - openMdModal/closeMdModal/copyMdContent
- Sprzedaż: 17 sales-cards-md (skrypty/maile/bitrix) + Prezentacje
- Test live: tytuł "Cold call", body 4080 znaków, h1/h2/ul renderowane przez marked.js, btn "Skopiuj" działa

C2. **Benchmark cenowy w tabeli szkoleń** ✓
- 4 nowe kolumny: Cena/h IRIN, vs rynek, Różnica (badge)
- Hybrid: szkolenie.cena_h_rynek_avg ?? benchmarki[kategoria].cena_h_rynek_avg
- 4 strefy z tooltipami sprzedażowymi:
  - cheaper (>10% tańsi) - zielony
  - equal (±10%) - niebieski
  - higher (10-25% drożsi) - żółty
  - premium (>25% drożsi) - czerwony
- Test live: 9 wierszy, sample: "Social Media 295 zł vs 250 zł = ↑+18% higher"

C3. **Filtry rozszerzone Szkolenia** ✓
- 4 grupy: Kategoria + Forma + Tier + Cena/h
- toggleBurFilter: AND między grupami

C4. **Filtr statusu Propozycji** ✓
- 5 chips: Wszystkie / Pomysły / W analizie / W opracowaniu / Gotowe
- 10 propozycji wszystkie ze statusem "pomysl" (po migracji)

C5. **WUP rozszerzone projekty BUR** ✓
- renderProjektBur: id_bur + status + nazwa + warning + 5 pól (kwota/intensywność/daty/grupa/dopasowane) + linki regulamin/wniosek + claudia_note
- Świętokrzyskie i kujawsko-pomorskie pokazują 1 projekt każde z badge "do_weryfikacji"
- 14 województw bez projektów: "Brak projektów lub do uzupełnienia" (oczekiwane - migracja danych w osobnym sprincie)

## Live testy w Faza C (przed Faza D commit)

- Server: python3 -m http.server na porcie 8765 via Claude Preview
- Console: 0 błędów / 0 warningów
- 357 powiatów w 16 grupach z poprawnymi rollup'ami
- mapUrgencyToAkcja('nieznany') → 'zadzwon' ✓
- Filtr "aktywny" → 4 widoczne karty w 1 grupie
- Deep-link `#powiaty?akcja=monitor&woj=swietokrzyskie,pomorskie` → 4 karty w 2 grupach
- 49 notatek Claudii, 2 z interpolated links (P7, Akademia OZE)
- WUP: 16 kart, 2 projekty BUR, 14 placeholder
- Szkolenia: 9 wierszy, wszystkie z benchmark badge
- Propozycje: 10 widoczne, filtr "analiza" → 0
- Matryca: 16 wierszy z A/B/C/D
- MD viewer: tytuł "Cold call", marked.js renderuje markdown poprawnie

## Następna faza

Faza D: Aktualizacja docs/README + meta.json bump (5.0.0) + checkpoint końcowy + learning log + merge → main + tag v5.0.0
