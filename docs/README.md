# Dashboard IRIN v4 — instrukcja dla zespołu

## Co to jest

Dashboard KFS + BUR + EFS+ to narzędzie online dla zarządu i zespołu sprzedaży IRIN. Pokazuje:
- **Powiaty** — nabory KFS w 357 powiatach (16 województw)
- **WUP** — Wojewódzkie Urzędy Pracy z priorytetami wojewódzkimi i projektami BUR
- **Szkolenia IRIN** — 12 aktualnych usług w BUR PARP + 10 propozycji nowych
- **Matryca** — dopasowanie IRIN × województwo (wynik A/B/C/D)
- **Trendy 2026** — regulacje (NIS2, AI Act, CSRD), technologie, soft skills
- **Słownik** — 12 terminów (KFS, BUR, EFS+, PUP, WUP, etc.)
- **Sprzedaż** — 6 skryptów telefonicznych + 8 wzorców email + specyfikacja Bitrix CRM

## Jak czytać

### Kolory pilności (lewa krawędź karty)
- 🔴 **Czerwony** — KRYTYCZNE: nabór kończy się za <3 dni, natychmiastowe działanie
- 🟠 **Pomarańczowy** — PILNE: 3-7 dni do końca
- 🟢 **Zielony** — TRWA: ponad 7 dni, bez alarmu
- 🔵 **Niebieski** — NADCHODZI: nabór ogłoszony, jeszcze nie otwarty
- ⬜ **Szary** — ZAKOŃCZONY lub brak danych

### Gwiazdka ★ IRIN
Pojawia się przy powiatach i priorytetach kluczowych dla oferty IRIN (P3: AI/cyfryzacja, P4: sektor zdrowotny).

### Tier pokrycia danych
- **TIER 1A** (zielony) — pełne dane: świętokrzyskie, pomorskie, zachodniopomorskie, kujawsko-pomorskie
- **TIER 1B** (pomarańczowy) — dane podstawowe: wielkopolskie, śląskie, dolnośląskie, małopolskie, mazowieckie
- **TIER 2** (szary) — skeleton: 7 pozostałych (do uzupełnienia przez zespół)

### Zakładka Strategia (🔒)
Osobna strona (strategia.html), wymaga hasła. Zawiera: pozycjonowanie, plan ekspansji, ryzyka, dane finansowe.

## Jak filtrować

1. **Status** — kliknij chip (Krytyczne/Pilne/Trwają/Nadchodzą/Zakończone)
2. **Filar** — KFS lub EFS+
3. **Województwo** — dropdown z checkboxami, multi-select
4. **Sortowanie** — pilność / kwota / dopasowanie IRIN / geograficznie

## Jak zgłosić aktualizację

1. Zadzwoń do PUP i potwierdź dane (termin, kwota)
2. Napisz do Łukasza lub Claudii: "PUP X ma nowy nabór: data Y-Z, kwota W zł"
3. Claudia zaktualizuje dashboard w poniedziałek (cykl tygodniowy)

## Cykl tygodniowy aktualizacji

Każdy poniedziałek:
1. Claudia sprawdza nowe nabory KFS/BUR w TIER 1A (4 woj.)
2. Aktualizuje pliki JSON
3. Commit + push → automatyczny deploy GitHub Pages (~1 min)
4. Łukasz dostaje raport zmian

## Kontakt

- Łukasz Znojek (prezes) — koordynacja dashboardu
- Claudia (AI) — aktualizacja danych, generowanie raportów
- biuro@irin.pl — pytania operacyjne
