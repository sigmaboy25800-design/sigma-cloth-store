const express = require("express");
const bcrypt = require("bcryptjs");
const { body } = require("express-validator");
const prisma = require("../config/db");
const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");
const { asyncHandler, ApiError } = require("../middleware/errorHandler");
const { requireAuth } = require("../middleware/auth");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateRawToken,
  hashToken,
} = require("../utils/tokens");
const { sendEmail, verificationEmail, resetPasswordEmail } = require("../utils/email");

const router = express.Router();

const REFRESH_COOKIE = "sigma_refresh_token";
const isProd = process.env.NODE_ENV === "production";

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/api/auth",
  });
}

// ---------- SIGN UP ----------
router.post(
  "/signup",
  authLimiter,
  [
    body("email").isEmail().normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters.")
      .matches(/\d/)
      .withMessage("Password must contain a number."),
    body("firstName").trim().notEmpty(),
    body("lastName").trim().notEmpty(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ApiError(409, "An account with this email already exists.");

    // bcrypt with a 12-round salt — strong default for password hashing.
    const passwordHash = await bcrypt.hash(password, 12);

    const rawToken = generateRawToken();
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        emailVerifyToken: hashToken(rawToken),
        emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const link = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}&uid=${user.id}`;
    await sendEmail({ to: user.email, subject: "Verify your email", html: verificationEmail(link) });

    res.status(201).json({
      message: "Account created. Please check your email to verify your account.",
    });
  })
);

// ---------- VERIFY EMAIL ----------
router.post(
  "/verify-email",
  [body("token").notEmpty(), body("uid").notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const { token, uid } = req.body;
    const user = await prisma.user.findUnique({ where: { id: uid } });

    if (
      !user ||
      !user.emailVerifyToken ||
      user.emailVerifyToken !== hashToken(token) ||
      !user.emailVerifyExpires ||
      user.emailVerifyExpires < new Date()
    ) {
      throw new ApiError(400, "Verification link is invalid or has expired.");
    }

    await prisma.user.update({
      where: { id: uid },
      data: { isEmailVerified: true, emailVerifyToken: null, emailVerifyExpires: null },
    });

    res.json({ message: "Email verified successfully. You can now log in." });
  })
);

// ---------- LOGIN ----------
router.post(
  "/login",
  authLimiter,
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Same generic error whether the email doesn't exist or the password
    // is wrong — avoids leaking which emails are registered.
    if (!user) throw new ApiError(401, "Invalid email or password.");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new ApiError(401, "Invalid email or password.");

    if (!user.isEmailVerified) {
      throw new ApiError(403, "Please verify your email before logging in.");
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    const { passwordHash, ...safeUser } = user;
    res.json({ user: safeUser, accessToken });
  })
);

// ---------- REFRESH ACCESS TOKEN ----------
router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) throw new ApiError(401, "No refresh token provided.");

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new ApiError(401, "Refresh token invalid or expired.");
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.refreshTokenVersion !== payload.tokenVersion) {
      throw new ApiError(401, "Session no longer valid. Please log in again.");
    }

    const accessToken = signAccessToken(user);
    res.json({ accessToken });
  })
);

// ---------- LOGOUT ----------
router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    res.json({ message: "Logged out." });
  })
);

// ---------- LOGOUT ALL DEVICES ----------
router.post(
  "/logout-all",
  requireAuth,
  asyncHandler(async (req, res) => {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { refreshTokenVersion: { increment: 1 } },
    });
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    res.json({ message: "Logged out of all devices." });
  })
);

// ---------- FORGOT PASSWORD ----------
router.post(
  "/forgot-password",
  authLimiter,
  [body("email").isEmail().normalizeEmail()],
  validate,
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond with the same message — don't reveal account existence.
    if (user) {
      const rawToken = generateRawToken();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: hashToken(rawToken),
          passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      const link = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}&uid=${user.id}`;
      await sendEmail({ to: email, subject: "Reset your password", html: resetPasswordEmail(link) });
    }

    res.json({ message: "If an account with that email exists, a reset link has been sent." });
  })
);

// ---------- RESET PASSWORD ----------
router.post(
  "/reset-password",
  authLimiter,
  [
    body("uid").notEmpty(),
    body("token").notEmpty(),
    body("password").isLength({ min: 8 }).matches(/\d/),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { uid, token, password } = req.body;
    const user = await prisma.user.findUnique({ where: { id: uid } });

    if (
      !user ||
      !user.passwordResetToken ||
      user.passwordResetToken !== hashToken(token) ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      throw new ApiError(400, "Reset link is invalid or has expired.");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: uid },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        refreshTokenVersion: { increment: 1 }, // invalidate old sessions
      },
    });

    res.json({ message: "Password reset successfully. Please log in." });
  })
);

// ---------- CHANGE PASSWORD (logged in) ----------
router.post(
  "/change-password",
  requireAuth,
  [body("currentPassword").notEmpty(), body("newPassword").isLength({ min: 8 }).matches(/\d/)],
  validate,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new ApiError(401, "Current password is incorrect.");

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, refreshTokenVersion: { increment: 1 } },
    });

    res.json({ message: "Password changed. Please log in again." });
  })
);

module.exports = router;
