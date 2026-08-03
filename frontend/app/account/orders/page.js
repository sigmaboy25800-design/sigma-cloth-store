"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api";

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) api.get("/api/orders").then(setOrders);
  }, [user]);

  if (loading) return null;
  if (!user) {
    return (
      <div className="container-wide py-24 text-center">
        <p className="mb-4">Sign in to view your orders.</p>
        <Link href="/account/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="container-wide py-12 max-w-3xl">
      <h1 className="font-display text-3xl uppercase mb-8">Order History</h1>
      {orders.length === 0 ? (
        <p className="text-sm text-ink/50">You haven't placed any orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/account/orders/${o.id}`} className="flex justify-between items-center border border-ink/15 p-4 hover:border-ink">
                <div>
                  <p className="text-sm font-semibold">{o.orderNumber}</p>
                  <p className="text-xs text-ink/50">{new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">${Number(o.total).toFixed(2)}</p>
                  <p className="text-xs uppercase text-ink/50">{o.status}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
