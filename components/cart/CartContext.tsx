"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = { name: string; price: number; qty: number };

type CartContextValue = {
  cart: CartItem[];
  cartOpen: boolean;
  cartCount: number;
  cartTotal: string;
  cartEmpty: boolean;
  addToCart: (name: string, price: number) => void;
  incQty: (name: string) => void;
  decQty: (name: string) => void;
  removeItem: (name: string) => void;
  toggleCart: () => void;
  closeCart: () => void;
  checkout: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const WHATSAPP_NUMBER = "5511967891234";
const STORAGE_KEY = "martaCart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch {
      // ignore malformed storage
    }
  }, []);

  const persistCart = useCallback((next: CartItem[]) => {
    setCart(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable — cart still works in-memory
    }
  }, []);

  const addToCart = useCallback(
    (name: string, price: number) => {
      setCart((prev) => {
        const idx = prev.findIndex((c) => c.name === name);
        const next =
          idx >= 0
            ? prev.map((c, i) => (i === idx ? { ...c, qty: c.qty + 1 } : c))
            : [...prev, { name, price, qty: 1 }];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
      setCartOpen(true);
    },
    []
  );

  const incQty = useCallback(
    (name: string) => {
      persistCart(cart.map((c) => (c.name === name ? { ...c, qty: c.qty + 1 } : c)));
    },
    [cart, persistCart]
  );

  const removeItem = useCallback(
    (name: string) => {
      persistCart(cart.filter((c) => c.name !== name));
    },
    [cart, persistCart]
  );

  const decQty = useCallback(
    (name: string) => {
      const item = cart.find((c) => c.name === name);
      if (item && item.qty <= 1) {
        removeItem(name);
        return;
      }
      persistCart(cart.map((c) => (c.name === name ? { ...c, qty: c.qty - 1 } : c)));
    },
    [cart, persistCart, removeItem]
  );

  const toggleCart = useCallback(() => setCartOpen((v) => !v), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const checkout = useCallback(() => {
    const lines = cart.map((c) => `${c.qty}x ${c.name} — R$ ${c.price * c.qty}`);
    const msg = encodeURIComponent(`Olá! Quero fazer este pedido:\n${lines.join("\n")}`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  }, [cart]);

  const cartCount = cart.reduce((n, c) => n + c.qty, 0);
  const cartTotal =
    "R$ " + cart.reduce((n, c) => n + c.price * c.qty, 0).toFixed(2).replace(".", ",");

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      cartOpen,
      cartCount,
      cartTotal,
      cartEmpty: cart.length === 0,
      addToCart,
      incQty,
      decQty,
      removeItem,
      toggleCart,
      closeCart,
      checkout,
    }),
    [cart, cartOpen, cartCount, cartTotal, addToCart, incQty, decQty, removeItem, toggleCart, closeCart, checkout]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
