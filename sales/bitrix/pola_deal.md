# Bitrix24 CRM - Pola transakcji (deal) IRIN

Specyfikacja pól niestandardowych (custom fields) dla encji Deal w Bitrix24.
Dotyczy transakcji sprzedaży szkoleń z dofinansowaniem KFS/BUR.

## Szkolenie

| Pole | Typ | Wymagane | Wartości / Opis | Domyślna |
|---|---|---|---|---|
| Szkolenie | dropdown | tak | 12 aktywnych usług IRIN z rejestru BUR PARP (wspólny słownik z polem leada) | - |
| Termin szkolenia | date | tak | Planowana data rozpoczęcia | - |
| Data zakończenia szkolenia | date | tak | Planowana data zakończenia | - |
| Forma realizacji | dropdown | tak | zdalna / mieszana / stacjonarna | zdalna |
| Liczba uczestników | integer | tak | Min. 1. Wpływa na kalkulację ceny. | 1 |

## Finanse

| Pole | Typ | Wymagane | Wartości / Opis | Domyślna |
|---|---|---|---|---|
| Cena brutto | currency (PLN) | tak | Zakres 5 300 - 9 310 zł wg cennika usługi | - |
| Dofinansowanie % | integer | tak | 0-100. KFS: do 70% (mikro: do 90%). BUR: do 80%. | 0 |
| Kwota dofinansowania | currency (PLN) | auto | Obliczana: Cena brutto × Dofinansowanie % / 100 | - |
| Kwota do zapłaty przez klienta | currency (PLN) | auto | Obliczana: Cena brutto - Kwota dofinansowania | - |
| Marża netto | currency (PLN) | nie | Do uzupełnienia po rozliczeniu kosztów | - |

## Dofinansowanie

| Pole | Typ | Wymagane | Wartości / Opis | Domyślna |
|---|---|---|---|---|
| Typ dofinansowania | dropdown | tak | KFS / BUR / FERS / brak | brak |
| Nr wniosku KFS/BUR | text | nie | Numer nadany przez PUP/WUP lub system BUR | - |
| Status wniosku | dropdown | nie | złożony / zatwierdzony / odrzucony / w trakcie | - |
| Data złożenia wniosku | date | nie | Data faktycznego złożenia | - |
| Data decyzji | date | nie | Data otrzymania decyzji z PUP/WUP | - |
| PUP/WUP obsługujący | text | tak | Nazwa urzędu pracy obsługującego wniosek | - |
| Numer w rejestrze BUR | text | nie | ID usługi w Bazie Usług Rozwojowych | - |

## Umowa i faktura

| Pole | Typ | Wymagane | Wartości / Opis | Domyślna |
|---|---|---|---|---|
| Nr umowy | text | nie | Numer umowy szkoleniowej z klientem | - |
| Data podpisania umowy | date | nie | - | - |
| Nr faktury | text | nie | Numer faktury VAT | - |
| Data faktury | date | nie | Data wystawienia | - |
| Status faktury | dropdown | nie | wystawiona / wysłana / opłacona / przeterminowana | - |
| Termin płatności | date | nie | - | - |

## Retencja i follow-up

| Pole | Typ | Wymagane | Wartości / Opis | Domyślna |
|---|---|---|---|---|
| Data retencji 3-mies | date | auto | Obliczana: Data zakończenia szkolenia + 90 dni. Wyzwala kontakt retencyjny. | - |
| NPS score | integer | nie | 0-10. Zbierany automatycznie po szkoleniu. | - |
| Opiekun transakcji | user | tak | Handlowiec odpowiedzialny | - |
| Notatki | textarea | nie | Uwagi do transakcji | - |

## Uwagi wdrożeniowe

- **Pola obliczane** (Kwota dofinansowania, Kwota do zapłaty, Data retencji) - realizacja przez workflow Bitrix24 lub kalkulowane pola (calculated fields). Aktualizacja przy każdej zmianie pól źródłowych.
- **Dofinansowanie %** - walidacja zakresu zależna od typu: KFS mikro max 90%, KFS pozostałe max 70%, BUR max 80%. Reguła walidacji w workflow.
- **PUP/WUP** - docelowo dropdown z listą 357 PUP + 16 WUP. Na start: pole tekstowe z autouzupełnianiem.
- **Cena brutto** - zakres 5 300 - 9 310 zł to aktualny cennik. Pole nie powinno być sztywno ograniczone (możliwe ceny indywidualne).
- **Status faktury** "przeterminowana" - ustawiana automatycznie gdy Termin płatności < dzisiaj i status ≠ opłacona.
- Deal powiązany z Kontaktem (osoba decyzyjna) i Firmą (podmiot płacący) - relacje natywne Bitrix24.
