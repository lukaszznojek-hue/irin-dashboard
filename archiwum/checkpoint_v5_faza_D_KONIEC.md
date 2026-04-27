# Refactor v5 - KONIEC sprintu

**Data:** 2026-04-27
**Branch zmergowany:** refactor/v5-grupowanie-deep-link → main (po commicie tego pliku)
**Tag wydania:** v5.0.0
**Live URL:** https://lukaszznojek-hue.github.io/irin-dashboard/

## Status

✓ Wszystkie 5 problemów rozwiązane (P1 grupowanie / P2 klikalne sygnały / P3 projekty BUR rozszerzone / P4 MD viewer / P5 benchmark cenowy)
✓ Live testy przeszły (357 powiatów w 16 grupach, MD modal działa, benchmark rendered, deep-linking)
✓ Walidator JSON Schema kończy OK (36 plików)
✓ Pre-commit hook executable i testowany
✓ Konsola przeglądarki: 0 błędów / 0 warningów
✓ Modułowy JS: 12 plików, każdy `node --check` OK

## Lista zmian dla Łukasza (do akceptacji)

1. **Grupowanie powiatów po województwie** - 16 zwijalnych sekcji z rollup'em (4 liczniki + suma kwot). Świętokrzyskie pierwsze (tier 1A IRIN).
2. **4 stany akcji** zamiast 5+warning: AKTYWNY (4 karty) / MONITORUJ (4) / ZADZWOŃ (334) / ZAKOŃCZONY (15). Mapowanie zachowuje stare urgency dla backward compat.
3. **Deep-linking via URL hash** - `#powiaty?akcja=monitor&woj=swietokrzyskie`, `#slownik?term=BUR`, `#szkolenia?kategoria=ai`. Klikalne stat-cards, KFS Banner, akcja tygodnia, P3/Akademia X w notatkach.
4. **MD viewer modal w Sprzedaży** (marked.js) - skrypty/maile otwierają się jako sformatowany MD z przyciskami "Skopiuj" i "Edytuj na GitHub".
5. **Benchmark cenowy szkoleń** - 4 kolumny + 4 strefy (cheaper/equal/higher/premium) z tooltipami sprzedażowymi. Hybrid: per-szkolenie override lub kategoria z `data/benchmarki_rynkowe.json`.
6. **Rozszerzone projekty BUR** w WUP (11 pól: id, kwota, intensywność, daty, grupa, regulamin, wniosek, dopasowane szkolenia, claudia_note, do_weryfikacji). Dane pozostają null, do uzupełnienia.
7. **5+ nowych filtrów Powiaty** (priorytet P1-P7, kwota <500k/500k-2M/>2M/brak, tier 1A/1B/2). 4 grupy filtrów Szkolenia. Filtr statusu Propozycji.
8. **JSON Schema validator** - 6 schematów Draft-7, pre-commit hook blokuje błędne JSON-y. Smoke-test z enum violation działa.
9. **Modułowy JS** - dashboard.js (534 linii) → 12 plików per zakładka.
10. **Akcja tygodnia per województwo** - pole w `data/wup/<woj>.json`, klik → auto-expand+scroll do urzędu (gotowe do użycia, dane null).

## Otwarte zadania (osobne sprinty)

- **Wypełnienie projekty_bur dla Tier 1A** (4 województwa) - migracja danych z BUR PARP, wymaga ręcznego researchu
- **Wypełnienie cena_h_rynek_avg per szkolenie** (override) - badanie 3-5 konkurentów per usługa
- **Wypełnienie akcja_tygodnia w wup/<woj>.json** - tygodniowa rutyna Łukasza/Claudii
- **Aktualizacja prezentacji IRIN** o nowe funkcje dashboardu (slajdy demo)
- **Dług techniczny:** liczba_uslug w meta szkolenia_irin.json = 12, faktycznie 9 - do skorygowania

## Co Łukasz powinien sprawdzić rano

1. Otwórz live URL - sprawdź czy zakładka **Powiaty** pokazuje 16 sekcji województw zwijalnych z rollup'em
2. Kliknij **Świętokrzyskie** (pierwsza grupa) - powinna mieć 14 kart, rollup `0/1/8/5 + 2 862 000 zł`
3. Filtr **🟡 Zadzwoń** w Powiaty - powinien pokazać ~334 karty
4. Stat-card **Krytyczne <7d** - klik powinien przeskoczyć do filtra Aktywne
5. Zakładka **Sprzedaż** → klik "Cold call" → modal z renderowanym Markdown + przycisk "Skopiuj"
6. Zakładka **Szkolenia IRIN** → tabela ma 11 kolumn, każda usługa ma badge benchmark (najechać myszką na badge → tooltip sprzedażowy)
7. Zakładka **WUP** → Świętokrzyskie pokazuje 1 projekt z badge ⚠️ "Do weryfikacji", inne województwa: "Brak projektów lub do uzupełnienia"
8. URL `#powiaty?akcja=aktywny&woj=swietokrzyskie,pomorskie` - powinien automatycznie zaaplikować filtry

## Pliki diagnostyczne

- `archiwum/audit_v5.md` - mapa kompletności pre-refactor
- `archiwum/checkpoint_v5_faza_0.md` - 0/A/B/C/D - po każdej fazie
- `archiwum/migration_*.log` - logi migracji 357 kart + 16 WUP + szkoleń
- `archiwum/data_backup_v4_20260427/` - backup data/ pre-migration (gitignore)
- `archiwum/validation_pre_v5.log` - smoke check JSON syntax
- `_claudia_system/learning_log.md` - wpis 2026-04-27 na końcu

## Czas wykonania

| Faza | Estymacja | Faktyczny |
|---|---|---|
| 0 | 15-20 min | ~15 min |
| A | 45-60 min | ~30 min |
| B | 60-90 min | ~75 min |
| C | 45-60 min | ~15 min (zintegrowane z B) |
| D | 30-45 min | ~25 min |
| **TOTAL** | **3-4.5h** | **~2h40min** |

Poniżej dolnej granicy estymacji - dzięki temu, że decyzje projektowe były rozstrzygnięte z góry (P1-P13 w instrukcji) i nie było STOP-protokołu.
