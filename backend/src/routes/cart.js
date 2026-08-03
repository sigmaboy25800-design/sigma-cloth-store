const express = require("express");
const { body } = require("express-validator");
const prisma = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { asyncHandler, ApiError } = require("../middleware/errorHandler");

const router = express.Router();
router.use(requireAuth);

// ---------- GET CART ----------
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: { include: { images: { take: 1, orderBy: { position: "asc" } } } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(items);
  })
);

// ---------- ADD TO CART ----------
router.post(
  "/",
  [body("productId").notEmpty(), body("quantity").optional().isInt({ min: 1 })],
  validate,
  asyncHandler(async (req, res) => {
    const { productId, size, color, quantity = 1 } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) throw new ApiError(404, "Product not available.");
    if (product.stock < quantity) throw new ApiError(400, "Not enough stock available.");

    const item = await prisma.cartItem.upsert({
      where: { userId_productId_size_color: { userId: req.user.id, productId, size: size || null, color: color || null } },
      update: { quantity: { increment: quantity } },
      create: { userId: req.user.id, productId, size, color, quantity },
    });
    res.status(201).json(item);
  })
);

// ---------- UPDATE QUANTITY ----------
router.put(
  "/:id",
  [body("quantity").isInt({ min: 1 })],
  validate,
  asyncHandler(async (req, res) => {
    const item = await prisma.cartItem.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) throw new ApiError(404, "Cart item not found.");
    const updated = await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: req.body.quantity } });
    res.json(updated);
  })
);

// ---------- REMOVE ITEM ----------
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await prisma.cartItem.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) throw new ApiError(404, "Cart item not found.");
    await prisma.cartItem.delete({ where: { id: item.id } });
    res.json({ message: "Removed from cart." });
  })
);

// ---------- CLEAR CART ----------
router.delete(
  "/",
  asyncHandler(async (req, res) => {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    res.json({ message: "Cart cleared." });
  })
);

module.exports = router;
