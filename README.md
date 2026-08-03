# Sigma Cloth Store

A full-stack, production-oriented e-commerce platform for a clothing brand.

- **Backend:** Node.js + Express + PostgreSQL (via Prisma ORM) — REST API
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS — storefront + admin dashboard, PWA-enabled
- **Payments:** Stripe (cards, Apple Pay, Google Pay) and PayPal fully wired end-to-end; Cash on
  Delivery and Bank Transfer built in; EasyPaisa/JazzCash scaffolded, pending your merchant credentials

## Project structure

```
sigma-cloth-store/
├── backend/          Express API, Prisma schema, all business logic
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── routes/         auth, users, products, cart, wishlist, reviews,
│   │   │                   coupons, orders, payments, admin/*
│   │   ├── middleware/      auth (JWT+RBAC), rate limiting, validation, errors
│   │   ├── utils/           tokens, email, image upload/compression, stripe/paypal clients
│   │   └── app.js / server.js
│   └── .env.example
├── frontend/         Next.js storefront + admin dashboard
│   ├── app/                 all pages (App Router)
│   ├── components/
│   ├── context/              Auth + Cart state
│   ├── lib/api.js            API client (JWT + auto-refresh)
│   └── .env.example
└── docs/
    ├── API.md
    ├── INSTALLATION.md
    └── DEPLOYMENT.md
```

## What's fully working out of the box

- Real authentication: signup, email verification, login, JWT access + httpOnly refresh cookie,
  logout / logout-all-devices, forgot/reset password, change password — bcrypt hashing throughout,
  no dummy auth.
- Full storefront: homepage, category browsing, search + filters, product detail with image
  gallery/zoom, size/color selection, reviews & ratings, wishlist, recently viewed, related products,
  cart, checkout, order tracking, order history.
- Admin dashboard (role-gated): product CRUD with multi-image upload & automatic compression,
  stock/price management, categories, coupons, homepage banners, order management with tracking
  numbers and status updates, customer list, revenue/sales analytics.
- Payments: Stripe PaymentIntents (webhook-confirmed) and PayPal Orders v2 (capture flow) are both
  live — you only need to drop in your own API keys.
- Security: bcrypt password hashing, JWT auth with RBAC, rate limiting (general + strict on auth
  routes), Helmet/CSP, CORS locked to your frontend origin, input validation & sanitization, centralized
  error handling that never leaks internals in production.
- SEO: per-page meta tags, Open Graph/Twitter cards, JSON-LD structured data (Product,
  AggregateRating, ClothingStore), dynamic sitemap.xml, robots.txt, canonical URLs.
- Performance: image compression to WebP on upload, lazy-loaded images via `next/image`, response
  compression, Next.js code splitting out of the box.
- PWA: installable, manifest included (replace the placeholder icons before shipping).

## What needs something from you before it's "live"

These aren't missing code — they're third-party accounts only you can create:

| Feature | What you need to provide |
|---|---|
| Stripe payments | Your own Stripe secret/publishable keys + webhook secret |
| PayPal payments | Your own PayPal REST app client ID/secret |
| EasyPaisa / JazzCash | A signed merchant agreement with the provider — integration points are stubbed in `backend/src/routes/payments.js` |
| Transactional email | An SMTP provider (SendGrid, Mailgun, etc.) |
| SMS notifications | A Twilio (or similar) account — hook it into `backend/src/utils/` alongside the email utility |
| Hosting/domain/SSL | Your own server or cloud provider account |

See `docs/INSTALLATION.md` to run this locally and `docs/DEPLOYMENT.md` to ship it.
