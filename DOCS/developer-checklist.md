# Checklista för utvecklare: Flerspråksstöd i DFRM

Följ denna checklista när du lägger till eller ändrar ledtexter i DFRM-applikationen.

## Ny funktionalitet / komponent

### Förberedelsearbete
- [ ] Identifiera alla ledtexter som behöver läggas till i språkfilerna
- [ ] Skapa en lista över texter att översätta med kontext (var de används)

### Uppdatera språkfiler
- [ ] Lägg till nya nycklar i svenska språkfilen (sv.js) först
- [ ] Strukturera nycklarna hierarkiskt efter funktionsområde
- [ ] Använd konsekventa namngivningskonventioner (camelCase)
- [ ] Lägg till samma nycklar i engelska (en.js), polska (pl.js) och ukrainska (uk.js) språkfilerna
- [ ] Kontrollera med `verify-translations.js` att alla språkfiler har samma nyckelstruktur

### Implementera i komponenter
- [ ] Importera `useLocale` hook från `LocaleContext`:
  ```javascript
  import { useLocale } from '../contexts/LocaleContext';
  ```
- [ ] Hämta översättningsfunktionen inom komponenten:
  ```javascript
  const { t } = useLocale();
  ```
- [ ] Ersätt ALL hårdkodad text med t() anrop:
  ```javascript
  <h1>{t('page.title')}</h1>
  <button>{t('common.save')}</button>
  ```
- [ ] Vid dynamiska texter, använd parametrar:
  ```javascript
  {t('messages.count', { count: items.length, plural: items.length })}
  ```

### Testning
- [ ] Testa komponenten med alla fyra språk
- [ ] Kontrollera om längre översättningar passar i gränssnittet
- [ ] Verifiera att alla dynamiska texter med parametrar fungerar korrekt

## Ändring av befintlig komponent

### Förberedelse
- [ ] Kontrollera om komponenten redan använder översättningssystemet
- [ ] Identifiera eventuell hårdkodad text som behöver flyttas till språkfiler

### Migrering (om komponenten inte använder översättningssystemet)
- [ ] Importera `useLocale` hook och hämta `t()` funktionen
- [ ] Lägg till alla hårdkodade texter i språkfilerna
- [ ] Ersätt all hårdkodad text med t() anrop
- [ ] Verifiera att alla språkfiler har samma nyckelstruktur

### Lägga till/ändra texter
- [ ] Lägg till nya nycklar i ALLA språkfiler
- [ ] Var konsekvent med nyckelnamn och struktur
- [ ] Uppdatera alla t() anrop med rätt nycklar

## Specifika regler för översättningsnycklar

### Namngivning
- Använd punkt (.) för att separera hierarkiska nivåer:
  ```javascript
  dashboard.stats.totalApartments
  ```

### Struktur
- Gruppera nycklar efter funktionalitet:
  ```javascript
  apartments: {
    title: 'Lägenheter',
    fields: {
      street: 'Gata',
      // ...
    }
  }
  ```

### Vanliga nyckelkategorier
- **title**: Sidtitlar och huvudrubriker
- **fields**: Formulärfält och etiketter
- **buttons**: Knapptext
- **messages**: Feedback till användaren
- **errors**: Felmeddelanden
- **placeholders**: Platshållartext i inmatningsfält
- **tooltips**: Hjälptexter och tooltips

## Exempel

### Felaktigt (INTE GÖRA):
```javascript
// Komponent.jsx
return (
  <div>
    <h1>Mina inställningar</h1>
    <button>Spara</button>
    <p>Felet uppstod när inställningarna skulle sparas.</p>
  </div>
);
```

### Korrekt (GÖRA):
```javascript
// sv.js
export default {
  settings: {
    title: 'Mina inställningar',
    saveButton: 'Spara',
    saveError: 'Felet uppstod när inställningarna skulle sparas.',
  }
}

// Komponent.jsx
const { t } = useLocale();
return (
  <div>
    <h1>{t('settings.title')}</h1>
    <button>{t('settings.saveButton')}</button>
    <p>{t('settings.saveError')}</p>
  </div>
);
```

## Kom ihåg!
- Alla ledtexter som visas i UI ska vara översättningsbara
- Aldrig hårdkoda text i komponenter
- Testa alltid med alla fyra språk
- Kontrollera regelbundet språkfilerna för att säkerställa konsekvent struktur 