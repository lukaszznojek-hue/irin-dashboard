#!/usr/bin/env python3
"""Merger: aplikuje wyniki ze scrape JSON na data/powiaty/*.json.

Strategia merge (zachowaj istniejace dane):
- amount_kfs: aktualizuj jesli scrape > 0 i (istniejace == 0 lub None)
- telefon: aktualizuj jesli scrape ma 1+ i istniejace null
- email: aktualizuj jesli scrape ma 1+ i istniejace null
- kfs_status, kfs_start_date, kfs_end_date: aktualizuj tylko jesli scrape ma + istniejace null/'BRAK_DANYCH'/'DO_WERYFIKACJI'
- claudia_note: APPEND z notka 'v6.5 scraper: ...'

Run:
    cd tools/scraper && source venv/bin/activate
    python merge_scrape_to_powiaty.py --timestamp 20260427_124328

Lub auto-detect najnowszy timestamp:
    python merge_scrape_to_powiaty.py --latest
"""
import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

DASH = Path(__file__).parent.parent.parent
SCRAPE_DIR = DASH / "data" / "scrape"
POWIATY_DIR = DASH / "data" / "powiaty"


def find_latest_timestamp():
    """Znajduje najnowszy timestamp ze wszystkich scrape JSON."""
    timestamps = set()
    for fp in SCRAPE_DIR.glob("scrape_*_*.json"):
        # nazwa: scrape_<woj>_<YYYYMMDD>_<HHMMSS>.json
        m = re.search(r"scrape_.+?_(\d{8}_\d{6})\.json$", fp.name)
        if m:
            timestamps.add(m.group(1))
    return max(timestamps) if timestamps else None


def load_scrape_for_woj(woj, timestamp):
    fp = SCRAPE_DIR / f"scrape_{woj}_{timestamp}.json"
    if not fp.exists():
        return None
    return json.loads(fp.read_text())


def merge_powiat(p_existing, scrape_result, timestamp):
    """Merge jednego powiatu. Zwraca (zmieniony_powiat, czy_zmienione, lista_zmian_str)"""
    changes = []
    p = p_existing.copy()
    # 1. amount_kfs
    new_kwota = scrape_result.get("kfs_kwota") or 0
    if new_kwota > 0 and (p.get("amount_kfs") or 0) == 0:
        p["amount_kfs"] = new_kwota
        p["amount_total"] = max(p.get("amount_total") or 0, new_kwota)
        changes.append(f"amount_kfs={new_kwota}")
    # 2. telefon (jesli istniejace null/empty)
    new_tels = scrape_result.get("telefony") or []
    if new_tels and not p.get("telefon"):
        p["telefon"] = ", ".join(new_tels[:3])  # max 3
        changes.append(f"telefon={len(new_tels)}")
    # 3. email
    new_mails = scrape_result.get("emaile") or []
    if new_mails and not p.get("email"):
        p["email"] = new_mails[0]
        changes.append("email")
    # 4. kfs_status / daty
    new_status = scrape_result.get("kfs_status")
    weak_statuses = (None, "", "BRAK_DANYCH", "DO_WERYFIKACJI")
    if new_status and p.get("kfs_status") in weak_statuses:
        p["kfs_status"] = new_status
        changes.append(f"status={new_status}")
        if scrape_result.get("kfs_start_date"):
            p["kfs_start_date"] = scrape_result["kfs_start_date"]
        if scrape_result.get("kfs_end_date"):
            p["kfs_end_date"] = scrape_result["kfs_end_date"]
        # Aktualizuj akcja_status na bazie nowego statusu
        if new_status == "TRWA":
            p["akcja_status"] = "aktywny"
            p["akcja_status_uzasadnienie"] = f"Nabor TRWA (scraper v6.5)"
        elif new_status == "NADCHODZI":
            p["akcja_status"] = "aktywny"
            p["akcja_status_uzasadnienie"] = f"Nabor NADCHODZI (scraper v6.5)"
        elif new_status == "ZAKONCZONY":
            p["akcja_status"] = "zakonczony"
            p["akcja_status_uzasadnienie"] = f"Nabor zakonczony (scraper v6.5)"
    # 5. claudia_note - dopisz tylko jesli zmiana
    if changes:
        url = scrape_result.get("kfs_url_zrodlo") or "(brak)"
        method = scrape_result.get("method", "?")
        new_note = f"v6.5 scraper [{method}]: dograne {', '.join(changes)}. Zrodlo: {url}"
        existing_note = p.get("claudia_note") or ""
        if "v6.5 scraper" not in existing_note:
            p["claudia_note"] = (existing_note + " | " + new_note).strip(" |")
    return p, len(changes) > 0, changes


