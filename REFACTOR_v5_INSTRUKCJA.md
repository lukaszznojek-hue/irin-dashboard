---
typ: mega_prompt_autonomous_workflow
projekt: dashboard_v4 → v5 refactor
runtime: claude_code
data_utworzenia: 2026-04-27
autor_promptu: Claudia (na bazie audytu z Łukaszem)
estymowany_czas: 3-4h pracy CC w jednej sesji
status: gotowy_do_uruchomienia
---

# REFACTOR DASHBOARD IRIN v4 → v5 — INSTRUKCJA AUTONOMICZNA

## 0. KONTEKST I CEL

Dashboard IRIN v4 jest zbudowany i online. Audyt ujawnił 5 fundamentalnych problemów UX/architektury które blokują operacyjne wykorzystanie przez zespół sprzedażowy IRIN. Ten refactor (v5) rozwiązuje wszystkie 5 w jednym sprincie.

**Lokalizacja repo:** `./projekty/research_strategiczny/dashboard_v4/`
**Live URL:** `https://lukaszznojek-hue.github.io/irin-dashboard/`

### 5 problemów do rozwiązania

```
P1. PŁASKA LISTA POWIATÓW
    357 kart bez grupowania. Sortowanie po pilności miesza województwa.
    Sprzedawca w Gdańsku przewija przez świętokrzyskie do swojego rejonu.
    
P2. ALERTY/SYGNAŁY NIEKLIKALNE
    KFS Banner, stat-cards "Krytyczne: 3", notatki Claudii — wszystko 
    statyczne. Nawigacja sygnał→szczegół nie istnieje.
    
P3. PROJEKTY BUR PUSTE / NIESTRUKTURYZOWANE
    WUP Kielce: 1 wpis bez kwoty/daty/linków. WUP Gdańsk: pusty.
    Obecny schemat projekty_bur ma 3 pola. Potrzeba 11.
    
P4. .MD JAKO SUROWY TEKST
    sales/skrypty/*.md, sales/emaile/*.md otwierają się jako plain text.
    Zespół widzi # i ** zamiast formatowania.
    
P5. BRAK PORÓWNANIA CENOWEGO IRIN vs RYNEK
    Tabela szkoleń pokazuje "295 zł/h" bez kontekstu. Sprzedawca nie wie 
    czy argumentować ceną czy jakością.
```

### Po refaktorze dashboard ma być

```
- WIDOK GRUPOWANY: 16 zwijalnych sekcji województw z rollup'em sygnału
- 4 STANY: AKTYWNY / MONITORUJ / ZADZWOŃ / ZAKOŃCZONY (zamiast 5+warning)
- DEEP-LINKING: każdy alert klikalny, URL hash zachowuje stan
- MD VIEWER: marked.js + modal z renderowanym MD + "Skopiuj"
- BENCHMARK CENOWY: hybrid (kategoria + override per szkolenie) z badge
- PROJEKTY BUR ROZSZERZONE: 11-polowy schemat z fallback dla pustych
- 5+ NOWYCH FILTRÓW: priorytet, kwota, świeżość, forma, tier IRIN
- JSON SCHEMA VALIDATOR: blokuje commit przy błędzie struktury
- MODUŁOWY JS: dashboard.js rozbity na pliki per zakładka
```

---

## 1. DECYZJE PROJEKTOWE (już podjęte przez Łukasza)

```
P1. MD viewer        → marked.js modal w dashboardzie
P2. Projekty BUR     → puste w refaktorze, tylko schemat + UI 
                       (osobny sprint danych)
P3. Bezpieczeństwo   → ZOSTAJE jak jest (publiczne repo, hasło Wiktori@2026)
                       Łukasz akceptuje ryzyko (nikt poza nim nie ma URL)
P4. /strategia.html  → osobny plik zostaje, nie wciągamy do hash routingu
P5. Rollup-y         → runtime w JS dla liczb, pre-computed w wup/<woj>.json 
                       dla "akcja_tygodnia"
P6. JSON Schema      → TAK, dodajemy schematy + validate_jsons.py + pre-commit
P7. Autonomia CC     → PEŁNA: CC może rozbić JS na moduły, dodać marked.js, 
                       refaktoryzować strukturę. Vanilla JS zostaje. 
                       GitHub Pages zostaje (brak buildowania).
P8. Benchmark ceny   → HYBRID: data/benchmarki_rynkowe.json (kategoria) 
                       + cena_h_rynek_avg per szkolenie (override)
P9. Wizualizacja     → 2 kolumny ("295 zł/h" | "250 zł/h rynek") + badge 
                       (zielony tańszy, niebieski równi ±10%, żółty 
                       drożsi 10-25%, czerwony drożsi >25%)
P10. Argumenty       → Auto-podpowiedź jako tooltip nad badgem + rozwinięcie 
                       w expandzie szkolenia
P11. Deploy strategy → Branch + deploy na koniec (wszyscy widzą tylko 
                       finalny stan)
P12. STOP protocol   → BEZ STOP-ów. CC robi wszystko autonomicznie. 
                       Łukasz reviewuje na końcu.
P13. Learning log    → TAK, wpis na koniec do 
                       _claudia_system/learning_log.md
```

---

## 2. STRUKTURA DZIAŁAŃ — 5 FAZ

```
FAZA 0: AUDYT + PLAN + GIT TAG
FAZA A: BACKEND DANE (schematy + migracja + walidator)
FAZA B: REFACTOR JS (moduły + grupowanie + 4 stany + deep-linking)
FAZA C: NOWE FUNKCJE (benchmark cenowy + MD viewer + filtry)
FAZA D: TESTY + DEPLOY + LEARNING LOG
```

Każda faza ma deliverables + git commit + zapis fazy do `archiwum/checkpoint_v5_faza_<X>.md`.

---

## FAZA 0 — AUDYT I PRZYGOTOWANIE (15-20 min)

### Cel
Zebrać kontekst, sprawdzić stan obecny, zabezpieczyć rollback, utworzyć branch.

### Działania

```bash
cd "./projekty/research_strategiczny/dashboard_v4"

# 1. Tag rollback przed startem
git tag v4.0.0-pre-refactor-v5
git push origin v4.0.0-pre-refactor-v5

# 2. Branch dla refaktoru
git checkout -b refactor/v5-grupowanie-deep-link
git push -u origin refactor/v5-grupowanie-deep-link

# 3. Walidacja current state
python3 tools/validate_jsons.py 2>&1 | tee archiwum/validation_pre_v5.log
# Jeśli są błędy w JSON-ach — STOP, zgłoś do Łukasza, nie kontynuuj.

# 4. Backup katalogu data/ (na wypadek migracji)
cp -r data/ archiwum/data_backup_v4_$(date +%Y%m%d)/
```

### Audyt — wczytaj i zrozum

Przed pisaniem kodu wczytaj i zsumaryzuj w `archiwum/audit_v5.md`:

1. `assets/js/dashboard.js` — pełny przegląd (jakie funkcje, jakie ma globalne stany, gdzie są punkty wpięcia hooków)
2. `assets/css/style.css` — paleta zmiennych, klasy używane vs nieużywane
3. Wszystkie 16 plików `data/powiaty/*.json` — mapa kompletności (per województwo: ile powiatów ma `kfs_start_date`, ile `amount_kfs`, ile `pillar_details`)
4. Wszystkie 16 plików `data/wup/*.json` — mapa kompletności projektów BUR
5. `data/szkolenia_irin.json` — lista 12 szkoleń z kategoriami i cenami

Wynik audytu (max 200 linii) zapisz w `archiwum/audit_v5.md` zanim zaczniesz fazę A.

### Deliverables Fazy 0

```
✓ git tag v4.0.0-pre-refactor-v5 (push)
✓ branch refactor/v5-grupowanie-deep-link (push)
✓ archiwum/validation_pre_v5.log
✓ archiwum/data_backup_v4_<data>/
✓ archiwum/audit_v5.md (200 linii max)
✓ git commit -m "Faza 0: backup + audyt przed refaktor v5"
```

---

## FAZA A — BACKEND DANE (45-60 min)

### Cel
Rozszerzyć schematy danych. Migrować istniejące pliki z fallbackiem (stare dane nadal działają, nowe pola opcjonalne). Dodać walidator JSON Schema.

### A1. Schemat: 4 stany akcji w powiatach

W każdym `data/powiaty/<woj>.json`, każdy obiekt powiatu — DODAJ pole `akcja_status`:

