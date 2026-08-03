import { API_URL } from "../../../lib/api";
import ProductDetailClient from "./ProductDetailClient";

async function getProduct(slug) {
  const res = await fetch(`${API_URL}/api/products/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);
  if (!product) return {};
  return {
    title: product.metaTitle || product.name,
    description: product.metaDesc || product.description.slice(0, 160),
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images?.[0] ? [`${API_URL}${product.images[0].url}`] : [],
    },
  };
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  if (!product) {
    return <div className="container-wide py-24 text-center">Product not found.</div>;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.images?.map((i) => `${API_URL}${i.url}`),
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.salePrice || product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating: product.reviewCount
      ? { "@type": "AggregateRating", ratingValue: product.avgRating, reviewCount: product.reviewCount }
      : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ProductDetailClient product={product} />
    </>
  );
}
