-- ============================================================
-- 005_export_ranges.sql — iCal export source
-- Exports ONLY our own truth (confirmed reservations + manual
-- blocks). Imported iCal events are deliberately excluded to
-- prevent echo loops between platforms (Airbnb block → us →
-- Booking → back to Airbnb as a phantom event).
-- ============================================================
create or replace function public.get_export_ranges(p_slug text)
returns table (start_date date, end_date date, kind text)
language sql stable security definer set search_path = public
as $$
  select r.checkin, r.checkout, 'reservation'::text
    from reservations r
    join villas v on v.id = r.villa_id
   where v.slug = p_slug and v.status = 'active' and r.status = 'onaylandi'
  union all
  select b.start_date, b.end_date + 1, 'block'::text
    from calendar_blocks b
    join villas v on v.id = b.villa_id
   where v.slug = p_slug and v.status = 'active'
$$;

grant execute on function public.get_export_ranges(text) to anon, authenticated;
