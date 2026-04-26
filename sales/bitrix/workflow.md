# Bitrix24 CRM - Przepływ statusów IRIN

Definicja pipeline'ów Lead i Deal dla sprzedaży szkoleń z dofinansowaniem KFS/BUR.

## Pipeline leada

| # | Status | Odpowiada | Działanie | SLA | Następny krok |
|---|---|---|---|---|---|
| 1 | **Nowy** | System | Lead zarejestrowany w CRM. Automatyczne przypisanie opiekuna wg regionu. | 2h | Pierwszy kontakt telefoniczny |
| 2 | **Skontaktowany** | Handlowiec | Wykonano pierwszy kontakt. Ustalono osobę decyzyjną i wstępne potrzeby. | 24h od utworzenia | Badanie potrzeb szkoleniowych |
| 3 | **Zainteresowany** | Handlowiec | Klient wyraził zainteresowanie konkretnym szkoleniem. Zidentyfikowano budżet i timeline. | 48h | Kwalifikacja dofinansowania |
| 4 | **Kwalifikacja dofinansowania** | Handlowiec | Weryfikacja uprawnień do KFS/BUR. Sprawdzenie wielkości firmy, PKD, historii dofinansowań. | 3 dni | Przygotowanie oferty |
| 5 | **Oferta wysłana** | Handlowiec | Oferta z kalkulacją dofinansowania wysłana mailem. Zawiera: cenę, % dofinansowania, kwotę klienta, termin. | 5 dni na odpowiedź | Follow-up telefoniczny |
| 6 | **Negocjacje** | Handlowiec | Uzgadnianie warunków: termin, forma, liczba uczestników, rabat. | 7 dni | Zamknięcie lub eskalacja |
| 7 | **Konwersja** | Handlowiec | Lead przekonwertowany na Deal + Kontakt + Firmę. | 1 dzień | Utworzenie deal w pipeline |
| 8 | **Utracony** | Handlowiec | Klient odmówił lub brak kontaktu. Uzupełnić powód utraty (pole obowiązkowe). | - | Retencja za 3 miesiące |

### Powody utraty leada (dropdown obowiązkowy przy statusie Utracony)

- Brak budżetu
- Brak dofinansowania (nieuprawniony)
- Wybrał konkurencję
- Termin nie pasuje
- Brak kontaktu (3+ próby)
- Szkolenie nieadekwatne do potrzeb
- Inny (pole tekstowe)

## Pipeline deal

| # | Status | Odpowiada | Działanie | SLA | Następny krok |
|---|---|---|---|---|---|
| 1 | **Nowy** | Handlowiec | Deal utworzony po konwersji leada. Uzupełnione: szkolenie, cena, typ dofinansowania. | 1 dzień | Złożenie wniosku |
| 2 | **Wniosek KFS/BUR złożony** | Klient + Handlowiec | Wniosek o dofinansowanie złożony w PUP (KFS) lub zarejestrowany w BUR. Nr wniosku wpisany. | Oczekiwanie na decyzję (do 30 dni KFS) | Monitoring statusu wniosku |
| 3 | **Wniosek zatwierdzony** | Handlowiec | Decyzja pozytywna. Uzupełnić: datę decyzji, potwierdzoną kwotę dofinansowania. | 3 dni | Przygotowanie umowy |
| 4 | **Umowa podpisana** | Handlowiec | Umowa szkoleniowa podpisana przez obie strony. Nr umowy i data wpisane. | 5 dni od zatwierdzenia | Planowanie terminu |
| 5 | **Szkolenie zaplanowane** | Koordynator | Termin, trener, platforma/sala potwierdzone. Klient poinformowany o szczegółach. | 7 dni przed terminem | Realizacja szkolenia |
| 6 | **Szkolenie realizowane** | Trener | Szkolenie w toku. Listy obecności, materiały, certyfikaty. | Czas trwania szkolenia | Zamknięcie i ewaluacja |
| 7 | **Zakończone** | Koordynator | Szkolenie zakończone. Certyfikaty wydane. Ankieta NPS wysłana. | 3 dni po zakończeniu | Fakturowanie i rozliczenie |
| 8 | **Rozliczone** | Księgowość | Faktura wystawiona i opłacona. Dokumentacja rozliczeniowa KFS/BUR przekazana do PUP. | 14 dni od zakończenia | Retencja 3-miesięczna |

### Statusy dodatkowe (wyjątkowe)

- **Wniosek odrzucony** - fork ze statusu 2. Handlowiec decyduje: nowy wniosek, zmiana typu dofinansowania lub sprzedaż bez dofinansowania.
- **Anulowany** - rezygnacja klienta na dowolnym etapie. Powód obowiązkowy.

## Automatyzacje Bitrix24

### Przypomnienia i follow-up

| Wyzwalacz | Akcja | Czas |
|---|---|---|
| Lead w statusie Nowy | Przypomnienie: wykonaj pierwszy kontakt | Po 2h |
| Lead w statusie Oferta wysłana, brak zmiany | Przypomnienie: follow-up telefoniczny | Po 3 dniach |
| Lead w statusie Oferta wysłana, brak zmiany | Eskalacja do managera | Po 5 dniach |
| Pole Następny kontakt = dziś | Powiadomienie push + email do opiekuna | 9:00 danego dnia |
| Lead Utracony | Zadanie: kontakt retencyjny | Po 90 dniach |

### Alerty dofinansowanie

| Wyzwalacz | Akcja | Czas |
|---|---|---|
| Deal w statusie Wniosek złożony, brak zmiany | Alert: sprawdź status wniosku w PUP | Po 14 dniach |
| Deal w statusie Wniosek złożony, brak zmiany | Eskalacja: brak decyzji PUP | Po 30 dniach |
| Data złożenia wniosku KFS + termin naboru | Alert: zbliża się deadline naboru KFS | 7 dni przed |

### Post-szkolenie

| Wyzwalacz | Akcja | Czas |
|---|---|---|
| Deal → status Zakończone | Wysłanie ankiety NPS (email automatyczny) | 1 dzień po zakończeniu |
| Deal → status Zakończone | Przypomnienie: wystaw fakturę | 3 dni po zakończeniu |
| Data retencji 3-mies = dziś | Zadanie: kontakt retencyjny - nowe szkolenie | Automatycznie |
| NPS score ≤ 6 | Alert do managera: klient niezadowolony | Natychmiast |
| Status faktury = przeterminowana | Alert do księgowości + handlowca | Natychmiast |

## Reguły przypisania

- Nowy lead → automatyczne przypisanie handlowca wg województwa (round-robin w ramach regionu).
- Konwersja lead → deal → ten sam opiekun, chyba że ręczna zmiana.
- Eskalacja → manager sprzedaży otrzymuje powiadomienie, ale nie przejmuje leada/deal automatycznie.
