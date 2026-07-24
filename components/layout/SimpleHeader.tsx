"use client";

import Link from "next/link";
import Image from "next/image";
import { useHoverStyle } from "@/lib/useHover";

function BackLink({ style }: { style: React.CSSProperties }) {
  const hover = useHoverStyle(style, { color: "#fff" });
  return (
    <Link href="/" {...hover.handlers} style={hover.style}>
      ← Voltar ao site
    </Link>
  );
}

function LegalHeader() {
  const logoHover = useHoverStyle({ display: "flex", alignItems: "center" }, { transform: "scale(1.04)" });
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(193,83,28,.95)", backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(58,33,28,.12)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", height: 74, display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff" }}>
        <Link href="/" aria-label="Marta Confeitaria" {...logoHover.handlers} style={logoHover.style}>
          <Image src="/images/logo.png" alt="Marta Confeitaria" width={54} height={54} style={{ width: 54, height: 54, objectFit: "contain", boxShadow: "0 3px 12px rgba(0,0,0,0.25)" }} />
        </Link>
        <BackLink style={{ fontSize: 14, color: "rgba(255,255,255,.9)", fontWeight: 500 }} />
      </div>
    </header>
  );
}

function AdminHeader() {
  const backHover = useHoverStyle({ fontSize: 14, color: "rgba(255,255,255,.85)" }, { color: "#fff" });
  const exitHover = useHoverStyle(
    { fontSize: 13, fontWeight: 600, color: "#fff", background: "rgba(0,0,0,.2)", padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,.25)" },
    { background: "rgba(0,0,0,.35)" }
  );
  return (
    <header style={{ background: "#c1531c", color: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700 }}>
          <Image src="/images/logo.png" alt="Marta Confeitaria" width={48} height={48} style={{ height: 48, width: "auto", objectFit: "contain" }} />
          Painel administrativo
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Link href="/" {...backHover.handlers} style={backHover.style}>
            ← Voltar ao site
          </Link>
          <Link href="/" {...exitHover.handlers} style={exitHover.style}>
            Sair do painel
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SimpleHeader({ variant = "legal" }: { variant?: "legal" | "admin" }) {
  return variant === "admin" ? <AdminHeader /> : <LegalHeader />;
}
