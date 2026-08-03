"use client";
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";

const STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");

  function load() {
    api.get(`/api/admin/orders${filter ? `?status=${filter}` : ""}`).then((data) => setOrders(data.items));
  }

  useEffect(load, [filter]);

  async function updateOrder(id, patch) {
    await api.patch(`/api/admin/orders/${id}`, patch);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-display text-2xl uppercase">Orders</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-ink/20 px-2 py-1 text-sm">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="border border-ink/15 p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold">{o.orderNumber} — {o.user.firstName} {o.user.lastName} ({o.user.email})</span>
              <span>${Number(o.total).toFixed(2)}</span>
            </div>
            <div className="flex flex-wrap gap-3 items-center text-sm">
              <select
                defaultValue={o.status}
                onChange={(e) => updateOrder(o.id, { status: e.target.value })}
                className="border border-ink/20 px-2 py-1"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                placeholder="Tracking number"
                defaultValue={o.trackingNumber || ""}
                onBlur={(e) => updateOrder(o.id, { trackingNumber: e.target.value, status: "SHIPPED" })}
                className="border border-ink/20 px-2 py-1"
              />
              <input
                placeholder="Carrier"
                defaultValue={o.carrier || ""}
                onBlur={(e) => updateOrder(o.id, { carrier: e.target.value })}
                className="border border-ink/20 px-2 py-1"
              />
              <span className="text-xs text-ink/50">{o.paymentMethod} · {o.paymentStatus}</span>
              {o.paymentStatus !== "PAID" && ["COD", "BANK_TRANSFER", "EASYPAISA", "JAZZCASH"].includes(o.paymentMethod) && (
                <button
                  onClick={() => api.post(`/api/payments/manual/${o.id}/confirm`, {}).then(load)}
                  className="text-xs underline"
                >
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
