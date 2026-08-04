-- ============================================================
-- CATEGORY IMAGES + PRODUCT REVIEWS
-- Run once in Supabase SQL Editor.
-- ============================================================

-- 1. CATEGORY IMAGES --------------------------------------------------
alter table categories add column if not exists image_url text;
alter table categories add column if not exists image_path text;

-- Dedicated public bucket for category images
insert into storage.buckets (id, name, public)
values ('category-images', 'category-images', true)
on conflict (id) do nothing;

create policy "public read category-images"
  on storage.objects for select
  using (bucket_id = 'category-images');

create policy "admin upload category-images"
  on storage.objects for insert
  with check (bucket_id = 'category-images' and public.is_admin());

create policy "admin delete category-images"
  on storage.objects for delete
  using (bucket_id = 'category-images' and public.is_admin());

-- 2. REVIEWS ----------------------------------------------------------
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (item_id, user_id)
);

create index if not exists idx_reviews_item on reviews(item_id);
create index if not exists idx_reviews_user on reviews(user_id);

alter table reviews enable row level security;

-- Anyone can read reviews
create policy "reviews are public" on reviews for select using (true);

-- Users manage their own review
create policy "user inserts own review" on reviews for insert with check (auth.uid() = user_id);
create policy "user updates own review" on reviews for update using (auth.uid() = user_id);
create policy "user deletes own review" on reviews for delete using (auth.uid() = user_id);

-- Users can only review items from a COMPLETED order (enforced server-side too)
create function public.enforce_review_purchase()
returns trigger as $$
begin
  if not exists (
    select 1
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    where o.user_id = auth.uid()
      and o.status = 'completed'
      and oi.item_id = new.item_id
  ) then
    raise exception 'Only customers who purchased this item can review it.';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists enforce_review_purchase on public.reviews;
create trigger enforce_review_purchase
  before insert or update on public.reviews
  for each row execute function public.enforce_review_purchase();

-- Grants: new tables do NOT inherit the earlier "grant all on all tables" from
-- schema.sql, so reviews must be granted explicitly or you'll get
-- "permission denied for table reviews".
grant usage on schema public to anon, authenticated, service_role;
grant all on table public.reviews to anon, authenticated, service_role;
