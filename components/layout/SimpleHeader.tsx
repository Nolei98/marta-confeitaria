"use client";

import Link from "next/link";
import Image from "next/image";
import { useHoverStyle } from "@/lib/useHover";
import styles from "./SimpleHeader.module.css";
import { LogOutIcon } from "@/components/icons";

function BackLink({ style }: { style: React.CSSProperties }) {
  const hover = useHoverStyle(style, { color: "#fff" });
  return (
    <Link href="/" className={styles.legalBackLink} {...hover.handlers} style={hover.style}>
      ← Voltar ao site
    </Link>
  );
}

function LegalHeader() {
  const logoHover = useHoverStyle({ display: "flex", alignItems: "center" }, { transform: "scale(1.04)" });
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(193,83,28,.95)", backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(58,33,28,.12)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", minHeight: 74, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, color: "#fff" }}>
        <Link href="/" aria-label="Marta Confeitaria" {...logoHover.handlers} style={logoHover.style}>
          <Image src="/images/logo.png" alt="Marta Confeitaria" width={54} height={54} style={{ width: 54, height: 54, objectFit: "contain", boxShadow: "0 3px 12px rgba(0,0,0,0.25)" }} />
        </Link>
        <BackLink style={{ fontSize: 14, color: "rgba(255,255,255,.9)", fontWeight: 500 }} />
      </div>
    </header>
  );
}

function AdminHeader() {
  const exitHover = useHoverStyle(
    { display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, color: "#fff", background: "rgba(0,0,0,.2)", borderRadius: "50%", border: "1px solid rgba(255,255,255,.25)" },
    { background: "rgba(0,0,0,.35)" }
  );
  return (
    <header style={{ background: "#c1531c", color: "#fff" }}>
      <div className={styles.adminHeaderRow} style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700 }}>
          <Image src="/images/logo.png" alt="Marta Confeitaria" width={48} height={48} style={{ height: 48, width: "auto", objectFit: "contain" }} />
          <span className={styles.adminTitleText}>Painel administrativo</span>
        </div>
        <Link href="/" title="Sair do painel" aria-label="Sair do painel" {...exitHover.handlers} style={exitHover.style}>
          <LogOutIcon size={17} />
        </Link>
      </div>
    </header>
  );
}

export function SimpleHeader({ variant = "legal" }: { variant?: "legal" | "admin" }) {
  return variant === "admin" ? <AdminHeader /> : <LegalHeader />;
}
