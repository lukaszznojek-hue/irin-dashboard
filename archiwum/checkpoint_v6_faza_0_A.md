# Checkpoint v6 - Fazy 0+A (Cowork)

**Data:** 2026-04-27
**Sesja:** Cowork (Claudia) - przed przekazaniem do Claude Code

## Co zrobiono w Cowork

### Git
- `git tag pre-v6` ✅ (lokalnie - push wymaga macOS credentials)
- `git checkout -b refactor/v6-final` ✅
- Commit: prototypy per_szkolenie/01 + szef_sprzedazy/ ✅

### Dane JSON (working tree - niezcommitowane, widoczne CC jako M)
- `data/szkolenia_irin.json` ✅
  - 10. szkolenie dodane (3486195 - SI Kielce wrzesień)
  - liczba_uslug: 12 → 10
  - Dodane pola per usługę: url_bur, trener, uczestnicy_zapisani, alert_cena_h, subscription_available, bundle_compatible
- `data/slownik.json` ✅ - 18 terminów (było 12, dodano: AI Act, NIS2, CSRD, DORA, Inno_Lab, KRiBSI)
- `data/szkolenia_propozycje.json` ✅ - 15 propozycji (re-priorytetyzacja + PROP-11..15)
- `data/meta.json` ✅ - v6.0.0, kpi_dashboardu, mapowanie_warstw_researchu

### JS (working tree - niezcommitowane)
- `assets/js/szkolenia.js` ✅ - ID BUR jako klikalny link (target _blank)
- `assets/js/utils.js` ✅ - addTermTooltips() z TreeWalker, regex 18 terminów

### Sales (nowe pliki - untracked)
- `sales/README.md` ✅ - navigator z tabelą "kiedy co używać"
- `sales/per_persona/` ✅ - 5 plików (hr_manager, prezes, dyrektor, specjalista, ksiegowa)
- `sales/uniwersalne/` ✅ - 9 plików (3 emaile + 6 skryptów)
- `sales/emaile/` i `sales/skrypty/` - STARE KATALOGI nadal istnieją fizycznie (sandbox nie pozwolił rm - CC wykona git rm)

## Stan git na macOS (co zobaczy CC)
```
M  assets/js/szkolenia.js
M  assets/js/utils.js
M  data/meta.json
M  data/slownik.json
M  data/szkolenia_irin.json
M  data/szkolenia_propozycje.json
?? sales/README.md
?? sales/per_persona/
?? sales/uniwersalne/
 D sales/emaile/  (stare - do usunięcia przez CC)
 D sales/skrypty/ (stare - do usunięcia przez CC)
```

## Walidacja
`python3 tools/validate_jsons.py` → OK: 36 plików (schemas v5 - nie walidują nowych pól, ale to OK)

## Do zrobienia przez CC

### Commit 1 (szybki - czyszczenie)
```bash
git rm -r sales/emaile/ sales/skrypty/
git add -A
git commit -m "v6: dane JSON + JS utils/szkolenia + reorganizacja sales/"
```

### Pozostałe zadania (sekcja 5 PROMPT_v6_FINAL_CC.md)
- index.html: v5→v6, proposals count 10→15, banner Tailwinds, zakładka Tailwinds
- B2: Hydratacja 9 folderów per_szkolenie/ × 3 pliki = 27 plików MD
- B3: 4 pliki szef_sprzedazy/
- C2: Linki PUP/WUP klikalne (powiaty.js, wup.js)
- C4: Banner Tailwinds 2026 + zakładka (index.html + JS)
- C5: Sekcja "Per szkolenie" w zakładce Sprzedaż (sprzedaz.js)
- P20: AES-256 szyfrowanie strategii (tools/encrypt_strategia.py + crypto.js)
- P21: Kalkulator dofinansowania (szkolenia.js lub kalkulator.js)
- P23: KPI w footer
- D: smoke test + commit + push + merge main + sprawdź live URL

## Ograniczenia sandbox Cowork
- git mv niemożliwe (index.lock nieusuwalne - sandbox permission)
- rm tracked files niemożliwe (same przyczyna)
- push niemożliwe (brak GitHub credentials w sandbox)
- Wszystkie zmiany są w working tree i przetrwają do sesji CC
