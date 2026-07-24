"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./SiteHeader.module.css";
import { useCart } from "@/components/cart/CartContext";

const ALL_NAV = [
  { href: "/", label: "Início" },
  { href: "/cardapio", label: "Cardápio" },
  { href: "/bolos", label: "Bolos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/onde-encontrar", label: "Onde encontrar" },
  { href: "/contato", label: "Contato" },
];
const LEFT_NAV = ALL_NAV.slice(1, 3);
const RIGHT_NAV = ALL_NAV.slice(3);

/**
 * `floating`: true only on the Home page, where the header starts transparent
 * over the hero image and turns solid after scrolling past it. Every other
 * page keeps the header permanently solid (matches the original per-page markup).
 */
export function SiteHeader({ floating = false }: { floating?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount, toggleCart } = useCart();

  useEffect(() => {
    if (!floating) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [floating]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinkClass = (href: string) =>
    `${styles.navLink} ${pathname === href ? styles.navLinkActive : ""}`;

  return (
    <header
      className={`${styles.header} ${floating ? (scrolled ? styles.scrolled : "") : styles.solid}`}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <a
            href="https://wa.me/5587998765432"
            target="_blank"
            rel="noreferrer"
            title="Falar no WhatsApp"
            className={`${styles.whatsapp} ${styles.desktopOnly}`}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.28)", color: "#fff", borderRadius: 30, padding: "7px 16px", fontSize: 13, fontWeight: 600, backdropFilter: "blur(6px)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            (87) 99876-5432
          </a>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            className={styles.mobileToggle}
            style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,.15)", border: "none", color: "#fff", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {mobileOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>

        <div className={styles.desktopOnly} style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <nav style={{ display: "flex", gap: 16, fontSize: 14, fontWeight: 500, alignItems: "center" }}>
            <Link href="/" className={navLinkClass("/")} style={{ padding: "6px 12px", borderRadius: 20 }}>
              Início
            </Link>
            {LEFT_NAV.map((item) => (
              <Link key={item.href} href={item.href} className={navLinkClass(item.href)} style={{ padding: "6px 12px", borderRadius: 20 }}>
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/" aria-label="Marta Confeitaria" className={styles.logoLink} style={{ display: "flex", alignItems: "center", margin: "0 4px" }}>
            <Image src="/images/logo.png" alt="Marta Confeitaria" height={56} width={56} style={{ height: 56, width: "auto", objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.3))" }} />
          </Link>

          <nav style={{ display: "flex", gap: 16, fontSize: 14, fontWeight: 500, alignItems: "center" }}>
            {RIGHT_NAV.map((item) => (
              <Link key={item.href} href={item.href} className={navLinkClass(item.href)} style={{ padding: "6px 12px", borderRadius: 20, whiteSpace: item.href === "/onde-encontrar" ? "nowrap" : undefined }}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <Link href="/" aria-label="Marta Confeitaria" className={styles.mobileLogo}>
          <Image src="/images/logo.png" alt="Marta Confeitaria" height={44} width={44} style={{ height: 44, width: "auto", objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.3))" }} />
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/conta"
            className={`${styles.loginLink} ${styles.desktopOnly}`}
            style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.9)", padding: "7px 15px", borderRadius: 20, border: "1px solid rgba(255,255,255,.3)", backdropFilter: "blur(6px)" }}
          >
            Login
          </Link>
          <button
            onClick={toggleCart}
            className={styles.cartButton}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", color: "#c1531c", borderRadius: 30, padding: "8px 18px", fontSize: 14, fontWeight: 700, position: "relative", border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(0,0,0,.18)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span className={styles.cartLabel}>Carrinho</span>
            {cartCount > 0 && (
              <span style={{ position: "absolute", top: -6, right: -6, background: "#a07882", color: "#fff", borderRadius: "50%", minWidth: 20, height: 20, fontSize: 11, display: "grid", placeItems: "center", padding: "0 4px", boxShadow: "0 2px 6px rgba(0,0,0,.25)" }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav className={`${styles.mobileMenu} ${mobileOpen ? styles.open : ""}`}>
        {ALL_NAV.map((item) => (
          <Link key={item.href} href={item.href} style={{ color: pathname === item.href ? "#fff" : "rgba(255,255,255,.85)", fontWeight: pathname === item.href ? 700 : 500 }}>
            {item.label}
          </Link>
        ))}
        <hr />
        <Link href="/conta" style={{ color: "rgba(255,255,255,.85)", fontWeight: 600 }}>
          Login
        </Link>
        <a href="https://wa.me/5587998765432" target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,.85)" }}>
          Falar no WhatsApp
        </a>
      </nav>
    </header>
  );
}
