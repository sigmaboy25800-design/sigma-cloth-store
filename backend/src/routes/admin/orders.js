const express = require("express");
const prisma = require("../../config/db");
const { asyncHandler, ApiError } = require("../../middleware/errorHandler");
const { sendEmail } = require("../../utils/email");

const router = express.Router();

// ---------- LIST ALL ORDERS (filterable) ----------
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { status, paymentStatus, page = 1, limit = 30 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const take = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * take;

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true, user: { select: { firstName: true, lastName: true, email: true } }, shippingAddress: true },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.order.count({ where }),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / take) });
  })
);

// ---------- ORDER DETAIL ----------
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true, user: true, shippingAddress: true, coupon: true },
    });
    if (!order) throw new ApiError(404, "Order not found.");
    res.json(order);
  })
);

// ---------- UPDATE ORDER STATUS / TRACKING ----------
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const { status, trackingNumber, carrier, shippingStatus } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status, trackingNumber, carrier, shippingStatus },
      include: { user: true },
    });

    if (trackingNumber && status === "SHIPPED") {
      await sendEmail({
        to: order.user.email,
        subject: `Your order ${order.orderNumber} has shipped`,
        html: `<p>Your order is on its way! Tracking number: <strong>${trackingNumber}</strong>${carrier ? ` via ${carrier}` : ""}.</p>`,
      });
    }

    res.json(order);
  })
);

module.exports = router;
