-- ============================================================
-- STORAGE BUCKETS — one bucket per category, as requested.
-- Run AFTER schema.sql. Add one INSERT per category you have.
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('sunglasses-images', 'sunglasses-images', true),
  ('eyeglasses-images', 'eyeglasses-images', true),
  ('reading-glasses-images', 'reading-glasses-images', true),
  ('sports-glasses-images', 'sports-glasses-images', true),
  ('kids-glasses-images', 'kids-glasses-images', true)
on conflict (id) do nothing;

-- Public read access to all product images
create policy "public read product images"
  on storage.objects for select
  using (bucket_id in (
    'sunglasses-images','eyeglasses-images','reading-glasses-images',
    'sports-glasses-images','kids-glasses-images'
  ));

-- Only admins can upload/delete (checked via profiles.is_admin)
create policy "admin upload product images"
  on storage.objects for insert
  with check (
    bucket_id in (
      'sunglasses-images','eyeglasses-images','reading-glasses-images',
      'sports-glasses-images','kids-glasses-images'
    )
    and public.is_admin()
  );

create policy "admin delete product images"
  on storage.objects for delete
  using (
    bucket_id in (
      'sunglasses-images','eyeglasses-images','reading-glasses-images',
      'sports-glasses-images','kids-glasses-images'
    )
    and public.is_admin()
  );

-- NOTE: whenever you add a new category from the admin panel, you must:
-- 1. Add a row to `categories` with a unique bucket_name
-- 2. Create the matching bucket (either in Supabase Studio UI, or run:
--      insert into storage.buckets (id, name, public) values ('new-bucket-name','new-bucket-name', true);
-- 3. The two policies above already cover any bucket if you switch the
--    `bucket_id in (...)` list to a wildcard prefix check instead, e.g.
--    bucket_id like '%-images' — simpler long-term, swap it in if you'll
--    be adding categories often.
