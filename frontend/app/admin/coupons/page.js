"use client";
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";

const emptyForm = { code: "", discountType: "PERCENT", discountValue: "", minOrderAmount: "", maxUses: "", expiresAt: "" };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);

  function load() {
    api.get("/api/admin/coupons").then(setCoupons);
  }

  useEffect(load, []);

  async function createCoupon(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/api/admin/coupons", {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      });
      setForm(emptyForm);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function toggleActive(coupon) {
    await api.put(`/api/admin/coupons/${coupon.id}`, { isActive: !coupon.isActive });
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this coupon?")) return;
    await api.delete(`/api/admin/coupons/${id}`);
    load();
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl uppercase">Coupons</h1>

      <form onSubmit={createCoupon} className="grid grid-cols-2 sm:grid-cols-3 gap-3 border border-ink/15 p-5 max-w-xl">
        <input required placeholder="CODE" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} className="border border-ink/20 px-3 py-2 text-sm" />
        <select value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))} className="border border-ink/20 px-3 py-2 text-sm">
          <option value="PERCENT">Percent off</option>
          <option value="FIXED">Fixed amount off</option>
        </select>
        <input required type="number" placeholder="Value" value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))} className="border border-ink/20 px-3 py-2 text-sm" />
        <input type="number" placeholder="Min order (optional)" value={form.minOrderAmount} onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))} className="border border-ink/20 px-3 py-2 text-sm" />
        <input type="number" placeholder="Max uses (optional)" value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))} className="border border-ink/20 px-3 py-2 text-sm" />
        <input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} className="border border-ink/20 px-3 py-2 text-sm" />
        {error && <p className="text-sigma text-sm col-span-3">{error}</p>}
        <button className="btn-primary col-span-3 sm:col-span-1">Create</button>
      </form>

      <table className="w-full text-sm">
        <thead><tr className="text-left border-b border-ink/20"><th className="py-2">Code</th><th>Discount</th><th>Used</th><th>Active</th><th></th></tr></thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c.id} className="border-b border-ink/10">
              <td className="py-2 font-mono">{c.code}</td>
              <td>{c.discountType === "PERCENT" ? `${c.discountValue}%` : `$${c.discountValue}`}</td>
              <td>{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
              <td><button onClick={() => toggleActive(c)} className="underline">{c.isActive ? "Active" : "Inactive"}</button></td>
              <td><button onClick={() => remove(c.id)} className="text-sigma text-xs">Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
