"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "../../components/ProductCard";
import { api, API_URL } from "../../lib/api";

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    sort: searchParams.get("sort") || "newest",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    size: searchParams.get("size") || "",
    color: searchParams.get("color") || "",
  });

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    setLoading(true);
    fetch(`${API_URL}/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  function updateFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="container-wide py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <p className="eyebrow mb-2">Shop</p>
          <h1 className="font-display text-4xl uppercase">All Products</h1>
        </div>
        <p className="text-sm text-ink/50">{total} results</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10">
        {/* Filters sidebar */}
        <aside className="space-y-8">
          <div>
            <label className="eyebrow block mb-2">Search</label>
            <input
              className="w-full border border-ink/20 px-3 py-2 text-sm"
              defaultValue={filters.search}
              onBlur={(e) => updateFilter("search", e.target.value)}
              placeholder="Search products"
            />
          </div>
          <div>
            <label className="eyebrow block mb-2">Sort by</label>
            <select
              value={filters.sort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="w-full border border-ink/20 px-3 py-2 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name A–Z</option>
            </select>
          </div>
          <div>
            <label className="eyebrow block mb-2">Price</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                defaultValue={filters.minPrice}
                onBlur={(e) => updateFilter("minPrice", e.target.value)}
                className="w-1/2 border border-ink/20 px-2 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                defaultValue={filters.maxPrice}
                onBlur={(e) => updateFilter("maxPrice", e.target.value)}
                className="w-1/2 border border-ink/20 px-2 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="eyebrow block mb-2">Size</label>
            <div className="flex flex-wrap gap-2">
              {["XS", "S", "M", "L", "XL"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateFilter("size", filters.size === s ? "" : s)}
                  className={`px-3 py-1 border text-xs ${filters.size === s ? "bg-ink text-bone" : "border-ink/20"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Results grid */}
        <div>
          {loading ? (
            <p className="text-sm text-ink/50">Loading products…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-ink/50">No products match these filters.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