```json
{
  "voivodeship": "swietokrzyskie",
  "name": "Busko-Zdrój",
  ...,
  "akcja_status": "zakonczony",   // NOWE: aktywny | monitor | zadzwon | zakonczony
  "akcja_status_uzasadnienie": "Nabór zakończony 24.04.2026"  // NOWE: max 80 znaków
}
```

**Mapowanie ze starego `urgency` na nowe `akcja_status`** (skrypt migracji):

```python
def map_urgency_to_akcja(card):
    u = card.get('urgency', 'nieznany')
    s = card.get('kfs_status', 'BRAK_DANYCH')
    w = card.get('has_warning', False)
    
    # Aktywne stany pozostają
    if u in ('krytyczny', 'pilny', 'trwa'):
        return 'aktywny'
    # Nadchodzące = monitor
    if u == 'nadchodzi':
        return 'monitor'
    # Zakończone z danymi = zakonczony
    if u == 'zakonczony' and s == 'ZAKONCZONY':
        return 'zakonczony'
    # Zakończone bez danych ALBO nieznane = zadzwoń
    if u == 'nieznany' or s == 'BRAK_DANYCH' or w:
        return 'zadzwon'
    return 'zadzwon'  # default safe
```

**WAŻNE**: zostaw stare pola `urgency`, `kfs_status`, `has_warning` — dla backward compatibility. UI będzie czytać `akcja_status` jako primary, fallback do mapowania `urgency`.

Skrypt migracji: `tools/migrate_v4_to_v5_powiaty.py`. Uruchom raz, commit zmienione pliki.

### A2. Schemat: rozszerzone projekty_bur w WUP

Każdy `data/wup/<woj>.json` — pole `projekty_bur` ROZSZERZ schemat. Każdy projekt:

```json
{
  "id_bur": "BUR-I-1-2026-10.6",            // NOWE
  "nazwa": "BUR I/1/2026 - działanie 10.6 DLA PRACODAWCÓW",
  "status": "nabor",
  "operator": "WUP Kielce",
  "kwota_alokacji": null,                    // NOWE: int lub null
  "intensywnosc_max": null,                  // NOWE: "80%" lub null
  "data_start": null,                        // NOWE: "YYYY-MM-DD" lub null
  "data_end": null,                          // NOWE: "YYYY-MM-DD" lub null
  "grupa_docelowa": null,                    // NOWE: string lub null
  "url_regulamin": null,                     // NOWE
  "url_wniosek": null,                       // NOWE
  "irin_dopasowane_szkolenia": [],           // NOWE: lista id_bur szkoleń
  "claudia_note": null,                      // NOWE
  "do_weryfikacji": true                     // NOWE: flaga "uzupełnij dane"
}
```

**Migracja:** istniejące projekty (np. WUP Kielce 1 wpis) — uzupełnij nowe pola wartościami `null` + `do_weryfikacji: true`. NIE wymyślaj danych. Schemat dla pustych projektów = lista `[]` zachowana.

Dodaj pole `akcja_tygodnia` na poziomie WUP:

```json
{
  "wojewodztwo": "swietokrzyskie",
  ...,
  "akcja_tygodnia": null,           // NOWE: string max 90 znaków, czasownik na początku
  "akcja_tygodnia_target": null     // NOWE: voivodeship slug + powiat name jeśli dot. konkretnego urzędu, np. "swietokrzyskie/MUP Kielce"
}
```

Pozostawia null — ręczne wypełnienie przez Łukasza/Claudię w aktualizacji tygodniowej.

### A3. Benchmark cenowy — nowy plik + pole w szkoleniach

**Nowy plik `data/benchmarki_rynkowe.json`:**

```json
{
  "data_aktualizacji": "2026-04-27",
  "metoda": "Statyczne benchmarki per kategoria. Aktualizacja kwartalna. Źródła: BUR PARP search aggregate, oferty 5 największych konkurentów per kategoria.",
  "kategorie": {
    "ai": {
      "cena_h_rynek_avg": 250,
      "zrodlo": "Średnia z 20 szkoleń AI/Cyfrowych w BUR (Q1 2026)",
      "konkurencja_top": ["Comarch Edu", "Altkom", "Akademia 4.0"]
    },
    "edukacja": {
      "cena_h_rynek_avg": 100,
      "zrodlo": "Specjalistyka medyczna/terapeutyczna BUR Q1 2026",
      "konkurencja_top": ["PSI Polska", "Acedeu"]
    },
    "biznes": {
      "cena_h_rynek_avg": 220,
      "zrodlo": "Sprzedaż/zarządzanie BUR Q1 2026",
      "konkurencja_top": ["PNSA", "Akademia Biznesu MDDP", "Brian Tracy Polska"]
    },
    "soft_skills": {
      "cena_h_rynek_avg": 200,
      "zrodlo": "Kompetencje miękkie BUR Q1 2026",
      "konkurencja_top": ["Door Polska", "Time Manager Inter."]
    },
    "regulacje": {
      "cena_h_rynek_avg": 350,
      "zrodlo": "AI Act / NIS2 / CSRD compliance BUR Q1 2026 - premium niche",
      "konkurencja_top": ["Deloitte Academy", "EY Academy", "PwC Academy"]
    },
    "ai_regulacje": {
      "cena_h_rynek_avg": 320,
      "zrodlo": "AI Act compliance - hybrid AI/legal niche",
      "konkurencja_top": ["Deloitte", "Maruta Wachta"]
    }
  }
}
```

**W `data/szkolenia_irin.json` każda usługa — DODAJ pole `cena_h_rynek_avg`:**

```json
{
  "id_bur": "3432404",
  ...,
  "cena_h": 295,
  "cena_h_rynek_avg": null,    // NOWE: int lub null. null = używa benchmarku z kategorii
  "cena_h_rynek_zrodlo": null  // NOWE: opis "Override - 3 konkurencyjne szkolenia social media: 280, 240, 260 zł/h"
}
```

UI logic: `final_rynek = szkolenie.cena_h_rynek_avg ?? benchmarki[szkolenie.kategoria].cena_h_rynek_avg`

### A4. Schemat propozycji — status + owner

`data/szkolenia_propozycje.json`, każda propozycja — DODAJ:

```json
{
  "kod": "PROP-01",
  ...,
  "status": "pomysl",          // NOWE: pomysl | analiza | w_opracowaniu | gotowe | odrzucone
  "owner_irin": null,          // NOWE: imię osoby z zespołu IRIN (gdy ktoś przejmie)
  "data_promocji_do_oferty": null,  // NOWE: ISO date gdy gotowe
  "url_program": null,         // NOWE: ścieżka do _materialy/PROP-01_program.md
  "komentarze_zespolu": []     // NOWE: lista [{autor, data, tresc}]
}
```

Migracja: wszystkim 10 propozycjom — `status: "pomysl"`, reszta nullable.

### A5. JSON Schema Validator

Utwórz `tools/schemas/`:

```
tools/schemas/
├── powiat.schema.json
├── wup.schema.json
├── szkolenie_irin.schema.json
├── propozycja.schema.json
├── benchmark.schema.json
└── meta.schema.json
```

Każdy schemat — JSON Schema Draft 7, opisuje wymagane pola + typy + enums dla `akcja_status`, `status` propozycji itd.

Rozbuduj `tools/validate_jsons.py`:

```python
import json
from pathlib import Path
from jsonschema import validate, ValidationError

SCHEMAS_DIR = Path('tools/schemas')

def validate_file(path, schema_name):
    schema = json.loads((SCHEMAS_DIR / schema_name).read_text())
    data = json.loads(path.read_text())
    try:
        validate(data, schema)
        return True, None
    except ValidationError as e:
        return False, f"{path}: {e.message}"

def main():
    errors = []
    # 16 powiatów
    for f in Path('data/powiaty').glob('*.json'):
        ok, err = validate_file(f, 'powiat.schema.json')
        if not ok: errors.append(err)
    # ... wup, szkolenia, propozycje, benchmark, meta
    if errors:
        for e in errors: print(f"ERROR: {e}")
        exit(1)
    print(f"All JSON files valid.")

if __name__ == '__main__':
    main()
```

**Pre-commit hook** `.git/hooks/pre-commit`:

```bash
#!/bin/bash
python3 tools/validate_jsons.py || exit 1
```

`chmod +x .git/hooks/pre-commit`. Plus dokumentacja w `docs/INSTRUKCJA_AKTUALIZACJI.md`.

### Deliverables Fazy A

