"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { BackToTop } from "./BackToTop";
import { CardapioShortcut } from "./CardapioShortcut";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <CartProvider>
      {children}
      {!isAdmin && (
        <>
          <CardapioShortcut />
          <BackToTop />
          <CartDrawer />
        </>
      )}
    </CartProvider>
  );
}
