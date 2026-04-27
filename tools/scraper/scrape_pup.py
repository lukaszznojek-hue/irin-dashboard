#!/usr/bin/env python3
"""Scraper PUP-ów dla TIER 1A IRIN dashboard.

Strategia 2-etapowa:
1. requests + BeautifulSoup dla zielonalinia.gov.pl - agregator ogloszen KFS 2026
   (statyczny HTML, szybkie, lekkie)
2. Playwright dla glownych stron PUP - telefony/emaile (czesto JS-rendered)

Output: data/scrape/scrape_<wojewodztwo>_<timestamp>.json
        + log z bledami w data/scrape/scrape_log.md

Run:
    cd tools/scraper && source venv/bin/activate
    python scrape_pup.py --wojewodztwo zachodniopomorskie
    python scrape_pup.py --wojewodztwo all  # wszystkie TIER 1A
"""
import argparse
import asyncio
import json
import re
import sys
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin, quote_plus

import requests
from bs4 import BeautifulSoup

DASH = Path(__file__).parent.parent.parent
SCRAPE_DIR = DASH / "data" / "scrape"
SCRAPE_DIR.mkdir(exist_ok=True)

TIER_1A = ["swietokrzyskie", "pomorskie", "zachodniopomorskie", "kujawsko-pomorskie"]
ALL_WOJ = [
    "dolnoslaskie", "kujawsko-pomorskie", "lodzkie", "lubelskie", "lubuskie",
    "malopolskie", "mazowieckie", "opolskie", "podkarpackie", "podlaskie",
    "pomorskie", "slaskie", "swietokrzyskie", "warminsko-mazurskie",
    "wielkopolskie", "zachodniopomorskie",
]

ZIELONA_BASE = "https://zielonalinia.gov.pl"
ZIELONA_SEARCH = "https://zielonalinia.gov.pl/?s={q}"

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
HEADERS = {"User-Agent": USER_AGENT, "Accept-Language": "pl-PL,pl;q=0.9,en;q=0.8"}

PHONE_RE = re.compile(r"(?:\+?48[\s-]?)?(?:\(?\d{2,3}\)?[\s-]?)?\d{3}[\s-]?\d{2,3}[\s-]?\d{2,3}")
EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
KWOTA_RE = re.compile(r"(\d{1,3}(?:[\s ]\d{3})+)(?:[\s ,.\d]{0,8}?)(?:zł|PLN|z[lł])", re.IGNORECASE)
KFS_DATE_RE = re.compile(r"(\d{1,2})[.\-/](\d{1,2})[.\-/](20\d{2})")


@dataclass
class PupResult:
    powiat: str
    voivodeship: str
    url_pup: str
    telefony: list = field(default_factory=list)
    emaile: list = field(default_factory=list)
    kfs_kwota: Optional[int] = None
    kfs_start_date: Optional[str] = None
    kfs_end_date: Optional[str] = None
    kfs_status: Optional[str] = None
    kfs_url_zrodlo: Optional[str] = None
    raw_excerpt: str = ""
    errors: list = field(default_factory=list)
    method: str = ""  # "zielonalinia" / "pup_main" / "playwright"


