# Checkpoint sesji CC - 2026-04-27

**Sesja:** Sprint v6.1-PATCH + poprawki UX/UI + audyt
**Commity:** 15 (pre-v6.1 -> 4169207)
**Pliki:** 75 zmienionych, +5401/-1434 linii

## Co zrobione

### Sprint v6.1 (fazy 0'-D)
- Cleanup sales/skrypty/ + sales/emaile/ -> per_persona/ + uniwersalne/
- Hydratacja 27 plików per_szkolenie (02-10 x 3)
- 4 nowe pliki szef_sprzedazy/
- Zakładka Tailwinds 2026 (4 karty regulacyjne)
- Kalkulator dofinansowania
- Sekcja "Per szkolenie" w Sprzedaż
- Enkrypcja strategii AES-256 (nowe hasło: byPC-R0SDrHbB-GS)
- KPI computed z danych
- Smoke test + deploy

### Poprawki po sprincie
- MD viewer: interceptor linków .md (otwiera w modalu)
- Linki KFS/dokumenty per powiat i WUP
- Grupy województw domyślnie zwinięte
- WUP karty zwijane
- Globalna wyszukiwarka (powiaty/szkolenia/WUP/słownik/propozycje)
- Tooltipy wyłączone w Powiaty/WUP (zakłócały workflow)
- Wyświetlanie telefon/email PUP, priorytety PARP, opisy WUP
- Wyświetlanie kfs_status, efs_status, amount_total w kartach

### UX/UI redesign
- "Twoje akcje dziś" - sekcja na górze z gorącymi naborami
- Konsolidacja 2 bannerów do 1 info-bar
- Floating przycisk "Kalkulator"
- Filtry pogrupowane (primary + "Więcej filtrów")
- Zakładki: primary (Powiaty/WUP/Szkolenia/Sprzedaż) vs secondary
- Stats grid 5 kolumn, tablet breakpoint 1024px
- Linki jako pill-buttony, kontrast WCAG AA
- CSS: 6 duplikatów skonsolidowanych, spacing znormalizowany

### Treści
- Emaile cold: usunięto emotikony, ton instytucjonalny
- Strategia zarządu: rozbudowana 3.3k -> 11.3k znaków (analiza konkurencyjna, segmentacja, szacunki przychodów, ryzyka)
- Anita Kozakowska usunięta ze wszystkich materiałów (persona non grata)
- Instrukcja aktualizacji: pełna dokumentacja z przykładami JSON

## Hasło strategii
byPC-R0SDrHbB-GS

## Live
https://lukaszznojek-hue.github.io/irin-dashboard/

## Następnie (Cowork research)
- Uzupełnienie danych powiatów (telefony, emaile, kwoty KFS)
- Nowe nabory KFS per województwo
- url_regulamin i url_wniosek w projektach BUR
- Research nowych szkoleń (PROP-01 AI Act, PROP-02 NIS2)
