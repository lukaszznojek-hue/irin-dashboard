#!/usr/bin/env python3
"""Migracja v4 -> v5 dla wojewodzkich plikow WUP.

- Dodaje akcja_tygodnia + akcja_tygodnia_target (null) na poziomie WUP.
- Rozszerza kazdy projekt_bur o 11-polowy schemat (null + do_weryfikacji=true).
- Zachowuje istniejace pola (nazwa, status, operator).
"""
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
WUP_DIR = REPO_ROOT / "data" / "wup"

PROJEKT_FIELDS = [
    "id_bur",
    "kwota_alokacji",
    "intensywnosc_max",
    "data_start",
    "data_end",
    "grupa_docelowa",
    "url_regulamin",
    "url_wniosek",
    "irin_dopasowane_szkolenia",
    "claudia_note",
]


def migrate_projekt(p):
    for k in PROJEKT_FIELDS:
        if k not in p:
            if k == "irin_dopasowane_szkolenia":
                p[k] = []
            else:
                p[k] = None
    if "do_weryfikacji" not in p:
        p["do_weryfikacji"] = True
    return p


def migrate_file(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    if "akcja_tygodnia" not in data:
        data["akcja_tygodnia"] = None
    if "akcja_tygodnia_target" not in data:
        data["akcja_tygodnia_target"] = None
    proj_count = 0
    for p in data.get("projekty_bur", []) or []:
        migrate_projekt(p)
        proj_count += 1
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return proj_count


def main():
    total_proj = 0
    files = sorted(WUP_DIR.glob("*.json"))
    for f in files:
        n = migrate_file(f)
        print(f"  {f.name}: akcja_tygodnia + {n} projektow rozszerzonych")
        total_proj += n
    print(f"\nLacznie: {len(files)} plikow WUP, {total_proj} projektow BUR")


if __name__ == "__main__":
    main()
