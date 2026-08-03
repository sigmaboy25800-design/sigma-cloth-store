"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/api/admin/dashboard").then(setData).catch(() => {});
  }, []);

  if (!data) return <p className="text-sm text-ink/50">Loading dashboard…</p>;

  const stats = [
    { label: "Total Revenue (paid orders)", value: `$${Number(data.totalRevenue).toFixed(2)}` },
    { label: "Total Orders", value: data.orderCount },
    { label: "Customers", value: data.customerCount },
    { label: "Products", value: data.productCount },
  ];

  return (
    <div className="space-y-10">
      <h1 className="font-display text-2xl uppercase">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-ink/15 p-5">
            <p className="text-2xl font-semibold">{s.value}</p>
            <p className="text-xs text-ink/50 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-display text-lg uppercase mb-4">Low Stock (≤5 units)</h2>
        {data.lowStock.length === 0 ? (
          <p className="text-sm text-ink/50">All products are well stocked.</p>
        ) : (
          <ul className="text-sm space-y-2">
            {data.lowStock.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-ink/10 pb-2">
                <span>{p.name}</span>
                <span className="text-sigma">{p.stock} left</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="font-display text-lg uppercase mb-4">Recent Orders</h2>
        <ul className="text-sm space-y-2">
          {data.recentOrders.map((o) => (
            <li key={o.id} className="flex justify-between border-b border-ink/10 pb-2">
              <span>{o.orderNumber} — {o.user?.firstName} {o.user?.lastName}</span>
              <span>${Number(o.total).toFixed(2)} · {o.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
