# Audyt v4 → v5 (przed refaktorem)

Data: 2026-04-27
Branch: refactor/v5-grupowanie-deep-link
Tag rollback: v4.0.0-pre-refactor-v5

## Stan plików

| Plik | Linii |
|---|---|
| index.html | 224 |
| assets/js/dashboard.js | 534 |
| assets/css/style.css | 304 |
| 16 plików data/powiaty/*.json | 357 powiatów |
| 16 plików data/wup/*.json | 2 projekty BUR (Świętokrzyskie 1, brak reszty) |
| data/szkolenia_irin.json | 9 usług (4 AI, 4 edukacja, 1 biznes) |
| data/szkolenia_propozycje.json | 10 propozycji |

## dashboard.js — analiza funkcjonalna

Globale:
- `WOJEWODZTWA_KOLEJNOSC` - lista 16 województw w kolejności tier (świętokrzyskie pierwsze)
- `VOIVODESHIP_LABELS` - mapa slug → nazwa polska
- `TIER_LABELS`, `TIER_COLORS`
- `DASHBOARD_DATA` - obiekt globalny z całością danych
- `activeFilters` - { status, pillar, voivodeships:Set }

Funkcje:
- `init()` - Promise.all 23 fetchy (meta, slownik, parp, trendy, szkolenia, propozycje, matryca, 16 powiatów), potem 16 WUP
- `renderAll()` → renderCards / renderVoivodeshipChips / renderWupGrid / renderBURTable / renderProposals / renderMatryca / renderTrendy / renderSlownik / renderSalesLinks
- `renderCards()` - flat list 357 kart (P1 - bez grupowania)
- `renderCard()` - układ flex left/right
- `renderPillarDetails()` - sekcja KFS/EFS+ wewnątrz karty
- `renderVoivodeshipChips()` - dropdown z checkboxami województw
- `toggleFilter()` - status (1 z 6) + pillar (KFS/EFS+) - radio per grupa
- `applyFilters()` - filtruje po dataset (status, pillar, voivodeship)
- `applySortPreset()` - 4 presety: urgency / amount / irin / geo
- `urgencyOrder()` - mapuje 6 statusów na 0-5
- `switchTab()` - prosty hash routing (tylko tab, bez query)
- `processCardUrgency()` - liczy urgency z dat
- `formatUrgencyLabel()` - mapuje urgency na label PL
- `renderWupGrid()` - 16 kart WUP (P3 - prymitywne projekty_bur)
- `renderBURTable()` - tabela szkoleń, brak benchmark cenowego (P5)
- `toggleBurFilter()` - tylko 1 grupa (kategoria)
- `renderProposals()` - karty propozycji bez statusu/owner
- `renderMatryca()` - tabela matryca regionalna
- `renderTrendy()` - karty trendów
- `renderSlownik()` - akordeon słownika
- `renderSalesLinks()` - karty sales (P4 - linki na .md raw)
- `getTier()` - czyta tier z meta.tier_pokrycia

Punkty wpięcia hooków v5:
- `renderCards()` → grupowanie po wojewodztwie + rollup
- `renderCard()` → 4 stany akcja_status zamiast urgency, 6-kolumnowy grid
- `renderSalesSection()` → openMdModal zamiast href
- `renderBURTable()` → nowe kolumny benchmark
- `toggleFilter()` → multi-wymiar (akcja, pillar, woj, priorytet, kwota, świeżość)
- `switchTab()` → rozszerzony hash z query params
- KFS Banner i stat-cards → onclick→quickFilter

## CSS — paleta (zmienne wymagane przez v5)

W `:root`:
- `--krem-jasny`, `--krem`, `--linia`, `--granat`, `--zloto`, `--zloto-jasny`, `--szary`, `--szary-jasny`
- Kolory urgency: `--trwa`, `--trwa-bg`, `--nadchodzi`, `--nadchodzi-bg`, `--pilne`, `--pilne-bg`, `--zakonczony`, `--zakonczony-bg`
- Klasy używane: card, card-head, card-body, status-badge, tier-badge, irin-star, warning-badge, pillar-tag, claudia-note, wup-card, wup-project, etc.

## Kompletność danych

### Powiaty (357 łącznie)
- amount_kfs > 0: **tylko 5/357** (1.4%)
- daty KFS wypełnione: **14/357** (3.9%)
- pillar_details: **25/357** (7.0%)
- irin_match: **33/357** (9.2%)

Urgency breakdown:
- `nieznany`: 334 (93.6%) - większość kart bez kontekstu czasowego
- `zakonczony`: 15
- `trwa`: 4
- `nadchodzi`: 4

Mapowanie na 4 nowe stany (akcja_status):
- aktywny: trwa(4) + pilny(0) + krytyczny(0) = **4**
- monitor: nadchodzi(4) = **4**
- zadzwon: nieznany(334) + warning = **~334** (główna masa)
- zakonczony: 15

### WUP (16 wojewodztw)
- z projektami: **2/16** (Świętokrzyskie 1, ?)
- pustych: 14
- łącznie projektów BUR w systemie: **2**

→ Faza A: schemat `projekty_bur` rozszerzony do 11 pól, ale **wszystkie wartości null + do_weryfikacji: true**. Migracja danych = osobny sprint (Łukasz akceptuje, P2 w decyzjach projektowych).

### Szkolenia IRIN
- 9 usług (deklarowane 12 w meta - **DŁUG: liczba_uslug nieaktualna**)
- Kategorie: ai(4), edukacja(4), biznes(1)
- Brak: cena_h_rynek_avg w żadnym

### Propozycje
- 10 wpisów, brak status/owner/url_program

## Ryzyka migracji

1. **liczba_uslug w szkolenia_irin.json = 12, faktycznie 9** → schema validation może się wywalić jeśli enforce. Rozwiązanie: w schemacie traktujemy `liczba_uslug` jako informacyjne (nieobowiązkowe).
2. **357 kart z urgency=nieznany** → po migracji wszystkie staną się `akcja_status: zadzwon`. Filtr "Zadzwoń" zwróci 334+. To OK - dokładnie taki był punkt sprzedażowy ("trzeba dzwonić bo nic nie wiemy").
3. **2 projekty BUR w 16 WUP** → po rozszerzeniu schematu wszystkie istniejące pozostają z null + do_weryfikacji=true. Brak danych do wymyślania.
4. Brak sales/prezentacje/irin_ogolna.pdf - tylko pptx. MD viewer nie dotyczy pptx.

## Dług techniczny zauważony (NIE naprawiamy w tym sprincie)

- `liczba_uslug: 12` vs realne 9 w szkolenia_irin.json
- `archiwum/` nie istniało - utworzono podczas Fazy 0
- `tools/` puste - utworzymy walidator + migracje w Fazie A
- `assets/js/lib/` puste - marked.js dodamy w Fazie C
- `meta.json` ma tier_pokrycia ale nie tier per województwo - getTier() działa, OK

## Kolejność wpinania v5

1. Faza A: schematy → migracja powiaty → migracja wup → benchmarki.json → szkolenia.cena_h_rynek_avg → propozycje.status → walidator
2. Faza B: rozbicie JS → grupowanie → 4 stany → deep-linking
3. Faza C: marked.js → MD modal → benchmark UI → filtry
4. Faza D: testy → docs → merge → tag → learning log
