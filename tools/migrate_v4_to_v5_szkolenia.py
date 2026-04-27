#!/usr/bin/env python3
"""Migracja v4 -> v5: dodaje cena_h_rynek_avg + cena_h_rynek_zrodlo (null) do kazdej uslugi
oraz status/owner/komentarze/url_program (null) do kazdej propozycji."""
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SZK = REPO_ROOT / "data" / "szkolenia_irin.json"
PROP = REPO_ROOT / "data" / "szkolenia_propozycje.json"


def migrate_szkolenia():
    data = json.loads(SZK.read_text(encoding="utf-8"))
    n = 0
    for u in data.get("uslugi", []):
        if "cena_h_rynek_avg" not in u:
            u["cena_h_rynek_avg"] = None
        if "cena_h_rynek_zrodlo" not in u:
            u["cena_h_rynek_zrodlo"] = None
        n += 1
    SZK.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"  szkolenia_irin.json: {n} uslug rozszerzonych o cena_h_rynek_avg")


def migrate_propozycje():
    data = json.loads(PROP.read_text(encoding="utf-8"))
    n = 0
    for p in data.get("propozycje", []):
        if "status" not in p:
            p["status"] = "pomysl"
        if "owner_irin" not in p:
            p["owner_irin"] = None
        if "data_promocji_do_oferty" not in p:
            p["data_promocji_do_oferty"] = None
        if "url_program" not in p:
            p["url_program"] = None
        if "komentarze_zespolu" not in p:
            p["komentarze_zespolu"] = []
        n += 1
    PROP.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"  szkolenia_propozycje.json: {n} propozycji ze status: pomysl")


if __name__ == "__main__":
    migrate_szkolenia()
    migrate_propozycje()
