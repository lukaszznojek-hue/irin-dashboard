#!/usr/bin/env python3
"""Migracja v4 -> v5: dodaje akcja_status do kazdej karty powiatu.

Mapowanie urgency -> akcja_status:
- krytyczny / pilny / trwa  -> aktywny
- nadchodzi                  -> monitor
- zakonczony + KFS_STATUS=ZAKONCZONY -> zakonczony
- nieznany / has_warning / brak danych -> zadzwon

Stare pola (urgency, kfs_status, has_warning) NIE sa usuwane - backward compatibility.
"""
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
POWIATY_DIR = REPO_ROOT / "data" / "powiaty"


def map_urgency_to_akcja(card):
    u = card.get("urgency", "nieznany")
    s = card.get("kfs_status", "BRAK_DANYCH")
    w = card.get("has_warning", False)

    if u in ("krytyczny", "pilny", "trwa"):
        return "aktywny"
    if u == "nadchodzi":
        return "monitor"
    if u == "zakonczony" and s == "ZAKONCZONY":
        return "zakonczony"
    if u == "nieznany" or s in (None, "BRAK_DANYCH") or w:
        return "zadzwon"
    return "zadzwon"


def uzasadnienie(card, akcja):
    u = card.get("urgency")
    end = card.get("kfs_end_date")
    if akcja == "aktywny":
        if end:
            return f"Nabor trwa do {end}"
        return "Nabor aktywny"
    if akcja == "monitor":
        start = card.get("kfs_start_date")
        return f"Nabor planowany od {start}" if start else "Nabor zapowiedziany"
    if akcja == "zakonczony":
        return f"Nabor zakonczony {end}" if end else "Nabor zakonczony"
    if u == "nieznany":
        return "Brak danych - zadzwon do PUP"
    if card.get("has_warning"):
        return "Dane niezweryfikowane - zadzwon do PUP"
    return "Sprawdz status w PUP"


def migrate_card(card):
    if "akcja_status" not in card:
        akcja = map_urgency_to_akcja(card)
        card["akcja_status"] = akcja
        if "akcja_status_uzasadnienie" not in card:
            card["akcja_status_uzasadnienie"] = uzasadnienie(card, akcja)
    return card


def migrate_file(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    pows = data.get("powiaty", [])
    for p in pows:
        migrate_card(p)
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return len(pows)


def main():
    total_cards = 0
    files = sorted(POWIATY_DIR.glob("*.json"))
    for f in files:
        n = migrate_file(f)
        print(f"  {f.name}: {n} kart zmigrowanych")
        total_cards += n
    print(f"\nLacznie: {len(files)} plikow, {total_cards} kart -> akcja_status dodany")


if __name__ == "__main__":
    main()
