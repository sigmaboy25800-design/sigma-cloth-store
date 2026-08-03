"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { api, API_URL } from "../../../lib/api";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ title: "", subtitle: "", linkUrl: "", position: 0 });
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    api.get("/api/admin/banners").then(setBanners);
  }

  useEffect(load, []);

  async function createBanner(e) {
    e.preventDefault();
    setError(null);
    if (!file) return setError("Please choose a banner image.");
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    formData.append("image", file);
    try {
      await api.upload("/api/admin/banners", formData);
      setForm({ title: "", subtitle: "", linkUrl: "", position: 0 });
      setFile(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function toggleActive(banner) {
    await api.put(`/api/admin/banners/${banner.id}`, { isActive: !banner.isActive });
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this banner?")) return;
    await api.delete(`/api/admin/banners/${id}`);
    load();
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl uppercase">Homepage Banners</h1>

      <form onSubmit={createBanner} className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-ink/15 p-5 max-w-xl">
        <input required placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="border border-ink/20 px-3 py-2 text-sm sm:col-span-2" />
        <input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} className="border border-ink/20 px-3 py-2 text-sm sm:col-span-2" />
        <input placeholder="Link URL (e.g. /shop/men)" value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))} className="border border-ink/20 px-3 py-2 text-sm" />
        <input type="number" placeholder="Position" value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} className="border border-ink/20 px-3 py-2 text-sm" />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="text-sm sm:col-span-2" />
        {error && <p className="text-sigma text-sm sm:col-span-2">{error}</p>}
        <button className="btn-primary sm:col-span-2">Add Banner</button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {banners.map((b) => (
          <div key={b.id} className="border border-ink/15">
            <div className="relative aspect-video bg-stone/20">
              <Image src={`${API_URL}${b.imageUrl}`} alt={b.title} fill className="object-cover" />
            </div>
            <div className="p-3 text-sm">
              <p className="font-semibold">{b.title}</p>
              <div className="flex justify-between mt-2">
                <button onClick={() => toggleActive(b)} className="underline text-xs">{b.isActive ? "Active" : "Inactive"}</button>
                <button onClick={() => remove(b.id)} className="text-sigma text-xs">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
