"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return setItems([]);
    setLoading(true);
    try {
      const data = await api.get("/api/cart");
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addToCart(productId, { size, color, quantity = 1 } = {}) {
    await api.post("/api/cart", { productId, size, color, quantity });
    await refresh();
  }

  async function updateQuantity(itemId, quantity) {
    await api.put(`/api/cart/${itemId}`, { quantity });
    await refresh();
  }

  async function removeItem(itemId) {
    await api.delete(`/api/cart/${itemId}`);
    await refresh();
  }

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => {
    const price = i.product.salePrice ? Number(i.product.salePrice) : Number(i.product.price);
    return sum + price * i.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ items, count, subtotal, loading, addToCart, updateQuantity, removeItem, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
