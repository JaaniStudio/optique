# Optique — Glasses Store (Next.js + Supabase)

Full-stack eyewear e-commerce site: storefront + admin panel, manual WhatsApp-based
payment (no payment gateway needed).

## Stack
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**-style components (Radix primitives)
- **Framer Motion** for hover/tap animations
- **Supabase** — Postgres DB, Auth, Storage, Realtime

## 1. Set up Supabase

1. Create a project at supabase.com.
2. In the SQL Editor, run **`supabase/schema.sql`** — creates all tables, RLS
   policies, triggers, and seeds 5 categories.
3. Then run **`supabase/storage.sql`** — creates one storage bucket per category
   (matches `bucket_name` in the `categories` table) with public read / admin-only write.
4. In Authentication settings, enable **Email** provider (and disable email
   confirmation if you want instant sign-in during testing).
5. To make yourself an admin: sign up on the site normally, then in the SQL editor run:
   ```sql
   update profiles set is_admin = true where id = 'YOUR-USER-UUID';
   ```
   (Find your UUID in Authentication > Users.)

## 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings > API
- `SUPABASE_SERVICE_ROLE_KEY` — same page (keep secret, server-only)
- `NEXT_PUBLIC_WHATSAPP_NUMBER` — your client's WhatsApp number in international
  format with no `+` or spaces, e.g. `923001234567`

## 3. Install & run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Admin panel is at `/admin` (requires an admin account).

## How it works

- **Storefront**: browses categories/items from Supabase, add to cart, favorite,
  checkout collects name/phone/address, creates an `order` + `order_items`, then
  redirects to WhatsApp with an order summary pre-filled. Customer sends the
  payment screenshot there — no payment gateway integration needed.
- **Admin panel** (`/admin`): sidebar with Dashboard (live stats + banner editor),
  Orders (search/filter pending vs completed, mark complete, delete), Items (add
  with up to 5 images uploaded straight to the category's storage bucket, choose
  thumbnail, edit, delete, adjust stock, toggle sale), Users (search, edit, ban/unban).
  All list views subscribe to Supabase **Realtime**, so changes reflect live across
  admin sessions without refreshing.
- **Banned users** are signed out and blocked from re-entering via `middleware.ts`.

## Adding a new category later

1. Insert a row into `categories` with a unique `bucket_name`.
2. Create the matching public storage bucket (Supabase Studio > Storage > New bucket,
   or run an `insert into storage.buckets ...` like in `storage.sql`).
3. It'll immediately show up in the navbar dropdown and admin item form.

## Notes / next steps for production

- Add pagination to `/admin/items` and `/admin/orders` once catalogs grow large.
- Swap the hero slider's Unsplash placeholder images for real product photography.
- Consider adding email notifications on order status change (Supabase Edge
  Functions + Resend/SendGrid) alongside the WhatsApp flow.
- Add a `/mnt` favicon and OG image, and real placeholder-glasses.png in `/public`.
