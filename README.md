# Villa Rental Agency Platform — Milestone 1: Database Foundation

Stack: **Next.js (App Router) · Supabase (Postgres + Auth + Storage + RLS) · Vercel · Resend (email)**.
Same stack as Konakto so the owner portal can later become Konakto with zero migration:
one database, two frontends, roles decide what you see.

## What's in this milestone

```
supabase/migrations/
  001_schema.sql     tables, enums, constraints, indexes
  002_rls.sql        row-level security: admin / editor / owner / anon
  003_functions.sql  quote_stay, create_reservation_request,
                     get_unavailable_ranges, detect_conflicts
  004_seed.sql       3 demo villas (TR+EN), 2026 season bands, sample bookings
```

### Design decisions baked in

- **Guests never write to tables.** The request form calls the
  `create_reservation_request()` RPC, which re-prices the stay server-side —
  a tampered client cannot store a fake total.
- **Double bookings are impossible at the DB layer.** A GiST exclusion
  constraint rejects overlapping *confirmed* reservations per villa.
  Back-to-back stays (checkout day = next checkin day) are allowed.
- **Deposit amounts live in `villa_internals`** (staff-only). RLS is
  row-level, not column-level, so internal money data never sits on a
  publicly-readable table. Owners don't see deposits either.
- **iCal imports block the calendar immediately**; overlaps with confirmed
  reservations are flagged in `conflicts` for human review, never auto-resolved.
- **Min-stay = the strictest season band the stay touches**, falling back to
  the villa default (3). Unpriced dates are unbookable by design.
- **Owners** see their villas, reservations (full guest details — they need
  them for KBS filing), and can block dates for personal use. They cannot
  edit content, pricing, or other people's blocks.

## Verified locally (Postgres 16, Supabase auth shim)

| # | Test | Result |
|---|------|--------|
| 1 | 7-night peak quote, Villa Defne | 151,200 + 3,500 = 154,700 ✓ |
| 2 | 3-night request in July (band min-stay 7) | rejected `min_stay` ✓ |
| 3 | Dates overlapping confirmed reservation | rejected `dates_unavailable` ✓ |
| 4 | November stay (no season band) | rejected `unpriced_dates` ✓ |
| 5 | Cross-band stay (Sep→Oct) | mixed pricing correct: 3×12k + 4×8k ✓ |
| 6 | Valid guest request via RPC | reservation created ✓ |
| 7 | Bad phone number | rejected `invalid_phone` ✓ |
| 8 | Owner block appears in public calendar | ✓ (inclusive→half-open handled) |
| 9 | Overlapping confirmed reservations | DB constraint rejects ✓ |
| 10 | Back-to-back reservations | allowed ✓ |
| 11 | anon: sees 3 active villas, 0 reservations, 0 deposits | ✓ |
| 12 | owner: own reservations only; can block own villa; cannot block others or edit prices | ✓ |
| 13 | iCal event overlapping 2 reservations → 2 conflicts flagged | ✓ |

## Applying to a real Supabase project

```bash
npx supabase init
npx supabase link --project-ref <your-ref>
npx supabase db push          # runs migrations in order
```

Then in the Supabase dashboard: create your first admin user in Auth, insert a
matching `profiles` row with `role = 'admin'`. Storage: create a public
`villas` bucket for photos (paths in `villa_photos.storage_path`).

Email on new request: Database Webhook on `reservations` INSERT → Edge
Function → Resend → your team inbox. (Wired in milestone 2.)

## Milestone 2 — Admin CMS (this drop)

Next.js app in `web/`. Routes (all Turkish-labeled, staff-only):

- `/admin/login` — team sign-in (Supabase Auth); non-staff roles are bounced
- `/admin/talepler` — reservation inbox: status filter chips, guest/villa/dates/
  amount columns, payment badges
- `/admin/talepler/[id]` — full payment breakdown (konaklama, temizlik,
  ön ödeme, girişte kalan, toplam, hasar depozitosu) + status & payment-status
  flow + notes. Confirming dates that collide with another confirmed booking
  surfaces the DB constraint as a readable Turkish error.
- `/admin/villalar` — villa list with publish status
- `/admin/villalar/yeni` + `/admin/villalar/[id]` — core fields, TR/EN content,
  photo upload to Supabase Storage with cover + reorder + delete, season-band
  editor (overlaps rejected with a readable error), iCal feed manager with the
  villa's export URL ready to paste into Airbnb/Booking

`supabase/functions/notify-request/` — edge function emailing the team via
Resend on each new site request (wire as a Database Webhook on INSERT into
`reservations`; secrets: `RESEND_API_KEY`, `NOTIFY_TO`, `NOTIFY_FROM`, `SITE_URL`).

