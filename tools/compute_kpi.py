#!/usr/bin/env python3
"""Compute KPI dashboardu z faktycznych danych (nie hardcoded)."""
import json
from datetime import date
from pathlib import Path

DASH = Path(__file__).parent.parent

naborow = 0
kfs_tier_1a_sum = 0
TIER_1A = ["swietokrzyskie", "pomorskie", "zachodniopomorskie", "kujawsko-pomorskie"]

for f in (DASH / "data/powiaty").glob("*.json"):
    woj = f.stem
    data = json.load(open(f))
    for powiat in data.get("powiaty", []):
        if (
            powiat.get("akcja_status") == "aktywny"
            or (powiat.get("akcja") == "zadzwon" and powiat.get("status") == "AKTYWNY")
        ):
            naborow += 1
        if woj in TIER_1A:
            kfs_tier_1a_sum += powiat.get("kfs_kwota_pln", 0) or 0

deadlines = [
    ("AI Act pełne stosowanie", "2026-08-02"),
    ("NIS2 rejestracja", "2026-10-03"),
    ("Akademia HR nabór", "2026-11-30"),
]
today = date.today()
najbl = min(deadlines, key=lambda x: (date.fromisoformat(x[1]) - today).days)
dni = (date.fromisoformat(najbl[1]) - today).days

szkolenia = json.load(open(DASH / "data/szkolenia_irin.json"))
meta = json.load(open(DASH / "data/meta.json"))

meta["kpi_dashboardu"] = {
    "data_aktualizacji": today.isoformat(),
    "liczba_aktywnych_naborow": naborow,
    "kwota_kfs_tier_1a_pln": kfs_tier_1a_sum,
    "liczba_szkolen_bur": len(szkolenia["uslugi"]),
    "dni_do_najblizszego_deadline_regulacyjnego": dni,
    "deadline_najblizszy_nazwa": f"{najbl[0]} ({najbl[1]})",
    "data_ostatniej_weryfikacji_telefonicznej": meta.get(
        "kpi_dashboardu", {}
    ).get("data_ostatniej_weryfikacji_telefonicznej", today.isoformat()),
}

json.dump(meta, open(DASH / "data/meta.json", "w"), indent=2, ensure_ascii=False)
print(
    f"✓ KPI: {naborow} naborów, {kfs_tier_1a_sum} zł tier 1A, {dni} dni do {najbl[0]}, {len(szkolenia['uslugi'])} szkoleń"
)
