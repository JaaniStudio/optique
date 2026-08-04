-- ============================================================
-- GLASSES STORE — PER-COLOR STOCK + COLOR SELECTION AT ORDER
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- 1) Add a color marker to cart items and order items
alter table cart_items add column if not exists color text not null default '';
alter table order_items add column if not exists color text not null default '';

-- 2) Allow the same item in different colors inside the cart
alter table cart_items drop constraint if exists cart_items_user_id_item_id_key;
alter table cart_items add constraint cart_items_user_id_item_id_color_key unique (user_id, item_id, color);

-- 3) Make sure a jsonb colors column exists, then migrate the old text[] colors
--    into [{name, stock}] (each existing color takes the item's overall stock).
alter table items add column if not exists colors_jsonb jsonb default '[]'::jsonb;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'items'
      and column_name = 'colors' and data_type = 'ARRAY'
  ) then
    update items set colors_jsonb = coalesce(
      (select jsonb_agg(jsonb_build_object('name', c, 'stock', items.stock))
       from unnest(items.colors) c),
      '[]'::jsonb
    );
    alter table items drop column colors;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'items'
      and column_name = 'colors_jsonb' and data_type = 'jsonb'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'items'
      and column_name = 'colors'
  ) then
    alter table items rename column colors_jsonb to colors;
  end if;
end $$;

-- 4) Color-aware stock trigger (decrement/replenish a specific color's stock)
create or replace function public.adjust_stock_on_order_item()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    if new.color is null or new.color = '' then
      update public.items set stock = greatest(0, stock - new.quantity) where id = new.item_id;
    else
      update public.items
      set stock = greatest(0, stock - new.quantity),
          colors = (
            select jsonb_agg(
              case when (c->>'name') = new.color
                   then jsonb_build_object('name', c->>'name', 'stock', greatest(0, (c->>'stock')::int - new.quantity))
                   else c
              end
            )
            from jsonb_array_elements(colors) c
          )
      where id = new.item_id;
    end if;
  elsif tg_op = 'DELETE' then
    if old.color is null or old.color = '' then
      update public.items set stock = stock + old.quantity where id = old.item_id;
    else
      update public.items
      set stock = stock + old.quantity,
          colors = (
            select jsonb_agg(
              case when (c->>'name') = old.color
                   then jsonb_build_object('name', c->>'name', 'stock', (c->>'stock')::int + old.quantity)
                   else c
              end
            )
            from jsonb_array_elements(colors) c
          )
      where id = old.item_id;
    end if;
  end if;
  return null;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_order_item_insert on public.order_items;
create trigger on_order_item_insert
  after insert on public.order_items
  for each row execute function public.adjust_stock_on_order_item();

drop trigger if exists on_order_item_delete on public.order_items;
create trigger on_order_item_delete
  after delete on public.order_items
  for each row execute function public.adjust_stock_on_order_item();