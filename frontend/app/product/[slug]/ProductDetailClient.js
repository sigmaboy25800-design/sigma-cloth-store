"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import { api, API_URL } from "../../../lib/api";
import ProductCard from "../../../components/ProductCard";

function imgUrl(url) {
  return url?.startsWith("http") ? url : `${API_URL}${url}`;
}

export default function ProductDetailClient({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [activeImage, setActiveImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [size, setSize] = useState(product.sizes?.[0] || null);
  const [color, setColor] = useState(product.colors?.[0] || null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState(product.reviews || []);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/products/${product.slug}/related`)
      .then((r) => r.json())
      .then(setRelated)
      .catch(() => {});
  }, [product.slug]);

  const onSale = product.salePrice && Number(product.salePrice) < Number(product.price);

  async function handleAddToCart() {
    try {
      await addToCart(product.id, { size, color, quantity: 1 });
      setMessage({ type: "success", text: "Added to bag." });
    } catch (e) {
      if (e.message.includes("Authentication")) {
        window.location.href = "/account/login";
        return;
      }
      setMessage({ type: "error", text: e.message });
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    try {
      await api.post(`/api/reviews/${product.id}`, reviewForm);
      setReviews((r) => [{ ...reviewForm, user: { firstName: user.firstName, lastName: user.lastName }, id: Date.now() }, ...r]);
      setReviewForm({ rating: 5, comment: "" });
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    }
  }

  return (
    <div className="container-wide py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Gallery with zoom */}
        <div>
          <div
            className="relative aspect-[3/4] bg-stone/20 overflow-hidden cursor-zoom-in"
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
          >
            {product.images?.[activeImage] && (
              <Image
                src={imgUrl(product.images[activeImage].url)}
                alt={product.name}
                fill
                className={`object-cover transition-transform duration-300 ${zoom ? "scale-150" : "scale-100"}`}
              />
            )}
          </div>
          <div className="flex gap-3 mt-4">
            {product.images?.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(idx)}
                className={`relative w-16 h-20 border ${idx === activeImage ? "border-ink" : "border-transparent"}`}
              >
                <Image src={imgUrl(img.url)} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="eyebrow mb-2">{product.category?.name}{product.brand ? ` · ${product.brand.name}` : ""}</p>
          <h1 className="font-display text-3xl uppercase mb-4">{product.name}</h1>
          <div className="flex items-center gap-3 mb-6">
            {onSale ? (
              <>
                <span className="text-2xl text-sigma font-semibold">${Number(product.salePrice).toFixed(2)}</span>
                <span className="line-through text-ink/40">${Number(product.price).toFixed(2)}</span>
              </>
            ) : (
              <span className="text-2xl font-semibold">${Number(product.price).toFixed(2)}</span>
            )}
          </div>

          {product.reviewCount > 0 && (
            <p className="text-sm text-ink/60 mb-6">★ {product.avgRating} · {product.reviewCount} reviews</p>
          )}

          <p className="text-ink/70 mb-8">{product.description}</p>

          {product.sizes?.length > 0 && (
            <div className="mb-6">
              <p className="eyebrow mb-2">Size</p>
              <div className="flex gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-4 py-2 border text-sm ${size === s ? "bg-ink text-bone" : "border-ink/20"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="mb-6">
              <p className="eyebrow mb-2">Color</p>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`px-4 py-2 border text-sm ${color === c ? "bg-ink text-bone" : "border-ink/20"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm mb-6">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>

          <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-primary w-full disabled:opacity-40">
            Add to Bag
          </button>

          {message && (
            <p className={`mt-3 text-sm ${message.type === "error" ? "text-sigma" : "text-ink/60"}`}>{message.text}</p>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-24 max-w-2xl">
        <h2 className="font-display text-2xl uppercase mb-6">Reviews</h2>
        {user && (
          <form onSubmit={submitReview} className="mb-10 space-y-3">
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}
              className="border border-ink/20 px-3 py-2 text-sm"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r} stars</option>
              ))}
            </select>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="Share your thoughts on this product"
              className="w-full border border-ink/20 px-3 py-2 text-sm"
              rows={3}
            />
            <button className="btn-outline">Submit Review</button>
          </form>
        )}
        {reviews.length === 0 ? (
          <p className="text-sm text-ink/50">No reviews yet — be the first to review this product.</p>
        ) : (
          <ul className="space-y-6">
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-ink/10 pb-4">
                <p className="text-sm font-semibold">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                <p className="text-sm text-ink/70 mt-1">{r.comment}</p>
                <p className="text-xs text-ink/40 mt-1">
                  {r.user?.firstName} {r.user?.lastName?.[0]}. {r.isVerifiedPurchase && "· Verified Purchase"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display text-2xl uppercase mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
