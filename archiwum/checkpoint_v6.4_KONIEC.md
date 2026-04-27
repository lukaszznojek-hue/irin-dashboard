# Checkpoint v6.4 KONIEC - Strategiczna mapa pieniędzy KFS+BUR 2026

**Data:** 2026-04-27  
**Wersja meta.json:** 6.4.0  
**Sesja CC:** autonomous workflow (transfer brief Łukasz)  
**Live URL:** https://lukaszznojek-hue.github.io/irin-dashboard/  
**Hasło strategii:** byPC-R0SDrHbB-GS (bez zmian)

---

## REFRAME CELU - kluczowy moment sesji

W trakcie sprintu Łukasz wyjaśnił krytyczną korektę kierunku:

> "IRIN nie sprzedaje DO urzędów - sprzedaje firmom korzystającym z dofinansowań. Numery telefonów są stabilne. Strategia wymaga **mapy pieniędzy** - gdzie i ile środków KFS jest dostępne dla klientów IRIN."

To zmieniło całą perspektywę:
- Scraper telefonów/emaili (v6.3-partial) → odsuniety jako low priority  
- **Priorytet:** mapa kwot KFS+BUR per województwo + per powiat (TIER 1A)
- **Format:** heatmap województw + tabela TOP-20 + drill-down

Łukasz wybrał najambitniejsze opcje w 3 pytaniach AskUserQuestion:
1. ✅ Cała Polska (357 powiatów)
2. ✅ TAK - włączyć BUR (KFS+BUR razem)
3. ✅ Heatmap mapy Polski + tabela + drill-down

---

## CO ZROBIONE

### Faza M1+M2: PDF MRiPS + alokacje per województwo (~45 min)
- ✅ Pobranie PDF "KFS 2026_plan wydatkowania.pdf" (67 KB)  
  URL: `https://psz.praca.gov.pl/documents/10240/6350314/KFS+2026_plan+wydatkowania.pdf/...`
- ✅ Parsing pdfplumber - 1 strona, 1 tabela 6×20
- ✅ **Wykryta kluczowa rzecz:** PDF zawiera tylko podział per województwo (16), NIE per powiat (357)  
  Rozdział powiatowy realizują WUP regionalnie (każdy ma własny dokument wewnętrzny)
- ✅ Zapisane: `data/scrape/kfs_2026_mrips_plan.json` + `kfs_2026_mrips_plan.pdf`
- ✅ Bulk update 16/16 WUP-ów: nowe pole `alokacja_kfs_2026_wojewodztwo_pln`
- ✅ Commit `b4e4d99 v6.4 M1+M2: PDF MRiPS plan wydatkowania KFS 2026 + alokacje per województwo`
- ⚠️ **Bug naprawiony:** pierwszy `git add` wciągnął venv (200MB Chromium) - reset --soft + .gitignore + re-add only essentials (20 plików / 530 linii zamiast 2153/627k)

### Faza M3: BUR projekty (PRZESUNIĘTE do v6.5)
- ❌ Próba batch fetch 5 top WUP (mazowieckie/śląskie/wielkopolskie/małopolskie/dolnośląskie)
- ❌ 4/5 zwróciło 404 lub shell HTML bez danych
- ⚠️ **Wniosek:** WUP-y nie publikują agregowanych list projektów BUR online - wymaga ręcznego researchu lub Playwright per WUP
- ✅ Decyzja: zostawić świętokrzyskie BUR (3 mln BUR-I/1/2026) jako jedyne pełne, dograne pozostałe w v6.5

### Faza M4+M5: UI Mapa pieniędzy + commit + push (~90 min)
- ✅ Nowa zakładka `data-panel="mapa-pieniedzy"` w nav primary (między Sprzedaz i sep)
- ✅ Nowy plik `assets/js/mapa_pieniedzy.js` (200 linii):
  - `renderMapaSvg()` - inline SVG heatmap, siatka 5×5, kolorowanie wg log10(amount_kfs)
  - `renderTopPowiaty(20)` - tabela TOP-20 z sales_score
  - `onWojClick(woj)` - drill-down: lista powiatów województwa + linki PUP
  - `computeSalesScore(p)` - algorytm priorytetyzacji
