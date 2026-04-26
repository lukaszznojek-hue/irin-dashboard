# Bitrix24 CRM - Pola leada IRIN

Specyfikacja pól niestandardowych (custom fields) dla encji Lead w Bitrix24.
Dotyczy sprzedaży szkoleń z dofinansowaniem KFS/BUR.

## Dane kontaktowe

| Pole | Typ | Wymagane | Wartości / Opis | Domyślna |
|---|---|---|---|---|
| Imię | text | tak | - | - |
| Nazwisko | text | tak | - | - |
| Stanowisko | dropdown | nie | HR Manager / Prezes / Dyrektor rozwoju / Specjalista ds. dofinansowań / Księgowa / Inny | - |
| Firma | text | tak | Pełna nazwa podmiotu | - |
| NIP | text | tak | 10 cyfr, walidacja formatu i sumy kontrolnej | - |
| Branża PKD | text | nie | Kod PKD 2-cyfrowy (sekcja) lub 4-cyfrowy | - |
| Telefon | phone | tak | Format: +48 XXX XXX XXX | - |
| Email | email | tak | Walidacja poprawności adresu | - |

## Lokalizacja

| Pole | Typ | Wymagane | Wartości / Opis | Domyślna |
|---|---|---|---|---|
| Województwo | dropdown | tak | 16 województw (dolnośląskie, kujawsko-pomorskie, lubelskie, lubuskie, łódzkie, małopolskie, mazowieckie, opolskie, podkarpackie, podlaskie, pomorskie, śląskie, świętokrzyskie, warmińsko-mazurskie, wielkopolskie, zachodniopomorskie) | - |
| Powiat | cascade dropdown | tak | 357 powiatów, filtrowanych wg wybranego województwa. Lista importowana z bazy TERYT. | - |

## Dane firmowe

| Pole | Typ | Wymagane | Wartości / Opis | Domyślna |
|---|---|---|---|---|
| Wielkość firmy | dropdown | tak | mikro (1-9) / mała (10-49) / średnia (50-249) / duża (250+) | - |
| Liczba pracowników | integer | nie | Dokładna liczba - wpływa na % dofinansowania KFS | - |

## Źródło i kwalifikacja

| Pole | Typ | Wymagane | Wartości / Opis | Domyślna |
|---|---|---|---|---|
| Źródło leada | dropdown | tak | cold_call / email / web / event / referral / bur_zapytanie | - |
| Szczegóły źródła | text | nie | np. nazwa eventu, kto polecił, kampania | - |
| Zainteresowanie szkoleniem | multiselect | tak | 12 aktywnych usług IRIN z rejestru BUR PARP (lista zarządzana jako osobny słownik - aktualizacja przy zmianie oferty) | - |
| Status dofinansowania | dropdown | tak | KFS uprawniony / BUR uprawniony / nieuprawniony / nieznany | nieznany |
| Priorytet leada | dropdown | tak | gorący / ciepły / zimny | zimny |

## Obsługa i notatki

| Pole | Typ | Wymagane | Wartości / Opis | Domyślna |
|---|---|---|---|---|
| Opiekun leada | user | tak | Przypisany handlowiec z zespołu IRIN | - |
| Notatki | textarea | nie | Dowolne uwagi, historia kontaktu | - |
| Następny kontakt | date | nie | Data planowanego follow-up. Wyzwala przypomnienie w automatyzacji. | - |
| Data utworzenia | datetime | auto | Automatyczny timestamp | now() |
| Data ostatniej aktywności | datetime | auto | Aktualizowany przy każdej interakcji | now() |

## Uwagi wdrożeniowe

- **NIP** - walidacja sumy kontrolnej (algorytm wag 6-5-7-2-3-4-5-6-7) po stronie Bitrix24 (workflow lub webhook).
- **Powiat** - cascade dropdown wymaga importu powiązań województwo-powiat z rejestru TERYT. Alternatywa: pole text z autouzupełnianiem.
- **Zainteresowanie szkoleniem** - słownik 12 usług synchronizowany z aktualną ofertą BUR. Przy zmianie oferty aktualizować listę, nie usuwać starych wpisów (archiwizować).
- **Status dofinansowania** - wartość "nieznany" jako domyślna wymusza kwalifikację w toku rozmowy.
- Pola `Data utworzenia` i `Data ostatniej aktywności` - natywne pola Bitrix24, nie wymagają custom field.
