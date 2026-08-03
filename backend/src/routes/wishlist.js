const express = require("express");
const prisma = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler, ApiError } = require("../middleware/errorHandler");

const router = express.Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: { product: { include: { images: { take: 1, orderBy: { position: "asc" } } } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(items);
  })
);

router.post(
  "/:productId",
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({ where: { id: req.params.productId } });
    if (!product) throw new ApiError(404, "Product not found.");
    const item = await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: req.user.id, productId: product.id } },
      update: {},
      create: { userId: req.user.id, productId: product.id },
    });
    res.status(201).json(item);
  })
);

router.delete(
  "/:productId",
  asyncHandler(async (req, res) => {
    await prisma.wishlistItem.deleteMany({ where: { userId: req.user.id, productId: req.params.productId } });
    res.json({ message: "Removed from wishlist." });
  })
);

router.get(
  "/recently-viewed",
  asyncHandler(async (req, res) => {
    const items = await prisma.recentlyViewed.findMany({
      where: { userId: req.user.id },
      include: { product: { include: { images: { take: 1, orderBy: { position: "asc" } } } } },
      orderBy: { viewedAt: "desc" },
      take: 12,
    });
    res.json(items);
  })
);

module.exports = router;
