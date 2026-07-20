-- ============================================================
-- 001_schema.sql — Villa Rental Agency Platform (core schema)
-- Postgres 15+ / Supabase
-- ============================================================

create extension if not exists btree_gist;  -- for date-range exclusion constraints

-- ---------- Enums ----------
create type user_role          as enum ('admin', 'editor', 'owner');
create type villa_status       as enum ('draft', 'active', 'hidden');
create type app_locale         as enum ('tr', 'en');
create type reservation_status as enum ('yeni', 'iletisimde', 'onaylandi', 'iptal', 'tamamlandi');
create type payment_status     as enum ('yok', 'kapora_linki_gonderildi', 'kapora_alindi', 'tamamlandi');
create type reservation_source as enum ('site', 'manuel', 'telefon');
create type villa_region       as enum ('fethiye', 'kas', 'kalkan');

-- ---------- Profiles (extends auth.users) ----------
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null default 'owner',
  full_name   text not null,
  phone       text,
  created_at  timestamptz not null default now()
);

-- ---------- Villas ----------
create table villas (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid references profiles(id) on delete set null,
  slug             text not null unique,
  region           villa_region not null,
  capacity         int  not null check (capacity > 0),
  bedrooms         int  not null check (bedrooms > 0),
  bathrooms        int  not null check (bathrooms > 0),
  default_min_stay int  not null default 3 check (default_min_stay > 0),
  cleaning_fee     numeric(10,2) not null default 0,
  deposit_amount   numeric(10,2) not null default 0,  -- hasar depozitosu, shown to guests as info line
  prepayment_pct   int not null default 20 check (prepayment_pct between 0 and 100),
  status           villa_status not null default 'draft',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_villas_status_region on villas (status, region);
create index idx_villas_owner on villas (owner_id);

create table villa_translations (
  villa_id    uuid not null references villas(id) on delete cascade,
  locale      app_locale not null,
  title       text not null,
  description text not null default '',
  seo_title   text,
  seo_desc    text,
  primary key (villa_id, locale)
);

create table villa_photos (
  id           uuid primary key default gen_random_uuid(),
  villa_id     uuid not null references villas(id) on delete cascade,
  storage_path text not null,
  alt_text     text,
  sort_order   int not null default 0
);

create index idx_photos_villa on villa_photos (villa_id, sort_order);

-- ---------- Amenities ----------
create table amenities (
  id   uuid primary key default gen_random_uuid(),
  icon text not null  -- lucide icon name, e.g. 'waves', 'wifi'
);

create table amenity_translations (
  amenity_id uuid not null references amenities(id) on delete cascade,
  locale     app_locale not null,
  label      text not null,
  primary key (amenity_id, locale)
);

create table villa_amenities (
  villa_id   uuid not null references villas(id) on delete cascade,
  amenity_id uuid not null references amenities(id) on delete cascade,
  primary key (villa_id, amenity_id)
);

-- ---------- Seasonal pricing ----------
-- One row per season band. Bands for the same villa may not overlap.
create table price_seasons (
  id            uuid primary key default gen_random_uuid(),
  villa_id      uuid not null references villas(id) on delete cascade,
  label         text,                        -- e.g. 'Yaz 2026 Pik'
  start_date    date not null,
  end_date      date not null,               -- inclusive
  nightly_price numeric(10,2) not null check (nightly_price > 0),
  min_stay      int check (min_stay > 0),    -- null → fall back to villa default
  check (end_date >= start_date),
  exclude using gist (
    villa_id with =,
    daterange(start_date, end_date, '[]') with &&
  )
);

create index idx_seasons_villa on price_seasons (villa_id, start_date);

-- ---------- Reservations ----------
create table reservations (
  id                  uuid primary key default gen_random_uuid(),
  villa_id            uuid not null references villas(id) on delete restrict,
  status              reservation_status not null default 'yeni',
  guest_first_name    text not null,
  guest_last_name     text not null,
  guest_phone         text not null,
  checkin             date not null,
  checkout            date not null,
  nights              int generated always as (checkout - checkin) stored,
  accommodation_total numeric(10,2) not null,
  cleaning_fee        numeric(10,2) not null default 0,
  grand_total         numeric(10,2) not null,
  payment_status      payment_status not null default 'yok',
  source              reservation_source not null default 'site',
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (checkout > checkin),
  -- Two CONFIRMED reservations can never overlap on the same villa.
  -- (checkout day is exclusive: back-to-back stays are allowed.)
  exclude using gist (
    villa_id with =,
    daterange(checkin, checkout, '[)') with &&
  ) where (status = 'onaylandi')
);

create index idx_res_villa_dates on reservations (villa_id, checkin, checkout);
create index idx_res_status on reservations (status, created_at desc);

-- ---------- Manual calendar blocks ----------
create table calendar_blocks (
  id         uuid primary key default gen_random_uuid(),
  villa_id   uuid not null references villas(id) on delete cascade,
  start_date date not null,
  end_date   date not null,  -- inclusive
  reason     text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index idx_blocks_villa on calendar_blocks (villa_id, start_date);

-- ---------- iCal ----------
create table ical_feeds (
  id             uuid primary key default gen_random_uuid(),
  villa_id       uuid not null references villas(id) on delete cascade,
  platform       text not null,  -- 'airbnb' | 'booking' | 'villavillam' | 'villasepeti' | 'hepsivilla' | ...
  url            text not null,
  last_synced_at timestamptz,
  last_status    text,           -- 'ok' | 'error: ...'
  error_count    int not null default 0,
  created_at     timestamptz not null default now(),
  unique (villa_id, url)
);

create table ical_events (
  id         uuid primary key default gen_random_uuid(),
  feed_id    uuid not null references ical_feeds(id) on delete cascade,
  uid        text not null,   -- iCal UID from the source event
  dtstart    date not null,
  dtend      date not null,   -- exclusive, per iCal convention
  summary    text,
  raw_hash   text not null,   -- change detection
  updated_at timestamptz not null default now(),
  unique (feed_id, uid)
);

create index idx_ical_events_feed on ical_events (feed_id, dtstart);

-- ---------- Conflicts (import overlaps a confirmed reservation) ----------
create table conflicts (
  id             uuid primary key default gen_random_uuid(),
  villa_id       uuid not null references villas(id) on delete cascade,
  reservation_id uuid not null references reservations(id) on delete cascade,
  ical_event_id  uuid not null references ical_events(id) on delete cascade,
  detected_at    timestamptz not null default now(),
  resolved_at    timestamptz,
  unique (reservation_id, ical_event_id)
);

-- ---------- CMS pages ----------
create table pages (
  id   uuid primary key default gen_random_uuid(),
  slug text not null unique  -- 'hakkimizda', 'kiralama-sartlari', 'iletisim'
);

create table page_translations (
  page_id uuid not null references pages(id) on delete cascade,
  locale  app_locale not null,
  title   text not null,
  body    text not null default '',
  primary key (page_id, locale)
);

-- ---------- updated_at triggers ----------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_villas_updated before update on villas
  for each row execute function set_updated_at();
create trigger trg_res_updated before update on reservations
  for each row execute function set_updated_at();
