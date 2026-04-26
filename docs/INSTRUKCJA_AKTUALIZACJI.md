# Instrukcja aktualizacji tygodniowej

## Kto aktualizuje
Claudia (AI) na polecenie Łukasza, co poniedziałek ~9:00.

## Procedura

```bash
cd "/Users/znojek/Mój dysk/Claudia/biznes_wlasny/irin/projekty/research_strategiczny/dashboard_v4"

# 1. Pull (gdyby ktoś commitował ręcznie)
git pull origin main

# 2. Web research (Claudia automatycznie):
#    - Web fetch BUR: https://uslugirozwojowe.parp.gov.pl/...?dostawcyUslug[]=160205
#    - Web search per województwo TIER 1A: nowe nabory KFS
#    - Web search WUP-y TIER 1B: nowe projekty BUR

# 3. Aktualizacja plików:
#    data/powiaty/<woj>.json    — terminy, kwoty, statusy
#    data/wup/<woj>.json        — nowe nabory BUR
#    data/szkolenia_irin.json   — nowe usługi / zmiany terminów
#    data/meta.json             — data, wersja, changelog

# 4. Walidacja
python3 -c "
import json, os
for root, dirs, files in os.walk('data'):
    for f in files:
        if f.endswith('.json'):
            path = os.path.join(root, f)
            json.load(open(path, encoding='utf-8'))
            print(f'OK: {path}')
"

# 5. Commit + push
git add data/
git commit -m "Aktualizacja tygodniowa YYYY-MM-DD"
git push origin main

# 6. GitHub Pages deploy (~1 min) - automatycznie
```

## Co aktualizować co tydzień

| Plik | Co sprawdzić | Czas |
|---|---|---|
| data/powiaty/swietokrzyskie.json | Nowe nabory KFS, statusy AZOB | 10 min |
| data/powiaty/pomorskie.json | Tabela naborów z wupgdansk.praca.gov.pl/kfs-nabory | 10 min |
| data/powiaty/zachodniopomorskie.json | Nowe nabory (szczecin.praca.gov.pl) | 5 min |
| data/powiaty/kujawsko-pomorskie.json | Nowe nabory (torun.praca.gov.pl) | 5 min |
| data/szkolenia_irin.json | Nowe usługi, zmiana terminów, cen | 5 min |
| data/meta.json | Data aktualizacji, changelog | 2 min |

**Łączny czas: ~40 min/tydzień.**

## Co aktualizować co miesiąc

- data/wup/*.json — nowe projekty BUR, zmiany priorytetów
- data/parp_priorytety.json — jeśli MRiPS zmieni priorytety
- data/matryca.json — przeliczenie wyników A/B/C/D

## Flagowanie braków danych

Jeśli dane nie są dostępne online:
```json
"kfs_status": "DO_WERYFIKACJI",
"has_warning": true,
"claudia_note": "Dane z [data]. Do weryfikacji telefonicznej: [tel PUP]"
```
