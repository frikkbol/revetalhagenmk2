import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/sign-in",
          "/api/",
          "/booking/status/",
          "/nyheter/ny",
          "/arrangementer/ny",
          "/nyheter/*/rediger",
          "/arrangementer/*/rediger",
        ],
      },
    ],
    sitemap: "https://www.revetalhagen.no/sitemap.xml",
  };
}
