const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const morgan = require("morgan");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize"); // also useful against NoSQL-style injection in query params
const path = require("path");

const { apiLimiter } = require("./middleware/rateLimiter");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const prisma = require("./config/db");

const app = express();

app.set("trust proxy", 1); // needed for correct client IPs / rate limiting behind a reverse proxy (Nginx, Render, etc.)

// ---------- Stripe webhook needs the RAW body BEFORE json parsing ----------
app.use("/api/payments/stripe/webhook", express.raw({ type: "application/json" }));

// ---------- Security headers ----------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "https://api.stripe.com", "https://api-m.paypal.com", "https://api-m.sandbox.paypal.com"],
        frameSrc: ["https://js.stripe.com", "https://www.paypal.com"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ---------- CORS (only the storefront/admin origin may call the API with credentials) ----------
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "2mb" })); // JSON body parsing — also bounds payload size against DoS
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(mongoSanitize()); // strips keys starting with "$" / containing "." from req.body/query/params
app.use(hpp()); // guards against HTTP Parameter Pollution (duplicate query keys)
app.use("/api", apiLimiter);

// Static product images (served compressed by the upload pipeline)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ---------- API routes ----------
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/products", require("./routes/products"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/wishlist", require("./routes/wishlist"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/coupons", require("./routes/coupons"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/newsletter", require("./routes/newsletter"));
app.use("/api/contact", require("./routes/contact"));

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// ---------- SEO: dynamic sitemap.xml ----------
app.get("/sitemap.xml", async (req, res) => {
  const base = process.env.CLIENT_URL || "http://localhost:3000";
  const products = await prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
  const categories = await prisma.category.findMany({ select: { slug: true } });

  const staticUrls = ["", "/shop", "/about", "/contact", "/faq", "/privacy-policy", "/terms"];

  const urlEntries = [
    ...staticUrls.map((u) => `<url><loc>${base}${u}</loc></url>`),
    ...categories.map((c) => `<url><loc>${base}/shop/${c.slug}</loc></url>`),
    ...products.map(
      (p) => `<url><loc>${base}/product/${p.slug}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod></url>`
    ),
  ].join("");

  res.set("Content-Type", "application/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}</urlset>`);
});

app.get("/robots.txt", (req, res) => {
  const base = process.env.CLIENT_URL || "http://localhost:3000";
  res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /account\nDisallow: /admin\nSitemap: ${base}/sitemap.xml\n`);
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
