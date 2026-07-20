-- ============================================================
-- 007_pg_cron_sync.sql — 30-minute sync trigger from Supabase
-- (RUN ON SUPABASE ONLY, after enabling extensions — see below)
--
-- Vercel Hobby allows only daily crons, so vercel.json keeps a
-- daily 03:00 UTC safety-net run and THIS drives the real
-- 30-minute cadence: pg_cron fires pg_net, which calls the
-- sync endpoint exactly like Vercel would.
--
-- BEFORE RUNNING:
--   1. Dashboard → Database → Extensions → enable  pg_cron  and  pg_net
--   2. Replace the two placeholders below.
-- ============================================================

select cron.schedule(
  'villamega-ical-sync',
  '*/30 * * * *',
  $$
  select net.http_get(
    url     := 'https://YOUR-STAGING-URL.vercel.app/api/cron/ical-sync',
    headers := '{"Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);

-- Useful afterwards:
--   select * from cron.job;                                   -- is it scheduled?
--   select * from cron.job_run_details order by start_time desc limit 5;  -- did it run?
--   select cron.unschedule('villamega-ical-sync');            -- to remove/re-create