```
✓ tools/migrate_v4_to_v5_powiaty.py (skrypt + log uruchomienia)
✓ 16 plików data/powiaty/*.json zmigrowanych (akcja_status dodany)
✓ 16 plików data/wup/*.json z rozszerzonym schematem projekty_bur
✓ data/benchmarki_rynkowe.json (nowy)
✓ data/szkolenia_irin.json z cena_h_rynek_avg per usługa (null jeśli brak override)
✓ data/szkolenia_propozycje.json ze status: "pomysl"
✓ tools/schemas/*.json (6 plików)
✓ tools/validate_jsons.py (rozbudowany)
✓ .git/hooks/pre-commit (executable)
✓ python3 tools/validate_jsons.py PRZECHODZI
✓ archiwum/checkpoint_v5_faza_A.md
✓ git commit -m "Faza A: schematy v5 + walidator + migracja danych"
```

---

## FAZA B — REFACTOR JS + UI (60-90 min)

### Cel
Rozbić `dashboard.js` na moduły. Dodać grupowanie po województwie z rollup'em. Wprowadzić 4 stany akcji. Deep-linking via URL hash.

### B1. Modułowa struktura JS

Przejdź z 1 pliku `assets/js/dashboard.js` (535 linii) na:

```
assets/js/
├── core.js              # init, fetchJson, DASHBOARD_DATA, hash routing
├── powiaty.js           # renderCards, grouping, rollup
├── wup.js               # renderWupGrid + projekty BUR rozwinięte
├── szkolenia.js         # renderBURTable + benchmark cenowy
├── propozycje.js        # renderProposals + filtr status
├── matryca.js
├── trendy.js
├── slownik.js
├── sprzedaz.js          # renderSalesLinks + MD modal
├── filtry.js            # toggleFilter, applyFilters, hash sync
├── md_viewer.js         # marked.js modal logic
└── utils.js             # formatKwota, fmtDateShort, getTier, setText
```

`index.html` — zmień `<script src="assets/js/dashboard.js">` na sekwencję wszystkich modułów (kolejność: utils → core → reszta → init na końcu).

```html
<script src="assets/js/utils.js"></script>
<script src="assets/js/core.js"></script>
<script src="assets/js/filtry.js"></script>
<script src="assets/js/md_viewer.js"></script>
<script src="assets/js/powiaty.js"></script>
<script src="assets/js/wup.js"></script>
<script src="assets/js/szkolenia.js"></script>
<script src="assets/js/propozycje.js"></script>
<script src="assets/js/matryca.js"></script>
<script src="assets/js/trendy.js"></script>
<script src="assets/js/slownik.js"></script>
<script src="assets/js/sprzedaz.js"></script>
```

Wszystkie funkcje globalne (jak teraz, vanilla JS, no modules ES6 — bo plain GitHub Pages, brak buildowania).

### B2. Grupowanie powiatów po województwie z rollup'em

W `powiaty.js` zamień `renderCards()`:

```javascript
function renderCards() {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;
  
  const grouped = groupByVoivodeship(DASHBOARD_DATA.powiaty);
  
  grid.innerHTML = WOJEWODZTWA_KOLEJNOSC
    .filter(slug => grouped[slug]?.length > 0)
    .map(slug => renderVoivodeshipGroup(slug, grouped[slug]))
    .join('');
}

function groupByVoivodeship(powiaty) {
  return powiaty.reduce((acc, p) => {
    (acc[p.voivodeship] = acc[p.voivodeship] || []).push(p);
    return acc;
  }, {});
}

function renderVoivodeshipGroup(slug, urzedy) {
  const rollup = computeRollup(urzedy);
  const wup = DASHBOARD_DATA.wup[slug] || {};
  const akcjaTyg = wup.akcja_tygodnia;
  const wynikMatryca = getMatrycaWynik(slug);
  const tier = getTier(slug);
  
  return `
    <div class="woj-group" data-woj="${slug}">
      <div class="woj-header" onclick="toggleVoivodeshipGroup(this)">
        <span class="woj-chevron">▾</span>
        <span class="woj-nazwa">${VOIVODESHIP_LABELS[slug]}</span>
        <span class="tier-badge tier-${tier}">${TIER_LABELS[tier]}</span>
        <span class="matryca-wynik wynik-${wynikMatryca}">${wynikMatryca}</span>
        <span class="woj-rollup">
          <span class="rollup-stat aktywny">${rollup.aktywny}</span>
          <span class="rollup-stat monitor">${rollup.monitor}</span>
          <span class="rollup-stat zadzwon">${rollup.zadzwon}</span>
          <span class="rollup-stat zakonczony">${rollup.zakonczony}</span>
          <span class="rollup-kwota">${formatKwota(rollup.laczna_kwota)}</span>
        </span>
      </div>
      ${akcjaTyg ? `
        <div class="woj-akcja-tygodnia" onclick="handleAkcjaTygodniaClick('${slug}')">
          <span class="akcja-label">Akcja tygodnia:</span> ${akcjaTyg}
        </div>` : ''}
      <div class="woj-body">
        ${urzedy.map(renderCard).join('')}
      </div>
    </div>`;
}

function computeRollup(urzedy) {
  const r = { aktywny: 0, monitor: 0, zadzwon: 0, zakonczony: 0, laczna_kwota: 0 };
  urzedy.forEach(u => {
    const a = u.akcja_status || mapUrgencyToAkcja(u);
    r[a] = (r[a] || 0) + 1;
    if (u.amount_kfs > 0) r.laczna_kwota += u.amount_kfs;
  });
  return r;
}

function mapUrgencyToAkcja(card) {
  // fallback gdy stare dane bez akcja_status
  const u = card.urgency, s = card.kfs_status, w = card.has_warning;
  if (['krytyczny','pilny','trwa'].includes(u)) return 'aktywny';
  if (u === 'nadchodzi') return 'monitor';
  if (u === 'zakonczony' && s === 'ZAKONCZONY') return 'zakonczony';
  return 'zadzwon';
}

function toggleVoivodeshipGroup(el) {
  el.parentElement.classList.toggle('collapsed');
}

function handleAkcjaTygodniaClick(slug) {
  const wup = DASHBOARD_DATA.wup[slug];
  const target = wup?.akcja_tygodnia_target;
  if (!target) return;
  
  const [tWoj, tName] = target.split('/');
  // Expand grupy + scroll do urzędu + expand karty
  const grp = document.querySelector(`.woj-group[data-woj="${tWoj}"]`);
  if (grp) {
    grp.classList.remove('collapsed');
    const card = grp.querySelector(`.card[data-name="${tName}"]`);
    if (card) {
      card.classList.add('expanded');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('highlight');
      setTimeout(() => card.classList.remove('highlight'), 2000);
    }
  }
}
```

### B3. Karta urzędu — uproszczony 6-kolumnowy grid

W `renderCard()` zamień obecny układ head na:

```javascript
function renderCard(card) {
  const akcja = card.akcja_status || mapUrgencyToAkcja(card);
  const irinStar = card.irin_match ? '<span class="irin-star" title="Dopasowanie do oferty IRIN">★</span>' : '';
  const pillarTags = (card.pillars || [])
    .map(p => `<span class="pillar-tag ${p.toLowerCase().replace('+','plus')}">${p}</span>`)
    .join('');
  const kwota = card.amount_kfs > 0 ? formatKwota(card.amount_kfs) 
              : card.amount_kfs === 0 ? '<span class="brak-danych">brak danych</span>' 
              : '';
  const dataKontekst = renderDateContext(card, akcja);
  const akcjaBadge = renderAkcjaBadge(akcja);
  
  return `<div class="card akcja-${akcja}" 
              data-voivodeship="${card.voivodeship}" 
              data-akcja="${akcja}"
              data-pillars="${(card.pillars||[]).join(',')}" 
              data-amount="${card.amount_kfs||0}" 
              data-irin="${card.irin_match||0}" 
              data-name="${card.name}">
    <div class="card-head" onclick="toggleCard(this)">
      <div class="card-col-chevron">▸</div>
      <div class="card-col-nazwa">
        <div class="card-title">${card.display_name}</div>
        <div class="card-meta">${card.display_meta || ''} ${irinStar}</div>
      </div>
      <div class="card-col-pillar">${pillarTags}</div>
      <div class="card-col-kwota">${kwota}</div>
      <div class="card-col-data">${dataKontekst}</div>
      <div class="card-col-akcja">${akcjaBadge}</div>
    </div>
    <div class="card-body">
      ${renderPillarDetails(card)}
      ${card.claudia_note ? `<div class="claudia-note">
        <span class="claudia-avatar">C</span>
        <div class="claudia-text">${interpolateLinks(card.claudia_note)}</div>
      </div>` : ''}
      ${card.url_pup ? `<div class="card-links">
        <a href="${card.url_pup}" target="_blank" rel="noopener">Strona PUP ↗</a>
      </div>` : ''}
    </div>
  </div>`;
}

function renderAkcjaBadge(akcja) {
  const map = {
    aktywny: ['AKTYWNY', 'success'],
    monitor: ['MONITORUJ', 'info'],
    zadzwon: ['ZADZWOŃ', 'warning'],
    zakonczony: ['ZAKOŃCZONY', 'tertiary']
  };
  const [label, color] = map[akcja] || ['?', 'tertiary'];
  return `<span class="akcja-badge akcja-badge-${akcja}">${label}</span>`;
}

function renderDateContext(card, akcja) {
  if (akcja === 'aktywny' && card.kfs_end_date) {
    const days = Math.ceil((new Date(card.kfs_end_date) - new Date()) / 86400000);
    return `<span class="data-ctx">do końca ${days}d</span>`;
  }
  if (akcja === 'monitor') return `<span class="data-ctx">historyczne</span>`;
  if (akcja === 'zakonczony' && card.kfs_end_date) {
    return `<span class="data-ctx">do ${fmtDateDDMM(card.kfs_end_date)}</span>`;
  }
  return '';
}

function interpolateLinks(text) {
  // "P3" / "P4" → link do słownika
  // "Akademia X" / nazwa szkolenia → link do tabeli szkoleń
  // Implementacja: regex matching + zamiana na <a onclick="goToSchool(...)">
  return text
    .replace(/\b(P[1-7])\b/g, '<a class="link-prior" onclick="goToSlownik(\'$1\')">$1</a>')
    .replace(/\bAkademia (HR|Sprzedaży|Lidera|OZE|Managera|Zarządzania|4\.0|Biznesu)\b/g, 
             '<a class="link-akad" onclick="goToSzkolenia(\'$1\')">Akademia $1</a>');
}
```

