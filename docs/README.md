# Dashboard IRIN v5 — instrukcja dla zespołu

## Co to jest

Dashboard KFS + BUR + EFS+ to narzędzie online dla zarządu i zespołu sprzedaży IRIN. Pokazuje:
- **Powiaty** — nabory KFS w 357 powiatach (16 województw, **pogrupowane per województwo**)
- **WUP** — Wojewódzkie Urzędy Pracy z priorytetami wojewódzkimi i projektami BUR (11 pól)
- **Szkolenia IRIN** — usługi w BUR PARP + 10 propozycji nowych + **benchmark cenowy vs rynek**
- **Matryca** — dopasowanie IRIN × województwo (wynik A/B/C/D)
- **Trendy 2026** — regulacje (NIS2, AI Act, CSRD), technologie, soft skills
- **Słownik** — terminy (KFS, BUR, EFS+, PUP, WUP, etc.)
- **Sprzedaż** — skrypty + maile + Bitrix CRM (otwierane w **MD viewer modal**)

## Co nowego w v5 (2026-04-27)

- **Grupowanie powiatów po województwie** - 16 zwijalnych sekcji z rollup'em (4 liczniki + suma kwot)
- **4 stany akcji** zamiast 5 + warning: AKTYWNY / MONITORUJ / ZADZWOŃ / ZAKOŃCZONY
- **Deep-linking** - klikalne sygnały w stat-cards, KFS Banner, akcja tygodnia, notatki Claudii (`P3`, `Akademia X`)
- **MD viewer modal** - skrypty/maile sprzedażowe otwierają się jako sformatowany Markdown z przyciskiem "Skopiuj"
- **Benchmark cenowy** szkoleń: 4 strefy (tańsi / równi / drożsi / premium) + tooltip z argumentem sprzedażowym
- **5+ nowych filtrów**: priorytet PARP, kwota, świeżość, forma, tier IRIN
- **JSON Schema validator** + pre-commit hook (blokuje commit błędnych JSON-ów)
- **Modułowy JS**: 12 plików per zakładka (zamiast 1 dashboard.js)

## Jak czytać

### 4 stany akcji (lewa krawędź karty + badge)

- 🟢 **AKTYWNY** (zielony) — nabór trwa, **dzwoń żeby sprzedać**
- 🔵 **MONITORUJ** (niebieski) — nabór nadchodzi lub historyczne dane, **wpisz w kalendarz**
- 🟡 **ZADZWOŃ** (żółty) — brak danych w internecie, **zadzwoń do PUP żeby się dowiedzieć**
- ⬜ **ZAKOŃCZONY** (szary) — nabór zakończony, kontekst archiwalny

Mapowanie z v4: `krytyczny/pilny/trwa → aktywny`, `nadchodzi → monitor`, `nieznany/has_warning → zadzwon`, `zakonczony → zakonczony`.

### Rollup per województwo

Każda grupa pokazuje 4 liczniki + sumę kwot:
```
Świętokrzyskie [PEŁNE] [A]    🟢4 🔵1 🟡8 ⬜5    2 862 000 zł
```

### Akcja tygodnia

Pomarańczowy pasek pod nagłówkiem grupy. Klik → auto-expand karty wskazanego urzędu.

### Gwiazdka ★ IRIN

Powiaty/priorytety kluczowe dla oferty IRIN (P3: AI/cyfryzacja, P4: sektor zdrowotny).

### Tier pokrycia danych

- **TIER 1A** (zielony) — pełne dane: świętokrzyskie, pomorskie, zachodniopomorskie, kujawsko-pomorskie
- **TIER 1B** (pomarańczowy) — dane podstawowe: wielkopolskie, śląskie, dolnośląskie, małopolskie, mazowieckie
- **TIER 2** (szary) — skeleton: 7 pozostałych

### Zakładka Strategia (🔒)

Osobna strona (`strategia.html`), wymaga hasła. Pozycjonowanie, plan ekspansji, ryzyka, finanse.

## Jak filtrować

W zakładce Powiaty (chips poziome):

1. **Akcja**: Wszystkie / Aktywne / Monitor / Zadzwoń / Zakończone
2. **Filar**: KFS / EFS+
3. **Tier**: Wszystkie / 1A / 1B / 2
4. **Kwota**: <500k / 500k-2M / >2M / brak
5. **Priorytet PARP**: P1-P7 (multi-select)
6. **Województwa**: dropdown z checkboxami
7. **Sortuj**: pilność / kwota / dopasowanie IRIN / alfabetycznie

W zakładce Szkolenia:
- Kategoria, Forma, Tier IRIN, **Cena/h** (tańsi / na poziomie / drożsi / premium)

W zakładce Propozycje (sekcja w Szkoleniach):
- Status: pomysł / w analizie / w opracowaniu / gotowe

## Deep-linking

URL hash zachowuje stan filtrów. Można udostępniać konkretny widok:

- `#powiaty?akcja=aktywny` - tylko aktywne nabory
- `#powiaty?akcja=monitor&woj=swietokrzyskie,pomorskie` - monitor w 2 województwach
- `#powiaty?urzad=PUP%20Kielce` - auto-expand karty
- `#szkolenia?kategoria=ai` - filtr w tabeli
- `#slownik?term=BUR` - auto-expand terminu

## Benchmark cenowy

Kolumny w tabeli szkoleń:
- **Cena/h IRIN** - wartość z `data/szkolenia_irin.json`
- **vs rynek** - z `data/benchmarki_rynkowe.json` (kategoria) lub override per szkolenie (`cena_h_rynek_avg`)
- **Różnica** badge:
  - `bench-cheaper` (zielony, ↓ x%) - tańsi >10%
  - `bench-equal` (niebieski, ~ ±10%) - równi rynkowi
  - `bench-higher` (żółty, ↑ +x%) - drożsi 10-25%
  - `bench-premium` (czerwony, ↑ +x%) - premium >25%

Najedź myszką na badge - pokaże się **argument sprzedażowy** dopasowany do strefy.

## Walidacja danych

Pre-commit hook automatycznie sprawdza JSON-y zgodnie ze schematami w `tools/schemas/`. Błędny JSON = blokada commita. Manualnie:

```bash
python3 tools/validate_jsons.py
```

Wymaga: `pip3 install --user jsonschema`.

## Jak zgłosić aktualizację

1. Zadzwoń do PUP i potwierdź dane (termin, kwota)
2. Napisz do Łukasza lub Claudii: "PUP X ma nowy nabór: data Y-Z, kwota W zł"
3. Claudia zaktualizuje dashboard w poniedziałek (cykl tygodniowy)

## Cykl tygodniowy aktualizacji

Każdy poniedziałek:
1. Claudia sprawdza nowe nabory KFS/BUR w TIER 1A (4 woj.)
2. Aktualizuje pliki JSON
3. `python3 tools/validate_jsons.py` (pre-commit hook robi to automatycznie)
4. Commit + push → automatyczny deploy GitHub Pages (~1 min)

## Kontakt

- Łukasz Znojek (prezes) — koordynacja dashboardu
- Claudia (AI) — aktualizacja danych, generowanie raportów
- biuro@irin.pl — pytania operacyjne
