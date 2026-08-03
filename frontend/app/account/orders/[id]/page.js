"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { api } from "../../../../lib/api";

const STEPS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const justPlaced = searchParams.get("placed") === "1";

  useEffect(() => {
    api.get(`/api/orders/${id}`).then(setOrder).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="container-wide py-24 text-center text-sigma">{error}</div>;
  if (!order) return <div className="container-wide py-24 text-center">Loading order…</div>;

  const stepIndex = STEPS.indexOf(order.status);

  return (
    <div className="container-wide py-12 max-w-2xl">
      {justPlaced && <p className="bg-stone/20 p-4 text-sm mb-8">Thank you — your order has been placed!</p>}
      <h1 className="font-display text-3xl uppercase mb-2">Order {order.orderNumber}</h1>
      <p className="text-sm text-ink/50 mb-8">Placed on {new Date(order.createdAt).toLocaleString()}</p>

      {order.status !== "CANCELLED" && (
        <div className="flex justify-between mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${i <= stepIndex ? "bg-ink" : "bg-stone/40"}`} />
              <p className="text-xs uppercase">{s}</p>
            </div>
          ))}
        </div>
      )}

      {order.trackingNumber && (
        <p className="text-sm mb-8">Tracking Number: <strong>{order.trackingNumber}</strong> {order.carrier && `via ${order.carrier}`}</p>
      )}

      <ul className="space-y-4 mb-8">
        {order.items.map((i) => (
          <li key={i.id} className="flex justify-between text-sm border-b border-ink/10 pb-3">
            <span>{i.name} {i.size && `(${i.size})`} {i.color && `· ${i.color}`} × {i.quantity}</span>
            <span>${(Number(i.price) * i.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="space-y-1 text-sm max-w-xs ml-auto">
        <div className="flex justify-between"><span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Discount</span><span>-${Number(order.discount).toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Shipping</span><span>${Number(order.shippingCost).toFixed(2)}</span></div>
        <div className="flex justify-between font-semibold border-t border-ink/20 pt-2 mt-2"><span>Total</span><span>${Number(order.total).toFixed(2)}</span></div>
      </div>

      <div className="mt-10 text-sm text-ink/60">
        <p>Shipping to: {order.shippingAddress.fullName}, {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.country}</p>
        <p className="mt-1">Payment: {order.paymentMethod} — {order.paymentStatus}</p>
      </div>
    </div>
  );
}
