# Checkpoint v6.1 - KONIEC sprintu CC

**Start:** 2026-04-27 ~04:10
**End:** 2026-04-27 ~04:50
**Total:** ~40 min

## Łukasz - akcja

🔑 **NOWE HASŁO STRATEGII:** `byPC-R0SDrHbB-GS`

Stare `Wiktori@2026` już nie działa. Przekaż zarządowi (Wiktoria, Anita) i zapisz w gestorze haseł.

**Jak zmienić hasło:**
```bash
python3 tools/encrypt_strategia.py "NOWE_HASLO"
# lub auto:
python3 tools/encrypt_strategia.py --gen-password
```

## Status faz

- ✅ Faza 0': audit + tag git pre-v6.1 (pushed)
- ✅ Faza A': skip (zrobione w pre-sprint, audit 4/4 pass)
- ✅ Faza B: cleanup sales/skrypty/ + sales/emaile/, B2 (27 plików per_szkolenie), B3 (4 szef_sprzedazy)
- ✅ Faza C: tooltipy aktywowane, banner+zakładka Tailwinds, kalkulator, sekcja "Per szkolenie", aktualizacja ścieżek sprzedaz.js
- ✅ Faza X: encrypted strategia (nowe hasło, AES-256-CBC), KPI computed
- ✅ Faza D: smoke test pass (11/11), JSON validator pass (36 plików), deploy live

## Pliki zmienione (68 plików, +4478/-1240)

Nowe narzędzia:
- tools/audit_v6_state.py
- tools/hydrate_per_szkolenie.py
- tools/encrypt_strategia.py
- tools/extract_strategia_html.py
- tools/test_decrypt.js
- tools/compute_kpi.py
- tools/smoke_test_v6.py

Sales:
- sales/skrypty/ + sales/emaile/ USUNIĘTE (→ per_persona/ + uniwersalne/)
- sales/per_szkolenie/{02..10}/ × 3 pliki = 27 nowych
- sales/szef_sprzedazy/ 4 nowe: kpi_dashboardy, pipeline_review_template, onboarding_handlowca, kalibracja_cen_negocjacje

Dashboard UI:
- index.html: banner Tailwinds, zakładka Tailwinds 2026, kalkulator dofinansowania, sekcja Per szkolenie
- assets/js/kalkulator.js (NOWY)
- assets/js/tailwinds.js (NOWY)
- assets/js/lib/crypto-js.min.js (NOWY)
- assets/js/core.js (renderAll + tooltips)
- assets/js/sprzedaz.js (nowe ścieżki + renderPerSzkolenie)
- assets/css/style.css (nowe style)

Data:
- data/strategia_encrypted.json (NOWY, AES-256)
- data/meta.json (v6.1.0, KPI computed)
- data/trendy.json (regulacyjne_2026)
- strategia.html (fetch encrypted, nie inline)
- _zrodla/strategia_plaintext.md (gitignore)

## KPI dashboardu (computed, nie hardcoded)

- Liczba aktywnych naborów: 4
- Kwota KFS Tier 1A: 0 zł (brak danych kwotowych per powiat)
- Liczba szkoleń BUR: 10
- Dni do AI Act 02.08.2026: 97
- Data aktualizacji: 2026-04-27

## Live URL

https://lukaszznojek-hue.github.io/irin-dashboard/

Commit: ee9c135
Tag rollback: pre-v6.1

## Otwarte na v6.2

- 3 dodatkowe pliki per_szkolenie/ × 10 = 30 plików (program_skrocony, obiekcje_specyficzne, linki)
- Cena_h_rynek_avg per szkolenie (brakuje dla większości)
- kfs_kwota_pln per powiat (brak danych → KPI tier 1A = 0)

## Otwarte na v7

- Workflow zarządu (sprzedaż/pipeline/leady)
- Workflow szefa sprzedaży (zespół/KPI)
- Compliance status IRIN (AI Act/NIS2)
- Rekomender klient → szkolenie
