-- ============================================================
-- 013_villa_distances.sql — "Ulaşım Bilgisi" distance widget
-- Mirrors the categories pattern: a small fixed catalog of distance
-- types (airport, beach, market, ...) + translations, plus a
-- per-villa junction that additionally carries the km value and an
-- optional free-text note (e.g. which airport). Also adds villas.map_url
-- for the widget's "Haritada Göster" button.
-- ============================================================

-- ---------- Schema ----------
alter table villas add column map_url text;

create table distance_types (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  icon       text not null,   -- matches an icon key in the frontend's distanceIcons map
  sort_order int not null default 0
);

create table distance_type_translations (
  distance_type_id uuid not null references distance_types(id) on delete cascade,
  locale           app_locale not null,
  label            text not null,
  primary key (distance_type_id, locale)
);

create table villa_distances (
  villa_id         uuid not null references villas(id) on delete cascade,
  distance_type_id uuid not null references distance_types(id) on delete cascade,
  km               numeric(6,1) not null check (km >= 0),
  note             text,
  primary key (villa_id, distance_type_id)
);

create index idx_villa_distances_type on villa_distances (distance_type_id);

-- ---------- RLS ----------
alter table distance_types             enable row level security;
alter table distance_type_translations enable row level security;
alter table villa_distances            enable row level security;

create policy dt_read  on distance_types for select using (true);
create policy dt_write on distance_types for all using (is_staff()) with check (is_staff());

create policy dtt_read  on distance_type_translations for select using (true);
create policy dtt_write on distance_type_translations for all using (is_staff()) with check (is_staff());

create policy vd_read on villa_distances for select using (
  is_staff()
  or exists (select 1 from villas v where v.id = villa_id
             and (v.status = 'active' or v.owner_id = auth.uid()))
);
create policy vd_write on villa_distances for all using (is_staff()) with check (is_staff());

-- ---------- Seed: the standard distance rows shown on every villa page ----------
insert into distance_types (id, slug, icon, sort_order) values
  ('d0000000-0000-0000-0000-000000000001', 'havalimani',      'airport',    1),
  ('d0000000-0000-0000-0000-000000000002', 'plaj',            'beach',      2),
  ('d0000000-0000-0000-0000-000000000003', 'market',          'market',     3),
  ('d0000000-0000-0000-0000-000000000004', 'restoran',        'restaurant', 4),
  ('d0000000-0000-0000-0000-000000000005', 'saglik-merkezi',  'health',     5),
  ('d0000000-0000-0000-0000-000000000006', 'sehir-merkezi',   'city',       6);

insert into distance_type_translations (distance_type_id, locale, label) values
  ('d0000000-0000-0000-0000-000000000001', 'tr', 'Havalimanı'),
  ('d0000000-0000-0000-0000-000000000001', 'en', 'Airport'),
  ('d0000000-0000-0000-0000-000000000002', 'tr', 'Plaj'),
  ('d0000000-0000-0000-0000-000000000002', 'en', 'Beach'),
  ('d0000000-0000-0000-0000-000000000003', 'tr', 'Market'),
  ('d0000000-0000-0000-0000-000000000003', 'en', 'Market'),
  ('d0000000-0000-0000-0000-000000000004', 'tr', 'Restaurant'),
  ('d0000000-0000-0000-0000-000000000004', 'en', 'Restaurant'),
  ('d0000000-0000-0000-0000-000000000005', 'tr', 'Sağlık Merkezi'),
  ('d0000000-0000-0000-0000-000000000005', 'en', 'Health Center'),
  ('d0000000-0000-0000-0000-000000000006', 'tr', 'Şehir Merkezi'),
  ('d0000000-0000-0000-0000-000000000006', 'en', 'City Center');

-- Demo values on the 3 seed villas, so the widget has something to show.
insert into villa_distances (villa_id, distance_type_id, km, note) values
  ('b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 125, 'Dalaman'),
  ('b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 4, null),
  ('b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 1, null),
  ('b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 2, null),
  ('b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000005', 4, null),
  ('b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000006', 3, null);
