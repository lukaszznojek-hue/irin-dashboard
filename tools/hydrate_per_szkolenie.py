#!/usr/bin/env python3
"""Generator hydratacji per_szkolenie/ z danych szkolenia_irin.json.
Prototyp 01 jest zhydrowany (brak placeholderów) - template'y inline."""
import json
from pathlib import Path
from datetime import datetime

DASH = Path(__file__).parent.parent
SZKOL = json.load(open(DASH / "data/szkolenia_irin.json"))["uslugi"]

FOLDERS = {
    "3432404": "01_social_media_ai",
    "3432500": "02_sklep_cyfryzacja",
    "3421591": "03_skutecznosc_ai",
    "3386476": "04_zarzadzanie_ai",
    "3420786": "05_si_gdansk_maj",
    "3405199": "06_si_gdansk_sierpien",
    "3270238": "07_si_kielce",
    "3379725": "08_tus_kielce",
    "3381926": "09_projekty_dofinansowane",
    "3486195": "10_si_kielce_wrzesien",
    # PROP - NIE hydratowane przez ten skrypt, pliki tworzone recznie
    # (PROP nie sa w SZKOL = data/szkolenia_irin.json - skrypt iteruje tylko SZKOL)
    "PROP-01": "PROP-01_ai_act",
    "PROP-02": "PROP-02_nis2",
}

KLASTRY = {
    "ai": ["02_sklep_cyfryzacja", "03_skutecznosc_ai", "04_zarzadzanie_ai"],
    "si_tus": [
        "05_si_gdansk_maj",
        "06_si_gdansk_sierpien",
        "07_si_kielce",
        "08_tus_kielce",
        "10_si_kielce_wrzesien",
    ],
    "dofinans": ["09_projekty_dofinansowane"],
    "ai_regulacje": ["PROP-01_ai_act", "PROP-02_nis2"],
}

PERSONY = {
    "ai": "HR Manager / Prezes mikrofirmy / Dyrektor rozwoju",
    "si_tus": "Dyrektor placówki edukacyjnej / Pedagog / Psycholog szkolny / Fizjoterapeuta / Logopeda",
    "dofinans": "Specjalista dofinansowań / Właściciel firmy szukający funduszy / Dyrektor MŚP planujący ekspansję",
}

DLA_KOGO = {
    "ai": [
        "Pracownicy MŚP i mikrofirm chcący wykorzystać AI/cyfryzację w codziennej pracy",
        "Właściciele firm szukający przewag konkurencyjnych przez cyfryzację",
        "Menedżerowie odpowiedzialni za rozwój kompetencji zespołów",
        "**NIE dla:** zaawansowanych specjalistów IT/data science (za podstawowe)",
    ],
    "si_tus": [
        "Pedagodzy, psycholodzy szkolni i kliniczni",
        "Fizjoterapeuci i terapeuci zajęciowi",
        "Logopedzi, oligofrenopedagodzy",
        "Nauczyciele wychowania przedszkolnego i wczesnoszkolnego",
        "**NIE dla:** osób bez wykształcenia pedagogicznego/medycznego (wymóg formalny)",
    ],
    "dofinans": [
        "Właściciele MŚP planujący pozyskanie dotacji",
        "Specjaliści ds. rozwoju i projektów w firmach",
        "Osoby chcące rozpocząć karierę w pisaniu wniosków",
        "NGO-sy i JST szukające finansowania projektów",
        "**NIE dla:** osób szukających szkolenia czysto technicznego (to jest strategiczne)",
    ],
}

