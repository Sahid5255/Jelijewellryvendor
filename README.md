# Jeli Jewellery Vendor

Premium jewellery storefront. React + Vite + TypeScript + Tailwind CSS + React Router + Lucide + Supabase (optional).

**Core rule:** the 15 starter products live in `src/data/products.ts` and always display, even if Supabase is
missing, paused or erroring. Supabase only *adds* products, categories and settings on top.

## Quick start

```bash
npm install
cp .env.example .env     # every variable is optional
npm run dev              # http://localhost:5173
npm run build            # type-check + production build into dist/
npm run preview
```

With an empty `.env` the whole store works: shop, search, product pages, cart, wishlist and checkout.
Set `VITE_WHATSAPP_NUMBER` (digits only, e.g. `15550100000`) so checkout opens your WhatsApp.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL (optional) |
| `VITE_SUPABASE_ANON_KEY` | Public **anon** key (optional). Never use the service_role key. |
| `VITE_WHATSAPP_NUMBER` | Business WhatsApp number, international format, digits only |
| `VITE_CURRENCY` | ISO currency code, e.g. `USD`, `NGN`, `GBP` |

## Enabling the admin dashboard and future products (Supabase Free)

1. Create a project at supabase.com.
2. SQL Editor: paste and run `supabase/schema.sql` (safe to re-run). It creates the `products`, `categories`,
   `store_settings` and `admin_users` tables, indexes, Row Level Security policies and the public
   `product-images` storage bucket with admin-only write policies.
3. Authentication > Users > Add user (email + password) for the owner.
4. First admin: copy that user's UUID and run in the SQL Editor:
   `insert into public.admin_users (user_id) values ('PASTE-USER-UUID');`
5. Put the URL and anon key from Project Settings > API into `.env` (and into your host's environment settings).
6. Open `/admin` and sign in.

Security model: visitors can only read published products. Insert/update/delete on products, categories,
settings and storage images require a signed-in user listed in `admin_users`, enforced by the database, not by the
frontend. Admins are added only from the SQL editor, so nobody can self-promote.

## How the hybrid catalogue works

- `src/data/products.ts`: starter products (ids like `n-001`), images in `public/images/products/`.
- `src/services/productService.ts`: fetches Supabase rows (8 s timeout) and merges them with the React
  products. Supabase products get the id `sb-<uuid>` and `source: 'supabase'`, so ids never collide.
- If the fetch fails, the storefront silently shows React products only; the admin dashboard shows a subtle notice.
  When Supabase returns, its products appear again on the next load or retry.
- Admin screens mark React products as **protected / read-only**. They can't be edited or deleted there.
- Migration later: insert a Supabase row with `legacy_id` set to the React id (e.g. `n-001`). The storefront then shows
  the Supabase version and hides the React original, so there is no duplicate. `products.ts` is never modified.

## Customising

- Add a starter product: append to `src/data/products.ts`, drop images in `public/images/products/`.
- Replace the illustrated placeholder images (SVG) with real photography using the same file names, or update paths.
  Hero / promo / about images are in `public/images/banners/`, category cards in `public/images/categories/`.
- Brand colours and fonts: `tailwind.config.js` and `src/index.css`.
- Defaults for store name, social links and announcement text: `src/data/siteConfig.ts` (admin Settings override them).

## Honest limits (by design)

- Checkout only opens WhatsApp with a prefilled message. It never claims an order is confirmed or paid, and
  customer details are not stored anywhere.
- The newsletter and contact form are validated on the frontend only. The newsletter says real collection needs a
  connected email service, and the contact form hands off to WhatsApp.
- Homepage reviews are labelled as demonstration content until you have genuine ones.
- Product images are illustrated placeholders, not photographs. Swap in your own photography.

## Deploying

Static hosting works anywhere: `npm run build`, then upload `dist/`. `vercel.json` and `public/_redirects`
(Netlify / Cloudflare Pages) already rewrite all routes to `index.html` so `/admin` and product URLs work on refresh.
