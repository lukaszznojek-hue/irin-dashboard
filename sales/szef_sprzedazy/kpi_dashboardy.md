# 📊 KPI handlowca i szefa sprzedaży - dashboard IRIN

> Definicje metryk, benchmarki i sposób korzystania z dashboardu IRIN do zarządzania wynikami.

---

## 1. KPI handlowca - metryki operacyjne

### Dzienne (minimum)

| KPI | Target | Zdrowy | Alert |
|---|---|---|---|
| Nowi leady (cold outreach) | 5 | 5-8 | <3 |
| Rozmowy demo / prezentacje | 2-3 | 3+ | <1 |
| Follow-up touchpoints | 3-5 | 5+ | <2 |
| Aktualizacje CRM Bitrix | bieżące | 0 zaległych | >2 zaległe |

### Tygodniowe

| KPI | Target | Zdrowy | Alert |
|---|---|---|---|
| Nowi leady | 25 | 25-40 | <15 |
| Demo przeprowadzone | 10-15 | 15+ | <7 |
| Oferty wysłane | 7-10 | 10+ | <5 |
| Deale zamknięte (szt.) | 3 | 3-5 | <1 |
| Wartość zamkniętych deali | 15 000 zł | 15-30k | <8k |

### Miesięczne

| KPI | Target | Zdrowy | Alert |
|---|---|---|---|
| Konwersja Lead→Zamknięte | 2.7% | >5% | <1% |
| Średnia wartość deala | ~6 000 zł | 5-9k | <4k |
| Czas Lead→Zamknięte | <30 dni | 14-21 dni | >45 dni |
| Retencja (klient wraca) | 15% | >20% | <5% |

---

## 2. KPI szefa sprzedaży - metryki zarządcze

| KPI | Formuła | Target |
|---|---|---|
| **Pipeline coverage** | Suma pipeline ÷ Target kwartału | 3x (tzn. pipeline = 3× cel) |
| **Velocity** | (Ilość deali × Avg deal × Win rate) ÷ Avg cycle days | Rosnąca M/M |
| **Win rate zespołu** | Wygrane ÷ (Wygrane + Przegrane) | >25% |
| **Czas do pierwszego deala** | Dni od startu handlowca do 1. zamknięcia | <60 dni |
| **Coaching adherence** | % odbytych 1-na-1 vs zaplanowanych | >90% |
| **Forecast accuracy** | Prognoza kwartalna vs realizacja | ±15% |

---

## 3. Jak czytać dashboard IRIN

### Zakładka Powiaty
- **AKTYWNY + zadzwon** = gorący nabór KFS. Priorytetyzuj cold calls do powiatów z tym statusem.
- **Kwota KFS** = budżet dostępny. Im wyższa, tym większe szanse na akceptację wniosku.
- **Tier 1A** (świętokrzyskie, pomorskie, zachodniopomorskie, kujawsko-pomorskie) = regiony z najwyższym potencjałem.

### Zakładka Szkolenia
- Sortuj po Tier IRIN: Tier 1 = 60% czasu handlowca, Tier 2 = 30%, Tier 3 = 10%.
- **Cena/h vs rynek** - argument cenowy w rozmowach. Jeśli cena/h < rynek → "premium jakość taniej niż rynek".
- **Kalkulator dofinansowania** - użyj przy każdej rozmowie z klientem.

### Zakładka WUP
- Monitoruj statusy naborów per województwo.
- Nowy nabór = kampania outbound do firm w regionie.

### Zakładka Tailwinds 2026
- Countdown do AI Act (02.08.2026) = argument sprzedażowy nr 1 dla klastra AI.
- NIS2, Inno_Lab, Akademia HR = dodatkowe punkty zaczepienia per klaster.

### Zakładka Sprzedaż
- Sekcja "Per szkolenie" = szybki dostęp do materiałów (one_pager, skrypt, email) per szkolenie.
- Klik na ikonę = podgląd pliku bez wychodzenia z dashboardu.

---

## 4. Target benchmarki per szkolenie (Tier)

| Tier | Szkolenia | Avg deal value | Win rate target | Czas cyklu |
|---|---|---|---|---|
| **1** (AI/cyfryzacja) | Social Media, Sklep, Skuteczność AI, Zarządzanie AI | 5 880 - 8 750 zł | 30% | 14-21 dni |
| **2** (SI/TUS) | SI Gdańsk×2, SI Kielce×2, TUS | 6 000 - 9 310 zł | 20% | 21-45 dni |
| **3** (Projekty dofin.) | Przygotowanie projektu | 5 300 zł | 25% | 14-30 dni |

---

## 5. Pulpit szefa sprzedaży - codzienny rytuał

**09:00 (5 min) - przegląd dashboardu:**
1. Zakładka Powiaty → nowe nabory (AKTYWNY)? → ping handlowcom
2. Zakładka Tailwinds → countdown AI Act → aktualizacja urgency w pichach
3. CRM Bitrix → pipeline hygiene → flagi (stale deale, brak follow-up)

**Piątek 16:00 (30 min) - pipeline review:**
1. Pipeline per handlowiec vs target
2. Win/loss ratio tygodnia
3. Konwersja per etap (gdzie się sypie?)
4. Top 3 wygrane + top 3 przegrane (co się uczymy?)
5. Plan działań na następny tydzień

---

## 6. Alarmy automatyczne (do skonfigurowania w Bitrix)

| Alarm | Trigger | Akcja |
|---|---|---|
| Stale lead | Lead >7 dni bez akcji | Powiadomienie handlowca + szef sprzedaży |
| Stale oferta | Oferta >14 dni bez odpowiedzi | Follow-up automatyczny + ping szefowi |
| Nowy nabór KFS | Dashboard: nowy powiat AKTYWNY | Alert zespołowi (Slack/mail) |
| Deadline Tailwinds | <30 dni do regulacji | Kampania dedykowana |
| Target tygodniowy missed | <60% targetu w piątek | 1-na-1 coaching w poniedziałek |

---

## 7. Słownik metryk

| Metryka | Definicja |
|---|---|
| **Lead** | Nowy kontakt z potencjalnym klientem (cold lub inbound) |
| **Qualified** | Lead spełnia BANT (Budget, Authority, Need, Timeline) |
| **Demo** | Rozmowa 15-25 min z kwalifikowanym leadem |
| **Win rate** | % zamkniętych deali vs wszystkie zakończone (wygrane + przegrane) |
| **Pipeline coverage** | Stosunek wartości pipeline do celu sprzedażowego |
| **Velocity** | Szybkość "przepływu" pipeline: (deals × value × win%) ÷ cycle_days |
| **Forecast accuracy** | Jak blisko prognoza kwartalna jest od realizacji |
| **BANT** | Budget - Authority - Need - Timeline (kwalifikacja leada) |

---
**Status:** v1.0
**Ostatnia aktualizacja:** 2026-04-27
