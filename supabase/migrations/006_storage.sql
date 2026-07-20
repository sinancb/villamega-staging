-- ============================================================
-- 006_storage.sql — villa photo storage (RUN ON SUPABASE ONLY;
-- the local test shim has no storage schema)
-- Bucket `villas`: public read, staff-only write/delete.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'villas', 'villas', true,
  8388608,  -- 8 MB, matches the admin uploader's client-side cap
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Anyone may view photos (the public site serves them directly)
create policy "villas_public_read"
  on storage.objects for select
  using (bucket_id = 'villas');

-- Only staff may upload
create policy "villas_staff_insert"
  on storage.objects for insert
  with check (bucket_id = 'villas' and public.is_staff());

-- Only staff may replace or delete
create policy "villas_staff_update"
  on storage.objects for update
  using (bucket_id = 'villas' and public.is_staff());

create policy "villas_staff_delete"
  on storage.objects for delete
  using (bucket_id = 'villas' and public.is_staff());
