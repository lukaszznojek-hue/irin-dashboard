# Super-prompt dla Claude Code - sprint v6 IRIN dashboard

> Wygenerowany przez Claudię (Cowork) po wykonaniu Faz 0+A
> Data: 2026-04-27
> CC startuje od tego miejsca - wszystkie proste zmiany danych już zrobione

---

## KONTEKST: CO JUŻ ZROBIONO (nie powtarzaj)

Claudia (Cowork) wykonała:
- `git tag pre-v6`, `git checkout -b refactor/v6-final`
- Dodała 10. szkolenie (3486195) do `data/szkolenia_irin.json` + liczba_uslug=10
- Dodała 6 terminów do `data/slownik.json` (18 terminów łącznie)
- Re-priorytetyzacja + 5 nowych PROP-11..15 w `data/szkolenia_propozycje.json`
- `data/meta.json` v6.0.0 + kpi_dashboardu + mapowanie_warstw_researchu
- `assets/js/szkolenia.js` - ID BUR jako link klikalny
- `assets/js/utils.js` - funkcja `addTermTooltips()` gotowa
- `sales/README.md` - navigator
- `sales/per_persona/` - 5 plików (przeniesione z emaile/)
- `sales/uniwersalne/` - 9 plików (przeniesione z emaile/ + skrypty/)
- `index.html` - v5→v6, proposals 10→15

Wszystko w working tree (niezcommitowane). Git status pokaże M dla 7 plików + ?? dla nowych.

---

## KROK 0: PIERWSZE AKCJE (zanim zaczniesz cokolwiek)

```bash
cd "/Users/znojek/Mój dysk/Claudia/biznes_wlasny/irin/projekty/research_strategiczny/dashboard_v4"

# Sprawdź stan
git status
git branch  # powinno być: refactor/v6-final

# Push taga (Cowork nie miał credentials)
git push --tags

# Commit tego co Cowork zrobiła
git rm -r sales/emaile/ sales/skrypty/
git add -A
git commit -m "v6: dane JSON (10 szkoleń, 18 terminów, 15 propozycji) + utils addTermTooltips + linki BUR + reorganizacja sales/"

# Walidacja
python3 tools/validate_jsons.py
```

---

## ZADANIA DO WYKONANIA (w kolejności)

### 1. B2 - Hydratacja 9 folderów per_szkolenie/ (NAJWIĘKSZE zadanie)

Utwórz foldery i 3 pliki w każdym (wzorzec: `sales/per_szkolenie/01_social_media_ai/`):

**Foldery do utworzenia:**
```
sales/per_szkolenie/02_sklep_cyfryzacja/       → ID 3432500, cena 5900 zł, 20h, zdalna, P3
sales/per_szkolenie/03_skutecznosc_ai/          → ID 3421591, cena 5880 zł, 28h, zdalna, P3
sales/per_szkolenie/04_zarzadzanie_ai/          → ID 3386476, cena 8750 zł, 50h, zdalna, P3
sales/per_szkolenie/05_si_gdansk_maj/           → ID 3420786, cena 9310 zł, 120h, mieszana, Gdańsk, P4
sales/per_szkolenie/06_si_gdansk_sierpien/      → ID 3405199, cena 9310 zł, 120h, mieszana, Gdańsk, P4
sales/per_szkolenie/07_si_kielce/               → ID 3270238, cena 9310 zł, 120h, mieszana, Kielce, P4
sales/per_szkolenie/08_tus_kielce/              → ID 3379725, cena 6000 zł, 50h, mieszana, Kielce, P4
sales/per_szkolenie/09_projekty_dofinansowane/  → ID 3381926, cena 5300 zł, 27h, zdalna, P1
sales/per_szkolenie/10_si_kielce_wrzesien/      → ID 3486195, cena 9310 zł, 120h, mieszana, Kielce, P4
```

**3 pliki per folder** (wg wzorca z 01_social_media_ai, dane z `data/szkolenia_irin.json`):
- `one_pager.md` (~80 linii) - fakty + kalkulator dofinansowania + 3 argumenty + top 3 obiekcje + link BUR
- `skrypt_rozmowy.md` (~120 linii) - 5 etapów: Diagnoza → Pieniądze → Prezentacja → Social proof → Zamknięcie
- `email_cold.md` (~130 linii) - 4 subject lines + treść + tabela placeholder→wartość + sequence follow-up

