# Checkpoint v6.6 KONIEC - UI rozbudowa zakładki Mapa pieniędzy

**Data:** 2026-04-27
**Wersja meta.json:** 6.6.0
**Sesja CC:** plan mode → implementacja
**Live URL:** https://lukaszznojek-hue.github.io/irin-dashboard/ (po push)
**Hasło strategii:** byPC-R0SDrHbB-GS (bez zmian)

---

## CO ZROBIONE - 4 elementy zamknięte

### v6.6.1 - Real SVG mapa Polski

**Zastąpiona siatka 5x4 prostokątów konturami geograficznymi 16 województw.**

- Nowy plik: `assets/img/poland_voivodeships.svg` (24.7 KB, viewBox 1000x1000)
- Każdy `<path>` ma `id="woj-{slug}"`, `data-woj="{slug}"`, `data-cx`/`data-cy` (centroidy do pozycjonowania etykiet)
- Skrypt regenerujący: `tools/build_poland_svg.py` - pobiera 16 plików GeoJSON z andilabs/polska-wojewodztwa-geojson, projekcja Mercator, distance-based simplification (tol=0.3px)
- Zmiana w `renderMapaSvg()` (mapa_pieniedzy.js): async fetch z cache modułowym, podpięcie `colorForKwota` na fill, click handler na każdy path, etykiety jako osobna grupa `<g class="mapa-svg-labels">` z czytaniem cx/cy z atrybutów
- CSS: `.mapa-woj-cell` z hover stroke #c9a227 + width 3, `.mapa-svg` max-width 600px

### v6.6.2 - Eksport CSV TOP-20 powiatów

**Przycisk "📥 Pobierz CSV" generuje plik z polskimi znakami dla handlowców.**

- Nowy element `<button id="btn-eksport-csv-powiaty">` w `mapa-h3-row` (obok H3 sekcji TOP-20)
- Funkcje JS: `csvEscape()` (RFC 4180 escape), `eksportCSV(rows)` (Blob + download), `setupCsvExport(rows)` (podpięcie onclick)
- Header: `rank, powiat, wojewodztwo, kwota_kfs_pln, status, data_start, data_end, score, telefon, email, url_pup, lead_claudia`
- UTF-8 BOM dla poprawnego otwierania w Excelu z polskimi znakami (ł, ą, ś)
- Filename: `top20_powiaty_YYYY-MM-DD.csv`

### v6.6.3 - Filtry tabeli WUP wide + sortowanie

**3 dropdowny + clear + sortowanie wszystkich kolumn klikiem nagłówka.**

- Filterbar `<div class="wup-wide-filters">` nad tabelą:
  - Match IRIN: wszystkie / ⭐+ / ⭐⭐+ / ⭐⭐⭐
  - SUMA pieniędzy: wszystkie / ≥30 / ≥50 / ≥100 mln
  - Priorytety: wszystkie / pełne 3/3 / z lukami
  - Przycisk "Wyczyść"
  - Licznik "X z 16 wojew." (po prawej)
- Refaktor `renderTabelaWupWide()`: rozbita na `buildWupRows()` + `applyWupFilters()` + `sortWupRows()` + render
- State sortowania: `_wupSortKey` ('total' default), `_wupSortDir` ('desc' default)
- Każda kolumna `<th data-sort="kfs|sumaBur|total|prCount|matchCount|label">` klikalna - toggle asc/desc, indykator `▼/▲`
- `setupWupWideControls()` wywoływane raz w `renderMapaPieniedzy()` (idempotentne dzięki flagi `_wired`)

### v6.6.4 - Mobile responsive

**Nowy breakpoint `@media (max-width: 600px)` dla 5 obszarów.**

- `.timeline-grid` → 1fr (single column miesięcy)
- `.timeline-event` → 1fr (data nad tytułem zamiast obok), gold accent date
- `.tabela-wup-wide` → font-size 11px, kompakt padding
- `.wup-wide-filters` → labels full-width, selecty flex:1
- `.mapa-h3-row` → column flow (button pełna szerokość)
- `.mapa-tabela-drilldown` → block z overflow-x:auto
- `.mapa-stats` → 1fr (statystyki pionowo)

---

## STATYSTYKI

