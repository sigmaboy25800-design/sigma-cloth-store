const express = require("express");
const { body } = require("express-validator");
const prisma = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { asyncHandler, ApiError } = require("../middleware/errorHandler");

const router = express.Router();

// ---------- CREATE / UPDATE A REVIEW ----------
router.post(
  "/:productId",
  requireAuth,
  [body("rating").isInt({ min: 1, max: 5 }), body("comment").optional().trim().isLength({ max: 2000 })],
  validate,
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    // Only customers who actually bought & received the item get the
    // "verified purchase" badge — determined server-side, never trusted from the client.
    const purchased = await prisma.orderItem.findFirst({
      where: { productId, order: { userId: req.user.id, status: "DELIVERED" } },
    });

    const review = await prisma.review.upsert({
      where: { productId_userId: { productId, userId: req.user.id } },
      update: { rating, title, comment },
      create: {
        productId,
        userId: req.user.id,
        rating,
        title,
        comment,
        isVerifiedPurchase: !!purchased,
      },
    });
    res.status(201).json(review);
  })
);

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review || (review.userId !== req.user.id && req.user.role === "CUSTOMER")) {
      throw new ApiError(404, "Review not found.");
    }
    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ message: "Review deleted." });
  })
);

module.exports = router;
