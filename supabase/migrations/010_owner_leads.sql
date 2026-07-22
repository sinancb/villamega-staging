-- ============================================================
-- 010_owner_leads.sql — "Villanızı Kiralayın" contact-info capture
-- Property owners wanting to list with us; staff follow up manually.
-- ============================================================

create table owner_leads (
  id         uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name  text not null,
  email      text not null,
  phone      text not null,
  created_at timestamptz not null default now()
);

alter table owner_leads enable row level security;

create policy ol_staff_all on owner_leads
  for all using (is_staff()) with check (is_staff());

create or replace function public.create_owner_lead(
  p_first_name text,
  p_last_name  text,
  p_email      text,
  p_phone      text
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
  if p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return jsonb_build_object('ok', false, 'error', 'invalid_email');
  end if;
  if p_phone !~ '^\+?[0-9 ()-]{10,20}$' then
    return jsonb_build_object('ok', false, 'error', 'invalid_phone');
  end if;

  insert into owner_leads (first_name, last_name, email, phone)
  values (trim(p_first_name), trim(p_last_name), trim(p_email), trim(p_phone))
  returning id into v_id;

  return jsonb_build_object('ok', true, 'lead_id', v_id);
end $$;

grant execute on function public.create_owner_lead(text, text, text, text) to anon, authenticated;
