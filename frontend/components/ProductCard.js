"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const image = product.images?.[0]?.url;
  const onSale = product.salePrice && Number(product.salePrice) < Number(product.price);

  async function addToWishlist(e) {
    e.preventDefault();
    if (!user) return (window.location.href = "/account/login");
    await api.post(`/api/wishlist/${product.id}`);
  }

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] bg-stone/20 overflow-hidden">
        {image ? (
          <Image
            src={image.startsWith("http") ? image : `${process.env.NEXT_PUBLIC_API_URL}${image}`}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 text-xs">No image</div>
        )}
        {onSale && (
          <span className="absolute top-3 left-3 bg-sigma text-bone text-[10px] uppercase tracking-widest2 px-2 py-1">
            Sale
          </span>
        )}
        <button
          onClick={addToWishlist}
          aria-label="Add to wishlist"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-bone/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ♡
        </button>
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-sm">{product.name}</p>
        <div className="flex items-center gap-2 text-sm">
          {onSale ? (
            <>
              <span className="text-sigma font-semibold">${Number(product.salePrice).toFixed(2)}</span>
              <span className="line-through text-ink/40">${Number(product.price).toFixed(2)}</span>
            </>
          ) : (
            <span>${Number(product.price).toFixed(2)}</span>
          )}
        </div>
        {product.reviewCount > 0 && (
          <p className="text-xs text-ink/50">★ {product.avgRating} ({product.reviewCount})</p>
        )}
      </div>
    </Link>
  );
}
