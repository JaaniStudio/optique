-- ============================================================
-- NOTIFICATIONS
-- Run once in Supabase SQL Editor.
-- - User is notified when their order becomes in_transit / completed (delivered)
-- - All admins are notified when a new order is placed
-- ============================================================

-- 1. TABLE ----------------------------------------------------------------
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text,                                  -- e.g. 'order_status' | 'new_order'
  title text,
  message text,
  link text,                                  -- where the user/item should navigate
  is_read boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists idx_notifications_user on notifications(user_id, is_read, created_at desc);
create index if not exists idx_notifications_user_created on notifications(user_id, created_at desc);

alter table notifications enable row level security;

-- Users manage their own notifications
create policy "user reads own notifications" on notifications for select using (auth.uid() = user_id);
create policy "user updates own notifications" on notifications for update using (auth.uid() = user_id);
create policy "user deletes own notifications" on notifications for delete using (auth.uid() = user_id);

-- Grants: new tables don't inherit earlier grants from schema.sql
grant usage on schema public to anon, authenticated, service_role;
grant all on table public.notifications to anon, authenticated, service_role;

-- 2. NOTIFY ADMINS ON NEW ORDER -------------------------------------------
create function public.notify_admins_on_order()
returns trigger as $$
begin
  insert into public.notifications (user_id, type, title, message, link)
  select id, 'new_order', 'New Order Placed',
         'Order #' || left(new.id::text, 8) || ' has been placed (PKR ' || new.total::text || ').',
         '/admin/orders'
  from public.profiles
  where is_admin = true;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_order_created_notify on public.orders;
create trigger on_order_created_notify
  after insert on public.orders
  for each row execute function public.notify_admins_on_order();

-- 3. NOTIFY USER ON STATUS CHANGE (in_transit / completed) -----------------
create function public.notify_user_on_status()
returns trigger as $$
begin
  if new.user_id is not null and new.status <> old.status then
    if new.status = 'in_transit' then
      insert into public.notifications (user_id, type, title, message, link)
      values (new.user_id, 'order_status', 'Order In Transit',
              'Your order #' || left(new.id::text, 8) || ' is on its way!', '/account');
    elsif new.status = 'completed' then
      insert into public.notifications (user_id, type, title, message, link)
      values (new.user_id, 'order_status', 'Order Delivered',
              'Your order #' || left(new.id::text, 8) || ' has been delivered. Enjoy!', '/account');
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_order_status_notify on public.orders;
create trigger on_order_status_notify
  after update on public.orders
  for each row execute function public.notify_user_on_status();

-- 4. REALTIME (so the navbar badge updates live) ---------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table notifications;
  end if;
end $$;