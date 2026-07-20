-- ============================================================
-- 002_rls.sql — Row Level Security
-- Roles: admin (everything), editor (content + reservations),
--        owner (read own villas, manage own blocks), anon (public site)
-- Guests never write directly: the request form goes through the
-- create_reservation_request() RPC in 003_functions.sql.
-- ============================================================

-- Helper: current user's app role (bypasses RLS on profiles safely)
create or replace function public.current_app_role()
returns user_role
language sql stable security definer set search_path = public
as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(current_app_role() in ('admin', 'editor'), false)
$$;

create or replace function public.owns_villa(v_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from villas where id = v_id and owner_id = auth.uid()
  )
$$;

-- ---------- Enable RLS everywhere ----------
alter table profiles           enable row level security;
alter table villas             enable row level security;
alter table villa_translations enable row level security;
alter table villa_photos       enable row level security;
alter table amenities          enable row level security;
alter table amenity_translations enable row level security;
alter table villa_amenities    enable row level security;
alter table price_seasons      enable row level security;
alter table reservations       enable row level security;
alter table calendar_blocks    enable row level security;
alter table ical_feeds         enable row level security;
alter table ical_events        enable row level security;
alter table conflicts          enable row level security;
alter table pages              enable row level security;
alter table page_translations  enable row level security;

-- ---------- profiles ----------
create policy profiles_self_read on profiles
  for select using (id = auth.uid() or is_staff());
create policy profiles_admin_write on profiles
  for all using (current_app_role() = 'admin');

-- ---------- villas ----------
-- Public sees active villas only; owners see their own in any status; staff sees all.
create policy villas_public_read on villas
  for select using (
    status = 'active' or is_staff() or owner_id = auth.uid()
  );
create policy villas_staff_write on villas
  for insert with check (is_staff());
create policy villas_staff_update on villas
  for update using (is_staff());
create policy villas_admin_delete on villas
  for delete using (current_app_role() = 'admin');

-- ---------- content tables: public read (via active villa), staff write ----------
create policy vt_read on villa_translations for select using (
  is_staff()
  or exists (select 1 from villas v where v.id = villa_id
             and (v.status = 'active' or v.owner_id = auth.uid()))
);
create policy vt_write on villa_translations for all using (is_staff()) with check (is_staff());

create policy vp_read on villa_photos for select using (
  is_staff()
  or exists (select 1 from villas v where v.id = villa_id
             and (v.status = 'active' or v.owner_id = auth.uid()))
);
create policy vp_write on villa_photos for all using (is_staff()) with check (is_staff());

create policy am_read  on amenities for select using (true);
create policy am_write on amenities for all using (is_staff()) with check (is_staff());
create policy amt_read  on amenity_translations for select using (true);
create policy amt_write on amenity_translations for all using (is_staff()) with check (is_staff());

create policy va_read on villa_amenities for select using (
  is_staff()
  or exists (select 1 from villas v where v.id = villa_id
             and (v.status = 'active' or v.owner_id = auth.uid()))
);
create policy va_write on villa_amenities for all using (is_staff()) with check (is_staff());

-- Season prices are public: the site shows the seasonal price table.
create policy ps_read on price_seasons for select using (
  is_staff()
  or exists (select 1 from villas v where v.id = villa_id
             and (v.status = 'active' or v.owner_id = auth.uid()))
);
create policy ps_write on price_seasons for all using (is_staff()) with check (is_staff());

-- ---------- reservations ----------
-- Staff: full access. Owners: READ ONLY on their villas (they need guest
-- name/phone/dates for KBS filing). No anon access; inserts go through RPC.
create policy res_staff_all on reservations
  for all using (is_staff()) with check (is_staff());
create policy res_owner_read on reservations
  for select using (owns_villa(villa_id));

-- ---------- calendar_blocks ----------
-- Staff: full. Owners: read + create + delete their own blocks on their villas
-- (personal-use blocking) — but cannot touch staff-created blocks.
create policy blocks_staff_all on calendar_blocks
  for all using (is_staff()) with check (is_staff());
create policy blocks_owner_read on calendar_blocks
  for select using (owns_villa(villa_id));
create policy blocks_owner_insert on calendar_blocks
  for insert with check (owns_villa(villa_id) and created_by = auth.uid());
create policy blocks_owner_delete on calendar_blocks
  for delete using (owns_villa(villa_id) and created_by = auth.uid());

-- ---------- iCal ----------
create policy feeds_staff_all on ical_feeds
  for all using (is_staff()) with check (is_staff());
create policy feeds_owner_read on ical_feeds
  for select using (owns_villa(villa_id));

create policy events_staff_all on ical_events
  for all using (is_staff()) with check (is_staff());
create policy events_owner_read on ical_events
  for select using (
    exists (select 1 from ical_feeds f where f.id = feed_id and owns_villa(f.villa_id))
  );

create policy conflicts_staff_all on conflicts
  for all using (is_staff()) with check (is_staff());
create policy conflicts_owner_read on conflicts
  for select using (owns_villa(villa_id));

-- ---------- pages ----------
create policy pages_read  on pages for select using (true);
create policy pages_write on pages for all using (is_staff()) with check (is_staff());
create policy pt_read  on page_translations for select using (true);
create policy pt_write on page_translations for all using (is_staff()) with check (is_staff());
