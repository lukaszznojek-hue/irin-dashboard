# Checkpoint v6.7 KONIEC - Reorder nav + Strategia zarządu refactor

**Data:** 2026-04-27
**Wersja meta.json:** 6.7.0
**Live URL:** https://lukaszznojek-hue.github.io/irin-dashboard/ (po push)
**Hasło strategii:** byPC-R0SDrHbB-GS (bez zmian)

---

## CO ZROBIONE

### 1. Reorder głównej nawigacji (9 zakładek → 7)

**Nowa kolejność (`index.html`):**
1. 💰 Mapa pieniędzy (default active)
2. Szkolenia IRIN
3. Sprzedaż
4. Matryca
5. Powiaty
6. WUP
7. Słownik (secondary)

**Usunięte z głównej nawigacji:**
- Trendy (przeniesione → strategia.html)
- Tailwinds (przeniesione → strategia.html)
- Duplikat "Matryca" w secondary (był bug - 9→10 zakładek z bonusem dubla)

**Default tab zmieniony**: powiaty → **mapa-pieniedzy** (zgodnie z zasadą WHERE IS MONEY?). Banner countdown AI Act w info-bar już nie wskazuje wewnętrznej zakładki - kieruje do `strategia.html#tailwinds`.

### 2. Strategia zarządu - refactor UX/UI

**Logika informacyjna (3 warstwy):**
- **Strategia** - co planujemy (markdown encrypted, AES-256)
- **Tailwinds 2026** - co nas wymusza (4 deadliny regulacyjne)
- **Trendy rynku** - gdzie rynek idzie (kategorie + luki oferty)

**Implementacja UI:**
- Lock screen jak wcześniej (PBKDF2 + AES-256-CBC)
- **Po unlock**: sub-nav z 3 zakładkami (`📋 Strategia | ⚖️ Tailwinds 2026 | 📈 Trendy rynku`)
- **Sticky tabs** (z-index 10, top:0) - przy scrollu zostają widoczne
- **Intro per sekcja** - 1-2 zdania kontekstu (po co tu jesteś, co zobaczysz)
- **Hash routing** - `#strategia` / `#tailwinds` / `#trendy` z `history.replaceState` (nie skacze viewport)
- **Deep link**: po unlock honoruje hash z URL (banner z indexa → `strategia.html#tailwinds` → odblokuj → automatycznie pokazuje Tailwinds)
- **Lazy load** Trendy: `data/trendy.json` ładowany dopiero po unlock (nie marnuje pasma niezalogowanym)

### 3. Pliki

| Plik | Zmiana |
|---|---|
| `index.html` | Nav: 7 tabs (-2 trendy/tailwinds, -1 dubel matrycy) · panel-mapa-pieniedzy default visible · panel-powiaty default hidden · panele trendy/tailwinds usunięte · banner onclick → `strategia.html#tailwinds` |
| `strategia.html` | Nowy: sub-nav 3 sekcje · `switchStrategiaSection()` · `DASHBOARD_DATA.trendy` lazy fetch · script src tailwinds.js + trendy.js · hash auto-switch po unlock |
| `assets/css/style.css` | Nowy blok `.strategia-subnav` (sticky 64px, gold underline na active) · `.strategia-section` (border continuation) · `.strategia-section-intro` · `@media max-600px` mobile |
| `data/meta.json` | Bump 6.6.0 → 6.7.0 + changelog v6.7.0 |
| `tools/smoke_test_v6.py` | 7 nowych checków (default tab mapa-pieniedzy, brak trendy/tailwinds w indexie, banner link, sub-nav 3 sekcje, deps tailwinds.js+trendy.js) |

---

## DLACZEGO TO MA SENS UX

**Public dashboard (index.html)** = handlowcy, operacje
- Mapa pieniędzy / Szkolenia / Sprzedaż / Matryca - decyzje codzienne
- Powiaty / WUP - dane operacyjne
- Słownik - referencja

**Private layer (strategia.html)** = zarząd
- Strategia (encrypted) - co planujemy
- Tailwinds (jawne ale za hasłem) - co nas wymusza prawnie
- Trendy (jawne ale za hasłem) - gdzie rynek idzie

**Spójność narracyjna**: zarząd otwiera strategia.html i w jednym chronionym widoku ma wszystko co potrzebne do decyzji portfolio - pełną strategię, twarde deadliny regulacyjne (które napędzają sprzedaż w MŚP), oraz luki oferty (sygnały do propozycji nowych produktów).

