"use client";

import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { BackToTop } from "./BackToTop";
import { CardapioShortcut } from "./CardapioShortcut";
import { PageDecor } from "./PageDecor";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <SessionProvider>
      <CartProvider>
        <div style={{ position: "relative" }}>
          {!isAdmin && <PageDecor />}
          {children}
        </div>
        {!isAdmin && (
          <>
            <CardapioShortcut />
            <BackToTop />
            <CartDrawer />
          </>
        )}
      </CartProvider>
    </SessionProvider>
  );
}