OBIEKCJE = {
    "ai": [
        (
            '"Mamy dział IT"',
            '"To szkolenie nie jest dla IT - jest dla pracowników BIZNESOWYCH, żeby wykorzystywali AI i cyfryzację w swojej pracy. Dział IT to narzędzia, my uczymy zastosowań."',
        ),
        (
            '"Drogie"',
            '"Z KFS mikrofirma płaci od 0 do 10% ceny. Przy {cena} zł to {wklad_mikro} zł za {godz}h z ekspertem. Pokażę kalkulację."',
        ),
        (
            '"Nie mamy czasu"',
            '"Szkolenie jest {forma_opis}. {godz}h w {dni_trwania} - to mniej niż tygodniowy urlop, a ROI zostaje na lata."',
        ),
    ],
    "si_tus": [
        (
            '"Mamy już kurs SI/TUS"',
            '"Nasz program to {godz}h, kurs I+II stopień z certyfikatem. Sprawdź czy Państwa kurs miał pełne 120h i akredytację BUR."',
        ),
        (
            '"Za długo trwa"',
            '"{godz}h to wymóg programowy dla pełnych kwalifikacji. Forma mieszana (część online) minimalizuje dojazdy. A {cena_h} zł/h to {porownanie_ceny} rynku."',
        ),
        (
            '"Drogie"',
            '"{cena_h} zł za godzinę specjalistycznego kursu diagnostyczno-terapeutycznego. Rynek to 120+ zł/h. Z KFS mikrofirma płaci ~10%. Kalkulacja?"',
        ),
    ],
    "dofinans": [
        (
            '"Sam napiszę wniosek"',
            '"Oczywiście. Ale statystycznie 70% wniosków KFS/PARP jest odrzucanych. Po naszym szkoleniu masz metodykę + wzory + feedback trenera na TWÓJ wniosek."',
        ),
        (
            '"Drogie"',
            '"27h praktycznego warsztatu za {cena} zł. Jeden dobrze napisany wniosek pokrywa koszt szkolenia wielokrotnie. ROI od pierwszego projektu."',
        ),
        (
            '"Nie mam projektu"',
            '"Moduł 1 zaczyna od identyfikacji szans. Wychodzisz ze szkolenia z konkretnym pomysłem dopasowanym do Twojej firmy i gotowym draft wniosku."',
        ),
    ],
}


def klaster_for(folder):
    for k, fs in KLASTRY.items():
        if folder in fs:
            return k
    return "ai"


def fmt_cena(n):
    return f"{n:,.0f}".replace(",", " ")


def fmt_data(iso):
    if not iso or iso == "TBD":
        return "TBD"
    d = datetime.fromisoformat(iso)
    miesiace = [
        "",
        "stycznia",
        "lutego",
        "marca",
        "kwietnia",
        "maja",
        "czerwca",
        "lipca",
        "sierpnia",
        "września",
        "października",
        "listopada",
        "grudnia",
    ]
    return f"{d.day} {miesiace[d.month]} {d.year}"


def dni_trwania(s):
    if not s.get("data_start") or not s.get("data_end"):
        return "kilka dni"
    d1 = datetime.fromisoformat(s["data_start"])
    d2 = datetime.fromisoformat(s["data_end"])
    delta = (d2 - d1).days + 1
    if delta <= 5:
        return f"{delta} dni"
    weeks = delta // 7
    return f"~{weeks} tygodni"


