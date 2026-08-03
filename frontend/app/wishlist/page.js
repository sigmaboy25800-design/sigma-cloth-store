"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import ProductCard from "../../components/ProductCard";

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (user) api.get("/api/wishlist").then(setItems).catch(() => {});
  }, [user]);

  if (authLoading) return null;
  if (!user) {
    return (
      <div className="container-wide py-24 text-center">
        <p className="mb-4">Sign in to view your wishlist.</p>
        <a href="/account/login" className="btn-primary">Sign In</a>
      </div>
    );
  }

  return (
    <div className="container-wide py-12">
      <h1 className="font-display text-3xl uppercase mb-10">Wishlist</h1>
      {items.length === 0 ? (
        <p className="text-sm text-ink/50">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {items.map((i) => (
            <ProductCard key={i.id} product={i.product} />
          ))}
        </div>
      )}
    </div>
  );
}
