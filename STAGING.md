# STAGING.md — Villamega staging setup runbook

Ordered so every step has a visible check before the next. Budget ~1.5–2 hours.
Accounts, API keys, and passwords are yours to create and enter — keep them
out of the repo and out of chat.

## 0. Prerequisites

- GitHub repo containing this project (push the zip contents)
- Accounts: Supabase (free tier fine), Vercel (Hobby fine), Resend (free tier)
- Node 20+ locally for the smoke test

## 1. Supabase project

1. Create a new project, e.g. `villamega-staging`, region **eu-central-1**
   (Frankfurt — closest to TR traffic among Supabase regions).
2. SQL Editor → paste and run the migrations **in order**:
   `001_schema.sql` → `002_rls.sql` → `003_functions.sql` → `004_seed.sql`
   (seed = demo data, fine for staging) → `005_export_ranges.sql` →
   `006_storage.sql`.
   ✅ Check: Table Editor shows `villas` with 3 rows; Storage shows `villas` bucket.
3. Project Settings → API: note the **Project URL**, **anon key**, and
   **service_role key** (the last one is server-only — it never goes in any
   `NEXT_PUBLIC_*` variable).

## 2. Staff user

1. Authentication → Users → Add user → your e-mail + a password
   (auto-confirm on).
2. Copy the new user's UUID, then in SQL Editor:
   ```sql
   insert into profiles (id, role, full_name)
   values ('PASTE-UUID-HERE', 'admin', 'Adınız Soyadınız');
   ```
   ✅ Check: `select * from profiles;` shows your row with role `admin`.

## 3. E-mail (Resend)

1. Resend → create API key. For staging you can send from
   `onboarding@resend.dev` to your own address without domain verification;
   verify `villamega.com` later for production.
2. Supabase CLI (one-time, from the repo root):
   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase functions deploy notify-request --no-verify-jwt
   npx supabase secrets set RESEND_API_KEY=re_xxx NOTIFY_TO=you@example.com \
     NOTIFY_FROM="Villamega <onboarding@resend.dev>" SITE_URL=https://YOUR-STAGING-URL
   ```
3. Dashboard → Database → Webhooks → Create:
   table `reservations`, event **INSERT**, type **Supabase Edge Function**,
   function `notify-request`.
   ✅ Check: Table Editor → insert a dummy row into `reservations` with
   status `yeni`, source `site` → e-mail arrives → delete the dummy row.

## 4. Vercel project

1. Import the GitHub repo. **Root Directory: `web`** (critical — the Next app
   lives there). Framework auto-detects.
2. Environment variables (all environments):
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
   | `NEXT_PUBLIC_SITE_URL` | the Vercel URL after first deploy |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
   | `CRON_SECRET` | output of `openssl rand -hex 24` |
   | `RESEND_API_KEY` / `NOTIFY_TO` / `NOTIFY_FROM` | as in step 3 |
3. Deploy. Then set `NEXT_PUBLIC_SITE_URL` to the real URL and redeploy.
   ✅ Check: the URL shows the Villamega home; `/admin/login` accepts the
   staff user from step 2.
4. Cron: `web/vercel.json` registers `/api/cron/ical-sync` every 30 min —
   visible under Project → Settings → Cron Jobs. Note: Vercel cron fires on
   the **production deployment** of the project, which for a dedicated
   staging project is exactly this deploy. Trigger one run manually:
   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://YOUR-STAGING-URL/api/cron/ical-sync
   ```
   ✅ Check: JSON report; the seeded placeholder Airbnb feed will show an
   error entry — that's the failure path working. Replace it with a real
   feed URL in the panel when ready.

## 5. Automated smoke test

```bash
cd web
STAGING_URL=https://YOUR-STAGING-URL \
SUPABASE_URL=https://YOUR-PROJECT.supabase.co \
SUPABASE_ANON_KEY=eyJ... \
node scripts/smoke-staging.mjs
```
Expected: `ALL CHECKS PASSED` (~12 checks: site up, both locales, RLS front
and back door, quote engine incl. math, request-form validation, iCal export
format, admin + cron auth guards).

## 6. Manual UAT (the parts a script can't judge)

Run the 9-step launch-gate checklist in README.md on staging — the visual/
device passes, the booking round-trip with a real e-mail, the double-booking
drill, Google Calendar + Airbnb subscribing to the export feed, the conflict
and dead-feed drills, and the owner RLS spot-check (needs one owner user:
same as step 2 but role `owner`, then set a villa's `owner_id` to that UUID).

## 7. Production later (for reference, don't do now)

Second Supabase project + second Vercel project (`villamega-prod`), same
steps minus the seed (skip `004_seed.sql`), domain `villamega.com` on Vercel,
verified sending domain on Resend, and a fresh `CRON_SECRET`.
