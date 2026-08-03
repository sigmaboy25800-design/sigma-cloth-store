"use client";
import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";

export default function StripePaymentForm({ orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { refresh } = useCart();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/account/orders/${orderId}?placed=1`,
      },
    });

    // If we get here, confirmation failed before redirect (e.g. card declined).
    // On success, Stripe redirects the browser to return_url itself.
    if (confirmError) {
      setError(confirmError.message);
      setProcessing(false);
    } else {
      await refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sigma text-sm">{error}</p>}
      <button disabled={!stripe || processing} className="btn-primary w-full disabled:opacity-40">
        {processing ? "Processing…" : "Pay Now"}
      </button>
    </form>
  );
}
