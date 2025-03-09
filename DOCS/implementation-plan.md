# Implementationsplan för fullständig språköversättning i DFRM

## Bakgrund
För närvarande är det bara ledtexter i navigeringsfältet som är konsekvent översatta till svenska, engelska, polska och ukrainska. Vi behöver se till att alla ledtexter i hela applikationen finns tillgängliga på alla fyra språk, inklusive framtida tillägg.

## Mål
- Alla ledtexter i användargränssnittet ska vara tillgängliga på alla fyra språk
- Alla framtida tillägg ska automatiskt inkludera översättningar till alla fyra språk
- Säkerställa konsekvent användning av översättningsmekanismen i hela applikationen

## Implementationsplan

### Fas 1: Inventering av befintliga ledtexter (2 dagar)

1. **Inventera icke-översatta ledtexter**
   - Gå igenom alla sidor och komponenter för att identifiera hårdkodade ledtexter
   - Dokumentera alla ledtexter som behöver flyttas till språkfilerna
   - Skapa en komplett lista över saknade översättningar

2. **Inventera befintliga språkfiler**
   - Analysera befintliga språkfiler (sv.js, en.js, pl.js, uk.js)
   - Identifiera saknade översättningar i respektive språkfil
   - Verifiera att nyckelstrukturen är konsekvent mellan alla språkfiler

### Fas 2: Komplettera språkfiler (3 dagar)

1. **Uppdatera svenska språkfilen (sv.js)**
   - Lägg till alla saknade ledtexter från inventeringen
   - Organisera nycklarna hierarkiskt efter funktionsområde
   - Säkerställ konsekvent namngivning av nycklar

2. **Uppdatera övriga språkfiler**
   - Översätt alla nya svenska ledtexter till engelska (en.js)
   - Översätt alla nya svenska ledtexter till polska (pl.js)
   - Översätt alla nya svenska ledtexter till ukrainska (uk.js)
   - För polska och ukrainska, använd professionell översättare eller Google Translate som en första version

3. **Verifiera översättningsnycklar**
   - Använd verify-translations.js för att säkerställa att alla språkfiler har samma nyckelstruktur
   - Åtgärda eventuella skillnader mellan språkfilerna

### Fas 3: Uppdatera komponenter (5 dagar)

1. **Uppdatera huvudkomponenter**
   - Implementera useLocale och t() i App.jsx och andra grundläggande komponenter
   - Ersätt alla hårdkodade texter med motsvarande översättningsnycklar

2. **Uppdatera sidkomponenter**
   - Gå igenom varje sida (Dashboard, Apartments, Tenants, Keys, Login, etc.)
   - Ersätt alla hårdkodade texter med t() anrop
   - Uppdatera formulärtexter, knappar, rubriker och andra UI-element

3. **Uppdatera återanvändbara komponenter**
   - Uppdatera alla återanvändbara komponenter (FormInput, DataTable, etc.)
   - Säkerställ att alla textelement använder t() för översättning

4. **Uppdatera felmeddelanden och validering**
   - Säkerställ att alla felmeddelanden och valideringsmeddelanden är översatta
   - Konfigurerar valideringslogik för att använda översatta felmeddelanden

### Fas 4: Testning och kvalitetssäkring (3 dagar)

1. **Testning av språköversättningar**
   - Testa applikationen på alla fyra språk
   - Verifiera att alla ledtexter visas korrekt på respektive språk
   - Kontrollera om det finns några saknade översättningar eller översättningsfel

2. **Testning av användargränssnittet**
   - Verifiera att UI-element fungerar korrekt med alla språk
   - Kontrollera textstorlek, avskärning och layout för längre översättningar
   - Säkerställ att dynamiska texter med parametrar fungerar korrekt

3. **Dokumentation**
   - Uppdatera utvecklardokumentationen med rutiner för hantering av översättningar
   - Skapa riktlinjer för hur nya ledtexter ska läggas till i framtiden

### Fas 5: Implementera riktlinjer för framtida utveckling (1 dag)

1. **Skapa utvecklingsriktlinjer**
   - Implementera Code Review-riktlinjer för att verifiera att nya funktioner använder översättningssystemet
   - Skapa en checklista för utvecklare att följa vid implementering av nya funktioner

2. **Automatisera verifiering**
   - Konfigurera CI/CD-pipeline för att köra verify-translations.js
   - Lägg till lint-regler för att förhindra hårdkodade strängar i komponenter

## Tidsram
Total uppskattad tid: 14 arbetsdagar

## Ansvariga
- Frontend-utvecklare: Uppdatering av komponenter och implementering av översättningsfunktionalitet
- Språkspecialister: Verifiering av översättningar, särskilt för polska och ukrainska

## Framgångskriterier
- Alla ledtexter i applikationen finns tillgängliga på alla fyra språk
- Ingen hårdkodad text i komponenterna
- En fungerande process för att lägga till nya ledtexter i framtiden
- Lyckade tester på alla fyra språk utan översättningsfel

## Uppföljning
- Regelbundna kontroller av språkfiler för att säkerställa att alla nya tillägg översätts till alla språk
- Utvärdering av översättningskvalitet från användare som talar respektive språk 