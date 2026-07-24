import type { Metadata, Viewport } from "next";
import { SiteChrome } from "@/components/layout/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marta Confeitaria — Bolos artesanais",
  description: "Bolos e fatias artesanais feitos à mão, direto da nossa cozinha para a sua mesa.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Pinyon+Script&family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "Inter, system-ui, sans-serif", color: "#3a2b28", background: "#fbf7f0", lineHeight: 1.5, minHeight: "100vh", margin: 0 }}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
