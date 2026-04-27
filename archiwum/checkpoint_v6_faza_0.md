# Checkpoint v6.1 - Faza 0' (Pre-execution audit)

**Data:** 2026-04-27
**Branch:** refactor/v6.1-patch
**Tag rollback:** pre-v6.1

## Wynik audytu

```json
{
  "A1_10_uslug": true,
  "A2_15_propozycji": true,
  "A4_slownik": true,
  "A_meta_6.0": true,
  "B1_per_persona": true,
  "B1_uniwersalne": true,
  "B1_stare_usuniete": false,
  "B2_per_szkolenie_full": false,
  "B3_szef_sprzedazy_5": false,
  "B4_readme": true,
  "C_tailwinds_zakladka": false,
  "C_kalkulator": false,
  "C_banner_tailwinds": false,
  "X_strategia_encrypted": false,
  "X_kpi_computed": false
}
```

## DO ZROBIENIA (8 pozycji)

1. B1_stare_usuniete - usunąć sales/skrypty/ i sales/emaile/
2. B2_per_szkolenie_full - hydratacja 9 folderów (02-10) × 3 pliki
3. B3_szef_sprzedazy_5 - 4 nowe pliki szef_sprzedazy/
4. C_tailwinds_zakladka - zakładka Tailwinds 2026
5. C_kalkulator - mini-kalkulator dofinansowania
6. C_banner_tailwinds - banner countdown AI Act
7. X_strategia_encrypted - enkrypcja strategii AES-256
8. X_kpi_computed - compute KPI z danych

## SKIP (zrobione w pre-sprint)

- Faza A kompletna (10 usług, 15 propozycji, słownik, meta 6.x)
- B1 per_persona (5 plików) + uniwersalne (9 plików) + README
- Prototyp 01_social_media_ai (6 plików)

## Uwagi

- Folder 10 nosi nazwę `10_si_kielce_wrzesien` (nie `10_si_termin_4_kielce` z PATCH spec)
- sales/skrypty/ i sales/emaile/ nadal istnieją - do usunięcia w B0