**Banner deadline AI Act** w info-bar dashboardu publicznego = teaser → "kliknij żeby zobaczyć w warstwie zarządu". Naturalna eskalacja "operacja → strategia".

---

## WERYFIKACJA E2E

✅ **Smoke test (15 checków):** ALL PASS
- Mapa pieniedzy default tab
- 7+ zakładek
- Banner → strategia#tailwinds
- Trendy/Tailwinds usuniete z indexu
- Strategia sub-nav 3 sekcje
- Strategia includes tailwinds.js + trendy.js
- + 9 baseline (kalkulator, info-bar, encryption, etc.)

✅ **JSON validation:** 36 plików OK

✅ **Live test (Preview MCP):**
- 7 zakładek w odpowiedniej kolejności · mapa-pieniedzy default active · panel-mapa-pieniedzy visible
- 0 console errors po reload + przełączeniach tabów
- Strategia.html lock screen widoczny, content schowany
- Po wpisaniu hasła i unlock: 3 sub-tabs · `strategiaBodyLen=13167` chars markdown · 4 karty Tailwinds · 4 kategorie Trendy · 15 items · 7 z luką oferty
- Przełączenia sub-tabs: hash zmienia się na `#strategia/#tailwinds/#trendy`, viewport nie skacze
- Deep link `strategia.html#tailwinds` → po unlock automatycznie aktywna sekcja Tailwinds

---

## OTWARTE NA v6.8+

### Z poprzedniego sprintu (v6.5.1, v6.6)
1. **6 WUP-ów bez kwot BUR** (dolnoslaskie/wielkopolskie/lubuskie/opolskie/podlaskie/zach-pom)
2. **6 WUP-ów z niepełnymi priorytetami wojew.** - parsing PDF uchwał Zarządu Województwa
3. Skala kolorów dla mapy SVG bardziej kontrastowa (obecne KFS log-log płaskie)
4. Eksport CSV dla całej tabeli WUP wide
5. Persist filtry w `localStorage`

### Strategia zarządu (v6.8 ulepszenia)
6. Dodać **CTA per Tailwind** w strategia.html: "📋 Sprawdź w portfolio" → link do panel-szkolenia z filtrem (np. AI Act → AI klastry)
7. Dodać **luka → propozycja** mapping w Trendy: czerwone luki klikalne → szczegółowy widok co IRIN powinien zaoferować
8. **Eksport strategii do PDF** (po unlock, dla zarządu na wyjazd)
9. **Powiadomienia o deadlinach** Tailwinds: AI Act/NIS2 < 30 dni → toast notification w indexie

---

## LEKCJE Z SESJI

**Co zadziałało:**
- Refleksja UX nad strategia zarządu PRZED kodowaniem (3 warstwy decyzyjne) - daje to spójną narrację
- Sticky sub-nav z `position: sticky; top: 0; z-index: 10` - subtelne ale duże UX win przy długim markdown
- `history.replaceState` zamiast `location.hash =` - nie skacze viewport przy zmianie tab
- Lazy fetch `data/trendy.json` po unlock - nie obciąża niezalogowanych użytkowników
- Hash anchor po unlock (banner index → strategia#tailwinds) - bezszwowe przekierowanie z dashboard publicznego

**Co nie zadziałało (i jak rozwiązane):**
- panel-mapa-pieniedzy miał `display:none` w HTML mimo że tab był active → `switchTab` nie był wywoływany na init bez hash. Rozwiązanie: usunąć inline `display:none` (default visible jak wcześniej panel-powiaty)
- nav miał dublet "Matryca" (primary + secondary) - leftover z wcześniejszych wersji. Cichy bug nie zauważony do v6.7.

**Wzorzec do utrwalenia:**
- **Public/private layer split** - operational data jawnie, strategic data encrypted. Naturalne dla SaaS dashboard z multi-role.
- **Lazy load po unlock** - data fetch dopiero po authn, nie marnuje pasma + lepsze cache control

---

**Status:** ✅ Sprint v6.7 zakończony. Nawigacja uproszczona (-2 zakładki). Strategia zarządu rozbudowana z 1 sekcji do 3 sub-tabs.
**Czas pracy:** ~1h (orientacja + plan + 6 plików zmienione)
