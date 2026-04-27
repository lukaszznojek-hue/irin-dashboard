# Checkpoint v6.1 - Faza C (UI Dashboard)

**Data:** 2026-04-27
**Branch:** refactor/v6.1-patch

## Wykonane

### C1 - Linki BUR per szkolenie
- Już zaimplementowane w v5 (szkolenia.js linia 28) - SKIP

### C2 - Linki PUP/WUP
- Już zaimplementowane w v5 (powiaty.js url_pup, wup.js wup_url) - SKIP

### C3 - Tooltipy
- `addTermTooltips()` już istniała w utils.js ale nie była wywoływana
- Dodano wywołanie w `renderAll()` (core.js) - tooltipy na wszystkich panelach + bannerach
- Regex: AI Act, KRiBSI, Inno_Lab, NIS2, CSRD, DORA, KFS, BUR, EFS+, AZOB, FERS, FESW, MRiPS, MFiPR, PUP, MUP, WUP, P1-P7
- CSS: `.tooltip-term` z border-bottom dotted + hover highlight

### C4 - Banner Tailwinds + zakładka
- Banner z countdown AI Act (02.08.2026) + link "Zobacz wszystkie ↗"
- Zakładka "Tailwinds 2026" (8. tab, przed Słownik)
- 4 karty: AI Act, NIS2, Akademia HR, Inno_Lab
- Każda karta: ikona, status, countdown, opis, co IRIN może zrobić, link
- Dane w TAILWINDS_DATA (tailwinds.js) + regulacyjne_2026 w trendy.json
- CSS: urgency colors (urgent/soon/ok)

### C5 - Sekcja "Per szkolenie" w Sprzedaż
- Pierwsza sekcja w zakładce Sprzedaż
- 10 kart (per szkolenie): tier badge, ID BUR, tytuł, cena, godziny, forma
- 3 ikony plików (📋 one_pager / 🗣️ skrypt / 📧 email) → modal MD viewer
- Link "Otwórz w BUR ↗"

### C6 - Kalkulator dofinansowania
- W zakładce Szkolenia, nad tabelą
- 3 selekty: rozmiar firmy, filar, szkolenie
- Wynik: cena, klient zapłaci, dofinansowanie (kwota + %)
- Limit KFS 24 000 zł z info ostrzeżeniem
- assets/js/kalkulator.js (nowy)

### Aktualizacja sprzedaz.js
- Ścieżki plików zmienione z `sales/skrypty/` → `sales/uniwersalne/`
- Ścieżki emaili zmienione z `sales/emaile/` → `sales/per_persona/` + `sales/uniwersalne/`

## Nowe pliki
- assets/js/kalkulator.js
- assets/js/tailwinds.js

## Zmodyfikowane pliki
- index.html (banner, zakładka, kalkulator, sekcja per szkolenie)
- assets/js/core.js (renderAll + tooltips + tailwinds + kalkulator)
- assets/js/sprzedaz.js (nowe ścieżki + renderPerSzkolenie)
- assets/js/utils.js (bez zmian - addTermTooltips już istniała)
- assets/css/style.css (nowe style)
- data/trendy.json (regulacyjne_2026)

## Walidacja
- 8 zakładek (data-panel) ✅
- Banner tailwinds-banner ✅
- Kalkulator kalkulator-dofinansowania ✅
- Panel tailwinds ✅
- Sekcja per szkolenie ✅
- HTML smoke test pass ✅
