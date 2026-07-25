import type { Metadata, Viewport } from "next";
import { SiteChrome } from "@/components/layout/SiteChrome";
import "./globals.css";

const SITE_URL = "https://marta-confeitaria.vercel.app";
const SITE_TITLE = "Marta Confeitaria — Bolos artesanais";
const SITE_DESCRIPTION = "Bolos e fatias artesanais feitos à mão, direto da nossa cozinha para a sua mesa.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s — Marta Confeitaria",
  },
  description: SITE_DESCRIPTION,
  keywords: ["bolos artesanais", "confeitaria", "fatias de bolo", "bolo sob encomenda", "Marta Confeitaria", "Salgueiro PE"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "Marta Confeitaria",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/images/logo.png", width: 905, height: 905, alt: "Marta Confeitaria" }],
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/images/logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const LOCAL_BUSINESS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  name: "Marta Confeitaria",
  image: `${SITE_URL}/images/logo.png`,
  logo: `${SITE_URL}/images/logo.png`,
  url: SITE_URL,
  telephone: "+55 87 99876-5432",
  email: "contato@martaconfeitaria.com.br",
  priceRange: "R$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua das Framboesas, 122",
    addressLocality: "Salgueiro",
    addressRegion: "PE",
    addressCountry: "BR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -8.0742,
    longitude: -39.1225,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "09:00",
      closes: "13:00",
    },
  ],
  servesCuisine: "Confeitaria",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_JSON_LD) }}
        />
      </head>
      <body style={{ fontFamily: "Inter, system-ui, sans-serif", color: "#3a2b28", background: "#f5ead9", lineHeight: 1.5, minHeight: "100vh", margin: 0 }}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
