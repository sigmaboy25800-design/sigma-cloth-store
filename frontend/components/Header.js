"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { user } = useAuth();
  const { count } = useCart();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-40 bg-bone/95 backdrop-blur border-b border-ink/10">
      <div className="container-wide flex items-center justify-between h-20">
        <button className="md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Open menu">
          <span className="block w-6 h-px bg-ink mb-1.5" />
          <span className="block w-6 h-px bg-ink mb-1.5" />
          <span className="block w-6 h-px bg-ink" />
        </button>

        <Link href="/" className="font-display text-2xl tracking-widest2 uppercase font-semibold">
          Sigma
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm tracking-wide uppercase">
          <Link href="/shop/men" className="hover:text-sigma">Men</Link>
          <Link href="/shop/women" className="hover:text-sigma">Women</Link>
          <Link href="/shop/kids" className="hover:text-sigma">Kids</Link>
          <Link href="/shop/accessories" className="hover:text-sigma">Accessories</Link>
          <Link href="/shop" className="hover:text-sigma">All Products</Link>
        </nav>

        <div className="flex items-center gap-5">
          <form onSubmit={handleSearch} className="hidden lg:flex items-center border-b border-ink/40">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="bg-transparent px-2 py-1 text-sm w-40 focus:outline-none"
            />
          </form>
          <Link href="/wishlist" aria-label="Wishlist" className="text-sm">♡</Link>
          <Link href="/cart" aria-label="Cart" className="relative text-sm">
            Bag
            {count > 0 && (
              <span className="absolute -top-2 -right-3 bg-sigma text-bone text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <Link href={user ? "/account/profile" : "/account/login"} className="text-sm hidden sm:block">
            {user ? user.firstName : "Sign in"}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden flex flex-col gap-4 px-6 pb-6 text-sm uppercase tracking-wide">
          <Link href="/shop/men" onClick={() => setMenuOpen(false)}>Men</Link>
          <Link href="/shop/women" onClick={() => setMenuOpen(false)}>Women</Link>
          <Link href="/shop/kids" onClick={() => setMenuOpen(false)}>Kids</Link>
          <Link href="/shop/accessories" onClick={() => setMenuOpen(false)}>Accessories</Link>
          <Link href="/shop" onClick={() => setMenuOpen(false)}>All Products</Link>
        </nav>
      )}
    </header>
  );
}
