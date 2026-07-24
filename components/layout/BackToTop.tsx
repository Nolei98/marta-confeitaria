"use client";

import { useEffect, useState } from "react";
import { useHoverStyle } from "@/lib/useHover";
import styles from "./FloatingActions.module.css";

export function BackToTop() {
  const [showTop, setShowTop] = useState(false);
  const buttonHover = useHoverStyle(
    {
      position: "fixed",
      right: 24,
      bottom: 90,
      width: 34,
      height: 34,
      borderRadius: "50%",
      background: "transparent",
      color: "#c1531c",
      border: "1.5px solid rgba(193,83,28,.4)",
      display: "grid",
      placeItems: "center",
      boxShadow: "0 12px 30px rgba(58,33,26,.16), 0 2px 8px rgba(0,0,0,.06)",
      backdropFilter: "blur(6px)",
      zIndex: 70,
      cursor: "pointer",
      animation: "fabAppear 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
    },
    { transform: "translateY(-4px) scale(1.08)", background: "rgba(193,83,28,.1)", borderColor: "rgba(193,83,28,.6)" }
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
      className={styles.backTopBtn}
      {...buttonHover.handlers}
      style={buttonHover.style}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
