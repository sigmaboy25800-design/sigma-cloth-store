import ProductCard from "../../../components/ProductCard";
import { API_URL } from "../../../lib/api";

async function getProducts(category) {
  const res = await fetch(`${API_URL}/api/products?category=${category}`, { next: { revalidate: 30 } });
  if (!res.ok) return { items: [], total: 0 };
  return res.json();
}

export async function generateMetadata({ params }) {
  const name = params.category.charAt(0).toUpperCase() + params.category.slice(1);
  return {
    title: `${name}`,
    description: `Shop the ${name} collection at Sigma Cloth Store.`,
    alternates: { canonical: `/shop/${params.category}` },
  };
}

export default async function CategoryPage({ params }) {
  const { items, total } = await getProducts(params.category);
  const name = params.category.charAt(0).toUpperCase() + params.category.slice(1);

  return (
    <div className="container-wide py-12">
      <p className="eyebrow mb-2">Shop</p>
      <h1 className="font-display text-4xl uppercase mb-2">{name}</h1>
      <p className="text-sm text-ink/50 mb-10">{total} results</p>

      {items.length === 0 ? (
        <p className="text-sm text-ink/50">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
