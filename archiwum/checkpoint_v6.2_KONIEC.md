# Checkpoint v6.2 KONIEC - Sprint A-mini + C (PROP-01 + PROP-02)

**Data:** 2026-04-27
**Wersja meta.json:** 6.2.0
**Sesja CC:** autonomous workflow (transfer brief Łukasz → Cowork)
**Live URL:** https://lukaszznojek-hue.github.io/irin-dashboard/
**Hasło strategii:** byPC-R0SDrHbB-GS (bez zmian)

---

## CO ZROBIONE

### Faza 0: Setup
- ✅ git pull, audit baseline, mkdir foldery PROP-01_ai_act + PROP-02_nis2
- ✅ Sprawdzenie: brak data/schemas/ (D3 uproszczone - bez schemy dla trendy.json)
- ✅ Wykryty pre-istniejący dług: `C_banner_tailwinds=false` z commitu 13664c9 (konsolidacja bannerów) - NIE blokuje v6.2

### Faza A: Aktualizacja danych
- ✅ Web fetch: WUP Kielce, BUR PARP, PUP Chojnice, MUP Kielce, WUP Gdańsk
- ✅ `data/powiaty/swietokrzyskie.json`: telefon + email MUP Kielce (41 340-60-55 / kancelaria@mupkielce.praca.gov.pl), claudia_lead "oszczędności KFS" dla MUP/PUP Kielce
- ✅ `data/powiaty/pomorskie.json`: telefon PUP Chojnice (52 39-50-700), korekta statusu Chojnice TRWA → NADCHODZI (start 04.05)
- ✅ `data/wup/swietokrzyskie.json`: dograny pełen BUR-I/1/2026 (3 mln zł, 80%/75%, 19-30.01.2026 ZAKOŃCZONY, transformacja cyfrowa priorytet, 7 dopasowanych szkoleń IRIN)
- ✅ `data/wup/pomorskie.json`: rozszerzony claudia_note z statusami 4 trwających/nadchodzących naborów
- ✅ `data/trendy.json`: NIS2 status TRANSPOZYCJA → W MOCY, AI Act korekta krytyczna (literacy art. 4 od 02.02.2025)
- ✅ Commit `f96511c v6.2: aktualizacja TIER 1A + trendy regulacyjne...`

### Faza C1: PROP-02 NIS2 (6 plików, 883 linie)
- ✅ `sales/per_szkolenie/PROP-02_nis2/one_pager.md` (115 lin, 1:1 z transfer brief)
- ✅ `sales/per_szkolenie/PROP-02_nis2/program_skrocony.md` (128 lin, 1:1 z transfer brief, 4 moduły × 30h)
- ✅ `sales/per_szkolenie/PROP-02_nis2/skrypt_rozmowy.md` (134 lin, 5 etapów Diagnoza/Pieniądze/Prezentacja/SocialProof/Zamknięcie)
- ✅ `sales/per_szkolenie/PROP-02_nis2/email_cold.md` (156 lin, 3 subject lines + długi/krótki + harmonogram D0/D3/D7/D14/D45)
- ✅ `sales/per_szkolenie/PROP-02_nis2/obiekcje_specyficzne.md` (234 lin, 5 podstawowych + 7 branżowych)
- ✅ `sales/per_szkolenie/PROP-02_nis2/linki.md` (116 lin, regulacje, analizy, konkurencja, źródła operacyjne)
- ✅ Cena 7 200 zł / 30h, KFS mikro 720 zł / firma 2 160 zł / BUR 1 440 zł
- ✅ Trigger: ustawa o KSC od 03.04.2026, deadline samoidentyfikacji 03.10.2026
- ✅ Commit `(hash) v6.2: PROP-02 NIS2 - pełen pakiet sprzedażowy...`

