import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://haelolabs.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/checkout",
          "/api/",
          "/admin/",
          "/account/",
          "/_next/",
          "/*?*", // Blocks URL query parameters to avoid duplicate crawl loops
        ],
      },
      // Optional: Explicit rules for AI crawlers if you want control over data scraping
      // {
      //   userAgent: ["GPTBot", "CCBot", "ClaudeBot"],
      //   disallow: ["/"],
      // },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}