**Persony i argumenty per klaster:**

*AI/cyfryzacja (02, 03, 04) - P3:*
- Persony: HR Manager, Prezes mikrofirmy, Dyrektor ds. rozwoju
- Argumenty: AI literacy (AI Act art.4), cyfryzacja MŚP, krótki czas (20-50h), zdalna
- Kalkulator: mikrofirma+KFS = 10% kosztu (np. 5900 zł → klient 590 zł)

*SI/edukacja (05, 06, 07, 08, 10) - P4:*
- Persony: Dyrektor placówki edukacyjnej, Pedagog specjalny, Fizjoterapeuta, Logopeda
- Argumenty: 77,60 zł/h vs rynek 121,56 zł/h = -36% taniej, P4 PARP, certyfikat ISO 9001
- Dla SI: 120h = kompletna ścieżka I+II stopień

*Projekty dofinansowane (09) - P1:*
- Persony: Specjalista ds. dofinansowań, Właściciel MŚP szukający funduszy
- Argument cross-sell: "Po tym szkoleniu pomożemy złożyć wniosek KFS na inne nasze szkolenia"
- To top-of-funnel IRIN - najważniejszy lead-gen

**URL BUR:** `https://uslugirozwojowe.parp.gov.pl/wyszukiwarka/uslugi/podglad?id={ID}`

---

### 2. B3 - 4 pliki szef_sprzedazy/ (już jest wytyczne_zarzadzania_zespolem.md)

Utwórz:
- `sales/szef_sprzedazy/kpi_dashboardy.md` - lista KPI handlowca + szefa, formuły, jak czytać dashboard
- `sales/szef_sprzedazy/pipeline_review_template.md` - szablon cotygodniowego 30-min review
- `sales/szef_sprzedazy/onboarding_handlowca.md` - plan 30/60/90 dni z checklistami Day 1-5, tydzień 2-3-4
- `sales/szef_sprzedazy/kalibracja_cen_negocjacje.md` - strefy: zielona/żółta/pomarańczowa/czerwona, argumenty kontrcenowe

---

### 3. C2 - Linki PUP/WUP klikalne

W `assets/js/powiaty.js` - przy renderowaniu karty PUP dodaj link klikalny na `url_pup`.
W `assets/js/wup.js` - analogicznie `wup_url`.

Sprawdź jak są renderowane i dodaj `<a href="{url}" target="_blank">Nazwa PUP ↗</a>`.

---

### 4. C4 - Banner Tailwinds 2026 + zakładka "Tailwinds 2026"

**Banner** - wstaw w `index.html` po `<div class="kfs-banner"...` (po istniejącym bannerze KFS):

```html
<!-- TAILWINDS 2026 BANNER -->
<div class="tailwinds-banner" id="tailwinds-banner">
  <div class="tw-banner-icon">⚠️</div>
  <div class="tw-banner-content">
    <strong>Tailwinds 2026:</strong>
    AI Act za <span id="tw-aiact-days">—</span> dni (02.08.2026) ·
    NIS2 rejestracja za <span id="tw-nis2-days">—</span> dni (03.10.2026) ·
    Akademia HR do <span id="tw-akadhr-days">—</span> dni (30.11.2026)
    <a onclick="switchTab(document.querySelector('[data-panel=tailwinds]'),'tailwinds')" class="banner-link">→ szczegóły</a>
  </div>
  <button class="kfs-banner-close" onclick="this.parentElement.style.display='none'">✕</button>
</div>
```

**JS countdown** (dodaj do `core.js` lub nowy plik `tailwinds.js`):
```js
function initTailwindsCountdown() {
  const now = new Date();
  const deadlines = {
    'tw-aiact-days': new Date('2026-08-02'),
    'tw-nis2-days': new Date('2026-10-03'),
    'tw-akadhr-days': new Date('2026-11-30')
  };
  Object.entries(deadlines).forEach(([id, deadline]) => {
    const days = Math.ceil((deadline - now) / (1000*60*60*24));
    const el = document.getElementById(id);
    if (el) el.textContent = days > 0 ? days : 'PRZETERMINOWANE';
  });
}
```

