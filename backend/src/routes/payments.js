const express = require("express");
const prisma = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler, ApiError } = require("../middleware/errorHandler");
const { constructWebhookEvent } = require("../utils/stripeClient");
const { capturePaypalOrder } = require("../utils/paypalClient");
const { sendEmail, orderConfirmationEmail } = require("../utils/email");

const router = express.Router();

// ---------- STRIPE WEBHOOK ----------
// Mounted with express.raw() in app.js (Stripe requires the raw body to
// verify the signature) — this is the source of truth for payment
// confirmation, not the client redirect, since the client can't be trusted.
router.post(
  "/stripe/webhook",
  asyncHandler(async (req, res) => {
    const signature = req.headers["stripe-signature"];
    let event;
    try {
      event = constructWebhookEvent(req.body, signature);
    } catch (err) {
      return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      const order = await prisma.order.findFirst({ where: { paymentRef: intent.id }, include: { items: true, user: true } });
      if (order && order.paymentStatus !== "PAID") {
        await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID", status: "PROCESSING" } });
        await sendEmail({ to: order.user.email, subject: `Order ${order.orderNumber} confirmed`, html: orderConfirmationEmail(order) });
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object;
      await prisma.order.updateMany({ where: { paymentRef: intent.id }, data: { paymentStatus: "FAILED" } });
    }

    res.json({ received: true });
  })
);

// ---------- PAYPAL: CAPTURE AFTER CUSTOMER APPROVAL ----------
router.post(
  "/paypal/capture/:paypalOrderId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const capture = await capturePaypalOrder(req.params.paypalOrderId);
    const order = await prisma.order.findFirst({
      where: { paymentRef: req.params.paypalOrderId, userId: req.user.id },
      include: { items: true, user: true },
    });
    if (!order) throw new ApiError(404, "Order not found.");

    if (capture.status === "COMPLETED") {
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID", status: "PROCESSING" } });
      await sendEmail({ to: order.user.email, subject: `Order ${order.orderNumber} confirmed`, html: orderConfirmationEmail(order) });
    } else {
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } });
    }

    res.json({ status: capture.status });
  })
);

// ---------- BANK TRANSFER / EASYPAISA / JAZZCASH: manual/admin confirmation ----------
// These wallets require a signed merchant integration (server-to-server
// callback with a hash/signature verification) that only becomes available
// once you have live merchant credentials from the provider. The order is
// recorded as PENDING immediately; wire the provider's callback into this
// same "mark paid" logic (see docs/DEPLOYMENT.md) once you have credentials.
router.post(
  "/manual/:orderId/confirm",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.user.role !== "ADMIN" && req.user.role !== "STAFF") {
      throw new ApiError(403, "Only staff can confirm manual payments.");
    }
    const order = await prisma.order.update({
      where: { id: req.params.orderId },
      data: { paymentStatus: "PAID", status: "PROCESSING" },
      include: { items: true, user: true },
    });
    await sendEmail({ to: order.user.email, subject: `Payment received for ${order.orderNumber}`, html: orderConfirmationEmail(order) });
    res.json(order);
  })
);

module.exports = router;
