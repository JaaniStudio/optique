-- ============================================================
-- GLASSES STORE — SUPABASE SCHEMA
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- 1. CATEGORIES
-- ------------------------------------------------------------
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  bucket_name text not null,          -- storage bucket dedicated to this category
  image_url text,                     -- homepage tile image (from category-images bucket)
  image_path text,                    -- storage path used to delete the image
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 2. PROFILES (extends auth.users)
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  is_admin boolean default false,
  is_banned boolean default false,
  created_at timestamptz default now()
);

-- Auto-create profile row when a user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- 3. ITEMS (glasses)
-- ------------------------------------------------------------
create table items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  category_id uuid references categories(id) on delete set null,
  stock int not null default 0,
  on_sale boolean default false,
  sale_price numeric(10,2),
  images jsonb default '[]'::jsonb,      -- array of { url, path } up to 5
  thumbnail_url text,                     -- chosen thumbnail among images
  colors jsonb default '[]'::jsonb,       -- array of { name, stock }
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_items_category on items(category_id);
create index idx_items_active on items(is_active);

-- ------------------------------------------------------------
-- 4. CART
-- ------------------------------------------------------------
create table cart_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  item_id uuid references items(id) on delete cascade,
  color text not null default '',
  quantity int not null default 1,
  created_at timestamptz default now(),
  unique (user_id, item_id, color)
);

-- ------------------------------------------------------------
-- 5. FAVORITES (heart icon)
-- ------------------------------------------------------------
create table favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  item_id uuid references items(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, item_id)
);

-- ------------------------------------------------------------
-- 6. ORDERS  (payment handled manually via WhatsApp screenshot)
-- ------------------------------------------------------------
create table orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','in_transit','completed','cancelled')),
  total numeric(10,2) not null,
  customer_name text,
  customer_phone text,
  shipping_address text,
  notes text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  item_id uuid references items(id) on delete set null,
  item_name text not null,       -- snapshot at time of order
  item_price numeric(10,2) not null,
  quantity int not null,
  color text not null default ''  -- color chosen by the customer
);

create index idx_orders_status on orders(status);
create index idx_orders_user on orders(user_id);