def merge_wojewodztwo(woj, timestamp):
    fp_powiaty = POWIATY_DIR / f"{woj}.json"
    scrape_data = load_scrape_for_woj(woj, timestamp)
    if not scrape_data:
        return {"woj": woj, "error": "brak scrape", "merged": 0}
    if not fp_powiaty.exists():
        return {"woj": woj, "error": "brak powiaty json", "merged": 0}
    powiaty_data = json.loads(fp_powiaty.read_text())
    # Map scrape results po nazwie
    scrape_by_name = {r["powiat"]: r for r in scrape_data["results"]}
    merged_count = 0
    total_changes = []
    for i, p in enumerate(powiaty_data["powiaty"]):
        name = p.get("name")
        if name in scrape_by_name:
            new_p, changed, changes = merge_powiat(p, scrape_by_name[name], timestamp)
            if changed:
                powiaty_data["powiaty"][i] = new_p
                merged_count += 1
                total_changes.append(f"{name}: {','.join(changes)}")
    # Aktualizuj data_aktualizacji + zrodlo
    if merged_count > 0:
        powiaty_data["data_aktualizacji"] = "2026-04-27"
        existing_zrodlo = powiaty_data.get("zrodlo_danych", "")
        if "v6.5 scraper" not in existing_zrodlo:
            powiaty_data["zrodlo_danych"] = (existing_zrodlo + f" + v6.5 scraper bulk merge ({timestamp})").strip(" +")
        fp_powiaty.write_text(json.dumps(powiaty_data, ensure_ascii=False, indent=2) + "\n")
    return {
        "woj": woj,
        "merged": merged_count,
        "total_powiaty": len(powiaty_data["powiaty"]),
        "changes": total_changes,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--timestamp", help="np. 20260427_124328")
    parser.add_argument("--latest", action="store_true", help="auto-detect najnowszy timestamp")
    args = parser.parse_args()
    if args.latest or not args.timestamp:
        ts = find_latest_timestamp()
        if not ts:
            print("Brak scrape JSON-ow w data/scrape/", file=sys.stderr)
            sys.exit(1)
        print(f"Auto-detect: timestamp = {ts}")
    else:
        ts = args.timestamp

    woj_list = sorted([
        f.stem.replace(f"scrape_", "").rsplit("_", 2)[0]
        for f in SCRAPE_DIR.glob(f"scrape_*_{ts}.json")
    ])
    woj_list = list(dict.fromkeys(woj_list))  # unique
    print(f"\nMerge {len(woj_list)} wojewodztw z timestamp {ts}\n")

    total_merged = 0
    for woj in woj_list:
        r = merge_wojewodztwo(woj, ts)
        if "error" in r:
            print(f"  {woj:25s}: ERROR {r['error']}")
        else:
            total_merged += r["merged"]
            print(f"  {woj:25s}: {r['merged']:>3d}/{r['total_powiaty']} powiatow zmienionych")
            for c in r["changes"][:3]:
                print(f"    - {c}")
            if len(r["changes"]) > 3:
                print(f"    ... +{len(r['changes'])-3} wiecej")

    print(f"\nTOTAL merged: {total_merged} powiatow")


if __name__ == "__main__":
    main()
