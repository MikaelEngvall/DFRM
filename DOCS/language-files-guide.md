# Guide för hantering av språkfiler i DFRM

## Introduktion

DFRM-applikationen stöder fyra språk:
- Svenska (sv)
- Engelska (en)
- Polska (pl)
- Ukrainska (uk)

För att säkerställa att hela applikationen fungerar korrekt på alla språk måste vi säkerställa att alla ledtexter finns tillgängliga i alla fyra språkfiler.

## Filstruktur

Alla språkfiler finns i `/frontend/src/locales/` med följande namngivning:
- `sv.js` - Svenska (standardspråk)
- `en.js` - Engelska
- `pl.js` - Polska
- `uk.js` - Ukrainska

## Nyckelstruktur

Nycklarna i språkfilerna är strukturerade hierarkiskt för att organisera översättningar efter funktionsområde:

```javascript
export default {
  common: {
    loading: 'Laddar...',
    error: 'Ett fel uppstod',
    // ...
  },
  
  navigation: {
    dashboard: 'Översikt',
    apartments: 'Lägenheter',
    // ...
  },
  
  auth: {
    login: {
      title: 'Logga in på DFRM',
      // ...
    }
  },
  
  // Komponenter och sidor
  dashboard: { ... },
  apartments: { ... },
  tenants: { ... },
  keys: { ... },
  
  // Validering och felmeddelanden
  validation: { ... }
}
```

## Regler för hantering av språkfiler

1. **Identisk nyckelstruktur**: Alla fyra språkfiler MÅSTE ha exakt samma nyckelstruktur. Om en nyckel finns i svenska filen måste den också finnas i engelska, polska och ukrainska filerna.

2. **Inget hårdkodad text**: All text som visas i användargränssnittet ska hämtas från språkfilerna med `t()` funktionen.

3. **Använd nästlade objekt**: Använd nästlade objekt för att organisera översättningar efter sidor och komponenter:

   ```javascript
   export default {
     apartments: {
       title: 'Lägenheter',
       addNew: 'Lägg till lägenhet',
       fields: {
         street: 'Gata',
         // ...
       }
     }
   }
   ```

4. **Namngivning av nycklar**: Använd konsekventa namnkonventioner för nycklar:
   - Använd camelCase för nyckelnamn
   - Gruppera nycklar efter funktionalitet
   - Använd prefixet "title" för huvudtitlar, "button" för knappar, etc.

5. **Parametrar**: För dynamiska texter, använd platshållare med mustach-syntax och parameteröverföring:

   ```javascript
   // I språkfilen
   sessionWarning: 'Du kommer att loggas ut om {minutes} {minutes, plural, one {minut} other {minuter}}.',
   
   // I komponenten
   t('auth.session.warning', { minutes: remainingTime, plural: remainingTime })
   ```

## Process för att lägga till nya texter

1. Lägg först till nya texter i den svenska språkfilen (`sv.js`).
2. Lägg sedan till motsvarande nycklar med översättningar i engelska (`en.js`), polska (`pl.js`) och ukrainska (`uk.js`) filerna.
3. Uppdatera komponenterna för att använda de nya nycklarna via `t()` funktionen.

## Översättningshjälp

- För svenska och engelska översättningar, använd manuell översättning.
- För polska och ukrainska kan du använda Google Translate API som en första version, men se till att få översättningarna granskade av en person som talar språket.

## Kontroll av språkfiler

Det rekommenderas att regelbundet kontrollera att alla språkfiler har samma nyckelstruktur. Du kan använda ett skript för detta eller manuellt jämföra filerna.

Om nödvändigt, implementera ett testskript som kontrollerar att alla nycklar som finns i den svenska filen också finns i de andra filerna.

## Exempel

Här är ett exempel på hur samma nyckel ska finnas i alla fyra språkfiler:

### Svenska (sv.js)
```javascript
export default {
  apartments: {
    title: 'Lägenheter'
  }
}
```

### Engelska (en.js)
```javascript
export default {
  apartments: {
    title: 'Apartments'
  }
}
```

### Polska (pl.js)
```javascript
export default {
  apartments: {
    title: 'Mieszkania'
  }
}
```

### Ukrainska (uk.js)
```javascript
export default {
  apartments: {
    title: 'Квартири'
  }
}
``` 