### B4. CSS dla 4 stanów + grupowania

Dodaj do `assets/css/style.css`:

```css
/* === Voivodeship groups === */
.woj-group { 
  margin-bottom: 16px; 
  background: white; 
  border-radius: 12px; 
  border: 1px solid var(--linia); 
  overflow: hidden;
}
.woj-header { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  padding: 14px 18px; 
  background: var(--krem-jasny); 
  cursor: pointer; 
  border-bottom: 1px solid var(--linia);
}
.woj-header:hover { background: var(--krem); }
.woj-chevron { font-size: 12px; color: var(--szary); transition: transform 0.2s; }
.woj-group.collapsed .woj-chevron { transform: rotate(-90deg); }
.woj-group.collapsed .woj-body { display: none; }
.woj-group.collapsed .woj-akcja-tygodnia { display: none; }
.woj-nazwa { font-family: Georgia, serif; font-weight: 700; font-size: 16px; color: var(--granat); }
.woj-rollup { margin-left: auto; display: flex; gap: 10px; align-items: center; font-size: 12px; }
.rollup-stat { padding: 2px 8px; border-radius: 8px; font-weight: 600; }
.rollup-stat.aktywny { background: var(--trwa-bg); color: var(--trwa); }
.rollup-stat.monitor { background: var(--nadchodzi-bg); color: var(--nadchodzi); }
.rollup-stat.zadzwon { background: var(--pilne-bg); color: var(--pilne); }
.rollup-stat.zakonczony { background: var(--zakonczony-bg); color: var(--zakonczony); }
.rollup-kwota { font-weight: 700; color: var(--granat); margin-left: 8px; }

.woj-akcja-tygodnia { 
  padding: 10px 18px; 
  background: linear-gradient(90deg, #FFF7ED 0%, transparent 100%); 
  border-bottom: 1px solid var(--linia); 
  font-size: 13px; 
  color: #5C3D00; 
  cursor: pointer;
  transition: background 0.15s;
}
.woj-akcja-tygodnia:hover { background: #FFF7ED; }
.woj-akcja-tygodnia .akcja-label { font-weight: 700; color: var(--pilne); }
.woj-body { padding: 8px 12px 12px; }

.matryca-wynik { padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; }
.matryca-wynik.wynik-A { background: #16A34A; color: white; }
.matryca-wynik.wynik-B { background: #2563EB; color: white; }
.matryca-wynik.wynik-C { background: #D97706; color: white; }
.matryca-wynik.wynik-D { background: #9CA3AF; color: white; }

/* === Card grid 6-column === */
.card-head {
  display: grid;
  grid-template-columns: 16px 1fr auto auto auto auto;
  gap: 12px;
  align-items: center;
  padding: 10px 14px;
}
.card-col-chevron { font-size: 11px; color: var(--szary); transition: transform 0.2s; }
.card.expanded .card-col-chevron { transform: rotate(90deg); }
.card-col-nazwa { min-width: 0; }
.card-title { font-family: Georgia, serif; font-weight: 700; font-size: 14px; color: var(--granat); }
.card-meta { font-size: 11px; color: var(--szary); }
.card-col-data { font-size: 11px; color: var(--szary); }
.brak-danych { color: var(--szary-jasny); font-style: italic; font-size: 11px; }

/* === 4 akcja stany — left border === */
.card.akcja-aktywny { border-left: 3px solid var(--trwa); }
.card.akcja-monitor { border-left: 3px solid var(--nadchodzi); }
.card.akcja-zadzwon { border-left: 3px solid var(--pilne); }
.card.akcja-zakonczony { border-left: 3px solid var(--szary-jasny); }

.akcja-badge { padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.akcja-badge-aktywny { background: var(--trwa-bg); color: var(--trwa); }
.akcja-badge-monitor { background: var(--nadchodzi-bg); color: var(--nadchodzi); }
.akcja-badge-zadzwon { background: var(--pilne-bg); color: var(--pilne); }
.akcja-badge-zakonczony { background: var(--zakonczony-bg); color: var(--zakonczony); }

.card.highlight { animation: highlightCard 2s ease; }
@keyframes highlightCard {
  0%, 100% { background: white; }
  20%, 60% { background: #FEF3C7; }
}

.link-prior, .link-akad { color: var(--granat); text-decoration: underline; cursor: pointer; }
.link-prior:hover, .link-akad:hover { color: var(--zloto); }
```

### B5. Filtry — 4 stany + reszta

Zamień obecne 5 chip-ów na 4:

```html
<div class="filter-chip active" data-filter="akcja" data-value="all">Wszystkie</div>
<div class="filter-chip" data-filter="akcja" data-value="aktywny">🟢 Aktywne</div>
<div class="filter-chip" data-filter="akcja" data-value="monitor">🔵 Monitor</div>
<div class="filter-chip" data-filter="akcja" data-value="zadzwon">🟡 Zadzwoń</div>
<div class="filter-chip" data-filter="akcja" data-value="zakonczony">⬜ Zakończone</div>
```

Dodaj nowe filtry (panele rozwijane lub dodatkowy rząd chip-ów):

```
+ Priorytet PARP: P1 P2 P3 P4 P5 P6 P7 (multi-select)
+ Kwota: <500k | 500k-2M | >2M | brak danych
+ Świeżość: <7d | 7-30d | >30d
+ Tier IRIN: 1A | 1B | 2
```

`applyFilters()` — rozszerz logikę o nowe wymiary. Wszystkie filtry kompozytowe (AND między grupami).

### B6. Deep-linking via URL hash

W `core.js` dodaj `applyHashState()` i `updateHashFromState()`:

```javascript
// Hash format: #powiaty?status=aktywny&woj=swietokrzyskie&urzad=mup-kielce
// Lub: #szkolenia?kategoria=ai
// Lub: #slownik?term=KFS

function updateHashFromState() {
  const tab = currentActiveTab();
  const params = new URLSearchParams();
  if (activeFilters.akcja !== 'all') params.set('akcja', activeFilters.akcja);
  if (activeFilters.pillar) params.set('pillar', activeFilters.pillar);
  if (activeFilters.voivodeships.size < 16) {
    params.set('woj', [...activeFilters.voivodeships].join(','));
  }
  const queryStr = params.toString();
  history.replaceState(null, '', `#${tab}${queryStr ? '?' + queryStr : ''}`);
}