def gen_one_pager(s, folder, klaster):
    url = f"https://uslugirozwojowe.parp.gov.pl/wyszukiwarka/uslugi/podglad?id={s['id_bur']}"
    miasto = s.get("miasto") or "online"
    forma_full = s["forma"]
    if miasto != "online" and forma_full == "mieszana":
        forma_full = f"mieszana (stacjonarnie {miasto} + online)"
    elif forma_full == "zdalna":
        forma_full = "zdalna (ZOOM)"

    cena = s["cena_brutto"]
    wklad_mikro = round(cena * 0.10)
    wklad_mala = round(cena * 0.30)
    wklad_bur = round(cena * 0.20)

    args = s.get("argumenty_sprzedazowe", [])
    args_formatted = ""
    for i, a in enumerate(args[:3], 1):
        args_formatted += f"\n{i}. **{a}**\n"

    priorytety = ", ".join(s.get("powiazane_priorytety", []))
    tier = s.get("tier_priorytetu_irin", "—")
    cena_h = s.get("cena_h", "—")

    dla_kogo = "\n".join(f"- {dk}" for dk in DLA_KOGO[klaster])

    return f"""# 📋 One-pager handlowca: {s['tytul']}

> Wszystko co handlowiec musi wiedzieć w 1 ekranie. Otwierasz to przed każdą rozmową.

---

## SZYBKIE FAKTY

| Co | Wartość |
|---|---|
| **ID BUR** | {s['id_bur']} |
| **Termin** | {fmt_data(s.get('data_start'))} - {fmt_data(s.get('data_end'))} ({dni_trwania(s)}) |
| **Cena** | **{fmt_cena(cena)} zł** brutto/os. (zwolniona z VAT) |
| **Cena/h** | {cena_h} zł/h |
| **Czas trwania** | {s['godziny']} godzin dydaktycznych |
| **Forma** | {forma_full} |
| **Tier IRIN** | **{tier}** {"⭐" if tier == 1 else ""} |
| **Priorytet PARP** | **{priorytety}** |

## DOFINANSOWANIE - kalkulator dla klienta

| Źródło | % dofin. | Wkład klienta |
|---|---|---|
| **KFS mikrofirma** (1-9 osób) | 90% | **{fmt_cena(wklad_mikro)} zł** |
| **KFS firma** (10+ osób) | 70% | **{fmt_cena(wklad_mala)} zł** |
| **BUR (operator regionalny)** | do 80% | **{fmt_cena(wklad_bur)} zł** |

## 3 ARGUMENTY OTWIERAJĄCE (cold pitch)
{args_formatted}
## TOP 3 OBIEKCJE I ODPOWIEDZI

| Obiekcja klienta | Krótka odpowiedź |
|---|---|
| {_fmt_obiekcja(s, klaster, 0)} |
| {_fmt_obiekcja(s, klaster, 1)} |
| {_fmt_obiekcja(s, klaster, 2)} |

## DLA KOGO

{dla_kogo}

## KLIKNIJ

- 🗣️ [Skrypt rozmowy →](skrypt_rozmowy.md)
- 📧 [Mail cold (gotowy) →](email_cold.md)
- 🌐 [Profil na BUR PARP]({url})

---
**Ostatnia aktualizacja:** 2026-04-27
"""


def _fmt_obiekcja(s, klaster, idx):
    if idx >= len(OBIEKCJE[klaster]):
        return '— | — '
    ob, odp = OBIEKCJE[klaster][idx]
    cena = s["cena_brutto"]
    odp = odp.replace("{cena}", fmt_cena(cena))
    odp = odp.replace("{wklad_mikro}", fmt_cena(round(cena * 0.10)))
    odp = odp.replace("{godz}", str(s["godziny"]))
    odp = odp.replace("{cena_h}", str(s.get("cena_h", "—")))
    forma = "zdalne" if s["forma"] == "zdalna" else f"w formie mieszanej ({s.get('miasto', 'stacjonarnie')} + online)"
    odp = odp.replace("{forma_opis}", forma)
    odp = odp.replace("{dni_trwania}", dni_trwania(s))
    rynek_avg = s.get("cena_h_rynek_avg")
    if rynek_avg and s.get("cena_h"):
        diff = round((1 - s["cena_h"] / rynek_avg) * 100)
        odp = odp.replace("{porownanie_ceny}", f"{diff}% poniżej")
    else:
        odp = odp.replace("{porownanie_ceny}", "poniżej")
    return f"{ob} | {odp}"


