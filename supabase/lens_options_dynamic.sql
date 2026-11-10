-- ============================================================
-- DYNAMIC LENS OPTIONS
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query)
--
-- Adds storage-backed images for lens options so admins can add as
-- many lens options as needed from the admin panel. New uploads go to
-- the "lens-images" storage bucket and the URL is saved in the DB.
-- ============================================================

-- Track the storage path so old images can be removed when replaced.
alter table lens_options add column if not exists image_path text;

-- ------------------------------------------------------------
-- STORAGE BUCKET
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('lens-images', 'lens-images', true)
on conflict (id) do update set public = true;

-- ------------------------------------------------------------
-- STORAGE POLICIES
-- ------------------------------------------------------------
drop policy if exists "public read lens images" on storage.objects;
create policy "public read lens images"
  on storage.objects for select
  using (bucket_id = 'lens-images');

drop policy if exists "admin upload lens images" on storage.objects;
create policy "admin upload lens images"
  on storage.objects for insert
  with check (bucket_id = 'lens-images' and public.is_admin());

drop policy if exists "admin update lens images" on storage.objects;
create policy "admin update lens images"
  on storage.objects for update
  using (bucket_id = 'lens-images' and public.is_admin())
  with check (bucket_id = 'lens-images' and public.is_admin());

drop policy if exists "admin delete lens images" on storage.objects;
create policy "admin delete lens images"
  on storage.objects for delete
  using (bucket_id = 'lens-images' and public.is_admin());

-- NOTE: The three existing lens options still point to the old public
-- files (/1.jpeg, /2.jpeg, /3.jpeg). Open each one in Admin > Manage
-- Lenses and upload an image once; it will be moved to the lens-images
-- bucket and stored in the database like all new options.
