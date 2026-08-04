-- ============================================================
-- GLASSES STORE — STOCK FIX + ITEM COLORS
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- 1) Add colors column to items (array of color names, e.g. {"Black","Gold"})
alter table items add column if not exists colors text[] not null default '{}'::text[];

-- 2) Automatically adjust stock when orders are placed.
--    - When order_items are inserted -> decrement items.stock
--    - When order_items are deleted (order deleted) -> restore items.stock
--    Runs as security definer so it bypasses RLS (regular users have no
--    UPDATE policy on items, but the stock change is a trusted system action).
create or replace function public.adjust_stock_on_order_item()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.items set stock = greatest(0, stock - new.quantity) where id = new.item_id;
  elsif tg_op = 'DELETE' then
    update public.items set stock = stock + old.quantity where id = old.item_id;
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
