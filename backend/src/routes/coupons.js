const express = require("express");
const prisma = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler, ApiError } = require("../middleware/errorHandler");

const router = express.Router();

// ---------- VALIDATE / APPLY A COUPON AT CHECKOUT ----------
router.post(
  "/validate",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { code, subtotal } = req.body;
    const coupon = await prisma.coupon.findUnique({ where: { code: (code || "").toUpperCase() } });

    if (!coupon || !coupon.isActive) throw new ApiError(404, "Coupon code is invalid.");
    if (coupon.startsAt && coupon.startsAt > new Date()) throw new ApiError(400, "This coupon isn't active yet.");
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new ApiError(400, "This coupon has expired.");
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new ApiError(400, "This coupon has reached its usage limit.");
    if (coupon.minOrderAmount && Number(subtotal) < Number(coupon.minOrderAmount)) {
      throw new ApiError(400, `Minimum order of $${coupon.minOrderAmount} required for this coupon.`);
    }

    const discount =
      coupon.discountType === "PERCENT"
        ? (Number(subtotal) * Number(coupon.discountValue)) / 100
        : Number(coupon.discountValue);

    res.json({ coupon, discount: Math.min(discount, Number(subtotal)) });
  })
);

module.exports = router;
