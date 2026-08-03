"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";

export default function PaypalPaymentButton({ paypalOrderId, orderId }) {
  const router = useRouter();
  const { refresh } = useCart();
  const [error, setError] = useState(null);

  return (
    <div>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={() => Promise.resolve(paypalOrderId)}
        onApprove={async () => {
          try {
            const result = await api.post(`/api/payments/paypal/capture/${paypalOrderId}`, {});
            if (result.status === "COMPLETED") {
              await refresh();
              router.push(`/account/orders/${orderId}?placed=1`);
            } else {
              setError("Payment could not be completed. Please try again.");
            }
          } catch (e) {
            setError(e.message);
          }
        }}
        onError={(err) => setError(err.message || "PayPal checkout failed.")}
      />
      {error && <p className="text-sigma text-sm mt-2">{error}</p>}
    </div>
  );
}