| Metryka | Wartość |
|---|---|
| Pliki nowe | 2: `assets/img/poland_voivodeships.svg` + `tools/build_poland_svg.py` |
| Pliki zmodyfikowane | 4: `index.html`, `assets/js/mapa_pieniedzy.js`, `assets/css/style.css`, `data/meta.json` |
| Linie JS dodane | ~140 (eksportCSV + setupCsvExport + buildWupRows + applyWupFilters + sortWupRows + setupWupWideControls + renderMapaSvg async refactor) |
| Linie CSS dodane | ~35 (filterbar + sort indicators + mobile @media + button) |
| Walidacja | `tools/validate_jsons.py` PASS · `tools/smoke_test_v6.py` ALL PASS · 0 console errors |

---

## WERYFIKACJA E2E

✅ **Lokalnie** (`python3 -m http.server 8765 --directory dashboard_v4`):
- Mapa SVG: 16 województw z konturami, klik → drill-down (mazowieckie, śląskie sprawdzone)
- CSV: kliknięcie generuje plik UTF-8 BOM z 20 wierszami, polskie znaki OK (testowe linie z PUP Sokołów Podlaski, MUP Gdańsk)
- Filtry: ⭐⭐+ + ≥50 mln → 1 z 16 wojew. (śląskie z 2+ matchami i 263 mln SUMĄ)
- Sortowanie: klik "KFS 2026" desc → Mazowieckie 68.5 mln pierwsze
- Mobile 535px viewport: timeline pionowo, tabela 11px, filterbar w kolumnie

✅ **Walidacja**: 36 plików JSON OK, smoke test ALL PASS, brak console errors

---

## OTWARTE NA v6.7+

### Najwyższy priorytet (z v6.5.1)
1. **6 WUP-ów bez kwot BUR** (dolnoslaskie/wielkopolskie/lubuskie/opolskie/podlaskie/zach-pom)
2. **6 WUP-ów z niepełnymi priorytetami wojew.** - parsing PDF uchwał Zarządu Województwa

### UI ulepszenia (możliwe w v6.7)
3. Skala kolorów dla mapy SVG bardziej kontrastowa - obecnie wszystkie 16 woj. są podobnie czerwone (skala log10 płaska dla kwot KFS 9.5-68.5 mln)
4. Tooltip rich content (nie tylko `<title>`) z hover delay - kwoty BUR, projekty, daty
5. Zoom/pan na mapie SVG (przy małych województwach jak opolskie, świętokrzyskie)
6. Eksport CSV dla całej tabeli WUP wide (analogicznie do TOP-20 powiatów)
7. Persist filtry w `localStorage` (zachowanie po reloadzie)

### Strategiczne (z v6.5.1)
8. Trener PROP-01/02 - decyzja Łukasza
9. Rejestracja PROP-01/02 w BUR
10. PROP-04 Akademia HR z AI
11. Cudzoziemcy / PROP-12 / PROP-13 - propozycje nowe

---

## LEKCJE Z SESJI

**Co zadziałało:**
- Plan mode z 3 Explore agents równolegle (1 z hallucination ale 2 dały solidne ground-truth)
- AskUserQuestion przed pisaniem kodu (SVG źródło) - oszczędziło iterację po wyborze
- Skrypt `tools/build_poland_svg.py` jako reproducible build (nie hard-coded SVG w repo) - użytkownik może regenerować z innych danych
- `data-cx`/`data-cy` w SVG paths zamiast `getBBox()` JS - omija timing issue z renderowaniem przy `display:none` panelach
- Preview MCP eval + screenshot dla weryfikacji wizualnej + interakcyjnej (filtr, sort, hover)

**Co nie zadziałało (i jak rozwiązane):**
- Wikipedia Commons SVG (Voivodeships_of_Poland.svg) miał scaleone path-y dla kilku województw → zmiana strategii na GeoJSON + projekcja Mercator
- `getBBox()` zwracał {0,0,0,0} dla path-ów w SVG dopiero co wstrzykniętym do DOM → centroidy w atrybutach zamiast runtime calc
- Pierwszy stable matching (greedy per label) miał dist 600+ dla 2 województw → globalne sortowanie par i przypisanie greedy per najmniejszy dist

**Wzorzec do utrwalenia:**
- Buildable assets (skrypty Python w `tools/` regenerujące z external data) > hard-coded blobs - łatwiej iterować i odświeżać
- Async fetch + module-scope cache dla często używanych assets (SVG, JSON) - szybkie po pierwszym ładowaniu

---

**Status:** ✅ Sprint v6.6 zakończony. UI zakładki Mapa pieniędzy rozbudowane. 4/4 elementy z planu wdrożone.
**Czas pracy:** ~3h (eksploracja + plan + 4 elementy + walidacja)