-- ------------------------------------------------------------
-- 6b. REVIEWS  (only purchasers of a completed order can review)
-- ------------------------------------------------------------
create table reviews (
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

create index idx_reviews_item on reviews(item_id);
create index idx_reviews_user on reviews(user_id);

-- Auto-adjust item stock when order items are added/removed.
-- Decrements/replenishes a specific color's stock (case-insensitive) when a color is given.
-- Runs as security definer so it bypasses RLS (users have no direct update on items).
create function public.adjust_stock_on_order_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  col jsonb;
  new_colors jsonb := '[]'::jsonb;
  item_colors jsonb;
  color_found boolean := false;
  chosen_color text;
begin
  if tg_op = 'INSERT' then
    chosen_color := coalesce(btrim(new.color), '');
    update public.items set stock = greatest(0, stock - new.quantity) where id = new.item_id;
    if chosen_color <> '' then
      select colors into item_colors from public.items where id = new.item_id;
      if item_colors is null then item_colors := '[]'::jsonb; end if;
      for col in select value from jsonb_array_elements(item_colors)
      loop
        if lower(btrim(col->>'name')) = lower(chosen_color) then
          new_colors := new_colors || jsonb_build_object(
            'name', col->>'name',
            'stock', greatest(0, coalesce((col->>'stock')::int, 0) - new.quantity)
          );
          color_found := true;
        else
          new_colors := new_colors || col;
        end if;
      end loop;
      if color_found then
        update public.items set colors = new_colors where id = new.item_id;
      end if;
    end if;
    return null;
  end if;

  if tg_op = 'DELETE' then
    chosen_color := coalesce(btrim(old.color), '');
    update public.items set stock = stock + old.quantity where id = old.item_id;
    if chosen_color <> '' then
      select colors into item_colors from public.items where id = old.item_id;
      if item_colors is null then item_colors := '[]'::jsonb; end if;
      for col in select value from jsonb_array_elements(item_colors)
      loop
        if lower(btrim(col->>'name')) = lower(chosen_color) then
          new_colors := new_colors || jsonb_build_object(
            'name', col->>'name',
            'stock', coalesce((col->>'stock')::int, 0) + old.quantity
          );
          color_found := true;
        else
          new_colors := new_colors || col;
        end if;
      end loop;
      if color_found then
        update public.items set colors = new_colors where id = old.item_id;
      end if;
    end if;
    return null;
  end if;

  return null;
end;
$$;

create trigger on_order_item_insert
  after insert on public.order_items
  for each row execute function public.adjust_stock_on_order_item();

create trigger on_order_item_delete
  after delete on public.order_items
  for each row execute function public.adjust_stock_on_order_item();

-- ------------------------------------------------------------
-- 7. SITE SETTINGS (admin-editable banner)
-- ------------------------------------------------------------
create table site_settings (
  id int primary key default 1,
  banner_enabled boolean default false,
  banner_text text,
  banner_bg_color text default '#080808',
  banner_text_color text default '#f1f1f1',
  bank_account_details text,   -- shown at checkout for manual payment
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);
insert into site_settings (id) values (1);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table categories enable row level security;
alter table items enable row level security;
alter table profiles enable row level security;
alter table cart_items enable row level security;
alter table favorites enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;
alter table site_settings enable row level security;

-- Public read for storefront
create policy "categories are public" on categories for select using (true);
create policy "active items are public" on items for select using (is_active = true);
create policy "site settings are public" on site_settings for select using (true);

-- Profiles: user can read/update/insert own row
create policy "user reads own profile" on profiles for select using (auth.uid() = id);
create policy "user updates own profile" on profiles for update using (auth.uid() = id);
create policy "user inserts own profile" on profiles for insert with check (auth.uid() = id);

-- Grant table-level permissions so RLS policies can be evaluated
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

-- Cart: user manages own cart
create policy "user manages own cart" on cart_items for all using (auth.uid() = user_id);

-- Favorites: user manages own favorites
create policy "user manages own favorites" on favorites for all using (auth.uid() = user_id);

-- Orders: user reads/creates own orders
create policy "user reads own orders" on orders for select using (auth.uid() = user_id);
create policy "user creates own orders" on orders for insert with check (auth.uid() = user_id);
create policy "user reads own order items" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "user creates own order items" on order_items for insert
  with check (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));

-- Reviews: public read, owner writes
create policy "reviews are public" on reviews for select using (true);
create policy "user inserts own review" on reviews for insert with check (auth.uid() = user_id);
create policy "user updates own review" on reviews for update using (auth.uid() = user_id);
create policy "user deletes own review" on reviews for delete using (auth.uid() = user_id);

-- Only purchasers from a COMPLETED order may review
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

create trigger enforce_review_purchase
  before insert or update on public.reviews
  for each row execute function public.enforce_review_purchase();

-- Admin: full access to everything (checked via profiles.is_admin)
create function public.is_admin()
returns boolean as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$ language sql security definer stable;

create policy "admin full access categories" on categories for all using (public.is_admin());
create policy "admin full access items" on items for all using (public.is_admin());
create policy "admin full access profiles" on profiles for all using (public.is_admin());
create policy "admin full access orders" on orders for all using (public.is_admin());
create policy "admin full access order_items" on order_items for all using (public.is_admin());
create policy "admin full access settings" on site_settings for all using (public.is_admin());

-- ------------------------------------------------------------
-- REALTIME (for live admin dashboard)
-- ------------------------------------------------------------
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table items;
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table site_settings;

-- ------------------------------------------------------------
-- SEED CATEGORIES (creates one storage bucket name per category —
-- you still need to create the actual buckets, see storage.sql)
-- ------------------------------------------------------------
insert into categories (name, slug, bucket_name) values
  ('Sunglasses', 'sunglasses', 'sunglasses-images'),
  ('Eyeglasses', 'eyeglasses', 'eyeglasses-images'),
  ('Reading Glasses', 'reading-glasses', 'reading-glasses-images'),
  ('Sports Glasses', 'sports-glasses', 'sports-glasses-images'),
  ('Kids Glasses', 'kids-glasses', 'kids-glasses-images');