- ✅ Style CSS `assets/css/style.css` (+50 linii) - heatmap, badges statusu, drill-down
- ✅ Hook `renderMapaPieniedzy()` w `core.js:init()` po `renderAkcjeDnia()`
- ✅ Update `data/meta.json` bump 6.3.0-partial → **6.4.0** + changelog 7 zmian
- ✅ Walidacja: `validate_jsons` OK 36, `smoke_test_v6` ALL PASS 11/11
- ✅ Commit `cc6547a v6.4 M4+M5: UI Mapa pieniedzy KFS+BUR 2026 + bump wersja 6.4.0`
- ✅ Push `50364ca..cc6547a` → deploy na live URL

---

## ALGORYTM SALES SCORE

```
score = log10(amount_kfs + 1)
      × mnoznik_status     (NADCHODZI=2.0, TRWA=1.5, ZAKONCZONY=0.3)
      × mnoznik_priorytet  (P3 cyfryzacja=1.5, P5 wojewódzki=1.3, inne=1.0)
      × mnoznik_irin_match (1=1.2, 0=0.8)
```

**Najwyższy score = najlepszy timing + dopasowanie tematyczne IRIN.**  
Top-20 = priorytetowa lista do prospectingu.

---

## DANE - STATUS PO v6.4

| Element | Wartość |
|---|---|
| Łączna alokacja KFS 2026 PL | **417 493 000 zł** (16 województw) |
| Top województwo | Mazowieckie 68 465 000 zł |
| Bottom województwo | Opolskie 9 460 000 zł |
| WUP z alokacją KFS | **16/16 (100%)** |
| Powiaty z amount_kfs > 0 | 10/357 (TIER 1A z v6.3-partial) |
| BUR projekty per WUP | 1/16 (świętokrzyskie BUR-I/1/2026 = 3 mln) |
| Suma kwot KFS w powiatach | 21 899 632 zł (TIER 1A) |

### Ranking 16 województw KFS 2026 (z PDF MRiPS)

| # | Województwo | Kwota KFS 2026 |
|---|---|---|
| 1 | Mazowieckie | 68 465 000 zł |
| 2 | Śląskie | 46 820 000 zł |
| 3 | Wielkopolskie | 42 353 000 zł |
| 4 | Małopolskie | 39 926 000 zł |
| 5 | Dolnośląskie | 31 930 000 zł |
| 6 | Łódzkie | 27 408 000 zł |
| 7 | Pomorskie | 25 753 000 zł |
| 8 | Lubelskie | 20 873 000 zł |
| 8 | Podkarpackie | 20 873 000 zł |
| 10 | Kujawsko-pomorskie | 20 680 000 zł |
| 11 | Zachodniopomorskie | 16 103 000 zł |
| 12 | Warmińsko-mazurskie | 13 318 000 zł |
| 13 | Podlaskie | 11 773 000 zł |
| 14 | Świętokrzyskie | 11 746 000 zł |
| 15 | Lubuskie | 10 012 000 zł |
| 16 | Opolskie | 9 460 000 zł |

---

## SEKWENCJA COMMITÓW v6.4

```
cc6547a v6.4 M4+M5: UI Mapa pieniedzy KFS+BUR 2026 + bump wersja 6.4.0
b4e4d99 v6.4 M1+M2: PDF MRiPS plan wydatkowania KFS 2026 + alokacje per województwo
50364ca v6.3-partial: TIER 1A research - 6 nowych powiatow z kwotami KFS 2026
7e85cc8 fix: wyszukiwarka globalna - propozycje (pre-istniejacy bug)
```

(M1+M2 i M4+M5 zmergowane w 2 commity zamiast 5 - PDF razem z bulk update WUP, UI razem z bumpem meta).

---

## OTWARTE NA v6.5

### Najwyższy priorytet (mapa pieniędzy uzupełnienia)

1. **Rozdział KFS na powiaty (357)** - każde WUP ma własny dokument wewnętrzny "Plan wydatkowania KFS [województwo]". Trzeba pobrać 16 dokumentów WUP-owych:
   - WUP Warszawa, Katowice, Poznań, Kraków, Wrocław, Łódź, Gdańsk, Lublin, Rzeszów, Toruń, Szczecin, Olsztyn, Białystok, Kielce ✓, Gorzów, Opole
   - Każdy ma podział własnej alokacji wojewódzkiej na powiaty
   - Format niespójny - prawdopodobnie PDF, czasem Excel
   - Estymacja: 30-60 min per WUP × 16 = 8-16h researchu (lub freelancer 200-500 zł)

