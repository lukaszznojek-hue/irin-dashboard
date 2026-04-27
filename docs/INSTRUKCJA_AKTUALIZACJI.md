# Instrukcja aktualizacji tygodniowej

## Kto aktualizuje
Claudia (AI) na polecenie Lukasza, co poniedzialek ~9:00.

## Procedura

```bash
cd "/Users/znojek/Moj dysk/Claudia/biznes_wlasny/irin/projekty/research_strategiczny/dashboard_v4"

# 1. Pull (gdyby ktos commitowal recznie)
git pull origin main

# 2. Web research (Claudia automatycznie):
#    - Web fetch BUR: https://uslugirozwojowe.parp.gov.pl/...?dostawcyUslug[]=160205
#    - Web search per wojewodztwo TIER 1A: nowe nabory KFS
#    - Web search WUP-y TIER 1B: nowe projekty BUR

# 3. Aktualizacja plikow:
#    data/powiaty/<woj>.json    - terminy, kwoty, statusy
#    data/wup/<woj>.json        - nowe nabory BUR
#    data/szkolenia_irin.json   - nowe uslugi / zmiany terminow
#    data/meta.json             - data, wersja, changelog

# 4. Walidacja (JSON Schema)
python3 tools/validate_jsons.py
# Wymaga jsonschema: pip3 install --user jsonschema

# 5. KPI (po zmianach w naborach)
python3 tools/compute_kpi.py

# 6. Commit + push
git add data/
git commit -m "Aktualizacja tygodniowa YYYY-MM-DD"
git push origin main

# 7. GitHub Pages deploy (~1 min) - automatycznie
```

## Co aktualizowac co tydzien

| Plik | Co sprawdzic | Czas |
|---|---|---|
| data/powiaty/swietokrzyskie.json | Nowe nabory KFS, statusy AZOB | 10 min |
| data/powiaty/pomorskie.json | Tabela naborow z wupgdansk.praca.gov.pl/kfs-nabory | 10 min |
| data/powiaty/zachodniopomorskie.json | Nowe nabory (szczecin.praca.gov.pl) | 5 min |
| data/powiaty/kujawsko-pomorskie.json | Nowe nabory (torun.praca.gov.pl) | 5 min |
| data/szkolenia_irin.json | Nowe uslugi, zmiana terminow, cen | 5 min |
| data/meta.json | Data aktualizacji, changelog | 2 min |

**Laczny czas: ~40 min/tydzien.**

## Co aktualizowac co miesiac

