"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";

const emptyForm = {
  name: "", description: "", price: "", salePrice: "", sku: "", stock: 0,
  categoryId: "", sizes: "", colors: "", tags: "", isFeatured: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function loadProducts() {
    api.get("/api/admin/products").then(setProducts);
  }

  useEffect(() => {
    loadProducts();
    api.get("/api/categories").then(setCategories);
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function createProduct(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/api/admin/products", {
        ...form,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        stock: Number(form.stock),
        sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()) : [],
        colors: form.colors ? form.colors.split(",").map((s) => s.trim()) : [],
        tags: form.tags ? form.tags.split(",").map((s) => s.trim().toLowerCase()) : [],
      });
      setForm(emptyForm);
      setShowForm(false);
      loadProducts();
    } catch (e) {
      setError(e.message);
    }
  }

  async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/api/admin/products/${id}`);
    loadProducts();
  }

  async function quickStock(id, stock) {
    await api.patch(`/api/admin/products/${id}/stock`, { stock: Number(stock) });
    loadProducts();
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="font-display text-2xl uppercase">Products</h1>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary text-xs">
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-ink/15 p-5">
          <input required placeholder="Name" value={form.name} onChange={(e) => update("name", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm sm:col-span-2" />
          <textarea required placeholder="Description" value={form.description} onChange={(e) => update("description", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm sm:col-span-2" rows={3} />
          <input required type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e) => update("price", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm" />
          <input type="number" step="0.01" placeholder="Sale price (optional)" value={form.salePrice} onChange={(e) => update("salePrice", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm" />
          <input required placeholder="SKU" value={form.sku} onChange={(e) => update("sku", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm" />
          <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => update("stock", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm" />
          <select required value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm sm:col-span-2">
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input placeholder="Sizes (comma separated: S,M,L)" value={form.sizes} onChange={(e) => update("sizes", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm" />
          <input placeholder="Colors (comma separated)" value={form.colors} onChange={(e) => update("colors", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm" />
          <input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => update("tags", e.target.value)} className="border border-ink/20 px-3 py-2 text-sm sm:col-span-2" />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} />
            Feature on homepage
          </label>
          {error && <p className="text-sigma text-sm sm:col-span-2">{error}</p>}
          <button className="btn-primary sm:col-span-2">Create Product</button>
        </form>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-ink/20">
            <th className="py-2">Name</th><th>SKU</th><th>Price</th><th>Stock</th><th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-ink/10">
              <td className="py-2"><Link href={`/admin/products/${p.id}`} className="underline">{p.name}</Link></td>
              <td>{p.sku}</td>
              <td>${Number(p.price).toFixed(2)}</td>
              <td>
                <input
                  type="number"
                  defaultValue={p.stock}
                  onBlur={(e) => quickStock(p.id, e.target.value)}
                  className="w-16 border border-ink/20 px-1 py-0.5"
                />
              </td>
              <td>
                <button onClick={() => deleteProduct(p.id)} className="text-sigma text-xs">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
