# Fluxcord Final Supabase/Vercel Setup

## Vercel environment variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Optional legacy name supported by the config endpoint:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Never put `SUPABASE_SERVICE_ROLE_KEY` / secret keys in this project or in browser code.

## Setup order

1. Create/open your Supabase project.
2. Supabase -> SQL Editor -> New query.
3. Paste the entire `schema.sql` from this ZIP and Run.
4. Supabase -> Authentication -> Providers -> Email: enable Email.
5. For easiest first test, disable email confirmation temporarily. For production, use email confirmation and configure your site URL/redirects.
6. Vercel -> Project -> Settings -> Environment Variables. Add the two required variables to Production (and Preview/Development if desired).
7. Redeploy after saving variables.
8. Open Fluxcord -> Register and create your owner account.
9. In Supabase SQL Editor run:
   `update public.profiles set role = 'admin' where email = 'YOUR_EMAIL_HERE';`
10. Log in on Fluxcord and open `/admin.html`.
11. Add products from the Admin Dashboard. Product download URLs are stored in the order item at checkout.

## Important

The website uses `/api/config` to expose only the public Supabase URL and publishable/anon key to the static frontend. No Supabase secret key is exposed.

Checkout uses the `create_order` database function so the browser cannot choose its own product price.

## Custom Fluxcord Email System (Vercel + Resend)

This build does NOT use Supabase's SMTP sender for the main signup, recovery, or magic-link emails. Vercel Functions generate the Supabase Auth links server-side and send them through Resend.

Required Vercel environment variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_URL
- SUPABASE_SECRET_KEY
- RESEND_API_KEY
- RESEND_FROM_EMAIL
- SITE_URL

Keep SUPABASE_SECRET_KEY and RESEND_API_KEY server-only. Never prefix either with NEXT_PUBLIC_ and never put them in browser JavaScript.

Supabase Auth > Email > Confirm email should remain enabled. The custom server function creates the Auth link and Resend delivers it.

For Resend, verify fluxcord.store (or another sending domain) and use a From address on that verified domain.

## Custom Email System (Vercel + Resend)

This build sends the main Fluxcord authentication emails from Vercel Functions through Resend instead of relying on Supabase's SMTP sender. Vercel Functions generate the Supabase Auth action link server-side; the Supabase secret key is never sent to the browser.

Add these Vercel Environment Variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_URL
- SUPABASE_SECRET_KEY
- RESEND_API_KEY
- RESEND_FROM_EMAIL
- SITE_URL

`SUPABASE_SECRET_KEY` and `RESEND_API_KEY` are server-only. Never use `NEXT_PUBLIC_` for either of them.

Keep Supabase Auth email confirmation enabled. Verify your sending domain in Resend and use a From address on that verified domain.

## V2 changes
- Supabase Auth client explicitly persists sessions in localStorage.
- Login has only Forgot Email + Send me sign in link; email actions confirm before sending.
- Product cards have Add to Cart + Buy Now.
- Product URLs use /{category}/{product-slug} and Vercel rewrites to product.html.
- Order flow uses /checkout/{orderid}.
- Admin can deliver/cancel orders, send customer emails, manage reviews, and edit customer balance/total spend.
- Payment destinations live in js/payments.js.
- Run the updated schema.sql in Supabase SQL Editor after the previous schema. It adds payment_sender, customer balance/spend, and admin/fake-review support.
- Set Supabase Auth URL configuration Site URL to https://fluxcord.store and add https://fluxcord.store/** to Redirect URLs.
