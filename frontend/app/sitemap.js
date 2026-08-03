import { API_URL } from "../lib/api";

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const staticRoutes = ["", "/shop", "/about", "/contact", "/faq", "/privacy-policy", "/terms"].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  let productRoutes = [];
  try {
    const res = await fetch(`${API_URL}/api/products?limit=100`);
    if (res.ok) {
      const data = await res.json();
      productRoutes = data.items.map((p) => ({
        url: `${siteUrl}/product/${p.slug}`,
        lastModified: new Date(p.updatedAt),
      }));
    }
  } catch {
    /* backend unavailable at build time — static routes still work */
  }

  return [...staticRoutes, ...productRoutes];
}
