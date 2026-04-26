# Checkpoint v5 - Faza A (backend dane + walidator)

Data: 2026-04-27
Branch: refactor/v5-grupowanie-deep-link

## Wykonane

- [x] 6 schematów JSON Schema Draft-7 w `tools/schemas/`
  - powiat, wup, szkolenie_irin, propozycja, benchmark, meta
- [x] `tools/validate_jsons.py` - walidator z czytelnymi błędami (path + message)
- [x] `.git/hooks/pre-commit` (executable) - blokuje commit przy błędach JSON
- [x] `tools/migrate_v4_to_v5_powiaty.py` - 357 kart -> akcja_status
  - Aktywny: 4 (trwa)
  - Monitor: 4 (nadchodzi)
  - Zadzwoń: 334 (nieznany - główna masa, oczekiwane)
  - Zakończony: 15
- [x] `tools/migrate_v4_to_v5_wup.py` - 16 plików WUP
  - Dodane akcja_tygodnia + akcja_tygodnia_target (null)
  - Rozszerzone 11 pól projektów BUR (2 istniejące projekty)
- [x] `tools/migrate_v4_to_v5_szkolenia.py`
  - 9 usług IRIN -> cena_h_rynek_avg + cena_h_rynek_zrodlo (null)
  - 10 propozycji -> status: "pomysl" + owner_irin/url_program/komentarze
- [x] `data/benchmarki_rynkowe.json` (nowy, 6 kategorii: ai/edukacja/biznes/soft_skills/regulacje/ai_regulacje)
- [x] `docs/INSTRUKCJA_AKTUALIZACJI.md` - krok 4 odsyła do `tools/validate_jsons.py`

## Walidacja końcowa

```
$ python3 tools/validate_jsons.py
OK: 36 plikow JSON poprawnych zgodnie ze schematami v5.
```

Smoke-test: wstrzyknięto `akcja_status: "zly_status"` -> walidator wyrzucił enum violation z exit 1, po przywróceniu OK.

## Decyzje własne (poza instrukcją)

- Schematy traktują **wszystkie nowe pola jako optional** (nullable) - backward compat z v4 nie wymaga obecności pól w starych plikach. Dzięki temu walidator nie wybucha jeśli ktoś ręcznie doda kartę bez akcja_status.
- `liczba_uslug: 12` w szkolenia_irin.json (faktycznie 9) - zostawione jako informacyjne (nie required), bo to dług techniczny do osobnego sprintu.
- Migracja `szkolenia_irin.json` to osobny plik zamiast wspólnego z propozycjami - łatwiej re-runować.
- Pre-commit hook nie używa stash/restore - jeśli hook zwróci 1, commit po prostu się nie odbywa, użytkownik widzi błąd.

## Backward compatibility

Stare pola **NIE usunięte**: urgency, kfs_status, has_warning, urgency_days. UI w fazie B będzie czytać `akcja_status` jako primary, ale `mapUrgencyToAkcja()` zostaje jako fallback (instrukcja sekcja A1).

## Następna faza

Faza B (60-90 min): refactor JS na 12 modułów + grupowanie + 4 stany + deep-linking
