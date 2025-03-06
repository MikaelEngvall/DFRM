# DFRM (Digital Fastighets- och Resurshantering)

Ett modernt system för hantering av lägenheter, hyresgäster och nycklar.

## Teknisk Stack

### Backend
- Java 17
- Spring Boot
- MongoDB
- Spring Security (JWT Authentication)

### Frontend
- React
- TailwindCSS
- Express
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
- Hantering av lägenheter
- Hantering av hyresgäster
- Nyckelhantering
- Sökfunktioner
- Responsiv design
- Svensk lokalisering

## API-dokumentation
API-dokumentation finns tillgänglig på `http://localhost:8080/swagger-ui.html` när backend är igång. 