-- ============================================================
-- 008_villa_categories.sql — Villa type/category taxonomy
-- Mirrors the amenities pattern: categories + translations + a
-- villa_categories junction. Also adds search_villas(), the single
-- RPC the homepage search widget and /villalar listing both call —
-- it folds region/category/capacity/date-availability filtering
-- into one query instead of layering client-side joins.
-- ============================================================

-- ---------- Schema ----------
create table categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  icon       text not null,   -- matches an icon key in the frontend's VillaTypes icon map
  sort_order int not null default 0
);

create table category_translations (
  category_id uuid not null references categories(id) on delete cascade,
  locale      app_locale not null,
  label       text not null,
  primary key (category_id, locale)
);

create table villa_categories (
  villa_id    uuid not null references villas(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (villa_id, category_id)
);

create index idx_villa_categories_category on villa_categories (category_id);

-- ---------- RLS ----------
alter table categories           enable row level security;
alter table category_translations enable row level security;
alter table villa_categories     enable row level security;

create policy cat_read  on categories for select using (true);
create policy cat_write on categories for all using (is_staff()) with check (is_staff());

create policy catt_read  on category_translations for select using (true);
create policy catt_write on category_translations for all using (is_staff()) with check (is_staff());

create policy vc_read on villa_categories for select using (
  is_staff()
  or exists (select 1 from villas v where v.id = villa_id
             and (v.status = 'active' or v.owner_id = auth.uid()))
);
create policy vc_write on villa_categories for all using (is_staff()) with check (is_staff());

-- ---------- Seed: the 12 categories shown on the homepage ----------
insert into categories (id, slug, icon, sort_order) values
  ('c0000000-0000-0000-0000-000000000001', 'kalabalik-ailelere-uygun', 'family',      1),
  ('c0000000-0000-0000-0000-000000000002', 'evcil-hayvan-izinli',      'paw',         2),
  ('c0000000-0000-0000-0000-000000000003', 'bungalov-villalar',        'bungalow',    3),
  ('c0000000-0000-0000-0000-000000000004', 'aktiviteli-villalar',      'activity',    4),
  ('c0000000-0000-0000-0000-000000000005', 'luks-villalar',            'crown',       5),
  ('c0000000-0000-0000-0000-000000000006', 'isitmali-havuzlu-villalar','heated-pool', 6),
  ('c0000000-0000-0000-0000-000000000007', 'ekonomik',                 'tag',         7),
  ('c0000000-0000-0000-0000-000000000008', 'balayi',                   'heart',       8),
  ('c0000000-0000-0000-0000-000000000009', 'cocuk-havuzlu',            'duck',        9),
  ('c0000000-0000-0000-0000-00000000000a', 'deniz-manzarali',          'sea-view',   10),
  ('c0000000-0000-0000-0000-00000000000b', 'muhafazakar-korunakli',    'shield',     11),
  ('c0000000-0000-0000-0000-00000000000c', 'jakuzili',                 'jacuzzi',    12);

insert into category_translations (category_id, locale, label) values
  ('c0000000-0000-0000-0000-000000000001', 'tr', 'Kalabalık Ailelere Uygun'),
  ('c0000000-0000-0000-0000-000000000001', 'en', 'Great for Large Families'),
  ('c0000000-0000-0000-0000-000000000002', 'tr', 'Evcil Hayvan İzinli'),
  ('c0000000-0000-0000-0000-000000000002', 'en', 'Pet-Friendly'),
  ('c0000000-0000-0000-0000-000000000003', 'tr', 'Bungalov Villalar'),
  ('c0000000-0000-0000-0000-000000000003', 'en', 'Bungalow Villas'),
  ('c0000000-0000-0000-0000-000000000004', 'tr', 'Aktiviteli Villalar'),
  ('c0000000-0000-0000-0000-000000000004', 'en', 'Villas with Activities'),
  ('c0000000-0000-0000-0000-000000000005', 'tr', 'Lüks Villalar'),
  ('c0000000-0000-0000-0000-000000000005', 'en', 'Luxury Villas'),
  ('c0000000-0000-0000-0000-000000000006', 'tr', 'Isıtmalı Havuzlu Villalar'),
  ('c0000000-0000-0000-0000-000000000006', 'en', 'Heated Pool Villas'),
  ('c0000000-0000-0000-0000-000000000007', 'tr', 'Ekonomik'),
  ('c0000000-0000-0000-0000-000000000007', 'en', 'Budget-Friendly'),
  ('c0000000-0000-0000-0000-000000000008', 'tr', 'Balayı'),
  ('c0000000-0000-0000-0000-000000000008', 'en', 'Honeymoon'),
  ('c0000000-0000-0000-0000-000000000009', 'tr', 'Çocuk Havuzlu'),
  ('c0000000-0000-0000-0000-000000000009', 'en', 'Kids'' Pool'),
  ('c0000000-0000-0000-0000-00000000000a', 'tr', 'Deniz Manzaralı'),
  ('c0000000-0000-0000-0000-00000000000a', 'en', 'Sea View'),
  ('c0000000-0000-0000-0000-00000000000b', 'tr', 'Muhafazakâr (Korunaklı)'),
  ('c0000000-0000-0000-0000-00000000000b', 'en', 'Secluded & Private'),
  ('c0000000-0000-0000-0000-00000000000c', 'tr', 'Jakuzili'),
  ('c0000000-0000-0000-0000-00000000000c', 'en', 'Jacuzzi');

-- Demo assignments on the 3 seed villas, so the filters have something to show.
insert into villa_categories (villa_id, category_id) values
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'), -- Defne: large families
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005'), -- Defne: luxury
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006'), -- Defne: heated pool
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000a'), -- Poyraz: sea view
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000008'), -- Poyraz: honeymoon
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-00000000000c'), -- Meltem: jacuzzi
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004'); -- Meltem: activities

-- ---------- Search RPC ----------
-- Every filter is optional (null = ignore). Date availability reuses the
-- same blocked-range logic as get_unavailable_ranges so the homepage
-- widget and the per-villa calendar never disagree about what's free.
create or replace function public.search_villas(
  p_region        villa_region default null,
  p_category_slug text default null,
  p_min_capacity  int default null,
  p_checkin       date default null,
  p_checkout      date default null
) returns setof villas
language sql stable security definer set search_path = public
as $$
  select v.* from villas v
  where v.status = 'active'
    and (p_region is null or v.region = p_region)
    and (p_min_capacity is null or v.capacity >= p_min_capacity)
    and (
      p_category_slug is null or exists (
        select 1 from villa_categories vc
        join categories c on c.id = vc.category_id
        where vc.villa_id = v.id and c.slug = p_category_slug
      )
    )
    and (
      p_checkin is null or p_checkout is null or not exists (
        select 1 from get_unavailable_ranges(v.id) u
        where daterange(u.start_date, u.end_date, '[)')
           && daterange(p_checkin, p_checkout, '[)')
      )
    )
  order by v.created_at asc;
$$;

grant execute on function public.search_villas(villa_region, text, int, date, date) to anon, authenticated;
