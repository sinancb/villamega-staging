-- ============================================================
-- 012_customer_auth.sql — Passwordless customer accounts
-- Requires 011_customer_role.sql to already be committed (adds
-- the 'customer' enum value this file uses).
-- Auto-provisions a profiles row on signup, and links
-- reservations/villa_requests to the submitting customer (when
-- logged in — anonymous submits still work, customer_id is
-- nullable).
-- ============================================================

-- ---------- Auto-create a profiles row for every new auth user ----------
-- Staff/owner accounts are still created manually in the dashboard; an
-- admin can bump their role after creation. full_name has no UI to
-- collect it yet, so we fall back to the email's local part.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into profiles (id, role, full_name)
  values (new.id, 'customer', coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Link customer submissions to their account ----------
alter table reservations    add column if not exists customer_id uuid references profiles(id) on delete set null;
alter table villa_requests  add column if not exists customer_id uuid references profiles(id) on delete set null;

create index if not exists idx_reservations_customer   on reservations (customer_id);
create index if not exists idx_villa_requests_customer  on villa_requests (customer_id);

-- ---------- RLS: customers can read their own rows ----------
create policy res_customer_read on reservations
  for select using (customer_id = auth.uid());
create policy vr_customer_read on villa_requests
  for select using (customer_id = auth.uid());

-- ---------- RPCs: stamp customer_id = auth.uid() when logged in ----------
-- Same signatures as before (see 003_functions.sql / 009_villa_finder.sql)
-- so existing grants and call sites are untouched.
create or replace function public.create_reservation_request(
  p_villa_id   uuid,
  p_checkin    date,
  p_checkout   date,
  p_first_name text,
  p_last_name  text,
  p_phone      text
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_quote jsonb;
  v_id    uuid;
begin
  if length(trim(coalesce(p_first_name,''))) < 2
     or length(trim(coalesce(p_last_name,''))) < 2 then
    return jsonb_build_object('ok', false, 'error', 'invalid_name');
  end if;
  if p_phone !~ '^\+?[0-9 ()-]{10,20}$' then
    return jsonb_build_object('ok', false, 'error', 'invalid_phone');
  end if;

  v_quote := quote_stay(p_villa_id, p_checkin, p_checkout);
  if not (v_quote->>'ok')::boolean then
    return v_quote;  -- bubble up the localized error key
  end if;

  insert into reservations (
    villa_id, status, guest_first_name, guest_last_name, guest_phone,
    checkin, checkout, accommodation_total, cleaning_fee, grand_total, source,
    customer_id
  ) values (
    p_villa_id, 'yeni', trim(p_first_name), trim(p_last_name), trim(p_phone),
    p_checkin, p_checkout,
    (v_quote->>'accommodation_total')::numeric,
    (v_quote->>'cleaning_fee')::numeric,
    (v_quote->>'grand_total')::numeric,
    'site',
    auth.uid()
  ) returning id into v_id;

  return jsonb_build_object('ok', true, 'reservation_id', v_id);
end $$;

grant execute on function public.create_reservation_request(uuid, date, date, text, text, text)
  to anon, authenticated;

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
    first_name, last_name, phone, customer_id
  ) values (
    p_region, p_category_id, p_checkin, p_checkout, p_guest_count,
    trim(p_first_name), trim(p_last_name), trim(p_phone), auth.uid()
  ) returning id into v_id;

  return jsonb_build_object('ok', true, 'request_id', v_id);
end $$;

grant execute on function public.create_villa_request(
  villa_region, uuid, date, date, int, text, text, text
) to anon, authenticated;
