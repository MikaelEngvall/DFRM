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
├── backend/         # Java Spring Boot backend
├── frontend/        # React frontend
└── docker/          # Docker-filer för utveckling
```

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