### Faza C2: PROP-01 AI Act (6 plików, 936 linii)
- ✅ `sales/per_szkolenie/PROP-01_ai_act/one_pager.md` (117 lin)
- ✅ `sales/per_szkolenie/PROP-01_ai_act/program_skrocony.md` (147 lin, 4 moduły × 6h)
- ✅ `sales/per_szkolenie/PROP-01_ai_act/skrypt_rozmowy.md` (138 lin)
- ✅ `sales/per_szkolenie/PROP-01_ai_act/email_cold.md` (168 lin)
- ✅ `sales/per_szkolenie/PROP-01_ai_act/obiekcje_specyficzne.md` (227 lin, 5 + 7 branżowych)
- ✅ `sales/per_szkolenie/PROP-01_ai_act/linki.md` (139 lin, vs EY/PwC pozycjonowanie)
- ✅ Cena 6 500 zł / 24h, KFS mikro 650 zł / firma 1 950 zł / BUR 1 300 zł
- ✅ Trigger 1: AI literacy art. 4 OBOWIĄZUJE OD 02.02.2025 (korekta wcześniejszych materiałów IRIN)
- ✅ Trigger 2: pełne stosowanie high-risk od 02.08.2026 (97 dni)
- ✅ Commit `(hash) v6.2: PROP-01 AI Act - pełen pakiet sprzedażowy...`

### Faza D: Integracja systemowa
- ✅ `data/szkolenia_propozycje.json`: PROP-01/02 status="research_zakonczony", url_program, folder_sprzedazowy, data_promocji_do_oferty=2026-04-27, komentarz Claudii
- ✅ `tools/schemas/propozycja.schema.json`: dodano "research_zakonczony" do enum status + nowe pole folder_sprzedazowy
- ✅ `data/meta.json`: bump 6.1.0 → 6.2.0, pełen changelog 13 zmian
- ✅ `assets/js/sprzedaz.js`: nowa stała PROPOZYCJE_FOLDERS + funkcja renderPropozycjePromowane() (filtr status=research_zakonczony, 6 buttonów per kafelek, badge pilności, brak link BUR)
  - **BUG FIX:** poprawka `DASHBOARD_DATA.szkolenia_propozycje` → `DASHBOARD_DATA.propozycje` (core.js używa tej drugiej nazwy)
- ✅ `index.html`: nowa sekcja "🔴 Propozycje promowane (research zakończony)" w panel-sprzedaz przed Per szkolenie
- ✅ `tools/hydrate_per_szkolenie.py`: PROP-01/02 dodane do FOLDERS dokumentacyjnie + KLASTRY ai_regulacje (z komentarzem że PROP nie są w SZKOL = bezpieczne)
- ✅ Walidacja: `compute_kpi.py` (4 nabory, 97 dni do AI Act), `validate_jsons.py` OK 36, `smoke_test_v6.py` ALL PASS 11/11, `audit_v6_state.py` 14/15 (1 dług pre-istniejący)
- ✅ Commit `2745caa v6.2: integracja PROP-01/02 + KPI + meta v6.2.0`

### Faza E: Deploy + checkpoint
- ✅ `git push origin main` 51f6d8a..2745caa
- ⏳ GitHub Pages deploy (oczekiwane 60-90s) - weryfikacja na końcu
- ✅ Checkpoint v6.2_KONIEC (ten plik)
- ⏳ Learning log

---

## STAN KOŃCOWY KPI (z compute_kpi.py)

| Metryka | Wartość |
|---|---|
| `liczba_aktywnych_naborow` | 4 |
| `kwota_kfs_tier_1a_pln` | 0 (agregator nie liczy ZAKOŃCZONYCH; aktywne pomorskie nabory mają kwoty 0 - "do weryfikacji") |
| `liczba_szkolen_bur` | 10 (rzeczywiście jest 13 wg BUR - sygnał na v6.3) |
| `dni_do_najblizszego_deadline_regulacyjnego` | 97 |
| `deadline_najblizszy_nazwa` | AI Act pełne stosowanie (2026-08-02) |
| `data_ostatniej_weryfikacji_telefonicznej` | null (telefony zweryfikowane przez stronę PUP, nie przez rozmowę) |

---

## SEKWENCJA COMMITÓW v6.2 (granular)

