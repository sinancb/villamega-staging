-- ============================================================
-- 003_functions.sql — Business logic
--   get_unavailable_ranges : feeds the public calendar
--   quote_stay             : validates + prices a stay
--   create_reservation_request : the ONLY write path for guests
--   detect_conflicts       : called by the iCal sync worker
-- All are SECURITY DEFINER so anon can call them without table access.
-- ============================================================

-- ---------- Public calendar: which dates are blocked? ----------
-- Returns half-open ranges [start_date, end_date): checkout day is free.
create or replace function public.get_unavailable_ranges(p_villa_id uuid)
returns table (start_date date, end_date date)
language sql stable security definer set search_path = public
as $$
  select r.checkin, r.checkout
    from reservations r
   where r.villa_id = p_villa_id and r.status = 'onaylandi'
  union all
  select b.start_date, b.end_date + 1        -- blocks are inclusive → half-open
    from calendar_blocks b
   where b.villa_id = p_villa_id
  union all
  select e.dtstart, e.dtend                  -- iCal is already half-open
    from ical_events e
    join ical_feeds f on f.id = e.feed_id
   where f.villa_id = p_villa_id
$$;

grant execute on function public.get_unavailable_ranges(uuid) to anon, authenticated;

-- ---------- Quote a stay ----------
-- Walks the stay night by night. Every night must fall inside a season band
-- (unpriced dates are treated as unavailable). Min-stay = strictest band
-- touched, falling back to the villa default. Returns a JSON quote or a
-- JSON error {ok:false, error:...} the frontend can localize.
create or replace function public.quote_stay(
  p_villa_id uuid,
  p_checkin  date,
  p_checkout date
) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  v_villa        villas%rowtype;
  v_night        date;
  v_price        numeric;
  v_accom        numeric := 0;
  v_min_stay     int;
  v_nights       int;
  v_band_min     int;
begin
  select * into v_villa from villas where id = p_villa_id and status = 'active';
  if not found then
    return jsonb_build_object('ok', false, 'error', 'villa_not_found');
  end if;

  if p_checkout <= p_checkin then
    return jsonb_build_object('ok', false, 'error', 'invalid_dates');
  end if;
  if p_checkin < current_date then
    return jsonb_build_object('ok', false, 'error', 'past_date');
  end if;

  v_nights   := p_checkout - p_checkin;
  v_min_stay := v_villa.default_min_stay;

  -- Availability check against all three block sources
  if exists (
    select 1 from get_unavailable_ranges(p_villa_id) u
    where daterange(u.start_date, u.end_date, '[)')
       && daterange(p_checkin, p_checkout, '[)')
  ) then
    return jsonb_build_object('ok', false, 'error', 'dates_unavailable');
  end if;

  -- Price each night; collect strictest min_stay among bands touched
  v_night := p_checkin;
  while v_night < p_checkout loop
    select s.nightly_price, s.min_stay
      into v_price, v_band_min
      from price_seasons s
     where s.villa_id = p_villa_id
       and v_night between s.start_date and s.end_date;

    if not found then
      return jsonb_build_object('ok', false, 'error', 'unpriced_dates',
                                'date', to_char(v_night, 'YYYY-MM-DD'));
    end if;

    v_accom := v_accom + v_price;
    if v_band_min is not null and v_band_min > v_min_stay then
      v_min_stay := v_band_min;
    end if;
    v_night := v_night + 1;
  end loop;

  if v_nights < v_min_stay then
    return jsonb_build_object('ok', false, 'error', 'min_stay',
                              'min_stay', v_min_stay);
  end if;

  -- Payment breakdown mirrors the market-standard widget:
  -- ön ödeme = prepayment_pct of ACCOMMODATION (not of grand total),
  -- girişte kalan = grand_total - ön ödeme,
  -- hasar depozitosu = informational line, never part of the total.
  return jsonb_build_object(
    'ok', true,
    'nights', v_nights,
    'accommodation_total', v_accom,
    'cleaning_fee', v_villa.cleaning_fee,
    'grand_total', v_accom + v_villa.cleaning_fee,
    'prepayment', round(v_accom * v_villa.prepayment_pct / 100.0, 2),
    'due_at_checkin', (v_accom + v_villa.cleaning_fee)
                      - round(v_accom * v_villa.prepayment_pct / 100.0, 2),
    'damage_deposit', v_villa.deposit_amount
  );
end $$;

grant execute on function public.quote_stay(uuid, date, date) to anon, authenticated;

-- ---------- Guest request form (only guest write path) ----------
-- Re-runs the quote server-side so the stored totals can never be tampered
-- with from the client. Basic input hygiene; rate limiting happens at the
-- edge (middleware), not here.
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
    checkin, checkout, accommodation_total, cleaning_fee, grand_total, source
  ) values (
    p_villa_id, 'yeni', trim(p_first_name), trim(p_last_name), trim(p_phone),
    p_checkin, p_checkout,
    (v_quote->>'accommodation_total')::numeric,
    (v_quote->>'cleaning_fee')::numeric,
    (v_quote->>'grand_total')::numeric,
    'site'
  ) returning id into v_id;

  return jsonb_build_object('ok', true, 'reservation_id', v_id);
end $$;

grant execute on function public.create_reservation_request(uuid, date, date, text, text, text)
  to anon, authenticated;

-- ---------- Conflict detection (called by iCal sync worker) ----------
-- After each feed sync, flag any imported event overlapping a confirmed
-- reservation. Never auto-resolves: humans decide.
create or replace function public.detect_conflicts(p_villa_id uuid)
returns int
language plpgsql security definer set search_path = public
as $$
declare
  v_count int;
begin
  insert into conflicts (villa_id, reservation_id, ical_event_id)
  select r.villa_id, r.id, e.id
    from reservations r
    join ical_feeds f  on f.villa_id = r.villa_id
    join ical_events e on e.feed_id = f.id
   where r.villa_id = p_villa_id
     and r.status = 'onaylandi'
     and daterange(r.checkin, r.checkout, '[)')
      && daterange(e.dtstart, e.dtend, '[)')
  on conflict (reservation_id, ical_event_id) do nothing;

  get diagnostics v_count = row_count;
  return v_count;
end $$;

-- Worker runs with service role; no anon grant.
