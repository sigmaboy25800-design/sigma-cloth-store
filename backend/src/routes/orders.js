const express = require("express");
const { body } = require("express-validator");
const prisma = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { asyncHandler, ApiError } = require("../middleware/errorHandler");
const { sendEmail, orderConfirmationEmail } = require("../utils/email");
const { createStripePaymentIntent } = require("../utils/stripeClient");
const { createPaypalOrder } = require("../utils/paypalClient");

const router = express.Router();
router.use(requireAuth);

const FLAT_SHIPPING_RATE = 6.99;
const FREE_SHIPPING_THRESHOLD = 100;

function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SGC-${stamp}-${rand}`;
}

// ---------- CREATE ORDER (CHECKOUT) ----------
router.post(
  "/",
  [
    body("addressId").notEmpty(),
    body("paymentMethod").isIn(["STRIPE", "PAYPAL", "COD", "BANK_TRANSFER", "EASYPAISA", "JAZZCASH"]),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { addressId, paymentMethod, couponCode } = req.body;

    const address = await prisma.address.findFirst({ where: { id: addressId, userId: req.user.id } });
    if (!address) throw new ApiError(404, "Shipping address not found.");

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });
    if (!cartItems.length) throw new ApiError(400, "Your cart is empty.");

    // Re-validate stock & prices server-side — never trust cached client totals.
    for (const item of cartItems) {
      if (!item.product.isActive) throw new ApiError(400, `${item.product.name} is no longer available.`);
      if (item.product.stock < item.quantity) {
        throw new ApiError(400, `Only ${item.product.stock} left in stock for ${item.product.name}.`);
      }
    }

    const subtotal = cartItems.reduce((sum, i) => {
      const price = i.product.salePrice ? Number(i.product.salePrice) : Number(i.product.price);
      return sum + price * i.quantity;
    }, 0);

    let discount = 0;
    let couponId = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (coupon && coupon.isActive) {
        discount =
          coupon.discountType === "PERCENT" ? (subtotal * Number(coupon.discountValue)) / 100 : Number(coupon.discountValue);
        discount = Math.min(discount, subtotal);
        couponId = coupon.id;
      }
    }

    const shippingCost = subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
    const total = Math.max(subtotal - discount + shippingCost, 0);

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: req.user.id,
          addressId,
          subtotal,
          shippingCost,
          discount,
          total,
          couponId,
          paymentMethod,
          status: "PENDING",
          paymentStatus: "PENDING",
          items: {
            create: cartItems.map((i) => ({
              productId: i.productId,
              name: i.product.name,
              price: i.product.salePrice ? i.product.salePrice : i.product.price,
              size: i.size,
              color: i.color,
              quantity: i.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // Decrement stock immediately to prevent overselling; restore on cancellation.
      for (const i of cartItems) {
        await tx.product.update({ where: { id: i.productId }, data: { stock: { decrement: i.quantity } } });
      }
      if (couponId) {
        await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
      }
      await tx.cartItem.deleteMany({ where: { userId: req.user.id } });

      return created;
    });

    // Kick off the payment step for gateway-based methods.
    let paymentPayload = {};
    if (paymentMethod === "STRIPE") {
      const intent = await createStripePaymentIntent(total, order.orderNumber);
      await prisma.order.update({ where: { id: order.id }, data: { paymentRef: intent.id } });
      paymentPayload = { clientSecret: intent.client_secret };
    } else if (paymentMethod === "PAYPAL") {
      const paypalOrder = await createPaypalOrder(total, order.orderNumber);
      await prisma.order.update({ where: { id: order.id }, data: { paymentRef: paypalOrder.id } });
      paymentPayload = { paypalOrderId: paypalOrder.id };
    } else {
      // COD / Bank transfer / mobile wallets: order stands as placed;
      // paymentStatus flips to PAID once admin confirms (or via wallet callback).
      await sendEmail({
        to: req.user.email,
        subject: `Order ${order.orderNumber} confirmed`,
        html: orderConfirmationEmail(order),
      });
    }

    res.status(201).json({ order, payment: paymentPayload });
  })
);

// ---------- MY ORDERS ----------
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: true, shippingAddress: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  })
);

// ---------- ORDER DETAIL / TRACKING ----------
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { items: true, shippingAddress: true, coupon: true },
    });
    if (!order) throw new ApiError(404, "Order not found.");
    res.json(order);
  })
);

// ---------- CANCEL ORDER (customer, only while still PENDING) ----------
router.post(
  "/:id/cancel",
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user.id }, include: { items: true } });
    if (!order) throw new ApiError(404, "Order not found.");
    if (!["PENDING", "PAID"].includes(order.status)) {
      throw new ApiError(400, "This order can no longer be cancelled.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      for (const item of order.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
    });

    res.json({ message: "Order cancelled." });
  })
);

module.exports = router;