```
2745caa v6.2: integracja PROP-01/02 + KPI + meta v6.2.0
(prev) v6.2: PROP-01 AI Act - pełen pakiet sprzedażowy (6 plików)
(prev) v6.2: PROP-02 NIS2 - pełen pakiet sprzedażowy (6 plików)
f96511c v6.2: aktualizacja TIER 1A + trendy regulacyjne (NIS2 ustawa od 03.04.2026, AI literacy od 02.02.2025)
51f6d8a checkpoint sesji CC 2026-04-27 (start sprintu)
```

---

## OTWARTE NA v6.3 (nie blockerzy v6.2)

### Decyzje strategiczne (Łukasz)

1. **Trener PROP-02 NIS2** - rekomendacja Claudii: zewnętrzny CISSP/CISM z portfolio NIS w PL/UE. Dla pierwszej edycji + onboarding trenera IRIN. Placeholder `[trener_nazwisko]` we wszystkich plikach PROP-02.

2. **Trener PROP-01 AI Act** - rekomendacja Claudii: zewnętrzny prawnik AI compliance + tech literacy. Placeholder `[trener_nazwisko]` we wszystkich plikach PROP-01.

3. **Cena finalna PROP-01/02** - aktualne propozycje Claudii: 6 500 zł / 7 200 zł. Jeśli zmiana - update wszędzie (one_pager + skrypt + email + program_skrocony + propozycje.json).

4. **Rejestracja w BUR PARP** - sugerowana w 14 dni od 2026-04-27 (czyli do 11.05.2026). Po rejestracji PROP otrzymują id_bur i można je dodać do `PER_SZKOLENIE_FOLDERS` w sprzedaz.js + `data/szkolenia_irin.json` (przeniesienie z propozycje).

5. **Termin pierwszej edycji:**
   - PROP-01 AI Act: rekomendacja **lipiec 2026** (ostatni dzwonek przed deadline 02.08.2026)
   - PROP-02 NIS2: rekomendacja **wrzesień 2026** (ostatni dzwonek przed deadline 03.10.2026)

### Operacyjne

6. **Telefony/email TIER 1A** - 0/15 świętokrzyskie (poza MUP Kielce ✓), 1/19 pomorskie (PUP Chojnice ✓). Pozostałe powiaty - większość za JS, do zebrania ręcznie.

7. **Hydratacja skeletonów** - `data/powiaty/zachodniopomorskie.json` (15 powiatów) + `data/powiaty/kujawsko-pomorskie.json` (19 powiatów). Łącznie 34 powiatów do dograne.

8. **3 nowe usługi w BUR IRIN** - dostawca 160205 ma 13 aktywnych usług, w `data/szkolenia_irin.json` jest 10. Dograne 3 brakujące + update `liczba_uslug` + edit `audit_v6_state.py:check A1_10_uslug` (zmiana liczby).

9. **Regulamin BUR od 13.03.2026** - WebFetch wraca tylko shell strony. Ręcznie pobrać PDF z https://serwis-uslugirozwojowe.parp.gov.pl + zaktualizować `sales/uniwersalne/` jeśli zmienia limity.

10. **PROP-03..15** - kolejne sprinty promocji. Kolejność rekomendowana wg pilności:
    - PROP-13 (AI księgowość/finanse) - WYSOKA, P3, masowy popyt
    - PROP-09 (Excel + Power BI + AI) - WYSOKA, hard skill, stabilny popyt
    - PROP-04 (Akademia HR z AI) - WYSOKA, P1+P3, BUR Akademia HR baza
    - PROP-11 (Agenci AI no-code) - WYSOKA, trend 2026
    - PROP-15 (KFS dla mikrofirm - lead-gen) - WYSOKA, P1, top of funnel
    - reszta (PROP-03 CSRD, PROP-05/06/07/08/10/12/14) - ŚREDNIA/NISKA

