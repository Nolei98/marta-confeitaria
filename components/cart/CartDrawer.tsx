"use client";

import { useCart } from "./CartContext";
import { useHoverStyle } from "@/lib/useHover";

export function CartDrawer() {
  const { cartOpen, closeCart, cartEmpty, cart, incQty, decQty, removeItem, cartTotal, checkout, itemErrors, checkoutError, checkoutPending } = useCart();
  const checkoutHover = useHoverStyle(
    { width: "100%", border: "none", background: "#c1531c", color: "#fff", borderRadius: 40, padding: 15, fontWeight: 600, fontSize: 15, cursor: "pointer", minHeight: 44 },
    { background: "#9c3f14" }
  );

  if (!cartOpen) return null;

  const cartItems = cart.map((c) => ({
    name: c.name,
    qty: c.qty,
    lineTotal: "R$ " + (c.price * c.qty).toFixed(2).replace(".", ","),
    error: itemErrors[c.name],
  }));

  return (
    <>
      <div
        onClick={closeCart}
        style={{ position: "fixed", inset: 0, background: "rgba(47,32,29,.45)", zIndex: 90 }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: 380,
          maxWidth: "90vw",
          background: "#f5ead9",
          zIndex: 91,
          boxShadow: "-16px 0 40px rgba(0,0,0,.18)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "22px 24px",
            borderBottom: "1px solid #eaddd0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c1531c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, margin: 0, color: "#c1531c", fontWeight: 700 }}>
              Seu carrinho
            </h3>
          </div>
          <button
            onClick={closeCart}
            style={{ border: "none", background: "none", fontSize: 24, color: "#8b7d76", cursor: "pointer", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {cartEmpty && (
            <p style={{ color: "#8b7d76", fontSize: 14, textAlign: "center", marginTop: 40 }}>
              Seu carrinho está vazio. Que tal uma fatia?
            </p>
          )}
          {cartItems.map((ci) => (
            <div key={ci.name} style={{ padding: "14px 0", borderBottom: "1px solid #eaddd0" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
              <div>
                <div style={{ fontWeight: 600, color: "#c1531c", fontSize: 14, marginBottom: 4 }}>{ci.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => decQty(ci.name)}
                    style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid #eaddd0", background: "#fff", color: "#c1531c", cursor: "pointer", fontSize: 14, lineHeight: 1 }}
                  >
                    –
                  </button>
                  <span style={{ fontSize: 13, color: "#8b7d76", minWidth: 14, textAlign: "center" }}>{ci.qty}</span>
                  <button
                    onClick={() => incQty(ci.name)}
                    style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid #eaddd0", background: "#fff", color: "#c1531c", cursor: "pointer", fontSize: 14, lineHeight: 1 }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Playfair Display',serif", color: "#c1531c", fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                  {ci.lineTotal}
                </div>
                <button
                  onClick={() => removeItem(ci.name)}
                  style={{ border: "none", background: "none", color: "#b3554d", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}
                >
                  remover
                </button>
              </div>
              </div>
              {ci.error && (
                <p role="status" style={{ margin: "8px 0 0", fontSize: 12, color: "#b3554d", background: "#f2e4e4", borderRadius: 8, padding: "6px 10px" }}>
                  {ci.error}
                </p>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: "20px 24px", borderTop: "1px solid #eaddd0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ color: "#8b7d76", fontSize: 14 }}>Subtotal</span>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: "#c1531c" }}>{cartTotal}</span>
          </div>
          {checkoutError && (
            <p role="alert" style={{ margin: "0 0 12px", fontSize: 13, color: "#b3554d", background: "#f2e4e4", borderRadius: 10, padding: "10px 12px" }}>
              {checkoutError}
            </p>
          )}
          <button
            onClick={checkout}
            disabled={checkoutPending || cartEmpty}
            {...checkoutHover.handlers}
            style={{
              ...checkoutHover.style,
              ...(checkoutPending || cartEmpty
                ? { background: "#c9beb5", cursor: "not-allowed" }
                : null),
            }}
          >
            {checkoutPending ? "Enviando..." : "Finalizar pedido"}
          </button>
        </div>
      </div>
    </>
  );
}
