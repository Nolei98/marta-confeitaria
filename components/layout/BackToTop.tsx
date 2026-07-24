"use client";

import { useEffect, useState } from "react";
import { useHoverStyle } from "@/lib/useHover";

export function BackToTop() {
  const [showTop, setShowTop] = useState(false);
  const buttonHover = useHoverStyle(
    {
      position: "fixed",
      right: 24,
      bottom: 24,
      width: 46,
      height: 46,
      borderRadius: "50%",
      background: "#c1531c",
      color: "#fff",
      border: "none",
      display: "grid",
      placeItems: "center",
      boxShadow: "0 10px 28px rgba(193,83,28,.45), 0 4px 12px rgba(0,0,0,.12), inset 0 2px 4px rgba(255,255,255,.35)",
      zIndex: 70,
      cursor: "pointer",
      animation: "fabAppear 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
    },
    { transform: "translateY(-4px) scale(1.08)", background: "#9c3f14" }
  );

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!showTop) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      title="Voltar ao topo"
      aria-label="Voltar ao topo"
      {...buttonHover.handlers}
      style={buttonHover.style}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
