import Link from "next/link";
import Image from "next/image";
import { API_URL } from "../lib/api";
import ProductCard from "../components/ProductCard";

async function getFeatured() {
  try {
    const res = await fetch(`${API_URL}/api/products/featured`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getBanners() {
  try {
    const res = await fetch(`${API_URL}/api/admin/banners`, { next: { revalidate: 60 } }).catch(() => null);
    return res && res.ok ? res.json() : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <div>
      {/* Hero — asymmetric split, oversized display type as the thesis statement */}
      <section className="container-wide grid grid-cols-1 md:grid-cols-12 gap-8 pt-10 md:pt-16 pb-20">
        <div className="md:col-span-7 flex flex-col justify-center">
          <p className="eyebrow mb-6">New Season — Core Collection</p>
          <h1 className="font-display text-[13vw] md:text-[6.5vw] leading-[0.95] font-semibold uppercase">
            Dress
            <br />
            with intent
          </h1>
          <p className="mt-6 max-w-md text-ink/70">
            Tailored streetwear and everyday essentials, built from fabrics that hold their shape and their color.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/shop" className="btn-primary">Shop All</Link>
            <Link href="/shop/men" className="btn-outline">New Arrivals</Link>
          </div>
        </div>
        <div className="md:col-span-5 relative aspect-[4/5] bg-stone/30">
          <Image
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80"
            alt="Sigma Cloth Store lookbook"
            fill
            priority
            className="object-cover"
          />
        </div>
      </section>

      {/* Category tiles */}
      <section className="container-wide grid grid-cols-2 md:grid-cols-4 gap-4 pb-20">
        {[
          { name: "Men", slug: "men" },
          { name: "Women", slug: "women" },
          { name: "Kids", slug: "kids" },
          { name: "Accessories", slug: "accessories" },
        ].map((c) => (
          <Link key={c.slug} href={`/shop/${c.slug}`} className="group relative aspect-square bg-ink overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-bone uppercase tracking-widest2 text-sm group-hover:tracking-[0.35em] transition-all">
              {c.name}
            </div>
          </Link>
        ))}
      </section>

      {/* Featured products */}
      <section className="container-wide pb-24">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-3xl uppercase">Featured</h2>
          <Link href="/shop" className="text-sm underline">View all</Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-ink/50 text-sm">
            No featured products yet — mark products as "Featured" from the admin dashboard to show them here.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
