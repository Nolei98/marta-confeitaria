import type { MetadataRoute } from "next";

const SITE_URL = "https://marta-confeitaria.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/cardapio", priority: 0.9, changeFrequency: "weekly" },
    { path: "/bolos", priority: 0.9, changeFrequency: "weekly" },
    { path: "/sobre", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contato", priority: 0.7, changeFrequency: "monthly" },
    { path: "/revenda", priority: 0.5, changeFrequency: "monthly" },
    { path: "/conta", priority: 0.4, changeFrequency: "monthly" },
    { path: "/termos", priority: 0.2, changeFrequency: "yearly" },
    { path: "/privacidade", priority: 0.2, changeFrequency: "yearly" },
  ];

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
