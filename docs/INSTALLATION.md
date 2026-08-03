# Installation Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (local install, or a hosted instance — Supabase, Railway, Neon, RDS, etc.)
- A Stripe account (free, sandbox/test mode is fine to start)
- A PayPal Developer account (free, sandbox mode is fine to start)
- An SMTP provider for transactional email (SendGrid has a free tier)

## 1. Clone and install dependencies

```bash
cd sigma-cloth-store/backend
npm install

cd ../frontend
npm install
```

## 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in at minimum:
- `DATABASE_URL` — your PostgreSQL connection string
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET` — generate with e.g. `openssl rand -hex 32`
- `SMTP_*` and `EMAIL_FROM` — your email provider's credentials
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` — from your Stripe dashboard
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` — from your PayPal developer dashboard

## 3. Set up the database

```bash
npx prisma migrate dev --name init
npm run seed
```

The seed script creates your first admin account. By default it uses:
- Email: `admin@sigmaclothstore.com`
- Password: `ChangeMe123!`

**Change this password immediately after your first login.** You can override these before seeding
by setting `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `.env`.

It also creates starter categories (Men/Women/Kids/Accessories) and a few sample products so the
storefront isn't empty.

## 4. Run the backend

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default. Visit `http://localhost:5000/api/health` to
confirm it's running.

## 5. Configure and run the frontend

```bash
cd ../frontend
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000`), your Stripe publishable key,
and your PayPal client ID.

```bash
npm run dev
```

Visit `http://localhost:3000`.

## 6. Log in as admin

Go to `http://localhost:3000/account/login` and sign in with the seeded admin credentials, then
visit `http://localhost:3000/admin` to manage products, orders, coupons, and banners.

## 7. Testing payments locally

- **Stripe:** use test card `4242 4242 4242 4242`, any future expiry, any CVC. To receive webhook
  events locally, install the Stripe CLI and run:
  ```bash
  stripe listen --forward-to localhost:5000/api/payments/stripe/webhook
  ```
  Copy the webhook signing secret it prints into `STRIPE_WEBHOOK_SECRET` in your `.env`.
- **PayPal:** use a Sandbox buyer account (create one at developer.paypal.com) to complete a test
  checkout.

## Troubleshooting

- **"Invalid or expired token" on every request:** check that `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`
  are set and that your system clock is correct.
- **CORS errors in the browser console:** make sure `CLIENT_URL` in the backend `.env` exactly
  matches the URL you're loading the frontend from (including port).
- **Images not uploading:** confirm the `uploads/products` directory is writable by the Node process.
