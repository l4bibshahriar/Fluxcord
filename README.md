# Fluxcord

A simple Vercel-friendly HTML/CSS/JavaScript starter for the Fluxcord digital marketplace.

## Included
- Home, Shop, Cart, Checkout
- Login/Register demo screens
- Customer Account dashboard
- Admin dashboard UI
- Manual payment methods: bKash, Nagad, Bitcoin, Litecoin, Solana, USDT
- Product catalog and localStorage cart
- Responsive dark/amber design and animations

## Important
This ZIP is the **frontend starter**. Login, registration, orders, admin role enforcement, email notifications, payment records and customer download delivery are intentionally ready to connect to Supabase but are not pretending to be secure client-side functionality.

### Supabase integration to add
1. Create a Supabase project.
2. Create `profiles`, `categories`, `products`, `cart_items`, `orders`, `order_items`, `inbox`, and `reviews` tables.
3. Enable Supabase Auth.
4. Add Row Level Security policies.
5. Set the admin user's `profiles.role` to `admin`.
6. Add your Supabase URL and anon/publishable key in a small config file or environment-aware frontend build.
7. Add a server-side/Edge Function workflow for privileged admin actions and email notifications.

Never put a Supabase service-role key in browser JavaScript.

## Vercel
Static deployment works immediately: upload/push the project to GitHub and import the repository into Vercel.

## Images
The product cards currently use CSS-generated placeholders so the project works without external image dependencies. Replace the mock artwork with your selected Unsplash images when adding products.


## Logo
Place your own logo at `assets/logo.png`. The homepage hero and customer trust card use that file.

## Home visual updates
- Explore Deals changed to Why Us?
- Added Why Us section matching the supplied reference layout while retaining Fluxcord's amber theme.
- Category cards now use the supplied image URLs.
- Hero uses `assets/logo.png` instead of the moving yellow circle.
- Customer reviews use a continuous right-to-left marquee loop.


## Final visual update
- Why Fluxcord now contains exactly two feature boxes: “From payment to delivery” on the left and a long “Trusted by our customers” stats box on the right.
- Category cards use responsive auto-fit columns and 16:9 image thumbnails.
- Added professional black footer with Social Media, Resources and Library columns.
- Added `terms.html` and `privacy.html`.
- Social links currently point to the main platform pages; replace them with Fluxcord's exact profile URLs when available.


## Latest UI fixes
- Category cards are true 16:9 cards with the supplied banner images filling the entire card.
- Category item counts are hidden.
- Shop filter now uses a $0.00–$100.00 price range with minimum and maximum handles.
- Price filtering and Clear All are wired to the new range controls.