Setup: `cd web && cp .env.example .env.local` (fill in project URL + anon key),
`npm install && npm run dev`. Create the public `villas` Storage bucket first.

Verified: `next build` passes with strict TypeScript; quote breakdown matches
the reference widget (48.000 / 6.000 / 9.600 / 44.400 / 54.000 / 20.000).

## Milestone 3 — Public site (this drop)

Villamega brand system: deep navy (#16294D) from the logo, brass accent,
Cormorant Garamond display + Karla body (self-hosted via Fontsource, no
external font requests). Signature element: the omega arch — villa cover
photos and region cards use arch-top masks echoing the logo mark.

Routes (TR default at `/tr`, English at `/en`; `/` redirects to `/tr`):

- `/{locale}` — hero, region cards, featured villas
- `/{locale}/villalar` — listing with region filter chips (ISR, 5 min)
- `/{locale}/villalar/[slug]` — arch gallery, amenities, seasonal price table,
  and the booking widget: interactive availability calendar (blocked dates
  struck through, fed by `get_unavailable_ranges`), live quote on date
  selection via `quote_stay` (konaklama → temizlik → ÖZET → ön ödeme →
  girişte kalan → toplam → hasar depozitosu note, matching the market-standard
  layout), then name/surname/phone → `create_reservation_request`. All errors
  (min-stay, dolu, satışa kapalı) localized.
- `/{locale}/sayfa/[slug]` — CMS pages (hakkımızda, kiralama şartları)
- `/api/ical/[slug].ics` — per-villa export feed built from
  `get_export_ranges` (005): confirmed reservations + manual blocks ONLY.
  Imported events are excluded by design to prevent cross-platform echo loops.

## Milestone 4 — iCal import worker (this drop)

- `web/src/lib/ical.ts` — dependency-free RFC 5545 parser (line unfolding,
  VALUE=DATE and DATE-TIME, missing DTEND → 1 day, missing UID → deterministic
  fallback, malformed events dropped). 10/10 tests in `web/scripts/test-ical.ts`
  (`node --experimental-strip-types scripts/test-ical.ts`).
- `/api/cron/ical-sync` — Vercel Cron hits it every 30 min (`vercel.json`),
  guarded by `CRON_SECRET`. Per feed: fetch (15 s timeout) → parse → upsert by
  (feed_id, uid) → prune uids the source no longer publishes (cancellations
  free the calendar) → `detect_conflicts` → status bookkeeping. A failing
  fetch NEVER prunes — a dead feed cannot wipe availability. After 3
  consecutive failures the team gets a Resend email; every new conflict
  emails immediately.
- `/admin/cakismalar` — open conflicts with villa, confirmed guest, external
  event and platform, one-click "Çözüldü işaretle"; red count badge in the
  sidebar nav.

Verified via simulated sync cycles against the seeded DB: import blocks
calendar, conflict flagged once (idempotent), cancellation prune frees dates,
export feed never echoes imported events.

## Deploy & environment

Vercel project env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only),
`CRON_SECRET` (random string), `RESEND_API_KEY`, `NOTIFY_TO`, `NOTIFY_FROM`.
Supabase: run migrations 001–005, create public `villas` Storage bucket,
create staff users + `profiles` rows, wire the `notify-request` webhook.

## Launch gate — UAT checklist (staging, before DNS)

1. Seed 3–5 real villas with photos, seasons, real iCal URLs.
2. Frontend: Lighthouse mobile ≥ 90 on /tr, /tr/villalar, one detail page;
   real-device pass (mid-range Android + iPhone); TR/EN switch on every page.
3. Booking flow: pick dates around a blocked range → quote matches the
   seasonal math by hand → submit → email arrives → record in
   /admin/talepler as Yeni → confirm it → dates go dark on the site within
   one ISR window (≤ 5 min).
4. Double-booking drill: confirm overlapping dates from a second request →
   panel shows the Turkish constraint error, DB stays clean.
5. iCal in: add a controlled test .ics, run the cron URL manually with the
   secret, verify events land, edit the file, re-run, verify update + prune.
6. iCal out: validate `/api/ical/<slug>.ics` at icalendar.org validator,
   subscribe from Google Calendar, then from a real Airbnb test listing.
7. Conflict drill: craft an overlap → red badge + email → resolve.
8. Dead feed drill: point a feed at a 404 → 3 manual runs → alert email,
   events from previous good sync still intact.
9. RLS spot-check with an owner account: sees own villa + reservations only,
   can block own dates, cannot see other villas or edit prices.

## Next milestone

5. **Owner portal** — thin Konakto-compatible view: owner calendar,
   reservation list with guest details for KBS, personal-use date blocking.
