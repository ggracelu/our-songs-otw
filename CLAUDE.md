@AGENTS.md

# Our Songs OTW (Songs of the Week)

A social music memory tracker. Pick one song each week. See what your friends picked. 52 weeks. 52 songs. Share your year.

## Tech Stack
- Next.js 16.2.2 (App Router, `src/app/`)
- React 19 + TypeScript (strict)
- Tailwind CSS v4 (no `tailwind.config.js` — uses `@theme inline` in `globals.css`)
- Auth: Clerk (`@clerk/nextjs` v6)
- Database: Supabase (Postgres + RLS)
- Music API: MusicBrainz + Cover Art Archive (no Spotify)
- Deployment: Vercel

## Development
```
npm run dev     # Dev server on localhost:3000
npm run build   # Production build
npm run lint    # ESLint
```

## Routes
| Route | Page | Auth |
|---|---|---|
| `/` | Home — 52-week calendar grid | Yes |
| `/add` | Add/edit song form with MusicBrainz search | Yes |
| `/week/[number]` | Week detail with album art | Yes |
| `/playlist` | Year-in-review playlist with HM toggle | Yes |
| `/stats` | Stats: top artist, season breakdown, streak, completion | Yes |
| `/immerse` | Immersive scroll view | Yes |
| `/feed` | Friends feed — what your friends picked | Yes |
| `/u/[username]` | Public profile page | No (if public) |
| `/onboarding` | Username selection on first sign-in | Yes |
| `/sign-in` | Clerk sign-in | No |
| `/sign-up` | Clerk sign-up | No |

## Data Model (`src/lib/types.ts`)
- `WeekEntry`: id, weekNumber, date, songTitle, artist, comment, honorableMentions[], season, albumArt?, musicbrainzRecordingId?, musicbrainzReleaseId?
- `HonorableMention`: id, songTitle, artist, comment?, albumArt?, musicbrainzRecordingId?
- `Profile`: id, clerkId, username, displayName, avatarUrl, bio, isPublic
- `Season`: "winter" | "spring" | "summer" | "autumn"

## Architecture
- `src/components/EntriesProvider.tsx` — Supabase-backed state context for week entries
- `src/lib/supabase.ts` — Server-side Supabase client with Clerk JWT auth
- `src/lib/supabase-browser.ts` — Browser-side Supabase client
- `src/lib/musicbrainz.ts` — MusicBrainz API types + helpers
- `src/lib/utils.ts` — date/season helpers
- `src/middleware.ts` — Clerk auth middleware
- Path alias: `@/*` → `./src/*`

## Supabase Tables
- `profiles` — user profiles synced from Clerk
- `week_entries` — one song per user per week (UNIQUE user_id + year + week_number)
- `honorable_mentions` — additional songs per week entry
- `follows` — asymmetric follow relationships
