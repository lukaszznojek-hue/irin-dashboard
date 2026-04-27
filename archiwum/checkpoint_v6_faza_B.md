# Checkpoint v6.1 - Faza B (Reorganizacja sales/)

**Data:** 2026-04-27
**Branch:** refactor/v6.1-patch

## Wykonane

### B0 - Cleanup
- `git rm -rf sales/skrypty/` (6 plików) - odpowiedniki w `sales/uniwersalne/`
- `git rm -rf sales/emaile/` (8 plików) - odpowiedniki w `sales/per_persona/` + `sales/uniwersalne/`

### B2 - Hydratacja per_szkolenie
- Generator: `tools/hydrate_per_szkolenie.py` (ręczne template'y - prototyp 01 nie miał placeholderów)
- 9 folderów × 3 pliki = 27 nowych plików MD
- Klastry: ai (3), si_tus (5), dofinans (1)
- CROSS-SELL dopisek dla 09_projekty_dofinansowane

### B3 - Szef sprzedaży
- `kpi_dashboardy.md` - KPI handlowca + szefa, benchmarki, jak czytać dashboard
- `pipeline_review_template.md` - szablon 30-min piątkowego review
- `onboarding_handlowca.md` - plan 30/60/90 dni z checklistami
- `kalibracja_cen_negocjacje.md` - strefy zielona/żółta/pomarańczowa/czerwona

## Walidacja

- 10 folderów per_szkolenie/ (01 prototyp + 02-10 hydratowane) ✅
- 5 plików w szef_sprzedazy/ ✅
- Stare skrypty/ + emaile/ usunięte ✅
- 33 plików MD w per_szkolenie/ (6 prototyp + 27 nowe) ✅
- sales/README.md istnieje ✅

## Uwagi

- Folder 10 nosi nazwę `10_si_kielce_wrzesien` (nie `10_si_termin_4_kielce` z PATCH spec)
- Prototyp 01 ma 6 plików (pełny), reszta po 3 (minimum v6.1, v6.2 doda 3 dodatkowe)
