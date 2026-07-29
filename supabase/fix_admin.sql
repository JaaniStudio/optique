-- 1. Grant table-level permissions to anon + authenticated roles (required for RLS to work)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT ALL ON public.categories TO anon, authenticated, service_role;
GRANT ALL ON public.items TO anon, authenticated, service_role;
GRANT ALL ON public.cart_items TO anon, authenticated, service_role;
GRANT ALL ON public.favorites TO anon, authenticated, service_role;
GRANT ALL ON public.orders TO anon, authenticated, service_role;
GRANT ALL ON public.order_items TO anon, authenticated, service_role;
GRANT ALL ON public.site_settings TO anon, authenticated, service_role;

-- 2. Allow users to insert their own profile row (in case trigger missed it)
CREATE POLICY "user inserts own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Set your account as admin (replace the email with yours)
UPDATE public.profiles SET is_admin = true
WHERE id IN (SELECT id FROM auth.users WHERE email = 'email@gmail.com');
