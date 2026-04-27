#!/usr/bin/env python3
"""Walidator JSON dla dashboard IRIN v5.

Sprawdza:
- syntaktyke wszystkich data/**/*.json
- zgodnosc ze schematami w tools/schemas/

Uruchomienie:
    python3 tools/validate_jsons.py

Pre-commit: zwraca exit 1 przy bledzie.
"""
import json
import sys
from pathlib import Path

try:
    from jsonschema import Draft7Validator
except ImportError:
    print("ERROR: brak modulu jsonschema. Zainstaluj: pip3 install --user jsonschema")
    sys.exit(2)

REPO_ROOT = Path(__file__).resolve().parent.parent
SCHEMAS_DIR = REPO_ROOT / "tools" / "schemas"
DATA_DIR = REPO_ROOT / "data"

SCHEMA_MAP = [
    (DATA_DIR / "powiaty", "*.json", "powiat.schema.json"),
    (DATA_DIR / "wup", "*.json", "wup.schema.json"),
    (DATA_DIR, "szkolenia_irin.json", "szkolenie_irin.schema.json"),
    (DATA_DIR, "szkolenia_propozycje.json", "propozycja.schema.json"),
    (DATA_DIR, "benchmarki_rynkowe.json", "benchmark.schema.json"),
    (DATA_DIR, "meta.json", "meta.schema.json"),
]


def load_schema(name):
    path = SCHEMAS_DIR / name
    return json.loads(path.read_text(encoding="utf-8"))


def validate_one(file_path, schema):
    try:
        data = json.loads(file_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        return [f"{file_path.relative_to(REPO_ROOT)}: JSON parse error: {e}"]
    validator = Draft7Validator(schema)
    errors = sorted(validator.iter_errors(data), key=lambda e: list(e.absolute_path))
    return [
        f"{file_path.relative_to(REPO_ROOT)}: {'.'.join(str(p) for p in e.absolute_path) or '<root>'}: {e.message}"
        for e in errors
    ]


def main():
    all_errors = []
    files_checked = 0

    for base_dir, pattern, schema_name in SCHEMA_MAP:
        if not base_dir.exists():
            print(f"WARN: brak katalogu {base_dir.relative_to(REPO_ROOT)}")
            continue
        try:
            schema = load_schema(schema_name)
        except FileNotFoundError:
            print(f"WARN: brak schematu {schema_name}, pomijam {base_dir.relative_to(REPO_ROOT)}")
            continue

        if "*" in pattern:
            files = sorted(base_dir.glob(pattern))
        else:
            single = base_dir / pattern
            files = [single] if single.exists() else []

        for f in files:
            files_checked += 1
            all_errors.extend(validate_one(f, schema))

    if all_errors:
        print(f"FAIL: {len(all_errors)} bledow w {files_checked} plikach\n")
        for err in all_errors:
            print(f"  ERROR: {err}")
        return 1

    print(f"OK: {files_checked} plikow JSON poprawnych zgodnie ze schematami v5.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
