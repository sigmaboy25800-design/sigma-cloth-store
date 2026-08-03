# Deployment Guide

This app is two independent deployables: the **backend** (Node/Express API + Postgres) and the
**frontend** (Next.js). They can live on different hosts as long as `NEXT_PUBLIC_API_URL` (frontend)
and `CLIENT_URL` (backend, for CORS) point at each other correctly.

## Option A — Simple managed hosting (recommended to start)

- **Backend:** Render, Railway, or Fly.io all support a Node web service + managed PostgreSQL with
  minimal config.
  1. Create a PostgreSQL instance; copy its connection string into `DATABASE_URL`.
  2. Create a web service pointing at `backend/`, build command `npm install && npx prisma migrate deploy`,
     start command `npm start`.
  3. Set all the environment variables from `.env.example` in the host's dashboard (never commit `.env`).
  4. Once live, run `npm run seed` once (via the host's shell/console feature) to create your admin account.

- **Frontend:** Vercel is the natural fit for Next.js.
  1. Import the `frontend/` folder as a new Vercel project.
  2. Set the environment variables from `frontend/.env.example`, pointing `NEXT_PUBLIC_API_URL` at
     your deployed backend URL.
  3. Deploy.

- **Product images:** the backend currently stores uploaded images on local disk
  (`backend/uploads/products`). This works, but local disk on most PaaS hosts is **ephemeral** —
  it can be wiped on redeploy. For production, swap `backend/src/utils/upload.js` to upload to
  Amazon S3, Cloudflare R2, or Cloudinary instead of `sharp(...).toFile(...)`, and return the CDN URL.
  This is a contained change (one function) since the rest of the app just stores/serves a URL string.

## Option B — Self-hosted (VPS + Docker)

1. Provision a VPS (DigitalOcean, Hetzner, Linode) and install Docker + Docker Compose, or run
   Node 18+/PostgreSQL directly.
2. Put Nginx (or Caddy) in front as a reverse proxy for TLS termination — Let's Encrypt via Certbot
   or Caddy's automatic HTTPS both work well.
3. Run the backend with a process manager (`pm2 start src/server.js --name sigma-api`) so it
   restarts on crash/reboot.
4. Build and run the frontend with `npm run build && npm start`, also under pm2 or a container.
5. Point your domain's DNS at the VPS; configure Nginx to route `/` to the frontend port and
   `/api` (if same-domain) to the backend port, or use separate subdomains
   (`shop.example.com` / `api.example.com`) with `CLIENT_URL`/`NEXT_PUBLIC_API_URL` set accordingly.

## Before going live — checklist

- [ ] Set `NODE_ENV=production` on the backend.
- [ ] Replace every placeholder secret in `.env` with strong, unique values (`openssl rand -hex 32`).
- [ ] Switch Stripe and PayPal from test/sandbox to live keys, and re-point the Stripe webhook URL
      at your production domain in the Stripe dashboard.
- [ ] Set up EasyPaisa/JazzCash only once you have a signed merchant agreement — wire their
      server-to-server callback into the `paymentStatus: "PAID"` update in
      `backend/src/routes/payments.js` (`/manual/:orderId/confirm` shows the exact pattern to follow).
- [ ] Move product image storage to S3/R2/Cloudinary (see note above) so uploads survive redeploys.
- [ ] Replace the placeholder PWA icons in `frontend/public/` with your real brand icons
      (192×192 and 512×512 PNGs referenced in `manifest.json`).
- [ ] Have a lawyer review the starter Privacy Policy and Terms & Conditions text before publishing.
- [ ] Set up automated PostgreSQL backups (most managed hosts offer this with one click).
- [ ] Point a real domain at both frontend and backend, and update `CLIENT_URL` /
      `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SITE_URL` accordingly.
- [ ] Change the seeded admin password immediately.