function applyHashState() {
  const hash = location.hash.replace('#', '');
  if (!hash) return;
  const [tab, query] = hash.split('?');
  if (tab) {
    const tabEl = document.querySelector(`.nav-tab[data-panel="${tab}"]`);
    if (tabEl) switchTab(tabEl, tab);
  }
  if (query) {
    const params = new URLSearchParams(query);
    if (params.has('akcja')) {
      const c = document.querySelector(`[data-filter="akcja"][data-value="${params.get('akcja')}"]`);
      if (c) toggleFilter(c);
    }
    // ... reszta
    if (params.has('urzad')) {
      // Auto-expand grupy + scroll do urzędu
      setTimeout(() => {
        const card = document.querySelector(`.card[data-name="${params.get('urzad')}"]`);
        if (card) {
          const grp = card.closest('.woj-group');
          if (grp) grp.classList.remove('collapsed');
          card.classList.add('expanded', 'highlight');
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => card.classList.remove('highlight'), 2000);
        }
      }, 200);
    }
  }
}
```

Wpięcie: każda zmiana filtra/sortowania/taba woła `updateHashFromState()`. Init woła `applyHashState()` po renderowaniu.

### B7. Klikalne stat-cards i KFS Banner

`index.html` — modyfikuj header:

```html
<!-- Stat cards: każda klikalna -->
<div class="stat-card" onclick="quickFilter('all')">
  <div class="stat-value" id="stat-total">—</div>
  <div class="stat-label">Powiatów</div>
</div>
<div class="stat-card" onclick="quickFilter('aktywny')">
  <div class="stat-value" id="stat-active">—</div>
  <div class="stat-label">Aktywne</div>
</div>
<div class="stat-card stat-urgent" onclick="quickFilter('monitor')">
  <div class="stat-value" id="stat-urgent">—</div>
  <div class="stat-label">Monitor</div>
</div>
<div class="stat-card stat-warn" onclick="quickFilter('zadzwon')">
  <div class="stat-value" id="stat-zadzwon">—</div>
  <div class="stat-label">Zadzwoń</div>
</div>
<div class="stat-card stat-critical" onclick="quickFilter('krytyczne_aktywne')">
  <div class="stat-value" id="stat-critical">—</div>
  <div class="stat-label">Krytyczne <7d</div>
</div>
```

```javascript
function quickFilter(akcja) {
  switchTab(document.querySelector('.nav-tab[data-panel="powiaty"]'), 'powiaty');
  const chip = document.querySelector(`[data-filter="akcja"][data-value="${akcja}"]`);
  if (chip) {
    document.querySelectorAll('[data-filter="akcja"]').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeFilters.akcja = akcja;
    applyFilters();
    updateHashFromState();
  }
}
```

KFS Banner — każdy `<strong>` zamień na klikalny:

```html
<div class="kfs-banner-text">
  <strong onclick="goToSlownik('KFS')" class="banner-link">Dofinansowanie:</strong> 
  do 70% (mikrofirmy do 90%) ·
  <strong onclick="goToSlownik('BUR')" class="banner-link">Wymóg BUR od 1.01.2026</strong> 
  — IRIN ma BUR <a onclick="goToSzkolenia('all')" class="banner-link">(4.9/5, 813 ocen)</a> ·
  <strong onclick="goToSlownik('Retencja KFS')" class="banner-link">Retencja 3 mies.</strong> 
  — pracodawca utrzymuje pracownika ·
  <strong>Wniosek elektroniczny</strong> przez praca.gov.pl
</div>
```

### Deliverables Fazy B

```
✓ assets/js/ rozbity na 12 modułów + index.html zaktualizowany
✓ Grupowanie powiatów po województwie (16 sekcji zwijalnych)
✓ Rollup per województwo (4 liczniki + suma kwot + akcja tygodnia)
✓ 4 stany akcja_status z dedykowanymi kolorami i badge
✓ Karta 6-kolumnowa grid layout
✓ Deep-linking hash routing dla 4 zakładek
✓ Klikalne stat-cards + KFS Banner
✓ Akcja tygodnia auto-expand+scroll
✓ interpolateLinks dla notatek Claudii (P3, Akademia X → klikalne)
✓ Test live na localhost (python3 -m http.server 8080)
✓ archiwum/checkpoint_v5_faza_B.md
✓ git commit -m "Faza B: moduły JS + grupowanie + deep-linking + 4 stany"
```

---

## FAZA C — NOWE FUNKCJE (45-60 min)

### C1. Marked.js + MD viewer modal

Pobierz lokalną kopię marked.js:

```bash
mkdir -p assets/js/lib
curl -o assets/js/lib/marked.min.js https://cdn.jsdelivr.net/npm/marked/marked.min.js
```

`index.html` dodaj przed innymi skryptami:
```html
<script src="assets/js/lib/marked.min.js"></script>
```

`assets/js/md_viewer.js`:

```javascript
async function openMdModal(filePath, title) {
  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error('Nie udało się pobrać pliku');
    const md = await res.text();
    const html = marked.parse(md);
    
    const modal = document.createElement('div');
    modal.className = 'md-modal-overlay';
    modal.innerHTML = `
      <div class="md-modal" onclick="event.stopPropagation()">
        <div class="md-modal-header">
          <h3>${title}</h3>
          <div class="md-modal-actions">
            <button onclick="copyMdContent(this)" class="btn-copy">Skopiuj</button>
            <a href="https://github.com/lukaszznojek-hue/irin-dashboard/edit/main/${filePath}" 
               target="_blank" class="btn-edit">Edytuj na GitHub</a>
            <button onclick="closeMdModal(this)" class="btn-close">✕</button>
          </div>
        </div>
        <div class="md-modal-body" data-raw="${encodeURIComponent(md)}">
          ${html}
        </div>
      </div>
    `;
    modal.onclick = () => closeMdModal(modal.querySelector('.btn-close'));
    document.body.appendChild(modal);
  } catch (e) {
    alert('Nie udało się otworzyć pliku: ' + e.message);
  }
}

function closeMdModal(el) {
  const modal = el.closest('.md-modal-overlay');
  if (modal) modal.remove();
}

function copyMdContent(btn) {
  const body = btn.closest('.md-modal').querySelector('.md-modal-body');
  const raw = decodeURIComponent(body.dataset.raw);
  navigator.clipboard.writeText(raw).then(() => {
    btn.textContent = 'Skopiowano ✓';
    setTimeout(() => { btn.textContent = 'Skopiuj'; }, 1500);
  });
}
```

CSS (dodaj do `style.css`):

```css
.md-modal-overlay { 
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
  background: rgba(0,0,0,0.5); z-index: 1000; 
  display: flex; align-items: center; justify-content: center; 
  padding: 20px;
}
.md-modal { 
  background: white; border-radius: 12px; max-width: 800px; width: 100%; 
  max-height: 90vh; display: flex; flex-direction: column; overflow: hidden;
}
.md-modal-header { 
  padding: 14px 20px; background: var(--granat); color: white; 
  display: flex; align-items: center; justify-content: space-between;
}
.md-modal-header h3 { font-family: Georgia, serif; font-size: 16px; }
.md-modal-actions { display: flex; gap: 8px; }
.btn-copy, .btn-edit, .btn-close { 
  padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; 
  border: 1px solid var(--zloto); background: transparent; color: var(--zloto-jasny); 
}
.btn-copy:hover, .btn-edit:hover { background: var(--zloto); color: var(--granat); }
.btn-close { padding: 6px 10px; }
.btn-edit { text-decoration: none; }
.md-modal-body { padding: 20px 30px; overflow-y: auto; line-height: 1.7; }
.md-modal-body h1, .md-modal-body h2, .md-modal-body h3 { 
  font-family: Georgia, serif; color: var(--granat); margin-top: 1em; 
}
.md-modal-body code { 
  background: var(--krem-jasny); padding: 2px 6px; border-radius: 4px; 
  font-family: monospace; font-size: 13px;
}
.md-modal-body pre { 
  background: var(--krem-jasny); padding: 12px; border-radius: 6px; 
  overflow-x: auto;
}
.md-modal-body ul, .md-modal-body ol { padding-left: 24px; }
```

W `sprzedaz.js` zamień karty sales:

```javascript
function renderSalesSection(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items.map(i => `
    <div class="sales-card" onclick="openMdModal('${i.file}', '${i.title.replace(/'/g, '\\\'')}')">
      <div class="sales-card-title">${i.title}</div>
      <div class="sales-card-desc">${i.desc}</div>
      <div class="sales-card-action">Otwórz →</div>
    </div>
  `).join('');
}
```

### C2. Benchmark cenowy w tabeli szkoleń

W `szkolenia.js` zamień `renderBURTable()`:

```javascript
function renderBURTable() {
  const tbody = document.getElementById('irin-tbody');
  if (!tbody || !DASHBOARD_DATA.szkolenia?.uslugi) return;
  
  const benchmarki = DASHBOARD_DATA.benchmarki?.kategorie || {};
  
  tbody.innerHTML = DASHBOARD_DATA.szkolenia.uslugi.map(u => {
    const cenaIrin = u.cena_h;
    const cenaRynek = u.cena_h_rynek_avg ?? benchmarki[u.kategoria]?.cena_h_rynek_avg;
    const benchmark = renderBenchmarkBadge(cenaIrin, cenaRynek, u);
    
    return `<tr class="bur-row" data-kat="${u.kategoria}">
      <td>
        <div class="bur-title">${u.tytul}</div>
        <div class="bur-id">ID: ${u.id_bur}</div>
      </td>
      <td><span class="irin-cat ${u.kategoria}">${katLabel(u.kategoria)}</span></td>
      <td class="amount">${formatKwota(u.cena_brutto)}</td>
      <td class="cena-h-irin">${cenaIrin} zł/h</td>
      <td class="cena-h-rynek">${cenaRynek ? cenaRynek + ' zł/h' : '—'}</td>
      <td class="benchmark-cell">${benchmark}</td>
      <td>${u.godziny}h</td>
      <td>${u.forma}${u.miasto ? '<br><small>' + u.miasto + '</small>' : ''}</td>
      <td>${u.data_start ? fmtDateShort(new Date(u.data_start)) : '—'}</td>
      <td><span class="tier-irin tier-${u.tier_priorytetu_irin}">T${u.tier_priorytetu_irin}</span></td>
      <td>${(u.powiazane_priorytety||[]).map(p => `<span class="prior-tag">${p}</span>`).join(' ')}</td>
    </tr>`;
  }).join('');
}

