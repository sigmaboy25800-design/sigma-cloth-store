"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { api, API_URL } from "../../../../lib/api";

export default function AdminProductEditPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  function load() {
    api.get("/api/admin/products").then((all) => setProduct(all.find((p) => p.id === id)));
  }

  useEffect(load, [id]);

  function update(key, value) {
    setProduct((p) => ({ ...p, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      await api.put(`/api/admin/products/${id}`, {
        name: product.name,
        description: product.description,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        stock: Number(product.stock),
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      });
      setMessage("Saved.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadImages(e) {
    const files = e.target.files;
    if (!files.length) return;
    const formData = new FormData();
    for (const f of files) formData.append("images", f);
    await api.upload(`/api/admin/products/${id}/images`, formData);
    load();
  }

  async function deleteImage(imageId) {
    await api.delete(`/api/admin/products/${id}/images/${imageId}`);
    load();
  }

  if (!product) return <p className="text-sm text-ink/50">Loading…</p>;

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="font-display text-2xl uppercase">{product.name}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {product.images?.map((img) => (
          <div key={img.id} className="relative aspect-square bg-stone/20">
            <Image src={`${API_URL}${img.url}`} alt="" fill className="object-cover" />
            <button onClick={() => deleteImage(img.id)} className="absolute top-1 right-1 bg-ink text-bone text-xs px-2 py-0.5">×</button>
          </div>
        ))}
      </div>
      <input type="file" multiple accept="image/*" onChange={uploadImages} className="text-sm" />

      <div className="space-y-3">
        <textarea value={product.description} onChange={(e) => update("description", e.target.value)} className="w-full border border-ink/20 px-3 py-2 text-sm" rows={4} />
        <div className="flex gap-3">
          <input type="number" step="0.01" value={product.price} onChange={(e) => update("price", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm w-32" />
          <input type="number" step="0.01" placeholder="Sale price" value={product.salePrice || ""} onChange={(e) => update("salePrice", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm w-32" />
          <input type="number" value={product.stock} onChange={(e) => update("stock", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm w-24" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={product.isActive} onChange={(e) => update("isActive", e.target.checked)} /> Active (visible in shop)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={product.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} /> Featured on homepage
        </label>
        {message && <p className="text-sm text-ink/60">{message}</p>}
        <button onClick={save} disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save Changes"}</button>
      </div>
    </div>
  );
}
