import { db } from "@/server/db";
import type { MetadataRoute } from "next";

export const revalidate = 3600;

const BASE_URL = "https://www.revetalhagen.no";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/booking`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/arrangementer`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/nyheter`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/om-oss`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/bli-medlem`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/ungdomsskoleprosjektet`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    const [newsArticles, events, bookableItems] = await Promise.all([
      db.query.news.findMany({
        columns: { id: true, createdAt: true, updatedAt: true },
      }),
      db.query.event.findMany({
        columns: { id: true, createdAt: true, updatedAt: true },
      }),
      db.query.item.findMany({
        columns: { id: true, createdAt: true, updatedAt: true },
      }),
    ]);

    const newsRoutes: MetadataRoute.Sitemap = newsArticles.map((article) => ({
      url: `${BASE_URL}/nyheter/${article.id}`,
      lastModified: article.updatedAt ?? article.createdAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    const eventRoutes: MetadataRoute.Sitemap = events.map((ev) => ({
      url: `${BASE_URL}/arrangementer/${ev.id}`,
      lastModified: ev.updatedAt ?? ev.createdAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const bookingRoutes: MetadataRoute.Sitemap = bookableItems.map((item) => ({
      url: `${BASE_URL}/booking/${item.id}`,
      lastModified: item.updatedAt ?? item.createdAt,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...bookingRoutes, ...newsRoutes, ...eventRoutes];
  } catch {
    return staticRoutes;
  }
}
