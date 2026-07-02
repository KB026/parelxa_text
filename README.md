# Parlexa Marketplace (Next.js 14)

Next.js 14 App Router starter configured with:

- Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- Tailwind CSS
- shadcn/ui
- Route groups for public pages, vendor portal, customer dashboard, and admin dashboard

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.local.example .env.local
```

3. Start development server:

```bash
npm run dev
```

## Routes

- `/` public homepage
- `/products` public catalog
- `/products/[slug]` public product details
- `/vendor`, `/vendor/listings`, `/vendor/orders` vendor portal
- `/dashboard`, `/dashboard/orders`, `/dashboard/wishlist` customer dashboard
- `/admin`, `/admin/users`, `/admin/vendors` admin dashboard