2. **BUR projekty per WUP** (15 województw poza świętokrzyskim) - wymaga ręcznego researchu lub Playwright. WUP-y nie publikują agregowanych list, każdy projekt to osobne ogłoszenie. Estymacja 30 min × 15 = 7-8h.

### Średni priorytet

3. **SVG mapa Polski real shape** - obecny widok to siatka 5×5 prostokątów. Pełna mapa Wikimedia (path-y województw) byłaby ładniejsza. +60-90 min dev (D3.js + topojson Polski).

4. **Mapa per powiat (357)** - jeśli pkt 1 zrealizowany - rozszerzenie heatmap o szczegółową siatkę 357 powiatów (lub real SVG mapa powiatów).

5. **Eksport CSV/Excel** - "TOP-20 powiatów + filtry" jako lead list dla handlowców.

### Niski priorytet / wsparcie

6. **Trener PROP-01 / PROP-02** - decyzja Łukasza (z v6.2)
7. **Rejestracja PROP-01/02 w BUR** - decyzja Łukasza (z v6.2)
8. **Dług `C_banner_tailwinds`** - element zniknął w commicie 13664c9, audit pokazuje false (z v6.2)

---

## KPI dashboardu (po v6.4)

```json
{
  "wersja": "6.4.0",
  "data_aktualizacji": "2026-04-27",
  "kpi_dashboardu": {
    "liczba_aktywnych_naborow": 5,
    "kwota_kfs_tier_1a_pln": 0,
    "liczba_szkolen_bur": 10,
    "dni_do_najblizszego_deadline_regulacyjnego": 97,
    "deadline_najblizszy_nazwa": "AI Act pełne stosowanie (2026-08-02)"
  }
}
```

W UI Mapa pieniędzy (computed na żywo):
- Suma KFS 2026 PL: **417 493 000 zł**
- Top województwo: **Mazowieckie (68 465 000 zł)**
- Średnia/województwo: **26 093 312 zł**
- Powiaty z kwotami: **10/357**

---

## LEKCJE Z SESJI (do learning_log.md)

**Co zadziałało:**
- **Plan mode + AskUserQuestion** - 3 pytania klarujące w plan mode oszczędziły 2-3 godziny złych implementacji
- **Pivot mid-sprint** - reframe celu po feedbacku Łukasza ("scraper telefonów to overkill, chcę kwoty") prowadził do lepszego rozwiązania (PDF MRiPS pokrywa 16/16 województw zamiast 9% kwot per powiat)
- **PDF jako 1st source** - zamiast walki z 357 stronami PUP, 1 PDF MRiPS daje 100% pokrycie wojewódzkiego rozkładu
- **Inline SVG zamiast walki z Wikimedia** - prosta siatka 5×5 wystarczy do wizualnej mapy Polski, +90% prostsze niż real path-y województw

**Co nie zadziałało:**
- **Pierwsza próba git add** - venv (200MB Chromium) wleciał do commit. Naprawa: `git reset --soft HEAD~1` + `.gitignore` + selektywny re-add. **Lekcja:** ZAWSZE dodać .gitignore PRZED instalacją venv, nie po
- **Batch fetch WUP BUR** - 4/5 zwróciło 404 lub shell. WUP-y nie mają agregowanych podstron BUR
- **Sleep 75s zablokowany** - próba sleep > 60s blokowana przez harness. Użycie `until ... do sleep 5; done` w background to właściwy wzorzec dla deploy waitów

**Wzorce do utrwalenia:**
1. **Plan mode dla sprintów multi-faza** z reframem celu - zawsze AskUserQuestion przed implementacją gdy kierunek nie 100% jasny
2. **Hierarchia źródeł danych:** najpierw centralne dokumenty (PDF/API), dopiero potem scraping per node
3. **Inline SVG dla wizualizacji 16-50 elementów** - lepsze niż zewnętrzne biblioteki (D3, Wikimedia path-y) jeśli kontrola wystarczy
4. **`.gitignore` PRZED venv install** - oczywiste ale łatwe do zapomnienia

---

**Status:** ✅ Sprint v6.4 zakończony, deploy na live URL, zakładka "💰 Mapa pieniędzy" widoczna.  
**Czas pracy:** ~2h od reframe (dużo poniżej estymacji 5.5h dzięki M3 odsuniętemu i agile decyzjom).
