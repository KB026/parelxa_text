# Parlexa System Overview

## 1. Folder/File Structure

The repository root is organized as a Next.js (App Router) project with a Supabase backend:

- `app/` - Next.js App Router root containing all frontend and API routes.
  - `(admin)/` - Admin-specific pages and layouts.
  - `(public)/` - Public-facing marketing and content pages.
  - `api/` - Backend API endpoints.
  - `auth/` - Authentication callback routes.
  - `dashboard/` - Authenticated user and vendor dashboards.
- `components/` - Reusable React components.
- `lib/` - Shared utilities, types, and Supabase client configurations.
- `scripts/` - Node.js utility scripts for database manipulation, seeding, and maintenance.
- `supabase/` - Supabase configurations, local state (`.temp`), and SQL `migrations/`.
- `public/` - Static assets, images, and fonts.
- `types/` - TypeScript type definitions.
- Root scripts: Numerous temporary `.js` files for data migration, diagnostics, and cleanup (e.g., `fix-profiles.js`, `diagnose.js`).

## 2. Supabase Schema (Core Tables)

The primary database is PostgreSQL managed via Supabase. Below are the key tables and their relationships:

- `profiles`: Extends `auth.users` with user details (avatar, role: admin/user/vendor).
- `categories`: Taxonomies for agent/tool categorization.
- `agents` (Listings): Primary entity for tools/AI agents. Relates to `auth.users` (vendor) and `categories`.
- `agent_interactions`: Tracks views/clicks on agents.
- `saved_tools` & `saved_tool_folders`: Consumer features for bookmarking agents.
- `reviews`, `review_responses`, `review_votes`: User feedback system for agents.
- `leads`, `lead_clicks`: Lead generation system for vendors.
- `transactions`, `billing_transactions`: Payment tracking.
- `verification_requests`: Vendor requests for listing verification.
- `moderation_reports`: Flagged content.
- `promotions`, `listing_claims`: Vendor marketing and ownership features.
- `wishlists`, `organizations`, `organization_members`: Additional user organizational structures.
- **Rollback Note**: `tool_review_criteria` was recently dropped (via `20260720153000_drop_tool_review_criteria.sql`), reflecting the Tool Quality Review System rollback.

## 3. Routes / Pages (Frontend)

Next.js App Router is heavily utilized, featuring grouped routes (`(public)`, `(admin)`):

**Public Routes:**
- `/` - Landing page
- `/about`, `/contact`, `/privacy-policy`, `/terms` - Static informational pages
- `/directory`, `/products`, `/bundles`, `/compare` - Browsing and discovery
- `/ai-finder`, `/blog`, `/guides`, `/docs`, `/help` - Content and search tools
- `/login`, `/forgot-password`, `/reset-password` - Authentication views

**Dashboard Routes (`/dashboard`):**
- **Consumer (`/dashboard/consumer/*`)**: `history`, `orders`, `preferences`, `reviews`, `saved-tools`, `wishlist`, `settings`
- **Vendor (`/dashboard/vendor/*`)**: `analytics`, `billing`, `listings` (CRUD and verification), `orders`, `resolution`, `reviews`, `settings`, `verification`

**Admin Routes (`/admin`):**
- `/admin/reviews`, `/admin/settings`, `/admin/transactions`, `/admin/users`, `/admin/vendors`, `/admin/verifications`

## 4. API Routes / Endpoints

Located in `app/api/`, handling backend logic, webhooks, and integrations:

- **Admin Logic**: `/api/admin/pending-agents`, `/api/admin/send-approval-email`, `/api/admin/send-rejection-email`
- **Auth**: `/api/auth/signout`
- **Search & Matching**: `/api/ai-finder-match`, `/api/ai-search`, `/api/search`
- **Listings & Subscriptions**: `/api/listings/create`, `/api/listings/[id]`, `/api/create-listing-order`, `/api/create-listing-subscription`, `/api/verify-listing-subscription`
- **Vendor & Leads**: `/api/leads`, `/api/track-lead`, `/api/upgrade-to-vendor`
- **Webhooks**: `/api/razorpay-webhook`
- **Consumer Features**: `/api/saved-tools`, `/api/saved-tool-folders`

## 5. Auth Setup

The application uses **Supabase Auth** primarily, managed via the `supabase-js` client.
- Uses `auth/callback/route.ts` for OAuth/Magic Link callbacks.
- Users are synchronized with the `public.profiles` table via a database trigger (`update_updated_at_column` & auth triggers) when a new user signs up.
- Google Sign-In is implied by typical Supabase Auth patterns, coupled with standard email/password or magic links. Role-based access control (RBAC) relies on the `role` column in the `profiles` table (`user`, `vendor`, `admin`).

## 6. Environment Variables

The application relies on the following environment variables (found across configs and scripts):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_DSN`
- `PLAYWRIGHT_TEST_BASE_URL`
- `OPENAI_API_KEY`
- `GOOGLE_GEMINI_API_KEY`
- `SERPER_API_KEY`
- `NODE_ENV`
- `CI`

## 7. Leftover Files and Unused Code

The root directory contains a significant number of one-off, diagnostic, and migration scripts which indicate half-finished refactors, data cleanups, or manual interventions:
- `check-agent-state.js`, `check-existing-images.js`, `check-logos.js`, `check-pending.js`
- `clear-dicebear.js`, `preview-dicebear.js`
- `diagnose.js`, `diagnose-microlink.js`
- `download_and_upload.js`, `import_csv.js`
- `fix-profiles.js`, `fix_missing_logos.js`, `fix_missing_screenshots.js`
- `generate_all_assets.js`, `recover-logos.js`
- `migrate.js`, `migration.js`
- `scratch-test.ts`, `scratch/` folder
- `ui_refactor_diff.txt`
- `.temp/` folder inside `supabase/`

## 8. Current Known Issues

- **Orphaned Scripts**: The sheer volume of `.js` scripts in the root directory pollutes the codebase and should be moved to a dedicated `scripts/maintenance` folder or deleted if obsolete.
- **Leftover Log Files**: Files like `dev_logs.txt`, `output.log`, `check-urls.log`, and `check-logos.log` are committed or lying around in the root.
- **Rollback Artifacts**: The migration `20260720153000_drop_tool_review_criteria.sql` explicitly reverses the tool quality review system, but any frontend components that relied on those removed tables might still exist if they weren't fully cleaned up.
- **Testing Mocks**: The `test-safety.js`, `test-filter.js`, and `test-db.mjs` files in the root appear to be manual testing scripts rather than integrated unit tests.
