// app/sitemap.ts
import { MetadataRoute } from "next";
import { getAllBlogSlugs } from "@/actions/blogs";
import { getAllProductSlugs } from "@/actions/products";
import { getAllPeptideSlugs } from "@/actions/peptideInfo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://haelolabs.com";

  // ---------- static pages ----------
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/blogs`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  // ---------- dynamic content ----------
  const [productSlugs, blogSlugs, peptideSlugs] = await Promise.all([
    getAllProductSlugs(),
    getAllBlogSlugs(),
    getAllPeptideSlugs(),
  ]);

  // Product pages
  const productPages = productSlugs.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Blog posts
  const blogPages = blogSlugs.map((b) => ({
    url: `${baseUrl}/blogs/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Peptide informational hub pages
  const peptideHubPages = peptideSlugs.map((p) => ({
    url: `${baseUrl}/peptides/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Sub‑topic pages – add more as you create the routes
  const subtopics = ["dosage"]; // e.g. ["dosage", "mechanism", "faq"]
  const peptideSubPages = peptideSlugs.flatMap((p) =>
    subtopics.map((sub) => ({
      url: `${baseUrl}/peptides/${p.slug}/${sub}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  );

  return [
    ...staticPages,
    ...productPages,
    ...blogPages,
    ...peptideHubPages,
    ...peptideSubPages,
  ];
}