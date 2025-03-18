# DFRM (Digital Fastighets- och Resurshantering)

Ett modernt system för hantering av lägenheter, hyresgäster, nycklar och arbetsuppgifter för fastighetsförvaltning.
![image](https://github.com/user-attachments/assets/b5f2d656-3e36-4ade-b0cc-ec721e5afedc)

## Teknisk Stack

### Backend
- Java 17
- Spring Boot
- MongoDB
- Spring Security (JWT Authentication)
- E-postintegrering (IMAP/SMTP)

### Frontend
- React
- TailwindCSS
- Heroicons
- Cinzel font

## Projektstruktur
```
dfrm/
├── backend/                     # Java Spring Boot backend
│   ├── src/main/java/com/dfrm/
│   │   ├── client/              # Externa API-klienter (t.ex. Google Translate)
│   │   ├── config/              # Konfigurationsklasser för Spring Boot, MongoDB, mail, etc.
│   │   ├── controller/          # REST API-endpoints
│   │   ├── filter/              # Säkerhetsfilter (JWT-autentisering)
│   │   ├── model/               # Datamodeller och entiteter
│   │   ├── repository/          # MongoDB-repositories för dataåtkomst
│   │   └── service/             # Affärslogik och tjänster
│   └── src/main/resources/      # Konfigurationsfiler, översättningar, etc.
│
├── frontend/                    # React frontend
│   ├── public/                  # Statiska filer
│   └── src/
│       ├── components/          # Återanvändbara React-komponenter
│       ├── contexts/            # React context providers (auth, locale, theme)
│       ├── locales/             # Språkfiler för flerspråksstöd
│       ├── pages/               # Sidkomponenter (routes)
│       ├── router/              # Routing-konfiguration
│       ├── services/            # API-klienter och tjänster
│       └── utils/               # Hjälpfunktioner (formatter, validation, cache)
│
└── docker/                      # Docker-filer för utveckling
```

### Backend-struktur

Backend är byggd med Spring Boot och följer en traditionell lagerarkitektur:

- **Controller-lager**: Hanterar HTTP-requests och definierar API-endpoints
- **Service-lager**: Innehåller affärslogik och koordinerar dataflödet
- **Repository-lager**: Ansvarar för dataåtkomst mot MongoDB
- **Model-lager**: Definierar datamodeller och entiteter

### Frontend-struktur

Frontend är byggd med React och använder följande struktur:

- **Components**: Återanvändbara UI-komponenter som DataTable, Modal, etc.
- **Pages**: Sidspecifika komponenter som representerar olika vyer (Apartments, Tenants, etc.)
- **Services**: Funktioner för att interagera med backend-API
- **Contexts**: Tillståndhantering för global data (autentisering, språk, tema)
- **Utils**: Hjälpfunktioner för formatering, validering och cachehantering

## Kom igång

### Förutsättningar
- Java 17
- Node.js 18+
- MongoDB
- Docker (valfritt)

### Installation

1. Klona repot:
```bash
git clone https://github.com/yourusername/dfrm.git
cd dfrm
```

2. Starta backend:
```bash
cd backend
./mvnw spring-boot:run
```

3. Starta frontend:
```bash
cd frontend
npm install
npm start
```

4. Öppna webbläsaren och gå till `http://localhost:3000`

## Funktioner
- **Lägenhetshantering** - Hantera lägenheter, deras egenskaper och kopplingar till hyresgäster
- **Hyresgästhantering** - Administrera hyresgästinformation och deras kontaktuppgifter
- **Nyckelhantering** - Spåra nycklar, deras typer och användning
- **Personalhantering** - Hantera personal och deras behörigheter
- **Uppgiftshantering** - Skapa, tilldela och spåra arbetsuppgifter för fastigheten
- **Kalender** - Visualisera uppgifter i ett kalenderformat
- **E-postintegrering** - Automatiserad hantering av inkommande och utgående e-post
- **E-postrapporter** - Skicka systemgenererade rapporter via e-post
- **Importverktyg** - Importera data från Excel-filer
- **Responsiv design** - Fungerar på både desktop och mobila enheter
- **Svensk lokalisering** - Fullt stöd för svenska
- **Mörkt läge** - Stöd för mörkt och ljust gränssnitt

## API-dokumentation
API-dokumentation finns tillgänglig på `http://localhost:8080/swagger-ui.html` när backend är igång. 

## Kodstandarder (.cursorrules)

Projektet använder en `.cursorrules`-fil för att definiera kodstandarder och riktlinjer som ska följas. Dessa regler hjälper till att upprätthålla kodkvalitet och konsekvent kodstil i hela projektet. Några av de viktigaste riktlinjerna är:

### Backend-regler
- Använd dependency injection istället för att skapa instanser manuellt
- Lägg affärslogik i service-lagret, inte i controllers
- Repository-klasser ska bara hantera databasoperationer
- Använd miljövariabler för känslig data

### Frontend-regler
- Skriv komponenter som funktioner, inte klasser
- Använd React hooks för state-hantering
- Lägg API-anrop i services/-mappen, inte direkt i komponenter
- Följ TailwindCSS-konventioner för styling
- Skriv UI-komponenter modulärt och återanvändbart

### Internationalisering
- Språkfiler ska ha stöd för svenska, engelska, polska och ukrainska
- Undvik hårdkodad text i komponenter

### Säkerhetsriktlinjer
- Använd JWT för autentisering
- Lagra lösenord med bcrypt
- Sanera och validera all användarinmatning

### Kodstil och formattering
- Använd Prettier för TypeScript och React-kod
- Använd Checkstyle och Spotless för Java-kod
- Undvik långa funktioner – håll dem under 50 rader
- Namnge variabler och metoder beskrivande

## Konfigurera miljövariabler

För att köra applikationen behöver du konfigurera miljövariabler för känsliga uppgifter. Följ dessa steg:

1. Kopiera `.env.example` till en ny fil `.env` i projektets rot
   ```
   cp .env.example .env
   ```

2. Redigera `.env` filen och lägg till dina egna värden för alla miljövariabler

3. För utvecklingsändamål kan du också kopiera `backend/src/main/resources/application-template.yml` till `backend/src/main/resources/application.yml` och anpassa värdena

**OBS! Lägg aldrig till känsliga uppgifter i versionskontroll!**

Följande miljövariabler är nödvändiga för att köra applikationen:

### MongoDB-konfiguration
- `MONGODB_URI` - Fullständig URI för MongoDB-anslutning
- `MONGODB_DATABASE` - Databasnamn
- Alternativt kan du använda separata variabler:
  - `MONGO_USER` - MongoDB-användarnamn
  - `MONGO_PASSWORD` - MongoDB-lösenord
  - `MONGO_HOST` - MongoDB-värdnamn
  - `MONGO_DATABASE` - MongoDB-databasnamn

### E-postkonfiguration
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_PORT` - För utgående e-post
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD` - För inkommande e-post

### JWT-säkerhet
- `ACCESS_TOKEN_SECRET` - Hemlig nyckel för JWT-token

### Google Translate API
- `GOOGLE_TRANSLATE_API_KEY` - API-nyckel för Google Translate

## Noterade problem och begränsningar
- Sorteringsfunktionaliteten för hyresgästkolumnen i lägenhetstabellen behöver förbättras.
- E-postlyssnartjänsten kan vara känslig för vissa formaterade e-postmeddelanden.