def gen_skrypt(s, folder, klaster):
    url = f"https://uslugirozwojowe.parp.gov.pl/wyszukiwarka/uslugi/podglad?id={s['id_bur']}"
    cena = s["cena_brutto"]
    miasto = s.get("miasto") or "online"
    forma = s["forma"]
    wklad_mikro = fmt_cena(round(cena * 0.10))
    wklad_mala = fmt_cena(round(cena * 0.30))

    if klaster == "ai":
        diagnoza_pytania = """1. Czy Państwa zespół używa już narzędzi AI (ChatGPT, Copilot, Canva AI) w codziennej pracy?
2. Jak wygląda cyfryzacja procesów w firmie - co jest zdigitalizowane, co jeszcze na papierze?
3. Ile osób w zespole potrzebowałoby takiego szkolenia?
4. Czy korzystaliście Państwo z dofinansowania KFS lub BUR?
5. Jakie są Państwa największe wyzwania związane z cyfryzacją?"""
        sygnaly = """- "Używamy ChatGPT ale powierzchownie" → szkolenie pokazuje systematyczne zastosowania
- "Nie mamy czasu na cyfryzację" → szkolenie w {godz}h daje gotowe narzędzia
- "Nie korzystaliśmy z KFS" → edukacja: 90% dofinansowania + pomagamy z wnioskiem""".replace(
            "{godz}", str(s["godziny"])
        )
        prezentacja = f"""**1. Program.**
> {s['godziny']} godzin praktycznego warsztatu. Nie teoria - konkretne narzędzia które Państwa zespół zacznie używać od razu po szkoleniu.

**2. AI Act compliance.**
> Od sierpnia 2026 każda firma używająca AI ma obowiązek udokumentować szkolenie pracowników. Nasze szkolenie pokrywa ten wymóg + daje praktyczne umiejętności.

**3. Dofinansowanie.**
> Mikrofirma: {wklad_mikro} zł wkładu własnego zamiast {fmt_cena(cena)} zł. Firma 10+: {wklad_mala} zł. IRIN jest w BUR (ID 160205, ocena 4.9/5)."""
    elif klaster == "si_tus":
        diagnoza_pytania = """1. Jakie specjalizacje prowadzi Państwa placówka? Ile osób w zespole terapeutycznym?
2. Czy ktoś z zespołu ma już kurs integracji sensorycznej / TUS?
3. Czy planujecie Państwo rozszerzyć ofertę diagnostyczno-terapeutyczną?
4. Czy korzystaliście z dofinansowania KFS lub BUR na szkolenia specjalistyczne?
5. Jak duży jest popyt na terapię SI / TUS w Państwa regionie?"""
        sygnaly = """- "Czekamy na klientów" → kurs SI/TUS = nowa usługa w ofercie = nowi pacjenci
- "Mamy jednego specjalistę" → ryzyko zależności od 1 osoby, warto wyszkolić drugą
- "Nie korzystaliśmy z KFS" → 90% dofinansowania, pomagamy z wnioskiem"""
        forma_info = f"stacjonarnie w {miasto} + część online" if forma == "mieszana" else "zdalnie"
        prezentacja = f"""**1. Program.**
> Kompletny kurs {s['godziny']}h - od podstaw neurofizjologicznych po samodzielną diagnozę i terapię. Certyfikat po ukończeniu.

**2. Forma.**
> {forma_info}. Zajęcia praktyczne wymagają obecności - praca z pacjentem, sprzęt diagnostyczny. Teoria online.

**3. Cena.**
> {s.get('cena_h', '—')} zł/h to jedna z najniższych na rynku dla kursu tej specjalizacji. Z KFS mikrofirma: {wklad_mikro} zł wkładu zamiast {fmt_cena(cena)} zł."""
    else:  # dofinans
        diagnoza_pytania = """1. Czy Państwa firma składała wcześniej wnioski o dofinansowanie (KFS, PARP, NCBiR, EFS)?
2. Jaka jest skala firmy i branża? Ile osób zatrudniacie?
3. Czy macie konkretny projekt / pomysł na który szukacie finansowania?
4. Kto w firmie odpowiada za pozyskiwanie dotacji - jest dedykowana osoba czy prezes sam?
5. Jaki budżet projektu rozważacie?"""
        sygnaly = """- "Składaliśmy ale odrzucili" → szkolenie pokaże gdzie typowe błędy
- "Nie mamy czasu pisać wniosków" → po szkoleniu proces jest 3x szybszy
- "Korzystamy z firmy doradczej" → szkolenie = niezależność + oszczędność 10-20k zł rocznie"""
        prezentacja = f"""**1. Program.**
> {s['godziny']}h od identyfikacji szansy po kompletny wniosek. Praktycznie - wychodzisz z gotowym draftem wniosku na TWÓJ projekt.

**2. Meta-szkolenie.**
> To szkolenie zwraca się wielokrotnie. Jeden dobrze napisany wniosek KFS/PARP/EFS pokrywa koszt i generuje 10-100x ROI.

**3. Dofinansowanie.**
> {fmt_cena(cena)} zł za {s['godziny']}h. Z KFS mikrofirma: {wklad_mikro} zł wkładu. IRIN w BUR (4.9/5, 813 ocen)."""

    termin_info = f"{fmt_data(s.get('data_start'))} - {fmt_data(s.get('data_end'))}"
    forma_krótka = "zdalnie" if forma == "zdalna" else f"w {miasto} + online"

    cross_sell = ""
    if folder == "09_projekty_dofinansowane":
        cross_sell = """
---

## CROSS-SELL

> Po nauce pisania wniosków - klient bierze DALEJ szkolenia z portfolio IRIN z dofinansowaniem. Pokażemy jak złożyć wniosek do KFS na własne zespoły. Najwyższy ROI handlowca (1 klient = pipeline długoterminowy).
"""

    return f"""# Skrypt rozmowy: {s['tytul']}

**Cel:** Zamknąć rezerwację miejsca na szkolenie ({termin_info}).
**Czas:** 15-25 min (rozmowa B2B telefoniczna).

---

## ETAP 1 - Diagnoza potrzeby (5 min)

### Otwarcie

> Dzień dobry, [Pan/Pani Nazwisko], z tej strony [Imię] z IRIN, Instytutu Rozwoju i Nauki. Dziękuję za czas. Chciałbym/chciałabym zrozumieć Państwa sytuację, żeby dobrze dopasować rozwiązanie. Mogę zadać kilka pytań?

### Pytania kwalifikujące (zadaj 3-5):

{diagnoza_pytania}

### Sygnały które wychwycić:

{sygnaly}

---

## ETAP 2 - Pieniądze (3 min) ⭐ NAJWAŻNIEJSZE

> Zanim opowiem o programie - kluczowa informacja: nie zapłacicie Państwo pełnej ceny.

### Dla mikrofirm (1-9 osób):

> Cena katalogowa to {fmt_cena(cena)} zł za uczestnika za {s['godziny']} godzin. Z KFS 2026 mikrofirma może uzyskać dofinansowanie do **90%**. Wkład Państwa to **{wklad_mikro} zł** za osobę.

### Dla firm 10+ osób:

> KFS dla firmy powyżej 10 pracowników to 70% dofinansowania, wkład Państwa to **{wklad_mala} zł**.

### Game changer KFS 2026:

> Od stycznia 2026 szkolenia KFS realizowane TYLKO przez dostawców z BUR PARP. **IRIN jest w BUR - ID 160205, ocena 4.9/5 z 813 opinii.** Wniosek KFS z naszym szkoleniem przechodzi.

---

## ETAP 3 - Prezentacja szkolenia (5-7 min)

### Bridge:

> Na podstawie tego co Państwo powiedzieli, proponuję konkretne szkolenie z naszego portfolio. Pozwoli mi Pan/Pani opowiedzieć w dwóch minutach?

{prezentacja}

---

## ETAP 4 - Social proof (1-2 min)

> Trzy fakty:
> - Ocena 4.9/5 z ponad 800 opinii na BUR PARP
> - 10 aktywnych szkoleń w portfolio IRIN
> - Doświadczenie w {s.get('kategoria', 'szkoleniach')} potwierdzone certyfikacją BUR

---

## ETAP 5 - Zamknięcie (3 min)

### Hook do zapisu:

> Termin to {termin_info}, {forma_krótka}. Mamy ograniczoną liczbę miejsc. Żeby zarezerwować, potrzebuję: liczby uczestników, danych firmy do umowy. Mogę dziś wysłać formularz?

### Jeśli "muszę to przemyśleć":

> Rozumiem. Co konkretnie chcieliby Państwo jeszcze przemyśleć? Może mogę teraz rozwiać wątpliwości.

### Jeśli "muszę skonsultować":

> Jasne. Przygotuję ofertę z kalkulacją + opis w 1 stronie A4 do przekazania osobie decyzyjnej. Do kiedy będzie odpowiedź?

### Jeśli "drogie":

> Zatrzymajmy się. Co Państwo nazywają "drogim" - {fmt_cena(cena)} zł cena katalogowa, czy {wklad_mikro} zł po dofinansowaniu? Bo to dwie różne rozmowy.
{cross_sell}
---

## PO ROZMOWIE - co zrobić

✓ Wpisać do CRM: data, osoba, szkolenie, status (lead/qualified/oferta), powód jeśli odmowa
✓ Wysłać mail z ofertą (email_cold.md lub uniwersalne/email_oferta_szablon.md)
✓ Ustawić follow-up za 3-5 dni jeśli "do przemyślenia"

---

## Linki

- 🌐 [Profil szkolenia w BUR]({url})
- 📧 [Email cold gotowy](email_cold.md)
- 📋 [One pager](one_pager.md)

---
**Ostatnia aktualizacja:** 2026-04-27
"""


