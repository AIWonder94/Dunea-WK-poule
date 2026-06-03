# WK Poule App - Project Documentation

## Overview

A complete World Cup 2026 football pool application built with Next.js 14, Prisma SQLite, and NextAuth.js. Supports 100 colleagues predicting match outcomes with automatic scoring and leaderboard.

## Key Files

- `src/lib/auth.ts` - NextAuth.js configuration with Credentials provider
- `src/lib/db.ts` - Prisma singleton client
- `src/lib/scoring.ts` - Point calculation logic (3/2/1 points)
- `src/lib/sportsdb.ts` - TheSportsDB API integration
- `prisma/schema.prisma` - Database schema (User, Match, Prediction)
- `src/app/api/auth/register/route.ts` - User registration endpoint
- `src/app/api/matches/route.ts` - Match sync from API (admin only)
- `src/app/api/predictions/route.ts` - Prediction CRUD

## Setup Instructions

```bash
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

## Creating Admin User

After registering normally via `/register`:

```bash
npx prisma studio
```

1. Open Prisma Studio in browser
2. Find your user in Users table
3. Change `role` field from "USER" to "ADMIN"
4. Close Prisma Studio

Now you can access `/admin` to sync matches.

## Database

- **SQLite** at `dev.db`
- **3 main tables**: User, Match, Prediction
- **Enums as strings** (SQLite doesn't support native enums)
- Cascade delete on Prediction when User/Match deleted

## Scoring Logic

Located in `src/lib/scoring.ts`:

```
3 pts: exact score match (home & away correct)
2 pts: correct winner/draw (same outcome, score can differ)
1 pt:  participated (any prediction submitted)
```

Recalculated when admin syncs match results via `/api/matches` POST.

## Features Implemented

- ✅ Email + password registration with bcrypt hashing
- ✅ NextAuth session management
- ✅ Protected routes (login required for /matches, /leaderboard, /admin)
- ✅ Match cards grouped by stage (Group/Knock-out)
- ✅ Prediction form (locked after match start)
- ✅ Live leaderboard with point breakdown
- ✅ Admin panel for match sync
- ✅ TheSportsDB API integration (free, no key needed)
- ✅ Automatic point calculation
- ✅ Responsive UI (Tailwind + shadcn/ui)
- ✅ Database migrations with Prisma

## Pages

| Route | Auth | Purpose |
|-------|------|---------|
| `/login` | None | Sign in |
| `/register` | None | Create account |
| `/matches` | Required | View/predict matches |
| `/matches/[id]` | Required | Match detail + predictions |
| `/leaderboard` | Required | Rankings |
| `/admin` | Admin | Sync matches & results |

## API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/register` | None | Create user |
| POST | `/api/auth/[...nextauth]` | None | NextAuth handlers |
| GET | `/api/matches` | Any | List all matches |
| POST | `/api/matches` | Admin | Sync from TheSportsDB |
| GET | `/api/predictions` | Auth | Your predictions |
| POST | `/api/predictions` | Auth | Save/update prediction |

## Environment Variables

```bash
DATABASE_URL="file:./dev.db"        # SQLite file
NEXTAUTH_SECRET="<32 random bytes>" # Generated with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
SPORTSDB_API_KEY=""                 # Optional, v2 works without
```

## TheSportsDB Integration

- Fetches WK 2026 matches from TheSportsDB v2 (free, no auth needed)
- League ID detection via API
- Parses stage (Group Stage / Knock-out / Semis / Final)
- Auto-assigns points when results are synced
- Runs on admin trigger (POST `/api/matches`)

## Building & Deployment

```bash
# Production build
npm run build
npm start

# Or deploy to Vercel
# Push to GitHub → Connect Vercel → Set env vars
```

## Testing

Manual testing performed:
- ✅ Registration endpoint creates user with bcrypt hash
- ✅ Pages render (checked /register HTML)
- ✅ Build completes with no critical errors

## Known Limitations

- TheSportsDB API has rate limiting; cache responses for production
- SQLite suitable for <10k concurrent users
- Bcryptjs warnings in Edge Runtime (not functional issue, only dev warning)
- Predictions locked 5 min before match start (not enforced client-side, server-side only)

## Extending

### Add Email Notifications
```typescript
// src/lib/email.ts
import nodemailer from 'nodemailer'
```

### Add WebSockets for Live Updates
```typescript
// src/lib/websocket.ts
import ws from 'ws'
```

### Add Image Upload for Team Logos
```typescript
// src/lib/s3.ts
import aws-sdk from 'aws-sdk'
```

## Troubleshooting

**"Database locked" errors**
```bash
rm dev.db dev.db-shm dev.db-wal
npx prisma db push
```

**"Cannot find module bcryptjs"**
```bash
npm install
```

**Predictions not updating**
- Check that match status is "FINISHED"
- Verify timestamps (match.matchDate < now())

## Security Notes

- Passwords: bcrypt with salt rounds = 10
- Sessions: NextAuth JWT (not database sessions)
- CSRF: Next.js built-in middleware
- XSS: React auto-escapes, no dangerouslySetInnerHTML used
- SQL Injection: Prisma parameterized queries
- .env never committed (added to .gitignore)
