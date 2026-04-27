#!/usr/bin/env python3
"""Audit stanu workspace dla v6.1 patch - identyfikuje co już zrobione."""
import json, os, sys
from pathlib import Path

DASH = Path(__file__).parent.parent
checks = {}

# Faza A
sz = json.load(open(DASH / "data/szkolenia_irin.json"))
checks["A1_10_uslug"] = len(sz["uslugi"]) == 10 and sz["liczba_uslug"] == 10
prop = json.load(open(DASH / "data/szkolenia_propozycje.json"))
checks["A2_15_propozycji"] = len(prop["propozycje"]) == 15
slownik = json.load(open(DASH / "data/slownik.json"))
terms = [t["skrot"] for t in slownik.get("terminy", [])]
checks["A4_slownik"] = all(
    x in terms for x in ["AI Act", "NIS2", "CSRD", "DORA", "Inno_Lab", "KRiBSI"]
)
meta = json.load(open(DASH / "data/meta.json"))
checks["A_meta_6.0"] = meta["wersja"].startswith("6.")

# Faza B
checks["B1_per_persona"] = (DASH / "sales/per_persona/hr_manager.md").exists()
checks["B1_uniwersalne"] = (DASH / "sales/uniwersalne/skrypt_cold_call.md").exists()
checks["B1_stare_usuniete"] = not (DASH / "sales/skrypty").exists() and not (
    DASH / "sales/emaile"
).exists()

# B2: sprawdz czy foldery 02-10 maja po 3+ plikow .md
b2_ok = True
for i in range(2, 11):
    matches = list((DASH / "sales/per_szkolenie").glob(f"{i:02d}_*"))
    if not matches or not list(matches[0].glob("*.md")):
        b2_ok = False
        break
checks["B2_per_szkolenie_full"] = b2_ok

sz_files = list((DASH / "sales/szef_sprzedazy").glob("*.md"))
checks["B3_szef_sprzedazy_5"] = len(sz_files) >= 5
checks["B4_readme"] = (DASH / "sales/README.md").exists()

# Faza C
idx = (DASH / "index.html").read_text()
checks["C_tailwinds_zakladka"] = 'data-panel="tailwinds"' in idx
checks["C_kalkulator"] = "kalkulator-dofinansowania" in idx
checks["C_banner_tailwinds"] = "tailwinds-banner" in idx

# Faza X
checks["X_strategia_encrypted"] = (DASH / "data/strategia_encrypted.json").exists()
checks["X_kpi_computed"] = (
    meta.get("kpi_dashboardu", {}).get("liczba_aktywnych_naborow", 0) > 0
)

# Wynik
print(json.dumps(checks, indent=2, ensure_ascii=False))
todo = [k for k, v in checks.items() if not v]
print(f"\nDO ZROBIENIA ({len(todo)}): {todo}", file=sys.stderr)
sys.exit(0 if not todo else 1)
