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
        "Mapa pieniedzy default tab": 'data-panel="mapa-pieniedzy"' in html and 'class="nav-tab active' in html,
        "Kalkulator": "kalkulator-dofinansowania" in html or "kalk-rozmiar" in html,
        "Info-bar": "info-bar" in html,
        "7+ zakładek": html.count("data-panel=") >= 7,
        "Per szkolenie sekcja": "sales-per-szkolenie" in html,
        "kalkulator.js": "kalkulator.js" in html,
        "tailwinds.js": "tailwinds.js" in html,
        "Banner -> strategia#tailwinds": "strategia.html#tailwinds" in html,
        "Trendy/Tailwinds usuniete z indexu": 'data-panel="trendy"' not in html and 'data-panel="tailwinds"' not in html,
    }

    strat_html = urlopen("http://localhost:8098/strategia.html").read().decode()
    checks["crypto-js.min.js (strategia)"] = "crypto-js.min.js" in strat_html
    checks["strategia fetch encrypted"] = "strategia_encrypted.json" in strat_html
    checks["strategia no inline content"] = "Wiktori@2026" not in strat_html
    checks["strategia sub-nav 3 sekcje"] = (
        'data-section="strategia"' in strat_html and
        'data-section="tailwinds"' in strat_html and
        'data-section="trendy"' in strat_html
    )
    checks["strategia includes tailwinds.js + trendy.js"] = (
        "tailwinds.js" in strat_html and "trendy.js" in strat_html
    )

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
