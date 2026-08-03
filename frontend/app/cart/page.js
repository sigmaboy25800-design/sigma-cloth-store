"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../../context/CartContext";
import { API_URL } from "../../lib/api";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, loading } = useCart();

  if (loading) return <div className="container-wide py-16">Loading your bag…</div>;

  if (items.length === 0) {
    return (
      <div className="container-wide py-24 text-center">
        <h1 className="font-display text-3xl uppercase mb-4">Your bag is empty</h1>
        <Link href="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-wide py-12 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
      <div>
        <h1 className="font-display text-3xl uppercase mb-8">Shopping Bag</h1>
        <ul className="space-y-6">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 border-b border-ink/10 pb-6">
              <div className="relative w-24 h-32 bg-stone/20 flex-shrink-0">
                {item.product.images?.[0] && (
                  <Image
                    src={`${API_URL}${item.product.images[0].url}`}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.product.name}</p>
                <p className="text-xs text-ink/50 mt-1">
                  {item.size && `Size: ${item.size}`} {item.color && `· Color: ${item.color}`}
                </p>
                <p className="text-sm mt-2">
                  ${Number(item.product.salePrice || item.product.price).toFixed(2)}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <select
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                    className="border border-ink/20 px-2 py-1 text-sm"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                  <button onClick={() => removeItem(item.id)} className="text-xs underline text-ink/50">
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-stone/10 p-8 h-fit">
        <h2 className="font-display text-xl uppercase mb-6">Order Summary</h2>
        <div className="flex justify-between text-sm mb-3">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <p className="text-xs text-ink/50 mb-6">Shipping and discounts calculated at checkout.</p>
        <Link href="/checkout" className="btn-primary w-full">Proceed to Checkout</Link>
      </div>
    </div>
  );
}
