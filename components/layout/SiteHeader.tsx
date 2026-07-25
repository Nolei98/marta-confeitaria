"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import styles from "./SiteHeader.module.css";
import { useCart } from "@/components/cart/CartContext";
import { UserIcon } from "@/components/icons";

const ALL_NAV = [
  { href: "/", label: "Início" },
  { href: "/cardapio", label: "Cardápio" },
  { href: "/bolos", label: "Bolos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];
const LEFT_NAV = ALL_NAV.slice(1, 3);
const RIGHT_NAV = ALL_NAV.slice(3);
// Once logged in as a customer, the catalog and cake-ordering flows move into
// the /conta dashboard, so the header nav only needs to keep Contato (which also covers "onde encontrar").
const CUSTOMER_NAV = ALL_NAV.filter((item) => item.href === "/contato");

/**
 * `floating`: true only on the Home page, where the header starts transparent
 * over the hero image and turns solid after scrolling past it. Every other
 * page keeps the header permanently solid (matches the original per-page markup).
 */
export function SiteHeader({ floating = false }: { floating?: boolean }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount, toggleCart } = useCart();
  const onAccountPage = pathname === "/conta" || pathname === "/parceiro" || pathname?.startsWith("/admin");
  const isCustomerLoggedIn = session?.user?.role === "CUSTOMER";
  const accountHref = session?.user?.role === "PARTNER" ? "/parceiro" : session?.user?.role === "ADMIN" ? "/admin/dashboard" : "/conta";

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
      style={mobileOpen ? { left: 0, transform: "none", backdropFilter: "none", WebkitBackdropFilter: "none", transition: "none" } : undefined}
    >
      <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto", padding: "0 24px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/" aria-label="Marta Confeitaria" className={styles.mobileLogo}>
            <Image src="/images/logo.png" alt="Marta Confeitaria" height={40} width={40} style={{ height: 40, width: "auto", objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.3))" }} />
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            className={styles.mobileToggle}
            style={{ width: 40, height: 40, background: "transparent", border: "none", color: "#fff", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {mobileOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>

        <div className={styles.desktopOnly} style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 22 }}>
          <nav style={{ display: "flex", gap: 16, fontSize: 14, fontWeight: 500, alignItems: "center" }}>
            <Link href="/" className={navLinkClass("/")} style={{ padding: "6px 12px", borderRadius: 20 }}>
              Início
            </Link>
            {!isCustomerLoggedIn && LEFT_NAV.map((item) => (
              <Link key={item.href} href={item.href} className={navLinkClass(item.href)} style={{ padding: "6px 12px", borderRadius: 20 }}>
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/" aria-label="Marta Confeitaria" className={styles.logoLink} style={{ display: "flex", alignItems: "center", flexShrink: 0, margin: "0 4px" }}>
            <Image src="/images/logo.png" alt="Marta Confeitaria" height={56} width={56} style={{ height: 56, width: 56, objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.3))" }} />
          </Link>

          <nav style={{ display: "flex", gap: 16, fontSize: 14, fontWeight: 500, alignItems: "center" }}>
            {(isCustomerLoggedIn ? CUSTOMER_NAV : RIGHT_NAV).map((item) => (
              <Link key={item.href} href={item.href} className={navLinkClass(item.href)} style={{ padding: "6px 12px", borderRadius: 20 }}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!onAccountPage && (
            <Link
              href={accountHref}
              title={session?.user ? "Dashboard" : "Entrar"}
              aria-label={session?.user ? "Dashboard" : "Entrar"}
              className={`${styles.loginLink} ${styles.desktopOnly}`}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: "50%", color: "rgba(255,255,255,.9)", border: "1px solid rgba(255,255,255,.3)", backdropFilter: "blur(6px)" }}
            >
              <UserIcon size={16} />
            </Link>
          )}
          {!isCustomerLoggedIn && (
            <div className={styles.mobileOnly} style={{ position: "relative", alignItems: "center" }}>
              <Link
                href="/cardapio"
                title="Ver Cardápio"
                aria-label="Ver Cardápio"
                style={{ display: "flex", width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,.15)", border: "1.5px solid #c1531c", color: "#fff", alignItems: "center", justifyContent: "center" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  <path d="M8 7h8M8 11h6"></path>
                </svg>
              </Link>
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: -4,
                  background: "#fff",
                  color: "#3f2a26",
                  padding: "8px 12px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  boxShadow: "0 8px 24px rgba(58,33,28,.2)",
                  whiteSpace: "nowrap",
                  border: "1px solid #eaddd0",
                  animation: "speechBubbleFade 6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards",
                }}
              >
                <div style={{ position: "absolute", right: 14, top: -5, transform: "rotate(45deg)", width: 9, height: 9, background: "#fff", borderLeft: "1px solid #eaddd0", borderTop: "1px solid #eaddd0" }} />
                Confira nosso Cardápio
              </div>
            </div>
          )}
          <button
            onClick={toggleCart}
            aria-label="Carrinho"
            title="Carrinho"
            className={styles.cartButton}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, background: "#fff", color: "#c1531c", borderRadius: "50%", position: "relative", border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(0,0,0,.18)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && (
              <span style={{ position: "absolute", top: -6, right: -6, background: "#a07882", color: "#fff", borderRadius: "50%", minWidth: 20, height: 20, fontSize: 11, display: "grid", placeItems: "center", padding: "0 4px", boxShadow: "0 2px 6px rgba(0,0,0,.25)" }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav className={`${styles.mobileMenu} ${mobileOpen ? styles.open : ""}`}>
        {(isCustomerLoggedIn ? [ALL_NAV[0], ...CUSTOMER_NAV] : ALL_NAV).map((item) => (
          <Link key={item.href} href={item.href} style={{ color: pathname === item.href ? "#fff" : "rgba(255,255,255,.85)", fontWeight: pathname === item.href ? 700 : 500 }}>
            {item.label}
          </Link>
        ))}
        <hr />
        <Link href={accountHref} style={{ color: "rgba(255,255,255,.85)", fontWeight: 600 }}>
          {session?.user ? "Dashboard" : "Entrar"}
        </Link>
        {!isCustomerLoggedIn && (
          <a href="https://wa.me/5587998765432" target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,.85)" }}>
            Falar no WhatsApp
          </a>
        )}
      </nav>
    </header>
  );
}
