const rateLimit = require("express-rate-limit");

// General API limiter — generous, protects against basic abuse/scraping.
const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MIN || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down and try again shortly." },
});

// Strict limiter for auth endpoints (login, signup, forgot-password) to
// blunt credential-stuffing and brute-force attacks.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in 15 minutes." },
});

module.exports = { apiLimiter, authLimiter };
