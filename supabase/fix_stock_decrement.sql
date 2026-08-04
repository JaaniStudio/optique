-- ============================================================
-- GLASSES STORE — RELIABLE STOCK DECREMENT FIX
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query)
-- Re-run anytime. This replaces the old trigger with a more robust
-- version that always works regardless of color name casing.
-- ============================================================

create or replace function public.adjust_stock_on_order_item()
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
  -- INSERT: order placed
  if tg_op = 'INSERT' then
    chosen_color := coalesce(btrim(new.color), '');

    -- always drop the total stock
    update public.items set stock = greatest(0, stock - new.quantity) where id = new.item_id;

    -- if a color was chosen, also drop that color's stock (case-insensitive)
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

  -- DELETE: order removed -> restore stock
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

drop trigger if exists on_order_item_insert on public.order_items;
create trigger on_order_item_insert
  after insert on public.order_items
  for each row execute function public.adjust_stock_on_order_item();

drop trigger if exists on_order_item_delete on public.order_items;
create trigger on_order_item_delete
  after delete on public.order_items
  for each row execute function public.adjust_stock_on_order_item();