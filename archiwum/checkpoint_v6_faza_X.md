# Checkpoint v6.1 - Faza X (Build-time crypto + KPI)

**Data:** 2026-04-27
**Branch:** refactor/v6.1-patch

## Łukasz - akcja

🔑 **NOWE HASŁO STRATEGII:** `byPC-R0SDrHbB-GS`

Stare `Wiktori@2026` już nie działa. Przekaż zarządowi (Wiktoria, Anita) i zapisz w gestorze haseł.

**Jak zmienić hasło w przyszłości:**
```bash
# Edytuj _zrodla/strategia_plaintext.md jeśli trzeba
python3 tools/encrypt_strategia.py "NOWE_HASLO"
# lub auto-generuj:
python3 tools/encrypt_strategia.py --gen-password
```

## X1 - Enkrypcja strategii

- Ekstrakcja: `tools/extract_strategia_html.py` → `_zrodla/strategia_plaintext.md` (3344 znaków)
- Szyfrowanie: `tools/encrypt_strategia.py --gen-password` → `data/strategia_encrypted.json`
- Algorytm: AES-256-CBC + PBKDF2-HMAC-SHA1 (100k iteracji, sól "irin-dashboard-2026")
- CryptoJS: `assets/js/lib/crypto-js.min.js` (lokalna kopia, nie CDN)
- `strategia.html`: fetch encrypted JSON → CryptoJS decrypt → marked.js render
- `_zrodla/` w .gitignore ✅
- `git ls-files _zrodla/` puste ✅
- `data/strategia_encrypted.json` w git ✅
- `node tools/test_decrypt.js "byPC-R0SDrHbB-GS"` → PASS (3344 znaków) ✅

## X2 - KPI computed

```json
{
  "data_aktualizacji": "2026-04-27",
  "liczba_aktywnych_naborow": 4,
  "kwota_kfs_tier_1a_pln": 0,
  "liczba_szkolen_bur": 10,
  "dni_do_najblizszego_deadline_regulacyjnego": 97,
  "deadline_najblizszy_nazwa": "AI Act pełne stosowanie (2026-08-02)",
  "data_ostatniej_weryfikacji_telefonicznej": "2026-04-27"
}
```

**Uwaga:** `kwota_kfs_tier_1a_pln = 0` - pole `kfs_kwota_pln` nie istnieje w danych powiatów (brak kwotowych danych KFS per powiat). Wartość odzwierciedla faktyczny stan danych.

## X3 - Mapowanie warstw

SKIP (już w meta.json sekcja `mapowanie_warstw_researchu`).
