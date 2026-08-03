"use client";
import { useState } from "react";
import { api } from "../lib/api";

export default function AddressForm({ onSaved }) {
  const [form, setForm] = useState({
    fullName: "", phone: "", line1: "", line2: "", city: "", region: "", postalCode: "", country: "", isDefault: false,
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const addr = await api.post("/api/users/me/addresses", form);
      onSaved(addr);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-ink/15 p-4">
      <input required placeholder="Full name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm sm:col-span-2" />
      <input required placeholder="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm" />
      <input required placeholder="Country" value={form.country} onChange={(e) => update("country", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm" />
      <input required placeholder="Address line 1" value={form.line1} onChange={(e) => update("line1", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm sm:col-span-2" />
      <input placeholder="Address line 2 (optional)" value={form.line2} onChange={(e) => update("line2", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm sm:col-span-2" />
      <input required placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm" />
      <input placeholder="State / Region" value={form.region} onChange={(e) => update("region", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm" />
      <input placeholder="Postal code" value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm" />
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" checked={form.isDefault} onChange={(e) => update("isDefault", e.target.checked)} />
        Set as default address
      </label>
      {error && <p className="text-sigma text-sm sm:col-span-2">{error}</p>}
      <button disabled={saving} className="btn-primary sm:col-span-2">{saving ? "Saving…" : "Save Address"}</button>
    </form>
  );
}
