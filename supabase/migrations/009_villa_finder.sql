-- ============================================================
-- 009_villa_finder.sql — tourism license field + villa-finder leads
-- ============================================================

-- ---------- Tourism license number ----------
alter table villas add column tourism_license_no text;

-- ---------- Villa Bulma Danışmanı: criteria-only leads ----------
-- Not tied to a specific villa (unlike reservations) — staff match a
-- villa manually and follow up by phone.
create table villa_requests (
  id            uuid primary key default gen_random_uuid(),
  region        villa_region,
  category_id   uuid references categories(id) on delete set null,
  checkin       date,
  checkout      date,
  guest_count   int,
  first_name    text not null,
  last_name     text not null,
  phone         text not null,
  handled       boolean not null default false,
  created_at    timestamptz not null default now()
);

create index idx_villa_requests_created on villa_requests (created_at desc);

alter table villa_requests enable row level security;

create policy vr_staff_all on villa_requests
  for all using (is_staff()) with check (is_staff());

-- ---------- Submit path (public, via RPC only — no direct table access) ----------
create or replace function public.create_villa_request(
  p_region      villa_region,
  p_category_id uuid,
  p_checkin     date,
  p_checkout    date,
  p_guest_count int,
  p_first_name  text,
  p_last_name   text,
  p_phone       text
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
begin
  if length(trim(coalesce(p_first_name,''))) < 2
     or length(trim(coalesce(p_last_name,''))) < 2 then
    return jsonb_build_object('ok', false, 'error', 'invalid_name');
  end if;
  if p_phone !~ '^\+?[0-9 ()-]{10,20}$' then
    return jsonb_build_object('ok', false, 'error', 'invalid_phone');
  end if;

  insert into villa_requests (
    region, category_id, checkin, checkout, guest_count,
    first_name, last_name, phone
  ) values (
    p_region, p_category_id, p_checkin, p_checkout, p_guest_count,
    trim(p_first_name), trim(p_last_name), trim(p_phone)
  ) returning id into v_id;

  return jsonb_build_object('ok', true, 'request_id', v_id);
end $$;

grant execute on function public.create_villa_request(
  villa_region, uuid, date, date, int, text, text, text
) to anon, authenticated;
