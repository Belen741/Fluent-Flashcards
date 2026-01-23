# Migration Guide: Deploying to Vercel

This guide walks you through deploying Spanish for Nurses to Vercel with Clerk authentication and Supabase database.

## Prerequisites

1. **Vercel Account** - https://vercel.com
2. **Clerk Account** - https://clerk.com
3. **Supabase Account** - https://supabase.com
4. **Stripe Account** - https://stripe.com (you already have this)

---

## Step 1: Set Up Clerk

1. Go to https://clerk.com and create a new application
2. Choose "Email" and/or "Google" as sign-in methods
3. Copy your keys from the Dashboard:
   - `CLERK_PUBLISHABLE_KEY` (starts with `pk_`)
   - `CLERK_SECRET_KEY` (starts with `sk_`)

---

## Step 2: Set Up Supabase

1. Go to https://supabase.com and create a new project
2. Once created, go to **Settings > Database**
3. Copy the **Connection string (URI)** - it looks like:
   ```
   postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
4. Go to **Settings > API** and copy:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_SERVICE_KEY` (service_role key - keep this secret!)

### Create Database Tables

Run this SQL in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR,
  subscription_status VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  english_text TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  audio_url TEXT NOT NULL DEFAULT '',
  concept_id TEXT NOT NULL,
  variant_type TEXT NOT NULL,
  category TEXT NOT NULL,
  deck_id TEXT,
  tags TEXT[],
  image_key TEXT,
  audio_key TEXT,
  cloze_options TEXT[],
  cloze_correct TEXT,
  mcq_question_es TEXT,
  mcq_options_en TEXT[],
  mcq_correct_en TEXT
);
```

### Seed Flashcards Data

You have two options:

**Option A: Use Supabase Dashboard**
1. Export flashcards from current database
2. Import via Supabase CSV import

**Option B: Use the seed script**
1. Set `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` locally
2. Run: `npx tsx scripts/seed-supabase.ts`

---

## Step 3: Configure Stripe for Vercel

1. Go to Stripe Dashboard > Developers > Webhooks
2. Create a new webhook endpoint:
   - URL: `https://YOUR-VERCEL-DOMAIN.vercel.app/api/stripe-webhook`
   - Events to listen:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
3. Copy the **Webhook Signing Secret** (`whsec_...`)

---

## Step 4: Deploy to Vercel

### Option A: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
vercel
```

### Option B: Via GitHub

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Vercel will auto-detect Vite framework

---

## Step 5: Set Environment Variables in Vercel

Go to your Vercel project > Settings > Environment Variables and add:

| Variable | Value |
|----------|-------|
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_...` (from Clerk) |
| `CLERK_SECRET_KEY` | `sk_...` (from Clerk) |
| `SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | `eyJ...` (service role key) |
| `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

**Important:** Variables starting with `VITE_` are exposed to the frontend. Keep all other secrets server-side only.

---

## Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Test the free module (no login required)
3. Click on a premium module to trigger sign-in
4. Sign up/in via Clerk
5. Test Stripe checkout (use test cards in test mode)

---

## File Structure for Vercel

```
/
├── api/                    # Serverless functions (auto-detected by Vercel)
│   ├── flashcards.ts
│   ├── subscription.ts
│   ├── checkout.ts
│   ├── customer-portal.ts
│   ├── products.ts
│   ├── stripe-webhook.ts
│   └── auth/
│       └── user.ts
├── client/                 # Frontend (Vite)
│   └── src/
├── vercel.json             # Vercel configuration
└── package.json
```

---

## Differences from Replit

| Feature | Replit | Vercel |
|---------|--------|--------|
| Auth | Replit Auth (OpenID) | Clerk |
| Database | Replit PostgreSQL | Supabase |
| API | Express server | Serverless functions |
| Hosting | Replit deployment | Vercel Edge |
| Build | Custom build script | `vite build` |

---

## Troubleshooting

### "401 Unauthorized" on API calls
- Check that `VITE_CLERK_PUBLISHABLE_KEY` is set (with `VITE_` prefix)
- Verify `CLERK_SECRET_KEY` is set for serverless functions

### Stripe webhook not working
- Verify webhook URL matches your Vercel domain
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Review Vercel function logs for errors

### Database connection errors
- Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct
- Check Supabase project is not paused (free tier pauses after inactivity)

---

## Local Development

To test locally before deploying:

```bash
# Create .env.local file
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Run with Vercel CLI
vercel dev
```

This will simulate the Vercel serverless environment locally.