**Zakładka "Tailwinds 2026"** - dodaj do nav-tabs w `index.html` (przed Strategia link):
```html
<div class="nav-tab" data-panel="tailwinds" role="tab" tabindex="-1" onclick="switchTab(this,'tailwinds')">Tailwinds 2026</div>
```

**Panel tailwinds** - dodaj po panel-sprzedaz:
```html
<div class="panel" id="panel-tailwinds" role="tabpanel" style="display:none">
  <div id="tailwinds-content"></div>
</div>
```

**Nowy plik `assets/js/tailwinds.js`** - renderuje 4 karty: AI Act / NIS2 / Akademia HR / Inno_Lab.
Dane z `data/trendy.json` (dodaj sekcję `regulacyjne_2026`) lub hardcode w JS.
Każda karta: ikona / tytuł / status / deadline countdown / opis 2-3 zdania / "co IRIN może zrobić" / link.

Dodaj `<script src="assets/js/tailwinds.js"></script>` do index.html.

---

### 5. C5 - Sekcja "Per szkolenie" w zakładce Sprzedaż

W `assets/js/sprzedaz.js` - PRZED istniejącymi sekcjami (skrypty, emaile) wstaw nową sekcję:

```js
// Sekcja "Per szkolenie"
function renderPerSzkoleniaSection() {
  const uslugi = DASHBOARD_DATA.szkolenia?.uslugi || [];
  const sectionHtml = `
    <div class="sales-section" id="sales-per-szkolenie">
      <h3>Per szkolenie</h3>
      <div class="per-szk-grid">
        ${uslugi.map((u, i) => {
          const nr = String(i + 1).padStart(2, '0');
          const burUrl = u.url_bur || 'https://uslugirozwojowe.parp.gov.pl/wyszukiwarka/uslugi/podglad?id=' + u.id_bur;
          const baseFolder = perSzkolenieFolder(i + 1, u.tytul);
          return `<div class="per-szk-card">
            <div class="per-szk-title">${nr}. ${u.tytul.substring(0,50)}${u.tytul.length > 50 ? '...' : ''}</div>
            <div class="per-szk-meta">ID: ${u.id_bur} · ${u.cena_brutto?.toLocaleString('pl-PL')} zł · ${u.godziny}h</div>
            <div class="per-szk-actions">
              <button onclick="openSalesMd('${baseFolder}/one_pager.md')" title="One pager">📄 One pager</button>
              <button onclick="openSalesMd('${baseFolder}/skrypt_rozmowy.md')" title="Skrypt rozmowy">📞 Skrypt</button>
              <button onclick="openSalesMd('${baseFolder}/email_cold.md')" title="Email cold">✉️ Email cold</button>
              <a href="${burUrl}" target="_blank" rel="noopener" class="per-szk-bur-link">BUR ↗</a>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  const container = document.getElementById('panel-sprzedaz');
  if (container) container.insertAdjacentHTML('afterbegin', sectionHtml);
}

function perSzkolenieFolder(nr, tytul) {
  const folderMap = {
    1: '01_social_media_ai', 2: '02_sklep_cyfryzacja', 3: '03_skutecznosc_ai',
    4: '04_zarzadzanie_ai', 5: '05_si_gdansk_maj', 6: '06_si_gdansk_sierpien',
    7: '07_si_kielce', 8: '08_tus_kielce', 9: '09_projekty_dofinansowane',
    10: '10_si_kielce_wrzesien'
  };
  return 'sales/per_szkolenie/' + (folderMap[nr] || nr);
}
```

Wywołaj `renderPerSzkoleniaSection()` w inicjalizacji zakładki Sprzedaż (w `sprzedaz.js` lub `core.js`).

---

### 6. P20 - Szyfrowanie strategii zarządu (AES-256)

**6a. Utwórz `_zrodla/strategia_haslo.txt`** z treścią: `Wiktori@2026` (już w .gitignore)

**6b. Utwórz `_zrodla/strategia_plaintext.md`** - skopiuj treść z `strategia.html` linie 54-118 (STRATEGIA_CONTENT) jako Markdown:
- Sekcja 1: Pozycjonowanie rynkowe
- Sekcja 2: Wyniki BUR (zaktualizuj: liczba_uslug=10)
- Sekcja 3: Priorytety IRIN
- Sekcja 4: Plan ekspansji (top 3 + PROP-11..15)
- Sekcja 5: KFS 2026 argumenty
- Sekcja 6: Ryzyka strategiczne
- Sekcja 7: Zarząd (dane KRS)
- Sekcja 8: Następne kroki

**6c. Utwórz `tools/encrypt_strategia.py`**:
```python
#!/usr/bin/env python3
"""Szyfruje _zrodla/strategia_plaintext.md → data/strategia_encrypted.json (AES-256-CBC)"""
import sys, json, os, hashlib
from base64 import b64encode, b64decode

try:
    from Crypto.Cipher import AES
    from Crypto.Util.Padding import pad
    USE_PYCRYPTODOME = True
except ImportError:
    USE_PYCRYPTODOME = False

SALT = "irin-dashboard-2026"
KDF_ITERATIONS = 100000
PLAINTEXT_PATH = "_zrodla/strategia_plaintext.md"
OUTPUT_PATH = "data/strategia_encrypted.json"

def derive_key(password: str, salt: str) -> bytes:
    return hashlib.pbkdf2_hmac('sha1', password.encode('utf-8'), salt.encode('utf-8'), KDF_ITERATIONS, dklen=32)

def encrypt(password: str, plaintext: str) -> dict:
    key = derive_key(password, SALT)
    iv = os.urandom(16)
    if USE_PYCRYPTODOME:
        cipher = AES.new(key, AES.MODE_CBC, iv)
        ct = cipher.encrypt(pad(plaintext.encode('utf-8'), AES.block_size))
    else:
        # fallback: pyaes
        import pyaes
        aes = pyaes.AESModeOfOperationCBC(key, iv=iv)
        data = plaintext.encode('utf-8')
        pad_len = 16 - (len(data) % 16)
        data += bytes([pad_len] * pad_len)
        ct = b"".join(aes.encrypt(data[i:i+16]) for i in range(0, len(data), 16))
    checksum = hashlib.sha256(plaintext.encode('utf-8')).hexdigest()
    return {
        "algorithm": "AES-256-CBC",
        "kdf": "PBKDF2-HMAC-SHA1",
        "kdf_iterations": KDF_ITERATIONS,
        "salt_string": SALT,
        "iv": b64encode(iv).decode(),
        "ciphertext": b64encode(ct).decode(),
        "checksum_plain_sha256": checksum
    }

if __name__ == "__main__":
    password = sys.argv[1] if len(sys.argv) > 1 else open("_zrodla/strategia_haslo.txt").read().strip()
    with open(PLAINTEXT_PATH, encoding="utf-8") as f:
        plaintext = f.read()
    result = encrypt(password, plaintext)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(result, f, indent=2)
    print(f"Zaszyfrowano → {OUTPUT_PATH}")
    print(f"IV: {result['iv'][:20]}...")
    print(f"Checksum: {result['checksum_plain_sha256'][:16]}...")
```

**6d. Uruchom:** `pip install pycryptodome --break-system-packages && python3 tools/encrypt_strategia.py Wiktori@2026`

**6e. Utwórz `assets/js/lib/crypto-js.min.js`** - pobierz lokalnie:
```bash
curl -o assets/js/lib/crypto-js.min.js "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js"
```

**6f. Utwórz `assets/js/crypto.js`**:
```js
/* crypto.js - dekodowanie strategii AES-256-CBC */

async function unlockStrategia(password) {
  const resp = await fetch('data/strategia_encrypted.json');
  if (!resp.ok) throw new Error('Brak pliku strategia_encrypted.json');
  const enc = await resp.json();

  const key = CryptoJS.PBKDF2(password, enc.salt_string, {
    keySize: 256/32,
    iterations: enc.kdf_iterations,
    hasher: CryptoJS.algo.SHA1
  });
  const iv = CryptoJS.enc.Base64.parse(enc.iv);
  const ct = CryptoJS.enc.Base64.parse(enc.ciphertext);

  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: ct },
    key,
    { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
  );

  const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
  if (!plaintext) throw new Error('Błędne hasło');
  return plaintext;
}
```

**6g. Update `strategia.html`:**
- Dodaj `<script src="assets/js/lib/crypto-js.min.js"></script>` i `<script src="assets/js/crypto.js"></script>`
- Zmień `unlockStrategia()` żeby używało nowej funkcji z crypto.js
- Usuń inline `const STRATEGIA_CONTENT = \`...\`` (linie 54-118)
- Dodaj `<script src="assets/js/lib/crypto-js.min.js"></script>` przed zamknięciem body

**Walidacja:** otwórz strategia.html lokalnie, wpisz `Wiktori@2026` → treść się odkodowuje.

---

### 7. P21 - Kalkulator dofinansowania

W `assets/js/szkolenia.js` lub nowy `assets/js/kalkulator.js` - dodaj funkcję kalkulatora.

Wstaw HTML w `index.html` w panelu szkolenia (przed `<div class="irin-filters"`):

```html
<div class="kalkulator-dofin" id="kalkulator-dofin">
  <h4>💰 Kalkulator: ile zapłaci klient?</h4>
  <div class="kalk-row">
    <label>Firma:</label>
    <select id="kalk-rozmiar" onchange="obliczDofin()">
      <option value="0.10">Mikro (1-9 osób) — 90% dofinansowania KFS</option>
      <option value="0.20">Małe (10-49) — 80%</option>
      <option value="0.30">Średnie (50-249) — 70%</option>
      <option value="0.50">Duże (250+) — 50%</option>
    </select>
  </div>
  <div class="kalk-row">
    <label>Szkolenie:</label>
    <select id="kalk-szkolenie" onchange="obliczDofin()"></select>
  </div>
  <div class="kalk-result" id="kalk-result" style="display:none">
    <div>Cena: <strong id="kalk-cena">—</strong></div>
    <div class="kalk-highlight">Klient zapłaci: <strong id="kalk-klient">—</strong></div>
    <div>Dofinansowanie KFS: <strong id="kalk-dofin">—</strong></div>
    <div id="kalk-limit-info" style="color:#c0392b;font-size:0.85em"></div>
  </div>
</div>
```

JS w `kalkulator.js`:
```js
function initKalkulator() {
  const uslugi = DASHBOARD_DATA.szkolenia?.uslugi || [];
  const sel = document.getElementById('kalk-szkolenie');
  if (!sel) return;
  uslugi.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.cena_brutto;
    opt.textContent = u.tytul.substring(0, 55) + (u.tytul.length > 55 ? '...' : '') + ' — ' + u.cena_brutto?.toLocaleString('pl-PL') + ' zł';
    sel.appendChild(opt);
  });
  obliczDofin();
}

function obliczDofin() {
  const klientUdzial = parseFloat(document.getElementById('kalk-rozmiar')?.value || 0.1);
  const cena = parseFloat(document.getElementById('kalk-szkolenie')?.value || 0);
  if (!cena) return;
  const klientPlaci = cena * klientUdzial;
  const dofin = cena - klientPlaci;
  const LIMIT_KFS = 17800; // 2× przeciętne wynagrodzenie 2026
  document.getElementById('kalk-cena').textContent = cena.toLocaleString('pl-PL') + ' zł';
  document.getElementById('kalk-klient').textContent = Math.round(klientPlaci).toLocaleString('pl-PL') + ' zł';
  document.getElementById('kalk-dofin').textContent = Math.round(dofin).toLocaleString('pl-PL') + ' zł';
  document.getElementById('kalk-limit-info').textContent = dofin > LIMIT_KFS
    ? `⚠️ Dofinansowanie ${Math.round(dofin).toLocaleString('pl-PL')} zł > limit KFS ${LIMIT_KFS.toLocaleString('pl-PL')} zł — klient dopłaca różnicę`
    : '';
  document.getElementById('kalk-result').style.display = '';
}
```

Dodaj wywołanie `initKalkulator()` po załadowaniu danych (w core.js po `initBurTable()` itp.).
Dodaj `<script src="assets/js/kalkulator.js"></script>` do index.html.

---

### 8. Aktualizacje linkowania i tooltipy (hookup)

W `core.js` - po załadowaniu zakładki Szkolenia wywołaj:
```js
addTermTooltips(document.getElementById('panel-szkolenia'));
```

(Funkcja `addTermTooltips` jest już gotowa w `utils.js`)

---

### 9. COMMIT POŚREDNI (po B2+B3+C2-C5)

```bash
git add -A
git commit -m "v6: 27 plików per_szkolenie/, 4 pliki szef_sprzedazy/, banner Tailwinds, sekcja per szkolenie w Sprzedaż, tooltipy hookup, kalkulator dofinansowania"
```

---

### 10. P23 - KPI w footer

W `index.html` - rozszerz footer o sekcję KPI:
```html
<div class="footer-kpi">
  <span onclick="switchTab(document.querySelector('[data-panel=szkolenia]'),'szkolenia')" class="kpi-link">
    Szkoleń BUR: <strong id="kpi-szkolen">10</strong>
  </span> ·
  <span class="kpi-link">
    AI Act za: <strong id="kpi-aiact-days">—</strong> dni
  </span> ·
  <span class="kpi-link">
    Weryfikacja: <strong id="kpi-weryfikacja">2026-04-27</strong>
  </span>
</div>
```

Wypełnij `kpi-aiact-days` z tego samego countdown co banner Tailwinds.

---

### 11. D - Smoke test + final commit + deploy

```bash
# Walidacja JSON
python3 tools/validate_jsons.py

# Smoke test lokalny (sprawdź ręcznie w przeglądarce):
python3 -m http.server 8080
# Otwórz http://localhost:8080
# - Wszystkie 8 zakładek działają (Powiaty/WUP/Szkolenia/Matryca/Trendy/Słownik/Sprzedaż/Tailwinds)
# - Banner Tailwinds countdown > 0 dla wszystkich 3
# - Tabela szkoleń: 10 wierszy, ID BUR jako linki
# - Kalkulator: 590 zł dla mikro+KFS+social_media_ai (5900 × 10%)
# - Tooltips: hover na "KFS" w dowolnym tekście pokazuje opis
# - Sekcja "Per szkolenie" w zakładce Sprzedaż: 10 kart

# Strategia
# Otwórz strategia.html lokalnie, wpisz Wiktori@2026 → treść się pokazuje

# Final commit
git add -A
git commit -m "v6.0.0: kalkulator + KPI footer + smoke test"

# Merge i deploy
git checkout main
git merge refactor/v6-final
git push origin main
git push --tags

# Sprawdź GitHub Pages po ~2 min
curl -I https://lukaszznojek-hue.github.io/irin-dashboard/
```

---

### 12. Final checkpoint

Utwórz `archiwum/checkpoint_v6_KONIEC.md` wg formatu z sekcji 7 PROMPT_v6_FINAL_CC.md.

---

## STOP-PROTOKÓŁ (nie pytaj - wykonaj lub zatrzymaj z raportem)

Zatrzymaj tylko gdy:
1. `python3 tools/validate_jsons.py` fail po próbie naprawy
2. `curl` live URL zwraca != 200 po deploy
3. `tools/encrypt_strategia.py` nie produkuje validnego JSON (test: python odczytaj i sprawdź klucze)
4. Kalkulator pokazuje błędne wartości spot-check (mikro+KFS+5900 != 590 zł)

W STOP: zapisz `archiwum/checkpoint_v6_STOP_{faza}.md` z co/fail/sugestia.

---

## ZASADY

- Język plików: polski z pełnymi znakami (ą, ę, ś, ć, ń, ó, ż, ź, ł)
- Nazwy plików: ascii_lowercase_z_podkresleniem
- Daty: ISO YYYY-MM-DD
- Kwoty: "5 900 zł" (spacja jako thousand separator)
- Commits po polsku

---

**Estymacja CC:** ~4-5h (duże zadania to B2 i P20)
**Checkpoint startowy:** `archiwum/checkpoint_v6_faza_0_A.md` (zrobiony przez Cowork)
