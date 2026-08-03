# API Documentation

Base URL (local): `http://localhost:5000/api`

All request/response bodies are JSON unless noted. Authenticated routes expect
`Authorization: Bearer <accessToken>`; the refresh token travels automatically as an httpOnly cookie.

## Auth — `/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | — | Create account. Body: `email, password, firstName, lastName, phone?` |
| POST | `/auth/verify-email` | — | Body: `uid, token` (from the emailed link) |
| POST | `/auth/login` | — | Body: `email, password`. Returns `{ user, accessToken }`, sets refresh cookie |
| POST | `/auth/refresh` | cookie | Returns a new `{ accessToken }` |
| POST | `/auth/logout` | — | Clears refresh cookie |
| POST | `/auth/logout-all` | ✓ | Invalidates all sessions (password-change style) |
| POST | `/auth/forgot-password` | — | Body: `email` |
| POST | `/auth/reset-password` | — | Body: `uid, token, password` |
| POST | `/auth/change-password` | ✓ | Body: `currentPassword, newPassword` |

## Users — `/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | ✓ | Current profile + addresses |
| PUT | `/users/me` | ✓ | Body: `firstName?, lastName?, phone?` |
| GET | `/users/me/addresses` | ✓ | List addresses |
| POST | `/users/me/addresses` | ✓ | Create address |
| PUT | `/users/me/addresses/:id` | ✓ | Update address |
| DELETE | `/users/me/addresses/:id` | ✓ | Remove address |

## Products — `/products`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products` | — | Query: `search, category, brand, minPrice, maxPrice, size, color, sort, page, limit` |
| GET | `/products/featured` | — | Homepage featured products |
| GET | `/products/:slug` | optional | Product detail; logs "recently viewed" if authenticated |
| GET | `/products/:slug/related` | — | Same-category related products |

## Categories — `/categories`

`GET /categories` (top-level with children), `GET /categories/:slug`

## Cart — `/cart` (all require auth)

`GET /cart` · `POST /cart` (`productId, size?, color?, quantity?`) · `PUT /cart/:id` (`quantity`) ·
`DELETE /cart/:id` · `DELETE /cart` (clear)

## Wishlist — `/wishlist` (all require auth)

`GET /wishlist` · `POST /wishlist/:productId` · `DELETE /wishlist/:productId` ·
`GET /wishlist/recently-viewed`

## Reviews — `/reviews`

`POST /reviews/:productId` (auth; `rating 1-5, title?, comment?`) · `DELETE /reviews/:id` (auth)

## Coupons — `/coupons`

`POST /coupons/validate` (auth; `code, subtotal`) → `{ coupon, discount }`

## Orders — `/orders` (all require auth)

| Method | Path | Description |
|---|---|---|
| POST | `/orders` | Checkout. Body: `addressId, paymentMethod, couponCode?`. Returns `{ order, payment }` — `payment.clientSecret` for Stripe, `payment.paypalOrderId` for PayPal |
| GET | `/orders` | My order history |
| GET | `/orders/:id` | Order detail / tracking |
| POST | `/orders/:id/cancel` | Cancel while still PENDING/PAID |

## Payments — `/payments`

- `POST /payments/stripe/webhook` — Stripe calls this directly (raw body, signature-verified). Source
  of truth for marking an order PAID.
- `POST /payments/paypal/capture/:paypalOrderId` — called by the frontend after the buyer approves in
  the PayPal popup.
- `POST /payments/manual/:orderId/confirm` — admin/staff only; marks COD/Bank/EasyPaisa/JazzCash
  orders as paid.

## Admin — `/admin` (all require ADMIN or STAFF role)

- `GET/POST /admin/products`, `PUT/DELETE /admin/products/:id`
- `POST /admin/products/:id/images` (multipart, field name `images`, up to 8), `DELETE /admin/products/:id/images/:imageId`
- `PATCH /admin/products/:id/stock` (`stock`)
- `POST/PUT/DELETE /admin/categories[/:id]`, `POST/DELETE /admin/brands[/:id]`
- `GET/POST/PUT/DELETE /admin/banners[/:id]` (multipart `image` field on create)
- `GET/POST/PUT/DELETE /admin/coupons[/:id]`
- `GET /admin/orders` (query: `status, paymentStatus, page, limit`), `GET /admin/orders/:id`,
  `PATCH /admin/orders/:id` (`status, trackingNumber, carrier, shippingStatus`)
- `GET /admin/customers`
- `GET /admin/dashboard` — summary stats + low stock + recent orders
- `GET /admin/sales` (query: `from, to`) — revenue report grouped by day and payment method

## Misc

- `POST /newsletter/subscribe` (`email`)
- `POST /contact` (`name, email, message`)
- `GET /health`
- `GET /sitemap.xml`, `GET /robots.txt` (also generated natively by the Next.js frontend)

## Error format

```json
{ "error": "Human-readable message." }
```

Validation errors additionally include:

```json
{ "error": "Validation failed.", "details": [{ "field": "email", "message": "..." }] }
```