- data/wup/*.json - nowe projekty BUR, zmiany priorytetow
- data/parp_priorytety.json - jesli MRiPS zmieni priorytety
- data/matryca.json - przeliczenie wynikow A/B/C/D

---

## Jak dodac/zaktualizowac powiat

Nowy powiat dodajesz do istniejacego pliku `data/powiaty/<wojewodztwo>.json`.
Dashboard laduje AUTOMATYCZNIE wszystkie powiaty z kazdego pliku - nie trzeba nic zmieniac w JS.

### Wymagane pola (minimum)

```json
{
  "voivodeship": "swietokrzyskie",
  "name": "nazwa-pup-slug",
  "display_name": "PUP w Nazwie Miasta",
  "display_meta": "PUP",
  "url_pup": "https://nazwa.praca.gov.pl",
  "akcja_status": "zadzwon",
  "pillars": ["KFS"],
  "pillar_details": []
}
```

### Pelny rekord (wszystkie pola)

```json
{
  "voivodeship": "swietokrzyskie",
  "name": "busko-zdroj",
  "display_name": "PUP w Busku-Zdroju",
  "display_meta": "PUP",
  "url_pup": "https://busko.praca.gov.pl",
  "telefon": "41 378 12 34",
  "email": "kifs@pup.busko.pl",
  "urgency": "aktywny",
  "urgency_days": 15,
  "kfs_start_date": "2026-05-01",
  "kfs_end_date": "2026-06-30",
  "kfs_status": "otwarty",
  "efs_status": "AKTYWNY",
  "amount_kfs": 1500000,
  "amount_total": 2000000,
  "irin_match": 1,
  "priorytety": ["P1", "P3"],
  "has_warning": false,
  "pillars": ["KFS", "EFS+"],
  "akcja_status": "aktywny",
  "akcja_status_uzasadnienie": "Nabor otwarty do 30.06.2026",
  "claudia_note": "Zweryfikowano telefonicznie 27.04.2026.",
  "pillar_details": [
    {
      "type": "KFS",
      "title": "Nabor 01/2026 (01.05 - 30.06)",
      "fields": {
        "Kwota": "1 500 000 zl",
        "Priorytety": "P1, P3",
        "Status": "otwarty"
      }
    }
  ],
  "data_aktualizacji": "2026-04-27"
}
```

### Co jest wyswietlane w dashboardzie

| Pole | Gdzie widoczne | Wymagane |
|---|---|---|
| voivodeship | Grupowanie | TAK |
| name | Identyfikator karty | TAK |
| display_name | Tytul karty | TAK |
| display_meta | Pod tytulem | nie |
| url_pup | 3 linki w karcie (PUP, KFS, Dokumenty) | nie |
| telefon | Klikalny numer telefonu | nie |
| email | Klikalny adres email | nie |
| akcja_status | Badge AKTYWNY/MONITOR/ZADZWON/ZAKONCZONY | TAK |
| kfs_status | Wiersz statusow (KFS: otwarty) | nie |
| efs_status | Wiersz statusow (EFS+: AKTYWNY) | nie |
| amount_kfs | Kwota KFS w naglowku | nie |
| amount_total | Kwota calkowita w statusach | nie |
| kfs_start_date | Countdown "start za Xd" | nie |
| kfs_end_date | Countdown "do konca Xd" | nie |
| priorytety | Tagi P1-P7 | nie |
| irin_match | Gwiazdka dopasowania | nie |
| pillars | Tagi KFS/EFS+ | TAK |
| pillar_details | Rozwiniety widok naborow | nie |
| claudia_note | Notatka z avatarem C | nie |
| akcja_status_uzasadnienie | Tekst pod statusem | nie |

### Automatyczne ladowanie

`core.js` laduje powiaty na podstawie tablicy `WOJEWODZTWA_KOLEJNOSC` w `assets/js/utils.js`.
Jesli dodajesz powiaty do ISTNIEJACEGO wojewodztwa - nic nie zmieniasz w JS.
Jesli dodajesz NOWE wojewodztwo (np. po rozszerzeniu tier):

1. Dodaj slug do `WOJEWODZTWA_KOLEJNOSC` w `assets/js/utils.js`
2. Dodaj label do `VOIVODESHIP_LABELS` w tym samym pliku
3. Utworz `data/powiaty/<slug>.json` i `data/wup/<slug>.json`

### Walidacja

```bash
python3 tools/validate_jsons.py
# Sprawdza: 36+ plikow JSON vs schematy w tools/schemas/
# Jesli FAIL: poprawi i powtorz
```

Schema w `tools/schemas/powiat.schema.json` wymaga:
- Root: wojewodztwo (string), wojewodztwo_label (string), tier (enum: 1a/1b/2), powiaty (array)
- Per powiat: voivodeship (string), name (string)

---

## Jak dodac nowe szkolenie

1. Dodaj obiekt do `data/szkolenia_irin.json` (tablica `uslugi`)
2. Utworz folder `sales/per_szkolenie/NN_nazwa/` z 3 plikami (one_pager.md, skrypt_rozmowy.md, email_cold.md)
3. Dodaj mapping id_bur -> folder w `assets/js/sprzedaz.js` (tablica `PER_SZKOLENIE_FOLDERS`)
4. Dodaj mapping w `tools/hydrate_per_szkolenie.py` (tablice `FOLDERS` i `KLASTRY`)
5. Walidacja: `python3 tools/validate_jsons.py`
6. KPI: `python3 tools/compute_kpi.py`

Bez kroku 3 szkolenie pojawi sie w tabeli Szkolen, ale NIE w sekcji "Per szkolenie" w zakladce Sprzedaz.

---

## Strategia zarzadu (v6.1+)

Tresc strategii jest szyfrowana AES-256-CBC. Plaintext w `_zrodla/strategia_plaintext.md` (gitignore).

```bash
# Edytuj tresc:
nano _zrodla/strategia_plaintext.md

# Re-enkrypcja z istniejacym haslem:
python3 tools/encrypt_strategia.py "HASLO"

# Lub wygeneruj nowe haslo:
python3 tools/encrypt_strategia.py --gen-password

# Commit encrypted JSON:
git add data/strategia_encrypted.json
git commit -m "Aktualizacja strategii"
git push origin main
```

## Banner i Tailwinds

Deadline'y regulacyjne w `assets/js/tailwinds.js` (tablica `TAILWINDS_DATA`).
Info-bar na gorze dashboardu - countdown AI Act obliczany automatycznie.

## KPI dashboardu

```bash
python3 tools/compute_kpi.py
# Aktualizuje data/meta.json > kpi_dashboardu
# Uruchamiaj przy kazdej zmianie naborow
```

## Flagowanie brakow danych

Jesli dane nie sa dostepne online:
```json
{
  "kfs_status": "DO_WERYFIKACJI",
  "has_warning": true,
  "akcja_status": "zadzwon",
  "claudia_note": "Dane z [data]. Do weryfikacji telefonicznej: [tel PUP]"
}
```

## Narzedzia

| Skrypt | Co robi | Kiedy |
|---|---|---|
| `tools/validate_jsons.py` | Walidacja JSON vs schematy | Po kazdej edycji danych |
| `tools/compute_kpi.py` | Przelicza KPI z danych | Po zmianie naborow |
| `tools/encrypt_strategia.py` | Szyfruje strategie | Po edycji _zrodla/strategia_plaintext.md |
| `tools/hydrate_per_szkolenie.py` | Generuje materialy per szkolenie | Po dodaniu nowego szkolenia |
| `tools/smoke_test_v6.py` | Headless test dashboardu | Przed deploy |
| `tools/audit_v6_state.py` | Audyt stanu workspace | Diagnostyka |