11. **Pre-istniejący dług `C_banner_tailwinds`** - od commitu 13664c9 (konsolidacja bannerów) - element `tailwinds-banner` zniknął z index.html. Decyzja: czy przywrócić banner czy usunąć check z `audit_v6_state.py`.

### Sales prospecting (lista konkretnych firm)

- **PROP-02 NIS2 targety per sektor:**
  - Energetyka świętokrzyskie (PGE, Enea oddziały)
  - Produkcja żywności + opakowania (zakłady regionalne)
  - Logistyka i transport (DHL, DPD oddziały)
  - Producenci cyfrowi (software house z regionu)
- **PROP-01 AI Act targety per sektor:**
  - HR consulting + agencje rekrutacyjne (rekrutacja AI = high-risk)
  - Finanse: SKOK-i, faktoring, leasing (scoring kredytowy)
  - Ubezpieczenia (scoring + underwriting AI)
  - Edukacja: prywatne szkoły, ośrodki edukacyjne
  - Zdrowie: prywatne kliniki, sieci diagnostyczne

### Marketing

12. **Posty LinkedIn IRIN** - 5-7 postów PROP-02 NIS2, 5-7 postów PROP-01 AI Act. Lead magnety:
    - PROP-02: "Test kwalifikacji wg NIS2" (1 strona PDF)
    - PROP-01: "Self-assessment AI literacy art. 4" (1 strona PDF)

13. **Webinar bezpłatny** "AI literacy art. 4 w 60 minut" - lead-gen przed pierwszą edycją PROP-01

14. **Bundle PROP-01 + PROP-02** - dla sektorów wymagających obu (finanse, zdrowie, infra cyfrowa). Promocja: 7% zniżka za bundle.

---

## PRZYDATNE ŚCIEŻKI

| Co | Ścieżka |
|---|---|
| Repo dashboard | `/Users/znojek/Mój dysk/Claudia/biznes_wlasny/irin/projekty/research_strategiczny/dashboard_v4/` |
| Dane TIER 1A | `data/powiaty/{swietokrzyskie,pomorskie,zachodniopomorskie,kujawsko-pomorskie}.json` |
| WUP TIER 1A | `data/wup/{swietokrzyskie,pomorskie,zachodniopomorskie,kujawsko-pomorskie}.json` |
| Trendy + regulacje | `data/trendy.json` |
| Propozycje (15) | `data/szkolenia_propozycje.json` |
| Pakiety sprzedażowe PROP | `sales/per_szkolenie/PROP-{01_ai_act,02_nis2}/` |
| Wzorzec sales | `sales/per_szkolenie/01_social_media_ai/` |
| UI sales | `assets/js/sprzedaz.js` + `index.html#panel-sprzedaz` |
| Tools | `tools/{audit_v6_state,validate_jsons,compute_kpi,smoke_test_v6,hydrate_per_szkolenie}.py` |
| Schemy | `tools/schemas/*.schema.json` |
| Live URL | https://lukaszznojek-hue.github.io/irin-dashboard/ |

---

## NEXT SESSION KICKOFF

Gdy wracasz do v6.3:

1. `cd dashboard_v4 && git pull && git log --oneline -10` - sprawdź czy ktoś coś dodał
2. Otwórz ten checkpoint + `data/meta.json` changelog
3. Sprawdź `data/szkolenia_propozycje.json` PROP-01/02 - może Łukasz zaktualizował status (np. "gotowe" jeśli zarejestrowane w BUR z trenerem)
4. Pierwszy priorytet: pkt 1-5 powyżej (decyzje Łukasza o trenerach, cenach, terminach, rejestracji BUR)
5. Drugi priorytet: pkt 6-7 (telefony TIER 1A + hydratacja zach+kuj-pom 34 powiatów)

---
**Status:** ✅ Sprint v6.2 zakończony, deploy w toku, gotowe do v6.3
**Sesja:** Claude Code autonomous workflow + transfer brief Cowork
**Czas pracy:** ~45 min od start (wcześniejszy plan 165 min - oszczędność dzięki draftom 1:1 z prompta + równoległym web fetchom)
