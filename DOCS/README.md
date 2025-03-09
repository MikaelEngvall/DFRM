# Dokumentation för Internationalisering (i18n) i DFRM

Denna katalog innehåller dokumentation och verktyg för att implementera och underhålla flerspråksstöd i DFRM-applikationen.

## Innehåll

### Riktlinjer och manualer
- [**language-files-guide.md**](language-files-guide.md) - Omfattande guide för hantering av språkfiler, med beskrivning av filstruktur, nyckelstruktur och regler för översättningshantering.
- [**developer-checklist.md**](developer-checklist.md) - Checklista för utvecklare att följa när de arbetar med flerspråksstöd i applikationen.
- [**implementation-plan.md**](implementation-plan.md) - Plan för att implementera fullständigt flerspråksstöd i hela applikationen, inklusive tidslinjer och ansvarsområden.

### Kodexempel och verktyg
- [**i18n-guide.jsx**](i18n-guide.jsx) - Exempelkomponent som visar korrekt användning av översättningsfunktionalitet.
- [**verify-translations.js**](verify-translations.js) - Skript för att verifiera att alla språkfiler har samma nyckelstruktur.

## Språk som stöds
DFRM stöder för närvarande följande språk:
- Svenska (sv) - Standardspråk
- Engelska (en)
- Polska (pl)
- Ukrainska (uk)

## Kom igång

1. Läs igenom [language-files-guide.md](language-files-guide.md) för att förstå strukturen på språkfilerna.
2. Följ [developer-checklist.md](developer-checklist.md) när du lägger till eller ändrar komponenter.
3. Kör [verify-translations.js](verify-translations.js) regelbundet för att säkerställa att alla språkfiler är synkroniserade.

## Bidra

Om du lägger till nya funktioner i DFRM:
1. Identifiera alla textsträngar som kommer att visas i användargränssnittet
2. Lägg till dessa strängar i alla språkfiler under rätt nyckelstruktur
3. Använd alltid `useLocale` hook och `t()` funktionen för att visa text i UI

## Resurser
- [React Internationalization](https://react.i18next.com/) - För mer information om internationalisering i React-applikationer
- [Tailwind CSS internationalization patterns](https://tailwindcss.com/docs/hover-focus-and-other-states#styling-based-on-parent-state) - För styling baserat på språkval

## Exempel på bra implementering
Se [Navigation.jsx](../frontend/src/components/Navigation.jsx) och [SessionWarning.jsx](../frontend/src/components/SessionWarning.jsx) för exempel på komponenter som använder översättningssystemet korrekt. 