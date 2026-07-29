-- 1. Grant service role access to profiles (fixes admin client permissions)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.categories TO service_role;
GRANT ALL ON public.items TO service_role;
GRANT ALL ON public.cart_items TO service_role;
GRANT ALL ON public.favorites TO service_role;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;
GRANT ALL ON public.site_settings TO service_role;

-- 2. Allow users to insert their own profile row (in case trigger missed it)
CREATE POLICY "user inserts own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Set your account as admin (replace the email with yours)
UPDATE public.profiles SET is_admin = true
WHERE id IN (SELECT id FROM auth.users WHERE email = 'huzaifashamsi819@gmail.com');
