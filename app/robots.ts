import type { MetadataRoute } from "next";

const SITE_URL = "https://marta-confeitaria.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/parceiro", "/esqueci-senha", "/redefinir-senha"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