function renderBenchmarkBadge(cenaIrin, cenaRynek, szkolenie) {
  if (!cenaRynek) return '<span class="bench-badge bench-unknown">—</span>';
  
  const diff = ((cenaIrin - cenaRynek) / cenaRynek) * 100;
  const diffRounded = Math.round(diff);
  
  let kategoria, label, tooltip;
  if (diff < -10) {
    kategoria = 'cheaper';
    label = `↓ ${diffRounded}%`;
    tooltip = `Tańsi o ${Math.abs(diffRounded)}%. Argument: cena niższa niż rynek (${cenaRynek} zł/h średnia).`;
  } else if (diff > 25) {
    kategoria = 'premium';
    label = `↑ +${diffRounded}%`;
    tooltip = `Premium ${diffRounded}% powyżej rynku. Pozycjonuj jako akademicki standard, ocena 4.9/5 (813 ocen).`;
  } else if (diff > 10) {
    kategoria = 'higher';
    label = `↑ +${diffRounded}%`;
    tooltip = `Drożsi o ${diffRounded}%. Argument jakością: ocena 4.9/5 (813 ocen), priorytet PARP, ${szkolenie.forma === 'zdalna' ? 'zdalna forma' : 'praktyczne podejście'}.`;
  } else {
    kategoria = 'equal';
    label = diff >= 0 ? `~ +${diffRounded}%` : `~ ${diffRounded}%`;
    tooltip = `Cena na poziomie rynku (±10%). Argument: ocena 4.9/5 jako wyróżnik.`;
  }
  
  return `<span class="bench-badge bench-${kategoria}" title="${tooltip}">${label}</span>`;
}
```

W `index.html` w tabeli szkoleń zaktualizuj nagłówki:

```html
<tr>
  <th style="min-width:280px">Szkolenie</th>
  <th>Kat.</th>
  <th>Cena</th>
  <th>Cena/h IRIN</th>
  <th>vs rynek</th>
  <th>Różnica</th>
  <th>Godz.</th>
  <th>Forma</th>
  <th>Termin</th>
  <th>Tier</th>
  <th>Priorytety</th>