def gen_email(s, folder, klaster):
    url = f"https://uslugirozwojowe.parp.gov.pl/wyszukiwarka/uslugi/podglad?id={s['id_bur']}"
    cena = s["cena_brutto"]
    wklad_mikro = fmt_cena(round(cena * 0.10))
    miasto = s.get("miasto") or "online"
    forma = "zdalnie (ZOOM)" if s["forma"] == "zdalna" else f"mieszana ({miasto} + online)"
    termin = f"{fmt_data(s.get('data_start'))} - {fmt_data(s.get('data_end'))}"

    if klaster == "ai":
        subject_lines = f"""1. `[Firma_klienta] - szkolenie AI z dofinansowaniem do 90% (KFS 2026)`
2. `Obowiązek szkolenia AI od sierpnia 2026 - propozycja dla [Firma_klienta]`
3. `{s['tytul'][:50]} - dofinansowanie do 90%`"""
        hook = f"""zwracam się z informacją o możliwości przeszkolenia Państwa zespołu
w zakresie wykorzystania sztucznej inteligencji i narzędzi cyfrowych.

Od 2 sierpnia 2026 roku, na mocy rozporządzenia AI Act (UE 2024/1689),
każda organizacja korzystająca z systemów AI ma obowiązek zapewnić
pracownikom odpowiednie przeszkolenie. Jednocześnie mikrofirmy mogą uzyskać
do 90% dofinansowania kosztów szkolenia z Krajowego Funduszu Szkoleniowego,
pod warunkiem że dostawca figuruje w Bazie Usług Rozwojowych PARP."""
        po_szkoleniu = """Po ukończeniu szkolenia uczestnicy:
- stosują narzędzia AI i cyfryzacji w codziennej pracy zawodowej,
- dysponują praktycznymi umiejętnościami zwiększającymi efektywność zespołu,
- spełniają wymóg udokumentowanego przeszkolenia zgodnie z AI Act."""
    elif klaster == "si_tus":
        typ = "TUS" if "tus" in folder.lower() else "integracji sensorycznej"
        subject_lines = f"""1. `Kurs {typ} z certyfikatem BUR - dofinansowanie do 90% (KFS)`
2. `[Firma_klienta] - rozszerzenie kompetencji zespołu w zakresie {typ}`
3. `{s['godziny']}h kurs {typ}, {miasto} - {s.get('cena_h', '')} zł/h`"""
        hook = f"""zwracam się w sprawie możliwości podniesienia kwalifikacji
Państwa zespołu w zakresie {typ}.

Placówki edukacyjne i terapeutyczne mogą skorzystać z dofinansowania
Krajowego Funduszu Szkoleniowego pokrywającego do 90% kosztów szkolenia.
Warunkiem jest realizacja kursu przez podmiot zarejestrowany
w Bazie Usług Rozwojowych PARP."""
        po_szkoleniu = f"""Po ukończeniu kursu specjalista:
- prowadzi samodzielną diagnozę i terapię,
- posiada certyfikat potwierdzony w systemie BUR,
- poszerza ofertę placówki o nową usługę."""
    else:  # dofinans
        subject_lines = f"""1. `Warsztat przygotowania wniosków o dofinansowanie - propozycja dla [Firma_klienta]`
2. `Od pomysłu do kompletnego wniosku w {s['godziny']}h - szkolenie praktyczne`
3. `Pozyskiwanie dofinansowań (KFS, PARP, EFS+) - szkolenie z certyfikatem BUR`"""
        hook = f"""zwracam się z pytaniem, czy w najbliższych miesiącach planują
Państwo pozyskanie środków na rozwój firmy - z programów takich jak
KFS, PARP, EFS+ czy NCBiR.

Według danych publicznych ok. 70% wniosków o dofinansowanie jest odrzucanych,
najczęściej z powodu błędów formalnych i niedostatecznej argumentacji.
Proponujemy szkolenie, które przygotowuje do samodzielnego pisania wniosków."""
        po_szkoleniu = """Po ukończeniu szkolenia uczestnicy:
- dysponują gotowym projektem wniosku na konkretny cel firmy,
- znają metodykę przygotowania wniosków do KFS, PARP i EFS+,
- mogą samodzielnie aplikować o środki bez angażowania firm doradczych."""

    return f"""# Email cold: {s['tytul']}

**Cel:** Pierwszy kontakt - umówienie rozmowy telefonicznej (15 min).
**Persona:** {PERSONY[klaster]}

---

## Subject line - warianty

{subject_lines}

---

## Treść maila

```
Szanowni Państwo,

{hook}

IRIN sp. z o.o. jest zarejestrowany w BUR PARP (ID 160205, ocena 4.9/5
na podstawie 813 opinii uczestników). Pozwalam sobie przedstawić
szkolenie odpowiadające na powyższe potrzeby:

---
{s['tytul']}

Termin:    {termin}
Wymiar:    {s['godziny']} godzin dydaktycznych
Forma:     {forma}
Cena:      {fmt_cena(cena)} zł brutto/os.
Po dofinansowaniu KFS (mikrofirma 90%): {wklad_mikro} zł

{po_szkoleniu}
---

Czy moglibyśmy porozmawiać telefonicznie - ok. 15 minut - żeby ustalić,
czy ta propozycja odpowiada Państwa potrzebom?

Dostępne terminy rozmowy: [propozycje 2-3 slotów]

W razie pytań pozostaję do dyspozycji.

Z poważaniem,
[Imię Nazwisko]
[Stanowisko]
IRIN sp. z o.o. - Instytut Rozwoju i Nauki
+48 [telefon] | [email]@irin.pl

Profil szkolenia w BUR PARP:
{url}
```

---

## Co dostosować przed wysyłką

| Placeholder | Co wstawić |
|---|---|
| `[Firma_klienta]` | Nazwa firmy odbiorcy |
| `[propozycje 2-3 slotów]` | Np. "wtorek 10:00, środa 14:00, czwartek 11:00" |
| `[Imię Nazwisko]` | Imię i nazwisko handlowca |
| `[Stanowisko]` | Np. "Specjalista ds. współpracy" |
| `+48 [telefon]` | Numer telefonu |
| `[email]@irin.pl` | Adres email |

---

## Po wysłaniu - harmonogram follow-up

| Dzień | Akcja |
|---|---|
| Dzień 0 | Wysyłka cold email |
| Dzień 3 | Follow-up 1: uprzejme przypomnienie, pytanie o otrzymanie wiadomości |
| Dzień 7 | Follow-up 2: informacja o innych terminach lub formach szkolenia |
| Dzień 14 | Follow-up 3 (ostatni): podziękowanie za czas, propozycja powrotu za miesiąc |
| Dzień 45 | Re-engagement: nowy temat (np. nowy nabór KFS w regionie) |

---

## Powiązane materiały

- [One-pager handlowca](one_pager.md)
- [Skrypt rozmowy telefonicznej](skrypt_rozmowy.md)

---
**Ostatnia aktualizacja:** 2026-04-27
"""


def hydrate(szkol, folder):
    path = DASH / "sales/per_szkolenie" / folder
    path.mkdir(parents=True, exist_ok=True)
    klaster = klaster_for(folder)

    (path / "one_pager.md").write_text(gen_one_pager(szkol, folder, klaster))
    (path / "skrypt_rozmowy.md").write_text(gen_skrypt(szkol, folder, klaster))
    (path / "email_cold.md").write_text(gen_email(szkol, folder, klaster))
    print(f"✓ {folder}: 3 plików ({klaster})")


if __name__ == "__main__":
    for szkol in SZKOL:
        folder = FOLDERS.get(szkol["id_bur"])
        if folder and folder != "01_social_media_ai":
            hydrate(szkol, folder)
    print(f"\nHydratacja done. 9 folderów × 3 pliki = 27 plików.")