def fetch(url: str, timeout: int = 15) -> Optional[str]:
    """Pobiera HTML z prostego GET. None jesli blad."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
        if r.status_code == 200:
            return r.text
        return None
    except Exception as e:
        return None


def extract_phones(text: str) -> list:
    """Wyciaga numery telefonow z tekstu - normalizuje do pojedynczej formy."""
    raw = PHONE_RE.findall(text)
    cleaned = []
    seen = set()
    for p in raw:
        norm = re.sub(r"[\s\(\)\-]", "", p)
        # filtr: dlugosc 9 (PL bez prefixu) lub 11 (z +48)
        digits = re.sub(r"\D", "", norm)
        if len(digits) in (9, 11) and digits not in seen:
            seen.add(digits)
            # format: XX XXX XX XX (PL standard)
            if len(digits) == 11 and digits.startswith("48"):
                digits = digits[2:]
            if len(digits) == 9:
                formatted = f"{digits[:2]} {digits[2:5]} {digits[5:7]} {digits[7:9]}"
                cleaned.append(formatted)
    return cleaned[:5]  # max 5


def extract_emails(text: str) -> list:
    """Wyciaga emaile - filtruje typowe placeholders."""
    raw = EMAIL_RE.findall(text)
    cleaned = []
    seen = set()
    for e in raw:
        e_lower = e.lower()
        if e_lower in seen or "example" in e_lower or "domain.com" in e_lower:
            continue
        # faworyzuj praca.gov.pl
        seen.add(e_lower)
        cleaned.append(e)
    # praca.gov.pl na pierwszym miejscu
    cleaned.sort(key=lambda x: 0 if "praca.gov.pl" in x else 1)
    return cleaned[:3]


def extract_kfs_kwota(text: str) -> Optional[int]:
    """Wyciaga kwote KFS - 2 podejscia: (1) liczba przed zl/PLN (2) liczba w pobliżu slow kluczowych."""
    matches = []
    for m in KWOTA_RE.finditer(text):
        kwota_str = m.group(1)
        kwota_int = int(re.sub(r"[\s ]", "", kwota_str.split(",")[0]))
        if 50_000 <= kwota_int <= 50_000_000:
            matches.append(kwota_int)
    if not matches:
        keyword_re = re.compile(
            r"(?:kwota|środk[oóa]\w*|naboru|dyspozycji|alokacj\w*|wynosi)[^.]{0,80}?(\d{1,3}(?:[\s ]\d{3})+(?:,\d{2})?)",
            re.IGNORECASE
        )
        for m in keyword_re.finditer(text):
            kwota_str = m.group(1)
            kwota_int = int(re.sub(r"[\s ]", "", kwota_str.split(",")[0]))
            if 50_000 <= kwota_int <= 50_000_000:
                matches.append(kwota_int)
    return max(matches) if matches else None


def detect_kfs_status(text: str, today: datetime) -> tuple[Optional[str], Optional[str], Optional[str]]:
    """Wyciaga daty naboru KFS i okresla status (NADCHODZI/TRWA/ZAKONCZONY)."""
    text_lower = text.lower()
    # szukaj "od dnia X do Y" / "X-Y" / "termin: X do Y"
    date_pattern = r"(\d{1,2})[.\-/](\d{1,2})[.\-/](20\d{2})"
    dates = re.findall(date_pattern, text)
    if len(dates) < 2:
        return None, None, None
    parsed = []
    for d, m, y in dates:
        try:
            dt = datetime(int(y), int(m), int(d))
            if dt.year == 2026:
                parsed.append(dt)
        except ValueError:
            continue
    if len(parsed) < 2:
        return None, None, None
    parsed.sort()
    start = parsed[0]
    end = parsed[-1]
    if end < start:
        start, end = end, start
    status = "NADCHODZI" if start > today else ("TRWA" if today <= end else "ZAKONCZONY")
    return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d"), status


def search_zielonalinia(powiat_name: str) -> Optional[str]:
    """Wyszukuje ogloszenie KFS 2026 dla powiatu na zielonalinia.gov.pl.
    Priorytetyzuje URL-e z 'nabor'/'wniosk'/'wysokosci-srodkow' w slugu (te zawieraja kwoty)."""
    query = f"PUP {powiat_name} KFS 2026"
    html = fetch(ZIELONA_SEARCH.format(q=quote_plus(query)))
    if not html:
        return None
    soup = BeautifulSoup(html, "lxml")
    candidates = []
    powiat_slug = powiat_name.lower().replace(" ", "-").replace("ł", "l").replace("ó", "o").replace("ś", "s").replace("ż", "z").replace("ź", "z").replace("ć", "c").replace("ą", "a").replace("ę", "e").replace("ń", "n")
    for a in soup.find_all("a", href=True):
        href = a["href"]
        text = a.get_text(strip=True).lower()
        if not href.startswith("http") or "zielonalinia.gov.pl" not in href:
            continue
        href_lower = href.lower()
        if "pup-" not in href_lower:
            continue
        # Sprawdz czy URL zawiera nazwe powiatu (slugified)
        if powiat_slug not in href_lower and powiat_name.lower() not in text:
            continue
        # Score: wyzszy = lepszy
        score = 0
        if "kfs" in href_lower or "kfs" in text: score += 5
        if "2026" in href_lower or "2026" in text: score += 3
        # Priorytet dla wlasciwych typow ogloszen
        for keyword in ["nabor-wniosk", "wysokosci-srodkow", "informacja-o-wysokosci", "rozpoczecie-naboru", "dofinansowanie"]:
            if keyword in href_lower:
                score += 10
        # Penalty dla nie-KFS ogloszen
        for bad in ["spotkanie", "po-wer", "bony", "stypendium"]:
            if bad in href_lower:
                score -= 5
        candidates.append((score, href))
    if not candidates:
        return None
    candidates.sort(reverse=True)
    return candidates[0][1] if candidates[0][0] > 0 else None


def scrape_zielonalinia_article(url: str) -> dict:
    """Scrapuje konkretne ogloszenie ze zielonalinia."""
    html = fetch(url)
    if not html:
        return {"error": "fetch failed", "url": url}
    soup = BeautifulSoup(html, "lxml")
    # tytul
    h1 = soup.find("h1") or soup.find("h2")
    tytul = h1.get_text(strip=True) if h1 else ""
    # treść artykułu - zielonalinia uzywa div.post-content
    article = (
        soup.select_one("div.post-content")
        or soup.select_one("article.post")
        or soup.find("article")
        or soup.select_one("main")
    )
    text = article.get_text(" ", strip=True) if article else soup.get_text(" ", strip=True)
    text = text[:5000]  # truncate
    today = datetime(2026, 4, 27)
    kwota = extract_kfs_kwota(text)
    start, end, status = detect_kfs_status(text, today)
    phones = extract_phones(text)
    emails = extract_emails(text)
    return {
        "url": url,
        "tytul": tytul,
        "raw_excerpt": text[:500],
        "kfs_kwota": kwota,
        "kfs_start_date": start,
        "kfs_end_date": end,
        "kfs_status": status,
        "telefony": phones,
        "emaile": emails,
    }


def scrape_pup_main(url_pup: str) -> dict:
    """Scrapuje glowna strone PUP - szuka telefonu/emaila ze stopki."""
    html = fetch(url_pup)
    if not html:
        return {"error": "fetch failed", "url": url_pup}
    soup = BeautifulSoup(html, "lxml")
    text = soup.get_text(" ", strip=True)
    return {
        "url": url_pup,
        "telefony": extract_phones(text),
        "emaile": extract_emails(text),
        "raw_excerpt": text[:300],
    }


def scrape_powiat(powiat: dict, voivodeship: str) -> PupResult:
    """Pelen scrape pojedynczego powiatu (zielonalinia + main page)."""
    name = powiat.get("name", "")
    url_pup = powiat.get("url_pup", "")
    result = PupResult(
        powiat=name,
        voivodeship=voivodeship,
        url_pup=url_pup,
    )
    # 1. Szukaj na zielonalinia
    zielona_url = search_zielonalinia(name)
    if zielona_url:
        result.kfs_url_zrodlo = zielona_url
        article = scrape_zielonalinia_article(zielona_url)
        if "error" not in article:
            result.kfs_kwota = article["kfs_kwota"]
            result.kfs_start_date = article["kfs_start_date"]
            result.kfs_end_date = article["kfs_end_date"]
            result.kfs_status = article["kfs_status"]
            result.telefony = article["telefony"]
            result.emaile = article["emaile"]
            result.raw_excerpt = article["raw_excerpt"]
            result.method = "zielonalinia"
        else:
            result.errors.append(f"zielona article fetch failed: {article['error']}")
    # 2. Jesli brak telefonu/emaila - probuj glowna strona PUP
    if not result.telefony or not result.emaile:
        if url_pup:
            main = scrape_pup_main(url_pup)
            if "error" not in main:
                if not result.telefony:
                    result.telefony = main.get("telefony", [])
                if not result.emaile:
                    result.emaile = main.get("emaile", [])
                if result.method:
                    result.method += "+pup_main"
                else:
                    result.method = "pup_main"
            else:
                result.errors.append(f"pup main fetch failed: {main['error']}")
    if not result.method:
        result.method = "no_data"
    return result


def scrape_wojewodztwo(woj: str) -> dict:
    """Scrapuje wszystkie powiaty wojewodztwa TIER 1A."""
    fp = DASH / "data" / "powiaty" / f"{woj}.json"
    if not fp.exists():
        return {"error": f"file not found: {fp}", "wojewodztwo": woj}
    data = json.loads(fp.read_text())
    powiaty = data.get("powiaty", [])
    print(f"\n=== {woj} ({len(powiaty)} powiatow) ===", flush=True)
    results = []
    for i, p in enumerate(powiaty, 1):
        name = p.get("name", "?")
        print(f"  [{i}/{len(powiaty)}] {name}...", end=" ", flush=True)
        try:
            r = scrape_powiat(p, woj)
            results.append(asdict(r))
            tags = []
            if r.kfs_kwota: tags.append(f"{r.kfs_kwota}zl")
            if r.telefony: tags.append(f"{len(r.telefony)}tel")
            if r.emaile: tags.append(f"{len(r.emaile)}mail")
            if r.kfs_status: tags.append(r.kfs_status)
            print(f"OK [{r.method}] {' '.join(tags) if tags else '(brak)'}", flush=True)
        except Exception as e:
            print(f"ERR {e}", flush=True)
            results.append({
                "powiat": name,
                "voivodeship": woj,
                "url_pup": p.get("url_pup"),
                "errors": [str(e)],
                "method": "exception",
            })
        time.sleep(0.4)  # throttle - bądź uprzejmy dla zielonalinia
    return {
        "wojewodztwo": woj,
        "scraped_at": datetime.now().isoformat(),
        "powiaty_count": len(powiaty),
        "results": results,
    }


def stats_summary(scrape_data: dict) -> str:
    """Krotkie podsumowanie wynikow scrape."""
    results = scrape_data.get("results", [])
    n = len(results)
    with_kwota = sum(1 for r in results if r.get("kfs_kwota"))
    with_tel = sum(1 for r in results if r.get("telefony"))
    with_mail = sum(1 for r in results if r.get("emaile"))
    with_status = sum(1 for r in results if r.get("kfs_status"))
    sum_kwot = sum(r.get("kfs_kwota") or 0 for r in results)
    return (
        f"\n=== {scrape_data['wojewodztwo']} - PODSUMOWANIE ===\n"
        f"  Powiatow:      {n}\n"
        f"  Z kwota KFS:   {with_kwota} ({with_kwota*100//n if n else 0}%)\n"
        f"  Z telefonem:   {with_tel} ({with_tel*100//n if n else 0}%)\n"
        f"  Z emailem:     {with_mail} ({with_mail*100//n if n else 0}%)\n"
        f"  Z status KFS:  {with_status} ({with_status*100//n if n else 0}%)\n"
        f"  Suma kwot:     {sum_kwot:,} zl\n"
    )


def main():
    parser = argparse.ArgumentParser(description="Scraper PUP-ow TIER 1A")
    parser.add_argument("--wojewodztwo", default="zachodniopomorskie",
                        help="nazwa wojewodztwa | 'tier1a' (4 woj.) | 'all' (16 woj.)")
    args = parser.parse_args()
    if args.wojewodztwo == "tier1a":
        targets = TIER_1A
    elif args.wojewodztwo == "all":
        targets = ALL_WOJ
    else:
        targets = [args.wojewodztwo]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    for woj in targets:
        if woj not in ALL_WOJ:
            print(f"WARN: {woj} nie jest na liscie wojewodztw, pomijam", file=sys.stderr)
            continue
        scrape_data = scrape_wojewodztwo(woj)
        out_fp = SCRAPE_DIR / f"scrape_{woj}_{timestamp}.json"
        out_fp.write_text(json.dumps(scrape_data, indent=2, ensure_ascii=False))
        print(stats_summary(scrape_data))
        print(f"  -> zapisano: {out_fp.relative_to(DASH)}")


if __name__ == "__main__":
    main()
