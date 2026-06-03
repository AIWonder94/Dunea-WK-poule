# ⚽ WK Poule - Voetbal Voorspellingen App

Een moderne web-applicatie voor het organiseren van een voetbalpoule rond het FIFA Wereldkampioenschap 2026. Tot 100 collega's kunnen hun voorspellingen op wedstrijduitslagen doen en punten verdienen.

## Features

- 👥 **Gebruikers**: Registratie en inloggen met email + wachtwoord
- 🎯 **Voorspellen**: Voorspel wedstrijduitslagen (max 9-9)
- 🏆 **Punten**: 3 punten voor exact, 2 voor juiste winnaar, 1 voor deelname
- 📊 **Klassement**: Live leaderboard met totaal punten en statistieken
- ⚙️ **Admin**: Synchroniseer wedstrijden en uitslagen van football-data.org API
- 📱 **Responsief**: Werkt perfect op desktop, tablet en mobiel
- 🔒 **Veilig**: Bcrypt password hashing, NextAuth.js session management

## Tech Stack

- **Frontend**: React 18 + Next.js 14 (App Router)
- **Database**: SQLite via Prisma ORM
- **Auth**: NextAuth.js v5 (Credentials provider)
- **Styling**: Tailwind CSS + shadcn/ui
- **API**: TheSportsDB v2 (gratis, geen API-sleutel nodig)

## Installatie

1. **Clone en dependencies**
   ```bash
   npm install
   ```

2. **Database setup**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Environment variables**
   ```bash
   cp .env.example .env
   ```
   Het `.env` bestand is al pre-configured. Je kan optioneel een `SPORTSDB_API_KEY` toevoegen, maar dat is niet nodig.

4. **Start dev server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in je browser.

## Eerste Keer Gebruiken

### Registreren
- Ga naar `/register`
- Vul naam, email en wachtwoord in
- Je bent direct ingelogd

### Admin Account
- Registreer normaal via de `/register` pagina
- Pas je rol handmatig aan in de database:
  ```bash
  npx prisma studio
  ```
  Zoek je user en zet `role` op `ADMIN`

### Wedstrijden Synchroniseren (Admin)
1. Ga naar `/admin` (alleen voor admins zichtbaar)
2. Klik op "Synchroniseer Wedstrijden"
3. Alle WK 2026 wedstrijden worden ingeladen
4. Druk regelmatig op refresh om uitslagen bij te werken

### Voorspellingen Doen
1. Ga naar `/matches`
2. Je ziet alle wedstrijden per ronde
3. Vul je voorspelling in (bijv. 2-1 voor Nederland-Mexico)
4. Klik "Opslaan"
5. Na aftrap kan je voorspelling niet meer gewijzigd worden

### Klassement
- Ga naar `/leaderboard`
- Zie de totale punten van alle deelnemers
- Jouw eigen rij wordt gehighlight
- Punten worden automatisch berekend na afloop van een wedstrijd

## Database

### Tabellen

**User**
- id, name, email, password (bcrypt hash), role (USER/ADMIN), createdAt

**Match**
- id, externalId (TheSportsDB ID), homeTeam, awayTeam, homeScore, awayScore, matchDate, stage, group, round, venue, status, createdAt, updatedAt

**Prediction**
- id, userId, matchId, homeScore, awayScore, points (berekend), createdAt, updatedAt
- Constraint: uniek per (userId, matchId)

### Database Beheren

Prisma Studio starten:
```bash
npx prisma studio
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Registreren
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Matches
- `GET /api/matches` - Alle wedstrijden
- `POST /api/matches` - Sync van TheSportsDB (admin only)

### Predictions
- `GET /api/predictions` - Jouw voorspellingen
- `POST /api/predictions` - Voorspelling opslaan

## Scoring Logic

Na elke match completion:
```
If home_score == predicted_home AND away_score == predicted_away:
  points = 3  (Exact correct)
Else if winner matches (home/away/draw):
  points = 2  (Correct winner)
Else:
  points = 1  (Participated)
```

## Deployment

### Lokaal
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Vercel (Aanbevolen)
1. Push naar GitHub
2. Connect repo op [vercel.com](https://vercel.com)
3. Stel environment variables in (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL)
4. Deploy

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### "Match already started"
- De wedstrijd is begonnen, je kan niet meer voorspellen
- Voorspellingen worden vergrendeld 5 minuten voor aftrap

### "Email already registered"
- Dit email adres bestaat al
- Gebruik ander email of login als bestaand account

### Database errors
```bash
npx prisma migrate reset  # Wist en herbouwt database
npx prisma db push       # Synchroniseer schema
```

## Licentie

Privé voor Dunea werknemers

## Support

Voor vragen of bugs, neem contact op met de admin
