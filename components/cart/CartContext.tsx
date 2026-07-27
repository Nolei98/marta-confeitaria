"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { whatsappLink } from "@/lib/contact";

export type CartItem = { name: string; price: number; qty: number };

type CartContextValue = {
  cart: CartItem[];
  cartOpen: boolean;
  cartCount: number;
  cartTotal: string;
  cartEmpty: boolean;
  /** Per-item message when the server refused a quantity (out of stock). */
  itemErrors: Record<string, string>;
  /** Why the last checkout attempt failed, if it did. */
  checkoutError: string | null;
  /** True while a checkout request is in flight. */
  checkoutPending: boolean;
  addToCart: (name: string, price: number) => void;
  incQty: (name: string) => void;
  decQty: (name: string) => void;
  removeItem: (name: string) => void;
  toggleCart: () => void;
  closeCart: () => void;
  checkout: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "martaCart";
const GENERIC_CHECKOUT_ERROR = "Não foi possível finalizar o pedido. Tente de novo.";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const loggedIn = status === "authenticated" && !!session?.user;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutPending, setCheckoutPending] = useState(false);
  // Ref rather than state: the guard has to be readable synchronously inside
  // checkout, before React has had a chance to re-render with the new value.
  const checkoutInFlight = useRef(false);

  // Guests keep the original localStorage-only cart. Logged-in customers get
  // their cart from the database, so it's saved to their account/history.
  useEffect(() => {
    if (loggedIn) {
      fetch("/api/cart")
        .then((r) => r.json())
        .then((items: CartItem[]) => setCart(Array.isArray(items) ? items : []))
        .catch(() => {});
      return;
    }
    try {
      setCart(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch {
      // ignore malformed storage
    }
  }, [loggedIn]);

  const persistCart = useCallback(
    (next: CartItem[]) => {
      setCart(next);
      if (loggedIn) return;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage unavailable — cart still works in-memory
      }
    },
    [loggedIn]
  );

  // Every cart mutation updates local state optimistically and then tells the
  // server. When the server refuses (409 — someone else took the last one), the
  // optimistic quantity is a lie: snap it back to what the server allows and say
  // why, instead of leaving the customer looking at a quantity they can't buy.
  // Only reached while logged in; guests have no server cart to disagree with.
  const reconcile = useCallback(async (res: Response, name: string) => {
    if (res.ok) {
      setItemErrors((prev) => {
        if (!(name in prev)) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      });
      return;
    }
    const data: { error?: string; available?: number } = await res.json().catch(() => ({}));
    if (res.status === 409 && typeof data.available === "number") {
      const available = data.available;
      setCart((prev) =>
        available <= 0
          ? prev.filter((c) => c.name !== name)
          : prev.map((c) => (c.name === name ? { ...c, qty: Math.min(c.qty, available) } : c))
      );
    }
    setItemErrors((prev) => ({ ...prev, [name]: data.error ?? "Não foi possível atualizar este item." }));
  }, []);

  const addToCart = useCallback(
    (name: string, price: number) => {
      setCart((prev) => {
        const idx = prev.findIndex((c) => c.name === name);
        const next =
          idx >= 0
            ? prev.map((c, i) => (i === idx ? { ...c, qty: c.qty + 1 } : c))
            : [...prev, { name, price, qty: 1 }];
        if (!loggedIn) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {}
        }
        return next;
      });
      setCartOpen(true);
      setCheckoutError(null);
      if (loggedIn) {
        fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, price, qty: 1 }),
        })
          .then((res) => reconcile(res, name))
          .catch(() => {});
      }
    },
    [loggedIn, reconcile]
  );

  const incQty = useCallback(
    (name: string) => {
      const next = cart.map((c) => (c.name === name ? { ...c, qty: c.qty + 1 } : c));
      persistCart(next);
      setCheckoutError(null);
      if (loggedIn) {
        const item = next.find((c) => c.name === name);
        if (item) {
          fetch("/api/cart/" + encodeURIComponent(name), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qty: item.qty }) })
            .then((res) => reconcile(res, name))
            .catch(() => {});
        }
      }
    },
    [cart, persistCart, loggedIn, reconcile]
  );

  const removeItem = useCallback(
    (name: string) => {
      persistCart(cart.filter((c) => c.name !== name));
      setCheckoutError(null);
      setItemErrors((prev) => {
        if (!(name in prev)) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      });
      if (loggedIn) {
        fetch("/api/cart/" + encodeURIComponent(name), { method: "DELETE" }).catch(() => {});
      }
    },
    [cart, persistCart, loggedIn]
  );

  const decQty = useCallback(
    (name: string) => {
      const item = cart.find((c) => c.name === name);
      if (item && item.qty <= 1) {
        removeItem(name);
        return;
      }
      const next = cart.map((c) => (c.name === name ? { ...c, qty: c.qty - 1 } : c));
      persistCart(next);
      setCheckoutError(null);
      if (loggedIn) {
        const updated = next.find((c) => c.name === name);
        if (updated) {
          fetch("/api/cart/" + encodeURIComponent(name), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qty: updated.qty }) })
            .then((res) => reconcile(res, name))
            .catch(() => {});
        }
      }
    },
    [cart, persistCart, removeItem, loggedIn, reconcile]
  );

  const toggleCart = useCallback(() => setCartOpen((v) => !v), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const checkout = useCallback(async () => {
    // Creating a Mercado Pago preference takes a network round-trip. Without
    // this guard a double click books two orders and decrements stock twice.
    if (checkoutInFlight.current) return;
    checkoutInFlight.current = true;
    setCheckoutPending(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: loggedIn ? undefined : JSON.stringify({ items: cart }),
      });
      const data: { initPoint?: string; whatsappUrl?: string; error?: string } = await res
        .json()
        .catch(() => ({}));

      // Out of stock, rate limited, product gone, server error — the order was
      // NOT placed. Keep the cart exactly as it is and say what happened.
      if (!res.ok) {
        setCheckoutError(data.error ?? GENERIC_CHECKOUT_ERROR);
        return;
      }

      if (data.initPoint) {
        window.location.href = data.initPoint;
        return;
      }
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank");
      }
      // Only past this point is the order actually placed.
      setCart([]);
      setItemErrors({});
      if (!loggedIn) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
      }
    } catch {
      // Network hiccup — fall back to the always-available WhatsApp flow so checkout never silently dies.
      const lines = cart.map((c) => `${c.qty}x ${c.name} — R$ ${c.price * c.qty}`);
      window.open(whatsappLink(`Olá! Quero fazer este pedido:\n${lines.join("\n")}`), "_blank");
    } finally {
      checkoutInFlight.current = false;
      setCheckoutPending(false);
    }
  }, [cart, loggedIn]);

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
      itemErrors,
      checkoutError,
      checkoutPending,
      addToCart,
      incQty,
      decQty,
      removeItem,
      toggleCart,
      closeCart,
      checkout,
    }),
    [cart, cartOpen, cartCount, cartTotal, itemErrors, checkoutError, checkoutPending, addToCart, incQty, decQty, removeItem, toggleCart, closeCart, checkout]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
