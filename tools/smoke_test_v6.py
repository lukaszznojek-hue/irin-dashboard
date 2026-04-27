#!/usr/bin/env python3
"""Smoke test v6.1 - headless HTTP check."""
import subprocess, time, sys
from urllib.request import urlopen

proc = subprocess.Popen(
    ["python3", "-m", "http.server", "8098"],
    cwd=".",
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
)
time.sleep(2)

try:
    html = urlopen("http://localhost:8098/index.html").read().decode()
    checks = {
        "Tailwinds 2026 tab": 'data-panel="tailwinds"' in html,
        "Kalkulator": "kalkulator-dofinansowania" in html or "kalk-rozmiar" in html,
        "Banner": "tailwinds-banner" in html,
        "8+ zakładek": html.count("data-panel=") >= 8,
        "Per szkolenie sekcja": "sales-per-szkolenie" in html,
        "kalkulator.js": "kalkulator.js" in html,
        "tailwinds.js": "tailwinds.js" in html,
    }

    strat_html = urlopen("http://localhost:8098/strategia.html").read().decode()
    checks["crypto-js.min.js (strategia)"] = "crypto-js.min.js" in strat_html
    checks["strategia fetch encrypted"] = "strategia_encrypted.json" in strat_html
    checks["strategia no inline content"] = "Wiktori@2026" not in strat_html

    encrypted = urlopen(
        "http://localhost:8098/data/strategia_encrypted.json"
    ).read().decode()
    checks["encrypted JSON accessible"] = "AES-256-CBC" in encrypted

    all_pass = True
    for name, ok in checks.items():
        symbol = "✓" if ok else "✗"
        print(f"{symbol} {name}")
        if not ok:
            all_pass = False

    print(f"\n{'ALL PASS' if all_pass else 'SOME CHECKS FAILED'}")
    sys.exit(0 if all_pass else 1)
finally:
    proc.terminate()
