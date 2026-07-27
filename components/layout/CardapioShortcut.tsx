"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useHoverStyle } from "@/lib/useHover";
import styles from "./FloatingActions.module.css";
import { BookOpenIcon, CakeSliceIcon } from "@/components/icons";

export function CardapioShortcut() {
  const [loaded, setLoaded] = useState(false);
  const fabHover = useHoverStyle(
    {
      width: 54,
      height: 54,
      borderRadius: "50%",
      background: "rgba(193,83,28,.12)",
      color: "#c1531c",
      display: "grid",
      placeItems: "center",
      border: "1.5px solid rgba(193,83,28,.4)",
      boxShadow: "0 12px 30px rgba(58,33,26,.16), 0 2px 8px rgba(0,0,0,.06)",
      pointerEvents: "auto",
      textDecoration: "none",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      animation: "fabAppear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s both",
    },
    { transform: "translateY(-4px) scale(1.08)", background: "rgba(193,83,28,.22)", borderColor: "rgba(193,83,28,.6)" }
  );

  useEffect(() => {
    if (document.readyState === "complete") {
      setLoaded(true);
      return;
    }
    const onLoad = () => setLoaded(true);
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  // Quem decide em quais páginas o atalho aparece é o SiteChrome (fora do admin
  // e fora do próprio /cardapio). Aqui só esperamos a página terminar de
  // carregar, para o botão não piscar antes do conteúdo.
  if (!loaded) return null;

  return (
    <div className={styles.cardapioWrap} style={{ position: "fixed", right: 24, bottom: 24, zIndex: 60, display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 12, pointerEvents: "none" }}>
      <Link
        href="/cardapio"
        title="Ver Cardápio"
        aria-label="Ver Cardápio"
        className={styles.cardapioBtn}
        {...fabHover.handlers}
        style={fabHover.style}
      >
        <BookOpenIcon size={22} />
      </Link>
      <div
        style={{
          position: "relative",
          background: "#fff",
          color: "#3f2a26",
          padding: "10px 16px",
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 600,
          boxShadow: "0 12px 28px rgba(58,33,28,.22), 0 2px 8px rgba(58,33,28,.08)",
          whiteSpace: "nowrap",
          pointerEvents: "auto",
          animation: "speechBubbleFade 6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards",
          border: "1px solid rgba(193,83,28,.16)",
          transform: "translateY(-10px)",
        }}
      >
        <div style={{ position: "absolute", right: -5, top: "calc(50% + 10px)", transform: "translateY(-50%) rotate(45deg)", width: 9, height: 9, background: "#fff", borderTop: "1px solid rgba(193,83,28,.16)", borderRight: "1px solid rgba(193,83,28,.16)" }} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          <span style={{ color: "#c1531c", display: "flex" }}>
            <CakeSliceIcon size={14} />
          </span>
          Confira nosso cardápio!
        </span>
      </div>
    </div>
  );
}