</tr>
```

CSS:

```css
.bench-badge { padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; cursor: help; }
.bench-cheaper { background: #DCFCE7; color: #166534; }
.bench-equal { background: #DBEAFE; color: #1E40AF; }
.bench-higher { background: #FEF3C7; color: #92400E; }
.bench-premium { background: #FEE2E2; color: #991B1B; }
.bench-unknown { background: var(--zakonczony-bg); color: var(--szary); }
.cena-h-irin { font-weight: 700; color: var(--granat); }
.cena-h-rynek { color: var(--szary); }
```

### C3. Filtry rozszerzone w zakładce Szkolenia

W `index.html` panel szkolenia rozbuduj filtry:

```html
<div class="irin-filters">
  <div class="irin-filter-group">
    <span class="filter-label">Kategoria:</span>
    <div class="irin-filter-chip active" data-bur-filter="kat" data-val="all">Wszystkie</div>
    <div class="irin-filter-chip" data-bur-filter="kat" data-val="ai">AI/Cyfrowe</div>
    <div class="irin-filter-chip" data-bur-filter="kat" data-val="edukacja">Edukacja spec.</div>
    <div class="irin-filter-chip" data-bur-filter="kat" data-val="biznes">Biznes</div>
  </div>
  <div class="irin-filter-group">
    <span class="filter-label">Forma:</span>
    <div class="irin-filter-chip active" data-bur-filter="forma" data-val="all">Wszystkie</div>
    <div class="irin-filter-chip" data-bur-filter="forma" data-val="zdalna">Zdalna</div>
    <div class="irin-filter-chip" data-bur-filter="forma" data-val="mieszana">Mieszana</div>
  </div>
  <div class="irin-filter-group">
    <span class="filter-label">Tier IRIN:</span>
    <div class="irin-filter-chip active" data-bur-filter="tier" data-val="all">Wszystkie</div>
    <div class="irin-filter-chip" data-bur-filter="tier" data-val="1">T1</div>
    <div class="irin-filter-chip" data-bur-filter="tier" data-val="2">T2</div>
    <div class="irin-filter-chip" data-bur-filter="tier" data-val="3">T3</div>
  </div>
  <div class="irin-filter-group">
    <span class="filter-label">Cena/h:</span>
    <div class="irin-filter-chip active" data-bur-filter="benchmark" data-val="all">Wszystkie</div>
    <div class="irin-filter-chip" data-bur-filter="benchmark" data-val="cheaper">Tańsi niż rynek</div>
    <div class="irin-filter-chip" data-bur-filter="benchmark" data-val="equal">Na poziomie rynku</div>
    <div class="irin-filter-chip" data-bur-filter="benchmark" data-val="higher">Drożsi niż rynek</div>
  </div>
</div>
```

`toggleBurFilter()` rozszerz o multi-wymiar (AND między grupami).

### C4. Filtr statusu propozycji

W `propozycje.js` dodaj filtr:

```html
<div class="proposals-filters">
  <div class="filter-chip active" data-prop-filter="status" data-val="all">Wszystkie</div>
  <div class="filter-chip" data-prop-filter="status" data-val="pomysl">Pomysły</div>
  <div class="filter-chip" data-prop-filter="status" data-val="analiza">W analizie</div>
  <div class="filter-chip" data-prop-filter="status" data-val="w_opracowaniu">W opracowaniu</div>
  <div class="filter-chip" data-prop-filter="status" data-val="gotowe">Gotowe</div>
</div>
```

W każdej karcie propozycji pokaż status badge i (jeśli `url_program`) link "Zobacz program →".

### C5. WUP — rozszerzone projekty BUR

W `wup.js` zaktualizuj `renderWupGrid()`:

```javascript
function renderWupGrid() {
  const grid = document.getElementById('wup-grid');
  if (!grid) return;
  grid.innerHTML = WOJEWODZTWA_KOLEJNOSC.map(slug => {
    const w = DASHBOARD_DATA.wup[slug];
    if (!w) return '';
    
    const projektyBur = w.projekty_bur?.length 
      ? w.projekty_bur.map(p => renderProjektBur(p)).join('') 
      : '<div class="no-data">Brak projektów lub do uzupełnienia</div>';
    
    return `<div class="wup-card">
      <div class="wup-card-header">
        <div class="wup-title">${w.operator_bur} 
          <span class="tier-badge" style="background:${TIER_COLORS[w.tier]}">${TIER_LABELS[w.tier]}</span>
        </div>
        <div class="wup-voiv">${w.wojewodztwo_label}</div>
      </div>
      <div class="wup-card-body">
        <div class="wup-section">
          <strong>Priorytety wojewódzkie:</strong>
          ${(w.priorytety_wojewodzkie || []).map(p => 
            `<div class="wup-priority"><strong>${p.kod}:</strong> ${p.nazwa}</div>`
          ).join('') || '<div class="no-data">Do weryfikacji</div>'}
        </div>
        <div class="wup-section">
          <strong>Projekty BUR:</strong>
          ${projektyBur}
        </div>
        ${w.claudia_note ? `<div class="claudia-note small">
          <span class="claudia-avatar small">C</span>
          <div class="claudia-text">${interpolateLinks(w.claudia_note)}</div>
        </div>` : ''}
      </div>
      <div class="wup-card-footer">
        <a href="${w.wup_url}" target="_blank" rel="noopener">Strona WUP ↗</a>
      </div>
    </div>`;
  }).join('');
}

function renderProjektBur(p) {
  const status = p.status || 'unknown';
  const veryf = p.do_weryfikacji ? '<span class="warning-badge">⚠️</span>' : '';
  const kwota = p.kwota_alokacji 
    ? `<div class="proj-field"><span class="field-label">Kwota:</span> ${formatKwota(p.kwota_alokacji)}</div>` 
    : '';
  const intens = p.intensywnosc_max 
    ? `<div class="proj-field"><span class="field-label">Intensywność:</span> ${p.intensywnosc_max}</div>` 
    : '';
  const daty = (p.data_start || p.data_end) 
    ? `<div class="proj-field"><span class="field-label">Termin:</span> ${p.data_start || '?'} → ${p.data_end || '?'}</div>` 
    : '';
  const grupa = p.grupa_docelowa 
    ? `<div class="proj-field"><span class="field-label">Grupa:</span> ${p.grupa_docelowa}</div>` 
    : '';
  const linki = (p.url_regulamin || p.url_wniosek) 
    ? `<div class="proj-links">
        ${p.url_regulamin ? `<a href="${p.url_regulamin}" target="_blank">Regulamin ↗</a>` : ''}
        ${p.url_wniosek ? `<a href="${p.url_wniosek}" target="_blank">Wniosek ↗</a>` : ''}
       </div>` 
    : '';
  const dopasowane = p.irin_dopasowane_szkolenia?.length 
    ? `<div class="proj-field"><span class="field-label">IRIN dopasowane:</span> 
        ${p.irin_dopasowane_szkolenia.map(id => 
          `<a class="link-akad" onclick="goToSzkolenia('${id}')">${id}</a>`
        ).join(', ')}
       </div>` 
    : '';
  const note = p.claudia_note 
    ? `<div class="proj-note">${p.claudia_note}</div>` 
    : '';
  
  return `<div class="wup-project">
    <div class="proj-head">
      <span class="project-status status-${status}">${status}</span>
      <strong>${p.nazwa}</strong>
      ${veryf}
    </div>
    <div class="proj-fields">${kwota}${intens}${daty}${grupa}${dopasowane}</div>
    ${linki}
    ${note}
  </div>`;
}
```

### Deliverables Fazy C

```
✓ assets/js/lib/marked.min.js (lokalna kopia)
✓ MD viewer modal działający (test: kliknij dowolny skrypt sales)
✓ Benchmark cenowy w tabeli szkoleń (4 kolumny + tooltip)
✓ Filtry rozszerzone w Szkoleniach (kategoria, forma, tier, benchmark)
✓ Filtr statusu w Propozycjach
✓ WUP rozszerzone projekty BUR z linkami i dopasowaniem szkoleń
✓ Test live (localhost) wszystkich nowych funkcji
✓ archiwum/checkpoint_v5_faza_C.md
✓ git commit -m "Faza C: MD viewer + benchmark cenowy + nowe filtry"
```

---

## FAZA D — TESTY + DEPLOY + LEARNING LOG (30-45 min)

### D1. Test cases — sprawdź ręcznie

Uruchom `python3 -m http.server 8080` w folderze dashboard_v4 i przejdź checklistę:

```
TEST 1: Grupowanie powiatów
  □ 16 sekcji województw widocznych
  □ Klik na header województwa → zwija/rozwija grupę
  □ Rollup pokazuje 4 liczniki + sumę kwot
  □ Akcja tygodnia widoczna jeśli wpisana w wup/<woj>.json
  
TEST 2: 4 stany akcji
  □ Filtr "🟢 Aktywne" pokazuje tylko aktywne
  □ Filtr "🟡 Zadzwoń" pokazuje tylko zadzwoń
  □ Lewa krawędź karty ma odpowiedni kolor per stan
  □ Badge po prawej stronie karty pokazuje status
  
TEST 3: Klikalne sygnały
  □ Klik "Krytyczne <7d" w stat-card → przeskok do Powiaty + filtr
  □ Klik "Wymóg BUR" w KFS Banner → przeskok do Słownika z hasłem BUR
  □ Klik "Akcja tygodnia" → expand grupy + scroll + highlight karty
  □ Klik "P3" w notatce Claudii → przeskok do Słownika
  
TEST 4: Deep-linking
  □ URL #powiaty?akcja=aktywny otwiera odpowiedni stan
  □ URL #powiaty?urzad=MUP%20Kielce auto-expanduje kartę
  □ Zmiana filtra aktualizuje URL
  
TEST 5: Benchmark cenowy
  □ Tabela szkoleń ma 4 kolumny cenowe (cena/h IRIN, vs rynek, różnica, badge)
  □ Tooltip nad badge pokazuje argumentację sprzedażową
  □ Filtr "Tańsi niż rynek" / "Drożsi" działa
  
TEST 6: MD viewer
  □ Klik na "Cold call" w zakładce Sprzedaż → otwiera modal
  □ Modal renderuje markdown poprawnie (h1, listy, code)
  □ Przycisk "Skopiuj" kopiuje raw MD do schowka
  □ Przycisk "Edytuj na GitHub" otwiera edytor w nowej karcie
  □ Klik tła zamyka modal
  
TEST 7: WUP rozszerzone projekty
  □ Świętokrzyskie → WUP Kielce → 1 projekt z badge "do_weryfikacji"
  □ Pomorskie → WUP Gdańsk → "Brak projektów lub do uzupełnienia"
  □ Klik regulamin/wniosek (jeśli wypełnione) → otwiera link

TEST 8: Walidator JSON Schema
  □ python3 tools/validate_jsons.py kończy się OK
  □ Edytuj pliku z błędem (np. usuń wymagane pole) → walidator wyrzuca
  □ git commit gdy plik zły → pre-commit hook blokuje

TEST 9: Hash URL backward compatibility
  □ URL bez hash działa (default tab Powiaty)
  □ Stary URL #strategia.html nadal otwiera plik strategii
```

### D2. Aktualizacja docs/

`docs/README.md` — zaktualizuj o nowe funkcje:
- 4 stany akcji (zamiast 5+warning)
- Deep-linking via URL hash (przykłady)
- MD viewer (jak otwierać)
- Benchmark cenowy (jak interpretować badge)
- Schema validator (jak uruchomić)

`docs/INSTRUKCJA_AKTUALIZACJI.md` — zaktualizuj workflow tygodniowy:
- Pre-commit hook blokuje błędne JSON-y
- Akcja tygodnia wpisywana ręcznie do `wup/<woj>.json`
- Benchmark cenowy: aktualizacja kwartalna `data/benchmarki_rynkowe.json`

`docs/DEPLOYMENT.md` — bez zmian (GitHub Pages).

### D3. Merge na main + deploy

```bash
# Wszystkie testy przeszły
git checkout main
git merge --no-ff refactor/v5-grupowanie-deep-link
git push origin main
# Tag wersji
git tag v5.0.0
git push origin v5.0.0
```

GitHub Pages auto-deploy ~1 min. Sprawdź `https://lukaszznojek-hue.github.io/irin-dashboard/`:
- Wszystko działa po deploy
- Konsola przeglądarki: 0 błędów
- Network tab: wszystkie pliki JSON pobrane (200)

### D4. Aktualizacja meta.json

```json
{
  "wersja": "5.0.0",
  "data_aktualizacji": "<DATA_DZIS>",
  "kolejna_planowana_aktualizacja": "<DATA+7>",
  "changelog": [
    {
      "data": "<DATA_DZIS>",
      "wersja": "5.0.0",
      "zmiany": [
        "Grupowanie powiatów po województwie z rollup'em",
        "4 stany akcji: AKTYWNY/MONITORUJ/ZADZWOŃ/ZAKOŃCZONY",
        "Deep-linking via URL hash + klikalne sygnały",
        "MD viewer modal w zakładce Sprzedaż (marked.js)",
        "Benchmark cenowy szkoleń vs rynek (4 strefy + tooltip)",
        "Rozszerzone projekty BUR (11 pól)",
        "5+ nowych filtrów (priorytet, kwota, świeżość, forma, tier)",
        "JSON Schema validator + pre-commit hook",
        "Modułowy JS (12 plików zamiast 1)",
        "Akcja tygodnia per województwo (auto-scroll do urzędu)"
      ],
      "kto": "Claude Code (autonomous workflow)"
    },
    // ... poprzednie wpisy z v4
  ]
}
```

### D5. Learning log + checkpoint końcowy

Wpis do `_claudia_system/learning_log.md`:

```markdown
## 2026-04-XX — Refactor IRIN dashboard v4 → v5 (Claude Code autonomous)

**Co działało dobrze:**
- (CC wypełni - co poszło sprawnie, co było czystą egzekucją)

**Co było słabe / wymagało korekty:**
- (CC wypełni - gdzie utknąłem, co musiałem przerobić)

**Wnioski na przyszłość:**
- (CC wypełni - patterns do powtórzenia, rzeczy do uniknięcia)

**Czas:**
- Faza 0: __ min
- Faza A: __ min
- Faza B: __ min
- Faza C: __ min
- Faza D: __ min
- TOTAL: __ h __ min vs estymacja 3-4h
```

Plik checkpoint: `archiwum/checkpoint_v5_faza_D_KONIEC.md`:

```markdown
# Refactor v5 — KONIEC sprintu

**Data:** YYYY-MM-DD HH:MM
**Branch zmergowany:** refactor/v5-grupowanie-deep-link → main
**Tag wydania:** v5.0.0
**Live URL:** https://lukaszznojek-hue.github.io/irin-dashboard/

## Status

✓ Wszystkie 5 problemów rozwiązane
✓ 9 testów przeszło
✓ Walidator JSON działa
✓ Deploy live na GitHub Pages

## Lista zmian dla Łukasza (do akceptacji rano)

1. Grupowanie po województwie z rollup'em
2. 4 stany akcji
3. Deep-linking
4. MD viewer
5. Benchmark cenowy
6. Rozszerzone projekty BUR
7. Nowe filtry
8. Schema validator
9. Modułowy JS

## Otwarte zadania (osobne sprinty)

- Wypełnienie projekty_bur dla Tier 1A (4 województwa) - migracja danych
- Wypełnienie cena_h_rynek_avg per szkolenie (override) - badanie konkurencji
- Wypełnienie akcja_tygodnia w wup/<woj>.json
- Aktualizacja prezentacji o nowe funkcje dashboardu

## Co Łukasz powinien sprawdzić rano

1. Otwórz live URL, kliknij każdą zakładkę
2. Sprawdź zakładkę Sprzedaż - kliknij "Cold call", zobacz modal
3. Sprawdź zakładkę Szkolenia - zobacz kolumny benchmark cenowy
4. Spróbuj URL #powiaty?akcja=aktywny&woj=swietokrzyskie
5. Zaakceptuj/zgłoś poprawki
```

### Deliverables Fazy D

```
✓ Wszystkie 9 testów przeszło
✓ docs/README.md zaktualizowany
✓ docs/INSTRUKCJA_AKTUALIZACJI.md zaktualizowany
✓ Merge na main + tag v5.0.0
✓ Deploy live działa
✓ data/meta.json zaktualizowany
✓ _claudia_system/learning_log.md - wpis końcowy
✓ archiwum/checkpoint_v5_faza_D_KONIEC.md
✓ git commit -m "Faza D: testy + deploy v5.0.0 + learning log"
```

---

## 3. ZASADY OGÓLNE DLA CLAUDE CODE

### 3.1. Co MASZ robić autonomicznie

- Pisać kod, testować, commitować po każdej fazie
- Jeśli widzisz alternatywne rozwiązanie lepsze niż w instrukcji - zastosuj, opisz krótko w checkpoincie czemu
- Nazewnictwo plików/klas/funkcji wg konwencji obecnej w projekcie (snake_case JSON, camelCase JS, kebab-case CSS)
- Uruchamiać `python3 tools/validate_jsons.py` po każdej zmianie w `data/`
- Robić git commit po każdej fazie z opisowym message

### 3.2. Czego NIE WOLNO

- ❌ Wymyślać danych których nie ma (np. wypełniać projekty_bur fikcyjnymi naborami) - zostaw `null` z `do_weryfikacji: true`
- ❌ Zmieniać hasła do strategia.html (zostaje `Wiktori@2026`)
- ❌ Przebudowywać architektury (vanilla JS, GitHub Pages, brak buildowania zostają)
- ❌ Dodawać dependencies poza marked.js (chyba że krytyczne, wtedy poproś o decyzję)
- ❌ Usuwać starych pól z JSON-ów (backward compatibility - zostaw je nawet jeśli UI ich nie używa)
- ❌ Pushować na main ZANIM faza D nie przejdzie testów

### 3.3. Kiedy się ZATRZYMAĆ i zapytać Łukasza

```
- Walidator JSON wykrywa błędy w istniejących danych których nie da się 
  zmigrować bezbłędnie (np. nieoczekiwany format pola)
- Test przeszedł niejasno (działa ale dziwnie się zachowuje)
- Konflikty git przy merge na main
- marked.js się nie ładuje albo modal nie działa po 2 próbach naprawy
- Brakuje danych KRYTYCZNYCH dla działania (np. data/szkolenia_irin.json 
  ma puste uslugi[])
```

W każdym takim przypadku: zatrzymaj pracę, napisz do `archiwum/STOP_v5_<faza>.md` opis problemu i co próbowałeś, commit pliku, czekaj na decyzję Łukasza.

### 3.4. Format komunikacji w trakcie pracy

Po każdej fazie wyświetlaj raport (max 30 linii):

```
=== FAZA <X> KONIEC ===
Czas: __ min (estymacja: __ min)
Deliverables: ✓ ... ✓ ... ✓
Decyzje własne (poza instrukcją):
  - <decyzja 1, czemu>
  - <decyzja 2, czemu>
Problemy napotkane:
  - <problem, jak rozwiązany>
Następna faza: __ za chwilę
```

### 3.5. Reguły z preferencji Łukasza (KRYTYCZNE)

- Język polski z pełnymi znakami (ą, ę, ś, ć, ń, ó, ż, ź, ł)
- W nazwach plików/folderów: ASCII lowercase z podkreśleniem (bez polskich znaków)
- Bez emoji w commit messages (chyba że już są w obecnym repo)
- Bez "Oczywiście!" / "Świetnie!" w komunikacji - rzeczowo
- Myślnik `-`, nie em-dash `—`
- Daty ISO: YYYY-MM-DD
- Nieodwracalne akcje (push na main, tag) - rób tylko po przejściu testów
- Bezpieczeństwo: nie commituj kluczy, haseł, tokenów

---

## 4. ZAŁĄCZNIKI

### 4.1. Plik startowy CC

W folderze `dashboard_v4/` powinien już istnieć ten plik (`REFACTOR_v5_INSTRUKCJA.md`). 
Łukasz uruchamia CC w tym folderze i pisze:

```
Wczytaj REFACTOR_v5_INSTRUKCJA.md i wykonaj autonomicznie wszystkie 5 faz.
```

### 4.2. Estymacja czasu

```
Faza 0: 15-20 min
Faza A: 45-60 min
Faza B: 60-90 min
Faza C: 45-60 min
Faza D: 30-45 min
=========
TOTAL: 3-4.5h
```

### 4.3. Ścieżki plików — referencje

```
Repo:        ./projekty/research_strategiczny/dashboard_v4/
Live:        https://lukaszznojek-hue.github.io/irin-dashboard/
GitHub:      https://github.com/lukaszznojek-hue/irin-dashboard
Branch:      refactor/v5-grupowanie-deep-link
Tag rollback: v4.0.0-pre-refactor-v5
Tag release: v5.0.0
Learning log: ../../../../_claudia_system/learning_log.md
```

### 4.4. Definicja gotowości (Definition of Done)

Sprint v5 zakończony WTEDY I TYLKO WTEDY gdy:

```
✓ Wszystkie 9 testów ręcznych przeszły
✓ python3 tools/validate_jsons.py kończy się OK
✓ Konsola przeglądarki na live URL: 0 błędów
✓ Network tab na live URL: wszystkie JSON-y 200
✓ Tag v5.0.0 utworzony i pushed
✓ docs/README.md i docs/INSTRUKCJA_AKTUALIZACJI.md zaktualizowane
✓ data/meta.json wersja 5.0.0
✓ archiwum/checkpoint_v5_faza_D_KONIEC.md istnieje
✓ Wpis w _claudia_system/learning_log.md
```

---

**KONIEC INSTRUKCJI. POWODZENIA.**
