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
