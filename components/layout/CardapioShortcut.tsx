"use client";

import Link from "next/link";
import { useHoverStyle } from "@/lib/useHover";

export function CardapioShortcut() {
  const fabHover = useHoverStyle(
    {
      width: 54,
      height: 54,
      borderRadius: "50%",
      background: "#c1531c",
      color: "#fff",
      display: "grid",
      placeItems: "center",
      boxShadow: "0 10px 28px rgba(193,83,28,.45), 0 4px 12px rgba(0,0,0,.12), inset 0 2px 4px rgba(255,255,255,.35)",
      pointerEvents: "auto",
      textDecoration: "none",
      animation: "fabAppear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s both",
    },
    { transform: "translateY(-4px) scale(1.08)", background: "#9c3f14" }
  );

  return (
    <div style={{ position: "fixed", left: 24, bottom: 24, zIndex: 60, display: "flex", alignItems: "center", gap: 12, pointerEvents: "none" }}>
      <Link
        href="/cardapio"
        title="Ver Cardápio"
        aria-label="Ver Cardápio"
        {...fabHover.handlers}
        style={fabHover.style}
      >
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          <path d="M8 7h8M8 11h6"></path>
        </svg>
      </Link>
      <div
        style={{
          position: "relative",
          background: "#fff",
          color: "#3f2a26",
          padding: "9px 14px",
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 600,
          boxShadow: "0 8px 24px rgba(58,33,28,.2)",
          whiteSpace: "nowrap",
          pointerEvents: "auto",
          animation: "speechBubbleFade 6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards",
          border: "1px solid #eaddd0",
        }}
      >
        <div style={{ position: "absolute", left: -6, top: "50%", transform: "translateY(-50%) rotate(45deg)", width: 10, height: 10, background: "#fff", borderLeft: "1px solid #eaddd0", borderBottom: "1px solid #eaddd0" }} />
        Confira nosso cardápio! 🍰
      </div>
    </div>
  );
}
