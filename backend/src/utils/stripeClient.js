const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe's PaymentIntents API natively covers Visa/Mastercard/etc, plus
// Apple Pay and Google Pay through the same intent when using Stripe's
// Payment Element / Payment Request Button on the frontend.
async function createStripePaymentIntent(amountUsd, orderNumber) {
  return stripe.paymentIntents.create({
    amount: Math.round(amountUsd * 100), // Stripe expects the smallest currency unit
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: { orderNumber },
  });
}

function constructWebhookEvent(rawBody, signature) {
  return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
}

module.exports = { stripe, createStripePaymentIntent, constructWebhookEvent };
